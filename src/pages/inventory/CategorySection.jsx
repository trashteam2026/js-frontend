import { useState } from 'react';

import PropTypes from 'prop-types';
import styled from 'styled-components';

import ItemRow from './ItemRow';

const Wrapper = styled.div`
  margin-bottom: 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #1e3a5f;
  color: #ffffff;
  cursor: pointer;
  user-select: none;
`;

const CategoryName = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
`;

const ItemList = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
`;

const EmptyMessage = styled.div`
  padding: 12px 16px;
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
`;

export default function CategorySection({ category, onItemClick }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Wrapper>
      <Header onClick={() => setIsOpen(!isOpen)}>
        <CategoryName>{category.name}</CategoryName>
        <HeaderActions>
          <HeaderButton onClick={(e) => e.stopPropagation()}>
            Edit 🔒
          </HeaderButton>
          <HeaderButton onClick={(e) => e.stopPropagation()}>
            Filter 🔽
          </HeaderButton>
          <CollapseButton>{isOpen ? '⊖' : '⊕'}</CollapseButton>
        </HeaderActions>
      </Header>
      <ItemList $isOpen={isOpen}>
        {category.items.length === 0 ? (
          <EmptyMessage>No items in this category</EmptyMessage>
        ) : (
          category.items.map((item) => (
            <ItemRow key={item.id} item={item} onClick={onItemClick} />
          ))
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
};