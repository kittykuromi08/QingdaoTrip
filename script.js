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
