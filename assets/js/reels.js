(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function playReel(video) {
    if (!video || prefersReducedMotion) return;
    video.muted = true;
    video.playsInline = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () {
        video.dataset.needsInteraction = '1';
      });
    }
  }

  function pauseReel(video) {
    if (!video) return;
    video.pause();
  }

  function initReels() {
    document.querySelectorAll('.reel-video').forEach(function (video) {
      if (video.complete || video.readyState >= 2) {
        video.classList.add('reel-ready');
      }
      video.addEventListener('loadeddata', function () {
        video.classList.add('reel-ready');
      });
      video.addEventListener('error', function () {
        var wrap = video.closest('.reel-wrap');
        if (wrap) wrap.classList.add('reel-fallback');
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target.querySelector('.reel-video');
          if (!video) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            playReel(video);
          } else {
            pauseReel(video);
          }
        });
      },
      { threshold: [0, 0.35, 0.6], rootMargin: '0px 0px -5% 0px' }
    );

    document.querySelectorAll('.reel-wrap').forEach(function (wrap) {
      observer.observe(wrap);
      var video = wrap.querySelector('.reel-video');
      var btn = wrap.querySelector('.reel-mute-btn');
      if (btn && video) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          video.muted = !video.muted;
          btn.setAttribute('aria-pressed', video.muted ? 'true' : 'false');
          btn.textContent = video.muted ? '🔇' : '🔊';
          if (video.paused) playReel(video);
        });
      }
      wrap.addEventListener('click', function () {
        if (!video) return;
        if (video.dataset.needsInteraction === '1' || video.paused) {
          playReel(video);
          video.dataset.needsInteraction = '0';
        }
      });
    });

    document.addEventListener('visibilitychange', function () {
      document.querySelectorAll('.reel-video').forEach(function (video) {
        if (document.hidden) pauseReel(video);
        else {
          var wrap = video.closest('.reel-wrap');
          if (!wrap) return;
          var rect = wrap.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.85 && rect.bottom > window.innerHeight * 0.15) {
            playReel(video);
          }
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReels);
  } else {
    initReels();
  }
})();
