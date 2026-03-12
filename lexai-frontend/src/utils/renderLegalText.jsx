// src/utils/renderLegalText.jsx

export function renderInline(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#C9A84C', fontWeight: 700 }}>{part}</strong>
      : part
  );
}

export default function renderLegalText(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const t = line.trim();
    // ALL CAPS header
    if (t.length > 3 && t === t.toUpperCase() && /^[A-Z\s\-&:/]+$/.test(t)) {
      return <div key={i} style={{ fontSize: 11, fontWeight: 800, color: '#C9A84C',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        marginTop: i > 0 ? 20 : 0, marginBottom: 8,
        paddingBottom: 6, borderBottom: '1px solid rgba(201,168,76,0.25)' }}>{t}</div>;
    }
    // Numbered list
    if (/^\d+\./.test(t)) {
      const num  = t.match(/^\d+/)[0];
      const rest = t.replace(/^\d+\.\s*/, '');
      return <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
        <span style={{ color: '#C9A84C', fontWeight: 800, fontSize: 13, minWidth: 22, flexShrink: 0, marginTop: 2 }}>{num}.</span>
        <span style={{ color: '#D4CFC8', fontSize: 14, lineHeight: 1.75 }}>{renderInline(rest)}</span>
      </div>;
    }
    // Bullet
    if (t.startsWith('- ') || t.startsWith('* ')) {
      const rest = t.replace(/^[-*]\s/, '');
      return <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
        <span style={{ color: '#C9A84C', fontSize: 16, flexShrink: 0, lineHeight: 1 }}>&#8226;</span>
        <span style={{ color: '#D4CFC8', fontSize: 14, lineHeight: 1.75 }}>{renderInline(rest)}</span>
      </div>;
    }
    // Empty line spacer
    if (t === '') return <div key={i} style={{ height: 8 }} />;
    // Default text
    return <div key={i} style={{ color: '#D4CFC8', fontSize: 14, lineHeight: 1.8, marginBottom: 4 }}>{renderInline(line)}</div>;
  });
}
