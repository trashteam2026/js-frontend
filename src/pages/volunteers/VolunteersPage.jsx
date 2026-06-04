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
  gap: 16px;
`;

const SectionHeadingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2b4a;
`;

const SectionDescription = styled.p`
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.35;
  color: #6b7280;
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
  /* Scrolls internally once the list grows past this height so the panel — and
     the page — never grows with it; matches the History table's cap. */
  max-height: 420px;
  overflow-y: auto;
  padding-right: 2px;
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

const StatsTable = styled.div`
  display: flex;
  flex-direction: column;
  /* No outer border. The 1px row gaps reveal this background as thin horizontal
     dividers; the vertical column dividers are border-rights on the cells.
     Scrolls internally on both axes so the panel never grows the page — vertical
     past max-height, horizontal on narrow viewports where the rows hold their
     min-width. Header + data rows live inside here, so they scroll together. */
  gap: 1px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  max-height: 420px;
`;

const StatsRow = styled.div`
  display: grid;
  /* Quantity (col 3) is wide enough for an 8-digit count; Time (col 4) holds a
     full "Mon D, YYYY, H:MM AM" without truncating. Narrow viewports overflow
     and scroll horizontally rather than squeezing these. */
  grid-template-columns: minmax(150px, 1fr) minmax(180px, 1.4fr) 110px 200px;
  align-items: center;
  background: #f8fafc;
  font-size: 0.88rem;
  min-width: 640px;

  > span {
    min-width: 0;
    /* Padding lives on the cells (not the row) so the column dividers span the
       full row height; the horizontal padding gives each divider breathing room. */
    padding: 10px 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Thin 1px vertical dividers between columns — no outer border. */
  > span:not(:last-child) {
    border-right: 1px solid #e5e7eb;
  }

  /* Quantity (3rd column) is centered; Volunteer, Item, Time stay left. */
  > span:nth-child(3) {
    text-align: center;
  }

  &:first-child {
    background: #e9edf5;
    font-weight: 700;
    font-size: 0.78rem;
    color: #4b5563;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  @media (max-width: 600px) {
    > span {
      padding: 9px 10px;
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
  return d.toLocaleTimeString([], {
    timeZone: 'America/Chicago',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VolunteersPage() {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyTruncated, setHistoryTruncated] = useState(false);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

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

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await volunteerApi.getVolunteerHistory();
      setHistory(data.history || []);
      setHistoryTruncated(Boolean(data.truncated));
    } catch {
      setHistory([]);
      setHistoryTruncated(false);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
    fetchHistory();
  }, [fetchActive, fetchHistory]);

  // The Volunteer Session modal lives in OwnerHeader, which renders on this very
  // page. Ending/generating/regenerating a code there changes who's active and
  // the session-scoped history, so re-fetch both panels when it reports a
  // change — otherwise they sit stale behind the modal until a manual refresh.
  const handleSessionChange = useCallback(() => {
    fetchActive();
    fetchHistory();
  }, [fetchActive, fetchHistory]);

  return (
    <PageWrapper>
      <OwnerHeader active='volunteers' onSessionChange={handleSessionChange} />

      <Content>
        {/* Active now */}
        <SectionCard>
          <SectionHeader>
            <SectionHeadingGroup>
              <SectionTitle>
                <ActiveDot />
                Active Now
              </SectionTitle>
              <SectionDescription>
                Removed on volunteer exit, end Session, or new code.
              </SectionDescription>
            </SectionHeadingGroup>
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
                </VolunteerRow>
              ))}
            </VolunteerList>
          )}
        </SectionCard>

        {/* Volunteer history */}
        <SectionCard>
          <SectionHeader>
            <SectionHeadingGroup>
              <SectionTitle>
                <FiUser
                  size={15}
                  style={{ marginRight: 6, verticalAlign: 'middle' }}
                />
                Volunteer History
              </SectionTitle>
              <SectionDescription>
                Resets when new code generated.
              </SectionDescription>
            </SectionHeadingGroup>
            <RefreshButton
              onClick={fetchHistory}
              title='Refresh'
              aria-label='Refresh volunteer history'
            >
              <FiRefreshCw size={16} />
            </RefreshButton>
          </SectionHeader>

          {loadingHistory ? (
            <EmptyText>Loading…</EmptyText>
          ) : history.length === 0 ? (
            <EmptyText>No volunteer scan-ins for the current code yet.</EmptyText>
          ) : (
            <StatsTable>
              <StatsRow>
                <span>Volunteer</span>
                <span>Item</span>
                <span>Quantity</span>
                <span>Time</span>
              </StatsRow>
              {history.map((entry) => (
                <StatsRow key={entry.id}>
                  <span>{entry.volunteer_name || 'Volunteer'}</span>
                  <span style={{ fontWeight: 600, color: '#1a2b4a' }}>
                    {entry.item_name}
                  </span>
                  <span>{entry.quantity ?? 0}</span>
                  <span style={{ color: '#6b7280' }}>
                    {formatDate(entry.created_at)}
                  </span>
                </StatsRow>
              ))}
              {historyTruncated && (
                <StatsRow>
                  <span style={{ color: '#6b7280' }}>
                    Showing the 500 most recent scan-ins.
                  </span>
                  <span />
                  <span />
                  <span />
                </StatsRow>
              )}
            </StatsTable>
          )}
        </SectionCard>
      </Content>
    </PageWrapper>
  );
}
