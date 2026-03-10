import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CASES = [
  { id: 1, code: 'CR-2024-0042', client: 'Ahmad Raza', section: 'Sec. 302', type: 'Murder', court: 'Lahore Sessions Court', status: 'active', tag: 'Active', date: 'Today', ppc: 'PPC § 302' },
  { id: 2, code: 'CR-2024-0038', client: 'Bilal Khan', section: 'Sec. 420', type: 'Fraud', court: 'Islamabad HC', status: 'done', tag: 'Research Done', date: 'Yesterday', ppc: 'PPC § 420' },
  { id: 3, code: 'FM-2024-0021', client: 'Sara Ali', section: 'Custody', type: 'Family', court: 'Family Court Karachi', status: 'pending', tag: 'Pending', date: '2d ago', ppc: 'MFLO § 25' },
  { id: 4, code: 'CR-2024-0055', client: 'Tariq Butt', section: 'Bail App.', type: 'Criminal', court: 'District Court', status: 'urgent', tag: 'Urgent', date: '3d ago', ppc: 'CrPC § 497' },
  { id: 5, code: 'CR-2024-0029', client: 'Hassan Mehmood', section: 'Sec. 324', type: 'Attempt Murder', court: 'Sessions Court', status: 'done', tag: 'Closed', date: '1wk ago', ppc: 'PPC § 324' },
  { id: 6, code: 'FM-2024-0015', client: 'Nadia Malik', section: 'Divorce', type: 'Family', court: 'Family Court LHR', status: 'closed', tag: 'Closed', date: '2wk ago', ppc: 'MFLO § 7' },
]

