const UPC_A_PATTERNS = {
  L: {
    0: '0001101',
    1: '0011001',
    2: '0010011',
    3: '0111101',
    4: '0100011',
    5: '0110001',
    6: '0101111',
    7: '0111011',
    8: '0110111',
    9: '0001011',
  },
  R: {
    0: '1110010',
    1: '1100110',
    2: '1101100',
    3: '1000010',
    4: '1011100',
    5: '1001110',
    6: '1010000',
    7: '1000100',
    8: '1001000',
    9: '1110100',
  },
};

const CODE_128_B_VALUES = {
  ' ': 0,
  '!': 1,
  '"': 2,
  '#': 3,
  $: 4,
  '%': 5,
  '&': 6,
  "'": 7,
  '(': 8,
  ')': 9,
  '*': 10,
  '+': 11,
  ',': 12,
  '-': 13,
  '.': 14,
  '/': 15,
  0: 16,
  1: 17,
  2: 18,
  3: 19,
  4: 20,
  5: 21,
  6: 22,
  7: 23,
  8: 24,
  9: 25,
  ':': 26,
  ';': 27,
  '<': 28,
  '=': 29,
  '>': 30,
  '?': 31,
  '@': 32,
  A: 33,
  B: 34,
  C: 35,
  D: 36,
  E: 37,
  F: 38,
  G: 39,
  H: 40,
  I: 41,
  J: 42,
  K: 43,
  L: 44,
  M: 45,
  N: 46,
  O: 47,
  P: 48,
  Q: 49,
  R: 50,
  S: 51,
  T: 52,
  U: 53,
  V: 54,
  W: 55,
  X: 56,
  Y: 57,
  Z: 58,
  '[': 59,
  '\\': 60,
  ']': 61,
  '^': 62,
  _: 63,
  '`': 64,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  '{': 91,
  '|': 92,
  '}': 93,
  '~': 94,
};

const CODE_128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213',
  '122312', '132212', '221213', '221312', '231212', '112232', '122132',
  '122231', '113222', '123122', '123221', '223211', '221132', '221231',
  '213212', '223112', '312131', '311222', '321122', '321221', '312212',
  '322112', '322211', '212123', '212321', '232121', '111323', '131123',
  '131321', '112313', '132113', '132311', '211313', '231113', '231311',
  '112133', '112331', '132131', '113123', '113321', '133121', '313121',
  '211331', '231131', '213113', '213311', '213131', '311123', '311321',
  '331121', '312113', '312311', '332111', '314111', '221411', '431111',
  '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114',
  '413111', '241112', '134111', '111242', '121142', '121241', '114212',
  '124112', '124211', '411212', '421112', '421211', '212141', '214121',
  '412121', '111143', '111341', '131141', '114113', '114311', '411113',
  '411311', '113141', '114131', '311141', '411131', '211412', '211214',
  '211232', '2331112',
];

