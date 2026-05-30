import { useState } from 'react';
import { FiPrinter, FiX } from 'react-icons/fi';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 140;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
`;

const Modal = styled.div`
  width: min(360px, 100%);
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
`;

const Title = styled.h2`
  margin: 0 28px 16px 0;
  color: #1a2b4a;
  font-size: 20px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: #1a2b4a;
`;

const CountInput = styled.input`
  height: 42px;
  border: 1px solid #c8d0dc;
  border-radius: 6px;
  padding: 0 10px;
  font-size: 16px;
  color: #111827;
  outline: none;

  &:focus {
    border-color: #2c5e95;
    box-shadow: 0 0 0 3px rgba(44, 94, 149, 0.15);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
`;

const Button = styled.button`
  min-height: 40px;
  border: 1px solid ${({ $primary }) => ($primary ? '#2c5e95' : '#c8d0dc')};
  border-radius: 6px;
  background: ${({ $primary }) => ($primary ? '#2c5e95' : '#ffffff')};
  color: ${({ $primary }) => ($primary ? '#ffffff' : '#374151')};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  cursor: pointer;
`;

export default function PrintQuantityModal({
  defaultCopies,
  onClose,
  onPrint,
}) {
  const [copies, setCopies] = useState(defaultCopies);

  const submit = (event) => {
    event.preventDefault();
    const normalizedCopies = Math.min(
      100,
      Math.max(1, Number.parseInt(copies, 10) || 1)
    );
    onPrint(normalizedCopies);
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(event) => event.stopPropagation()}>
        <CloseButton
          type='button'
          title='Close'
          aria-label='Close'
          onClick={onClose}
        >
          <FiX size={22} />
        </CloseButton>
        <Title>Print Barcodes</Title>
        <form onSubmit={submit}>
          <Field>
            Labels per barcode
            <CountInput
              type='number'
              min='1'
              max='100'
              value={copies}
              autoFocus
              onChange={(event) => setCopies(event.target.value)}
            />
          </Field>
          <Actions>
            <Button type='button' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' $primary>
              <FiPrinter />
              Open Printable PDF
            </Button>
          </Actions>
        </form>
      </Modal>
    </Overlay>
  );
}

PrintQuantityModal.propTypes = {
  defaultCopies: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
};

PrintQuantityModal.defaultProps = {
  defaultCopies: 12,
};
