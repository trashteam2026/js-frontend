import { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

const Overlay = styled.div`
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
`;

const Modal = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 24px 28px;
  width: min(360px, calc(100vw - 24px));
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1a2b4a;
  margin: 0;
`;

const CloseButton = styled.button`
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
  font-size: 14px;

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

const WarningBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 20px;
`;

const WarningText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1a2b4a;
  line-height: 1.5;
`;

const CategoryNameStrong = styled.strong`
  color: #1a2b4a;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #ffffff;
  color: #2a4d8f;
  border: 1.5px solid #2a4d8f;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #eef3fa;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const DeleteButton = styled.button`
  flex: 1;
  padding: 10px;
  background: #dc2626;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #b91c1c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export default function DeleteCategoryModal({ category, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const itemCount = category.items?.length ?? 0;

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Delete Category</Title>
          <CloseButton onClick={onClose} disabled={deleting}>
            <FiX color='#ffffff' />
          </CloseButton>
        </Header>

        <WarningBox>
          <FiAlertTriangle size={20} color='#ea580c' style={{ flexShrink: 0, marginTop: 1 }} />
          <WarningText>
            Deleting <CategoryNameStrong>{category.name}</CategoryNameStrong> will permanently
            remove{' '}
            {itemCount === 0
              ? 'all items'
              : itemCount === 1
              ? '1 item'
              : `all ${itemCount} items`}{' '}
            in this category and add them to the activity log. This cannot be undone.
          </WarningText>
        </WarningBox>

        <ButtonRow>
          <CancelButton onClick={onClose} disabled={deleting}>
            Cancel
          </CancelButton>
          <DeleteButton onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </DeleteButton>
        </ButtonRow>
      </Modal>
    </Overlay>
  );
}

DeleteCategoryModal.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    items: PropTypes.array,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
