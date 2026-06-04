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
// Shared confirmation card surface — kept identical to ScanInPage's confirmation
// card so both scanners feel like one system (soft pale blue, dark navy text).
const CONFIRM_BG = '#c9d6e8';
const CONFIRM_BG_HOVER = '#b8c8de';

const PageWrapper = styled.div`
  /* dvh tracks the *visible* viewport on mobile (collapsing browser chrome), so
     the in-flow footer at the bottom of the cart column is always reachable —
     100vh would overshoot and push it under the chrome. */
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #ececec;
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  /* minmax(0, 1fr) (not bare 1fr === minmax(auto, 1fr)) lets the tracks shrink
     below their content's min-content, so a wide child can't push a Panel past
     the viewport and get clipped by overflow:hidden — same guard OwnerHeader
     uses. */
  grid-template-columns: ${(p) =>
    p.$isMobile ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)'};
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
  /* Grid items default to min-width:auto; without this the Panel can't shrink
     below its content and would overflow the track. */
  min-width: 0;

  @media (max-width: 767px) {
    padding: 12px;
    gap: 10px;
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
  min-width: 0;

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
  min-width: 0;
`;

const CartSummary = styled.span`
  font-size: 13px;
  color: #6b7280;
`;

// The cart is the scrolling region of the Cart panel's flex column; it flexes to
// fill the space above the in-flow Footer, so the last item naturally ends above
// the footer with no reserved pixels.
const CartList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
`;

const EmptyCart = styled.p`
  font-size: 14px;
  color: #9ca3af;
  text-align: center;
  margin: 32px 0;
`;

// The footer lives in the Cart panel's flex column as a non-shrinking flow
// element below the scrolling CartList — same stacking context as the cart, so
// it owns its own space and the cart ends above it. It reads as a bottom band
// belonging to the panel: the border-top is the only separation (same as
// desktop), with no elevated-card shadow/border/radius now that it's in flow.
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;
  padding-top: 8px;
  border-top: 1px solid #e8ecf2;

  @media (max-width: 767px) {
    /* In-flow band inside the Panel's own padding — only vertical padding
       (plus safe-area) is needed; horizontal alignment comes from the Panel. */
    padding: 10px 0 env(safe-area-inset-bottom, 0px);
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

// ─── Scan confirmation card (rendered in the scanner region, mirrors ScanInPage)
// Tappable so a scan can be acknowledged early; otherwise it auto-returns after
// the shared hold. Visuals are kept identical to ScanInPage's confirmation card.
const ConfirmCard = styled.button`
  width: 100%;
  max-width: 360px;
  padding: 24px 16px;
  background-color: ${CONFIRM_BG};
  color: ${NAVY_DARK};
  border: none;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background-color: ${CONFIRM_BG_HOVER};
  }
`;

const ConfirmHeading = styled.span`
  font-size: 1rem;
  font-weight: 600;
`;

const ConfirmDetail = styled.span`
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
`;

// Long item names shrink and ellipsize (the card padding is the breathing room)
// instead of overflowing the card — matches ScanInPage's confirmation name.
const ConfirmItemName = styled.span`
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ConfirmHint = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 4px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeLineId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const MIN_BARCODE_LEN = 6;
const SCAN_DEBOUNCE_MS = 1500;

// A line that reaches 'done' holds its "Removed" confirmation this long, then
// fades out (FADE_MS) before being dropped from the cart individually.
const REMOVED_HOLD_MS = 1500;
const FADE_MS = 280; // must match the Wrapper opacity/transform transition in CartLine

