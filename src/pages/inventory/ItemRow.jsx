import PropTypes from 'prop-types';
import styled from 'styled-components';

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 244px;
  align-items: center;
  min-height: 37px;
  padding: 0;
  background-color: ${({ $index }) =>
    $index % 2 === 0 ? '#f1f1f3' : '#d3deec'};
  cursor: pointer;
`;

const ItemName = styled.span`
  font-size: 14px;
  color: #111827;
  padding: 0 10px;
`;

const Quantity = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: #111827;
  text-align: center;
  border-left: 1px solid #2c5e95;
  min-height: 37px;
  display: grid;
  place-items: center;
`;

export default function ItemRow({ item, index, onClick }) {
  return (
    <Row $index={index} onClick={() => onClick?.(item)}>
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
  index: PropTypes.number,
  onClick: PropTypes.func,
};
