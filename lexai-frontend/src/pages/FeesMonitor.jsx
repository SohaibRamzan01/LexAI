import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCases, getFees, updateFees } from '../services/api'

const STATUS_DOT = { active: '#4CAF7A', done: '#C9A84C', pending: '#7B9FD4', urgent: '#E07060' }

const fmt = (n) => 'Rs. ' + Number(n).toLocaleString('en-PK')

export default function FeesMonitor() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [cases, setCases] = useState([])
    const [fees, setFees] = useState(null)
    const [loading, setLoading] = useState(true)

    const [showEditTotal, setShowEditTotal] = useState(false)
    const [showAddInstall, setShowAddInstall] = useState(false)

    const [newInstall, setNewInstall] = useState({ amount: '', dueDate: '', note: '' })
    const [newTotal, setNewTotal] = useState(0)

    useEffect(() => {
        const loadContext = async () => {
            setLoading(true)
            try {
                const casesData = await getCases()
                setCases(casesData)

                if (id) {
                    const feesData = await getFees(id)
                    setFees(feesData)
                    setNewTotal(feesData.totalAgreed || 0)
                }
            } catch (err) {
                console.error("Failed to load fees data:", err)
            } finally {
                setLoading(false)
            }
        }
        loadContext()
    }, [id])

    const markPaid = async (instId) => {
        const updated = (fees.installments || []).map(i =>
            (i._id === instId || i.id === instId)
                ? { ...i, status: 'paid', paidDate: new Date().toISOString().split('T')[0] }
                : i
        )
        const updatedFees = { ...fees, installments: updated }
        setFees(updatedFees)
        setFees(await updateFees(id, updatedFees))
    }

    const deleteInstall = async (instId) => {
        const updated = (fees.installments || []).filter(i => i._id !== instId && i.id !== instId)
        const updatedFees = { ...fees, installments: updated }
        setFees(updatedFees)
        setFees(await updateFees(id, updatedFees))
    }

    const handleAddInstall = async () => {
        if (!newInstall.amount || !newInstall.dueDate) return
        const newInst = {
            id: Date.now(),
            amount: Number(newInstall.amount),
            dueDate: newInstall.dueDate, 
            paidDate: null,
            status: 'upcoming', 
            note: newInstall.note,
        }
        const updatedFees = { ...fees, installments: [...(fees.installments || []), newInst] }
        setFees(updatedFees)
        setNewInstall({ amount: '', dueDate: '', note: '' })
        setShowAddInstall(false)
        setFees(await updateFees(id, updatedFees))
    }

    const handleUpdateTotal = async () => {
        const updatedFees = { ...fees, totalAgreed: Number(newTotal) }
        setFees(updatedFees)
        setShowEditTotal(false)
        setFees(await updateFees(id, updatedFees))
    }

    if (loading || !fees) return <div style={{ background: '#0A0908', color: '#F5F0E8', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontFamily: "'DM Sans', sans-serif" }}><div style={{ fontSize: '24px', marginRight: '12px', animation: 'spin 1s linear infinite' }}>⏳</div><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>Loading fee agreements...</div>

    const currentCase = cases.find(c => String(c._id) === String(id)) || {}

    const totalPaid = (fees.installments || []).filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const totalPending = (fees.installments || []).filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
    const totalUpcoming = (fees.installments || []).filter(i => i.status === 'upcoming').reduce((s, i) => s + i.amount, 0)
    const totalRemaining = Math.max(0, fees.totalAgreed - totalPaid)
    const paidPct = fees.totalAgreed ? Math.min(100, Math.round((totalPaid / fees.totalAgreed) * 100)) : 0

    const STATUS_STYLE = {
        paid: { bg: 'rgba(76,175,122,0.12)', border: 'rgba(76,175,122,0.25)', text: '#4CAF7A', label: '✓ Paid' },
        pending: { bg: 'rgba(224,112,96,0.12)', border: 'rgba(224,112,96,0.25)', text: '#E07060', label: '⏳ Pending' },
        upcoming: { bg: 'rgba(123,159,212,0.12)', border: 'rgba(123,159,212,0.25)', text: '#7B9FD4', label: '📅 Upcoming' },
    }

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0A0908', minHeight: '100vh', color: '#F5F0E8', display: 'flex' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }

        .fees-sidebar {
          width: 260px; min-width: 260px; background: #0E0C0A;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0;
        }
        .sidebar-header {
          padding: 18px 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sidebar-logo { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #C9A84C; }
        .sidebar-logo span { color: #F5F0E8; }
        .icon-btn {
          width: 30px; height: 30px; border-radius: 7px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; cursor: pointer; color: #6B6560; outline: none; transition: all 0.2s;
        }
        .icon-btn:hover { background: rgba(201,168,76,0.1); color: #C9A84C; }
        .new-case-btn {
          margin: 12px 12px 6px; padding: 10px 14px; border-radius: 9px;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          color: #0A0A0F; font-size: 13px; font-weight: 700;
          border: none; cursor: pointer; width: calc(100% - 24px);
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(201,168,76,0.25); transition: opacity 0.2s;
        }
        .new-case-btn:hover { opacity: 0.9; }
        .sidebar-section-lbl {
          padding: 10px 20px 5px; font-size: 10px; font-weight: 700; color: #3A3530;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .case-item {
          padding: 9px 12px; margin: 2px 8px; border-radius: 8px; cursor: pointer;
          display: flex; align-items: flex-start; gap: 9px;
          transition: background 0.15s; border: 1px solid transparent;
        }
        .case-item:hover { background: rgba(255,255,255,0.04); }
        .case-item.active { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.2); }
        .case-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .case-item-title { font-size: 12px; font-weight: 600; color: #F5F0E8; margin-bottom: 2px; }
        .case-item-meta  { font-size: 11px; color: #6B6560; }
        .sidebar-footer  { margin-top: auto; padding: 12px; border-top: 1px solid rgba(255,255,255,0.07); }
        .user-chip {
          display: flex; align-items: center; gap: 10px; padding: 9px 10px;
          border-radius: 9px; background: rgba(255,255,255,0.03); cursor: pointer;
        }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #0A0A0F;
        }
        .user-name { font-size: 12px; font-weight: 600; color: #F5F0E8; }
        .user-role { font-size: 10px; color: #6B6560; }

        /* MAIN */
        .fees-main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .fees-topbar {
          padding: 14px 28px; border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,9,8,0.95); backdrop-filter: blur(8px);
          flex-shrink: 0; gap: 16px;
        }
        .fees-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #F5F0E8; }
        .fees-title span { color: #C9A84C; }
        .fees-meta { font-size: 11px; color: #6B6560; margin-top: 2px; }
        .topbar-actions { display: flex; gap: 7px; flex-shrink: 0; }
        .topbar-btn {
          padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
          color: #6B6560; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .topbar-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.25); }
        .topbar-btn.gold {
          color: #C9A84C; border-color: rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.08);
        }
        .topbar-btn.gold:hover { background: rgba(201,168,76,0.15); }
        .add-btn {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
          background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 12px rgba(201,168,76,0.25); transition: opacity 0.2s;
        }
        .add-btn:hover { opacity: 0.88; }

        /* CONTENT */
        .fees-content { flex: 1; overflow-y: auto; padding: 28px 32px; }

        /* SUMMARY CARDS */
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
        .summary-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 18px 20px; position: relative; overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .summary-card:hover { transform: translateY(-2px); }
        .summary-card-accent { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .summary-card-icon { font-size: 20px; margin-bottom: 10px; display: block; }
        .summary-card-lbl { font-size: 10px; color: #6B6560; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 6px; }
        .summary-card-val { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; }
        .summary-card-sub { font-size: 11px; color: #6B6560; margin-top: 4px; }

        /* PROGRESS BAR */
        .progress-section {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;
        }
        .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .progress-title { font-size: 14px; font-weight: 700; color: #F5F0E8; }
        .progress-pct {
          font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #C9A84C;
        }
        .progress-track {
          height: 10px; background: rgba(255,255,255,0.06); border-radius: 6px; overflow: hidden; margin-bottom: 10px;
        }
        .progress-fill {
          height: 100%; border-radius: 6px;
          background: linear-gradient(90deg, #C9A84C, #4CAF7A);
          transition: width 0.6s ease;
        }
        .progress-labels { display: flex; justify-content: space-between; font-size: 11px; color: #6B6560; }

        /* INSTALLMENTS TABLE */
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-title  { font-size: 14px; font-weight: 700; color: #F5F0E8; }

        .install-table { width: 100%; border-collapse: collapse; }
        .install-table th {
          padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700;
          color: #3A3530; text-transform: uppercase; letter-spacing: 0.08em;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .install-row {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.15s;
        }
        .install-row:hover { background: rgba(255,255,255,0.02); }
        .install-row td { padding: 13px 14px; font-size: 13px; color: #F5F0E8; }
        .install-num {
          font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700;
          color: rgba(201,168,76,0.3);
        }
        .install-amount { font-weight: 700; font-family: 'DM Mono', monospace; color: #F5F0E8; font-size: 13px; }
        .install-date { font-size: 12px; color: #A09890; }
        .install-note { font-size: 11px; color: #6B6560; font-style: italic; }
        .status-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 5px; font-size: 10px; font-weight: 700;
          border: 1px solid; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
        }
        .install-actions { display: flex; gap: 5px; }
        .inst-btn {
          padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .inst-btn.pay { background: rgba(76,175,122,0.1); border-color: rgba(76,175,122,0.25); color: #4CAF7A; }
        .inst-btn.pay:hover { background: rgba(76,175,122,0.2); }
        .inst-btn.del { background: rgba(224,112,96,0.08); border-color: rgba(224,112,96,0.2); color: #E07060; }
        .inst-btn.del:hover { background: rgba(224,112,96,0.15); }

        /* TIMELINE */
        .timeline { position: relative; padding-left: 24px; }
        .timeline::before {
          content: ''; position: absolute; left: 7px; top: 0; bottom: 0;
          width: 2px; background: rgba(255,255,255,0.06);
        }
        .tl-item { position: relative; margin-bottom: 20px; }
        .tl-dot {
          position: absolute; left: -20px; top: 4px;
          width: 14px; height: 14px; border-radius: 50%; border: 2px solid;
          background: #0A0908;
        }
        .tl-content {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 12px 16px;
          transition: border-color 0.2s;
        }
        .tl-content:hover { border-color: rgba(201,168,76,0.2); }
        .tl-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .tl-amount { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 700; color: #F5F0E8; }
        .tl-date { font-size: 11px; color: #6B6560; }
        .tl-note { font-size: 12px; color: #A09890; }
        .tl-paid-on { font-size: 11px; color: #4CAF7A; margin-top: 4px; }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
        }
        .modal {
          background: #151210; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 32px; width: 460px;
          box-shadow: 0 28px 70px rgba(0,0,0,0.6);
          animation: modalIn 0.2s ease;
        }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #F5F0E8; margin-bottom: 6px; }
        .modal-sub { font-size: 13px; color: #6B6560; margin-bottom: 24px; line-height: 1.6; }
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: #6B6560; margin-bottom: 6px; letter-spacing: 0.06em; text-transform: uppercase; }
        .form-input {
          width: 100%; padding: 11px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #F5F0E8; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.04); }
        .form-input::placeholder { color: #3A3530; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .modal-btn {
          flex: 1; padding: 12px; border-radius: 9px; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s;
        }
        .modal-btn:hover { opacity: 0.88; }
        .modal-btn.cancel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #6B6560; }
        .modal-btn.confirm { background: linear-gradient(135deg, #C9A84C, #A8782A); border: none; color: #0A0A0F; }

        /* NOTES BOX */
        .notes-box {
          background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.18);
          border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .notes-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
        .notes-text { font-size: 13px; color: #A09890; line-height: 1.6; }
        .notes-label { font-size: 10px; font-weight: 700; color: #C9A84C; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
      `}</style>

            {/* SIDEBAR */}
            <div className="fees-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">Lex<span>AI</span></div>
                    <button className="icon-btn" onClick={() => navigate('/dashboard')}>🏠</button>
                </div>
                <button className="new-case-btn" onClick={() => navigate('/dashboard')}>＋ New Case</button>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="sidebar-section-lbl">Cases</div>
                    {cases.map(c => (
                        <div key={c._id}
                            className={`case-item ${String(c._id) === String(id) ? 'active' : ''}`}
                            onClick={() => navigate(`/case/${c._id}/fees`)}>
                            <div className="case-dot" style={{ background: STATUS_DOT[c.status] || STATUS_DOT.pending }} />
                            <div>
                                <div className="case-item-title">{c.clientName} · {c.section}</div>
                                <div className="case-item-meta">Fees Monitor</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <div className="user-chip" onClick={() => navigate('/dashboard')}>
                        <div className="user-avatar">{JSON.parse(localStorage.getItem('lexai_user') || '{}').firstName?.[0] || 'A'}</div>
                        <div>
                            <div className="user-name">Adv. {JSON.parse(localStorage.getItem('lexai_user') || '{}').firstName || 'Lawyer'}</div>
                            <div className="user-role">Senior Advocate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN */}
            <div className="fees-main">

                {/* TOPBAR */}
                <div className="fees-topbar">
                    <div>
                        <div className="fees-title">Fees Monitor · <span>{currentCase.clientName || 'Loading...'}</span></div>
                        <div className="fees-meta">{currentCase.caseCode || ''} · {currentCase.section || ''} · {currentCase.court || ''}</div>
                    </div>
                    <div className="topbar-actions">
                        <button className="topbar-btn" onClick={() => navigate(`/case/${id}/chat`)}>💬 Chat</button>
                        <button className="topbar-btn gold" onClick={() => navigate(`/case/${id}/research`)}>📄 Research</button>
                        <button className="topbar-btn" onClick={() => { setNewTotal(fees.totalAgreed); setShowEditTotal(true) }}>✏ Edit Total Fee</button>
                        <button className="add-btn" onClick={() => setShowAddInstall(true)}>＋ Add Installment</button>
                    </div>
                </div>

                <div className="fees-content">

                    {/* NOTES */}
                    {fees.notes && (
                        <div className="notes-box">
                            <div className="notes-icon">📝</div>
                            <div>
                                <div className="notes-label">Fee Agreement Note</div>
                                <div className="notes-text">{fees.notes}</div>
                            </div>
                        </div>
                    )}

                    {/* SUMMARY CARDS */}
                    <div className="summary-grid">
                        {[
                            { icon: '💰', label: 'Total Agreed Fee', val: fmt(fees.totalAgreed), sub: 'Full retainer', color: '#C9A84C', accent: 'linear-gradient(90deg,#C9A84C,transparent)' },
                            { icon: '✅', label: 'Total Received', val: fmt(totalPaid), sub: `${fees.installments.filter(i => i.status === 'paid').length} payments`, color: '#4CAF7A', accent: 'linear-gradient(90deg,#4CAF7A,transparent)' },
                            { icon: '⏳', label: 'Pending / Due', val: fmt(totalPending), sub: `${fees.installments.filter(i => i.status === 'pending').length} overdue`, color: '#E07060', accent: 'linear-gradient(90deg,#E07060,transparent)' },
                            { icon: '📅', label: 'Still Remaining', val: fmt(totalRemaining), sub: `${fees.installments.filter(i => i.status !== 'paid').length} installments left`, color: '#7B9FD4', accent: 'linear-gradient(90deg,#7B9FD4,transparent)' },
                        ].map((s, i) => (
                            <div key={i} className="summary-card" style={{ borderColor: `${s.color}25` }}>
                                <div className="summary-card-accent" style={{ background: s.accent }} />
                                <span className="summary-card-icon">{s.icon}</span>
                                <div className="summary-card-lbl">{s.label}</div>
                                <div className="summary-card-val" style={{ color: s.color }}>{s.val}</div>
                                <div className="summary-card-sub">{s.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* PROGRESS */}
                    <div className="progress-section">
                        <div className="progress-header">
                            <div className="progress-title">Payment Progress</div>
                            <div className="progress-pct">{paidPct}% Collected</div>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${paidPct}%` }} />
                        </div>
                        <div className="progress-labels">
                            <span>Rs. 0</span>
                            <span style={{ color: '#4CAF7A' }}>{fmt(totalPaid)} collected</span>
                            <span>{fmt(fees.totalAgreed)} total</span>
                        </div>
                    </div>

                    {/* TWO COLUMN: TABLE + TIMELINE */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

                        {/* INSTALLMENTS TABLE */}
                        <div>
                            <div className="section-header">
                                <div className="section-title">Installment Schedule</div>
                                <button
                                    style={{ fontSize: 11, color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer' }}
                                    onClick={() => setShowAddInstall(true)}>
                                    ＋ Add
                                </button>
                            </div>
                            <table className="install-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Amount</th>
                                        <th>Due Date</th>
                                        <th>Paid On</th>
                                        <th>Note</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(fees.installments || []).map((inst, idx) => {
                                        const st = STATUS_STYLE[inst.status] || STATUS_STYLE.upcoming
                                        return (
                                            <tr key={inst._id || inst.id} className="install-row">
                                                <td><div className="install-num">{String(idx + 1).padStart(2, '0')}</div></td>
                                                <td><div className="install-amount">{fmt(inst.amount)}</div></td>
                                                <td><div className="install-date">{inst.dueDate}</div></td>
                                                <td><div className="install-date" style={{ color: inst.paidDate ? '#4CAF7A' : '#3A3530' }}>{inst.paidDate || '—'}</div></td>
                                                <td><div className="install-note">{inst.note || '—'}</div></td>
                                                <td>
                                                    <span className="status-badge" style={{ background: st.bg, borderColor: st.border, color: st.text }}>
                                                        {st.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="install-actions">
                                                        {inst.status !== 'paid' && (
                                                            <button className="inst-btn pay" onClick={() => markPaid(inst._id || inst.id)}>Mark Paid</button>
                                                        )}
                                                        <button className="inst-btn del" onClick={() => deleteInstall(inst._id || inst.id)}>✕</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* TIMELINE */}
                        <div>
                            <div className="section-header">
                                <div className="section-title">Payment Timeline</div>
                            </div>
                            <div className="timeline">
                                {Array.isArray(fees.installments) && fees.installments.length > 0 ? fees.installments.map((inst) => {
                                    const st = STATUS_STYLE[inst.status] || STATUS_STYLE.upcoming
                                    return (
                                        <div key={inst._id || inst.id} className="tl-item">
                                            <div className="tl-dot" style={{ borderColor: st.text, background: inst.status === 'paid' ? st.text : '#0A0908' }} />
                                            <div className="tl-content">
                                                <div className="tl-top">
                                                    <div className="tl-amount">{fmt(inst.amount)}</div>
                                                    <span className="status-badge" style={{ background: st.bg, borderColor: st.border, color: st.text, fontSize: 9 }}>
                                                        {st.label}
                                                    </span>
                                                </div>
                                                <div className="tl-date">Due: {inst.dueDate}</div>
                                                {inst.note && <div className="tl-note">{inst.note}</div>}
                                                {inst.paidDate && <div className="tl-paid-on">✓ Received on {inst.paidDate}</div>}
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <div style={{ color: '#6B6560', fontSize: 13, fontStyle: 'italic', marginTop: 10 }}>No installments tracked yet. Add one above.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD INSTALLMENT MODAL */}
            {showAddInstall && (
                <div className="modal-overlay" onClick={() => setShowAddInstall(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">Add Installment</div>
                        <div className="modal-sub">Add a new scheduled payment for this case.</div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Amount (PKR) *</label>
                                <input className="form-input" type="number" placeholder="50000"
                                    value={newInstall.amount} onChange={e => setNewInstall({ ...newInstall, amount: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Due Date *</label>
                                <input className="form-input" type="date"
                                    value={newInstall.dueDate} onChange={e => setNewInstall({ ...newInstall, dueDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Note (optional)</label>
                            <input className="form-input" placeholder="e.g. Final payment after hearing"
                                value={newInstall.note} onChange={e => setNewInstall({ ...newInstall, note: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowAddInstall(false)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleAddInstall}>＋ Add Installment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT TOTAL FEE MODAL */}
            {showEditTotal && (
                <div className="modal-overlay" onClick={() => setShowEditTotal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">Edit Total Agreed Fee</div>
                        <div className="modal-sub">Update the total fee amount agreed with the client.</div>
                        <div className="form-group">
                            <label className="form-label">Total Fee (PKR) *</label>
                            <input className="form-input" type="number"
                                value={newTotal} onChange={e => setNewTotal(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fee Note</label>
                            <input className="form-input" placeholder="Reason for update..."
                                value={fees.notes}
                                onChange={e => setFees(prev => ({ ...prev, notes: e.target.value }))} />
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowEditTotal(false)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleUpdateTotal}>Update Fee</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}