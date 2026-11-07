'use strict';
/* ===== helpers ===== */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function H(tag,props,...kids){
  const e=document.createElement(tag);
  if(props)for(const k in props){const v=props[k];
    if(k==='class')e.className=v;else if(k==='html')e.innerHTML=v;
    else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);
    else if(v!==false&&v!=null)e.setAttribute(k,v===true?'':v);}
  for(const c of kids.flat()){if(c==null||c===false)continue;e.append(c.nodeType?c:document.createTextNode(c));}
  return e;
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
function chem(s){
  return String(s).replace(/\^([0-9]*[+\-−])/g,'<sup>$1</sup>').replace(/([A-Za-z\)\]])(\d+)/g,'$1<sub>$2</sub>');
}
function hexRGB(h){h=h.trim();if(h[0]==='#'){if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
  const m=h.match(/\d+/g);return m?m.slice(0,3).map(Number):[128,128,128];}
function rgba(c,a){const r=typeof c==='string'?hexRGB(c):c;return `rgba(${r[0]|0},${r[1]|0},${r[2]|0},${a})`;}
const TH={};
function readTheme(){
  const cs=getComputedStyle(document.documentElement);
  for(const k of ['bg','panel','panel2','line','fg','muted','accent','glass','glasshi','stage','plate','good','warn','bad'])TH[k]=cs.getPropertyValue('--'+k).trim()||'#888';
  TH.dark=(hexRGB(TH.bg)[0]+hexRGB(TH.bg)[1]+hexRGB(TH.bg)[2])<300;
}
readTheme();
new MutationObserver(readTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>setTimeout(readTheme,30));}catch(e){}

/* canvas helper: fit to css size with DPR, return {ctx,w,h}; logical size is lw x lh */
function fitCanvas(cv,lw,lh){
  const dpr=Math.min(window.devicePixelRatio||1,2),r=cv.getBoundingClientRect();
  const cw=Math.max(1,Math.round(r.width*dpr)),ch=Math.max(1,Math.round(r.height*dpr));
  if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;}
  const ctx=cv.getContext('2d');
  ctx.setTransform(cw/lw,0,0,ch/lh,0,0);
  return ctx;
}

