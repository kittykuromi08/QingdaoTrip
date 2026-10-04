const buttons = document.querySelectorAll('.day-nav button');
const daySections = document.querySelectorAll('.day-section');
const extraSections = document.querySelectorAll('.extra-section');

function showFor(filter) {
  if (filter === 'all') {
    daySections.forEach(s => s.classList.remove('hidden'));
    extraSections.forEach(s => s.classList.remove('hidden'));
    return;
  }

  if (/^[1-4]$/.test(filter)) {
    daySections.forEach(s => s.classList.toggle('hidden', s.dataset.day !== filter));
    // 체크리스트/환율/날씨는 일정 아래에 계속 붙어 있게 유지
    extraSections.forEach(s => s.classList.remove('hidden'));
    return;
  }

  // 체크리스트/환율/날씨 탭을 누르면 전체 일정과 해당 영역을 함께 보여주고
  // 해당 영역으로 부드럽게 이동
  daySections.forEach(s => s.classList.remove('hidden'));
  extraSections.forEach(s => s.classList.remove('hidden'));
}

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    buttons.forEach(b => b.classList.toggle('active', b === button));
    showFor(filter);
    if (filter === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (filter === 'check' || filter === 'fx' || filter === 'weather') {
      document.getElementById(filter)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      document.getElementById(`day${filter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 출발 전 체크리스트 자동 저장
 document.querySelectorAll('[data-check]').forEach(x => {
  const k = 'qingdao_check_' + x.dataset.check;
  x.checked = localStorage.getItem(k) === '1';
  x.onchange = () => localStorage.setItem(k, x.checked ? '1' : '0');
});

// 여행 메모 자동 저장
const memo = document.getElementById('memo');
const saved = document.getElementById('saved');
if (memo) {
  memo.value = localStorage.getItem('qingdao_memo') || '';
  memo.oninput = () => {
    localStorage.setItem('qingdao_memo', memo.value);
    if (saved) saved.textContent = '자동 저장됨';
  };
}

// CNY → KRW 환율
async function loadExchangeRate() {
  try {
    const response = await fetch('https://api.frankfurter.dev/v2/rate/cny/krw', { cache: 'no-store' });
    if (!response.ok) throw new Error('rate failed');
    const data = await response.json();
    const rate = Number(data.rate);
    document.getElementById('fxRate').textContent = rate.toFixed(2);
    document.getElementById('fxDate').textContent = (data.date || '') + ' 기준';
    document.getElementById('fxStatus').textContent = 'LIVE';
    const fmt = n => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(n * rate);
    [100, 500, 1000].forEach(n => document.getElementById('fx' + n).textContent = fmt(n));
    const input = document.getElementById('cnyInput');
    const result = document.getElementById('krwResult');
    const update = () => result.textContent = fmt(Number(input.value) || 0) + '원';
    input.addEventListener('input', update);
    document.querySelectorAll('.fx-presets button').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.cny; update(); }));
    update();
  } catch (e) {
    document.getElementById('fxStatus').textContent = '오프라인';
  }
}
loadExchangeRate();

// 칭다오 날씨
async function loadWeather() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=36.0671&longitude=120.3826&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=7';
    const data = await (await fetch(url, { cache: 'no-store' })).json();
    const code = c => ({0:'☀️ 맑음',1:'🌤️ 대체로 맑음',2:'⛅ 구름 조금',3:'☁️ 흐림',45:'🌫️ 안개',51:'🌦️ 이슬비',61:'🌧️ 비',71:'🌨️ 눈',80:'🌦️ 소나기',95:'⛈️ 뇌우'}[c] || '🌤️ 변덕스러움');
    document.getElementById('weatherNow').innerHTML = `<div class="weather-temp">${Math.round(data.current.temperature_2m)}°C</div><div>${code(data.current.weather_code)} · 바람 ${Math.round(data.current.wind_speed_10m)} km/h</div>`;
    document.getElementById('forecast').innerHTML = data.daily.time.slice(0,4).map((x,i) => `<div class="forecast-day"><b>${x.slice(5).replace('-','/')}</b><strong>${code(data.daily.weather_code[i])}</strong><span>${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</span><br>💧 ${data.daily.precipitation_probability_max[i]}%</div>`).join('');
  } catch (e) {
    document.getElementById('weatherNow').textContent = '날씨 정보를 불러오지 못했어요.';
  }
}
loadWeather();
