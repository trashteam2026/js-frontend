import { useState, useRef, useEffect } from 'react';

import PropTypes from 'prop-types';
import styled from 'styled-components';

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  padding: 0 16px;
  position: relative;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#1e3a5f' : '#6b7280')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#1e3a5f' : 'transparent')};
  margin-bottom: -2px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  white-space: nowrap;

  &:hover {
    color: #1e3a5f;
  }
`;

const RightSection = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddButton = styled.button`
  background-color: #1e3a5f;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #2d4a6f;
  }
`;

const FilterAllButton = styled.button`
  background: none;
  border: none;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #1e3a5f;
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 10;
  margin-top: 4px;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#1e3a5f' : '#374151')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  background-color: ${({ $active }) => ($active ? '#eff6ff' : 'transparent')};

  &:hover {
    background-color: #f3f4f6;
  }
`;

export default function TabBar({
  activeTab,
  onTabChange,
  foodCategories,
  nonFoodCategories,
  selectedCategoryId,
  onCategorySelect,
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab) => {
    if (tab === 'all') {
      onTabChange('all');
      onCategorySelect(null);
      setOpenDropdown(null);
    } else if (tab === 'food') {
      if (openDropdown === 'food') {
        setOpenDropdown(null);
      } else {
        onTabChange('food');
        setOpenDropdown('food');
      }
    } else if (tab === 'non_food') {
      if (openDropdown === 'non_food') {
        setOpenDropdown(null);
      } else {
        onTabChange('non_food');
        setOpenDropdown('non_food');
      }
    }
  };

  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId);
    setOpenDropdown(null);
  };

  return (
    <TabContainer ref={dropdownRef}>
      <Tab $active={activeTab === 'all'} onClick={() => handleTabClick('all')}>
        All Items
      </Tab>

      <DropdownWrapper>
        <Tab
          $active={activeTab === 'food'}
          onClick={() => handleTabClick('food')}
        >
          Food Items ▼
        </Tab>
        {openDropdown === 'food' && (
          <Dropdown>
            <DropdownItem
              $active={!selectedCategoryId}
              onClick={() => handleCategoryClick(null)}
            >
              All Food Items
            </DropdownItem>
            {foodCategories.map((cat) => (
              <DropdownItem
                key={cat.id}
                $active={selectedCategoryId === cat.id}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.name}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </DropdownWrapper>

      <DropdownWrapper>
        <Tab
          $active={activeTab === 'non_food'}
          onClick={() => handleTabClick('non_food')}
        >
          Non-Food Items ▼
        </Tab>
        {openDropdown === 'non_food' && (
          <Dropdown>
            <DropdownItem
              $active={!selectedCategoryId}
              onClick={() => handleCategoryClick(null)}
            >
              All Non-Food Items
            </DropdownItem>
            {nonFoodCategories.map((cat) => (
              <DropdownItem
                key={cat.id}
                $active={selectedCategoryId === cat.id}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.name}
              </DropdownItem>
            ))}
          </Dropdown>
        )}
      </DropdownWrapper>

      <RightSection>
        <AddButton title="Add Category">+</AddButton>
        <FilterAllButton>Filter All 🔽</FilterAllButton>
      </RightSection>
    </TabContainer>
  );
}

TabBar.propTypes = {
  activeTab: PropTypes.oneOf(['all', 'food', 'non_food']).isRequired,
  onTabChange: PropTypes.func.isRequired,
  foodCategories: PropTypes.array.isRequired,
  nonFoodCategories: PropTypes.array.isRequired,
  selectedCategoryId: PropTypes.number,
  onCategorySelect: PropTypes.func.isRequired,
};