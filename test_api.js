async function test() {
    let res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify({firstName: "Test", lastName: "X", email: "test" + Math.random() + "@x.com", password: "password123", lawFirm: "xyz"})
    });
    let data = await res.json();
    console.log("Register data:", data);
    let token = data.token;
    
    let caseRes = await fetch("http://localhost:5000/api/cases", {
        method: "POST", headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        body: JSON.stringify({clientName: "Test", section: "123", caseType: "Criminal", court: "SC", title: "Test Case"})
    });
    console.log("Case res status:", caseRes.status);
    let caseText = await caseRes.text();
    console.log("Case data:", caseText);
    data = JSON.parse(caseText);
    let caseId = data._id;
    console.log("Case ID:", caseId);

    // Call research generate
    res = await fetch(`http://localhost:5000/api/research/${caseId}`, {
        method: "POST", headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
    });
    console.log("Research generate status:", res.status);
    console.log(await res.text());
}
test();
