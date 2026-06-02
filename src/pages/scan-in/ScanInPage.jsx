import { useEffect, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiCheck,
  FiEdit2,
  FiList,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import PantryLogo from '@/assets/icons/pantry-logo.svg';
import { useUser } from '@/common/contexts/UserContext';
import {
  addItem,
  fetchCategories,
  lookupByBarcode,
} from '@/common/utils/volunteerInventory';
import { auth } from '@/firebase-config';
import { activityApi, volunteerApi } from '@/services/api';
import { BrowserMultiFormatReader } from '@zxing/browser';
import styled from 'styled-components';

import ItemForm from './ItemForm';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 32px;
  position: relative;
  background-color: #ffffff;
`;

const BackButton = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2a4d8f;
  color: #ffffff;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background-color: #1e3a6e;
  }

  svg {
    color: #ffffff;
    stroke: #ffffff;
  }

  @media (max-width: 767px) {
    width: 44px;
    height: 44px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 56px;
`;

const Logo = styled.img`
  width: 110px;
  height: 110px;
`;

const Title = styled.h1`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  color: #1a2b4a;
  max-width: 280px;
  line-height: 1.3;
`;

const Divider = styled.hr`
  width: 100%;
  max-width: 320px;
  border: none;
  border-top: 1px solid #d6dce8;
  margin: 20px 0 16px;
`;

const SectionWrapper = styled.div`
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

const Instruction = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: #1a2b4a;
  margin: 0;
  text-align: center;
`;

const CameraFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  background-color: #0b1220;
  border: 2px solid #2a4d8f;
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

const ErrorText = styled.p`
  margin: 0;
  color: #b00020;
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.4;
`;

const OrText = styled.span`
  font-size: 0.85rem;
  color: #6b7280;
  text-transform: lowercase;
  letter-spacing: 0.05em;
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background-color: #ffffff;
  color: #2a4d8f;
  border: 1.5px solid #2a4d8f;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background-color: #f0f3f8;
  }
`;

const FinishButton = styled(SecondaryButton)`
  color: #ffffff;
  background-color: #2a4d8f;
  border-color: #2a4d8f;

  &:hover {
    background-color: #1e3a6e;
  }
`;

const ConfirmCard = styled.button`
  width: 100%;
  padding: 24px 16px;
  background-color: #2a4d8f;
  color: #ffffff;
  border: none;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background-color: #1e3a6e;
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
`;

const ConfirmHint = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 4px;
`;

const VolunteerBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f0f4fa;
  border-radius: 9999px;
  padding: 5px 12px 5px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a2b4a;
  max-width: 160px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  svg {
    flex-shrink: 0;
    color: #2a4d8f;
  }
`;

const ItemsCount = styled.span`
  font-size: 0.72rem;
  color: #6b7280;
  font-weight: 400;
`;

const HistoryButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f0f4fa;
  border: none;
  border-radius: 9999px;
  padding: 5px 12px 5px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a2b4a;
  cursor: pointer;
  max-width: 180px;

  svg {
    flex-shrink: 0;
    color: #2a4d8f;
  }

  &:hover {
    background: #dbe6f5;
  }
`;

const HistoryPanel = styled.div`
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 56px;
`;

const HistoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const HistoryTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1a2b4a;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: grid;
  place-items: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    color: #1a2b4a;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 180px);
  padding-bottom: 16px;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px 14px;
`;

const HistoryIndex = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2a4d8f;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const HistoryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const HistoryName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a2b4a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HistoryMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
`;

const HistoryQty = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a2b4a;
  background: #e0eaf7;
  border-radius: 9999px;
  padding: 2px 10px;
  white-space: nowrap;
`;

const SessionEndedOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(11, 18, 32, 0.7);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 24px;
`;

const SessionEndedCard = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 32px 28px;
  max-width: 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
`;

const SessionEndedTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a2b4a;
`;

const SessionEndedBody = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.4;
`;

const SessionEndedButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #2a4d8f;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #1e3a6e;
  }
`;

const EmptyHistory = styled.p`
  text-align: center;
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 32px 0;
`;

const HistoryActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: grid;
  place-items: center;
  padding: 5px;
  border-radius: 4px;

  &:hover {
    color: #1a2b4a;
    background: #e9eef5;
  }
`;

const DeleteBtn = styled(ActionBtn)`
  &:hover {
    color: #dc2626;
    background: #fee2e2;
  }
`;

