import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';

import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

const ToastContext = React.createContext(null);

const AUTO_DISMISS_MS = 4000;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Bottom-centered, raised above the inventory FABs on mobile so it never
// overlaps them or sits under the safe-area inset.
const ToastViewport = styled.div`
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(420px, calc(100vw - 32px));
  pointer-events: none;

  @media (max-width: 767px) {
    bottom: calc(env(safe-area-inset-bottom, 0px) + 88px);
  }
`;

const ToastCard = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 8px 28px rgba(24, 39, 75, 0.18);
  border-left: 4px solid
    ${({ $variant }) =>
      $variant === 'error'
        ? '#c0392b'
        : $variant === 'success'
          ? '#16a34a'
          : '#2c5e95'};
  padding: 12px 14px;
  animation: ${slideIn} 0.18s ease;
`;

const ToastMessage = styled.p`
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #1a2b4a;
`;

const ToastClose = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7b95;
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 4px;

  &:hover {
    color: #1a2b4a;
    background: #f0f3f8;
  }
`;

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <ToastCard $variant={toast.variant} role='status' aria-live='polite'>
      <ToastMessage>{toast.message}</ToastMessage>
      <ToastClose
        type='button'
        aria-label='Dismiss notification'
        onClick={() => onDismiss(toast.id)}
      >
        <FiX size={16} />
      </ToastClose>
    </ToastCard>
  );
}

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['info', 'success', 'error']),
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // variant: 'info' (default) | 'success' | 'error'
  const showToast = useCallback((message, variant = 'info') => {
    const id = (idRef.current += 1);
    setToasts((prev) => [...prev, { id, message, variant }]);
    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {createPortal(
        <ToastViewport>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </ToastViewport>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
