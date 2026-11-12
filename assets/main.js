/* Incindra site script: legacy redirects, nav drawer, reveals and stroke draws, Logos Assist examples, demo form. */
const FORMSPREE = { demo: 'https://formspree.io/f/mnppbgqp' };

(function () {
  'use strict';
  var doc = document, root = doc.documentElement, page = doc.body.getAttribute('data-page');

  // Old single-page anchors that moved to their own pages (Home only).
  if (page === 'home') {
    var MOVED = { '#method': 'how-it-works.html#method', '#logos': 'how-it-works.html#logos', '#depth': 'services.html', '#api': 'platform-api.html' };
    if (MOVED[location.hash]) { location.replace(MOVED[location.hash]); return; }
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth scrolling for in-page links only: arriving from another page at #anchor jumps straight there.
  window.addEventListener('load', function () { setTimeout(function () { root.classList.add('smooth'); }, 0); });
  var hasIO = 'IntersectionObserver' in window;
  var EASE = 'cubic-bezier(.22,1,.36,1)';
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  // Calls fn once, the first time el scrolls into view.
  function onEnter(el, fn) {
    if (!hasIO) { fn(el); return; }
    var ob = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { ob.unobserve(e.target); fn(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    ob.observe(el);
  }
  var motion = !reduce && hasIO;

  /* Nav drawer (below lg) */
  var toggle = doc.querySelector('.menu-toggle'), nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    var isOpen = function () { return nav.classList.contains('open'); };
    var setOpen = function (open, restoreFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      root.classList.toggle('nav-open', open);
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
      else if (restoreFocus) toggle.focus();
    };
    toggle.addEventListener('click', function () { setOpen(!isOpen(), true); });
    nav.addEventListener('click', function (e) { if (isOpen() && e.target.closest('a')) setOpen(false, false); });
    doc.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false, true); return; }
      if (e.key !== 'Tab') return;
      // Trap focus between the toggle and the drawer's links.
      var list = [toggle].concat($$('a,button', nav)), n = list.length, i = list.indexOf(doc.activeElement);
      e.preventDefault();
      list[i < 0 ? 0 : (i + (e.shiftKey ? -1 : 1) + n) % n].focus();
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches && isOpen()) setOpen(false, false); });
  }

  /* Once-only section-head fade, for heads that start below the fold */
  if (motion) {
    $$('.sec-head').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal');
      onEnter(el, function () { el.classList.add('in'); });
    });
  }

  /* Problem graph: mapped edges draw on enter, 40ms apart */
  if (motion) {
    $$('[data-draw-edges]').forEach(function (g) {
      var lines = $$('line', g);
      lines.forEach(function (l) {
        var len = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value) + 1;
        l.style.strokeDasharray = len; l.style.strokeDashoffset = len;
      });
      onEnter(g.ownerSVGElement, function () {
        lines.forEach(function (l, i) {
          l.style.transition = 'stroke-dashoffset 1.1s ' + EASE + ' ' + (i * 40) + 'ms';
          l.style.strokeDashoffset = 0;
        });
      });
    });
  }

  /* Playable diagrams: nodes can be dragged, and their edges follow.
     The grab handles are HTML, laid over the nodes, because touch-action is not honoured inside SVG:
     touching a node drags it, while the rest of the figure still scrolls the page. */
  var NS = 'http://www.w3.org/2000/svg';
  // Wraps a node's <use> in a <g class="gnode"> that drags as one; returns [g, centreX, centreY].
  function wrapNode(u) {
    var half = +u.getAttribute('width') / 2, x = +u.getAttribute('x') + half, y = +u.getAttribute('y') + half;
    var g = doc.createElementNS(NS, 'g');
    g.setAttribute('class', 'gnode');
    u.parentNode.insertBefore(g, u); g.appendChild(u);
    u.style.transformOrigin = x + 'px ' + y + 'px';
    return [g, x, y];
  }
  // nodes: { g, x, y (centre), box: [minX, minY, maxX, maxY], move(x, y, dx, dy) }. first() runs before the first drag.
  function playable(svg, nodes, first) {
    var vb = svg.viewBox.baseVal, box = doc.createElement('div');
    box.className = 'play';
    svg.parentNode.insertBefore(box, svg); box.appendChild(svg);
    var at = function (e) { return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); };
    nodes.forEach(function (n) {
      var h = doc.createElement('span'), g = n.g, dx = 0, dy = 0, grab = null;
      h.className = 'handle'; h.setAttribute('aria-hidden', 'true');
      box.appendChild(h);
      var place = function (x, y) { h.style.left = x / vb.width * 100 + '%'; h.style.top = y / vb.height * 100 + '%'; };
      place(n.x, n.y);
      h.addEventListener('pointerenter', function () { g.classList.add('hover'); });
      h.addEventListener('pointerleave', function () { g.classList.remove('hover'); });
      h.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
      h.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        e.preventDefault();
        if (first) { first(); first = null; }
        g.parentNode.appendChild(g); box.appendChild(h);
        h.setPointerCapture(e.pointerId);
        var p = at(e); grab = { x: p.x - dx, y: p.y - dy };
        g.classList.add('drag'); h.classList.add('drag');
      });
      h.addEventListener('pointermove', function (e) {
        if (!grab) return;
        var p = at(e), b = n.box;
        var x = Math.max(b[0], Math.min(b[2], p.x - grab.x + n.x)), y = Math.max(b[1], Math.min(b[3], p.y - grab.y + n.y));
        dx = x - n.x; dy = y - n.y;
        g.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')');
        n.move(x, y, dx, dy);
        place(x, y);
      });
      var release = function () { grab = null; g.classList.remove('drag'); h.classList.remove('drag'); };
      h.addEventListener('pointerup', release);
      h.addEventListener('pointercancel', release);
    });
  }
  // Edges drop their draw-in dashes once anything moves, so they can change length freely.
  function undash(els) { els.forEach(function (l) { l.style.transition = l.style.strokeDasharray = l.style.strokeDashoffset = ''; }); }

  // Mapped relationships: straight edges whose ends sit on node centres.
  $$('[data-playable]').forEach(function (svg) {
    var lines = $$('[data-draw-edges] line', svg), vb = svg.viewBox.baseVal;
    playable(svg, $$(':scope > use', svg).map(function (u) {
      var w = wrapNode(u), ox = w[1], oy = w[2], ends = [];
      lines.forEach(function (l) {
        if (+l.getAttribute('x1') === ox && +l.getAttribute('y1') === oy) ends.push([l, 'x1', 'y1']);
        if (+l.getAttribute('x2') === ox && +l.getAttribute('y2') === oy) ends.push([l, 'x2', 'y2']);
      });
      return { g: w[0], x: ox, y: oy, box: [16, 16, vb.width - 16, vb.height - 28],
        move: function (x, y) { ends.forEach(function (end) { end[0].setAttribute(end[1], x); end[0].setAttribute(end[2], y); }); } };
    }), function () { undash(lines); });
  });

  /* Depth tree: trunk draws, then branches; nodes and Logos micro-nodes fade in after */
  var tree = doc.querySelector('.tree svg');
  if (tree && motion && tree.getBoundingClientRect().width > 0) {
    var trunk = $$('.t-trunk', tree), branches = $$('.t-branch', tree);
    trunk.concat(branches).forEach(function (p) {
      var len = p.getTotalLength() + 1;
      p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    });
    tree.classList.add('prep');
    onEnter(tree, function () {
      trunk.forEach(function (p) { p.style.transition = 'stroke-dashoffset .45s ' + EASE; p.style.strokeDashoffset = 0; });
      branches.forEach(function (p, i) { p.style.transition = 'stroke-dashoffset .7s ' + EASE + ' ' + (380 + i * 40) + 'ms'; p.style.strokeDashoffset = 0; });
      tree.classList.add('drawn');
    });
  }

  /* Depth tree, playable: branches, Logos questions and the trunk's root can be dragged.
     Paths keep their shape: a curved branch's control point travels with the end that moves. */
  if (tree) {
    var edges = $$('path', tree).map(function (p) {
      return { el: p, n: p.getAttribute('d').match(/-?[\d.]+/g).map(Number), curve: /C/.test(p.getAttribute('d')) };
    });
    var drawEdge = function (e) {
      var n = e.n;
      e.el.setAttribute('d', 'M' + n[0] + ',' + n[1] + (e.curve ? ' C' + n[2] + ',' + n[3] + ' ' + n[4] + ',' + n[5] + ' ' + n[6] + ',' + n[7] : ' L' + n[2] + ',' + n[3]));
    };
    // Each edge end sitting on (x, y): [edge, index of the end point, index of its control point or -1]
    var endsAt = function (x, y) {
      var out = [];
      edges.forEach(function (e) {
        var last = e.n.length - 2;
        if (e.n[0] === x && e.n[1] === y) out.push([e, 0, e.curve ? 2 : -1]);
        if (e.n[last] === x && e.n[last + 1] === y) out.push([e, last, e.curve ? 4 : -1]);
      });
      return out;
    };
    var shiftEnds = function (ends, x, y) {
      ends.forEach(function (end) {
        var e = end[0], i = end[1], c = end[2];
        if (c >= 0) { e.n[c] += x - e.n[i]; e.n[c + 1] += y - e.n[i + 1]; }
        e.n[i] = x; e.n[i + 1] = y;
        drawEdge(e);
      });
    };
    var labels = $$('.t-node text', tree), nodes = [];
    $$('.t-node > use', tree).forEach(function (u, i) {
      var w = wrapNode(u), ends = endsAt(w[1], w[2]), label = labels[i];
      nodes.push({ g: w[0], x: w[1], y: w[2], box: [62, 60, 498, 300], move: function (x, y, dx, dy) {
        shiftEnds(ends, x, y);
        label.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')');
      } });
    });
    $$('.t-micro use', tree).forEach(function (u) {
      var w = wrapNode(u), ends = endsAt(w[1], w[2]);
      nodes.push({ g: w[0], x: w[1], y: w[2], box: [12, 12, 548, 398], move: function (x, y) { shiftEnds(ends, x, y); } });
    });
    // The root carries the trunk's labels and tag. The trunk runs from the root to the branch junction,
    // and the trunk's Logos question keeps sprouting from the same share of the way along it.
    var base = wrapNode(tree.querySelector(':scope > use')), trunkEnds = endsAt(base[1], base[2]);
    var junction = trunkEnds[0][0].n.slice(2, 4), sprout = endsAt(280, 290);
    var along = (290 - junction[1]) / (base[2] - junction[1]);
    var baseText = $$(':scope > g:not(.t-micro):not(.t-node)', tree).filter(function (g) { return g.querySelector('text'); });
    nodes.push({ g: base[0], x: base[1], y: base[2], box: [74, 120, 382, 342], move: function (x, y, dx, dy) {
      shiftEnds(trunkEnds, x, y);
      shiftEnds(sprout, junction[0] + (x - junction[0]) * along, junction[1] + (y - junction[1]) * along);
      baseText.forEach(function (g) { g.setAttribute('transform', 'translate(' + dx + ' ' + dy + ')'); });
    } });
    playable(tree, nodes, function () { undash($$('.t-trunk,.t-branch', tree)); });
  }

  /* Chronology: a flagged row's chip glows once to the page it cites, which keeps a jade underline */
  $$('.timeline .tl-row').forEach(function (row) {
    var flag = row.querySelector('.flag');
    if (!flag) return;
    var cites = $$('.cite', row).filter(function (c) {
      return !c.closest('.link-line') && (c.compareDocumentPosition(flag) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    var cite = cites[cites.length - 1];
    if (!cite) return;
    if (!motion) { cite.classList.add('linked'); return; }
    onEnter(row, function () { glow(row, flag, cite); });
  });
  function glow(row, flag, cite) {
    var r = row.getBoundingClientRect(), f = flag.getBoundingClientRect(), c = cite.getBoundingClientRect();
    var x1 = f.left - r.left + Math.min(20, f.width / 2), y1 = f.top - r.top;
    var x2 = c.left - r.left + c.width / 2, y2 = c.bottom - r.top + 1;
    var dy = Math.max(12, y1 - y2);
    var NS = 'http://www.w3.org/2000/svg';
    var svg = doc.createElementNS(NS, 'svg'), path = doc.createElementNS(NS, 'path');
    svg.setAttribute('class', 'tl-glow'); svg.setAttribute('aria-hidden', 'true');
    path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + (y1 - dy * 0.6) + ' ' + x2 + ',' + (y2 + dy * 0.6) + ' ' + x2 + ',' + y2);
    svg.appendChild(path); row.appendChild(svg);
    var len = path.getTotalLength() + 1;
    path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
    svg.getBoundingClientRect();
    path.style.transition = 'stroke-dashoffset .42s ' + EASE;
    svg.style.transition = 'opacity .28s ease .42s';
    path.style.strokeDashoffset = 0; svg.style.opacity = 0;
    setTimeout(function () { cite.classList.add('linked'); }, 380);
    setTimeout(function () { svg.remove(); }, 760);
  }

  /* Method rail: steps light in order once. The line then fills to the step under the pointer;
     on touch screens it fills to the step at the middle of the viewport (or the one tapped, when the steps sit in a row). */
  var rail = doc.querySelector('.rail');
  if (rail) {
    if (!motion) rail.classList.add('in');
    else onEnter(rail, function () { rail.classList.add('in'); });
    var line = rail.querySelector('.rail-line'), progress = line.querySelector('span'), steps = $$('.steps li', rail);
    var row = window.matchMedia('(min-width: 1024px)'), canHover = window.matchMedia('(hover: hover)');
    var current = -1;
    var reach = function (i) {
      current = i;
      steps.forEach(function (li, k) { li.classList.toggle('lit', k <= i); li.classList.toggle('here', k === i); });
      if (i < 0) { progress.style.transform = ''; return; }
      // Fill from the first node's centre to step i's node centre.
      var L = line.getBoundingClientRect(), N = steps[i].querySelector('.node').getBoundingClientRect();
      var f = row.matches ? (N.left + N.width / 2 - L.left) / L.width : (N.top + N.height / 2 - L.top) / L.height;
      f = Math.max(0, Math.min(1, f));
      progress.style.transform = (row.matches ? 'scaleX(' : 'scaleY(') + f + ')';
    };
    steps.forEach(function (li, k) {
      li.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') reach(k); });
      li.addEventListener('click', function () { if (!canHover.matches && row.matches) reach(current === k ? -1 : k); });
    });
    rail.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') reach(-1); });
    // Scroll-driven fill, for touch screens with the steps stacked
    var ticking = false, follow = function () {
      ticking = false;
      if (canHover.matches || row.matches) return;
      var mid = window.innerHeight * 0.55, i = -1;
      steps.forEach(function (li, k) { if (li.querySelector('.node').getBoundingClientRect().top < mid) i = k; });
      if (i !== current) reach(i);
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(follow); } };
    if (hasIO) new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
      else window.removeEventListener('scroll', onScroll);
    }).observe(rail);
    // Stacked, the line ends at the last node's centre (offsets ignore the enter transform).
    var fit = function () {
      var last = steps[steps.length - 1];
      line.style.bottom = row.matches ? '' : rail.offsetHeight - last.offsetTop - last.querySelector('.node').offsetHeight / 2 + 'px';
    };
    fit();
    if (doc.fonts) doc.fonts.ready.then(fit);
    window.addEventListener('resize', function () { fit(); if (current >= 0) reach(current); });
    row.addEventListener('change', function () { fit(); reach(-1); onScroll(); });
  }

  /* Compliance release checks: each checkmark lights as its item enters */
  $$('.gate li').forEach(function (li) {
    if (!motion) li.classList.add('in');
    else onEnter(li, function () { li.classList.add('in'); });
  });

  /* JSON sample: the edge fade shows until it is scrolled to the end */
  $$('.json-scroll').forEach(function (wrap) {
    var pre = wrap.querySelector('.json');
    var check = function () { wrap.classList.toggle('at-end', pre.scrollLeft + pre.clientWidth >= pre.scrollWidth - 2); };
    pre.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  });

  /* Logos Assist example questions (illustrative content) */
  var qa = doc.getElementById('qa');
  if (qa) {
    var QA = [
      { q: "Does the record support headaches starting on the day of the collision?",
        a: '<p><b>Supported, with one inconsistent entry.</b></p><ol><li>For: emergency department, 2023-04-13, headache 7/10. <span class="cite">p. 12</span></li><li>For: neurology, 2023-06-10, post-traumatic headache. <span class="cite">p. 451</span></li><li>Against: physical therapy intake, 2023-05-02, "denies headache." <span class="cite">p. 388</span></li></ol><p class="silent">Silent: no primary care records from before the collision, so earlier headaches cannot be ruled out.</p>' },
      { q: "Is there evidence of loss of consciousness?",
        a: '<p><b>Partly. The accounts differ.</b></p><ol><li>For: neuropsychology, "LOC approx. 1 minute" by patient report. <span class="cite">p. 902</span></li><li>Uncertain: neurology, "possible brief LOC, patient unsure." <span class="cite">p. 451</span></li><li>Against: emergency department, "no LOC." <span class="cite">p. 12</span></li></ol><p class="silent">Silent: no paramedic record is in the file. Request EMS records to settle it.</p>' },
      { q: "Does the record show a pre-injury baseline?",
        a: '<p><b>Not established.</b></p><ol><li>For: dental records, 2021–2022, no head or neck findings. <span class="cite">pp. 1,402–1,418</span></li><li>Missing: intake forms name a primary care physician, but no records from that practice were produced.</li></ol><p class="silent">Next step: request five years of primary care records.</p>' }
    ];
    var chips = $$('.chip');
    var show = function (i) {
      qa.innerHTML = '<div class="q">' + QA[i].q + '</div><div class="a">' + QA[i].a + '<button class="addrep" type="button">Add to report</button></div>';
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(+c.dataset.q === i)); });
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { show(+c.dataset.q); }); });
    qa.addEventListener('click', function (e) {
      var b = e.target.closest('.addrep');
      if (!b) return;
      b.textContent = 'Added to report, citations kept'; b.classList.add('done'); b.disabled = true;
    });
    show(0);
  }

  /* Demo request form (Formspree) */
  var form = doc.getElementById('demoForm');
  if (form) {
    var status = form.querySelector('.form-status'), submit = form.querySelector('button[type="submit"]');
    var fill = function () {
      if (new URLSearchParams(location.search).get('role') === 'platform') form.elements.role.value = 'ADR or claims platform';
      form.elements.page.value = location.pathname;
    };
    var CHECKS = {
      name: function (el) { return el.value.trim() ? '' : 'Please enter your name.'; },
      email: function (el) {
        if (!el.value.trim()) return 'Please enter your email address.';
        return el.validity.typeMismatch ? 'Please enter a valid email address, such as name@example.com.' : '';
      }
    };
    var tried = false;
    var validate = function (el) {
      var msg = CHECKS[el.name](el), err = doc.getElementById(el.id + '-err');
      el.setAttribute('aria-invalid', String(!!msg));
      err.textContent = msg; err.hidden = !msg;
      return !msg;
    };
    var setStatus = function (text, kind) { status.textContent = text; status.className = 'form-status' + (kind ? ' ' + kind : ''); };
    fill();
    Object.keys(CHECKS).forEach(function (n) {
      form.elements[n].addEventListener('input', function () { if (tried) validate(form.elements[n]); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var bad = Object.keys(CHECKS).map(function (n) { return form.elements[n]; }).filter(function (el) { return !validate(el); });
      if (bad.length) { setStatus('', ''); bad[0].focus(); return; }
      submit.disabled = true; form.setAttribute('aria-busy', 'true');
      setStatus('Sending…', '');
      fetch(FORMSPREE.demo, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset(); fill(); tried = false;
          setStatus('Thanks. We received your request and will reply by email.', 'sent');
        })
        .catch(function () {
          setStatus('Something went wrong. Please try again, or email us at info@incindra.net.', 'err');
        })
        .then(function () { submit.disabled = false; form.removeAttribute('aria-busy'); });
    });
  }
})();
