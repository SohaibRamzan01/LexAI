import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sendMessage, getChatHistory } from '../services/api'

const LANGUAGES = {
  english: {
    label: 'English', flag: '🇬🇧',
    placeholder: 'Describe your case or ask a legal question...',
    hint: 'Press Enter to send · Shift+Enter for new line',
    typingText: 'LexAI is analyzing...',
  },
  urdu: {
    label: 'اردو', flag: '🇵🇰',
    placeholder: 'اپنا مقدمہ بیان کریں یا قانونی سوال پوچھیں...',
    hint: 'بھیجنے کے لیے Enter دبائیں',
    typingText: 'LexAI تجزیہ کر رہا ہے...',
  },
  roman: {
    label: 'Roman Urdu', flag: '🇵🇰',
    placeholder: 'Apna muqadma bayan karein ya qanooni sawal poochein...',
    hint: 'Bhejna ke liye Enter dabayein · Nai line ke liye Shift+Enter',
    typingText: 'LexAI tajziya kar raha hai...',
  },
}

const SIDEBAR_CASES = [
  { id: 1, client: 'Ahmad Raza', section: 'Sec. 302', type: 'Murder',   status: 'active'  },
  { id: 2, client: 'Bilal Khan', section: 'Sec. 420', type: 'Fraud',    status: 'done'    },
  { id: 3, client: 'Sara Ali',   section: 'Custody',  type: 'Family',   status: 'pending' },
  { id: 4, client: 'Tariq Butt', section: 'Bail App.',type: 'Criminal', status: 'urgent'  },
]
const STATUS_DOT = { active: '#4CAF7A', done: '#C9A84C', pending: '#7B9FD4', urgent: '#E07060' }

const QUICK_PROMPTS = {
  english: [
    'My client is in jail under Section 302',
    'Need help with bail application',
    'Case is purely circumstantial',
    'No eyewitness in the case',
    'Property dispute turned criminal',
  ],
  urdu: [
    'میرے موکل کو دفعہ 302 کے تحت گرفتار کیا گیا ہے',
    'ضمانت کی درخواست میں مدد چاہیے',
    'مقدمہ قرائن پر مبنی ہے',
    'کوئی چشم دید گواہ نہیں',
  ],
  roman: [
    'Mere muwakkil ko Section 302 ke tehat giriftaar kiya gaya hai',
    'Zamanat ki darkhwast mein madad chahiye',
    'Muqadma qarain par mabni hai',
    'Koi chashm deed gawaah nahi',
  ],
}

const FEE_KEYWORDS = [
  'paid', 'payment', 'fee', 'fees', 'rupees', 'rs.', 'lakh', 'thousand',
  'installment', 'remaining', 'balance', 'total fee', 'agreed', 'retainer',
  'pay kar diya', 'paisa', 'raqam', 'ادا', 'فیس', 'تنخواہ', 'معاوضہ',
]

