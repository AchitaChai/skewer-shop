/* ============================================================
   ร้านลูกชิ้นปิ้ง & น้ำ — App Logic v2 (Cute + Dark Mode)
   ============================================================ */

let records = [];
let stocks  = [];
let settings = { shopName: 'ร้านลูกชิ้นปิ้ง & น้ำ', backupMonths: 3, firebaseConfig: '', lang: 'th' };
let db = null;
let reportPeriod = 'week';
let nextId = 1;
let selectedBackupMonths = 3;

const TR = {
  th: {
    tabs: ['สรุป','บันทึก','สต็อก','รายงาน'],
    totalIncome:'รายรับรวม', totalExpense:'รายจ่ายรวม', netProfit:'กำไรสุทธิ',
    income:'รายรับ', expense:'รายจ่าย',
    skewer:'ลูกชิ้นปิ้ง', drink:'เมนูน้ำ', other:'อื่นๆ',
    recTypes:[
      ['income-skewer','รายรับ — ลูกชิ้น'],
      ['income-drink','รายรับ — น้ำ'],
      ['expense-skewer','รายจ่าย — วัตถุดิบลูกชิ้น'],
      ['expense-drink','รายจ่าย — วัตถุดิบน้ำ'],
      ['expense-other','รายจ่าย — ค่าใช้จ่ายอื่น'],
    ],
    catOptions:[['skewer','ลูกชิ้น'],['drink','น้ำ'],['other','อื่นๆ']],
    filterAll:'ทั้งหมด', addTitle:'เพิ่มรายการ', addStockTitle:'เพิ่ม/แก้ไขสต็อก',
    lType:'ประเภท', lAmount:'จำนวนเงิน (บาท)', lDate:'วันที่', lDesc:'รายละเอียด',
    lStockName:'ชื่อวัตถุดิบ', lStockCat:'หมวด', lStockQty:'จำนวนปัจจุบัน',
    lStockUnit:'หน่วย', lStockMin:'ปริมาณต่ำสุด (แจ้งเตือน)',
    btnAddRecord:'+ เพิ่มรายการ', btnAddStock:'+ เพิ่มสต็อก',
    lAllRecords:'รายการทั้งหมด', lStockList:'รายการสต็อก', lRecent:'รายการล่าสุด',
    lChart:'กราฟรายรับ vs รายจ่าย', legIncome:'รายรับ', legExpense:'รายจ่าย',
    weekly:'รายสัปดาห์', monthly:'รายเดือน', custom:'กำหนดเอง',
    lFrom:'จาก', lTo:'ถึง', btnApply:'ดูรายงาน',
    lSettings:'⚙️ ตั้งค่า', lShopName:'ชื่อร้าน', lBackup:'เก็บข้อมูลย้อนหลัง (เดือน)',
    bkLabels:{1:'1 เดือน',3:'3 เดือน',6:'6 เดือน',12:'12 เดือน',0:'ไม่ลบ'},
    lFirebase:'Firebase Config (สำหรับ sync)',
    lFirebaseHint:'ใส่ config เพื่อ sync ข้อมูลระหว่างอุปกรณ์ • ดูวิธีตั้งค่าใน README.md',
    lDataManage:'จัดการข้อมูล',
    btnExport:'📤 Export JSON', btnImport:'📥 Import JSON', btnCleanup:'🗑️ ลบข้อมูลเก่า',
    btnCancel:'ยกเลิก', btnSave:'💾 บันทึก', del:'ลบ',
    empty:'ยังไม่มีรายการ', lowStock:'⚠️ ต่ำ', saved:'✓ บันทึกแล้ว', deleted:'✓ ลบแล้ว',
    imported:'✓ นำเข้าข้อมูลสำเร็จ',
    cleanupDone:(n)=>`✓ ลบข้อมูลเก่า ${n} รายการ`,
    errAmount:'กรุณากรอกจำนวนเงิน', errName:'กรุณากรอกชื่อวัตถุดิบ',
    backupHint:(m)=>m===0?'ข้อมูลจะไม่ถูกลบอัตโนมัติ':`ข้อมูลที่เก่ากว่า ${m} เดือนจะถูกลบอัตโนมัติเมื่อเปิดแอป`,
    descPlaceholder:'เช่น ขายลูกชิ้น 50 ไม้',
    stockNamePlaceholder:'เช่น ลูกชิ้น', stockUnitPlaceholder:'กก. / ลิตร / ชิ้น',
  },
  en: {
    tabs:['Summary','Record','Stock','Report'],
    totalIncome:'Total Income', totalExpense:'Total Expense', netProfit:'Net Profit',
    income:'Income', expense:'Expense',
    skewer:'Skewer', drink:'Drinks', other:'Other',
    recTypes:[
      ['income-skewer','Income — Skewer'],
      ['income-drink','Income — Drinks'],
      ['expense-skewer','Expense — Skewer materials'],
      ['expense-drink','Expense — Drink materials'],
      ['expense-other','Expense — Other costs'],
    ],
    catOptions:[['skewer','Skewer'],['drink','Drinks'],['other','Other']],
    filterAll:'All', addTitle:'Add Record', addStockTitle:'Add / Edit Stock',
    lType:'Type', lAmount:'Amount (THB)', lDate:'Date', lDesc:'Description',
    lStockName:'Ingredient name', lStockCat:'Category', lStockQty:'Current quantity',
    lStockUnit:'Unit', lStockMin:'Min level (alert)',
    btnAddRecord:'+ Add Record', btnAddStock:'+ Add Stock',
    lAllRecords:'All Records', lStockList:'Stock list', lRecent:'Recent transactions',
    lChart:'Income vs Expense chart', legIncome:'Income', legExpense:'Expense',
    weekly:'Weekly', monthly:'Monthly', custom:'Custom',
    lFrom:'From', lTo:'To', btnApply:'View Report',
    lSettings:'⚙️ Settings', lShopName:'Shop name', lBackup:'Data retention (months)',
    bkLabels:{1:'1 month',3:'3 months',6:'6 months',12:'12 months',0:'Never'},
    lFirebase:'Firebase Config (for sync)',
    lFirebaseHint:'Paste your Firebase config to sync across devices • See README.md',
    lDataManage:'Data management',
    btnExport:'📤 Export JSON', btnImport:'📥 Import JSON', btnCleanup:'🗑️ Delete old data',
    btnCancel:'Cancel', btnSave:'💾 Save', del:'Del',
    empty:'No records yet', lowStock:'⚠️ Low', saved:'✓ Saved', deleted:'✓ Deleted',
    imported:'✓ Data imported',
    cleanupDone:(n)=>`✓ Removed ${n} old records`,
    errAmount:'Please enter amount', errName:'Please enter ingredient name',
    backupHint:(m)=>m===0?'Data will never be deleted automatically':`Data older than ${m} month(s) will be auto-deleted on app open`,
    descPlaceholder:'e.g. Sold 50 skewers',
    stockNamePlaceholder:'e.g. Skewer balls', stockUnitPlaceholder:'kg / L / pcs',
  }
};

function tx(k)  { return TR[settings.lang][k] || k; }
function txf(k, ...a) { const fn = TR[settings.lang][k]; return typeof fn==='function'?fn(...a):fn; }
function todayStr() { return new Date().toISOString().slice(0,10); }
function fmt(n) { return Math.round(Number(n)).toLocaleString('th-TH'); }
function setText(id,v) { const e=document.getElementById(id); if(e) e.textContent=v; }
function setPlaceholder(id,v) { const e=document.getElementById(id); if(e) e.placeholder=v; }

function showToast(msg) {
  let el = document.getElementById('_toast');
  if(!el){ el=document.createElement('div'); el.id='_toast'; el.className='toast'; document.body.appendChild(el); }
  el.textContent=msg; el.classList.add('show');
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2300);
}

function getTypeInfo(type) {
  const map = {
    'income-skewer':  {label:tx('income')+' — '+tx('skewer'),  cls:'badge-in',  amtCls:'ri-pos', sign:'+'},
    'income-drink':   {label:tx('income')+' — '+tx('drink'),   cls:'badge-in',  amtCls:'ri-pos', sign:'+'},
    'expense-skewer': {label:tx('expense')+' — '+tx('skewer'), cls:'badge-out', amtCls:'ri-neg', sign:'-'},
    'expense-drink':  {label:tx('expense')+' — '+tx('drink'),  cls:'badge-out', amtCls:'ri-neg', sign:'-'},
    'expense-other':  {label:tx('expense')+' — '+tx('other'),  cls:'badge-out', amtCls:'ri-neg', sign:'-'},
  };
  return map[type]||{label:type,cls:'',amtCls:'',sign:''};
}

function saveLocal() {
  localStorage.setItem('skewer_records',  JSON.stringify(records));
  localStorage.setItem('skewer_stocks',   JSON.stringify(stocks));
  localStorage.setItem('skewer_settings', JSON.stringify(settings));
  localStorage.setItem('skewer_nextid',   nextId);
}
function loadLocal() {
  records  = JSON.parse(localStorage.getItem('skewer_records')  || '[]');
  stocks   = JSON.parse(localStorage.getItem('skewer_stocks')   || '[]');
  settings = {...settings, ...JSON.parse(localStorage.getItem('skewer_settings') || '{}')};
  nextId   = parseInt(localStorage.getItem('skewer_nextid') || '1');
}

function autoCleanup() {
  if(!settings.backupMonths) return 0;
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth()-settings.backupMonths);
  const cutoffStr = cutoff.toISOString().slice(0,10);
  const before = records.length;
  records = records.filter(r=>r.date>=cutoffStr);
  const removed = before-records.length;
  if(removed>0) saveLocal();
  return removed;
}
function runManualCleanup() { const n=autoCleanup(); renderAll(); showToast(txf('cleanupDone',n)); }

function initFirebase(cfg) {
  if(!cfg||!cfg.trim()) return;
  try {
    let c = cfg.trim().replace(/^.*?=\s*/,'').replace(/;?\s*$/,'');
    const parsed = JSON.parse(c);
    if(firebase.apps.length===0) firebase.initializeApp(parsed);
    db = firebase.firestore();
  } catch(e) { db=null; }
}
async function syncFromFirebase() {
  if(!db) return;
  try {
    const snap = await db.collection('data').doc('main').get();
    if(snap.exists){ const d=snap.data(); records=d.records||records; stocks=d.stocks||stocks; nextId=Math.max(nextId,d.nextId||1); saveLocal(); }
  } catch(e){}
}
async function pushToFirebase() {
  if(!db) return;
  try { await db.collection('data').doc('main').set({records,stocks,nextId}); } catch(e){}
}

function calcStats(recs) {
  const sum = f => recs.filter(f).reduce((s,r)=>s+r.amount,0);
  const income   = sum(r=>r.type.startsWith('income'));
  const expense  = sum(r=>r.type.startsWith('expense'));
  const sIncome  = sum(r=>r.type==='income-skewer');
  const sExpense = sum(r=>r.type==='expense-skewer');
  const dIncome  = sum(r=>r.type==='income-drink');
  const dExpense = sum(r=>r.type==='expense-drink');
  return {income,expense,net:income-expense,sIncome,sExpense,sNet:sIncome-sExpense,dIncome,dExpense,dNet:dIncome-dExpense};
}

function filterRecords(period) {
  const now = new Date();
  if(period==='today') return records.filter(r=>r.date===todayStr());
  if(period==='week')  { const d=new Date(now); d.setDate(d.getDate()-6); return records.filter(r=>r.date>=d.toISOString().slice(0,10)); }
  if(period==='month') { const s=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; return records.filter(r=>r.date.startsWith(s)); }
  if(period==='custom') {
    const f=document.getElementById('range-from').value;
    const t=document.getElementById('range-to').value;
    return records.filter(r=>(!f||r.date>=f)&&(!t||r.date<=t));
  }
  return records;
}

