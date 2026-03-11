const crypto = require('crypto');

async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('--- Starting API Tests ---\n');

  // 1. Create unique user to ensure login
  const testEmail = `testuser_${crypto.randomBytes(4).toString('hex')}@example.com`;
  
  console.log('1. Registering test user...');
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'password123',
      lawFirm: 'Test Firm',
      barEnrollmentNumber: '12345'
    })
  });
  
  const regData = await regRes.json();
  if (!regData.success && !regData.token) {
      console.error('Registration failed:', regData);
      return;
  }
  
  let token = regData.token;
  if (!token) {
    // try login if reg was existing (should not be)
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123' })
    });
    const loginData = await loginRes.json();
    token = loginData.token;
  }
  
  console.log(`✅ Login -> Got JWT Token: ${token.substring(0, 15)}...`);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. POST /api/cases with ALL 15 fields
  console.log('\n2. POST /api/cases with ALL 15 fields');
  const casePayload = {
    title: "Test Full Case - API",
    court: "Supreme Court",
    caseType: "Constitutional",
    caseNumber: "999",
    caseYear: "2025",
    onBehalfOf: "Petitioner",
    status: "urgent",
    partyName: "Sohaib Ramzan",
    contactNo: "0300-1234567",
    clientName: "Sohaib Ramzan",
    respondentName: "Federation of Pakistan",
    section: "Article 199",
    firNumber: "123-B",
    policeStation: "Civil Lines",
    adverseAdvocateName: "Ali Raza",
    adverseAdvocateContact: "0300-9876543",
    language: "english"
  };

  const createRes = await fetch(`${baseUrl}/cases`, {
    method: 'POST',
    headers,
    body: JSON.stringify(casePayload)
  });
  const createData = await createRes.json();
  if (!createRes.ok) {
      console.error('Failed to create case:', createData);
      return;
  }
  const c = createData.case || createData;
  const caseId = c._id;
  console.log(`✅ Created Case ID: ${caseId}`);
  // Verify fields
  const verifiedFields = ['title', 'court', 'caseType', 'caseNumber', 'caseYear', 'onBehalfOf', 'status', 'clientName', 'respondentName', 'section', 'firNumber', 'policeStation', 'adverseAdvocateName', 'adverseAdvocateContact', 'language'];
  let allFieldsSaved = verifiedFields.every(f => c[f] === casePayload[f]);
  console.log(allFieldsSaved ? '✅ All 15 fields verified saved.' : '❌ Some fields missing or mismatched!', verifiedFields.map(f => `${f}: ${c[f]}`));


  // 3. GET /api/cases/:id 
  console.log(`\n3. GET /api/cases/${caseId}`);
  const getRes = await fetch(`${baseUrl}/cases/${caseId}`, { headers });
  const getData = await getRes.json();
  if (!getRes.ok) {
      console.error('Failed to GET case:', getData);
      return;
  }
  console.log(`✅ GET Returns Case: ${getData.title}`);
  if (Array.isArray(getData.hearings) && getData.hearings.length === 0) {
      console.log('✅ hearings[] is empty array');
  } else {
      console.log('❌ hearings[] is not empty array', getData.hearings);
  }

  // 4. POST /api/cases/:id/hearings
  console.log('\n4. POST /api/cases/:id/hearings (First Hearing)');
  const addHearingRes1 = await fetch(`${baseUrl}/cases/${caseId}/hearings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ adjournDate: "2026-04-15", step: "Summon", notes: "First hearing" })
  });
  const addHearingData1 = await addHearingRes1.json();
  if (!addHearingRes1.ok) {
      console.error('Failed to add hearing 1:', addHearingData1);
      return;
  }
  const caseAfterH1 = addHearingData1.case || addHearingData1;
  console.log(`✅ Added first hearing. Total hearings: ${caseAfterH1.hearings.length}`);

  // 5. POST /api/cases/:id/hearings again
  console.log('\n5. POST /api/cases/:id/hearings (Second Hearing)');
  const addHearingRes2 = await fetch(`${baseUrl}/cases/${caseId}/hearings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ previousDate: "2026-04-15", adjournDate: "2026-05-20", step: "Notice", notes: "Second hearing" })
  });
  const addHearingData2 = await addHearingRes2.json();
  if (!addHearingRes2.ok) {
      console.error('Failed to add hearing 2:', addHearingData2);
      return;
  }
  const caseAfterH2 = addHearingData2.case || addHearingData2;
  const hearings = caseAfterH2.hearings;
  console.log(hearings.length === 2 ? '✅ Verified two hearings in array' : '❌ Wrong number of hearings', hearings.length);
  
  const targetHearingId = hearings[1]._id; // get second hearing to delete

  // 6. DELETE /api/cases/:id/hearings/:hearingId
  console.log(`\n6. DELETE /api/cases/${caseId}/hearings/${targetHearingId}`);
  const delHearingRes = await fetch(`${baseUrl}/cases/${caseId}/hearings/${targetHearingId}`, {
      method: 'DELETE',
      headers
  });
  const delHearingData = await delHearingRes.json();
  if (!delHearingRes.ok) {
      console.error('Failed to delete hearing:', delHearingData);
      return;
  }
  const caseAfterDel = delHearingData.case || delHearingData;
  console.log(caseAfterDel.hearings.length === 1 ? '✅ Hearing removed. Remaining: 1' : '❌ Hearing not removed properly', caseAfterDel.hearings.length);

  // 7. PUT /api/cases/:id
  console.log('\n7. PUT /api/cases/:id with changed fields');
  const prevDate = new Date(caseAfterDel.updatedAt).getTime();
  const updatePayload = {
      ...casePayload,
      title: "Updated Case Title",
      status: "done"
  };
  
  // adding a delay to ensure updatedAt gets a different MS value
  await new Promise(r => setTimeout(r, 100));

  const updateRes = await fetch(`${baseUrl}/cases/${caseId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatePayload)
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok) {
      console.error('Failed to update case:', updateData);
      return;
  }
  const cUpd = updateData.case || updateData;
  console.log(cUpd.title === "Updated Case Title" && cUpd.status === "done" ? '✅ Fields updated successfully' : '❌ Fields not updated');
  
  const newDate = new Date(cUpd.updatedAt).getTime();
  if (newDate > prevDate) {
      console.log('✅ updatedAt changed successfully:', cUpd.updatedAt);
  } else {
      console.log('❌ updatedAt did not change! Old:', new Date(prevDate), 'New:', cUpd.updatedAt);
  }

  console.log('\n--- API Tests Complete ---');
}

runTests().catch(console.error);
