'use strict';
/* ===== Titration ===== */
const Titr=(()=>{
  const AN=[
    {id:'hcl',name:'HCl, күшті қышқыл',type:'acid',K:1e9,f:'HCl',tit:'NaOH'},
    {id:'hac',name:'CH3COOH, әлсіз қышқыл',type:'acid',K:1.8e-5,f:'CH3COOH',tit:'NaOH'},
    {id:'hcooh',name:'HCOOH, құмырсқа қышқылы',type:'acid',K:1.8e-4,f:'HCOOH',tit:'NaOH'},
    {id:'naoh',name:'NaOH, күшті негіз',type:'base',K:1e-30,f:'NaOH',tit:'HCl'},
    {id:'nh3',name:'NH3, әлсіз негіз',type:'base',K:5.6e-10,f:'NH3',tit:'HCl'},
  ];
  const CT=0.1,VMAX=50;
  const S={an:AN[0],Va:25,C:.1,ind:'phph',Vt:0,flow:0,pts:[],unknown:false,revealed:false,mode:'ph',theory:false,drops:[],drip:0,last:0,running:false,refr:0,swirl:0,ans:null};

  function pHat(V){
    const an=S.an,Vtot=S.Va+V,T=S.C*S.Va/Vtot,tit=CT*V/Vtot,Kw=1e-14,K=an.K;
    const F=an.type==='acid'?x=>x+tit-Kw/x-T*K/(K+x):x=>x+T*x/(x+K)-Kw/x-tit;
    let a=-1.5,b=15.5;for(let i=0;i<50;i++){const m=(a+b)/2;if(F(Math.pow(10,-m))>0)a=m;else b=m;}
    return clamp((a+b)/2,0,14);
  }
  const Veq=()=>S.C*S.Va/CT;
  function reset(keepC){
    S.Vt=0;S.pts=[{V:0,pH:pHat(0)}];S.flow=0;S.drops=[];S.revealed=false;S.ans=null;
    $('#tFlow').value=0;$('#tVerd').textContent='';$('#tVerd').className='verdict';$('#tAns').value='';
    if(!keepC)S.C=S.unknown?Math.round(rnd(.04,.2)*1000)/1000:clamp(+$('#tC').value||.1,.005,1);
    $('#tTit').innerHTML=chem(S.an.tit)+' '+CT.toFixed(3)+' М';$('#tTitL').textContent='Бюреткадағы титрант';
    updateUI(true);
  }
  function setFlowFromSlider(){
    const s=+$('#tFlow').value;S.flow=s===0?0:.03+Math.pow(s/100,2)*2.6;
    $('#tFlowO').textContent=S.flow.toFixed(2)+' мл/с';
  }
  function addVol(dv){
    S.Vt=clamp(S.Vt+dv,0,VMAX);
    const last=S.pts[S.pts.length-1];
    if(S.Vt-last.V>=.05-1e-9||S.Vt>=VMAX)S.pts.push({V:S.Vt,pH:pHat(S.Vt)});
  }
  function indColor(pH){const ic=IND[S.ind].color(pH);return ic;}

  /* ---------- apparatus ---------- */
  const AW=360,AH=520;
  function drawApp(t,dt){
    const cv=$('#tcanvas'),ctx=fitCanvas(cv,AW,AH);ctx.clearRect(0,0,AW,AH);
    const dark=TH.dark;
    // stand
    ctx.fillStyle=rgba(TH.plate,1);ctx.fillRect(16,504,300,10);ctx.fillRect(46,24,7,484);
    ctx.fillRect(53,150,118,6);ctx.fillStyle=rgba(TH.fg,.35);ctx.fillRect(160,142,24,22);
    // burette
    const bx=180,top=44,mm=5.6,yv=v=>top+v*mm,bot=yv(50)+2;
    ctx.fillStyle=rgba(TH.panel,.5);ctx.strokeStyle=rgba(TH.glass,.9);ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(bx-10,top-14);ctx.lineTo(bx-10,bot+6);ctx.lineTo(bx-5,bot+22);ctx.lineTo(bx-1.5,bot+42);ctx.lineTo(bx+1.5,bot+42);ctx.lineTo(bx+5,bot+22);ctx.lineTo(bx+10,bot+6);ctx.lineTo(bx+10,top-14);ctx.stroke();
    // liquid
    const ly=yv(S.Vt);
    ctx.save();ctx.beginPath();ctx.rect(bx-9,ly,18,bot+10-ly);ctx.clip();
    ctx.fillStyle=rgba([90,190,210],.42);ctx.fillRect(bx-10,ly,20,bot-ly+10);
    ctx.restore();
    if(S.Vt<VMAX){ctx.fillStyle=rgba([90,190,210],.42);ctx.beginPath();ctx.moveTo(bx-10,bot+6);ctx.lineTo(bx-5,bot+22);ctx.lineTo(bx-1.5,bot+40);ctx.lineTo(bx+1.5,bot+40);ctx.lineTo(bx+5,bot+22);ctx.lineTo(bx+10,bot+6);ctx.fill();}
    // meniscus line
    if(S.Vt<VMAX){ctx.strokeStyle=rgba([40,140,160],.9);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(bx-9,ly);ctx.quadraticCurveTo(bx,ly+3,bx+9,ly);ctx.stroke();}
    // scale
    ctx.fillStyle=rgba(TH.glass,.9);ctx.strokeStyle=rgba(TH.glass,.85);ctx.lineWidth=1;ctx.font='9px "JetBrains Mono",monospace';ctx.textAlign='right';
    for(let v=0;v<=50;v++){const y=yv(v),L=v%5===0?10:v%1===0?5:0;ctx.beginPath();ctx.moveTo(bx-10,y);ctx.lineTo(bx-10+L,y);ctx.stroke();if(v%5===0)ctx.fillText(v,bx-14,y+3);}
    // stopcock
    ctx.fillStyle=rgba(TH.plate,1);ctx.fillRect(bx-8,bot+2,16,10);ctx.save();ctx.translate(bx,bot+7);ctx.rotate(S.flow>0?0:Math.PI/2);ctx.fillStyle=S.flow>0?TH.good:TH.bad;ctx.fillRect(-18,-3,36,6);ctx.restore();
    // drops
    const tipY=bot+42;
    if(S.flow>.9){ctx.strokeStyle=rgba([90,190,210],.7);ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(bx,tipY);ctx.lineTo(bx,388);ctx.stroke();}
    else{
      S.drip+=S.flow/.05*dt;
      while(S.drip>=1){S.drip-=1;S.drops.push({y:tipY,v:0});}
      for(const d of S.drops){d.v+=520*dt;d.y+=d.v*dt;ctx.fillStyle=rgba([90,190,210],.9);ctx.beginPath();ctx.ellipse(bx,d.y,2.4,3.4,0,0,6.29);ctx.fill();}
      S.drops=S.drops.filter(d=>d.y<400);
      if(S.flow>0&&S.flow<=.9){const k=(S.drip%1);ctx.fillStyle=rgba([90,190,210],.8);ctx.beginPath();ctx.ellipse(bx,tipY-1+k*3,1.5+k*1.5,1.5+k*2,0,0,6.29);ctx.fill();}
    }
    // tile + stirrer
    ctx.fillStyle='rgba(250,250,250,.94)';ctx.beginPath();ctx.roundRect?ctx.roundRect(88,390,184,106,8):ctx.rect(88,390,184,106);ctx.fill();
    ctx.fillStyle=rgba(TH.plate,1);ctx.fillRect(70,498,220,8);
    // flask
    const fx=180,fb=494,fh=108;
    const wAt=y=>y<62?lerp(150,36,y/62):36; // y from bottom
    const pathF=off=>{ctx.beginPath();for(let y=fh;y>=0;y-=4){const hw=wAt(y)/2+off;y===fh?ctx.moveTo(fx-hw,fb-y):ctx.lineTo(fx-hw,fb-y);}for(let y=0;y<=fh;y+=4)ctx.lineTo(fx+wAt(y)/2+off,fb-y);};
    const tot=S.Va+S.Vt,level=clamp(10+tot/100*50,6,70);
    const pH=S.pts[S.pts.length-1].pH,ic=indColor(pH);
    ctx.save();pathF(0);ctx.closePath();ctx.clip();
    const col=ic?[ic.c[0],ic.c[1],ic.c[2]]:[190,215,230],al=ic?clamp(.18+ic.s*.75,.18,.93):.22;
    ctx.fillStyle=rgba(col,al);
    const amp=1.2+Math.min(3,S.flow*2)+1.5;ctx.beginPath();ctx.moveTo(fx-90,fb-level);
    for(let x=fx-90;x<=fx+90;x+=4)ctx.lineTo(x,fb-level+Math.sin(x*.09+t*5)*amp*.6);
    ctx.lineTo(fx+90,fb+4);ctx.lineTo(fx-90,fb+4);ctx.closePath();ctx.fill();
    // swirl streaks
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.4;for(let i=0;i<3;i++){const a=t*4+i*2.1,w=30+i*14;ctx.beginPath();ctx.ellipse(fx,fb-level*.55,w,5+i*1.3,0,a,a+2);ctx.stroke();}
    // stir bar
    ctx.fillStyle='rgba(255,255,255,.8)';ctx.save();ctx.translate(fx,fb-7);ctx.rotate(t*9);ctx.fillRect(-14,-2.2,28,4.4);ctx.restore();
    ctx.restore();
    pathF(2.2);ctx.strokeStyle=rgba('#3f5b63',.95);ctx.lineWidth=2.4;ctx.stroke();
    ctx.beginPath();for(let y=10;y<fh*.7;y+=4){const x=fx-wAt(y)/2+6;y===10?ctx.moveTo(x,fb-y):ctx.lineTo(x,fb-y);}ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2.6;ctx.stroke();
    ctx.strokeStyle=rgba('#3f5b63',.95);ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(fx-26,fb-fh);ctx.lineTo(fx-16,fb-fh);ctx.moveTo(fx+16,fb-fh);ctx.lineTo(fx+26,fb-fh);ctx.stroke();
  }

  /* ---------- chart ---------- */
  const CW=640,CH=360,ML=50,MR=16,MT=14,MB=40;
  function drawChart(){
    const cv=$('#tchart'),ctx=fitCanvas(cv,CW,CH);ctx.clearRect(0,0,CW,CH);
    const pw=CW-ML-MR,ph=CH-MT-MB,mode=S.mode;
    const X=v=>ML+v/VMAX*pw;
    let ymax=14,Y=p=>MT+ph-p/14*ph,dpts=null;
    if(mode==='d'){
      dpts=[];const P=S.pts;
      for(let i=1;i<P.length;i++){const dv=P[i].V-P[i-1].V;if(dv>=.04)dpts.push({V:(P[i].V+P[i-1].V)/2,d:(P[i].pH-P[i-1].pH)/dv});}
      ymax=Math.max(2,...dpts.map(d=>d.d))*1.12;Y=p=>MT+ph-p/ymax*ph;
    }
    ctx.font='11px "JetBrains Mono",monospace';ctx.fillStyle=rgba(TH.muted,1);ctx.strokeStyle=rgba(TH.line,1);ctx.lineWidth=1;
    // grid
    ctx.textAlign='right';
    const ystep=mode==='d'?niceStep(ymax/5):2;
    for(let p=0;p<=ymax+1e-6;p+=ystep){const y=Y(p);ctx.beginPath();ctx.moveTo(ML,y);ctx.lineTo(CW-MR,y);ctx.stroke();ctx.fillText(mode==='d'?(+p.toFixed(1)):p,ML-6,y+4);}
    ctx.textAlign='center';for(let v=0;v<=VMAX;v+=10){const x=X(v);ctx.beginPath();ctx.moveTo(x,MT);ctx.lineTo(x,MT+ph);ctx.stroke();ctx.fillText(v,x,CH-MB+16);}
    ctx.fillText('Титрант көлемі, мл',ML+pw/2,CH-6);
    ctx.save();ctx.translate(13,MT+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText(mode==='d'?'dpH/dV':'pH',0,0);ctx.restore();
    ctx.strokeStyle=rgba(TH.fg,.6);ctx.strokeRect(ML,MT,pw,ph);
    // indicator band
    if(mode==='ph'){const r=IND[S.ind].range;ctx.fillStyle=rgba(TH.accent,.12);ctx.fillRect(ML,Y(r[1]),pw,Y(r[0])-Y(r[1]));ctx.fillStyle=rgba(TH.accent,.9);ctx.textAlign='left';ctx.fillText('ауысу аралығы: '+IND[S.ind].name.toLowerCase(),ML+6,Y(r[1])+13);}
    // theory
    if(S.theory&&mode==='ph'){ctx.strokeStyle=rgba(TH.muted,.9);ctx.setLineDash([4,4]);ctx.lineWidth=1.4;ctx.beginPath();for(let v=0;v<=VMAX;v+=.25){const x=X(v),y=Y(pHat(v));v?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);}
    // equivalence
    if(!S.unknown||S.revealed){const ve=Veq();if(ve<=VMAX){ctx.strokeStyle=rgba(TH.warn,.9);ctx.setLineDash([5,4]);ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(X(ve),MT);ctx.lineTo(X(ve),MT+ph);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=rgba(TH.warn,1);ctx.textAlign='left';ctx.fillText('V экв = '+ve.toFixed(2)+' мл',X(ve)+5,MT+ph-8);}}
    // data
    ctx.lineWidth=2.4;ctx.strokeStyle=rgba(TH.accent,1);ctx.lineJoin='round';
    if(mode==='ph'){
      ctx.beginPath();S.pts.forEach((p,i)=>{const x=X(p.V),y=Y(p.pH);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
      const l=S.pts[S.pts.length-1];ctx.fillStyle=rgba(TH.accent,1);ctx.beginPath();ctx.arc(X(l.V),Y(l.pH),5,0,6.29);ctx.fill();ctx.strokeStyle=rgba(TH.panel,1);ctx.lineWidth=2;ctx.stroke();
    }else if(dpts.length){
      ctx.beginPath();dpts.forEach((p,i)=>{const x=X(p.V),y=Y(p.d);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
      const mx=dpts.reduce((a,b)=>b.d>a.d?b:a);ctx.fillStyle=rgba(TH.warn,1);ctx.beginPath();ctx.arc(X(mx.V),Y(mx.d),5,0,6.29);ctx.fill();
      ctx.textAlign='left';ctx.fillText('максимум: '+mx.V.toFixed(2)+' мл',Math.min(X(mx.V)+8,CW-150),Y(mx.d)+4);
    }
  }
  function niceStep(x){const p=Math.pow(10,Math.floor(Math.log10(x))),m=x/p;return(m<1.5?1:m<3.5?2:m<7.5?5:10)*p;}

  function updateUI(force){
    const l=S.pts[S.pts.length-1],ic=indColor(l.pH);
    $('#tV').textContent=S.Vt.toFixed(2)+' мл';
    $('#tPH').textContent=l.pH.toFixed(2);
    $('#tCol').textContent=ic&&ic.s>.3?colorName(ic.c):ic?'солғын':'түссіз';
    $('#tTit').innerHTML=chem(S.an.tit)+' '+CT.toFixed(3)+' М';
  }
  function frame(ts){
    if(!S.running)return;
    const t=ts/1000,dt=Math.min(.05,S.last?t-S.last:.016);S.last=t;
    if(S.flow>0&&S.Vt<VMAX)addVol(S.flow*dt);
    if(S.Vt>=VMAX&&S.flow>0){S.flow=0;$('#tFlow').value=0;setFlowFromSlider();}
    drawApp(t,dt);
    S.refr+=dt;if(S.refr>.1){S.refr=0;updateUI();drawChart();}
    requestAnimationFrame(frame);
  }
  function check(){
    const a=parseFloat($('#tAns').value),box=$('#tVerd');
    if(!(a>0)){box.textContent='Сан енгізіңіз, мысалы 0.085.';box.className='verdict bad';return;}
    const err=Math.abs(a-S.C)/S.C*100;S.revealed=true;
    if(err<=2){box.innerHTML=`Дұрыс. Нақты концентрация ${S.C.toFixed(3)} моль/л, айырмашылық ${err.toFixed(1)}%. Есептеу: C = C(титрант)·V экв / V сынама = ${CT}·${Veq().toFixed(2)} / ${S.Va}.`;box.className='verdict ok';}
    else{box.innerHTML=`Сәйкес келмеді: жауабыңыз ${err.toFixed(0)}%-ға ерекшеленеді. V экв-ті pH секірісі немесе dpH/dV максимумы бойынша тауып, C = C(титрант)·V экв / V сынама арқылы есептеңіз.`;box.className='verdict bad';S.revealed=false;}
    drawChart();
  }
  function init(){
    const sa=$('#tAn');AN.forEach(a=>sa.append(H('option',{value:a.id},a.name)));
    const si=$('#tInd');Object.entries(IND).forEach(([k,v])=>si.append(H('option',{value:k},v.name)));
    sa.addEventListener('change',()=>{S.an=AN.find(a=>a.id===sa.value);reset();});
    $('#tVa').addEventListener('change',e=>{S.Va=+e.target.value;reset(true);});
    $('#tC').addEventListener('change',()=>reset());
    si.addEventListener('change',e=>{S.ind=e.target.value;updateUI();drawChart();});
    $('#tFlow').addEventListener('input',setFlowFromSlider);
    $('#tDrop').addEventListener('click',()=>{if(S.Vt<VMAX){addVol(.05);S.drops.push({y:400,v:0});}});
    $('#tStop').addEventListener('click',()=>{$('#tFlow').value=0;setFlowFromSlider();});
    $('#tReset').addEventListener('click',()=>reset());
    $('#tUnknown').addEventListener('change',e=>{S.unknown=e.target.checked;$('#tC').disabled=S.unknown;reset();});
    $('#tTheory').addEventListener('change',e=>{S.theory=e.target.checked;drawChart();});
    $('#tMode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.mode=b.dataset.m;$$('#tMode button').forEach(x=>x.classList.toggle('on',x===b));drawChart();});
    $('#tCheck').addEventListener('click',check);
    reset();
  }
  function start(){if(S.running)return;S.running=true;S.last=0;requestAnimationFrame(frame);drawChart();}
  function stop(){S.running=false;}
  return{init,start,stop};
})();
