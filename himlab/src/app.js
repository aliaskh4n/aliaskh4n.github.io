'use strict';
/* ===== shell: tabs + hash routing ===== */
const App=(()=>{
  const views=['lab','titration','elements','solubility','calc','gas'];
  const hooks={};
  let cur=null;
  function show(name,push=true){
    if(!views.includes(name))name='lab';
    if(cur===name)return;
    if(cur&&hooks[cur]&&hooks[cur].leave)hooks[cur].leave();
    cur=name;
    $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+name));
    $$('#nav button').forEach(b=>{const on=b.dataset.view===name;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;if(on)b.scrollIntoView({block:'nearest',inline:'center'});});
    if(push&&location.hash!=='#'+name)history.replaceState(null,'','#'+name);
    if(hooks[name]&&hooks[name].enter)hooks[name].enter();
  }
  const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function isDark(){const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}
  function paintThemeBtn(){const b=$('#themeBtn');if(b)b.innerHTML=isDark()?SUN:MOON;}
  function initTheme(){
    try{const t=localStorage.getItem('himlab-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}
    paintThemeBtn();
    const b=$('#themeBtn');if(!b)return;
    b.addEventListener('click',()=>{const t=isDark()?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('himlab-theme',t);}catch(e){}paintThemeBtn();});
  }
  function init(){
    initTheme();
    $('#nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(b.dataset.view);});
    window.addEventListener('hashchange',()=>show(location.hash.slice(1),false));
    for(const m of[Lab,typeof Titr!=='undefined'&&Titr,typeof PTable!=='undefined'&&PTable,typeof Sol!=='undefined'&&Sol,typeof Calc!=='undefined'&&Calc,typeof Gas!=='undefined'&&Gas])if(m&&m.init)m.init();
    hooks.lab={enter:Lab.start,leave:Lab.stop};
    if(typeof Titr!=='undefined')hooks.titration={enter:Titr.start,leave:Titr.stop};
    if(typeof PTable!=='undefined')hooks.elements={enter:PTable.start,leave:PTable.stop};
    if(typeof Gas!=='undefined')hooks.gas={enter:Gas.start,leave:Gas.stop};
    show(location.hash.slice(1)||'lab',false);
    $$('#nav button')[views.indexOf(cur)].setAttribute('aria-selected','true');
  }
  return{init,show};
})();
document.addEventListener('DOMContentLoaded',()=>{try{App.init();}catch(e){console.error(e);}});
