import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import OwnerHeader from '@/common/components/navigation/OwnerHeader';
import useIsMobile from '@/common/hooks/useIsMobile';
import { BrowserMultiFormatReader } from '@zxing/browser';
import styled from 'styled-components';

import { checkoutApi, itemsApi } from '../../services/api';
import CartLine from './CartLine';

// ─── Styled components ────────────────────────────────────────────────────────

const NAVY = '#2a4d8f';
const NAVY_DARK = '#1a2b4a';
const REMOVED_RED = '#ef4444';
const SUCCESS_GREEN = '#16a34a';

const PageWrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ececec;
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: ${(p) => (p.$isMobile ? '1fr' : '1fr 1fr')};
  grid-template-rows: ${(p) => (p.$isMobile ? 'auto 1fr' : '1fr')};
  gap: 16px;
  padding: 16px 24px 24px;
  overflow: hidden;
  min-height: 0;

  @media (max-width: 767px) {
    padding: 12px 12px 16px;
    gap: 12px;
  }
`;

const Panel = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;

  @media (max-width: 767px) {
    padding: 12px;
    gap: 10px;
  }
`;

// Cart panel only: on mobile it's the 1fr grid row, so it stretches to the
// bottom and runs behind the floating footer. Lift its bottom edge clear of
// the footer so there's visible empty space beneath the white Cart box.
const CartPanel = styled(Panel)`
  @media (max-width: 767px) {
    margin-bottom: 80px;
  }
`;

const PanelTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  color: ${NAVY_DARK};
  margin: 0;
`;

const ScannerBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 0;

  @media (max-width: 767px) {
    justify-content: flex-start;
    gap: 8px;
  }
`;

const CameraFrame = styled.div`
  position: relative;
  width: 100%;
  max-width: 360px;
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background-color: #0b1220;
  border: 2px solid ${NAVY};

  @media (max-width: 767px) {
    max-width: none;
    aspect-ratio: auto;
    height: 230px;
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ReticleOverlay = styled.div`
  position: absolute;
  inset: 14%;
  border: 2px dashed rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  pointer-events: none;
`;

const StatusOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background-color: rgba(11, 18, 32, 0.55);
  color: #ffffff;
  font-size: 0.95rem;
  text-align: center;
  padding: 12px 18px;
  pointer-events: none;
`;

const ScannerHint = styled.p`
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: ${NAVY_DARK};
  font-weight: 600;
  line-height: 1.4;
`;

const ScannerSubHint = styled.p`
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
`;

const LastScanRow = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const LastScanCode = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: ${NAVY_DARK};
  font-weight: 700;
`;

const PulseDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${SUCCESS_GREEN};
  display: inline-block;
  margin-right: 8px;
  animation: pulse 1.6s ease-in-out infinite;
  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: #b00020;
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.4;
`;

const CartHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const CartSummary = styled.span`
  font-size: 13px;
  color: #6b7280;
`;

const CartList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;

  @media (max-width: 767px) {
    padding-bottom: 88px;
  }
`;

const EmptyCart = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 32px 0;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #e8ecf2;

  @media (max-width: 767px) {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 16px;
    z-index: 30;
    padding: 10px 14px;
    background: #ffffff;
    border: 1px solid #e8ecf2;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(24, 39, 75, 0.16);
  }
`;

const Total = styled.div`
  display: flex;
  flex-direction: column;
`;

const TotalLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TotalValue = styled.span`
  font-size: 22px;
  font-weight: 700;
  color: ${REMOVED_RED};
`;

const SubmitButton = styled.button`
  padding: 12px 22px;
  background-color: ${NAVY};
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  &:hover:not(:disabled) {
    background-color: #1e3a6e;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ConfirmationOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(22, 163, 74, 0.94);
  color: #ffffff;
  display: grid;
  place-items: center;
  border-radius: 12px;
  z-index: 5;
  text-align: center;
  padding: 20px;

  @media (max-width: 767px) {
    position: fixed;
    border-radius: 0;
    z-index: 40;
  }
`;

const ConfirmationHeading = styled.div`
  font-size: 22px;
  font-weight: 700;
`;

