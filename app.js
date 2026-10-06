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

  const zoomLabel = document.getElementById('zoomLevel');
  const BOTTOM_BUFFER = 100;

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
  let pinchDistance=null;
  let pinchStartZoom=1;
  let panStartX=0;
  let panStartY=0;
  let dragStartX=0;
  let dragStartY=0;
  let activeDrag=false;

  function setViewTransform(){
    stage.style.transform=`translate(${panX}px, ${panY}px) scale(${z})`;
    stage.style.transformOrigin='center top';
    stage.style.marginTop = '0px';
  }

  function updateZoomLabel(){
    if (zoomLabel) zoomLabel.textContent = Math.round(z * 100) + '%';
  }

  function clampPan(){
    const maxX=Math.max(0,(stage.offsetWidth*z-viewport.clientWidth)/2);
    const usableHeight = Math.max(0, viewport.clientHeight - BOTTOM_BUFFER);
    const maxY=Math.max(0,(stage.offsetHeight*z-usableHeight));
    panX=Math.max(-maxX,Math.min(maxX,panX));
    panY=Math.max(-maxY,Math.min(0,panY));
  }

  function setZoom(value){
    z=Math.min(2.8,Math.max(.5,value));
    clampPan();
    setViewTransform();
    updateZoomLabel();
  }

  function fitToView(){
    const viewportWidth = viewport.clientWidth - 40;
    const viewportHeight = Math.max(140, viewport.clientHeight - BOTTOM_BUFFER);
    const stageWidth = stage.offsetWidth || W;
    const stageHeight = stage.offsetHeight || H;
    const zoomX = viewportWidth / stageWidth;
    const zoomY = viewportHeight / stageHeight;
    z = Math.min(1.8, Math.max(0.5, Math.min(zoomX, zoomY, 1)));
    panX = 0;
    panY = 0;
    clampPan();
    setViewTransform();
    updateZoomLabel();
  }

  function zoomIn(){
    setZoom(z + 0.15);
  }

  function zoomOut(){
    setZoom(z - 0.15);
  }

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      activeDrag = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      panStartX = panX;
      panStartY = panY;
      return;
    }

    if (e.touches.length === 2) {
      activeDrag = false;
      pinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartZoom = z;
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && activeDrag) {
      e.preventDefault();
      panX = panStartX + (e.touches[0].clientX - dragStartX);
      panY = panStartY + (e.touches[0].clientY - dragStartY);
      clampPan();
      setViewTransform();
      return;
    }

    if (e.touches.length === 2 && pinchDistance) {
      e.preventDefault();
      const nextDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = nextDistance / pinchDistance;
      setZoom(pinchStartZoom * scaleFactor);
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => {
    activeDrag = false;
    pinchDistance = null;
    pinchStartZoom = z;
  });

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    activeDrag = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = panX;
    panStartY = panY;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!activeDrag) return;
    e.preventDefault();
    panX = panStartX + (e.clientX - dragStartX);
    panY = panStartY + (e.clientY - dragStartY);
    clampPan();
    setViewTransform();
  });

  viewport.addEventListener('pointerup', () => {
    activeDrag = false;
  });
  viewport.addEventListener('pointerleave', () => {
    activeDrag = false;
  });

  function downloadTree(){
    const svg = document.getElementById('lines');
    const stage = document.getElementById('stage');
    const width = Number(svg.getAttribute('width')) || stage.offsetWidth || 1200;
    const height = Number(svg.getAttribute('height')) || stage.offsetHeight || 800;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0,0,width,height);

    const cards = [...document.querySelectorAll('.card')];
    cards.forEach(card => {
      const left = parseFloat(card.style.left) || 0;
      const top = parseFloat(card.style.top) || 0;
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      ctx.fillStyle = '#2d2d44';
      ctx.strokeStyle = '#FF6B9D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(left, top, w, h, 14);
      ctx.fill();
      ctx.stroke();

      const photo = card.querySelector('.photo');
      if (photo && photo.tagName === 'IMG') {
        try {
          ctx.save();
          ctx.beginPath();
          ctx.arc(left + w/2, top + 40, 38, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(photo, left + (w - 76)/2, top + 8, 76, 76);
          ctx.restore();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#FF6B9D';
          ctx.beginPath();
          ctx.arc(left + w/2, top + 40, 38, 0, Math.PI * 2);
          ctx.stroke();
        } catch (e) {}
      } else {
        const initials = (card.querySelector('.initials') || card.querySelector('.photo')).textContent.trim();
        ctx.fillStyle = '#FF6B9D';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(initials, left + w/2, top + 42);
      }

      const name = card.querySelector('.name');
      const years = card.querySelector('.years');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(name.textContent, left + w/2, top + 96);
      ctx.fillStyle = '#FF8BA8';
      ctx.font = '11px Arial';
      ctx.fillText(years.textContent, left + w/2, top + 118);
    });

    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'Sangar-Family-Tree.png';
      link.click();
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'Sangar-Family-Tree.png';
      link.click();
    };
    img.src = url;
  }

  function toggleFullscreen(){
    const viewport = document.getElementById('viewport');
    if (!document.fullscreenElement) {
      viewport.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }

  window.zoomIn = zoomIn;
  window.zoomOut = zoomOut;
  window.fitToView = fitToView;
  window.downloadTree = downloadTree;
  window.toggleFullscreen = toggleFullscreen;

  if (window.innerWidth <= 768) {
    setTimeout(fitToView, 150);
  } else {
    setTimeout(() => {
      panY = 0;
      setViewTransform();
      updateZoomLabel();
    }, 50);
  }

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom(z + delta);
  }, { passive: false });

  document.getElementById('zin')?.addEventListener('click', zoomIn);
  document.getElementById('zout')?.addEventListener('click', zoomOut);
  document.getElementById('zfit')?.addEventListener('click', fitToView);
})();
