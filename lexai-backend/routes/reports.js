const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const Research = require("../models/Research");
const { protect } = require("../middleware/authMiddleware");

// All routes here are protected
router.use(protect);

// 1. GET /api/reports/summary — overall stats
router.get("/summary", async (req, res) => {
    try {
        const lawyerId = req.user.id;
        const [totalCases, activeCases, cases] = await Promise.all([
            Case.countDocuments({ lawyer: lawyerId }),
            Case.countDocuments({ lawyer: lawyerId, status: "active" }),
            Case.find({ lawyer: lawyerId }).select("hearings outcome"),
            // Research count can be added later if Research schema has lawyer ref
        ]);
        
        const totalHearings = cases.reduce((acc, c) => acc + (c.hearings?.length || 0), 0);
        const wonCases = cases.filter(c => c.outcome === "won").length;
        const closedCases = cases.filter(c => ["won", "lost", "settled", "dismissed"].includes(c.outcome)).length;
        const winRate = closedCases > 0 ? Math.round((wonCases / closedCases) * 100) : 0;
        
        res.json({ totalCases, activeCases, totalHearings, winRate });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 2. GET /api/reports/revenue — revenue and fee breakdown
router.get("/revenue", async (req, res) => {
    try {
        const lawyerId = req.user.id;
        const Fee = require("../models/Fee");
        
        const fees = await Fee.find({ lawyer: lawyerId }).populate("case", "title caseCode");

        let totalAgreed = 0;
        let totalReceived = 0;
        
        const perCase = [];
        const monthlyDataMap = {};

        // Initialize the last 12 months for the trend
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthName = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
            monthlyDataMap[mKey] = { month: monthName, received: 0, target: 60000, _sortKey: mKey };
        }

        fees.forEach(fee => {
            const caseTotal = fee.totalAgreed || 0;
            totalAgreed += caseTotal;
            let caseReceived = 0;

            if (fee.installments) {
                fee.installments.forEach(inst => {
                    if (inst.status === "paid") {
                        const amt = inst.amount || 0;
                        caseReceived += amt;
                        totalReceived += amt;
                        
                        if (inst.paidDate) {
                            const dateObj = new Date(inst.paidDate);
                            if (!isNaN(dateObj)) {
                                const yyyy = dateObj.getFullYear();
                                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                                const mKey = `${yyyy}-${mm}`;
                                if (monthlyDataMap[mKey]) {
                                    monthlyDataMap[mKey].received += amt;
                                }
                            }
                        }
                    }
                });
            }

            const casePending = Math.max(0, caseTotal - caseReceived);
            const percentCollected = caseTotal > 0 ? Math.round((caseReceived / caseTotal) * 100) : 0;
            
            if (fee.case) {
                perCase.push({
                    caseTitle: fee.case.title,
                    caseCode: fee.case.caseCode,
                    totalFee: caseTotal,
                    received: caseReceived,
                    pending: casePending,
                    percentCollected
                });
            }
        });

        const totalPending = Math.max(0, totalAgreed - totalReceived);
        
        // Sort explicitly by our tracked YYYY-MM key and remove the temporary sort key
        const monthlyTrend = Object.values(monthlyDataMap)
            .sort((a, b) => a._sortKey.localeCompare(b._sortKey))
            .map(({ _sortKey, ...rest }) => rest);

        res.json({
            totalAgreed,
            totalReceived,
            totalPending,
            monthlyTrend,
            perCase
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 3. GET /api/reports/cases — case analytics and breakdown
router.get("/cases", async (req, res) => {
    try {
        const lawyerId = req.user.id;
        const mongoose = require("mongoose");
        const objectId = new mongoose.Types.ObjectId(lawyerId);

        const [byType, byCourt, byStatus, byMonthRaw] = await Promise.all([
            // 1. Group by caseType
            Case.aggregate([
                { $match: { lawyer: objectId } },
                { $group: { _id: "$caseType", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // 2. Group by court
            Case.aggregate([
                { $match: { lawyer: objectId } },
                { $group: { _id: "$court", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // 3. Group by status
            Case.aggregate([
                { $match: { lawyer: objectId } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // 4. Cases added per month — last 12 months
            Case.aggregate([
                { $match: {
                    lawyer: objectId,
                    createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                }},
                { $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }},
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);

        const monthlyDataMap = {};
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthName = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
            monthlyDataMap[mKey] = { month: monthName, count: 0, _sortKey: mKey };
        }

        byMonthRaw.forEach(item => {
            if (item._id && item._id.year && item._id.month) {
                const yyyy = item._id.year;
                const mm = String(item._id.month).padStart(2, '0');
                const mKey = `${yyyy}-${mm}`;
                if (monthlyDataMap[mKey]) {
                    monthlyDataMap[mKey].count += item.count;
                }
            }
        });

        const byMonth = Object.values(monthlyDataMap)
            .sort((a, b) => a._sortKey.localeCompare(b._sortKey))
            .map(({ _sortKey, ...rest }) => rest);

        res.json({ byType, byCourt, byStatus, byMonth });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 4. GET /api/reports/winloss — outcome statistics
router.get("/winloss", async (req, res) => {
    try {
        const lawyerId = req.user.id;
        const mongoose = require("mongoose");
        const objectId = new mongoose.Types.ObjectId(lawyerId);

        const [byOutcome, byTypeAndOutcomeRaw] = await Promise.all([
            Case.aggregate([
                { $match: { lawyer: objectId } },
                { $group: { _id: "$outcome", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Case.aggregate([
                { $match: { lawyer: objectId, outcome: { $ne: "ongoing" } } },
                { $group: {
                    _id: { caseType: "$caseType", outcome: "$outcome" },
                    count: { $sum: 1 }
                }}
            ])
        ]);

        let totalDecided = 0;
        let wonCount = 0;
        let settledCount = 0;

        byOutcome.forEach(item => {
            if (item._id !== "ongoing") {
                totalDecided += item.count;
            }
            if (item._id === "won") wonCount += item.count;
            if (item._id === "settled") settledCount += item.count;
        });

        const winRate = totalDecided > 0 ? Math.round((wonCount / totalDecided) * 100) : 0;
        const settleRate = totalDecided > 0 ? Math.round((settledCount / totalDecided) * 100) : 0;

        const typeMap = {};
        byTypeAndOutcomeRaw.forEach(item => {
            const typeName = item._id.caseType || "Undefined";
            const outcomeStr = item._id.outcome;
            if (!typeMap[typeName]) {
                typeMap[typeName] = {
                    caseType: typeName,
                    totalDecided: 0,
                    won: 0,
                    lost: 0,
                    settled: 0,
                    dismissed: 0
                };
            }
            typeMap[typeName][outcomeStr] = (typeMap[typeName][outcomeStr] || 0) + item.count;
            typeMap[typeName].totalDecided += item.count;
        });

        const byTypeAndOutcome = Object.values(typeMap).map(typeData => ({
            ...typeData,
            winRate: typeData.totalDecided > 0 ? Math.round((typeData.won / typeData.totalDecided) * 100) : 0
        })).sort((a, b) => b.totalDecided - a.totalDecided);

        res.json({
            byOutcome,
            totalDecided,
            winRate,
            settleRate,
            byTypeAndOutcome
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// 5. GET /api/reports/research — research and activity tracking
router.get("/research", async (req, res) => {
    try {
        const lawyerId = req.user.id;
        const Message = require("../models/Message");
        
        // Target specifically the cases owned by the lawyer
        const lawyerCases = await Case.find({ lawyer: lawyerId }).select("_id title caseCode");
        const caseIds = lawyerCases.map(c => c._id);

        const [totalResearchGenerated, totalChatMessages, allResearch, rawMessagesAgg, researchByMonthRaw] = await Promise.all([
            Research.countDocuments({ case: { $in: caseIds } }),
            Message.countDocuments({ case: { $in: caseIds } }),
            Research.find({ case: { $in: caseIds } }),
            Message.aggregate([
                { $match: { case: { $in: caseIds } } },
                { $group: { _id: "$case", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),
            Research.aggregate([
                { $match: { 
                    case: { $in: caseIds },
                    createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                }},
                { $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }},
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);

        let totalDepth = 0;
        allResearch.forEach(r => {
            let depth = 0;
            if (r.applicableLaw && r.applicableLaw.length > 5) depth++;
            if (r.bailGrounds && r.bailGrounds.length > 5) depth++;
            if (r.precedents && r.precedents.length > 0) depth++;
            if (r.defenseStrategy && r.defenseStrategy.length > 5) depth++;
            if (r.courtScript && r.courtScript.length > 5) depth++;
            if (r.constitutionalRights && r.constitutionalRights.length > 5) depth++;
            totalDepth += depth;
        });
        const averageResearchDepth = totalResearchGenerated > 0 
            ? Math.round((totalDepth / totalResearchGenerated) * 10) / 10 
            : 0;

        const mostResearchedCases = rawMessagesAgg.map(m => {
            const thisCase = lawyerCases.find(lc => lc._id.toString() === m._id.toString());
            return {
                caseTitle: thisCase ? thisCase.title : "Unknown Case",
                caseCode: thisCase ? thisCase.caseCode : "",
                count: m.count
            };
        });

        const monthlyDataMap = {};
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthName = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
            monthlyDataMap[mKey] = { month: monthName, count: 0, _sortKey: mKey };
        }

        researchByMonthRaw.forEach(item => {
            if (item._id && item._id.year && item._id.month) {
                const yyyy = item._id.year;
                const mm = String(item._id.month).padStart(2, '0');
                const mKey = `${yyyy}-${mm}`;
                if (monthlyDataMap[mKey]) monthlyDataMap[mKey].count += item.count;
            }
        });

        const researchByMonth = Object.values(monthlyDataMap)
            .sort((a, b) => a._sortKey.localeCompare(b._sortKey))
            .map(({ _sortKey, ...rest }) => rest);

        res.json({
            totalResearchGenerated,
            totalChatMessages,
            averageResearchDepth,
            mostResearchedCases,
            researchByMonth
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
