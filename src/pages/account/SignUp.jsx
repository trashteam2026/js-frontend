import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import GoogleButton from '@/common/components/atoms/GoogleButton';
import { Form, FormTitle } from '@/common/components/form/Form';
import { Input } from '@/common/components/form/Input';
import SubmitButton from '@/common/components/form/SubmitButton';
import { RedSpan } from '@/common/components/form/styles';
import { useUser } from '@/common/contexts/UserContext';
import { getBackendUrl } from '@/common/utils/backendUrl';
import styled from 'styled-components';

import { BackButton, StyledPage } from './styles';

const LoginPrompt = styled.span`
  font-size: 0.9rem;
  color: #1a2b4a;
  text-align: center;
`;

const LoginLink = styled(Link)`
  color: #2a4d8f;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export default function SignUp() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { googleAuth } = useUser();

  const [formState, setFormState] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    username: '',
  });

  const handleChangeFirstname = (e) => {
    setFormState({ ...formState, firstname: e.target.value });
    setError('');
  };

  const handleChangeLastname = (e) => {
    setFormState({ ...formState, lastname: e.target.value });
    setError('');
  };

  const handleChangeEmail = (e) => {
    setFormState({ ...formState, email: e.target.value });
    setError('');
  };

  const handleChangePassword = (e) => {
    setFormState({ ...formState, password: e.target.value });
    setError('');
  };

  const handleChangeUsername = (e) => {
    setFormState({ ...formState, username: e.target.value });
    setError('');
  };

  const handleGoogleSignup = async () => {
    try {
      await googleAuth();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${getBackendUrl()}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formState.email,
            password: formState.password,
            username: formState.username || undefined,
            firstname: formState.firstname || undefined,
            lastname: formState.lastname || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      navigate('/login', {
        state: {
          message: 'Account created successfully! You can now log in.',
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
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
        <FormTitle>Create an account</FormTitle>
        {error && <RedSpan>{error}</RedSpan>}
        <Input.Text
          title='First name'
          value={formState.firstname}
          onChange={handleChangeFirstname}
        />
        <Input.Text
          title='Last name'
          value={formState.lastname}
          onChange={handleChangeLastname}
        />
        <Input.Text
          title='Email'
          value={formState.email}
          onChange={handleChangeEmail}
          required
        />
        <Input.Text
          title='Username'
          value={formState.username}
          onChange={handleChangeUsername}
        />
        <Input.Password
          title='Password'
          value={formState.password}
          onChange={handleChangePassword}
          required
        />
        <SubmitButton onClick={() => {}} disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </SubmitButton>
        <GoogleButton
          onClick={handleGoogleSignup}
          isLoading={isLoading}
          text='Sign up with Google'
        />
        <LoginPrompt>
          Already have an account? <LoginLink to='/login'>Log in</LoginLink>
        </LoginPrompt>
      </Form>
    </StyledPage>
  );
}
