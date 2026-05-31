import React, { useEffect, useState } from 'react';

import { auth, googleProvider } from '@/firebase-config';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import PropTypes from 'prop-types';

export const UserContext = React.createContext({
  user: null,
  role: null,
  isLoading: false,
  logout: () => {},
  login: () => {},
  googleAuth: () => {},
  requestPasswordReset: () => {},
});

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const buildUrl = (endpoint) =>
  `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}${endpoint}`;

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Anonymous sign-in IS the volunteer flow and needs no backend
        // confirmation. Every other (non-anonymous) user is an owner candidate
        // whose role stays pending (null) until the backend's authoritative
        // `isOwner` resolves. We never optimistically grant owner, so a
        // profile-fetch failure fails CLOSED (no role) rather than open.
        setRole(firebaseUser.isAnonymous ? 'volunteer' : null);
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch(buildUrl('/auth/profile'), {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (response.ok) {
            const backendUserData = await response.json();
            // 'volunteer' is reachable ONLY via anonymous sign-in. A
            // non-anonymous, non-allowlisted user resolves to null (no role) —
            // rejected at login, never silently downgraded to a volunteer.
            setRole(
              firebaseUser.isAnonymous
                ? 'volunteer'
                : backendUserData.isOwner
                  ? 'owner'
                  : null
            );
            setUser({ ...firebaseUser, ...backendUserData });
          } else {
            // Fail closed: a profile-fetch failure leaves a non-anonymous user
            // with no role. Anonymous volunteers keep their role since it
            // doesn't depend on the backend.
            setUser(firebaseUser);
          }
        } catch {
          setUser(firebaseUser);
        }
      } else {
        setRole(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Authoritative owner gate. After a non-anonymous sign-in, ask the backend
  // whether this account is on the OWNER_EMAILS allowlist; if not, sign the user
  // back out and throw `auth/not-owner` so the login screen can reject them.
  // Fails closed: a profile-fetch failure is treated as "not an owner".
  const assertOwnerOrReject = async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch(buildUrl('/auth/profile'), {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const profile = response.ok ? await response.json() : null;
    if (!profile?.isOwner) {
      await signOut(auth);
      const error = new Error('This login is for pantry owners only.');
      error.code = 'auth/not-owner';
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Owner-only login: reject (and sign back out) any non-allowlisted account.
      await assertOwnerOrReject(credential.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Signs in with Google popup and syncs the user to the MySQL backend.
  const googleAuth = async () => {
    let result;
    try {
      result = await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error('Failed to complete Google authentication');
    }

    // Owner-only login: gate before syncing. Throws `auth/not-owner` (and signs
    // the user back out) for non-allowlisted accounts; let it propagate so the
    // login screen shows the access-denied message.
    await assertOwnerOrReject(result.user);

    const idToken = await result.user.getIdToken();
    await fetch(buildUrl('/auth/token'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  };

  const requestPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const contextValue = {
    user,
    role,
    isLoading,
    login,
    logout,
    googleAuth,
    requestPasswordReset,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
