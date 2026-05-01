<script setup>
// Landing page — public route. Hero + features + CTA.
// Visual language: Tesla-style full-bleed hero with big display type,
// Vercel-style monochrome sections + subtle dotted bg, Next.js-style
// minimal feature cards with crisp borders.
import { useRouter } from 'vue-router'
import { computed, onMounted, ref } from 'vue'

const router = useRouter()
const isAuthed = computed(() => !!localStorage.getItem('authToken'))
const goCta = () => router.push(isAuthed.value ? '/dashboard' : '/register')

// Animated counter for the hero stat. Pure visual flourish — value is fake
// "marketing copy" since we don't have a public stations count endpoint.
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
  {
    title: 'Live charger map',
    desc: 'Find every active station nearby — power output, connector type, and live status pinned on an interactive map.',
    icon: '📍',
  },
  {
    title: 'Add what you discover',
    desc: 'Spotted a new charger? Drop a pin and share it with the community in seconds. No moderation queue.',
    icon: '➕',
  },
  {
    title: 'Emergency assist',
    desc: 'Out of battery? Hit the SOS button. We route the nearest compatible charger to your coordinates.',
    icon: '🚨',
  },
  {
    title: 'Built for India',
    desc: 'Type1, Type2, CCS, CHAdeMO, and Tesla connectors — covered. Optimized for tier-2 city coverage.',
    icon: '⚡',
  },
]
</script>

<template>
  <div class="landing">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-bg-orb hero-orb-a" aria-hidden="true"></div>
      <div class="hero-bg-orb hero-orb-b" aria-hidden="true"></div>

      <div class="hero-inner">
        <div class="eyebrow zp-rise" style="animation-delay: 50ms">
          <span class="dot"></span>
          {{ stationCount.toLocaleString() }}+ chargers, community-mapped
        </div>

        <h1 class="hero-title zp-rise" style="animation-delay: 150ms">
          The map of every<br />
          <span class="hero-title-grad">EV charger</span> in India.
        </h1>

        <p class="hero-sub zp-rise" style="animation-delay: 280ms">
          Find chargers, add new ones, request emergency power.
          Open, fast, no app install — just a link you can share.
        </p>

        <div class="hero-cta zp-rise" style="animation-delay: 400ms">
          <button class="zp-btn zp-btn-accent hero-cta-primary" @click="goCta">
            {{ isAuthed ? 'Open Dashboard →' : "Start mapping — it's free" }}
          </button>
          <RouterLink to="/map" class="zp-btn zp-btn-ghost hero-cta-secondary">
            View live map
          </RouterLink>
        </div>

        <div class="hero-meta zp-rise" style="animation-delay: 550ms">
          <span><kbd>⌘</kbd> K — quick search · No card required</span>
        </div>
      </div>

      <!-- Floating product card preview -->
      <div class="hero-card zp-rise" style="animation-delay: 700ms">
        <div class="hero-card-head">
          <span class="dot dot-live"></span>
          <span>Connaught Place · Type2 · 50kW</span>
          <span class="hero-card-status">Active</span>
        </div>
        <div class="hero-card-body">
          <div class="hero-card-row"><span>Distance</span><strong>2.3 km</strong></div>
          <div class="hero-card-row"><span>ETA</span><strong>5 min</strong></div>
          <div class="hero-card-row">
            <span>Status</span><strong style="color: var(--zp-electric)">Available now</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features zp-dotted-bg">
      <div class="features-inner">
        <p class="section-eyebrow">What you get</p>
        <h2 class="section-title">Built like the apps you love.</h2>

        <div class="features-grid">
          <article
            v-for="(f, i) in features"
            :key="f.title"
            class="feature"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div class="feature-icon">{{ f.icon }}</div>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-band">
      <div class="cta-inner">
        <h2 class="cta-title">Power smarter journeys, together.</h2>
        <p class="cta-sub">
          Free forever. Sign up and add your first station in under 60 seconds.
        </p>
        <button class="zp-btn zp-btn-accent cta-button" @click="goCta">
          {{ isAuthed ? 'Open Dashboard →' : 'Create your account →' }}
        </button>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="/zappoint-logo.png" alt="ZapPoint" class="footer-logo" />
          <span>ZapPoint · Powering smarter journeys</span>
        </div>
        <div class="footer-meta">
          <a href="https://github.com/git-akki/ZapPoint" target="_blank" rel="noopener">GitHub</a>
          <span class="dot-sep">·</span>
          <span>Made with ⚡ in India</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  font-family: var(--zp-font-sans);
}

/* ─── HERO ─────────────────────────────────────────── */
.hero {
  position: relative;
  overflow: hidden;
  background: var(--zp-bg-dark);
  color: var(--zp-text-on-dark);
  padding: 7rem 2rem 6rem;
  isolation: isolate;
}

.hero-bg-orb {
  position: absolute;
  width: 50vw;
  height: 50vw;
  filter: blur(120px);
  opacity: 0.45;
  z-index: -1;
  border-radius: 50%;
  pointer-events: none;
  animation: zp-float 18s ease-in-out infinite alternate;
}

