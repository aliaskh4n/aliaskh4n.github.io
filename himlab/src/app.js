'use strict';
/* ===== shell: tabs + hash routing ===== */
const App=(()=>{
  const views=['home','lab','book','titration','elements','solubility','calc','gas'];
  const hooks={};
  let cur=null;
  function show(name,push=true){
    if(!views.includes(name))name='home';
    if(cur===name)return;
    if(cur&&hooks[cur]&&hooks[cur].leave)hooks[cur].leave();
    cur=name;
    $$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+name));
    $$('#nav button').forEach(b=>{const on=b.dataset.view===name;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;if(on&&b.offsetParent)b.parentNode.scrollTo({left:b.offsetLeft-b.parentNode.clientWidth/2+b.clientWidth/2,behavior:'smooth'});});
    if(push&&location.hash!=='#'+name)history.replaceState(null,'','#'+name);
    window.scrollTo({top:0});
    if(hooks[name]&&hooks[name].enter)hooks[name].enter();
  }
  const SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function isDark(){const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;}
  function paintThemeBtn(){const b=$('#themeBtn');if(b)b.innerHTML=isDark()?SUN:MOON;}
  function initTheme(){
    let t=null;try{t=localStorage.getItem('himlab-theme');}catch(e){}
    document.documentElement.dataset.theme=t||'light';
    paintThemeBtn();
    const b=$('#themeBtn');if(!b)return;
    b.addEventListener('click',()=>{const t=isDark()?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('himlab-theme',t);}catch(e){}paintThemeBtn();});
  }
  const HELP={
    home:['ХимЛаб қалай жұмыс істейді',['Жоғарғы мәзірден немесе басты беттегі карточкалардан бөлімді таңдаңыз.','Әр бөлімде оң жақ жоғарғы бұрыштағы «?» батырмасы осы бөлімнің нұсқаулығын ашады.','Ай/күн батырмасы жарық және қараңғы режимді ауыстырады.']],
    lab:['Зертхана: нұсқаулық',['Сол жақтағы сөреден реактивті таңдаңыз. Атын іздеу жолына жазуға немесе санат бойынша сүзуге болады.','Жоғарғы панельден мөлшерін таңдаңыз: 2–50 мл немесе грамм.','Ыдысты басыңыз: реактив құйылады. Реакция жүрсе, ыдыста жазу шығады, ал теңдеу «Бақылау журналына» жазылады.','«Қыздыру» мен «Мұз» температураны өзгертеді, «Төгу» ыдысты тазартады. «Тапсырмалар» бөлімінде 12 дайын тәжірибе бар.']],
    book:['3D сабақ: нұсқаулық',['Сабақ тақырыбын таңдаңыз: кітап ашылады. Төмендегі › батырмасымен қадамдар бойынша жүріңіз.','Тышқанмен сүйреп айналдырыңыз, дөңгелекпен жақындатыңыз. Телефонда екі саусақпен.','«Сенің кезегің» қадамында: алдымен реактивті басыңыз, сосын пробирканы басыңыз. Бақылаулар дәптерге өзі жазылады.','«Дәптер» батырмасы: сұрақтарға жауап беріп, қорытынды жазыңыз да «Тексеру» басыңыз. Қалпақ белгісі: мұғалім режимі, дұрыс жауаптарды көрсетеді.']],
    titration:['Титрлеу: нұсқаулық',['Талданатын ерітіндіні, сынама көлемін, концентрацияны және индикаторды таңдаңыз.','Жылжытқышпен кранды ашыңыз немесе «Тамшы» батырмасымен бір-бірден қосыңыз.','Индикатордың түсі өзгергенде кранды жабыңыз: бұл эквиваленттік нүкте. График pH-тың өзгерісін көрсетеді.','«Есеп» режимінде концентрация жасырылады: оны өзіңіз есептеп, жауапты тексеріңіз.']],
    elements:['Периодтық кесте: нұсқаулық',['Элементті басыңыз: оң жақта оның Бор моделі мен негізгі қасиеттері шығады.','Іздеу жолына таңбасын, атын немесе нөмірін жазыңыз, мысалы: Fe, темір, 26.','Жоғарғы батырмалар кестені топтар, электртерістілік, масса немесе күйі бойынша бояйды.']],
    solubility:['Ерігіштік кестесі: нұсқаулық',['Жол: катион (металл немесе сутек). Баған: анион (қышқыл қалдығы).','Е: ериді. А: аз ериді. Ж: ерімейді, яғни тұнба түзеді. Сызықша: мұндай зат жоқ.','Ұяшықты басыңыз: астында заттың формуласы мен тұнбаның түсі шығады.']],
    calc:['Есептеулер: нұсқаулық',['Теңдеуді теңестіру: реакция сызбасын жазыңыз (мысалы, Fe + O2 -> Fe2O3), коэффициенттер өзі қойылады.','Молярлық масса: формуланы енгізіңіз, масса мен әр элементтің үлесі есептеледі.','Ерітінділер мен pH: мәндерді енгізіңіз, нәтиже бірден жаңарады.']],
    gas:['Газ заңдары: нұсқаулық',['Газды таңдап, температураны, зат мөлшерін және көлемді жылжытқыштармен өзгертіңіз.','Цилиндрдегі молекулалардың қозғалысын және қысым көрсеткішін бақылаңыз.','«Изотерма», «Изобара», «Изохора» бір шаманы тұрақты ұстайды: графиктен заңдылықты көріңіз.']],
  };
  function openHelp(v){
    const h=HELP[v]||HELP.home,d=$('#help');if(!d)return;
    $('#helpT').textContent=h[0];$('#helpB').innerHTML='';
    h[1].forEach(t=>{const li=document.createElement('li');li.textContent=t;$('#helpB').append(li);});
    if(d.showModal)d.showModal();else d.setAttribute('open','');
  }
  function closeHelp(){const d=$('#help');if(d.close)d.close();else d.removeAttribute('open');}
  function init(){
    initTheme();
    $('#helpBtn').addEventListener('click',()=>openHelp(cur));
    $('#helpX').addEventListener('click',closeHelp);$('#helpOk').addEventListener('click',closeHelp);
    $('#help').addEventListener('click',e=>{if(e.target.id==='help')closeHelp();});
    document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){show(g.dataset.go);return;}const h=e.target.closest('[data-help]');if(h)openHelp(h.dataset.help);});
    $$('.vhead').forEach(vh=>{const v=vh.closest('.view').id.slice(2);const b=document.createElement('button');b.type='button';b.className='btn sm helpchip';b.dataset.help=v;b.innerHTML=$('#helpBtn').innerHTML+'<span>Нұсқаулық</span>';vh.append(b);});
    $('#nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(b.dataset.view);});
    window.addEventListener('hashchange',()=>show(location.hash.slice(1),false));
    for(const m of[Lab,typeof Titr!=='undefined'&&Titr,typeof PTable!=='undefined'&&PTable,typeof Sol!=='undefined'&&Sol,typeof Calc!=='undefined'&&Calc,typeof Gas!=='undefined'&&Gas])if(m&&m.init)m.init();
    hooks.lab={enter:Lab.start,leave:Lab.stop};
    if(typeof Book3D!=='undefined'){Book3D.init();hooks.book={enter:Book3D.start,leave:Book3D.stop};}
    if(typeof Titr!=='undefined')hooks.titration={enter:Titr.start,leave:Titr.stop};
    if(typeof PTable!=='undefined')hooks.elements={enter:PTable.start,leave:PTable.stop};
    if(typeof Gas!=='undefined')hooks.gas={enter:Gas.start,leave:Gas.stop};
    show(location.hash.slice(1)||'home',false);
    $$('#nav button')[views.indexOf(cur)].setAttribute('aria-selected','true');
  }
  return{init,show};
})();
document.addEventListener('DOMContentLoaded',()=>{try{App.init();}catch(e){console.error(e);}});
