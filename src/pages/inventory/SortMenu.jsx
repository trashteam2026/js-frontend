import { useEffect, useRef } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

import useIsMobile from '@/common/hooks/useIsMobile';
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

  @media (max-width: 767px) {
    min-height: 44px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;

  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const SortModal = styled.div`
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 10px;
  padding: 24px 28px;
  width: min(360px, 100%);
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  @media (max-width: 767px) {
    padding: 20px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a2b4a;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: #2a4d8f;
  border: none;
  color: #ffffff;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #1e3a6e;
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

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
  }
`;

const SortOptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SortOptionButton = styled.button`
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid ${({ $active }) => ($active ? '#2a4d8f' : '#d6dce8')};
  border-radius: 6px;
  background: ${({ $active }) => ($active ? '#eef3fa' : '#ffffff')};
  color: #1a2b4a;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '700' : '600')};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #eef3fa;
  }

  svg {
    color: #2a4d8f;
    flex-shrink: 0;
  }
`;

export const SORT_OPTIONS = [
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
  const isMobile = useIsMobile();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (isMobile) {
    return (
      <ModalOverlay onClick={onClose}>
        <SortModal onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Sort All Items</ModalTitle>
            <ModalCloseButton type='button' onClick={onClose}>
              <FiX color='#ffffff' />
            </ModalCloseButton>
          </ModalHeader>
          <SortOptionList>
            {SORT_OPTIONS.map((opt) => (
              <SortOptionButton
                key={opt.value}
                type='button'
                $active={activeSort === opt.value}
                onClick={() => {
                  onSortChange(opt.value);
                  onClose();
                }}
              >
                {opt.label}
                {activeSort === opt.value && <FiCheck size={16} />}
              </SortOptionButton>
            ))}
          </SortOptionList>
        </SortModal>
      </ModalOverlay>
    );
  }

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
