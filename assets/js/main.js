/* =========================================================================
   小脚本，只做三件事：
   1) 主题切换（记住用户选择）
   2) 目录高亮当前所在区块
   3) 页脚年份自动更新
   不依赖任何库。
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'theme';
  var toggle = document.getElementById('theme-toggle');
  var mq = window.matchMedia('(prefers-color-scheme: dark)');

  function readStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (toggle) toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  /* 没有手动选择时跟随系统（head 里的内联脚本已处理过已保存的值） */
  if (!root.dataset.theme) {
    applyTheme(mq.matches ? 'dark' : 'light');
  } else if (toggle) {
    toggle.setAttribute('aria-pressed', root.dataset.theme === 'dark' ? 'true' : 'false');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
    });
  }

  /* 系统主题变化时跟随（仅在用户没有手动选过时） */
  if (mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      if (!readStored()) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  /* ---- 目录高亮 -------------------------------------------------------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.profile__nav a[href^="#"]')
  );

  var targets = links
    .map(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = id ? document.getElementById(id) : null;
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  if (targets.length) {
    var ticking = false;

    function updateActive() {
      ticking = false;
      var line = window.scrollY + 140;
      var current = null;

      targets.forEach(function (t) {
        if (t.el.offsetTop <= line) current = t;
      });

      /* 页面能滚动且已滚到底部时，高亮最后一节 */
      var scrollable = document.documentElement.scrollHeight - window.innerHeight > 80;
      if (scrollable && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = targets[targets.length - 1];
      }

      targets.forEach(function (t) {
        if (t === current) {
          t.link.setAttribute('aria-current', 'true');
        } else {
          t.link.removeAttribute('aria-current');
        }
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActive);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateActive();
  }

  /* ---- 页脚年份 -------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
