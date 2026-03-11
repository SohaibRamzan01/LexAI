import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCases } from '../services/api'

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCases()
        setCases(data)
        const c = data.find(c => String(c._id) === String(id))
        if(c) setCurrentCase(c)
      } catch(err) {
        console.error("Failed to load cases", err)
      }
    }
    if (id) {
      fetchData()
    }
  }, [id])

  // removed static SIDEBAR_CASES
  const STATUS_DOT = { active: '#4CAF7A', done: '#C9A84C', pending: '#7B9FD4', urgent: '#E07060' }

  const toggleCheck = (itemId) => {
    setChecklist(prev => prev.map(i => i.id === itemId ? { ...i, done: !i.done } : i))
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

        /* ── MAIN ── */
        .guide-main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        .guide-topbar {
          padding: 14px 28px; border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,9,8,0.95); backdrop-filter: blur(8px);
          flex-shrink: 0; gap: 16px;
        }
        .guide-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #F5F0E8; }
        .guide-title span { color: #C9A84C; }
        .guide-meta { font-size: 11px; color: #6B6560; margin-top: 2px; }
        .topbar-actions { display: flex; gap: 7px; flex-shrink: 0; }
        .topbar-btn {
          padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
          color: #6B6560; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .topbar-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.25); }
        .topbar-btn.gold { color: #C9A84C; border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.08); }
        .topbar-btn.gold:hover { background: rgba(201,168,76,0.15); }
        .dl-btn {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
          cursor: pointer; border: none; font-family: 'DM Sans', sans-serif;
          transition: opacity 0.2s, transform 0.2s; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
        }
        .dl-btn:hover { opacity: 0.88; transform: translateY(-1px); }
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
      <div className="guide-sidebar">
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
      </div>

      {/* ── MAIN ── */}
      <div className="guide-main">

        {/* TOPBAR */}
        <div className="guide-topbar">
          <div>
            <div className="guide-title">Court Guide · <span>{GUIDE_DATA.hearingType}</span></div>
            <div className="guide-meta">{currentCase.clientName || GUIDE_DATA.client} · {currentCase.section || GUIDE_DATA.section} · {currentCase.court || GUIDE_DATA.court} · {GUIDE_DATA.generatedAt}</div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-btn" onClick={() => navigate(`/case/${id}/chat`)}>💬 Chat</button>
            <button className="topbar-btn gold" onClick={() => navigate(`/case/${id}/research`)}>📄 Research</button>
            <button className="dl-btn primary" onClick={handleDownloadPDF}>⬇ Download PDF</button>
          </div>
        </div>

        {/* BODY */}
        <div className="guide-body">

          {/* STEP NAV */}
          <div className="step-nav">
            {GUIDE_DATA.steps.map((step, i) => (
              <>
                <button
                  key={step.id}
                  className={`step-nav-btn ${activeStep === step.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveStep(step.id)
                    document.getElementById(`step-${step.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  title={step.title}
                >
                  {step.icon}
                </button>
                {i < GUIDE_DATA.steps.length - 1 && <div key={`conn-${i}`} className="step-nav-connector" />}
              </>
            ))}
          </div>

          {/* CONTENT */}
          <div className="guide-content">

            {/* Hidden print content */}
            <div id="guide-print-content" style={{ display: 'none' }}>
              {GUIDE_DATA.steps.map((step, i) => (
                <div key={step.id} className="print-step">
                  <div className="print-stage">{step.stage}</div>
                  <h2>{step.title}</h2>
                  <div className="print-objective">{step.objective}</div>
                  <ul>{step.instructions.map((ins, j) => <li key={j}>{ins}</li>)}</ul>
                  <div className="print-script">{step.script}</div>
                  <div className="print-tip">💡 Tip: {step.tips}</div>
                  {i < GUIDE_DATA.steps.length - 1 && <hr />}
                </div>
              ))}
            </div>

            {/* Visible step cards */}
            {GUIDE_DATA.steps.map((step) => {
              const isActive   = activeStep === step.id
              const scriptOpen = expandedScript[step.id]
              const tipOpen    = expandedTips[step.id]
              return (
                <div
                  key={step.id}
                  id={`step-${step.id}`}
                  className={`step-card ${isActive ? 'active-card' : ''}`}
                >
                  {/* CARD HEAD */}
                  <div className="step-card-head"
                    onClick={() => setActiveStep(isActive ? null : step.id)}>
                    <div className="step-number-circle" style={{
                      background: isActive ? `${step.tagColor}18` : 'rgba(255,255,255,0.03)',
                      borderColor: isActive ? `${step.tagColor}40` : 'rgba(255,255,255,0.08)',
                      color: isActive ? step.tagColor : '#6B6560',
                    }}>
                      {step.icon}
                    </div>
                    <div className="step-head-right">
                      <div className="step-stage-label" style={{ color: step.tagColor }}>{step.stage}</div>
                      <div className="step-heading">{step.title}</div>
                      <div className="step-objective">{step.objective}</div>
                    </div>
                    <div className="step-tag" style={{
                      color: step.tagColor,
                      background: `${step.tagColor}18`,
                      borderColor: `${step.tagColor}35`,
                    }}>{step.tag}</div>
                    <div className={`step-chevron ${isActive ? 'open' : ''}`}>▼</div>
                  </div>

                  {/* CARD BODY */}
                  {isActive && (
                    <div className="step-body">
                      <div className="step-instructions">
                        <div className="step-instr-title">📌 Instructions</div>
                        {step.instructions.map((ins, i) => (
                          <div key={i} className="instr-item">
                            <div className="instr-dot" />
                            <span>{ins}</span>
                          </div>
                        ))}
                      </div>

                      {/* SCRIPT TOGGLE */}
                      <div className="script-toggle">
                        <div className="script-toggle-head"
                          onClick={() => setExpandedScript(p => ({ ...p, [step.id]: !p[step.id] }))}>
                          <div className="script-toggle-label">
                            🎤 <span>What to Say — Court Script</span>
                          </div>
                          <span style={{ fontSize: 11, color: '#C9A84C', transition: 'transform 0.2s', display: 'inline-block', transform: scriptOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                        </div>
                        {scriptOpen && (
                          <div className="script-body">
                            {step.script}
                          </div>
                        )}
                      </div>

                      {/* TIP TOGGLE */}
                      <div className="tip-toggle" style={{ marginTop: 10 }}>
                        <div className="tip-toggle-head"
                          onClick={() => setExpandedTips(p => ({ ...p, [step.id]: !p[step.id] }))}>
                          <div className="tip-toggle-label">
                            💡 <span>Advocate Tip</span>
                          </div>
                          <span style={{ fontSize: 11, color: '#7B9FD4', transition: 'transform 0.2s', display: 'inline-block', transform: tipOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                        </div>
                        {tipOpen && (
                          <div className="tip-body">{step.tips}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* RIGHT PANEL */}
          <div className="right-panel">

            {/* PROGRESS RING */}
            <div className="panel-title">Hearing Readiness</div>
            <div className="progress-ring-wrap">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke="#C9A84C" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPct / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
                <text x="40" y="37" textAnchor="middle" fill="#C9A84C"
                  style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700 }}>
                  {progressPct}%
                </text>
                <text x="40" y="52" textAnchor="middle" fill="#6B6560"
                  style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 9 }}>
                  Ready
                </text>
              </svg>
              <div className="ring-label">{completedCount} of {checklist.length} tasks done</div>
            </div>

            <div className="panel-divider" />

            {/* CHECKLIST */}
            <div className="panel-title">Pre-Hearing Checklist</div>
            {checklist.map(item => (
              <div key={item.id}
                className={`checklist-item ${item.done ? 'checked' : ''}`}
                onClick={() => toggleCheck(item.id)}>
                <div className="check-box">{item.done ? '✓' : ''}</div>
                <div className="check-text">{item.text}</div>
              </div>
            ))}

            <div className="panel-divider" />

            {/* STEPS OUTLINE */}
            <div className="panel-title">Guide Steps</div>
            {GUIDE_DATA.steps.map(step => (
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

            <button className="panel-btn primary" onClick={handleDownloadPDF}>⬇ Download PDF</button>
            <button className="panel-btn secondary" onClick={() => navigate(`/case/${id}/research`)}>📄 Research</button>
            <button className="panel-btn secondary" onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
          </div>

        </div>
      </div>
    </div>
  )
}