export default function Chat() {
  const navigate = useNavigate()
  const { id }   = useParams()

  const [language,      setLanguage]      = useState('english')
  const [showLangDrop,  setShowLangDrop]  = useState(false)
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [isTyping,      setIsTyping]      = useState(false)
  const [caseTitle,     setCaseTitle]     = useState('New Case')
  const [caseSection,   setCaseSection]   = useState('')
  const [researchReady, setResearchReady] = useState(false)
  const [error,         setError]         = useState(null)
  const [chatHistory,   setChatHistory]   = useState([])
  const [feeDetected,   setFeeDetected]   = useState(null)
  const [feeDismissed,  setFeeDismissed]  = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)
  const langDropRef    = useRef(null)

  const lang = LANGUAGES[language]

  // ── Auto scroll ────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, feeDetected])

  // ── Close lang dropdown on outside click ──────────────────
  useEffect(() => {
    const handler = (e) => {
      if (langDropRef.current && !langDropRef.current.contains(e.target)) {
        setShowLangDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Load Chat History on mount ─────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await getChatHistory(id)
        
        if (historyData && historyData.length > 0) {
          const formattedMessages = historyData.map(msg => ({
            id: msg._id || Date.now() + Math.random(),
            role: msg.role,
            text: msg.text,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language: msg.language || 'english'
          }))
          setMessages(formattedMessages)
          setChatHistory(formattedMessages)
          if (formattedMessages.length >= 2) setResearchReady(true)
        } else {
          // If no history, show greeting
          const greetings = {
            english: `Salaam! I am **LexAI**, your AI legal co-worker specializing in **Pakistani law**.\n\nPlease describe your case in detail — tell me your client's situation, the section they are charged under, and what outcome you are seeking.\n\nI will provide you with:\n- Applicable laws & sections\n- Bail grounds & strategy\n- Relevant court precedents\n- Step-by-step court script`,
            urdu:    `سلام! میں **LexAI** ہوں — پاکستانی قانون میں آپ کا AI قانونی ساتھی۔\n\nبراہ کرم اپنا مقدمہ تفصیل سے بیان کریں۔ میں آپ کو درج ذیل فراہم کروں گا:\n- قابل اطلاق قوانین\n- ضمانت کی بنیادیں\n- عدالتی نظائر\n- عدالت میں کیا کہنا ہے`,
            roman:   `Salaam! Main **LexAI** hoon — Pakistani qanoon mein aap ka AI qanooni saathi.\n\nApna muqadma tafseel se bayan karein. Main aap ko yeh faraham karunga:\n- Qabil-e-tatbeeq qawaneen\n- Zamanat ki bunyadein\n- Adalati nazaair\n- Adalat mein kya kehna hai`,
          }
          setMessages([{
            id: Date.now(), role: 'ai', text: greetings[language],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }])
        }
      } catch (err) {
        console.error("Failed to load chat history", err)
      }
    }
    
    if (id) {
      fetchHistory()
    }
  }, [id, language])

  // ── Fee detection ──────────────────────────────────────────
  const detectFeeInfo = (text) => {
    const lower = text.toLowerCase()
    const hasFeeKeyword = FEE_KEYWORDS.some(kw => lower.includes(kw))
    const hasAmount     = /\b\d[\d,]*\b/.test(text)
    if (hasFeeKeyword && hasAmount) {
      const amountMatch = text.match(/[\d,]+/)
      const amount      = amountMatch ? amountMatch[0].replace(/,/g, '') : null
      setFeeDetected({ text, amount })
      setFeeDismissed(false)
    }
  }

  // ── Markdown-lite renderer ─────────────────────────────────
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts    = line.split(/\*\*(.*?)\*\*/g)
      const rendered = parts.map((part, j) =>
        j % 2 === 1
          ? <strong key={j} style={{ color: '#C9A84C', fontWeight: 700 }}>{part}</strong>
          : part
      )
      if (line.startsWith('- ')) {
        return (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
            <span style={{ color: '#C9A84C', flexShrink: 0, marginTop: 2 }}>•</span>
            <span>{parts.map((p, j) => j % 2 === 1
              ? <strong key={j} style={{ color: '#C9A84C' }}>{p}</strong>
              : p.replace(/^- /, ''))}
            </span>
          </div>
        )
      }
      if (/^\d+\./.test(line)) {
        return (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
            <span style={{ color: '#C9A84C', flexShrink: 0, fontWeight: 700, minWidth: 16 }}>
              {line.match(/^\d+/)[0]}.
            </span>
            <span>{parts.map((p, j) => j % 2 === 1
              ? <strong key={j} style={{ color: '#C9A84C' }}>{p}</strong>
              : p.replace(/^\d+\.\s*/, ''))}</span>
          </div>
        )
      }
      if (line === line.toUpperCase() && line.trim().length > 3 && /^[A-Z\s&:—\-]+$/.test(line)) {
        return (
          <div key={i} style={{
            fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.07em',
            textTransform: 'uppercase', marginTop: i > 0 ? 12 : 0, marginBottom: 6,
            paddingBottom: 4, borderBottom: '1px solid rgba(201,168,76,0.2)',
          }}>{line}</div>
        )
      }
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />
      return <div key={i} style={{ marginBottom: 2 }}>{rendered}</div>
    })
  }

  // ── Send message ───────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userText = input.trim()

    if (messages.length <= 1) {
      const words = userText.split(' ')
      setCaseTitle(words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : ''))
      const secMatch = userText.match(/\b\d{3}\b/)
      if (secMatch) setCaseSection(`Section ${secMatch[0]}`)
    }

    const userMsg = {
      id: Date.now(), role: 'user', text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)
    setError(null)

    // Run fee detection on every user message
    detectFeeInfo(userText)

    try {
      // Call our secure Backend API instead of Google Gemini directly!
      const data = await sendMessage(id, userText, language)
      
      const aiText = data.aiMessage ? data.aiMessage.text : (data.message || 'No response')

      setChatHistory(prev => [
        ...prev,
        { role: 'user', text: userText },
        { role: 'ai', text: aiText }
      ])

      const aiMsgObj = {
        id: Date.now() + 1, role: 'ai', text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMsgObj])
      if (chatHistory.length >= 1) setResearchReady(true)

    } catch (err) {
      console.error('Gemini error:', err)
      setError(
        language === 'urdu'  ? 'AI سے جواب حاصل کرنے میں خرابی ہوئی۔ دوبارہ کوشش کریں۔' :
        language === 'roman' ? 'AI se jawab hasil karne mein kharabi hui. Dobara koshish karein.' :
        'Failed to get AI response. Please check your API key and try again.'
      )
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleLangChange = (key) => {
    setLanguage(key)
    setShowLangDrop(false)
  }

  // ══════════════════════════════════════════════════════════
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0A0908', minHeight: '100vh', color: '#F5F0E8', display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 2px; }

        /* ── SIDEBAR ── */
        .chat-sidebar {
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

        /* ── CHAT MAIN ── */
        .chat-main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

        .chat-topbar {
          padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(10,9,8,0.95); backdrop-filter: blur(8px);
          flex-shrink: 0; gap: 12px;
        }
        .chat-case-badge {
          background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.25);
          border-radius: 6px; padding: 4px 10px;
          font-family: 'DM Mono', monospace; font-size: 10px; color: #C9A84C; white-space: nowrap;
        }
        .chat-case-name { font-size: 14px; font-weight: 600; color: #F5F0E8; }
        .chat-case-sub  { font-size: 11px; color: #6B6560; }
        .topbar-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; flex-wrap: wrap; }
        .topbar-btn {
          padding: 7px 13px; border-radius: 7px; font-size: 11px; font-weight: 500;
          color: #6B6560; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02); cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .topbar-btn:hover { color: #C9A84C; border-color: rgba(201,168,76,0.25); }
        .topbar-btn.gold { color: #C9A84C; border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.08); }
        .topbar-btn.gold:hover { background: rgba(201,168,76,0.15); }
        .topbar-btn.fees { color: #4CAF7A; border-color: rgba(76,175,122,0.3); background: rgba(76,175,122,0.08); }
        .topbar-btn.fees:hover { background: rgba(76,175,122,0.15); }

        /* ── LANGUAGE DROPDOWN ── */
        .lang-wrap { position: relative; }
        .lang-trigger {
          display: flex; align-items: center; gap: 7px; padding: 7px 12px;
          border-radius: 8px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          font-size: 12px; font-weight: 600; color: #F5F0E8;
          transition: all 0.2s; white-space: nowrap;
          font-family: 'DM Sans', sans-serif; outline: none;
        }
        .lang-trigger:hover, .lang-trigger.open { border-color: rgba(201,168,76,0.4); color: #C9A84C; background: rgba(201,168,76,0.08); }
        .lang-chevron { font-size: 9px; transition: transform 0.2s; }
        .lang-chevron.open { transform: rotate(180deg); }
        .lang-menu {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: #151210; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 6px; box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          z-index: 100; min-width: 170px;
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .lang-menu-title { font-size: 10px; color: #3A3530; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 12px 6px; }
        .lang-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }
        .lang-option {
          display: flex; align-items: center; gap: 10px; padding: 9px 12px;
          border-radius: 7px; cursor: pointer; transition: background 0.15s;
          font-size: 13px; color: #A09890;
        }
        .lang-option:hover { background: rgba(255,255,255,0.05); color: #F5F0E8; }
        .lang-option.selected { background: rgba(201,168,76,0.1); color: #C9A84C; }
        .lang-option-flag { font-size: 16px; }
        .lang-option-label { flex: 1; font-weight: 500; }
        .lang-option-check { font-size: 11px; color: #C9A84C; }

        /* ── MESSAGES ── */
        .chat-messages {
          flex: 1; padding: 24px; overflow-y: auto;
          display: flex; flex-direction: column; gap: 18px;
        }
        .msg-row { display: flex; gap: 10px; align-items: flex-start; }
        .msg-row.user-row { flex-direction: row-reverse; }
        .msg-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
        }
        .ai-avatar {
          background: linear-gradient(135deg, #1A1208, #2A1F08);
          border: 1px solid rgba(201,168,76,0.3);
          color: #C9A84C; font-family: 'Playfair Display', serif; font-size: 14px;
        }
        .user-avatar-msg { background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F; }
        .msg-content { max-width: 560px; }
        .msg-row.user-row .msg-content { align-items: flex-end; display: flex; flex-direction: column; }
        .msg-bubble { padding: 13px 17px; border-radius: 14px; font-size: 13px; line-height: 1.75; }
        .ai-bubble {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #F5F0E8; border-radius: 4px 14px 14px 14px;
        }
        .user-bubble {
          background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(168,120,42,0.12));
          border: 1px solid rgba(201,168,76,0.25);
          color: #F5F0E8; border-radius: 14px 4px 14px 14px;
        }
        .msg-time { font-size: 10px; color: #3A3530; margin-top: 5px; padding: 0 4px; }
        .lang-badge {
          display: inline-flex; align-items: center; gap: 4px; font-size: 9px;
          color: #C9A84C; font-weight: 700; background: rgba(201,168,76,0.1);
          border: 1px solid rgba(201,168,76,0.2); padding: 2px 7px; border-radius: 4px;
          margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* ── TYPING ── */
        .typing-row { display: flex; gap: 10px; align-items: center; }
        .typing-bubble {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px 14px 14px 14px; padding: 13px 18px;
          display: flex; align-items: center; gap: 10px;
        }
        .typing-dots { display: flex; gap: 4px; }
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #C9A84C;
          animation: typingPulse 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingPulse {
          0%, 60%, 100% { opacity: 0.2; transform: scale(0.85); }
          30% { opacity: 1; transform: scale(1.15); }
        }
        .typing-text { font-size: 12px; color: #6B6560; font-style: italic; }

        /* ── FEE DETECTION BANNER ── */
        .fee-banner {
          background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.28);
          border-radius: 12px; padding: 14px 18px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          animation: fadeSlideIn 0.3s ease;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fee-banner-left { display: flex; align-items: center; gap: 12px; }
        .fee-banner-icon { font-size: 22px; flex-shrink: 0; }
        .fee-banner-title { font-size: 12px; font-weight: 700; color: #C9A84C; margin-bottom: 3px; }
        .fee-banner-sub { font-size: 12px; color: #A09890; line-height: 1.5; }
        .fee-banner-sub strong { color: #F5F0E8; }
        .fee-banner-actions { display: flex; gap: 7px; flex-shrink: 0; }
        .fee-update-btn {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
          background: linear-gradient(135deg, #C9A84C, #A8782A); color: #0A0A0F;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 3px 10px rgba(201,168,76,0.25); transition: opacity 0.2s;
          white-space: nowrap;
        }
        .fee-update-btn:hover { opacity: 0.88; }
        .fee-dismiss-btn {
          padding: 8px 12px; border-radius: 8px; font-size: 12px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #6B6560; cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; white-space: nowrap;
        }
        .fee-dismiss-btn:hover { color: #F5F0E8; border-color: rgba(255,255,255,0.2); }

        /* ── ERROR ── */
        .error-msg {
          background: rgba(224,112,96,0.08); border: 1px solid rgba(224,112,96,0.2);
          border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #E07060;
          display: flex; align-items: center; gap: 8px;
        }

        /* ── INPUT AREA ── */
        .chat-input-area {
          padding: 14px 24px 18px; border-top: 1px solid rgba(255,255,255,0.07);
          background: #0A0908; flex-shrink: 0;
        }
        .quick-prompts { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
        .quick-prompt {
          padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 500;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: #6B6560; cursor: pointer; transition: all 0.2s; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
        .quick-prompt:hover { color: #C9A84C; border-color: rgba(201,168,76,0.3); background: rgba(201,168,76,0.06); }
        .input-box {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 13px 16px;
          display: flex; align-items: flex-end; gap: 10px; transition: border-color 0.2s;
        }
        .input-box:focus-within { border-color: rgba(201,168,76,0.4); background: rgba(201,168,76,0.03); }
        .chat-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          color: #F5F0E8; font-size: 13px; font-family: 'DM Sans', sans-serif;
          resize: none; min-height: 22px; max-height: 120px; line-height: 1.6;
        }
        .chat-textarea::placeholder { color: #3A3530; }
        .send-btn {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #C9A84C, #A8782A);
          border: none; color: #0A0A0F; cursor: pointer; font-size: 15px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(201,168,76,0.3); transition: opacity 0.2s, transform 0.2s;
        }
        .send-btn:hover { opacity: 0.9; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .input-hint { font-size: 10px; color: #3A3530; margin-top: 7px; text-align: center; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">Lex<span>AI</span></div>
          <button className="icon-btn" onClick={() => navigate('/dashboard')}>🏠</button>
        </div>
        <button className="new-case-btn" onClick={() => navigate('/dashboard')}>＋ New Case</button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div className="sidebar-section-lbl">Cases</div>
          {SIDEBAR_CASES.map(c => (
            <div key={c.id}
              className={`case-item ${String(c.id) === String(id) ? 'active' : ''}`}
              onClick={() => navigate(`/case/${c.id}/chat`)}>
              <div className="case-dot" style={{ background: STATUS_DOT[c.status] }} />
              <div>
                <div className="case-item-title">{c.client} · {c.section}</div>
                <div className="case-item-meta">{c.type}</div>
              </div>
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
      </div>

      {/* ── CHAT MAIN ── */}
      <div className="chat-main">

        {/* TOPBAR */}
        <div className="chat-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="chat-case-badge">CR-2024-{id || '0042'}</div>
            <div>
              <div className="chat-case-name">{caseTitle}</div>
              <div className="chat-case-sub">
                {caseSection || 'Pakistan Law AI'} · {lang.flag} {lang.label}
              </div>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="topbar-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>

            {/* LANGUAGE DROPDOWN */}
            <div className="lang-wrap" ref={langDropRef}>
              <button
                className={`lang-trigger ${showLangDrop ? 'open' : ''}`}
                onClick={() => setShowLangDrop(!showLangDrop)}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                <span className={`lang-chevron ${showLangDrop ? 'open' : ''}`}>▼</span>
              </button>
              {showLangDrop && (
                <div className="lang-menu">
                  <div className="lang-menu-title">Response Language</div>
                  <div className="lang-divider" />
                  {Object.entries(LANGUAGES).map(([key, val]) => (
                    <div key={key}
                      className={`lang-option ${language === key ? 'selected' : ''}`}
                      onClick={() => handleLangChange(key)}>
                      <span className="lang-option-flag">{val.flag}</span>
                      <span className="lang-option-label">{val.label}</span>
                      {language === key && <span className="lang-option-check">✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FEES BUTTON — always visible */}
            <button className="topbar-btn fees" onClick={() => navigate(`/case/${id}/fees`)}>
              💰 Fees
            </button>

            {/* RESEARCH + COURT GUIDE — appear after enough context */}
            {researchReady && (
              <>
                <button className="topbar-btn gold" onClick={() => navigate(`/case/${id}/research`)}>
                  📄 Research
                </button>
                <button className="topbar-btn gold" onClick={() => navigate(`/case/${id}/guide`)}>
                  🎤 Court Guide
                </button>
              </>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`msg-row ${msg.role === 'user' ? 'user-row' : ''}`}>
              <div className={`msg-avatar ${msg.role === 'ai' ? 'ai-avatar' : 'user-avatar-msg'}`}>
                {msg.role === 'ai' ? 'L' : 'AK'}
              </div>
              <div className="msg-content">
                {msg.role === 'ai' && (
                  <div className="lang-badge">{lang.flag} {lang.label}</div>
                )}
                <div
                  className={`msg-bubble ${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'}`}
                  style={{ direction: language === 'urdu' ? 'rtl' : 'ltr' }}
                >
                  {msg.role === 'ai' ? renderText(msg.text) : msg.text}
                </div>
                <div className="msg-time">{msg.time}</div>
              </div>
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {isTyping && (
            <div className="typing-row">
              <div className="msg-avatar ai-avatar">L</div>
              <div className="typing-bubble">
                <div className="typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
                <div className="typing-text">{lang.typingText}</div>
              </div>
            </div>
          )}

          {/* FEE DETECTION BANNER */}
          {feeDetected && !feeDismissed && (
            <div className="fee-banner">
              <div className="fee-banner-left">
                <div className="fee-banner-icon">💰</div>
                <div>
                  <div className="fee-banner-title">Fee Information Detected</div>
                  <div className="fee-banner-sub">
                    Amount mentioned:{' '}
                    <strong>
                      {feeDetected.amount
                        ? `Rs. ${Number(feeDetected.amount).toLocaleString('en-PK')}`
                        : 'amount detected'}
                    </strong>
                    {' '}— Would you like to update the fees record for this case?
                  </div>
                </div>
              </div>
              <div className="fee-banner-actions">
                <button
                  className="fee-update-btn"
                  onClick={() => { navigate(`/case/${id}/fees`); setFeeDismissed(true) }}
                >
                  💰 Update Fees
                </button>
                <button
                  className="fee-dismiss-btn"
                  onClick={() => setFeeDismissed(true)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="error-msg">⚠ {error}</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="chat-input-area">
          <div className="quick-prompts">
            {QUICK_PROMPTS[language].map((p, i) => (
              <button key={i} className="quick-prompt" onClick={() => setInput(p)}>{p}</button>
            ))}
          </div>
          <div className="input-box">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder={lang.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              style={{ direction: language === 'urdu' ? 'rtl' : 'ltr' }}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              ➤
            </button>
          </div>
          <div className="input-hint">{lang.hint}</div>
        </div>

      </div>
    </div>
  )
}