import http from 'http';

const BASE_URL = 'http://localhost:8080/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', err => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 TESTING FITCORE ADMIN-CREATED CLIENT LOGIN ACCOUNT');
  console.log('======================================================\n');

  const ts = Date.now();

  // Step 1: Register Gym A and Admin A
  console.log('--- Step 1: Onboard Gym A & Admin A ---');
  const gymAReg = await request('POST', '/auth/register-gym', {
    gymName: `Apex Gym ${ts}`,
    ownerName: `Owner A ${ts}`,
    email: `admin_a_${ts}@apex.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    phone: '555-111-2222',
    address: '100 Fitness Way'
  });
  if (gymAReg.status !== 200) {
    console.log('Registration status:', gymAReg.status, 'data:', gymAReg.data);
  }
  assert(gymAReg.status === 200, 'Gym A registered successfully');
  const tokenA = gymAReg.data.token;
  assert(tokenA, 'Received JWT token for Admin A');

  // Step 2: Attempt client creation with invalid passwords
  console.log('\n--- Step 2: Validation of Client Login Credentials ---');
  
  // 2a: Password mismatch
  const mismatchRes = await request('POST', '/admin/clients', {
    name: 'Alice Member',
    email: `alice_${ts}@example.com`,
    phone: '555-0101',
    password: 'InitialPass123',
    confirmPassword: 'MismatchPass123'
  }, tokenA);
  assert(mismatchRes.status === 400, 'Client creation rejected when passwords do not match');

  // 2b: Password too short (< 6 chars)
  const shortPassRes = await request('POST', '/admin/clients', {
    name: 'Alice Member',
    email: `alice_${ts}@example.com`,
    phone: '555-0101',
    password: '123',
    confirmPassword: '123'
  }, tokenA);
  assert(shortPassRes.status === 400, 'Client creation rejected when password is < 6 characters');

  // Step 3: Successfully create client with valid credentials
  console.log('\n--- Step 3: Admin A Creates Client & Login Account ---');
  const clientEmail = `alice_${ts}@example.com`;
  const initialPassword = 'InitialSecretPass123!';
  const clientPhone = `555-${String(ts).slice(-6)}`;

  const createClientRes = await request('POST', '/admin/clients', {
    name: 'Alice Member',
    email: clientEmail,
    phone: clientPhone,
    password: initialPassword,
    confirmPassword: initialPassword
  }, tokenA);
  if (createClientRes.status !== 200) {
    console.log('Create client status:', createClientRes.status, 'data:', createClientRes.data);
  }
  assert(createClientRes.status === 200, 'Client created successfully by Admin A');
  assert(createClientRes.data.email === clientEmail, 'Client profile saved with email');
  assert(!createClientRes.data.password, 'Client password is NOT exposed in admin response');
  const clientId = createClientRes.data.id;

  // Step 4: Client Logs In with Admin-Created Credentials
  console.log('\n--- Step 4: Client Login with Initial Credentials ---');
  const clientLoginRes = await request('POST', '/auth/login', {
    email: clientEmail,
    password: initialPassword
  });
  assert(clientLoginRes.status === 200, 'Client logged in successfully with admin-created credentials');
  assert(clientLoginRes.data.user?.role === 'CLIENT', 'Client role is verified as CLIENT');
  assert(clientLoginRes.data.user?.email === clientEmail, 'Client email matches');
  const clientToken = clientLoginRes.data.token;
  assert(clientToken, 'Client received valid JWT token');

  // Step 5: Client Views Client Dashboard
  console.log('\n--- Step 5: Client Dashboard Access ---');
  const clientDashRes = await request('GET', '/client/dashboard', null, clientToken);
  assert(clientDashRes.status === 200, 'Client successfully retrieved own dashboard');
  assert(clientDashRes.data.client.id === clientId, 'Client sees own profile id');
  assert(clientDashRes.data.client.email === clientEmail, 'Client sees own email');
  assert(clientDashRes.data.client.gymName === `Apex Gym ${ts}`, 'Client is scoped to Admin A gym');

  // Step 6: Security Verification - Client Access Controls
  console.log('\n--- Step 6: Security Verification (RBAC & Isolation) ---');
  const adminApiRes1 = await request('GET', '/admin/clients', null, clientToken);
  assert(adminApiRes1.status === 403, 'Client is FORBIDDEN from accessing /api/admin/clients');

  const adminApiRes2 = await request('GET', '/admin/dashboard', null, clientToken);
  assert(adminApiRes2.status === 403, 'Client is FORBIDDEN from accessing /api/admin/dashboard');

  // Step 7: Client Change Password Validations
  console.log('\n--- Step 7: Client Change Password Validations ---');
  
  // 7a: Wrong current password
  const wrongCurrentRes = await request('POST', '/client/change-password', {
    currentPassword: 'WrongPassword999!',
    newPassword: 'BrandNewPassword456!',
    confirmNewPassword: 'BrandNewPassword456!'
  }, clientToken);
  assert(wrongCurrentRes.status === 400 || wrongCurrentRes.status === 401, 'Rejected when current password does not match stored BCrypt hash');

  // 7b: Confirm password mismatch
  const confirmMismatchRes = await request('POST', '/client/change-password', {
    currentPassword: initialPassword,
    newPassword: 'BrandNewPassword456!',
    confirmNewPassword: 'DifferentNewPassword456!'
  }, clientToken);
  assert(confirmMismatchRes.status === 400, 'Rejected when newPassword and confirmNewPassword do not match');

  // 7c: Same password as current
  const samePassRes = await request('POST', '/client/change-password', {
    currentPassword: initialPassword,
    newPassword: initialPassword,
    confirmNewPassword: initialPassword
  }, clientToken);
  assert(samePassRes.status === 400, 'Rejected when new password is the same as current password');

  // 7d: Short new password
  const shortNewPassRes = await request('POST', '/client/change-password', {
    currentPassword: initialPassword,
    newPassword: '123',
    confirmNewPassword: '123'
  }, clientToken);
  assert(shortNewPassRes.status === 400, 'Rejected when new password is < 6 characters');

  // Step 8: Client Successfully Changes Password
  console.log('\n--- Step 8: Client Successfully Changes Password ---');
  const brandNewPassword = 'BrandNewPassword789!';
  const changeSuccessRes = await request('POST', '/client/change-password', {
    currentPassword: initialPassword,
    newPassword: brandNewPassword,
    confirmNewPassword: brandNewPassword
  }, clientToken);
  assert(changeSuccessRes.status === 200, 'Password changed successfully');
  assert(changeSuccessRes.data.message.includes('successfully'), 'Received positive confirmation message');

  // Step 9: Verify Old Password Invalidation & New Password Authentication
  console.log('\n--- Step 9: Invalidation of Old Password & Login with New Password ---');
  // Attempt login with old initial password -> MUST FAIL
  const oldLoginRes = await request('POST', '/auth/login', {
    email: clientEmail,
    password: initialPassword
  });
  assert(oldLoginRes.status === 401, 'Old password no longer works (HTTP 401)');

  // Attempt login with new password -> MUST SUCCEED
  const newLoginRes = await request('POST', '/auth/login', {
    email: clientEmail,
    password: brandNewPassword
  });
  assert(newLoginRes.status === 200, 'Client successfully logged in with NEW password');
  assert(newLoginRes.data.user?.role === 'CLIENT', 'Client authenticated with CLIENT role');

  // Step 10: Multi-Tenant Cross-Gym Isolation
  console.log('\n--- Step 10: Cross-Gym Isolation for Clients ---');
  const gymBReg = await request('POST', '/auth/register-gym', {
    gymName: `Iron Gym ${ts}`,
    ownerName: `Owner B ${ts}`,
    email: `admin_b_${ts}@irongym.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    phone: '555-333-4444',
    address: '200 Muscle St'
  });
  assert(gymBReg.status === 200, 'Gym B registered successfully');
  const tokenB = gymBReg.data.token;

  // Gym B admin attempts to update Gym A client -> MUST BE REJECTED (HTTP 400/404)
  const bTriesUpdateARes = await request('PUT', `/admin/clients/${clientId}`, {
    name: 'Hacked Alice',
    email: clientEmail,
    phone: '555-9999',
    status: 'ACTIVE'
  }, tokenB);
  assert(bTriesUpdateARes.status === 400 || bTriesUpdateARes.status === 404, 'Gym B admin cannot access or modify Gym A client');

  // Gym B clients list does not contain Gym A client
  const gymBClients = await request('GET', '/admin/clients', null, tokenB);
  assert(gymBClients.status === 200, 'Gym B clients retrieved');
  const foundAliceInGymB = gymBClients.data.some(c => c.id === clientId || c.email === clientEmail);
  assert(!foundAliceInGymB, 'Gym A client is NOT visible to Gym B');

  console.log('\n======================================================');
  console.log('🎉 ALL CLIENT CREDENTIALS & WORKFLOW TESTS PASSED!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
