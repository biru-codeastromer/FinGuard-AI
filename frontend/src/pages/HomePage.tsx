import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroScene } from '../components/HeroScene';
import { SiteHeader } from '../components/SiteHeader';

const projectDocs = [
  { file: 'idea.md', note: 'project scope and key features' },
  { file: 'useCaseDiagram.md', note: 'use case coverage' },
  { file: 'sequenceDiagram.md', note: 'main end-to-end flow' },
  { file: 'classDiagram.md', note: 'major classes and relationships' },
  { file: 'ErDiagram.md', note: 'database tables and relationships' },
];

const projectHighlights = [
  'Repository pattern',
  'Strategy-based risk scoring',
  'JWT auth + RBAC',
  'Alerts + audit logging',
];

const signals = [
  {
    label: 'Velocity spikes',
    copy: 'Catch bursts in transaction volume before they turn into account takeover.',
    tone: '#efe6ff',
    glyph: '01',
  },
  {
    label: 'Device drift',
    copy: 'Compare trusted fingerprints against newly observed sessions in real time.',
    tone: '#e0f7f1',
    glyph: '02',
  },
  {
    label: 'Cross-border anomalies',
    copy: 'Flag purchases that depart sharply from the customer’s usual geographies.',
    tone: '#ffe9df',
    glyph: '03',
  },
  {
    label: 'Explainable scores',
    copy: 'Every hold and block comes with concrete reason codes for analyst review.',
    tone: '#e7f3ff',
    glyph: '04',
  },
  {
    label: 'Instant audit trail',
    copy: 'Keep immutable evidence for each decision without slowing the request path.',
    tone: '#fff4dd',
    glyph: '05',
  },
  {
    label: 'Rule + model blend',
    copy: 'Balance deterministic policy checks with adaptive behavioral scoring.',
    tone: '#dffbf2',
    glyph: '06',
  },
];

const quotes = [
  {
    text: 'The analyst queue feels clear enough to act on immediately, without losing the decision trail.',
    who: 'Riya Sen, Risk Analyst',
    style: { top: '2%', left: '3%' },
  },
  {
    text: 'We reduced false positives by letting the reason codes stay visible to operations and support.',
    who: 'Palak Gupta, Operations Lead',
    style: { top: '14%', right: '6%' },
  },
  {
    text: 'The product doesn’t just stop suspicious payments, it explains why each payment was held.',
    who: 'Kabir Sharma, Admin',
    style: { bottom: '6%', left: '12%' },
  },
  {
    text: 'For demos and reviews, the workspace tells the whole story in one place: score, signal, account, alert.',
    who: 'Aarav Kapoor, Product Owner',
    style: { bottom: '10%', right: '4%' },
  },
];

