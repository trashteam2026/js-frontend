import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi';

import useIsMobile from '@/common/hooks/useIsMobile';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { batchesApi, itemsApi } from '../../services/api';

// ─── Styled components ────────────────────────────────────────────────────────

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
  padding: 28px 32px 24px;
  width: min(560px, calc(100vw - 24px));
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
  &:hover { color: #1a2b4a; background-color: #f0f3f8; }

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
    justify-content: center;
  }
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 700;
  color: #1a2b4a;
  margin: 0 0 16px 0;
  padding-right: 32px;
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
  &:hover { color: #1a2b4a; }
`;

const InlineInput = styled.input`
  width: 72px;
  padding: 2px 6px;
  font-size: 15px;
  border: 1px solid #2c5e95;
  border-radius: 4px;
  outline: none;
  color: #1a2b4a;
  &::-webkit-inner-spin-button { opacity: 1; }

  @media (max-width: 767px) {
    font-size: 16px;
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

const HintText = styled.span`
  font-size: 12px;
  color: #9ba8bc;
  margin-left: auto;
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
  padding: 4px 6px;
  text-align: center;
  color: ${({ $value }) => ($value === 0 ? '#c8d0dc' : '#1a2b4a')};
  font-weight: ${({ $value }) => ($value > 0 ? '500' : '400')};
  background-color: ${({ $editing, $value }) =>
    $editing ? '#eef3fa' : $value > 0 ? '#f0f6ff' : 'transparent'};
  border: 1px solid ${({ $editing }) => ($editing ? '#2c5e95' : '#e8ecf2')};
  cursor: ${({ $editing }) => ($editing ? 'text' : 'pointer')};
  min-width: 38px;
  &:hover {
    background-color: ${({ $editing }) => ($editing ? '#eef3fa' : '#e8f0fb')};
  }
`;

const CellInput = styled.input`
  width: 36px;
  padding: 1px 2px;
  font-size: 13px;
  border: none;
  background: transparent;
  outline: none;
  text-align: center;
  color: #1a2b4a;
  font-weight: 500;
  &::-webkit-inner-spin-button { opacity: 1; }

  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

const MobileBatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const YearSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const YearHeader = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #1a2b4a;
  border-bottom: 1px solid #d6dce8;
  padding-bottom: 4px;
`;

const DatedBatchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 15px;
  color: #1a2b4a;
  min-height: 44px;
  cursor: pointer;

  &:hover {
    background: #eef3fa;
  }
`;

const BatchDateLabel = styled.span`
  font-weight: 500;
`;

const BatchQtyDisplay = styled.span`
  margin-left: auto;
  font-weight: 600;
`;

const NoExpirationBatches = styled.div`
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e8ecf2;
`;

const NoExpTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1a2b4a;
  margin-bottom: 8px;
`;

const BatchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f8fafc;
  margin-bottom: 4px;
  font-size: 14px;
  color: #1a2b4a;
`;

const BatchQtyCell = styled.span`
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid transparent;
  &:hover { border-color: #2c5e95; background: #eef3fa; }
`;

const BatchQtyInput = styled.input`
  width: 60px;
  padding: 2px 6px;
  font-size: 14px;
  border: 1px solid #2c5e95;
  border-radius: 3px;
  outline: none;
  color: #1a2b4a;
  &::-webkit-inner-spin-button { opacity: 1; }

  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

const DeleteBatchButton = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #c0392b;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: 3px;
  &:hover { background: #fdf2f2; }
`;

const AddBatchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #2c5e95;
  background: none;
  border: 1px dashed #2c5e95;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  margin-top: 6px;
  &:hover { background: #eef3fa; }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e8ecf2;
  margin: 20px 0 14px;
`;

const DeleteItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #c0392b;
  background: none;
  border: 1px solid #e8b4b0;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  margin-top: 4px;
  &:hover { background: #fdf2f2; border-color: #c0392b; }
`;

const StatusText = styled.p`
  font-size: 14px;
  color: #8a97ad;
  font-style: italic;
  margin-top: 8px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatBatchMonthDay(dateStr) {
  const d = new Date(String(dateStr).slice(0, 10) + 'T00:00:00');
  return `${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export default function ItemDetailModal({
  itemId,
  onClose,
  onItemDeleted,
  onItemUpdated,
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [omitZeros, setOmitZeros] = useState(false);

  // Expiration grid cell editing
  const [editingCell, setEditingCell] = useState(null); // { year, month }
  const [cellInput, setCellInput] = useState('');
  const cellInputRef = useRef(null);

  // Low-stock threshold editing
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState('');
  const thresholdInputRef = useRef(null);

  // No-expiration batch qty editing
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [batchInput, setBatchInput] = useState('');
  const batchInputRef = useRef(null);

  const fetchDetail = useCallback(async () => {
    try {
      const data = await itemsApi.getById(itemId);
      setDetail(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
      cellInputRef.current.select();
    }
  }, [editingCell]);

  useEffect(() => {
    if (editingThreshold && thresholdInputRef.current) {
      thresholdInputRef.current.focus();
      thresholdInputRef.current.select();
    }
  }, [editingThreshold]);

  useEffect(() => {
    if (editingBatchId !== null && batchInputRef.current) {
      batchInputRef.current.focus();
      batchInputRef.current.select();
    }
  }, [editingBatchId]);

  // Build year/month grid from dated batches
  const gridData = useMemo(() => {
    if (!detail) return null;

    const datedBatches = (detail.batches || []).filter(
      (b) => b.expiration_date !== null
    );

    const yearMap = {};
    datedBatches.forEach((batch) => {
      const dateStr = String(batch.expiration_date).slice(0, 10);
      const d = new Date(dateStr + 'T00:00:00');
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      if (!yearMap[year]) yearMap[year] = {};
      yearMap[year][month] = (yearMap[year][month] || 0) + batch.quantity;
    });

    // Always show current year and next two so users can enter future data
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y <= currentYear + 2; y++) {
      if (!yearMap[y]) yearMap[y] = {};
    }

    const years = Object.keys(yearMap)
      .map(Number)
      .sort((a, b) => a - b);

    return { years, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], yearMap };
  }, [detail]);

  const noExpBatches = useMemo(
    () => (detail?.batches || []).filter((b) => b.expiration_date === null),
    [detail]
  );

  // Mobile: dated batches grouped by year, sorted ascending by date
  const datedBatchesByYear = useMemo(() => {
    if (!detail) return [];
    const dated = (detail.batches || [])
      .filter((b) => b.expiration_date !== null)
      .sort((a, b) =>
        String(a.expiration_date).localeCompare(String(b.expiration_date))
      );
    const byYear = new Map();
    for (const b of dated) {
      const dateStr = String(b.expiration_date).slice(0, 10);
      const year = new Date(dateStr + 'T00:00:00').getFullYear();
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year).push(b);
    }
    return Array.from(byYear.entries())
      .map(([year, batches]) => ({ year, batches }))
      .sort((a, b) => a.year - b.year);
  }, [detail]);

  // ── Grid cell save ──────────────────────────────────────────────────────────
  const saveCellEdit = useCallback(async () => {
    if (!editingCell || saving) return;
    const { year, month } = editingCell;
    const newQty = Math.max(0, parseInt(cellInput, 10) || 0);

    setEditingCell(null);
    setSaving(true);

    try {
      const targetDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const monthBatches = (detail.batches || []).filter((b) => {
        if (!b.expiration_date) return false;
        const dateStr = String(b.expiration_date).slice(0, 10);
        const d = new Date(dateStr + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      if (monthBatches.length === 0) {
        if (newQty > 0) {
          await batchesApi.create(itemId, {
            expiration_date: targetDate,
            quantity: newQty,
          });
        }
      } else {
        // Update the first batch; delete extras if any
        await batchesApi.update(itemId, monthBatches[0].id, {
          quantity: newQty,
        });
        for (const b of monthBatches.slice(1)) {
          await batchesApi.delete(itemId, b.id);
        }
      }

      await fetchDetail();
    } catch (err) {
      console.error('Save cell error:', err);
    } finally {
      setSaving(false);
    }
  }, [editingCell, cellInput, detail, itemId, saving, fetchDetail]);

  // ── Threshold save ──────────────────────────────────────────────────────────
  const saveThreshold = useCallback(async () => {
    const val = parseInt(thresholdInput, 10);
    setEditingThreshold(false);
    if (isNaN(val) || val < 0) return;

    setSaving(true);
    try {
      const updated = await itemsApi.update(itemId, { low_stock_threshold: val });
      onItemUpdated?.(updated);
      await fetchDetail();
    } catch (err) {
      console.error('Update threshold error:', err);
    } finally {
      setSaving(false);
    }
  }, [thresholdInput, itemId, onItemUpdated, fetchDetail]);

  // ── No-exp batch qty save ───────────────────────────────────────────────────
  const saveBatchQty = useCallback(
    async (batchId) => {
      const newQty = Math.max(0, parseInt(batchInput, 10) || 0);
      setEditingBatchId(null);
      setSaving(true);
      try {
        await batchesApi.update(itemId, batchId, { quantity: newQty });
        await fetchDetail();
      } catch (err) {
        console.error('Update batch qty error:', err);
      } finally {
        setSaving(false);
      }
    },
    [batchInput, itemId, fetchDetail]
  );

  const handleDeleteBatch = useCallback(
    async (batchId) => {
      setSaving(true);
      try {
        await batchesApi.delete(itemId, batchId);
        await fetchDetail();
      } catch (err) {
        console.error('Delete batch error:', err);
      } finally {
        setSaving(false);
      }
    },
    [itemId, fetchDetail]
  );

  const handleAddNoExpBatch = useCallback(async () => {
    setSaving(true);
    try {
      await batchesApi.create(itemId, { expiration_date: null, quantity: 0 });
      await fetchDetail();
    } catch (err) {
      console.error('Add batch error:', err);
    } finally {
      setSaving(false);
    }
  }, [itemId, fetchDetail]);

  const handleDeleteItem = useCallback(async () => {
    if (!window.confirm(`Delete "${detail?.name}"? This cannot be undone.`))
      return;
    try {
      await itemsApi.delete(itemId);
      onItemDeleted?.(itemId);
      onClose();
    } catch (err) {
      console.error('Delete item error:', err);
    }
  }, [detail, itemId, onItemDeleted, onClose]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}><FiX /></CloseButton>
          <StatusText>Loading…</StatusText>
        </Modal>
      </Overlay>
    );
  }

  if (error || !detail) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}><FiX /></CloseButton>
          <StatusText style={{ color: '#c0392b' }}>{error || 'Item not found'}</StatusText>
        </Modal>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} title='Close'>
          <FiX />
        </CloseButton>

        <Title>{detail.name}</Title>

        <InfoRow>
          <InfoLabel>Total Count:</InfoLabel>
          <InfoValue>{detail.total_quantity}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>Low Status Count:</InfoLabel>
          {editingThreshold ? (
            <InlineInput
              ref={thresholdInputRef}
              type='number'
              min='0'
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              onBlur={saveThreshold}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveThreshold();
                if (e.key === 'Escape') setEditingThreshold(false);
              }}
            />
          ) : (
            <>
              <InfoValue>{detail.low_stock_threshold}</InfoValue>
              <EditIcon
                title='Edit threshold'
                onClick={() => {
                  setThresholdInput(String(detail.low_stock_threshold));
                  setEditingThreshold(true);
                }}
              >
                <FiEdit2 size={14} />
              </EditIcon>
            </>
          )}
        </InfoRow>

        {/* ── Expiration date grid ── */}
        <ExpirationSection>
          <ExpirationHeader>
            <ExpirationTitle>Expiration Dates</ExpirationTitle>
            <OmitZerosLabel>
              <input
                type='checkbox'
                checked={omitZeros}
                onChange={(e) => setOmitZeros(e.target.checked)}
              />
              Omit Zeros
            </OmitZerosLabel>
            <HintText>
              {isMobile ? 'Tap a row to edit' : 'Double-click a cell to edit'}
            </HintText>
          </ExpirationHeader>

          {isMobile ? (
            datedBatchesByYear.length === 0 ? (
              <StatusText>No dated batches.</StatusText>
            ) : (
              <MobileBatchList>
                {datedBatchesByYear.map(({ year, batches }) => {
                  const visible = omitZeros
                    ? batches.filter(
                        (b) =>
                          b.quantity > 0 || editingBatchId === b.id
                      )
                    : batches;
                  if (visible.length === 0) return null;
                  return (
                    <YearSection key={year}>
                      <YearHeader>{year}</YearHeader>
                      {visible.map((batch) => {
                        const isEditing = editingBatchId === batch.id;
                        return (
                          <DatedBatchRow
                            key={batch.id}
                            onClick={() => {
                              if (isEditing) return;
                              setEditingBatchId(batch.id);
                              setBatchInput(String(batch.quantity));
                            }}
                          >
                            <BatchDateLabel>
                              {formatBatchMonthDay(batch.expiration_date)}
                            </BatchDateLabel>
                            {isEditing ? (
                              <BatchQtyInput
                                ref={batchInputRef}
                                type='number'
                                min='0'
                                style={{ marginLeft: 'auto' }}
                                value={batchInput}
                                onChange={(e) => setBatchInput(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={() => saveBatchQty(batch.id)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveBatchQty(batch.id);
                                  if (e.key === 'Escape') setEditingBatchId(null);
                                }}
                              />
                            ) : (
                              <>
                                <BatchQtyDisplay>{batch.quantity}</BatchQtyDisplay>
                                <FiEdit2 size={14} color='#6b7b95' />
                              </>
                            )}
                          </DatedBatchRow>
                        );
                      })}
                    </YearSection>
                  );
                })}
              </MobileBatchList>
            )
          ) : (
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
                        const isEditing =
                          editingCell?.year === year &&
                          editingCell?.month === month;

                        if (omitZeros && val === 0 && !isEditing) {
                          return (
                            <GridCell
                              key={month}
                              $value={0}
                              onDoubleClick={() => {
                                setEditingCell({ year, month });
                                setCellInput('0');
                              }}
                            >
                              —
                            </GridCell>
                          );
                        }

                        if (isEditing) {
                          return (
                            <GridCell key={month} $value={val} $editing>
                              <CellInput
                                ref={cellInputRef}
                                type='number'
                                min='0'
                                value={cellInput}
                                onChange={(e) => setCellInput(e.target.value)}
                                onBlur={saveCellEdit}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveCellEdit();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                              />
                            </GridCell>
                          );
                        }

                        return (
                          <GridCell
                            key={month}
                            $value={val}
                            onDoubleClick={() => {
                              setEditingCell({ year, month });
                              setCellInput(String(val));
                            }}
                          >
                            {val}
                          </GridCell>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Grid>
            </GridWrapper>
          )}

          {/* ── No-expiration batches ── */}
          {noExpBatches.length > 0 && (
            <NoExpirationBatches>
              <NoExpTitle>No Expiration Date</NoExpTitle>
              {noExpBatches.map((batch) => (
                <BatchRow key={batch.id}>
                  <span style={{ color: '#6b7b95', fontSize: 13 }}>Qty:</span>
                  {editingBatchId === batch.id ? (
                    <BatchQtyInput
                      ref={batchInputRef}
                      type='number'
                      min='0'
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      onBlur={() => saveBatchQty(batch.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveBatchQty(batch.id);
                        if (e.key === 'Escape') setEditingBatchId(null);
                      }}
                    />
                  ) : (
                    <BatchQtyCell
                      title={isMobile ? 'Tap to edit' : 'Double-click to edit'}
                      onClick={
                        isMobile
                          ? () => {
                              setEditingBatchId(batch.id);
                              setBatchInput(String(batch.quantity));
                            }
                          : undefined
                      }
                      onDoubleClick={
                        isMobile
                          ? undefined
                          : () => {
                              setEditingBatchId(batch.id);
                              setBatchInput(String(batch.quantity));
                            }
                      }
                    >
                      {batch.quantity}
                    </BatchQtyCell>
                  )}
                  <DeleteBatchButton
                    title='Remove batch'
                    onClick={() => handleDeleteBatch(batch.id)}
                  >
                    <FiTrash2 size={13} />
                  </DeleteBatchButton>
                </BatchRow>
              ))}
            </NoExpirationBatches>
          )}

          <AddBatchButton
            onClick={handleAddNoExpBatch}
            disabled={saving}
            title='Add a batch with no expiration date'
          >
            <FiPlus size={13} />
            Add No-Expiration Batch
          </AddBatchButton>
        </ExpirationSection>

        <Divider />

        <DeleteItemButton onClick={handleDeleteItem} disabled={saving}>
          <FiTrash2 size={14} />
          Delete Item
        </DeleteItemButton>
      </Modal>
    </Overlay>
  );
}

ItemDetailModal.propTypes = {
  itemId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onItemDeleted: PropTypes.func,
  onItemUpdated: PropTypes.func,
};
