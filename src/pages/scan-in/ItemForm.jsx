import { useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowLeft, FiEdit2, FiMinus, FiPlus } from 'react-icons/fi';

import {
  findCategoryForItem,
  getAllItemNames,
} from '@/common/utils/volunteerInventory';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const FormWrapper = styled.div`
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 56px;
`;

const FloatingBack = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2a4d8f;
  color: #ffffff;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 3;

  &:hover {
    background-color: #1e3a6e;
  }

  svg {
    color: #ffffff;
    stroke: #ffffff;
  }

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
  }
`;

const BarcodeNote = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  word-break: break-all;
`;

const Field = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const FieldLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a2b4a;
`;

const EditButton = styled.button`
  background: transparent;
  border: none;
  color: #2a4d8f;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const TextInput = styled.input`
  font-size: 1rem;
  padding: 10px 12px;
  border: 1px solid #c7d2e3;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  color: #1a2b4a;
  background-color: #ffffff;
  outline: none;

  &:focus {
    border-color: #2a4d8f;
  }
`;

const SelectInput = styled.select`
  font-size: 1rem;
  padding: 10px 12px;
  border: 1px solid #c7d2e3;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  color: #1a2b4a;
  background-color: ${({ disabled }) => (disabled ? '#eef2f8' : '#ffffff')};
  outline: none;

  &:focus {
    border-color: #2a4d8f;
  }

  &:disabled {
    color: #6b7280;
    cursor: not-allowed;
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
  background-color: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 6px;
  box-shadow: 0 6px 16px rgba(26, 43, 74, 0.08);
  max-height: 180px;
  overflow-y: auto;
  z-index: 4;
  margin-top: 4px;
`;

const DropdownItem = styled.li`
  padding: 8px 12px;
  font-size: 0.95rem;
  color: #1a2b4a;
  cursor: pointer;

  &:hover {
    background-color: #eef2f8;
  }
`;

const DateRow = styled.div`
  display: flex;
  gap: 10px;
`;

const DateSelect = styled(SelectInput)`
  text-align: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #1a2b4a;
  font-weight: 600;
  cursor: pointer;

  input {
    width: 16px;
    height: 16px;
    accent-color: #2a4d8f;
  }
`;

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 4px 0;
`;

const QtyButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #2a4d8f;
  color: #ffffff;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #1e3a6e;
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

const QtyValue = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a2b4a;
  min-width: 32px;
  text-align: center;
`;

const ErrorBox = styled.div`
  padding: 10px 12px;
  border-radius: 6px;
  background-color: #fdecec;
  border: 1px solid #f1b0b0;
  color: #b00020;
  font-size: 0.9rem;
  text-align: center;
`;

const SubmitButton = styled.button`
  margin-top: 4px;
  padding: 12px 24px;
  background-color: #2a4d8f;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #1e3a6e;
  }
