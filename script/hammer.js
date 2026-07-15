// Tilt interaction for the 3D striker towers
  function bindTilt(stageId, tiltId){
    const stage = document.getElementById(stageId);
    const tilt = document.getElementById(tiltId);
    if(!stage || !tilt) return;
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      tilt.style.transform = `rotateY(${-14 + x * 26}deg) rotateX(${6 - y * 14}deg)`;
    });
    stage.addEventListener('mouseleave', () => {
      tilt.style.transform = 'rotateY(-14deg) rotateX(6deg)';
    });
  }
  bindTilt('heroStage', 'heroTilt');
  bindTilt('liveStage', 'liveTilt');

  // Count a number up to a target value over a duration
  function animateCount(el, target, duration){
    const startTime = performance.now();
    function step(now){
      const p = Math.min((now - startTime) / duration, 1);
      el.textContent = String(Math.floor(p * target)).padStart(3, '0');
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = String(target).padStart(3, '0');
    }
    requestAnimationFrame(step);
  }

  function tierFor(score){
    if(score >= 950) return 'LEGENDARY! Bell rung!';
    if(score >= 800) return 'Hercules';
    if(score >= 600) return 'Powerhouse';
    if(score >= 400) return 'Strong';
    if(score >= 200) return 'Getting there';
    return 'Weakling';
  }

  // ---- Joyful sparkle burst: sprays a shower of glowing dots and stars
  // outward from the impact point, biased upward so it reads as a
  // celebratory "spray" rather than a plain radial explosion.
  const SPARKLE_COLORS = ['#ff0f8a', '#55d6e8', '#ffd76a', '#ffffff'];

  function spawnSparkles(id, intensity){
    const field = document.getElementById(id + 'Sparkles');
    if(!field) return;
    const count = 16 + Math.round(intensity * 22);

    for(let i = 0; i < count; i++){
      const el = document.createElement('div');
      const isStar = Math.random() < 0.32;
      el.className = 'sparkle' + (isStar ? ' is-star' : '');

      // Bias the spray upward and outward, like confetti popping off the pad
      const angle = (Math.random() * Math.PI) - (Math.PI * 1.5); // upper hemisphere-ish
      const dist = 50 + Math.random() * (80 + intensity * 90);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 20;
      const midX = dx * 0.35 + (Math.random() * 20 - 10);
      const midY = dy * 0.55 - 18;

      el.style.setProperty('--dx', dx.toFixed(1) + 'px');
      el.style.setProperty('--dy', dy.toFixed(1) + 'px');
      el.style.setProperty('--mx', midX.toFixed(1) + 'px');
      el.style.setProperty('--my', midY.toFixed(1) + 'px');

      const size = 5 + Math.random() * 6;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      el.style.background = color;
      el.style.boxShadow = `0 0 8px ${color}, 0 0 2px #fff`;
      el.style.animationDelay = (Math.random() * 0.05) + 's';

      field.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  }

  // Real click-to-swing hammer game: swing -> impact -> sparkle spray ->
  // puck launches -> score counts up -> reset
  function swingHammer(id){
    const hammer = document.getElementById(id + 'Hammer');
    if(!hammer || hammer.dataset.busy === '1') return;
    hammer.dataset.busy = '1';
    hammer.classList.add('swing');

    const pole = document.getElementById(id + 'Pole');
    const flash = document.getElementById(id + 'Impact');
    const puck = document.getElementById(id + 'Puck');
    const bell = document.getElementById(id + 'Bell');
    const scoreEl = document.getElementById(id + 'Score');
    const tierEl = document.getElementById(id + 'Tier');
    const segs = pole.querySelectorAll('.scale-seg');

    // Moment of impact, timed to the swing keyframes (~55% of 700ms)
    setTimeout(() => {
      const score = Math.floor(Math.random() * 901) + 100; // 100-1000
      const intensity = score / 1000;

      flash.classList.add('hit');
      pole.classList.add('shake');
      spawnSparkles(id, intensity);

      const towerTravel = 280; // px of usable tower height
      const targetBottom = 10 + intensity * towerTravel;

      puck.style.transition = 'bottom .5s cubic-bezier(.22,.8,.3,1.35)';
      puck.style.bottom = targetBottom + 'px';

      const litCount = Math.round(intensity * segs.length);
      segs.forEach((seg, i) => {
        setTimeout(() => {
          if(i < litCount) seg.classList.add('lit');
          else seg.classList.remove('lit');
        }, i * 20);
      });

      animateCount(scoreEl, score, 500);
      tierEl.textContent = tierFor(score);

      if(score >= 950){
        bell.classList.add('ring');
        spawnSparkles(id, 1.4); // extra joyful burst for a bell-ringer
        setTimeout(() => bell.classList.remove('ring'), 650);
      }

      setTimeout(() => {
        flash.classList.remove('hit');
        pole.classList.remove('shake');
      }, 350);

      // Puck falls back down under gravity after a beat at the peak
      setTimeout(() => {
        puck.style.transition = 'bottom .6s ease-in';
        puck.style.bottom = '10px';
        segs.forEach(seg => seg.classList.remove('lit'));
      }, 1000);

    }, 385);

    setTimeout(() => {
      hammer.classList.remove('swing');
      hammer.dataset.busy = '0';
    }, 700);
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });