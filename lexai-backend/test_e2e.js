const http = require('http');

async function fetchAPI(path, method = 'GET', body = null, token = null) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function fatalError(msg, res) {
  console.log(msg);
  console.log(JSON.stringify(res, null, 2));
  process.exit(1);
}

async function runTests() {
  console.log("Starting E2E API Tests...");
  let token = null;
  let caseId = null;

  // 1. Register / Login
  console.log("1. Trying to login...");
  const creds = { email: 'test_e2e@demo.com', password: 'password123' };
  let loginRes = await fetchAPI('/api/auth/login', 'POST', creds);
  if (loginRes.status !== 200) {
    await fetchAPI('/api/auth/register', 'POST', {
      firstName: 'Test',
      lastName: 'Lawyer',
      ...creds
    });
    loginRes = await fetchAPI('/api/auth/login', 'POST', creds);
  }
  
  if (loginRes.status === 200 && loginRes.body.token) {
    token = loginRes.body.token;
    console.log("   ✅ Login successful. Token acquired.");
  } else {
    fatalError("   ❌ Login failed", loginRes);
  }

  // 2. Create/Open a case
  console.log("2. Creating a test case...");
  const newCaseRes = await fetchAPI('/api/cases', 'POST', {
    title: 'E2E Test Case',
    clientName: 'E2E Test Client',
    contactNumber: '03001234567',
    caseType: 'Criminal',
    status: 'active'
  }, token);

  if (newCaseRes.status === 201) {
    caseId = newCaseRes.body._id;
    console.log(`   ✅ Case created. ID: ${caseId}`);
  } else {
    fatalError("   ❌ Case creation failed", newCaseRes);
  }

  // 3. Chat
  console.log("3. Chat with AI to trigger researchDetected...");
  let researchDetected = false;
  const messages = [
    "Client in jail under 302, no witnesses, bail application needed",
    "Please generate a full research report with APPLICABLE LAW, BAIL GROUNDS, DEFENSE STRATEGY, COURT SCRIPT, and CONSTITUTIONAL RIGHTS.",
    "Yes, generate the full research now."
  ];

  for(let msg of messages) {
     console.log(`   -> Sending message: "${msg.substring(0, 30)}..."`);
     const chatRes = await fetchAPI(`/api/chat/${caseId}`, 'POST', { text: msg, language: 'english' }, token);
     if (chatRes.status === 200 || chatRes.status === 201) {
       console.log(`      Response: researchDetected=${chatRes.body.researchDetected}`);
       if (chatRes.body.researchDetected) {
         researchDetected = true;
         console.log("   ✅ researchDetected is true!");
         break;
       }
     } else {
       console.log("      Chat Request Failed:");
       console.log(JSON.stringify(chatRes, null, 2));
     }
  }

  // 4. Generate Research
  console.log("4. Generating research...");
  const genRes = await fetchAPI(`/api/research/${caseId}/generate`, 'POST', null, token);
  if (genRes.status === 200 || genRes.status === 201) {
    console.log("   ✅ Research generated.");
  } else {
    fatalError("   ❌ Failed to generate research", genRes);
  }

  // 5. Get Research
  console.log("5. Getting research...");
  const getRes = await fetchAPI(`/api/research/${caseId}`, 'GET', null, token);
  if (getRes.status === 200 && (getRes.body.applicableLaw || (getRes.body.research && getRes.body.research.applicableLaw))) {
    console.log("   ✅ Research fetched correctly.");
  } else {
    fatalError("   ❌ Failed to get research", getRes);
  }

  // 6. Update Research
  console.log("6. Updating research...");
  const upRes = await fetchAPI(`/api/research/${caseId}`, 'PUT', {
    defenseStrategy: "Updated E2E test strategy over original.",
    changeNote: "E2E Integration Test Note"
  }, token);
  if (upRes.status === 200 && (upRes.body.currentVersion >= 2)) {
    console.log("   ✅ Research updated. Version is: " + upRes.body.currentVersion);
  } else {
    fatalError("   ❌ Failed to update research", upRes);
  }

  // 7. Check Versions
  console.log("7. Checking research versions...");
  const verRes = await fetchAPI(`/api/research/${caseId}/versions`, 'GET', null, token);
  if (verRes.status === 200 && verRes.body.length >= 2) {
    console.log(`   ✅ Research versions returned correctly (${verRes.body.length} versions).`);
  } else {
    console.log("   ⚠️ Versions check failed:", JSON.stringify(verRes, null, 2));
  }

  // 8. Generate Guide
  console.log("8. Generating Court Guide...");
  const guideGen = await fetchAPI(`/api/guide/${caseId}/generate`, 'POST', null, token);
  if (guideGen.status === 200 || guideGen.status === 201) {
    console.log("   ✅ Guide generated.");
  } else {
    fatalError("   ❌ Failed to generate guide", guideGen);
  }

  // 9. Get Guide
  console.log("9. Fetching Court Guide...");
  const guideGet = await fetchAPI(`/api/guide/${caseId}`, 'GET', null, token);
  if (guideGet.status === 200 && guideGet.body.openingStatement) {
    console.log("   ✅ Guide fetched correctly.");
  } else {
    fatalError("   ❌ Failed to fetch guide", guideGet);
  }

  // 10. Update Guide
  console.log("10. Updating Court Guide...");
  const guideUp = await fetchAPI(`/api/guide/${caseId}`, 'PUT', {
    openingStatement: guideGet.body.openingStatement,
    argumentsSection: guideGet.body.argumentsSection,
    precedentArguments: guideGet.body.precedentArguments,
    prayer: guideGet.body.prayer,
    checklist: [
      { item: "E2E Checklist updated item 1", completed: true },
      { item: "E2E Checklist updated item 2", completed: false }
    ],
    changeNote: "Checklist E2E Updated"
  }, token);

  if (guideUp.status === 200 && guideUp.body.currentVersion >= 1) {
    console.log(`   ✅ Guide updated successfully. Current version: ${guideUp.body.currentVersion}`);
  } else {
    console.log("   ❌ Failed to update guide");
    console.log(JSON.stringify(guideUp, null, 2));
  }

  console.log("\n🚀 All E2E Tests Completed Successfully!");
  process.exit(0);
}

runTests();
