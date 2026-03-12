import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCases, getGuide, updateGuide, getGuideVersions, getGuideVersion } from '../services/api'

const GUIDE_DATA = {
  caseCode: 'CR-2024-0042',
  client: 'Ahmad Raza',
  section: 'Section 302 PPC',
  court: 'Lahore Sessions Court',
  hearingType: 'Bail Hearing',
  judge: 'Sessions Judge',
  generatedAt: '09:45 AM · Today',
  steps: [
    {
      id: 'opening',
      stage: 'Stage 1 — Opening',
      icon: '🎙',
      title: 'Address the Court & Introduce Yourself',
      objective: 'Establish your appearance formally and state the purpose of today\'s hearing.',
      instructions: [
        'Stand when addressing the judge. Begin only after the judge acknowledges you.',
        'State your name, bar enrollment number, and that you appear on behalf of the accused.',
        'Mention the FIR number, police station, and the section under which your client is charged.',
        'Clearly state that you are moving a bail application under Section 497 CrPC.',
      ],
      script: `"Respected Your Lordship, I am Advocate Ali Khan, appearing on behalf of the accused Ahmad Raza in FIR No. 245/2024 registered at Gulberg Police Station Lahore, under Section 302 PPC. With Your Lordship's kind permission, I seek to move a bail application on behalf of my client who has been in custody since the date of arrest."`,
      tips: 'Speak slowly and clearly. Maintain eye contact with the judge. Keep your tone respectful but confident.',
      tag: 'Essential',
      tagColor: '#4CAF7A',
    },
    {
      id: 'facts',
      stage: 'Stage 2 — Case Facts',
      icon: '📋',
      title: 'Present the Brief Facts of the Case',
      objective: 'Give the court a concise and accurate summary of the case background.',
      instructions: [
        'Briefly summarize the FIR — date of incident, location, and parties involved.',
        'Mention the nature of the alleged offence without admitting any guilt.',
        'State clearly that the case is based purely on circumstantial evidence.',
        'Note that no direct eyewitness has been named in the FIR or challan.',
      ],
      script: `"Your Lordship, the brief facts of this case are that on the alleged date, an FIR was registered against my client on the basis of a property dispute between the parties. The prosecution has failed to produce any direct eyewitness to the alleged incident. The entire case rests on circumstantial evidence which, as this Court is well aware, requires an unbroken chain to sustain a conviction."`,
      tips: 'Be concise. Judges appreciate brevity. Do not narrate unnecessary details at this stage.',
      tag: 'Important',
      tagColor: '#C9A84C',
    },
    {
      id: 'evidence',
      stage: 'Stage 3 — Challenge Evidence',
      icon: '🔍',
      title: 'Challenge the Prosecution Evidence',
      objective: 'Expose weaknesses in the prosecution\'s case to establish grounds for bail.',
      instructions: [
        'Point out the absence of any eyewitness testimony in the case.',
        'Highlight any delay in FIR registration as evidence of deliberation and fabrication.',
        'Challenge the motive — property disputes are civil matters, not criminal.',
        'Refer to the Supreme Court principle that circumstantial chains must be complete.',
      ],
      script: `"Your Lordship, there is not a single eyewitness to this alleged incident. The prosecution relies entirely on circumstantial evidence. As held by the Honourable Supreme Court in Muhammad Asghar v. State (2021 PCrLJ 44), circumstantial evidence alone — without a complete and unbroken chain — cannot sustain a conviction under Section 302 PPC. Furthermore, the motive attributed is a property dispute which remains contested and unproven before any civil or criminal forum."`,
      tips: 'Cite case law confidently. Have the printed citations ready to hand to the court if asked.',
      tag: 'Critical',
      tagColor: '#E07060',
    },
    {
      id: 'bailgrounds',
      stage: 'Stage 4 — Bail Arguments',
      icon: '🔓',
      title: 'Present Legal Grounds for Bail',
      objective: 'Invoke specific legal provisions and precedents that entitle your client to bail.',
      instructions: [
        'Invoke Section 497 CrPC — special circumstances exist for bail in non-bailable offences.',
        'Cite Article 10-A of the Constitution — right to fair trial and due process.',
        'Mention the accused\'s clean criminal record with no prior convictions.',
        'Highlight that the accused is not a flight risk — has family, property and roots in the city.',
        'Cite Mst. Zeenat Bibi v. State (2019 SCMR 142) — bail in 302 when evidence is weak.',
      ],
      script: `"Your Lordship, on the basis of the above, we humbly submit that special circumstances exist for the grant of bail in the present case. The accused has no prior criminal record whatsoever. He has deep roots in this city with family and immovable property. He poses no flight risk. As held by the Honourable Supreme Court in Mst. Zeenat Bibi v. State (2019 SCMR 142), bail may and should be granted in offences under Section 302 PPC where the prosecution evidence is weak and no direct eyewitness exists. Furthermore, under Article 10-A of the Constitution of Pakistan, my client is entitled to a fair trial — prolonged custody without trial violates this fundamental right."`,
      tips: 'Pause after citing each precedent. Give the judge time to note it down. Speak the citation year clearly.',
      tag: 'Critical',
      tagColor: '#E07060',
    },
    {
      id: 'character',
      stage: 'Stage 5 — Client Character',
      icon: '👤',
      title: 'Establish Client\'s Character & Background',
      objective: 'Humanize your client and present factors that favor granting bail.',
      instructions: [
        'Mention the accused\'s profession, family ties, and standing in the community.',
        'State that the accused has dependents — spouse, children, or elderly parents.',
        'Confirm he has been cooperative with investigation and not obstructed justice.',
        'Offer to provide sureties of respectable community members.',
      ],
      script: `"Your Lordship, my client Ahmad Raza is a respectable member of society with a family including dependent children and an elderly mother. He has fully cooperated with the investigation at every stage and has never attempted to obstruct the course of justice. We are prepared to furnish sureties of responsible citizens of this city to the satisfaction of this Honourable Court."`,
      tips: 'Keep this section brief but sincere. Judges respond well to genuine character references.',
      tag: 'Supporting',
      tagColor: '#7B9FD4',
    },
    {
      id: 'prayer',
      stage: 'Stage 6 — Closing Prayer',
      icon: '🙏',
      title: 'Formal Prayer Before the Court',
      objective: 'Conclude your arguments and formally request the court to grant bail.',
      instructions: [
        'Summarize your three strongest arguments in one sentence each.',
        'Formally move the prayer for bail with sureties.',
        'Mention the surety amount you are prepared to offer.',
        'Thank the court for its time and attention.',
      ],
      script: `"Your Lordship, in light of the foregoing — the absence of any eyewitness, the purely circumstantial nature of the prosecution\'s evidence, the accused\'s clean criminal record, and the binding precedents of this Honourable Court — it is most respectfully prayed that this Court may be pleased to grant bail to the accused Ahmad Raza on such surety as this Court may deem fit and appropriate. The accused undertakes to appear before this Court on every date of hearing without fail."`,
      tips: 'End on a confident, respectful note. Do not rush the closing. Bow slightly when the judge rules.',
      tag: 'Essential',
      tagColor: '#4CAF7A',
    },
  ],
  checklist: [
    { id: 1, text: 'Research report reviewed thoroughly',     done: true  },
    { id: 2, text: 'All precedents printed and highlighted',  done: true  },
    { id: 3, text: 'Court guide downloaded as PDF',           done: true  },
    { id: 4, text: 'FIR copy and case documents in hand',     done: false },
    { id: 5, text: 'Sureties identified and arranged',        done: false },
    { id: 6, text: 'Client briefed on hearing procedure',     done: false },
    { id: 7, text: 'Bail application formally drafted',       done: false },
    { id: 8, text: 'Court appearance confirmed with client',  done: false },
  ],
}

