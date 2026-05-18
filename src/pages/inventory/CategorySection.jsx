import { useEffect, useRef, useState } from 'react';
import {
  FiEdit2,
  FiFilter,
  FiMinusCircle,
  FiMoreVertical,
  FiPlus,
  FiPlusCircle,
} from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

import useIsMobile from '@/common/hooks/useIsMobile';

import { itemsApi } from '../../services/api';
import ItemRow from './ItemRow';

const Wrapper = styled.div`
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

  @media (max-width: 767px) {
    grid-template-columns: 1fr 44px 44px;
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

  @media (max-width: 767px) {
    display: none;
  }
`;

const FilterCell = styled.div`
  position: relative;
  display: grid;
  min-height: 36px;
  border-left: 1px solid #c5d4e8;

  @media (max-width: 767px) {
    display: none;
  }
`;

const FilterTrigger = styled.button`
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
  width: 100%;
  padding: 0;

  svg {
    color: #ffffff;
  }
`;

const FilterPopover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(24, 39, 75, 0.16);
  min-width: 160px;
  z-index: 10;
  overflow: hidden;
`;

const FilterOption = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: ${({ $active }) => ($active ? '#eef1f6' : 'transparent')};
  border: none;
  padding: 10px 14px;
  font-size: 14px;
  color: #1a2b4a;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  cursor: pointer;

  &:hover {
    background: #f0f3f8;
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

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
  }
`;

const KebabCell = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  min-height: 36px;
  border-left: 1px solid #c5d4e8;
`;

const KebabButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  width: 100%;
  height: 100%;
  min-height: 36px;
  display: grid;
  place-items: center;
  cursor: pointer;

  svg {
    color: #ffffff;
  }

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
  }
`;

const KebabPopover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(24, 39, 75, 0.16);
  min-width: 140px;
  z-index: 10;
  overflow: hidden;
`;

const KebabItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: none;
  padding: 10px 14px;
  font-size: 14px;
  color: #1a2b4a;
  font-weight: 600;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #f0f3f8;
  }

  svg {
    color: #2c5e95;
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

  @media (max-width: 767px) {
    font-size: 16px;
  }
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

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
  }
`;

const AddItemCancel = styled.button`
  padding: 8px 10px;
  font-size: 13px;
  color: #6b7b95;
  background: none;
  border: none;
  cursor: pointer;
  &:hover { background: #f0f3f8; }

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
  }
`;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

export default function CategorySection({ category, onItemClick, onItemAdded, onEditCategory }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [saving, setSaving] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMode, setFilterMode] = useState('all');
  const inputRef = useRef(null);
  const kebabRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    if (!kebabOpen) return undefined;
    const handleClickOutside = (e) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target)) {
        setKebabOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [kebabOpen]);

  useEffect(() => {
    if (!filterOpen) return undefined;
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [filterOpen]);

  const visibleItems = filterMode === 'all'
    ? category.items
    : category.items.filter((item) => item.status === filterMode);
  const isFiltered = filterMode !== 'all';

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
        <FilterCell ref={filterRef}>
          <FilterTrigger
            type='button'
            onClick={() => setFilterOpen((o) => !o)}
            aria-haspopup='menu'
            aria-expanded={filterOpen}
          >
            <span>Filter</span>
            <FiFilter size={17} />
          </FilterTrigger>
          {filterOpen && (
            <FilterPopover role='menu'>
              {FILTER_OPTIONS.map((opt) => (
                <FilterOption
                  key={opt.value}
                  type='button'
                  role='menuitemradio'
                  aria-checked={filterMode === opt.value}
                  $active={filterMode === opt.value}
                  onClick={() => {
                    setFilterMode(opt.value);
                    setFilterOpen(false);
                  }}
                >
                  {opt.label}
                </FilterOption>
              ))}
            </FilterPopover>
          )}
        </FilterCell>
        {isMobile && (
          <KebabCell ref={kebabRef}>
            <KebabButton
              type='button'
              onClick={() => setKebabOpen((o) => !o)}
              aria-label='Category actions'
            >
              <FiMoreVertical size={18} />
            </KebabButton>
            {kebabOpen && (
              <KebabPopover>
                <KebabItem
                  type='button'
                  onClick={() => {
                    setKebabOpen(false);
                    onEditCategory?.(category);
                  }}
                >
                  <FiEdit2 size={14} />
                  Edit
                </KebabItem>
                <KebabItem
                  type='button'
                  onClick={() => setKebabOpen(false)}
                >
                  <FiFilter size={14} />
                  Filter
                </KebabItem>
              </KebabPopover>
            )}
          </KebabCell>
        )}
        <CollapseButton type='button' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiMinusCircle size={19} /> : <FiPlusCircle size={19} />}
        </CollapseButton>
      </Header>

      <ItemList $isOpen={isOpen}>
        {visibleItems.length === 0 && !addingItem ? (
          <EmptyMessage>
            {isFiltered ? 'No items match this filter' : 'No items in this category'}
          </EmptyMessage>
        ) : (
          visibleItems.map((item, index) => (
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
