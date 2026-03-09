import { useMemo, useState } from 'react';
import { FiSearch, FiUser } from 'react-icons/fi';

import PantryLogo from '@/assets/icons/image-1.svg';
import CashRegisterIcon from '@/assets/icons/tabler-icon-cash-register.svg?react';
import HistoryIcon from '@/assets/icons/tabler-icon-history.svg?react';
import TableRowIcon from '@/assets/icons/tabler-icon-table-row.svg?react';
import styled from 'styled-components';

import AddCategoryModal from './AddCategoryModal';
import CategorySection from './CategorySection';
import ItemDetailModal from './ItemDetailModal';
import SortMenu from './SortMenu';
import TabBar from './TabBar';
import { MOCK_CATEGORIES } from './mockData';

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

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 24px 22px;
`;

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('food');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const foodCategories = useMemo(
    () => MOCK_CATEGORIES.filter((c) => c.parent_group === 'food'),
    []
  );

  const nonFoodCategories = useMemo(
    () => MOCK_CATEGORIES.filter((c) => c.parent_group === 'non_food'),
    []
  );

  const filteredCategories = useMemo(() => {
    let categories = MOCK_CATEGORIES;

    // Tab filter
    if (activeTab === 'food') {
      categories = categories.filter((c) => c.parent_group === 'food');
    } else if (activeTab === 'non_food') {
      categories = categories.filter((c) => c.parent_group === 'non_food');
    }

    // Specific category filter
    if (selectedCategoryId) {
      categories = categories.filter((c) => c.id === selectedCategoryId);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      categories = categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            item.name.toLowerCase().includes(query)
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    // Sort items within each category
    categories = categories.map((cat) => {
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

    return categories;
  }, [activeTab, selectedCategoryId, searchQuery, sortBy]);

  const handleItemClick = (item) => {
    setSelectedItemId(item.id);
  };

  const handleAddCategory = (data) => {
    console.log('Add category:', data);
    // TODO: API call when backend is ready
  };

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
          <NavIcon title='Activity'>
            <HistoryIcon style={{ color: '#4e4b57' }} />
          </NavIcon>
          <ProfileButton title='Profile'>
            <FiUser size={24} color='#ffffff' />
          </ProfileButton>
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
          onClose={() => setSelectedItemId(null)}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          categories={MOCK_CATEGORIES}
          onClose={() => setShowAddCategory(false)}
          onAdd={handleAddCategory}
        />
      )}
    </PageWrapper>
  );
}
