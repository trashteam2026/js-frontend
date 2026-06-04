import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiCheck,
  FiEdit2,
  FiPlus,
  FiPrinter,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

import PrintQuantityModal from '@/common/components/PrintQuantityModal';
import { useToast } from '@/common/contexts/ToastContext';
import useIsMobile from '@/common/hooks/useIsMobile';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { batchesApi, itemsApi } from '../../services/api';
import { openBarcodePrintWindow } from '../../utils/barcodePrint';

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
  width: min(440px, calc(100vw - 40px));
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  @media (max-width: 767px) {
    width: min(420px, calc(100vw - 48px));
    max-width: none;
  }
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
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  padding-right: 32px;
`;

const TitleActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TitleInput = styled.input`
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  padding: 4px 8px;
  font-size: 22px;
  font-weight: 700;
  color: #1a2b4a;
  border: 1px solid #2c5e95;
  border-radius: 4px;
  outline: none;
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

const InlineInput = styled.input`
  width: 72px;
  padding: 2px 6px;
  font-size: 15px;
  border: 1px solid #2c5e95;
  border-radius: 4px;
  outline: none;
  color: #1a2b4a;
  &::-webkit-inner-spin-button {
    opacity: 1;
  }

  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

const InlineSelect = styled.select`
  min-width: 220px;
  max-width: 100%;
  padding: 3px 8px;
  font-size: 15px;
  border: 1px solid #2c5e95;
  border-radius: 4px;
  outline: none;
  color: #1a2b4a;
  background: #ffffff;
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
  &::-webkit-inner-spin-button {
    opacity: 1;
  }

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
  &:hover {
    border-color: #2c5e95;
    background: #eef3fa;
  }
`;

const BatchQtyInput = styled.input`
  width: 60px;
  padding: 2px 6px;
  font-size: 14px;
  border: 1px solid #2c5e95;
  border-radius: 3px;
  outline: none;
  color: #1a2b4a;
  &::-webkit-inner-spin-button {
    opacity: 1;
  }

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
  &:hover {
    background: #fdf2f2;
  }
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
  &:hover {
    background: #eef3fa;
  }
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
  &:hover {
    background: #fdf2f2;
    border-color: #c0392b;
  }
