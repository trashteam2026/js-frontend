import { useMemo, useState } from 'react';

import styled from 'styled-components';

import PantryLogo from '@/assets/icons/pantry-logo.svg';

import CategorySection from './CategorySection';
import { MOCK_CATEGORIES } from './mockData';
import TabBar from './TabBar';

const PageWrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
`;

const LogoImg = styled.img`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
`;

const PageTitle = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
`;

const SearchWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 320px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: #1e3a5f;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const NavIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
`;

const NavIcon = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  color: #374151;
  border-radius: 4px;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
`;

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const foodCategories = useMemo(
    () => MOCK_CATEGORIES.filter((c) => c.parent_group === 'food'),
    [],
  );

  const nonFoodCategories = useMemo(
    () => MOCK_CATEGORIES.filter((c) => c.parent_group === 'non_food'),
    [],
  );

  const filteredCategories = useMemo(() => {
    let categories = MOCK_CATEGORIES;

    if (activeTab === 'food') {
      categories = categories.filter((c) => c.parent_group === 'food');
    } else if (activeTab === 'non_food') {
      categories = categories.filter((c) => c.parent_group === 'non_food');
    }

    if (selectedCategoryId) {
      categories = categories.filter((c) => c.id === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      categories = categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            item.name.toLowerCase().includes(query),
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    return categories;
  }, [activeTab, selectedCategoryId, searchQuery]);

  const handleItemClick = (item) => {
    // TODO: open ItemDetailModal
    console.log('Item clicked:', item.name);
  };

  return (
    <PageWrapper>
      <TopBar>
        <LogoImg src={PantryLogo} alt="New Trier Township" />
        <PageTitle>New Trier Township Food Pantry Inventory</PageTitle>
        <SearchWrapper>
          <SearchInput
            type="text"
            placeholder="Search for an item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchWrapper>
        <NavIcons>
          <NavIcon title="Inventory">📋</NavIcon>
          <NavIcon title="Check In">📦</NavIcon>
          <NavIcon title="Activity">🕐</NavIcon>
          <NavIcon title="Profile">👤</NavIcon>
        </NavIcons>
      </TopBar>

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        foodCategories={foodCategories}
        nonFoodCategories={nonFoodCategories}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
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
    </PageWrapper>
  );
}