'use strict';
/* ===== Ideal gas simulator ===== */
const Gas=(()=>{
  const R=8.314,GASES=[['He','Гелий He',4.003,3],['H2','Сутек H₂',2.016,3],['N2','Азот N₂',28.014,4],['O2','Оттек O₂',31.998,4],['Ar','Аргон Ar',39.948,4.3],['CO2','Көмірқышқыл газы CO₂',44.01,4.8]];
  const SC=.25,W=360,Hh=380,L=30,Rr=250,FLOOR=332,PMAX=50;
  const S={gas:GASES[2],T:300,n:1,V:25,pV:25,proc:'none',parts:[],trail:[],hist:new Array(40).fill(0),hits:0,hitRate:0,hitT:0,P0:null,running:false,last:0,refr:0,lastX:null};
  const P=()=>S.n*R*S.T/S.V;               // kPa for V in litres
  const sigma=()=>Math.sqrt(R*S.T/(S.gas[2]/1000)); // m/s per axis
  function gauss(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v);}
  const pistonY=()=>FLOOR-S.pV/50*270-12;
  function spawn(){
    const top=pistonY()+16,s=sigma()*SC;
    return{x:rnd(L+6,Rr-6),y:rnd(top+4,FLOOR-6),vx:gauss()*s,vy:gauss()*s,r:S.gas[3]};
  }
  function setN(){const N=Math.round(S.n*45);while(S.parts.length<N)S.parts.push(spawn());S.parts.length=Math.min(S.parts.length,N);}
  function retemp(old){const f=Math.sqrt(S.T/old.T)*Math.sqrt(old.M/S.gas[2]);for(const p of S.parts){p.vx*=f;p.vy*=f;p.r=S.gas[3];}}
  function sync(){
    $('#gTo').textContent=S.T+' K ('+(S.T-273.15).toFixed(0)+' °C)';$('#gNo').textContent=S.n.toFixed(2);$('#gVo').textContent=S.V.toFixed(1)+' л';
    $('#gT').disabled=S.proc==='iso-T';$('#gV').disabled=S.proc==='iso-V'||S.proc==='iso-P';
    $('#gT').value=S.T;$('#gV').value=S.V;$('#gN').value=S.n;
  }
  function onChange(which){
    const old={T:S.T,M:S.gas[2]};
    if(which==='T'){const t=+$('#gT').value;const o=S.T;S.T=t;retemp({T:o,M:S.gas[2]});
      if(S.proc==='iso-P'){S.V=clamp(S.n*R*S.T/S.P0,5,50);}}
    if(which==='V'){S.V=+$('#gV').value;}
    if(which==='N'){S.n=+$('#gN').value;setN();if(S.proc==='iso-P')S.P0=P();}
    if(which==='G'){const o={T:S.T,M:S.gas[2]};S.gas=GASES.find(g=>g[0]===$('#gGas').value);retemp(o);}
    sync();trace();
  }
  function axes(){
    const p=S.proc;
    if(p==='iso-P')return{x:'T',y:'V',xr:[100,900],yr:[0,55],xl:'T, К',yl:'V, л',fx:()=>S.T,fy:()=>S.V,curve:x=>S.n*R*x/S.P0};
    if(p==='iso-V')return{x:'T',y:'P',xr:[100,900],yr:[0,PMAX*8],xl:'T, К',yl:'P, кПа',fx:()=>S.T,fy:()=>P(),curve:x=>S.n*R*x/S.V};
    return{x:'V',y:'P',xr:[0,52],yr:[0,PMAX*8],xl:'V, л',yl:'P, кПа',fx:()=>S.V,fy:()=>P(),curve:x=>S.n*R*S.T/x};
  }
  function trace(){const a=axes(),x=a.fx(),y=a.fy();const l=S.trail[S.trail.length-1];if(!l||Math.abs(l[0]-x)+Math.abs(l[1]-y)>.01){S.trail.push([x,y]);if(S.trail.length>400)S.trail.shift();}}

  /* ---------- drawing ---------- */
  function drawCyl(ctx,t){
    ctx.clearRect(0,0,W,Hh);
    const py=pistonY(),hot=S.T>330,cold=S.T<250;
    // heater
    ctx.fillStyle=rgba(TH.plate,1);ctx.fillRect(L-14,FLOOR+6,Rr-L+28,12);
    if(hot){const k=clamp((S.T-330)/570,.15,1);for(let i=0;i<9;i++){const x=L+10+i*(Rr-L-20)/8,h=(14+Math.sin(t*12+i)*5)*(.6+k*1.6);const g=ctx.createLinearGradient(0,FLOOR+6,0,FLOOR+6-h);g.addColorStop(0,'rgba(255,200,60,.9)');g.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-6,FLOOR+6);ctx.quadraticCurveTo(x-2,FLOOR+6-h*.5,x+Math.sin(t*9+i)*3,FLOOR+6-h);ctx.quadraticCurveTo(x+3,FLOOR+6-h*.5,x+6,FLOOR+6);ctx.fill();}}
    if(cold){for(let i=0;i<7;i++){ctx.fillStyle='rgba(170,225,250,.55)';ctx.strokeStyle='rgba(220,245,255,.8)';ctx.fillRect(L+i*32,FLOOR+8,22,10);ctx.strokeRect(L+i*32,FLOOR+8,22,10);}}
    // gas tint
    const k=clamp((S.T-100)/800,0,1),hue=lerp(210,8,k);
    ctx.fillStyle=`hsla(${hue},80%,55%,.08)`;ctx.fillRect(L,py+16,Rr-L,FLOOR-py-16);
    // walls
    ctx.strokeStyle=rgba(TH.glass,.95);ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(L,24);ctx.lineTo(L,FLOOR);ctx.lineTo(Rr,FLOOR);ctx.lineTo(Rr,24);ctx.stroke();
    ctx.font='9px "JetBrains Mono",monospace';ctx.fillStyle=rgba(TH.glass,.85);ctx.textAlign='left';ctx.lineWidth=1;
    for(let v=5;v<=50;v+=5){const y=FLOOR-v/50*270-12+12;ctx.beginPath();ctx.moveTo(Rr,y);ctx.lineTo(Rr+(v%10===0?10:5),y);ctx.stroke();if(v%10===0)ctx.fillText(v,Rr+13,y+3);}
    // particles
    const s0=sigma()*SC;
    for(const p of S.parts){
      const sp=Math.hypot(p.vx,p.vy)/s0,h=lerp(215,0,clamp((sp-.4)/2.2,0,1));
      ctx.fillStyle=`hsl(${h},85%,${TH.dark?62:48}%)`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.29);ctx.fill();
    }
    // piston
    const g=ctx.createLinearGradient(0,py,0,py+14);g.addColorStop(0,rgba(TH.plate,1));g.addColorStop(1,rgba(TH.muted,1));
    ctx.fillStyle=g;ctx.fillRect(L+1,py,Rr-L-2,14);ctx.strokeStyle=rgba(TH.fg,.5);ctx.lineWidth=1.2;ctx.strokeRect(L+1,py,Rr-L-2,14);
    ctx.fillStyle=rgba(TH.plate,1);ctx.fillRect((L+Rr)/2-4,10,8,py-10);ctx.fillRect((L+Rr)/2-30,4,60,8);
    // gauge
    const gx=318,gy=96,gr=34;ctx.fillStyle=rgba(TH.panel,1);ctx.strokeStyle=rgba(TH.fg,.5);ctx.lineWidth=2;ctx.beginPath();ctx.arc(gx,gy,gr,0,6.29);ctx.fill();ctx.stroke();
    ctx.lineWidth=1;ctx.font='8px "JetBrains Mono",monospace';ctx.textAlign='center';ctx.fillStyle=rgba(TH.muted,1);
    for(let i=0;i<=8;i++){const a=Math.PI*.75+i/8*Math.PI*1.5,c=Math.cos(a),s=Math.sin(a);ctx.strokeStyle=rgba(TH.fg,.6);ctx.beginPath();ctx.moveTo(gx+c*(gr-8),gy+s*(gr-8));ctx.lineTo(gx+c*(gr-3),gy+s*(gr-3));ctx.stroke();if(i%2===0)ctx.fillText(i*50,gx+c*(gr-16),gy+s*(gr-16)+3);}
    const pf=clamp(P()/400,0,1),a=Math.PI*.75+pf*Math.PI*1.5;ctx.strokeStyle=rgba(TH.bad,1);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+Math.cos(a)*(gr-9),gy+Math.sin(a)*(gr-9));ctx.stroke();
    ctx.fillStyle=rgba(TH.fg,1);ctx.beginPath();ctx.arc(gx,gy,3,0,6.29);ctx.fill();ctx.fillStyle=rgba(TH.muted,1);ctx.fillText('кПа',gx,gy+gr-9);
  }
  function stepSim(dt){
    const target=S.V;S.pV+=(target-S.pV)*Math.min(1,dt*6);
    const py=pistonY()+14,s0=sigma()*SC;
    for(const p of S.parts){
      p.x+=p.vx*dt;p.y+=p.vy*dt;
      if(p.x<L+p.r){p.x=L+p.r;p.vx=Math.abs(p.vx);S.hits++;}
      if(p.x>Rr-p.r){p.x=Rr-p.r;p.vx=-Math.abs(p.vx);S.hits++;}
      if(p.y>FLOOR-p.r){p.y=FLOOR-p.r;p.vy=-Math.abs(p.vy);S.hits++;}
      if(p.y<py+p.r){p.y=py+p.r;p.vy=Math.abs(p.vy)+(target<S.pV-.05?20:0);S.hits++;}
    }
    // histogram (speeds in m/s)
    const bins=S.hist.length,vmax=Math.max(sigma()*4.2,200);
    const cur=new Array(bins).fill(0);
    for(const p of S.parts){const v=Math.hypot(p.vx,p.vy)/SC,b=Math.min(bins-1,Math.floor(v/vmax*bins));cur[b]++;}
    const a=Math.min(1,dt*.6);
    if(S.hmax!==vmax){S.hist=S.hist.map((_,i)=>cur[i]);S.hmax=vmax;}
    for(let i=0;i<bins;i++)S.hist[i]+=(cur[i]-S.hist[i])*a;
    S.hitT+=dt;if(S.hitT>=1){S.hitRate=S.hits/S.hitT;S.hits=0;S.hitT=0;}
  }
  function drawChartPV(){
    const cv=$('#gPV'),ctx=fitCanvas(cv,640,480),a=axes();ctx.clearRect(0,0,640,480);
    const ml=52,mr=14,mt=14,mb=40,pw=640-ml-mr,ph=480-mt-mb;
    const X=v=>ml+(v-a.xr[0])/(a.xr[1]-a.xr[0])*pw,Y=v=>mt+ph-(v-a.yr[0])/(a.yr[1]-a.yr[0])*ph;
    ctx.font='15px "JetBrains Mono",monospace';ctx.lineWidth=1;
    const xs=nice((a.xr[1]-a.xr[0])/6),ys=nice((a.yr[1]-a.yr[0])/5);
    ctx.textAlign='center';ctx.strokeStyle=rgba(TH.line,1);ctx.fillStyle=rgba(TH.muted,1);
    for(let v=Math.ceil(a.xr[0]/xs)*xs;v<=a.xr[1];v+=xs){ctx.beginPath();ctx.moveTo(X(v),mt);ctx.lineTo(X(v),mt+ph);ctx.stroke();ctx.fillText(v,X(v),480-mb+16);}
    ctx.textAlign='right';for(let v=a.yr[0];v<=a.yr[1];v+=ys){ctx.beginPath();ctx.moveTo(ml,Y(v));ctx.lineTo(640-mr,Y(v));ctx.stroke();ctx.fillText(v,ml-6,Y(v)+4);}
    ctx.textAlign='center';ctx.fillText(a.xl,ml+pw/2,476);ctx.save();ctx.translate(14,mt+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText(a.yl,0,0);ctx.restore();
    ctx.strokeStyle=rgba(TH.fg,.6);ctx.strokeRect(ml,mt,pw,ph);
    ctx.save();ctx.beginPath();ctx.rect(ml,mt,pw,ph);ctx.clip();
    ctx.strokeStyle=rgba(TH.muted,.9);ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();
    let first=true;for(let x=a.xr[0]+(a.xr[0]===0?.5:0);x<=a.xr[1];x+=(a.xr[1]-a.xr[0])/160){const y=a.curve(x);const px=X(x),py=Y(y);first?ctx.moveTo(px,py):ctx.lineTo(px,py);first=false;}ctx.stroke();ctx.setLineDash([]);
    if(S.trail.length>1){ctx.strokeStyle=rgba(TH.accent,.85);ctx.lineWidth=2.4;ctx.beginPath();S.trail.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.stroke();}
    ctx.fillStyle=rgba(TH.accent,1);ctx.beginPath();ctx.arc(X(a.fx()),Y(a.fy()),6,0,6.29);ctx.fill();ctx.strokeStyle=rgba(TH.panel,1);ctx.lineWidth=2;ctx.stroke();
    ctx.restore();
  }
  function nice(x){const p=Math.pow(10,Math.floor(Math.log10(x))),m=x/p;return(m<1.5?1:m<3.5?2:m<7.5?5:10)*p;}
  function drawMax(){
    const cv=$('#gMax'),ctx=fitCanvas(cv,640,480);ctx.clearRect(0,0,640,480);
    const ml=40,mr=14,mt=14,mb=40,pw=640-ml-mr,ph=480-mt-mb,bins=S.hist.length,vmax=S.hmax||Math.max(sigma()*4.2,200),sg=sigma();
    const N=Math.max(1,S.parts.length),bw=vmax/bins;
    const f=v=>v/(sg*sg)*Math.exp(-v*v/(2*sg*sg)); // 2D Rayleigh pdf
    let ymax=0;for(let v=0;v<vmax;v+=vmax/120)ymax=Math.max(ymax,f(v)*bw*N);ymax*=1.35;
    const X=v=>ml+v/vmax*pw,Y=c=>mt+ph-c/ymax*ph;
    ctx.fillStyle=rgba(TH.accent,.35);const bwp=pw/bins;
    for(let i=0;i<bins;i++){const h=S.hist[i]/ymax*ph;ctx.fillRect(ml+i*bwp+1,mt+ph-h,bwp-2,h);}
    ctx.strokeStyle=rgba(TH.warn,1);ctx.lineWidth=2.4;ctx.beginPath();for(let v=0;v<=vmax;v+=vmax/160){const y=Y(f(v)*bw*N);v?ctx.lineTo(X(v),y):ctx.moveTo(X(v),y);}ctx.stroke();
    ctx.font='15px "JetBrains Mono",monospace';ctx.fillStyle=rgba(TH.muted,1);ctx.textAlign='center';ctx.strokeStyle=rgba(TH.line,1);ctx.lineWidth=1;
    const xs=nice(vmax/6);for(let v=0;v<=vmax;v+=xs){ctx.beginPath();ctx.moveTo(X(v),mt+ph);ctx.lineTo(X(v),mt+ph+5);ctx.stroke();ctx.fillText(v,X(v),480-mb+18);}
    ctx.fillText('жылдамдық, м/с',ml+pw/2,476);ctx.textAlign='left';ctx.fillText('бөлшектер саны',ml+8,mt+18);
    ctx.fillStyle=rgba(TH.warn,1);ctx.textAlign='right';ctx.fillText('— Максвелл теориясы (2D)',ml+pw-8,mt+18);
    ctx.strokeStyle=rgba(TH.fg,.6);ctx.strokeRect(ml,mt,pw,ph);
  }
  function stats(){
    const p=P(),vr=Math.sqrt(3*R*S.T/(S.gas[2]/1000)),ek=1.5*R*S.T/1000;
    const items=[['Қысым',p.toFixed(1)+' кПа'],['Атмосферамен',(p/101.325).toFixed(2)+' атм'],['v орт. кв.',vr.toFixed(0)+' м/с'],['Ek, моль',ek.toFixed(2)+' кДж'],['Қабырғаға соққы',S.hitRate.toFixed(0)+' /с']];
    const box=$('#gStats');if(!box.children.length)items.forEach(()=>box.append(H('div',{class:'stat'},H('small',{}),H('b',{style:'font-size:16px'}))));
    items.forEach((it,i)=>{const c=box.children[i];c.firstChild.textContent=it[0];c.lastChild.textContent=it[1];});
  }
  function frame(ts){
    if(!S.running)return;
    const t=ts/1000,dt=Math.min(.05,S.last?t-S.last:.016);S.last=t;
    stepSim(dt);
    const cv=$('#gcanvas'),ctx=fitCanvas(cv,W,Hh);drawCyl(ctx,t);
    S.refr+=dt;if(S.refr>.1){S.refr=0;stats();drawChartPV();drawMax();trace();}
    // isobaric: V follows T
    if(S.proc==='iso-P'){S.V=clamp(S.n*R*S.T/S.P0,5,50);$('#gV').value=S.V;$('#gVo').textContent=S.V.toFixed(1)+' л';}
    requestAnimationFrame(frame);
  }
  function start(){if(S.running)return;S.running=true;S.last=0;requestAnimationFrame(frame);}
  function stop(){S.running=false;}
  function init(){
    const g=$('#gGas');GASES.forEach(x=>g.append(H('option',{value:x[0]},x[1])));g.value='N2';
    g.addEventListener('change',()=>onChange('G'));
    $('#gT').addEventListener('input',()=>onChange('T'));$('#gV').addEventListener('input',()=>onChange('V'));$('#gN').addEventListener('input',()=>onChange('N'));
    $('#gClear').addEventListener('click',()=>{S.trail=[];trace();});
    $('#gProc').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.proc=b.dataset.p;$$('#gProc button').forEach(x=>x.classList.toggle('on',x===b));
      S.P0=P();S.trail=[];sync();trace();});
    S.pV=S.V;setN();sync();trace();
  }
  return{init,start,stop};
})();
