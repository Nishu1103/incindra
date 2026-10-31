/* Hero networks: a triangular lattice of glass-cube nodes, brightest around the centre hexagon.
   Nodes near the pointer (or a finger) ignite, and the light spreads along their connections.
   Home draws the whole network on a canvas. Compliance keeps its static SVG lattice and overlays the ignition only. */
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var JADE = '110,231,183';

  // The glass cube with a sphere of light, drawn to match the logo's nodes. r = half-size in px, o = opacity.
  var TOP=[[0,-0.95],[0.823,-0.475],[0,0],[-0.823,-0.475]], RIGHT=[[0.823,-0.475],[0.823,0.475],[0,0.95],[0,0]], LEFT=[[-0.823,-0.475],[0,0],[0,0.95],[-0.823,0.475]];
  var HEX=[[0,-0.95],[0.823,-0.475],[0.823,0.475],[0,0.95],[-0.823,0.475],[-0.823,-0.475]];
  function poly(ctx,x,y,r,pts){ctx.beginPath();pts.forEach(function(p,i){var px=x+p[0]*r,py=y+p[1]*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.closePath();}
  function drawCube(ctx,x,y,r,o){
    ctx.save(); ctx.globalAlpha=o;
    ctx.fillStyle='rgba('+JADE+',.30)'; poly(ctx,x,y,r,TOP); ctx.fill();
    ctx.fillStyle='rgba('+JADE+',.17)'; poly(ctx,x,y,r,RIGHT); ctx.fill();
    ctx.fillStyle='rgba('+JADE+',.09)'; poly(ctx,x,y,r,LEFT); ctx.fill();
    var h=ctx.createRadialGradient(x,y,0,x,y,0.62*r); h.addColorStop(0,'rgba('+JADE+',.75)'); h.addColorStop(1,'rgba('+JADE+',0)');
    ctx.fillStyle=h; ctx.beginPath(); ctx.arc(x,y,0.62*r,0,Math.PI*2); ctx.fill();
    var g=ctx.createRadialGradient(x-0.07*r,y-0.08*r,0,x,y,0.24*r); g.addColorStop(0,'#ffffff'); g.addColorStop(0.35,'#d9fff0'); g.addColorStop(1,'rgb('+JADE+')');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,0.24*r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgb('+JADE+')'; ctx.lineWidth=Math.max(0.6,0.07*r); ctx.lineJoin='round';
    poly(ctx,x,y,r,HEX); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-0.823*r,y-0.475*r); ctx.moveTo(x,y); ctx.lineTo(x+0.823*r,y-0.475*r); ctx.moveTo(x,y); ctx.lineTo(x,y+0.95*r); ctx.stroke();
    ctx.restore();
  }
  // A lit node's soft glow, under its cube.
  function halo(ctx,x,y,r,ht){var gr=r*2.6,gl=ctx.createRadialGradient(x,y,0,x,y,gr);gl.addColorStop(0,'rgba('+JADE+','+(0.45*ht).toFixed(3)+')');gl.addColorStop(1,'rgba('+JADE+',0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x,y,gr,0,Math.PI*2);ctx.fill();}

  // Lattice nodes around centre cx,cy with spacing s, inside the box x0..x1, y0..y1, keyed "i,j".
  var DIRS=[[1,0],[0,1],[1,-1]], NB=[[1,0],[0,1],[1,-1],[-1,0],[0,-1],[-1,1]];
  function lattice(cx,cy,s,x0,y0,x1,y1){
    var v1=[s*Math.cos(-Math.PI/6), s*Math.sin(-Math.PI/6)], v2=[0,-s];
    var pts={}, n=Math.ceil(Math.max(x1-x0,y1-y0)/s)+3;
    for(var i=-n;i<=n;i++)for(var j=-n;j<=n;j++){var x=cx+i*v1[0]+j*v2[0],y=cy+i*v1[1]+j*v2[1];if(x>x0&&x<x1&&y>y0&&y<y1)pts[i+','+j]=[x,y];}
    return pts;
  }
  // Calls fn(key, point, neighbourKey, neighbourPoint) once per edge.
  function eachEdge(pts,fn){
    for(var k in pts){var ij=k.split(','),a=+ij[0],b=+ij[1];
      for(var d=0;d<3;d++){var qk=(a+DIRS[d][0])+','+(b+DIRS[d][1]);if(pts[qk])fn(k,pts[k],qk,pts[qk]);}}
  }

  // Ignition state: heat (0..1) per lattice node.
  // Nodes within about one spacing of the pointer ignite at once; their neighbours catch half that heat over ~90ms per hop,
  // and everything fades (~0.4s) once the pointer moves on. Under reduced motion only the nodes under the pointer light,
  // with no spread or trail. step() returns true while anything is still lit.
  var SPREAD=0.5;
  function Heat(){
    var heat={};
    this.get=function(k){return heat[k]||0;};
    this.step=function(pts,s,ptr,dt){
      var keep=reduce?0:Math.exp(-dt/420), rise=Math.min(1,dt/90), R=s*1.15, next={}, live=false;
      for(var k in pts){
        var h=(heat[k]||0)*keep, pt=pts[k];
        if(!reduce){
          var ij=k.split(','),a=+ij[0],b=+ij[1],nb=0;
          for(var d=0;d<6;d++){var v=heat[(a+NB[d][0])+','+(b+NB[d][1])]||0;if(v>nb)nb=v;}
          var tgt=nb*SPREAD; if(tgt>h) h+=(tgt-h)*rise;
        }
        if(ptr){var dd=Math.hypot(pt[0]-ptr.x,pt[1]-ptr.y);if(dd<R){var u=1-dd/R;u=u*u*(3-2*u);if(u>h)h=u;}}
        if(h>0.005){next[k]=h;live=true;}
      }
      heat=next;
      return live;
    };
  }

  // Sizes a canvas to its CSS box at the device pixel ratio; returns its 2D context scaled by k (local units per CSS px), or null if hidden.
  function prep(canvas,k){
    var dpr=Math.min(window.devicePixelRatio||1,2), w=canvas.clientWidth, h=canvas.clientHeight; if(!w||!h) return null;
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
    var ctx=canvas.getContext('2d'); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.setTransform(dpr*k,0,0,dpr*k,0,0);
    return ctx;
  }

  // Runs a network: net.draw(t) paints a frame, net.pts / net.s / net.k / net.heat describe the nodes in local units
  // (net.k CSS px per local unit), net.busy(t) is true while a one-off animation plays, net.idle asks for a 60ms redraw.
  // Frames run every rAF while busy or lit, and not at all while off screen or the tab is hidden.
  function run(canvas,area,net){
    var heat=net.heat, ptr=null, onscreen=true, last=-1e9, prev=0, raf=0, live=false;
    function loop(t){
      raf=0;
      if(!onscreen||document.hidden) return;
      var dt=prev?Math.min(t-prev,100):16; prev=t;
      var lit=ptr||live;
      if(lit) live=heat.step(net.pts,net.s,ptr,dt);
      var busy=net.busy(t);
      if(busy||lit||(net.idle&&t-last>60)){net.draw(t);last=t;}
      if(busy||net.idle||ptr||live) raf=requestAnimationFrame(loop);
      else prev=0;
    }
    function start(){if(!raf&&onscreen&&!document.hidden)raf=requestAnimationFrame(loop);}
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){onscreen=es[0].isIntersecting;start();}).observe(area);
    }
    document.addEventListener('visibilitychange',start);
    var queued=false;
    window.addEventListener('resize',function(){if(queued)return;queued=true;requestAnimationFrame(function(t){queued=false;net.draw(t);});});

    // Pointer and touch tracking. Touch keeps tracking while the page scrolls under the finger.
    function aim(e){var r=canvas.getBoundingClientRect();ptr={x:(e.clientX-r.left)/net.k,y:(e.clientY-r.top)/net.k};start();}
    function drop(){ptr=null;}
    area.addEventListener('pointermove',aim);
    area.addEventListener('pointerdown',aim);
    area.addEventListener('pointerleave',drop);
    area.addEventListener('pointerup',function(e){if(e.pointerType!=='mouse')drop();});
    area.addEventListener('touchmove',function(e){if(e.touches[0])aim(e.touches[0]);},{passive:true});
    area.addEventListener('touchend',drop,{passive:true});
    area.addEventListener('touchcancel',drop,{passive:true});
    start();
  }

  /* Home: the full network on canvas */
  var heroCanvas=document.getElementById('heroNet');
  if(heroCanvas){
    var opt={cx:function(w){return w<640?w*0.62:w*0.74;},cy:function(w,h){return h*0.48;},s:function(w){return Math.max(84,Math.min(124,w*0.085));},reach:function(w,h){return Math.max(w,h)*0.62;},cube:15};
    // One soft pulse of the centre hexagon on first paint (600ms, once).
    var PULSE=600, pulseStart=null;
    var pulse=function(t){
      if(reduce) return 0;
      if(pulseStart===null) pulseStart=t;
      var k=(t-pulseStart)/PULSE;
      return k>=0&&k<1?Math.sin(Math.PI*k):0;
    };
    var home={k:1,pts:{},s:100,idle:!reduce,
      busy:function(t){return !reduce&&(pulseStart===null||t-pulseStart<PULSE);},
      // p (0..1) is the first-paint pulse of the centre hexagon.
      draw:function(t,first){
        var ctx=prep(heroCanvas,1); if(!ctx) return;
        var w=heroCanvas.clientWidth,h=heroCanvas.clientHeight,p=first?0:pulse(t||0);
        var cx=opt.cx(w,h), cy=opt.cy(w,h), s=opt.s(w,h), reach=opt.reach(w,h), hot=home.heat.get;
        var g=ctx.createRadialGradient(cx,cy,0,cx,cy,reach); g.addColorStop(0,'rgba(4,120,87,.30)'); g.addColorStop(1,'rgba(8,18,15,0)');
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
        var pts=home.pts=lattice(cx,cy,s,-s,-s,w+s,h+s); home.s=s;
        var f=function(x,y){return Math.max(0.05,1-Math.hypot(x-cx,y-cy)/reach);};
        eachEdge(pts,function(k,pt,qk,q){
          var o=Math.min(f(pt[0],pt[1]),f(q[0],q[1]))*0.5, e=(hot(k)+hot(qk))/2;
          o+=(0.95-o)*e;
          ctx.lineWidth=1+1.4*e; ctx.strokeStyle='rgba('+JADE+','+o.toFixed(3)+')';ctx.beginPath();ctx.moveTo(pt[0],pt[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
        });
        for(var k2 in pts){var p2=pts[k2],ff=f(p2[0],p2[1]),ht=hot(k2);
          var tw=reduce?1:0.85+0.15*Math.sin(t/900+p2[0]*0.013+p2[1]*0.021);
          var r=(opt.cube*(0.45+0.55*ff))*(1+0.35*ht), o2=(0.18+0.82*ff)*tw;
          if(ht>0.02) halo(ctx,p2[0],p2[1],r,ht);
          drawCube(ctx,p2[0],p2[1],r,o2+(1-o2)*ht);}
        var hr=s/2*(1+0.08*p);
        if(p>0){var gl=ctx.createRadialGradient(cx,cy,0,cx,cy,hr*1.6);gl.addColorStop(0,'rgba('+JADE+','+(0.22*p).toFixed(3)+')');gl.addColorStop(1,'rgba('+JADE+',0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(cx,cy,hr*1.6,0,Math.PI*2);ctx.fill();}
        ctx.lineWidth=1+p;ctx.strokeStyle='rgba('+JADE+','+(0.6+0.4*p).toFixed(3)+')';ctx.beginPath();
        for(var m=0;m<6;m++){var an=Math.PI/180*(60*m-90),x2=cx+hr*Math.cos(an),y2=cy+hr*Math.sin(an);m?ctx.lineTo(x2,y2):ctx.moveTo(x2,y2);}ctx.closePath();ctx.stroke();
        for(var m2=0;m2<6;m2++){var an2=Math.PI/180*(60*m2-90);drawCube(ctx,cx+hr*Math.cos(an2),cy+hr*Math.sin(an2),opt.cube*0.6*(1+0.12*p),0.95);}
      }};
    home.heat=new Heat();
    home.draw(0,true);
    run(heroCanvas,heroCanvas.parentNode,home);
  }

  /* Compliance: the static SVG lattice stays as drawn; a canvas laid over it draws only what is lit.
     Geometry matches the SVG's viewBox (800 x 560, centre 540,280, spacing 112, reach 560). */
  var svg=document.querySelector('.page-hero .lattice');
  if(svg){
    var hero=svg.parentNode, glow=document.createElement('canvas');
    glow.className='lattice-glow'; glow.setAttribute('aria-hidden','true');
    svg.parentNode.insertBefore(glow,svg.nextSibling);
    var LCX=540, LCY=280, LS=112, REACH=560, CUBE=15, placed='';
    var over={k:1,s:LS,pts:lattice(LCX,LCY,LS,-LS/2,-LS/2,800+LS/2,560+LS/2),idle:false,
      busy:function(){return false;},
      draw:function(){
        // Lay the canvas exactly over the SVG's rendered box.
        var hr=hero.getBoundingClientRect(), b=svg.getBoundingClientRect();
        var box=[b.left-hr.left,b.top-hr.top,b.width,b.height].map(function(v){return Math.round(v*10)/10+'px';});
        if(box.join()!==placed){placed=box.join();glow.style.left=box[0];glow.style.top=box[1];glow.style.width=box[2];glow.style.height=box[3];}
        over.k=b.width/800;
        var ctx=prep(glow,over.k); if(!ctx) return;
        var pts=over.pts, hot=over.heat.get;
        var f=function(x,y){return Math.max(0.05,1-Math.hypot(x-LCX,y-LCY)/REACH);};
        eachEdge(pts,function(k,pt,qk,q){
          var e=(hot(k)+hot(qk))/2; if(e<0.01) return;
          ctx.lineWidth=1+1.4*e; ctx.strokeStyle='rgba('+JADE+','+(0.9*e).toFixed(3)+')';ctx.beginPath();ctx.moveTo(pt[0],pt[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
        });
        for(var k2 in pts){var ht=hot(k2); if(ht<0.02) continue;
          var p2=pts[k2], r=CUBE*(0.45+0.55*f(p2[0],p2[1]))*(1+0.35*ht);
          halo(ctx,p2[0],p2[1],r,ht); drawCube(ctx,p2[0],p2[1],r,ht);}
      }};
    over.heat=new Heat();
    over.draw();
    run(glow,hero,over);
  }
})();