`;

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #2c5e95;
  background: #ffffff;
  border: 1px solid #9bb6d8;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  margin-top: 4px;

  &:hover {
    background: #eef3fa;
    border-color: #2c5e95;
  }

  &:disabled {
    color: #9ca3af;
    border-color: #d1d5db;
    cursor: not-allowed;
  }
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const StatusText = styled.p`
  font-size: 14px;
  color: #8a97ad;
  font-style: italic;
  margin-top: 8px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function ItemDetailModal({
  itemId,
  categories,
  onClose,
  onItemDeleted,
  onItemUpdated,
}) {
  const isMobile = useIsMobile();
  const { showToast } = useToast();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  const [omitZeros, setOmitZeros] = useState(false);

  // Item name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const nameInputRef = useRef(null);

  // Expiration grid cell editing
  const [editingCell, setEditingCell] = useState(null); // { year, month }
  const [cellInput, setCellInput] = useState('');
  const cellInputRef = useRef(null);

  // Low-stock threshold editing
  const [editingThreshold, setEditingThreshold] = useState(false);
  const [thresholdInput, setThresholdInput] = useState('');
  const thresholdInputRef = useRef(null);

  // Category editing
  const [editingCategory, setEditingCategory] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');

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
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

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

  // ── Grid cell save ──────────────────────────────────────────────────────────
  const saveCellEdit = useCallback(async () => {
    if (!editingCell || saving) return;
    const { year, month } = editingCell;
    const newQty = Math.max(0, parseInt(cellInput, 10) || 0);

    const monthBatches = (detail.batches || []).filter((b) => {
      if (!b.expiration_date) return false;
      const dateStr = String(b.expiration_date).slice(0, 10);
      const d = new Date(dateStr + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    // Editing a month that holds batches with different expiration days will
    // merge them into a single batch — warn before doing so.
    const distinctDays = new Set(
      monthBatches.map((b) => String(b.expiration_date).slice(0, 10))
    );
    if (newQty > 0 && distinctDays.size > 1) {
      const proceed = window.confirm(
        'This month has multiple batches with different expiration days. ' +
          'Saving will combine them into a single batch. Continue?'
      );
      if (!proceed) return;
    }

    setEditingCell(null);
    setSaving(true);

    // The save fires multiple sequential backend calls; if one fails mid-loop
    // some changes commit and others don't. Track failure so we can always
    // refetch the true DB state afterward and tell the owner the result.
    let failed = false;
    try {
      const targetDate = `${year}-${String(month).padStart(2, '0')}-01`;

      if (monthBatches.length === 0) {
        if (newQty > 0) {
          await batchesApi.create(itemId, {
            expiration_date: targetDate,
            quantity: newQty,
          });
        }
      } else if (newQty === 0) {
        // Setting the cell to 0 removes the batch(es) rather than leaving an
        // un-deletable zero-quantity row in the grid.
        for (const b of monthBatches) {
          await batchesApi.delete(itemId, b.id);
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
    } catch (err) {
      console.error('Save cell error:', err);
      failed = true;
    } finally {
      // Always resync with the backend — a mid-loop failure leaves the DB in a
      // partially-updated state the optimistic grid wouldn't reflect.
      try {
        await fetchDetail();
      } catch (refetchErr) {
        console.error('Refetch after save error:', refetchErr);
      }
      setSaving(false);
    }

    if (failed) {
      showToast(
        "Some changes couldn't be saved. Please review and try again.",
        'error'
      );
    } else {
      showToast('Saved.', 'success');
    }
  }, [editingCell, cellInput, detail, itemId, saving, fetchDetail, showToast]);

  // ── Threshold save ──────────────────────────────────────────────────────────
  const saveThreshold = useCallback(async () => {
    const val = parseInt(thresholdInput, 10);
    setEditingThreshold(false);
    if (isNaN(val) || val < 0) return;

    setSaving(true);
    try {
      const updated = await itemsApi.update(itemId, {
        low_stock_threshold: val,
      });
      onItemUpdated?.(updated);
      await fetchDetail();
    } catch (err) {
      console.error('Update threshold error:', err);
    } finally {
      setSaving(false);
    }
  }, [thresholdInput, itemId, onItemUpdated, fetchDetail]);

  const saveName = useCallback(async () => {
    const nextName = nameInput.trim();

    if (!nextName || nextName === detail?.name || saving) {
      setNameInput(detail?.name || '');
      setEditingName(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await itemsApi.update(itemId, { name: nextName });
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
      onItemUpdated?.(updated);
      setEditingName(false);
    } catch (err) {
      console.error('Update item name error:', err);
    } finally {
      setSaving(false);
    }
  }, [detail?.name, itemId, nameInput, onItemUpdated, saving]);

  const cancelNameEdit = useCallback(() => {
    setNameInput(detail?.name || '');
    setEditingName(false);
  }, [detail?.name]);

  const saveCategory = useCallback(async () => {
    const nextCategoryId =
      categoryInput === '' ? null : Number.parseInt(categoryInput, 10);
    const currentCategoryId = detail?.category_id || null;

    setEditingCategory(false);
    if (nextCategoryId === currentCategoryId || saving) return;

    setSaving(true);
    try {
      const updated = await itemsApi.update(itemId, {
        category_id: nextCategoryId,
      });
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
      onItemUpdated?.(updated);
    } catch (err) {
      console.error('Update item category error:', err);
    } finally {
      setSaving(false);
    }
  }, [categoryInput, detail?.category_id, itemId, onItemUpdated, saving]);

  const cancelCategoryEdit = useCallback(() => {
    setCategoryInput(detail?.category_id ? String(detail.category_id) : '');
    setEditingCategory(false);
  }, [detail?.category_id]);

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

  const handlePrintBarcodes = useCallback(
    (copies) => {
      if (!detail?.barcodes?.length) return;

      openBarcodePrintWindow({
        itemName: detail.name,
        categoryName: detail.category_name,
        barcodes: detail.barcodes,
        copies,
      });
      setShowPrintOptions(false);
    },
    [detail]
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
          <StatusText>Loading…</StatusText>
        </Modal>
      </Overlay>
    );
  }

  if (error || !detail) {
    return (
      <Overlay onClick={onClose}>
        <Modal onClick={(e) => e.stopPropagation()}>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
          <StatusText style={{ color: '#c0392b' }}>
            {error || 'Item not found'}
          </StatusText>
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

        <TitleRow>
          {editingName ? (
            <TitleInput
              ref={nameInputRef}
              value={nameInput}
              disabled={saving}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveName();
                if (e.key === 'Escape') cancelNameEdit();
              }}
            />
          ) : (
            <Title>{detail.name}</Title>
          )}
          <TitleActions>
            {editingName ? (
              <>
                <EditIcon
                  type='button'
                  title='Save item name'
                  onClick={saveName}
                  disabled={saving || !nameInput.trim()}
                >
                  <FiCheck size={16} />
                </EditIcon>
                <EditIcon
                  type='button'
                  title='Cancel name edit'
                  onClick={cancelNameEdit}
                  disabled={saving}
                >
                  <FiX size={16} />
                </EditIcon>
              </>
            ) : (
              <EditIcon
                type='button'
                title='Edit item name'
                onClick={() => {
                  setNameInput(detail.name);
                  setEditingName(true);
                }}
              >
                <FiEdit2 size={16} />
              </EditIcon>
            )}
          </TitleActions>
        </TitleRow>

        <InfoRow>
          <InfoLabel>Category:</InfoLabel>
          {editingCategory ? (
            <>
              <InlineSelect
                value={categoryInput}
                disabled={saving}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveCategory();
                  if (e.key === 'Escape') cancelCategoryEdit();
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </InlineSelect>
              <EditIcon
                type='button'
                title='Save category'
                onClick={saveCategory}
                disabled={saving}
              >
                <FiCheck size={14} />
              </EditIcon>
              <EditIcon
                type='button'
                title='Cancel category edit'
                onClick={cancelCategoryEdit}
                disabled={saving}
              >
                <FiX size={14} />
              </EditIcon>
            </>
          ) : (
            <>
              <InfoValue>{detail.category_name || 'Uncategorized'}</InfoValue>
              <EditIcon
                type='button'
                title='Edit category'
                onClick={() => {
                  setCategoryInput(
                    detail.category_id ? String(detail.category_id) : ''
                  );
                  setEditingCategory(true);
                }}
              >
                <FiEdit2 size={14} />
              </EditIcon>
            </>
          )}
        </InfoRow>

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
            (() => {
              const hasAnyQty = gridData.years.some((y) =>
                gridData.months.some((m) => (gridData.yearMap[y]?.[m] || 0) > 0)
              );
              if (omitZeros && !hasAnyQty) {
                return <StatusText>No dated batches.</StatusText>;
              }
              return (
                <MobileBatchList>
                  {gridData.years.map((year) => {
                    const cells = gridData.months
                      .map((month) => ({
                        month,
                        val: gridData.yearMap[year]?.[month] || 0,
                      }))
                      .filter(({ month, val }) =>
                        omitZeros
                          ? val > 0 ||
                            (editingCell?.year === year &&
                              editingCell?.month === month)
                          : true
                      );
                    if (cells.length === 0) return null;
                    return (
                      <YearSection key={year}>
                        <YearHeader>{year}</YearHeader>
                        {cells.map(({ month, val }) => {
                          const isEditing =
                            editingCell?.year === year &&
                            editingCell?.month === month;
                          return (
                            <DatedBatchRow
                              key={month}
                              onClick={() => {
                                if (isEditing) return;
                                setEditingCell({ year, month });
                                setCellInput(String(val));
                              }}
                            >
                              <BatchDateLabel>
                                {MONTH_NAMES_SHORT[month - 1]} 1
                              </BatchDateLabel>
                              {isEditing ? (
                                <BatchQtyInput
                                  ref={cellInputRef}
                                  type='number'
                                  min='0'
                                  style={{ marginLeft: 'auto' }}
                                  value={cellInput}
                                  onChange={(e) => setCellInput(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onBlur={saveCellEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveCellEdit();
                                    if (e.key === 'Escape')
                                      setEditingCell(null);
                                  }}
                                />
                              ) : (
                                <>
                                  <BatchQtyDisplay>{val}</BatchQtyDisplay>
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
              );
            })()
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

        <FooterActions>
          <PrintButton
            type='button'
            onClick={() => setShowPrintOptions(true)}
            disabled={saving || !detail.barcodes?.length}
            title={
              detail.barcodes?.length
                ? 'Print barcode labels'
                : 'No barcodes are mapped to this item'
            }
          >
            <FiPrinter size={14} />
            Print Barcodes
          </PrintButton>
          <DeleteItemButton onClick={handleDeleteItem} disabled={saving}>
            <FiTrash2 size={14} />
            Delete Item
          </DeleteItemButton>
        </FooterActions>
        {showPrintOptions && (
          <PrintQuantityModal
            onClose={() => setShowPrintOptions(false)}
            onPrint={handlePrintBarcodes}
          />
        )}
      </Modal>
    </Overlay>
  );
}

ItemDetailModal.propTypes = {
  itemId: PropTypes.number.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  onClose: PropTypes.func.isRequired,
  onItemDeleted: PropTypes.func,
  onItemUpdated: PropTypes.func,
};

ItemDetailModal.defaultProps = {
  categories: [],
};
