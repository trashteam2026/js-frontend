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
        // Optimistic default until the backend profile resolves: anonymous users
        // are volunteers, everyone else is tentatively an owner. The backend's
        // `isOwner` is authoritative and overrides this once /auth/profile
        // resolves (see below).
        setRole(firebaseUser.isAnonymous ? 'volunteer' : 'owner');
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch(buildUrl('/auth/profile'), {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (response.ok) {
            const backendUserData = await response.json();
            // Role is decided by the backend now, not by isAnonymous.
            setRole(backendUserData.isOwner ? 'owner' : 'volunteer');
            setUser({ ...firebaseUser, ...backendUserData });
          } else {
            // Transient failure: keep the optimistic default (anonymous →
            // volunteer, otherwise owner) so a profile-fetch hiccup doesn't lock
            // a dev owner out.
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

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      await fetch(buildUrl('/auth/token'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error('Failed to complete Google authentication');
    }
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
