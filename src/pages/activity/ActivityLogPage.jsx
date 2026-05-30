import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiKey, FiSearch, FiUser, FiUsers } from 'react-icons/fi';

import PantryLogo from '@/assets/icons/image-1.svg';
import CashRegisterIcon from '@/assets/icons/tabler-icon-cash-register.svg?react';
import HistoryIcon from '@/assets/icons/tabler-icon-history.svg?react';
import TableRowIcon from '@/assets/icons/tabler-icon-table-row.svg?react';
import useIsMobile from '@/common/hooks/useIsMobile';
import styled from 'styled-components';

import { activityApi } from '../../services/api';
import ProfileDropdown from '../inventory/ProfileDropdown';
import VolunteerCodeModal from '../inventory/VolunteerCodeModal';
import DateRangePicker from './DateRangePicker';

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  height: 100vh;
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
  position: relative;

  @media (max-width: 767px) {
    gap: 8px;
    padding: 8px 12px;
    flex-wrap: wrap;
  }
`;

const LogoImg = styled.img`
  width: 43px;
  height: 43px;
  flex-shrink: 0;

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

const MobileBrandTitle = styled.h1`
  display: none;

  @media (max-width: 767px) {
    display: block;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
    line-height: 1;
  }
`;

const SearchWrapper = styled.div`
  flex: 0 1 455px;
  display: flex;
  margin-left: 2px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 455px;

  @media (max-width: 767px) {
    flex: 0 0 100%;
    order: 99;
    min-width: 0;
    margin-left: 0;
    position: static;
    top: auto;
    transform: none;
    width: auto;
  }
`;

const SearchPill = styled.div`
  width: 100%;
  background-color: #d4dce8;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  height: 40px;
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

const DesktopOnlyActiveNavIcon = styled(ActiveNavIcon)`
  @media (max-width: 767px) {
    display: none;
  }
`;

const Fab = styled.button`
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
  overflow-y: auto;
  padding: 8px 24px 32px;

  @media (max-width: 767px) {
    padding: 8px 12px 96px;
  }
`;

const DateRangeRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
`;

const DateRangeBtn = styled.button`
  background: transparent;
  border: none;
  color: #2c5e95;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;

  @media (max-width: 767px) {
    font-size: 13px;
  }
`;

const StatsSection = styled.div`
  margin-bottom: 28px;
`;

const StatsHeading = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #111;
  margin: 0 0 14px;

  @media (max-width: 767px) {
    font-size: 18px;
    margin: 0 0 10px;
  }
`;

const StatsRow = styled.div`
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  column-gap: 36px;
  row-gap: 18px;

  @media (max-width: 767px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    row-gap: 10px;
    align-items: stretch;
  }
`;

const StatBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 70px;

  @media (max-width: 767px) {
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid #d6dce8;
    border-radius: 10px;
    background: #ffffff;
  }
`;

const StatNumber = styled.span`
  font-size: 52px;
  font-weight: 700;
  color: ${(p) => p.$color || '#111'};
  line-height: 1;

  @media (max-width: 767px) {
    font-size: 30px;
  }
`;

const StatLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${(p) => p.$color || '#111'};
  line-height: 1.35;
  margin-top: 4px;
  white-space: pre-line;

  @media (max-width: 767px) {
    font-size: 11px;
  }
`;

const ChartCell = styled.div`
  display: flex;
  justify-content: center;

  @media (max-width: 767px) {
    grid-column: 1 / -1;
    padding: 10px 12px;
    border: 1px solid #d6dce8;
    border-radius: 10px;
    background: #ffffff;
    overflow-x: auto;
  }
`;

const DaySection = styled.div`
  margin-bottom: 36px;

  @media (max-width: 767px) {
    margin-bottom: 24px;
  }
`;

const DayTitle = styled.h3`
  font-size: 26px;
  font-weight: 700;
  color: #111;
  margin: 0 0 10px;

  @media (max-width: 767px) {
    font-size: 18px;
    margin: 0 0 8px;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  border: 1px solid #2c5e95;
  border-radius: 14px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: #2c5e95;
  color: #fff;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
`;

const DataRow = styled.div`
  display: flex;
  align-items: stretch;
  min-height: 37px;
  background: ${(p) => (p.$even ? '#f1f1f3' : '#d3deec')};
`;

const NameCell = styled.div`
  flex: 1;
  padding: 0 10px;
  font-size: 14px;
  color: #111827;
  display: flex;
  align-items: center;
  border-right: 1px solid #2c5e95;

  @media (max-width: 767px) {
    padding: 0 8px;
    font-size: 13px;
  }
`;

const QtyCell = styled.div`
  width: 72px;
  padding: 0 10px;
  font-size: 14px;
  color: #111827;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #2c5e95;

  @media (max-width: 767px) {
    width: 48px;
    padding: 0 4px;
    font-size: 13px;
  }
`;

const TimeCell = styled.div`
  width: 110px;
  padding: 0 10px;
  font-size: 14px;
  color: #111827;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 767px) {
    width: 72px;
    padding: 0 6px;
    font-size: 12px;
  }
