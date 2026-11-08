'use strict';
/* ===== 3D lessons: a pop-up lab book (three.js r128, loaded lazily from vendor/) ===== */
const Book3D=(()=>{
  const INK='#1b2130',PAPER='#fbf8f1',CLEAR='#dbe8f5',ACC='#1f5eff';
  /* ---------- saved results ---------- */
  const LS='himlab-book-v1';
  let db={};try{db=JSON.parse(localStorage.getItem(LS)||'{}')||{};}catch(e){db={};}
  const save=()=>{try{localStorage.setItem(LS,JSON.stringify(db));}catch(e){}};
  const rec=id=>db[id]||(db[id]={obs:[],ans:{},concl:'',tasks:{},chk:false});

  /* ---------- lessons ---------- */
  const IND={lit:{acid:['#d7313e','қызыл'],neu:['#8b55c0','күлгін'],alk:['#2b5fd6','көк']},
             php:{acid:[null,'түссіз'],neu:[null,'түссіз'],alk:['#d81b7a','таңқурай']},
             mo:{acid:['#e8445f','қызғылт'],neu:['#f2902a','сарғылт'],alk:['#f3c623','сары']}};
  const LESSONS=[
    {id:'ind',n:1,title:'Индикаторлар',sub:'Қышқыл ма, сілті ме?',grade:'8-сынып',col:'#183a8c',icon:'tubes',
     goal:'Мақсат: үш түссіз ерітіндінің қайсысы қышқыл, қайсысы сілті, қайсысы су екенін индикатормен анықтау.',
     lead:'Қышқыл, сілті және су сырттай бірдей: бәрі түссіз. Оларды ажырату үшін индикатор қолданылады. Индикатор — ортаға қарай түсін өзгертетін зат.',
     table:[['','Қышқыл','Су','Сілті'],['Лакмус','қызыл','күлгін','көк'],['Фенолфталеин','түссіз','түссіз','таңқурай'],['Метилоранж','қызғылт','сарғылт','сары']],
     think:'Ойлан: фенолфталеин қышқыл мен суды ажырата ала ма?',
     layout:'rack',
     tubes:[{id:'t1',tag:'№1',secret:'NaOH',env:'alk'},{id:'t2',tag:'№2',secret:'HCl',env:'acid'},{id:'t3',tag:'№3',secret:'H2O',env:'neu'}],
     reagents:[{id:'lit',kind:'dropper',name:'Лакмус',tag:'Лакмус',color:'#7b4bb3'},{id:'php',kind:'dropper',name:'Фенолфталеин',tag:'Фенолфталеин',color:'#efeaf3'},{id:'mo',kind:'dropper',name:'Метилоранж',tag:'Метилоранж',color:'#f08c1e'}],
     tour:[{focus:'t2',cap:'Үш пробиркада түссіз ерітінді. Сырттай қайсысы қандай екенін айыра алмаймыз.',labels:[['t1','№1','белгісіз'],['t2','№2','белгісіз'],['t3','№3','белгісіз']]},
           {focus:'php',cap:'Үш индикатор: лакмус, фенолфталеин, метилоранж. Тамызғышпен бір-екі тамшы қосылады.',labels:[['lit','Лакмус','күлгін ерітінді'],['php','Фенолфталеин','түссіз'],['mo','Метилоранж','сарғылт']]}],
     play:'Сенің кезегің: индикаторды басыңыз, сосын пробирканы басыңыз.',
     tasks:[['t1','№1 пробирканы тексеру'],['t2','№2 пробирканы тексеру'],['t3','№3 пробирканы тексеру']],
     react(L,t,r){
       if(t.ind)return{note:'Бұл пробиркада индикатор бар. «Қайта бастау» басыңыз.',none:1};
       t.ind=r.id;const c=IND[r.id][t.env];
       const txt=c[0]?`${c[1]} түске боялды`:'түсі өзгермеді (түссіз)';return{color:c[0]||t.color,note:`${t.tag}: ${c[0]?c[1]+' түс':'түсі өзгермеді'}`,obs:[`${t.tag} + ${r.name}`,txt],task:t.id};
     },
     qs:[{id:'q1',q:'№1 пробиркада не бар?',o:['Қышқыл','Су','Сілті'],a:'Сілті'},{id:'q2',q:'№2 пробиркада не бар?',o:['Қышқыл','Су','Сілті'],a:'Қышқыл'},
         {id:'q3',q:'№3 пробиркада не бар?',o:['Қышқыл','Су','Сілті'],a:'Су'},{id:'q4',q:'Қай индикатор тек сілтіде түсін өзгертеді?',o:['Лакмус','Фенолфталеин','Метилоранж'],a:'Фенолфталеин'}],
     concl:'Лакмус үш ортаны да ажыратады: қышқылда қызыл, суда күлгін, сілтіде көк. Фенолфталеин тек сілтіні көрсетеді.'},

    {id:'neut',n:2,title:'Бейтараптану',sub:'Қышқыл + сілті = тұз + су',grade:'8-сынып',col:'#0f6b40',icon:'burette',
     goal:'Мақсат: сілтіні қышқылмен бейтараптап, қанша қышқыл жұмсалатынын анықтау.',
     lead:'Қышқыл мен сілті әрекеттескенде тұз және су түзіледі. Бұл — бейтараптану. Реакцияның аяқталғанын индикатор көрсетеді: фенолфталеин сілтіде таңқурай, бейтарап ортада түссіз.',
     terms:[['Бюретка','ерітіндіні тамшылатып құюға арналған бөлікті түтік'],['Эквиваленттік нүкте','қышқыл мен сілті толық әрекеттескен сәт']],
     eq:'HCl + NaOH -> NaCl + H2O',
     think:'Ойлан: түс неге бірден емес, соңғы тамшыда жоғалады?',
     layout:'titr',
     reagents:[{id:'php',kind:'dropper',name:'Фенолфталеин',tag:'Фенолфталеин',color:'#efeaf3'}],
     tour:[{focus:'beaker',cap:'Стақанда 20 мл натрий гидроксиді (NaOH, 0,1 M), яғни сілті.',labels:[['beaker','Стақан','20 мл NaOH']]},
           {focus:'bur',cap:'Бюреткада тұз қышқылы (HCl, 0,1 M). Бюретканы басқан сайын 2 мл тамады.',labels:[['bur','Бюретка','HCl 0,1 M'],['php','Фенолфталеин','индикатор']]}],
     play:'Сенің кезегің: алдымен фенолфталеинді стақанға қосыңыз, сосын бюретканы басыңыз.',
     tasks:[['ind','Стақанға фенолфталеин қосу'],['eq','Ерітіндіні түссіздендіру']],
     react(L,t,r){
       if(r.id==='php'){if(t.ind)return{note:'Индикатор қосылып қойған.',none:1};t.ind=1;
         return{color:t.added>=20?CLEAR:'#d81b7a',note:t.added>=20?'Түссіз: орта бейтарап':'Таңқурай түс: орта сілтілі',obs:['Стақан + фенолфталеин',t.added>=20?'түссіз қалды':'таңқурай түске боялды'],task:'ind'};}
       if(r.id==='bur'){
         if(!t.ind)return{note:'Алдымен фенолфталеин қосыңыз.',none:1};
         if(t.added>=30)return{note:'Стақан толуға жақын. «Қайта бастау» басыңыз.',none:1};
         t.added+=2;t.vol+=2;const a=t.added;
         if(a<18)return{color:'#d81b7a',note:`${a} мл қосылды. Түс әлі таңқурай.`};
         if(a===18)return{color:'#ec8fbd',note:'18 мл: түс әлсіреді, нүкте жақын!',obs:['18 мл HCl','түс әлсіреді']};
         if(a===20)return{color:CLEAR,note:'20 мл: ерітінді түссізденді!',obs:['20 мл HCl','түссізденді: бейтараптанды'],eq:'HCl + NaOH -> NaCl + H2O',task:'eq'};
         return{color:CLEAR,note:`${a} мл: қышқыл артық, түс өзгермейді.`};
       }
     },
     qs:[{id:'q1',q:'Неше мл HCl жұмсалды?',num:1,a:'20'},{id:'q2',q:'Фенолфталеин қай ортада таңқурай болды?',o:['Қышқыл','Бейтарап','Сілтілі'],a:'Сілтілі'},
         {id:'q3',q:'HCl + NaOH → ? + H₂O',o:['NaCl','Cl₂','NaH'],a:'NaCl'}],
     concl:'Қышқыл мен сілті бірдей мөлшерде (20 мл, 0,1 M) әрекеттесіп, тұз бен су түзді. Фенолфталеин түссізденген сәт — эквиваленттік нүкте.'},

    {id:'prec',n:3,title:'Тұнба түзілу',sub:'Ион алмасу реакциялары',grade:'9-сынып',col:'#9a6a00',icon:'prec',
     goal:'Мақсат: қай реакцияда тұнба түзілетінін бақылап, тұнбаның түсін анықтау.',
     lead:'Екі ерітіндіні араластырғанда иондар орын алмасады. Егер ерімейтін зат түзілсе, ол тұнба болып шөгеді. Оны ерігіштік кестесінен алдын ала білуге болады.',
     terms:[['Тұнба','ерітіндіде ерімейтін қатты зат'],['↓ белгісі','теңдеуде тұнбаны білдіреді'],['Ион алмасу','заттар өз бөліктерімен алмасады']],
     think:'Ойлан: BaCl₂ мен NaOH араласқанда неге тұнба жоқ?',
     layout:'rack',
     tubes:[{id:'t1',tag:'CuSO4',color:'#86bdf0'},{id:'t2',tag:'FeCl3',color:'#e2b558'},{id:'t3',tag:'BaCl2'}],
     reagents:[{id:'naoh',kind:'bottle',name:'Натрий гидроксиді',tag:'NaOH',f:'NaOH'},{id:'na2so4',kind:'bottle',name:'Натрий сульфаты',tag:'Na2SO4',f:'Na2SO4'}],
     tour:[{focus:'t2',cap:'Пробиркаларда үш тұздың ерітіндісі: мыс сульфаты, темір(III) хлориді, барий хлориді.',labels:[['t1','CuSO4','көгілдір'],['t2','FeCl3','сарғыш'],['t3','BaCl2','түссіз']]},
           {focus:'naoh',cap:'Құятын екі реактив: сілті NaOH және тұз Na₂SO₄.',labels:[['naoh','NaOH','сілті'],['na2so4','Na2SO4','тұз']]}],
     play:'Сенің кезегің: реактивті басыңыз, сосын пробирканы басыңыз. Үш тұнба алыңыз.',
     tasks:[['t1','Cu(OH)₂ тұнбасын алу'],['t2','Fe(OH)₃ тұнбасын алу'],['t3','BaSO₄ тұнбасын алу']],
     react(L,t,r){
       if(t.vol>=10)return{note:'Пробирка толы. «Қайта бастау» басыңыз.',none:1};
       t.vol+=3;
       const M={'t1naoh':['#2f74c9','#cfe3f5','көгілдір','Cu(OH)2','CuSO4 + 2NaOH -> Cu(OH)2↓ + Na2SO4'],
                't2naoh':['#8e3f17','#efd9b8','қоңыр','Fe(OH)3','FeCl3 + 3NaOH -> Fe(OH)3↓ + 3NaCl'],
                't3na2so4':['#fafafa','#eef2f6','ақ','BaSO4','BaCl2 + Na2SO4 -> BaSO4↓ + 2NaCl']}[t.id+r.id];
       if(!M)return{note:'Өзгеріс жоқ: тұнба түзілмеді.',obs:[`${t.tag} + ${r.tag}`,'өзгеріс жоқ']};
       return{color:M[1],sed:M[0],note:`${M[2]} тұнба: ${M[3]}↓`,obs:[`${t.tag} + ${r.tag}`,`${M[2]} тұнба түзілді`],eq:M[4],task:t.id};
     },
     qs:[{id:'q1',q:'Cu(OH)₂ тұнбасының түсі?',o:['Көгілдір','Қоңыр','Ақ'],a:'Көгілдір'},{id:'q2',q:'Fe(OH)₃ тұнбасының түсі?',o:['Көгілдір','Қоңыр','Ақ'],a:'Қоңыр'},
         {id:'q3',q:'BaSO₄ тұнбасының түсі?',o:['Көгілдір','Қоңыр','Ақ'],a:'Ақ'},{id:'q4',q:'BaCl₂ + NaOH араласқанда не болды?',o:['Ақ тұнба','Өзгеріс жоқ','Газ бөлінді'],a:'Өзгеріс жоқ'}],
     concl:'Ерімейтін зат түзілгенде ғана тұнба шөгеді: Cu(OH)₂ көгілдір, Fe(OH)₃ қоңыр, BaSO₄ ақ. Ba(OH)₂ ериді, сондықтан BaCl₂ + NaOH тұнба бермейді.'},

    {id:'met',n:4,title:'Металдар мен қышқыл',sub:'Металдардың белсенділігі',grade:'9-сынып',col:'#9e2a26',icon:'bubbles',
     goal:'Мақсат: мырыш, темір және мыстың тұз қышқылымен әрекеттесуін салыстыру.',
     lead:'Сутекке дейін тұрған металдар қышқылдан сутекті ығыстырады: газ көпіршіктері бөлінеді. Металл неғұрлым белсенді болса, реакция соғұрлым қарқынды. Сутектен кейінгі металдар қышқылмен әрекеттеспейді.',
     row:true,
     think:'Ойлан: алтын неге қышқылда да жарқырап тұра береді?',
     layout:'rack',
     tubes:[{id:'t1',tag:'HCl'},{id:'t2',tag:'HCl'},{id:'t3',tag:'HCl'}],
     reagents:[{id:'zn',kind:'metal',name:'Мырыш',tag:'Zn',color:'#a9b0b8'},{id:'fe',kind:'metal',name:'Темір',tag:'Fe',color:'#5e636b'},{id:'cu',kind:'metal',name:'Мыс',tag:'Cu',color:'#c8743a'}],
     tour:[{focus:'t2',cap:'Үш пробиркада бірдей тұз қышқылы (HCl).',labels:[['t1','HCl','тұз қышқылы'],['t3','HCl','тұз қышқылы']]},
           {focus:'fe',cap:'Үш металл: мырыш түйіршіктері, темір шеге және мыс сым.',labels:[['zn','Мырыш','Zn'],['fe','Темір','Fe'],['cu','Мыс','Cu']]}],
     play:'Сенің кезегің: металды басыңыз, сосын пробирканы басыңыз.',
     tasks:[['zn','Мырышты сынау'],['fe','Темірді сынау'],['cu','Мысты сынау']],
     react(L,t,r){
       if(t.metal)return{note:'Бұл пробиркада металл бар. Басқасын таңдаңыз.',none:1};
       t.metal=r.id;
       if(r.id==='zn')return{bub:1,note:'Көп көпіршік: сутек бөлінді!',obs:['Zn + HCl','көп көпіршік (H2↑)'],eq:'Zn + 2HCl -> ZnCl2 + H2↑',task:'zn'};
       if(r.id==='fe')return{bub:.3,color:'#cfe8bd',slow:1,note:'Баяу көпіршік, ерітінді жасылданады',obs:['Fe + HCl','баяу көпіршік, жасылданды'],eq:'Fe + 2HCl -> FeCl2 + H2↑',task:'fe'};
       return{note:'Өзгеріс жоқ: мыс сутектен кейін тұр',obs:['Cu + HCl','өзгеріс жоқ'],task:'cu'};
     },
     qs:[{id:'q1',q:'Ең қарқынды реакция қай металмен?',o:['Мырыш','Темір','Мыс'],a:'Мырыш'},{id:'q2',q:'Қай металл қышқылмен әрекеттеспеді?',o:['Мырыш','Темір','Мыс'],a:'Мыс'},
         {id:'q3',q:'Көпіршіктер қандай газ?',o:['Оттек','Сутек','Хлор'],a:'Сутек'}],
     concl:'Белсенділік: Zn > Fe > (H) > Cu. Мырыш пен темір сутекті ығыстырады, мыс әрекеттеспейді.'}
  ];

  /* ---------- 2D drawing (covers, pages) ---------- */
  function chemRuns(s){const out=[];let prev='',ps=false;for(const ch of String(s)){const d=/[0-9]/.test(ch);const sub=d&&(/[A-Za-z)\]]/.test(prev)||(/[0-9]/.test(prev)&&ps));out.push([ch,sub]);prev=ch;ps=sub;}return out;}
  function drawChem(c,s,x,y,size,weight='600',fam='Onest',align='left'){
    s=String(s).replace(/->/g,'→');const runs=chemRuns(s);let w=0;
    for(const[ch,sub]of runs){c.font=`${weight} ${sub?size*.64:size}px ${fam}`;w+=c.measureText(ch).width;}
    let cx=align==='center'?x-w/2:align==='right'?x-w:x;const ta=c.textAlign;c.textAlign='left';
    for(const[ch,sub]of runs){c.font=`${weight} ${sub?size*.64:size}px ${fam}`;c.fillText(ch,cx,sub?y+size*.22:y);cx+=c.measureText(ch).width;}
    c.textAlign=ta;return w;
  }
  function wrap(c,t,x,y,mw,lh){const words=String(t).split(' ');let line='';for(const w of words){const tl=line?line+' '+w:w;if(c.measureText(tl).width>mw&&line){c.fillText(line,x,y);y+=lh;line=w;}else line=tl;}if(line){c.fillText(line,x,y);y+=lh;}return y;}
  function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
  function tubeIcon(c,x,y,w,h,fill,lvl=.45){ // x,y = top-left
    c.beginPath();c.moveTo(x,y);c.lineTo(x,y+h-w/2);c.arc(x+w/2,y+h-w/2,w/2,Math.PI,0,true);c.lineTo(x+w,y);
    if(fill){c.save();c.clip();c.fillStyle=fill;c.fillRect(x-2,y+h*(1-lvl),w+4,h);c.restore();}c.stroke();
    c.beginPath();c.moveTo(x-w*.15,y);c.lineTo(x+w*1.15,y);c.stroke();
  }
  function icon(c,kind,cx,cy,s,col,colorful){
    c.save();c.strokeStyle=col;c.lineWidth=Math.max(2,s*.025);c.lineCap='round';c.lineJoin='round';
    if(kind==='tubes'){const f=colorful?['#d7313e','#8b55c0','#2b5fd6']:[null,null,null];for(let i=0;i<3;i++)tubeIcon(c,cx-s*.38+i*s*.3,cy-s*.42,s*.16,s*.8,f[i]);}
    else if(kind==='burette'){
      c.strokeRect(cx-s*.03,cy-s*.5,s*.06,s*.5);c.beginPath();c.moveTo(cx-s*.03,cy);c.lineTo(cx,cy+s*.07);c.lineTo(cx+s*.03,cy);c.stroke();
      c.beginPath();c.moveTo(cx-s*.09,cy-s*.05);c.lineTo(cx+s*.09,cy-s*.05);c.stroke();
      if(colorful){c.fillStyle='#d81b7a';c.beginPath();c.arc(cx,cy+s*.15,s*.025,0,7);c.fill();}
      const bx=cx-s*.26,by=cy+s*.2,bw=s*.52,bh=s*.32;
      c.beginPath();c.moveTo(bx,by);c.lineTo(bx,by+bh);c.lineTo(bx+bw,by+bh);c.lineTo(bx+bw,by);c.stroke();
      if(colorful){c.fillStyle='#e573ad';c.fillRect(bx+3,by+bh*.45,bw-6,bh*.55-3);}
    }else if(kind==='prec'){
      const f=colorful?['#86bdf0','#e2b558','#eef2f6']:[null,null,null],sd=['#2f74c9','#8e3f17','#ffffff'];
      for(let i=0;i<3;i++){const x=cx-s*.38+i*s*.3,y=cy-s*.42,w=s*.16,h=s*.8;tubeIcon(c,x,y,w,h,f[i],.5);
        if(colorful){c.fillStyle=sd[i];c.beginPath();c.arc(x+w/2,y+h-w/2,w/2-2,0,Math.PI);c.fill();}
        for(let k=0;k<4;k++){c.beginPath();c.arc(x+w*(.3+.4*((k*37)%10)/10),y+h*(.6+k*.06),Math.max(1.5,s*.01),0,7);c.stroke();}}
    }else if(kind==='bubbles'){
      for(let i=0;i<3;i++){const x=cx-s*.38+i*s*.3,y=cy-s*.42,w=s*.16,h=s*.8;tubeIcon(c,x,y,w,h,colorful?'#dbe8f5':null,.55);
        const nb=[6,3,0][i];for(let k=0;k<nb;k++){c.beginPath();c.arc(x+w*(.3+.4*((k*53)%10)/10),y+h*(.5+k*.07),s*.018,0,7);c.stroke();}
        c.fillStyle=['#a9b0b8','#5e636b','#c8743a'][i];c.beginPath();c.arc(x+w/2,y+h-w/2,w*.28,0,7);c.fill();}
    }
    c.restore();
  }
  function shade(hex,k){const r=hexRGB(hex);return `rgb(${r.map(v=>clamp(Math.round(v*k),0,255)).join(',')})`;}
  function drawCover(c,L,w,h){
    const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,shade(L.col,1.25));g.addColorStop(1,shade(L.col,.78));
    c.fillStyle=g;c.fillRect(0,0,w,h);
    const gold='#f1d58e';c.strokeStyle=gold;c.fillStyle=gold;
    c.lineWidth=w*.008;c.strokeRect(w*.06,h*.045,w*.88,h*.91);c.lineWidth=w*.003;c.strokeRect(w*.08,h*.06,w*.84,h*.88);
    for(const[x,y]of[[.08,.06],[.92,.06],[.08,.94],[.92,.94]]){c.beginPath();c.arc(w*x,h*y,w*.014,0,7);c.fill();}
    c.textAlign='center';c.textBaseline='alphabetic';
    c.font=`600 ${w*.034}px Onest`;try{c.letterSpacing=(w*.008)+'px';}catch(e){}
    c.fillText(('Химия · '+L.grade).toUpperCase(),w/2,h*.14);
    try{c.letterSpacing='0px';}catch(e){}
    c.font=`700 ${w*.105}px Onest`;
    const words=L.title.split(' ');let lines=[],ln='';for(const wd of words){const t=ln?ln+' '+wd:wd;if(c.measureText(t).width>w*.78&&ln){lines.push(ln);ln=wd;}else ln=t;}lines.push(ln);
    lines.forEach((t,i)=>c.fillText(t,w/2,h*.25+i*w*.115));
    const cy=h*.58,rad=w*.27;c.lineWidth=w*.005;c.beginPath();c.arc(w/2,cy,rad,0,7);c.stroke();
    c.globalAlpha=.16;c.beginPath();c.arc(w/2,cy,rad*.92,0,7);c.fill();c.globalAlpha=1;
    icon(c,L.icon,w/2,cy,rad*1.2,gold,true);
    c.fillStyle=gold;c.font=`500 ${w*.045}px Onest`;c.fillText(L.sub,w/2,h*.84);
    c.font=`600 ${w*.028}px Onest`;try{c.letterSpacing=(w*.006)+'px';}catch(e){}
    c.fillText('3D ИНТЕРАКТИВТІ САБАҚ',w/2,h*.9);try{c.letterSpacing='0px';}catch(e){}
  }
  function paper(c,w,h,left){
    c.fillStyle=PAPER;c.fillRect(0,0,w,h);
    const g=c.createLinearGradient(left?w:0,0,left?w*.88:w*.12,0);g.addColorStop(0,'rgba(80,60,30,.16)');g.addColorStop(1,'rgba(80,60,30,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  }
  function drawLeft(c,L,w,h){
    paper(c,w,h,true);const m=w*.09;let y=h*.08;c.textAlign='left';c.textBaseline='alphabetic';
    c.fillStyle=L.col;c.font=`700 ${w*.03}px Onest`;c.fillText(`${L.n}-САБАҚ · ${L.grade.toUpperCase()}`,m,y);y+=w*.075;
    c.fillStyle=INK;c.font=`700 ${w*.068}px Onest`;y=wrap(c,L.title,m,y,w-2*m,w*.075);
    c.fillStyle='#4a5266';c.font=`500 ${w*.036}px Onest`;c.fillText(L.sub,m,y);y+=w*.06;
    c.fillStyle=INK;c.font=`400 ${w*.033}px Onest`;y=wrap(c,L.lead,m,y,w-2*m,w*.048)+w*.02;
    if(L.table){const cw=[.34,.22,.2,.24].map(k=>k*(w-2*m)),rh=w*.058;c.font=`600 ${w*.028}px Onest`;
      L.table.forEach((row,i)=>{let x=m;if(i===0){c.fillStyle='rgba(31,94,255,.08)';c.fillRect(m,y-rh*.7,w-2*m,rh);}
        row.forEach((t,j)=>{c.fillStyle=i===0||j===0?INK:'#4a5266';c.font=`${i===0||j===0?600:400} ${w*.028}px Onest`;c.fillText(t,x+6,y);x+=cw[j];});
        c.strokeStyle='rgba(27,33,48,.25)';c.lineWidth=1;c.beginPath();c.moveTo(m,y+rh*.3);c.lineTo(w-m,y+rh*.3);c.stroke();y+=rh;});y+=w*.02;}
    if(L.terms){c.font=`700 ${w*.03}px Onest`;c.fillStyle=L.col;c.fillText('НЕГІЗГІ ҰҒЫМДАР',m,y);y+=w*.05;
      for(const[t,d]of L.terms){c.fillStyle=INK;c.font=`700 ${w*.031}px Onest`;const tw=c.measureText(t+' — ').width;c.fillText(t+' — ',m,y);c.font=`400 ${w*.031}px Onest`;c.fillStyle='#4a5266';y=wrap(c,d,m+tw,y,w-2*m-tw,w*.045)+w*.012;}}
    if(L.row){c.font=`700 ${w*.03}px Onest`;c.fillStyle=L.col;c.fillText('БЕЛСЕНДІЛІК ҚАТАРЫ',m,y);y+=w*.06;
      const els=['K','Na','Ca','Mg','Al','Zn','Fe','Pb','(H)','Cu','Hg','Ag','Au'];const step=(w-2*m)/els.length;
      els.forEach((e,i)=>{const hl=e==='Zn'||e==='Fe'||e==='Cu';c.fillStyle=e==='(H)'?'#d7313e':hl?L.col:INK;c.font=`${hl||e==='(H)'?700:500} ${w*.03}px Onest`;c.textAlign='center';c.fillText(e,m+step*(i+.5),y);});
      c.textAlign='left';c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.moveTo(m,y+w*.025);c.lineTo(w-m,y+w*.025);c.lineTo(w-m-10,y+w*.015);c.stroke();
      c.font=`400 ${w*.026}px Onest`;c.fillStyle='#4a5266';c.fillText('белсенділік кемиді →',m,y+w*.06);y+=w*.1;}
    if(L.eq){c.fillStyle='rgba(18,161,80,.1)';rr(c,m,y,w-2*m,w*.085,10);c.fill();c.fillStyle=INK;drawChem(c,L.eq,w/2,y+w*.056,w*.038,'600','JetBrains Mono, monospace','center');y+=w*.12;}
    c.fillStyle='#fff1c4';rr(c,m,y,w-2*m,w*.12,10);c.fill();c.strokeStyle='rgba(201,138,0,.5)';c.lineWidth=2;c.stroke();
    c.fillStyle=INK;c.font=`500 ${w*.031}px Onest`;wrap(c,L.think,m+16,y+w*.05,w-2*m-32,w*.042);
    c.fillStyle='#8a90a0';c.font=`500 ${w*.026}px Onest`;c.fillText(String(L.n*2),m,h-h*.04);
  }
  function drawRight(c,L,w,h){
    paper(c,w,h,false);const m=w*.09;c.textAlign='right';c.fillStyle='#8a90a0';c.font=`600 ${w*.024}px Onest`;
    c.fillText(L.title.toUpperCase()+' · 3D ТӘЖІРИБЕ',w-m,h*.06);
    c.save();c.globalAlpha=.85;icon(c,L.icon,w/2,h*.4,w*.72,INK,false);c.restore();
    c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.moveTo(w*.12,h*.68);c.lineTo(w*.88,h*.68);c.stroke();
    c.strokeRect(w*.62,h*.73,w*.28,h*.09);for(let i=1;i<4;i++){c.beginPath();c.moveTo(w*.64,h*.73+i*h*.022);c.lineTo(w*.88,h*.73+i*h*.022);c.stroke();}
    c.textAlign='left';c.fillStyle='#6b7183';c.font=`500 ${w*.026}px Onest`;c.fillText(`${L.n*2+1}-сурет. Тәжірибе сызбасы.`,m,h*.74);
    c.fillStyle=INK;c.font=`italic 600 ${w*.034}px Onest`;wrap(c,'› батырмасын басыңыз: тәжірибе кітаптан шығады.',m,h*.79,w*.48,w*.045);
    c.textAlign='right';c.fillStyle='#8a90a0';c.font=`500 ${w*.026}px Onest`;c.fillText(String(L.n*2+1),w-m,h-h*.04);
  }
  function drawResultL(c,L,w,h){
    paper(c,w,h,true);const R=rec(L.id),m=w*.09;let y=h*.08;c.textAlign='left';
    c.fillStyle=L.col;c.font=`700 ${w*.03}px Onest`;c.fillText('ЗЕРТХАНАЛЫҚ ДӘПТЕР',m,y);y+=w*.075;
    c.fillStyle=INK;c.font=`700 ${w*.06}px Onest`;c.fillText('Бақылаулар',m,y);y+=w*.07;
    if(!R.obs.length){c.fillStyle='#6b7183';c.font=`400 ${w*.032}px Onest`;y=wrap(c,'Әзірге тәжірибе жасалмады. «Сенің кезегің» қадамына оралыңыз.',m,y,w-2*m,w*.045);}
    R.obs.slice(-9).forEach((o,i)=>{c.fillStyle=L.col;c.font=`700 ${w*.032}px Onest`;c.fillText((i+1)+'.',m,y);
      c.fillStyle=INK;const x=m+w*.05;drawChem(c,o[0],x,y,w*.032,'600');c.fillStyle='#4a5266';c.font=`400 ${w*.03}px Onest`;c.fillText('→ '+o[1],x,y+w*.042);
      y+=w*.085;if(o[2]){c.fillStyle='#0f7a3d';drawChem(c,o[2],x,y-w*.01,w*.027,'500','JetBrains Mono, monospace');y+=w*.045;}});
  }
  function drawResultR(c,L,w,h){
    paper(c,w,h,false);const R=rec(L.id),m=w*.09;let y=h*.08;c.textAlign='left';
    c.fillStyle=INK;c.font=`700 ${w*.06}px Onest`;c.fillText('Жауаптар',m,y+w*.05);y+=w*.12;
    for(const q of L.qs){const a=R.ans[q.id];const ok=R.chk&&a!=null&&a!==''&&String(a).trim().toLowerCase()===q.a.toLowerCase();
      c.fillStyle='#4a5266';c.font=`500 ${w*.029}px Onest`;y=wrap(c,q.q,m,y,w-2*m,w*.04);
      c.fillStyle=a?INK:'#a0a6b4';c.font=`${a?600:400} ${w*.034}px Onest`;c.fillText(a||'жауап жоқ',m+w*.04,y);
      if(R.chk&&a){c.fillStyle=ok?'#12a150':'#e0302b';c.font=`700 ${w*.036}px Onest`;c.fillText(ok?'✓':'✗',w-m-w*.04,y);}y+=w*.065;}
    y+=w*.02;c.fillStyle=INK;c.font=`700 ${w*.045}px Onest`;c.fillText('Қорытынды',m,y);y+=w*.06;
    c.font=`400 ${w*.032}px Onest`;c.fillStyle=R.concl?INK:'#a0a6b4';y=wrap(c,R.concl||'Дәптерге қорытынды жазыңыз.',m,y,w-2*m,w*.046);
    const done=L.tasks.every(t=>R.tasks[t[0]]);
    if(done){c.save();c.translate(w*.72,h*.88);c.rotate(-.18);c.strokeStyle='#12a150';c.fillStyle='#12a150';c.lineWidth=5;rr(c,-w*.17,-w*.06,w*.34,w*.11,12);c.stroke();
      c.font=`800 ${w*.042}px Onest`;c.textAlign='center';c.fillText('ОРЫНДАЛДЫ',0,w*.012);c.restore();}
  }

  /* ---------- three.js scene ---------- */
  let T=null,loading=null,R3,scene,cam,cv,stage,dirL,table,PX=1;
  let book,pivot,spine,pageL,pageR,texL,texR,rig=null,openA=-Math.PI,openT=-Math.PI,popK=0,popT=0;
  let L=null,LS_=null,step=0,STEPS=[],items={},tubes=[],sel=null,hover=null,busy=false,teacher=false,auto=null;
  const cs={t:null,r:4.6,th:0,ph:.62},ct={};let ctw=null;
  let anims=[],raf=0,last=0,running=false;
  function loadThree(){
    if(window.THREE)return Promise.resolve(window.THREE);if(loading)return loading;
    const tryLoad=src=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=()=>window.THREE?ok(window.THREE):no();s.onerror=no;document.head.append(s);});
    return loading=tryLoad('vendor/three.min.js').catch(()=>tryLoad('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'));
  }
  const HATCH=sh=>{
    sh.uniforms.uPx={value:PX};sh.uniforms.uInk={value:new T.Color(INK)};
    sh.fragmentShader='uniform float uPx;\nuniform vec3 uInk;\n'+sh.fragmentShader.replace('#include <tonemapping_fragment>',`{
      vec2 q=gl_FragCoord.xy/uPx;
      float base=max(dot(diffuseColor.rgb,vec3(.299,.587,.114)),.04);
      float l=dot(gl_FragColor.rgb,vec3(.299,.587,.114))/base;
      float m1=mod(q.x+q.y,5.),m2=mod(q.x-q.y,5.);
      float h1=1.-smoothstep(.5,1.2,min(m1,5.-m1));
      float h2=1.-smoothstep(.5,1.2,min(m2,5.-m2));
      float k=max(h1*(1.-smoothstep(.6,.8,l)),h2*(1.-smoothstep(.34,.48,l)));
      gl_FragColor.rgb=mix(diffuseColor.rgb*(.84+.16*clamp(l,0.,1.)),uInk,k*.6);
    }
    #include <tonemapping_fragment>`);
  };
  const hatch=(color,o={})=>{const m=new T.MeshLambertMaterial(Object.assign({color},o));m.onBeforeCompile=HATCH;return m;};
  const hullC={};
  function hullMat(w,col=INK){const k=w+col;if(hullC[k])return hullC[k];
    const m=new T.MeshBasicMaterial({color:col,side:T.BackSide});
    m.onBeforeCompile=sh=>{sh.uniforms.uW={value:w};sh.vertexShader='uniform float uW;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=position+normal*uW;');};
    return hullC[k]=m;}
  function ink(mesh,w=.006){const h=new T.Mesh(mesh.geometry,hullMat(w));h.userData.hull=w;mesh.add(h);mesh.castShadow=true;return mesh;}
  function glass(){return new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,
    uniforms:{uInk:{value:new T.Color(INK)},uTint:{value:new T.Color('#eef4fb')}},
    vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 uInk;uniform vec3 uTint;varying vec3 vN;varying vec3 vV;void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));float a=smoothstep(.62,.97,f);gl_FragColor=vec4(mix(uTint,uInk,a),.12+.78*a);}'});}
  const liq=c=>{const col=new T.Color(c||CLEAR);return new T.MeshLambertMaterial({color:col,emissive:col.clone().multiplyScalar(.28),transparent:true,depthWrite:false,opacity:c?.88:.3});};
  function setLiq(m,c,k=1){const col=new T.Color(c||CLEAR);m.color.lerp(col,k);m.emissive.copy(m.color).multiplyScalar(.28);m.opacity=lerp(m.opacity,c&&c!==CLEAR?.9:.3,k);}
  function canvasTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.anisotropy=R3.capabilities.getMaxAnisotropy();t.userData={c};return t;}
  const lowerHemi=r=>new T.SphereGeometry(r,26,12,0,Math.PI*2,Math.PI/2,Math.PI/2);

  /* ----- apparatus builders ----- */
  const TR=.075,TH=.82,TCAP=12;
  function mkTube(spec){
    const g=new T.Group(),gm=glass();
    const body=new T.Mesh(new T.CylinderGeometry(TR,TR,TH-TR,28,1,true),gm);body.position.y=TR+(TH-TR)/2;
    const bot=new T.Mesh(lowerHemi(TR),gm);bot.position.y=TR;
    const rim=ink(new T.Mesh(new T.TorusGeometry(TR+.003,.009,8,28),hatch(PAPER)),.004);rim.rotation.x=Math.PI/2;rim.position.y=TH;
    body.renderOrder=bot.renderOrder=4;
    const lr=TR*.86,lm=liq(spec.color);
    const lb=new T.Mesh(lowerHemi(lr),lm);lb.position.y=TR;const lc=new T.Mesh(new T.CylinderGeometry(lr,lr,1,26),lm);lb.renderOrder=lc.renderOrder=2;
    const sm=new T.MeshLambertMaterial({color:'#fff',transparent:true,opacity:1});const sed=new T.Mesh(lowerHemi(lr*.97),sm);sed.position.y=TR;sed.scale.y=.001;sed.visible=false;sed.renderOrder=3;
    const sedC=new T.Mesh(new T.CylinderGeometry(lr*.97,lr*.97,1,24),sm);sedC.visible=false;sedC.renderOrder=3;
    // particles & bubbles
    const N=50,pg=new T.BufferGeometry(),pp=new Float32Array(N*3).fill(-9);pg.setAttribute('position',new T.BufferAttribute(pp,3));
    const pm=new T.PointsMaterial({color:'#fff',size:.022,transparent:true,opacity:.95});const pts=new T.Points(pg,pm);pts.renderOrder=3;pts.frustumCulled=false;
    const bubs=[];const bg=new T.SphereGeometry(.016,8,6),bmat=new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.9});
    for(let i=0;i<26;i++){const b=new T.Mesh(bg,bmat);b.visible=false;b.renderOrder=3;b.add(new T.Mesh(bg,hullMat(.004,'#6b7488')));g.add(b);bubs.push({m:b,y:0,v:0,live:false});}
    g.add(body,bot,rim,lb,lc,sed,sedC,pts);
    const t={obj:g,gm,lm,lb,lc,sed,sedC,sm,pts,pp,bubs,vol:5,color:spec.color||null,bub:0,sedK:0,sedT:0,part:0,colT:null,top:TH,lr};
    setVol(t);return t;
  }
  function setVol(t){const hl=clamp(t.vol/TCAP,0,1)*(TH*.86);const ch=Math.max(.001,hl-t.lr);t.lc.scale.y=ch;t.lc.position.y=TR+ch/2;t.surf=TR+ch;}
  function mkRack(n,sp){
    const g=new T.Group(),w=(n-1)*sp+.34,m=hatch('#efe4cf');
    const base=ink(new T.Mesh(new T.BoxGeometry(w,.04,.34),m));base.position.y=.02;
    const p1=ink(new T.Mesh(new T.BoxGeometry(.04,.5,.3),m));p1.position.set(-w/2+.02,.25,0);const p2=p1.clone();p2.position.x=w/2-.02;
    const r1=ink(new T.Mesh(new T.BoxGeometry(w,.03,.04),m));r1.position.set(0,.47,TR+.035);const r2=r1.clone();r2.position.z=-TR-.035;
    for(const o of[base,p1,p2,r1,r2]){o.receiveShadow=true;g.add(o);}return g;
  }
  function labelTex(txt,name,col){return canvasTex(256,128,(c,w,h)=>{c.fillStyle='#fffdf7';c.fillRect(0,0,w,h);c.strokeStyle=INK;c.lineWidth=5;c.strokeRect(8,8,w-16,h-16);
    c.fillStyle=col||INK;c.textAlign='center';c.textBaseline='alphabetic';drawChem(c,txt,w/2,h*.56,46,'700','Onest','center');c.fillStyle='#4a5266';c.font='500 20px Onest';c.fillText(name,w/2,h*.82);});}
  function mkBottle(r){
    const g=new T.Group(),gm=glass();
    const body=new T.Mesh(new T.CylinderGeometry(.11,.11,.26,28),gm);body.position.y=.13;
    const sh=new T.Mesh(new T.CylinderGeometry(.04,.11,.07,28,1,true),gm);sh.position.y=.295;
    const nk=new T.Mesh(new T.CylinderGeometry(.04,.04,.07,20,1,true),gm);nk.position.y=.365;
    const rim=ink(new T.Mesh(new T.TorusGeometry(.042,.008,8,20),hatch(PAPER)),.004);rim.rotation.x=Math.PI/2;rim.position.y=.4;
    const lm=liq(r.color);const lq=new T.Mesh(new T.CylinderGeometry(.1,.1,.19,26),lm);lq.position.y=.1;lq.renderOrder=2;
    const lab=new T.Mesh(new T.CylinderGeometry(.113,.113,.13,26,1,true,-1,2),new T.MeshLambertMaterial({map:labelTex(r.f||r.tag,r.name.split(' ')[0])}));lab.position.y=.14;lab.renderOrder=5;
    for(const o of[body,sh,nk])o.renderOrder=4;
    g.add(body,sh,nk,rim,lq,lab);return{obj:g,mover:g,tip:new T.Vector3(0,.4,0),lm,H:.4};
  }
  function mkDropper(r){
    const g=new T.Group(),gm=glass();
    const body=new T.Mesh(new T.CylinderGeometry(.075,.075,.17,24),gm);body.position.y=.085;body.renderOrder=4;
    const lq=new T.Mesh(new T.CylinderGeometry(.066,.066,.12,22),liq(r.color));lq.position.y=.065;lq.renderOrder=2;
    const lab=new T.Mesh(new T.CylinderGeometry(.078,.078,.07,22,1,true,-1,2),new T.MeshLambertMaterial({map:labelTex(r.tag.slice(0,4),r.name,shade(r.color,.6))}));lab.position.y=.08;lab.renderOrder=5;
    const cap=ink(new T.Mesh(new T.CylinderGeometry(.04,.05,.04,20),hatch('#3b4150')));cap.position.y=.19;
    const pip=new T.Group();const pg=new T.Mesh(new T.CylinderGeometry(.012,.006,.2,12,1,true),glass());pg.position.y=.1;pg.renderOrder=4;
    const pl=new T.Mesh(new T.CylinderGeometry(.009,.005,.1,10),liq(r.color));pl.position.y=.06;pl.renderOrder=2;
    const bulb=ink(new T.Mesh(new T.SphereGeometry(.03,16,12),hatch('#3b4150')),.004);bulb.position.y=.235;bulb.scale.y=1.4;
    pip.add(pg,pl,bulb);pip.position.y=.01;
    g.add(body,lq,lab,cap,pip);return{obj:g,mover:pip,pipHome:pip.position.clone(),H:.36};
  }
  function mkMetal(r){
    const g=new T.Group();
    const dish=new T.Mesh(new T.SphereGeometry(.2,30,6,0,Math.PI*2,Math.PI-.62,.62),hatch('#f4f2ec',{side:T.DoubleSide}));dish.position.y=.2;dish.receiveShadow=true;
    const ring=ink(new T.Mesh(new T.TorusGeometry(.2*Math.sin(.62),.006,6,30),hatch(PAPER)),.003);ring.rotation.x=Math.PI/2;ring.position.y=.2-.2*Math.cos(.62);
    g.add(dish,ring);
    const mm=new T.MeshLambertMaterial({color:r.color,emissive:new T.Color(r.color).multiplyScalar(.15)});const pc=new T.Group();
    if(r.id==='zn'){for(let i=0;i<3;i++){const s=ink(new T.Mesh(new T.DodecahedronGeometry(.03,0),mm),.004);s.position.set((i-1)*.035,.03,(i%2)*.02);s.rotation.set(i,i*2,0);pc.add(s);}}
    else if(r.id==='fe'){const sh=ink(new T.Mesh(new T.CylinderGeometry(.009,.009,.2,10),mm),.004);const hd=ink(new T.Mesh(new T.CylinderGeometry(.022,.022,.01,14),mm),.004);hd.position.y=.1;
      const tip=ink(new T.Mesh(new T.ConeGeometry(.009,.03,10),mm),.004);tip.position.y=-.115;tip.rotation.x=Math.PI;pc.add(sh,hd,tip);pc.rotation.z=Math.PI/2;pc.userData.lie=1;}
    else{const k=ink(new T.Mesh(new T.TorusGeometry(.038,.007,8,24),mm),.004);k.rotation.x=Math.PI/2;const k2=k.clone();k2.position.y=.016;pc.add(k,k2);}
    pc.position.y=.045;g.add(pc);return{obj:g,mover:pc,pcHome:pc.position.clone(),pcRot:pc.rotation.z,H:.1};
  }
  function mkBeaker(){
    const g=new T.Group(),gm=glass(),R_=.2,Hh=.38;
    const body=new T.Mesh(new T.CylinderGeometry(R_,R_,Hh,36,1,true),gm);body.position.y=Hh/2;
    const bot=new T.Mesh(new T.CircleGeometry(R_,36),gm);bot.rotation.x=-Math.PI/2;bot.position.y=.003;
    const rim=ink(new T.Mesh(new T.TorusGeometry(R_+.003,.01,8,36),hatch(PAPER)),.004);rim.rotation.x=Math.PI/2;rim.position.y=Hh;
    body.renderOrder=bot.renderOrder=4;
    const lm=liq(null);const lc=new T.Mesh(new T.CylinderGeometry(R_-.012,R_-.012,1,34),lm);lc.renderOrder=2;
    g.add(body,bot,rim,lc);
    const t={obj:g,gm,lm,lc,vol:20,added:0,ind:0,color:null,top:Hh,beaker:1,bubs:[],sed:null};
    t.setV=()=>{const hl=t.vol/60*Hh*.95;t.lc.scale.y=hl;t.lc.position.y=.006+hl/2;t.surf=.006+hl;};t.setV();return t;
  }
  function mkBurette(){
    const g=new T.Group(),m=hatch('#efe4cf');
    const base=ink(new T.Mesh(new T.BoxGeometry(.7,.035,.42),m));base.position.y=.0175;base.receiveShadow=true;
    const rod=ink(new T.Mesh(new T.CylinderGeometry(.016,.016,1.7,12),hatch('#d9dde4')));rod.position.set(-.26,.85,-.12);
    const arm=ink(new T.Mesh(new T.BoxGeometry(.3,.03,.03),hatch('#d9dde4')));arm.position.set(-.12,1.2,-.06);arm.rotation.y=-.4;
    const clamp_=ink(new T.Mesh(new T.BoxGeometry(.06,.07,.06),hatch('#3b4150')));clamp_.position.set(0,1.2,0);
    const gm=glass();const tube=new T.Mesh(new T.CylinderGeometry(.028,.028,1.0,16,1,true),gm);tube.position.y=1.1;tube.renderOrder=4;
    const tip=new T.Mesh(new T.CylinderGeometry(.01,.004,.1,10,1,true),gm);tip.position.y=.55;tip.renderOrder=4;
    const cock=ink(new T.Mesh(new T.CylinderGeometry(.012,.012,.12,10),hatch('#3b4150')),.004);cock.rotation.z=Math.PI/2;cock.position.y=.62;
    const lm=liq(null);const lc=new T.Mesh(new T.CylinderGeometry(.022,.022,1,12),lm);lc.renderOrder=2;
    for(let i=0;i<10;i++){const tk=new T.Mesh(new T.BoxGeometry(.012,.003,.002),new T.MeshBasicMaterial({color:INK}));tk.position.set(0,.65+i*.09,.029);g.add(tk);}
    g.add(base,rod,arm,clamp_,tube,tip,cock,lc);
    const b={obj:g,lc,tipY:.5,vol:50};b.setV=()=>{const hl=b.vol/50*.9;lc.scale.y=hl;lc.position.y=.62+.02+hl/2;};b.setV();return b;
  }

  /* ----- book ----- */
  const W=1.5,D=2.0,TT=.09,CV=.028,OV=.04;
  function buildBook(){
    if(book){scene.remove(book);}
    book=new T.Group();scene.add(book);
    const cov=hatch(L.col),edge=hatch('#efe9dc');
    const coverTex=canvasTex(768,1024,(c,w,h)=>drawCover(c,L,w,h));coverTex.center.set(.5,.5);coverTex.rotation=Math.PI;
    texL=canvasTex(900,1200,(c,w,h)=>drawLeft(c,L,w,h));texR=canvasTex(900,1200,(c,w,h)=>drawRight(c,L,w,h));
    pageL=hatch('#ffffff',{map:texL});pageR=hatch('#ffffff',{map:texR});
    const back=ink(new T.Mesh(new T.BoxGeometry(W+OV,CV,D+2*OV),cov),.005);back.position.set((W+OV)/2,CV/2,0);back.receiveShadow=true;
    const rb=new T.Mesh(new T.BoxGeometry(W,TT,D),[edge,edge,pageR,edge,edge,edge]);rb.position.set(W/2,CV+TT/2,0);rb.receiveShadow=rb.castShadow=true;
    pivot=new T.Group();pivot.position.set(0,CV+TT,0);
    const lb=new T.Mesh(new T.BoxGeometry(W,TT,D),[edge,edge,pageL,edge,edge,edge]);lb.position.set(-W/2,-TT/2,0);lb.receiveShadow=lb.castShadow=true;
    const front=new T.Mesh(new T.BoxGeometry(W+OV,CV,D+2*OV),[cov,cov,cov,new T.MeshLambertMaterial({map:coverTex}),cov,cov]);front.position.set(-(W+OV)/2,-TT-CV/2,0);front.castShadow=true;
    ink(front,.005);
    pivot.add(lb,front);
    spine=ink(new T.Mesh(new T.BoxGeometry(CV,2*TT+2*CV,D+2*OV),cov),.005);spine.position.set(-CV/2,TT+CV,0);
    const rib=new T.Mesh(new T.BoxGeometry(.05,.004,.36),hatch('#c8322b'));rib.position.set(.12,.002,D/2+OV+.16);rib.rotation.y=.12;rib.castShadow=true;
    const rib2=new T.Mesh(new T.BoxGeometry(.05,CV+TT,.004),hatch('#c8322b'));rib2.position.set(.1,(CV+TT)/2,D/2+.005);
    book.add(back,rb,pivot,spine,rib,rib2);
    openA=openT=-Math.PI;applyOpen();
  }
  function applyOpen(){pivot.rotation.z=openA;spine.visible=openA<-3.0;}
  function redrawPages(result){
    const c1=texL.userData.c.getContext('2d'),c2=texR.userData.c.getContext('2d');
    if(result){drawResultL(c1,L,900,1200);drawResultR(c2,L,900,1200);}else{drawLeft(c1,L,900,1200);drawRight(c2,L,900,1200);}
    texL.needsUpdate=texR.needsUpdate=true;
  }

  /* ----- rig (the experiment that pops out) ----- */
  const Y0=CV+TT;
  function buildRig(){
    if(rig){scene.remove(rig);}
    rig=new T.Group();rig.position.y=Y0;scene.add(rig);items={};tubes=[];sel=null;hover=null;
    const add=(id,o,x,z,extra)=>{const it=Object.assign({id,x,z,base:o.obj||o,pop:0},o,extra);it.obj.position.set(x,0,z);it.obj.traverse(m=>{m.userData.item=id;});rig.add(it.obj);items[id]=it;return it;};
    if(L.layout==='rack'){
      const rx=.62,rz=.0,sp=.3;const rk=mkRack(L.tubes.length,sp);add('rack',{obj:rk,deco:1},rx,rz);
      L.tubes.forEach((s,i)=>{const t=mkTube(s);t.obj.position.y=.04;const it=add(s.id,t,rx+(i-(L.tubes.length-1)/2)*sp,rz,{kind:'tube',tag:s.tag,env:s.env,secret:s.secret,spec:s});it.obj.position.y=.04;it.y0=.04;tubes.push(it);});
    }else{
      add('bur',mkBurette(),.55,.05,{kind:'burette',direct:'beaker',tag:'HCl',tagOff:[.1,1.05,0]});
      const it=add('beaker',mkBeaker(),.55,.05,{kind:'tube',tag:'NaOH',tagOff:[0,0,.24]});it.obj.position.y=.035;tubes.push(it);
    }
    const rs=L.reagents,n=rs.length;
    rs.forEach((r,i)=>{const x=-1.05+i*(n>2?.42:.55),z=.28;
      const o=r.kind==='bottle'?mkBottle(r):r.kind==='metal'?mkMetal(r):mkDropper(r);
      const it=add(r.id,o,x,z,{kind:r.kind,r,tag:r.tag});it.home=it.obj.position.clone();});
    if(L.layout==='titr'){const p=items.php;p.obj.position.set(-.5,0,.3);p.home=p.obj.position.clone();}
    for(const id in items){const it=items[id];it.obj.traverse(m=>{if(m.isMesh&&!m.userData.hull&&!(m.material&&m.material.isShaderMaterial))m.castShadow=true;});}
    popK=0;setPop(0);
  }
  function setPop(k){
    const n=Object.keys(items).length;let i=0;
    for(const id in items){const it=items[id];const p=clamp(k*(1+n*.12)-i*.12,0,1);i++;
      const e=p>=1?1:1+2.70158*Math.pow(p-1,3)+1.70158*Math.pow(p-1,2);const s=Math.max(.001,e);
      it.obj.scale.set(s,s,s);it.obj.rotation.x=-(1-Math.min(1,e))*1.25;it.obj.visible=p>0;}
  }

  /* ----- tiny tween ----- */
  const ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  function anim(d,fn){return new Promise(res=>anims.push({t:0,d,fn,res}));}
  function tickAnims(dt){for(let i=anims.length-1;i>=0;i--){const a=anims[i];a.t+=dt;const p=Math.min(1,a.t/a.d);a.fn(ease(p),p);if(p>=1){anims.splice(i,1);a.res();}}}
  const V=(x,y,z)=>new T.Vector3(x,y,z);

  /* ----- actions ----- */
  async function act(r,t){
    if(busy)return;busy=true;setSel(null);
    const st=t,top=V(t.obj.position.x,t.obj.position.y+t.top,t.obj.position.z),v0=st.vol;
    if(r.kind==='metal'&&r.used){note(r,'Бұл металл қолданылды. «Қайта бастау» басыңыз.',true);busy=false;return;}
    const out=L.react(L,st,r.id==='bur'?{id:'bur'}:r.r)||{none:1};
    if(out.none){note(t,out.note,true);busy=false;return;}
    const v1=st.vol;st.vol=v0;const upd=()=>st.setV?st.setV():setVol(st);
    const fill=d=>anim(d,e=>{st.vol=lerp(v0,v1,e);upd();});
    const col=out.color!==undefined?out.color:st.color;
    if(r.kind==='bottle'){
      const o=r.obj,home=r.home.clone(),dest=V(top.x-.372,top.y+.23,top.z);
      await anim(.55,e=>{o.position.lerpVectors(home,dest,e);o.position.y+=Math.sin(e*Math.PI)*.15;});
      await anim(.35,e=>{o.rotation.z=-1.95*e;});
      const s=stream(top.clone().add(V(0,.07,0)),V(top.x,t.obj.position.y+(t.surf||.3),top.z),r.r.color||CLEAR);
      await fill(.9);s.remove();
      await anim(.35,e=>{o.rotation.z=-1.95*(1-e);});
      await anim(.5,e=>o.position.lerpVectors(dest,home,e));
    }else if(r.kind==='dropper'){
      const p=r.mover;rig.attach(p);const home=p.position.clone(),dest=V(top.x,top.y+.12,top.z);
      await anim(.3,e=>{p.position.y=home.y+.25*e;});const up=p.position.clone();
      await anim(.5,e=>p.position.lerpVectors(up,dest,e));
      for(let i=0;i<2;i++)await drop(dest.clone(),t.obj.position.y+(t.surf||.3),r.r.color);
      await anim(.5,e=>p.position.lerpVectors(dest,up,e));await anim(.3,e=>{p.position.y=up.y-.25*e;});
      r.obj.attach(p);p.position.copy(r.pipHome);
    }else if(r.kind==='metal'){
      const p=r.mover;rig.attach(p);const home=p.position.clone(),r0=p.rotation.z,dest=V(top.x,top.y+.16,top.z);
      await anim(.6,e=>{p.position.lerpVectors(home,dest,e);p.position.y+=Math.sin(e*Math.PI)*.2;if(p.userData.lie)p.rotation.z=r0*(1-e);});
      const yb=t.obj.position.y+.035+(p.userData.lie?.1:0);await anim(.45,e=>{p.position.y=lerp(dest.y,yb,e*e);});
      st.piece=p;r.used=true;
    }else if(r.kind==='burette'){
      const b0=r.vol;fill(.7);anim(.7,e=>{r.vol=b0-2*e;r.setV();});
      for(let i=0;i<2;i++)await drop(V(r.x,r.tipY+.01,r.z),t.obj.position.y+t.surf,null);
    }
    if(st.vol!==v1){st.vol=v1;upd();}
    // apply outcome
    if(out.color!==undefined&&out.color!==st.color){const m=st.lm,c0=m.color.clone(),target=new T.Color(out.color||CLEAR),o0=m.opacity,o1=out.color&&out.color!==CLEAR?.88:.3;
      const paint=(a,b,oa,ob,e)=>{m.color.copy(a).lerp(b,e);m.emissive.copy(m.color).multiplyScalar(.28);m.opacity=lerp(oa,ob,e);};
      if(out.sed){const cl=c0.clone().lerp(new T.Color(out.sed),.75);anim(.6,e=>paint(c0,cl,o0,.95,e)).then(()=>anim(5,e=>paint(cl,target,.95,o1,e)));}
      else anim(out.slow?6:1.4,e=>paint(c0,target,o0,o1,e));st.color=out.color;}
    if(out.sed){st.sm.color.set(out.sed);st.pts.material.color.set(out.sed);st.sed.visible=true;st.sedT=Math.min(1,st.sedT+.6);st.part=3.5;}
    if(out.bub)st.bub=out.bub;
    note(t,out.note,false);
    logObs(out);busy=false;refreshTags();
  }
  function stream(a,b,c){const len=a.distanceTo(b);const m=new T.Mesh(new T.CylinderGeometry(.012,.01,len,8),liq(c));m.position.copy(a).add(b).multiplyScalar(.5);m.renderOrder=2;rig.add(m);return{remove:()=>{rig.remove(m);}};}
  async function drop(from,toY,c){const m=new T.Mesh(new T.SphereGeometry(.016,10,8),liq(c||'#9ec3ee'));m.material.opacity=.95;m.position.copy(from);m.renderOrder=3;rig.add(m);
    await anim(.32,(e,p)=>{m.position.y=lerp(from.y,toY,p*p);});rig.remove(m);}
  function logObs(out){
    const R=rec(L.id);if(out.obs){R.obs.push([out.obs[0],out.obs[1],out.eq||'']);}
    if(out.task&&!R.tasks[out.task]){R.tasks[out.task]=1;const left=L.tasks.filter(t=>!R.tasks[t[0]]).length;
      if(!left)setTimeout(()=>toast('Барлық тапсырма орындалды! Енді дәптерді толтырыңыз.'),900);}
    save();renderTasks();renderNb(false);
  }
  function resetRig(){if(busy)return;buildRig();popK=1;setPop(1);refreshTags();}

  /* ----- labels / overlay ----- */
  let lblEl,lineEl,callouts=[],tagEls={},notes=[];
  function proj(v){const p=v.clone().project(cam);return{x:(p.x+1)/2*stage.clientWidth,y:(1-p.y)/2*stage.clientHeight,ok:p.z<1};}
  function itemTop(it){const o=it.obj;const h=it.kind==='tube'?(it.top||TH)+.06:it.id==='bur'?1.62:it.kind==='bottle'?.45:it.kind==='dropper'?.42:.12;
    return V(o.position.x,Y0+o.position.y+h,o.position.z);}
  function setCallouts(list){
    callouts.forEach(c=>c.el.remove());callouts=[];
    (list||[]).forEach(([id,t,s],i)=>{const it=items[id];if(!it)return;
      const el=H('div',{class:'bk-co'},H('b',{html:chem(t)}),s?H('small',{html:chem(s)}):null);lblEl.append(el);
      callouts.push({el,it,dx:0,dy:-34-(i%2)*44});requestAnimationFrame(()=>el.classList.add('on'));});
  }
  function refreshTags(){
    const R=rec(L.id);
    for(const id in tagEls)tagEls[id].remove();tagEls={};
    for(const id in items){const it=items[id];if(!it.tag)continue;
      let t=it.tag;if(teacher&&it.secret)t+=' = '+it.secret;
      const el=H('div',{class:'bk-tag'+(sel===it?' sel':'')+(it.kind==='tube'?' tb':''),html:chem(t)});lblEl.append(el);tagEls[id]=el;}
  }
  function note(it,txt,warn){
    const el=H('div',{class:'bk-note'+(warn?' warn':'')},txt);lblEl.append(el);const n={el,it,t:0};notes.push(n);
    setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();notes=notes.filter(x=>x!==n);},400);},warn?2600:3800);
  }
  function placeOverlay(){
    const svg=[],showT=popK>.98&&STEPS[step]&&STEPS[step].k!=='result';
    for(const id in tagEls){const it=items[id],el=tagEls[id];if(!showT){el.style.display='none';continue;}
      const off=it.tagOff||[0,0,it.kind==='tube'?.12:.16];
      const p=proj(V(it.obj.position.x+off[0],Y0+off[1],it.obj.position.z+off[2]));el.style.display=p.ok?'':'none';el.style.transform=`translate(${p.x}px,${p.y+4}px) translate(-50%,0)`;}
    for(const c of callouts){const a=proj(itemTop(c.it));if(!a.ok||popK<.98){c.el.style.opacity=0;continue;}c.el.style.opacity='';
      const x=clamp(a.x+c.dx,90,stage.clientWidth-90),y=clamp(a.y+c.dy,118,stage.clientHeight-120);
      c.el.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;svg.push(`<line x1="${a.x}" y1="${a.y}" x2="${x}" y2="${y-2}"/><circle cx="${a.x}" cy="${a.y}" r="3.5"/>`);}
    for(const n of notes){const a=proj(itemTop(n.it));n.el.style.transform=`translate(${a.x}px,${a.y-14}px) translate(-50%,-100%)`;}
    lineEl.innerHTML=svg.join('');
  }

  /* ----- picking ----- */
  const ray=()=>new T.Raycaster();let rc;
  function pick(ev){
    const b=cv.getBoundingClientRect();const m=new T.Vector2((ev.clientX-b.left)/b.width*2-1,-(ev.clientY-b.top)/b.height*2+1);
    rc.setFromCamera(m,cam);
    if(step===0){return rc.intersectObject(book,true).length?{book:1}:null;}
    if(!rig||popK<.98)return null;
    const hits=rc.intersectObject(rig,true);for(const h of hits){let o=h.object;while(o&&!o.userData.item)o=o.parent;if(o&&items[o.userData.item]&&!items[o.userData.item].deco)return items[o.userData.item];}
    return null;
  }
  function hiObj(it,on){
    if(!it)return;const set=o=>o.traverse(m=>{if(m.userData.hull)m.material=on?hullMat(.012,ACC):hullMat(m.userData.hull);if(m.material&&m.material.uniforms&&m.material.uniforms.uInk)m.material.uniforms.uInk.value.set(on?ACC:INK);});
    set(it.obj);if(it.mover&&it.mover.parent!==it.obj)set(it.mover);
  }
  function setSel(it){
    if(sel&&sel!==hover)hiObj(sel,false);if(sel&&sel.kind==='bottle')sel.obj.position.y=0;if(sel&&sel.kind==='metal')sel.mover.position.y=sel.pcHome.y;
    sel=it;if(sel){hiObj(sel,true);}
    hint();refreshTags();
  }
  function hint(){
    const h=$('#bkHint');if(!h)return;
    if(sel)h.innerHTML=`<b>${sel.r?sel.r.name:''}</b> алынды → енді ${L.layout==='titr'?'стақанды':'пробирканы'} басыңыз`;
    else h.textContent=step===0?'Кітапты басыңыз немесе › батырмасын басыңыз':'Сүйреп айналдырыңыз · заттарды басыңыз';
    h.classList.toggle('sel',!!sel);
  }
  function onClick(ev){
    const it=pick(ev);
    if(!it){if(sel)setSel(null);return;}
    if(it.book){go(1);return;}
    if(busy)return;
    if(it.kind==='burette'){act(it,items[it.direct]);return;}
    if(it.kind==='metal'&&it.used){note(it,'Бұл металл қолданылды.',true);return;}
    if(it.kind==='tube'){if(sel)act(sel,it);else note(it,L.layout==='titr'?`Стақан: ${it.vol} мл`:`${it.tag}${teacher&&it.secret?' = '+it.secret:''}: алдымен реактивті таңдаңыз`,true);return;}
    setSel(sel===it?null:it);
  }

  /* ----- camera ----- */
  function camGoal(s){
    const k=s.k;if(k==='cover')return{t:V(W/2,.1,0),r:4.4,th:0,ph:.6};
    if(k==='open')return{t:V(0,.1,.05),r:4.2,th:0,ph:.48};
    if(k==='result')return{t:V(0,.1,.1),r:4.5,th:0,ph:.4};
    const tall=L.layout==='titr';
    if(k==='tour'){const it=items[s.focus];const p=it?V(it.obj.position.x,Y0+(tall&&s.focus==='bur'?.8:.32),it.obj.position.z):V(0,.4,0);return{t:p,r:tall&&s.focus==='bur'?3.2:2.9,th:p.x>0?.22:-.22,ph:1.0};}
    if(k==='pop')return{t:V(0,tall?.7:.45,.1),r:tall?4.8:4.3,th:.32,ph:1.0};
    return{t:V(0,tall?.62:.36,.12),r:tall?4.2:3.35,th:0,ph:.92};
  }
  function camTo(g,d=1.3){const a=stage.clientWidth/Math.max(1,stage.clientHeight);if(a<1){g.ph=Math.min(g.ph,.62);g.r*=clamp(1.25/a,1,1.75);}else g.r*=clamp(1.5/a,1,1.9);ctw={a:{t:cs.t.clone(),r:cs.r,th:cs.th,ph:cs.ph},b:g,t:0,d};}
  function applyCam(){const s=Math.sin(cs.ph);cam.position.set(cs.t.x+cs.r*s*Math.sin(cs.th),cs.t.y+cs.r*Math.cos(cs.ph),cs.t.z+cs.r*s*Math.cos(cs.th));cam.lookAt(cs.t);}
  function bindControls(){
    let drag=null,pts=new Map(),pinch=0;
    cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});drag={x:e.clientX,y:e.clientY,moved:0};
      if(pts.size===2){const a=[...pts.values()];pinch=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);}});
    cv.addEventListener('pointermove',e=>{
      if(drag&&pts.has(e.pointerId)){const p=pts.get(e.pointerId);const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
        if(pts.size===2){const a=[...pts.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch){cs.r=clamp(cs.r*pinch/d,1.4,7);}pinch=d;drag.moved+=10;ctw=null;return;}
        drag.moved+=Math.abs(dx)+Math.abs(dy);if(drag.moved>5){ctw=null;cs.th-=dx*.006;cs.ph=clamp(cs.ph-dy*.005,.2,1.45);cv.style.cursor='grabbing';}return;}
      if(e.pointerType==='mouse'){const it=pick(e);const h=it&&!it.book?it:null;if(h!==hover){if(hover&&hover!==sel)hiObj(hover,false);hover=h;if(hover)hiObj(hover,true);}
        cv.style.cursor=it?'pointer':'grab';}
    });
    const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(pts.size<2)pinch=0;if(drag&&drag.moved<6&&pts.size===0)onClick(e);if(!pts.size)drag=null;cv.style.cursor='grab';};
    cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);drag=null;});
    cv.addEventListener('wheel',e=>{e.preventDefault();ctw=null;cs.r=clamp(cs.r*(1+Math.sign(e.deltaY)*.08),1.4,7);},{passive:false});
  }

  /* ----- steps ----- */
  function buildSteps(){STEPS=[{k:'cover',cap:`${L.title}: ${L.sub}. Кітапты ашыңыз.`},{k:'open',cap:L.goal},
    {k:'pop',cap:'Тәжірибе кітаптан шықты! Сүйреп айналдырып, жан-жағынан қараңыз.'},...L.tour.map(t=>Object.assign({k:'tour'},t)),
    {k:'play',cap:L.play},{k:'result',cap:'Нәтиже: дәптерді толтырып, «Тексеру» басыңыз. Жауаптарыңыз кітап бетіне жазылады.'}];}
  function go(i){
    i=clamp(i,0,STEPS.length-1);const prev=step;step=i;const s=STEPS[i];
    openT=i>=1?0:-Math.PI;popT=i>=2&&s.k!=='result'?1:0;
    if(s.k==='result'||(STEPS[prev]&&STEPS[prev].k==='result'))redrawPages(s.k==='result');
    if(sel&&s.k==='result')setSel(null);
    setCallouts(s.k==='tour'?s.labels:null);
    camTo(camGoal(s),i===1&&prev===0?1.8:1.3);
    $('#bkCap').innerHTML=chem(s.cap);
    $('#bkDots').innerHTML=STEPS.map((x,k)=>`<i class="${k===i?'on':k<i?'done':''}"></i>`).join('');
    $('#bkPrev').disabled=i===0;const nx=$('#bkNext');nx.disabled=i===STEPS.length-1;
    $('#bkTasks').hidden=s.k!=='play';
    if(s.k==='result'){openNb(true);}
    if(auto&&(s.k==='play'||i===STEPS.length-1))toggleAuto(false);
    hint();
  }
  function toggleAuto(on){if(auto){clearInterval(auto);auto=null;}if(on){auto=setInterval(()=>{if(STEPS[step].k==='play'){toggleAuto(false);return;}go(step+1);},5200);}
    $('#bkPlay').innerHTML=auto?IC.pause:IC.play;$('#bkPlay').classList.toggle('on',!!auto);}

  /* ----- tasks panel + notebook ----- */
  function renderTasks(){
    const box=$('#bkTasks');if(!box||!L)return;const R=rec(L.id);const done=L.tasks.filter(t=>R.tasks[t[0]]).length;
    box.innerHTML='';box.append(H('div',{class:'bk-th',onclick:()=>box.classList.toggle('open')},H('b',{},'Тапсырмалар'),H('span',{class:'bk-cnt'+(done===L.tasks.length?' ok':'')},`${done}/${L.tasks.length}`)));
    const ul=H('ul',{});for(const[id,t]of L.tasks)ul.append(H('li',{class:R.tasks[id]?'ok':'',html:chem(t)}));box.append(ul);
    box.append(H('div',{class:'bk-tb'},H('button',{class:'btn sm',type:'button',onclick:resetRig},'Қайта бастау'),H('button',{class:'btn sm primary',type:'button',onclick:()=>openNb(true)},'Дәптер')));
  }
  function isOk(q,a){return a!=null&&String(a).trim().toLowerCase().replace(',','.')===q.a.toLowerCase();}
  function renderNb(full=true){
    const nb=$('#bkNb');if(!nb||!L)return;const R=rec(L.id);
    const obs=$('#nbObs');if(obs){obs.innerHTML='';if(!R.obs.length)obs.append(H('p',{class:'nb-empty'},'Тәжірибе жасаған сайын бақылаулар осында өзі жазылады.'));
      R.obs.forEach((o,i)=>obs.append(H('div',{class:'nb-o'},H('i',{},String(i+1)),H('div',{},H('b',{html:chem(o[0])}),H('span',{},o[1]),o[2]?H('code',{html:chem(o[2].replace('->','→'))}):null))));}
    if(!full)return;
    $('#nbTitle').textContent=`${L.n}-сабақ. ${L.title}`;
    const qs=$('#nbQs');qs.innerHTML='';
    for(const q of L.qs){const a=R.ans[q.id]||'';let inp;
      if(q.o){inp=H('select',{'aria-label':q.q},H('option',{value:''},'Таңдаңыз'),...q.o.map(o=>H('option',{value:o},o)));inp.value=a;}
      else inp=H('input',{type:'text',inputmode:'decimal',placeholder:'Жауап',value:a,'aria-label':q.q});
      inp.addEventListener('change',()=>{R.ans[q.id]=inp.value;R.chk=false;save();renderNb();});
      const st=R.chk&&a?(isOk(q,a)?H('span',{class:'nb-r ok'},'✓ Дұрыс'):H('span',{class:'nb-r no'},'✗ Қате')):null;
      qs.append(H('div',{class:'nb-q'},H('label',{html:chem(q.q)}),H('div',{class:'nb-a'},inp,st),teacher?H('div',{class:'nb-t'},'Жауап: '+q.a):null));}
    const ta=$('#nbConcl');ta.value=R.concl;$('#nbHint').textContent=teacher?'Үлгі: '+L.concl:'';$('#nbHint').hidden=!teacher;
    const done=L.tasks.filter(t=>R.tasks[t[0]]).length,ok=L.qs.filter(q=>isOk(q,R.ans[q.id])).length;
    $('#nbSum').innerHTML=`Тапсырма <b>${done}/${L.tasks.length}</b> · ${R.chk?`Дұрыс жауап <b>${ok}/${L.qs.length}</b>`:'Жауаптар тексерілмеді'}`;
  }
  function openNb(on){const nb=$('#bkNb');nb.hidden=!on;$('#bkNbBtn').classList.toggle('on',on);$('#bkApp').classList.toggle('nb-open',on);if(on)renderNb();setTimeout(resize,30);}
  function nbText(Lx){const R=rec(Lx.id);const lines=[`ХимЛаб · ${Lx.n}-сабақ. ${Lx.title} (${Lx.sub})`,'','Бақылаулар:'];
    R.obs.forEach((o,i)=>lines.push(`${i+1}. ${o[0]} → ${o[1]}${o[2]?'  ['+o[2].replace('->','→')+']':''}`));if(!R.obs.length)lines.push('—');
    lines.push('','Жауаптар:');Lx.qs.forEach(q=>{const a=R.ans[q.id]||'—';lines.push(`${q.q} ${a}${R.chk&&R.ans[q.id]?(isOk(q,a)?' ✓':' ✗'):''}`);});
    lines.push('','Қорытынды:',R.concl||'—');return lines.join('\n');}
  function printNb(list){
    const w=window.open('','_blank');if(!w){toast('Терезе ашылмады: браузер бұғаттады.');return;}
    const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    w.document.write(`<!doctype html><meta charset="utf-8"><title>ХимЛаб · дәптер</title><style>body{font:15px/1.55 system-ui,sans-serif;max-width:720px;margin:32px auto;padding:0 20px;color:#111}pre{white-space:pre-wrap;font:inherit;border-bottom:1px solid #ccc;padding-bottom:20px;margin-bottom:24px}</style>${list.map(x=>`<pre>${esc(nbText(x))}</pre>`).join('')}<script>print()<\/script>`);w.document.close();
  }
  function toast(t){const el=H('div',{class:'bk-toast'},t);$('#bkStage').append(el);setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),400);},3200);}

  /* ----- picker ----- */
  function coverCanvas(Lx,w=300,h=400){const c=H('canvas',{width:w*2,height:h*2,class:'bk-cv','aria-hidden':'true'});drawCover(c.getContext('2d'),Lx,w*2,h*2);return c;}
  function renderShelf(){
    const box=$('#bkShelf');box.innerHTML='';
    for(const Lx of LESSONS){const R=rec(Lx.id),done=Lx.tasks.filter(t=>R.tasks[t[0]]).length,ok=Lx.qs.filter(q=>isOk(q,R.ans[q.id])).length;
      const all=done===Lx.tasks.length,started=done>0||R.obs.length;
      box.append(H('button',{class:'bk-card',type:'button',onclick:()=>openLesson(Lx.id)},
        H('div',{class:'bk-book'},coverCanvas(Lx)),
        H('div',{class:'bk-meta'},H('small',{},`${Lx.n}-сабақ · ${Lx.grade}`),H('b',{},Lx.title),H('span',{},Lx.sub),
          H('div',{class:'bk-prog'},H('i',{style:`width:${done/Lx.tasks.length*100}%`})),
          H('div',{class:'bk-st'},H('span',{},all?(R.chk?`✓ Орындалды · ${ok}/${Lx.qs.length} дұрыс`:'✓ Тәжірибе дайын'):started?`${done}/${Lx.tasks.length} тапсырма`:'Басталмаған'),H('em',{},started?'Жалғастыру →':'Ашу →')))));}
  }
  function openLesson(id){
    L=LESSONS.find(x=>x.id===id);if(!L)return;
    $('#bkPick').hidden=true;$('#bkApp').hidden=false;document.body.classList.add('bk-on');
    $('#bkTitle').textContent=`${L.n}. ${L.title}`;
    $('#bkLoad').hidden=false;
    ensure3D().then(()=>{
      $('#bkLoad').hidden=true;buildBook();buildRig();buildSteps();step=0;
      cs.t=V(W/2,.1,0);Object.assign(cs,{r:5.4,th:-.5,ph:.75});go(0);
      refreshTags();renderTasks();renderNb();openNb(false);resize();startLoop();
    }).catch(err=>{console.error(err);$('#bkLoad').textContent='3D жүктелмеді. Интернетті тексеріп, бетті жаңартыңыз.';});
  }
  function closeLesson(){toggleAuto(false);stopLoop();$('#bkApp').hidden=true;$('#bkPick').hidden=false;document.body.classList.remove('bk-on');
    callouts.forEach(c=>c.el.remove());callouts=[];for(const k in tagEls)tagEls[k].remove();tagEls={};notes.forEach(n=>n.el.remove());notes=[];renderShelf();}

  /* ----- engine boot ----- */
  async function ensure3D(){
    if(R3)return;T=await loadThree();
    try{await Promise.race([Promise.all(['700 40px Onest','500 40px Onest','400 40px Onest','italic 600 30px Onest','600 30px JetBrains Mono'].map(f=>document.fonts.load(f,'Химия'))),new Promise(r=>setTimeout(r,1800))]);}catch(e){}
    stage=$('#bkStage');cv=$('#bkCanvas');lblEl=$('#bkLabels');lineEl=$('#bkLines');
    PX=Math.min(2,window.devicePixelRatio||1);
    R3=new T.WebGLRenderer({canvas:cv,antialias:true});R3.setPixelRatio(PX);R3.shadowMap.enabled=true;R3.shadowMap.type=T.PCFSoftShadowMap;
    scene=new T.Scene();cam=new T.PerspectiveCamera(38,1,.05,60);rc=ray();
    scene.add(new T.HemisphereLight(0xffffff,0xbfc6d4,.62));
    dirL=new T.DirectionalLight(0xffffff,.62);dirL.position.set(-2.2,5,2.6);dirL.castShadow=true;dirL.shadow.mapSize.set(2048,2048);
    Object.assign(dirL.shadow.camera,{left:-3,right:3,top:3,bottom:-3,near:1,far:14});dirL.shadow.bias=-.0008;dirL.shadow.radius=2;scene.add(dirL);
    table=new T.Mesh(new T.PlaneGeometry(40,40),hatch('#e6eaf0'));table.rotation.x=-Math.PI/2;table.receiveShadow=true;scene.add(table);
    paintTheme();new MutationObserver(paintTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    cs.t=V(0,0,0);bindControls();
    new ResizeObserver(resize).observe(stage);
  }
  function paintTheme(){if(!scene)return;const dark=document.documentElement.dataset.theme==='dark';const c=dark?'#11141b':'#e6eaf0';scene.background=new T.Color(c);table.material.color.set(dark?'#1a1e27':'#e6eaf0');}
  function resize(){if(!R3||!stage)return;const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;R3.setSize(w,h,false);cam.aspect=w/h;cam.fov=w/h<1?50:38;cam.updateProjectionMatrix();}
  function frame(now){
    raf=requestAnimationFrame(frame);const dt=Math.min(.25,(now-(last||now))/1000);last=now;
    sim(dt,now);R3.render(scene,cam);placeOverlay();
  }
  function sim(dt,now){
    tickAnims(dt);
    if(Math.abs(openA-openT)>.001){openA+=(openT-openA)*Math.min(1,dt*2.6);if(Math.abs(openA-openT)<.002)openA=openT;applyOpen();}
    if(Math.abs(popK-popT)>.001){popK=clamp(popK+Math.sign(popT-popK)*dt*(popT>popK?.75:1.6),0,1);if(popT>popK&&openA<-.2)popK=0;setPop(popK);}
    if(ctw){ctw.t+=dt;const p=ease(Math.min(1,ctw.t/ctw.d));cs.t.lerpVectors(ctw.a.t,ctw.b.t,p);cs.r=lerp(ctw.a.r,ctw.b.r,p);cs.th=lerp(ctw.a.th,ctw.b.th,p);cs.ph=lerp(ctw.a.ph,ctw.b.ph,p);if(p>=1)ctw=null;}
    applyCam();
    if(sel&&!busy&&sel.kind==='bottle')sel.obj.position.y=.06+Math.sin(now/300)*.02;
    if(sel&&!busy&&sel.kind==='metal')sel.mover.position.y=sel.pcHome.y+.06+Math.sin(now/300)*.02;
    for(const t of tubes)fx(t,dt);
  }
  function fx(t,dt){
    if(t.sed&&t.sed.visible){t.sedK+=(t.sedT-t.sedK)*Math.min(1,dt*.5);const k=t.sedK*1.7;t.sed.scale.y=Math.max(.001,Math.min(1,k));
      const ch=Math.max(0,k-1)*.09;t.sedC.visible=ch>.001;t.sedC.scale.y=Math.max(.001,ch);t.sedC.position.y=TR+ch/2;}
    if(t.pts&&(t.part>0||t.ptsLive)){t.part-=dt;const P=t.pp,n=P.length/3,live=t.part>0;let any=0;
      for(let i=0;i<n;i++){let y=P[i*3+1];if(y<-5){if(live&&Math.random()<dt*14){const a=Math.random()*6.28,rr_=Math.random()*t.lr*.85;P[i*3]=Math.cos(a)*rr_;P[i*3+2]=Math.sin(a)*rr_;P[i*3+1]=t.surf-.01;}continue;}
        y-=dt*(.12+((i*13)%7)*.02);const floor=TR-t.lr+Math.min(1,t.sedK*1.7)*t.lr+Math.max(0,t.sedK*1.7-1)*.09;if(y<floor)y=-9;else any=1;P[i*3+1]=y;}
      t.ptsLive=any||live;t.pts.geometry.attributes.position.needsUpdate=true;}
    if(t.bub){for(const b of t.bubs){if(!b.live){if(Math.random()<dt*t.bub*9){b.live=true;const a=Math.random()*6.28,r=Math.random()*t.lr*.6;b.m.position.set(Math.cos(a)*r,TR-t.lr*.4,Math.sin(a)*r);b.v=.18+Math.random()*.2*t.bub;b.m.visible=true;const s=.6+Math.random()*.8;b.m.scale.set(s,s,s);}continue;}
      b.m.position.y+=b.v*dt;b.m.position.x+=Math.sin(b.m.position.y*30)*.0006;if(b.m.position.y>t.surf){b.live=false;b.m.visible=false;}}}
  }
  function startLoop(){if(running)return;running=true;last=0;raf=requestAnimationFrame(frame);}
  function stopLoop(){running=false;cancelAnimationFrame(raf);}

  /* ----- public ----- */
  const IC={play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>'};
  function init(){
    if(!$('#v-book'))return;
    const paintCovers=()=>{renderShelf();$$('.feat-art').forEach(box=>{box.innerHTML='';LESSONS.forEach(Lx=>box.append(H('div',{class:'mini'},coverCanvas(Lx,120,160))));});};
    paintCovers();
    if(document.fonts)Promise.all(['700 40px Onest','500 40px Onest','600 30px Onest'].map(f=>document.fonts.load(f,'Химия'))).then(paintCovers,()=>{});
    $('#bkBack').addEventListener('click',closeLesson);$('#bkMenu').addEventListener('click',closeLesson);
    $('#bkPrev').addEventListener('click',()=>go(step-1));$('#bkNext').addEventListener('click',()=>go(step+1));
    $('#bkPlay').addEventListener('click',()=>toggleAuto(!auto));$('#bkPlay').innerHTML=IC.play;
    $('#bkNbBtn').addEventListener('click',()=>openNb($('#bkNb').hidden));$('#bkNbX').addEventListener('click',()=>openNb(false));
    $('#bkTeach').addEventListener('click',()=>{teacher=!teacher;$('#bkTeach').classList.toggle('on',teacher);$('#bkApp').classList.toggle('teacher',teacher);refreshTags();renderNb();toast(teacher?'Мұғалім режимі: жасырын жауаптар көрінеді.':'Мұғалім режимі өшірілді.');});
    $('#nbConcl').addEventListener('input',e=>{if(!L)return;rec(L.id).concl=e.target.value;save();});
    $('#nbCheck').addEventListener('click',()=>{if(!L)return;const R=rec(L.id);R.chk=true;save();renderNb();if(STEPS[step]&&STEPS[step].k==='result')redrawPages(true);
      const ok=L.qs.filter(q=>isOk(q,R.ans[q.id])).length;toast(ok===L.qs.length?'Керемет! Барлық жауап дұрыс.':`Дұрыс жауап: ${ok}/${L.qs.length}. Қатені түзетіп көріңіз.`);});
    $('#nbCopy').addEventListener('click',()=>{if(!L)return;const t=nbText(L);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Дәптер көшірілді.'),()=>toast('Көшіру мүмкін болмады.'));});
    $('#nbPrint').addEventListener('click',()=>L&&printNb([L]));
    $('#bkPrintAll').addEventListener('click',()=>printNb(LESSONS));
    document.addEventListener('keydown',e=>{if($('#bkApp').hidden||!$('#v-book').classList.contains('on'))return;if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
      if(e.key==='ArrowRight')go(step+1);else if(e.key==='ArrowLeft')go(step-1);else if(e.key==='Escape'&&sel)setSel(null);});
  }
  function start(){if(L&&!$('#bkApp').hidden){resize();startLoop();}else renderShelf();}
  function stop(){stopLoop();toggleAuto(false);}
  return{init,start,stop,LESSONS,_t:{act:(a,b)=>act(items[a],items[b]),go:i=>go(i),nb:on=>openNb(on),ff:async s=>{for(let i=0;i<s*20;i++){sim(.05,performance.now());if(i%3===0)await new Promise(r=>setTimeout(r,0));}}}};
})();
