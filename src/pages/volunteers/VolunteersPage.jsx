import { useCallback, useEffect, useState } from 'react';
import { FiRefreshCw, FiUser } from 'react-icons/fi';

import OwnerHeader from '@/common/components/navigation/OwnerHeader';
import styled from 'styled-components';

import { volunteerApi } from '../../services/api';

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ececec;
`;

const Content = styled.div`
  box-sizing: border-box;
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
  grid-template-columns: 1fr 70px 70px 100px 150px;
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
    grid-template-columns: 1fr 60px 70px;
    /* Hide "Items Added" + "Last Active" on narrow screens. */
    > *:nth-child(n + 4) {
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
  const [active, setActive] = useState([]);
  const [stats, setStats] = useState([]);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

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
      <OwnerHeader active='volunteers' />

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
                    {v.itemsScanned} {v.itemsScanned === 1 ? 'item' : 'items'}
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
                <span>Scans</span>
                <span>Visits</span>
                <span>Items Added</span>
                <span>Last Active</span>
              </StatsRow>
              {stats.map((s) => (
                <StatsRow key={s.volunteer_name}>
                  <span style={{ fontWeight: 600, color: '#1a2b4a' }}>
                    {s.volunteer_name}
                  </span>
                  <span>{s.scan_count ?? 0}</span>
                  <span>{s.active_days ?? 0}</span>
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
    </PageWrapper>
  );
}
