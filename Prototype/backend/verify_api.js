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
  console.log('=== STARTING BACKEND INTEGRATION TEST ===');

  try {
    // 1. Test Logins
    console.log('1. Testing demo accounts login...');
    const govLogin = await request('POST', '/auth/login', {
      email: 'government@govstart.demo',
      password: 'password123',
    });
    console.log('✔ Government login success. Token length:', govLogin.token.length);
    const govToken = govLogin.token;

    const startupLogin = await request('POST', '/auth/login', {
      email: 'startup@govstart.demo',
      password: 'password123',
    });
    console.log('✔ Startup login success. StartupId:', startupLogin.user.startupId);
    const startupToken = startupLogin.token;

    const expertLogin = await request('POST', '/auth/login', {
      email: 'expert@govstart.demo',
      password: 'password123',
    });
    console.log('✔ Expert login success.');
    const expertToken = expertLogin.token;

    // 2. Fetch Challenges
    console.log('2. Fetching challenges...');
    const challenges = await request('GET', '/challenges');
    console.log(`✔ Found ${challenges.length} challenges.`);
    const waitingChallenge = challenges.find(c => c.title.includes('Waiting-Time'));
    console.log('✔ Waiting-Time Challenge ID:', waitingChallenge.id);

    // 3. Test AI Discovery Match
    console.log('3. Testing AI Startup Discovery...');
    const matches = await request('GET', `/discovery/${waitingChallenge.id}`);
    console.log(`✔ Found ${matches.length} matching startups.`);
    const agriWaitMatch = matches.find(m => m.name.includes('AgriWait'));
    console.log(`✔ AgriWait match score: ${agriWaitMatch.score}%, Eligibility status: ${agriWaitMatch.eligibilityStatus}`);

    // 4. Fetch Applications
    console.log('4. Fetching applications as government officer...');
    const applications = await request('GET', '/applications', null, govToken);
    console.log(`✔ Found ${applications.length} total applications.`);
    const agriApp = applications.find(a => a.startup.name.includes('AgriWait'));
    console.log(`✔ AgriWait application status: ${agriApp.status}`);

    // 5. Test Audit Logs
    console.log('5. Fetching audit logs...');
    const logs = await request('GET', '/audit-logs');
    console.log(`✔ Audit logs contains ${logs.length} entries.`);

    // 6. Test Analytics
    console.log('6. Fetching global metrics...');
    const analytics = await request('GET', '/analytics');
    console.log(`✔ Analytics loaded. Challenges: ${analytics.totalChallenges}, Pilots: ${analytics.totalPilots}`);

    console.log('=== ALL CORE API INTEGRATION CHECKS COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('✖ INTEGRATION TEST FAILED:', error);
    process.exit(1);
  }
}

// Start backend in background or assume it's running
// For this script, we assume the server will be run first.
runTests();
