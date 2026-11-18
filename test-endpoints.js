const fs = require('fs');

async function runTest() {
  console.log("Starting end-to-end API integration test on localhost:3000...");
  
  // 1. Read the test resume file
  if (!fs.existsSync('test-resume.pdf')) {
    console.error("Error: test-resume.pdf not found. Please run 'node generate-test-pdf.js' first.");
    process.exit(1);
  }
  const fileBuffer = fs.readFileSync('test-resume.pdf');
  
  // 2. Call parsing endpoint
  console.log("\n1. Testing /api/resume/parse...");
  const parseRes = await fetch('http://localhost:3000/api/resume/parse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: fileBuffer,
  });

  if (!parseRes.ok) {
    const errorText = await parseRes.text();
    console.error(`Parse failed: ${parseRes.status} ${errorText}`);
    process.exit(1);
  }

  const parseData = await parseRes.json();
  console.log("Parse succeeded!");
  console.log(`Parsed Name: ${parseData.resume.name}`);
  console.log(`Parsed Email: ${parseData.resume.email}`);
  console.log(`Parsed Skills count: ${parseData.resume.skills.length}`);
  
  // 3. Call enhance/analysis endpoint
  console.log("\n2. Testing /api/resume/enhance (Hitting Gemini API)...");
  const jobPayload = {
    resume: parseData.resume,
    job: {
      jobTitle: "Frontend Developer",
      jobDescription: "We are looking for a Frontend Developer experienced with React, JavaScript, TypeScript, Next.js, HTML5, CSS3, responsive design, Git, and frontend performance optimization.",
      additionalSkills: ["TypeScript"]
    }
  };

  const enhanceRes = await fetch('http://localhost:3000/api/resume/enhance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobPayload),
  });

  if (!enhanceRes.ok) {
    const errorText = await enhanceRes.text();
    console.error(`Enhance failed: ${enhanceRes.status} ${errorText}`);
    process.exit(1);
  }

  const enhanceData = await enhanceRes.json();
  console.log("Enhance succeeded!");
  console.log(`Original ATS Score: ${enhanceData.originalAnalysis.ats.score}`);
  console.log(`Original Screening Chance: ${enhanceData.originalAnalysis.screeningChance}%`);
  console.log(`Enhanced ATS Score: ${enhanceData.enhancedAnalysis.ats.score}`);
  console.log(`Enhanced Screening Chance: ${enhanceData.enhancedAnalysis.screeningChance}%`);
  console.log(`Score Improvement: +${enhanceData.enhancedAnalysis.ats.score - enhanceData.originalAnalysis.ats.score} points`);
  console.log(`Factual Violations Blocked: ${enhanceData.violations.length}`);
  
  console.log(`\nChanges Recommended by AI (${enhanceData.changes.length}):`);
  enhanceData.changes.forEach((c, i) => {
    console.log(`  [Change #${i+1}] Section: ${c.section} | Type: ${c.changeType}`);
    console.log(`    Reason: ${c.reason}`);
    console.log(`    Original: ${c.original.substring(0, 80)}...`);
    console.log(`    Enhanced: ${c.enhanced.substring(0, 80)}...`);
  });

  // 4. Download Optimized Resume PDF
  console.log("\n3. Testing /api/resume/pdf...");
  const pdfRes = await fetch('http://localhost:3000/api/resume/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume: enhanceData.enhancedResume }),
  });

  if (!pdfRes.ok) {
    console.error(`PDF generate failed: ${pdfRes.status}`);
    process.exit(1);
  }

  const pdfArrayBuffer = await pdfRes.arrayBuffer();
  fs.writeFileSync('enhanced-resume-downloaded.pdf', Buffer.from(pdfArrayBuffer));
  console.log("Enhanced resume PDF downloaded successfully and saved as 'enhanced-resume-downloaded.pdf'!");

  // 5. Download Report PDF
  console.log("\n4. Testing /api/resume/report...");
  const reportPayload = {
    name: parseData.resume.name,
    jobTitle: "Frontend Developer",
    originalScore: enhanceData.originalAnalysis.ats.score,
    enhancedScore: enhanceData.enhancedAnalysis.ats.score,
    screeningChance: enhanceData.enhancedAnalysis.screeningChance,
    breakdownOriginal: enhanceData.originalAnalysis.ats.breakdown,
    breakdownEnhanced: enhanceData.enhancedAnalysis.ats.breakdown,
    matchedKeywords: enhanceData.enhancedAnalysis.keywords.matched,
    missingKeywords: enhanceData.enhancedAnalysis.keywords.missing,
    weakKeywords: enhanceData.enhancedAnalysis.keywords.weak,
    positiveFactors: enhanceData.enhancedAnalysis.positiveFactors,
    negativeFactors: enhanceData.enhancedAnalysis.negativeFactors,
    issues: enhanceData.enhancedAnalysis.issues,
    changes: enhanceData.changes,
    recommendations: enhanceData.recommendations,
  };

  const reportRes = await fetch('http://localhost:3000/api/resume/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportPayload),
  });

  if (!reportRes.ok) {
    console.error(`Report PDF generate failed: ${reportRes.status}`);
    process.exit(1);
  }

  const reportArrayBuffer = await reportRes.arrayBuffer();
  fs.writeFileSync('report-downloaded.pdf', Buffer.from(reportArrayBuffer));
  console.log("ATS Audit Report PDF downloaded successfully and saved as 'report-downloaded.pdf'!");
  
  console.log("\nAll integration endpoints are fully tested and functional on localhost:3000!");
}

runTest().catch(console.error);
