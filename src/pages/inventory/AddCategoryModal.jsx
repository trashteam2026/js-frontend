import { useState } from 'react';
import { FiX } from 'react-icons/fi';

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

const Field = styled.div`
  margin-bottom: 16px;
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

  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d6dce8;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  color: #1a2b4a;
  background: #ffffff;
  box-sizing: border-box;

  &:focus {
    border-color: #2a4d8f;
  }

  @media (max-width: 767px) {
    font-size: 16px;
  }
`;

const DoneButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #2a4d8f;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;

  &:hover {
    background: #1e3a6e;
  }
`;

export default function AddCategoryModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [parentGroup, setParentGroup] = useState('food');

  const handleDone = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), parentGroup });
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Add Category</Title>
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
            placeholder='Category name'
          />
        </Field>

        <Field>
          <Label>In group</Label>
          <Select
            value={parentGroup}
            onChange={(e) => setParentGroup(e.target.value)}
          >
            <option value='food'>Food</option>
            <option value='non_food'>Non-Food</option>
          </Select>
        </Field>

        <DoneButton onClick={handleDone}>Add</DoneButton>
      </Modal>
    </Overlay>
  );
}

AddCategoryModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};
