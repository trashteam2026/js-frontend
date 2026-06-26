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
  '212222',
  '222122',
  '222221',
  '121223',
  '121322',
  '131222',
  '122213',
  '122312',
  '132212',
  '221213',
  '221312',
  '231212',
  '112232',
  '122132',
  '122231',
  '113222',
  '123122',
  '123221',
  '223211',
  '221132',
  '221231',
  '213212',
  '223112',
  '312131',
  '311222',
  '321122',
  '321221',
  '312212',
  '322112',
  '322211',
  '212123',
  '212321',
  '232121',
  '111323',
  '131123',
  '131321',
  '112313',
  '132113',
  '132311',
  '211313',
  '231113',
  '231311',
  '112133',
  '112331',
  '132131',
  '113123',
  '113321',
  '133121',
  '313121',
  '211331',
  '231131',
  '213113',
  '213311',
  '213131',
  '311123',
  '311321',
  '331121',
  '312113',
  '312311',
  '332111',
  '314111',
  '221411',
  '431111',
  '111224',
  '111422',
  '121124',
  '121421',
  '141122',
  '141221',
  '112214',
  '112412',
  '122114',
  '122411',
  '142112',
  '142211',
  '241211',
  '221114',
  '413111',
  '241112',
  '134111',
  '111242',
  '121142',
  '121241',
  '114212',
  '124112',
  '124211',
  '411212',
  '421112',
  '421211',
  '212141',
  '214121',
  '412121',
  '111143',
  '111341',
  '131141',
  '114113',
  '114311',
  '411113',
  '411311',
  '113141',
  '114131',
  '311141',
  '411131',
  '211412',
  '211214',
  '211232',
  '2331112',
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
    <svg class="barcode-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="UPC ${barcode}">
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
    <svg class="barcode-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Barcode ${escapeHtml(barcode)}">
      ${bars.join('')}
      <text x="${width / 2}" y="${height - 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" letter-spacing="1">${escapeHtml(barcode)}</text>
    </svg>
  `;
}

export function renderBarcodeSvg(value, options) {
  return isUpcA(value)
    ? renderUpcASvg(value, options)
    : renderCode128Svg(value, options);
}

export function openBarcodePrintWindow({
  itemName,
  categoryName,
  barcodes,
  copies = 1,
}) {
  const printableBarcodes = (barcodes || [])
    .map((entry) =>
      typeof entry === 'string'
        ? { barcode: entry }
        : { barcode: entry.barcode }
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
          /* Pin the page to the physical media: DYMO LabelWriter 4XL loaded with
             DYMO Large Multipurpose Labels #30258 (2.125in x 2.75in). Pinning the
             size stops the layout from defaulting to Letter and overflowing the
             small label. margin: 0 lets content fill the whole label. */
          @page { size: 2.125in 2.75in; margin: 0; }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            color: #111827;
            font-family: Arial, sans-serif;
          }
          /* No grid: one label per page so a roll/label printer feeds one
             label per print. */
          .sheet { display: block; }
          .label {
            /* Fill the full printable page (one label). Small physical padding
               so we don't waste the tiny 2.125in x 2.75in label area. */
            width: 100%;
            min-height: 100vh;
            padding: 0.08in;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Page break after every label except the last, so N copies feed as
             N separate labels with no trailing blank label. */
          .label:not(:last-child) {
            break-after: page;
            page-break-after: always;
          }
          /* Physical (pt) text sizes, stable for the known 2.125in-wide #30258
             label. (vw would be ~0.15in tall here — too small to read.) */
          .item-name {
            max-width: 100%;
            font-size: 10pt;
            font-weight: 700;
            line-height: 1.1;
            overflow-wrap: anywhere;
          }
          .category-name {
            margin-top: 1.5%;
            max-width: 100%;
            font-size: 8pt;
            color: #4b5563;
            line-height: 1.1;
            overflow-wrap: anywhere;
          }
          .barcode-svg {
            /* Fill ~92% of the label width (leaves a small quiet zone on each
               side for reliable scanning). On the 2.125in x 2.75in #30258 label
               the barcode is width-constrained, so max-height: 60vh (~1.65in)
               does not bind; it stays as a safety cap. The viewBox preserves
               aspect ratio so it letterboxes rather than distorts. */
            width: 92%;
            max-height: 60vh;
            height: auto;
            margin-top: 4%;
            display: block;
          }
          .plain-barcode {
            margin-top: 4%;
            font-family: "Courier New", monospace;
            font-size: 11pt;
            font-weight: 700;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <main class="sheet">${labels}</main>
      </body>
    </html>
  `;

  // Render and print into a hidden, off-screen iframe rather than a popup
  // window/tab. This prints in-place (no blank tab left behind, no popup
  // blocker). A single, fixed-id iframe is reused so repeated prints can never
  // accumulate orphaned iframes in the DOM.
  const PRINT_FRAME_ID = 'barcode-print-frame';
  const stale = document.getElementById(PRINT_FRAME_ID);
  if (stale) {
    stale.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = PRINT_FRAME_ID;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

  let printed = false;
  let removed = false;
  let removeTimer = null;

  const removeFrame = () => {
    if (removed) return;
    removed = true;
    if (removeTimer) {
      clearTimeout(removeTimer);
      removeTimer = null;
    }
    iframe.remove();
  };

  // Fire print exactly once, regardless of how many times `load` fires.
  const triggerPrint = () => {
    if (printed) return;
    printed = true;

    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      removeFrame();
      return;
    }

    // Remove the iframe once the print dialog closes. Fall back to a timeout in
    // case `afterprint` never fires (some browsers, or a dismissed dialog), so
    // we never leak the iframe.
    frameWindow.addEventListener('afterprint', removeFrame);
    removeTimer = window.setTimeout(removeFrame, 60000);

    frameWindow.focus();
    frameWindow.print();
  };

  // Print after the iframe's content (and its inline SVGs) has loaded.
  iframe.addEventListener('load', triggerPrint);

  // srcdoc gives a single, reliable load event once the document is parsed,
  // and the srcdoc document is same-origin so we can call print() on it.
  iframe.srcdoc = html;
  document.body.appendChild(iframe);

  // Small safety net in case the load event doesn't fire; guarded by `printed`
  // so it can never cause a second print.
  window.setTimeout(triggerPrint, 1000);
}
