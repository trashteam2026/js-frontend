import { useMemo, useState } from 'react';
import { FiEdit2, FiX } from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

import { MOCK_ITEM_DETAILS } from './mockData';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 28px 32px;
  min-width: 520px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #6b7b95;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: #1a2b4a;
    background-color: #f0f3f8;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1a2b4a;
  margin: 0 0 16px 0;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 15px;
  color: #1a2b4a;
`;

const InfoLabel = styled.span`
  font-weight: 600;
`;

const InfoValue = styled.span`
  font-weight: 400;
`;

const EditIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7b95;
  display: flex;
  align-items: center;
  padding: 2px;

  &:hover {
    color: #1a2b4a;
  }
`;

const ExpirationSection = styled.div`
  margin-top: 20px;
`;

const ExpirationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

const ExpirationTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #1a2b4a;
`;

const OmitZerosLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7b95;
  cursor: pointer;
`;

const GridWrapper = styled.div`
  overflow-x: auto;
`;

const Grid = styled.table`
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
`;

const GridHeaderCell = styled.th`
  padding: 6px 8px;
  text-align: center;
  font-weight: 600;
  color: #1a2b4a;
  border-bottom: 2px solid #d6dce8;
  min-width: 38px;
`;

const GridYearCell = styled.td`
  padding: 8px 10px;
  font-weight: 700;
  color: #1a2b4a;
  border-right: 2px solid #d6dce8;
  white-space: nowrap;
`;

const GridCell = styled.td`
  padding: 6px 8px;
  text-align: center;
  color: ${({ $value }) => ($value === 0 ? '#c8d0dc' : '#1a2b4a')};
  font-weight: ${({ $value }) => ($value > 0 ? '500' : '400')};
  background-color: ${({ $value }) => ($value > 0 ? '#f0f6ff' : 'transparent')};
  border: 1px solid #e8ecf2;
`;

const NoExpiration = styled.p`
  font-size: 14px;
  color: #8a97ad;
  font-style: italic;
  margin-top: 8px;
`;

export default function ItemDetailModal({ itemId, onClose }) {
  const [omitZeros, setOmitZeros] = useState(false);

  const detail = MOCK_ITEM_DETAILS[itemId];

  const gridData = useMemo(() => {
    if (!detail || !detail.batches) return null;

    // Check if all batches have null expiration
    const hasExpiration = detail.batches.some(
      (b) => b.expiration_date !== null
    );
    if (!hasExpiration) return null;

    // Group batches by year and month
    const yearMap = {};
    detail.batches.forEach((batch) => {
      if (!batch.expiration_date) return;
      const date = new Date(batch.expiration_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-12
      if (!yearMap[year]) yearMap[year] = {};
      yearMap[year][month] = (yearMap[year][month] || 0) + batch.quantity;
    });

    const years = Object.keys(yearMap)
      .map(Number)
      .sort((a, b) => a - b);
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return { years, months, yearMap };
  }, [detail]);

  if (!detail) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FiX />
        </CloseButton>

        <Title>{detail.name}</Title>

        <InfoRow>
          <InfoLabel>Total Count:</InfoLabel>
          <InfoValue>{detail.total_quantity}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>Low Status Count:</InfoLabel>
          <InfoValue>{detail.low_stock_threshold}</InfoValue>
          <EditIcon title='Edit threshold'>
            <FiEdit2 size={14} />
          </EditIcon>
        </InfoRow>

        <ExpirationSection>
          <ExpirationHeader>
            <ExpirationTitle>Expiration Dates</ExpirationTitle>
            {gridData && (
              <OmitZerosLabel>
                <input
                  type='checkbox'
                  checked={omitZeros}
                  onChange={(e) => setOmitZeros(e.target.checked)}
                />
                Omit Zeros
              </OmitZerosLabel>
            )}
          </ExpirationHeader>

          {gridData ? (
            <GridWrapper>
              <Grid>
                <thead>
                  <tr>
                    <GridHeaderCell />
                    {gridData.months.map((m) => (
                      <GridHeaderCell key={m}>{m}</GridHeaderCell>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridData.years.map((year) => (
                    <tr key={year}>
                      <GridYearCell>{year}</GridYearCell>
                      {gridData.months.map((month) => {
                        const val = gridData.yearMap[year]?.[month] || 0;
                        if (omitZeros && val === 0) {
                          return (
                            <GridCell key={month} $value={0}>
                              —
                            </GridCell>
                          );
                        }
                        return (
                          <GridCell key={month} $value={val}>
                            {val}
                          </GridCell>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Grid>
            </GridWrapper>
          ) : (
            <NoExpiration>
              No expiration date tracked for this item.
            </NoExpiration>
          )}
        </ExpirationSection>
      </Modal>
    </Overlay>
  );
}

ItemDetailModal.propTypes = {
  itemId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};
