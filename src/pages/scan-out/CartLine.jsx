import { useMemo, useState } from 'react';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiMinus,
  FiPlus,
  FiX,
} from 'react-icons/fi';

import useIsMobile from '@/common/hooks/useIsMobile';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const NAVY = '#2a4d8f';
const NAVY_DARK = '#1a2b4a';
const REMOVED_RED = '#ef4444';
const SUCCESS_GREEN = '#16a34a';
const BORDER = '#d6dce8';
const WARNING_BG = '#fff7ed';
const WARNING_BORDER = '#fdba74';
const WARNING_TEXT = '#7c2d12';

const Wrapper = styled.div`
  border: 1px solid ${(p) => (p.$variant === 'error' ? WARNING_BORDER : BORDER)};
  background: ${(p) =>
    p.$variant === 'done'
      ? '#f0fdf4'
      : p.$variant === 'error'
        ? WARNING_BG
        : '#ffffff'};
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;

const Title = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${NAVY_DARK};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  word-break: break-word;
`;

const Subtitle = styled.span`
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7b95;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  &:hover {
    color: ${REMOVED_RED};
    background: #fef2f2;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const WarnBanner = styled.div`
  font-size: 12px;
  color: ${WARNING_TEXT};
  background: #ffedd5;
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.3;
`;

const QtyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const QtyLabel = styled.span`
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
`;

const QtyStepper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const QtyButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid ${NAVY};
  background: #ffffff;
  color: ${NAVY};
  display: grid;
  place-items: center;
  cursor: pointer;
  &:hover {
    background: #f0f3f8;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
  }
`;

const MobileRightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const InlineStepper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const InlineQtyValue = styled.span`
  min-width: 18px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: ${NAVY_DARK};
`;

const QtyValue = styled.span`
  min-width: 24px;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: ${NAVY_DARK};
`;

const DoneTag = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${SUCCESS_GREEN};
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const RemovedTag = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${REMOVED_RED};
`;

const PickWrapper = styled.div`
  position: relative;
`;

const PickInput = styled.input`
  width: 100%;
  font-size: 14px;
  padding: 8px 10px;
  border: 1px solid #c7d2e3;
  border-radius: 6px;
  outline: none;
  color: ${NAVY_DARK};
  box-sizing: border-box;
  &:focus {
    border-color: ${NAVY};
  }

  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

const Dropdown = styled.ul`
  list-style: none;
  margin: 0;
  padding: 4px 0;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(26, 43, 74, 0.08);
  max-height: 200px;
  overflow-y: auto;
  z-index: 5;
`;

const DropdownItem = styled.li`
  padding: 8px 10px;
  font-size: 14px;
  color: ${NAVY_DARK};
  cursor: pointer;
  &:hover {
    background: #f0f3f8;
  }
`;

const DropdownCategory = styled.span`
  font-size: 11px;
  color: #6b7280;
  margin-left: 6px;
`;

