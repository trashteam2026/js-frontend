import { useEffect, useRef, useState } from 'react';
import {
  FiCheck,
  FiEdit2,
  FiFilter,
  FiMinusCircle,
  FiMoreVertical,
  FiPlus,
  FiPlusCircle,
  FiX,
} from 'react-icons/fi';

import useIsMobile from '@/common/hooks/useIsMobile';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { itemsApi } from '../../services/api';
import ItemRow from './ItemRow';
import { SORT_OPTIONS } from './SortMenu';

const Wrapper = styled.div`
  margin-bottom: 18px;
  border: 1px solid #2c5e95;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns:
    minmax(0, 1fr) minmax(76px, 92px) minmax(88px, 108px)
    44px;
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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  min-width: 0;
  border-left: 1px solid #c5d4e8;
  white-space: nowrap;

  svg {
    color: #ffffff;
    flex-shrink: 0;
  }

  @media (max-width: 767px) {
    display: none;
  }
`;

const FilterCell = styled.div`
  display: grid;
  min-height: 36px;
  min-width: 0;
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
  min-width: 0;
  white-space: nowrap;

  svg {
    color: #ffffff;
    flex-shrink: 0;
  }
`;

const PopoverOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 70;
`;

const FilterPopover = styled.div`
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  background: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(24, 39, 75, 0.16);
  width: 220px;
  max-width: calc(100vw - 16px);
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

const ModalOverlay = styled.div`
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

const SortModal = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 24px 28px;
  width: min(360px, calc(100vw - 24px));
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a2b4a;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: #2a4d8f;
  border: none;
  color: #ffffff;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #1e3a6e;
  }

  svg {
    color: #ffffff;
    stroke: #ffffff;
    fill: none;
  }

  svg path,
  svg circle,
  svg line,
  svg polyline {
    stroke: #ffffff;
  }

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
  }
`;

const SortOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SortOptionButton = styled.button`
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid ${({ $active }) => ($active ? '#2a4d8f' : '#d6dce8')};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? '#eef3fa' : '#ffffff')};
  color: #1a2b4a;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '700' : '600')};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #eef3fa;
  }

  svg {
    color: #2a4d8f;
    flex-shrink: 0;
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
  min-width: 0;

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
  min-width: 0;
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
  position: fixed;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  background: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(24, 39, 75, 0.16);
  width: 140px;
  max-width: calc(100vw - 16px);
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
  &:hover {
    background: #eef3fa;
  }
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
  &::placeholder {
    color: #9ba8bc;
  }

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
  &:hover {
    background: #eef3fa;
  }
  &:disabled {
    color: #9ba8bc;
    cursor: default;
  }

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
  &:hover {
    background: #f0f3f8;
  }

  @media (max-width: 767px) {
    min-width: 44px;
    min-height: 44px;
  }
`;