/* ===== elements ===== */
const EL_RAW=`H|Сутек|1.008|2.20
He|Гелий|4.0026|
Li|Литий|6.94|0.98
Be|Бериллий|9.0122|1.57
B|Бор|10.81|2.04
C|Көміртек|12.011|2.55
N|Азот|14.007|3.04
O|Оттек|15.999|3.44
F|Фтор|18.998|3.98
Ne|Неон|20.180|
Na|Натрий|22.990|0.93
Mg|Магний|24.305|1.31
Al|Алюминий|26.982|1.61
Si|Кремний|28.085|1.90
P|Фосфор|30.974|2.19
S|Күкірт|32.06|2.58
Cl|Хлор|35.45|3.16
Ar|Аргон|39.948|
K|Калий|39.098|0.82
Ca|Кальций|40.078|1.00
Sc|Скандий|44.956|1.36
Ti|Титан|47.867|1.54
V|Ванадий|50.942|1.63
Cr|Хром|51.996|1.66
Mn|Марганец|54.938|1.55
Fe|Темір|55.845|1.83
Co|Кобальт|58.933|1.88
Ni|Никель|58.693|1.91
Cu|Мыс|63.546|1.90
Zn|Мырыш|65.38|1.65
Ga|Галлий|69.723|1.81
Ge|Германий|72.630|2.01
As|Күшән|74.922|2.18
Se|Селен|78.971|2.55
Br|Бром|79.904|2.96
Kr|Криптон|83.798|3.00
Rb|Рубидий|85.468|0.82
Sr|Стронций|87.62|0.95
Y|Иттрий|88.906|1.22
Zr|Цирконий|91.224|1.33
Nb|Ниобий|92.906|1.60
Mo|Молибден|95.95|2.16
Tc|Технеций|98|1.90
Ru|Рутений|101.07|2.20
Rh|Родий|102.91|2.28
Pd|Палладий|106.42|2.20
Ag|Күміс|107.87|1.93
Cd|Кадмий|112.41|1.69
In|Индий|114.82|1.78
Sn|Қалайы|118.71|1.96
Sb|Сүрме|121.76|2.05
Te|Теллур|127.60|2.10
I|Йод|126.90|2.66
Xe|Ксенон|131.29|2.60
Cs|Цезий|132.91|0.79
Ba|Барий|137.33|0.89
La|Лантан|138.91|1.10
Ce|Церий|140.12|1.12
Pr|Празеодим|140.91|1.13
Nd|Неодим|144.24|1.14
Pm|Прометий|145|1.13
Sm|Самарий|150.36|1.17
Eu|Европий|151.96|1.20
Gd|Гадолиний|157.25|1.20
Tb|Тербий|158.93|1.10
Dy|Диспрозий|162.50|1.22
Ho|Гольмий|164.93|1.23
Er|Эрбий|167.26|1.24
Tm|Тулий|168.93|1.25
Yb|Иттербий|173.05|1.10
Lu|Лютеций|174.97|1.27
Hf|Гафний|178.49|1.30
Ta|Тантал|180.95|1.50
W|Вольфрам|183.84|2.36
Re|Рений|186.21|1.90
Os|Осмий|190.23|2.20
Ir|Иридий|192.22|2.20
Pt|Платина|195.08|2.28
Au|Алтын|196.97|2.54
Hg|Сынап|200.59|2.00
Tl|Таллий|204.38|1.62
Pb|Қорғасын|207.2|2.33
Bi|Висмут|208.98|2.02
Po|Полоний|209|2.00
At|Астат|210|2.20
Rn|Радон|222|2.20
Fr|Франций|223|0.70
Ra|Радий|226|0.90
Ac|Актиний|227|1.10
Th|Торий|232.04|1.30
Pa|Протактиний|231.04|1.50
U|Уран|238.03|1.38
Np|Нептуний|237|1.36
Pu|Плутоний|244|1.28
Am|Америций|243|1.13
Cm|Кюрий|247|1.28
Bk|Берклий|247|1.30
Cf|Калифорний|251|1.30
Es|Эйнштейний|252|1.30
Fm|Фермий|257|1.30
Md|Менделевий|258|1.30
No|Нобелий|259|1.30
Lr|Лоуренсий|266|1.30
Rf|Резерфордий|267|
Db|Дубний|268|
Sg|Сиборгий|269|
Bh|Борий|270|
Hs|Хассий|277|
Mt|Мейтнерий|278|
Ds|Дармштадтий|281|
Rg|Рентгений|282|
Cn|Коперниций|285|
Nh|Нихоний|286|
Fl|Флеровий|289|
Mc|Московий|290|
Lv|Ливерморий|293|
Ts|Теннессин|294|
Og|Оганесон|294|`;
const CATS={alkali:'Сілтілік металдар',alkearth:'Сілтілік жер металдары',trans:'Ауыспалы металдар',post:'Ауысудан кейінгі металдар',metalloid:'Жартылай металдар',nonmetal:'Бейметалдар',halogen:'Галогендер',noble:'Асыл газдар',lan:'Лантаноидтар',act:'Актиноидтар'};
const CAT_HUE={alkali:12,alkearth:38,trans:205,post:165,metalloid:130,nonmetal:95,halogen:285,noble:320,lan:250,act:350};
function catOf(z){
  if([3,11,19,37,55,87].includes(z))return'alkali';
  if([4,12,20,38,56,88].includes(z))return'alkearth';
  if(z>=57&&z<=71)return'lan';
  if(z>=89&&z<=103)return'act';
  if([2,10,18,36,54,86,118].includes(z))return'noble';
  if([9,17,35,53,85,117].includes(z))return'halogen';
  if([5,14,32,33,51,52].includes(z))return'metalloid';
  if([1,6,7,8,15,16,34].includes(z))return'nonmetal';
  if((z>=21&&z<=30)||(z>=39&&z<=48)||(z>=72&&z<=80)||(z>=104&&z<=112))return'trans';
  return'post';
}
function posOf(z){
  if(z===1)return[1,1];if(z===2)return[1,18];
  if(z<=4)return[2,z-2];if(z<=10)return[2,z+8];
  if(z<=12)return[3,z-10];if(z<=18)return[3,z];
  if(z<=36)return[4,z-18];if(z<=54)return[5,z-36];
  if(z<=56)return[6,z-54];if(z<=71)return[9,z-54];
  if(z<=86)return[6,z-68];
  if(z<=88)return[7,z-86];if(z<=103)return[10,z-86];
  return[7,z-100];
}
const GASES=[1,2,7,8,9,10,17,18,36,54,86];
const ELEMENTS=EL_RAW.trim().split('\n').map((l,i)=>{
  const p=l.split('|'),z=i+1,[row,col]=posOf(z);
  const cat=catOf(z);
  const state=z>=104?'unk':GASES.includes(z)?'gas':(z===35||z===80)?'liq':'solid';
  const f=(z>=57&&z<=71)||(z>=89&&z<=103);
  return{z,sym:p[0],name:p[1],mass:+p[2],en:p[3]?+p[3]:null,row,col,cat,state,period:z<=2?1:z<=10?2:z<=18?3:z<=36?4:z<=54?5:z<=86?6:7,
    group:f?null:col,block:f?'f':(col<=2||z===2)?'s':col>=13?'p':'d'};
});
const BYSYM=Object.fromEntries(ELEMENTS.map(e=>[e.sym,e]));
const ORB=[[1,0],[2,0],[2,1],[3,0],[3,1],[4,0],[3,2],[4,1],[5,0],[4,2],[5,1],[6,0],[4,3],[5,2],[6,1],[7,0],[5,3],[6,2],[7,1]];
const LET='spdf';
const MOVES={24:[['4s','3d',1]],29:[['4s','3d',1]],41:[['5s','4d',1]],42:[['5s','4d',1]],44:[['5s','4d',1]],45:[['5s','4d',1]],46:[['5s','4d',2]],47:[['5s','4d',1]],57:[['4f','5d',1]],58:[['4f','5d',1]],64:[['4f','5d',1]],78:[['6s','5d',1]],79:[['6s','5d',1]],89:[['5f','6d',1]],90:[['5f','6d',2]],91:[['5f','6d',1]],92:[['5f','6d',1]],93:[['5f','6d',1]],96:[['5f','6d',1]],103:[['6d','7p',1]]};
function occupancy(z,moves=true){
  let rem=z;const occ={};
  for(const[n,l]of ORB){const e=Math.min(2*(2*l+1),rem);if(e>0)occ[n+LET[l]]=e;rem-=e;if(rem<=0)break;}
  if(moves&&MOVES[z])for(const[a,b,k]of MOVES[z]){occ[a]-=k;occ[b]=(occ[b]||0)+k;if(occ[a]<=0)delete occ[a];}
  return occ;
}
const SUPD='⁰¹²³⁴⁵⁶⁷⁸⁹';
const supn=n=>String(n).split('').map(d=>SUPD[+d]).join('');
function configOf(z){
  const occ=occupancy(z),cores=[[86,'Rn'],[54,'Xe'],[36,'Kr'],[18,'Ar'],[10,'Ne'],[2,'He']];
  let core=cores.find(c=>c[0]<z),rest={...occ};
  if(core){const co=occupancy(core[0],false);for(const k in co){rest[k]=(rest[k]||0)-co[k];if(rest[k]<=0)delete rest[k];}}
  const keys=Object.keys(rest).sort((a,b)=>a[0]-b[0]||LET.indexOf(a[1])-LET.indexOf(b[1]));
  return(core?`[${core[1]}] `:'')+keys.map(k=>k+supn(rest[k])).join(' ');
}
function shellsOf(z){const occ=occupancy(z),sh=[];for(const k in occ){const n=+k[0];sh[n-1]=(sh[n-1]||0)+occ[k];}return sh.map(x=>x||0);}

/* ===== reagents ===== */
const RGROUPS=[['acid','Қышқылдар'],['base','Негіздер'],['salt','Тұздар'],['ox','Тотықтырғыштар'],['metal','Металдар'],['solid','Қатты заттар'],['ind','Индикаторлар'],['other','Су']];
const REAGENTS=[
 {id:'hcl',name:'Тұз қышқылы',f:'HCl',cat:'acid',kind:'liq',c:1,sp:{H:1,Cl:1},col:[200,232,245]},
 {id:'h2so4',name:'Күкірт қышқылы',f:'H2SO4',cat:'acid',kind:'liq',c:.5,sp:{H:2,SO4:1},col:[205,232,240]},
 {id:'hno3',name:'Азот қышқылы',f:'HNO3',cat:'acid',kind:'liq',c:1,sp:{H:1,NO3:1},col:[225,235,225]},
 {id:'hac',name:'Сірке қышқылы',f:'CH3COOH',cat:'acid',kind:'liq',c:1,sp:{HAc:1},col:[235,238,225]},
 {id:'naoh',name:'Натрий гидроксиді',f:'NaOH',cat:'base',kind:'liq',c:1,sp:{Na:1,OH:1},col:[210,225,245]},
 {id:'koh',name:'Калий гидроксиді',f:'KOH',cat:'base',kind:'liq',c:1,sp:{K:1,OH:1},col:[215,225,245]},
 {id:'nh3',name:'Аммиак (ерітінді)',f:'NH3',cat:'base',kind:'liq',c:1,sp:{NH3:1},col:[220,235,245]},
 {id:'caoh2',name:'Әк суы',f:'Ca(OH)2',cat:'base',kind:'liq',c:.02,sp:{Ca:1,OH:2},col:[225,238,242]},
 {id:'nacl',name:'Натрий хлориді',f:'NaCl',cat:'salt',kind:'liq',c:1,sp:{Na:1,Cl:1},col:[215,235,245]},
 {id:'na2so4',name:'Натрий сульфаты',f:'Na2SO4',cat:'salt',kind:'liq',c:.5,sp:{Na:2,SO4:1},col:[215,235,245]},
 {id:'na2co3',name:'Натрий карбонаты',f:'Na2CO3',cat:'salt',kind:'liq',c:.5,sp:{Na:2,CO3:1},col:[215,235,245]},
 {id:'cuso4',name:'Мыс(II) сульфаты',f:'CuSO4',cat:'salt',kind:'liq',c:.1,sp:{Cu:1,SO4:1},col:[60,150,235]},
 {id:'fecl3',name:'Темір(III) хлориді',f:'FeCl3',cat:'salt',kind:'liq',c:.1,sp:{Fe3:1,Cl:3},col:[215,140,50]},
 {id:'feso4',name:'Темір(II) сульфаты',f:'FeSO4',cat:'salt',kind:'liq',c:.1,sp:{Fe2:1,SO4:1},col:[175,215,160]},
 {id:'znso4',name:'Мырыш сульфаты',f:'ZnSO4',cat:'salt',kind:'liq',c:.1,sp:{Zn:1,SO4:1},col:[215,235,245]},
 {id:'agno3',name:'Күміс нитраты',f:'AgNO3',cat:'salt',kind:'liq',c:.1,sp:{Ag:1,NO3:1},col:[220,236,246]},
 {id:'bacl2',name:'Барий хлориді',f:'BaCl2',cat:'salt',kind:'liq',c:.1,sp:{Ba:1,Cl:2},col:[215,235,245]},
 {id:'cacl2',name:'Кальций хлориді',f:'CaCl2',cat:'salt',kind:'liq',c:.1,sp:{Ca:1,Cl:2},col:[215,235,245]},
 {id:'pbno32',name:'Қорғасын(II) нитраты',f:'Pb(NO3)2',cat:'salt',kind:'liq',c:.1,sp:{Pb:1,NO3:2},col:[220,236,246]},
 {id:'ki',name:'Калий йодиді',f:'KI',cat:'salt',kind:'liq',c:.1,sp:{K:1,I:1},col:[225,238,244]},
 {id:'kscn',name:'Калий роданиді',f:'KSCN',cat:'salt',kind:'liq',c:.1,sp:{K:1,SCN:1},col:[225,238,244]},
 {id:'kmno4',name:'Калий перманганаты',f:'KMnO4',cat:'ox',kind:'liq',c:.02,sp:{K:1,MnO4:1},col:[150,30,170]},
 {id:'h2o2',name:'Сутек пероксиді',f:'H2O2',cat:'ox',kind:'liq',c:.9,sp:{H2O2:1},col:[225,240,248]},
 {id:'zn',name:'Мырыш (түйіршік)',f:'Zn',cat:'metal',kind:'solid',key:'Zn',M:65.38,col:[165,172,178]},
 {id:'mg',name:'Магний (таспа)',f:'Mg',cat:'metal',kind:'solid',key:'Mg',M:24.305,col:[205,210,215]},
 {id:'fe',name:'Темір (шеге)',f:'Fe',cat:'metal',kind:'solid',key:'Fe',M:55.845,col:[115,120,126]},
 {id:'cu',name:'Мыс (сым)',f:'Cu',cat:'metal',kind:'solid',key:'Cu',M:63.546,col:[196,104,64]},
 {id:'na',name:'Натрий (кесек)',f:'Na',cat:'metal',kind:'solid',key:'Na',M:22.99,col:[205,210,218],hot:true},
 {id:'caco3',name:'Мәрмәр, бор',f:'CaCO3',cat:'solid',kind:'solid',key:'CaCO3',M:100.09,col:[238,236,230]},
 {id:'nahco3',name:'Ас содасы',f:'NaHCO3',cat:'solid',kind:'solid',M:84.007,diss:true,sp:{Na:1,HCO3:1},col:[246,246,246]},
 {id:'phph',name:'Фенолфталеин',f:'индикатор',cat:'ind',kind:'ind',col:[240,235,240]},
 {id:'mo',name:'Метилоранж',f:'индикатор',cat:'ind',kind:'ind',col:[245,170,50]},
 {id:'uni',name:'Әмбебап',f:'индикатор',cat:'ind',kind:'ind',col:[120,200,110]},
 {id:'btb',name:'Бромтимол көгі',f:'индикатор',cat:'ind',kind:'ind',col:[100,190,150]},
 {id:'water',name:'Дистилденген су',f:'H2O',cat:'other',kind:'liq',c:0,sp:{},col:[175,215,238]},
];
const RBY=Object.fromEntries(REAGENTS.map(r=>[r.id,r]));
const DOSES_LIQ=[2,5,10,25,50],DOSES_SOL=[0.1,0.3,0.5,1,2];

