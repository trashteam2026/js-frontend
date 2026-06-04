import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '@/common/contexts/UserContext';
import { getBackendUrl } from '@/common/utils/backendUrl';
import { auth } from '@/firebase-config';
import { getRedirectResult } from 'firebase/auth';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const LoadingText = styled.p`
  font-size: 1rem;
`;

export default function AuthCallback() {
  const navigate = useNavigate();
  const { role, isLoading: authLoading } = useUser();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        // Handles the result of a signInWithRedirect() call (e.g. on mobile).
        // If the user signed in via popup (desktop), result will be null and
        // the role-watching effect below handles navigation.
        const result = await getRedirectResult(auth);

        if (!result) return;

        const idToken = await result.user.getIdToken();

        const response = await fetch(
          `${getBackendUrl()}/auth/token`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', {
          state: { error: error.message },
          replace: true,
        });
      }
    };

    handleRedirectResult();
  }, [navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (role === 'owner') {
      navigate('/inventory', { replace: true });
    } else if (role === 'volunteer') {
      navigate('/scan-in', { replace: true });
    }
  }, [authLoading, role, navigate]);

  return (
    <Container>
      <LoadingText>Completing authentication...</LoadingText>
    </Container>
  );
}
