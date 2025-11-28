// Small font switcher to test alternative heading fonts in the site.
// It adds a compact control to the bottom-right and persists user choice to localStorage.

(function () {
  const root = document.documentElement;
  const LSKEY = 'dotring-font-choice';
  const container = document.createElement('div');
  container.id = 'dotring-font-switcher';
  container.style.position = 'fixed';
  container.style.bottom = '12px';
  container.style.right = '12px';
  container.style.zIndex = '9999';
  container.style.fontFamily = 'Inter, system-ui, sans-serif';
  container.style.fontSize = '0.8rem';
  container.style.background = 'rgba(255,255,255,0.92)';
  container.style.borderRadius = '10px';
  container.style.padding = '6px 8px';
  container.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
  container.style.display = 'flex';
  container.style.gap = '6px';
  container.style.alignItems = 'center';
  container.style.backdropFilter = 'blur(4px)';

  const label = document.createElement('label');
  label.textContent = 'Fonts:';
  label.style.marginRight = '6px';
  label.style.color = '#121212';
  container.appendChild(label);

  const createBtn = (id, text) => {
    const btn = document.createElement('button');
    btn.className = 'font-switch-btn';
    btn.dataset.font = id;
    btn.textContent = text;
    btn.style.border = 'none';
    btn.style.background = 'transparent';
    btn.style.padding = '6px 8px';
    btn.style.cursor = 'pointer';
    btn.style.borderRadius = '6px';
    btn.style.fontWeight = '600';
    btn.style.color = '#121212';
    btn.style.opacity = '0.88';
    btn.onmouseenter = () => btn.style.opacity = '1';
    btn.onmouseleave = () => btn.style.opacity = '0.88';
    return btn;
  };

  const p = createBtn('poppins', 'Poppins');
  const s = createBtn('sora', 'Sora');
  const g = createBtn('space', 'Space');
  container.appendChild(p);
  container.appendChild(s);
  container.appendChild(g);

  function applyFontChoice(choice) {
    // Remove any font-* classes, then add the new one
    root.classList.remove('font-poppins', 'font-sora', 'font-space');
    if (choice) root.classList.add('font-' + choice);
    localStorage.setItem(LSKEY, choice);
    // Highlight selected button
    const btns = container.querySelectorAll('.font-switch-btn');
    btns.forEach(b => b.style.boxShadow = 'none');
    const sel = container.querySelector('.font-switch-btn[data-font="' + choice + '"]');
    if (sel) sel.style.boxShadow = 'inset 0 0 0 2px rgba(230,0,122,0.12)';
  }

  p.onclick = () => applyFontChoice('poppins');
  s.onclick = () => applyFontChoice('sora');
  g.onclick = () => applyFontChoice('space');

  // Read existing choice and apply
  const existing = localStorage.getItem(LSKEY) || 'poppins';
  applyFontChoice(existing);

  document.body.appendChild(container);
})();