export function HomePage() {
  return (
    <div className="page site-shell">
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="container">
            <div className="ticker">
              <span>
                realtime screening <strong>24/7</strong>
              </span>
              <span>
                explainable reasons <strong>100%</strong>
              </span>
              <span>
                audit-ready traces <strong>immutable</strong>
              </span>
              <span>
                analyst queue <strong>actionable</strong>
              </span>
            </div>

            <motion.div
              className="hero-copy"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <h1>Guard your money while it moves.</h1>
              <p>
                FinGuard AI screens transactions in real time, scores risk with
                explainable signals, and hands analysts a clean queue instead of
                noisy guesswork.
              </p>

              <div className="hero-actions">
                <Link className="button button-primary" to="/workspace">
                  Open workspace
                  <ArrowRight size={18} />
                </Link>
                <a className="button button-secondary" href="#signals">
                  <Play size={16} />
                  See risk flow
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.12 }}
            >
              <HeroScene />
            </motion.div>
          </div>
        </section>

        <section className="section" id="signals">
          <div className="container">
            <div className="section-title">
              <h2>Signals that feel grounded, not mysterious.</h2>
              <p>
                The interface stays calm, but every decision is backed by concrete
                evidence: amount spikes, geo mismatches, untrusted devices, and
                suspicious merchant context.
              </p>
            </div>

            <div className="signal-rail">
              {signals.map((signal, index) => (
                <motion.article
                  key={signal.label}
                  className="signal-card"
                  style={{ background: signal.tone }}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: index % 2 === 0 ? 18 : 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                >
                  <div className="signal-card-top">{signal.glyph}</div>
                  <div className="signal-card-bottom">
                    <strong>{signal.label}</strong>
                    <p>{signal.copy}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-dark" id="workflows">
          <div className="container">
            <div className="section-title">
              <h2>One flow for the customer, one cockpit for the analyst.</h2>
              <p>
                Built from the SESD blueprint: transaction orchestration, rule plus
                strategy-based risk scoring, alerting, and immutable audit logs.
              </p>
            </div>

            <div className="feature-grid">
              <motion.article
                className="feature-panel mint"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <h3>Monitor top risk events as they happen.</h3>
                <p>
                  Analysts see approval rate, flagged traffic, average risk, and
                  the newest decision trail without hunting through tabs.
                </p>
                <div className="panel-visual">
                  <svg viewBox="0 0 320 220">
                    <rect width="320" height="220" rx="28" fill="#11161d" />
                    <rect x="22" y="20" width="110" height="14" rx="7" fill="#212b38" />
                    <rect x="22" y="52" width="276" height="126" rx="20" fill="#0b1118" />
                    <path
                      d="M38 146C66 118 82 120 106 90C132 58 150 142 180 120C204 102 214 60 282 72"
                      stroke="#7ce0bf"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <rect x="22" y="188" width="74" height="12" rx="6" fill="#253140" />
                  </svg>
                </div>
              </motion.article>

              <div className="feature-stack">
                <motion.article
                  className="feature-panel royal"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: 0.08 }}
                >
                  <h3>Trace device trust and velocity in one glance.</h3>
                  <p>
                    Behavior profiles update as safe activity continues, so the
                    system learns a calmer baseline and highlights meaningful drift.
                  </p>
                </motion.article>

                <motion.article
                  className="feature-panel blueprint"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: 0.16 }}
                >
                  <h3>Give every hold and block an explainable story.</h3>
                  <p>
                    Risk scores remain visible alongside reason codes, confidence,
                    and merchant context so overrides stay accountable.
                  </p>
                </motion.article>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container assurance">
            <motion.div
              className="section-title"
              style={{ textAlign: 'left', marginBottom: 0 }}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
            >
              <h2>Confidence built case by case.</h2>
              <p style={{ margin: 0 }}>
                The customer surface stays light and clean, while the backend keeps
                the heavier work moving through NestJS modules, repositories, and
                a strategy-driven risk engine.
              </p>
            </motion.div>

            <motion.div
              className="assurance-card assurance-chart"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
            >
              <div style={{ display: 'grid', gap: '1rem', alignSelf: 'stretch' }}>
                <div className="risk-score-pill">
                  <ShieldCheck size={16} />
                  low false-positive posture
                </div>
                <div>
                  <strong style={{ fontSize: '1.8rem', letterSpacing: '-0.05em' }}>
                    India Hybrid Fund
                  </strong>
                  <p className="muted" style={{ marginTop: '0.35rem' }}>
                    Example customer position surfaced beside the fraud layer to keep
                    finance and risk context in the same conversation.
                  </p>
                </div>
                <div style={{ display: 'grid', gap: '0.4rem' }}>
                  <strong style={{ color: '#07a17a', fontSize: '2.1rem' }}>
                    16.32%
                  </strong>
                  <p className="muted">3Y annualized example return</p>
                </div>
              </div>

              <svg viewBox="0 0 260 340">
                <rect x="20" y="18" width="210" height="304" rx="26" fill="#fff" stroke="#dce4f0" />
                <path
                  d="M40 228C62 232 82 250 104 250C132 250 144 198 176 190C194 186 208 198 220 148"
                  stroke="#4ed3a5"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
                <rect x="38" y="36" width="34" height="34" rx="10" fill="#dffbf2" />
                <rect x="82" y="42" width="82" height="12" rx="6" fill="#2c3550" />
                <rect x="82" y="62" width="68" height="8" rx="4" fill="#a6b1c3" />
                <rect x="36" y="282" width="80" height="24" rx="12" fill="#f1f5ee" />
                <rect x="126" y="282" width="92" height="24" rx="12" fill="#f1f5ee" />
              </svg>
            </motion.div>
          </div>
        </section>

        <section className="section" id="trust">
          <div className="container">
            <div className="section-title">
              <h2>Trusted by product, risk, and operations teams.</h2>
              <p>
                The design stays approachable for demos and submissions, while the
                implementation underneath remains properly structured for review.
              </p>
            </div>

            <div className="quote-cloud">
              {quotes.map((quote, index) => (
                <motion.div
                  key={quote.who}
                  className="quote-card"
                  style={quote.style}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div>{quote.text}</div>
                  <small>{quote.who}</small>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-dark">
          <div className="container cta-orb">
            <div className="orb" />
            <h2>No noisy queues, no blind decisions.</h2>
            <p>
              Stand up a real submission-ready project with a protected frontend,
              clean backend layering, seeded demo data, and room to extend after
              the deadline.
            </p>
            <Link className="button button-dark" to="/workspace">
              Start now
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: '1rem' }}>
              <span className="brand-mark" />
              FinGuard
            </div>
            <p className="muted" style={{ maxWidth: 340 }}>
              Full-stack fintech submission with a NestJS backend, React frontend,
              Prisma data model, and the required SESD design documentation.
            </p>
          </div>

          <div>
            <h4>Project</h4>
            <ul className="footer-links">
              {projectDocs.map((doc) => (
                <li key={doc.file}>
                  <code>{doc.file}</code>
                  <span>{doc.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Highlights</h4>
            <ul className="footer-links">
              {projectHighlights.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