const STATUS_COLORS = {
  active: { dot: '#4CAF7A', tag: 'rgba(76,175,122,0.12)', tagText: '#4CAF7A', tagBorder: 'rgba(76,175,122,0.25)', accent: '#4CAF7A' },
  done: { dot: '#C9A84C', tag: 'rgba(201,168,76,0.12)', tagText: '#C9A84C', tagBorder: 'rgba(201,168,76,0.25)', accent: '#C9A84C' },
  pending: { dot: '#7B9FD4', tag: 'rgba(123,159,212,0.12)', tagText: '#7B9FD4', tagBorder: 'rgba(123,159,212,0.25)', accent: '#7B9FD4' },
  urgent: { dot: '#E07060', tag: 'rgba(224,112,96,0.12)', tagText: '#E07060', tagBorder: 'rgba(224,112,96,0.25)', accent: '#E07060' },
  closed: { dot: '#4A4540', tag: 'rgba(74,69,64,0.3)', tagText: '#6B6560', tagBorder: 'rgba(74,69,64,0.4)', accent: '#3A3530' },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeCase, setActiveCase] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [cases, setCases] = useState(CASES)
  const [showNewCase, setShowNewCase] = useState(false)
  const [newCase, setNewCase] = useState({ client: '', section: '', type: '', court: '' })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const filtered = cases.filter(c =>
    c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id) => {
    setCases(cases.filter(c => c.id !== id))
    setShowDeleteModal(null)
    if (activeCase === id) setActiveCase(cases[0]?.id)
  }

  const handleAddCase = () => {
    if (!newCase.client || !newCase.section) return
    const created = {
      id: Date.now(),
      code: `CR-2024-00${Math.floor(Math.random() * 90 + 10)}`,
      client: newCase.client,
      section: newCase.section,
      type: newCase.type || 'General',
      court: newCase.court || 'TBD',
      status: 'active',
      tag: 'Active',
      date: 'Just now',
      ppc: newCase.section,
    }
    setCases([created, ...cases])
    setNewCase({ client: '', section: '', type: '', court: '' })
    setShowNewCase(false)
  }

  const activeCaseData = cases.find(c => c.id === activeCase)

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0A0908', minHeight: '100vh', color: '#F5F0E8', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }

        .sidebar {
          width: 268px; min-width: 268px;
          background: #0E0C0A;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0;
          transition: width 0.3s, min-width 0.3s;
        }
        .sidebar.collapsed { width: 68px; min-width: 68px; }

        .sidebar-header {
          padding: 18px 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sidebar-logo {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #C9A84C;
          white-space: nowrap; overflow: hidden;
          transition: opacity 0.2s;
        }
        .sidebar-logo span { color: #F5F0E8; }
        .sidebar.collapsed .sidebar-logo { opacity: 0; width: 0; }

        .icon-btn {
          width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; cursor: pointer; color: #6B6560;
          transition: background 0.2s, color 0.2s; outline: none;
        }
        .icon-btn:hover { background: rgba(201,168,76,0.1); color: #C9A84C; }

        .new-case-btn {
          margin: 12px 12px 6px;
          padding: 10px 14px; border-radius: 9px;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          color: #0A0A0F; font-size: 13px; font-weight: 700;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(201,168,76,0.25);
          transition: opacity 0.2s, transform 0.2s; white-space: nowrap; overflow: hidden;
        }
        .new-case-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .sidebar-section-lbl {
          padding: 10px 20px 5px;
          font-size: 10px; font-weight: 700; color: #3A3530;
          letter-spacing: 0.1em; text-transform: uppercase;
          white-space: nowrap; overflow: hidden;
        }
        .sidebar.collapsed .sidebar-section-lbl { opacity: 0; }

        .case-item {
          padding: 9px 12px; margin: 2px 8px;
          border-radius: 8px; cursor: pointer;
          display: flex; align-items: flex-start; gap: 9px;
          transition: background 0.15s; border: 1px solid transparent;
          position: relative;
        }
        .case-item:hover { background: rgba(255,255,255,0.04); }
        .case-item.active {
          background: rgba(201,168,76,0.08);
          border-color: rgba(201,168,76,0.2);
        }
        .case-status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          margin-top: 5px; flex-shrink: 0;
        }
        .case-item-body { flex: 1; overflow: hidden; }
        .case-item-title {
          font-size: 12px; font-weight: 600; color: #F5F0E8;
          margin-bottom: 2px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .case-item-meta { font-size: 11px; color: #6B6560; }
        .case-delete-btn {
          opacity: 0; width: 20px; height: 20px; border-radius: 4px;
          background: rgba(224,112,96,0.15); border: 1px solid rgba(224,112,96,0.2);
          color: #E07060; font-size: 10px; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s; outline: none; margin-top: 2px;
        }
        .case-item:hover .case-delete-btn { opacity: 1; }

        .sidebar-footer {
          margin-top: auto; padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 9px;
          background: rgba(255,255,255,0.03); cursor: pointer;
          transition: background 0.2s; overflow: hidden;
        }
        .user-chip:hover { background: rgba(255,255,255,0.06); }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #0A0A0F;
        }
        .user-name { font-size: 12px; font-weight: 600; color: #F5F0E8; white-space: nowrap; }
        .user-role { font-size: 10px; color: #6B6560; }

        /* MAIN */
        .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .dash-topbar {
          padding: 18px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,9,8,0.9); backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 10;
        }
        .dash-greeting {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #F5F0E8;
        }
        .dash-greeting span { color: #C9A84C; }
        .topbar-right { display: flex; gap: 8px; align-items: center; }

        .search-box {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px; padding: 8px 14px;
          transition: border-color 0.2s;
        }
        .search-box:focus-within { border-color: rgba(201,168,76,0.3); }
        .search-input {
          background: transparent; border: none; outline: none;
          color: #F5F0E8; font-size: 13px; width: 180px;
          font-family: 'DM Sans', sans-serif;
        }
        .search-input::placeholder { color: #3A3530; }

        .topbar-btn {
          padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
          color: #6B6560; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
          white-space: nowrap;
        }
        .topbar-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.25); }

        .dash-content { flex: 1; padding: 28px 32px; overflow-y: auto; }

        /* STATS */
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 18px 20px;
          transition: border-color 0.2s, transform 0.2s; cursor: default;
          position: relative; overflow: hidden;
        }
        .stat-card:hover { border-color: rgba(201,168,76,0.2); transform: translateY(-2px); }
        .stat-card-icon {
          font-size: 20px; margin-bottom: 10px; display: block;
        }
        .stat-card-lbl {
          font-size: 11px; color: #6B6560; margin-bottom: 6px;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .stat-card-val {
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 700; color: #F5F0E8;
        }
        .stat-card-sub { font-size: 11px; color: #C9A84C; margin-top: 3px; }

        /* SECTION HEADER */
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .section-title {
          font-size: 14px; font-weight: 700; color: #F5F0E8;
        }
        .section-action {
          font-size: 12px; color: #C9A84C; cursor: pointer;
        }
        .section-action:hover { text-decoration: underline; }

        /* CASE CARDS GRID */
        .cases-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          margin-bottom: 28px;
        }
        .case-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 18px; cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .case-card:hover { transform: translateY(-2px); }
        .case-card-top-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .case-card-tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 5px; font-size: 10px; font-weight: 700;
          margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.04em;
          border: 1px solid;
        }
        .case-card-title {
          font-size: 13px; font-weight: 700; color: #F5F0E8;
          margin-bottom: 4px; line-height: 1.4;
        }
        .case-card-court { font-size: 11px; color: #6B6560; margin-bottom: 12px; }
        .case-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .case-card-ppc {
          font-family: 'DM Mono', monospace; font-size: 10px; color: #C9A84C;
        }
        .case-card-date { font-size: 10px; color: #6B6560; }
        .case-card-actions { display: flex; gap: 5px; margin-top: 10px; }
        .card-action-btn {
          flex: 1; padding: 7px; border-radius: 7px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03); color: #6B6560;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
          text-align: center;
        }
        .card-action-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.3); }
        .card-action-btn.primary {
          background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.25);
          color: #C9A84C;
        }
        .card-action-btn.primary:hover { background: rgba(201,168,76,0.18); }
        .card-delete-btn {
          padding: 7px 10px; border-radius: 7px; font-size: 11px;
          cursor: pointer; border: 1px solid rgba(224,112,96,0.2);
          background: rgba(224,112,96,0.08); color: #E07060;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s;
        }
        .card-delete-btn:hover { background: rgba(224,112,96,0.15); }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
        }
        .modal {
          background: #151210; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 32px; width: 440px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #F5F0E8; margin-bottom: 8px;
        }
        .modal-sub { font-size: 13px; color: #6B6560; margin-bottom: 24px; line-height: 1.6; }
        .modal-input {
          width: 100%; padding: 11px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #F5F0E8; font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; margin-bottom: 12px;
        }
        .modal-input:focus { border-color: rgba(201,168,76,0.4); }
        .modal-input::placeholder { color: #3A3530; }
        .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 8px; }
        .modal-btn {
          flex: 1; padding: 11px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s;
        }
        .modal-btn.cancel {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #6B6560;
        }
        .modal-btn.confirm-del {
          background: linear-gradient(135deg, #E07060, #B04030);
          border: none; color: #fff;
        }
        .modal-btn.confirm-add {
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          border: none; color: #0A0A0F;
        }
        .modal-btn:hover { opacity: 0.88; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">Lex<span>AI</span></div>
          <button className="icon-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <button className="new-case-btn" onClick={() => setShowNewCase(true)}>
              ＋ New Case
            </button>

            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px' }}>
              <div className="sidebar-section-lbl">Active Cases</div>
              {cases.filter(c => c.status !== 'closed').map(c => (
                <div
                  key={c.id}
                  className={`case-item ${activeCase === c.id ? 'active' : ''}`}
                  onClick={() => setActiveCase(c.id)}
                >
                  <div className="case-status-dot" style={{ background: STATUS_COLORS[c.status].dot }} />
                  <div className="case-item-body">
                    <div className="case-item-title">{c.client} · {c.section}</div>
                    <div className="case-item-meta">{c.type} · {c.date}</div>
                  </div>
                  <button className="case-delete-btn" onClick={(e) => { e.stopPropagation(); setShowDeleteModal(c.id) }}>✕</button>
                </div>
              ))}

              <div className="sidebar-section-lbl" style={{ marginTop: '8px' }}>Closed Cases</div>
              {cases.filter(c => c.status === 'closed').map(c => (
                <div
                  key={c.id}
                  className={`case-item ${activeCase === c.id ? 'active' : ''}`}
                  onClick={() => setActiveCase(c.id)}
                >
                  <div className="case-status-dot" style={{ background: STATUS_COLORS[c.status].dot }} />
                  <div className="case-item-body">
                    <div className="case-item-title">{c.client} · {c.section}</div>
                    <div className="case-item-meta">{c.type} · {c.date}</div>
                  </div>
                  <button className="case-delete-btn" onClick={(e) => { e.stopPropagation(); setShowDeleteModal(c.id) }}>✕</button>
                </div>
              ))}
            </div>

            <div className="sidebar-footer">
              <div className="user-chip">
                <div className="user-avatar">AK</div>
                <div>
                  <div className="user-name">Adv. Ali Khan</div>
                  <div className="user-role">Senior Advocate</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="dash-main">

        {/* TOPBAR */}
        <div className="dash-topbar">
          <div className="dash-greeting">Good Morning, <span>Ali</span> ⚖</div>
          <div className="topbar-right">
            <div className="search-box">
              <span style={{ color: '#6B6560', fontSize: '14px' }}>🔍</span>
              <input
                className="search-input"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="topbar-btn">📊 Reports</button>
            <button className="topbar-btn" onClick={() => navigate('/auth')}>⬚ Sign Out</button>
          </div>
        </div>

        <div className="dash-content">

          {/* STATS */}
          <div className="stats-grid">
            {[
              { icon: '🗂', lbl: 'Total Cases', val: cases.length, sub: '↑ 3 this month' },
              { icon: '⚡', lbl: 'Active', val: cases.filter(c => c.status === 'active' || c.status === 'urgent').length, sub: 'In progress' },
              { icon: '✅', lbl: 'Research Done', val: cases.filter(c => c.status === 'done').length, sub: 'Completed' },
              { icon: '🔴', lbl: 'Urgent', val: cases.filter(c => c.status === 'urgent').length, sub: 'Need attention' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <span className="stat-card-icon">{s.icon}</span>
                <div className="stat-card-lbl">{s.lbl}</div>
                <div className="stat-card-val">{s.val}</div>
                <div className="stat-card-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* CASES GRID */}
          <div className="section-header">
            <div className="section-title">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Cases'}
              <span style={{ fontSize: '12px', color: '#6B6560', fontWeight: 400, marginLeft: '8px' }}>
                ({filtered.length} cases)
              </span>
            </div>
            <div className="section-action" onClick={() => setShowNewCase(true)}>＋ Add New Case</div>
          </div>

          <div className="cases-grid">
            {filtered.map(c => {
              const col = STATUS_COLORS[c.status]
              return (
                <div
                  key={c.id}
                  className="case-card"
                  style={{ borderColor: activeCase === c.id ? col.tagBorder : undefined }}
                  onClick={() => setActiveCase(c.id)}
                >
                  <div className="case-card-top-bar" style={{ background: `linear-gradient(90deg, ${col.accent}, transparent)` }} />
                  <div className="case-card-tag" style={{ background: col.tag, color: col.tagText, borderColor: col.tagBorder }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: col.dot, display: 'inline-block' }} />
                    {c.tag}
                  </div>
                  <div className="case-card-title">{c.client} · {c.section}</div>
                  <div className="case-card-court">{c.court}</div>
                  <div className="case-card-footer">
                    <div className="case-card-ppc">{c.ppc}</div>
                    <div className="case-card-date">{c.date}</div>
                  </div>
                  <div className="case-card-actions">
                    <button className="card-action-btn primary"
                      onClick={e => { e.stopPropagation(); navigate(`/case/${c.id}/chat`) }}>
                      Open Chat
                    </button>
                    <button className="card-action-btn"
                      onClick={e => { e.stopPropagation(); navigate(`/case/${c.id}/research`) }}>
                      📄 Research
                    </button>
                    <button className="card-action-btn"
                      onClick={e => { e.stopPropagation(); navigate(`/case/${c.id}/fees`) }}
                      style={{ color: '#C9A84C', borderColor: 'rgba(201,168,76,0.25)', background: 'rgba(201,168,76,0.06)' }}>
                      💰 Fees
                    </button>
                    <button className="card-delete-btn"
                      onClick={e => { e.stopPropagation(); setShowDeleteModal(c.id) }}>
                      🗑
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete Case?</div>
            <div className="modal-sub">
              Are you sure you want to delete <strong style={{ color: '#F5F0E8' }}>
                {cases.find(c => c.id === showDeleteModal)?.client}'s case
              </strong>? This action cannot be undone and all research will be lost.
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeleteModal(null)}>Cancel</button>
              <button className="modal-btn confirm-del" onClick={() => handleDelete(showDeleteModal)}>Yes, Delete Case</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW CASE MODAL ── */}
      {showNewCase && (
        <div className="modal-overlay" onClick={() => setShowNewCase(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add New Case</div>
            <div className="modal-sub">Fill in the basic details. You can add more information in the chat.</div>
            <div className="modal-row">
              <input className="modal-input" placeholder="Plantiff/Complainant Name" value={newCase.client} onChange={e => setNewCase({ ...newCase, client: e.target.value })} />
              <input className="modal-input" placeholder="Section (e.g. 302) *" value={newCase.section} onChange={e => setNewCase({ ...newCase, section: e.target.value })} />
            </div>
            <input className="modal-input" placeholder="Case Type (e.g. Murder, Fraud)" value={newCase.type} onChange={e => setNewCase({ ...newCase, type: e.target.value })} />
            <input className="modal-input" placeholder="Court Name" value={newCase.court} onChange={e => setNewCase({ ...newCase, court: e.target.value })} />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowNewCase(false)}>Cancel</button>
              <button className="modal-btn confirm-add" onClick={handleAddCase}>＋ Create Case</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}