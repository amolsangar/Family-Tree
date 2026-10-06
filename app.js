(function(){
  const CW=150, CH=170, GAP=28, SIB=36, VGAP=90;   // card width/height, couple gap, sibling gap, row gap
  const data=window.FAMILY, P={};
  data.people.forEach(p=>P[p.id]=p);
  document.getElementById('title').textContent=data.title||'Family Tree';
  document.title=data.title||'Family Tree';

  const inFamilyAsChild=new Set();
  data.families.forEach(f=>(f.children||[]).forEach(c=>inFamilyAsChild.add(c)));
  const used=new Set();

  // Build a unit: a couple (or single person) plus child units
  function make(id){
    const f=data.families.find(f=>f.partners.includes(id)&&!used.has(f));
    if(!f) return {focus:id,partners:[id],kids:[]};
    used.add(f);
    const partners=[id,...f.partners.filter(p=>p!==id)];
    return {focus:id,partners,kids:(f.children||[]).map(make)};
  }

  // Roots: couples where nobody is a child of another family, plus loose people
  const roots=[];
  data.families.forEach(f=>{
    if(!used.has(f)&&!f.partners.some(p=>inFamilyAsChild.has(p))) roots.push(make(f.partners[0]));
  });
  data.people.forEach(p=>{
    const inAny=data.families.some(f=>f.partners.includes(p.id));
    if(!inAny&&!inFamilyAsChild.has(p.id)) roots.push(make(p.id));
  });

  const stage=document.getElementById('stage'), viewport=document.getElementById('viewport'), svg=document.getElementById('lines');
  if(!roots.length){stage.innerHTML='<p id="empty">No people yet. Add entries in family-data.js.</p>';return;}

  const coupleW=n=>n.partners.length*CW+(n.partners.length-1)*GAP;
  function measure(n){
    n.kids.forEach(measure);
    const kw=n.kids.reduce((s,k)=>s+k.w,0)+SIB*Math.max(0,n.kids.length-1);
    n.kw=kw; n.w=Math.max(coupleW(n),kw);
  }
  const paths=[];
  function place(n,x0,depth){
    n.cx=x0+n.w/2; n.y=depth*(CH+VGAP);
    const left=n.cx-coupleW(n)/2;
    n.cardX=n.partners.map((id,i)=>left+i*(CW+GAP));
    n.partners.forEach((id,i)=>card(P[id],n.cardX[i],n.y));
    let kx=x0+(n.w-n.kw)/2;
    n.kids.forEach(k=>{place(k,kx,depth+1);kx+=k.w+SIB;});
    // connectors
    if(n.partners.length>1)
      for(let i=0;i<n.partners.length-1;i++){
        const a=n.cardX[i]+CW, b=n.cardX[i+1], y=n.y+CH/2;
        paths.push(`<path class="marriage" d="M${a} ${y}H${b}"/>`);
      }
    if(n.kids.length){
      const top=n.y+CH/2, bus=n.y+CH+VGAP/2;
      const ends=n.kids.map(k=>k.cardX[0]+CW/2);
      const lo=Math.min(n.cx,...ends), hi=Math.max(n.cx,...ends);
      paths.push(`<path d="M${n.cx} ${top}V${bus}"/>`);
      paths.push(`<path d="M${lo} ${bus}H${hi}"/>`);
      n.kids.forEach((k,i)=>paths.push(`<path d="M${ends[i]} ${bus}V${k.y}"/>`));
    }
  }
  function card(p,x,y){
    const el=document.createElement('div');
    el.className='card'; el.style.cssText=`left:${x}px;top:${y}px;width:${CW}px;height:${CH}px`;
    const initials=p.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('');
    const ph=document.createElement(p.photo?'img':'div');
    if(p.photo){
      ph.className='photo'; ph.alt=p.name; ph.src='images/'+p.photo;
      ph.onerror=()=>{const d=document.createElement('div');d.className='photo initials';d.textContent=initials;ph.replaceWith(d);};
    } else {ph.className='photo initials';ph.textContent=initials;}
    const yrs=p.born?(p.born+(p.died?' – '+p.died:'')):'';
    el.appendChild(ph);
    el.insertAdjacentHTML('beforeend',`<div class="name"></div><div class="years"></div>`);
    el.querySelector('.name').textContent=p.name;
    el.querySelector('.years').textContent=yrs;
    stage.appendChild(el);
  }

  roots.forEach(measure);
  let x=0, maxDepth=0;
  roots.forEach(r=>{place(r,x,0);x+=r.w+SIB*2;});
  const depthOf=n=>1+Math.max(0,...n.kids.map(depthOf));
  maxDepth=Math.max(...roots.map(depthOf));
  const W=x-SIB*2, H=maxDepth*(CH+VGAP)-VGAP;
  stage.style.width=W+'px'; stage.style.height=H+'px';
  svg.setAttribute('width',W); svg.setAttribute('height',H);
  svg.innerHTML=paths.join('');

  // zoom
  let z=1;
  let panX=0;
  let panY=0;
  let isDragging=false;
  let dragStartX=0;
  let dragStartY=0;
  let startPanX=0;
  let startPanY=0;
  let pinchDistance=null;
  let pinchStartZoom=1;

  function setViewTransform(){
    stage.style.transform=`translate(${panX}px, ${panY}px) scale(${z})`;
    stage.style.transformOrigin='center top';
  }
  function clampPan(){
    const maxX=Math.max(0,(stage.offsetWidth*z-viewport.clientWidth)/2);
    const maxY=Math.max(0,(stage.offsetHeight*z-viewport.clientHeight)/2);
    panX=Math.max(-maxX,Math.min(maxX,panX));
    panY=Math.max(-maxY,Math.min(maxY,panY));
  }
  function setZoom(value){
    z=Math.min(2.8,Math.max(.5,value));
    clampPan();
    setViewTransform();
  }

  viewport.addEventListener('pointerdown',(e)=>{
    if(e.pointerType==='touch'||e.pointerType==='pen'||e.pointerType==='mouse'){
      if(e.pointerType==='mouse'&&e.button!==0) return;
      isDragging=true;
      dragStartX=e.clientX;
      dragStartY=e.clientY;
      startPanX=panX;
      startPanY=panY;
      viewport.setPointerCapture(e.pointerId);
    }
  });

  viewport.addEventListener('pointermove',(e)=>{
    if(!isDragging) return;
    panX=startPanX+(e.clientX-dragStartX);
    panY=startPanY+(e.clientY-dragStartY);
    clampPan();
    setViewTransform();
  });

  viewport.addEventListener('pointerup',()=>{isDragging=false;});
  viewport.addEventListener('pointerleave',()=>{isDragging=false;});
  viewport.addEventListener('wheel',(e)=>{
    e.preventDefault();
    const delta=e.deltaY<0?.08:-0.08;
    setZoom(z+delta);
  },{passive:false});

  viewport.addEventListener('touchstart',(e)=>{
    if(e.touches.length===2){
      pinchDistance=Math.hypot(
        e.touches[0].clientX-e.touches[1].clientX,
        e.touches[0].clientY-e.touches[1].clientY
      );
      pinchStartZoom=z;
    }
  },{passive:true});
  viewport.addEventListener('touchmove',(e)=>{
    if(e.touches.length===2&&pinchDistance){
      const nextDistance=Math.hypot(
        e.touches[0].clientX-e.touches[1].clientX,
        e.touches[0].clientY-e.touches[1].clientY
      );
      const scaleFactor=nextDistance/pinchDistance;
      setZoom(pinchStartZoom*scaleFactor);
    }
  },{passive:true});
  viewport.addEventListener('touchend',()=>{pinchDistance=null;pinchStartZoom=z;});

  setZoom(1);
  setViewTransform();
})();
