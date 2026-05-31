import { useEffect } from 'react';

import { useUser } from '@/common/contexts/UserContext';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #ffffff;
  border: 1px solid #d6dce8;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(24, 39, 75, 0.16);
  width: 200px;
  padding: 12px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MenuButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d6dce8;
  border-radius: 6px;
  background: #ffffff;
  color: #1a2b4a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f0f4fa;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dc3545;
  border-radius: 6px;
  background: #ffffff;
  color: #dc3545;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #fef2f2;
  }
`;

export default function ProfileDropdown({ onClose, onVolunteerSession }) {
  const { logout } = useUser();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleLogout = async () => {
    onClose();
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Menu>
      {onVolunteerSession && (
        <MenuButton type='button' onClick={onVolunteerSession}>
          Volunteer Session
        </MenuButton>
      )}
      <LogoutButton type='button' onClick={handleLogout}>
        Log Out
      </LogoutButton>
    </Menu>
  );
}

ProfileDropdown.propTypes = {
  onClose: PropTypes.func.isRequired,
  onVolunteerSession: PropTypes.func,
};