export default function CategorySection({
  category,
  sortBy,
  onSortChange,
  onItemClick,
  onItemAdded,
  onEditCategory,
}) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [saving, setSaving] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [kebabPos, setKebabPos] = useState({ top: 0, left: 0 });
  const inputRef = useRef(null);

  const positionSortMenu = (anchorEl) => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = Math.min(220, window.innerWidth - 16);
    const menuHeight = 176;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );
    const top =
      rect.bottom + 4 + menuHeight > window.innerHeight
        ? Math.max(8, rect.top - menuHeight - 4)
        : rect.bottom + 4;
    setPopoverPos({ top, left });
  };

  const positionKebabMenu = (anchorEl) => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = Math.min(140, window.innerWidth - 16);
    const menuHeight = 88;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8
    );
    const top =
      rect.bottom + 4 + menuHeight > window.innerHeight
        ? Math.max(8, rect.top - menuHeight - 4)
        : rect.bottom + 4;
    setKebabPos({ top, left });
  };

  useEffect(() => {
    if (!sortOpen && !sortModalOpen && !kebabOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setSortOpen(false);
        setSortModalOpen(false);
        setKebabOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sortOpen, sortModalOpen, kebabOpen]);

  const toggleSortMenu = (anchorEl) => {
    if (!sortOpen) {
      positionSortMenu(anchorEl);
    }
    setSortOpen((o) => !o);
  };

  const toggleKebabMenu = (anchorEl) => {
    if (!kebabOpen) {
      positionKebabMenu(anchorEl);
    }
    setKebabOpen((o) => !o);
  };

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
        <FilterCell>
          <FilterTrigger
            type='button'
            onClick={(e) => toggleSortMenu(e.currentTarget)}
            aria-haspopup='menu'
            aria-expanded={sortOpen}
          >
            <span>Filter</span>
            <FiFilter size={17} />
          </FilterTrigger>
        </FilterCell>
        {isMobile && (
          <KebabCell>
            <KebabButton
              type='button'
              onClick={(e) => toggleKebabMenu(e.currentTarget)}
              aria-label='Category actions'
            >
              <FiMoreVertical size={18} />
            </KebabButton>
          </KebabCell>
        )}
        <CollapseButton type='button' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiMinusCircle size={19} /> : <FiPlusCircle size={19} />}
        </CollapseButton>
      </Header>
      {isMobile &&
        kebabOpen &&
        createPortal(
          <PopoverOverlay onClick={() => setKebabOpen(false)}>
            <KebabPopover
              $top={kebabPos.top}
              $left={kebabPos.left}
              onClick={(e) => e.stopPropagation()}
            >
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
                onClick={() => {
                  setSortModalOpen(true);
                  setKebabOpen(false);
                }}
              >
                <FiFilter size={14} />
                Filter
              </KebabItem>
            </KebabPopover>
          </PopoverOverlay>,
          document.body
        )}
      {sortOpen &&
        !isMobile &&
        createPortal(
          <PopoverOverlay onClick={() => setSortOpen(false)}>
            <FilterPopover
              role='menu'
              $top={popoverPos.top}
              $left={popoverPos.left}
              onClick={(e) => e.stopPropagation()}
            >
              {SORT_OPTIONS.map((opt) => (
                <FilterOption
                  key={opt.value}
                  type='button'
                  role='menuitemradio'
                  aria-checked={sortBy === opt.value}
                  $active={sortBy === opt.value}
                  onClick={() => {
                    onSortChange?.(opt.value);
                    setSortOpen(false);
                  }}
                >
                  {opt.label}
                </FilterOption>
              ))}
            </FilterPopover>
          </PopoverOverlay>,
          document.body
        )}
      {isMobile &&
        sortModalOpen &&
        createPortal(
          <ModalOverlay onClick={() => setSortModalOpen(false)}>
            <SortModal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Sort Items</ModalTitle>
                <ModalCloseButton
                  type='button'
                  onClick={() => setSortModalOpen(false)}
                >
                  <FiX color='#ffffff' />
                </ModalCloseButton>
              </ModalHeader>
              <SortOptionList>
                {SORT_OPTIONS.map((opt) => (
                  <SortOptionButton
                    key={opt.value}
                    type='button'
                    $active={sortBy === opt.value}
                    onClick={() => {
                      onSortChange?.(opt.value);
                      setSortModalOpen(false);
                    }}
                  >
                    {opt.label}
                    {sortBy === opt.value && <FiCheck size={16} />}
                  </SortOptionButton>
                ))}
              </SortOptionList>
            </SortModal>
          </ModalOverlay>,
          document.body
        )}

      <ItemList $isOpen={isOpen}>
        {category.items.length === 0 && !addingItem ? (
          <EmptyMessage>No items in this category</EmptyMessage>
        ) : (
          category.items.map((item, index) => (
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
            <AddItemSave
              onClick={handleSave}
              disabled={!newItemName.trim() || saving}
            >
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
  sortBy: PropTypes.string,
  onSortChange: PropTypes.func,
  onItemClick: PropTypes.func,
  onItemAdded: PropTypes.func,
  onEditCategory: PropTypes.func,
};
