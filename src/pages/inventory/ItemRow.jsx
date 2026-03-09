import PropTypes from 'prop-types';
import styled from 'styled-components';

const STATUS_COLORS = {
  out_of_stock: '#f8b4b4',
  low_stock: '#fde68a',
  normal: 'transparent',
};

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: ${({ $status }) => STATUS_COLORS[$status] || 'transparent'};
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    opacity: 0.85;
  }
`;

const ItemName = styled.span`
  font-size: 14px;
  color: #1f2937;
`;

const Quantity = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  min-width: 40px;
  text-align: right;
`;

export default function ItemRow({ item, onClick }) {
  return (
    <Row $status={item.status} onClick={() => onClick?.(item)}>
      <ItemName>{item.name}</ItemName>
      <Quantity>{item.total_quantity}</Quantity>
    </Row>
  );
}

ItemRow.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    total_quantity: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['out_of_stock', 'low_stock', 'normal']).isRequired,
  }).isRequired,
  onClick: PropTypes.func,
};