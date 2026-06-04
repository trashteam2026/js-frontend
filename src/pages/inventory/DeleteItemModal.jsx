import { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

// Mirrors DeleteCategoryModal's visual language. The only structural
// difference is the z-index: this confirmation opens on top of the already-open
// ItemDetailModal (z-index 100) and its print sub-modal (z-index 140), so its
// overlay sits above both. The app-level toast (z-index 1000) still wins.
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
  z-index: 150;
`;

const Modal = styled.div`
  box-sizing: border-box;
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

// min-width:0 lets this flex child of WarningBox shrink so a long, unbreakable
// item name can't push the warning box wider than the modal.
const WarningText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1a2b4a;
  line-height: 1.5;
  min-width: 0;
`;

// Groups the truncating name with the trailing "?" so the question mark stays
// on the same line as the (ellipsized) name instead of being pushed below it.
// inline-flex + max-width:100% keeps the whole group inside the WarningText
// content box (which itself can't exceed the modal); "Delete" and "This cannot
// be undone." flow around it as normal inline text.
const ItemNameLine = styled.span`
  display: inline-flex;
  align-items: baseline;
  max-width: 100%;
  vertical-align: bottom;
`;

// The item name can be arbitrarily long; clamp it to a single line that
// ellipsizes, mirroring the min-width:0 + overflow/ellipsis convention used by
// ItemRow / ScanInPage's confirm card. Only the name shrinks; the "?" sibling
// in ItemNameLine keeps its natural width.
const ItemNameStrong = styled.strong`
  color: #1a2b4a;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
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

export default function DeleteItemModal({ itemName, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

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
          <Title>Delete Item</Title>
          <CloseButton onClick={onClose} disabled={deleting}>
            <FiX color='#ffffff' />
          </CloseButton>
        </Header>

        <WarningBox>
          <FiAlertTriangle
            size={20}
            color='#ea580c'
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <WarningText>
            Delete{' '}
            <ItemNameLine>
              <ItemNameStrong title={itemName}>{itemName}</ItemNameStrong>
              ?
            </ItemNameLine>{' '}
            This cannot be undone.
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

DeleteItemModal.propTypes = {
  itemName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