`;

export default function ItemForm({
  mode,
  initialBarcode,
  initialCategory,
  initialCategoryId,
  initialName,
  lookupSource,
  categoryOptions,
  onSubmit,
  onCancel,
}) {
  const nameRef = useRef(null);
  const categoryRef = useRef(null);
  const isDatabaseMatch = mode === 'scanned' && lookupSource === 'database';
  const [name, setName] = useState(initialName || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [noExpiration, setNoExpiration] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [nameFocused, setNameFocused] = useState(false);
  const [categoryMatchedByName, setCategoryMatchedByName] = useState(false);
  const [error, setError] = useState('');

  const allItems = useMemo(
    () => getAllItemNames(categoryOptions),
    [categoryOptions]
  );

  const filteredItems = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8);
    return allItems
      .filter((n) => n.toLowerCase().includes(q) && n.toLowerCase() !== q)
      .slice(0, 8);
  }, [allItems, name]);

  const selectedCategory = useMemo(
    () =>
      (categoryOptions || []).find(
        (option) => String(option.id) === selectedCategoryId
      ) || null,
    [categoryOptions, selectedCategoryId]
  );

  const yearOptions = useMemo(
    () => Array.from({ length: 76 }, (_, index) => 2025 + index),
    []
  );

  useEffect(() => {
    if (selectedCategoryId || !categoryOptions?.length) return;

    const initialId =
      initialCategoryId === undefined ||
      initialCategoryId === null ||
      initialCategoryId === ''
        ? null
        : String(initialCategoryId);
    const byId = initialId
      ? categoryOptions.find((option) => String(option.id) === initialId)
      : null;
    const byName = initialCategory
      ? categoryOptions.find(
          (option) =>
            option.name.trim().toLowerCase() ===
            initialCategory.trim().toLowerCase()
        )
      : null;
    const initialMatch = byId || byName;

    if (initialMatch) {
      setSelectedCategoryId(String(initialMatch.id));
    }
  }, [categoryOptions, initialCategory, initialCategoryId, selectedCategoryId]);

  const focusName = () => {
    nameRef.current?.focus();
  };

  const focusCategory = () => {
    categoryRef.current?.focus();
  };

  const pickName = (value) => {
    setName(value);
    const existingCategory = findCategoryForItem(value, categoryOptions);
    if (existingCategory) {
      const match = (categoryOptions || []).find(
        (option) =>
          option.name.trim().toLowerCase() === existingCategory.toLowerCase()
      );
      setSelectedCategoryId(match ? String(match.id) : '');
      setCategoryMatchedByName(Boolean(match));
    } else {
      setCategoryMatchedByName(false);
    }
    setNameFocused(false);
    setError('');
  };

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter an item name');
      focusName();
      return;
    }
    if (!selectedCategoryId || !selectedCategory) {
      setError('Please pick an existing category');
      focusCategory();
      return;
    }
    if (!noExpiration && (!month || !year)) {
      setError('Must input expiration date');
      return;
    }
    const m = noExpiration ? null : parseInt(month, 10);
    const y = noExpiration ? null : parseInt(year, 10);

    try {
      await onSubmit({
        name: trimmedName,
        category: selectedCategory.name,
        categoryId: selectedCategory.id,
        expirationMonth: m,
        expirationYear: y,
        noExpiration,
        quantity,
        barcode: initialBarcode || null,
      });
    } catch (submitError) {
      setError(submitError.message || 'Failed to save item');
    }
  };

  const nameLabel = mode === 'scanned' ? 'Recognized Item' : 'Item';
  const categoryLocked = Boolean(
    (isDatabaseMatch || categoryMatchedByName) && selectedCategoryId
  );
  const nameLocked = isDatabaseMatch;

  return (
    <>
      <FloatingBack
        type='button'
        onClick={onCancel}
        aria-label='Cancel and return to scanner'
      >
        <FiArrowLeft size={20} />
      </FloatingBack>

      <FormWrapper as='form' onSubmit={handleSubmit}>
        {mode === 'scanned' && initialBarcode && (
          <BarcodeNote>Barcode: {initialBarcode}</BarcodeNote>
        )}

        <Field>
          <FieldHeaderRow>
            <FieldLabel htmlFor='item-name'>{nameLabel}</FieldLabel>
            {mode === 'scanned' && !nameLocked && (
              <EditButton type='button' onClick={focusName}>
                Edit <FiEdit2 size={12} />
              </EditButton>
            )}
          </FieldHeaderRow>
          <TextInput
            id='item-name'
            ref={nameRef}
            type='text'
            value={name}
            readOnly={nameLocked}
            onChange={(e) => {
              setName(e.target.value);
              setCategoryMatchedByName(false);
              setError('');
            }}
            onFocus={() => {
              if (!nameLocked) {
                setNameFocused(true);
              }
            }}
            onBlur={() => setTimeout(() => setNameFocused(false), 150)}
            autoComplete='off'
            placeholder={
              mode === 'manual'
                ? 'Type item name'
                : mode === 'scanned' && !name
                  ? 'Enter item name'
                  : ''
            }
          />
          {nameLocked && (
            <BarcodeNote>This item already exists in inventory.</BarcodeNote>
          )}
          {mode === 'scanned' && !name && (
            <BarcodeNote>
              Item not recognized. Please manually enter the item name.
            </BarcodeNote>
          )}
          {nameFocused && filteredItems.length > 0 && (
            <Dropdown role='listbox'>
              {filteredItems.map((item) => (
                <DropdownItem
                  key={item}
                  role='option'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickName(item);
                  }}
                >
                  {item}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </Field>

        <Field>
          <FieldHeaderRow>
            <FieldLabel htmlFor='item-category'>Category</FieldLabel>
          </FieldHeaderRow>
          <SelectInput
            id='item-category'
            ref={categoryRef}
            value={selectedCategoryId}
            disabled={Boolean(categoryLocked)}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              setCategoryMatchedByName(false);
              setError('');
            }}
          >
            <option value=''>Choose a category</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </SelectInput>
          {categoryLocked && (
            <BarcodeNote>This item already exists in inventory.</BarcodeNote>
          )}
        </Field>

        <Field>
          <FieldLabel>Expiration Date</FieldLabel>
          <CheckboxLabel>
            <input
              type='checkbox'
              checked={noExpiration}
              onChange={(e) => {
                setNoExpiration(e.target.checked);
                setError('');
              }}
            />
            No expiration date
          </CheckboxLabel>
          <DateRow>
            <DateSelect
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setError('');
              }}
              aria-label='Expiration month'
              disabled={noExpiration}
            >
              <option value=''>MM</option>
              {Array.from({ length: 12 }, (_, index) => {
                const value = String(index + 1).padStart(2, '0');
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </DateSelect>
            <DateSelect
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setError('');
              }}
              aria-label='Expiration year'
              disabled={noExpiration}
            >
              <option value=''>YYYY</option>
              {yearOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </DateSelect>
          </DateRow>
        </Field>

        <Field>
          <FieldLabel>Quantity</FieldLabel>
          <QuantityRow>
            <QtyButton
              type='button'
              onClick={decrement}
              disabled={quantity <= 1}
              aria-label='Decrease quantity'
            >
              <FiMinus size={18} />
            </QtyButton>
            <QtyValue>{quantity}</QtyValue>
            <QtyButton
              type='button'
              onClick={increment}
              aria-label='Increase quantity'
            >
              <FiPlus size={18} />
            </QtyButton>
          </QuantityRow>
        </Field>

        {error && <ErrorBox>{error}</ErrorBox>}

        <SubmitButton type='submit'>Add to Inventory</SubmitButton>
      </FormWrapper>
    </>
  );
}

ItemForm.propTypes = {
  mode: PropTypes.oneOf(['scanned', 'manual']).isRequired,
  initialBarcode: PropTypes.string,
  initialCategory: PropTypes.string,
  initialCategoryId: PropTypes.number,
  initialName: PropTypes.string,
  lookupSource: PropTypes.string,
  categoryOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })
  ),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

ItemForm.defaultProps = {
  initialBarcode: null,
  initialCategory: '',
  initialCategoryId: null,
  initialName: '',
  lookupSource: null,
  categoryOptions: [],
};
