// Lightweight HTML partial include + simple dropdown handling
(function () {
  async function includePartials() {
    const nodes = document.querySelectorAll('[data-include]');
    for (const node of nodes) {
      const src = node.getAttribute('data-include');
      if (!src) continue;
      try {
        const res = await fetch(src, { cache: 'no-cache' });
        const html = await res.text();
        node.innerHTML = html;
      } catch (e) {
        console.error('Include failed:', src, e);
      }
    }
    // After injection, bind dropdowns
    bindDropdowns();
  }

  function bindDropdowns() {
    document.querySelectorAll('[data-dropdown-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const menu = btn.parentElement?.querySelector('.dropdown-menu');
        if (!menu) return;
        menu.classList.toggle('open');
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.dropdown-menu.open').forEach(menu => {
        if (!menu.contains(e.target) && !menu.previousElementSibling?.contains(e.target)) {
          menu.classList.remove('open');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', includePartials);
  } else {
    includePartials();
  }
})();