export default function CourtGuide() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeStep, setActiveStep] = useState('opening')
  const [checklist, setChecklist]   = useState(GUIDE_DATA.checklist)
  const [expandedScript, setExpandedScript] = useState({})
  const [expandedTips,   setExpandedTips]   = useState({})
  const [cases, setCases] = useState([])
  const [currentCase, setCurrentCase] = useState({})
  const [guideData, setGuideData] = useState(null)
  const [versions, setVersions] = useState([])
  const [activeVersionNum, setActiveVersionNum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingSections, setEditingSections] = useState({})
  const [editedData, setEditedData] = useState({})
  const [savingVersion, setSavingVersion] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [changeNote, setChangeNote] = useState('')
  const [toastMessage, setToastMessage] = useState(null)
  const [bouncingCheck, setBouncingCheck] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getCases()
        setCases(data)
        const c = data.find(c => String(c._id) === String(id))
        if(c) setCurrentCase(c)

        const vData = await getGuideVersions(id)
        if (Array.isArray(vData)) setVersions(vData)

        const gData = await getGuide(id)
        if (gData && gData.openingStatement) {
          setGuideData(gData)
          if (gData.versions && gData.versions.length > 0) {
              const currentVersion = gData.versions[gData.versions.length - 1]
              setActiveVersionNum(currentVersion.versionNumber)
              if (Array.isArray(currentVersion.checklist) && currentVersion.checklist.length > 0) {
                  setChecklist(currentVersion.checklist.map((item, idx) => ({
                      id: item._id || idx,
                      text: item.item,
                      done: item.completed
                  })))
              }
          }
        } else {
          setGuideData(null)
        }
      } catch(err) {
        console.error("Failed to load cases/guide", err)
        setGuideData(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchData()
    }
  }, [id])

  // removed static SIDEBAR_CASES
  const STATUS_DOT = { active: '#4CAF7A', done: '#C9A84C', pending: '#7B9FD4', urgent: '#E07060' }

  const toggleCheck = async (itemId) => {
    setBouncingCheck(itemId)
    setTimeout(() => setBouncingCheck(null), 300)
    const newChecklist = checklist.map(i => i.id === itemId ? { ...i, done: !i.done } : i)
    setChecklist(newChecklist)
    
    if (guideData) {
        try {
            const mappedForBackend = newChecklist.map(c => ({
                item: c.text,
                completed: c.done
            }))
            await updateGuide(id, {
                openingStatement: guideData.openingStatement,
                argumentsSection: guideData.argumentsSection,
                precedentArguments: guideData.precedentArguments,
                prayer: guideData.prayer,
                checklist: mappedForBackend,
                changeNote: "Updated checklist status"
            })
        } catch(err) {
            console.error("Failed to update guide checklist", err)
        }
    }
  }

  const handleVersionClick = async (vNum) => {
    setActiveVersionNum(vNum)
    setEditingSections({})
    setEditedData({})
    try {
        const vData = await getGuideVersion(id, vNum)
        if (vData) {
            setGuideData(prev => ({
                ...prev,
                openingStatement: vData.openingStatement,
                argumentsSection: vData.argumentsSection,
                precedentArguments: vData.precedentArguments,
                prayer: vData.prayer,
                checklist: vData.checklist
            }))
            if (Array.isArray(vData.checklist) && vData.checklist.length > 0) {
              setChecklist(vData.checklist.map((item, idx) => ({
                  id: item._id || idx,
                  text: item.item,
                  done: item.completed
              })))
            }
        }
    } catch(err) {
        console.error("Failed to load version", err)
    }
  }

  const handleSaveVersion = async () => {
    setSavingVersion(true)
    const currentChecklist = checklist.map(c => ({ item: c.text, completed: c.done }))
    
    // Map 'step.id' dynamically checking editedData explicitly aligning to specific backend schema blocks
    const openingStr = editedData.opening !== undefined ? editedData.opening : guideData?.openingStatement
    const argsStr = editedData.arguments !== undefined ? editedData.arguments : guideData?.argumentsSection
    const precStr = editedData.precedents !== undefined ? editedData.precedents : guideData?.precedentArguments
    const prayerStr = editedData.prayer !== undefined ? editedData.prayer : guideData?.prayer

    try {
      const res = await updateGuide(id, {
        openingStatement: openingStr,
        argumentsSection: argsStr,
        precedentArguments: precStr,
        prayer: prayerStr,
        checklist: currentChecklist,
        changeNote: changeNote || "Manual edit by lawyer"
      })
      
      if (res && res._id) {
          setGuideData(res)
          setVersions(res.versions || [])
          if (res.versions && res.versions.length > 0) {
              setActiveVersionNum(res.versions[res.versions.length - 1].versionNumber)
          }
      }
      setEditingSections({})
      setEditedData({})
      setShowNoteModal(false)
      setChangeNote('')
      const vNum = res?.versions?.[res?.versions?.length - 1]?.versionNumber
      setToastMessage(`Version ${vNum || ''} saved successfully`)
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error("Failed to save guide version:", err)
    } finally {
      setSavingVersion(false)
    }
  }

  const completedCount = checklist.filter(i => i.done).length
  const progressPct    = Math.round((completedCount / checklist.length) * 100)

  const handleDownloadPDF = () => {
    const printContent = document.getElementById('guide-print-content')
    const originalBody  = document.body.innerHTML
    document.body.innerHTML = `
      <style>
        body { font-family: sans-serif; color: #000; background: #fff; padding: 32px; }
        h1 { font-size: 22px; margin-bottom: 6px; }
        .meta { font-size: 12px; color: #888; margin-bottom: 28px; }
        h2 { font-size: 16px; margin: 28px 0 6px; color: #8B6914; }
        .stage { font-size: 11px; color: #C9A84C; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
        .objective { font-size: 13px; color: #555; margin-bottom: 10px; font-style: italic; }
        ul { margin: 8px 0 12px 18px; }
        li { font-size: 13px; color: #333; margin-bottom: 5px; line-height: 1.6; }
        .script { background: #FFF8E7; border-left: 3px solid #C9A84C; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 13px; font-style: italic; line-height: 1.7; margin: 10px 0; }
        .tip { background: #f0f4ff; border-left: 3px solid #7B9FD4; padding: 8px 12px; font-size: 12px; color: #555; margin: 8px 0; border-radius: 0 5px 5px 0; }
        hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
      </style>
      <h1>Courtroom Preparation Guide — ${GUIDE_DATA.hearingType}</h1>
      <div class="meta">Client: ${currentCase.clientName || GUIDE_DATA.client} · ${currentCase.section || GUIDE_DATA.section} · ${currentCase.court || GUIDE_DATA.court} · Generated: ${GUIDE_DATA.generatedAt}</div>
      ${printContent.innerHTML}
    `
    window.print()
    document.body.innerHTML = originalBody
    window.location.reload()
  }

  if (loading) return <div style={{ background: '#0A0908', color: '#F5F0E8', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', fontFamily: "'DM Sans', sans-serif" }}><div style={{ fontSize: '24px', marginRight: '12px', animation: 'spin 1s linear infinite' }}>⏳</div><style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>Loading guide...</div>
  
  const dynamicSteps = guideData ? [
    { ...GUIDE_DATA.steps[0], script: guideData.openingStatement || GUIDE_DATA.steps[0].script },
    { ...GUIDE_DATA.steps[1], id: 'arguments', stage: 'Stage 2 — Arguments', title: 'Arguments Section', script: guideData.argumentsSection || GUIDE_DATA.steps[1].script },
    { ...GUIDE_DATA.steps[2], id: 'precedents', stage: 'Stage 3 — Precedents', title: 'Precedent Arguments', script: guideData.precedentArguments || GUIDE_DATA.steps[2].script },
    GUIDE_DATA.steps[3],
    GUIDE_DATA.steps[4],
    { ...GUIDE_DATA.steps[5], script: guideData.prayer || GUIDE_DATA.steps[5].script }
  ] : GUIDE_DATA.steps

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0A0908', minHeight: '100vh', color: '#F5F0E8', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }

        /* ── SIDEBAR ── */
        .guide-sidebar {
          width: 260px; min-width: 260px; background: #0E0C0A;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          height: 100vh; position: sticky; top: 0;
          transition: width 0.3s, min-width 0.3s;
        }
        .guide-sidebar.collapsed { width: 68px; min-width: 68px; }

        .sidebar-header {
          padding: 18px 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sidebar-logo {
          font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #C9A84C;
          white-space: nowrap; overflow: hidden; transition: opacity 0.2s;
        }
        .sidebar-logo span { color: #F5F0E8; }
        .guide-sidebar.collapsed .sidebar-logo { opacity: 0; width: 0; }

        .icon-btn {
          width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; cursor: pointer; color: #6B6560; outline: none; transition: all 0.2s;
        }
        .icon-btn:hover { background: rgba(201,168,76,0.1); color: #C9A84C; }
        .new-case-btn {
          margin: 12px 12px 6px; padding: 10px 14px; border-radius: 9px;
          background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F;
          font-size: 13px; font-weight: 700; border: none; cursor: pointer;
          width: calc(100% - 24px); font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(201,168,76,0.25); transition: opacity 0.2s;
        }
        .new-case-btn:hover { opacity: 0.9; }
        .sidebar-section-lbl {
          padding: 10px 20px 5px; font-size: 10px; font-weight: 700;
          color: #3A3530; letter-spacing: 0.1em; text-transform: uppercase;
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

        .guide-main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        
        .guide-topbar { height: 70px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; padding: 0 40px; background: #0A0908; flex-shrink: 0; }
        .guide-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #F5F0E8; }
        .dl-btn.primary { background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F; box-shadow: 0 4px 14px rgba(201,168,76,0.25); }

        /* ── BODY ── */
        .guide-body { flex: 1; display: flex; overflow: hidden; }

        /* STEP NAV (left mini panel) */
        .step-nav {
          width: 56px; background: rgba(14,12,10,0.8);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          align-items: center; padding: 20px 0; gap: 6px;
          overflow-y: auto;
        }
        .step-nav-btn {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          transition: all 0.2s; position: relative;
        }
        .step-nav-btn:hover { border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.08); }
        .step-nav-btn.active {
          background: rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.4);
          box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
        }
        .step-nav-connector {
          width: 1px; height: 14px; background: rgba(255,255,255,0.08);
        }

        /* CONTENT */
        .guide-content { flex: 1; padding: 28px 32px; overflow-y: auto; }

        /* STEP CARD */
        .step-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; margin-bottom: 16px; overflow: hidden;
          transition: border-color 0.2s; scroll-margin-top: 20px;
        }
        .step-card.active-card { border-color: rgba(201,168,76,0.25); }
        .step-card-head {
          padding: 18px 20px; display: flex; align-items: center; gap: 14px;
          cursor: pointer; transition: background 0.15s;
        }
        .step-card-head:hover { background: rgba(255,255,255,0.02); }

        .step-number-circle {
          width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700;
          border: 1px solid;
        }
        .step-head-right { flex: 1; }
        .step-stage-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 3px; }
        .step-heading { font-size: 14px; font-weight: 700; color: #F5F0E8; margin-bottom: 3px; }
        .step-objective { font-size: 12px; color: #6B6560; line-height: 1.5; }
        .step-tag {
          padding: 3px 10px; border-radius: 5px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0;
          border: 1px solid;
        }
        .step-chevron { font-size: 12px; color: #6B6560; transition: transform 0.25s; flex-shrink: 0; }
        .step-chevron.open { transform: rotate(180deg); }

        /* STEP BODY */
        .step-body {
          padding: 0 20px 20px; border-top: 1px solid rgba(255,255,255,0.06);
          animation: slideDown 0.25s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .step-instructions { margin: 16px 0 14px; }
        .step-instr-title {
          font-size: 10px; font-weight: 700; color: #6B6560;
          text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
        }
        .instr-item {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 8px; font-size: 13px; color: #A09890; line-height: 1.6;
        }
        .instr-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #C9A84C;
          flex-shrink: 0; margin-top: 7px;
        }

        /* SCRIPT BOX */
        .script-toggle {
          background: rgba(201,168,76,0.06); border: 1px solid rgba(201,168,76,0.18);
          border-radius: 10px; overflow: hidden; margin-bottom: 10px;
        }
        .script-toggle-head {
          padding: 11px 16px; display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: background 0.15s;
        }
        .script-toggle-head:hover { background: rgba(201,168,76,0.06); }
        .script-toggle-label {
          font-size: 11px; font-weight: 700; color: #C9A84C;
          text-transform: uppercase; letter-spacing: 0.07em;
          display: flex; align-items: center; gap: 7px;
        }
        .script-body {
          padding: 14px 16px; border-top: 1px solid rgba(201,168,76,0.15);
          font-size: 13px; color: #F5F0E8; line-height: 1.8; font-style: italic;
          border-left: 3px solid #C9A84C; margin: 0 16px 14px;
          border-radius: 0 0 6px 6px; background: rgba(255,255,255,0.02);
          animation: fadeIn 0.2s ease;
        }
        .script-body em { color: #C9A84C; font-style: normal; font-weight: 700; }

        /* TIP BOX */
        .tip-toggle {
          background: rgba(123,159,212,0.06); border: 1px solid rgba(123,159,212,0.18);
          border-radius: 10px; overflow: hidden;
        }
        .tip-toggle-head {
          padding: 11px 16px; display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; transition: background 0.15s;
        }
        .tip-toggle-head:hover { background: rgba(123,159,212,0.06); }
        .tip-toggle-label {
          font-size: 11px; font-weight: 700; color: #7B9FD4;
          text-transform: uppercase; letter-spacing: 0.07em;
          display: flex; align-items: center; gap: 7px;
        }
        .tip-body {
          padding: 12px 16px; border-top: 1px solid rgba(123,159,212,0.15);
          font-size: 13px; color: #A09890; line-height: 1.7;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* RIGHT PANEL */
        .right-panel {
          width: 230px; min-width: 230px; padding: 24px 16px;
          border-left: 1px solid rgba(255,255,255,0.07);
          overflow-y: auto; background: rgba(14,12,10,0.5);
        }
        .panel-title {
          font-size: 10px; font-weight: 700; color: #3A3530;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;
        }
        .panel-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }

        /* CHECKLIST */
        .checklist-item {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 8px 10px; border-radius: 7px; cursor: pointer;
          margin-bottom: 3px; transition: background 0.15s; border: 1px solid transparent;
        }
        .checklist-item:hover { background: rgba(255,255,255,0.03); }
        .checklist-item.checked { background: rgba(76,175,122,0.05); border-color: rgba(76,175,122,0.12); }
        .check-box {
          width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0; margin-top: 1px;
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; transition: all 0.2s; background: transparent;
        }
        .checklist-item.checked .check-box {
          background: #4CAF7A; border-color: #4CAF7A; color: #fff;
        }
        .check-text {
          font-size: 11px; color: #6B6560; line-height: 1.4; transition: color 0.2s;
        }
        .checklist-item.checked .check-text { color: #F5F0E8; }

        /* PROGRESS RING */
        .progress-ring-wrap {
          display: flex; flex-direction: column; align-items: center;
          padding: 14px 0; margin-bottom: 4px;
        }
        .ring-label { font-size: 11px; color: #6B6560; margin-top: 8px; }
        .ring-value {
          font-family: 'Playfair Display', serif; font-size: 22px;
          font-weight: 700; color: #C9A84C;
        }

        /* STEPS OUTLINE */
        .step-outline-item {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 7px; cursor: pointer;
          margin-bottom: 2px; transition: all 0.15s; border: 1px solid transparent;
        }
        .step-outline-item:hover { background: rgba(255,255,255,0.03); }
        .step-outline-item.active { background: rgba(201,168,76,0.08); border-color: rgba(201,168,76,0.2); }
        .step-outline-icon { font-size: 12px; flex-shrink: 0; }
        .step-outline-text { font-size: 11px; color: #6B6560; line-height: 1.3; }
        .step-outline-item.active .step-outline-text { color: #C9A84C; }

        .panel-btn {
          width: 100%; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
          margin-bottom: 7px; transition: opacity 0.2s; text-align: center;
        }
        .panel-btn:hover { opacity: 0.88; }
        .panel-btn.primary { background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F; }
        .panel-btn.secondary {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); color: #6B6560;
        }
        .panel-btn.secondary:hover { color: #C9A84C; border-color: rgba(201,168,76,0.3); }

        /* PRINT CONTENT */
        #guide-print-content .print-step { margin-bottom: 20px; }
        #guide-print-content .print-stage { font-size: 11px; color: #C9A84C; font-weight: 700; text-transform: uppercase; }
        #guide-print-content h2 { font-size: 15px; margin: 4px 0 6px; }
        #guide-print-content .print-objective { font-size: 12px; color: #555; font-style: italic; margin-bottom: 8px; }
        #guide-print-content ul { margin-left: 18px; margin-bottom: 8px; }
        #guide-print-content li { font-size: 12px; margin-bottom: 4px; line-height: 1.6; }
        #guide-print-content .print-script { background: #FFF8E7; border-left: 3px solid #C9A84C; padding: 10px 14px; font-style: italic; font-size: 12px; line-height: 1.7; margin: 8px 0; }
        #guide-print-content .print-tip { background: #f0f4ff; border-left: 3px solid #7B9FD4; padding: 8px 12px; font-size: 11px; color: #555; margin: 6px 0; }
        #guide-print-content hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className={`guide-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Lex<span>AI</span></div>
          <button className="icon-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>
        {!sidebarCollapsed && (
          <>
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
                <div className="case-item-meta">Court Guide</div>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{JSON.parse(localStorage.getItem('lexai_user') || '{}').firstName?.[0] || 'A'}</div>
            <div>
              <div className="user-name">Adv. {JSON.parse(localStorage.getItem('lexai_user') || '{}').firstName || 'Lawyer'}</div>
              <div className="user-role">Senior Advocate</div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* ── MAIN ── */}
      <div className="guide-main">

        {/* TOPBAR */}
        <div className="guide-topbar" style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '20px', fontWeight: 700 }}>Court Guide</span>
              <span style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 700 }}>· {GUIDE_DATA.hearingType}</span>
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              💬 Back to Chat
            </button>
            <button onClick={() => navigate(`/case/${id}/research`)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)',
                background: 'rgba(201,168,76,0.1)', color: '#C9A84C', fontSize: '12px', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'; e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; }}
            >
              📄 Legal Research
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="guide-body">
          {!guideData ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎤</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#C9A84C', marginBottom: '12px' }}>
                Court Guide
              </div>
              <div style={{ fontSize: '14px', color: '#A09890', maxWidth: '400px', textAlign: 'center', lineHeight: '1.6', marginBottom: '32px' }}>
                No Court Guide yet. Go to the Research page and click Generate Court Guide.
              </div>
              <button 
                onClick={() => navigate(`/case/${id}/research`)} 
                style={{
                  padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #C9A84C, #A8782A)',
                  color: '#0A0A0F', border: 'none', fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 8px 24px rgba(201,168,76,0.3)', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                📄 Go to Research
              </button>
            </div>
          ) : (
            <>
              {/* STEP NAV */}
              <div className="step-nav">
                {dynamicSteps.map((step, i) => (
                  <div key={step.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      className={`step-nav-btn ${activeStep === step.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveStep(step.id)
                        document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      title={step.title}
                    >
                      {step.icon}
                    </button>
                    {i < dynamicSteps.length - 1 && <div className="step-nav-connector" />}
                  </div>
                ))}
              </div>

              {/* CONTENT */}
              <div className="guide-content">

                {/* Hidden print content */}
                <div id="guide-print-content" style={{ display: 'none' }}>
                  {dynamicSteps.map((step, i) => (
                    <div key={step.id} className="print-step">
                      <div className="print-stage">{step.stage}</div>
                      <h2>{step.title}</h2>
                      <div className="print-objective">{step.objective}</div>
                      <ul>{step.instructions.map((ins, j) => <li key={j}>{ins}</li>)}</ul>
                      <div className="print-script">{step.script}</div>
                      <div className="print-tip">💡 Tip: {step.tips}</div>
                      {i < dynamicSteps.length - 1 && <hr />}
                    </div>
                  ))}
                </div>

                {/* Visible step cards */}
                {dynamicSteps.map((step, stepIdx) => {
                  const isActive   = activeStep === step.id
                  const scriptOpen = expandedScript[step.id]
                  const tipOpen    = expandedTips[step.id]
                  return (
                    <div
                      key={step.id}
                      id={`step-${step.id}`}
                      className="section-card"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: isActive ? '1px solid rgba(201,168,76,0.25)' : '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '14px', overflow: 'hidden', marginBottom: '16px',
                        transition: 'transform 0.2s, border-color 0.2s', scrollMarginTop: '20px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; if (!isActive) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                    >
                  {/* CARD HEAD */}
                  <div
                    onClick={() => setActiveStep(isActive ? null : step.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 20px', cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: isActive ? 'linear-gradient(135deg, #C9A84C, #A8782A)' : 'rgba(201,168,76,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800,
                        color: isActive ? '#0A0A0F' : '#C9A84C',
                        transition: 'all 0.25s',
                      }}>
                        {stepIdx + 1}
                      </div>
                      <div>
                        <div style={{
                          fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700,
                          color: '#F5F0E8', marginBottom: '3px',
                        }}>{step.title}</div>
                        <div style={{ fontSize: '12px', color: '#6B6560', lineHeight: 1.5 }}>{step.objective}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        color: step.tagColor,
                        background: `${step.tagColor}18`,
                        border: `1px solid ${step.tagColor}35`,
                      }}>{step.tag}</span>
                      <span style={{
                        fontSize: '12px', color: '#6B6560', transition: 'transform 0.25s',
                        display: 'inline-block', transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}>▼</span>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className={`step-body stage-body ${isActive ? 'expanded' : ''}`}>
                    <div className="step-instructions">
                        <div className="step-instr-title">📌 Instructions</div>
                        {step.instructions.map((ins, i) => (
                          <div key={i} className="instr-item">
                            <div className="instr-dot" />
                            <span>{ins}</span>
                          </div>
                        ))}
                      </div>

                      {/* COURT SCRIPT */}
                      <div style={{ marginBottom: '10px' }}>
                        {/* Header row */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          marginBottom: scriptOpen ? '10px' : '0', cursor: 'pointer',
                        }}
                          onClick={() => setExpandedScript(p => ({ ...p, [step.id]: !p[step.id] }))}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px' }}>✒</span>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, color: '#C9A84C',
                              textTransform: 'uppercase', letterSpacing: '0.08em',
                            }}>Court Script</span>
                            <span style={{
                              fontSize: '11px', color: '#C9A84C', transition: 'transform 0.25s',
                              display: 'inline-block', transform: scriptOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                              marginLeft: '4px',
                            }}>▼</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedScript(p => ({ ...p, [step.id]: true }))
                              setEditingSections(prev => ({ ...prev, [step.id]: !prev[step.id] }))
                            }}
                            style={{
                              background: 'transparent', border: 'none', cursor: 'pointer',
                              fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                              color: editingSections[step.id] ? '#4CAF7A' : '#6B6560',
                              transition: 'color 0.2s',
                            }}
                          >
                            {editingSections[step.id] ? '✓ Done' : '✏ Edit'}
                          </button>
                        </div>

                        {/* Script body */}
                        {scriptOpen && (
                          <div>
                            {editingSections[step.id] ? (
                              <textarea
                                autoFocus
                                value={editedData[step.id] !== undefined ? editedData[step.id] : step.script}
                                onChange={(e) => setEditedData({ ...editedData, [step.id]: e.target.value })}
                                style={{
                                  width: '100%', minHeight: '140px',
                                  background: '#0A0908', border: '1px solid rgba(201,168,76,0.3)',
                                  borderLeft: '3px solid #C9A84C', borderRadius: '0 8px 8px 0',
                                  color: '#D4CFC8', padding: '18px 22px',
                                  fontFamily: "'DM Mono', monospace", fontSize: '13px', lineHeight: '1.85',
                                  resize: 'vertical', outline: 'none',
                                }}
                              />
                            ) : (
                              <div style={{
                                background: '#0A0908', borderLeft: '3px solid #C9A84C',
                                borderRadius: '0 8px 8px 0', padding: '18px 22px',
                                fontFamily: "'DM Mono', monospace", fontSize: '13px',
                                lineHeight: 1.85, color: '#D4CFC8', whiteSpace: 'pre-wrap',
                              }}>
                                {editedData[step.id] !== undefined ? editedData[step.id] : step.script}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ADVOCATE TIP */}
                      <div style={{ marginTop: '10px' }}>
                        <div
                          onClick={() => setExpandedTips(p => ({ ...p, [step.id]: !p[step.id] }))}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            cursor: 'pointer', marginBottom: tipOpen ? '10px' : '0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px' }}>💡</span>
                            <span style={{
                              fontSize: '11px', fontWeight: 700, color: '#F59E0B',
                              textTransform: 'uppercase', letterSpacing: '0.07em',
                            }}>Advocate Tip</span>
                          </div>
                          <span style={{
                            fontSize: '11px', color: '#F59E0B', transition: 'transform 0.25s',
                            display: 'inline-block', transform: tipOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}>▼</span>
                        </div>
                        {tipOpen && (
                          <div style={{
                            background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.18)',
                            borderRadius: '10px', padding: '14px 18px',
                          }}>
                            <div style={{
                              fontStyle: 'italic', fontSize: '13px', color: '#A09890', lineHeight: 1.7,
                            }}>{step.tips}</div>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              )
            })}
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">

            {/* HEARING READINESS CARD */}
            <div className="panel-title">Hearing Readiness</div>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '24px', textAlign: 'center', marginBottom: '16px',
            }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C9A84C" />
                    <stop offset="100%" stopColor="#4CAF7A" />
                  </linearGradient>
                </defs>
                {/* Background track */}
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke="rgba(255,255,255,0.08)" strokeWidth="8"
                />
                {/* Progress arc */}
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke="url(#readinessGrad)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - progressPct / 100)}`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
                {/* Percentage text */}
                <text x="60" y="55" textAnchor="middle" fill="#F5F0E8"
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700 }}>
                  {progressPct}%
                </text>
                {/* Ready label */}
                <text x="60" y="74" textAnchor="middle" fill="#6B6560"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px' }}>
                  Ready
                </text>
              </svg>
              <div style={{ fontSize: '12px', color: '#6B6560', marginTop: '12px' }}>
                {completedCount} of {checklist.length} tasks done
              </div>
            </div>

            <div className="panel-divider" />

            {/* CHECKLIST */}
            <div className="panel-title">Pre-Hearing Checklist</div>
            {checklist.map(item => (
              <div key={item.id}
                onClick={() => toggleCheck(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div className={bouncingCheck === item.id ? 'checkbox-bounce' : ''} style={{
                  width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0,
                  background: item.done ? 'linear-gradient(135deg, #C9A84C, #A8782A)' : 'transparent',
                  border: item.done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  {item.done && <span style={{ fontSize: '12px', color: '#fff', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: '13px', lineHeight: 1.4,
                  color: item.done ? '#6B6560' : '#D4CFC8',
                  textDecoration: item.done ? 'line-through' : 'none',
                  transition: 'color 0.2s',
                }}>{item.text}</span>
              </div>
            ))}

            <div className="panel-divider" />
            
            {/* VERSIONS */}
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
                    <div style={{ fontSize: '12px', color: '#A09890', fontStyle: 'italic', lineHeight: 1.4 }}>{v.changeNote || 'Manual update'}</div>
                  </div>
                );
              })}
            </div>

            {Object.keys(editedData).length > 0 && (
              <button 
                onClick={() => setShowNoteModal(true)}
                style={{
                  width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #4CAF7A, #2E7D32)', border: 'none', color: '#fff',
                  fontWeight: 600, fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(76,175,122,0.2)', marginBottom: '16px'
                }}>
                💾 Save Changes
              </button>
            )}

            <div className="panel-divider" />

                {/* STEPS OUTLINE */}
                <div className="panel-title">Guide Steps</div>
                {dynamicSteps.map(step => (
                  <div key={step.id}
                    className={`step-outline-item ${activeStep === step.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveStep(step.id)
                      document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}>
                    <span className="step-outline-icon">{step.icon}</span>
                    <span className="step-outline-text">{step.title}</span>
                  </div>
                ))}

                <div className="panel-divider" />

                <button 
                  onClick={handleDownloadPDF}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #C9A84C, #A8782A)', border: 'none', color: '#0A0A0F',
                    fontWeight: 700, fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(201,168,76,0.25)', marginBottom: '8px', transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  ⬇ Download PDF
                </button>
                <button
                  onClick={() => navigate(`/case/${id}/research`)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', color: '#6B6560',
                    fontWeight: 600, fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    marginBottom: '8px', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.color = '#C9A84C'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#6B6560'; }}
                >
                  📄 Back to Research
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', color: '#6B6560',
                    fontWeight: 600, fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    marginBottom: '8px', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.color = '#C9A84C'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#6B6560'; }}
                >
                  🏠 Back to Dashboard
                </button>
              </div>

            </>
          )}
        </div>
      </div>
      
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999,
          background: '#4CAF7A', color: '#fff', padding: '12px 24px',
          borderRadius: '8px', fontSize: '14px', fontWeight: 500,
          boxShadow: '0 8px 24px rgba(76, 175, 122, 0.4)',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: "'DM Sans', sans-serif"
        }}>
          <span>✓</span> {toastMessage}
        </div>
      )}

      {/* SAVE VERSION MODAL */}
      {showNoteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div style={{
            background: '#1a1a1a', border: '1px solid #333', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%'
          }}>
            <h3 style={{ margin: '0 0 8px', color: '#fff' }}>Save Changes</h3>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>Enter a short note describing your edits.</p>
            <textarea
              autoFocus
              value={changeNote}
              onChange={e => setChangeNote(e.target.value)}
              placeholder="e.g. Refined closing prayer arguments..."
              style={{
                width: '100%', height: '80px', background: '#0a0a0a', border: '1px solid #333',
                color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '20px',
                fontFamily: "'DM Sans', sans-serif", resize: 'none'
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
                  padding: '8px 16px', background: '#4CAF7A', border: 'none', color: '#fff', fontWeight: 600,
                  borderRadius: '6px', cursor: savingVersion ? 'wait' : 'pointer'
                }}>
                {savingVersion ? 'Saving...' : 'Save Version'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
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
  )
}