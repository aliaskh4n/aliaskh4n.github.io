'use strict';
/* ===== Calculators: equation balancer, molar mass, solutions, pH ===== */
const Calc=(()=>{
  /* ---------- formula parser ---------- */
  function parseFormula(raw){
    let s=String(raw).replace(/\s+/g,'');
    let charge=0;const cm=s.match(/\^(\d*)([+\-−])$/);
    if(cm){charge=(cm[2]==='+'?1:-1)*(cm[1]?+cm[1]:1);s=s.slice(0,cm.index);}
    if(!s)throw new Error('Формула бос');
    const parts=s.split(/[·•*.]/),total={};
    for(const part of parts){
      let p=part,mult=1;const lead=p.match(/^(\d+)(?=[A-Z(\[])/);
      if(lead&&parts.length>1){mult=+lead[1];p=p.slice(lead[1].length);}
      let i=0;
      const num=()=>{let n='';while(i<p.length&&/\d/.test(p[i]))n+=p[i++];return n?+n:1;};
      const parse=depth=>{
        const m={};
        while(i<p.length){
          const c=p[i];
          if(c==='('||c==='['){i++;const inner=parse(depth+1),n=num();for(const k in inner)m[k]=(m[k]||0)+inner[k]*n;}
          else if(c===')'||c===']'){if(depth===0)throw new Error('Артық жабатын жақша');i++;return m;}
          else if(/[A-Z]/.test(c)){let sym=c;i++;if(i<p.length&&/[a-z]/.test(p[i]))sym+=p[i++];
            if(!BYSYM[sym])throw new Error('Белгісіз элемент: '+sym);m[sym]=(m[sym]||0)+num();}
          else throw new Error('Рұқсат етілмеген таңба «'+c+'»');
        }
        if(depth>0)throw new Error('Жақша жабылмаған');
        return m;
      };
      const m=parse(0);for(const k in m)total[k]=(total[k]||0)+m[k]*mult;
    }
    return{atoms:total,charge};
  }
  const molarMass=a=>Object.entries(a).reduce((s,[k,n])=>s+BYSYM[k].mass*n,0);

  /* ---------- rational arithmetic ---------- */
  const bgcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b];}return a;};
  class Fr{constructor(n,d=1n){if(d<0n){n=-n;d=-d;}const g=bgcd(n,d)||1n;this.n=n/g;this.d=d/g;}
    add(o){return new Fr(this.n*o.d+o.n*this.d,this.d*o.d);}sub(o){return new Fr(this.n*o.d-o.n*this.d,this.d*o.d);}
    mul(o){return new Fr(this.n*o.n,this.d*o.d);}div(o){return new Fr(this.n*o.d,this.d*o.n);}z(){return this.n===0n;}}
  function balance(eq){
    const sides=eq.split(/->|→|=>|⟶|=/);
    if(sides.length!==2)throw new Error('Бір ғана нұсқар керек: «->» немесе «=».');
    const split=s=>s.split(/\s\+\s|\+(?=[A-Z(\[\d])/).map(x=>x.trim().replace(/^\d+\s*(?=[A-Z(\[])/,'')).filter(Boolean);
    const L=split(sides[0]),R=split(sides[1]);
    if(!L.length||!R.length)throw new Error('Нұсқардың екі жағына да заттарды жазыңыз.');
    const sp=[...L,...R].map(parseFormula),n=sp.length;
    const els=[...new Set(sp.flatMap(x=>Object.keys(x.atoms)))];
    const hasCh=sp.some(x=>x.charge!==0);
    const rows=els.map(e=>sp.map((x,j)=>(x.atoms[e]||0)*(j<L.length?1:-1)));
    if(hasCh)rows.push(sp.map((x,j)=>x.charge*(j<L.length?1:-1)));
    for(const e of els)if(!sp.slice(0,L.length).some(x=>x.atoms[e])||!sp.slice(L.length).some(x=>x.atoms[e]))throw new Error(`${e} элементі теңдеудің тек бір жағында бар.`);
    // RREF
    const M=rows.map(r=>r.map(v=>new Fr(BigInt(v))));const piv=[];let r=0;
    for(let c=0;c<n&&r<M.length;c++){
      let p=r;while(p<M.length&&M[p][c].z())p++;if(p===M.length)continue;
      [M[r],M[p]]=[M[p],M[r]];const pv=M[r][c];M[r]=M[r].map(v=>v.div(pv));
      for(let i=0;i<M.length;i++)if(i!==r&&!M[i][c].z()){const f=M[i][c];M[i]=M[i].map((v,k)=>v.sub(f.mul(M[r][k])));}
      piv.push(c);r++;
    }
    const free=[...Array(n).keys()].filter(c=>!piv.includes(c));
    if(free.length===0)throw new Error('Теңдеуді теңестіру мүмкін емес: заттардың формулаларын тексеріңіз.');
    if(free.length>1)throw new Error('Шешім бірмәнді емес: сызбада бірнеше тәуелсіз реакция бар. Оларды бөліп жазыңыз.');
    const x=Array(n).fill(null);x[free[0]]=new Fr(1n);
    piv.forEach((c,i)=>{x[c]=new Fr(0n).sub(M[i][free[0]]);});
    let l=1n;for(const v of x)l=l*v.d/bgcd(l,v.d);
    let co=x.map(v=>v.n*(l/v.d));
    if(co.every(v=>v<=0n))co=co.map(v=>-v);
    if(co.some(v=>v<=0n))throw new Error('Коэффициенттер теріс шығады: реакция бұл түрде мүмкін емес.');
    let g=0n;for(const v of co)g=bgcd(g,v);co=co.map(v=>Number(v/g));
    return{L,R,co,els:hasCh?[...els,'заряд']:els,rows,sp,names:[...L,...R]};
  }
  function fmtEq(res){
    const f=(names,co)=>names.map((nm,i)=>(co[i]>1?`<span class="k">${co[i]}</span>`:'')+chem(nm.replace(/·/g,'·'))).join(' + ');
    return f(res.L,res.co.slice(0,res.L.length))+' → '+f(res.R,res.co.slice(res.L.length));
  }
  function runBalance(){
    const out=$('#balOut'),msg=$('#balMsg');
    try{
      const r=balance($('#balIn').value);out.innerHTML=fmtEq(r);
      let t='<details><summary style="cursor:pointer">Атомдар бойынша тексеру</summary><table class="t" style="margin-top:6px"><tr><th>Элемент</th><th class="r">Сол жақ</th><th class="r">Оң жақ</th></tr>';
      r.els.forEach((e,i)=>{let a=0,b=0;r.rows[i].forEach((v,j)=>{if(j<r.L.length)a+=v*r.co[j];else b-=v*r.co[j];});t+=`<tr><td>${e}</td><td class="r">${a}</td><td class="r">${b}</td></tr>`;});
      msg.className='msg';msg.innerHTML=t+'</table></details>';
    }catch(e){out.innerHTML='<span class="muted">—</span>';msg.className='msg err';msg.textContent=e.message;}
  }

  /* ---------- molar mass ---------- */
  let M0=0;
  function runMol(){
    const msg=$('#molMsg'),T=$('#molT');
    try{
      const f=parseFormula($('#molIn').value),M=molarMass(f.atoms);M0=M;
      $('#molM').textContent=M.toFixed(3)+' г/моль';msg.textContent='';
      T.innerHTML='<tr><th>Элемент</th><th class="r">Атом саны</th><th class="r">Ar</th><th class="r">Үлесі</th><th style="width:30%"></th></tr>';
      Object.entries(f.atoms).sort((a,b)=>BYSYM[b[0]].mass*b[1]-BYSYM[a[0]].mass*a[1]).forEach(([k,n])=>{
        const m=BYSYM[k].mass*n,w=m/M*100;
        const tr=H('tr',{},H('td',{},`${BYSYM[k].name} (${k})`),H('td',{class:'r'},n),H('td',{class:'r'},BYSYM[k].mass),H('td',{class:'r'},w.toFixed(2)+' %'),H('td',{},H('div',{class:'bar',style:'width:0'})));
        T.append(tr);requestAnimationFrame(()=>requestAnimationFrame(()=>{tr.querySelector('.bar').style.width=w+'%';}));
      });
      conv('cvG');
    }catch(e){M0=0;$('#molM').textContent='—';msg.className='msg err';msg.textContent=e.message;T.innerHTML='';}
  }
  const NA=6.02214076;
  function conv(src){
    if(!M0)return;
    const g=$('#cvG'),n=$('#cvN'),p=$('#cvP'),v=$('#cvV');
    const val=+$('#'+src).value;let mol;
    if(isNaN(val)||$('#'+src).value==='')mol=null;
    else mol=src==='cvG'?val/M0:src==='cvN'?val:src==='cvP'?val/NA:val/22.4;
    const set=(el,x)=>{if(el.id!==src)el.value=mol==null?'':+x.toPrecision(5);};
    if(mol!=null){set(g,mol*M0);set(n,mol);set(p,mol*NA);set(v,mol*22.4);}
  }

  /* ---------- solutions ---------- */
  function runSol(){
    try{
      const M=molarMass(parseFormula($('#slF').value).atoms),m=+$('#slM').value,V=+$('#slV').value,d=+$('#slD').value||1;
      $('#slC').textContent=V>0?(m/M/(V/1000)).toFixed(4)+' М':'—';
      $('#slW').textContent=V>0&&d>0?(m/(V*d)*100).toFixed(2)+' %':'—';
    }catch(e){$('#slC').textContent='—';$('#slW').textContent='—';}
    const c1=+$('#dlC1').value,v1=+$('#dlV1').value,c2=+$('#dlC2').value,msg=$('#dlMsg');
    if(c1>0&&v1>0&&c2>0){
      const v2=c1*v1/c2;$('#dlV2').textContent=v2.toFixed(2)+' мл';
      if(c2>c1){msg.className='msg err';msg.textContent='Сұйылту арқылы концентрлірек ерітінді алу мүмкін емес.';}
      else{msg.className='msg';msg.textContent=`${v1} мл ерітінді алып, оған ${(v2-v1).toFixed(2)} мл су қосыңыз (сұйылту еселігі ${(c1/c2).toFixed(2)}).`;}
    }else{$('#dlV2').textContent='—';msg.textContent='';}
  }

  /* ---------- pH ---------- */
  const Kw=1e-14;
  const SUBS=[
    ['HCl, күшті қышқыл',C=>x=>x-C-Kw/x,'pH = −lg C'],
    ['HNO₃, күшті қышқыл',C=>x=>x-C-Kw/x,'pH = −lg C'],
    ['H₂SO₄ (екінші саты Ka = 0.012)',C=>x=>x-C*(1+.012/(.012+x))-Kw/x,'бірінші саты толық, екіншісі ішінара'],
    ['CH₃COOH, Ka = 1.8·10⁻⁵',C=>x=>x-Kw/x-C*1.8e-5/(1.8e-5+x),'әлсіз қышқыл: [H⁺] ≈ √(Ka·C)'],
    ['HCOOH, Ka = 1.8·10⁻⁴',C=>x=>x-Kw/x-C*1.8e-4/(1.8e-4+x),'әлсіз қышқыл'],
    ['HF, Ka = 6.8·10⁻⁴',C=>x=>x-Kw/x-C*6.8e-4/(6.8e-4+x),'әлсіз қышқыл'],
    ['HCN, Ka = 6.2·10⁻¹⁰',C=>x=>x-Kw/x-C*6.2e-10/(6.2e-10+x),'өте әлсіз қышқыл'],
    ['NaOH, күшті негіз',C=>x=>x+C-Kw/x,'pOH = −lg C'],
    ['Ca(OH)₂, күшті негіз',C=>x=>x+2*C-Kw/x,'[OH⁻] = 2C'],
    ['NH₃, Kb = 1.8·10⁻⁵',C=>x=>x+C*x/(x+5.6e-10)-Kw/x,'әлсіз негіз: [OH⁻] ≈ √(Kb·C)'],
    ['NaCl',C=>x=>x-Kw/x,'күшті қышқыл мен күшті негіздің тұзы: бейтарап орта'],
    ['CH₃COONa',C=>x=>x+C-Kw/x-C*1.8e-5/(1.8e-5+x),'анион бойынша гидролиз: орта сілтілі'],
    ['NH₄Cl',C=>x=>x-Kw/x+C*x/(x+5.6e-10)-C,'катион бойынша гидролиз: орта қышқыл'],
    ['Na₂CO₃ (анион бойынша гидролиз)',C=>x=>{const K1=4.45e-7,K2=4.7e-11,D=x*x+K1*x+K1*K2;return x+2*C-Kw/x-C*(K1*x+2*K1*K2)/D;},'карбонат-ион: күшті гидролизденетін тұз'],
    ['NaHCO₃',C=>x=>{const K1=4.45e-7,K2=4.7e-11,D=x*x+K1*x+K1*K2;return x+C-Kw/x-C*(K1*x+2*K1*K2)/D;},'амфолит: pH ≈ ½(pK₁ + pK₂)'],
  ];
  function runPh(){
    const i=+$('#phS').value,C=+$('#phC').value,msg=$('#phMsg'),R=$('#phR'),bar=$('#phBar');
    if(!(C>0)){R.textContent='—';msg.textContent='Нөлден үлкен концентрация енгізіңіз.';return;}
    const F=SUBS[i][1](C);let a=-2,b=16;for(let k=0;k<60;k++){const m=(a+b)/2;if(F(Math.pow(10,-m))>0)a=m;else b=m;}
    const pH=(a+b)/2;R.textContent='pH '+pH.toFixed(2);
    const kind=pH<6.5?'қышқыл орта':pH>7.5?'сілтілі орта':'бейтарапқа жақын';
    msg.innerHTML=`${kind}; pOH = ${(14-pH).toFixed(2)}; [H⁺] = ${Math.pow(10,-pH).toExponential(2)} моль/л. ${SUBS[i][2]}.`;
    let mk=bar.firstChild;if(!mk){mk=H('div',{style:'position:absolute;top:-4px;width:4px;height:16px;border-radius:2px;background:var(--fg);transition:left .4s'});bar.append(mk);}
    mk.style.left=`calc(${clamp(pH,0,14)/14*100}% - 2px)`;
  }

  function init(){
    // balancer
    const ex=['Fe + O2 -> Fe2O3','C3H8 + O2 -> CO2 + H2O','Al + H2SO4 -> Al2(SO4)3 + H2','KMnO4 + HCl -> KCl + MnCl2 + Cl2 + H2O','MnO4^- + Fe^2+ + H^+ -> Mn^2+ + Fe^3+ + H2O','CuSO4·5H2O -> CuSO4 + H2O','Ca3(PO4)2 + SiO2 + C -> CaSiO3 + P + CO'];
    ex.forEach(t=>$('#balEx').append(H('button',{class:'chip',type:'button',onclick:()=>{$('#balIn').value=t;runBalance();}},t)));
    $('#balIn').addEventListener('input',runBalance);runBalance();
    // mol
    $('#molIn').addEventListener('input',runMol);runMol();
    ['cvG','cvN','cvP','cvV'].forEach(id=>$('#'+id).addEventListener('input',()=>conv(id)));
    $('#cvG').value=12.5;conv('cvG');
    // solutions
    ['slF','slM','slV','slD','dlC1','dlV1','dlC2'].forEach(id=>$('#'+id).addEventListener('input',runSol));runSol();
    // ph
    SUBS.forEach((s,i)=>$('#phS').append(H('option',{value:i},s[0])));
    $('#phBar').style.cssText='position:relative;height:8px;border-radius:4px;background:linear-gradient(90deg,#e0243c,#f3722c,#f9c74f,#8fd14f,#2bb673,#25a8a8,#3a7bd5,#5a4fcf,#8e3ba8)';
    $('#phS').addEventListener('change',runPh);$('#phC').addEventListener('input',runPh);runPh();
  }
  return{init,parseFormula,molarMass,balance};
})();
