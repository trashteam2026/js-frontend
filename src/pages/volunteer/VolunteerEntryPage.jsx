import { useEffect, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import PantryLogo from '@/assets/icons/pantry-logo.svg';
import { RedSpan } from '@/common/components/form/styles';
import { useUser } from '@/common/contexts/UserContext';
import { auth } from '@/firebase-config';
import { volunteerApi } from '@/services/api';
import { signInAnonymously, signOut } from 'firebase/auth';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 32px;
  position: relative;
  background-color: #ffffff;
`;

const BackButton = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2a4d8f;
  color: #ffffff;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover {
    background-color: #1e3a6e;
  }

  svg {
    color: #ffffff;
    stroke: #ffffff;
  }

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 56px;
`;

const Logo = styled.img`
  width: 130px;
  height: 130px;
`;

const Title = styled.h1`
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  color: #1a2b4a;
  max-width: 280px;
  line-height: 1.3;
`;

const Divider = styled.hr`
  width: 100%;
  max-width: 320px;
  border: none;
  border-top: 1px solid #d6dce8;
  margin: 28px 0 20px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #1a2b4a;
  align-self: flex-start;
`;

const TextInput = styled.input`
  font-size: 1rem;
  padding: 10px 12px;
  border: 1px solid #c7d2e3;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  color: #1a2b4a;
  outline: none;

  &:focus {
    border-color: #2a4d8f;
  }
`;

const CodeInput = styled(TextInput)`
  font-size: 1.1rem;
  letter-spacing: 3px;
  text-align: center;
  text-transform: uppercase;
`;

const NextButton = styled.button`
  margin-top: 8px;
  padding: 10px 36px;
  background-color: #2a4d8f;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #1e3a6e;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function VolunteerEntryPage() {
  const navigate = useNavigate();
  const { role, isLoading } = useUser();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (role === 'owner') {
      navigate('/inventory', { replace: true });
    } else if (role === 'volunteer' && !isSubmitting) {
      navigate('/scan-in', { replace: true });
    }
  }, [role, isLoading, isSubmitting, navigate]);

  if (isLoading || role === 'owner' || (role === 'volunteer' && !isSubmitting)) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !code.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await volunteerApi.verifyCode(code.trim());
      if (!result.valid) {
        setError('Invalid or expired code. Please try again.');
        setIsSubmitting(false);
        return;
      }

      await signInAnonymously(auth);

      try {
        await volunteerApi.register({
          name: name.trim(),
          code: code.trim(),
        });
      } catch {
        try {
          await signOut(auth);
        } catch {
          // Ignore sign-out cleanup errors; the visible registration error is
          // the actionable state for the volunteer.
        }
        setError('Could not join the session, please try again.');
        setIsSubmitting(false);
        return;
      }

      navigate('/scan-in', { replace: true });
    } catch (err) {
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('invalid') ||
        msg.toLowerCase().includes('expired')
      ) {
        setError('Invalid or expired code. Please try again.');
      } else {
        setError('Unable to complete sign-in. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <BackButton
        type='button'
        onClick={() => navigate('/')}
        aria-label='Back to landing'
      >
        <FiArrowLeft size={20} />
      </BackButton>

      <LogoSection>
        <Logo src={PantryLogo} alt='New Trier Township seal' />
        <Title>New Trier Township Food Pantry Check-in System</Title>
      </LogoSection>

      <Divider />

      <Form onSubmit={handleSubmit}>
        {error && <RedSpan>{error}</RedSpan>}

        <Label htmlFor='volunteer-name'>Your Name</Label>
        <TextInput
          id='volunteer-name'
          type='text'
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          autoComplete='name'
          placeholder='First and last name'
          maxLength={60}
          required
        />

        <Label htmlFor='volunteer-code'>Session Code</Label>
        <CodeInput
          id='volunteer-code'
          type='text'
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          autoComplete='off'
          autoCapitalize='characters'
          spellCheck={false}
          maxLength={8}
          required
        />

        <NextButton
          type='submit'
          disabled={isSubmitting || !name.trim() || !code.trim()}
        >
          {isSubmitting ? 'Signing in...' : 'Check In'}
        </NextButton>
      </Form>
    </PageWrapper>
  );
}
