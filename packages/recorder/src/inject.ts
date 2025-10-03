(() => {
  console.log('HT_READY');
  const H = {
    border: document.createElement('div'),
    toast: document.createElement('div'),
    bar: document.createElement('div'),
    btnCap: document.createElement('button'),
    btnOff: document.createElement('button'),
    on: true,
    lastEl: null as Element | null,
    dataTestAttrs: ['data-testid','data-test','data-test-id','data-qa','data-qa-id']
  };

  // Styles
  Object.assign(H.border.style, {
    position: 'fixed', zIndex: '2147483647', pointerEvents: 'none',
    border: '2px solid #32a852', borderRadius: '4px', background: 'rgba(50,168,82,0.08)'
  });
  Object.assign(H.toast.style, {
    position: 'fixed', left: '12px', bottom: '56px', zIndex: '2147483647',
    background: '#111', color: '#fff', padding: '8px 10px', borderRadius: '8px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
    fontSize: '12px', maxWidth: '60vw', boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
  });
  Object.assign(H.bar.style, {
    position: 'fixed', left: '12px', bottom: '12px', zIndex: '2147483647',
    background: '#fff', color: '#111', padding: '6px', borderRadius: '8px',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto',
    fontSize: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.2)', display: 'flex', gap: '6px'
  });
  Object.assign(H.btnCap.style, { cursor: 'pointer' });
  Object.assign(H.btnOff.style, { cursor: 'pointer' });

  H.toast.textContent = 'Hover an element; press Capture or Alt+C.';
  H.btnCap.textContent = 'Capture (Alt+C)';
  H.btnOff.textContent = 'Hide (Alt+X)';

  // Prevent toolbar clicks from reaching the page
  H.bar.addEventListener('click', e => e.stopPropagation(), true);
  H.bar.addEventListener('pointerdown', e => e.stopPropagation(), true);
  H.bar.addEventListener('mousedown', e => e.stopPropagation(), true);

  H.bar.appendChild(H.btnCap);
  H.bar.appendChild(H.btnOff);
  document.body.appendChild(H.toast);
  document.body.appendChild(H.bar);

  function rect(el: Element) {
    const r = el.getBoundingClientRect();
    Object.assign(H.border.style, { left: r.left+'px', top: r.top+'px', width: r.width+'px', height: r.height+'px' });
    if (!H.border.parentElement) document.body.appendChild(H.border);
  }

  function visibleText(el: Element): string {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const parts: string[] = [];
    while (w.nextNode()) {
      const t = w.currentNode.textContent?.trim();
      if (t) parts.push(t);
    }
    return parts.join(' ').replace(/\s+/g,' ').trim();
  }

  function ariaRole(el: Element): string | null {
    const explicit = el.getAttribute('role'); if (explicit) return explicit;
    const tag = el.tagName.toLowerCase();
    if (tag === 'button') return 'button';
    if (tag === 'a' && (el as HTMLAnchorElement).href) return 'link';
    if (tag === 'input') return 'textbox';
    if (tag === 'img') return 'img';
    return null;
  }
  function ariaName(el: Element): string | null {
    const aria = el.getAttribute('aria-label'); if (aria) return aria.trim();
    const id = (el as HTMLElement).id;
    if (id) {
      const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`); if (lab) return visibleText(lab);
    }
    const title = el.getAttribute('title'); if (title) return title.trim();
    const txt = visibleText(el); if (txt) return txt;
    return null;
  }
  function byLabel(el: Element): string | null {
    const id = (el as HTMLElement).id;
    if (id) {
      const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (lab) return visibleText(lab);
    }
    const lab = el.closest('label');
    if (lab) return visibleText(lab);
    return null;
  }
  function findDataTest(el: Element): { attr: string, value: string } | null {
    for (const a of H.dataTestAttrs) {
      const v = el.getAttribute(a);
      if (v) return { attr: a, value: v };
    }
    return null;
  }
  function domAnchor(el: Element): string[] {
    function piece(e: Element): string {
      const id = (e as HTMLElement).id;
      if (id) return `${e.tagName.toLowerCase()}#${id}`;
      const cls = (e as HTMLElement).className?.toString().trim().split(/\s+/).filter(Boolean).slice(0,2).join('.');
      if (cls) return `${e.tagName.toLowerCase()}.${cls}`;
      return e.tagName.toLowerCase();
    }
    const chain: string[] = [piece(el)]; let cur = el.parentElement;
    for (let i=0;i<3 && cur;i++){ chain.unshift(piece(cur)); cur = cur.parentElement; }
    return chain;
  }
  function propose(el: Element) {
    const dt = findDataTest(el);
    if (dt) return { target: { dataTest: dt.value } };
    const role = ariaRole(el); const name = ariaName(el);
    if (role && name) return { target: { role, name } };
    if (role) return { target: { role } };
    const label = byLabel(el); if (label) return { target: { label } };
    const text = visibleText(el); if (text) return { target: { text } };
    return { target: { domAnchor: domAnchor(el) } };
  }
  function deliver(target: any) {
    try { (window as any).__hypertest_rec?.(target); } catch {}
    try { console.log(`HT_REC ${JSON.stringify(target)}`); } catch {}
    H.toast.textContent = `Captured: ${JSON.stringify(target)}`;
    setTimeout(() => H.toast.textContent = 'Hover an element; press Capture or Alt+C.', 1200);
  }

  // Track current hovered element
  window.addEventListener('mousemove', e => {
    if (!H.on) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el) { H.lastEl = el; rect(el); }
  }, true);

  function captureCurrent() {
    const el = H.lastEl || document.body;
    const p = propose(el);
    deliver(p.target);
  }

  // Toolbar buttons
  H.btnCap.onclick = (e) => { e.stopPropagation(); captureCurrent(); };
  H.btnOff.onclick = (e) => {
    e.stopPropagation();
    H.on = false; H.border.remove(); H.toast.remove(); H.bar.remove();
  };

  // Hotkeys
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'c') { captureCurrent(); }
    if (e.altKey && e.key.toLowerCase() === 'x') {
      H.on = false; H.border.remove(); H.toast.remove(); H.bar.remove();
    }
  }, true);
})();
