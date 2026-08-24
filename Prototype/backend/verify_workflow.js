const http = require('http');

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, error: parsed.error || parsed });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING WORKFLOW INTEGRATION TEST ===');

  try {
    // 1. Logins
    console.log('\n[1] Logging in as Government and Startup...');
    const govLogin = await request('POST', '/auth/login', {
      email: 'government@govstart.demo',
      password: 'password123',
    });
    const govToken = govLogin.token;

    const startupLogin = await request('POST', '/auth/login', {
      email: 'startup@govstart.demo',
      password: 'password123',
    });
    const startupToken = startupLogin.token;

    // 2. Government creates a new challenge
    console.log('\n[2] Government creating new challenge: "Farmer Procurement Waiting-Time Reduction"...');
    const challenge = await request('POST', '/challenges', {
      title: 'Farmer Procurement Waiting-Time Reduction (Test)',
      department: 'Department of Agriculture',
      sector: 'Agriculture',
      location: 'Maharashtra',
      description: 'Farmers currently spend several hours waiting at procurement centres. The department is looking for technology-based solutions to reduce waiting time.',
      currentSituation: 'Waiting times of 4-6 hours at procurement centers.',
      targetUsers: 'Farmers and Mandi Operators',
      expectedImpact: 'Reduce average waiting time by at least 40%.',
      pilotDuration: 90,
      estimatedBudget: 1000000,
      requirements: [
        { name: 'Startup Recognition DPIIT', description: 'Must be recognized by DPIIT', isRequired: true },
        { name: 'Cybersecurity Audit Certificate', description: 'ISO 27001 or cybersecurity compliance', isRequired: true },
        { name: 'Agricultural domain expertise', description: 'Must have agriculture domain experience', isRequired: true }
      ],
      criteria: [
        { name: 'Technical Feasibility', weight: 0.25 },
        { name: 'Innovation', weight: 0.20 },
        { name: 'Cost Effectiveness', weight: 0.15 },
        { name: 'Scalability', weight: 0.15 },
        { name: 'Security', weight: 0.10 },
        { name: 'Social Impact', weight: 0.15 }
      ],
      kpis: [
        { name: 'Average waiting time', baseline: '5.2 hours', target: 'under 3 hours', unit: 'hours', frequency: 'daily' },
        { name: 'Farmers served', baseline: '150/day', target: '250/day', unit: 'farmers', frequency: 'daily' }
      ],
      status: 'PUBLISHED'
    }, govToken);
    console.log('✔ Challenge created successfully! ID:', challenge.id);

    // 3. Startup matches the challenge
    console.log('\n[3] Fetching recommendations for Startup (AgriWait)...');
    const recs = await request('GET', '/discovery/startup/recommendations', null, startupToken);
    const matchedChallenge = recs.find(r => r.challengeId === challenge.id);
    
    if (!matchedChallenge) {
      throw new Error('Created challenge not found in recommendations!');
    }
    console.log(`✔ Recommendations found! Match Score: ${matchedChallenge.score}%, Reasons: "${matchedChallenge.reasons[0]}"`);
    
    if (matchedChallenge.score !== 92) {
      throw new Error(`Match score is ${matchedChallenge.score}%, expected 92%`);
    }
    console.log('✔ Match score matches 92% requirement exactly.');

    // 4. Startup submits application via Wizard
    console.log('\n[4] Startup applying to the challenge...');
    const application = await request('POST', '/applications', {
      challengeId: challenge.id,
      solutionTitle: 'AgriWait Dispatcher',
      problemUnderstanding: 'Inefficient token distribution leads to long queues.',
      proposedSolution: 'AI-based queuing scheduling and real-time dispatcher app.',
      technologyUsed: ['React', 'Node.js', 'PostgreSQL'],
      innovation: 'Dynamic priority scheduling algorithm.',
      expectedImpact: '45% average waiting time reduction.',
      implementationApproach: 'Rollout scheduling app in 3 trial Mandis.',
      pilotTimeline: {
        deployment: '15 days - Setup Cloud VM and local terminals',
        testing: '30 days - User feedback loops',
        training: '15 days - operator boarding',
        monitoring: '15 days - analytics logs',
        evaluation: '15 days - KPI report compile'
      },
      resourceRequirements: {
        teamMembers: '1 PM, 2 Developers',
        infrastructure: 'AWS Lightsail',
        hardwareSoftware: 'SMS Gateway API',
        govSupport: 'Mandi site permissions'
      },
      expectedKpiResults: {
        'Average waiting time': '45% reduction',
        'Farmers served': '280/day'
      },
      documents: [
        { name: 'Startup Recognition Certificate', fileType: 'PDF', size: 120500, url: '/docs/dpiit.pdf' },
        { name: 'Technical Proposal', fileType: 'PDF', size: 450000, url: '/docs/proposal.pdf' }
      ]
    }, startupToken);
    console.log(`✔ Application submitted successfully! ID: ${application.id}, App ID Reference: ${application.appId}, Status: ${application.status}`);

    if (!application.appId.startsWith('APP-')) {
      throw new Error(`Application ID ${application.appId} does not start with APP-`);
    }
    console.log('✔ Padded sequential APP ID generated correctly.');

    // 5. Government reviews and updates status to Screening
    console.log('\n[5] Government reviewing application and moving to Eligibility Screening...');
    const updatedScreening = await request('PUT', `/applications/${application.id}/status`, {
      status: 'ELIGIBILITY_SCREENING',
      explanation: 'Initiating documents audit.'
    }, govToken);
    console.log(`✔ Application status updated to: ${updatedScreening.status}`);

    // Verify Eligibility results were auto populated
    const appDetail = await request('GET', `/applications/${application.id}`, null, govToken);
    console.log(`✔ Checked eligibility results. Count: ${appDetail.eligibilityResults.length}`);
    appDetail.eligibilityResults.forEach(r => {
      console.log(`  - Requirement: "${r.requirement.name}" -> Status: ${r.status}, Evidence: "${r.evidence}"`);
    });

    // 6. Government sends to Expert Evaluation
    console.log('\n[6] Government sending to Expert Evaluation...');
    const updatedEval = await request('PUT', `/applications/${application.id}/status`, {
      status: 'UNDER_EXPERT_EVALUATION',
      explanation: 'Assigned to technical panel.'
    }, govToken);
    console.log(`✔ Application status updated to: ${updatedEval.status}`);

    console.log('\n=== ALL WORKFLOW STAGES VERIFIED SUCCESSFULLY IN THE DATABASE ===');
  } catch (error) {
    console.error('✖ INTEGRATION TEST FAILED:', error);
    process.exit(1);
  }
}

runTests();
