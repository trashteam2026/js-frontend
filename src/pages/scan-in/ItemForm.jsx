import { useMemo, useRef, useState } from 'react';
import { FiArrowLeft, FiEdit2, FiMinus, FiPlus } from 'react-icons/fi';

import {
  findCategoryForItem,
  getAllCategoryNames,
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

const DateInput = styled(TextInput)`
  text-align: center;
  letter-spacing: 2px;
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
  const [manualCategory, setManualCategory] = useState(initialCategory || '');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [nameFocused, setNameFocused] = useState(false);
  const [categoryFocused, setCategoryFocused] = useState(false);
  const [categoryMatchedByName, setCategoryMatchedByName] = useState(false);
  const [error, setError] = useState('');

  const allItems = useMemo(
    () => getAllItemNames(categoryOptions),
    [categoryOptions]
  );
  const allCategories = useMemo(
    () => getAllCategoryNames(categoryOptions),
    [categoryOptions]
  );
  const category = manualCategory;

  const filteredItems = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return allItems.slice(0, 8);
    return allItems
      .filter((n) => n.toLowerCase().includes(q) && n.toLowerCase() !== q)
      .slice(0, 8);
  }, [allItems, name]);

  const filteredCategories = useMemo(() => {
    const q = category.trim().toLowerCase();
    if (!q) return allCategories.slice(0, 8);
    return allCategories
      .filter((c) => c.toLowerCase().includes(q) && c.toLowerCase() !== q)
      .slice(0, 8);
  }, [allCategories, category]);

  const currentYear = new Date().getFullYear();

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
      setManualCategory(existingCategory);
      setCategoryMatchedByName(true);
    } else {
      setCategoryMatchedByName(false);
    }
    setNameFocused(false);
    setError('');
  };

  const pickCategory = (value) => {
    setManualCategory(value);
    setCategoryFocused(false);
    setError('');
  };

  const handleMonthChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMonth(cleaned);
    setError('');
  };

  const handleYearChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYear(cleaned);
    setError('');
  };

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    if (!trimmedName) {
      setError('Please enter an item name');
      focusName();
      return;
    }
    if (!isDatabaseMatch && !trimmedCategory) {
      setError('Please choose a category for this new item');
      focusCategory();
      return;
    }
    if (!month || !year) {
      setError('Must input expiration date');
      return;
    }
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (Number.isNaN(m) || m < 1 || m > 12) {
      setError('Month must be between 1 and 12');
      return;
    }
    if (Number.isNaN(y) || y < currentYear) {
      setError(`Year must be ${currentYear} or later`);
      return;
    }

    try {
      await onSubmit({
        name: trimmedName,
        category: trimmedCategory || null,
        expirationMonth: m,
        expirationYear: y,
        quantity,
        barcode: initialBarcode || null,
      });
    } catch (submitError) {
      setError(submitError.message || 'Failed to save item');
    }
  };

  const nameLabel = mode === 'scanned' ? 'Recognized Item' : 'Item';
  const categoryLocked = isDatabaseMatch || categoryMatchedByName;
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
            {!categoryLocked && (
              <EditButton type='button' onClick={focusCategory}>
                Edit <FiEdit2 size={12} />
              </EditButton>
            )}
          </FieldHeaderRow>
          <TextInput
            id='item-category'
            ref={categoryRef}
            type='text'
            value={category}
            readOnly={categoryLocked}
            onChange={(e) => {
              setManualCategory(e.target.value);
              setError('');
            }}
            onFocus={() => {
              if (!categoryLocked) {
                setCategoryFocused(true);
              }
            }}
            onBlur={() => setTimeout(() => setCategoryFocused(false), 150)}
            autoComplete='off'
            placeholder={categoryLocked ? '' : 'Choose a category'}
          />
          {categoryLocked && (
            <BarcodeNote>This item already exists in inventory.</BarcodeNote>
          )}
          {!categoryLocked &&
            categoryFocused &&
            filteredCategories.length > 0 && (
              <Dropdown role='listbox'>
                {filteredCategories.map((c) => (
                  <DropdownItem
                    key={c}
                    role='option'
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickCategory(c);
                    }}
                  >
                    {c}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
        </Field>

        <Field>
          <FieldLabel>Expiration Date</FieldLabel>
          <DateRow>
            <DateInput
              type='text'
              inputMode='numeric'
              placeholder='MM'
              value={month}
              onChange={handleMonthChange}
              aria-label='Expiration month'
            />
            <DateInput
              type='text'
              inputMode='numeric'
              placeholder='YYYY'
              value={year}
              onChange={handleYearChange}
              aria-label='Expiration year'
            />
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
  initialName: '',
  lookupSource: null,
  categoryOptions: [],
};
