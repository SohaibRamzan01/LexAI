import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getSummaryReport, 
    getRevenueReport, 
    getCasesReport, 
    getWinLossReport, 
    getResearchReport,
    updateTargetIncome
} from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function Reports() {
    const navigate = useNavigate();

    const [summary,  setSummary]  = useState(null);
    const [revenue,  setRevenue]  = useState(null);
    const [cases,    setCases]    = useState(null);
    const [winloss,  setWinloss]  = useState(null);
    const [research, setResearch] = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const [targetIncome, setTargetIncome] = useState("");
    const [targetMonthKey, setTargetMonthKey] = useState("");
    const [savingTarget, setSavingTarget] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [s, r, c, w, res] = await Promise.all([
                    getSummaryReport().catch(err => ({ error: err.message || "Failed to load summary" })),
                    getRevenueReport().catch(err => ({ error: err.message || "Failed to load revenue" })),
                    getCasesReport().catch(err => ({ error: err.message || "Failed to load cases" })),
                    getWinLossReport().catch(err => ({ error: err.message || "Failed to load win/loss stats" })),
                    getResearchReport().catch(err => ({ error: err.message || "Failed to load research" })),
                ]);
                
                
                setSummary(s);  
                setRevenue(r);
                setCases(c);    
                setWinloss(w);  
                setResearch(res);

                if (r && r.monthlyTrend && r.monthlyTrend.length > 0) {
                    const currentMonth = r.monthlyTrend[r.monthlyTrend.length - 1];
                    setTargetMonthKey(currentMonth.monthKey || "");
                    setTargetIncome(currentMonth.target?.toString() || "60000");
                }
            } catch (err) {
                console.error("Reports load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSaveTarget = async () => {
        if (!targetMonthKey || !targetIncome) return;
        setSavingTarget(true);
        try {
            await updateTargetIncome(targetMonthKey, Number(targetIncome));
            const r = await getRevenueReport();
            setRevenue(r);
        } catch(err) {
            console.error("Failed to update target:", err);
        } finally {
            setSavingTarget(false);
        }
    };

    // Helper to render skeleton loading blocks
    const SkeletonBlock = ({ height }) => (
        <div style={{
            height,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            animation: 'pulse 1.5s infinite ease-in-out'
        }} />
    );

    // Helper to render error state block
    const ErrorBlock = ({ title, error }) => (
        <div style={{
            padding: '24px',
            background: 'rgba(224, 112, 96, 0.05)',
            border: '1px solid rgba(224, 112, 96, 0.2)',
            borderRadius: '12px',
            color: '#E07060',
            fontFamily: "'DM Sans', sans-serif"
        }}>
            <div style={{ fontWeight: 700, marginBottom: '8px' }}>Failed to load {title}</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>{error || 'An unexpected error occurred.'}</div>
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

                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }

                .sidebar {
                    width: 260px; min-width: 260px; background: #0E0C0A;
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
                    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #C9A84C;
                    white-space: nowrap; overflow: hidden; transition: opacity 0.2s;
                }
                .sidebar-logo span { color: #F5F0E8; }
                .sidebar.collapsed .sidebar-logo { opacity: 0; width: 0; }

                .icon-btn {
                    width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 13px; cursor: pointer; color: #6B6560; outline: none; transition: all 0.2s;
                }
                .icon-btn:hover { background: rgba(201,168,76,0.1); color: #C9A84C; }
                
                .main-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
                .topbar {
                    padding: 14px 28px; border-bottom: 1px solid rgba(255,255,255,0.07);
                    display: flex; align-items: center; justify-content: space-between;
                    background: rgba(10,9,8,0.95); backdrop-filter: blur(8px);
                }
                .topbar-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #F5F0E8; }
                
                .content { flex: 1; overflow-y: auto; padding: 28px 32px; display: flex; flex-direction: column; gap: 24px; }
                
                .section-header { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #C9A84C; margin-bottom: 16px; border-bottom: 1px solid rgba(201,168,76,0.15); padding-bottom: 8px;}
                
                .hero-cards { display: flex; gap: 20px; margin-bottom: 12px; flex-wrap: wrap; }
                .hero-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 14px; padding: 24px; flex: 1; min-width: 200px;
                    display: flex; flex-direction: column; position: relative; overflow: hidden;
                }
                .hero-card-top-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
                .hero-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .hero-card-title { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
                .hero-card-icon { font-size: 18px; }
                .hero-card-value { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; margin-bottom: 6px; }
                .hero-card-sub { font-size: 12px; color: #6B6560; }

                .debug-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 12px; padding: 24px; color: #A09890; font-family: 'DM Mono', monospace; font-size: 12px;
                    white-space: pre-wrap; word-break: break-all;
                }

                .export-btn {
                    padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
                    font-family: 'DM Sans', sans-serif; cursor: pointer; border: none;
                    background: linear-gradient(135deg, #C9A84C, #A8782A);
                    color: #0A0A0F; display: flex; align-items: center; gap: 6px;
                    transition: opacity 0.2s, transform 0.2s;
                    box-shadow: 0 4px 14px rgba(201,168,76,0.25);
                }
                .export-btn:hover { opacity: 0.9; transform: translateY(-1px); }

                .chart-section { page-break-inside: avoid; }

                .print-header { display: none; }

                @media print {
                    .sidebar          { display: none !important; }
                    .topbar           { display: none !important; }
                    .export-btn       { display: none !important; }
                    .print-header     { display: block !important; }

                    body, html        { background: #ffffff !important; color: #1C1C1C !important; }
                    .main-col         { overflow: visible !important; }
                    .content          { padding: 0 !important; }

                    .hero-card,
                    .chart-section,
                    .debug-card       { background: #ffffff !important;
                                        border: 1px solid #dddddd !important;
                                        color: #1C1C1C !important;
                                        -webkit-print-color-adjust: exact;
                                        print-color-adjust: exact; }

                    .hero-card-value  { color: #1C1C1C !important; }
                    .hero-card-title  { color: #555555 !important; }
                    .hero-card-sub    { color: #777777 !important; }
                    .section-header   { color: #1C1C1C !important; border-color: #dddddd !important; }

                    .recharts-surface { filter: none !important; }
                    .recharts-cartesian-grid line { stroke: #eeeeee !important; }

                    * { box-shadow: none !important; }
                }
            `}</style>
            
            {/* SIDEBAR */}
            <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>Lex<span>AI</span></div>
                    <button className="icon-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                        {sidebarCollapsed ? '▶' : '◀'}
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-col">
                <div className="topbar">
                    <div className="topbar-title">Firm Analytics & Reports</div>
                    <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button className="export-btn" onClick={() => window.print()}>📥 Export PDF</button>
                    </div>
                </div>

                <div className="content">
                    {/* Print Header — hidden on screen, shows at top of PDF */}
                    <div className="print-header" style={{ padding: '20px 0', marginBottom: 20, borderBottom: '2px solid #C9A84C' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#C9A84C' }}>LexAI</div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: '#1C1C1C' }}>Reports & Analytics</div>
                        <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>
                            Advocate: {JSON.parse(localStorage.getItem('lexai_user') || '{}').firstName || 'Lawyer'} {JSON.parse(localStorage.getItem('lexai_user') || '{}').lastName || ''}
                        </div>
                        <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                            Generated: {new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    {loading ? (
                        <>
                            <SkeletonBlock height="120px" />
                            <SkeletonBlock height="300px" />
                            <SkeletonBlock height="300px" />
                            <SkeletonBlock height="300px" />
                        </>
                    ) : (
                        <>
                            <div className="hero-cards">
                                {/* Card 1 */}
                                <div className="hero-card">
                                    <div className="hero-card-top-bar" style={{ background: '#C9A84C' }} />
                                    <div className="hero-card-header">
                                        <div className="hero-card-title">Total Cases</div>
                                        <div className="hero-card-icon">💼</div>
                                    </div>
                                    <div className="hero-card-value" style={{ color: '#C9A84C' }}>
                                        {summary?.error ? '-' : summary?.totalCases || 0}
                                    </div>
                                    <div className="hero-card-sub">All time</div>
                                </div>

                                {/* Card 2 */}
                                {(() => {
                                    const wr = summary?.error ? 0 : summary?.winRate || 0;
                                    const wrColor = wr > 60 ? '#4CAF7A' : wr >= 40 ? '#E0B050' : '#E07060';
                                    return (
                                        <div className="hero-card">
                                            <div className="hero-card-top-bar" style={{ background: wrColor }} />
                                            <div className="hero-card-header">
                                                <div className="hero-card-title">Win Rate</div>
                                                <div className="hero-card-icon">⚖️</div>
                                            </div>
                                            <div className="hero-card-value" style={{ color: wrColor }}>
                                                {summary?.error ? '-' : `${wr}%`}
                                            </div>
                                            <div className="hero-card-sub">Of decided cases</div>
                                        </div>
                                    )
                                })()}

                                {/* Card 3 */}
                                <div className="hero-card">
                                    <div className="hero-card-top-bar" style={{ background: '#C9A84C' }} />
                                    <div className="hero-card-header">
                                        <div className="hero-card-title">Revenue Collected</div>
                                        <div className="hero-card-icon">💰</div>
                                    </div>
                                    <div className="hero-card-value" style={{ color: '#C9A84C' }}>
                                        {revenue?.error ? '-' : `Rs ${(revenue?.totalReceived || 0).toLocaleString()}`}
                                    </div>
                                    <div className="hero-card-sub">Total collected</div>
                                </div>

                                {/* Card 4 */}
                                <div className="hero-card">
                                    <div className="hero-card-top-bar" style={{ background: '#7B9FD4' }} />
                                    <div className="hero-card-header">
                                        <div className="hero-card-title">Total Hearings</div>
                                        <div className="hero-card-icon">🏛️</div>
                                    </div>
                                    <div className="hero-card-value" style={{ color: '#7B9FD4' }}>
                                        {summary?.error ? '-' : summary?.totalHearings || 0}
                                    </div>
                                    <div className="hero-card-sub">Court appearances</div>
                                </div>
                            </div>

                            <div>
                                <div className="section-header">Revenue Breakdown</div>
                                {revenue?.error ? <ErrorBlock title="Revenue Report" error={revenue.error} /> : (
                                    <>
                                        {/* Revenue Summary Row */}
                                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                            {[
                                                { label: 'Total Agreed', value: revenue?.totalAgreed || 0, color: '#C9A84C' },
                                                { label: 'Total Received', value: revenue?.totalReceived || 0, color: '#4CAF7A' },
                                                { label: 'Total Pending', value: revenue?.totalPending || 0, color: '#E07060' },
                                            ].map((item, i) => (
                                                <div key={i} style={{
                                                    flex: 1, minWidth: '160px', padding: '16px 20px',
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                    borderRadius: '10px'
                                                }}>
                                                    <div style={{ fontSize: '11px', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 700 }}>{item.label}</div>
                                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: item.color }}>Rs {item.value.toLocaleString()}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Monthly Bar Chart */}
                                        <div className="chart-section" style={{
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                            borderRadius: '12px', padding: '24px', marginBottom: '20px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#A09890' }}>Monthly Revenue Trend</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontSize: '10px', color: '#6B6560', fontWeight: 700, letterSpacing: '0.05em' }}>TARGET FOR:</span>
                                                    <select 
                                                        value={targetMonthKey}
                                                        onChange={e => {
                                                            const mk = e.target.value;
                                                            setTargetMonthKey(mk);
                                                            const f = (revenue?.monthlyTrend || []).find(x => x.monthKey === mk);
                                                            if(f) setTargetIncome(f.target?.toString() || "");
                                                        }}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', 
                                                            borderRadius: '6px', padding: '4px 8px', color: '#C9A84C', outline: 'none',
                                                            fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700
                                                        }}
                                                    >
                                                        {(revenue?.monthlyTrend || []).map(m => (
                                                            <option key={m.monthKey} value={m.monthKey}>{m.month}</option>
                                                        ))}
                                                    </select>
                                                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px' }}>
                                                        <span style={{ fontSize: '12px', color: '#A09890', marginRight: '4px', fontFamily: "'DM Mono', monospace" }}>Rs</span>
                                                        <input 
                                                            type="number"
                                                            value={targetIncome}
                                                            onChange={e => setTargetIncome(e.target.value)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: '#C9A84C',
                                                                fontFamily: "'DM Mono', monospace",
                                                                fontSize: '13px',
                                                                fontWeight: 700,
                                                                width: '60px',
                                                                outline: 'none'
                                                            }}
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={handleSaveTarget}
                                                        disabled={savingTarget}
                                                        style={{
                                                            padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(201,168,76,0.15)',
                                                            color: '#C9A84C', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                                                        }}
                                                    >
                                                        {savingTarget ? '...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={revenue?.monthlyTrend || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                    <XAxis 
                                                        dataKey="month" 
                                                        tick={{ fill: '#6B6560', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                                                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                        tickLine={false}
                                                    />
                                                    <YAxis 
                                                        tick={{ fill: '#6B6560', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                                                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                        tickLine={false}
                                                        tickFormatter={v => `Rs ${(v / 1000).toFixed(0)}k`}
                                                    />
                                                    <Tooltip 
                                                        contentStyle={{
                                                            background: '#1A1714', border: '1px solid rgba(201,168,76,0.2)',
                                                            borderRadius: '10px', fontFamily: "'DM Sans', sans-serif",
                                                            fontSize: '12px', color: '#F5F0E8', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                                        }}
                                                        labelStyle={{ color: '#C9A84C', fontWeight: 700, marginBottom: '4px' }}
                                                        itemStyle={{ color: '#A09890' }}
                                                        formatter={(value) => [`Rs ${value.toLocaleString()}`, undefined]}
                                                        cursor={{ fill: 'rgba(201,168,76,0.06)' }}
                                                    />
                                                    <Legend 
                                                        wrapperStyle={{ fontSize: '11px', fontFamily: "'DM Sans', sans-serif", color: '#6B6560' }}
                                                    />
                                                    <Bar dataKey="received" name="Received" fill="#C9A84C" radius={[4, 4, 0, 0]} barSize={20} />
                                                    <Bar dataKey="target" name="Target" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} barSize={20} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Per-Case Fee Table */}
                                        {revenue?.perCase && revenue.perCase.length > 0 && (
                                            <div className="chart-section" style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', overflow: 'hidden'
                                            }}>
                                                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '14px', fontWeight: 700, color: '#A09890' }}>Fee Collection by Case</div>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                                            {['Case Title', 'Code', 'Total Fee', 'Collected', 'Pending', 'Progress'].map((h, i) => (
                                                                <th key={i} style={{
                                                                    padding: '10px 16px', textAlign: 'left', fontSize: '10px',
                                                                    fontWeight: 700, color: '#6B6560', textTransform: 'uppercase',
                                                                    letterSpacing: '0.06em'
                                                                }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {revenue.perCase.map((pc, i) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F5F0E8', fontWeight: 600 }}>{pc.caseTitle}</td>
                                                                <td style={{ padding: '12px 16px', fontSize: '12px', color: '#C9A84C', fontFamily: "'DM Mono', monospace" }}>{pc.caseCode}</td>
                                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#A09890' }}>Rs {pc.totalFee?.toLocaleString()}</td>
                                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4CAF7A', fontWeight: 600 }}>Rs {pc.received?.toLocaleString()}</td>
                                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#E07060' }}>Rs {pc.pending?.toLocaleString()}</td>
                                                                <td style={{ padding: '12px 16px', minWidth: '120px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                                            <div style={{
                                                                                width: `${pc.percentCollected || 0}%`, height: '100%',
                                                                                borderRadius: '3px',
                                                                                background: 'linear-gradient(90deg, #C9A84C, #E0C060)',
                                                                                transition: 'width 0.6s ease'
                                                                            }} />
                                                                        </div>
                                                                        <span style={{ fontSize: '11px', color: '#C9A84C', fontFamily: "'DM Mono', monospace", minWidth: '30px' }}>{pc.percentCollected || 0}%</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div>
                                <div className="section-header">Case Analytics</div>
                                {cases?.error ? <ErrorBlock title="Cases Report" error={cases.error} /> : (
                                    <>
                                        {/* Row: Pie + Court Bar */}
                                        <div className="chart-section" style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>

                                            {/* Case Type Pie */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', padding: '24px', flex: '1 1 340px'
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#A09890', marginBottom: '16px' }}>Cases by Type</div>
                                                {(() => {
                                                    const TYPE_COLORS = ['#C9A84C', '#4CAF7A', '#7B9FD4', '#E07060', '#9B59B6', '#E0B050', '#1ABC9C', '#E67E22', '#BDC3C7', '#2ECC71'];
                                                    const typeData = (cases?.byType || []).map(t => ({ ...t, _id: t._id || 'unknown' }));
                                                    return (
                                                        <>
                                                            <ResponsiveContainer width="100%" height={220}>
                                                                <PieChart>
                                                                    <Pie
                                                                        data={typeData}
                                                                        dataKey="count"
                                                                        nameKey="_id"
                                                                        cx="50%" cy="50%"
                                                                        outerRadius={85}
                                                                        paddingAngle={2}
                                                                        stroke="none"
                                                                    >
                                                                        {typeData.map((_, idx) => (
                                                                            <Cell key={idx} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            background: '#1A1714', border: '1px solid rgba(201,168,76,0.2)',
                                                                            borderRadius: '10px', fontFamily: "'DM Sans', sans-serif",
                                                                            fontSize: '12px', color: '#F5F0E8', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                                                        }}
                                                                    />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                            {/* Legend */}
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '12px' }}>
                                                                {typeData.map((t, i) => (
                                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[i % TYPE_COLORS.length], flexShrink: 0 }} />
                                                                        <span style={{ fontSize: '12px', color: '#A09890' }}>{t._id || 'Other'}</span>
                                                                        <span style={{ fontSize: '12px', color: '#F5F0E8', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{t.count}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            {/* Court Distribution — Horizontal Bar */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', padding: '24px', flex: '1 1 400px'
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#A09890', marginBottom: '16px' }}>Court Distribution</div>
                                                <ResponsiveContainer width="100%" height={Math.max(200, (cases?.byCourt?.length || 1) * 40)}>
                                                    <BarChart
                                                        data={(cases?.byCourt || []).map(c => ({ ...c, _id: c._id && c._id.length > 20 ? c._id.slice(0, 20) + '…' : c._id || 'Unknown' }))}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                        <XAxis
                                                            type="number"
                                                            tick={{ fill: '#6B6560', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                                                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                            tickLine={false}
                                                        />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="_id"
                                                            width={150}
                                                            tick={{ fill: '#A09890', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                                                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                            tickLine={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                background: '#1A1714', border: '1px solid rgba(201,168,76,0.2)',
                                                                borderRadius: '10px', fontFamily: "'DM Sans', sans-serif",
                                                                fontSize: '12px', color: '#F5F0E8', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                                            }}
                                                            cursor={{ fill: 'rgba(201,168,76,0.06)' }}
                                                        />
                                                        <Bar dataKey="count" name="Cases" fill="#C9A84C" radius={[0, 4, 4, 0]} barSize={16} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Cases Over Time — Area Chart */}
                                        <div className="chart-section" style={{
                                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                            borderRadius: '12px', padding: '24px'
                                        }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#A09890', marginBottom: '16px' }}>Cases Over Time (Last 12 Months)</div>
                                            <ResponsiveContainer width="100%" height={260}>
                                                <AreaChart data={cases?.byMonth || []} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                                                    <defs>
                                                        <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.15} />
                                                            <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.02} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                    <XAxis
                                                        dataKey="month"
                                                        tick={{ fill: '#6B6560', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                                                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                        tickLine={false}
                                                    />
                                                    <YAxis
                                                        tick={{ fill: '#6B6560', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                                                        axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                        tickLine={false}
                                                        allowDecimals={false}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: '#1A1714', border: '1px solid rgba(201,168,76,0.2)',
                                                            borderRadius: '10px', fontFamily: "'DM Sans', sans-serif",
                                                            fontSize: '12px', color: '#F5F0E8', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                                        }}
                                                        labelStyle={{ color: '#C9A84C', fontWeight: 700 }}
                                                        cursor={{ stroke: 'rgba(201,168,76,0.3)' }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="count"
                                                        name="New Cases"
                                                        stroke="#C9A84C"
                                                        strokeWidth={2.5}
                                                        fill="url(#goldAreaGrad)"
                                                        dot={{ r: 4, fill: '#C9A84C', stroke: '#0A0908', strokeWidth: 2 }}
                                                        activeDot={{ r: 6, fill: '#C9A84C', stroke: '#F5F0E8', strokeWidth: 2 }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <div className="section-header">Win/Loss Statistics</div>
                                {winloss?.error ? <ErrorBlock title="Win/Loss Report" error={winloss.error} /> : (
                                    <>
                                        {/* Stats Summary Row */}
                                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                            {[
                                                { label: 'Total Decided', value: winloss?.totalDecided || 0, color: '#F5F0E8' },
                                                { label: 'Win Rate', value: `${winloss?.winRate || 0}%`, color: (winloss?.winRate || 0) > 60 ? '#4CAF7A' : (winloss?.winRate || 0) >= 40 ? '#E0B050' : '#E07060' },
                                                { label: 'Settle Rate', value: `${winloss?.settleRate || 0}%`, color: '#7B9FD4' },
                                            ].map((item, i) => (
                                                <div key={i} style={{
                                                    flex: 1, minWidth: '140px', padding: '16px 20px',
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                    borderRadius: '10px'
                                                }}>
                                                    <div style={{ fontSize: '11px', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 700 }}>{item.label}</div>
                                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: item.color }}>{item.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Donut Chart + Legend Row */}
                                        <div className="chart-section" style={{
                                            display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap'
                                        }}>
                                            {/* Donut */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', padding: '24px', flex: '1 1 320px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                                            }}>
                                                <ResponsiveContainer width={220} height={220}>
                                                    <PieChart>
                                                        <Pie
                                                            data={(winloss?.byOutcome || []).filter(o => o._id !== 'ongoing').map(o => ({ ...o, _id: o._id || 'unknown' }))}
                                                            dataKey="count"
                                                            nameKey="_id"
                                                            cx="50%" cy="50%"
                                                            innerRadius={60} outerRadius={90}
                                                            paddingAngle={3}
                                                            stroke="none"
                                                        >
                                                            {(winloss?.byOutcome || []).filter(o => o._id !== 'ongoing').map(o => ({ ...o, _id: o._id || 'unknown' })).map((entry, idx) => {
                                                                const OUTCOME_COLORS = { won: '#4CAF7A', lost: '#E07060', settled: '#7B9FD4', dismissed: '#6B6560', ongoing: '#C9A84C', unknown: '#555555' };
                                                                return <Cell key={idx} fill={OUTCOME_COLORS[entry._id] || '#555'} />;
                                                            })}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{
                                                                background: '#1A1714', border: '1px solid rgba(201,168,76,0.2)',
                                                                borderRadius: '10px', fontFamily: "'DM Sans', sans-serif",
                                                                fontSize: '12px', color: '#F5F0E8', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                                            }}
                                                            formatter={(value, name) => [value, name ? String(name).charAt(0).toUpperCase() + String(name).slice(1) : 'Unknown']}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                {/* Center Label */}
                                                <div style={{
                                                    position: 'absolute', top: '50%', left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    textAlign: 'center', pointerEvents: 'none'
                                                }}>
                                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#4CAF7A' }}>
                                                        {winloss?.winRate || 0}%
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Win Rate</div>
                                                </div>
                                            </div>

                                            {/* Legend */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', padding: '24px', flex: '1 1 200px',
                                                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px'
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#A09890', marginBottom: '4px' }}>Outcomes</div>
                                                {(winloss?.byOutcome || []).map(o => ({...o, _id: o._id || 'unknown'})).map((o, i) => {
                                                    const OUTCOME_COLORS = { won: '#4CAF7A', lost: '#E07060', settled: '#7B9FD4', dismissed: '#6B6560', ongoing: '#C9A84C', unknown: '#555555' };
                                                    return (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: OUTCOME_COLORS[o._id] || '#555', flexShrink: 0 }} />
                                                            <div style={{ flex: 1, fontSize: '13px', color: '#A09890', textTransform: 'capitalize' }}>{o._id}</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F5F0E8', fontFamily: "'DM Mono', monospace" }}>{o.count}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* By Case Type Table */}
                                        {winloss?.byTypeAndOutcome && winloss.byTypeAndOutcome.length > 0 && (
                                            <div className="chart-section" style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', overflow: 'hidden'
                                            }}>
                                                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '14px', fontWeight: 700, color: '#A09890' }}>Win Rate by Case Type</div>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                                            {['Case Type', 'Won', 'Lost', 'Settled', 'Dismissed', 'Total Decided', 'Win Rate'].map((h, i) => (
                                                                <th key={i} style={{
                                                                    padding: '10px 16px', textAlign: 'left', fontSize: '10px',
                                                                    fontWeight: 700, color: '#6B6560', textTransform: 'uppercase',
                                                                    letterSpacing: '0.06em'
                                                                }}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {winloss.byTypeAndOutcome.map((row, i) => {
                                                            const wrColor = row.winRate > 60 ? '#4CAF7A' : row.winRate >= 40 ? '#E0B050' : '#E07060';
                                                            return (
                                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#F5F0E8', fontWeight: 600 }}>{row.caseType}</td>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4CAF7A', fontWeight: 600 }}>{row.won}</td>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#E07060', fontWeight: 600 }}>{row.lost}</td>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#7B9FD4' }}>{row.settled}</td>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6B6560' }}>{row.dismissed}</td>
                                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#A09890', fontFamily: "'DM Mono', monospace" }}>{row.totalDecided}</td>
                                                                    <td style={{ padding: '12px 16px' }}>
                                                                        <span style={{
                                                                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                                            padding: '3px 10px', borderRadius: '6px',
                                                                            background: `${wrColor}15`, border: `1px solid ${wrColor}40`,
                                                                            color: wrColor, fontSize: '12px', fontWeight: 700,
                                                                            fontFamily: "'DM Mono', monospace"
                                                                        }}>
                                                                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: wrColor }} />
                                                                            {row.winRate}%
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div>
                                <div className="section-header">AI Research Activity</div>
                                {research?.error ? <ErrorBlock title="Research Report" error={research.error} /> : (
                                    <>
                                        {/* 2x2 Mini Stat Cards */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                            {[
                                                { label: 'Research Docs', value: research?.totalResearchGenerated || 0, icon: '📄', color: '#9B59B6', borderColor: '#9B59B6' },
                                                { label: 'AI Messages', value: research?.totalChatMessages || 0, icon: '💬', color: '#7B9FD4', borderColor: '#7B9FD4' },
                                                { label: 'Avg Research Depth', value: `${research?.averageResearchDepth || 0}/6`, icon: '📊', color: '#C9A84C', borderColor: '#C9A84C' },
                                                { label: 'Depth Coverage', value: `${research?.totalResearchGenerated ? Math.round((research.averageResearchDepth / 6) * 100) : 0}%`, icon: '🎯', color: '#1ABC9C', borderColor: '#1ABC9C' },
                                            ].map((s, i) => (
                                                <div key={i} style={{
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                    borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden'
                                                }}>
                                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: s.borderColor }} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B6560', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                                        <div style={{ fontSize: '16px' }}>{s.icon}</div>
                                                    </div>
                                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: s.color }}>{s.value}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Row: Most Active Cases + Monthly Chart */}
                                        <div className="chart-section" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                                            {/* Most Active Cases List */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', padding: '24px', flex: '1 1 340px'
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#A09890', marginBottom: '16px' }}>Most Active Cases (by Messages)</div>
                                                {(research?.mostResearchedCases || []).length === 0 ? (
                                                    <div style={{ color: '#3A3530', fontSize: '13px', fontStyle: 'italic' }}>No chat activity yet.</div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {(() => {
                                                            const maxCount = Math.max(...(research.mostResearchedCases || []).map(c => c.count), 1);
                                                            return (research.mostResearchedCases || []).map((c, i) => (
                                                                <div key={i} style={{
                                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                                    padding: '10px 14px',
                                                                    background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                                                                    border: '1px solid rgba(255,255,255,0.04)'
                                                                }}>
                                                                    {/* Rank Badge */}
                                                                    <div style={{
                                                                        width: 26, height: 26, borderRadius: '7px', flexShrink: 0,
                                                                        background: i === 0 ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.04)',
                                                                        border: i === 0 ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        fontSize: '12px', fontWeight: 700, color: i === 0 ? '#C9A84C' : '#6B6560',
                                                                        fontFamily: "'DM Mono', monospace"
                                                                    }}>{i + 1}</div>

                                                                    {/* Info */}
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F5F0E8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.caseTitle}</div>
                                                                        <div style={{ fontSize: '11px', color: '#C9A84C', fontFamily: "'DM Mono', monospace" }}>{c.caseCode}</div>
                                                                    </div>

                                                                    {/* Activity Bar + Count */}
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                                                                        <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                                            <div style={{
                                                                                width: `${(c.count / maxCount) * 100}%`, height: '100%',
                                                                                borderRadius: '3px',
                                                                                background: 'linear-gradient(90deg, #7B9FD4, #9B59B6)',
                                                                                transition: 'width 0.5s ease'
                                                                            }} />
                                                                        </div>
                                                                        <span style={{ fontSize: '12px', color: '#7B9FD4', fontWeight: 700, fontFamily: "'DM Mono', monospace", minWidth: '28px', textAlign: 'right' }}>
                                                                            💬 {c.count}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Research By Month Bar Chart */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', padding: '24px', flex: '1 1 400px'
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#A09890', marginBottom: '16px' }}>Research Docs Generated (Monthly)</div>
                                                <ResponsiveContainer width="100%" height={280}>
                                                    <BarChart data={research?.researchByMonth || []} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                        <XAxis
                                                            dataKey="month"
                                                            tick={{ fill: '#6B6560', fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}
                                                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                            tickLine={false}
                                                        />
                                                        <YAxis
                                                            tick={{ fill: '#6B6560', fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                                                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                                            tickLine={false}
                                                            allowDecimals={false}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                background: '#1A1714', border: '1px solid rgba(201,168,76,0.2)',
                                                                borderRadius: '10px', fontFamily: "'DM Sans', sans-serif",
                                                                fontSize: '12px', color: '#F5F0E8', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                                                            }}
                                                            labelStyle={{ color: '#C9A84C', fontWeight: 700 }}
                                                            cursor={{ fill: 'rgba(201,168,76,0.06)' }}
                                                        />
                                                        <Bar dataKey="count" name="Research Docs" fill="#C9A84C" radius={[4, 4, 0, 0]} barSize={22} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
