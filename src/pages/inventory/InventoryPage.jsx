import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser } from 'react-icons/fi';

import PantryLogo from '@/assets/icons/image-1.svg';
import CashRegisterIcon from '@/assets/icons/tabler-icon-cash-register.svg?react';
import HistoryIcon from '@/assets/icons/tabler-icon-history.svg?react';
import TableRowIcon from '@/assets/icons/tabler-icon-table-row.svg?react';
import styled from 'styled-components';

import { categoriesApi, itemsApi } from '../../services/api';
import AddCategoryModal from './AddCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import CategorySection from './CategorySection';
import ItemDetailModal from './ItemDetailModal';
import ProfileDropdown from './ProfileDropdown';
import SortMenu from './SortMenu';
import TabBar from './TabBar';

const PageWrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ececec;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 24px;
  background-color: #ececec;
  flex-shrink: 0;
`;

const LogoImg = styled.img`
  width: 43px;
  height: 43px;
  flex-shrink: 0;
`;

const PageTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  white-space: nowrap;
  line-height: 1;
`;

const SearchWrapper = styled.div`
  flex: 0 1 455px;
  display: flex;
  margin-left: 2px;
`;

const SearchPill = styled.div`
  width: 100%;
  background-color: #d4dce8;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  height: 40px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #374151;
  outline: none;
  min-width: 0;
  padding-right: 8px;

  &::placeholder {
    color: #4b5563;
    opacity: 1;
  }
`;

const SearchButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 9999px;
  background: #2c5e95;
  color: #ffffff;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;

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
`;

const NavIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: auto;
`;

const NavIcon = styled.button`
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  color: #4e4b57;

  &:hover {
    background: transparent;
  }

  svg {
    width: 24px;
    height: 24px;
    color: currentColor;
    stroke: currentColor;
  }

  svg path,
  svg circle,
  svg line,
  svg polyline {
    stroke: currentColor;
  }
`;

const ActiveNavIcon = styled(NavIcon)`
  background: transparent;
  color: #2c5e95;

  &:hover {
    background: transparent;
  }

  svg,
  svg path,
  svg circle,
  svg line,
  svg polyline {
    color: #2c5e95;
    stroke: #2c5e95 !important;
  }
`;

const ProfileButton = styled.button`
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 9999px;
  background-color: #2c5e95;
  color: #ffffff;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;

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
`;

const ProfileWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 24px 22px;
`;

export default function InventoryPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('food');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileWrapperRef = useRef(null);

  useEffect(() => {
    if (!showProfileDropdown) return undefined;
    const handleClickOutside = (e) => {
      if (
        profileWrapperRef.current &&
        !profileWrapperRef.current.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  const loadData = useCallback(async () => {
    try {
      const [cats, its] = await Promise.all([
        categoriesApi.getAll(),
        itemsApi.getAll(),
      ]);
      setCategories(cats);
      setItems(its);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Merge items into their categories
  const categoriesWithItems = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        items: items.filter((item) => item.category_id === cat.id),
      })),
    [categories, items]
  );

  const foodCategories = useMemo(
    () => categoriesWithItems.filter((c) => c.parent_group === 'food'),
    [categoriesWithItems]
  );

  const nonFoodCategories = useMemo(
    () => categoriesWithItems.filter((c) => c.parent_group === 'non_food'),
    [categoriesWithItems]
  );

  const filteredCategories = useMemo(() => {
    let cats = categoriesWithItems;

    if (activeTab === 'food') {
      cats = cats.filter((c) => c.parent_group === 'food');
    } else if (activeTab === 'non_food') {
      cats = cats.filter((c) => c.parent_group === 'non_food');
    }

    if (selectedCategoryId) {
      cats = cats.filter((c) => c.id === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cats = cats
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            item.name.toLowerCase().includes(query)
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    cats = cats.map((cat) => {
      const sortedItems = [...cat.items];
      if (sortBy === 'alphabetical') {
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'stock_asc') {
        sortedItems.sort((a, b) => a.total_quantity - b.total_quantity);
      } else if (sortBy === 'stock_desc') {
        sortedItems.sort((a, b) => b.total_quantity - a.total_quantity);
      }
      return { ...cat, items: sortedItems };
    });

    return cats;
  }, [categoriesWithItems, activeTab, selectedCategoryId, searchQuery, sortBy]);

  const handleItemClick = (item) => {
    setSelectedItemId(item.id);
  };

  // Called when an item is added from CategorySection
  const handleItemAdded = (newItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  // Called when ItemDetailModal deletes an item
  const handleItemDeleted = (deletedId) => {
    setItems((prev) => prev.filter((item) => item.id !== deletedId));
    setSelectedItemId(null);
  };

  // Refresh a single item's data in state (e.g. after threshold edit)
  const handleItemUpdated = (updatedItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item))
    );
  };

  // Refresh all items when modal closes (picks up batch qty changes)
  const handleModalClose = useCallback(async () => {
    setSelectedItemId(null);
    try {
      const updatedItems = await itemsApi.getAll();
      setItems(updatedItems);
    } catch (err) {
      console.error('Failed to refresh items:', err);
    }
  }, []);

  const handleRenameCategory = async (newName) => {
    if (!categoryToEdit) return;
    try {
      const updated = await categoriesApi.update(categoryToEdit.id, { name: newName });
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryToEdit.id ? { ...c, name: updated.name ?? newName } : c))
      );
      setCategoryToEdit(null);
    } catch (err) {
      console.error('Rename category error:', err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await categoriesApi.delete(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setItems((prev) => prev.filter((i) => i.category_id !== categoryToDelete.id));
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  const handleAddCategory = async (data) => {
    try {
      const newCat = await categoriesApi.create({
        name: data.name,
        parent_group: data.parentGroup,
      });
      setCategories((prev) => [...prev, { ...newCat, items: [] }]);
      setShowAddCategory(false);
    } catch (err) {
      console.error('Add category error:', err);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 60 }}>
          Loading inventory…
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TopBar>
        <LogoImg src={PantryLogo} alt='New Trier Township' />
        <PageTitle>New Trier Township Food Pantry Inventory</PageTitle>
        <SearchWrapper>
          <SearchPill>
            <SearchInput
              type='text'
              placeholder='Search for an item...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchButton title='Search'>
              <FiSearch size={21} color='#ffffff' />
            </SearchButton>
          </SearchPill>
        </SearchWrapper>
        <NavIcons>
          <ActiveNavIcon title='Inventory'>
            <TableRowIcon />
          </ActiveNavIcon>
          <NavIcon title='Check In'>
            <CashRegisterIcon style={{ color: '#4e4b57' }} />
          </NavIcon>
          <NavIcon title='Activity' onClick={() => navigate('/activity')}>
            <HistoryIcon style={{ color: '#4e4b57' }} />
          </NavIcon>
          <ProfileWrapper ref={profileWrapperRef}>
            <ProfileButton
              title='Profile'
              onClick={() => setShowProfileDropdown((open) => !open)}
            >
              <FiUser size={24} color='#ffffff' />
            </ProfileButton>
            {showProfileDropdown && (
              <ProfileDropdown
                onClose={() => setShowProfileDropdown(false)}
              />
            )}
          </ProfileWrapper>
        </NavIcons>
      </TopBar>

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        foodCategories={foodCategories}
        nonFoodCategories={nonFoodCategories}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
        onAddCategory={() => setShowAddCategory(true)}
        onFilterAll={() => setShowSortMenu(true)}
      />

      <Content>
        {filteredCategories.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: 40 }}>
            No categories found.
          </p>
        ) : (
          filteredCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              onItemClick={handleItemClick}
              onItemAdded={handleItemAdded}
              onEditCategory={setCategoryToEdit}
            />
          ))
        )}
      </Content>

      {showSortMenu && (
        <SortMenu
          activeSort={sortBy}
          onSortChange={setSortBy}
          onClose={() => setShowSortMenu(false)}
          topOffset={105}
        />
      )}

      {selectedItemId && (
        <ItemDetailModal
          itemId={selectedItemId}
          categories={categories}
          onClose={handleModalClose}
          onItemDeleted={handleItemDeleted}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          categories={categoriesWithItems}
          onClose={() => setShowAddCategory(false)}
          onAdd={handleAddCategory}
        />
      )}

      {categoryToEdit && !categoryToDelete && (
        <EditCategoryModal
          category={categoryToEdit}
          onClose={() => setCategoryToEdit(null)}
          onSave={handleRenameCategory}
          onDeleteRequest={() => {
            setCategoryToDelete(categoryToEdit);
            setCategoryToEdit(null);
          }}
        />
      )}

      {categoryToDelete && (
        <DeleteCategoryModal
          category={categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleDeleteCategory}
        />
      )}
    </PageWrapper>
  );
}
