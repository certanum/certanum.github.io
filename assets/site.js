/* Certanum — site.js */
(function(){
  var d=document, root=d.documentElement;
  root.classList.remove('no-js');
  // motion: honour OS reduced-motion, plus a site-level pause toggle (footer)
  var mq=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
  var saveData=!!(navigator.connection&&navigator.connection.saveData);
  var paused=false; try{ paused=localStorage.getItem('certanum-motion')==='off'; }catch(e){}
  function still(){ return paused||(mq&&mq.matches); }
  if(paused) root.classList.add('still');
  var motionHooks=[];
  d.querySelectorAll('[data-motion]').forEach(function(bt){
    function label(){ bt.textContent=paused?'Resume motion':'Pause motion'; bt.setAttribute('aria-pressed',paused?'true':'false'); }
    label();
    bt.addEventListener('click',function(){ paused=!paused; try{ localStorage.setItem('certanum-motion',paused?'off':'on'); }catch(e){}
      root.classList.toggle('still',paused); label(); motionHooks.forEach(function(f){ f(); }); });
  });
  // header state
  var hdr=d.querySelector('.hdr');
  function onScroll(){ if(!hdr) return; if(window.scrollY>24 || d.body.classList.contains('menu-open')) hdr.classList.add('solid'); else if(!hdr.dataset.always) hdr.classList.remove('solid'); }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  // mobile menu
  var b=d.querySelector('.burger');
  if(b){ b.addEventListener('click',function(){ var o=d.body.classList.toggle('menu-open'); b.setAttribute('aria-expanded',o?'true':'false'); onScroll(); });
    d.querySelectorAll('.nav a').forEach(function(a){ a.addEventListener('click',function(){ d.body.classList.remove('menu-open'); b.setAttribute('aria-expanded','false'); }); }); }
  // reveal on scroll
  var els=d.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }); },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(e){ io.observe(e); });
  } else { els.forEach(function(e){ e.classList.add('in'); }); }
  // photo fallbacks: if an industry image is missing, show the grid treatment
  d.querySelectorAll('[data-photo]').forEach(function(el){
    var src=el.getAttribute('data-photo'), img=new Image();
    img.onload=function(){ el.style.backgroundImage='url("'+src+'")'; el.classList.remove('fallback'); };
    img.onerror=function(){ el.classList.add('fallback'); };
    el.classList.add('fallback'); img.src=src;
  });
  // illustrative evidence record
  var demo=d.querySelector('[data-demo]');
  if(demo){
    var S={
      verified:{status:['ok','VERIFIED'],w:['82.4 kg','okc'],wsrc:'VS.VSSTRESN · VSTESTCD=WEIGHT · resolved 82.4',h:['1.78 m','okc'],hsrc:'VS.VSSTRESN · VSTESTCD=HEIGHT · 178 cm → m (declared transform)',re:['26.0 — matches released figure','okc'],
        big:'26.0',note:'Every operand resolves to its source value. Re-executing the declared operation reproduces the released figure. <strong>The figure is released with its evidence record.</strong>'},
      rejected:{status:['rej','REJECTED'],w:['84.2 kg','flag'],wsrc:'VS.VSSTRESN · VSTESTCD=WEIGHT · resolved 82.4 — operand ≠ source value',h:['1.78 m','okc'],hsrc:'VS.VSSTRESN · VSTESTCD=HEIGHT · 178 cm → m (declared transform)',re:['26.6 — rests on an unresolved operand','flag'],
        big:'26.6',note:'The computation ran correctly, and the result looks plausible. But one operand does not equal the source value it claims. <strong>A tool log would pass this. The evidence record does not.</strong>'},
      withheld:{status:['wh','WITHHELD'],w:['82.4 kg','okc'],wsrc:'VS.VSSTRESN · VSTESTCD=WEIGHT · resolved 82.4',h:['—','flag'],hsrc:'No height record for this subject and visit — operand unresolvable',re:['not executed','flag'],
        big:'—',note:'An operand cannot be resolved to a source. <strong>The figure is withheld — not estimated, not degraded.</strong>'}
    };
    var q=function(s){return demo.querySelector(s);};
    function set(k){
      var s=S[k];
      demo.querySelectorAll('.demo-ctl button').forEach(function(x){ x.setAttribute('aria-pressed', x.dataset.k===k?'true':'false'); });
      var st=q('[data-f=status]'); st.className='status '+s.status[0]; st.textContent=s.status[1];
      var w=q('[data-f=w]'); w.textContent=s.w[0]; w.className='v '+s.w[1];
      q('[data-f=wsrc]').textContent=s.wsrc;
      var h=q('[data-f=h]'); h.textContent=s.h[0]; h.className='v '+s.h[1];
      q('[data-f=hsrc]').textContent=s.hsrc;
      var re=q('[data-f=re]'); re.textContent=s.re[0]; re.className='v '+s.re[1];
      var big=q('[data-f=big]'); big.textContent=s.big; big.className='big'+(k==='withheld'?' none':'');
      q('[data-f=note]').innerHTML=s.note;
      var r=q('.rec'); r.classList.remove('fadeflip'); void r.offsetWidth; r.classList.add('fadeflip');
    }
    // product walkthrough: when first in view, step A -> B -> C once, then return to A.
    // Any interaction ends it; hover or focus holds it.
    var order=['verified','rejected','withheld'], step=0, timer=null, done=false, hold=false;
    function stopAuto(){ done=true; clearTimeout(timer); }
    function tick(){ if(done) return; if(hold||still()){ timer=setTimeout(tick,1200); return; }
      step++; if(step>order.length){ stopAuto(); return; } set(order[step%order.length]); if(step===order.length) stopAuto(); else timer=setTimeout(tick,5200); }
    demo.querySelectorAll('.demo-ctl button').forEach(function(x){ x.addEventListener('click',function(){ stopAuto(); set(x.dataset.k); }); });
    demo.addEventListener('mouseenter',function(){ hold=true; }); demo.addEventListener('mouseleave',function(){ hold=false; });
    demo.addEventListener('focusin',function(){ hold=true; }); demo.addEventListener('focusout',function(){ hold=false; });
    set('verified');
    if('IntersectionObserver' in window){
      var dio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting&&!done&&!timer&&!still()){ timer=setTimeout(tick,4200); dio.disconnect(); } }); },{threshold:.45});
      dio.observe(demo);
    }
    motionHooks.push(function(){ if(still()) stopAuto(); });
  }
  // hero evidence trace: the released figure resolves into its evidence, once
  var tr=d.querySelector('[data-trace]');
  if(tr){
    var st=tr.querySelector('[data-tr-st]'), lis=tr.querySelectorAll('.tr-steps li'), rp=tr.querySelector('[data-tr-replay]'), tt=[];
    function finish(){ tt.forEach(clearTimeout); tt=[]; tr.classList.remove('run'); lis.forEach(function(l){ l.classList.add('on'); }); st.classList.remove('pending'); st.textContent='VERIFIED'; if(rp) rp.hidden=still(); }
    function play(){
      if(still()){ finish(); return; }
      tt.forEach(clearTimeout); tt=[];
      tr.classList.remove('run'); void tr.offsetWidth; tr.classList.add('run');
      lis.forEach(function(l){ l.classList.remove('on'); });
      st.classList.add('pending'); st.textContent='UNRESOLVED'; if(rp) rp.hidden=true;
      var t=1300;
      lis.forEach(function(l){ tt.push(setTimeout(function(){ l.classList.add('on'); },t)); t+=780; });
      tt.push(setTimeout(finish,t+450));
    }
    if(rp) rp.addEventListener('click',play);
    motionHooks.push(function(){ if(still()) finish(); else if(rp) rp.hidden=false; });
    if(still()) finish(); else setTimeout(play,700);
  }
  // video-ready imagery: any [data-video] element (industry cards, sector page heroes) gets a
  // muted looping video over its still image, loaded only when near the viewport, never on
  // reduced motion or data-saver, and on small screens only if a data-video-mobile file is given.
  d.querySelectorAll('[data-video]').forEach(function(el){
    if(saveData||!('IntersectionObserver' in window)) return;
    var small=window.matchMedia&&window.matchMedia('(max-width: 860px)').matches;
    var src=small?el.getAttribute('data-video-mobile'):el.getAttribute('data-video');
    if(!src) return;
    var v=null;
    function mk(){ v=d.createElement('video'); v.muted=true; v.loop=true; v.playsInline=true;
      v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('aria-hidden','true'); v.setAttribute('tabindex','-1');
      v.preload='auto'; if(el.getAttribute('data-photo')) v.poster=el.getAttribute('data-photo');
      v.addEventListener('playing',function(){ el.classList.add('has-video'); });
      v.addEventListener('error',function(){ el.classList.remove('has-video'); if(v&&v.parentNode) v.parentNode.removeChild(v); v=null; },true);
      v.src=src; el.insertBefore(v,el.firstChild); }
    var vis=false;
    function sync(){ if(vis&&!still()){ if(!v) mk(); if(v){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); } } else if(v){ v.pause(); if(still()) el.classList.remove('has-video'); } }
    new IntersectionObserver(function(es){ es.forEach(function(e){ vis=e.isIntersecting; sync(); }); },{rootMargin:'200px 0px'}).observe(el);
    motionHooks.push(sync);
    if(mq&&mq.addEventListener) mq.addEventListener('change',sync);
  });
})();
