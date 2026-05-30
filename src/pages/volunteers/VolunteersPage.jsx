import { useCallback, useEffect, useRef, useState } from 'react';
import { FiRefreshCw, FiUser, FiUsers, FiKey } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import PantryLogo from '@/assets/icons/image-1.svg';
import CashRegisterIcon from '@/assets/icons/tabler-icon-cash-register.svg?react';
import HistoryIcon from '@/assets/icons/tabler-icon-history.svg?react';
import TableRowIcon from '@/assets/icons/tabler-icon-table-row.svg?react';
import ProfileDropdown from '../inventory/ProfileDropdown';
import VolunteerCodeModal from '../inventory/VolunteerCodeModal';
import { volunteerApi } from '../../services/api';

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ececec;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 24px;
  background-color: #ececec;
  flex-shrink: 0;

  @media (max-width: 767px) {
    gap: 8px;
    padding: 8px 12px;
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

const PageTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  line-height: 1;

  @media (max-width: 1279px) {
    display: none;
  }
`;

const NavIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: auto;

  @media (max-width: 767px) {
    gap: 10px;
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
  color: #4e4b57;

  svg {
    width: 24px;
    height: 24px;
    stroke: currentColor;
  }

  svg path,
  svg circle,
  svg line,
  svg polyline {
    stroke: currentColor;
  }

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
  }
`;

const ActiveNavIcon = styled(NavIcon)`
  color: #2c5e95;

  svg,
  svg path,
  svg circle,
  svg line,
  svg polyline {
    color: #2c5e95;
    stroke: #2c5e95 !important;
  }
`;

const DesktopOnlyNavIcon = styled(NavIcon)`
  @media (max-width: 767px) {
    display: none;
  }
`;

const ProfileButton = styled.button`
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 9999px;
  background-color: #2c5e95;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;

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

const Content = styled.div`
  flex: 1;
  padding: 20px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 767px) {
    padding: 16px 12px 40px;
  }
`;

const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2b4a;
`;

const ActiveDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  margin-right: 6px;
`;

const RefreshButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: grid;
  place-items: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: #2c5e95;
    background: #f0f4fa;
  }
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #9ca3af;
  text-align: center;
  padding: 16px 0;
`;

const VolunteerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VolunteerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border-radius: 8px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2c5e95;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const VolunteerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const VolunteerName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a2b4a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VolunteerMeta = styled.div`
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 2px;
`;

const StatBadge = styled.div`
  background: #e0eaf7;
  color: #1a2b4a;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
  white-space: nowrap;
`;

const StatsTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-radius: 8px;
  overflow: hidden;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 80px 100px 160px;
  gap: 12px;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  font-size: 0.88rem;

  &:first-child {
    background: #e9edf5;
    font-weight: 700;
    font-size: 0.78rem;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr 60px 80px;
    > *:last-child {
      display: none;
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function formatJoined(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VolunteersPage() {
  const navigate = useNavigate();
  const profileWrapperRef = useRef(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [active, setActive] = useState([]);
  const [stats, setStats] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!showProfileDropdown) return;
    const handler = (e) => {
      if (profileWrapperRef.current && !profileWrapperRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showProfileDropdown]);

  const fetchActive = useCallback(async () => {
    setLoadingActive(true);
    try {
      const data = await volunteerApi.getActiveVolunteers();
      setActive(data);
    } catch {
      setActive([]);
    } finally {
      setLoadingActive(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await volunteerApi.getVolunteerStats();
      setStats(data);
    } catch {
      setStats([]);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
    fetchStats();
  }, [fetchActive, fetchStats]);

  return (
    <PageWrapper>
      <TopBar>
        <LogoImg
          src={PantryLogo}
          alt='New Trier Township'
          onClick={() => navigate('/inventory')}
        />
        <PageTitle onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
          New Trier Township Food Pantry Inventory
        </PageTitle>

        <NavIcons>
          <NavIcon title='Inventory' onClick={() => navigate('/inventory')}>
            <TableRowIcon />
          </NavIcon>
          <DesktopOnlyNavIcon title='Scan Out' onClick={() => navigate('/scan-out')}>
            <CashRegisterIcon />
          </DesktopOnlyNavIcon>
          <DesktopOnlyNavIcon title='Activity' onClick={() => navigate('/activity')}>
            <HistoryIcon />
          </DesktopOnlyNavIcon>
          <ActiveNavIcon title='Volunteers'>
            <FiUsers size={22} />
          </ActiveNavIcon>
          <NavIcon title='Volunteer Session' onClick={() => setShowVolunteerModal(true)}>
            <FiKey size={22} />
          </NavIcon>
          <ProfileWrapper ref={profileWrapperRef}>
            <ProfileButton
              title='Profile'
              onClick={() => setShowProfileDropdown((o) => !o)}
            >
              <FiUser size={24} color='#ffffff' />
            </ProfileButton>
            {showProfileDropdown && (
              <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />
            )}
          </ProfileWrapper>
        </NavIcons>
      </TopBar>

      <Content>
        {/* Active now */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <ActiveDot />
              Active Now
            </SectionTitle>
            <RefreshButton
              onClick={fetchActive}
              title='Refresh'
              aria-label='Refresh active volunteers'
            >
              <FiRefreshCw size={16} />
            </RefreshButton>
          </SectionHeader>

          {loadingActive ? (
            <EmptyText>Loading…</EmptyText>
          ) : active.length === 0 ? (
            <EmptyText>No volunteers currently active.</EmptyText>
          ) : (
            <VolunteerList>
              {active.map((v) => (
                <VolunteerRow key={v.uid}>
                  <Avatar>{initials(v.name)}</Avatar>
                  <VolunteerInfo>
                    <VolunteerName>{v.name}</VolunteerName>
                    <VolunteerMeta>
                      Joined {formatJoined(v.joinedAt)}
                    </VolunteerMeta>
                  </VolunteerInfo>
                  <StatBadge>
                    {v.itemsScanned}{' '}
                    {v.itemsScanned === 1 ? 'item' : 'items'}
                  </StatBadge>
                </VolunteerRow>
              ))}
            </VolunteerList>
          )}
        </SectionCard>

        {/* Historical stats */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <FiUser
                size={15}
                style={{ marginRight: 6, verticalAlign: 'middle' }}
              />
              All-Time Stats
            </SectionTitle>
            <RefreshButton
              onClick={fetchStats}
              title='Refresh'
              aria-label='Refresh volunteer stats'
            >
              <FiRefreshCw size={16} />
            </RefreshButton>
          </SectionHeader>

          {loadingStats ? (
            <EmptyText>Loading…</EmptyText>
          ) : stats.length === 0 ? (
            <EmptyText>
              No volunteer activity logged yet. Run the DB migration to enable
              tracking.
            </EmptyText>
          ) : (
            <StatsTable>
              <StatsRow>
                <span>Name</span>
                <span>Sessions</span>
                <span>Items Added</span>
                <span>Last Active</span>
              </StatsRow>
              {stats.map((s) => (
                <StatsRow key={s.volunteer_name}>
                  <span style={{ fontWeight: 600, color: '#1a2b4a' }}>
                    {s.volunteer_name}
                  </span>
                  <span>{s.sessions}</span>
                  <span>{s.total_items ?? 0}</span>
                  <span style={{ color: '#6b7280' }}>
                    {formatDate(s.last_active)}
                  </span>
                </StatsRow>
              ))}
            </StatsTable>
          )}
        </SectionCard>
      </Content>

      {showVolunteerModal && (
        <VolunteerCodeModal onClose={() => setShowVolunteerModal(false)} />
      )}
    </PageWrapper>
  );
}
