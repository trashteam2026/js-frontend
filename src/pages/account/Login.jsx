import React, { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import GoogleButton from '@/common/components/atoms/GoogleButton';
import { Form, FormTitle } from '@/common/components/form/Form';
import { Input } from '@/common/components/form/Input';
import SubmitButton from '@/common/components/form/SubmitButton';
import { RedSpan } from '@/common/components/form/styles';
import { useUser } from '@/common/contexts/UserContext';
import styled from 'styled-components';

import { BackButton, StyledPage } from './styles';

const StyledLink = styled(Link)`
  color: #2a4d8f;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: -10px;
  align-self: flex-end;

  &:hover {
    text-decoration: underline;
  }
`;

const SignUpPrompt = styled.span`
  font-size: 0.9rem;
  color: #1a2b4a;
  text-align: center;
`;

const SignUpLink = styled(Link)`
  color: #2a4d8f;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

// Firebase Error Codes are quite unreadable, so map them to our own user-friendly messages. Add more cases as needed.
function mapAuthCodeToMessage(authCode) {
  switch (authCode) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/invalid-credential':
      return 'Email or password is incorrect. Please try again.';
    case 'auth/not-owner':
      return "This login is for pantry owners only. If you're a volunteer, use Volunteer Access from the home screen.";
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { login, googleAuth, role, isLoading: authLoading } = useUser();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formState, setFormState] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (role === 'owner') {
      navigate('/inventory', { replace: true });
    } else if (role === 'volunteer') {
      navigate('/scan-in', { replace: true });
    }
  }, [authLoading, role, navigate]);

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formState.email, formState.password);
      // Navigation handled by the role-watching useEffect above.
    } catch (error) {
      setError(mapAuthCodeToMessage(error.code));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleAuth();
    } catch (error) {
      setError(error.code ? mapAuthCodeToMessage(error.code) : error.message);
    }
  };

  return (
    <StyledPage>
      <BackButton
        type='button'
        onClick={() => navigate('/')}
        aria-label='Back to landing'
      >
        <FiArrowLeft size={20} />
      </BackButton>
      <Form onSubmit={handleSubmit}>
        <FormTitle>Log In</FormTitle>
        {error && <RedSpan>{error}</RedSpan>}
        <Input.Text
          title='Email'
          name='email'
          value={formState.email}
          onChange={handleChange}
          required
        />
        <Input.Password
          title='Password'
          name='password'
          value={formState.password}
          onChange={handleChange}
          required
        />
        <StyledLink to='/forgot-password'>Forgot Password?</StyledLink>
        <SubmitButton disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </SubmitButton>
        <GoogleButton
          onClick={handleGoogleLogin}
          isLoading={isLoading}
          text='Sign in with Google'
        />
        <SignUpPrompt>
          Don&apos;t have an account?{' '}
          <SignUpLink to='/signup'>Sign up</SignUpLink>
        </SignUpPrompt>
      </Form>
    </StyledPage>
  );
}
