const navButtons = document.querySelectorAll('.day-nav button');
const sections = document.querySelectorAll('.day-section, .memo-section');

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    const targetId = filter === '1' ? 'day1' : filter === '2' ? 'day2' : filter === '3' ? 'day3' : filter === '4' ? 'day4' : filter === 'check' ? 'check' : filter === 'fx' ? 'fx' : filter === 'weather' ? 'weather' : null;
    if (targetId) document.getElementById(targetId)?.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
  if (!visible) return;
  const id = visible.target.id;
  navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === ({day1:'1',day2:'2',day3:'3',day4:'4',check:'check',fx:'fx',weather:'weather'}[id] || '')));
}, {rootMargin:'-20% 0px -60% 0px', threshold:[0,.1,.5]});
sections.forEach(s => observer.observe(s));

// Checklist persistence
const checks = document.querySelectorAll('.check-list input[type="checkbox"]');
checks.forEach(input => {
  const key = `qingdao-check-${input.dataset.check}`;
  input.checked = localStorage.getItem(key) === '1';
  input.addEventListener('change', () => localStorage.setItem(key, input.checked ? '1' : '0'));
});

// Memo persistence
const memo = document.getElementById('memo');
const saved = document.getElementById('saved');
if (memo) {
  memo.value = localStorage.getItem('qingdao-memo') || '';
  memo.addEventListener('input', () => {
    localStorage.setItem('qingdao-memo', memo.value);
    if (saved) saved.textContent = '자동 저장됨';
  });
}

// CNY -> KRW
let cnyToKrw = null;
function won(v){return new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(v)}
function updateFX(){
  if(!cnyToKrw)return;
  const amount=Number(document.getElementById('cnyInput')?.value)||0;
  document.getElementById('fxRate').textContent=cnyToKrw.toFixed(2);
  document.getElementById('krwResult').textContent=won(amount*cnyToKrw)+'원';
  [100,500,1000].forEach(n=>{const el=document.getElementById('fx'+n);if(el)el.textContent=won(n*cnyToKrw)});
}
async function loadFX(){
  try{
    const r=await fetch('https://api.frankfurter.dev/v2/rate/cny/krw',{cache:'no-store'});
    const d=await r.json();
    cnyToKrw=Number(d.rate);
    document.getElementById('fxStatus').textContent='LIVE';
    if(d.date)document.getElementById('fxDate').textContent=d.date+' 기준';
    updateFX();
  }catch(e){document.getElementById('fxStatus').textContent='오프라인';}
}
document.getElementById('cnyInput')?.addEventListener('input',updateFX);
document.querySelectorAll('.fx-presets button').forEach(b=>b.addEventListener('click',()=>{const i=document.getElementById('cnyInput');i.value=b.dataset.cny;updateFX()}));
loadFX();

// Qingdao weather via Open-Meteo
const weatherCode = {0:'맑음',1:'대체로 맑음',2:'부분적으로 흐림',3:'흐림',45:'안개',48:'안개',51:'이슬비',53:'이슬비',55:'이슬비',61:'비',63:'비',65:'강한 비',71:'눈',73:'눈',75:'강한 눈',80:'소나기',81:'소나기',82:'강한 소나기',95:'뇌우'};
async function loadWeather(){
  const now=document.getElementById('weatherNow'), forecast=document.getElementById('forecast');
  try{
    const url='https://api.open-meteo.com/v1/forecast?latitude=36.0671&longitude=120.3826&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=4';
    const r=await fetch(url,{cache:'no-store'}),d=await r.json();
    now.innerHTML=`<div style="font-size:24px;font-weight:700;margin-top:10px">${Math.round(d.current.temperature_2m)}°C</div><div style="font-size:11px;color:#777b92;margin-top:3px">${weatherCode[d.current.weather_code]||'날씨'} · 바람 ${Math.round(d.current.wind_speed_10m)} km/h</div>`;
    forecast.innerHTML=d.daily.time.map((date,i)=>`<div><b>${date.slice(5).replace('-','.')}</b><br>${weatherCode[d.daily.weather_code[i]]||'날씨'}<br><strong>${Math.round(d.daily.temperature_2m_min[i])}° / ${Math.round(d.daily.temperature_2m_max[i])}°</strong><br>☔ ${d.daily.precipitation_probability_max[i] ?? 0}%</div>`).join('');
  }catch(e){now.textContent='날씨를 불러오지 못했어요.';}
}
loadWeather();
