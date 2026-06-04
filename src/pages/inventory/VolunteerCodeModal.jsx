import { useEffect, useState } from 'react';
import { FiCheck, FiCopy, FiX } from 'react-icons/fi';

import PropTypes from 'prop-types';
import styled from 'styled-components';

import { volunteerApi } from '../../services/api';

const PANTRY_TZ = 'America/Chicago';

const expiryDateFormat = new Intl.DateTimeFormat([], {
  timeZone: PANTRY_TZ,
  month: 'short',
  day: 'numeric',
});

const expiryTimeFormat = new Intl.DateTimeFormat([], {
  timeZone: PANTRY_TZ,
  hour: 'numeric',
  minute: '2-digit',
});

const formatSessionExpiry = (iso) => {
  const date = new Date(iso);
  return `${expiryDateFormat.format(date)} at ${expiryTimeFormat.format(date)}`;
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 100;
  padding: 16px;
`;

const Modal = styled.div`
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 12px;
  padding: 28px 24px 24px;
  width: min(340px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;

  @media (max-width: 767px) {
    padding: 24px 18px 20px;
    gap: 14px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: grid;
  place-items: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #f3f4f6;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2b4a;
  padding-right: 28px;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;
`;

const CodeBox = styled.div`
  background: #f0f4fa;
  border-radius: 8px;
  padding: 18px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
`;

const CodeText = styled.span`
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 6px;
  color: #1a2b4a;
  font-family: monospace;
  min-width: 0;
  overflow-wrap: anywhere;

  @media (max-width: 767px) {
    font-size: 1.6rem;
    letter-spacing: 4px;
  }
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #2c5e95;
  display: grid;
  place-items: center;
  padding: 6px;
  border-radius: 6px;
  flex-shrink: 0;

  &:hover {
    background: #e0eaf7;
  }
`;

const PrimaryButton = styled.button`
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  background: #2c5e95;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #1e3a6e;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: transparent;
  color: #2c5e95;
  border: 1px solid #2c5e95;

  &:hover:not(:disabled) {
    background: #f0f4fa;
  }
`;

const DangerButton = styled(PrimaryButton)`
  background: #dc2626;

  &:hover:not(:disabled) {
    background: #b91c1c;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #dc2626;
  text-align: center;
`;

const ConfirmBody = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.45;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const RowButton = styled.button`
  box-sizing: border-box;
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RowCancelButton = styled(RowButton)`
  background: transparent;
  color: #2c5e95;
  border: 1px solid #2c5e95;

  &:hover:not(:disabled) {
    background: #f0f4fa;
  }
`;

const RowDangerButton = styled(RowButton)`
  background: #dc2626;
  color: #ffffff;
  border: none;

  &:hover:not(:disabled) {
    background: #b91c1c;
  }
`;

export default function VolunteerCodeModal({ onClose, onSessionChange }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [confirmingEnd, setConfirmingEnd] = useState(false);

  useEffect(() => {
    volunteerApi
      .getSession()
      .then(setSession)
      .catch(() => setError('Failed to load session.'))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setActionLoading(true);
    setError('');
    try {
      const result = await volunteerApi.generateSession();
      setSession(result);
      // Notify the host page (e.g. /volunteers) so its session-scoped panels
      // re-fetch — generating or regenerating a code changes who's active.
      onSessionChange?.();
    } catch {
      setError('Failed to generate code.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnd = async () => {
    setActionLoading(true);
    setError('');
    try {
      await volunteerApi.endSession();
      setConfirmingEnd(false);
      // Ending the session evicts active volunteers — let the host page refresh.
      onSessionChange?.();
      // On success, close BOTH the confirmation and the parent modal so the
      // owner returns to the underlying page in one step. (On failure we fall
      // through to catch and keep both open so they can see/retry.)
      onClose();
    } catch {
      setError('Failed to end session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!session?.code) return;
    try {
      await navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <>
      <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label='Close'>
          <FiX size={20} />
        </CloseButton>
        <Title>Volunteer Session</Title>

        {loading && <StatusText>Loading…</StatusText>}

        {!loading && error && <ErrorText>{error}</ErrorText>}

        {!loading && !session?.active && (
          <>
            <StatusText>
              Generate a one-time code to give volunteers access to the check-in
              scanner.
            </StatusText>
            <PrimaryButton onClick={handleGenerate} disabled={actionLoading}>
              {actionLoading ? 'Generating…' : 'Generate Code'}
            </PrimaryButton>
          </>
        )}

        {!loading && session?.active && (
          <>
            <StatusText>
              Share this code with volunteers.
              {session.expiresAt && (
                <>
                  {' '}
                  Expires{' '}
                  <strong>{formatSessionExpiry(session.expiresAt)}</strong>
                  .
                </>
              )}
            </StatusText>
            <CodeBox>
              <CodeText>{session.code}</CodeText>
              <CopyButton onClick={handleCopy} title='Copy code'>
                {copied ? (
                  <FiCheck size={18} color='#16a34a' />
                ) : (
                  <FiCopy size={18} />
                )}
              </CopyButton>
            </CodeBox>
            {error && <ErrorText>{error}</ErrorText>}
            <SecondaryButton onClick={handleGenerate} disabled={actionLoading}>
              {actionLoading ? 'Generating…' : 'Generate New Code'}
            </SecondaryButton>
            <DangerButton
              onClick={() => {
                setError('');
                setConfirmingEnd(true);
              }}
              disabled={actionLoading}
            >
              End Session
            </DangerButton>
          </>
        )}
      </Modal>
      </Backdrop>

      {confirmingEnd && (
        <Backdrop onClick={() => !actionLoading && setConfirmingEnd(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <Title>End session?</Title>
            <ConfirmBody>
              All active volunteers will be removed, and a new code must be
              generated for volunteers to rejoin.
            </ConfirmBody>
            {error && <ErrorText>{error}</ErrorText>}
            <ButtonRow>
              <RowCancelButton
                type='button'
                onClick={() => setConfirmingEnd(false)}
                disabled={actionLoading}
              >
                Cancel
              </RowCancelButton>
              <RowDangerButton
                type='button'
                onClick={handleEnd}
                disabled={actionLoading}
              >
                {actionLoading ? 'Ending…' : 'End Session'}
              </RowDangerButton>
            </ButtonRow>
          </Modal>
        </Backdrop>
      )}
    </>
  );
}

VolunteerCodeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSessionChange: PropTypes.func,
};