const ConfirmationDetail = styled.div`
  font-size: 14px;
  margin-top: 8px;
  opacity: 0.95;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeLineId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const MIN_BARCODE_LEN = 6;
const SCAN_DEBOUNCE_MS = 1500;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ScanOutPage() {
  const isMobile = useIsMobile();

  const [items, setItems] = useState([]);
  const [lines, setLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const [lastScan, setLastScan] = useState(null);

  const [cameraStatus, setCameraStatus] = useState('starting');
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const confirmationTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (confirmationTimerRef.current) {
        clearTimeout(confirmationTimerRef.current);
      }
    },
    []
  );

  // ── Load catalog (for manual-pick autocomplete) ────────────────────────────
  useEffect(() => {
    let cancelled = false;
    itemsApi
      .getAll()
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error('Catalog load error:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Scan ingestion ─────────────────────────────────────────────────────────
  const handleScan = useCallback(
    (rawBarcode) => {
      const barcode = String(rawBarcode || '').trim();
      if (!barcode) return;

      setLastScan({ barcode, at: Date.now() });

      // Resolve from the loaded catalog so the cart shows the item name
      // immediately instead of waiting for /check-out to echo it back.
      // A truly unknown barcode stays nameless and falls through to the
      // existing BARCODE_NOT_FOUND manual-pick flow on submit.
      const match = items.find((it) => it.barcode === barcode);

      setLines((prev) => {
        // Match an existing editable line by the same barcode so re-scans
        // bump quantity instead of stacking duplicates.
        const idx = prev.findIndex(
          (line) =>
            line.barcode === barcode &&
            line.status !== 'done' &&
            line.status !== 'submitting'
        );
        if (idx !== -1) {
          const next = [...prev];
          const existing = next[idx];
          next[idx] = {
            ...existing,
            quantity: existing.quantity + 1,
            // Re-scan after an INSUFFICIENT_STOCK error doesn't clear the error,
            // since bumping the qty makes it more wrong. The user must adjust
            // down or remove. For BARCODE_NOT_FOUND, the manual pick is still
            // valid — leave error alone; user resolves it once.
          };
          return next;
        }

        return [
          ...prev,
          {
            id: makeLineId(),
            barcode,
            itemId: match?.id ?? null,
            name: match?.name ?? null,
            quantity: 1,
            status: 'pending',
            error: null,
          },
        ];
      });
    },
    [items]
  );

  // Keep a ref so long-lived listeners (camera, wedge) always call the latest
  // handler without forcing the listener effect to re-init on every render.
  const handleScanRef = useRef(handleScan);
  useEffect(() => {
    handleScanRef.current = handleScan;
  }, [handleScan]);

  // ── Mobile: camera (mirrors ScanInPage cleanup, with continuous detection) ─
  useEffect(() => {
    if (!isMobile) return undefined;

    let cancelled = false;
    let localControls = null;
    let lastText = '';
    let lastTime = 0;
    const reader = new BrowserMultiFormatReader();
    const videoElement = videoRef.current;

    const start = async () => {
      setCameraStatus('starting');
      setCameraError('');
      try {
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          videoElement,
          (result) => {
            if (cancelled || !result) return;
            const text = result.getText();
            const now = Date.now();
            if (text === lastText && now - lastTime < SCAN_DEBOUNCE_MS) return;
            lastText = text;
            lastTime = now;
            handleScanRef.current(text);
          }
        );
        if (cancelled) {
          controls.stop();
          return;
        }
        localControls = controls;
        controlsRef.current = controls;
        setCameraStatus('running');
      } catch (err) {
        if (cancelled) return;
        console.error('Scanner start error:', err);
        setCameraStatus('error');
        if (
          err?.name === 'NotAllowedError' ||
          err?.name === 'PermissionDeniedError'
        ) {
          setCameraError(
            'Camera permission was denied. Allow camera access in your browser settings.'
          );
        } else if (
          err?.name === 'NotFoundError' ||
          err?.name === 'OverconstrainedError' ||
          err?.name === 'DevicesNotFoundError'
        ) {
          setCameraError('No camera was found on this device.');
        } else {
          setCameraError('Camera could not be started.');
        }
      }
    };

    // Defer init to a microtask. In StrictMode, the first effect's cleanup
    // fires before this timer resolves, so cancelled is true and start()
    // never touches the video element. Only the second effect actually
    // initializes, eliminating the play()/load() race.
    const timer = setTimeout(start, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);

      const controls = localControls || controlsRef.current;
      if (controls) {
        try {
          controls.stop();
        } catch {
          // already stopped
        }
      }
      controlsRef.current = null;

      const video = videoElement;
      if (video) {
        try {
          video.pause();
        } catch {
          // ignore
        }
        const stream = video.srcObject;
        if (stream && typeof stream.getTracks === 'function') {
          stream.getTracks().forEach((track) => track.stop());
        }
        video.srcObject = null;
      }
    };
  }, [isMobile]);

  // ── Desktop: USB barcode scanner (keyboard-wedge) ──────────────────────────
  useEffect(() => {
    if (isMobile) return undefined;

    let buffer = '';

    const handleKey = (e) => {
      // Ignore keys aimed at real text fields so manual-pick search and
      // similar inputs aren't swallowed.
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.target?.isContentEditable) return;

      if (e.key === 'Enter') {
        if (buffer.length >= MIN_BARCODE_LEN) {
          e.preventDefault();
          handleScanRef.current(buffer);
        }
        buffer = '';
        return;
      }

      // Only accumulate single printable characters.
      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMobile]);

  // ── Cart mutations ─────────────────────────────────────────────────────────
  const setLineQuantity = useCallback((id, qty) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        if (line.status === 'done' || line.status === 'submitting') return line;
        const safe = Math.max(1, Math.floor(Number(qty) || 1));
        return {
          ...line,
          quantity: safe,
          error: null,
          status: 'pending',
        };
      })
    );
  }, []);

  const removeLine = useCallback((id) => {
    setLines((prev) =>
      prev.filter((line) => {
        if (line.id !== id) return true;
        // Cannot remove a line that's been submitted to the backend.
        return line.status === 'done' || line.status === 'submitting';
      })
    );
  }, []);

  const pickItemForLine = useCallback((id, item) => {
    setLines((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              itemId: item.id,
              name: item.name,
              status: 'pending',
              error: null,
            }
          : line
      )
    );
  }, []);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    let itemsCount = 0;
    let units = 0;
    for (const line of lines) {
      if (line.status === 'done') continue;
      itemsCount += 1;
      units += line.quantity;
    }
    return { itemsCount, units };
  }, [lines]);

  // ── Submission ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (lines.length === 0) return;

    setGlobalError('');
    setSubmitting(true);

    // Snapshot the work order; new scans during submission are blocked at
    // the UI layer (submit button disabled), but we still iterate the
    // snapshot to avoid any interleaving surprises.
    const snapshot = lines;
    let allSucceededInThisPass = true;
    let aborted = false;

    try {
      for (const line of snapshot) {
        if (line.status === 'done') continue;
        if (line.status === 'error') {
          // User hasn't resolved this; halt so they can act on it.
          allSucceededInThisPass = false;
          break;
        }

        setLines((prev) =>
          prev.map((l) =>
            l.id === line.id ? { ...l, status: 'submitting', error: null } : l
          )
        );

        try {
          const payload = { quantity: line.quantity };
          if (line.itemId) payload.itemId = line.itemId;
          else if (line.barcode) payload.barcode = line.barcode;

          const res = await checkoutApi.checkOut(payload);
          setLines((prev) =>
            prev.map((l) =>
              l.id === line.id
                ? {
                    ...l,
                    status: 'done',
                    name: res?.item?.name || l.name,
                    itemId: res?.item?.id ?? l.itemId,
                  }
                : l
            )
          );
        } catch (err) {
          allSucceededInThisPass = false;
          let errorObj;
          if (err.status === 404 && err.code === 'BARCODE_NOT_FOUND') {
            errorObj = { code: 'BARCODE_NOT_FOUND' };
          } else if (err.status === 409 && err.code === 'INSUFFICIENT_STOCK') {
            errorObj = {
              code: 'INSUFFICIENT_STOCK',
              available: err.body?.available ?? 0,
            };
          } else if (err.status === 403) {
            errorObj = {
              code: 'FORBIDDEN',
              message: 'Only owners can check items out.',
            };
            setGlobalError('Only owners can check items out.');
            aborted = true;
          } else if (err.status === 401) {
            errorObj = {
              code: 'UNAUTHENTICATED',
              message: 'Session expired. Please sign in again.',
            };
            setGlobalError('Session expired. Please sign in again.');
            aborted = true;
          } else {
            errorObj = {
              code: 'OTHER',
              message: err.message || 'Request failed',
            };
          }

          setLines((prev) =>
            prev.map((l) =>
              l.id === line.id ? { ...l, status: 'error', error: errorObj } : l
            )
          );

          if (aborted) break;
          // Pause on first per-line error so the user can fix it.
          break;
        }
      }
    } finally {
      setSubmitting(false);
    }

    // If every line is now 'done', briefly show a confirmation banner then
    // clear the cart and return to a fresh scanning state.
    if (allSucceededInThisPass) {
      setLines((current) => {
        if (current.length > 0 && current.every((l) => l.status === 'done')) {
          const totalUnits = current.reduce((sum, l) => sum + l.quantity, 0);
          setConfirmation({ items: current.length, units: totalUnits });
          confirmationTimerRef.current = setTimeout(() => {
            setLines([]);
            setConfirmation(null);
            setLastScan(null);
            confirmationTimerRef.current = null;
          }, 2200);
        }
        return current;
      });
    }
  }, [submitting, lines]);

  const submitDisabled =
    submitting ||
    lines.length === 0 ||
    lines.every((l) => l.status === 'done') ||
    lines.some((l) => l.status === 'error');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <OwnerHeader
        active='scan-out'
        title='New Trier Township Food Pantry Scan Out'
        mobileTitle='Scan Out'
      />

      <Content $isMobile={isMobile}>
        <Panel>
          <PanelTitle>Scanner</PanelTitle>
          <ScannerBody>
            {isMobile ? (
              <>
                <CameraFrame>
                  <Video ref={videoRef} autoPlay playsInline muted />
                  {cameraStatus === 'running' && <ReticleOverlay />}
                  {cameraStatus === 'starting' && (
                    <StatusOverlay>Starting camera…</StatusOverlay>
                  )}
                  {cameraStatus === 'error' && (
                    <StatusOverlay>Camera unavailable</StatusOverlay>
                  )}
                </CameraFrame>
                {cameraError && <ErrorText>{cameraError}</ErrorText>}
                <ScannerHint>Point the camera at a barcode</ScannerHint>
              </>
            ) : (
              <>
                <ScannerHint>
                  <PulseDot />
                  Ready for USB scanner input
                </ScannerHint>
                <ScannerSubHint>
                  Scan a barcode to add it to the cart. The page is listening
                  while no text field is focused.
                </ScannerSubHint>
              </>
            )}
            {lastScan && (
              <LastScanRow>
                Last scan: <LastScanCode>{lastScan.barcode}</LastScanCode>
              </LastScanRow>
            )}
          </ScannerBody>
        </Panel>

        <CartPanel style={{ position: 'relative' }}>
          <CartHeader>
            <PanelTitle>Cart</PanelTitle>
            <CartSummary>
              {totals.itemsCount} {totals.itemsCount === 1 ? 'line' : 'lines'} ·{' '}
              {totals.units} {totals.units === 1 ? 'unit' : 'units'}
            </CartSummary>
          </CartHeader>

          {globalError && <ErrorText>{globalError}</ErrorText>}

          <CartList>
            {lines.length === 0 ? (
              <EmptyCart>Scan an item to start a checkout.</EmptyCart>
            ) : (
              lines.map((line) => (
                <CartLine
                  key={line.id}
                  line={line}
                  items={items}
                  onQuantityChange={setLineQuantity}
                  onRemove={removeLine}
                  onPickItem={pickItemForLine}
                />
              ))
            )}
          </CartList>

          <Footer>
            <Total>
              <TotalLabel>To remove</TotalLabel>
              <TotalValue>−{totals.units}</TotalValue>
            </Total>
            <SubmitButton
              type='button'
              onClick={handleSubmit}
              disabled={submitDisabled}
            >
              {submitting ? 'Removing…' : 'Complete Checkout'}
            </SubmitButton>
          </Footer>

          {confirmation && (
            <ConfirmationOverlay>
              <div>
                <ConfirmationHeading>Checkout complete</ConfirmationHeading>
                <ConfirmationDetail>
                  {confirmation.items}{' '}
                  {confirmation.items === 1 ? 'item' : 'items'} ·{' '}
                  {confirmation.units}{' '}
                  {confirmation.units === 1 ? 'unit' : 'units'} removed
                </ConfirmationDetail>
              </div>
            </ConfirmationOverlay>
          )}
        </CartPanel>
      </Content>
    </PageWrapper>
  );
}
