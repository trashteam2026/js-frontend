import { useEffect, useRef, useState } from 'react';
import { FiFilter, FiPlus } from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px 10px;
  position: relative;
`;

const TabsPill = styled.div`
  flex: 1;
  background: #c8d4e6;
  border-radius: 9999px;
  height: 50px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  overflow: visible;
`;

const TabButton = styled.button`
  position: relative;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: ${({ $active }) => ($active ? '700' : '600')};
  color: ${({ $active }) => ($active ? '#2c5e95' : '#4f4f5b')};
  cursor: pointer;
  display: grid;
  place-items: center;
  padding: 0 14px;
  width: 100%;
  height: 100%;
  line-height: 1;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    left: 18%;
    right: 18%;
    bottom: 0;
    height: 3px;
    border-radius: 3px;
    background: ${({ $active }) => ($active ? '#2c5e95' : 'transparent')};
  }
`;

const TabText = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const TabCaret = styled.span`
  font-size: 0.95em;
  line-height: 1;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AddButton = styled.button`
  background-color: #2c5e95;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #255282;
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
`;

const FilterAllButton = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 700;
  color: #2c5e95;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
`;

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #ffffff;
  border: 1px solid #c7d2e3;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(24, 39, 75, 0.16);
  min-width: 200px;
  z-index: 20;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#2c5e95' : '#374151')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  background-color: ${({ $active }) => ($active ? '#e9f1fb' : 'transparent')};

  &:hover {
    background-color: #f3f6fb;
  }
`;

export default function TabBar({
  activeTab,
  onTabChange,
  foodCategories,
  nonFoodCategories,
  selectedCategoryId,
  onCategorySelect,
  onAddCategory,
  onFilterAll,
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
      <TabsPill>
        <TabButton
          $active={activeTab === 'all'}
          onClick={() => handleTabClick('all')}
        >
          <TabText>All Items</TabText>
        </TabButton>

        <DropdownWrapper>
          <TabButton
            $active={activeTab === 'food'}
            onClick={() => handleTabClick('food')}
          >
            <TabText>
              Food Items <TabCaret>▼</TabCaret>
            </TabText>
          </TabButton>
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
          <TabButton
            $active={activeTab === 'non_food'}
            onClick={() => handleTabClick('non_food')}
          >
            <TabText>
              Non-Food Items <TabCaret>▼</TabCaret>
            </TabText>
          </TabButton>
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
      </TabsPill>

      <RightSection>
        <AddButton title='Add Category' onClick={onAddCategory}>
          <FiPlus size={26} color='#ffffff' />
        </AddButton>
        <FilterAllButton onClick={onFilterAll}>
          <span>Filter All</span> <FiFilter size={24} strokeWidth={2.2} />
        </FilterAllButton>
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
  onAddCategory: PropTypes.func,
  onFilterAll: PropTypes.func,
};
