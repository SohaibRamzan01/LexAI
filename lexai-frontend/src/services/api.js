const BASE_URL = "http://localhost:5000/api";

const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("lexai_token")}`
});

// AUTHENTICATION

export const registerUser = async (data) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const loginUser = async (data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.json();
};

// CASES

export const getCases = async () => {
    const res = await fetch(`${BASE_URL}/cases`, {
        method: "GET",
        headers: getHeaders()
    });
    return res.json();
};

export const getCase = async (id) => {
    const res = await fetch(`${BASE_URL}/cases/${id}`, {
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const createCase = async (data) => {
    const payload = {
        title: data.title,
        clientName: data.clientName,
        section: data.section,
        caseType: data.caseType,
        court: data.court,
        status: data.status,
        language: data.language,
        caseNumber: data.caseNumber,
        caseYear: data.caseYear,
        onBehalfOf: data.onBehalfOf,
        partyName: data.partyName,
        contactNo: data.contactNo,
        respondentName: data.respondentName,
        firNumber: data.firNumber,
        policeStation: data.policeStation,
        adverseAdvocateName: data.adverseAdvocateName,
        adverseAdvocateContact: data.adverseAdvocateContact,
        outcome: data.outcome
    };
    const res = await fetch(`${BASE_URL}/cases`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
    return res.json();
};

export const updateCase = async (id, data) => {
    const payload = {
        title: data.title,
        clientName: data.clientName,
        section: data.section,
        caseType: data.caseType,
        court: data.court,
        status: data.status,
        language: data.language,
        caseNumber: data.caseNumber,
        caseYear: data.caseYear,
        onBehalfOf: data.onBehalfOf,
        partyName: data.partyName,
        contactNo: data.contactNo,
        respondentName: data.respondentName,
        firNumber: data.firNumber,
        policeStation: data.policeStation,
        adverseAdvocateName: data.adverseAdvocateName,
        adverseAdvocateContact: data.adverseAdvocateContact,
        outcome: data.outcome
    };
    const res = await fetch(`${BASE_URL}/cases/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
    return res.json();
};

export const deleteCase = async (id) => {
    const res = await fetch(`${BASE_URL}/cases/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });
    return res.json();
};

export const addHearing = async (caseId, data) => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/hearings`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
            previousDate: data.previousDate,
            adjournDate: data.adjournDate,
            step: data.step,
            notes: data.notes
        }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const deleteHearing = async (caseId, hearingId) => {
    const res = await fetch(`${BASE_URL}/cases/${caseId}/hearings/${hearingId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// CHAT (GEMINI AI)

export const sendMessage = async (caseId, message, language) => {
    const res = await fetch(`${BASE_URL}/chat/${caseId}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text: message, language })
    });
    return res.json();
};

export const getChatHistory = async (caseId) => {
    const res = await fetch(`${BASE_URL}/chat/${caseId}`, {
        method: "GET",
        headers: getHeaders()
    });
    return res.json();
};

// RESEARCH

export const getResearch = async (caseId) => {
    const res = await fetch(`${BASE_URL}/research/${caseId}`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const generateResearch = async (caseId) => {
    const res = await fetch(`${BASE_URL}/research/${caseId}/generate`, {
        method: "POST",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const updateResearch = async (caseId, data) => {
    const res = await fetch(`${BASE_URL}/research/${caseId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getResearchVersions = async (caseId) => {
    const res = await fetch(`${BASE_URL}/research/${caseId}/versions`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getResearchVersion = async (caseId, versionNum) => {
    const res = await fetch(`${BASE_URL}/research/${caseId}/versions/${versionNum}`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// COURT GUIDE
export const getGuide = async (caseId) => {
    const res = await fetch(`${BASE_URL}/guide/${caseId}`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const generateGuide = async (caseId) => {
    const res = await fetch(`${BASE_URL}/guide/${caseId}/generate`, {
        method: "POST",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const updateGuide = async (caseId, payload) => {
    const res = await fetch(`${BASE_URL}/guide/${caseId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getGuideVersions = async (caseId) => {
    const res = await fetch(`${BASE_URL}/guide/${caseId}/versions`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getGuideVersion = async (caseId, versionNum) => {
    const res = await fetch(`${BASE_URL}/guide/${caseId}/versions/${versionNum}`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

// FEES

export const getFees = async (caseId) => {
    const res = await fetch(`${BASE_URL}/fees/${caseId}`, {
        method: "GET",
        headers: getHeaders()
    });
    return res.json();
};

export const updateFees = async (caseId, data) => {
    const res = await fetch(`${BASE_URL}/fees/${caseId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
};

// REPORTS

export const getSummaryReport = async () => {
    const res = await fetch(`${BASE_URL}/reports/summary`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getRevenueReport = async () => {
    const res = await fetch(`${BASE_URL}/reports/revenue`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const updateTargetIncome = async (monthKey, amount) => {
    const res = await fetch(`${BASE_URL}/reports/target`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ monthKey, amount })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getCasesReport = async () => {
    const res = await fetch(`${BASE_URL}/reports/cases`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getWinLossReport = async () => {
    const res = await fetch(`${BASE_URL}/reports/winloss`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const getResearchReport = async () => {
    const res = await fetch(`${BASE_URL}/reports/research`, {
        method: "GET",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};
