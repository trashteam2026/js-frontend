import { useEffect, useMemo, useState } from 'react';
import { FaBarcode } from 'react-icons/fa';
import { FiArrowLeft, FiPrinter, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import PrintQuantityModal from '@/common/components/PrintQuantityModal';
import { barcodeApi, categoriesApi } from '@/services/api';
import {
  openBarcodePrintWindow,
  renderBarcodeSvg,
} from '@/utils/barcodePrint';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #ececec;
  color: #111827;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;

  @media (max-width: 767px) {
    padding: 12px;
  }
`;

const IconButton = styled.button`
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: #d4dce8;
  color: #1f2937;
  cursor: pointer;

  &:hover {
    background: #c6d2e2;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1a2b4a;
`;

const Content = styled.main`
  width: min(620px, calc(100vw - 32px));
  margin: 18px auto 0;
  background: #ffffff;
  border-radius: 8px;
  padding: 28px;
  box-shadow: 0 4px 18px rgba(24, 39, 75, 0.12);

  @media (max-width: 767px) {
    margin-top: 8px;
    padding: 20px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
`;

const HeaderIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #e8f0fb;
  color: #2c5e95;
`;

const Form = styled.form`
  display: grid;
  gap: 18px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: #1a2b4a;
`;

const TextInput = styled.input`
  min-height: 44px;
  border: 1px solid #c8d0dc;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 16px;
  color: #111827;
  outline: none;

  &:focus {
    border-color: #2c5e95;
    box-shadow: 0 0 0 3px rgba(44, 94, 149, 0.15);
  }
`;

const Select = styled.select`
  min-height: 44px;
  border: 1px solid #c8d0dc;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 16px;
  color: #111827;
  background: #ffffff;
  outline: none;

  &:focus {
    border-color: #2c5e95;
    box-shadow: 0 0 0 3px rgba(44, 94, 149, 0.15);
  }
`;

const SubmitButton = styled.button`
  min-height: 46px;
  border: none;
  border-radius: 6px;
  background: #2c5e95;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ $error }) => ($error ? '#c0392b' : '#6b7280')};
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 20px;
`;

const Modal = styled.div`
  width: min(440px, 100%);
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

const ResultTitle = styled.h2`
  margin: 0 28px 12px 0;
  color: #1a2b4a;
  font-size: 21px;
`;

const ResultMeta = styled.div`
  display: grid;
  gap: 5px;
  margin-bottom: 14px;
  font-size: 14px;
  color: #374151;
`;

const BarcodePreview = styled.div`
  display: grid;
  place-items: center;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 16px;

  .barcode-svg {
    width: 100%;
    max-width: 300px;
    height: auto;
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const SecondaryButton = styled.button`
  min-height: 40px;
  border: 1px solid #2c5e95;
  border-radius: 6px;
  background: #ffffff;
  color: #2c5e95;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  cursor: pointer;
`;

export default function BarcodeGeneratorPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  useEffect(() => {
    let mounted = true;

    categoriesApi
      .getAll()
      .then((data) => {
        if (!mounted) return;
        setCategories(data);
        if (data[0]) {
          setCategoryId(String(data[0].id));
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === categoryId),
    [categories, categoryId]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !categoryId || generating) return;

    setGenerating(true);
    setError('');

    try {
      const data = await barcodeApi.generate({
        name: trimmedName,
        categoryId: Number(categoryId),
      });
      setResult(data.item);
      setName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const printResult = (copies) => {
    if (!result) return;
    openBarcodePrintWindow({
      itemName: result.name,
      categoryName: result.category_name,
      barcodes: result.barcodes?.length ? result.barcodes : [result.barcode],
      copies,
    });
    setShowPrintOptions(false);
  };

  return (
    <PageWrapper>
      <TopBar>
        <IconButton
          type='button'
          title='Back to inventory'
          aria-label='Back to inventory'
          onClick={() => navigate('/inventory')}
        >
          <FiArrowLeft size={22} />
        </IconButton>
        <Title>Barcode Generator</Title>
      </TopBar>

      <Content>
        <HeaderRow>
          <HeaderIcon>
            <FaBarcode size={28} />
          </HeaderIcon>
          <Title as='h2'>Create Internal Barcode</Title>
        </HeaderRow>

        <Form onSubmit={handleSubmit}>
          <Field>
            Item Name
            <TextInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Fresh apples'
              disabled={generating || loading}
            />
          </Field>

          <Field>
            Category
            <Select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={generating || loading}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          {error && <StatusText $error>{error}</StatusText>}

          <SubmitButton
            type='submit'
            disabled={!name.trim() || !categoryId || generating || loading}
          >
            <FaBarcode />
            {generating ? 'Generating...' : 'Generate Barcode'}
          </SubmitButton>
        </Form>
      </Content>

      {result && (
        <Overlay onClick={() => setResult(null)}>
          <Modal onClick={(event) => event.stopPropagation()}>
            <CloseButton
              type='button'
              title='Close'
              aria-label='Close'
              onClick={() => setResult(null)}
            >
              <FiX size={22} />
            </CloseButton>
            <ResultTitle>Barcode Created</ResultTitle>
            <ResultMeta>
              <div>
                <strong>Item:</strong> {result.name}
              </div>
              <div>
                <strong>Category:</strong>{' '}
                {result.category_name || selectedCategory?.name || 'Uncategorized'}
              </div>
              <div>
                <strong>Barcode:</strong> {result.barcode}
              </div>
            </ResultMeta>
            <BarcodePreview
              dangerouslySetInnerHTML={{
                __html: renderBarcodeSvg(result.barcode),
              }}
            />
            <ActionRow>
              <SecondaryButton
                type='button'
                onClick={() => setShowPrintOptions(true)}
              >
                <FiPrinter />
                Open Printable PDF
              </SecondaryButton>
              <SecondaryButton
                type='button'
                onClick={() => navigate('/inventory')}
              >
                Back to Inventory
              </SecondaryButton>
            </ActionRow>
          </Modal>
        </Overlay>
      )}

      {showPrintOptions && (
        <PrintQuantityModal
          onClose={() => setShowPrintOptions(false)}
          onPrint={printResult}
        />
      )}
    </PageWrapper>
  );
}
