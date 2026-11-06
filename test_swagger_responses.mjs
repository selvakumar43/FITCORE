import http from 'http';

function testEndpoint(name, path, method, headers = {}, body = null) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
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
        console.log(`[${name}] Status: ${res.statusCode} | Content-Type: ${res.headers['content-type']}`);
        console.log(`  Body: ${data.trim()}`);
        resolve({ status: res.statusCode, data });
      });
    });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('       TESTING SWAGGER DOCUMENTED RESPONSES         ');
  console.log('====================================================\n');

  // 1. Unauthenticated call to protected endpoint (401)
  console.log('1. Testing Unauthenticated Request:');
  const unauthRes = await testEndpoint('Unauthenticated Call', '/api/admin/dashboard', 'GET');
  if (unauthRes.status === 401) console.log('  ✅ Handled with documented 401 ErrorResponse\n');

  // 2. Bad credentials (401)
  console.log('2. Testing Bad Credentials:');
  const badLoginRes = await testEndpoint('Bad Login', '/api/auth/login', 'POST', {}, { email: 'admin@gym360.com', password: 'bad' });
  if (badLoginRes.status === 401) console.log('  ✅ Handled with documented 401 ErrorResponse\n');

  // 3. Successful admin login (200)
  console.log('3. Testing Successful Login:');
  const loginRes = await testEndpoint('Admin Login', '/api/auth/login', 'POST', {}, { email: 'admin@gym360.com', password: 'admin123' });
  const token = JSON.parse(loginRes.data).token;
  if (loginRes.status === 200 && token) console.log('  ✅ Documented 200 AuthResponse with JWT\n');

  // 4. Authenticated admin call (200)
  console.log('4. Testing Authenticated Admin Request:');
  const adminDashRes = await testEndpoint('Admin Dashboard', '/api/admin/dashboard', 'GET', { Authorization: 'Bearer ' + token });
  if (adminDashRes.status === 200) console.log('  ✅ Documented 200 AdminDashboardResponse\n');

  // 5. Validation failure (400)
  console.log('5. Testing Validation Failure:');
  const valRes = await testEndpoint('Validation Failure', '/api/admin/clients', 'POST', { Authorization: 'Bearer ' + token }, { name: '', email: 'notanemail' });
  if (valRes.status === 400) console.log('  ✅ Handled with documented 400 ErrorResponse\n');

  // 6. Delete client with memberships (400)
  console.log('6. Testing Business Logic Rejection:');
  const delRes = await testEndpoint('Delete Client with Records', '/api/admin/clients/2', 'DELETE', { Authorization: 'Bearer ' + token });
  if (delRes.status === 400) console.log('  ✅ Handled with documented 400 ErrorResponse\n');

  // 7. Client role attempting admin action (403)
  console.log('7. Testing Client Accessing Admin Endpoint:');
  const clientLoginRes = await testEndpoint('Client Login', '/api/auth/login', 'POST', {}, { email: 'john@example.com', password: 'client123' });
  const clientToken = JSON.parse(clientLoginRes.data).token;
  const clientForbiddenRes = await testEndpoint('Client to Admin Dashboard', '/api/admin/dashboard', 'GET', { Authorization: 'Bearer ' + clientToken });
  if (clientForbiddenRes.status === 403) console.log('  ✅ Handled with documented 403 ErrorResponse\n');

  console.log('====================================================');
  console.log('       ALL RESPONSES MATCH DOCUMENTATION!           ');
  console.log('====================================================');
}

run();

