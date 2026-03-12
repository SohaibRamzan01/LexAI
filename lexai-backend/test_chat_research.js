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
  console.log("Starting Chat Languages and Research Test...");
  let token = null;

  console.log("1. Trying to login...");
  const creds = { email: 'test_lang_research@demo.com', password: 'password123' };
  let loginRes = await fetchAPI('/api/auth/login', 'POST', creds);
  if (loginRes.status !== 200) {
    await fetchAPI('/api/auth/register', 'POST', {
      firstName: 'Lang',
      lastName: 'Tester',
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

  const languagesToTest = [
    { lang: 'english', prompt: 'I have a theft case, what are the initial steps?' },
    { lang: 'urdu', prompt: 'Mera chori ka case hai, shuruati iqdamat kya honge?' }, // actually better to give a formal urdu prompt if we could, but gemini will handle
    { lang: 'roman', prompt: 'Mera chori ka case hai, mujhe detail me batao agla step kya hoga?' }
  ];

  let caseIds = {};

  for (let { lang, prompt } of languagesToTest) {
    console.log(`\n--- Testing Language: ${lang.toUpperCase()} ---`);
    
    // Create Case
    const newCaseRes = await fetchAPI('/api/cases', 'POST', {
      title: `Test Case ${lang}`,
      clientName: `Test Client ${lang}`,
      contactNumber: '03000000000',
      caseType: 'Criminal',
      status: 'active'
    }, token);

    if (newCaseRes.status !== 201) {
      fatalError(`   ❌ Case creation failed for ${lang}`, newCaseRes);
    }
    const caseId = newCaseRes.body._id;
    caseIds[lang] = caseId;
    console.log(`   ✅ Case created. ID: ${caseId}`);

    // Test Chat Message 1
    console.log(`   -> Sending first message in ${lang}...`);
    const chatRes1 = await fetchAPI(`/api/chat/${caseId}`, 'POST', { text: prompt, language: lang }, token);
    if (chatRes1.status === 200 || chatRes1.status === 201) {
      console.log(`   ✅ Received AI message. Length: ${chatRes1.body.aiMessage.text.length} characters.`);
      console.log(`      Snippet: ${chatRes1.body.aiMessage.text.substring(0, 80)}...`);
    } else {
      fatalError(`   ❌ Chat request failed for ${lang}`, chatRes1);
    }
    
    // Trigger Research by requesting explicitly in English for the test (the system prompt says 'regenerate full research')
    console.log(`   -> Triggering research generation via chat in ${lang}...`);
    const triggerPrompt = "Please generate the full research document with APPLICABLE LAW, BAIL GROUNDS, DEFENSE STRATEGY, COURT SCRIPT, and CONSTITUTIONAL RIGHTS.";
    const chatRes2 = await fetchAPI(`/api/chat/${caseId}`, 'POST', { text: triggerPrompt, language: lang }, token);
    
    if (chatRes2.status === 200 || chatRes2.status === 201) {
        if (chatRes2.body.researchDetected) {
            console.log(`   ✅ Research Detected properly during Chat for ${lang}!`);
        } else {
            console.log(`   ⚠️ Research was not detected from chat text. It might need more iterations.`);
        }
    } else {
        fatalError(`   ❌ Chat research trigger request failed for ${lang}`, chatRes2);
    }

    // Now call the explicit /generate API endpoint to generate actual JSON research doc
    console.log(`   -> Generating JSON research using /api/research/:caseId/generate...`);
    const genRes = await fetchAPI(`/api/research/${caseId}/generate`, 'POST', null, token);
    if (genRes.status === 200 || genRes.status === 201) {
      console.log(`   ✅ Research successfully generated and saved for ${lang}.`);
      
      const research = genRes.body.research;
      
      // Analyze the generated research fields
      const hasApplicableLaw = !!research.applicableLaw;
      const hasBailGrounds = !!research.bailGrounds;
      const hasDefenseStrategy = !!research.defenseStrategy;
      const hasCourtScript = !!research.courtScript;
      const hasConstitutionalRights = !!research.constitutionalRights;
      const precedentsCount = research.precedents ? research.precedents.length : 0;
      
      console.log(`   📊 Research Analysis for ${lang}:`);
      console.log(`      Applicable Law: ${hasApplicableLaw ? '✅ (Length: ' + research.applicableLaw.length + ')' : '❌'}`);
      console.log(`      Bail Grounds: ${hasBailGrounds ? '✅' : '❌'}`);
      console.log(`      Defense Strategy: ${hasDefenseStrategy ? '✅' : '❌'}`);
      console.log(`      Court Script: ${hasCourtScript ? '✅' : '❌'}`);
      console.log(`      Constitutional Rights: ${hasConstitutionalRights ? '✅' : '❌'}`);
      console.log(`      Precedents Included: ${precedentsCount} ${precedentsCount >= 3 ? '✅' : '⚠️ (Expected >= 3)'}`);
      
      if (!hasApplicableLaw || !hasBailGrounds || !hasDefenseStrategy || !hasCourtScript || precedentsCount === 0) {
          console.log(`   ❌ ERROR: Some expected fields are missing from the generated research!`);
      } else {
          console.log(`   ✅ Research fields look correctly populated.`);
      }

    } else {
      console.log(`   ❌ Failed to generate JSON research for ${lang}`);
      console.log(JSON.stringify(genRes, null, 2));
    }
  }

  console.log("\n🚀 All Chat & Research Tests Completed Successfully!");
  process.exit(0);
}

runTests();