/* ===== indicators ===== */
const IND={
  phph:{name:'Фенолфталеин',range:[8.2,10],low:'түссіз',high:'таңқурай түсті',
    color(p){if(p<8.2)return null;const t=clamp((p-8.2)/1.8,0,1);return{c:[lerp(250,222,t),lerp(215,25,t),lerp(235,120,t)],s:.15+.7*t};}},
  mo:{name:'Метилоранж',range:[3.1,4.4],low:'қызыл',high:'сары',
    color(p){const t=clamp((p-3.1)/1.3,0,1);return{c:[lerp(235,246,t),lerp(45,205,t),lerp(45,50,t)],s:.85};}},
  uni:{name:'Әмбебап индикатор',range:[1,13],low:'қызыл',high:'күлгін',
    color(p){const T=[[0,[220,20,40]],[2,[235,40,40]],[3,[245,110,40]],[4,[250,165,40]],[5,[250,210,50]],[6,[225,225,60]],[7,[90,185,90]],[8,[40,170,150]],[9,[40,120,200]],[10,[70,70,190]],[11,[100,50,170]],[14,[125,40,150]]];
      for(let i=1;i<T.length;i++)if(p<=T[i][0]){const t=clamp((p-T[i-1][0])/(T[i][0]-T[i-1][0]),0,1);return{c:T[i][1].map((v,k)=>lerp(T[i-1][1][k],v,t)),s:.85};}
      return{c:T[T.length-1][1],s:.85};}},
  btb:{name:'Бромтимол көгі',range:[6,7.6],low:'сары',high:'көк',
    color(p){const t=clamp((p-6)/1.6,0,1);const m=t<.5?[lerp(245,70,t*2),lerp(215,190,t*2),lerp(40,80,t*2)]:[lerp(70,40,(t-.5)*2),lerp(190,90,(t-.5)*2),lerp(80,200,(t-.5)*2)];return{c:m,s:.85};}}
};
function colorName(rgb){
  const[r,g,b]=rgb;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
  if(mx<70)return'күңгірт';if(mx-mn<28)return mx>200?'түссіз':'сұр';
  let h;const d=mx-mn;if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;
  if(h<15||h>=340)return h>=300||h<15?(r>200&&g>120?'қызғылт':'қызыл'):'қызыл';
  if(h<40)return'қызғылт сары';if(h<70)return'сары';if(h<165)return'жасыл';if(h<200)return'көгілдір-жасыл';if(h<255)return'көк';if(h<300)return'күлгін';return'таңқурай түсті';
}
function phRGB(p){return IND.uni.color(clamp(p,0,14)).c;}

