'use strict';
/* ===== reaction engine: ions (mol), solids (mol), gas pool, temperature ===== */
const Eng=(()=>{
  const E=1e-9;
  const CHG={H:1,OH:-1,Na:1,K:1,Cl:-1,SO4:-2,NO3:-1,CO3:-2,HCO3:-1,Ca:2,Ba:2,Cu:2,Fe3:3,Fe2:2,Ag:1,Pb:2,I:-1,MnO4:-1,SCN:-1,NH3:0,NH4:1,Zn:2,Mg:2,HAc:0,Ac:-1,H2O2:0,Mn:2,I2:0,CuNH3:2,AgNH3:1,ZnOH4:-2,FeSCN:2};
  const ION_FMT={H:'H^+',OH:'OH^-',Na:'Na^+',K:'K^+',Cl:'Cl^-',SO4:'SO4^2-',NO3:'NO3^-',CO3:'CO3^2-',HCO3:'HCO3^-',Ca:'Ca^2+',Ba:'Ba^2+',Cu:'Cu^2+',Fe3:'Fe^3+',Fe2:'Fe^2+',Ag:'Ag^+',Pb:'Pb^2+',I:'I^-',MnO4:'MnO4^-',SCN:'SCN^-',NH3:'NH3',NH4:'NH4^+',Zn:'Zn^2+',Mg:'Mg^2+',HAc:'CH3COOH',Ac:'CH3COO^-',H2O2:'H2O2',Mn:'Mn^2+',I2:'I2',CuNH3:'[Cu(NH3)4]^2+',AgNH3:'[Ag(NH3)2]^+',ZnOH4:'[Zn(OH)4]^2-',FeSCN:'[Fe(SCN)]^2+'};
  const VESSELS={
    tube:{name:'Пробирка',cap:25,H:250,limit:1500,
      w:y=>{const R=26;if(y<R){const d=R-y;return 2*Math.sqrt(Math.max(0,R*R-d*d));}return 2*R;}},
    beaker:{name:'Стақан',cap:250,H:178,limit:7000,
      w:y=>y<9?140-2*(9-Math.sqrt(Math.max(0,81-(9-y)*(9-y)))):140},
    flask:{name:'Колба',cap:250,H:206,limit:5000,
      w:y=>{const base=y<10?(10-Math.sqrt(Math.max(0,100-(10-y)*(10-y))))*2:0;return(y<=120?lerp(164,44,y/120):44)-base;}}
  };
  for(const k in VESSELS){ // cumulative volume table (area ~ w^2) up to 90% height = nominal capacity
    const V=VESSELS[k],tab=[0];let s=0;
    for(let y=1;y<=V.H;y++){s+=Math.pow(V.w(y-.5),2);tab.push(s);}
    const hm=Math.round(V.H*.9);V.hmax=hm;V.tab=tab.map(x=>x/tab[hm]*V.cap);
  }
  function levelOf(type,vol){
    const V=VESSELS[type],t=V.tab;
    if(vol<=0)return 0;
    let lo=0,hi=V.H;while(hi-lo>1){const m=(lo+hi)>>1;if(t[m]<vol)lo=m;else hi=m;}
    const a=t[lo],b=t[hi];return lo+(b>a?(vol-a)/(b-a):0);
  }
  /* ---- precipitation table: cat, an, nCat, nAn, key, colour, text, Ksp (0 = complete) ---- */
  const PBK=T=>4.4e-9*Math.pow(10,Math.max(0,T-20)*.0556);
  const PREC=[
    ['Ag','Cl',1,1,'AgCl',[240,242,244],'күміс хлоридінің ақ ірімшік тәрізді тұнбасы түзіледі',0],
    ['Ag','I',1,1,'AgI',[232,222,110],'күміс йодидінің ақшыл сары тұнбасы түзіледі',0],
    ['Ag','CO3',2,1,'Ag2CO3',[225,220,160],'күміс карбонатының сарғыш-ақ тұнбасы түзіледі',0],
    ['Ag','OH',1,1,'Ag2O',[120,80,48],'күміс оксидінің қоңыр тұнбасы түзіледі',0],
    ['Ag','SO4',2,1,'Ag2SO4',[245,245,245],'күміс сульфатының ақ тұнбасы түзіледі',1.2e-5],
    ['Ba','SO4',1,1,'BaSO4',[246,246,246],'барий сульфатының ақ ұсақ кристалды тұнбасы түзіледі',0],
    ['Ba','CO3',1,1,'BaCO3',[244,244,244],'барий карбонатының ақ тұнбасы түзіледі',0],
    ['Ca','CO3',1,1,'CaCO3',[244,244,240],'кальций карбонатының ақ тұнбасы түзіледі',0],
    ['Ca','SO4',1,1,'CaSO4',[246,246,246],'кальций сульфатының ақ тұнбасы түзіледі',4.9e-5],
    ['Ca','OH',1,2,'Ca(OH)2',[244,244,244],'кальций гидроксидінің ақ лайы пайда болады',5.5e-6],
    ['Pb','SO4',1,1,'PbSO4',[246,246,246],'қорғасын сульфатының ақ тұнбасы түзіледі',0],
    ['Pb','I',1,2,'PbI2',[250,200,25],'қорғасын йодидінің ашық сары тұнбасы түзіледі',PBK],
    ['Pb','Cl',1,2,'PbCl2',[245,245,245],'қорғасын хлоридінің ақ тұнбасы түзіледі',1.7e-5],
    ['Pb','OH',1,2,'Pb(OH)2',[244,244,244],'қорғасын гидроксидінің ақ тұнбасы түзіледі',0],
    ['Cu','OH',1,2,'Cu(OH)2',[70,135,240],'мыс(II) гидроксидінің көгілдір іркілдек тұнбасы түзіледі',0],
    ['Cu','CO3',1,1,'CuCO3',[80,190,165],'мыстың негіздік карбонатының көкшіл-жасыл тұнбасы түзіледі',0],
    ['Fe3','OH',1,3,'Fe(OH)3',[160,68,28],'темір(III) гидроксидінің қоңыр іркілдек тұнбасы түзіледі',0],
    ['Fe2','OH',1,2,'Fe(OH)2',[150,185,140],'темір(II) гидроксидінің сұрғылт-жасыл тұнбасы түзіледі',0],
    ['Mg','OH',1,2,'Mg(OH)2',[244,244,244],'магний гидроксидінің ақ тұнбасы түзіледі',0],
    ['Mg','CO3',1,1,'MgCO3',[244,244,244],'магний карбонатының ақ тұнбасы түзіледі',0],
    ['Zn','OH',1,2,'Zn(OH)2',[244,244,244],'мырыш гидроксидінің ақ тұнбасы түзіледі',0],
    ['Zn','CO3',1,1,'ZnCO3',[244,244,244],'мырыш карбонатының ақ тұнбасы түзіледі',0],
  ];
  const SOLID={Zn:{c:[165,172,178]},Mg:{c:[205,210,215]},Fe:{c:[115,120,126]},Cu:{c:[190,98,60]},Na:{c:[205,210,218]},Ag:{c:[222,226,232]},Pb:{c:[95,100,106]},CuI:{c:[236,230,220]},MnO2:{c:[85,60,45]}};
  for(const r of PREC)SOLID[r[4]]={c:r[5],gel:/OH/.test(r[1])&&r[0]!=='Ca'&&r[0]!=='Ag'};
  const PIECES=['Zn','Mg','Fe','Cu','Na','CaCO3'];
  const MET={Mg:{E:-2.37,z:2,ion:'Mg',k:.55},Zn:{E:-.76,z:2,ion:'Zn',k:.16},Fe:{E:-.44,z:2,ion:'Fe2',k:.06},Cu:{E:.34,z:2,ion:'Cu',k:.14}};
  const OX=[{id:'Ag',E:.80,n:1},{id:'Fe3',E:.77,n:1},{id:'Cu',E:.34,n:2},{id:'Pb',E:-.13,n:2},{id:'H',E:0,n:1},{id:'HAc',E:0,n:1,slow:.22}];
  const DISS=PREC.filter(r=>r[1]==='OH'||r[1]==='CO3').map(r=>({key:r[4],cat:r[0],nc:r[2],an:r[1],na:r[3]}));
  const SPC={Cu:{c:[40,140,240],k:5},Fe3:{c:[205,125,40],k:7},Fe2:{c:[165,210,145],k:2.5},MnO4:{c:[150,20,165],k:45},I2:{c:[150,70,20],k:30},FeSCN:{c:[185,15,15],k:70},CuNH3:{c:[15,45,205],k:12}};
  const HYD={Fe3:2.2,Cu:7.5,Zn:8.7,Pb:7.7,Fe2:9.6};

  function newVessel(type='beaker'){
    return{type,vol:0,ions:{},solids:{},piece:{},pieceInit:{},gas:{},T:22,mode:'off',stir:false,ind:null,susp:{},t:0,last:{},flags:{},
      fx:{gas:0,gasKind:null,foam:0,flame:0,sparkle:0,shake:0,heat:0},events:[],tags:new Set(),pH:null,broken:false,pour:null,spawn:[],
      color:{r:150,g:205,b:235,a:.22},foam:0,dry:false,seed:Math.random()*1000};
  }
  const cap=v=>VESSELS[v.type].cap;
  function note(v,id,text,eq,tag){
    if(tag)v.tags.add(tag);
    const l=v.last[id];v.last[id]=v.t;
    if(l!==undefined&&v.t-l<2.5)return;
    v.events.push({text,eq,tag});
  }
  function heat(v,Q){v.T+=Q/(4.18*Math.max(v.vol,3));}
  const gas=(v,k,n)=>{v.gas[k]=(v.gas[k]||0)+n;};

  /* ---- adding reagents ---- */
  function add(v,r,amt){
    if(v.broken)return{msg:'Ыдыс сынды. Жаңасын қою үшін «Төгу» батырмасын басыңыз.'};
    const I=v.ions;
    if(r.kind==='liq'||r.kind==='ind'){
      let ml=r.kind==='ind'?.2:amt,msg='';
      const free=cap(v)-v.vol;
      if(free<=.01)return{msg:'Ыдыс толы.'};
      if(ml>free){ml=free;msg=`Ыдыс толды: ${ml.toFixed(1)} мл қосылды.`;}
      v.T=(v.T*Math.max(v.vol,0)+22*ml)/(v.vol+ml||1);
      v.vol+=ml;
      if(r.kind==='ind'){v.ind=r.id;note(v,'ind','Ерітіндіге индикатор қосылды: '+IND[r.id].name+'.','','ind');}
      else for(const k in r.sp)I[k]=(I[k]||0)+r.c*ml/1000*r.sp[k];
      v.pour={kind:r.kind,col:r.col,t:0,dur:r.kind==='ind'?.9:clamp(.7+ml/35,.7,1.8)};
      return{ml,msg};
    }
    const mol=amt/r.M;
    if(r.diss){for(const k in r.sp)I[k]=(I[k]||0)+r.sp[k]*mol;note(v,'diss-'+r.id,`${r.name} суда ериді.`,'','');}
    else{v.solids[r.key]=(v.solids[r.key]||0)+mol;v.piece[r.key]=true;v.pieceInit[r.key]=Math.max(v.pieceInit[r.key]||0,v.solids[r.key]);
      if(r.id==='na'&&v.vol<.5)note(v,'dryna','Натрий сусыз түбінде жатыр: реакция жоқ.','','');}
    v.pour={kind:'solid',col:r.col,t:0,dur:.55};
    return{g:amt,msg:''};
  }

  /* ---- instant ionic rules ---- */
  function instant(v){
    const I=v.ions,S=v.solids,V=v.vol/1000;let ch=false;
    if(V<=0)return false;
    const g=k=>I[k]||0,ad=(k,n)=>{I[k]=(I[k]||0)+n;if(I[k]<1e-12)I[k]=0;},sd=(k,n)=>{S[k]=(S[k]||0)+n;if(S[k]<1e-12)S[k]=0;};
    const useAcid=n=>{const a=Math.min(g('H'),n);ad('H',-a);const b=n-a;if(b>0){ad('HAc',-b);ad('Ac',b);}};
    const acid=()=>g('H')+g('HAc');
    const born=(key,u)=>{v.susp[key]=(v.susp[key]||0)+u;v.spawn.push({key,n:u});};
    let n;
    // acid-base
    n=Math.min(g('H'),g('OH'));
    if(n>E){ad('H',-n);ad('OH',-n);heat(v,n*55800);v.flags.neut=true;ch=true;note(v,'neut','Бейтараптану реакциясы: ерітінді қызады.','H^+ + OH^- → H2O','neut');}
    n=Math.min(g('HAc'),g('OH'));
    if(n>E){ad('HAc',-n);ad('OH',-n);ad('Ac',n);heat(v,n*56000);ch=true;v.flags.neut=true;note(v,'neutac','Сірке қышқылы сілтімен бейтараптанады.','CH3COOH + OH^- → CH3COO^- + H2O','neut');}
    n=Math.min(g('NH3'),g('H'));
    if(n>E){ad('NH3',-n);ad('H',-n);ad('NH4',n);heat(v,n*52000);ch=true;v.flags.neut=true;note(v,'nh3h','Аммиак қышқылды байланыстырады.','NH3 + H^+ → NH4^+','neut');}
    n=Math.min(g('HCO3'),g('OH'));
    if(n>E){ad('HCO3',-n);ad('OH',-n);ad('CO3',n);ch=true;note(v,'hco3oh','Гидрокарбонат карбонатқа айналады.','HCO3^- + OH^- → CO3^2- + H2O','');}
    // carbonates + acid
    n=Math.min(acid(),g('CO3'));
    if(n>E){useAcid(n);ad('CO3',-n);ad('HCO3',n);ch=true;}
    n=Math.min(acid(),g('HCO3'));
    if(n>E){useAcid(n);ad('HCO3',-n);gas(v,'CO2',n);ch=true;v.flags.co2=true;note(v,'co2','Көмірқышқыл газы қарқынды бөлінеді.','HCO3^- + H^+ → H2O + CO2↑','co2');}
    // Fe3+ with carbonates: mutual hydrolysis
    n=Math.min(g('Fe3')/2,g('CO3')/3);
    if(n>E){ad('Fe3',-2*n);ad('CO3',-3*n);sd('Fe(OH)3',2*n);born('Fe(OH)3',2*n);gas(v,'CO2',3*n);ch=true;note(v,'fecarb','Қоңыр тұнба түзіліп, газ бөлінеді: бірлескен гидролиз.','2Fe^3+ + 3CO3^2- + 3H2O → 2Fe(OH)3↓ + 3CO2↑','co2');}
    n=Math.min(g('Fe3'),g('HCO3')/3);
    if(n>E){ad('Fe3',-n);ad('HCO3',-3*n);sd('Fe(OH)3',n);born('Fe(OH)3',n);gas(v,'CO2',3*n);ch=true;note(v,'fecarb2','Қоңыр тұнба түзіліп, газ бөлінеді.','Fe^3+ + 3HCO3^- → Fe(OH)3↓ + 3CO2↑','co2');}
    // ammonia as a base for hydroxides
    for(const[c,z,nm]of[['Cu',2,'Cu(OH)2'],['Fe3',3,'Fe(OH)3'],['Fe2',2,'Fe(OH)2'],['Zn',2,'Zn(OH)2'],['Pb',2,'Pb(OH)2']]){
      n=Math.min(g(c),g('NH3')/z);
      if(n>E){ad(c,-n);ad('NH3',-z*n);ad('NH4',z*n);sd(nm,n);born(nm,n);ch=true;
        const row=PREC.find(r=>r[4]===nm);note(v,'amm-'+c,'Аммиак ерітіндісімен: '+row[6]+'.',`${ION_FMT[c]} + ${z}NH3 + ${z}H2O → ${nm}↓ + ${z}NH4^+`,c==='Cu'?'cu-oh':'');}
    }
    // redox, fast
    n=Math.min(g('Cu')/2,g('I')/4);
    if(n>E){ad('Cu',-2*n);ad('I',-4*n);sd('CuI',2*n);born('CuI',2*n);ad('I2',n);ch=true;note(v,'cui','CuI ақ тұнбасы түзіледі, ерітінді йодтан қоңырланады.','2Cu^2+ + 4I^- → 2CuI↓ + I2','redox');}
    n=Math.min(g('Fe3')/2,g('I')/2);
    if(n>E){ad('Fe3',-2*n);ad('I',-2*n);ad('Fe2',2*n);ad('I2',n);ch=true;note(v,'fei','Темір(III) иондары йодидті тотықтырады: ерітінді қоңырланады.','2Fe^3+ + 2I^- → 2Fe^2+ + I2','redox');}
    n=Math.min(g('MnO4')/2,g('H2O2')/5,g('H')/6);
    if(n>E){ad('MnO4',-2*n);ad('H2O2',-5*n);ad('H',-6*n);ad('Mn',2*n);gas(v,'O2',5*n);heat(v,n*400000);ch=true;note(v,'mnh2o2','Күлгін түс жоғалады, оттек бөлінеді.','2MnO4^- + 5H2O2 + 6H^+ → 2Mn^2+ + 5O2↑ + 8H2O','redox');}
    n=Math.min(g('MnO4')/2,g('H2O2')/3);
    if(n>E&&g('H')<1e-7){ad('MnO4',-2*n);ad('H2O2',-3*n);ad('OH',2*n);sd('MnO2',2*n);born('MnO2',2*n);gas(v,'O2',3*n);ch=true;note(v,'mnoh2o2','MnO2 қоңыр тұнбасы түзіліп, оттек бөлінеді.','2MnO4^- + 3H2O2 → 2MnO2↓ + 3O2↑ + 2OH^- + 2H2O','redox');}
    n=Math.min(g('MnO4')/2,g('I')/10,g('H')/16);
    if(n>E){ad('MnO4',-2*n);ad('I',-10*n);ad('H',-16*n);ad('Mn',2*n);ad('I2',5*n);ch=true;note(v,'mni','Ерітінді қоңырланады: йод бөлінеді.','2MnO4^- + 10I^- + 16H^+ → 2Mn^2+ + 5I2 + 8H2O','redox');}
    n=Math.min(g('MnO4'),g('Fe2')/5,g('H')/8);
    if(n>E){ad('MnO4',-n);ad('Fe2',-5*n);ad('H',-8*n);ad('Mn',n);ad('Fe3',5*n);ch=true;note(v,'mnfe','Күлгін түс жоғалады: Fe(II) Fe(III)-ке дейін тотығады.','MnO4^- + 5Fe^2+ + 8H^+ → Mn^2+ + 5Fe^3+ + 4H2O','redox');}
    // complexes
    n=Math.min(g('Fe3'),g('SCN'));
    if(n>E){ad('Fe3',-n);ad('SCN',-n);ad('FeSCN',n);ch=true;note(v,'fescn','Комплекстің қан-қызыл түсі пайда болады.','Fe^3+ + SCN^- → [Fe(SCN)]^2+','fescn');}
    n=Math.min(S['Cu(OH)2']||0,g('NH3')/4);
    if(n>E){sd('Cu(OH)2',-n);ad('NH3',-4*n);ad('CuNH3',n);ad('OH',2*n);v.susp['Cu(OH)2']=Math.min(v.susp['Cu(OH)2']||0,S['Cu(OH)2']||0);ch=true;note(v,'cunh3','Аммиак артық болғанда тұнба ериді: ашық көк комплекс.','Cu(OH)2 + 4NH3 → [Cu(NH3)4]^2+ + 2OH^-','cu-complex');}
    n=Math.min(S['AgCl']||0,g('NH3')/2);
    if(n>E){sd('AgCl',-n);ad('NH3',-2*n);ad('AgNH3',n);ad('Cl',n);v.susp.AgCl=Math.min(v.susp.AgCl||0,S.AgCl||0);ch=true;note(v,'agnh3','AgCl тұнбасы аммиакта ериді.','AgCl + 2NH3 → [Ag(NH3)2]^+ + Cl^-','ag-complex');}
    n=Math.min(g('Ag'),g('NH3')/2);
    if(n>E&&g('Cl')<E){ad('Ag',-n);ad('NH3',-2*n);ad('AgNH3',n);ch=true;}
    n=Math.min(g('AgNH3'),g('H')/2);
    if(n>E){ad('AgNH3',-n);ad('H',-2*n);ad('Ag',n);ad('NH4',2*n);ch=true;note(v,'agnh3h','Қышқыл комплексті бұзады: күміс қайта тұнбаға түседі.','[Ag(NH3)2]^+ + 2H^+ → Ag^+ + 2NH4^+','');}
    n=Math.min(g('CuNH3'),g('H')/4);
    if(n>E){ad('CuNH3',-n);ad('H',-4*n);ad('Cu',n);ad('NH4',4*n);ch=true;note(v,'cunh3h','Көк комплекс қышқылмен бұзылады.','[Cu(NH3)4]^2+ + 4H^+ → Cu^2+ + 4NH4^+','');}
    n=Math.min(S['Zn(OH)2']||0,g('OH')/2);
    if(n>E){sd('Zn(OH)2',-n);ad('OH',-2*n);ad('ZnOH4',n);v.susp['Zn(OH)2']=Math.min(v.susp['Zn(OH)2']||0,S['Zn(OH)2']||0);ch=true;note(v,'znoh','Мырыш гидроксиді амфотерлі: сілті артық болғанда тұнба ериді.','Zn(OH)2 + 2OH^- → [Zn(OH)4]^2-','amph');}
    n=Math.min(g('ZnOH4'),g('H')/2);
    if(n>E){ad('ZnOH4',-n);ad('H',-2*n);sd('Zn(OH)2',n);born('Zn(OH)2',n);ch=true;note(v,'znohh','Қышқыл мырыш гидроксидінің тұнбасын қайтарады.','[Zn(OH)4]^2- + 2H^+ → Zn(OH)2↓ + 2H2O','amph');}
    // precipitation / dissolution by Ksp
    for(const r of PREC){
      const[c,a,nc,na,key,col,txt,ksp]=r;
      const C=g(c),A=g(a);
      if(!ksp){
        const u=Math.min(C/nc,A/na);
        if(u>E){ad(c,-u*nc);ad(a,-u*na);sd(key,u);born(key,u);ch=true;
          note(v,'p-'+key,txt[0].toUpperCase()+txt.slice(1)+'.',`${nc>1?nc:''}${ION_FMT[c]} + ${na>1?na:''}${ION_FMT[a]} → ${key}↓`,key==='AgCl'?'agcl':key==='BaSO4'?'baso4':key==='Cu(OH)2'?'cu-oh':key==='PbI2'?'pbi2':'prec');}
        continue;
      }
      const kT=typeof ksp==='function'?ksp(v.T):ksp,sol=S[key]||0;
      if(C<E&&sol<E)continue;
      const f=x=>Math.pow(Math.max(0,C-nc*x)/V,nc)*Math.pow(Math.max(0,A-na*x)/V,na)-kT;
      let lo=-sol,hi=Math.min(C/nc,A/na),x=0;
      if(f(0)>0){if(hi<=E)continue;if(f(hi)>0)x=hi;else{let a0=0,b0=hi;for(let i=0;i<50;i++){const m=(a0+b0)/2;if(f(m)>0)a0=m;else b0=m;}x=(a0+b0)/2;}}
      else{if(sol<E)continue;if(f(lo)<0)x=lo;else{let a0=lo,b0=0;for(let i=0;i<50;i++){const m=(a0+b0)/2;if(f(m)>0)a0=m;else b0=m;}x=(a0+b0)/2;}}
      if(Math.abs(x)<2e-8)continue;
      ad(c,-x*nc);ad(a,-x*na);sd(key,x);ch=true;
      if(x>0){
        born(key,x);
        if(key==='PbI2'&&v.flags.pbHot&&x>.00002){v.fx.sparkle=1;v.flags.pbHot=false;v.flags.gold=v.t;note(v,'gold','«Алтын жаңбыр»: суығанда қорғасын йодиді жылтыр алтын түсті қабыршақтар болып кристалданады.','PbI2(ер.) → PbI2↓ (кристалдар)','goldenrain');}
        else note(v,'p-'+key,txt[0].toUpperCase()+txt.slice(1)+'.',`${ION_FMT[c]} + ${ION_FMT[a]} → ${key}↓`,key==='PbI2'?'pbi2':'prec');
      }else{
        v.susp[key]=Math.min(v.susp[key]||0,S[key]||0);
        if(key==='PbI2'&&(S[key]||0)<sol*.35&&v.T>60)v.flags.pbHot=true;
        if(key==='PbI2')note(v,'pbd','Қыздырғанда PbI2 сары тұнбасы ериді.','PbI2↓ → Pb^2+ + 2I^-','');
        else note(v,'d-'+key,`${key} тұнбасы сұйылтқанда немесе қыздырғанда ішінара ериді.`,'','');
      }
    }
    return ch;
  }

  /* ---- kinetic rules (rates in 1/s) ---- */
  function kinetic(v,dt){
    const I=v.ions,S=v.solids,V=v.vol/1000;if(V<=0)return;
    const g=k=>I[k]||0,ad=(k,n)=>{I[k]=(I[k]||0)+n;if(I[k]<1e-12)I[k]=0;},sd=(k,n)=>{S[k]=(S[k]||0)+n;if(S[k]<1e-12)S[k]=0;};
    const tf=Math.pow(2,(v.T-22)/12)*(v.stir?1.6:1);
    // sodium
    if((S.Na||0)>E&&v.vol>.5){
      const m=S.Na*(1-Math.exp(-1.6*dt));
      S.Na-=m;ad('Na',m);ad('OH',m);gas(v,'H2',m/2);heat(v,m*185000);
      v.fx.flame=Math.max(v.fx.flame,clamp(.4+S.Na*23*.4,.4,1));v.fx.shake=Math.max(v.fx.shake,.8);
      note(v,'na','Натрий бетінде жүгіріп, балқиды және сумен қарқынды әрекеттеседі. Ерітінді сілтілі болады.','2Na + 2H2O → 2Na^+ + 2OH^- + H2↑','na');
    }
    // metals
    for(const m in MET){
      const M=MET[m];let avail=S[m]||0;if(avail<E)continue;
      let budget=avail*(1-Math.exp(-M.k*tf*dt));
      for(const o of OX){
        if(!(M.E<o.E)||budget<1e-12)continue;
        const conc=g(o.id)/V;if(conc<=1e-6)continue;
        const surf=Math.min(1,conc/.05)*(o.slow||1);
        const mUsed=Math.min(budget*surf,g(o.id)*o.n/M.z,avail);
        if(mUsed<1e-11)continue;
        const e=mUsed*M.z;
        sd(m,-mUsed);ad(M.ion,mUsed);ad(o.id,-e/o.n);budget-=mUsed;
        heat(v,96485*(o.E-M.E)*e);
        const zc=M.z/o.n,cm=zc>1?zc:'';
        const mf=m==='Fe'?'Fe^2+':ION_FMT[M.ion];
        if(o.id==='H'||o.id==='HAc'){
          if(o.id==='HAc')ad('Ac',e);
          gas(v,'H2',e/2);
          note(v,`m-${m}-${o.id}`,`${m} ериді, сутек бөлінеді.`,o.id==='H'?`${m} + 2H^+ → ${mf} + H2↑`:`${m} + 2CH3COOH → ${mf} + 2CH3COO^- + H2↑`,'h2');
        }else if(o.id==='Fe3'){ad('Fe2',e);note(v,`m-${m}-Fe3`,'Темір(III) темір(II)-ге дейін тотықсызданады, сары түс әлсірейді.',`${m} + 2Fe^3+ → ${mf} + 2Fe^2+`,'');}
        else{
          const dep=o.id,k=e/o.n;sd(dep,k);v.susp[dep]=(v.susp[dep]||0)+k*.15;
          const txt=dep==='Cu'?`${m} бетіне қызыл-қоңыр мыс отырады, көгілдір түс солғындайды.`:dep==='Ag'?`${m} бетінде күміс түсті кристалдар өседі («күміс ағаш»).`:`${m} бетіне сұр қорғасын отырады («қорғасын ағаш»).`;
          note(v,`m-${m}-${dep}`,txt,`${m} + ${cm}${ION_FMT[dep]} → ${mf} + ${cm}${dep}↓`,dep==='Cu'?'cu-displace':dep==='Ag'?'ag-tree':'');
        }
      }
    }
    // copper + nitric acid
    if((S.Cu||0)>E&&g('NO3')>E&&g('H')/V>.25){
      const m=Math.min(S.Cu*(1-Math.exp(-.07*tf*dt)),g('H')*3/8,g('NO3')*3/2);
      if(m>1e-11){sd('Cu',-m);ad('Cu',m);ad('H',-m*8/3);ad('NO3',-m*2/3);gas(v,'NOx',m*2/3);heat(v,m*90000);v.fx.heat=1;
        note(v,'cuhno3','Мыс ериді, ерітінді көгереді, үстінде NO2 қоңыр газы пайда болады.','3Cu + 8H^+ + 2NO3^- → 3Cu^2+ + 2NO↑ + 4H2O  (2NO + O2 → 2NO2)','nox');}
    }
    // hydroxides/carbonates + acid
    for(const d of DISS){
      const s=S[d.key]||0;if(s<E)continue;
      const need=d.an==='OH'?d.na:2*d.na,avail=g('H')+g('HAc');if(avail<E)continue;
      const surf=Math.min(1,(g('H')+.25*g('HAc'))/V/.04);
      const k=(d.an==='CO3'?.45:1.6)*tf*surf;
      const m=Math.min(s,avail/need,s*(1-Math.exp(-k*dt)));
      if(m<1e-11)continue;
      const a1=Math.min(g('H'),m*need);ad('H',-a1);const b=m*need-a1;if(b>0){ad('HAc',-b);ad('Ac',b);}
      sd(d.key,-m);ad(d.cat,m*d.nc);v.susp[d.key]=Math.min(v.susp[d.key]||0,S[d.key]||0);
      if(d.an==='CO3'){gas(v,'CO2',m*d.na);note(v,'dc-'+d.key,`${d.key} қышқылда көмірқышқыл газын бөліп ериді.`,`${d.key} + 2H^+ → ${d.nc>1?d.nc:''}${ION_FMT[d.cat]} + CO2↑ + H2O`,'co2');
        if(d.key==='CaCO3')v.flags.chalk=true;}
      else note(v,'dh-'+d.key,`${d.key} тұнбасы қышқылда ериді.`,`${d.key} + ${need}H^+ → ${d.nc>1?d.nc:''}${ION_FMT[d.cat]} + H2O`,'');
      heat(v,m*need*30000);
    }
    // peroxide catalysis by iodide
    if(g('H2O2')>E&&g('I')/V>.002){
      const m=g('H2O2')*(1-Math.exp(-.9*tf*dt));
      ad('H2O2',-m);gas(v,'O2',m/2);heat(v,m*98000);v.fx.foam=1;
      note(v,'cat','Йодид-ион сутек пероксидінің ыдырауын катализдейді: қатты көпіршіп, ерітінді қызады.','2H2O2 →(I^-) 2H2O + O2↑','catalysis');
    }
  }

  function releaseGas(v,dt){
    let tot=0,best=0,kind=null;
    for(const k in v.gas){
      const p=v.gas[k];if(p<1e-10){v.gas[k]=0;continue;}
      const out=p*(1-Math.exp(-dt/1.5));v.gas[k]-=out;tot+=out;if(out>best){best=out;kind=k;}
    }
    const flux=tot/Math.max(dt,1e-3);
    v.fx.gas=Math.min(300,flux*7000);v.fx.gasKind=kind||v.fx.gasKind;
    v.fx.foam=Math.max(v.fx.foam,Math.min(.9,v.fx.gas/180));
  }

  /* ---- thermal ---- */
  function thermal(v,dt){
    const P=500;
    if(v.vol<=.01){v.T+=(22-v.T)*.05*dt;return;}
    if(v.mode==='heat'){
      if(v.vol<=3){v.mode='off';v.dry=true;note(v,'dry','Қыздыру тоқтатылды: сұйықтық буланып, құрғақ қалдық қалды.','','dry');}
      else if(v.T<100)v.T+=P/(4.18*v.vol)*dt;
      else{v.T=100;v.vol=Math.max(3,v.vol-.9*dt);v.flags.boil=true;}
    }else if(v.mode==='ice'){v.T+=(1-v.T)*.12*dt;}
    else v.T+=(22-v.T)*.012*dt;
    v.exAcc=(v.exAcc||0)*Math.exp(-dt/.6);
    if(v.T>100){ // excess reaction energy boils off water
      const ex=(v.T-100)*4.18*Math.max(v.vol,3);v.T=100;v.exAcc+=ex;
      v.vol=Math.max(.5,v.vol-ex/2260*.5);v.flags.boil=true;v.fx.heat=1;
      if(v.exAcc>VESSELS[v.type].limit&&!v.broken)shatter(v);
    }
    if(v.T<1)v.T=1;
    if(v.mode==='off'&&v.T<98)v.flags.boil=false;
  }
  function shatter(v){
    v.broken=true;v.events.push({text:'Ыдыс шыдамады: кенет қатты қызу шыныны жарып жіберді. Нағыз зертханада мұндай тәжірибені тек қорғаныш экранының артында және аз мөлшермен жасайды.',eq:'',tag:'broken',warn:true});
    v.tags.add('broken');v.ions={};v.solids={};v.gas={};v.susp={};v.piece={};v.vol=0;v.mode='off';v.stir=false;v.fx.flame=0;v.fx.shake=1;v.shard=1;
  }

  /* ---- pH from charge balance with weak acid/base systems ---- */
  function calcPH(v){
    const V=v.vol/1000;if(V<5e-4)return null;
    const I=v.ions,c=k=>(I[k]||0)/V,weak={HAc:1,Ac:1,NH3:1,NH4:1,CO3:1,HCO3:1};
    let Q=0;for(const k in I){if(k==='H'||k==='OH'||weak[k])continue;Q+=(CHG[k]||0)*c(k);}
    const Tac=c('HAc')+c('Ac'),Tn=c('NH3')+c('NH4'),Tc=c('CO3')+c('HCO3');
    const hy=[];for(const k in HYD){const t=c(k);if(t>0)hy.push([t,Math.pow(10,-HYD[k])]);}
    const Ka=1.8e-5,Kn=5.6e-10,K1=4.45e-7,K2=4.7e-11,Kw=1e-14;
    const F=x=>{
      let s=x-Kw/x+Q;
      s-=Tac*Ka/(Ka+x);s+=Tn*x/(x+Kn);
      const D=x*x+K1*x+K1*K2;s-=Tc*(K1*x+2*K1*K2)/D;
      for(const[t,ka]of hy)s-=t*ka/(ka+x);
      return s;
    };
    let a=-1.5,b=15.5;
    for(let i=0;i<48;i++){const m=(a+b)/2;if(F(Math.pow(10,-m))>0)a=m;else b=m;}
    return clamp((a+b)/2,0,14);
  }
  function liquidColor(v){
    const V=v.vol/1000;if(V<=0)return v.color;
    const L=[];
    for(const k in SPC){const n=v.ions[k]||0;if(n>0)L.push([SPC[k].c,1-Math.exp(-SPC[k].k*n/V)]);}
    if(v.ind&&v.pH!=null){const ic=IND[v.ind].color(v.pH);if(ic)L.push([ic.c,ic.s]);}
    for(const k in v.susp){const s=v.susp[k]||0;if(s>0&&SOLID[k])L.push([SOLID[k].c,(1-Math.exp(-70*s/V))*.9]);}
    let keep=1,r=0,g=0,b=0,w=0;
    for(const l of L){keep*=1-l[1];r+=l[0][0]*l[1];g+=l[0][1]*l[1];b+=l[0][2]*l[1];w+=l[1];}
    if(w<1e-4)return{r:150,g:205,b:235,a:.22};
    return{r:r/w,g:g/w,b:b/w,a:1-.78*keep};
  }

  function step(v,dt){
    v.t+=dt;if(v.broken){v.fx.shake=Math.max(0,v.fx.shake-dt*2);return;}
    v.fx.heat=Math.max(0,v.fx.heat-dt);v.fx.flame=Math.max(0,v.fx.flame-dt*2.5);v.fx.shake=Math.max(0,v.fx.shake-dt*3);v.fx.sparkle=Math.max(0,v.fx.sparkle-dt/9);
    v.fx.foam=Math.max(0,v.fx.foam-dt*.4);
    thermal(v,dt);
    for(let i=0;i<5&&instant(v);i++);
    kinetic(v,dt);
    for(let i=0;i<3&&instant(v);i++);
    releaseGas(v,dt);
    const tau0=v.stir?60:16;
    for(const k in v.susp){const tau=SOLID[k]&&SOLID[k].gel?tau0*2.2:tau0;v.susp[k]=Math.min(v.susp[k]*Math.exp(-dt/tau),v.solids[k]||0);if(v.susp[k]<1e-9)delete v.susp[k];}
    if(v.vol>.2&&Object.keys(v.solids).every(k=>(v.solids[k]||0)<1e-10))v.flags.sol=false;
    if(v.T>60&&v.solids.PbI2)v.flags.pbHotTry=true;
    v.pH=calcPH(v);v.color=liquidColor(v);
    // task helpers
    if(v.ind==='phph'&&v.pH!=null){
      if(v.pH>9.2)v.flags.pink=true;
      if(v.flags.pink&&v.flags.neut&&v.pH>6&&v.pH<7.9&&(v.ions.Na||v.ions.K)&&v.ions.Cl){v.tags.add('neutralized');}
    }
    if(v.flags.chalk&&v.flags.co2&&v.ions.Ca>E*100)v.tags.add('marble');
  }
  function composition(v){
    const V=v.vol/1000,out={ions:[],solids:[]};if(V<=0)return out;
    for(const k in v.ions){const c=v.ions[k]/V;if(c>1e-5&&ION_FMT[k]&&k!=='H2O2'||(k==='H2O2'&&c>1e-5))out.ions.push([ION_FMT[k],c]);}
    out.ions.sort((a,b)=>b[1]-a[1]);
    for(const k in v.solids){const m=v.solids[k];if(m>1e-6)out.solids.push([k,m]);}
    return out;
  }
  return{VESSELS,SOLID,PIECES,PREC,newVessel,add,step,levelOf,composition,cap,CHG,ION_FMT,MET,calcPH};
})();
