// ── HELPERS ────────────────────────────────────────────
function v(id) { return parseFloat(document.getElementById(id).value) || 0; }
function s(id) { return document.getElementById(id).value.trim(); }
function fmt(n) { return '$' + Math.abs(n).toFixed(2); }

// ── STORED RESULTS (used by printReport) ───────────────
let lastCalc = {};

// ── MAIN CALCULATION ───────────────────────────────────
function calc() {

  // Read all inputs
  const spoolCost       = v('spoolCost');
  const spoolWeight     = v('spoolWeight');
  const filamentPerPart = v('filamentPerPart');
  const failureRate     = v('failureRate') / 100;
  const packQty         = Math.max(1, Math.round(v('packQty')));
  const printTime       = v('printTime');
  const handTime        = v('handTime');
  const laborRate       = v('laborRate');
  const txFee           = v('txFee') / 100;
  const payFee          = v('payFee') / 100;
  const listingFee      = v('listingFee');
  const packagingCost   = v('packagingCost');
  const shippingCharged = v('shippingCharged');
  const shippingActual  = v('shippingActual');
  const salePrice       = v('salePrice');

  // Math
  const costPerGram     = spoolWeight > 0 ? spoolCost / spoolWeight : 0;
  const materialTotal   = filamentPerPart * costPerGram * packQty * (1 + failureRate);
  const minutesPerPart  = printTime + handTime;
  const laborTotal      = (minutesPerPart / 60) * laborRate * packQty;
  const platformFees    = (salePrice * (txFee + payFee)) + listingFee;
  const shippingDelta   = shippingCharged - shippingActual;
  const totalCost       = materialTotal + laborTotal + platformFees + packagingCost - shippingDelta;
  const profit          = salePrice - totalCost;
  const margin          = salePrice > 0 ? (profit / salePrice) * 100 : 0;

  // Store for print report
  lastCalc = {
    spoolCost, spoolWeight, filamentPerPart, failureRate: v('failureRate'),
    packQty, printTime, handTime, laborRate,
    txFee: v('txFee'), payFee: v('payFee'), listingFee,
    packagingCost, shippingCharged, shippingActual, salePrice,
    materialTotal, laborTotal, platformFees, shippingDelta,
    totalCost, profit, margin, minutesPerPart
  };

  // Update pack label
  const packLbl = packQty === 1 ? '1x single' : packQty + 'x pack';
  document.getElementById('packLabel').textContent = packLbl;

  // Update metric tiles
  document.getElementById('rMaterial').textContent = fmt(materialTotal);
  document.getElementById('rLabor').textContent    = fmt(laborTotal);
  document.getElementById('rFees').textContent     = fmt(platformFees);
  document.getElementById('rTotal').textContent    = fmt(totalCost);

  // Update margin bar and display
  const md = document.getElementById('marginDisplay');
  const mb = document.getElementById('marginBar');

  md.textContent = Math.round(margin) + '%';

  if (margin >= 50) {
    md.style.color    = 'var(--success)';
    mb.style.background = 'var(--success)';
  } else if (margin >= 25) {
    md.style.color    = 'var(--accent)';
    mb.style.background = 'var(--accent)';
  } else {
    md.style.color    = 'var(--danger)';
    mb.style.background = 'var(--danger)';
  }

  mb.style.width = Math.max(0, Math.min(100, margin)) + '%';

  // Build breakdown rows
  const rows = [
    ['Material x' + packQty + (failureRate > 0 ? ' +waste' : ''), -materialTotal],
    ['Labor x' + packQty + ' (' + (minutesPerPart * packQty).toFixed(1) + ' min)', -laborTotal],
    ['Packaging', -packagingCost],
    ['Etsy fees (' + Math.round((txFee + payFee) * 100) + '% + listing)', -platformFees],
    ['Shipping delta', shippingDelta],
    ['Sale price', salePrice],
    ['Net profit', profit],
  ];

  document.getElementById('breakdown').innerHTML = rows.map((r, i) => {
    const isLast = i === rows.length - 1;
    const cls    = isLast ? (r[1] >= 0 ? 'pos' : 'neg') + ' total' : '';
    const val    = (r[1] >= 0 ? '+' : '-') + fmt(r[1]);
    return `<div class="breakdown-row">
      <span class="breakdown-label">${r[0]}</span>
      <span class="breakdown-val ${cls}">${val}</span>
    </div>`;
  }).join('');
}

// ── PRINT REPORT ───────────────────────────────────────
function printReport() {
  const c          = lastCalc;
  const partName   = s('partName')   || 'Unnamed Part';
  const partNumber = s('partNumber') || '—';
  const now        = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const packLbl    = c.packQty === 1 ? '1x single' : c.packQty + 'x pack';
  const marginSign = c.margin >= 0 ? '+' : '';

  const rows = [
    ['Filament per part',      c.filamentPerPart.toFixed(2) + 'g'],
    ['Cost per gram',          '$' + (c.spoolCost / c.spoolWeight).toFixed(4)],
    ['Failure rate',           c.failureRate + '%'],
    ['Material cost (total)',  '$' + c.materialTotal.toFixed(2)],
    ['Print time per part',    c.printTime.toFixed(1) + ' min'],
    ['Hands-on time per part', c.handTime.toFixed(2) + ' min'],
    ['Labor rate',             '$' + c.laborRate + '/hr'],
    ['Labor cost (total)',     '$' + c.laborTotal.toFixed(2)],
    ['Platform fees',          '$' + c.platformFees.toFixed(2)],
    ['Packaging',              '$' + c.packagingCost.toFixed(2)],
    ['Shipping charged',       '$' + c.shippingCharged.toFixed(2)],
    ['Actual shipping cost',   '$' + c.shippingActual.toFixed(2)],
    ['Shipping delta',         '$' + (c.shippingDelta >= 0 ? '+' : '') + c.shippingDelta.toFixed(2)],
  ];

  document.getElementById('printReport').innerHTML = `
    <div class="pr-header">
      <div class="pr-title">AMP Design Works — Part Pricing Report</div>
      <div class="pr-meta">
        Part: ${partName} &nbsp;|&nbsp;
        Part No: ${partNumber} &nbsp;|&nbsp;
        Pack: ${packLbl} &nbsp;|&nbsp;
        Date: ${now}
      </div>
    </div>
    <div class="pr-section">
      <div class="pr-section-title">Cost breakdown</div>
      ${rows.map(r => `
        <div class="pr-row">
          <span class="pr-label">${r[0]}</span>
          <span class="pr-val">${r[1]}</span>
        </div>`).join('')}
    </div>
    <div class="pr-total-row">
      <span>Total cost</span>
      <span>$${c.totalCost.toFixed(2)}</span>
    </div>
    <div class="pr-margin-row" style="margin-top:10px">
      <span>Sale price</span>
      <span>$${c.salePrice.toFixed(2)}</span>
    </div>
    <div class="pr-margin-row">
      <span>Net profit</span>
      <span>${c.profit >= 0 ? '+' : '-'}$${Math.abs(c.profit).toFixed(2)}</span>
    </div>
    <div class="pr-margin-row">
      <span>Margin</span>
      <span>${marginSign}${Math.round(c.margin)}%</span>
    </div>`;

  window.print();
}

// ── INIT ───────────────────────────────────────────────
calc();
