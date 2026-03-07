import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0E0C0A', minHeight: '100vh', color: '#F5F0E8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: rgba(201,168,76,0.15);
          --border: rgba(201,168,76,0.25);
          --paper: #F5F0E8;
          --muted: #6B6560;
          --ink: #0A0A0F;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing-bg {
          background: linear-gradient(160deg, #0E0C0A 0%, #1A1208 50%, #0E0C0A 100%);
          position: relative; overflow: hidden;
        }
        .grid-pattern {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 60px, rgba(201,168,76,0.03) 60px, rgba(201,168,76,0.03) 61px),
            repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(201,168,76,0.03) 60px, rgba(201,168,76,0.03) 61px);
        }
        .glow {
          position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
          width: 700px; height: 500px; pointer-events: none;
          background: radial-gradient(ellipse, rgba(201,168,76,0.1) 0%, transparent 70%);
        }
        .nav {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 60px;
          border-bottom: 1px solid var(--border);
        }
        .logo { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: var(--gold); }
        .logo span { color: var(--paper); }
        .nav-right { display: flex; gap: 12px; align-items: center; }
        .btn-ghost {
          padding: 9px 22px; border-radius: 8px; font-size: 14px;
          font-weight: 500; color: var(--paper); background: transparent;
          border: 1px solid rgba(255,255,255,0.15); cursor: pointer;
          transition: border-color 0.2s;
        }
        .btn-ghost:hover { border-color: var(--border); color: var(--gold); }
        .btn-gold {
          padding: 9px 22px; border-radius: 8px; font-size: 14px; font-weight: 700;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          color: #0A0A0F; border: none; cursor: pointer;
          box-shadow: 0 6px 20px rgba(201,168,76,0.3); transition: opacity 0.2s;
        }
        .btn-gold:hover { opacity: 0.9; }
        .hero {
          position: relative; z-index: 2;
          text-align: center; padding: 90px 40px 70px;
        }
        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--gold-dim); border: 1px solid var(--border);
          border-radius: 24px; padding: 5px 16px; margin-bottom: 32px;
          font-size: 12px; color: var(--gold); font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase;
        }
        .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); }
        .headline {
          font-family: 'Playfair Display', serif;
          font-size: 64px; font-weight: 900; line-height: 1.1;
          color: var(--paper); margin-bottom: 20px;
        }
        .headline em { color: var(--gold); font-style: italic; }
        .sub {
          font-size: 17px; color: var(--muted); max-width: 520px;
          margin: 0 auto 44px; line-height: 1.75;
        }
        .cta-row { display: flex; gap: 14px; justify-content: center; }
        .btn-lg-gold {
          padding: 15px 38px; border-radius: 12px; font-size: 15px; font-weight: 700;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          color: #0A0A0F; border: none; cursor: pointer;
          box-shadow: 0 10px 28px rgba(201,168,76,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-lg-gold:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(201,168,76,0.4); }
        .btn-lg-ghost {
          padding: 15px 38px; border-radius: 12px; font-size: 15px; font-weight: 500;
          color: var(--paper); background: transparent;
          border: 1px solid rgba(255,255,255,0.18); cursor: pointer;
          transition: border-color 0.2s;
        }
        .btn-lg-ghost:hover { border-color: var(--border); }
        .features {
          position: relative; z-index: 2;
          display: grid; grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          margin: 0 60px;
        }
        .feat {
          padding: 28px 28px;
          border-right: 1px solid var(--border);
          display: flex; align-items: flex-start; gap: 14px;
        }
        .feat:last-child { border-right: none; }
        .feat-icon {
          width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
          background: var(--gold-dim); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .feat-label { font-size: 14px; font-weight: 600; color: var(--paper); margin-bottom: 4px; }
        .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }
        .stats-section {
          position: relative; z-index: 2;
          display: flex; justify-content: center; gap: 80px;
          padding: 60px 60px;
        }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 44px; font-weight: 900; color: var(--gold);
          text-align: center; margin-bottom: 6px;
        }
        .stat-lbl { font-size: 13px; color: var(--muted); text-align: center; }
        .footer-bar {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 20px 60px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-copy { font-size: 12px; color: var(--muted); }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 12px; color: var(--muted); cursor: pointer; }
        .footer-link:hover { color: var(--gold); }
      `}</style>

      <div className="landing-bg">
        <div className="grid-pattern" />
        <div className="glow" />

        {/* NAV */}
        <nav className="nav">
          <div className="logo">Lex<span>AI</span></div>
          <div className="nav-right">
            <button className="btn-ghost" onClick={() => navigate('/auth')}>Sign In</button>
            <button className="btn-gold" onClick={() => navigate('/auth')}>Get Started Free →</button>
          </div>
        </nav>

        {/* HERO */}
        <div className="hero">
          <div className="badge"><div className="badge-dot" />⚖ AI-Powered Legal Intelligence Platform</div>
          <h1 className="headline">Your Smartest<br /><em>Legal Co-Worker</em></h1>
          <p className="sub">
            Describe your case. LexAI conducts deep legal research, finds case precedents, 
            and prepares your complete courtroom strategy — step by step.
          </p>
          <div className="cta-row">
            <button className="btn-lg-gold" onClick={() => navigate('/auth')}>Start Your First Case →</button>
            <button className="btn-lg-ghost">Watch 2-min Demo</button>
          </div>
        </div>

        {/* FEATURES */}
        <div className="features">
          {[
            { icon: '⚖', label: 'Deep Case Research', desc: 'Laws, sections & precedents in seconds' },
            { icon: '🎤', label: 'Court Preparation', desc: 'Know exactly what to say before the judge' },
            { icon: '📄', label: 'PDF Export', desc: 'Download full research or court scripts' },
            { icon: '🗂', label: 'Case Management', desc: 'All your cases organized in one place' },
          ].map((f, i) => (
            <div key={i} className="feat">
              <div className="feat-icon">{f.icon}</div>
              <div>
                <div className="feat-label">{f.label}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* STATS */}
        <div className="stats-section">
          {[
            { num: '12K+', lbl: 'Cases Analyzed' },
            { num: '98%', lbl: 'Research Accuracy' },
            { num: '3K+', lbl: 'Lawyers Trust LexAI' },
            { num: '150+', lbl: 'Legal Sections Covered' },
          ].map((s, i) => (
            <div key={i}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="footer-bar">
          <div className="footer-copy">© 2024 LexAI. All rights reserved.</div>
          <div className="footer-links">
            <span className="footer-link">Privacy Policy</span>
            <span className="footer-link">Terms of Service</span>
            <span className="footer-link">Contact</span>
          </div>
        </div>
      </div>
    </div>
  )
}