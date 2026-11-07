'use strict';
/* ===== Solubility table ===== */
const Sol=(()=>{
  const CH={H:1,NH4:1,Li:1,Na:1,K:1,Mg:2,Ca:2,Ba:2,Al:3,Zn:2,Fe2:2,Fe3:3,Cu:2,Ag:1,Pb:2};
  const CF={H:'H',NH4:'NH4',Li:'Li',Na:'Na',K:'K',Mg:'Mg',Ca:'Ca',Ba:'Ba',Al:'Al',Zn:'Zn',Fe2:'Fe',Fe3:'Fe',Cu:'Cu',Ag:'Ag',Pb:'Pb'};
  const AC={OH:1,Cl:1,Br:1,I:1,NO3:1,SO4:2,CO3:2,S:2,PO4:3,Ac:1};
  const AF={OH:'OH',Cl:'Cl',Br:'Br',I:'I',NO3:'NO3',SO4:'SO4',CO3:'CO3',S:'S',PO4:'PO4',Ac:'CH3COO'};
  const POLY=new Set(['NH4','OH','NO3','SO4','CO3','PO4','Ac']);
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const HEX={'ақ':'#f4f4f4','ақ ірімшік тәрізді':'#f4f4f4','ақшыл сары':'#efe6a0','сары':'#f3d34a','ашық сары':'#f8c61a','сарғыш-ақ':'#efe8b8','қара':'#222','көгілдір':'#4b8ff0','қоңыр':'#a0501f','сұрғылт-жасыл':'#96b88c','ақшыл-жасыл':'#cfe0c8','көгілдірлеу':'#bcd8f5','ақ іркілдек':'#eef2f4'};
  const NAMES={R:'ериді',M:'аз ериді',N:'іс жүзінде ерімейді',X:'жоқ немесе сумен ыдырайды'};
  const MAP={'Р':'R','М':'M','Н':'N','X':'X'};
  function formula(c,a){
    const zc=CH[c],za=AC[a],g=gcd(zc,za),nc=za/g,na=zc/g;
    const part=(s,n,poly)=>n>1?(poly?`(${s})${n}`:`${s}${n}`):s;
    return part(CF[c],nc,POLY.has(c))+part(AF[a],na,POLY.has(a));
  }
  let sel=null;
  function init(){
    const box=$('#soltbl');box.innerHTML='';
    const tb=H('table',{});
    const hr=H('tr',{},H('th',{}));
    SOL_AN.forEach(a=>hr.append(H('th',{html:chem(a[1])+`<div class="muted" style="font-weight:400;font-size:10px">${a[2]}</div>`})));
    tb.append(hr);
    SOL_CAT.forEach(c=>{
      const tr=H('tr',{},H('th',{class:'c',html:chem(c[1])+`<span class="muted" style="font-weight:400;font-size:11px"> ${c[2]}</span>`}));
      SOL_AN.forEach((a,i)=>{
        const k=MAP[c[3][i]],td=H('td',{class:k,'data-c':c[0],'data-a':a[0],tabindex:0,role:'button','aria-label':`${c[2]} ${a[2]}: ${NAMES[k]}`},k==='R'?'Е':k==='M'?'А':k==='N'?'Ж':'—');
        const go=()=>pick(td,c,a,k);td.addEventListener('click',go);td.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
        td.addEventListener('mouseenter',()=>hover(c[0],a[0],true));td.addEventListener('mouseleave',()=>hover(c[0],a[0],false));
        tr.append(td);
      });
      tb.append(tr);
    });
    box.append(tb);
    pick($('td[data-c="Ag"][data-a="Cl"]',box),SOL_CAT.find(c=>c[0]==='Ag'),SOL_AN[1],'N');
  }
  function hover(c,a,on){$$('#soltbl td').forEach(td=>td.classList.toggle('hl',on&&(td.dataset.c===c||td.dataset.a===a)));}
  function pick(td,c,a,k){
    $$('#soltbl td.sel').forEach(x=>x.classList.remove('sel'));td.classList.add('sel');
    const f=formula(c[0],a[0]),col=SOL_COL[c[0]+'|'+a[0]],inLab=Eng.PREC.some(r=>r[0]===c[0]&&r[1]===a[0]);
    const d=$('#soldet');d.innerHTML='';
    d.append(H('span',{class:'sw',style:`background:${k==='R'?'transparent':col&&HEX[col]?HEX[col]:'var(--panel2)'}`}));
    d.append(H('div',{},H('div',{style:'font-size:18px;font-weight:600',html:`${chem(f)} <span class="muted" style="font-size:13px;font-weight:400">${c[2]} ${a[2]}</span>`}),
      H('div',{html:`${NAMES[k][0].toUpperCase()+NAMES[k].slice(1)}${k!=='R'&&col?`, тұнба: ${col}`:''}.`+(inLab?' Бұл реакцияны «Зертхана» бөлімінде жасауға болады.':'')}),
      H('div',{class:'muted mono',style:'font-size:12px;margin-top:2px',html:chem(`${c[1]} + ${a[1]}`)+(k==='N'||k==='M'?' → '+chem(f)+'↓':'')})));
  }
  return{init};
})();
