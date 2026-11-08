'use strict';
/* ===== Lab bench: shelf, stations, rendering ===== */
const Lab=(()=>{
  const LW=340,LH=400,CX=170,BY=330;
  const S={act:0,stations:[],hand:{r:RBY.hcl,dose:10},speed:1,filter:'all',q:'',t0:performance.now(),done:new Set(),running:false,last:0};
  try{const d=JSON.parse(localStorage.getItem('chemlab-tasks')||'[]');d.forEach(x=>S.done.add(x));}catch(e){}

  const TASKS=[
    {tag:'agcl',t:'Хлорид-ионға сапалық реакция',d:'Күміс нитраты AgNO3-ті натрий хлоридімен немесе тұз қышқылымен араластырыңыз.'},
    {tag:'neutralized',t:'Индикатормен бейтараптау',d:'10 мл NaOH құйып, фенолфталеин қосыңыз (таңқурай түсі), содан кейін түссізденгенше HCl құйыңыз. Концентрациялары да, көлемдері де тең.'},
    {tag:'co2',t:'«Жанартау»: содадан газ',d:'Ас содасын сірке немесе тұз қышқылына салып, көпіршуін бақылаңыз.'},
    {tag:'cu-displace',t:'Орынбасу реакциясы',d:'Мырыш, темір немесе магнийді CuSO4 ерітіндісіне салыңыз. Металда қызыл мыс пайда болады.'},
    {tag:'cu-complex',t:'Мыстың аммиакты комплексі',d:'CuSO4-ке аммиак қосыңыз: алдымен көгілдір тұнба, содан кейін ашық көк ерітінді.'},
    {tag:'fescn',t:'Fe^3+ ионына сапалық реакция',d:'FeCl3-ті калий роданиді KSCN-мен араластырыңыз: қан-қызыл комплекс пайда болады.'},
    {tag:'baso4',t:'Сульфат-ионға реакция',d:'BaCl2-ні күкірт қышқылына немесе мыс сульфатына құйыңыз.'},
    {tag:'amph',t:'Мырыш гидроксидінің амфотерлігі',d:'ZnSO4-ке NaOH қосыңыз: ақ тұнба түзіледі. Тағы NaOH қоссаңыз, тұнба ериді.'},
    {tag:'redox',t:'Тотығу-тотықсыздану реакциясы',d:'Қышқыл ортада KMnO4 + H2O2 (H2SO4 қосыңыз): күлгін түс жоғалып, оттек бөлінеді.'},
    {tag:'catalysis',t:'Йодидпен катализ',d:'H2O2 мен KI араластырыңыз. Көпіршу мен қызу йодид жұмсалмай жүреді.'},
    {tag:'goldenrain',t:'«Алтын жаңбыр»',d:'Pb(NO3)2 мен KI-ден PbI2 алыңыз, тұнба ерігенше қыздырыңыз, содан кейін суытыңыз («Мұз» тездетеді).'},
    {tag:'na',t:'Сілтілік металл және су',d:'0.1 г натрийді су мен фенолфталеин құйылған стақанға салыңыз. Пробиркаға салуға болмайды.'},
  ];

  /* ---------- shelf ---------- */
  function bottleSVG(col,kind){
    const c=`rgb(${col[0]|0},${col[1]|0},${col[2]|0})`;
    if(kind==='solid')return `<svg viewBox="0 0 28 34"><path d="M5 14h18v14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill="${c}" stroke="currentColor" stroke-width="1.4"/><path d="M9 14V9h10v5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M7 3h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
    if(kind==='ind')return `<svg viewBox="0 0 28 34"><path d="M10 14h8v14a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z" fill="${c}" stroke="currentColor" stroke-width="1.4"/><path d="M12 14V7h4v7M11 3h6v4h-6z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    return `<svg viewBox="0 0 28 34"><path d="M9 13c-3 2-5 4-5 8v7a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-7c0-4-2-6-5-8V7H9z" fill="${c}" fill-opacity=".85" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 4h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M8 20h12" stroke="currentColor" stroke-width="1" opacity=".5"/></svg>`;
  }
  function renderShelf(){
    const list=$('#rlist');list.innerHTML='';
    const q=S.q.trim().toLowerCase();
    for(const[g,gn]of RGROUPS){
      if(S.filter!=='all'&&S.filter!==g)continue;
      const items=REAGENTS.filter(r=>r.cat===g&&(!q||(r.name+' '+r.f).toLowerCase().includes(q)));
      if(!items.length)continue;
      list.append(H('div',{class:'grp lbl k-'+['blue','green','yellow','red'][RGROUPS.findIndex(x=>x[0]===g)%4]},gn));
      for(const r of items){
        const b=H('button',{class:'rg'+(S.hand.r===r?' sel':''),type:'button','data-id':r.id,title:'Алу үшін басыңыз. Ыдысқа сүйреп апаруға болады.'},
          H('span',{html:bottleSVG(r.col,r.kind)}),
          H('span',{style:'min-width:0'},H('div',{class:'n'},r.name),H('div',{class:'s',html:chem(r.f)})),
          H('span',{class:'c'},r.kind==='liq'&&r.c?`${r.c} M`:r.kind==='solid'?'қатты':r.kind==='ind'?'тамшы':''));
        b.addEventListener('click',()=>{select(r);});
        b.addEventListener('pointerdown',e=>startDrag(e,r));
        list.append(b);
      }
    }
    if(!list.children.length)list.append(H('div',{class:'empty'},'Ештеңе табылмады.'));
  }
  function renderCats(){
    const sel=$('#rcats');sel.innerHTML='';
    for(const[k,n]of[['all','Барлық реактивтер'],...RGROUPS.filter(g=>g[0]!=='other')])sel.append(H('option',{value:k},n));
    sel.value=S.filter;sel.onchange=()=>{S.filter=sel.value;renderShelf();};
  }
  function select(r){
    S.hand.r=r;
    S.hand.dose=r.kind==='solid'?(r.id==='na'?0.1:0.5):r.kind==='ind'?0:10;
    renderShelf();renderHand();
  }
  function renderHand(){
    const r=S.hand.r;
    $('#handcur').innerHTML=`<span>${bottleSVG(r.col,r.kind)}</span><div><span class="lbl">Қолда</span><b>${r.name}</b><span class="muted mono" style="font-size:12px">${chem(r.f)}${r.kind==='liq'&&r.c?' · '+r.c+' моль/л':''}</span></div>`;
    const ps=$('#pourSub');if(ps)ps.textContent=r.name;
    const pl=$('#pourLbl');if(pl)pl.textContent=r.kind==='ind'?'2 тамшы қосу':`Құю: ${S.hand.dose} ${r.kind==='solid'?'г':'мл'}`;
    const box=$('#doses');box.innerHTML='';
    if(r.kind==='ind'){box.append(H('span',{class:'muted'},'2 тамшы'));return;}
    const arr=r.kind==='solid'?(r.id==='na'?[0.05,0.1,0.2,0.5,1]:DOSES_SOL):DOSES_LIQ;
    for(const d of arr)box.append(H('button',{class:'chip'+(S.hand.dose===d?' on':''),type:'button',onclick:()=>{S.hand.dose=d;renderHand();}},d+(r.kind==='solid'?' г':' мл')));
  }

  /* ---------- drag from shelf ---------- */
  let drag=null;
  function startDrag(e,r){
    if(e.pointerType==='touch'||e.button!==0)return;
    drag={r,x:e.clientX,y:e.clientY,ghost:null,over:null};
    document.addEventListener('pointermove',onDragMove);
    document.addEventListener('pointerup',onDragEnd,{once:true});
  }
  function onDragMove(e){
    if(!drag)return;
    if(!drag.ghost){
      if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;
      select(drag.r);
      drag.ghost=H('div',{class:'ghost',html:bottleSVG(drag.r.col,drag.r.kind)});document.body.append(drag.ghost);
    }
    drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';
    const el=document.elementFromPoint(e.clientX,e.clientY),st=el&&el.closest('.station');
    S.stations.forEach(s=>s.el.classList.toggle('drop',s.el===st));drag.over=st;
  }
  function onDragEnd(){
    document.removeEventListener('pointermove',onDragMove);
    if(drag&&drag.ghost){drag.ghost.remove();
      const st=S.stations.find(s=>s.el===drag.over);if(st)addTo(st);}
    S.stations.forEach(s=>s.el.classList.remove('drop'));drag=null;
  }
  function addTo(st){
    const r=S.hand.r,res=Eng.add(st.v,r,S.hand.dose);
    if(res.msg)flash(st,res.msg);
    if(res.ml||res.g){
      st.addLog=r.kind==='liq'?`+ ${res.ml.toFixed(res.ml<1?1:0)} мл: ${r.name}`:r.kind==='ind'?`+ индикатор: ${r.name}`:`+ ${res.g} г: ${r.name}`;
      logAdd(st,{text:st.addLog,eq:'',tag:'',plain:true});
    }
    sync(st);
  }

  /* ---------- stations ---------- */
  function mkStation(i){
    const v=Eng.newVessel(i===0?'tube':i===1?'beaker':'flask');
    const st={i,v,bub:[],steam:[],parts:[],sparks:[],shards:[],goldSeen:null,obsT:0,refr:0};
    const seg=H('select',{class:'vsel','aria-label':'Ыдыс түрі',onchange:e=>setType(st,e.target.value)});
    const names={tube:'Пробирка',beaker:'Стақан',flask:'Колба'};
    for(const k in names)seg.append(H('option',{value:k},names[k]));
    seg.value=v.type;
    const cv=H('canvas',{width:680,height:800,'aria-label':'Зертханалық ыдыс '+(i+1)});
    const obs=H('div',{class:'obs','aria-live':'polite'});
    const cw=H('div',{class:'cwrap',onclick:()=>addTo(st),title:'Таңдалған реактивті қосу үшін басыңыз'},cv,obs);
    const rT=H('b',{},'22 °C'),rPH=H('b',{},'—'),rV=H('b',{},'0 мл'),chip=H('i',{class:'phchip'});
    const IC={heat:'<path d="M12 3c.8 3 4.5 4.6 4.5 9.3a4.5 4.5 0 0 1-9 0c0-2.2 1.1-3.4 2.2-4.4.1 2 1 3.1 2.1 3.1 0-3-1.2-5 .2-8z"/>',
      ice:'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/>',
      clr:'<path d="M4 7h16M10 7V4h4v3M6 7l1 13h10l1-13"/>',
      stir:'<path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
      filt:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>'};
    const mk=(t,fn,ic,cls='')=>H('button',{class:'btn act '+cls,type:'button',onclick:fn,html:`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[ic]}</svg><span>${t}</span>`});
    const bHeat=mk('Қыздыру',()=>toggle(st,'heat'),'heat','k-red'),bIce=mk('Суыту',()=>toggle(st,'ice'),'ice','k-blue'),bStir=mk('Араластыру',()=>{st.v.stir=!st.v.stir;sync(st);},'stir','sm k-green'),
      bFilt=mk('Сүзу',()=>{const v=st.v;for(const k in v.solids)if(!v.piece[k]||!Eng.PIECES.includes(k))delete v.solids[k];v.susp={};st.parts=[];flash(st,'Тұнба сүзілді.');sync(st);},'filt','sm k-yellow'),
      bClr=mk('Төгу',()=>{st.v=Eng.newVessel(st.v.type);st.bub=[];st.steam=[];st.parts=[];st.shards=[];flash(st,'Ыдыс тазартылды.');sync(st);},'clr','k-yellow');
    const comp=H('div',{class:'comp'});
    const tile=(lbl,c,...k)=>H('div',{class:'rt '+c},H('small',{},lbl),H('b',{},...k));
    const el=H('article',{class:'station'},
      H('div',{class:'stage'},H('div',{class:'vsel-w'},seg),cw),
      H('div',{class:'read3'},tile('Температура','k-red',rT),tile('pH','k-green',rPH,chip),tile('Көлем','k-blue',rV)),
      H('div',{class:'acts'},bHeat,bIce,bClr,
        H('details',{class:'more'},H('summary',{class:'btn act'},H('span',{},'Тағы')),
          H('div',{class:'more-p'},H('div',{class:'row'},bStir,bFilt),H('div',{class:'lbl',style:'margin-top:10px'},'Ерітінді құрамы'),comp))));
    Object.assign(st,{el,cv,cw,obs,rT,rPH,rV,chip,bHeat,bIce,bStir,seg,comp});
    return st;
  }
  function pickStation(i){
    S.act=i;S.stations.forEach((s,k)=>{s.el.hidden=k!==i;});
    $$('#vtabs button').forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-selected',k===i);});
  }
  function toggle(st,m){st.v.mode=st.v.mode===m?'off':m;if(st.v.mode==='off'&&m==='heat')st.v.dry=false;sync(st);}
  function setType(st,k){
    const v=st.v;if(v.broken){return;}
    if(v.vol>Eng.VESSELS[k].cap){flash(st,'Ішіндегісі бұл ыдысқа сыймайды.');return;}
    v.type=k;st.bub=[];st.parts=[];sync(st);
  }
  function flash(st,text){st.obs.textContent=text;st.obs.classList.add('show');clearTimeout(st.obsT);st.obsT=setTimeout(()=>st.obs.classList.remove('show'),5200);}
  function sync(st){
    const v=st.v;
    st.seg.value=v.type;
    st.bHeat.classList.toggle('on',v.mode==='heat');st.bIce.classList.toggle('on',v.mode==='ice');st.bStir.classList.toggle('on',v.stir);
    readouts(st);
  }
  function readouts(st){
    const v=st.v;
    st.cw.classList.toggle('isempty',v.vol<=0&&!v.broken);
    st.rT.textContent=v.T.toFixed(1)+' °C';
    st.rV.textContent=(v.vol<10?v.vol.toFixed(1):v.vol.toFixed(0))+' мл';
    const tv=$(`#vtabs [data-i="${st.i}"] .vt-v`);if(tv)tv.textContent=v.broken?'сынған':v.vol>0?(v.vol<10?v.vol.toFixed(1):v.vol.toFixed(0))+' мл':'бос';
    st.rPH.firstChild.textContent=v.pH==null?'—':v.pH.toFixed(2);
    st.chip.style.background=v.pH==null?'transparent':`rgb(${phRGB(v.pH).map(x=>x|0)})`;
    if(st.el.querySelector('details').open){
      const c=Eng.composition(v);st.comp.innerHTML='';
      if(!c.ions.length&&!c.solids.length)st.comp.append(H('div',{class:'muted'},'Бос'));
      c.ions.slice(0,9).forEach(([n,x])=>st.comp.append(H('div',{},H('span',{html:chem(n)}),H('span',{class:'mono'},x>=.1?x.toFixed(2)+' М':x.toExponential(1)+' М'))));
      c.solids.forEach(([n,m])=>st.comp.append(H('div',{},H('span',{html:chem(n)+' (қ.)'}),H('span',{class:'mono'},(m*1000).toFixed(m<.01?2:1)+' ммоль'))));
    }
  }

  /* ---------- journal & tasks ---------- */
  function logAdd(st,ev){
    const box=$('#log .entries');if(!box)return;
    const t=Math.floor((performance.now()-S.t0)/1000),mm=String(Math.floor(t/60)).padStart(2,'0'),ss=String(t%60).padStart(2,'0');
    const e=H('div',{class:'ent'+(ev.warn?' warn':'')},H('div',{class:'m'},`${mm}:${ss} · Ыдыс ${st.i+1}${ev.plain?' · әрекет':''}`),H('div',{html:chem(ev.text)}));
    if(ev.eq)e.append(H('div',{class:'q',html:chem(ev.eq)}));
    if(ev.plain)e.style.borderLeftColor='var(--line)';
    box.querySelectorAll('.empty').forEach(x=>x.remove());
    box.prepend(e);while(box.children.length>80)box.lastChild.remove();
    const lt=$('#stabs [data-t="log"]');if(lt&&!lt.classList.contains('on'))lt.classList.add('new');
    if(!ev.plain)flash(st,ev.text);
  }
  function renderTasks(){
    const box=$('#tasks');box.innerHTML='';
    box.append(H('p',{class:'muted',style:'margin:0 0 8px;font-size:13px'},'Тәжірибені дұрыс жасасаңыз, тапсырма өзі белгіленеді.'));
    const c=$('#taskCnt');if(c)c.textContent=`${S.done.size}/${TASKS.length}`;
    for(const t of TASKS)box.append(H('div',{class:'task'+(S.done.has(t.tag)?' done':''),'data-tag':t.tag},H('i',{},S.done.has(t.tag)?'✓':''),H('div',{},H('b',{html:chem(t.t)}),H('span',{html:chem(t.d)}))));
  }
  function mark(tag){
    if(!tag||S.done.has(tag)||!TASKS.some(t=>t.tag===tag))return;
    S.done.add(tag);try{localStorage.setItem('chemlab-tasks',JSON.stringify([...S.done]));}catch(e){}
    renderTasks();
    const t=TASKS.find(x=>x.tag===tag);
    const box=$('#log .entries');if(box){const e=H('div',{class:'ent',style:'border-left-color:var(--good)'},H('div',{class:'m'},'Практикум'),H('div',{html:'✓ Тапсырма орындалды: '+chem(t.t)}));box.prepend(e);}
  }
  function renderLog(){
    const box=$('#log');box.innerHTML='';
    box.append(H('div',{class:'logh'},H('span',{class:'row',style:'gap:6px'},
      H('button',{class:'btn sm',type:'button',onclick:()=>{const txt=$$('#log .ent').reverse().map(e=>e.innerText.replace(/\n+/g,' | ')).join('\n');
        try{navigator.clipboard.writeText(txt).catch(()=>{});}catch(e){}}},'Көшіру'),
      H('button',{class:'btn sm',type:'button',onclick:()=>{$('#log .entries').innerHTML='';$('#log .entries').append(emptyLog());}},'Тазарту'))));
    box.append(H('div',{class:'entries'},emptyLog()));
  }
  function emptyLog(){
    return H('div',{class:'empty guide'},
      H('b',{},'Тәжірибе әлі басталған жоқ'),
      H('ol',{},H('li',{},'Сол жақтан реактивті таңдаңыз.'),H('li',{},'Төменнен мөлшерін таңдаңыз.'),H('li',{},'«Құю» батырмасын басыңыз немесе ыдыстың өзін басыңыз.'),H('li',{},'Басқа реактив қосыңыз: реакция осында жазылады.')),
      H('span',{class:'muted'},'Идея керек пе? «Тапсырмалар» қойындысын ашыңыз.'));
  }

  /* ---------- rendering ---------- */
  function outline(ctx,type,off){
    const V=Eng.VESSELS[type];ctx.beginPath();
    let first=true;
    for(let y=V.H;y>=0;y-=3){const hw=V.w(y)/2+off;if(first){ctx.moveTo(CX-hw,BY-y);first=false;}else ctx.lineTo(CX-hw,BY-y);}
    for(let y=0;y<=V.H;y+=3)ctx.lineTo(CX+V.w(y)/2+off,BY-y);
  }
  function seeded(n){let s=n*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280;};}
  function chunk(ctx,x,y,r,col,seed,coat){
    const R=seeded(seed),n=7;ctx.beginPath();
    for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=r*(.72+R()*.45);const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.8;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
    ctx.closePath();
    const g=ctx.createLinearGradient(x-r,y-r,x+r,y+r);g.addColorStop(0,rgba(col.map(c=>Math.min(255,c+40)),1));g.addColorStop(1,rgba(col.map(c=>c*.7),1));
    ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;ctx.stroke();
    if(coat&&coat.a>.02){ctx.fillStyle=rgba(coat.c,coat.a);ctx.fill();}
  }
  function draw(st,t,dt){
    const v=st.v,ctx=fitCanvas(st.cv,LW,LH),V=Eng.VESSELS[v.type];
    ctx.clearRect(0,0,LW,LH);
    const sh=v.fx.shake;ctx.save();if(sh>0)ctx.translate(rnd(-1,1)*sh*3,rnd(-1,1)*sh*3);
    // bench
    // bench surface is drawn by CSS (.stage) so it spans the full width
    // heater / ice
    const pw=v.type==='tube'?60:v.type==='beaker'?170:190;
    const hot=v.mode==='heat';
    if(hot){const g=ctx.createRadialGradient(CX,BY+10,6,CX,BY+10,pw*.8);g.addColorStop(0,'rgba(255,120,40,.55)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(0,BY-40,LW,110);}
    ctx.fillStyle=hot?'#c4552c':TH.plate;ctx.beginPath();ctx.roundRect?ctx.roundRect(CX-pw/2-14,BY+2,pw+28,22,5):ctx.rect(CX-pw/2-14,BY+2,pw+28,22);ctx.fill();
    ctx.fillStyle=rgba(TH.fg,.25);ctx.fillRect(CX-pw/2-6,BY+10,pw+12,2);
    if(v.mode==='ice'){const R=seeded(5);for(let i=0;i<10;i++){const x=CX-pw/2-18+R()*(pw+36),y=BY-4+R()*24;ctx.fillStyle='rgba(170,225,250,.55)';ctx.strokeStyle='rgba(220,245,255,.8)';ctx.save();ctx.translate(x,y);ctx.rotate(R()*1.4);ctx.fillRect(-7,-7,14,14);ctx.strokeRect(-7,-7,14,14);ctx.restore();}}
    if(v.broken){ // shards
      ctx.fillStyle=rgba(TH.fg,.5);ctx.font='13px Onest,sans-serif';ctx.textAlign='center';ctx.fillText('Ыдыс сынды',CX,BY-110);ctx.font='11px Onest,sans-serif';ctx.fillStyle=rgba(TH.muted,1);ctx.fillText('Жаңасын қою үшін «Төгу» басыңыз',CX,BY-92);
      drawShards(ctx,st,dt);ctx.restore();return;
    }
    // liquid
    const lvl=Eng.levelOf(v.type,v.vol),ytop=BY-lvl;
    ctx.save();outline(ctx,v.type,0);ctx.closePath();ctx.clip();
    if(v.vol>.05){
      const c=v.color,amp=1.1+v.fx.gas/70+(v.stir?1.6:0)+(v.flags.boil?2:0);
      const wv=x=>Math.sin(x*.07+t*2.1+v.seed)*amp+Math.sin(x*.16-t*3.3)*amp*.55;
      ctx.beginPath();ctx.moveTo(CX-100,ytop+wv(CX-100));for(let x=CX-100;x<=CX+100;x+=4)ctx.lineTo(x,ytop+wv(x));ctx.lineTo(CX+100,BY+4);ctx.lineTo(CX-100,BY+4);ctx.closePath();
      const g=ctx.createLinearGradient(0,ytop,0,BY);g.addColorStop(0,rgba([c.r,c.g,c.b],c.a));g.addColorStop(1,rgba([c.r*.82,c.g*.82,c.b*.86],Math.min(1,c.a+.12)));
      ctx.fillStyle=g;ctx.fill();
      ctx.strokeStyle=rgba([255,255,255],.45);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(CX-100,ytop+wv(CX-100));for(let x=CX-100;x<=CX+100;x+=4)ctx.lineTo(x,ytop+wv(x));ctx.stroke();
    }
    // sediment
    let sh0=0;const maxS=Math.max(8,lvl*.55);
    for(const k in v.solids){
      if(v.piece[k]&&Eng.PIECES.includes(k))continue;
      const mol=Math.max(0,(v.solids[k]||0)-(v.susp[k]||0));if(mol<1e-7||!Eng.SOLID[k])continue;
      const th=Math.min(clamp(Math.sqrt(mol)*170,2.5,52),maxS-sh0);if(th<=0)continue;
      const col=Eng.SOLID[k].c,R=seeded(k.length*7+Math.round(mol*1e4));
      ctx.fillStyle=rgba(col,.97);ctx.fillRect(CX-100,BY-sh0-th+2,200,th+4);
      ctx.fillStyle=rgba(col.map(c=>c*.8),.7);for(let i=0;i<th*1.5;i++)ctx.fillRect(CX-V.w(3)/2+R()*V.w(3),BY-sh0-th+R()*th,1.6,1.6);
      sh0+=th;
    }
    st.sed=sh0;
    // pieces
    const pcs=[];
    const dep=['Cu','Ag','Pb'].map(k=>[k,v.piece[k]?0:(v.solids[k]||0)]).sort((a,b)=>b[1]-a[1]);
    const depTot=dep.reduce((a,b)=>a+b[1],0),depCol=dep[0][1]>0?Eng.SOLID[dep[0][0]].c:null;
    for(const k of Eng.PIECES){
      const m=v.solids[k]||0;if(!v.piece[k]||m<1e-7)continue;
      const r=RBY[Object.keys(RBY).find(id=>RBY[id].key===k)],g=m*r.M,col=r.col;
      if(k==='Na'){
        const w=V.w(Math.max(lvl-2,5))/2-14,x=CX+Math.sin(t*1.7+v.seed)*w*Math.min(1,v.vol>.5?1:0),y=v.vol>.5?ytop-2:BY-8;
        const rr=clamp(3+Math.cbrt(g)*7,3,13);chunk(ctx,x,y,rr,col,3,null);pcs.push({x,y:ytop,k});continue;
      }
      if(k==='Mg'){
        const len=clamp(40+g*160,16,150),y0=BY-4;ctx.strokeStyle=rgba(col,1);ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();
        for(let i=0;i<=24;i++){const x=CX-len/2+len*i/24,y=y0-Math.abs(Math.sin(i*.55))*7;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
        if(depCol&&depTot>0){ctx.strokeStyle=rgba(depCol,clamp(depTot/(v.pieceInit[k]||1),0,.9));ctx.stroke();}
        pcs.push({x:CX,y:y0-4,k});continue;
      }
      if(k==='Fe'){
        const f=Math.sqrt(m/(v.pieceInit[k]||m)),L=Math.min(150,V.H-40)*clamp(f,.15,1);
        ctx.save();ctx.translate(CX-V.w(10)/2+14,BY-3);ctx.rotate(-1.1+(v.type==='tube'?.25:0));
        ctx.fillStyle=rgba(col,1);ctx.fillRect(0,-3,L,6);ctx.fillRect(-4,-6,5,12);
        if(depCol&&depTot>0){ctx.fillStyle=rgba(depCol,clamp(depTot/(v.pieceInit[k]||1)*1.2,0,.9));ctx.fillRect(0,-3,L,6);}
        ctx.restore();pcs.push({x:CX-V.w(10)/2+24,y:BY-14,k});continue;
      }
      if(k==='Cu'){
        const L=clamp(34+g*70,14,110);ctx.strokeStyle=rgba(col,1);ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();
        for(let i=0;i<=30;i++){const a=i*.9,x=CX-L/2+L*i/30,y=BY-8-Math.abs(Math.sin(a))*9;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();pcs.push({x:CX,y:BY-12,k});continue;
      }
      const n=clamp(Math.ceil(g/.7),1,6),rr=clamp(4+Math.cbrt(g/n)*9,3,16),R=seeded(k.length+5);
      const coat=depCol&&depTot>0&&(k==='Zn')?{c:depCol,a:clamp(depTot/((v.pieceInit[k]||1)*.8),0,.92)}:null;
      for(let i=0;i<n;i++){const x=CX+(R()-.5)*(V.w(rr+8)-rr*2-8),y=BY-sh0-rr*.55-(i>2?rr*.9:0);chunk(ctx,x,y,rr,col,i*5+3,coat);pcs.push({x,y,k});}
    }
    st.pcs=pcs;
    // particles
    updateParts(st,dt,ytop,V);
    for(const p of st.parts){
      if(p.gl){const a=.45+.55*Math.abs(Math.sin(t*6+p.ph));ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot+t*p.vr);ctx.fillStyle=`rgba(255,${190+p.ph*8|0},40,${a})`;ctx.fillRect(-p.r,-p.r*.35,p.r*2,p.r*.7);ctx.restore();}
      else{ctx.fillStyle=rgba(p.c,p.a);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.29);ctx.fill();}
    }
    // bubbles
    updateBubbles(st,dt,ytop,V);
    for(const b of st.bub){ctx.strokeStyle=b.brown?'rgba(150,80,30,.8)':'rgba(255,255,255,.75)';ctx.fillStyle=b.brown?'rgba(190,110,40,.25)':'rgba(255,255,255,.14)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.29);ctx.fill();ctx.stroke();}
    // stirrer rod inside
    if(v.stir&&v.vol>.2){const a=t*5,x=CX+Math.cos(a)*Math.min(18,V.w(30)/2-14);ctx.strokeStyle=rgba(TH.glass,.8);ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(CX+50,BY-V.H-16);ctx.lineTo(x,BY-14);ctx.stroke();}
    ctx.restore();
    // foam above surface
    if(v.foam>.02||v.fx.foam>.02){
      v.foam+=(v.fx.foam-v.foam)*Math.min(1,dt*3);
      const fh=v.foam*30,R=seeded(11);ctx.save();outline(ctx,v.type,0);ctx.closePath();ctx.clip();
      for(let i=0;i<v.foam*60;i++){const w=V.w(lvl)/2,x=CX+(R()*2-1)*w,y=ytop-R()*fh+Math.sin(t*3+i)*1.2,r=2+R()*5;ctx.fillStyle='rgba(255,255,255,.55)';ctx.strokeStyle='rgba(180,200,210,.7)';ctx.beginPath();ctx.arc(x,y,r,0,6.29);ctx.fill();ctx.stroke();}
      ctx.restore();
    }
    // glass
    ctx.lineJoin='round';ctx.lineCap='round';
    outline(ctx,v.type,2.5);ctx.strokeStyle=rgba(TH.glass,.9);ctx.lineWidth=2.6;ctx.stroke();
    ctx.beginPath();for(let y=V.H*.2;y<V.H*.82;y+=4){const x=CX-V.w(y)/2+7;y===V.H*.2?ctx.moveTo(x,BY-y):ctx.lineTo(x,BY-y);}ctx.strokeStyle=rgba(TH.glasshi,TH.dark?.28:.7);ctx.lineWidth=3;ctx.stroke();
    ctx.beginPath();ctx.moveTo(CX-V.w(V.H)/2-8,BY-V.H);ctx.lineTo(CX-V.w(V.H)/2-1,BY-V.H);ctx.moveTo(CX+V.w(V.H)/2+8,BY-V.H);ctx.lineTo(CX+V.w(V.H)/2+1,BY-V.H);ctx.strokeStyle=rgba(TH.glass,.9);ctx.lineWidth=2.6;ctx.stroke();
    // graduation
    ctx.font='9px "JetBrains Mono",monospace';ctx.textAlign='right';ctx.fillStyle=rgba(TH.glass,.85);ctx.strokeStyle=rgba(TH.glass,.7);ctx.lineWidth=1;
    const step=v.type==='tube'?5:50,minor=v.type==='tube'?1:10;
    for(let m=minor;m<=V.cap;m+=minor){const y=Eng.levelOf(v.type,m);if(y>V.H-6)break;const hw=V.w(y)/2,big=m%step===0;
      ctx.beginPath();ctx.moveTo(CX+hw-(big?13:7),BY-y);ctx.lineTo(CX+hw-2,BY-y);ctx.stroke();if(big)ctx.fillText(m,CX+hw-16,BY-y+3);}
    // thermometer
    drawThermo(ctx,v);
    // flame / steam / sparks
    if(v.fx.flame>.05){const px=st.pcs&&st.pcs.find(p=>p.k==='Na');if(px)drawFlame(ctx,px.x,ytop-6,v.fx.flame,t);}
    updateSteam(st,dt,ytop,V);
    for(const s of st.steam){ctx.fillStyle=rgba(TH.dark?[220,230,235]:[120,140,150],s.a);ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.29);ctx.fill();}
    if(v.gasKind==='NOx'||(v.fx.gasKind==='NOx'&&v.fx.gas>2)){const a=clamp(v.fx.gas/80,0,.5);const g=ctx.createLinearGradient(0,BY-V.H-90,0,BY-V.H);g.addColorStop(0,'rgba(170,80,20,0)');g.addColorStop(1,`rgba(170,80,20,${a})`);ctx.fillStyle=g;ctx.fillRect(CX-V.w(V.H)/2-6,BY-V.H-90,V.w(V.H)+12,90);}
    // pour
    if(v.pour){const p=v.pour;p.t+=dt;if(p.t>p.dur)v.pour=null;else drawPour(ctx,p,ytop,lvl,V);}
    ctx.restore();
  }
  function drawThermo(ctx,v){
    const x=304,y0=98,y1=312,T0=-10,T1=130;
    ctx.fillStyle=rgba(TH.panel,.7);ctx.strokeStyle=rgba(TH.glass,.8);ctx.lineWidth=1.6;
    ctx.beginPath();ctx.moveTo(x-4,y0);ctx.lineTo(x-4,y1);ctx.arc(x,y1+6,8,Math.PI*1.2,Math.PI*1.8,true);ctx.lineTo(x+4,y0);ctx.arc(x,y0,4,0,Math.PI,true);ctx.closePath();ctx.fill();ctx.stroke();
    const f=clamp((v.T-T0)/(T1-T0),0,1),yy=y1-(y1-y0)*f;
    ctx.fillStyle='#e0453a';ctx.fillRect(x-1.6,yy,3.2,y1-yy+4);ctx.beginPath();ctx.arc(x,y1+6,6,0,6.29);ctx.fill();
    ctx.fillStyle=rgba(TH.glass,.7);ctx.font='8px "JetBrains Mono",monospace';ctx.textAlign='left';
    for(let T=0;T<=120;T+=20){const y=y1-(y1-y0)*((T-T0)/(T1-T0));ctx.fillRect(x+5,y,5,1);ctx.fillText(T,x+12,y+3);}
  }
  function drawFlame(ctx,x,y,k,t){
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<5;i++){const h=(26+Math.sin(t*17+i*2)*9+i*2)*k,w=(11-i)*k;
      const g=ctx.createLinearGradient(0,0,0,-h);g.addColorStop(0,'rgba(255,230,90,.85)');g.addColorStop(.5,'rgba(255,150,30,.55)');g.addColorStop(1,'rgba(255,90,20,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-w+Math.sin(t*9+i)*3,0);ctx.quadraticCurveTo(-w*.6,-h*.5,Math.sin(t*13+i)*4,-h);ctx.quadraticCurveTo(w*.6,-h*.5,w+Math.sin(t*11+i)*3,0);ctx.fill();}
    ctx.restore();
  }
  function drawPour(ctx,p,ytop,lvl,V){
    const k=p.t/p.dur,fade=Math.min(1,k*6,(1-k)*6),col=p.col,my=62;
    ctx.save();ctx.globalAlpha=fade;
    ctx.translate(CX+8,my);ctx.rotate(-2.35);
    ctx.fillStyle=rgba(col,.9);ctx.strokeStyle=rgba(TH.glass,1);ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect?ctx.roundRect(-6,0,12,16,2):ctx.rect(-6,0,12,16);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.roundRect?ctx.roundRect(-17,14,34,46,7):ctx.rect(-17,14,34,46);ctx.fill();ctx.stroke();
    ctx.restore();
    const yEnd=lvl>0?ytop:BY-4;
    ctx.save();ctx.globalAlpha=fade;
    if(p.kind==='liq'){ctx.strokeStyle=rgba(col,.9);ctx.lineWidth=3.6*(1-k*.4);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(CX+2,my+8);ctx.lineTo(CX+2,yEnd);ctx.stroke();}
    else if(p.kind==='ind'){for(let i=0;i<2;i++){const kk=((k*2+i*.5)%1);ctx.fillStyle=rgba(col,.95);ctx.beginPath();ctx.arc(CX+2,lerp(my+10,yEnd,kk*kk),3,0,6.29);ctx.fill();}}
    else{const R=seeded(9);for(let i=0;i<7;i++){const kk=clamp(k*1.6-i*.08,0,1);if(kk<=0||kk>=1)continue;ctx.fillStyle=rgba(col,1);ctx.fillRect(CX-6+R()*12,lerp(my+8,yEnd,kk*kk),4,4);}}
    ctx.restore();
  }
  function updateBubbles(st,dt,ytop,V){
    const v=st.v;let rate=v.fx.gas;if(v.flags.boil)rate+=70;else if(v.T>70)rate+=(v.T-70)*.6;
    if(v.vol<.3)rate=0;
    st.acc=(st.acc||0)+rate*dt;
    while(st.acc>=1){st.acc-=1;
      const src=st.pcs&&st.pcs.length&&v.fx.gas>1&&Math.random()<.85?st.pcs[(Math.random()*st.pcs.length)|0]:null;
      const hw=V.w(14)/2-6;
      let x=src?src.x+rnd(-8,8):CX+rnd(-hw,hw),y=src?Math.min(src.y,BY-6):BY-8;
      st.bub.push({x,y,r:rnd(1.6,4.6),vy:rnd(40,95),ph:Math.random()*6,brown:v.fx.gasKind==='NOx'&&v.fx.gas>1});
    }
    for(const b of st.bub){b.y-=b.vy*dt;b.x+=Math.sin(b.y*.12+b.ph)*.35;b.r+=dt*.4;
      const hw=V.w(BY-b.y)/2-b.r-1;b.x=clamp(b.x,CX-hw,CX+hw);}
    st.bub=st.bub.filter(b=>b.y>ytop+2&&v.vol>.2);
    if(st.bub.length>260)st.bub.splice(0,st.bub.length-260);
  }
  function updateSteam(st,dt,ytop,V){
    const v=st.v;
    if(v.T>55&&v.vol>.5){st.sacc=(st.sacc||0)+((v.T-55)/45*(v.flags.boil?26:8))*dt;
      while(st.sacc>=1){st.sacc-=1;const hw=V.w(V.H)/2-8;st.steam.push({x:CX+rnd(-hw,hw),y:BY-V.H+rnd(-4,4),r:rnd(5,10),a:.16,vy:rnd(18,36),vx:rnd(-6,6)});}}
    for(const s of st.steam){s.y-=s.vy*dt;s.x+=s.vx*dt;s.r+=dt*14;s.a-=dt*.07;}
    st.steam=st.steam.filter(s=>s.a>0.01&&s.y>-20);
  }
  function updateParts(st,dt,ytop,V){
    const v=st.v;
    for(const sp of v.spawn){
      const col=Eng.SOLID[sp.key]?Eng.SOLID[sp.key].c:[240,240,240],cnt=clamp(Math.round(sp.n*7000),12,100);
      const hw=V.w(Math.max(8,BY-ytop))/2-6;
      for(let i=0;i<cnt;i++)st.parts.push({x:CX+rnd(-hw,hw),y:rnd(ytop+4,BY-6),vx:0,vy:rnd(3,9),r:rnd(1,2.6),c:col,a:.85,key:sp.key,swirl:Math.random()});
    }
    v.spawn.length=0;
    if(v.flags.gold&&v.flags.gold!==st.goldSeen){st.goldSeen=v.flags.gold;const hw=V.w(Math.max(8,BY-ytop))/2-8;
      for(let i=0;i<120;i++)st.parts.push({gl:true,x:CX+rnd(-hw,hw),y:rnd(ytop+4,BY-20),vx:0,vy:rnd(5,14),r:rnd(1.8,3.6),ph:Math.random()*6,rot:Math.random()*3,vr:rnd(-2,2),key:'PbI2'});}
    const sedTop=BY-(st.sed||0)-2;
    for(const p of st.parts){
      if(!p.gl&&!v.susp[p.key])p.vy+=dt*60;
      p.y+=p.vy*dt;
      if(v.stir){const a=performance.now()/1000*3+p.swirl*6;p.x+=Math.cos(a)*30*dt;p.y+=Math.sin(a)*14*dt-8*dt;}
      else p.x+=Math.sin(p.y*.1+p.swirl*9)*3*dt;
      const hw=V.w(BY-p.y)/2-3;p.x=clamp(p.x,CX-hw,CX+hw);
      if(p.y<ytop+2)p.y=ytop+2;
    }
    st.parts=st.parts.filter(p=>p.y<sedTop-(p.gl?0:0)&&v.vol>.1);
    if(st.parts.length>400)st.parts.splice(0,st.parts.length-400);
  }
  function drawShards(ctx,st,dt){
    const v=st.v;
    if(v.shard){v.shard=0;for(let i=0;i<26;i++)st.shards.push({x:CX+rnd(-30,30),y:BY-rnd(20,120),vx:rnd(-160,160),vy:rnd(-220,-30),r:rnd(3,9),rot:Math.random()*3,vr:rnd(-8,8)});}
    for(const s of st.shards){s.vy+=520*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot+=s.vr*dt;if(s.y>BY+16){s.y=BY+16;s.vx*=.4;s.vy=0;s.vr=0;}
      ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);ctx.fillStyle=rgba(TH.glass,.45);ctx.strokeStyle=rgba(TH.glass,.9);ctx.beginPath();ctx.moveTo(-s.r,0);ctx.lineTo(0,-s.r*.6);ctx.lineTo(s.r,s.r*.3);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  }

  /* ---------- loop ---------- */
  function frame(ts){
    if(!S.running)return;
    const t=ts/1000,dt=Math.min(.05,S.last?t-S.last:.016);S.last=t;
    for(const st of S.stations){
      const v=st.v;
      let rem=dt*S.speed;
      while(rem>0){const h=Math.min(.05,rem);Eng.step(v,h);rem-=h;}
      if(v.events.length){for(const ev of v.events)logAdd(st,ev);v.events.length=0;}
      if(v.tags.size){for(const tg of v.tags)mark(tg);v.tags.clear();}
      if(!st.el.hidden)draw(st,t,dt);
      st.refr+=dt;if(st.refr>.12){st.refr=0;readouts(st);}
    }
    requestAnimationFrame(frame);
  }
  function start(){if(S.running)return;S.running=true;S.last=0;requestAnimationFrame(frame);}
  function stop(){S.running=false;}
  function init(){
    renderCats();renderShelf();renderHand();renderTasks();renderLog();
    const box=$('#stations'),tabs=$('#vtabs');
    for(let i=0;i<3;i++){const st=mkStation(i);S.stations.push(st);box.append(st.el);
      tabs.append(H('button',{type:'button',role:'tab','data-i':i,onclick:()=>pickStation(i)},H('b',{},(i+1)+'-ыдыс'),H('small',{class:'vt-v'},'бос')));}
    pickStation(0);
    $('#pourBtn').addEventListener('click',()=>addTo(S.stations[S.act]));
    $('#stabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      $$('#stabs button').forEach(x=>x.classList.toggle('on',x===b));b.classList.remove('new');
      $$('.side .spane').forEach(p=>p.classList.toggle('on',p.dataset.p===b.dataset.t));});
    $('#rsearch').addEventListener('input',e=>{S.q=e.target.value;renderShelf();});
    $('#speed').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.speed=+b.dataset.s;$$('#speed button').forEach(x=>x.classList.toggle('on',x===b));});
    $('#resetAll').addEventListener('click',()=>{S.stations.forEach(st=>{st.v=Eng.newVessel(st.v.type);st.bub=[];st.parts=[];st.steam=[];st.shards=[];sync(st);});renderLog();S.t0=performance.now();});
    S.stations.forEach(sync);
  }
  return{init,start,stop,S,select,addTo};
})();