export function isUpcA(value) {
  return /^\d{12}$/.test(String(value || ''));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderUpcASvg(value, { width = 224, height = 92 } = {}) {
  const barcode = String(value || '');
  if (!isUpcA(barcode)) {
    return `<div class="plain-barcode">${barcode}</div>`;
  }

  const left = barcode.slice(0, 6);
  const right = barcode.slice(6);
  const bits = [
    '101',
    ...left.split('').map((digit) => UPC_A_PATTERNS.L[digit]),
    '01010',
    ...right.split('').map((digit) => UPC_A_PATTERNS.R[digit]),
    '101',
  ].join('');
  const moduleWidth = width / 95;
  const barHeight = height - 20;
  const bars = [];

  for (let index = 0; index < bits.length; index += 1) {
    if (bits[index] !== '1') continue;
    const isGuard = index < 3 || (index >= 45 && index < 50) || index >= 92;
    bars.push(
      `<rect x="${(index * moduleWidth).toFixed(2)}" y="0" width="${moduleWidth.toFixed(
        2
      )}" height="${isGuard ? barHeight + 8 : barHeight}" fill="#111827" />`
    );
  }

  return `
    <svg class="barcode-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="UPC ${barcode}">
      ${bars.join('')}
      <text x="${width / 2}" y="${height - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" letter-spacing="2">${barcode}</text>
    </svg>
  `;
}

export function renderCode128Svg(value, { width = 224, height = 92 } = {}) {
  const barcode = String(value || '').replace(/[^\x20-\x7e]/g, '');
  if (!barcode) {
    return '<div class="plain-barcode">No barcode</div>';
  }

  const values = barcode
    .split('')
    .map((char) => CODE_128_B_VALUES[char])
    .filter((code) => code !== undefined);
  let checksum = 104;
  values.forEach((code, index) => {
    checksum += code * (index + 1);
  });

  const codes = [104, ...values, checksum % 103, 106];
  const modules = codes.flatMap((code) =>
    CODE_128_PATTERNS[code].split('').map((digit) => Number.parseInt(digit, 10))
  );
  const moduleTotal = modules.reduce((total, current) => total + current, 0);
  const moduleWidth = width / moduleTotal;
  const barHeight = height - 20;
  let x = 0;
  const bars = [];

  modules.forEach((moduleCount, index) => {
    const segmentWidth = moduleCount * moduleWidth;
    if (index % 2 === 0) {
      bars.push(
        `<rect x="${x.toFixed(2)}" y="0" width="${segmentWidth.toFixed(
          2
        )}" height="${barHeight}" fill="#111827" />`
      );
    }
    x += segmentWidth;
  });

  return `
    <svg class="barcode-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Barcode ${escapeHtml(barcode)}">
      ${bars.join('')}
      <text x="${width / 2}" y="${height - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" letter-spacing="1">${escapeHtml(barcode)}</text>
    </svg>
  `;
}

export function renderBarcodeSvg(value, options) {
  return isUpcA(value) ? renderUpcASvg(value, options) : renderCode128Svg(value, options);
}

export function openBarcodePrintWindow({
  itemName,
  categoryName,
  barcodes,
  copies = 1,
}) {
  const printableBarcodes = (barcodes || [])
    .map((entry) =>
      typeof entry === 'string' ? { barcode: entry } : { barcode: entry.barcode }
    )
    .filter((entry) => entry.barcode);

  if (printableBarcodes.length === 0) {
    return;
  }

  const copyCount = Math.max(1, Number.parseInt(copies, 10) || 1);
  const labels = printableBarcodes
    .flatMap((entry) => Array.from({ length: copyCount }, () => entry))
    .map(
      ({ barcode }) => `
        <section class="label">
          <div class="item-name">${escapeHtml(itemName)}</div>
          <div class="category-name">${escapeHtml(categoryName || 'Uncategorized')}</div>
          ${renderBarcodeSvg(barcode)}
        </section>
      `
    )
    .join('');

  const html = `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(itemName)} Barcodes</title>
        <style>
          @page { size: letter; margin: 0.45in; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #111827;
            font-family: Arial, sans-serif;
          }
          .sheet {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.22in;
          }
          .label {
            min-height: 1.65in;
            border: 1px dashed #9ca3af;
            padding: 0.14in;
            break-inside: avoid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .item-name {
            max-width: 100%;
            font-size: 15px;
            font-weight: 700;
            text-align: center;
            overflow-wrap: anywhere;
          }
          .category-name {
            margin-top: 2px;
            font-size: 11px;
            color: #4b5563;
            text-align: center;
            overflow-wrap: anywhere;
          }
          .barcode-svg {
            width: 100%;
            max-width: 2.7in;
            height: auto;
            margin-top: 0.08in;
          }
          .plain-barcode {
            margin-top: 0.12in;
            font-family: "Courier New", monospace;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          @media print {
            .label { border-color: #d1d5db; }
          }
        </style>
      </head>
      <body>
        <main class="sheet">${labels}</main>
        <script>
          window.addEventListener('load', () => {
            window.focus();
            window.print();
          });
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
