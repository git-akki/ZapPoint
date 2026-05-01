<script setup>
// Landing — Apple product-page sensibility:
//   single column, generous whitespace, hero type that breathes,
//   one frosted product card centered below the fold,
//   features as quiet pull-quotes (not boxes), no decorative orbs.
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'

const router = useRouter()
const isAuthed = computed(() => !!localStorage.getItem('authToken'))
const goCta = () => router.push(isAuthed.value ? '/dashboard' : '/register')

const stationCount = ref(0)
onMounted(() => {
  const target = 1247
  const start = performance.now()
  const dur = 1400
  const tick = (now) => {
    const t = Math.min(1, (now - start) / dur)
    stationCount.value = Math.round(target * (1 - Math.pow(1 - t, 3)))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

const features = [
  { kicker: 'Find', title: 'Live charger map', desc: 'Every active station, pinned with power output, connector type and current status.' },
  { kicker: 'Add', title: 'Crowd-sourced coverage', desc: 'Drop a pin in seconds. No moderation queue — the community keeps the map honest.' },
  { kicker: 'Assist', title: 'Emergency routing', desc: 'Out of charge? One tap routes the nearest compatible station to your coordinates.' },
  { kicker: 'Open', title: 'Built for India', desc: 'Type1, Type2, CCS, CHAdeMO, Tesla. Optimised for tier-2 city coverage.' },
]
</script>

<template>
  <div class="landing">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <span class="kicker zp-rise" style="animation-delay: 50ms">
          <span class="dot" aria-hidden="true"></span>
          {{ stationCount.toLocaleString() }}+ chargers, community-mapped
        </span>

        <h1 class="hero-title zp-rise" style="animation-delay: 150ms">
          Every EV charger,<br />
          <span class="grad">on one map.</span>
        </h1>

        <p class="hero-sub zp-rise" style="animation-delay: 280ms">
          Find chargers, add new ones, route emergencies.
          <br class="break" />
          Open. Fast. No app to install.
        </p>

        <div class="hero-cta zp-rise" style="animation-delay: 400ms">
          <button class="zp-btn zp-btn-primary" @click="goCta">
            {{ isAuthed ? 'Open Dashboard' : 'Get started' }}
          </button>
          <RouterLink to="/map" class="zp-btn zp-btn-ghost">View live map</RouterLink>
        </div>
      </div>

      <!-- Spotlit preview card. Echoes the dashboard's "live charger" UX. -->
      <div class="preview zp-rise" style="animation-delay: 700ms">
        <div class="preview-glow" aria-hidden="true"></div>
        <div class="preview-card">
          <div class="preview-head">
            <span class="dot dot-live" aria-hidden="true"></span>
            <span class="preview-title">Connaught Place · Type2</span>
            <span class="preview-pill">Active</span>
          </div>
          <dl class="preview-body">
            <div class="row"><dt>Power</dt><dd>50 kW</dd></div>
            <div class="row"><dt>Distance</dt><dd>2.3 km</dd></div>
            <div class="row"><dt>ETA</dt><dd>5 min</dd></div>
            <div class="row"><dt>Status</dt><dd class="ok">Available now</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <!-- FEATURES — Apple-style "Why" section, quiet text grid -->
    <section class="features">
      <div class="features-inner">
        <p class="section-kicker">Designed for the road ahead.</p>
        <h2 class="section-title">Quietly powerful.<br />Built for the journey.</h2>

        <div class="features-grid">
          <article
            v-for="(f, i) in features"
            :key="f.title"
            class="feature"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <span class="feature-kicker">{{ f.kicker }}</span>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA — single line, no ornament -->
    <section class="cta">
      <div class="cta-inner">
        <h2 class="cta-title">Power smarter journeys, together.</h2>
        <p class="cta-sub">Free, forever. Sign up and add your first station in under a minute.</p>
        <button class="zp-btn zp-btn-accent cta-btn" @click="goCta">
          {{ isAuthed ? 'Open Dashboard' : 'Create your account' }}
        </button>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-brand">
          <img src="/zappoint-logo.png" alt="ZapPoint" class="footer-logo" />
          ZapPoint
        </span>
        <span class="footer-meta">
          <a href="https://github.com/git-akki/ZapPoint" target="_blank" rel="noopener">GitHub</a>
          <span class="sep">·</span>
          <span>Made in India</span>
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  font-family: var(--zp-font);
  background: var(--zp-bg);
  color: var(--zp-text);
}

/* ─── HERO ────────────────────────────────────────────────── */
.hero {
  position: relative;
  padding: 8rem 2rem 5rem;
  text-align: center;
  overflow: hidden;
  isolation: isolate;
}

/* A faint, single-direction radial gloss — Apple's "spotlight" instead of
   the four-color blob orbs of generic SaaS landings. */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 120% 60% at 50% -10%,
    rgba(10, 132, 255, 0.18),
    transparent 60%
  );
  pointer-events: none;
  z-index: -1;
}

.hero-inner {
  max-width: 980px;
  margin: 0 auto;
}

.kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.8rem;
  background: var(--zp-bg-2);
  border: 1px solid var(--zp-line);
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--zp-text-soft);
  font-weight: 500;
  letter-spacing: var(--zp-track-normal);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--zp-success);
  box-shadow: 0 0 8px var(--zp-success);
  animation: zp-blink 1.8s ease-in-out infinite;
}

@keyframes zp-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