function metricCardHTML(label, value, cls) {
  return `<div class="metric-card ${cls}"><div class="metric-label">${label}</div><div class="metric-value">฿${fmt(value)}</div></div>`;
}
function catBlockHTML(inc, exp, net) {
  const sign = net>=0?'+':'-';
  const col   = net>=0?'var(--income-c)':'var(--expense-c)';
  return `<div class="cat-block">
    <div class="cat-row"><span>${tx('income')}</span><span class="cat-inc">+฿${fmt(inc)}</span></div>
    <div class="cat-row"><span>${tx('expense')}</span><span class="cat-exp">-฿${fmt(exp)}</span></div>
    <div class="cat-row"><span style="font-weight:700">${tx('netProfit')}</span><span style="font-size:16px;font-weight:700;color:${col}">${sign}฿${fmt(Math.abs(net))}</span></div>
  </div>`;
}
function rowItemHTML(r, showDetail=true) {
  const info = getTypeInfo(r.type);
  const hasQty = r.qty && r.qty !== 1;
  const qtyText = (r.unitPrice && r.qty)
    ? `${r.qty} × ฿${fmt(r.unitPrice)}`
    : '';
  return `<div class="row-item">
    <div class="ri-left">
      <div class="ri-desc">${r.desc||'—'}</div>
      <div class="ri-meta">
        ${r.date} &nbsp;<span class="badge ${info.cls}">${info.label}</span>
        ${showDetail && qtyText ? `&nbsp;<span class="ri-qty-tag">${qtyText}</span>` : ''}
      </div>
    </div>
    <div class="ri-right">
      <span class="ri-amt ${info.amtCls}">${info.sign}฿${fmt(r.amount)}</span>
      <button class="btn btn-sm btn-del" onclick="deleteRecord(${r.id})">${tx('del')}</button>
    </div>
  </div>`;
}

function renderSummary() {
  const recs = filterRecords('today');
  const s = calcStats(recs);
  document.getElementById('summary-metrics').innerHTML =
    metricCardHTML(tx('totalIncome'),  s.income,  'mc-income') +
    metricCardHTML(tx('totalExpense'), s.expense, 'mc-expense') +
    metricCardHTML(tx('netProfit'),    s.net,      s.net>=0?'mc-pos':'mc-neg');
  document.getElementById('skewer-summary').innerHTML = catBlockHTML(s.sIncome, s.sExpense, s.sNet);
  document.getElementById('drink-summary').innerHTML  = catBlockHTML(s.dIncome, s.dExpense, s.dNet);
  const recent = [...records].sort((a,b)=>b.id-a.id).slice(0,6);
  document.getElementById('recent-list').innerHTML = recent.length
    ? recent.map(rowItemHTML).join('')
    : `<div class="empty">${tx('empty')}</div>`;
  setText('lbl-skewer', tx('skewer')); setText('lbl-drink', tx('drink')); setText('lbl-recent', tx('lRecent'));
}

function renderRecordTab() {
  const sel = document.getElementById('rec-type');
  sel.innerHTML = tx('recTypes').map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  const fsel = document.getElementById('filter-type');
  fsel.innerHTML = `<option value="">${tx('filterAll')}</option>`+tx('recTypes').map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  setText('lbl-add-title',tx('addTitle')); setText('lbl-type',tx('lType'));
  setText('lbl-amount',tx('lAmount')); setText('lbl-date',tx('lDate')); setText('lbl-desc',tx('lDesc'));
  setPlaceholder('rec-desc',tx('descPlaceholder'));
  setText('btn-add-record',tx('btnAddRecord')); setText('lbl-all-records',tx('lAllRecords'));
  renderRecordList();
}
function renderRecordList() {
  const tf = document.getElementById('filter-type').value;
  const mf = document.getElementById('filter-month').value;
  let list = [...records].sort((a,b)=>b.id-a.id);
  if(tf) list=list.filter(r=>r.type===tf);
  if(mf) list=list.filter(r=>r.date.startsWith(mf));
  document.getElementById('all-records-list').innerHTML = list.length
    ? list.map(rowItemHTML).join('')
    : `<div class="empty">${tx('empty')}</div>`;
}
function addRecord() {
  const unitPrice = parseFloat(document.getElementById('rec-unit-price').value) || 0;
  const qty       = parseFloat(document.getElementById('rec-qty').value) || 1;
  const amount    = parseFloat(document.getElementById('rec-amount').value) || 0;
  if(!amount){showToast(tx('errAmount'));return;}
  const lastType = document.getElementById('rec-type').value; // ── ข้อ 3: จำประเภท
  records.push({
    id: nextId++,
    type: lastType,
    amount,
    unitPrice: unitPrice || amount,
    qty,
    desc: document.getElementById('rec-desc').value.trim(),
    date: document.getElementById('rec-date').value||todayStr()
  });
  saveLocal(); pushToFirebase();
  document.getElementById('rec-amount').value='';
  document.getElementById('rec-desc').value='';
  document.getElementById('rec-unit-price').value='';
  document.getElementById('rec-qty').value='1';
  // คง lastType ไว้ใน select
  setTimeout(()=>{ const sel=document.getElementById('rec-type'); if(sel) sel.value=lastType; },50);
  showToast(tx('saved')); renderAll();
}
function deleteRecord(id) {
  records=records.filter(r=>r.id!==id); saveLocal(); pushToFirebase();
  showToast(tx('deleted')); renderAll();
}

