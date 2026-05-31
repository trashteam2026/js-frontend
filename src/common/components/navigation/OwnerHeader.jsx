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

const DESKTOP_SEARCH_COMFORT_WIDTH = 455;
const DESKTOP_SEARCH_COMFORT_GAP = 32;

// ─── Styled components ────────────────────────────────────────────────────────
//
// Shared top bar for every owner page (Inventory, Scan Out, Activity,
// Volunteers, Barcode Generator). One source of truth for the navigation
// icon set so the same actions appear on every page.
//
// Responsiveness: desktop uses a three-track grid so optional search sits on the
// page centerline, not merely between brand and nav. Mobile switches back to the
// existing wrapping flex row so search remains a full-width second row.

const TopBar = styled.div`
  display: ${({ $stacked }) => ($stacked ? 'flex' : 'grid')};
  grid-template-columns: ${({ $hasSearch }) =>
    $hasSearch
      ? 'minmax(0, 1fr) minmax(180px, 455px) minmax(0, 1fr)'
      : 'minmax(0, 1fr) auto'};
  align-items: center;
  column-gap: 14px;
  gap: 14px;
  padding: 8px 24px;
  background-color: #ececec;
  flex-shrink: 0;
  flex-wrap: ${({ $stacked }) => ($stacked ? 'wrap' : 'nowrap')};

  @media (max-width: 767px) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 12px;
  }
`;

const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  justify-self: start;
  flex: ${({ $stacked }) => ($stacked ? '0 1 auto' : 'initial')};

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
  width: 100%;
  grid-column: 2;
  flex: ${({ $stacked }) => ($stacked ? '1 1 100%' : 'initial')};
  order: ${({ $stacked }) => ($stacked ? 99 : 'initial')};

  @media (max-width: 767px) {
    flex: 1 1 100%;
    order: 99;
  }
`;

const SearchPill = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: ${({ $stacked }) => ($stacked ? 'none' : '455px')};
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
  justify-self: end;
  margin-left: ${({ $stacked }) => ($stacked ? 'auto' : 0)};
  flex: ${({ $stacked }) => ($stacked ? '0 0 auto' : 'initial')};

  @media (max-width: 767px) {
    margin-left: auto;
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
  title = 'New Trier Township',
  mobileTitle = 'New Trier Township',
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search for an item...',
  onSessionChange,
}) {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [stackSearch, setStackSearch] = useState(false);
  const topBarRef = useRef(null);
  const brandRef = useRef(null);
  const navRef = useRef(null);
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

  useEffect(() => {
    if (!showSearch) {
      setStackSearch(false);
      return undefined;
    }

    const updateStacking = () => {
      const topBar = topBarRef.current;
      const brand = brandRef.current;
      const nav = navRef.current;
      if (!topBar || !brand || !nav) return;

      const styles = window.getComputedStyle(topBar);
      const paddingX =
        Number.parseFloat(styles.paddingLeft || '0') +
        Number.parseFloat(styles.paddingRight || '0');
      const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0;
      const available = topBar.clientWidth - paddingX;
      const maxSideWidth = Math.max(brand.scrollWidth, nav.scrollWidth);
      const comfortableGap = Math.max(gap, DESKTOP_SEARCH_COMFORT_GAP);
      const required =
        maxSideWidth * 2 + DESKTOP_SEARCH_COMFORT_WIDTH + comfortableGap * 2;

      setStackSearch(available < required);
    };

    updateStacking();

    const resizeObserver = new ResizeObserver(updateStacking);
    [topBarRef.current, brandRef.current, navRef.current].forEach((node) => {
      if (node) resizeObserver.observe(node);
    });
    window.addEventListener('resize', updateStacking);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateStacking);
    };
  }, [active, mobileTitle, showSearch, title]);

  const go = (path) => () => navigate(path);

  return (
    <>
      <TopBar ref={topBarRef} $hasSearch={showSearch} $stacked={stackSearch}>
        <BrandGroup ref={brandRef} $stacked={stackSearch}>
          <LogoImg
            src={PantryLogo}
            alt='New Trier Township'
            onClick={go('/inventory')}
          />
          <DesktopTitle onClick={go('/inventory')}>{title}</DesktopTitle>
          <MobileTitle onClick={go('/inventory')}>{mobileTitle}</MobileTitle>
        </BrandGroup>

        {showSearch && (
          <SearchWrapper $stacked={stackSearch}>
            <SearchPill $stacked={stackSearch}>
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

        <NavIcons ref={navRef} $stacked={stackSearch}>
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
        <VolunteerCodeModal
          onClose={() => setShowVolunteerModal(false)}
          onSessionChange={onSessionChange}
        />
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
  onSessionChange: PropTypes.func,
};
