'use strict';
/* ===== Periodic table + Bohr model ===== */
const PTable=(()=>{
  const S={sel:BYSYM.Fe,mode:'cat',q:'',filter:null,running:false,cells:{}};
  const STATE={gas:'газ',liq:'сұйық',solid:'қатты',unk:'белгісіз'};
  const lab=(e)=>e.cat;
  function bg(e){
    const m=S.mode;
    if(m==='cat'){const h=CAT_HUE[e.cat];return[`color-mix(in srgb, hsl(${h} 70% 52%) 26%, var(--panel))`,`hsl(${h} 60% 52% / .6)`];}
    if(m==='en'){if(e.en==null)return['var(--panel2)','var(--line)'];const t=clamp((e.en-.7)/(3.98-.7),0,1),h=lerp(215,8,t);return[`color-mix(in srgb, hsl(${h} 75% 52%) 38%, var(--panel))`,`hsl(${h} 60% 52% / .6)`];}
    if(m==='mass'){const t=clamp(e.mass/294,0,1);return[`color-mix(in srgb, var(--accent) ${(8+t*62).toFixed(0)}%, var(--panel))`,'var(--line)'];}
    const h={solid:225,liq:28,gas:190,unk:0}[e.state];
    return e.state==='unk'?['var(--panel2)','var(--line)']:[`color-mix(in srgb, hsl(${h} 70% 52%) 28%, var(--panel))`,`hsl(${h} 60% 52% / .6)`];
  }
  function third(e){return S.mode==='en'?(e.en!=null?e.en.toFixed(2):'—'):S.mode==='state'?'':(e.mass>=100?String(Math.round(e.mass)):String(e.mass));}
  function build(){
    const g=$('#pt');g.innerHTML='';g.style.gridTemplateRows='repeat(7,minmax(46px,auto)) 14px repeat(2,minmax(46px,auto))';
    for(const e of ELEMENTS){
      const b=H('button',{class:'el',type:'button','data-z':e.z,title:`${e.name}, ${e.z}`,'aria-label':`${e.name}, нөмірі ${e.z}`},H('small',{},e.z),H('b',{},e.sym),H('small',{class:'t3'},''));
      b.style.gridRow=e.row;b.style.gridColumn=e.col;
      b.addEventListener('click',()=>select(e));
      g.append(b);S.cells[e.z]=b;
    }
    const ph=(r,t)=>{const d=H('div',{class:'el ph'},t);d.style.gridRow=r;d.style.gridColumn=3;g.append(d);};
    ph(6,'57–71');ph(7,'89–103');
    const lb=(r,t)=>{const d=H('div',{class:'el ph',style:'border:0;justify-content:flex-end;align-items:flex-end;text-align:right'},t);d.style.gridRow=r;d.style.gridColumn='1 / 3';g.append(d);};
    lb(9,'Лантаноидтар');lb(10,'Актиноидтар');
  }
  function paint(){
    const q=S.q.trim().toLowerCase();
    for(const e of ELEMENTS){
      const b=S.cells[e.z],[bgc,bc]=bg(e);b.style.background=bgc;b.style.borderColor=bc;b.querySelector('.t3').textContent=third(e);
      let on=true;
      if(S.filter)on=e.cat===S.filter;
      if(on&&q)on=e.sym.toLowerCase()===q||e.name.toLowerCase().includes(q)||String(e.z)===q;
      b.classList.toggle('dim',!on);b.classList.toggle('sel',e===S.sel);
    }
    legend();
  }
  function legend(){
    const L=$('#ptlegend');L.innerHTML='';
    if(S.mode==='cat')for(const k in CATS)L.append(H('button',{class:'lg'+(S.filter===k?' on':''),type:'button',onclick:()=>{S.filter=S.filter===k?null:k;paint();}},H('i',{style:`background:hsl(${CAT_HUE[k]} 65% 52%)`}),CATS[k]));
    else if(S.mode==='en'){L.append(H('div',{style:'width:100%;max-width:420px'},H('div',{class:'gradbar',style:'background:linear-gradient(90deg,hsl(215 75% 52%),hsl(111 75% 52%),hsl(8 75% 52%))'}),H('div',{class:'row',style:'justify-content:space-between;font-size:12px;color:var(--muted)'},H('span',{},'0.7 (төмен)'),H('span',{},'3.98 (фтор)'))));}
    else if(S.mode==='mass'){L.append(H('div',{style:'width:100%;max-width:420px'},H('div',{class:'gradbar',style:'background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 8%,var(--panel)),var(--accent))'}),H('div',{class:'row',style:'justify-content:space-between;font-size:12px;color:var(--muted)'},H('span',{},'1 м.а.б.'),H('span',{},'294 м.а.б.'))));}
    else for(const[k,h]of[['solid',225],['liq',28],['gas',190],['unk',0]])L.append(H('span',{class:'lg',style:'cursor:default'},H('i',{style:k==='unk'?'background:var(--line)':`background:hsl(${h} 65% 52%)`}),STATE[k]));
  }
  function select(e){S.sel=e;paint();side();}
  function side(){
    const e=S.sel,sh=shellsOf(e.z),box=$('#ptside');
    const val=e.block==='s'||e.block==='p'?sh[sh.length-1]:null;
    const neutrons=Math.round(e.mass)-e.z;
    box.innerHTML='';
    box.append(H('h3',{},e.name,H('small',{},`${e.sym} · ${e.z}`)));
    box.append(H('canvas',{id:'bohr',width:600,height:600,'aria-label':'Бор моделі: '+e.name}));
    const kv=H('dl',{class:'kv'});
    const row=(k,v)=>{kv.append(H('dt',{},k),H('dd',{html:v}));};
    row('Санаты',CATS[e.cat]);
    row('Атомдық масса',e.mass+' м.а.б.');
    row('Период / топ',`${e.period} / ${e.group||'—'}`);
    row('Блок',e.block+'-элемент');
    row('Конфигурация',configOf(e.z));
    row('Қабаттардағы электрондар',sh.join(' · '));
    row('Валенттік электрондар',val!=null?val:'тотығу дәрежесіне байланысты');
    row('Протондар / нейтрондар',`${e.z} / ${neutrons}`);
    row('Электртерістілік',e.en!=null?e.en.toFixed(2)+' (Полинг бойынша)':'деректер жоқ');
    row('20 °C кезіндегі күйі',STATE[e.state]);
    box.append(kv);
  }
  /* ---- bohr ---- */
  function seeded(n){let s=n*7919+13;return()=>{s=(s*9301+49297)%233280;return s/233280;};}
  function drawBohr(t){
    const cv=$('#bohr');if(!cv)return;const ctx=fitCanvas(cv,300,300);ctx.clearRect(0,0,300,300);
    const e=S.sel,sh=shellsOf(e.z),n=sh.length,cx=150,cy=150,Rmax=140,r0=24;
    // nucleus
    const A=Math.round(e.mass),R=seeded(e.z),nr=clamp(5+Math.cbrt(A)*1.5,6,15);
    const gl=ctx.createRadialGradient(cx,cy,2,cx,cy,nr*2.4);gl.addColorStop(0,rgba(TH.accent,.5));gl.addColorStop(1,rgba(TH.accent,0));ctx.fillStyle=gl;ctx.beginPath();ctx.arc(cx,cy,nr*2.4,0,6.29);ctx.fill();
    const cnt=Math.min(e.z+A-e.z,60),pr=e.z/(A||1);
    for(let i=0;i<Math.min(A,60);i++){const a=R()*6.29,d=Math.sqrt(R())*nr;ctx.fillStyle=R()<pr?'#e0554a':rgba(TH.muted,1);ctx.beginPath();ctx.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d,2.6,0,6.29);ctx.fill();}
    for(let i=0;i<n;i++){
      const r=r0+(i+1)*(Rmax-r0)/n,cnt=sh[i],last=i===n-1,w=(i%2?-1:1)*1.1/(1+i*.5);
      ctx.strokeStyle=rgba(TH.muted,last?.6:.3);ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,6.29);ctx.stroke();
      for(let k=0;k<cnt;k++){const a=k/cnt*6.29+w*t+i*.7,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
        if(last){const g=ctx.createRadialGradient(x,y,0,x,y,9);g.addColorStop(0,rgba(TH.accent,.55));g.addColorStop(1,rgba(TH.accent,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,9,0,6.29);ctx.fill();}
        ctx.fillStyle=last?rgba(TH.accent,1):rgba(TH.fg,.85);ctx.beginPath();ctx.arc(x,y,last?3.6:3,0,6.29);ctx.fill();}
      ctx.font='9px "JetBrains Mono",monospace';ctx.textAlign='center';ctx.fillStyle=rgba(TH.muted,1);ctx.fillText(cnt,cx,cy-r-3);
    }
  }
  function frame(ts){if(!S.running)return;drawBohr(ts/1000);requestAnimationFrame(frame);}
  function start(){if(S.running)return;S.running=true;requestAnimationFrame(frame);}
  function stop(){S.running=false;}
  function init(){
    build();paint();side();
    $('#ptq').addEventListener('input',e=>{S.q=e.target.value;paint();const q=S.q.trim().toLowerCase();if(q){const m=ELEMENTS.find(x=>x.sym.toLowerCase()===q||x.name.toLowerCase()===q||String(x.z)===q);if(m&&m!==S.sel)select(m);}});
    $('#ptmode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.mode=b.dataset.m;S.filter=null;$$('#ptmode button').forEach(x=>x.classList.toggle('on',x===b));paint();});
  }
  return{init,start,stop};
})();