function renderStockTab() {
  const catSel = document.getElementById('stock-cat');
  catSel.innerHTML = tx('catOptions').map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  setText('lbl-add-stock-title',tx('addStockTitle'));
  setText('lbl-stock-name',tx('lStockName')); setText('lbl-stock-cat',tx('lStockCat'));
  setText('lbl-stock-qty',tx('lStockQty')); setText('lbl-stock-unit',tx('lStockUnit'));
  setText('lbl-stock-min',tx('lStockMin')); setPlaceholder('stock-name',tx('stockNamePlaceholder'));
  setPlaceholder('stock-unit',tx('stockUnitPlaceholder'));
  setText('btn-add-stock',tx('btnAddStock')); setText('lbl-stock-list',tx('lStockList'));
  renderStockList();
}
function renderStockList() {
  const catLabel = c => tx('catOptions').find(([v])=>v===c)?.[1]||c;
  const html = stocks.map(s=>{
    const low = s.min>0&&s.qty<=s.min;
    const pct = s.min>0?Math.min(100,Math.round((s.qty/(s.min*3||1))*100)):70;
    const fill = low?'low':pct<50?'mid':'ok';
    return `<div class="stock-item">
      <div class="stock-info">
        <div class="stock-name-text">${s.name}</div>
        <div class="stock-sub">${catLabel(s.cat)}</div>
      </div>
      <div class="stock-bar-bg"><div class="stock-fill ${fill}" style="width:${Math.max(4,pct)}%"></div></div>
      <div class="stock-qty-text">
        ${low?`<span class="low-badge">${tx('lowStock')}</span>`:''}
        ${s.qty} ${s.unit}
      </div>
      <button class="btn btn-sm btn-del" onclick="deleteStock(${s.id})">${tx('del')}</button>
    </div>`;
  }).join('');
  document.getElementById('stock-list').innerHTML = html||`<div class="empty">${tx('empty')}</div>`;
}
function addStock() {
  const name = document.getElementById('stock-name').value.trim();
  if(!name){showToast(tx('errName'));return;}
  stocks.push({id:nextId++, name, qty:parseFloat(document.getElementById('stock-qty').value)||0,
    unit:document.getElementById('stock-unit').value.trim(),
    min:parseFloat(document.getElementById('stock-min').value)||0,
    cat:document.getElementById('stock-cat').value});
  saveLocal(); pushToFirebase();
  ['stock-name','stock-qty','stock-unit','stock-min'].forEach(id=>document.getElementById(id).value='');
  showToast(tx('saved')); renderStockList();
}
function deleteStock(id) {
  stocks=stocks.filter(s=>s.id!==id); saveLocal(); pushToFirebase();
  showToast(tx('deleted')); renderStockList();
}

function setPeriod(p) {
  reportPeriod=p;
  document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('btn-'+p).classList.add('active');
  document.getElementById('custom-range').style.display = p==='custom'?'block':'none';
  if(p!=='custom') renderReport();
}
function renderReport() {
  const recs = filterRecords(reportPeriod);
  const s = calcStats(recs);
  document.getElementById('report-metrics').innerHTML =
    metricCardHTML(tx('totalIncome'),  s.income,  'mc-income') +
    metricCardHTML(tx('totalExpense'), s.expense, 'mc-expense') +
    metricCardHTML(tx('netProfit'),    s.net,      s.net>=0?'mc-pos':'mc-neg');
  setText('lbl-chart',tx('lChart')); setText('leg-income',tx('legIncome')); setText('leg-expense',tx('legExpense'));
  setText('btn-week',tx('weekly')); setText('btn-month',tx('monthly')); setText('btn-custom',tx('custom'));
  setText('lbl-from',tx('lFrom')); setText('lbl-to',tx('lTo')); setText('btn-apply',tx('btnApply'));
  setText('lbl-skewer-rpt',tx('skewer')); setText('lbl-drink-rpt',tx('drink'));
  document.getElementById('skewer-report').innerHTML = catBlockHTML(s.sIncome, s.sExpense, s.sNet);
  document.getElementById('drink-report').innerHTML  = catBlockHTML(s.dIncome, s.dExpense, s.dNet);
  renderChart(recs);
}
function renderChart(recs) {
  const days={};
  recs.forEach(r=>{
    if(!days[r.date]) days[r.date]={inc:0,exp:0};
    if(r.type.startsWith('income')) days[r.date].inc+=r.amount;
    else days[r.date].exp+=r.amount;
  });
  const keys=Object.keys(days).sort().slice(-10);
  const container=document.getElementById('chart-container');
  if(!keys.length){container.innerHTML=`<div class="empty" style="width:100%">${tx('empty')}</div>`;return;}
  const maxVal=Math.max(...keys.map(k=>Math.max(days[k].inc,days[k].exp)),1);
  container.innerHTML=keys.map(k=>{
    const incH=Math.round((days[k].inc/maxVal)*120);
    const expH=Math.round((days[k].exp/maxVal)*120);
    return `<div class="chart-group">
      <div class="chart-bars">
        <div class="chart-bar inc" style="height:${incH}px"></div>
        <div class="chart-bar exp" style="height:${expH}px"></div>
      </div>
      <div class="chart-bar-label">${k.slice(5)}</div>
    </div>`;
  }).join('');
}

function openSettings() {
  selectedBackupMonths = settings.backupMonths;
  document.getElementById('setting-shop-name').value = settings.shopName;
  document.getElementById('setting-firebase').value  = settings.firebaseConfig||'';
  updateBkPills(); updateBkHint();
  setText('lbl-settings',tx('lSettings')); setText('lbl-shop-name-setting',tx('lShopName'));
  setText('lbl-backup-months',tx('lBackup')); setText('lbl-firebase-config',tx('lFirebase'));
  setText('lbl-firebase-hint',tx('lFirebaseHint')); setText('lbl-data-manage',tx('lDataManage'));
  setText('btn-export',tx('btnExport')); setText('btn-import',tx('btnImport'));
  setText('btn-cleanup',tx('btnCleanup')); setText('btn-cancel',tx('btnCancel'));
  setText('btn-save-settings',tx('btnSave'));
  [1,3,6,12,0].forEach(m=>{const e=document.getElementById('bk-'+m);if(e)e.textContent=tx('bkLabels')[m];});
  document.getElementById('settings-modal').style.display='flex';
}
function closeSettings() { document.getElementById('settings-modal').style.display='none'; }
function closeSettingsOutside(e) { if(e.target.id==='settings-modal') closeSettings(); }
function setBackupMonths(m) { selectedBackupMonths=m; updateBkPills(); updateBkHint(); }
function updateBkPills() { [1,3,6,12,0].forEach(m=>{const e=document.getElementById('bk-'+m);if(e)e.classList.toggle('active',m===selectedBackupMonths);}); }
function updateBkHint()  { const e=document.getElementById('lbl-backup-hint');if(e)e.textContent=txf('backupHint',selectedBackupMonths); }
function saveSettings() {
  settings.shopName       = document.getElementById('setting-shop-name').value.trim()||settings.shopName;
  settings.backupMonths   = selectedBackupMonths;
  settings.firebaseConfig = document.getElementById('setting-firebase').value.trim();
  saveLocal(); initFirebase(settings.firebaseConfig); closeSettings(); renderAll(); showToast(tx('saved'));
  const n=autoCleanup(); if(n>0) renderAll();
}

