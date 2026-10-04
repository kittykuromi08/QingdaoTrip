const navButtons = document.querySelectorAll('#dayNav button');
const sections = document.querySelectorAll('.day-section');

navButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    const f=btn.dataset.filter;
    navButtons.forEach(b=>b.classList.toggle('active',b===btn));
    sections.forEach(s=>s.classList.toggle('hidden',f!=='all' && s.dataset.day!==f));
    if(f!=='all') document.querySelector('#day'+f)?.scrollIntoView({behavior:'smooth',block:'start'});
    else window.scrollTo({top:0,behavior:'smooth'});
  });
});

document.querySelectorAll('[data-check]').forEach(box=>{
  const key='qingdao_check_'+box.dataset.check;
  box.checked=localStorage.getItem(key)==='1';
  box.addEventListener('change',()=>localStorage.setItem(key,box.checked?'1':'0'));
});

const memo=document.querySelector('#memo'), saved=document.querySelector('#saved');
memo.value=localStorage.getItem('qingdao_memo')||'';
let timer;
memo.addEventListener('input',()=>{
  saved.textContent='저장 중…';
  clearTimeout(timer);
  timer=setTimeout(()=>{
    localStorage.setItem('qingdao_memo',memo.value);
    saved.textContent='자동 저장됨';
  },300);
});


// CNY → KRW exchange rate (Frankfurter public API)
const FX_API = 'https://api.frankfurter.dev/v2/rate/cny/krw';
let cnyToKrw = null;

function formatKRW(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value);
}

function updateFXDisplay() {
  if (!cnyToKrw) return;
  const rateEl = document.getElementById('fxRate');
  const dateEl = document.getElementById('fxDate');
  const inputEl = document.getElementById('cnyInput');
  const resultEl = document.getElementById('krwResult');
  const statusEl = document.getElementById('fxStatus');

  rateEl.textContent = cnyToKrw.toFixed(2);
  dateEl.textContent = '최신 영업일 데이터';
  statusEl.textContent = 'LIVE';

  [100, 500, 1000].forEach(amount => {
    const el = document.getElementById(`fx${amount}`);
    if (el) el.textContent = formatKRW(amount * cnyToKrw);
  });

  const amount = Number(inputEl.value) || 0;
  resultEl.textContent = `${formatKRW(amount * cnyToKrw)}원`;
}

async function loadExchangeRate() {
  const statusEl = document.getElementById('fxStatus');
  const dateEl = document.getElementById('fxDate');
  try {
    const response = await fetch(FX_API, { cache: 'no-store' });
    if (!response.ok) throw new Error('환율 요청 실패');
    const data = await response.json();
    if (!data.rate) throw new Error('환율 데이터 없음');
    cnyToKrw = Number(data.rate);
    if (data.date) dateEl.textContent = `${data.date} 기준`;
    updateFXDisplay();
  } catch (error) {
    statusEl.textContent = '오프라인';
    dateEl.textContent = '환율을 불러오지 못했어요';
    document.getElementById('fxRate').textContent = '—';
  }
}

const cnyInput = document.getElementById('cnyInput');
if (cnyInput) {
  cnyInput.addEventListener('input', updateFXDisplay);
}

document.querySelectorAll('.fx-presets button').forEach(button => {
  button.addEventListener('click', () => {
    cnyInput.value = button.dataset.cny;
    updateFXDisplay();
    cnyInput.focus();
  });
});

loadExchangeRate();
