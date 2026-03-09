import { useEffect, useRef } from 'react';

import PropTypes from 'prop-types';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
`;

const Menu = styled.div`
  position: absolute;
  top: ${({ $top }) => $top}px;
  right: 24px;
  background: #ffffff;
  border: 1px solid #d6dce8;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 200px;
  z-index: 51;
  padding: 4px 0;
`;

const MenuItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#1a2b4a' : '#374151')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  background-color: ${({ $active }) => ($active ? '#eef1f6' : 'transparent')};

  &:hover {
    background-color: #f0f3f8;
  }
`;

const SORT_OPTIONS = [
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'stock_asc', label: 'Ascending Stock' },
  { value: 'stock_desc', label: 'Descending Stock' },
  { value: 'expiration', label: 'Expiration Dates' },
];

export default function SortMenu({
  activeSort,
  onSortChange,
  onClose,
  topOffset,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <Overlay onClick={onClose}>
      <Menu
        $top={topOffset || 90}
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        {SORT_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            $active={activeSort === opt.value}
            onClick={() => {
              onSortChange(opt.value);
              onClose();
            }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </Overlay>
  );
}

SortMenu.propTypes = {
  activeSort: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  topOffset: PropTypes.number,
};
