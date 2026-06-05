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

  @media (max-width: 767px) {
    padding: 16px;
  }
`;

const Modal = styled.div`
  box-sizing: border-box;
  width: min(360px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.22);

  @media (max-width: 767px) {
    padding: 20px;
  }
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
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
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

const ErrorText = styled.p`
  margin: 8px 0 0;
  font-size: 0.85rem;
  color: #dc2626;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;

  @media (max-width: 767px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  box-sizing: border-box;
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

  @media (max-width: 767px) {
    width: 100%;
  }
`;

export default function PrintQuantityModal({
  defaultCopies = 1,
  onClose,
  onPrint,
}) {
  const [copies, setCopies] = useState(defaultCopies);
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const raw = String(copies).trim();
    if (!/^\d+$/.test(raw)) {
      setError('Enter a whole number between 1 and 100.');
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (parsed < 1 || parsed > 100) {
      setError('Enter a whole number between 1 and 100.');
      return;
    }
    setError('');
    onPrint(parsed);
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
              onChange={(event) => {
                setCopies(event.target.value);
                if (error) setError('');
              }}
            />
          </Field>
          {error && <ErrorText>{error}</ErrorText>}
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