.hero-title {
  margin: 1.5rem 0 1.25rem;
  font-family: var(--zp-font-display);
  font-size: clamp(2.5rem, 6.5vw, 5.5rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: var(--zp-track-display);
  color: var(--zp-text);
}

.grad {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.45));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  max-width: 600px;
  margin: 0 auto 2.5rem;
  font-size: 1.15rem;
  line-height: 1.55;
  color: var(--zp-text-soft);
  letter-spacing: var(--zp-track-normal);
}

.break { display: none; }

.hero-cta {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ─── PREVIEW CARD ────────────────────────────────────────── */
.preview {
  position: relative;
  margin: 5rem auto 0;
  max-width: 480px;
  padding: 0 1.25rem;
}

/* Soft glow behind the card — sells the "spotlit hero device" Apple uses
   for product photos. Pure CSS, no images. */
.preview-glow {
  position: absolute;
  inset: -20% -10%;
  background: radial-gradient(circle, rgba(10, 132, 255, 0.22), transparent 60%);
  filter: blur(40px);
  z-index: -1;
}

.preview-card {
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid var(--zp-line);
  border-radius: var(--zp-radius-lg);
  padding: 1.1rem 1.25rem;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: var(--zp-lift);
  text-align: left;
}

.preview-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--zp-line);
}

.dot-live {
  background: var(--zp-success);
  box-shadow: 0 0 10px var(--zp-success);
}

.preview-title {
  font-family: var(--zp-font-mono);
  font-size: 0.78rem;
  color: var(--zp-text-soft);
}

.preview-pill {
  margin-left: auto;
  padding: 0.15rem 0.55rem;
  background: var(--zp-success-soft);
  color: var(--zp-success);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-loose);
  text-transform: uppercase;
}

.preview-body {
  margin: 0;
  padding: 0.85rem 0 0.25rem;
  display: grid;
  gap: 0.55rem;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0;
}

.row dt {
  color: var(--zp-text-muted);
  font-size: 0.85rem;
  margin: 0;
}

.row dd {
  margin: 0;
  color: var(--zp-text);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  font-size: 0.9rem;
}

.row .ok { color: var(--zp-success); }

/* ─── FEATURES ────────────────────────────────────────────── */
.features {
  padding: 8rem 2rem;
  border-top: 1px solid var(--zp-line-soft);
}

.features-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.section-kicker {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-caps);
  text-transform: uppercase;
  color: var(--zp-text-muted);
}

.section-title {
  font-family: var(--zp-font-display);
  font-size: clamp(1.85rem, 4vw, 2.85rem);
  font-weight: 700;
  letter-spacing: var(--zp-track-display);
  line-height: 1.05;
  color: var(--zp-text);
  margin: 0 0 3.5rem;
  max-width: 700px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1px; /* hairline divider trick: gap fills with bg */
  background: var(--zp-line-soft);
  border-top: 1px solid var(--zp-line-soft);
  border-bottom: 1px solid var(--zp-line-soft);
}

/* Each feature is a panel; the gap between panels is a 1px hairline.
   Apple uses this trick on the comparison rows of product pages. */
.feature {
  background: var(--zp-bg);
  padding: 2.5rem 1.75rem 2rem;
  animation: zp-rise 600ms var(--zp-spring) both;
}

.feature-kicker {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-caps);
  text-transform: uppercase;
  color: var(--zp-accent);
  display: block;
  margin-bottom: 0.85rem;
}

.feature-title {
  font-family: var(--zp-font-display);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: var(--zp-track-tight);
  margin: 0 0 0.45rem;
  color: var(--zp-text);
}

.feature-desc {
  font-size: 0.93rem;
  line-height: 1.5;
  color: var(--zp-text-soft);
  margin: 0;
}

/* ─── CTA ─────────────────────────────────────────────────── */
.cta {
  position: relative;
  padding: 7rem 2rem;
  text-align: center;
  overflow: hidden;
}

.cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 50% at 50% 50%,
    rgba(10, 132, 255, 0.16),
    transparent 60%
  );
  pointer-events: none;
}

.cta-inner {
  position: relative;
  max-width: 640px;
  margin: 0 auto;
}

.cta-title {
  font-family: var(--zp-font-display);
  font-size: clamp(1.85rem, 4vw, 2.85rem);
  font-weight: 700;
  letter-spacing: var(--zp-track-display);
  line-height: 1.08;
  margin: 0 0 1rem;
}

.cta-sub {
  font-size: 1.05rem;
  color: var(--zp-text-soft);
  margin: 0 0 2rem;
}

.cta-btn {
  font-size: 0.95rem;
  padding: 0.85rem 1.5rem;
}

/* ─── FOOTER ──────────────────────────────────────────────── */
.footer {
  padding: 2.5rem 2rem;
  border-top: 1px solid var(--zp-line-soft);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--zp-text-muted);
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--zp-text-soft);
}

.footer-logo {
  width: 22px;
  height: 22px;
  border-radius: 6px;
}

.footer-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-meta a {
  color: var(--zp-text);
  text-decoration: none;
  transition: color var(--zp-fast) var(--zp-ease);
}
.footer-meta a:hover {
  color: var(--zp-accent);
}

.sep { color: var(--zp-text-faint); }

@media (max-width: 720px) {
  .hero { padding: 5rem 1.25rem 3rem; }
  .features { padding: 5rem 1.25rem; }
  .cta { padding: 5rem 1.25rem; }
  .break { display: inline; }
}
</style>