`;

// ─── Bar Chart ────────────────────────────────────────────────────────────────

const TRAFFIC_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const TRAFFIC_LABELS = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];

const BAR_W = 16;
const BAR_GAP = 7;
const SPACING = BAR_W + BAR_GAP;
const PAD_LEFT = 30;
const PAD_TOP = 6;
const CHART_H = 100;

function computeTrafficData(logs) {
  const counts = Object.fromEntries(TRAFFIC_HOURS.map((h) => [h, 0]));
  for (const log of logs) {
    const hour = new Date(log.created_at).getHours();
    if (hour in counts) counts[hour] += log.quantity;
  }
  return TRAFFIC_HOURS.map((h) => counts[h]);
}

function TrafficChart({ data }) {
  const maxVal = Math.max(...data, 1);
  const gridLines = [0, 25, 50, 75, 100];

  return (
    <svg
      width={PAD_LEFT + 9 * SPACING - BAR_GAP + 6}
      height={CHART_H + 40}
      style={{ display: 'block' }}
    >
      {gridLines.map((pct) => {
        const label = Math.round((pct / 100) * maxVal);
        const y = PAD_TOP + CHART_H - (pct / 100) * CHART_H;
        return (
          <g key={pct}>
            <text x={PAD_LEFT - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#888">
              {label}
            </text>
            <line
              x1={PAD_LEFT}
              x2={PAD_LEFT + 9 * SPACING - BAR_GAP}
              y1={y} y2={y}
              stroke="#ccc" strokeWidth="0.5"
            />
          </g>
        );
      })}
      {data.map((v, i) => {
        const barH = Math.round((v / maxVal) * CHART_H);
        return (
          <rect
            key={i}
            x={PAD_LEFT + i * SPACING}
            y={PAD_TOP + CHART_H - barH}
            width={BAR_W}
            height={barH}
            fill="#2c5e95"
            rx="2"
          />
        );
      })}
      {TRAFFIC_LABELS.map((label, i) => (
        <text
          key={label}
          x={PAD_LEFT + i * SPACING + BAR_W / 2}
          y={PAD_TOP + CHART_H + 14}
          textAnchor="middle"
          fontSize="8"
          fill="#888"
        >
          {label}
        </text>
      ))}
      <text
        x={PAD_LEFT + (9 * SPACING - BAR_GAP) / 2}
        y={PAD_TOP + CHART_H + 30}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#555"
      >
        Traffic
      </text>
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function formatDayTitle(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function toDateString(date) {
  // YYYY-MM-DD in local time, suitable for the API's date params
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function groupLogs(logs) {
  const byDate = {};
  for (const log of logs) {
    const date = new Date(log.created_at);
    const key = date.toDateString();
    if (!byDate[key]) byDate[key] = { date, added: [], removed: [] };
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    byDate[key][log.action].push({ name: log.item_name, qty: log.quantity, time });
  }
  return Object.values(byDate).sort((a, b) => b.date - a.date);
}

function computeStats(logs) {
  let totalAdded = 0;
  let totalRemoved = 0;
  const addedCounts = {};
  const removedCounts = {};
  for (const log of logs) {
    if (log.action === 'added') {
      totalAdded += log.quantity;
      addedCounts[log.item_name] = (addedCounts[log.item_name] || 0) + log.quantity;
    } else {
      totalRemoved += log.quantity;
      removedCounts[log.item_name] = (removedCounts[log.item_name] || 0) + log.quantity;
    }
  }
  const topAddedEntry = Object.entries(addedCounts).sort((a, b) => b[1] - a[1])[0];
  const topRemovedEntry = Object.entries(removedCounts).sort((a, b) => b[1] - a[1])[0];
  return {
    totalAdded,
    totalRemoved,
    topAddedName: topAddedEntry?.[0] ?? '—',
    topAddedQty: topAddedEntry?.[1] ?? 0,
    topRemovedName: topRemovedEntry?.[0] ?? '—',
    topRemovedQty: topRemovedEntry?.[1] ?? 0,
  };
}

function defaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const navigate = useNavigate();
  const profileWrapperRef = useRef(null);
  const isMobile = useIsMobile();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    setLoading(true);
    activityApi
      .getLogs({
        start: dateRange.start ? toDateString(dateRange.start) : undefined,
        end: dateRange.end ? toDateString(dateRange.end) : undefined,
      })
      .then((data) => setLogs(data))
      .catch((err) => console.error('Failed to load activity logs:', err))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const statsMonthName = MONTH_NAMES[dateRange.start?.getMonth() ?? new Date().getMonth()];
  const stats = computeStats(logs);
  const trafficData = computeTrafficData(logs);
  const grouped = groupLogs(logs);

  const query = searchQuery.trim().toLowerCase();
  const displayActivity = query
    ? grouped
        .map((entry) => ({
          ...entry,
          added: entry.added.filter((r) => r.name.toLowerCase().includes(query)),
          removed: entry.removed.filter((r) => r.name.toLowerCase().includes(query)),
        }))
        .filter((entry) => entry.added.length > 0 || entry.removed.length > 0)
    : grouped;

  return (
    <PageWrapper>
      <TopBar>
        <LogoImg
          src={PantryLogo}
          alt="New Trier Township"
          onClick={() => navigate('/inventory')}
          style={{ cursor: 'pointer' }}
        />
        <PageTitle
          onClick={() => navigate('/inventory')}
          style={{ cursor: 'pointer' }}
        >
          New Trier Township Food Pantry Inventory
        </PageTitle>
        <MobileBrandTitle
          onClick={() => navigate('/inventory')}
          style={{ cursor: 'pointer' }}
        >
          New Trier Township
        </MobileBrandTitle>
        <SearchWrapper>
          <SearchPill>
            <SearchInput
              type="text"
              placeholder="Search for an item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchButton>
              <FiSearch size={21} color="#ffffff" />
            </SearchButton>
          </SearchPill>
        </SearchWrapper>
        <NavIcons>
          <NavIcon title="Inventory" onClick={() => navigate('/inventory')}>
            <TableRowIcon />
          </NavIcon>
          <DesktopOnlyNavIcon
            title="Scan Out"
            onClick={() => navigate('/scan-out')}
          >
            <CashRegisterIcon />
          </DesktopOnlyNavIcon>
          <DesktopOnlyActiveNavIcon title="Activity">
            <HistoryIcon />
          </DesktopOnlyActiveNavIcon>
          <NavIcon
            title="Volunteers"
            onClick={() => navigate('/volunteers')}
          >
            <FiUsers size={22} />
          </NavIcon>
          <NavIcon
            title="Volunteer Session"
            onClick={() => setShowVolunteerModal(true)}
          >
            <FiKey size={22} />
          </NavIcon>
          <ProfileWrapper ref={profileWrapperRef}>
            <ProfileButton
              title="Profile"
              onClick={() => setShowProfileDropdown((o) => !o)}
            >
              <FiUser size={24} color="#ffffff" />
            </ProfileButton>
            {showProfileDropdown && (
              <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />
            )}
          </ProfileWrapper>
        </NavIcons>
      </TopBar>

      <Content>
        <DateRangeRow>
          <DateRangeBtn onClick={() => setShowDatePicker(true)}>
            Select Date Range <FiCalendar size={16} />
          </DateRangeBtn>
        </DateRangeRow>

        <StatsSection>
          <StatsHeading>{statsMonthName}&apos;s Statistics</StatsHeading>
          <StatsRow>
            <StatBlock>
              <StatNumber $color="#16a34a">{stats.totalAdded}</StatNumber>
              <StatLabel $color="#16a34a">{'Items\nChecked In'}</StatLabel>
            </StatBlock>
            <StatBlock>
              <StatNumber $color="#16a34a">{stats.topAddedQty}</StatNumber>
              <StatLabel $color="#16a34a">{`Top Item:\n${stats.topAddedName}`}</StatLabel>
            </StatBlock>
            <StatBlock>
              <StatNumber $color="#ef4444">{stats.totalRemoved}</StatNumber>
              <StatLabel $color="#ef4444">{'Items\nChecked Out'}</StatLabel>
            </StatBlock>
            <StatBlock>
              <StatNumber $color="#ef4444">{stats.topRemovedQty}</StatNumber>
              <StatLabel $color="#ef4444">{`Top Item:\n${stats.topRemovedName}`}</StatLabel>
            </StatBlock>
            <ChartCell>
              <TrafficChart data={trafficData} />
            </ChartCell>
          </StatsRow>
        </StatsSection>

        {loading && (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            Loading…
          </p>
        )}

        {!loading && displayActivity.length === 0 && (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No activity found for the selected date range.
          </p>
        )}

        {displayActivity.map((entry) => (
          <DaySection key={entry.date.toISOString()}>
            <DayTitle>{formatDayTitle(entry.date)}</DayTitle>
            <TableWrapper>
              <SectionHeader>Items Added</SectionHeader>
              {entry.added.map((item, i) => (
                <DataRow key={i} $even={i % 2 === 0}>
                  <NameCell>{item.name}</NameCell>
                  <QtyCell>{item.qty}</QtyCell>
                  <TimeCell>{item.time}</TimeCell>
                </DataRow>
              ))}
              <SectionHeader>Items Removed</SectionHeader>
              {entry.removed.map((item, i) => (
                <DataRow key={i} $even={i % 2 === 0}>
                  <NameCell>{item.name}</NameCell>
                  <QtyCell>{item.qty}</QtyCell>
                  <TimeCell>{item.time}</TimeCell>
                </DataRow>
              ))}
            </TableWrapper>
          </DaySection>
        ))}
      </Content>

      {showDatePicker && (
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {isMobile && (
        <Fab
          title="Scan Out"
          aria-label="Scan Out"
          onClick={() => navigate('/scan-out')}
        >
          <CashRegisterIcon />
        </Fab>
      )}

      {showVolunteerModal && (
        <VolunteerCodeModal onClose={() => setShowVolunteerModal(false)} />
      )}
    </PageWrapper>
  );
}
