import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCases, getResearch, generateResearch, getResearchVersions, getResearchVersion, generateGuide } from '../services/api'
import renderLegalText from '../utils/renderLegalText'

const STATUS_DOT = { active: '#4CAF7A', done: '#C9A84C', pending: '#7B9FD4', urgent: '#E07060' }

const OUTLINE = [
  { id: 'law',         label: 'Applicable Law',       icon: '⚖' },
  { id: 'bail',        label: 'Bail Grounds',          icon: '🔓' },
  { id: 'precedents',  label: 'Case Precedents',       icon: '📚' },
  { id: 'defense',     label: 'Defense Strategy',      icon: '🛡' },
  { id: 'script',      label: 'Court Script',          icon: '🎤' },
  { id: 'constitution',label: 'Constitutional Rights', icon: '📜' },
]

const SECTION_COLORS = {
  law:          '#1565C0',
  bail:         '#E65100',
  precedents:   '#4A148C',
  defense:      '#1B5E20',
  script:       '#C9A84C',
  constitution: '#006064',
}

export default function Research() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeSection, setActiveSection] = useState('law')
  const [expandedItems, setExpandedItems] = useState({})
  const [cases, setCases] = useState([])
  const [researchData, setResearchData] = useState(null)
  const [versions, setVersions] = useState([])
  const [activeVersionNum, setActiveVersionNum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [editingSections, setEditingSections] = useState({})
  const [editedData, setEditedData] = useState({})
  const [savingVersion, setSavingVersion] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [changeNote, setChangeNote] = useState('')
  const [toastMessage, setToastMessage] = useState(null)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [generatingGuide, setGeneratingGuide] = useState(false)
  const contentRef = useRef(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const casesData = await getCases()
      setCases(casesData)

      if (id) {
        const rData = await getResearch(id)
        const vData = await getResearchVersions(id)
        if (Array.isArray(vData)) setVersions(vData)

        if (rData && rData.applicableLaw) {
            rData.sections = [
              { id: 'law',          icon: '⚖', title: 'Applicable Law', content: rData.applicableLaw },
              { id: 'bail',         icon: '🔓', title: 'Bail Grounds', content: rData.bailGrounds },
              { id: 'precedents',   icon: '📚', title: 'Case Precedents', precedents: rData.precedents },
              { id: 'defense',      icon: '🛡', title: 'Defense Strategy', content: rData.defenseStrategy },
              { id: 'script',       icon: '🎤', title: 'Court Script', content: rData.courtScript },
              { id: 'constitution', icon: '📜', title: 'Constitutional Rights', content: rData.constitutionalRights },
            ]
            setResearchData(rData)
            if (Array.isArray(vData) && vData.length > 0) {
              setActiveVersionNum(vData[vData.length - 1].versionNumber)
            }
        } else {
            setResearchData(null) // No research generated yet
        }
      }
    } catch (err) {
      console.error(err)
      setResearchData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleGenerateResearch = async () => {
    setGenerating(true)
    try {
      const gData = await generateResearch(id)
      loadData() // Re-fetch the full set including updated versions panel!
    } catch (err) {
      console.error("Failed to generate research:", err)
    } finally {
      setGenerating(false)
    }
  }

  const handleVersionClick = async (versionNum) => {
    setActiveVersionNum(versionNum)
    try {
      const vData = await getResearchVersion(id, versionNum)
      if (vData && vData.applicableLaw) {
          vData.sections = [
            { id: 'law',          icon: '⚖', title: 'Applicable Law', content: vData.applicableLaw },
            { id: 'bail',         icon: '🔓', title: 'Bail Grounds', content: vData.bailGrounds },
            { id: 'precedents',   icon: '📚', title: 'Case Precedents', precedents: vData.precedents },
            { id: 'defense',      icon: '🛡', title: 'Defense Strategy', content: vData.defenseStrategy },
            { id: 'script',       icon: '🎤', title: 'Court Script', content: vData.courtScript },
            { id: 'constitution', icon: '📜', title: 'Constitutional Rights', content: vData.constitutionalRights },
          ]
          setResearchData(vData)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveVersion = async () => {
    setSavingVersion(true)
    const updatedResearch = {
      applicableLaw:        editedData.law || researchData?.applicableLaw,
      bailGrounds:          editedData.bail || researchData?.bailGrounds,
      defenseStrategy:      editedData.defense || researchData?.defenseStrategy,
      courtScript:          editedData.script || researchData?.courtScript,
      constitutionalRights: editedData.constitution || researchData?.constitutionalRights,
      changeNote:           changeNote || "Manual edit by lawyer",
    }
    
    try {
      const res = await fetch(`http://localhost:5000/api/research/${id}`, {
        method:  "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": "Bearer " + localStorage.getItem("lexai_token"),
        },
        body: JSON.stringify(updatedResearch),
      })
      const data = await res.json()
      
      if (data.research && data.research.applicableLaw) {
          const rData = data.research
          rData.sections = [
            { id: 'law',          icon: '⚖', title: 'Applicable Law', content: rData.applicableLaw },
            { id: 'bail',         icon: '🔓', title: 'Bail Grounds', content: rData.bailGrounds },
            { id: 'precedents',   icon: '📚', title: 'Case Precedents', precedents: rData.precedents },
            { id: 'defense',      icon: '🛡', title: 'Defense Strategy', content: rData.defenseStrategy },
            { id: 'script',       icon: '🎤', title: 'Court Script', content: rData.courtScript },
            { id: 'constitution', icon: '📜', title: 'Constitutional Rights', content: rData.constitutionalRights },
          ]
          setResearchData(rData)
          setVersions(rData.versions || [])
          if (rData.versions && rData.versions.length > 0) {
              setActiveVersionNum(rData.versions[rData.versions.length - 1].versionNumber)
          }
      }
      setEditingSections({})
      setEditedData({})
      setShowNoteModal(false)
      setChangeNote('')
      const vNum = data.research?.versions?.[data.research?.versions?.length - 1]?.versionNumber
      setToastMessage(`Version ${vNum || ''} saved successfully`)
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error("Failed to save research version:", err)
    } finally {
      setSavingVersion(false)
    }
  }

  const handleConfirmGuideGeneration = async () => {
    setGeneratingGuide(true)
    try {
      const data = await generateGuide(id)
      setShowGuideModal(false)
      if (data.success || data._id) {
          navigate(`/case/${id}/guide`)
      } else {
          setToastMessage("Failed to generate Court Guide. Try again.")
          setTimeout(() => setToastMessage(null), 3000)
      }
    } catch (err) {
      console.error("Failed to generate Court Guide:", err)
      setToastMessage("Failed to generate Court Guide. Try again.")
      setTimeout(() => setToastMessage(null), 3000)
    } finally {
      setGeneratingGuide(false)
    }
  }

  const toggleItem = (key) => setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }))

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    const el = document.getElementById(`section-${sectionId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('research-content')
    if (!printContent) return
    const currentCase = cases.find(c => String(c._id) === String(id)) || {}
    const originalBody = document.body.innerHTML
    document.body.innerHTML = `
      <style>
        body { font-family: sans-serif; color: #000; background: #fff; padding: 32px; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        h2 { font-size: 18px; margin: 24px 0 8px; border-bottom: 2px solid #C9A84C; padding-bottom: 6px; }
        p { font-size: 13px; line-height: 1.7; margin-bottom: 10px; color: #333; }
        .highlight { background: #FFF8E7; border-left: 3px solid #C9A84C; padding: 10px 14px; margin: 10px 0; font-size: 13px; }
        .item { background: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; }
        .item-title { font-weight: 700; font-size: 13px; margin-bottom: 3px; }
        .item-detail { font-size: 12px; color: #555; }
        .prec { border: 1px solid #ddd; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; }
        .prec-name { font-weight: 700; font-size: 13px; }
        .prec-year { font-size: 11px; color: #C9A84C; margin: 2px 0; }
        .meta { font-size: 12px; color: #888; margin-bottom: 24px; }
      </style>
      <h1>Legal Research Report</h1>
      <div class="meta">Client: ${currentCase.clientName || 'N/A'} · Case: ${currentCase.caseCode || 'N/A'} · Court: ${currentCase.court || 'N/A'}</div>
      ${printContent.innerHTML}
    `
    window.print()
    document.body.innerHTML = originalBody
    window.location.reload()
  }

  if (loading) return <div style={{ background: '#0A0908', color: '#F5F0E8', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontFamily: "'DM Sans', sans-serif" }}><div style={{ fontSize: '24px', marginRight: '12px', animation: 'spin 1s linear infinite' }}>⏳</div><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>Loading secure research...</div>
  const currentCase = cases.find(c => String(c._id) === String(id)) || {}

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0A0908', minHeight: '100vh', color: '#F5F0E8', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }

        /* SIDEBAR */
        .res-sidebar {
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
          width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
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
          font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 14px rgba(201,168,76,0.25);
          transition: opacity 0.2s;
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
        .case-item-meta { font-size: 11px; color: #6B6560; }
        .sidebar-footer {
          margin-top: auto; padding: 12px; border-top: 1px solid rgba(255,255,255,0.07);
        }
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
        .res-main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        .res-topbar {
          padding: 14px 28px; border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,9,8,0.95); backdrop-filter: blur(8px);
          flex-shrink: 0; gap: 16px;
        }
        .res-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #F5F0E8; }
        .res-title span { color: #C9A84C; }
        .res-meta { font-size: 11px; color: #6B6560; margin-top: 2px; }
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
        .dl-btn {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
          cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
        }
        .dl-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .dl-btn.primary { background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F; box-shadow: 0 4px 14px rgba(201,168,76,0.25); }

        /* BODY */
        .res-body { flex: 1; display: flex; overflow: hidden; }

        /* CONTENT */
        .res-content {
          flex: 1; padding: 28px 32px; overflow-y: auto;
        }

        /* SECTION */
        .res-section { margin-bottom: 36px; scroll-margin-top: 24px; }
        .res-section-head {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
          padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .res-section-icon {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
          display: flex; align-items: center; justify-content: center; font-size: 14px;
        }
        .res-section-title { font-size: 15px; font-weight: 700; color: #F5F0E8; flex: 1; }
        .res-section-tag {
          font-family: 'DM Mono', monospace; font-size: 10px; color: #C9A84C;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
          padding: 3px 9px; border-radius: 5px; white-space: nowrap;
        }
        .res-body-text {
          font-size: 13px; color: #A09890; line-height: 1.8; margin-bottom: 14px;
        }
        .res-body-text strong { color: #F5F0E8; }

        .highlight-box {
          background: rgba(201,168,76,0.07); border-left: 3px solid #C9A84C;
          border-radius: 0 8px 8px 0; padding: 12px 16px; margin: 14px 0;
          font-size: 13px; color: #F5F0E8; line-height: 1.7;
        }
        .highlight-box strong { color: #C9A84C; }

        /* ACCORDION ITEMS */
        .item-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; margin-bottom: 8px; overflow: hidden;
          transition: border-color 0.2s;
        }
        .item-card:hover { border-color: rgba(201,168,76,0.2); }
        .item-card-head {
          padding: 12px 16px; display: flex; align-items: center; gap: 10px;
          cursor: pointer;
        }
        .item-card-bullet {
          width: 7px; height: 7px; border-radius: 50%; background: #C9A84C; flex-shrink: 0;
        }
        .item-card-title { font-size: 13px; font-weight: 600; color: #F5F0E8; flex: 1; }
        .item-card-chevron { font-size: 11px; color: #6B6560; transition: transform 0.2s; }
        .item-card-chevron.open { transform: rotate(180deg); }
        .item-card-body {
          padding: 0 16px 14px 33px; font-size: 12px; color: #A09890; line-height: 1.7;
          border-top: 1px solid rgba(255,255,255,0.05);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        /* PRECEDENT CARDS */
        .prec-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px 16px; margin-bottom: 8px;
          display: flex; gap: 14px; transition: border-color 0.2s, transform 0.2s;
          cursor: default;
        }
        .prec-card:hover { border-color: rgba(201,168,76,0.2); transform: translateX(3px); }
        .prec-index {
          font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
          color: rgba(201,168,76,0.2); flex-shrink: 0; line-height: 1; margin-top: 2px;
        }
        .prec-body { flex: 1; }
        .prec-name { font-size: 13px; font-weight: 700; color: #F5F0E8; margin-bottom: 3px; }
        .prec-meta { display: flex; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
        .prec-year {
          font-family: 'DM Mono', monospace; font-size: 10px; color: #C9A84C;
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.2);
          padding: 2px 7px; border-radius: 4px;
        }
        .prec-court {
          font-size: 10px; color: #6B6560;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          padding: 2px 7px; border-radius: 4px;
        }
        .prec-detail { font-size: 12px; color: #A09890; line-height: 1.6; }

        /* RIGHT PANEL */
        .right-panel {
          width: 220px; min-width: 220px; padding: 24px 16px;
          border-left: 1px solid rgba(255,255,255,0.07);
          overflow-y: auto; background: rgba(14,12,10,0.5);
        }
        .panel-title {
          font-size: 10px; font-weight: 700; color: #3A3530;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;
        }
        .outline-item {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 7px; cursor: pointer;
          margin-bottom: 2px; transition: all 0.15s; border: 1px solid transparent;
        }
        .outline-item:hover { background: rgba(255,255,255,0.03); }
        .outline-item.active {
          background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.2);
        }
        .outline-icon { font-size: 12px; flex-shrink: 0; }
        .outline-text { font-size: 12px; color: #6B6560; line-height: 1.3; }
        .outline-item.active .outline-text { color: #C9A84C; }

        .panel-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }

        .progress-item { margin-bottom: 12px; }
        .progress-lbl { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
        .progress-lbl span { color: #6B6560; }
        .progress-lbl strong { color: #C9A84C; font-weight: 600; }
        .progress-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; }
        .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #C9A84C, #A8782A); }

        .panel-btn {
          width: 100%; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
          margin-bottom: 7px; transition: opacity 0.2s; text-align: center;
        }
        .panel-btn:hover { opacity: 0.88; }
        .panel-btn.primary { background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F; }
        .panel-btn.secondary {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09);
          color: #6B6560;
        }
        .panel-btn.secondary:hover { color: #C9A84C; border-color: rgba(201,168,76,0.3); }

        .case-info-box {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px; padding: 12px; margin-bottom: 16px;
        }
        .case-info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
        .case-info-row:last-child { margin-bottom: 0; }
        .case-info-key { color: #6B6560; }
        .case-info-val { color: #F5F0E8; font-weight: 500; text-align: right; max-width: 110px; word-break: break-word; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className="res-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">Lex<span>AI</span></div>
          <button className="icon-btn" onClick={() => navigate('/dashboard')}>🏠</button>
        </div>
        <button className="new-case-btn" onClick={() => navigate('/dashboard')}>＋ New Case</button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div className="sidebar-section-lbl">Cases</div>
          {cases.map(c => (
            <div key={c._id} className={`case-item ${String(c._id) === String(id) ? 'active' : ''}`}
              onClick={() => navigate(`/case/${c._id}/details`)}>
              <div className="case-dot" style={{ background: STATUS_DOT[c.status] || STATUS_DOT.pending }} />
              <div>
                <div className="case-item-title">{c.clientName} · {c.section}</div>
                <div className="case-item-meta">View Research</div>
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

      {/* ── MAIN ── */}
      <div className="res-main">

        {/* TOPBAR */}
        <div className="res-topbar" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '20px', fontWeight: 700 }}>Legal Research</span>
              <span style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 700 }}>· {currentCase.section || 'General'}</span>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#F5F0E8' }}>{currentCase.clientName || 'Loading...'}</span>
              <span style={{ color: 'rgba(201,168,76,0.5)', margin: '0 6px' }}>·</span>
              <span style={{ fontFamily: "'DM Mono', monospace", color: '#C9A84C' }}>{currentCase.caseCode || 'N/A'}</span>
              <span style={{ color: 'rgba(201,168,76,0.5)', margin: '0 6px' }}>·</span>
              <span style={{ color: '#6B6560' }}>{currentCase.court || 'N/A'}</span>
            </div>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate(`/case/${id}/chat`)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)', color: '#F5F0E8', fontSize: '12px', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              💬 Back to Chat
            </button>
            <button onClick={() => setShowGuideModal(true)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: 'linear-gradient(135deg, #C9A84C, #A8782A)', color: '#0A0A0F', fontSize: '12px', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(201,168,76,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ✨ Generate Court Guide
            </button>
            <button onClick={handleDownloadPDF}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: 'linear-gradient(135deg, #C9A84C, #A8782A)', color: '#0A0A0F', fontSize: '12px', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'opacity 0.2s', boxShadow: '0 4px 12px rgba(201,168,76,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ⬇ Download PDF
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="res-body">
          {!researchData ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>{generating ? '⏳' : '🎓'}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#C9A84C', marginBottom: '12px' }}>
                {generating ? 'Generating Research...' : 'AI Legal Research'}
              </div>
              <div style={{ fontSize: '14px', color: '#A09890', maxWidth: '460px', textAlign: 'center', lineHeight: '1.6', marginBottom: '32px' }}>
                {generating 
                  ? 'LexAI is analyzing your chat conversation and generating a comprehensive legal research document. This may take a minute...'
                  : 'No research generated yet. You can generate research from your chat conversation, or go back to chat for more context.'}
              </div>
              {generating ? (
                <div style={{ 
                  width: '200px', height: '4px', background: 'rgba(255,255,255,0.06)', 
                  borderRadius: '2px', overflow: 'hidden' 
                }}>
                  <div style={{ 
                    width: '40%', height: '100%', borderRadius: '2px',
                    background: 'linear-gradient(90deg, #C9A84C, #A8782A)',
                    animation: 'progressSlide 1.5s ease-in-out infinite'
                  }} />
                  <style>{`@keyframes progressSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }`}</style>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button 
                    onClick={handleGenerateResearch}
                    disabled={generating}
                    style={{
                      padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                      background: 'linear-gradient(135deg, #4CAF7A, #2E8B57)',
                      color: '#fff', border: 'none', fontFamily: "'DM Sans', sans-serif",
                      boxShadow: '0 8px 24px rgba(76,175,122,0.3)', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    ✦ Generate Research
                  </button>
                  <button 
                    onClick={() => navigate(`/case/${id}/chat`)} 
                    style={{
                      padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#A09890', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'DM Sans', sans-serif",
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    💬 Back to Chat
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* CONTENT */}
              <div className="res-content" ref={contentRef}>
                <div id="research-content">
                  {(researchData.sections || []).map((sec, idx) => {
                    if (!sec) return null;
                    return (
                    <div key={sec.id || idx} id={`section-${sec.id || idx}`} className="res-section section-card">
                      <div className="res-section-head">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                            background: `${SECTION_COLORS[sec.id] || '#C9A84C'}26`,
                            border: `1px solid ${SECTION_COLORS[sec.id] || '#C9A84C'}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
                            filter: `drop-shadow(0 0 4px ${SECTION_COLORS[sec.id] || '#C9A84C'}30)`
                          }}>{sec.icon || '⚖'}</div>
                          <div className="res-section-title">{sec.title || 'Section'}</div>
                          <div className="res-section-tag">{sec.tag || 'LexAI'}</div>
                        </div>
                        {sec.id !== 'precedents' && (
                          <button 
                            onClick={() => {
                              setEditingSections(p => ({ ...p, [sec.id]: !p[sec.id] }))
                              if (!editedData[sec.id]) {
                                setEditedData(p => ({ ...p, [sec.id]: sec.content }))
                              }
                            }}
                            style={{
                              background: editingSections[sec.id] ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                              color: editingSections[sec.id] ? '#C9A84C' : '#A09890',
                              border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '4px',
                              cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s', marginLeft: 'auto'
                            }}
                          >
                            {editingSections[sec.id] ? 'Done Editing' : '✏ Edit'}
                          </button>
                        )}
                      </div>

                      <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px', padding: '24px 28px', marginTop: '12px', marginBottom: '28px'
                      }}>
                      {editingSections[sec.id] ? (
                        <textarea 
                          value={editedData[sec.id] !== undefined ? editedData[sec.id] : (sec.content || '')}
                          onChange={(e) => setEditedData(p => ({ ...p, [sec.id]: e.target.value }))}
                          style={{
                            width: '100%', minHeight: '120px', background: 'rgba(0,0,0,0.2)', border: '1px solid #C9A84C',
                            color: '#e0e0e0', padding: '12px', borderRadius: '6px', fontSize: '13px', lineHeight: '1.6',
                            fontFamily: 'inherit', resize: 'vertical', marginBottom: '16px'
                          }}
                        />
                      ) : (
                        <div className="res-body-text">{renderLegalText(sec.content)}</div>
                      )}

                      {typeof sec.highlight === 'string' && sec.highlight.trim() !== '' && (
                        <div className="highlight-box">
                          <strong>⚠ {sec.highlight.includes(':') ? sec.highlight.split(':')[0] + ':' : 'Highlight:'}</strong>
                          {sec.highlight.includes(':') ? sec.highlight.split(':').slice(1).join(':') : ' ' + sec.highlight}
                        </div>
                      )}

                      {/* Accordion Items */}
                      {Array.isArray(sec.items) && sec.items.length > 0 && sec.items.map((item, i) => {
                        const key = `${sec.id || idx}-${i}`
                        return (
                          <div key={key} className="item-card">
                            <div className="item-card-head" onClick={() => toggleItem(key)}>
                              <div className="item-card-bullet" />
                              <div className="item-card-title">{item.title || 'Detail'}</div>
                              <div className={`item-card-chevron ${expandedItems[key] ? 'open' : ''}`}>▼</div>
                            </div>
                            {expandedItems[key] && (
                              <div className="item-card-body">{item.detail || ''}</div>
                            )}
                          </div>
                        )
                      })}

                      {/* Precedent Cards */}
                      {Array.isArray(sec.precedents) && sec.precedents.length > 0 && sec.precedents.map((p, i) => (
                        <div key={i} style={{
                          borderLeft: '3px solid rgba(201,168,76,0.35)',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          borderRight: '1px solid rgba(255,255,255,0.06)',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '0 10px 10px 0',
                          padding: '16px 20px',
                          marginBottom: '12px',
                          background: 'rgba(255,255,255,0.03)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#C9A84C',
                              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                              padding: '3px 10px', borderRadius: '5px', whiteSpace: 'nowrap'
                            }}>{p.citation || 'Citation'}</span>
                            <span style={{
                              fontSize: '11px', color: '#6B6560',
                              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                              padding: '3px 10px', borderRadius: '5px', whiteSpace: 'nowrap'
                            }}>{p.court || 'Court'}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F5F0E8', marginBottom: '8px' }}>
                            {p.name || 'Unnamed Precedent'}
                          </div>
                          <div style={{ color: '#A09890' }}>
                            {renderLegalText(p.detail)}
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  )})}
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="right-panel">
                <div className="panel-title">Case Info</div>
                <div className="case-info-box">
                  {[
                    { k: 'Client',  v: currentCase.clientName || 'N/A'   },
                    { k: 'Case No', v: currentCase.caseCode || 'N/A'  },
                    { k: 'Section', v: currentCase.section || 'N/A'   },
                    { k: 'Court',   v: currentCase.court || 'N/A'     },
                  ].map((r, i) => (
                    <div key={i} className="case-info-row">
                      <span className="case-info-key">{r.k}</span>
                      <span className="case-info-val">{r.v}</span>
                    </div>
                  ))}
                </div>

                <div className="panel-title">Research Outline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                {OUTLINE.map(o => {
                  const isActive = activeSection === o.id;
                  return (
                    <div key={o.id}
                      onClick={() => scrollToSection(o.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 12px', borderRadius: '20px', cursor: 'pointer',
                        background: isActive ? 'linear-gradient(135deg, #C9A84C, #A8782A)' : 'transparent',
                        border: isActive ? 'none' : '1px solid transparent',
                        color: isActive ? '#0A0A0F' : '#6B6560',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '12px', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.color = '#C9A84C'; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#6B6560'; } }}
                    >
                      <span style={{ fontSize: '13px', flexShrink: 0 }}>{o.icon}</span>
                      <span>{o.label}</span>
                    </div>
                  );
                })}
                </div>

                <div className="panel-divider" />

                <div className="panel-title">Research Depth</div>
                {[
                  { lbl: 'Laws Covered',   pct: 100 },
                  { lbl: 'Precedents',     pct: 95  },
                  { lbl: 'Bail Strategy',  pct: 100 },
                  { lbl: 'Defense Plan',   pct: 85  },
                ].map((p, i) => (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#6B6560' }}>{p.lbl}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#C9A84C' }}>{p.pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div className="progress-bar-fill" style={{
                        width: `${p.pct}%`, height: '100%', borderRadius: '3px',
                        background: p.pct >= 100
                          ? 'linear-gradient(90deg, #C9A84C, #4CAF7A)'
                          : 'linear-gradient(90deg, #C9A84C, #A8782A)',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                  </div>
                ))}

                <div className="panel-divider" />

                <div className="panel-title">Version History</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {versions.slice().reverse().map(v => {
                    const isActive = activeVersionNum === v.versionNumber;
                    return (
                      <div key={v.versionNumber}
                        onClick={() => handleVersionClick(v.versionNumber)}
                        style={{
                          padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                          background: isActive ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                          border: isActive ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.07)',
                          borderLeft: isActive ? '3px solid #C9A84C' : '1px solid rgba(255,255,255,0.07)',
                          transition: 'all 0.2s'
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{
                            fontFamily: "'DM Mono', monospace", fontSize: '11px', fontWeight: 700,
                            color: isActive ? '#0A0A0F' : '#C9A84C',
                            background: isActive ? 'linear-gradient(135deg, #C9A84C, #A8782A)' : 'rgba(201,168,76,0.12)',
                            border: isActive ? 'none' : '1px solid rgba(201,168,76,0.2)',
                            padding: '2px 8px', borderRadius: '4px'
                          }}>V{v.versionNumber}</span>
                          <span style={{ fontSize: '10px', color: '#6B6560' }}>
                            {new Date(v.savedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            {new Date(v.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#A09890', fontStyle: 'italic', lineHeight: 1.4 }}>{v.changeNote}</div>
                      </div>
                    );
                  })}
                </div>

                {Object.keys(editedData).length > 0 && (
                  <button 
                    onClick={() => setShowNoteModal(true)}
                    className="panel-btn primary" 
                    style={{ marginBottom: '16px', animation: 'fadeIn 0.3s' }}>
                    💾 Save Changes
                  </button>
                )}

                <div className="panel-divider" />

                <button className="panel-btn primary" onClick={handleDownloadPDF}>⬇ Download PDF</button>
                <button 
                  className="panel-btn" 
                  style={{ background: 'rgba(182, 92, 237, 0.15)', color: '#D49BFF', border: '1px solid rgba(182, 92, 237, 0.3)' }}
                  onClick={() => setShowGuideModal(true)}>
                  ✦ Generate Court Guide
                </button>
                <button className="panel-btn secondary" onClick={() => navigate(`/case/${id}/chat`)}>💬 Back to Chat</button>
              </div>
            </>
          )}
      </div>
      
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', background: '#4CAF7A', color: '#fff',
          padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 9999, animation: 'fadeIn 0.3s'
        }}>
          ✅ {toastMessage}
        </div>
      )}

      {/* SAVE NOTE MODAL */}
      {showNoteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #333', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff' }}>Save Version</h3>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '16px' }}>What did you change in this version?</p>
            <textarea
              autoFocus
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="e.g. Updated defense strategy based on new witness..."
              style={{
                width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444',
                color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px', resize: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowNoteModal(false)}
                disabled={savingVersion}
                style={{
                  padding: '8px 16px', background: 'transparent', border: '1px solid #555', color: '#aaa',
                  borderRadius: '6px', cursor: 'pointer'
                }}>Cancel</button>
              <button 
                onClick={handleSaveVersion}
                disabled={savingVersion}
                style={{
                  padding: '8px 16px', background: '#C9A84C', border: 'none', color: '#000', fontWeight: 600,
                  borderRadius: '6px', cursor: savingVersion ? 'wait' : 'pointer'
                }}>
                {savingVersion ? 'Saving...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENERATE GUIDE MODAL */}
      {showGuideModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #333', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff' }}>Generate Court Guide</h3>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '24px', lineHeight: '1.5' }}>
              This will generate a Court Guide based on the current research version [V{activeVersionNum}]. Continue?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowGuideModal(false)}
                disabled={generatingGuide}
                style={{
                  padding: '8px 16px', background: 'transparent', border: '1px solid #555', color: '#aaa',
                  borderRadius: '6px', cursor: 'pointer'
                }}>Cancel</button>
              <button 
                onClick={handleConfirmGuideGeneration}
                disabled={generatingGuide}
                style={{
                  padding: '8px 16px', background: 'linear-gradient(135deg, #B65CED, #853bba)', border: 'none', color: '#fff', fontWeight: 600,
                  borderRadius: '6px', cursor: generatingGuide ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                {generatingGuide ? (
                  <>
                    <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
                    Generating...
                  </>
                ) : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes sectionReveal {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .section-card { animation: sectionReveal 0.4s ease forwards; opacity: 0; }
        .section-card:nth-child(1) { animation-delay: 0.05s; }
        .section-card:nth-child(2) { animation-delay: 0.10s; }
        .section-card:nth-child(3) { animation-delay: 0.15s; }
        .section-card:nth-child(4) { animation-delay: 0.20s; }
        .section-card:nth-child(5) { animation-delay: 0.25s; }
        .section-card:nth-child(6) { animation-delay: 0.30s; }
      
        @keyframes checkBounce {
          0%   { transform: scale(1);    }
          40%  { transform: scale(0.85); }
          70%  { transform: scale(1.1);  }
          100% { transform: scale(1);    }
        }
        .checkbox-bounce { animation: checkBounce 0.2s ease; }
      
        @keyframes barFill { from { width: 0%; } }
        .progress-bar-fill { animation: barFill 0.8s ease-out forwards; }
      
        .stage-body          { max-height: 0;      overflow: hidden;
                               transition: max-height 0.35s ease; }
        .stage-body.expanded { max-height: 2000px; }
      `}</style>
      </div>
    </div>
  )
}