/* ===== solubility table ===== */
const SOL_AN=[['OH','OH^-','гидроксид'],['Cl','Cl^-','хлорид'],['Br','Br^-','бромид'],['I','I^-','йодид'],['NO3','NO3^-','нитрат'],['SO4','SO4^2-','сульфат'],['CO3','CO3^2-','карбонат'],['S','S^2-','сульфид'],['PO4','PO4^3-','фосфат'],['Ac','CH3COO^-','ацетат']];
const SOL_CAT=[
 ['H','H^+','Сутек','РРРРРРРРРР'],['NH4','NH4^+','Аммоний','РРРРРРРРРР'],['Li','Li^+','Литий','РРРРРРРРНР'],['Na','Na^+','Натрий','РРРРРРРРРР'],['K','K^+','Калий','РРРРРРРРРР'],
 ['Mg','Mg^2+','Магний','НРРРРРНXНР'],['Ca','Ca^2+','Кальций','МРРРРМНXНР'],['Ba','Ba^2+','Барий','РРРРРННXНР'],['Al','Al^3+','Алюминий','НРРРРРXXНР'],
 ['Zn','Zn^2+','Мырыш','НРРРРРНННР'],['Fe2','Fe^2+','Темір(II)','НРРРРРНННР'],['Fe3','Fe^3+','Темір(III)','НРРXРРXXНР'],['Cu','Cu^2+','Мыс(II)','НРРXРРXННР'],
 ['Ag','Ag^+','Күміс','XНННРМНННМ'],['Pb','Pb^2+','Қорғасын(II)','НММНРННННР']
];
const SOL_COL={'Ag|Cl':'ақ ірімшік тәрізді','Ag|Br':'ақшыл сары','Ag|I':'сары','Ag|CO3':'сарғыш-ақ','Ag|S':'қара','Ag|PO4':'сары','Ba|SO4':'ақ','Ba|CO3':'ақ','Ba|PO4':'ақ','Ca|CO3':'ақ','Ca|PO4':'ақ','Ca|SO4':'ақ','Cu|OH':'көгілдір','Cu|S':'қара','Cu|PO4':'көгілдірлеу','Fe3|OH':'қоңыр','Fe2|OH':'сұрғылт-жасыл','Fe2|S':'қара','Fe2|CO3':'ақшыл-жасыл','Zn|S':'ақ','Zn|OH':'ақ','Zn|CO3':'ақ','Zn|PO4':'ақ','Mg|OH':'ақ','Mg|CO3':'ақ','Mg|PO4':'ақ','Pb|I':'ашық сары','Pb|SO4':'ақ','Pb|Cl':'ақ','Pb|Br':'ақ','Pb|S':'қара','Pb|CO3':'ақ','Pb|OH':'ақ','Pb|PO4':'ақ','Al|OH':'ақ іркілдек','Al|PO4':'ақ'};
