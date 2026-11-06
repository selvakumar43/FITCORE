import http from 'http';

const BASE_HOST = 'localhost';
const BASE_PORT = 8080;

function request(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('   GYM360 SECURE ADMINISTRATOR ACCOUNT MANAGEMENT AUDIT TEST     ');
  console.log('================================================================\n');

  // --- 1. INITIAL ADMIN VERIFICATION ---
  console.log('[1] Testing Initial Administrator Account Creation...');
  // Login with initial seeded admin
  const adminLoginRes = await request('/api/auth/login', 'POST', {}, {
    email: 'admin@gym360.com',
    password: 'admin123'
  });
  assert(adminLoginRes.status === 200, 'Initial Admin logs in with seeded credentials');
  assert(adminLoginRes.data.user.role === 'ADMIN', 'Admin user has role ADMIN');
  let adminToken = adminLoginRes.data.token;
  assert(Boolean(adminToken), 'JWT access token issued for Administrator');
  console.log(`  Initial temporary password status: mustChangePassword = ${adminLoginRes.data.user.mustChangePassword}`);

  // --- 2. INVALID CREDENTIALS REJECTION ---
  console.log('\n[2] Testing Authentication with Invalid Credentials...');
  const badLoginRes = await request('/api/auth/login', 'POST', {}, {
    email: 'admin@gym360.com',
    password: 'wrong_password_999'
  });
  assert(badLoginRes.status === 401, 'Bad password rejected with HTTP 401 Unauthorized');
  assert(badLoginRes.data.error === true, 'Error response format verified');

  // --- 3. ADMIN PROFILE RETRIEVAL ---
  console.log('\n[3] Testing Admin Profile Inspection (GET /api/admin/profile)...');
  const profileRes = await request('/api/admin/profile', 'GET', {
    Authorization: `Bearer ${adminToken}`
  });
  assert(profileRes.status === 200, 'Admin profile retrieved successfully');
  assert(profileRes.data.email === 'admin@gym360.com', 'Admin email matches authenticated identity');
  assert(profileRes.data.role === 'ADMIN', 'Profile verifies role is ADMIN');
  assert(profileRes.data.status === 'ACTIVE', 'Admin account status is ACTIVE');

  // --- 4. ADMIN PROFILE UPDATES ---
  console.log('\n[4] Testing Admin Profile Update (PUT /api/admin/profile)...');
  const updateRes = await request('/api/admin/profile', 'PUT', {
    Authorization: `Bearer ${adminToken}`
  }, {
    name: 'Alex Carter (Gym Owner)',
    phone: '9876543211'
  });
  assert(updateRes.status === 200, 'Profile updated successfully');
  assert(updateRes.data.name === 'Alex Carter (Gym Owner)', 'Name updated to "Alex Carter (Gym Owner)"');
  assert(updateRes.data.phone === '9876543211', 'Phone updated to "9876543211"');

  // --- 5. ADMIN PASSWORD CHANGE ---
  console.log('\n[5] Testing Admin Password Change...');
  // 5a. Incorrect current password rejected
  const badOldPassRes = await request('/api/admin/profile/change-password', 'POST', {
    Authorization: `Bearer ${adminToken}`
  }, {
    currentPassword: 'incorrect_current',
    newPassword: 'NewSecureAdminPass#1'
  });
  assert(badOldPassRes.status === 401, 'Incorrect current password rejected with HTTP 401');

  // 5b. Identical password rejected
  const samePassRes = await request('/api/admin/profile/change-password', 'POST', {
    Authorization: `Bearer ${adminToken}`
  }, {
    currentPassword: 'admin123',
    newPassword: 'admin123'
  });
  assert(samePassRes.status === 400, 'Identical new password rejected with HTTP 400');

  // 5c. Valid password change
  const changePassRes = await request('/api/admin/profile/change-password', 'POST', {
    Authorization: `Bearer ${adminToken}`
  }, {
    currentPassword: 'admin123',
    newPassword: 'SecureAdmin#2026'
  });
  assert(changePassRes.status === 200, 'Admin password changed successfully');
  assert(changePassRes.data.message.includes('successfully'), 'Success message returned');

  // 5d. Old password should fail now
  const oldLoginRes = await request('/api/auth/login', 'POST', {}, {
    email: 'admin@gym360.com',
    password: 'admin123'
  });
  assert(oldLoginRes.status === 401, 'Old temporary password no longer valid');

  // 5e. New password succeeds
  const newLoginRes = await request('/api/auth/login', 'POST', {}, {
    email: 'admin@gym360.com',
    password: 'SecureAdmin#2026'
  });
  assert(newLoginRes.status === 200, 'New secure password authenticates successfully');
  assert(newLoginRes.data.user.mustChangePassword === false, 'mustChangePassword flag is now false');
  adminToken = newLoginRes.data.token;

  // --- 6. ADMIN EMAIL CHANGE ---
  console.log('\n[6] Testing Admin Email Change with Password Verification...');
  // 6a. Wrong password rejected
  const badEmailPassRes = await request('/api/admin/profile/email', 'PUT', {
    Authorization: `Bearer ${adminToken}`
  }, {
    newEmail: 'owner@gym360.com',
    password: 'wrong_password'
  });
  assert(badEmailPassRes.status === 401, 'Email change rejected when current password verification fails');

  // 6b. Duplicate email taken by client rejected
  const dupEmailRes = await request('/api/admin/profile/email', 'PUT', {
    Authorization: `Bearer ${adminToken}`
  }, {
    newEmail: 'john@example.com',
    password: 'SecureAdmin#2026'
  });
  assert(dupEmailRes.status === 400, 'Email change rejected when email already taken by another account');

  // 6c. Successful email update
  const emailChangeRes = await request('/api/admin/profile/email', 'PUT', {
    Authorization: `Bearer ${adminToken}`
  }, {
    newEmail: 'owner@gym360.com',
    password: 'SecureAdmin#2026'
  });
  assert(emailChangeRes.status === 200, 'Admin email changed successfully to owner@gym360.com');
  assert(Boolean(emailChangeRes.data.token), 'New JWT issued with updated email');
  adminToken = emailChangeRes.data.token;

  // 6d. Verify login with new email
  const loginNewEmailRes = await request('/api/auth/login', 'POST', {}, {
    email: 'owner@gym360.com',
    password: 'SecureAdmin#2026'
  });
  assert(loginNewEmailRes.status === 200, 'Login with new email succeeds');

  // 6e. Revert back to admin@gym360.com to maintain app continuity
  const revertEmailRes = await request('/api/admin/profile/email', 'PUT', {
    Authorization: `Bearer ${adminToken}`
  }, {
    newEmail: 'admin@gym360.com',
    password: 'SecureAdmin#2026'
  });
  assert(revertEmailRes.status === 200, 'Admin email successfully reverted back to admin@gym360.com');
  adminToken = revertEmailRes.data.token;

  // --- 7. PASSWORD RECOVERY (FORGOT & RESET PASSWORD) ---
  console.log('\n[7] Testing Password Recovery via Secure Token...');
  // 7a. Non-existent email
  const forgotNonExistRes = await request('/api/auth/forgot-password', 'POST', {}, {
    email: 'nobody@gym360.com'
  });
  assert(forgotNonExistRes.status === 400, 'Forgot password for non-existent email rejected');

  // 7b. Valid admin forgot password
  const forgotRes = await request('/api/auth/forgot-password', 'POST', {}, {
    email: 'admin@gym360.com'
  });
  assert(forgotRes.status === 200, 'Password recovery token generated successfully');
  const recoveryToken = forgotRes.data.resetToken;
  assert(Boolean(recoveryToken), 'Secure reset token received');

  // 7c. Reset with invalid token
  const badResetRes = await request('/api/auth/reset-password', 'POST', {}, {
    token: 'invalid_token_xyz_123',
    newPassword: 'BrandNewPassword#1'
  });
  assert(badResetRes.status === 400, 'Reset with invalid token rejected');

  // 7d. Reset with valid token
  const resetRes = await request('/api/auth/reset-password', 'POST', {}, {
    token: recoveryToken,
    newPassword: 'admin123' // Revert to standard demo pass for convenience
  });
  assert(resetRes.status === 200, 'Password reset succeeded using valid recovery token');

  // 7e. Test login with reset password
  const resetLoginRes = await request('/api/auth/login', 'POST', {}, {
    email: 'admin@gym360.com',
    password: 'admin123'
  });
  assert(resetLoginRes.status === 200, 'Admin successfully logs in with newly reset password');
  adminToken = resetLoginRes.data.token;

  // --- 8. CLIENT ISOLATION & ACCESS CONTROL ---
  console.log('\n[8] Testing Client Isolation from Admin Functionalities...');
  const clientLoginRes = await request('/api/auth/login', 'POST', {}, {
    email: 'john@example.com',
    password: 'client123'
  });
  const clientToken = clientLoginRes.data.token;

  // 8a. Client attempting to get admin profile
  const clientProfileRes = await request('/api/admin/profile', 'GET', {
    Authorization: `Bearer ${clientToken}`
  });
  assert(clientProfileRes.status === 403, 'Client accessing GET /api/admin/profile blocked with HTTP 403');

  // 8b. Client attempting to update admin profile
  const clientUpdateRes = await request('/api/admin/profile', 'PUT', {
    Authorization: `Bearer ${clientToken}`
  }, { name: 'Hacker' });
  assert(clientUpdateRes.status === 403, 'Client accessing PUT /api/admin/profile blocked with HTTP 403');

  // 8c. Client attempting to change admin password
  const clientPassRes = await request('/api/admin/profile/change-password', 'POST', {
    Authorization: `Bearer ${clientToken}`
  }, { currentPassword: 'client123', newPassword: 'hack' });
  assert(clientPassRes.status === 403, 'Client accessing POST /api/admin/profile/change-password blocked with HTTP 403');

  // --- 9. PREVENT PUBLIC ADMIN REGISTRATION ---
  console.log('\n[9] Testing Prevention of Additional or Public Admin Registration...');
  // 9a. Any attempt to register admin publicly
  const pubRegRes = await request('/api/auth/register-admin', 'POST', {}, {});
  assert(pubRegRes.status === 400 || pubRegRes.status === 403 || pubRegRes.status === 404,
    'Public admin registration endpoint strictly blocked');

  // 9b. Client creation API cannot create an ADMIN
  const clientAddRes = await request('/api/admin/clients', 'POST', {
    Authorization: `Bearer ${adminToken}`
  }, {
    name: 'Fake Admin Attempt',
    email: `fakeadmin.${Date.now()}@gymtest.com`,
    phone: '9' + Math.floor(100000000 + Math.random() * 900000000),
    role: 'ADMIN' // Malicious attempt to inject role
  });
  assert(clientAddRes.status === 200, 'Client registration request processed');
  assert(clientAddRes.data.role === 'CLIENT', 'Injected role ignored: New user is strictly CLIENT');

  // 9c. Verify total admin count in the entire system remains strictly 1
  const dashRes = await request('/api/admin/dashboard', 'GET', {
    Authorization: `Bearer ${adminToken}`
  });
  assert(dashRes.status === 200, 'Dashboard loaded');
  const allUsersRes = await request('/api/admin/clients', 'GET', {
    Authorization: `Bearer ${adminToken}`
  });
  const anyAdminInClients = allUsersRes.data.some(u => u.role === 'ADMIN');
  assert(!anyAdminInClients, 'Zero administrators exist in client registry');

  console.log('\n================================================================');
  console.log('   🎉 ALL ADMIN SECURITY & MANAGEMENT TESTS PASSED 100%!       ');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});

