(function () {
  'use strict';

  var BUSINESS_NUMBER = '393483470654';
  var WA_CONSULT_URL =
    'https://wa.me/' + BUSINESS_NUMBER + '?text=' +
    encodeURIComponent('Ciao, vorrei una consulenza gratuita per Club Digitale.');

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Images load + error fallback
  document.querySelectorAll('.img-luxury, .bento-bg-img').forEach(function (img) {
    function markLoaded() { img.classList.add('loaded'); }
    function markError() {
      img.classList.add('img-error');
      img.alt = img.alt || 'Immagine non disponibile';
    }
    if (img.complete) {
      if (img.naturalWidth > 0) markLoaded();
      else markError();
    } else {
      img.addEventListener('load', markLoaded);
      img.addEventListener('error', markError);
    }
  });

  // Contact form → WhatsApp
  window.handleSubmit = function (e) {
    e.preventDefault();
    var nome = document.getElementById('nome').value.trim();
    var salotto = document.getElementById('salotto').value.trim();
    var citta = document.getElementById('citta').value.trim();
    var whatsapp = document.getElementById('whatsapp').value.trim();
    var msg = encodeURIComponent(
      'Richiesta Accesso Riservato — Club Digitale\n\n' +
      'Nome: ' + nome + '\n' +
      'Salotto/Club: ' + salotto + '\n' +
      'Città: ' + citta + '\n' +
      'WhatsApp: ' + whatsapp
    );
    window.open('https://wa.me/' + BUSINESS_NUMBER + '?text=' + msg, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp floating widget
  (function initWaWidget() {
    var widget = document.getElementById('wa-widget');
    var fab = document.getElementById('wa-fab');
    var minimizeBtn = document.getElementById('wa-minimize');
    var dragHandle = document.getElementById('wa-drag-handle');
    if (!widget || !fab) return;

    var POS_KEY = 'clubDigitaleWaPos';
    var MIN_KEY = 'clubDigitaleWaMin';
    var dragging = false;
    var moved = false;
    var dragMoved = false;
    var offsetX = 0;
    var offsetY = 0;

    try {
      if (localStorage.getItem(MIN_KEY) === '1') widget.classList.add('wa-widget--minimized');
      var saved = localStorage.getItem(POS_KEY);
      if (saved) {
        var pos = JSON.parse(saved);
        widget.style.left = pos.x + 'px';
        widget.style.top = pos.y + 'px';
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
      }
    } catch (_) { /* ignore */ }

    minimizeBtn && minimizeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      widget.classList.add('wa-widget--minimized');
      try { localStorage.setItem(MIN_KEY, '1'); } catch (_) {}
    });

    fab.addEventListener('click', function () {
      if (dragMoved) { dragMoved = false; return; }
      if (widget.classList.contains('wa-widget--minimized')) {
        widget.classList.remove('wa-widget--minimized');
        try { localStorage.setItem(MIN_KEY, '0'); } catch (_) {}
        return;
      }
      window.open(WA_CONSULT_URL, '_blank', 'noopener,noreferrer');
    });

    function onPointerDown(e) {
      if (e.target.closest('.wa-widget-min') || e.target.closest('.wa-widget-cta')) return;
      dragging = true;
      moved = false;
      dragMoved = false;
      widget.classList.add('is-dragging');
      var rect = widget.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      widget.style.left = rect.left + 'px';
      widget.style.top = rect.top + 'px';
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
      if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      moved = true;
      dragMoved = true;
      var x = Math.min(Math.max(8, e.clientX - offsetX), window.innerWidth - widget.offsetWidth - 8);
      var y = Math.min(Math.max(8, e.clientY - offsetY), window.innerHeight - widget.offsetHeight - 8);
      widget.style.left = x + 'px';
      widget.style.top = y + 'px';
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      widget.classList.remove('is-dragging');
      if (moved) {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify({
            x: parseInt(widget.style.left, 10),
            y: parseInt(widget.style.top, 10),
          }));
        } catch (_) {}
      }
    }

    [fab, dragHandle].forEach(function (el) {
      if (el) el.addEventListener('pointerdown', onPointerDown);
    });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  })();
})();
