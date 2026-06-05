import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCalendar } from 'react-icons/fi';

import OwnerHeader from '@/common/components/navigation/OwnerHeader';
import styled from 'styled-components';

import { activityApi } from '../../services/api';
import DateRangePicker from './DateRangePicker';

// ─── Styled Components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ececec;
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

const LoadError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
`;

const LoadErrorText = styled.p`
  margin: 0;
  color: #b00020;
  font-size: 0.95rem;
  text-align: center;
`;

const RetryButton = styled.button`
  border: 1px solid #2c5e95;
  border-radius: 6px;
  background: #2c5e95;
  color: #ffffff;
  font-weight: 600;
  padding: 8px 18px;
  cursor: pointer;

  &:hover {
    background: #1e3a6e;
  }
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
  box-sizing: border-box;
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
  min-width: 0;
  overflow: hidden;
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

// text-overflow: ellipsis does not apply to the flex NameCell itself, so the
// name text lives in an inner block (mirrors VolunteerInfo/VolunteerName).
const NameText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
const TRAFFIC_LABELS = [
  '9AM',
  '10AM',
  '11AM',
  '12PM',
  '1PM',
  '2PM',
  '3PM',
  '4PM',
  '5PM',
];

const BAR_W = 16;
const BAR_GAP = 7;
const SPACING = BAR_W + BAR_GAP;
const PAD_LEFT = 30;
const PAD_TOP = 6;
const CHART_H = 100;

// All activity day/hour bucketing happens in the pantry's timezone so the
// results are consistent regardless of the viewer's browser timezone.
const PANTRY_TZ = 'America/Chicago';

const chicagoPartsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: PANTRY_TZ,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  hour12: false,
});

const chicagoTimeFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: PANTRY_TZ,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function chicagoParts(date) {
  const parts = {};
  for (const p of chicagoPartsFormat.formatToParts(date)) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24, // hour12:false can report 24 at midnight
  };
}

function chicagoDateString(date) {
  const { year, month, day } = chicagoParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function computeTrafficData(logs) {
  const counts = Object.fromEntries(TRAFFIC_HOURS.map((h) => [h, 0]));
  for (const log of logs) {
    const hour = chicagoParts(new Date(log.created_at)).hour;
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
            <text
              x={PAD_LEFT - 4}
              y={y + 4}
              textAnchor='end'
              fontSize='9'
              fill='#888'
            >
              {label}
            </text>
            <line
              x1={PAD_LEFT}
              x2={PAD_LEFT + 9 * SPACING - BAR_GAP}
              y1={y}
              y2={y}
              stroke='#ccc'
              strokeWidth='0.5'
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
            fill='#2c5e95'
            rx='2'
          />
        );
      })}
      {TRAFFIC_LABELS.map((label, i) => (
        <text
          key={label}
          x={PAD_LEFT + i * SPACING + BAR_W / 2}
          y={PAD_TOP + CHART_H + 14}
          textAnchor='middle'
          fontSize='8'
          fill='#888'
        >
          {label}
        </text>
      ))}
      <text
        x={PAD_LEFT + (9 * SPACING - BAR_GAP) / 2}
        y={PAD_TOP + CHART_H + 30}
        textAnchor='middle'
        fontSize='11'
        fontWeight='600'
        fill='#555'
      >
        Today&apos;s Traffic
      </text>
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDayTitle(parts) {
  return `${MONTH_NAMES[parts.month - 1]} ${parts.day}, ${parts.year}`;
}

function toDateString(date) {
  // YYYY-MM-DD in the pantry timezone, suitable for the API's date params
  return chicagoDateString(date);
}

function groupLogs(logs) {
  const byDate = {};
  for (const log of logs) {
    const date = new Date(log.created_at);
    const key = chicagoDateString(date);
    if (!byDate[key])
      byDate[key] = { key, parts: chicagoParts(date), added: [], removed: [] };
    const time = chicagoTimeFormat.format(date);
    byDate[key][log.action].push({
      name: log.item_name,
      qty: log.quantity,
      time,
    });
  }
  return Object.values(byDate).sort((a, b) => (a.key < b.key ? 1 : -1));
}

