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

export const createCase = async (data) => {
    const res = await fetch(`${BASE_URL}/cases`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data)
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
    return res.json();
};

export const generateResearch = async (caseId) => {
    const res = await fetch(`${BASE_URL}/research/${caseId}`, {
        method: "POST",
        headers: getHeaders()
    });
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
