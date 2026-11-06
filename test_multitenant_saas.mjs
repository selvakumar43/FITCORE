import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: body });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data: body, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
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
  const suffix = Date.now();
  const ownerAEmail = `marcus_${suffix}@titanfitness.com`;
  const ownerBEmail = `elena_${suffix}@apexathletics.com`;
  const clientA1Email = `david_${suffix}@titanfit.com`;
  const clientB1Email = `sophia_${suffix}@apexathletics.com`;

  console.log('================================================================');
  console.log('      FITCORE MULTI-TENANT SAAS INTEGRATION & ISOLATION TEST    ');
  console.log('================================================================\n');

  // [1] Verify Existing Default Gym & Seeded Admin Login
  console.log('[1] Testing Default Flagship Gym & Seeded Admin...');
  const adminLoginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@gym360.com', password: 'admin123' });

  assert(adminLoginRes.status === 200, `Admin login succeeded (HTTP ${adminLoginRes.status})`);
  assert(adminLoginRes.data?.token, 'Admin received JWT Bearer token');
  const flagshipToken = adminLoginRes.data.token;
  const flagshipGymId = adminLoginRes.data.user?.gymId;
  assert(flagshipGymId != null, `Admin is linked to gym ID: ${flagshipGymId}`);
  assert(adminLoginRes.data.user?.gymName === 'FITCORE Flagship Gym', `Admin gym name is '${adminLoginRes.data.user?.gymName}'`);

  // [2] Register New Gym: Gym A ("Titan Fitness")
  console.log('\n[2] Registering Gym A: "Titan Fitness Center"...');
  const gymARegRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/register-gym',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    gymName: `Titan Fitness Center ${suffix}`,
    ownerName: 'Marcus Vance',
    email: ownerAEmail,
    phone: `9871${String(suffix).slice(-6)}`,
    password: 'TitanOwner123!',
    confirmPassword: 'TitanOwner123!'
  });

  assert(gymARegRes.status === 200, `Gym A registered successfully (HTTP ${gymARegRes.status})`);
  assert(gymARegRes.data?.token, 'Gym A owner received JWT token');
  const gymAToken = gymARegRes.data.token;
  const gymAId = gymARegRes.data.user?.gymId;
  assert(gymAId != null && gymAId !== flagshipGymId, `Gym A has unique ID: ${gymAId}`);

  // [3] Register New Gym: Gym B ("Apex Athletics")
  console.log('\n[3] Registering Gym B: "Apex Athletics Club"...');
  const gymBRegRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/register-gym',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    gymName: `Apex Athletics Club ${suffix}`,
    ownerName: 'Elena Rostova',
    email: ownerBEmail,
    phone: `9874${String(suffix).slice(-6)}`,
    password: 'ApexOwner123!',
    confirmPassword: 'ApexOwner123!'
  });

  assert(gymBRegRes.status === 200, `Gym B registered successfully (HTTP ${gymBRegRes.status})`);
  assert(gymBRegRes.data?.token, 'Gym B owner received JWT token');
  const gymBToken = gymBRegRes.data.token;
  const gymBId = gymBRegRes.data.user?.gymId;
  assert(gymBId != null && gymBId !== gymAId && gymBId !== flagshipGymId, `Gym B has distinct ID: ${gymBId}`);

  // [4] Duplicate Gym Registration Checks
  console.log('\n[4] Testing Registration Validation & Duplicate Prevention...');
  const dupEmailRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/register-gym',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    gymName: 'Another Gym',
    ownerName: 'Copycat',
    email: ownerAEmail, // Duplicate
    phone: '9998887777',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  });
  assert(dupEmailRes.status === 400, `Duplicate email registration blocked with HTTP 400 (Got ${dupEmailRes.status})`);

  const pwdMismatchRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/register-gym',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    gymName: 'Another Gym',
    ownerName: 'Mismatched',
    email: `mismatch_${suffix}@test.com`,
    phone: '9998887778',
    password: 'Password123!',
    confirmPassword: 'DifferentPassword123!'
  });
  assert(pwdMismatchRes.status === 400, `Password mismatch blocked with HTTP 400 (Got ${pwdMismatchRes.status})`);

  // [5] Verify Seeded Plans in Gym A vs Gym B
  console.log('\n[5] Verifying Plan Initialization & Isolation...');
  const gymAPlansRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/plans',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${gymAToken}` }
  });
  assert(gymAPlansRes.status === 200, 'Gym A retrieved plans');
  assert(Array.isArray(gymAPlansRes.data) && gymAPlansRes.data.length >= 3, `Gym A has ${gymAPlansRes.data.length} auto-initialized plans`);
  const gymAPlanMonthly = gymAPlansRes.data.find(p => p.name === 'Monthly');
  assert(gymAPlanMonthly != null, 'Gym A has Monthly plan');

  const gymBPlansRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/plans',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${gymBToken}` }
  });
  assert(gymBPlansRes.status === 200, 'Gym B retrieved plans');
  const gymBPlanMonthly = gymBPlansRes.data.find(p => p.name === 'Monthly');
  assert(gymBPlanMonthly.id !== gymAPlanMonthly.id, `Plans are strictly isolated per gym (Gym A Plan ID: ${gymAPlanMonthly.id}, Gym B Plan ID: ${gymBPlanMonthly.id})`);

  // [6] Gym A Admin Creates Client A1
  console.log('\n[6] Testing Client Creation & Isolation across Gyms...');
  const createClientARes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/clients',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymAToken}` }
  }, {
    name: 'David Miller',
    email: clientA1Email,
    phone: `9112${String(suffix).slice(-6)}`,
    password: 'davidpass123',
    status: 'ACTIVE'
  });
  assert(createClientARes.status === 200, 'Gym A created Client A1 (David Miller)');
  const clientA1Id = createClientARes.data.id;

  // Gym B Admin lists clients - verify Client A1 is NOT visible
  const gymBClientsRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/clients',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${gymBToken}` }
  });
  assert(gymBClientsRes.status === 200, 'Gym B retrieved clients');
  const foundAInB = gymBClientsRes.data.some(c => c.id === clientA1Id || c.email === clientA1Email);
  assert(!foundAInB, 'Cross-tenant isolation verified: Gym B CANNOT see Gym A clients');

  // Gym B creates Client B1
  const createClientBRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/clients',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymBToken}` }
  }, {
    name: 'Sophia Loren',
    email: clientB1Email,
    phone: `9223${String(suffix).slice(-6)}`,
    password: 'sophiapass123',
    status: 'ACTIVE'
  });
  assert(createClientBRes.status === 200, 'Gym B created Client B1 (Sophia Loren)');
  const clientB1Id = createClientBRes.data.id;

  // [7] Cross-Tenant Security Attacks
  console.log('\n[7] Testing Cross-Tenant Breach Attempts...');
  // Gym A Admin tries to modify Client B1
  const gymAAttackClientB = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/admin/clients/${clientB1Id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymAToken}` }
  }, {
    name: 'Hacked Name',
    email: clientB1Email,
    phone: '9223334455',
    status: 'INACTIVE'
  });
  assert(gymAAttackClientB.status === 400 || gymAAttackClientB.status === 403 || gymAAttackClientB.status === 404,
    `Gym A modifying Gym B client was blocked (HTTP ${gymAAttackClientB.status})`);

  // Gym A Admin tries to delete Client B1
  const gymADeleteClientB = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/admin/clients/${clientB1Id}`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${gymAToken}` }
  });
  assert(gymADeleteClientB.status === 400 || gymADeleteClientB.status === 403 || gymADeleteClientB.status === 404,
    `Gym A deleting Gym B client was blocked (HTTP ${gymADeleteClientB.status})`);

  // Gym A Admin tries to assign membership using Gym B's plan
  const gymACrossPlanAssign = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/memberships/assign',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymAToken}` }
  }, {
    userId: clientA1Id,
    planId: gymBPlanMonthly.id, // Using Gym B's plan!
    isRenewal: false
  });
  assert(gymACrossPlanAssign.status === 400 || gymACrossPlanAssign.status === 403 || gymACrossPlanAssign.status === 404,
    `Gym A assigning Gym B plan was blocked (HTTP ${gymACrossPlanAssign.status})`);

  // [8] Assign Membership in Gym A & Test Payment Calculations
  console.log('\n[8] Testing Legitimate Membership Assignment & Payment Tracking in Gym A...');
  const assignMemRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/memberships/assign',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymAToken}` }
  }, {
    userId: clientA1Id,
    planId: gymAPlanMonthly.id,
    price: 50.0,
    isRenewal: false
  });
  assert(assignMemRes.status === 200, 'Membership assigned to Client A1 in Gym A');
  const membershipA1Id = assignMemRes.data.id;
  assert(assignMemRes.data.remainingBalance === 50.0, 'Initial balance is $50.0');
  assert(assignMemRes.data.paymentStatus === 'UNPAID', 'Initial payment status is UNPAID');

  // Record Installment Payment
  const payTxRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/admin/payments/${membershipA1Id}/transactions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymAToken}` }
  }, {
    amount: 30.0,
    type: 'PAYMENT',
    transactionReference: `TX-TITAN-${Date.now()}`,
    notes: 'Partial payment'
  });
  assert(payTxRes.status === 200, 'Partial payment of $30.0 recorded');
  assert(payTxRes.data.amountPaid === 30.0, 'Amount paid is $30.0');
  assert(payTxRes.data.remainingBalance === 20.0, 'Remaining balance is $20.0');
  assert(payTxRes.data.paymentStatus === 'PARTIALLY_PAID', 'Payment status is PARTIALLY_PAID');

  // Overpay to test customer credit
  const payTx2Res = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/admin/payments/${membershipA1Id}/transactions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymAToken}` }
  }, {
    amount: 30.0,
    type: 'PAYMENT',
    transactionReference: `TX-TITAN-2-${Date.now()}`,
    notes: 'Overpayment'
  });
  assert(payTx2Res.status === 200, 'Second payment of $30.0 recorded (total $60 on $50 fee)');
  assert(payTx2Res.data.amountPaid === 60.0, 'Amount paid is $60.0');
  assert(payTx2Res.data.remainingBalance === 0.0, 'Remaining balance is $0.0');
  assert(payTx2Res.data.customerCredit === 10.0, 'Customer credit is $10.0');
  assert(payTx2Res.data.paymentStatus === 'OVERPAID', 'Payment status is OVERPAID');

  // Gym B Admin tries to view or alter Gym A's payment
  const gymBPaymentBreach = await request({
    hostname: 'localhost',
    port: 8080,
    path: `/api/admin/payments/${membershipA1Id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${gymBToken}` }
  }, {
    amountPaid: 0.0,
    paymentStatus: 'UNPAID'
  });
  assert(gymBPaymentBreach.status === 400 || gymBPaymentBreach.status === 403 || gymBPaymentBreach.status === 404,
    `Gym B updating Gym A payment was blocked (HTTP ${gymBPaymentBreach.status})`);

  // [9] Client Login & Client Dashboard Isolation
  console.log('\n[9] Testing Client Login & Client Dashboard Isolation...');
  const clientLoginRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: clientA1Email, password: 'davidpass123' });

  assert(clientLoginRes.status === 200, 'Client A1 logs in successfully');
  assert(clientLoginRes.data?.user?.gymName != null, `Client A1 associated with ${clientLoginRes.data?.user?.gymName}`);
  const clientA1Token = clientLoginRes.data.token;

  // Client views their personal dashboard
  const clientDashRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/client/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${clientA1Token}` }
  });
  assert(clientDashRes.status === 200, 'Client A1 retrieved personal dashboard');
  assert(clientDashRes.data.currentMembership?.id === membershipA1Id, 'Client sees their own active membership');
  assert(clientDashRes.data.currentMembership?.amountPaid === 60.0, 'Client sees their payment record accurately');

  // Client cannot access Admin APIs
  const clientAdminAttack = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${clientA1Token}` }
  });
  assert(clientAdminAttack.status === 403, `Client blocked from Admin Dashboard (HTTP ${clientAdminAttack.status})`);

  // [10] Gym A Dashboard Aggregated Metrics Check
  console.log('\n[10] Verifying Gym A Aggregated Dashboard Metrics...');
  const gymADashRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${gymAToken}` }
  });
  assert(gymADashRes.status === 200, 'Gym A retrieved dashboard data');
  assert(gymADashRes.data.stats.totalClients === 1, `Gym A totalClients is 1 (Got ${gymADashRes.data.stats.totalClients})`);
  assert(gymADashRes.data.stats.totalRevenue === 60.0, `Gym A totalRevenue is $60.0 (Got ${gymADashRes.data.stats.totalRevenue})`);
  assert(gymADashRes.data.stats.totalCustomerCredit === 10.0, `Gym A customerCredit is $10.0 (Got ${gymADashRes.data.stats.totalCustomerCredit})`);

  console.log('\n================================================================');
  console.log('       ALL FITCORE MULTI-TENANT AUDIT CHECKS PASSED 100%!       ');
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('\n💥 Test suite failed:', err);
  process.exit(1);
});
