import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCases, getCase, updateCase, addHearing, deleteHearing } from '../services/api'

const STATUS_DOT = { active: '#4CAF7A', done: '#C9A84C', pending: '#7B9FD4', urgent: '#E07060', closed: '#4A4540' }

const HEARING_STEPS = [
    "Summon", "Notice", "Written Statement", "Replication", 
    "Issues", "Evidence", "Arguments", "Judgment", 
    "Order", "Execution", "Appeal Filed", "Bail Application", 
    "Stay Order", "Acquittal", "Conviction", "Other"
];

export default function CaseDetail() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [cases,          setCases]          = useState([])
    const [caseData,       setCaseData]       = useState(null)
    const [loading,        setLoading]        = useState(true)
    const [error,          setError]          = useState(null)
    const [showAddHearing, setShowAddHearing] = useState(false)
    const [showEditCase,   setShowEditCase]   = useState(false)
    const [hearingForm,    setHearingForm]    = useState({
        previousDate: "", adjournDate: "", step: "Summon", notes: "",
    })
    const [editForm,       setEditForm]       = useState({})
    const [savingHearing,  setSavingHearing]  = useState(false)
    const [savingEdit,     setSavingEdit]     = useState(false)
    const [deletingId,     setDeletingId]     = useState(null)

    useEffect(() => {
        const loadCasesList = async () => {
            try {
                const casesData = await getCases();
                setCases(casesData);
            } catch (err) {
                console.error("Failed to load list", err);
            }
        };
        loadCasesList();
    }, []);

    const loadCase = async () => {
        try {
            setLoading(true);
            const data = await getCase(id);
            setCaseData(data);
            // Pre-fill the edit form with existing values
            setEditForm({
                title:                  data.title         || "",
                clientName:             data.clientName    || "",
                caseNumber:             data.caseNumber    || "",
                caseYear:               data.caseYear      || "",
                court:                  data.court         || "",
                caseType:               data.caseType      || "",
                onBehalfOf:             data.onBehalfOf    || "",
                partyName:              data.partyName     || "",
                contactNo:              data.contactNo     || "",
                respondentName:         data.respondentName || "",
                section:                data.section       || "",
                firNumber:              data.firNumber     || "",
                policeStation:          data.policeStation || "",
                adverseAdvocateName:    data.adverseAdvocateName    || "",
                adverseAdvocateContact: data.adverseAdvocateContact || "",
                status:                 data.status        || "active",
                language:               data.language      || "english",
            });
            setError(null);
        } catch (err) {
            setError("Failed to load case. " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadCase();
    }, [id]);

    const handleUpdateCase = async () => {
        setSavingEdit(true)
        try {
            await updateCase(id, editForm)
            setShowEditCase(false)
            await loadCase()
            const casesData = await getCases()
            setCases(casesData)
        } catch (err) {
            console.error("Failed to update case:", err)
        } finally {
            setSavingEdit(false)
        }
    }

    const handleAddHearingSubmit = async () => {
        if (!hearingForm.adjournDate) return
        setSavingHearing(true)
        try {
            await addHearing(id, hearingForm)
            setShowAddHearing(false)
            setHearingForm({ previousDate: '', adjournDate: '', step: 'Summon', notes: '' })
            await loadCase()
        } catch (err) {
            console.error("Failed to add hearing:", err)
        } finally {
            setSavingHearing(false)
        }
    }

    const handleDeleteHearing = async (hearingId) => {
        setDeletingId(hearingId)
        try {
            await deleteHearing(id, hearingId)
            await loadCase()
        } catch (err) {
            console.error("Failed to delete hearing:", err)
        } finally {
            setDeletingId(null)
        }
    }

    if (error) return (
        <div style={{ background: '#0A0908', color: '#E07060', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Error Loading Case</div>
            <div style={{ color: '#6B6560', marginBottom: '24px' }}>{error}</div>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', background: '#C9A84C', border: 'none', borderRadius: '8px', color: '#0A0908', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Back to Dashboard</button>
        </div>
    );

    if (loading) return (
        <div style={{ background: '#0A0908', color: '#C9A84C', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⏳</div>
            <div style={{ fontSize: '16px', color: '#F5F0E8' }}>Loading case details...</div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!caseData && !loading) return (
        <div style={{ background: '#0A0908', color: '#F5F0E8', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Case Not Found</div>
            <div style={{ color: '#6B6560', marginBottom: '24px' }}>The case you are looking for does not exist or you don't have access.</div>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', background: '#C9A84C', border: 'none', borderRadius: '8px', color: '#0A0908', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Back to Dashboard</button>
        </div>
    );

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0A0908', minHeight: '100vh', color: '#F5F0E8', display: 'flex' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }

        .sidebar {
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
        .main-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .topbar {
          padding: 14px 28px; border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,9,8,0.95); backdrop-filter: blur(8px);
          flex-shrink: 0; gap: 16px;
        }
        .topbar-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #F5F0E8; }
        .topbar-title span { color: #C9A84C; }
        .topbar-meta { font-size: 11px; color: #6B6560; margin-top: 2px; }
        .topbar-actions { display: flex; gap: 7px; flex-shrink: 0; }
        
        .topbar-btn {
          padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
          color: #6B6560; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .topbar-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.25); }
        .add-btn {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
          background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 12px rgba(201,168,76,0.25); transition: opacity 0.2s;
        }
        .add-btn:hover { opacity: 0.88; }
        
        .content { flex: 1; overflow-y: auto; padding: 28px 32px; }

        /* LAYOUT */
        .layout-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 350px;
            gap: 24px;
        }

        /* INFO CARD */
        .info-card {
            background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px; padding: 24px; position: relative;
        }
        .info-header {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .info-title {
            font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #F5F0E8;
        }
        .info-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        .info-field {
            display: flex; flex-direction: column; gap: 4px;
        }
        .info-label {
            font-size: 11px; font-weight: 700; color: #6B6560; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .info-val {
            font-size: 14px; color: #F5F0E8; font-family: 'DM Mono', monospace;
        }

        /* TIMELINE */
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-title  { font-size: 14px; font-weight: 700; color: #F5F0E8; }
        .timeline { position: relative; padding-left: 24px; margin-top: 20px;}
        .timeline::before {
          content: ''; position: absolute; left: 7px; top: 0; bottom: 0;
          width: 2px; background: rgba(255,255,255,0.06);
        }
        .tl-item { position: relative; margin-bottom: 20px; }
        .tl-dot {
          position: absolute; left: -20px; top: 4px;
          width: 14px; height: 14px; border-radius: 50%; border: 2px solid #C9A84C;
          background: #0A0908;
        }
        .tl-content {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 12px 16px;
          transition: border-color 0.2s; position: relative;
        }
        .tl-content:hover { border-color: rgba(201,168,76,0.2); }
        .tl-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .tl-step { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 700; color: #0A0908; background: #C9A84C; padding: 4px 10px; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em; }
        .tl-date { font-size: 12px; color: #F5F0E8; }
        .tl-label { font-size: 10px; color: #6B6560; text-transform: uppercase; }
        .tl-note { font-size: 12px; color: #A09890; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;}
        .tl-delete {
            position: absolute; top: 12px; right: 12px;
            background: transparent; border: none; color: #E07060; cursor: pointer;
            font-size: 14px; opacity: 0; transition: opacity 0.2s;
        }
        .tl-content:hover .tl-delete { opacity: 1; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: capitalize; border: 1px solid; }


        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
        }
        .modal {
          background: #151210; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 32px; width: 600px;
          max-height: 90vh; overflow-y: auto;
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

      `}</style>

            {/* SIDEBAR */}
            <div className="sidebar">
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
                            onClick={() => navigate(`/case/${c._id}/details`)}>
                            <div className="case-dot" style={{ background: STATUS_DOT[c.status] || STATUS_DOT.pending }} />
                            <div>
                                <div className="case-item-title">{c.clientName} · {c.section}</div>
                                <div className="case-item-meta">Details</div>
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
            <div className="main-col">
                <div className="topbar">
                    <div>
                        <div className="topbar-title">Case Details · <span>{caseData.clientName || 'Loading...'}</span></div>
                        <div className="topbar-meta">{caseData.caseCode || ''} · {caseData.section || ''} · {caseData.court || ''}</div>
                    </div>
                    <div className="topbar-actions">
                        <button className="topbar-btn" onClick={() => navigate(`/case/${id}/chat`)}>💬 Chat</button>
                        <button className="topbar-btn" onClick={() => navigate(`/case/${id}/research`)}>📄 Research</button>
                        <button className="topbar-btn" onClick={() => navigate(`/case/${id}/fees`)}>💰 Fees</button>
                        <button className="topbar-btn" onClick={() => setShowEditCase(true)}>✏ Edit Case</button>
                    </div>
                </div>

                <div className="content">
                    <div className="layout-grid">
                        
                        {/* CASE INFO CARD */}
                        <div className="info-card">
                            <div className="info-header">
                                <div className="info-title">Case Master File</div>
                            </div>
                            
                            <div className="info-grid">
                                <div className="info-field">
                                    <span className="info-label">Client Name</span>
                                    <span className="info-val">{caseData.clientName || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Title</span>
                                    <span className="info-val">{caseData.title || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Case No</span>
                                    <span className="info-val">
                                        {caseData.caseNumber ? (
                                            <>
                                                <span style={{color: '#7B9FD4'}}>{caseData.caseNumber}</span> / <span style={{color: '#C9A84C'}}>{caseData.caseYear || '—'}</span>
                                            </>
                                        ) : '—'}
                                    </span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Case Code</span>
                                    <span className="info-val" style={{color: '#C9A84C'}}>{caseData.caseCode || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Court</span>
                                    <span className="info-val">{caseData.court || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Section / U.S.</span>
                                    <span className="info-val">{caseData.section || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Internal Status</span>
                                    <div style={{ marginTop: '2px' }}>
                                        <span className="status-badge" style={{ color: STATUS_DOT[caseData.status] || '#F5F0E8', borderColor: `${STATUS_DOT[caseData.status] || '#F5F0E8'}40`, background: `${STATUS_DOT[caseData.status] || '#F5F0E8'}15` }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT[caseData.status] || '#F5F0E8' }} />
                                            {caseData.status || '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Language / Translation</span>
                                    <span className="info-val" style={{textTransform: 'capitalize'}}>{caseData.language || '—'}</span>
                                </div>
                                
                                <div className="info-field" style={{ gridColumn: '1 / -1', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginTop: '10px' }}>
                                    <span className="info-label" style={{color: '#C9A84C'}}>Party Details</span>
                                </div>
                                
                                <div className="info-field">
                                    <span className="info-label">On Behalf Of</span>
                                    <span className="info-val" style={{color: '#7B9FD4'}}>{caseData.onBehalfOf || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Party Name</span>
                                    <span className="info-val" style={{color: '#C9A84C', fontWeight: 600}}>{caseData.partyName || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Contact No</span>
                                    <span className="info-val">{caseData.contactNo || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Respondent Name</span>
                                    <span className="info-val">{caseData.respondentName || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">FIR Number</span>
                                    <span className="info-val">{caseData.firNumber || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Police Station</span>
                                    <span className="info-val">{caseData.policeStation || '—'}</span>
                                </div>

                                <div className="info-field" style={{ gridColumn: '1 / -1', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginTop: '10px' }}>
                                    <span className="info-label" style={{color: '#E07060'}}>Adverse Counsel</span>
                                </div>

                                <div className="info-field">
                                    <span className="info-label">Adverse Advocate Name</span>
                                    <span className="info-val">{caseData.adverseAdvocateName || '—'}</span>
                                </div>
                                <div className="info-field">
                                    <span className="info-label">Advocate Contact</span>
                                    <span className="info-val">{caseData.adverseAdvocateContact || '—'}</span>
                                </div>

                            </div>
                        </div>

                        {/* HEARINGS PANEL */}
                        <div>
                            <div className="section-header">
                                <div className="section-title">Hearing History</div>
                                <button className="add-btn" onClick={() => setShowAddHearing(true)}>＋ Add Hearing</button>
                            </div>

                            <div className="timeline">
                                {caseData.hearings && caseData.hearings.length > 0 ? (
                                    [...caseData.hearings].sort((a,b) => new Date(b.adjournDate) - new Date(a.adjournDate)).map(h => (
                                        <div key={h._id} className="tl-item">
                                            <div className="tl-dot" />
                                            <div className="tl-content">
                                                <button className="tl-delete" onClick={() => handleDeleteHearing(h._id)} disabled={deletingId === h._id}>{deletingId === h._id ? '⏳' : '✕'}</button>
                                                <div className="tl-top">
                                                    <div className="tl-step">{h.step}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                                                    <div>
                                                        <span className="tl-label">Prev Date: </span>
                                                        <span className="tl-date" style={{ color: '#4CAF7A' }}>{h.previousDate ? new Date(h.previousDate).toLocaleDateString() : '—'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="tl-label" style={{color: '#F5A623', fontWeight: 600}}>Adjourn Dt: </span>
                                                        <span className="tl-date" style={{ color: '#F5A623', fontWeight: 600 }}>{h.adjournDate ? new Date(h.adjournDate).toLocaleDateString() : '—'}</span>
                                                    </div>
                                                </div>
                                                {h.notes && <div className="tl-note">{h.notes}</div>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: '#6B6560', fontSize: 13, fontStyle: 'italic', marginTop: 10 }}>No hearings recorded yet.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* EDIT CASE MODAL */}
            {showEditCase && (
                <div className="modal-overlay" onClick={() => setShowEditCase(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">Edit Case Details</div>
                        <div className="modal-sub">Update the master file for this case.</div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Client Name *</label>
                                <input className="form-input" value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Case Title *</label>
                                <input className="form-input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Case Type</label>
                                <input className="form-input" value={editForm.caseType} onChange={e => setEditForm({...editForm, caseType: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Section / U.S.</label>
                                <input className="form-input" value={editForm.section} onChange={e => setEditForm({...editForm, section: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Court</label>
                                <input className="form-input" value={editForm.court} onChange={e => setEditForm({...editForm, court: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="done">Done</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Case Number</label>
                                <input className="form-input" value={editForm.caseNumber} onChange={e => setEditForm({...editForm, caseNumber: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Case Year</label>
                                <input className="form-input" value={editForm.caseYear} onChange={e => setEditForm({...editForm, caseYear: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">On Behalf Of</label>
                                <select className="form-input" value={editForm.onBehalfOf} onChange={e => setEditForm({...editForm, onBehalfOf: e.target.value})}>
                                    <option value="Plaintiff">Plaintiff</option>
                                    <option value="Defendant">Defendant</option>
                                    <option value="Petitioner">Petitioner</option>
                                    <option value="Respondent">Respondent</option>
                                    <option value="Complainant">Complainant</option>
                                    <option value="Accused">Accused</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Party Name</label>
                                <input className="form-input" value={editForm.partyName} onChange={e => setEditForm({...editForm, partyName: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Contact No</label>
                                <input className="form-input" value={editForm.contactNo} onChange={e => setEditForm({...editForm, contactNo: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Respondent Name</label>
                                <input className="form-input" value={editForm.respondentName} onChange={e => setEditForm({...editForm, respondentName: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">FIR Number</label>
                                <input className="form-input" value={editForm.firNumber} onChange={e => setEditForm({...editForm, firNumber: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Police Station</label>
                                <input className="form-input" value={editForm.policeStation} onChange={e => setEditForm({...editForm, policeStation: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Adverse Adv. Name</label>
                                <input className="form-input" value={editForm.adverseAdvocateName} onChange={e => setEditForm({...editForm, adverseAdvocateName: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Adverse Adv. Contact</label>
                                <input className="form-input" value={editForm.adverseAdvocateContact} onChange={e => setEditForm({...editForm, adverseAdvocateContact: e.target.value})} />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowEditCase(false)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleUpdateCase} disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD HEARING MODAL */}
            {showAddHearing && (
                <div className="modal-overlay" onClick={() => setShowAddHearing(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{width: '460px'}}>
                        <div className="modal-title">Record Hearing</div>
                        <div className="modal-sub">Add a new hearing date and stage for this case.</div>
                        
                        <div className="form-group">
                            <label className="form-label">Step / Stage *</label>
                            <select className="form-input" value={hearingForm.step} onChange={e => setHearingForm({...hearingForm, step: e.target.value})}>
                                {HEARING_STEPS.map(step => (
                                    <option key={step} value={step}>{step}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Previous Date</label>
                                <input className="form-input" type="date" value={hearingForm.previousDate} onChange={e => setHearingForm({...hearingForm, previousDate: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Adjourn/Next Date *</label>
                                <input className="form-input" type="date" value={hearingForm.adjournDate} onChange={e => setHearingForm({...hearingForm, adjournDate: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea className="form-input" rows={3} placeholder="Add any proceeding notes..." value={hearingForm.notes} onChange={e => setHearingForm({...hearingForm, notes: e.target.value})} style={{resize: 'none'}} />
                        </div>

                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowAddHearing(false)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleAddHearingSubmit} disabled={savingHearing}>{savingHearing ? 'Saving...' : 'Add Hearing'}</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