function computeStats(logs) {
  let totalAdded = 0;
  let totalRemoved = 0;
  const addedCounts = {};
  const removedCounts = {};
  for (const log of logs) {
    if (log.action === 'added') {
      totalAdded += log.quantity;
      addedCounts[log.item_name] =
        (addedCounts[log.item_name] || 0) + log.quantity;
    } else {
      totalRemoved += log.quantity;
      removedCounts[log.item_name] =
        (removedCounts[log.item_name] || 0) + log.quantity;
    }
  }
  const topAddedEntry = Object.entries(addedCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const topRemovedEntry = Object.entries(removedCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  return {
    totalAdded,
    totalRemoved,
    topAddedName: topAddedEntry?.[0] ?? '—',
    topAddedQty: topAddedEntry?.[1] ?? 0,
    topRemovedName: topRemovedEntry?.[0] ?? '—',
    topRemovedQty: topRemovedEntry?.[1] ?? 0,
  };
}

// Anchor the default range to the pantry's current month in America/Chicago,
// not the browser's local month — otherwise a viewer in a different timezone
// near a month boundary could default to the wrong month. The boundaries are
// stored as UTC-noon instants whose Chicago calendar date is exactly the 1st
// and last of the Chicago month (Chicago's UTC-5/6 offset keeps UTC noon on the
// same calendar day), so chicagoDateString() formats them back without drift.
function defaultDateRange() {
  const { year, month } = chicagoParts(new Date());
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const start = new Date(Date.UTC(year, month - 1, 1, 12));
  const end = new Date(Date.UTC(year, month - 1, lastDay, 12));
  return { start, end };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActivityLogPage() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [logs, setLogs] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await activityApi.getLogs({
        start: dateRange.start ? toDateString(dateRange.start) : undefined,
        end: dateRange.end ? toDateString(dateRange.end) : undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      setLogs([]);
      setLoadError("Couldn't load activity. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // "Today's Traffic" is always anchored to the pantry's current Chicago date,
  // independent of the stats/list date range. Fetch it separately so changing
  // dateRange never refetches or alters it. Empty deps → runs once on mount:
  // today's date doesn't depend on the selected range, so there's nothing to
  // re-run. start = end = today's Chicago calendar date, using the same
  // chicagoDateString convention as the range fetch (toDateString).
  useEffect(() => {
    const today = chicagoDateString(new Date());
    activityApi
      .getLogs({ start: today, end: today })
      .then((data) => setTodayLogs(data))
      .catch((err) => console.error("Failed to load today's traffic:", err));
  }, []);

  // Debounce the search term so the (memoized) filter below doesn't recompute on
  // every keystroke; the input itself stays fully responsive via searchQuery.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const statsMonthName =
    MONTH_NAMES[chicagoParts(dateRange.start ?? new Date()).month - 1];

  // Derived views over the full log set only depend on `logs`; memoize them so a
  // keystroke (which changes the search term, not the logs) doesn't re-run them.
  const stats = useMemo(() => computeStats(logs), [logs]);
  // Traffic is derived from the today-only fetch, NOT the selected-range logs.
  const trafficData = useMemo(() => computeTrafficData(todayLogs), [todayLogs]);
  const grouped = useMemo(() => groupLogs(logs), [logs]);

  const displayActivity = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) return grouped;
    return grouped
      .map((entry) => ({
        ...entry,
        added: entry.added.filter((r) => r.name.toLowerCase().includes(query)),
        removed: entry.removed.filter((r) =>
          r.name.toLowerCase().includes(query)
        ),
      }))
      .filter((entry) => entry.added.length > 0 || entry.removed.length > 0);
  }, [grouped, debouncedQuery]);

  return (
    <PageWrapper>
      <OwnerHeader
        active='activity'
        showSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

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
              <StatNumber $color='#16a34a'>{stats.totalAdded}</StatNumber>
              <StatLabel $color='#16a34a'>{'Items\nChecked In'}</StatLabel>
            </StatBlock>
            <StatBlock>
              <StatNumber $color='#16a34a'>{stats.topAddedQty}</StatNumber>
              <StatLabel $color='#16a34a'>{`Top Item:\n${stats.topAddedName}`}</StatLabel>
            </StatBlock>
            <StatBlock>
              <StatNumber $color='#ef4444'>{stats.totalRemoved}</StatNumber>
              <StatLabel $color='#ef4444'>{'Items\nChecked Out'}</StatLabel>
            </StatBlock>
            <StatBlock>
              <StatNumber $color='#ef4444'>{stats.topRemovedQty}</StatNumber>
              <StatLabel $color='#ef4444'>{`Top Item:\n${stats.topRemovedName}`}</StatLabel>
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

        {!loading && loadError && (
          <LoadError>
            <LoadErrorText>{loadError}</LoadErrorText>
            <RetryButton type='button' onClick={loadLogs}>
              Try again
            </RetryButton>
          </LoadError>
        )}

        {!loading && !loadError && displayActivity.length === 0 && (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No activity found for the selected date range.
          </p>
        )}

        {displayActivity.map((entry) => (
          <DaySection key={entry.key}>
            <DayTitle>{formatDayTitle(entry.parts)}</DayTitle>
            <TableWrapper>
              <SectionHeader>Items Added</SectionHeader>
              {entry.added.map((item, i) => (
                <DataRow key={i} $even={i % 2 === 0}>
                  <NameCell>
                    <NameText>{item.name}</NameText>
                  </NameCell>
                  <QtyCell>{item.qty}</QtyCell>
                  <TimeCell>{item.time}</TimeCell>
                </DataRow>
              ))}
              <SectionHeader>Items Removed</SectionHeader>
              {entry.removed.map((item, i) => (
                <DataRow key={i} $even={i % 2 === 0}>
                  <NameCell>
                    <NameText>{item.name}</NameText>
                  </NameCell>
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
    </PageWrapper>
  );
}