.hero-orb-a {
  background: radial-gradient(circle, #a855f7, transparent 60%);
  top: -10%;
  right: -10%;
}

.hero-orb-b {
  background: radial-gradient(circle, #06b6d4, transparent 60%);
  bottom: -20%;
  left: -10%;
  animation-direction: alternate-reverse;
}

@keyframes zp-float {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(40px, 30px) scale(1.05); }
}

.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--zp-text-on-dark-soft);
  font-weight: 500;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--zp-electric);
  box-shadow: 0 0 10px var(--zp-electric);
  animation: zp-pulse 1.6s ease-in-out infinite;
}

@keyframes zp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  margin: 1.5rem 0 1.25rem;
  font-family: var(--zp-font-display);
  font-size: clamp(2.5rem, 6vw, 4.75rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.035em;
  color: var(--zp-text-on-dark);
}

.hero-title-grad {
  background: var(--zp-gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  max-width: 620px;
  margin: 0 auto 2rem;
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--zp-text-on-dark-soft);
}

.hero-cta {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-cta-primary {
  font-size: 1rem;
  padding: 0.85rem 1.5rem;
}

.hero-cta-secondary {
  background: transparent;
  color: var(--zp-text-on-dark);
  border-color: rgba(255, 255, 255, 0.2);
}

.hero-cta-secondary:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.4);
}

.hero-meta {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: var(--zp-text-on-dark-soft);
}

.hero-meta kbd {
  display: inline-block;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-family: var(--zp-font-mono);
  font-size: 0.75rem;
  margin-right: 4px;
}

/* Floating preview card */
.hero-card {
  margin: 4rem auto 0;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--zp-radius-lg);
  padding: 1.25rem;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-align: left;
  font-size: 0.9rem;
}

.hero-card-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--zp-font-mono);
  font-size: 0.78rem;
  color: var(--zp-text-on-dark-soft);
}

.dot-live {
  background: var(--zp-electric);
  box-shadow: 0 0 12px var(--zp-electric);
}

.hero-card-status {
  margin-left: auto;
  padding: 0.15rem 0.55rem;
  background: rgba(16, 185, 129, 0.15);
  color: var(--zp-electric);
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.hero-card-body {
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hero-card-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.hero-card-row span {
  color: var(--zp-text-on-dark-soft);
}

.hero-card-row strong {
  color: var(--zp-text-on-dark);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ─── FEATURES ─────────────────────────────────────── */
.features {
  padding: 6rem 2rem;
  background: var(--zp-bg);
}

.features-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.section-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--zp-violet-600);
  margin: 0 0 0.5rem;
}

.section-title {
  font-family: var(--zp-font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0 0 3rem;
  color: var(--zp-text);
  max-width: 700px;
  line-height: 1.1;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.feature {
  background: var(--zp-bg);
  border: 1px solid var(--zp-border);
  border-radius: var(--zp-radius-lg);
  padding: 1.75rem;
  transition: transform var(--zp-base) var(--zp-ease-out), border-color var(--zp-base) var(--zp-ease), box-shadow var(--zp-base) var(--zp-ease);
  animation: zp-rise 600ms var(--zp-ease-out) both;
}

.feature:hover {
  transform: translateY(-4px);
  border-color: var(--zp-violet-300);
  box-shadow: var(--zp-shadow);
}

.feature-icon {
  font-size: 1.6rem;
  margin-bottom: 1rem;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--zp-violet-50);
  border-radius: var(--zp-radius);
}

.feature-title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
  letter-spacing: -0.01em;
}

.feature-desc {
  font-size: 0.92rem;
  color: var(--zp-text-soft);
  line-height: 1.55;
  margin: 0;
}

/* ─── CTA BAND ─────────────────────────────────────── */
.cta-band {
  position: relative;
  padding: 5rem 2rem;
  background: var(--zp-bg-dark);
  color: var(--zp-text-on-dark);
  overflow: hidden;
}

.cta-band::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.18), transparent 60%);
  pointer-events: none;
}

.cta-inner {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

.cta-title {
  font-family: var(--zp-font-display);
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0 0 1rem;
  line-height: 1.1;
}

.cta-sub {
  font-size: 1.05rem;
  color: var(--zp-text-on-dark-soft);
  margin: 0 0 2rem;
}

.cta-button {
  font-size: 1rem;
  padding: 0.85rem 1.5rem;
}

/* ─── FOOTER ───────────────────────────────────────── */
.footer {
  padding: 2rem;
  border-top: 1px solid var(--zp-border);
  background: var(--zp-bg);
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
  color: var(--zp-text-soft);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.footer-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-meta a {
  color: var(--zp-text);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--zp-fast) var(--zp-ease);
}

.footer-meta a:hover {
  color: var(--zp-violet-600);
}

.dot-sep {
  color: var(--zp-text-muted);
}

@media (max-width: 640px) {
  .hero { padding: 4rem 1.25rem 3rem; }
  .features { padding: 4rem 1.25rem; }
  .cta-band { padding: 4rem 1.25rem; }
  .feature { padding: 1.5rem; }
}
</style>
