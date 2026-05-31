import { useEffect, useRef, useState } from 'react';
import { FaBarcode } from 'react-icons/fa';
import { FiSearch, FiUser, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import PantryLogo from '@/assets/icons/image-1.svg';
import CashRegisterIcon from '@/assets/icons/tabler-icon-cash-register.svg?react';
import HistoryIcon from '@/assets/icons/tabler-icon-history.svg?react';
import TableRowIcon from '@/assets/icons/tabler-icon-table-row.svg?react';
import ProfileDropdown from '@/pages/inventory/ProfileDropdown';
import VolunteerCodeModal from '@/pages/inventory/VolunteerCodeModal';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// ─── Styled components ────────────────────────────────────────────────────────
//
// Shared top bar for every owner page (Inventory, Scan Out, Activity,
// Volunteers, Barcode Generator). One source of truth for the navigation
// icon set so the same actions appear on every page.
//
// Responsiveness: the bar is a wrapping flex row. The brand group shrinks
// (min-width: 0) and the icon cluster never shrinks, so the action icons stay
// fully visible on narrow screens instead of being pushed off-screen. The
// optional search field wraps onto its own line below on mobile.

const TopBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 8px 24px;
  background-color: #ececec;
  flex-shrink: 0;

  @media (max-width: 767px) {
    gap: 8px;
    padding: 8px 12px;
  }
`;

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 0 1 auto;

  @media (max-width: 767px) {
    gap: 8px;
  }
`;

const LogoImg = styled.img`
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  cursor: pointer;

  @media (max-width: 767px) {
    width: 32px;
    height: 32px;
  }
`;

const DesktopTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  cursor: pointer;

  @media (max-width: 1279px) {
    display: none;
  }
`;

const MobileTitle = styled.h1`
  display: none;

  @media (max-width: 1279px) {
    display: block;
    margin: 0;
    min-width: 0;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1;
    cursor: pointer;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;
  flex: 1 1 0;

  @media (max-width: 767px) {
    flex: 1 1 100%;
    order: 99;
  }
`;

const SearchPill = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 455px;
  background-color: #d4dce8;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  height: 40px;

  @media (max-width: 767px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #374151;
  outline: none;
  min-width: 0;
  padding-right: 8px;

  &::placeholder {
    color: #4b5563;
    opacity: 1;
  }
`;

const SearchButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 9999px;
  background: #2c5e95;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;

  svg {
    color: #ffffff;
    stroke: #ffffff;
    fill: none;
  }

  svg path,
  svg circle,
  svg line,
  svg polyline {
    stroke: #ffffff;
  }
`;

const NavIcons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  margin-left: auto;
  flex: 0 0 auto;

  @media (max-width: 767px) {
    gap: 6px;
  }
`;

const NavIcon = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  color: ${(p) => (p.$active ? '#2c5e95' : '#4e4b57')};

  svg {
    width: 24px;
    height: 24px;
  }

  /* App.css declares a global \`* { color: var(--text) }\` that pins every
     element's color — including each svg <path> — to the dark text color,
     hijacking \`currentColor\`. So set color/stroke directly here (not via
     currentColor); only the active tab's icon gets the brand blue, the rest
     stay dark. Applies to both stroke-based and fill-based icons. */
  svg,
  svg * {
    color: ${(p) => (p.$active ? '#2c5e95' : '#4e4b57')};
    stroke: ${(p) => (p.$active ? '#2c5e95' : '#4e4b57')};
  }
`;

const DesktopOnlyNavIcon = styled(NavIcon)`
  @media (max-width: 767px) {
    display: none;
  }
`;

const ProfileButton = styled.button`
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 9999px;
  background-color: #2c5e95;
  color: #ffffff;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;

  svg {
    color: #ffffff;
    stroke: #ffffff;
    fill: none;
  }

  svg path,
  svg circle,
  svg line,
  svg polyline {
    stroke: #ffffff;
  }
`;

const ProfileWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Scan Out is the one action offloaded to a floating button on mobile (matching
// the InventoryPage pattern), keeping the mobile icon row uncrowded while
// leaving scan-out reachable from every owner page except scan-out itself.
const ScanOutFab = styled.button`
  display: none;

  @media (max-width: 767px) {
    display: grid;
    place-items: center;
    position: fixed;
    bottom: 18px;
    right: 18px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #2c5e95;
    color: #ffffff;
    border: none;
    box-shadow: 0 6px 16px rgba(24, 39, 75, 0.25);
    cursor: pointer;
    z-index: 30;

    svg {
      color: #ffffff;
      stroke: #ffffff;
    }

    svg path,
    svg circle,
    svg line,
    svg polyline {
      stroke: #ffffff;
    }

    &:hover {
      background-color: #1e3a6e;
    }
  }
`;

export default function OwnerHeader({
  active,
  title = 'New Trier Township Food Pantry Inventory',
  mobileTitle = 'New Trier Township',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search for an item...',
}) {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const profileWrapperRef = useRef(null);

  useEffect(() => {
    if (!showProfileDropdown) return undefined;
    const handleClickOutside = (e) => {
      if (
        profileWrapperRef.current &&
        !profileWrapperRef.current.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const go = (path) => () => navigate(path);

  return (
    <>
      <TopBar>
        <BrandGroup>
          <LogoImg
            src={PantryLogo}
            alt='New Trier Township'
            onClick={go('/inventory')}
          />
          <DesktopTitle onClick={go('/inventory')}>{title}</DesktopTitle>
          <MobileTitle onClick={go('/inventory')}>{mobileTitle}</MobileTitle>
        </BrandGroup>

        {showSearch && (
          <SearchWrapper>
            <SearchPill>
              <SearchInput
                type='text'
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              <SearchButton type='button' title='Search'>
                <FiSearch size={21} color='#ffffff' />
              </SearchButton>
            </SearchPill>
          </SearchWrapper>
        )}

        <NavIcons>
          <NavIcon
            $active={active === 'inventory'}
            title='Inventory'
            onClick={go('/inventory')}
          >
            <TableRowIcon />
          </NavIcon>
          <DesktopOnlyNavIcon
            $active={active === 'scan-out'}
            title='Scan Out'
            onClick={go('/scan-out')}
          >
            <CashRegisterIcon />
          </DesktopOnlyNavIcon>
          <NavIcon
            $active={active === 'activity'}
            title='Activity'
            onClick={go('/activity')}
          >
            <HistoryIcon />
          </NavIcon>
          <NavIcon
            $active={active === 'volunteers'}
            title='Volunteers'
            onClick={go('/volunteers')}
          >
            <FiUsers size={22} />
          </NavIcon>
          <NavIcon
            $active={active === 'barcode'}
            title='Barcode Generator'
            onClick={go('/barcode-generator')}
          >
            <FaBarcode size={24} />
          </NavIcon>
          <ProfileWrapper ref={profileWrapperRef}>
            <ProfileButton
              title='Profile'
              onClick={() => setShowProfileDropdown((o) => !o)}
            >
              <FiUser size={24} color='#ffffff' />
            </ProfileButton>
            {showProfileDropdown && (
              <ProfileDropdown
                onClose={() => setShowProfileDropdown(false)}
                onVolunteerSession={() => {
                  setShowProfileDropdown(false);
                  setShowVolunteerModal(true);
                }}
              />
            )}
          </ProfileWrapper>
        </NavIcons>
      </TopBar>

      {active !== 'scan-out' && (
        <ScanOutFab
          type='button'
          title='Scan Out'
          aria-label='Scan Out'
          onClick={go('/scan-out')}
        >
          <CashRegisterIcon />
        </ScanOutFab>
      )}

      {showVolunteerModal && (
        <VolunteerCodeModal onClose={() => setShowVolunteerModal(false)} />
      )}
    </>
  );
}

OwnerHeader.propTypes = {
  active: PropTypes.oneOf([
    'inventory',
    'scan-out',
    'activity',
    'volunteers',
    'barcode',
  ]),
  title: PropTypes.string,
  mobileTitle: PropTypes.string,
  showSearch: PropTypes.bool,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
};
