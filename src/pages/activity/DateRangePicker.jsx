import { useState } from 'react';
import styled from 'styled-components';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_HEADERS = ['S','M','T','W','T','F','S'];

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function toMidnight(d) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

function sameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(d) {
  if (!d) return '';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 300;
`;

const PickerCard = styled.div`
  position: fixed;
  top: 88px;
  right: 24px;
  background: #ffffff;
  border: 1px solid #2c5e95;
  border-radius: 14px;
  overflow: hidden;
  width: 320px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
  z-index: 301;

  @media (max-width: 767px) {
    top: auto;
    right: 0;
    left: 0;
    bottom: 0;
    width: auto;
    border-radius: 16px 16px 0 0;
    max-height: 80vh;
    overflow: hidden;
    overflow-y: auto;
  }
`;

const RangeHeader = styled.div`
  background: #2c5e95;
  color: #ffffff;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  min-height: 36px;
  display: flex;
  align-items: center;
`;

const CalBody = styled.div`
  background: #d3deec;
  padding: 12px 14px 10px;
`;

const MonthYearNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

const NavArrow = styled.button`
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  color: #2c5e95;
  padding: 2px 5px;
  line-height: 1;

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
  }
`;

const NavSelect = styled.select`
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: #2c5e95;
  cursor: pointer;
  outline: none;

  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

const DayHeaderRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 2px;
`;

const DayHeaderCell = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #2c5e95;
  padding: 4px 0;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayCellWrapper = styled.div`
  position: relative;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 767px) {
    height: 44px;
  }
`;

const RangeBg = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 30px;
  left: ${(p) => (p.$isStart && !p.$isSingle ? '50%' : '0')};
  right: ${(p) => (p.$isEnd && !p.$isSingle ? '50%' : '0')};
  background: rgba(44, 94, 149, 0.2);
  display: ${(p) => (p.$show ? 'block' : 'none')};
  pointer-events: none;
`;

const DayCircle = styled.div`
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: ${(p) => (p.$selected ? '700' : '400')};
  background: ${(p) => (p.$selected ? '#2c5e95' : 'transparent')};
  color: ${(p) => {
    if (p.$selected) return '#fff';
    if (!p.$currentMonth) return '#9ba8bc';
    return '#111827';
  }};
  z-index: 1;
  transition: background 0.1s;

  &:hover {
    background: ${(p) => (p.$selected ? '#2c5e95' : 'rgba(44,94,149,0.12)')};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #c5d4e8;
`;

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  color: #2c5e95;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
`;

export default function DateRangePicker({ value, onChange, onClose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    value.start?.getFullYear() ?? today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    value.start?.getMonth() ?? today.getMonth()
  );
  const [tempStart, setTempStart] = useState(
    value.start ? toMidnight(value.start) : null
  );
  const [tempEnd, setTempEnd] = useState(
    value.end ? toMidnight(value.end) : null
  );

  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevMon = viewMonth === 0 ? 11 : viewMonth - 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextMon = viewMonth === 11 ? 0 : viewMonth + 1;

  const firstDay = startDayOfMonth(viewYear, viewMonth);
  const numDays = daysInMonth(viewYear, viewMonth);
  const prevDays = daysInMonth(prevYear, prevMon);

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: toMidnight(new Date(prevYear, prevMon, prevDays - i)), current: false });
  }
  for (let d = 1; d <= numDays; d++) {
    cells.push({ date: toMidnight(new Date(viewYear, viewMonth, d)), current: true });
  }
  let nextIdx = 1;
  while (cells.length < 42) {
    cells.push({ date: toMidnight(new Date(nextYear, nextMon, nextIdx++)), current: false });
  }

  const handleDayClick = (date) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
    } else {
      if (date >= tempStart) {
        setTempEnd(date);
      } else {
        setTempStart(date);
        setTempEnd(null);
      }
    }
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const rangeDisplay =
    tempStart && tempEnd
      ? `${formatDate(tempStart)} - ${formatDate(tempEnd)}`
      : tempStart
      ? `${formatDate(tempStart)} - MM/DD/YYYY`
      : 'MM/DD/YYYY - MM/DD/YYYY';

  const years = Array.from({ length: 20 }, (_, i) => today.getFullYear() - 5 + i);

  const handleOk = () => {
    if (tempStart && tempEnd) {
      onChange({ start: tempStart, end: tempEnd });
    }
    onClose();
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <PickerCard onClick={(e) => e.stopPropagation()}>
        <RangeHeader>{rangeDisplay}</RangeHeader>
        <CalBody>
          <MonthYearNav>
            <NavGroup>
              <NavArrow onClick={goToPrevMonth}>&lt;</NavArrow>
              <NavSelect
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
              >
                {MONTH_SHORT.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </NavSelect>
              <NavArrow onClick={goToNextMonth}>&gt;</NavArrow>
            </NavGroup>
            <NavGroup>
              <NavArrow onClick={() => setViewYear((y) => y - 1)}>&lt;</NavArrow>
              <NavSelect
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </NavSelect>
              <NavArrow onClick={() => setViewYear((y) => y + 1)}>&gt;</NavArrow>
            </NavGroup>
          </MonthYearNav>

          <DayHeaderRow>
            {DAY_HEADERS.map((d, i) => (
              <DayHeaderCell key={i}>{d}</DayHeaderCell>
            ))}
          </DayHeaderRow>

          <DaysGrid>
            {cells.map(({ date, current }, i) => {
              const isStart = sameDay(date, tempStart);
              const isEnd = sameDay(date, tempEnd);
              const isSingle = sameDay(tempStart, tempEnd);
              const inRange =
                tempStart &&
                tempEnd &&
                date > tempStart &&
                date < tempEnd;
              const showBg =
                (inRange || ((isStart || isEnd) && !isSingle)) &&
                !!(tempStart && tempEnd);

              return (
                <DayCellWrapper key={i} onClick={() => handleDayClick(date)}>
                  <RangeBg
                    $isStart={isStart}
                    $isEnd={isEnd}
                    $isSingle={isSingle}
                    $show={showBg}
                  />
                  <DayCircle
                    $selected={isStart || isEnd}
                    $currentMonth={current}
                  >
                    {date.getDate()}
                  </DayCircle>
                </DayCellWrapper>
              );
            })}
          </DaysGrid>

          <Actions>
            <ActionBtn onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn onClick={handleOk}>OK</ActionBtn>
          </Actions>
        </CalBody>
      </PickerCard>
    </>
  );
}