// How long the in-scanner scan confirmation holds before auto-returning to
// ready-to-scan. Kept identical to ScanInPage's confirmation hold.
const CONFIRM_HOLD_MS = 1000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ScanOutPage() {
  const isMobile = useIsMobile();

  const [items, setItems] = useState([]);
  const [lines, setLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [lastScan, setLastScan] = useState(null);
  // In-scanner scan confirmation (mirrors ScanInPage). null = ready to scan;
  // otherwise { name, known, barcode } and the scanner region shows the card.
  const [confirmation, setConfirmation] = useState(null);

  const [cameraStatus, setCameraStatus] = useState('starting');
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  // Set while a confirmation is held so a stray detection (mobile) or wedge
  // keystroke (desktop) can't register a second scan mid-hold.
  const scanLockedRef = useRef(false);

  // Per-line fade/removal bookkeeping. scheduledRef guards against
  // double-scheduling the same 'done' line; removalTimersRef holds the live
  // timers so they can be cleared on unmount.
  const scheduledRef = useRef(new Set());
  const removalTimersRef = useRef(new Map());

  useEffect(
    () => () => {
      removalTimersRef.current.forEach((timers) =>
        timers.forEach((t) => clearTimeout(t))
      );
      removalTimersRef.current.clear();
      scheduledRef.current.clear();
    },
    []
  );

  // ── Per-line auto-removal: each line that reaches 'done' shows its "Removed"
  //    confirmation briefly, then fades out and is dropped individually —
  //    independent of whether sibling lines succeeded or errored. Error/pending
  //    lines are left untouched for the user to handle.
  useEffect(() => {
    lines.forEach((line) => {
      if (line.status !== 'done' || scheduledRef.current.has(line.id)) return;
      scheduledRef.current.add(line.id);

      const fadeTimer = setTimeout(() => {
        // Trigger the CSS fade.
        setLines((prev) =>
          prev.map((l) => (l.id === line.id ? { ...l, fading: true } : l))
        );
        const removeTimer = setTimeout(() => {
          setLines((prev) => prev.filter((l) => l.id !== line.id));
          scheduledRef.current.delete(line.id);
          removalTimersRef.current.delete(line.id);
        }, FADE_MS);
        removalTimersRef.current.set(line.id, [removeTimer]);
      }, REMOVED_HOLD_MS);

      removalTimersRef.current.set(line.id, [fadeTimer]);
    });
  }, [lines]);

  // ── Hold the scan confirmation briefly, then auto-return to ready-to-scan and
  //    release the scan lock (mirrors ScanInPage's auto-dismiss).
  useEffect(() => {
    if (!confirmation) return undefined;
    const timer = setTimeout(() => {
      setConfirmation(null);
      scanLockedRef.current = false;
    }, CONFIRM_HOLD_MS);
    return () => clearTimeout(timer);
  }, [confirmation]);

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
      // Ignore detections/keystrokes while a confirmation is being held.
      if (scanLockedRef.current) return;
      const barcode = String(rawBarcode || '').trim();
      if (!barcode) return;

      setLastScan({ barcode, at: Date.now() });

      // Resolve from the loaded catalog so the cart shows the item name
      // immediately instead of waiting for /check-out to echo it back.
      // A truly unknown barcode stays nameless and falls through to the
      // existing BARCODE_NOT_FOUND manual-pick flow on submit.
      const match = items.find((it) => it.barcode === barcode);

      // Acknowledge the scan in the scanner region (mirrors ScanInPage): pause
      // scanning and show the item name, or a clear not-in-catalog message,
      // then auto-return. The cart line is still added/bumped below as before.
      scanLockedRef.current = true;
      setConfirmation({
        name: match?.name ?? null,
        known: Boolean(match),
        barcode,
      });

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

  // Tapping the confirmation returns to the scanner early (mirrors ScanInPage).
  const handleConfirmationTap = useCallback(() => {
    setConfirmation(null);
    scanLockedRef.current = false;
  }, []);

  // ── Mobile: camera (mirrors ScanInPage cleanup, with continuous detection) ─
  //    While a confirmation is held we tear the camera down and render the card
  //    in the scanner's place (as ScanInPage does), then restart on return.
  useEffect(() => {
    if (!isMobile || confirmation) return undefined;

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
  }, [isMobile, confirmation]);

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
    let aborted = false;

    try {
      for (const line of snapshot) {
        if (line.status === 'done') continue;
        if (line.status === 'error') {
          // User hasn't resolved this; halt so they can act on it.
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

    // Each line that reached 'done' is now picked up by the per-line fade
    // effect, which shows its "Removed" state briefly and then drops it from
    // the cart individually — no all-or-nothing bulk clear.
  }, [submitting, lines]);

  const submitDisabled =
    submitting ||
    lines.length === 0 ||
    lines.every((l) => l.status === 'done') ||
    lines.some((l) => l.status === 'error');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <OwnerHeader active='scan-out' title='Scan Out' mobileTitle='Scan Out' />

      <Content $isMobile={isMobile}>
        <Panel>
          <PanelTitle>Scanner</PanelTitle>
          <ScannerBody>
            {confirmation ? (
              <ConfirmCard
                type='button'
                onClick={handleConfirmationTap}
                aria-label='Continue scanning'
              >
                {confirmation.known ? (
                  <>
                    <ConfirmHeading>Added to cart</ConfirmHeading>
                    <ConfirmDetail>
                      <ConfirmItemName>{confirmation.name}</ConfirmItemName>
                    </ConfirmDetail>
                  </>
                ) : (
                  <>
                    <ConfirmHeading>Not in catalog</ConfirmHeading>
                    <ConfirmDetail>
                      <ConfirmItemName>
                        Barcode {confirmation.barcode}
                      </ConfirmItemName>
                    </ConfirmDetail>
                  </>
                )}
                <ConfirmHint>Tap to scan another</ConfirmHint>
              </ConfirmCard>
            ) : isMobile ? (
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
            {lastScan && !confirmation && (
              <LastScanRow>
                Last scan: <LastScanCode>{lastScan.barcode}</LastScanCode>
              </LastScanRow>
            )}
          </ScannerBody>
        </Panel>

        <Panel>
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
        </Panel>
      </Content>
    </PageWrapper>
  );
}
