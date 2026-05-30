import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import PantryLogo from '@/assets/icons/pantry-logo.svg';
import { useUser } from '@/common/contexts/UserContext';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  gap: 28px;
  text-align: center;
  background-color: #ffffff;
`;

const Logo = styled.img`
  width: 150px;
  height: 150px;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a2b4a;
  margin: 0;
  max-width: 300px;
  line-height: 1.3;
`;

const ButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 260px;
  max-width: 100%;
  margin-top: 16px;
`;

const NavyButton = styled.button`
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 9999px;
  background-color: #2a4d8f;
  color: #ffffff;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #1e3a6e;
  }
`;

const SecondaryButton = styled.button`
  font-size: 1rem;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 9999px;
  background-color: #ffffff;
  color: #2a4d8f;
  border: 1.5px solid #2a4d8f;
  cursor: pointer;

  &:hover {
    background-color: #f0f3f8;
  }
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const { role, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (role === 'owner') {
      navigate('/inventory', { replace: true });
    } else if (role === 'volunteer') {
      navigate('/scan-in', { replace: true });
    }
  }, [role, isLoading, navigate]);

  if (isLoading || role) return null;

  return (
    <PageWrapper>
      <Logo src={PantryLogo} alt='New Trier Township seal' />
      <Title>New Trier Township Food Pantry Check-in System</Title>
      <ButtonStack>
        <NavyButton type='button' onClick={() => navigate('/login')}>
          Pantry Owner Login
        </NavyButton>
        <SecondaryButton
          type='button'
          onClick={() => navigate('/volunteer/entry')}
        >
          Volunteer Access
        </SecondaryButton>
      </ButtonStack>
    </PageWrapper>
  );
}