export default function CartLine({
  line,
  items,
  onQuantityChange,
  onRemove,
  onPickItem,
}) {
  const isMobile = useIsMobile();
  const [pickQuery, setPickQuery] = useState('');
  const [pickFocused, setPickFocused] = useState(false);

  const isDone = line.status === 'done';
  const isSubmitting = line.status === 'submitting';
  const isError = line.status === 'error';
  const unknownBarcode =
    isError && line.error?.code === 'BARCODE_NOT_FOUND';
  const insufficient =
    isError && line.error?.code === 'INSUFFICIENT_STOCK';

  const filteredItems = useMemo(() => {
    const q = pickQuery.trim().toLowerCase();
    if (q.length === 0) return items.slice(0, 30);
    return items
      .filter((it) => it.name.toLowerCase().includes(q))
      .slice(0, 30);
  }, [items, pickQuery]);

  const displayName = line.name
    ? line.name
    : line.barcode
      ? `Barcode: ${line.barcode}`
      : 'Untitled item';

  const variant = isDone ? 'done' : isError ? 'error' : 'normal';

  return (
    <Wrapper $variant={variant}>
      <TopRow>
        <TitleBlock>
          <Title>
            {isDone && <FiCheckCircle size={16} color={SUCCESS_GREEN} />}
            {isSubmitting && <FiLoader size={16} color={NAVY} />}
            {isError && <FiAlertCircle size={16} color={REMOVED_RED} />}
            {displayName}
          </Title>
          {line.name && line.barcode && (
            <Subtitle>Barcode: {line.barcode}</Subtitle>
          )}
          {isDone && !isMobile && <DoneTag>Removed</DoneTag>}
        </TitleBlock>
        {isMobile ? (
          <MobileRightControls>
            {isDone ? (
              <RemovedTag>−{line.quantity}</RemovedTag>
            ) : (
              <>
                <InlineStepper>
                  <QtyButton
                    type='button'
                    onClick={() =>
                      onQuantityChange(line.id, line.quantity - 1)
                    }
                    disabled={isSubmitting || line.quantity <= 1}
                    aria-label='Decrease quantity'
                  >
                    <FiMinus size={14} />
                  </QtyButton>
                  <InlineQtyValue>{line.quantity}</InlineQtyValue>
                  <QtyButton
                    type='button'
                    onClick={() =>
                      onQuantityChange(line.id, line.quantity + 1)
                    }
                    disabled={isSubmitting}
                    aria-label='Increase quantity'
                  >
                    <FiPlus size={14} />
                  </QtyButton>
                </InlineStepper>
                <RemoveButton
                  type='button'
                  onClick={() => onRemove(line.id)}
                  disabled={isSubmitting}
                  aria-label='Remove line'
                >
                  <FiX size={18} />
                </RemoveButton>
              </>
            )}
          </MobileRightControls>
        ) : (
          <RemoveButton
            type='button'
            onClick={() => onRemove(line.id)}
            disabled={isDone || isSubmitting}
            aria-label='Remove line'
          >
            <FiX size={18} />
          </RemoveButton>
        )}
      </TopRow>

      {unknownBarcode && (
        <>
          <WarnBanner>
            <FiAlertCircle size={14} />
            Barcode not in catalog. Pick the item to remove:
          </WarnBanner>
          <PickWrapper>
            <PickInput
              type='text'
              placeholder='Search item name…'
              value={pickQuery}
              onChange={(e) => setPickQuery(e.target.value)}
              onFocus={() => setPickFocused(true)}
              onBlur={() => setTimeout(() => setPickFocused(false), 150)}
              autoComplete='off'
            />
            {pickFocused && filteredItems.length > 0 && (
              <Dropdown role='listbox'>
                {filteredItems.map((it) => (
                  <DropdownItem
                    key={it.id}
                    role='option'
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onPickItem(line.id, it);
                      setPickQuery('');
                      setPickFocused(false);
                    }}
                  >
                    {it.name}
                    {it.category_name && (
                      <DropdownCategory>· {it.category_name}</DropdownCategory>
                    )}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </PickWrapper>
        </>
      )}

      {insufficient && (
        <WarnBanner>
          <FiAlertCircle size={14} />
          Only {line.error.available} in stock. Adjust quantity or remove.
        </WarnBanner>
      )}

      {isError && !unknownBarcode && !insufficient && line.error?.message && (
        <WarnBanner>
          <FiAlertCircle size={14} />
          {line.error.message}
        </WarnBanner>
      )}

      {!isMobile &&
        (isDone ? (
          <QtyRow>
            <QtyLabel>Quantity removed</QtyLabel>
            <RemovedTag>−{line.quantity}</RemovedTag>
          </QtyRow>
        ) : (
          <QtyRow>
            <QtyLabel>Quantity</QtyLabel>
            <QtyStepper>
              <QtyButton
                type='button'
                onClick={() => onQuantityChange(line.id, line.quantity - 1)}
                disabled={isSubmitting || line.quantity <= 1}
                aria-label='Decrease quantity'
              >
                <FiMinus size={14} />
              </QtyButton>
              <QtyValue>{line.quantity}</QtyValue>
              <QtyButton
                type='button'
                onClick={() => onQuantityChange(line.id, line.quantity + 1)}
                disabled={isSubmitting}
                aria-label='Increase quantity'
              >
                <FiPlus size={14} />
              </QtyButton>
            </QtyStepper>
          </QtyRow>
        ))}
    </Wrapper>
  );
}

CartLine.propTypes = {
  line: PropTypes.shape({
    id: PropTypes.string.isRequired,
    barcode: PropTypes.string,
    itemId: PropTypes.number,
    name: PropTypes.string,
    quantity: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['pending', 'submitting', 'done', 'error'])
      .isRequired,
    error: PropTypes.shape({
      code: PropTypes.string,
      message: PropTypes.string,
      available: PropTypes.number,
    }),
  }).isRequired,
  items: PropTypes.array.isRequired,
  onQuantityChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onPickItem: PropTypes.func.isRequired,
};