const QtyEditInput = styled.input`
  width: 54px;
  border: 1.5px solid #2a4d8f;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a2b4a;
  text-align: center;
  outline: none;
  background: #fff;
`;

const EditError = styled.p`
  font-size: 0.72rem;
  color: #dc2626;
  margin: 4px 0 0;
  text-align: center;
`;

export default function ScanInPage() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  // view: 'camera' | 'form' | 'confirmation'
  const [view, setView] = useState('camera');
  const [formMode, setFormMode] = useState('scanned');
  const [pendingBarcode, setPendingBarcode] = useState(null);
  const [pendingLookup, setPendingLookup] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cameraStatus, setCameraStatus] = useState('starting');
  const [cameraError, setCameraError] = useState('');
  const [volunteerName, setVolunteerName] = useState('');
  const [itemsScanned, setItemsScanned] = useState(0);
  const [sessionItems, setSessionItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const result = await fetchCategories();
        if (!cancelled) setCategories(result);
      } catch (err) {
        console.error('Category load error:', err);
      }
    };

    const loadProfile = async () => {
      const attempt = async () => {
        const profile = await volunteerApi.getMyProfile();
        if (!cancelled) {
          setVolunteerName(profile.name || '');
          setItemsScanned(profile.itemsScanned || 0);
        }
      };

      try {
        await attempt();
      } catch (err) {
        // A 403/SESSION_ENDED means this volunteer IS registered but the owner
        // ended or regenerated the code — that's a definitive dead session, so
        // show the overlay immediately.
        if (
          !cancelled &&
          (err.code === 'SESSION_ENDED' || err.status === 403)
        ) {
          setSessionEnded(true);
          return;
        }

        // A 404 ("No active volunteer session") can be a transient race: a
        // volunteer who just entered a valid code may reach /scan-in before their
        // POST /register has committed. Retry once after a short delay before
        // declaring the session dead, so a just-registered volunteer isn't bounced
        // to the "Code No Longer Active" overlay. If it's still 404 (or now 403)
        // after the retry, the session is genuinely gone.
        if (err.status === 404) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (cancelled) return;
          try {
            await attempt();
          } catch (retryErr) {
            if (
              !cancelled &&
              (retryErr.code === 'SESSION_ENDED' ||
                retryErr.status === 403 ||
                retryErr.status === 404)
            ) {
              setSessionEnded(true);
            }
          }
        }
        // otherwise non-fatal
      }
    };

    loadCategories();
    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // Poll every 10 s so volunteers are evicted promptly when the owner ends the session.
  // 404 (owner ended the session / backend restarted) is handled the same as a
  // regenerated code (403/SESSION_ENDED) — all three mean this code is dead.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await volunteerApi.getMyProfile();
      } catch (err) {
        if (
          err.code === 'SESSION_ENDED' ||
          err.status === 403 ||
          err.status === 404
        ) {
          setSessionEnded(true);
        }
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (view !== 'camera') return undefined;

    let cancelled = false;
    let localControls = null;
    const reader = new BrowserMultiFormatReader();
    const videoElement = videoRef.current;

    const handleBarcodeDetected = async (barcode) => {
      setPendingBarcode(barcode);
      setPendingLookup(null);

      try {
        const lookupResult = await lookupByBarcode(barcode);
        setPendingLookup(lookupResult);
      } catch (err) {
        console.error('Barcode lookup error:', err);
      }

      setFormMode('scanned');
      setView('form');
    };

    const start = async () => {
      setCameraStatus('starting');
      setCameraError('');
      try {
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          videoElement,
          (result, _err, ctrl) => {
            if (cancelled || !result) return;
            ctrl.stop();
            controlsRef.current = null;
            void handleBarcodeDetected(result.getText());
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
            'Camera permission was denied. Allow camera access in your browser settings, or add items manually below.'
          );
        } else if (
          err?.name === 'NotFoundError' ||
          err?.name === 'OverconstrainedError' ||
          err?.name === 'DevicesNotFoundError'
        ) {
          setCameraError(
            'No camera was found on this device. You can still add items manually below.'
          );
        } else {
          setCameraError(
            'Camera could not be started. You can still add items manually below.'
          );
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

      // Force-release the camera so the next mount can attach a fresh stream
      // without colliding with an in-flight play() promise.
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
  }, [view]);

  // Auto-dismiss the confirmation card after a short delay.
  useEffect(() => {
    if (view !== 'confirmation') return undefined;
    const timer = setTimeout(() => {
      setConfirmation(null);
      setPendingBarcode(null);
      setPendingLookup(null);
      setView('camera');
    }, 1500);
    return () => clearTimeout(timer);
  }, [view]);

  const goBackToScanner = () => {
    setPendingBarcode(null);
    setPendingLookup(null);
    setConfirmation(null);
    setView('camera');
  };

  const handleFinish = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/', { replace: true });
    }
  };

  const handleBack = handleFinish;

  const handleAddManually = () => {
    setPendingBarcode(null);
    setPendingLookup(null);
    setFormMode('manual');
    setView('form');
  };

  const handleFormSubmit = async (data) => {
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => null);
      const result = await addItem({
        ...data,
        categories,
        volunteerName: volunteerName || null,
        volunteerToken: token,
      });
      setItemsScanned((n) => n + 1);
      setSessionItems((prev) => [
        {
          name: data.name,
          quantity: data.quantity,
          timestamp: new Date(),
          activityLogId: result?.activityLogId ?? null,
          batchId: result?.batch?.id ?? null,
        },
        ...prev,
      ]);
      setConfirmation({ count: data.quantity, name: data.name });
      setView('confirmation');
    } catch (err) {
      if (err.code === 'SESSION_ENDED' || err.status === 403) {
        setSessionEnded(true);
        return;
      }
      console.error('Save item error:', err);
      throw err;
    }
  };

  const handleEditStart = (index) => {
    setEditingIndex(index);
    setEditQty(String(sessionItems[index].quantity));
    setEditError('');
  };

  const handleEditCancel = () => {
    setEditingIndex(null);
    setEditQty('');
    setEditError('');
  };

  const handleEditSave = async (index) => {
    const newQty = parseInt(editQty, 10);
    if (!Number.isInteger(newQty) || newQty <= 0) {
      setEditError('Enter a valid quantity');
      return;
    }
    const item = sessionItems[index];
    if (!item.activityLogId) {
      setEditError('Cannot edit — no log reference');
      return;
    }
    setSavingEdit(true);
    setEditError('');
    try {
      await activityApi.updateLog(item.activityLogId, newQty);
      setSessionItems((prev) =>
        prev.map((s, i) => (i === index ? { ...s, quantity: newQty } : s))
      );
      setEditingIndex(null);
      setEditQty('');
    } catch (err) {
      setEditError(err.message || 'Failed to save');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (index) => {
    const item = sessionItems[index];
    if (!item.activityLogId) return;
    try {
      await activityApi.deleteLog(item.activityLogId);
      setSessionItems((prev) => prev.filter((_, i) => i !== index));
      setItemsScanned((n) => Math.max(0, n - 1));
      if (editingIndex === index) setEditingIndex(null);
    } catch (err) {
      console.error('Delete log error:', err);
    }
  };

  const handleConfirmationTap = () => {
    setConfirmation(null);
    setPendingBarcode(null);
    setPendingLookup(null);
    setView('camera');
  };

  const showHeader = view !== 'form' && view !== 'history';

  return (
    <PageWrapper>
      {view !== 'form' && (
        <BackButton
          type='button'
          onClick={handleBack}
          aria-label='Log out and return to landing'
        >
          <FiArrowLeft size={20} />
        </BackButton>
      )}

      {view !== 'form' && view !== 'history' && volunteerName && (
        <HistoryButton
          type='button'
          onClick={() => setView('history')}
          aria-label='View scanned items'
        >
          <FiList size={13} />
          {volunteerName}
          {itemsScanned > 0 && <ItemsCount>&nbsp;· {itemsScanned}</ItemsCount>}
        </HistoryButton>
      )}

      {showHeader && (
        <>
          <LogoSection>
            <Logo src={PantryLogo} alt='New Trier Township seal' />
            <Title>New Trier Township Food Pantry Check-in System</Title>
          </LogoSection>
          <Divider />
        </>
      )}

      {view === 'camera' && (
        <SectionWrapper>
          <Instruction>Scan your item to begin</Instruction>
          <CameraFrame>
            <Video ref={videoRef} autoPlay playsInline muted />
            {cameraStatus === 'running' && <ReticleOverlay />}
            {cameraStatus === 'starting' && (
              <StatusOverlay>Starting camera...</StatusOverlay>
            )}
            {cameraStatus === 'error' && (
              <StatusOverlay>Camera unavailable</StatusOverlay>
            )}
          </CameraFrame>
          {cameraError && <ErrorText>{cameraError}</ErrorText>}
          <OrText>or</OrText>
          <SecondaryButton type='button' onClick={handleAddManually}>
            Add Item(s) Manually
          </SecondaryButton>
          <FinishButton type='button' onClick={handleFinish}>
            Finish Scanning
          </FinishButton>
        </SectionWrapper>
      )}

      {view === 'form' && (
        <ItemForm
          key={`${formMode}:${pendingBarcode || 'manual'}:${pendingLookup?.productName || ''}`}
          mode={formMode}
          initialBarcode={pendingBarcode}
          initialCategory={pendingLookup?.categoryName || ''}
          initialCategoryId={pendingLookup?.categoryId ?? null}
          initialName={pendingLookup?.productName || ''}
          lookupSource={pendingLookup?.source || null}
          categoryOptions={categories}
          onSubmit={handleFormSubmit}
          onCancel={goBackToScanner}
        />
      )}

      {view === 'history' && (
        <HistoryPanel>
          <HistoryHeader>
            <HistoryTitle>
              <FiList
                size={15}
                style={{ marginRight: 6, verticalAlign: 'middle' }}
              />
              This Session
            </HistoryTitle>
            <CloseButton
              type='button'
              onClick={goBackToScanner}
              aria-label='Close history'
            >
              <FiX size={20} />
            </CloseButton>
          </HistoryHeader>

          {sessionItems.length === 0 ? (
            <EmptyHistory>No items scanned yet.</EmptyHistory>
          ) : (
            <HistoryList>
              {sessionItems.map((item, i) => (
                <HistoryItem key={i}>
                  <HistoryIndex>{sessionItems.length - i}</HistoryIndex>
                  <HistoryInfo>
                    <HistoryName>{item.name}</HistoryName>
                    <HistoryMeta>
                      {item.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </HistoryMeta>
                    {editingIndex === i && editError && (
                      <EditError>{editError}</EditError>
                    )}
                  </HistoryInfo>
                  {editingIndex === i ? (
                    <HistoryActions>
                      <QtyEditInput
                        type='number'
                        min='1'
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave(i);
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        autoFocus
                        disabled={savingEdit}
                      />
                      <ActionBtn
                        type='button'
                        aria-label='Save'
                        onClick={() => handleEditSave(i)}
                        disabled={savingEdit}
                      >
                        <FiCheck size={15} />
                      </ActionBtn>
                      <ActionBtn
                        type='button'
                        aria-label='Cancel'
                        onClick={handleEditCancel}
                        disabled={savingEdit}
                      >
                        <FiX size={15} />
                      </ActionBtn>
                    </HistoryActions>
                  ) : (
                    <HistoryActions>
                      <HistoryQty>×{item.quantity}</HistoryQty>
                      {item.activityLogId && (
                        <>
                          <ActionBtn
                            type='button'
                            aria-label='Edit quantity'
                            onClick={() => handleEditStart(i)}
                          >
                            <FiEdit2 size={13} />
                          </ActionBtn>
                          <DeleteBtn
                            type='button'
                            aria-label='Delete entry'
                            onClick={() => handleDelete(i)}
                          >
                            <FiTrash2 size={13} />
                          </DeleteBtn>
                        </>
                      )}
                    </HistoryActions>
                  )}
                </HistoryItem>
              ))}
            </HistoryList>
          )}
        </HistoryPanel>
      )}

      {view === 'confirmation' && confirmation && (
        <SectionWrapper>
          <ConfirmCard
            type='button'
            onClick={handleConfirmationTap}
            aria-label='Continue scanning'
          >
            <ConfirmHeading>Complete!</ConfirmHeading>
            <ConfirmDetail>
              {confirmation.count} {confirmation.name} Added!
            </ConfirmDetail>
            <ConfirmHint>Tap to scan another</ConfirmHint>
          </ConfirmCard>
        </SectionWrapper>
      )}

      {sessionEnded && (
        <SessionEndedOverlay>
          <SessionEndedCard>
            <SessionEndedTitle>Code No Longer Active</SessionEndedTitle>
            <SessionEndedBody>
              This volunteer code is no longer active or has expired. You can
              leave this screen now.
            </SessionEndedBody>
            <SessionEndedButton type='button' onClick={handleFinish}>
              Leave
            </SessionEndedButton>
          </SessionEndedCard>
        </SessionEndedOverlay>
      )}
    </PageWrapper>
  );
}
