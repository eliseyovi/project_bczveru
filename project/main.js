window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  if (!intro) return;

  const visibleTime = 4000;
  const fadeDuration = 2000;

  setTimeout(() => {
    intro.classList.add('hidden');
    setTimeout(() => {
      if (intro.parentNode) {
        intro.parentNode.removeChild(intro);
      }
    }, fadeDuration);
  }, visibleTime);
});


document.addEventListener("DOMContentLoaded", () => {

  /* ===== HAMBURGER MENU ===== */
  const burgerBtn = document.getElementById('burgerBtn');
  const mainNav = document.getElementById('mainNav');

  // Создаём overlay
  const navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  document.body.appendChild(navOverlay);

  function openMenu() {
    burgerBtn.classList.add('open');
    mainNav.classList.add('open');
    navOverlay.classList.add('visible');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    burgerBtn.classList.remove('open');
    mainNav.classList.remove('open');
    navOverlay.classList.remove('visible');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burgerBtn?.addEventListener('click', () => {
    const isOpen = mainNav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  navOverlay.addEventListener('click', closeMenu);

  // Закрываем меню при клике на ссылку
  mainNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Закрываем по Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ===== REVEAL ===== */
  function handleReveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight - 100;
      if (isVisible) {
        element.classList.add('visible');
      }
    });
  }

  handleReveal();
  window.addEventListener('scroll', handleReveal, { passive: true });

  /* ===== SCROLL TO TOP ===== */
  const scrollToTopBtn = document.getElementById('scrollToTop');

  function handleScrollButton() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add('visible');
    } else {
      scrollToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScrollButton, { passive: true });

  scrollToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ===== CAROUSEL ===== */
  function encodeSrc(src) {
    try {
      return encodeURI(src);
    } catch (e) {
      return src;
    }
  }

  function initCarousel(carouselEl) {
    const slides = Array.from(carouselEl.querySelectorAll('.slides > *'));
    if (!slides.length) return;

    let currentIndex = 0;
    const prevBtn = carouselEl.querySelector('.prev');
    const nextBtn = carouselEl.querySelector('.next');

    function loadMedia(element) {
      const dataSrc = element.dataset?.src;
      if (dataSrc && !element.getAttribute('src')) {
        element.setAttribute('src', encodeSrc(dataSrc));
        try {
          if (element.load) element.load();
        } catch (e) {
          console.error('Error loading media:', e);
        }
      }
    }

    function showSlide(index) {
      slides.forEach((slide, i) => {
        const isActive = i === index;
        slide.classList.toggle('active', isActive);
        if (isActive) {
          loadMedia(slide);
        } else {
          if (slide.tagName.toLowerCase() === 'video') {
            try { slide.pause(); } catch (e) {}
            if (slide.getAttribute('src')) {
              slide.removeAttribute('src');
              try { if (slide.load) slide.load(); } catch (e) {}
            }
          }
        }
      });
    }

    if (slides[0]) {
      const firstSlide = slides[0];
      if (firstSlide.tagName.toLowerCase() === 'video') {
        loadMedia(firstSlide);
      }
    }

    showSlide(currentIndex);

    nextBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });

    prevBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });
  }

  document.querySelectorAll('.carousel').forEach(initCarousel);

  /* ===== LAZY LOAD MEDIA ===== */
  const lazyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const mediaElements = entry.target.querySelectorAll('img[data-src], video[data-src]');
      mediaElements.forEach(media => {
        if (!media.getAttribute('src') && media.dataset.src) {
          media.setAttribute('src', encodeSrc(media.dataset.src));
          try { if (media.load) media.load(); } catch (e) {}
        }
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  ['#highlights', '#history', '#training', '#victories'].forEach(selector => {
    const element = document.querySelector(selector);
    if (element) lazyObserver.observe(element);
  });

  /* ===== PLAYER MODAL ===== */
  (function initPlayerModal() {
    const modal = document.getElementById('playerModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close');
    const playerPhoto = document.getElementById('playerPhoto');
    const playerPhotoPlaceholder = document.getElementById('playerPhotoPlaceholder');
    const playerName = document.getElementById('playerName');
    const playerInfoGrid = document.getElementById('playerInfoGrid');
    const playerStatsGrid = document.getElementById('playerStatsGrid');
    const tabs = modal.querySelectorAll('.modal-tab');
    const tabContents = modal.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
      });
    });

    function openModal(data) {
      if (playerName) playerName.textContent = data.name || '—';

      if (data.photo && data.photo.trim() !== '') {
        if (playerPhoto) {
          playerPhoto.src = data.photo;
          playerPhoto.classList.add('show');
          playerPhoto.onerror = () => {
            playerPhoto.classList.remove('show');
            if (playerPhotoPlaceholder) playerPhotoPlaceholder.classList.remove('hide');
          };
        }
        if (playerPhotoPlaceholder) playerPhotoPlaceholder.classList.add('hide');
      } else {
        if (playerPhoto) { playerPhoto.classList.remove('show'); playerPhoto.src = ''; }
        if (playerPhotoPlaceholder) playerPhotoPlaceholder.classList.remove('hide');
      }

      tabs.forEach((t, i) => t.classList.toggle('active', i === 0));
      tabContents.forEach((tc, i) => tc.classList.toggle('active', i === 0));

      if (playerInfoGrid) {
        playerInfoGrid.innerHTML = '';
        if (data.type === 'coach') {
          playerInfoGrid.innerHTML = `
            <div class="info-item">
              <div class="info-icon">🎓</div>
              <div class="info-content">
                <span class="info-label">Должность</span>
                <span class="info-value">Тренер</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">🎂</div>
              <div class="info-content">
                <span class="info-label">Дата рождения</span>
                <span class="info-value">${data.birth || '—'}</span>
              </div>
            </div>
          `;
          tabs[1].style.display = 'none';
        } else {
          playerInfoGrid.innerHTML = `
            <div class="info-item">
              <div class="info-icon">📏</div>
              <div class="info-content">
                <span class="info-label">Рост</span>
                <span class="info-value">${data.height || '—'}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">⚖️</div>
              <div class="info-content">
                <span class="info-label">Вес</span>
                <span class="info-value">${data.weight || '—'}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">🎂</div>
              <div class="info-content">
                <span class="info-label">Дата рождения</span>
                <span class="info-value">${data.birth || '—'}</span>
              </div>
            </div>
          `;
          tabs[1].style.display = 'block';
          if (playerStatsGrid && data.stats) {
            playerStatsGrid.innerHTML = `
              <div class="stat-item">
                <div class="stat-item-icon">🎯</div>
                <div class="stat-item-value">${data.stats.points}</div>
                <div class="stat-item-label">Очки</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-icon">🏀</div>
                <div class="stat-item-value">${data.stats.rebounds}</div>
                <div class="stat-item-label">Подборы</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-icon">🤝</div>
                <div class="stat-item-value">${data.stats.assists}</div>
                <div class="stat-item-label">Передачи</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-icon">✋</div>
                <div class="stat-item-value">${data.stats.steals}</div>
                <div class="stat-item-label">Перехваты</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-icon">❌</div>
                <div class="stat-item-value">${data.stats.turnovers}</div>
                <div class="stat-item-label">Потери</div>
              </div>
              <div class="stat-item">
                <div class="stat-item-icon">⚠️</div>
                <div class="stat-item-value">${data.stats.fouls}</div>
                <div class="stat-item-label">Фолы</div>
              </div>
            `;
          }
        }
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    const playerRows = document.querySelectorAll('.player-row, .coach-row');
    playerRows.forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        let stats = null;
        try {
          stats = row.dataset.stats ? JSON.parse(row.dataset.stats) : null;
        } catch (e) {
          console.error('Error parsing stats:', e);
        }
        const data = {
          name: row.dataset.name || row.cells?.[0]?.textContent?.trim() || '—',
          height: row.dataset.height || '—',
          weight: row.dataset.weight || '—',
          birth: row.dataset.birth || '—',
          photo: row.dataset.photo || '',
          type: row.dataset.type || 'player',
          stats: stats
        };
        openModal(data);
      });
    });

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-backdrop')) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  })();

  /* ===== STATS ANIMATION ===== */
  function animateStats() {
    const statNumbers = document.querySelectorAll(".num");
    statNumbers.forEach(numElement => {
      const rawValue = numElement.getAttribute('data-target') || numElement.textContent.trim();
      const targetValue = parseFloat(rawValue.toString().replace(',', '.'));
      if (isNaN(targetValue)) return;

      numElement.textContent = "0";
      numElement.classList.remove("visible");

      const duration = 2000;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = targetValue * eased;
        numElement.textContent = currentValue.toFixed(1);
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          numElement.textContent = targetValue.toFixed(1);
          numElement.classList.add("visible");
        }
      }

      setTimeout(() => requestAnimationFrame(updateNumber), 200);
    });

    const statBars = document.querySelectorAll('.stat-bar-fill');
    statBars.forEach((bar, index) => {
      setTimeout(() => { bar.style.transform = 'scaleX(1)'; }, index * 200);
    });
  }

  let statsAnimated = false;
  const statsSection = document.getElementById("stats");
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          animateStats();
          statsAnimated = true;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  /* ===== VICTORIES ANIMATION ===== */
  (function initVictoriesAnimation() {
    const section = document.querySelector("#victories");
    if (!section) return;
    const cards = Array.from(section.querySelectorAll(".victory-card"));

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('visible');
            const numElement = card.querySelector('.victory-num');
            animateVictoryNumber(numElement);
            const sparkles = card.querySelectorAll('.card-sparkles span');
            sparkles.forEach((sparkle, i) => {
              setTimeout(() => {
                sparkle.style.opacity = '1';
                sparkle.style.transform = 'translateY(0) scale(1)';
              }, i * 150);
            });
          }, index * 250);
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    observer.observe(section);

    function animateVictoryNumber(element) {
      if (!element) return;
      const rawValue = element.getAttribute('data-target') || element.textContent.trim();
      const targetValue = parseInt(String(rawValue).replace(/\D/g, ''), 10);
      if (isNaN(targetValue) || targetValue <= 0) { element.textContent = rawValue || '0'; return; }

      const duration = 1500;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(targetValue * eased);
        element.textContent = String(currentValue);
        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          element.textContent = String(targetValue);
          element.classList.add('pop');
          setTimeout(() => element.classList.remove('pop'), 400);
        }
      }

      element.textContent = '0';
      requestAnimationFrame(updateNumber);
    }
  })();

  /* ===== SMOOTH SCROLL ===== */
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  /* ===== LOGO SCROLL TO TOP ===== */
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ===== VIDEO OVERLAY ===== */
  const videoOverlays = document.querySelectorAll('.video-overlay');
  videoOverlays.forEach(overlay => {
    overlay.addEventListener('click', function() {
      const video = this.nextElementSibling;
      if (video && video.tagName === 'VIDEO') {
        video.play();
        this.style.opacity = '0';
        this.style.pointerEvents = 'none';
      }
    });
  });

  console.log('✓ БК "Звери" - Сайт загружен успешно! 🏀');
  console.log('✓ Все анимации активированы');
  console.log('✓ Приятного просмотра!');
});