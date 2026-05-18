import { useEffect, useMemo, useRef, useState } from 'react';
import { FiEdit2, FiFilter, FiMinusCircle, FiPlus, FiPlusCircle } from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

import { itemsApi } from '../../services/api';
import ItemRow from './ItemRow';

const Wrapper = styled.div`
  position: relative;
  margin-bottom: 18px;
  border: 1px solid #2c5e95;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 92px 108px 44px;
  align-items: center;
  min-height: 36px;
  background-color: #2c5e95;
  color: #ffffff;
  user-select: none;

  &,
  & * {
    color: #ffffff;
  }
`;

const CategoryName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  padding: 0 10px;
`;

const ActionCell = styled.button`
  border: none;
  background: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 36px;
  border-left: 1px solid #c5d4e8;

  svg {
    color: #ffffff;
  }
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 36px;
  display: grid;
  place-items: center;
  border-left: 1px solid #c5d4e8;

  svg {
    color: #ffffff;
  }
`;

const ItemList = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

const EmptyMessage = styled.div`
  padding: 10px;
  font-size: 14px;
  color: #1e293b;
  border-top: 1px solid #d8e1ee;
  background: #d3deec;
`;

const AddItemRow = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px solid #d8e1ee;
  background: #f8fafc;
  min-height: 36px;
`;

const AddItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #2c5e95;
  background: none;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 500;
  &:hover { background: #eef3fa; }
`;

const AddItemInput = styled.input`
  flex: 1;
  border: none;
  border-right: 1px solid #d8e1ee;
  background: transparent;
  font-size: 14px;
  color: #1a2b4a;
  padding: 8px 12px;
  outline: none;
  &::placeholder { color: #9ba8bc; }
`;

const AddItemSave = styled.button`
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #2c5e95;
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: #eef3fa; }
  &:disabled { color: #9ba8bc; cursor: default; }
`;

const AddItemCancel = styled.button`
  padding: 8px 10px;
  font-size: 13px;
  color: #6b7b95;
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: #f0f3f8; }
`;

const FilterMenu = styled.div`
  position: absolute;
  top: 36px;
  right: 44px;
  min-width: 170px;
  background: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(24, 39, 75, 0.16);
  z-index: 10;
  padding: 4px 0;
`;

const FilterMenuItem = styled.button`
  width: 100%;
  border: none;
  background: ${({ $active }) => ($active ? '#e9f1fb' : 'transparent')};
  color: ${({ $active }) => ($active ? '#2c5e95' : '#374151')} !important;
  cursor: pointer;
  display: block;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  padding: 9px 14px;
  text-align: left;

  &:hover {
    background: #f3f6fb;
  }
`;

const FILTER_OPTIONS = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'stock_desc', label: 'Stock (High to Low)' },
  { value: 'stock_asc', label: 'Stock (Low to High)' },
];

export default function CategorySection({
  category,
  onItemClick,
  onItemAdded,
  onEditCategory,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [categorySort, setCategorySort] = useState('alphabetical');
  const inputRef = useRef(null);
  const filterButtonRef = useRef(null);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    if (!showFilterMenu) return undefined;

    const handleClickOutside = (e) => {
      const clickedButton = filterButtonRef.current?.contains(e.target);
      const clickedMenu = filterMenuRef.current?.contains(e.target);
      if (!clickedButton && !clickedMenu) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

  const sortedItems = useMemo(() => {
    const items = [...category.items];

    if (categorySort === 'stock_desc') {
      items.sort((a, b) => b.total_quantity - a.total_quantity);
    } else if (categorySort === 'stock_asc') {
      items.sort((a, b) => a.total_quantity - b.total_quantity);
    } else {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [category.items, categorySort]);

  const startAdding = () => {
    setAddingItem(true);
    setNewItemName('');
    // Focus after render
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const cancelAdding = () => {
    setAddingItem(false);
    setNewItemName('');
  };

  const handleSave = async () => {
    const name = newItemName.trim();
    if (!name || saving) return;

    setSaving(true);
    try {
      const newItem = await itemsApi.create({
        name,
        category_id: category.id,
        low_stock_threshold: 20,
      });
      onItemAdded?.(newItem);
      setAddingItem(false);
      setNewItemName('');
    } catch (err) {
      console.error('Add item error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper>
      <Header>
        <CategoryName>{category.name}</CategoryName>
        <ActionCell type='button' onClick={() => onEditCategory?.(category)}>
          <span>Edit</span>
          <FiEdit2 size={15} />
        </ActionCell>
        <ActionCell
          ref={filterButtonRef}
          type='button'
          onClick={() => setShowFilterMenu((open) => !open)}
        >
          <span>Filter</span>
          <FiFilter size={17} />
        </ActionCell>
        <CollapseButton type='button' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiMinusCircle size={19} /> : <FiPlusCircle size={19} />}
        </CollapseButton>
      </Header>
      {showFilterMenu && (
        <FilterMenu ref={filterMenuRef}>
          {FILTER_OPTIONS.map((option) => (
            <FilterMenuItem
              key={option.value}
              type='button'
              $active={categorySort === option.value}
              onClick={() => {
                setCategorySort(option.value);
                setShowFilterMenu(false);
              }}
            >
              {option.label}
            </FilterMenuItem>
          ))}
        </FilterMenu>
      )}

      <ItemList $isOpen={isOpen}>
        {category.items.length === 0 && !addingItem ? (
          <EmptyMessage>No items in this category</EmptyMessage>
        ) : (
          sortedItems.map((item, index) => (
            <ItemRow
              key={item.id}
              item={item}
              index={index}
              onClick={onItemClick}
            />
          ))
        )}

        {addingItem ? (
          <AddItemRow>
            <AddItemInput
              ref={inputRef}
              placeholder='Item name…'
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') cancelAdding();
              }}
            />
            <AddItemSave onClick={handleSave} disabled={!newItemName.trim() || saving}>
              Add
            </AddItemSave>
            <AddItemCancel onClick={cancelAdding}>✕</AddItemCancel>
          </AddItemRow>
        ) : (
          <AddItemRow>
            <AddItemButton type='button' onClick={startAdding}>
              <FiPlus size={14} />
              Add Item
            </AddItemButton>
          </AddItemRow>
        )}
      </ItemList>
    </Wrapper>
  );
}

CategorySection.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
  }).isRequired,
  onItemClick: PropTypes.func,
  onItemAdded: PropTypes.func,
  onEditCategory: PropTypes.func,
};
