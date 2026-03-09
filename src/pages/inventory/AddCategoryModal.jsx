import { useState } from 'react';

import { FiPlus, FiX } from 'react-icons/fi';
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
  font-size: 14px;

  &:hover {
    background: #1e3a6e;
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

  &:focus {
    border-color: #2a4d8f;
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

  &:focus {
    border-color: #2a4d8f;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #dbeafe;
  color: #1a2b4a;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #1a2b4a;
  display: flex;
  align-items: center;
  padding: 0;
  font-size: 12px;

  &:hover {
    color: #dc2626;
  }
`;

const AddTagButton = styled.button`
  background: #2a4d8f;
  border: none;
  color: #ffffff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  &:hover {
    background: #1e3a6e;
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

export default function AddCategoryModal({ categories, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [parentGroup, setParentGroup] = useState('food');
  const [moveFrom, setMoveFrom] = useState([]);

  const availableCategories = categories.filter(
    (c) => !moveFrom.includes(c.id) && c.items.length === 0,
  );

  const handleAddTag = () => {
    if (availableCategories.length > 0) {
      setMoveFrom([...moveFrom, availableCategories[0].id]);
    }
  };

  const handleRemoveTag = (catId) => {
    setMoveFrom(moveFrom.filter((id) => id !== catId));
  };

  const handleDone = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), parentGroup, moveFrom });
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Add Category</Title>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <Field>
          <Label>Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
        </Field>

        <Field>
          <Label>In group</Label>
          <Select value={parentGroup} onChange={(e) => setParentGroup(e.target.value)}>
            <option value="food">Food</option>
            <option value="non_food">Non-Food</option>
          </Select>
        </Field>

        <Field>
          <Label>Move Items</Label>
          <TagsContainer>
            {moveFrom.map((catId) => {
              const cat = categories.find((c) => c.id === catId);
              return (
                <Tag key={catId}>
                  {cat?.name || 'Unknown'}
                  <TagRemove onClick={() => handleRemoveTag(catId)}>
                    <FiX size={12} />
                  </TagRemove>
                </Tag>
              );
            })}
            <AddTagButton onClick={handleAddTag}>
              <FiPlus size={14} />
            </AddTagButton>
          </TagsContainer>
        </Field>

        <DoneButton onClick={handleDone}>Done</DoneButton>
      </Modal>
    </Overlay>
  );
}

AddCategoryModal.propTypes = {
  categories: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};