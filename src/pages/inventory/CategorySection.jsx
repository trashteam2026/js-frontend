import { useState } from 'react';
import { FiFilter, FiLock, FiMinusCircle, FiPlusCircle } from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

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

export default function CategorySection({ category, onItemClick }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Wrapper>
      <Header>
        <CategoryName>{category.name}</CategoryName>
        <ActionCell type='button'>
          <span>Edit</span>
          <FiLock size={17} />
        </ActionCell>
        <ActionCell type='button'>
          <span>Filter</span>
          <FiFilter size={17} />
        </ActionCell>
        <CollapseButton type='button' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiMinusCircle size={19} /> : <FiPlusCircle size={19} />}
        </CollapseButton>
      </Header>
      <ItemList $isOpen={isOpen}>
        {category.items.length === 0 ? (
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
