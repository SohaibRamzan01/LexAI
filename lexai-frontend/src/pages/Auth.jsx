import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Auth() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('signin')
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', firm: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = () => {
    navigate('/dashboard')
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0E0C0A', minHeight: '100vh', color: '#F5F0E8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          background: linear-gradient(145deg, #1A1208 0%, #0E0C0A 60%, #120E06 100%);
          padding: 48px 52px;
          display: flex; flex-direction: column; justify-content: space-between;
          border-right: 1px solid rgba(201,168,76,0.2);
          position: relative; overflow: hidden;
        }
        .auth-left-glow {
          position: absolute; bottom: -80px; right: -80px;
          width: 380px; height: 380px; pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.09) 0%, transparent 65%);
        }
        .auth-left-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(201,168,76,0.025) 50px, rgba(201,168,76,0.025) 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(201,168,76,0.025) 50px, rgba(201,168,76,0.025) 51px);
        }
        .auth-logo {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: #C9A84C;
          position: relative; z-index: 1;
        }
        .auth-logo span { color: #F5F0E8; }

        .auth-middle { position: relative; z-index: 1; }
        .auth-scale-icon {
          font-size: 48px; margin-bottom: 24px; display: block;
        }
        .auth-quote {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-style: italic;
          color: #F5F0E8; line-height: 1.55; margin-bottom: 16px;
        }
        .auth-quote-cite {
          font-size: 12px; color: #C9A84C;
          letter-spacing: 0.08em; text-transform: uppercase; font-style: normal;
        }

        .auth-stats {
          display: flex; gap: 32px;
          position: relative; z-index: 1;
        }
        .auth-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 700; color: #C9A84C;
        }
        .auth-stat-lbl {
          font-size: 11px; color: #6B6560; margin-top: 3px;
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          background: #0A0908;
          padding: 48px 52px;
          display: flex; flex-direction: column; justify-content: center;
          overflow-y: auto;
        }
        .auth-tabs {
          display: flex; gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 32px;
        }
        .auth-tab {
          padding: 11px 24px; font-size: 14px; font-weight: 500;
          color: #6B6560; cursor: pointer; border: none; background: transparent;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .auth-tab.active { color: #C9A84C; border-bottom-color: #C9A84C; }
        .auth-tab:hover:not(.active) { color: #F5F0E8; }

        .auth-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700; color: #F5F0E8; margin-bottom: 6px;
        }
        .auth-form-sub {
          font-size: 13px; color: #6B6560; margin-bottom: 28px; line-height: 1.6;
        }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { margin-bottom: 16px; }
        .form-label {
          display: block; font-size: 11px; font-weight: 700;
          color: #6B6560; margin-bottom: 7px;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .form-input {
          width: 100%; padding: 12px 16px; border-radius: 9px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #F5F0E8; font-size: 14px;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .form-input:focus {
          border-color: rgba(201,168,76,0.5);
          background: rgba(201,168,76,0.04);
        }
        .form-input::placeholder { color: #3A3530; }

        .password-wrap { position: relative; }
        .password-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #6B6560; cursor: pointer;
          font-size: 16px; padding: 0; line-height: 1;
        }
        .password-toggle:hover { color: #C9A84C; }

        .forgot-link {
          text-align: right; margin-top: -10px; margin-bottom: 16px;
          font-size: 12px; color: #C9A84C; cursor: pointer;
        }
        .forgot-link:hover { text-decoration: underline; }

        .btn-submit {
          width: 100%; padding: 14px; border-radius: 10px;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          color: #0A0A0F; font-size: 15px; font-weight: 700;
          border: none; cursor: pointer; margin-top: 6px;
          box-shadow: 0 8px 24px rgba(201,168,76,0.28);
          transition: opacity 0.2s, transform 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-submit:hover { opacity: 0.92; transform: translateY(-1px); }

        .divider {
          text-align: center; font-size: 12px; color: #3A3530;
          margin: 20px 0; position: relative;
        }
        .divider::before {
          content: ''; position: absolute; top: 50%; left: 0; right: 0;
          height: 1px; background: rgba(255,255,255,0.07);
        }
        .divider span {
          background: #0A0908; padding: 0 14px; position: relative;
        }

        .social-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .social-btn {
          padding: 11px 14px; border-radius: 9px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.09);
          color: #F5F0E8; font-size: 13px; font-weight: 500;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, background 0.2s;
        }
        .social-btn:hover {
          border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.04);
        }

        .terms-text {
          font-size: 11px; color: #3A3530; text-align: center;
          margin-top: 16px; line-height: 1.6;
        }
        .terms-text a { color: #C9A84C; cursor: pointer; }

        .back-home {
          position: absolute; top: 24px; left: 24px;
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #6B6560; cursor: pointer;
          padding: 7px 12px; border-radius: 7px;
          border: 1px solid transparent;
          transition: all 0.2s; background: transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .back-home:hover {
          color: #C9A84C; border-color: rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
        }

        .strength-bar { display: flex; gap: 4px; margin-top: 8px; }
        .strength-seg {
          flex: 1; height: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s;
        }

        @media (max-width: 768px) {
          .auth-wrapper { grid-template-columns: 1fr; }
          .auth-left { display: none; }
        }
      `}</style>

      <div style={{ position: 'relative' }}>
        <button className="back-home" onClick={() => navigate('/')}>← Back to Home</button>
      </div>

      <div className="auth-wrapper">

        {/* ── LEFT PANEL ── */}
        <div className="auth-left">
          <div className="auth-left-grid" />
          <div className="auth-left-glow" />

          <div className="auth-logo" style={{ position: 'relative', zIndex: 1 }}>
            Lex<span>AI</span>
          </div>

          <div className="auth-middle">
            <span className="auth-scale-icon">⚖</span>
            <p className="auth-quote">
              "Justice is the constant and perpetual will to render to every man his due."
            </p>
            <cite className="auth-quote-cite">— Justinian I · Institutes of Roman Law</cite>
          </div>

          <div className="auth-stats">
            {[
              { num: '12K+', lbl: 'Cases Analyzed' },
              { num: '98%',  lbl: 'Accuracy Rate'  },
              { num: '3K+',  lbl: 'Lawyers Trust Us'},
            ].map((s, i) => (
              <div key={i}>
                <div className="auth-stat-num">{s.num}</div>
                <div className="auth-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="auth-right">

          {/* TABS */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
              onClick={() => setActiveTab('signin')}
            >Sign In</button>
            <button
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
            >Create Account</button>
          </div>

          {/* ── SIGN IN FORM ── */}
          {activeTab === 'signin' && (
            <div>
              <div className="auth-form-title">Welcome Back</div>
              <div className="auth-form-sub">Sign in to access your cases and AI research.</div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email" name="email"
                  placeholder="advocate@lawfirm.com"
                  value={formData.email}
                  onChange={handleInput}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrap">
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInput}
                    style={{ paddingRight: '44px' }}
                  />
                  <button className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="forgot-link">Forgot password?</div>

              <button className="btn-submit" onClick={handleSubmit}>
                Sign In to LexAI →
              </button>

              <div className="divider"><span>or continue with</span></div>

              <div className="social-row">
                <button className="social-btn">🔑 Google</button>
                <button className="social-btn">💼 LinkedIn</button>
              </div>

              <div className="terms-text">
                Don't have an account?{' '}
                <a onClick={() => setActiveTab('signup')}>Create one free →</a>
              </div>
            </div>
          )}

          {/* ── SIGN UP FORM ── */}
          {activeTab === 'signup' && (
            <div>
              <div className="auth-form-title">Create Your Account</div>
              <div className="auth-form-sub">Join 3,000+ lawyers already using LexAI as their co-worker.</div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-input" type="text" name="firstName"
                    placeholder="Ali" value={formData.firstName} onChange={handleInput}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-input" type="text" name="lastName"
                    placeholder="Khan" value={formData.lastName} onChange={handleInput}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input" type="email" name="email"
                  placeholder="advocate@lawfirm.com"
                  value={formData.email} onChange={handleInput}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Law Firm / Organization</label>
                <input
                  className="form-input" type="text" name="firm"
                  placeholder="Khan & Associates Law Firm"
                  value={formData.firm} onChange={handleInput}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-wrap">
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInput}
                    style={{ paddingRight: '44px' }}
                  />
                  <button className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Password strength indicator */}
                {formData.password.length > 0 && (
                  <div className="strength-bar">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="strength-seg" style={{
                        background: formData.password.length >= i * 3
                          ? i <= 1 ? '#E07060'
                          : i <= 2 ? '#C9A84C'
                          : i <= 3 ? '#A8C870'
                          : '#4CAF7A'
                          : 'rgba(255,255,255,0.08)'
                      }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className="form-input" type="password" name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword} onChange={handleInput}
                  style={{
                    borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'rgba(224,112,96,0.5)' : undefined
                  }}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div style={{ fontSize: '11px', color: '#E07060', marginTop: '5px' }}>
                    ✗ Passwords do not match
                  </div>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div style={{ fontSize: '11px', color: '#4CAF7A', marginTop: '5px' }}>
                    ✓ Passwords match
                  </div>
                )}
              </div>

              <button className="btn-submit" onClick={handleSubmit}>
                Create My LexAI Account →
              </button>

              <div className="terms-text">
                By signing up, you agree to our{' '}
                <a>Terms of Service</a> and <a>Privacy Policy</a>.
                Already have an account?{' '}
                <a onClick={() => setActiveTab('signin')}>Sign in →</a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}