function exportData() {
  const blob=new Blob([JSON.stringify({records,stocks,settings,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`skewer-backup-${todayStr()}.json`; a.click();
}
function importData() { document.getElementById('import-file').click(); }
function handleImport(e) {
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try {
      const data=JSON.parse(ev.target.result);
      if(data.records) records=data.records; if(data.stocks) stocks=data.stocks;
      if(data.settings) settings={...settings,...data.settings};
      nextId=Math.max(...records.map(r=>r.id||0),...stocks.map(s=>s.id||0),nextId)+1;
      saveLocal(); renderAll(); showToast(tx('imported'));
    } catch { showToast('❌ ไฟล์ไม่ถูกต้อง'); }
  };
  reader.readAsText(file); e.target.value='';
}

function switchTab(name) {
  ['summary','record','stock','report'].forEach(n=>{
    document.getElementById('sec-'+n).classList.toggle('active',n===name);
    document.getElementById('tab-'+n).classList.toggle('active',n===name);
  });
  if(name==='summary') renderSummary();
  if(name==='record')  renderRecordTab();
  if(name==='stock')   renderStockTab();
  if(name==='report')  renderReport();
}

function toggleLang() {
  settings.lang = settings.lang==='th'?'en':'th';
  saveLocal(); document.getElementById('lang-btn').textContent=settings.lang==='th'?'EN':'TH'; renderAll();
}

function toggleDark() {
  const isDark = document.documentElement.getAttribute('data-theme')==='dark';
  const next = isDark?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  localStorage.setItem('skewer_theme',next);
  document.getElementById('dark-btn').textContent = next==='dark'?'☀️':'🌙';
}

function renderAll() {
  document.getElementById('shop-name-display').textContent = settings.shopName||'🏪 ร้านลูกชิ้นปิ้ง & น้ำ';
  document.getElementById('lang-btn').textContent = settings.lang==='th'?'EN':'TH';
  const isDark = document.documentElement.getAttribute('data-theme')==='dark';
  document.getElementById('dark-btn').textContent = isDark?'☀️':'🌙';
  ['summary','record','stock','report'].forEach((k,i)=>{ const e=document.getElementById('tabl-'+k); if(e) e.textContent=tx('tabs')[i]; });
  const active=['summary','record','stock','report'].find(k=>document.getElementById('sec-'+k).classList.contains('active'))||'summary';
  if(active==='summary') renderSummary();
  if(active==='record')  renderRecordTab();
  if(active==='stock')   renderStockTab();
  if(active==='report')  renderReport();
}

(async function init() {
  loadLocal();
  document.getElementById('rec-date').value = todayStr();
  const now = new Date();
  document.getElementById('header-date').textContent =
    now.toLocaleDateString('th-TH',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  // restore dark mode icon
  if(localStorage.getItem('skewer_theme')==='dark') { const b=document.getElementById('dark-btn'); if(b) b.textContent='☀️'; }
  if(settings.firebaseConfig) { initFirebase(settings.firebaseConfig); await syncFromFirebase(); }
  autoCleanup();
  if(records.length===0) {
    const d=todayStr();
    records=[
      {id:nextId++,type:'income-skewer', amount:350,desc:'ขายลูกชิ้น ช่วงเช้า',   date:d},
      {id:nextId++,type:'income-drink',  amount:180,desc:'น้ำผลไม้ปั่น 6 แก้ว',    date:d},
      {id:nextId++,type:'expense-skewer',amount:120,desc:'ซื้อลูกชิ้น 1 กก.',      date:d},
      {id:nextId++,type:'expense-drink', amount:80, desc:'ผลไม้สดสำหรับปั่น',      date:d},
      {id:nextId++,type:'income-skewer', amount:420,desc:'ขายลูกชิ้น ช่วงบ่าย',   date:d},
    ];
    stocks=[
      {id:nextId++,name:'ลูกชิ้น',  qty:2.5,unit:'กก.',  min:1,  cat:'skewer'},
      {id:nextId++,name:'ไม้เสียบ', qty:200, unit:'ชิ้น', min:50, cat:'skewer'},
      {id:nextId++,name:'ซอสพริก', qty:1,   unit:'ขวด',  min:1,  cat:'skewer'},
      {id:nextId++,name:'น้ำเชื่อม',qty:0.5, unit:'ลิตร', min:1,  cat:'drink'},
      {id:nextId++,name:'ผลไม้สด', qty:3,   unit:'กก.',  min:2,  cat:'drink'},
    ];
    saveLocal();
  }
  renderAll();
})();

// ─── Menu Items (Autocomplete List) ──────────────────────────
let menuItems = [];
let menuFormOpen = false;

function loadMenuItems() {
  menuItems = JSON.parse(localStorage.getItem('skewer_menus') || '[]');
}
function saveMenuItems() {
  localStorage.setItem('skewer_menus', JSON.stringify(menuItems));
}

function toggleMenuForm() {
  menuFormOpen = !menuFormOpen;
  document.getElementById('menu-form').style.display = menuFormOpen ? 'block' : 'none';
  document.getElementById('btn-toggle-menu').textContent = menuFormOpen ? '✕ ปิด' : '+ เพิ่ม';
  if (menuFormOpen) document.getElementById('menu-name').focus();
}

function addMenuItem(nameOverride, priceOverride, catOverride) {
  const name  = nameOverride  || document.getElementById('menu-name').value.trim();
  const price = priceOverride !== undefined ? priceOverride : (parseFloat(document.getElementById('menu-price').value) || 0);
  const cat   = catOverride   || document.getElementById('menu-cat').value;
  if (!name) { showToast(tx('errName')); return; }
  // ถ้ามีอยู่แล้วในลิสต์ ไม่เพิ่มซ้ำ
  if (menuItems.find(m => m.name.toLowerCase() === name.toLowerCase())) {
    showToast('มีในลิสต์แล้ว'); return;
  }
  menuItems.push({ id: nextId++, name, price, cat });
  saveMenuItems(); saveLocal();
  if (!nameOverride) {
    document.getElementById('menu-name').value  = '';
    document.getElementById('menu-price').value = '';
    if (menuFormOpen) toggleMenuForm();
  }
  showToast('✓ เพิ่มเมนูแล้ว');
  renderMenuList();
}

function deleteMenuItem(id) {
  menuItems = menuItems.filter(m => m.id !== id);
  saveMenuItems();
  renderMenuList();
  showToast(tx('deleted'));
}

function renderMenuList() {
  // populate menu-cat select
  const catSel = document.getElementById('menu-cat');
  if (catSel) {
    catSel.innerHTML = tx('catOptions').map(([v,l]) => `<option value="${v}">${l}</option>`).join('');
  }
  setText('lbl-menu-list', '📋 ' + (settings.lang === 'th' ? 'รายการเมนู / วัตถุดิบ' : 'Menu / Ingredient list'));
  setText('lbl-menu-name',  settings.lang === 'th' ? 'ชื่อ' : 'Name');
  setText('lbl-menu-price', settings.lang === 'th' ? 'ราคาปกติ (บาท)' : 'Default price (THB)');
  setText('lbl-menu-cat',   settings.lang === 'th' ? 'หมวด' : 'Category');
  setText('btn-save-menu',  settings.lang === 'th' ? '+ บันทึกเมนู' : '+ Save menu');
  if (!menuFormOpen) setText('btn-toggle-menu', settings.lang === 'th' ? '+ เพิ่ม' : '+ Add');

  const catLabel = c => tx('catOptions').find(([v]) => v === c)?.[1] || c;
  const container = document.getElementById('menu-items-list');
  if (!container) return;
  if (!menuItems.length) {
    container.innerHTML = `<div class="empty">${settings.lang === 'th' ? 'ยังไม่มีเมนู — กด + เพิ่ม เพื่อตั้งรายการไว้' : 'No items yet — tap + Add to create a list'}</div>`;
    return;
  }
  container.innerHTML = menuItems.map(m => `
    <div class="menu-item-row">
      <div style="flex:1">
        <div class="mi-name">${m.name}</div>
        <div class="mi-meta">${catLabel(m.cat)}</div>
      </div>
      <div class="mi-price">฿${fmt(m.price)}</div>
      <button class="btn btn-sm btn-del" onclick="deleteMenuItem(${m.id})">${tx('del')}</button>
    </div>`).join('');
}

// ─── Autocomplete Dropdown ────────────────────────────────────
let dropdownTimeout = null;

function onDescInput() {
  clearTimeout(dropdownTimeout);
  const q = document.getElementById('rec-desc').value.trim().toLowerCase();
  const dd = document.getElementById('desc-dropdown');
  const type = document.getElementById('rec-type').value;

  // กรอง menuItems ตาม query และหมวดที่เลือก
  const isIncome = type.startsWith('income');
  let matches = menuItems.filter(m => {
    const catMatch = type.includes('skewer') ? m.cat === 'skewer'
                   : type.includes('drink')  ? m.cat === 'drink'
                   : true;
    const nameMatch = !q || m.name.toLowerCase().includes(q);
    return catMatch && nameMatch;
  });

  if (!matches.length && !q) { dd.style.display = 'none'; return; }

  let html = matches.slice(0, 8).map(m => `
    <div class="dd-item" onmousedown="selectMenuItem(${m.id})">
      <div class="dd-item-left">
        <span class="dd-item-name">${m.name}</span>
        <span class="dd-item-cat">${tx('catOptions').find(([v]) => v === m.cat)?.[1] || m.cat}</span>
      </div>
      <span class="dd-item-price">฿${fmt(m.price)}</span>
    </div>`).join('');

  // แสดงตัวเลือก "เพิ่มใหม่" ถ้าพิมพ์อยู่และยังไม่มีในลิสต์
  if (q && !menuItems.find(m => m.name.toLowerCase() === q)) {
    html += `<div class="dd-item dd-new" onmousedown="confirmAddNew('${q.replace(/'/g,"\\'")}')">
      <span>+ ${settings.lang === 'th' ? 'เพิ่ม' : 'Add'} "<strong>${q}</strong>" ${settings.lang === 'th' ? 'ลงในลิสต์' : 'to list'}</span>
    </div>`;
  }

  if (!html) { dd.style.display = 'none'; return; }
  dd.innerHTML = html;
  dd.style.display = 'block';
}

function selectMenuItem(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  document.getElementById('rec-desc').value = item.name;
  if (item.price) document.getElementById('rec-amount').value = item.price;
  hideDropdown();
}

function hideDropdown() {
  dropdownTimeout = setTimeout(() => {
    const dd = document.getElementById('desc-dropdown');
    if (dd) dd.style.display = 'none';
  }, 150);
}

function confirmAddNew(name) {
  hideDropdown();
  const price = parseFloat(document.getElementById('rec-unit-price').value) || parseFloat(document.getElementById('rec-amount').value) || 0;
  const cat   = document.getElementById('rec-type').value.includes('drink') ? 'drink'
              : document.getElementById('rec-type').value.includes('skewer') ? 'skewer' : 'other';
  setTimeout(() => {
    if (confirm((settings.lang === 'th'
      ? `เพิ่ม "${name}" ลงในลิสต์เมนูด้วยราคา ฿${fmt(price)} ไหม?`
      : `Add "${name}" to menu list with price ฿${fmt(price)}?`))) {
      addMenuItem(name, price, cat);
    }
  }, 200);
}

// patch addRecord to ask about new menu
const _origAddRecord = addRecord;
addRecord = function() {
  const desc      = document.getElementById('rec-desc').value.trim();
  const price     = parseFloat(document.getElementById('rec-unit-price').value) || parseFloat(document.getElementById('rec-amount').value) || 0;
  const type      = document.getElementById('rec-type').value;
  // call original
  _origAddRecord();
  // after save: if desc is new and has price, ask to add to list
  if (desc && price && !menuItems.find(m => m.name.toLowerCase() === desc.toLowerCase())) {
    setTimeout(() => {
      if (confirm((settings.lang === 'th'
        ? `เพิ่ม "${desc}" ลงในลิสต์เมนูด้วยราคา ฿${fmt(price)} ไหม?`
        : `Add "${desc}" to menu list with price ฿${fmt(price)}?`))) {
        const cat = type.includes('drink') ? 'drink' : type.includes('skewer') ? 'skewer' : 'other';
        addMenuItem(desc, price, cat);
      }
    }, 300);
  }
};

// ─── Patch renderRecordTab to include menu list ───────────────
const _origRenderRecordTab = renderRecordTab;
renderRecordTab = function() {
  _origRenderRecordTab();
  renderMenuList();
};

// init menu items
loadMenuItems();
// (ไม่มี seed เพื่อไม่ให้รายการกลับมาเมื่อลบแล้ว)

// ─── Quantity × Unit Price Calculation ───────────────────────
let manualAmountOverride = false;

function calcTotal() {
  manualAmountOverride = false;
  const unitPrice = parseFloat(document.getElementById('rec-unit-price').value) || 0;
  const qty       = parseFloat(document.getElementById('rec-qty').value) || 1;
  if (unitPrice > 0) {
    document.getElementById('rec-amount').value = Math.round(unitPrice * qty);
  }
}

function onManualAmount() {
  // ถ้าผู้ใช้แก้ยอดรวมเอง ให้ถือว่า override ไม่คำนวณทับ
  manualAmountOverride = true;
}

// patch selectMenuItem ให้กรอก unit price ด้วย
const _origSelectMenuItem = selectMenuItem;
selectMenuItem = function(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  document.getElementById('rec-desc').value = item.name;
  if (item.price) {
    document.getElementById('rec-unit-price').value = item.price;
    calcTotal(); // คำนวณทันที
  }
  hideDropdown();
};

// patch addRecord ให้ reset ช่องใหม่ด้วย
const _origAddRecord2 = addRecord;
addRecord = function() {
  _origAddRecord2();
  document.getElementById('rec-unit-price').value = '';
  document.getElementById('rec-qty').value = '1';
  manualAmountOverride = false;
};

// label updates for new fields
const _origRenderRecordTab2 = renderRecordTab;
renderRecordTab = function() {
  _origRenderRecordTab2();
  const isEn = settings.lang === 'en';
  setText('lbl-unit-price', isEn ? 'Price / unit (THB)' : 'ราคา / หน่วย (บาท)');
  setText('lbl-qty',    isEn ? 'Qty' : 'จำนวน');
  setText('lbl-amount', isEn ? 'Total (THB)' : 'รวม (บาท)');
};

// ══════════════════════════════════════════════════════════════
// ข้อ 1: แก้ไขเมนู + แยกหมวด รายรับ/รายจ่าย
// ══════════════════════════════════════════════════════════════
function editMenuItem(id) {
  const m = menuItems.find(x => x.id === id);
  if (!m) return;
  const newName  = prompt(settings.lang==='th' ? `ชื่อใหม่ (เดิม: ${m.name})` : `New name (current: ${m.name})`, m.name);
  if (newName === null) return;
  const newPrice = prompt(settings.lang==='th' ? `ราคาต่อหน่วยใหม่ (เดิม: ${m.price})` : `New unit price (current: ${m.price})`, m.price);
  if (newPrice === null) return;
  m.name  = newName.trim() || m.name;
  m.price = parseFloat(newPrice) || m.price;
  saveMenuItems();
  renderMenuList();
  showToast(tx('saved'));
}

// override renderMenuList เพื่อแยกซ้าย-ขวา รายรับ/รายจ่าย
const _origRenderMenuList = renderMenuList;
renderMenuList = function() {
  // populate menu-cat select
  const catSel = document.getElementById('menu-cat');
  if (catSel) catSel.innerHTML = tx('catOptions').map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  setText('lbl-menu-list', '📋 ' + (settings.lang==='th' ? 'รายการเมนู / วัตถุดิบ' : 'Menu / Ingredient list'));
  setText('lbl-menu-name',  settings.lang==='th' ? 'ชื่อ' : 'Name');
  setText('lbl-menu-price', settings.lang==='th' ? 'ราคา / หน่วย (บาท)' : 'Price / unit (THB)');
  setText('lbl-menu-cat',   settings.lang==='th' ? 'หมวด' : 'Category');
  setText('btn-save-menu',  settings.lang==='th' ? '+ บันทึกเมนู' : '+ Save menu');
  if (!menuFormOpen) setText('btn-toggle-menu', settings.lang==='th' ? '+ เพิ่ม' : '+ Add');

  const container = document.getElementById('menu-items-list');
  if (!container) return;
  if (!menuItems.length) {
    container.innerHTML = `<div class="empty">${settings.lang==='th' ? 'ยังไม่มีเมนู — กด + เพิ่ม' : 'No items yet'}</div>`;
    return;
  }

  const isEn = settings.lang === 'en';
  const incomeItems  = menuItems.filter(m => m.cat === 'skewer' || m.cat === 'drink');
  const expenseItems = menuItems.filter(m => m.cat === 'expense' || m.cat === 'other');
  // ถ้าผู้ใช้ไม่ได้แยก cat เป็น expense ให้แยกตาม flag
  const incList = menuItems.filter(m => m.side !== 'expense');
  const expList = menuItems.filter(m => m.side === 'expense');

  function menuRow(m) {
    return `<div class="menu-item-row">
      <div style="flex:1">
        <div class="mi-name">${m.name}</div>
        <div class="mi-meta">฿${fmt(m.price)} / ${isEn?'unit':'หน่วย'}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-sm btn-outline" onclick="editMenuItem(${m.id})">✏️</button>
        <button class="btn btn-sm btn-del" onclick="deleteMenuItem(${m.id})">${tx('del')}</button>
      </div>
    </div>`;
  }

  container.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--income-c);margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid var(--income-bg)">
          💰 ${isEn?'Income (Menu)':'รายรับ (เมนู)'}
        </div>
        ${incList.length ? incList.map(menuRow).join('') : `<div class="empty" style="padding:12px 0;font-size:12px">${isEn?'None':'ยังไม่มี'}</div>`}
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--expense-c);margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid var(--expense-bg)">
          🛒 ${isEn?'Expense (Ingredients)':'รายจ่าย (วัตถุดิบ)'}
        </div>
        ${expList.length ? expList.map(menuRow).join('') : `<div class="empty" style="padding:12px 0;font-size:12px">${isEn?'None':'ยังไม่มี'}</div>`}
      </div>
    </div>`;
};

// patch addMenuItem ให้รับ side จาก type ด้วย
const _origAddMenuItem = addMenuItem;
addMenuItem = function(nameOverride, priceOverride, catOverride, sideOverride) {
  const name  = nameOverride  || document.getElementById('menu-name').value.trim();
  const price = priceOverride !== undefined ? priceOverride : (parseFloat(document.getElementById('menu-price').value) || 0);
  const cat   = catOverride   || document.getElementById('menu-cat').value;
  if (!name) { showToast(tx('errName')); return; }
  if (menuItems.find(m => m.name.toLowerCase() === name.toLowerCase())) { showToast('มีในลิสต์แล้ว'); return; }
  // กำหนด side: income / expense
  const side = sideOverride || (cat === 'other' ? 'expense' : 'income');
  menuItems.push({ id: nextId++, name, price, cat, side });
  saveMenuItems(); saveLocal();
  if (!nameOverride) {
    document.getElementById('menu-name').value  = '';
    document.getElementById('menu-price').value = '';
    if (menuFormOpen) toggleMenuForm();
  }
  showToast('✓ เพิ่มเมนูแล้ว');
  renderMenuList();
};

// patch _origAddRecord ให้ส่ง side ด้วย
const _origAddRecordPatch3 = addRecord;
addRecord = function() {
  // ดัก side จาก type ก่อน call
  const type = document.getElementById('rec-type').value;
  const side = type.startsWith('income') ? 'income' : 'expense';
  // override addMenuItem ชั่วคราว
  window._currentSide = side;
  _origAddRecordPatch3();
};

// ══════════════════════════════════════════════════════════════
// ข้อ 2: แก้ไขรายการที่บันทึกไปแล้ว
// ══════════════════════════════════════════════════════════════
function editRecord(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;
  const isEn = settings.lang === 'en';

  // สร้าง modal แก้ไข
  let modal = document.getElementById('edit-record-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'edit-record-modal';
    modal.className = 'modal-overlay';
    modal.onclick = e => { if(e.target===modal) modal.style.display='none'; };
    document.body.appendChild(modal);
  }

  const typeOpts = tx('recTypes').map(([v,l])=>`<option value="${v}" ${v===r.type?'selected':''}>${l}</option>`).join('');
  modal.innerHTML = `<div class="modal-box">
    <div class="modal-title">✏️ ${isEn?'Edit record':'แก้ไขรายการ'}</div>
    <div class="form-group">
      <label>${isEn?'Type':'ประเภท'}</label>
      <select id="er-type">${typeOpts}</select>
    </div>
    <div class="form-group">
      <label>${isEn?'Description':'รายละเอียด'}</label>
      <input type="text" id="er-desc" value="${r.desc||''}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>${isEn?'Price/unit':'ราคา/หน่วย'}</label>
        <input type="number" id="er-unit-price" value="${r.unitPrice||r.amount}" inputmode="decimal" oninput="erCalc()">
      </div>
      <div class="form-group">
        <label>${isEn?'Qty':'จำนวน'}</label>
        <input type="number" id="er-qty" value="${r.qty||1}" inputmode="decimal" oninput="erCalc()">
      </div>
    </div>
    <div class="form-group">
      <label>${isEn?'Total (THB)':'รวม (บาท)'}</label>
      <input type="number" id="er-amount" value="${r.amount}" inputmode="decimal">
    </div>
    <div class="form-group">
      <label>${isEn?'Date':'วันที่'}</label>
      <input type="date" id="er-date" value="${r.date}">
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
      <button class="btn btn-outline" onclick="document.getElementById('edit-record-modal').style.display='none'">${isEn?'Cancel':'ยกเลิก'}</button>
      <button class="btn btn-primary" style="width:auto" onclick="saveEditRecord(${id})">${isEn?'💾 Save':'💾 บันทึก'}</button>
    </div>
  </div>`;
  modal.style.display = 'flex';
}

function erCalc() {
  const up = parseFloat(document.getElementById('er-unit-price').value)||0;
  const q  = parseFloat(document.getElementById('er-qty').value)||1;
  if(up>0) document.getElementById('er-amount').value = Math.round(up*q);
}

function saveEditRecord(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;
  r.type      = document.getElementById('er-type').value;
  r.desc      = document.getElementById('er-desc').value.trim();
  r.unitPrice = parseFloat(document.getElementById('er-unit-price').value)||0;
  r.qty       = parseFloat(document.getElementById('er-qty').value)||1;
  r.amount    = parseFloat(document.getElementById('er-amount').value)||0;
  r.date      = document.getElementById('er-date').value;
  saveLocal(); pushToFirebase();
  document.getElementById('edit-record-modal').style.display='none';
  showToast(tx('saved')); renderAll();
}

// ── เพิ่มปุ่ม edit ใน rowItemHTML ──
const _origRowItemHTML = rowItemHTML;
rowItemHTML = function(r, showDetail=true) {
  const info = getTypeInfo(r.type);
  const qtyText = (r.unitPrice && r.qty && r.qty !== 1)
    ? `${r.qty} × ฿${fmt(r.unitPrice)}` : '';
  return `<div class="row-item">
    <div class="ri-left">
      <div class="ri-desc">${r.desc||'—'}</div>
      <div class="ri-meta">
        ${r.date} &nbsp;<span class="badge ${info.cls}">${info.label}</span>
        ${showDetail && qtyText ? `&nbsp;<span class="ri-qty-tag">${qtyText}</span>` : ''}
      </div>
    </div>
    <div class="ri-right">
      <span class="ri-amt ${info.amtCls}">${info.sign}฿${fmt(r.amount)}</span>
      <button class="btn btn-sm btn-outline" onclick="editRecord(${r.id})">✏️</button>
      <button class="btn btn-sm btn-del" onclick="deleteRecord(${r.id})">${tx('del')}</button>
    </div>
  </div>`;
};

// ══════════════════════════════════════════════════════════════
// ข้อ 4: ปุ่ม Refresh sync จาก Firebase
// ══════════════════════════════════════════════════════════════
async function refreshSync() {
  if (!db) { showToast(settings.lang==='th'?'ยังไม่ได้เชื่อม Firebase':'Firebase not connected'); return; }
  showToast(settings.lang==='th'?'⟳ กำลังโหลด...':'⟳ Syncing...');
  await syncFromFirebase();
  renderAll();
  showToast(settings.lang==='th'?'✓ อัปเดตแล้ว':'✓ Updated');
}
