import { useState } from 'react';
import { FiTrash2, FiX } from 'react-icons/fi';

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
  width: 360px;
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
`;

const Field = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1a2b4a;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d6dce8;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  color: #1a2b4a;
  box-sizing: border-box;

  &:focus {
    border-color: #2a4d8f;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #2a4d8f;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover {
    background: #1e3a6e;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e8ecf2;
  margin: 4px 0 12px;
`;

const DeleteButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: none;
  color: #dc2626;
  border: 1.5px solid #dc2626;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #fef2f2;
  }
`;

export default function EditCategoryModal({ category, onClose, onSave, onDeleteRequest }) {
  const [name, setName] = useState(category.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name || saving) return;
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Edit Category</Title>
          <CloseButton onClick={onClose}>
            <FiX color='#ffffff' />
          </CloseButton>
        </Header>

        <Field>
          <Label>Name</Label>
          <Input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </Field>

        <SaveButton
          onClick={handleSave}
          disabled={!name.trim() || name.trim() === category.name || saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </SaveButton>

        <Divider />

        <DeleteButton onClick={onDeleteRequest}>
          <FiTrash2 size={15} />
          Delete Category
        </DeleteButton>
      </Modal>
    </Overlay>
  );
}

EditCategoryModal.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDeleteRequest: PropTypes.func.isRequired,
};
