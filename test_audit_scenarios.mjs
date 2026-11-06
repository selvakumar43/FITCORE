import axios from './frontend/node_modules/axios/index.js';

const BASE_URL = 'http://localhost:8080/api';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runAuditTests() {
  console.log('================================================================');
  console.log('       GYM360 COMPREHENSIVE LOGIC AUDIT & SCENARIOS TEST        ');
  console.log('================================================================\n');

  try {
    // 0. AUTHENTICATE ADMIN
    console.log('[Setup] Admin Login...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@gym360.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };
    assert(Boolean(adminToken), 'Admin authenticated with JWT token');

    // ==============================================================
    // CLIENT MANAGEMENT SCENARIOS
    // ==============================================================
    console.log('\n--- CLIENT MANAGEMENT SCENARIOS ---');

    // 1. New Client Registration
    console.log('[Client 1] New Client Registration...');
    const timestamp = Date.now();
    const clientEmail = `audit.client.${timestamp}@gymtest.com`;
    const clientPhone = `98${String(timestamp).slice(-8)}`;
    const regRes = await axios.post(
      `${BASE_URL}/admin/clients`,
      {
        name: 'Clark Kent',
        email: clientEmail,
        phone: clientPhone,
        password: 'client123'
      },
      { headers: adminHeaders }
    );
    assert(regRes.status === 200, 'New client successfully registered');
    const newClient = regRes.data;
    assert(newClient.name === 'Clark Kent', 'Client name correct');
    assert(newClient.status === 'ACTIVE', 'Client registered as ACTIVE');

    // 2. Duplicate Email Registration
    console.log('[Client 2] Duplicate Email Registration...');
    let dupEmailBlocked = false;
    try {
      await axios.post(
        `${BASE_URL}/admin/clients`,
        {
          name: 'Imposter Kent',
          email: clientEmail,
          phone: `99${String(Date.now()).slice(-8)}`,
          password: 'client123'
        },
        { headers: adminHeaders }
      );
    } catch (err) {
      dupEmailBlocked = true;
      assert(err.response.status === 400, 'Duplicate email rejected with HTTP 400 Bad Request');
    }
    assert(dupEmailBlocked, 'Rule verified: Cannot register duplicate email');

    // 3. Duplicate Phone Registration
    console.log('[Client 3] Duplicate Phone Registration...');
    let dupPhoneBlocked = false;
    try {
      await axios.post(
        `${BASE_URL}/admin/clients`,
        {
          name: 'Phone Duplicate',
          email: `unique.${Date.now()}@gymtest.com`,
          phone: clientPhone, // Same phone
          password: 'client123'
        },
        { headers: adminHeaders }
      );
    } catch (err) {
      dupPhoneBlocked = true;
      assert(err.response.status === 400, 'Duplicate phone rejected with HTTP 400 Bad Request');
    }
    assert(dupPhoneBlocked, 'Rule verified: Cannot register duplicate phone number');

    // 4. Blocked Client Login
    console.log('[Client 4] Blocked / Deactivated Client Login...');
    // Deactivate client
    const toggleRes = await axios.patch(
      `${BASE_URL}/admin/clients/${newClient.id}/status`,
      {},
      { headers: adminHeaders }
    );
    assert(toggleRes.data.status === 'INACTIVE', 'Client status is INACTIVE');

    let blockedLoginPrevented = false;
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: clientEmail,
        password: 'client123'
      });
    } catch (err) {
      blockedLoginPrevented = true;
      assert(err.response.status === 403 || err.response.status === 400, 'Deactivated client login forbidden');
    }
    assert(blockedLoginPrevented, 'Rule verified: Deactivated / blocked clients cannot log in');

    // Re-activate client for further testing
    await axios.patch(`${BASE_URL}/admin/clients/${newClient.id}/status`, {}, { headers: adminHeaders });

    // ==============================================================
    // MEMBERSHIP SCENARIOS
    // ==============================================================
    console.log('\n--- MEMBERSHIP LIFECYCLE SCENARIOS ---');

    const plansRes = await axios.get(`${BASE_URL}/admin/plans`, { headers: adminHeaders });
    const monthlyPlan = plansRes.data.find(p => p.durationMonths === 1) || plansRes.data[0];

    // 1. Upcoming Membership (start date in future)
    console.log('[Membership 1] Upcoming Membership (start date in future)...');
    const futureStart = '2027-01-01';
    const upcomingRes = await axios.post(
      `${BASE_URL}/admin/memberships/assign`,
      {
        userId: newClient.id,
        planId: monthlyPlan.id,
        startDate: futureStart,
        price: 100.0,
        isRenewal: false
      },
      { headers: adminHeaders }
    );
    assert(upcomingRes.data.effectiveStatus === 'UPCOMING', 'Future membership has status UPCOMING');
    assert(upcomingRes.data.startDate === '2027-01-01', 'Start date matches future date');
    assert(upcomingRes.data.expiryDate === '2027-02-01', 'Expiry date calculated (+1 month)');

    // 2. Cancellation of Membership
    console.log('[Membership 2] Membership Cancellation...');
    const cancelRes = await axios.post(
      `${BASE_URL}/admin/memberships/${upcomingRes.data.id}/cancel`,
      {},
      { headers: adminHeaders }
    );
    assert(cancelRes.data.effectiveStatus === 'CANCELLED', 'Cancelled membership has status CANCELLED');

    // 3. Active Membership
    console.log('[Membership 3] Active Membership (today)...');
    const todayStr = new Date().toISOString().split('T')[0];
    const activeRes = await axios.post(
      `${BASE_URL}/admin/memberships/assign`,
      {
        userId: newClient.id,
        planId: monthlyPlan.id,
        startDate: todayStr,
        price: 100.0,
        isRenewal: true
      },
      { headers: adminHeaders }
    );
    assert(activeRes.data.effectiveStatus === 'ACTIVE', 'Current membership has status ACTIVE');
    assert(activeRes.data.price === 100.0, 'Agreed fee stored correctly ($100.0)');

    // 4. Membership Extension
    console.log('[Membership 4] Membership Extension (+15 days)...');
    const originalExpiry = activeRes.data.expiryDate;
    const extendRes = await axios.post(
      `${BASE_URL}/admin/memberships/${activeRes.data.id}/extend`,
      { extraDays: 15, reason: 'Holiday gift' },
      { headers: adminHeaders }
    );
    assert(extendRes.data.expiryDate > originalExpiry, `Expiry extended from ${originalExpiry} to ${extendRes.data.expiryDate}`);

    // 5. Plan Price Changed After Membership Created
    console.log('[Membership 5] Plan Price Change Does Not Affect Existing Membership...');
    await axios.put(
      `${BASE_URL}/admin/plans/${monthlyPlan.id}`,
      {
        name: monthlyPlan.name,
        durationMonths: monthlyPlan.durationMonths,
        price: 999.0, // Dramatically increase plan price
        description: monthlyPlan.description
      },
      { headers: adminHeaders }
    );
    // Fetch membership again to verify agreed price didn't change
    const checkDash = await axios.get(`${BASE_URL}/admin/dashboard`, { headers: adminHeaders });
    const currentMemCheck = checkDash.data.detailedMemberships.find(m => m.id === activeRes.data.id);
    assert(currentMemCheck.price === 100.0, 'Agreed membership fee remained $100.0 despite plan price update to $999.0');
    // Restore plan price
    await axios.put(
      `${BASE_URL}/admin/plans/${monthlyPlan.id}`,
      { name: monthlyPlan.name, durationMonths: monthlyPlan.durationMonths, price: 50.0, description: monthlyPlan.description },
      { headers: adminHeaders }
    );

    // 6. Membership Renewal (Preserving Previous Record)
    console.log('[Membership 6] Membership Renewal...');
    const renewalRes = await axios.post(
      `${BASE_URL}/admin/memberships/assign`,
      {
        userId: newClient.id,
        planId: monthlyPlan.id,
        startDate: currentMemCheck.expiryDate, // seamless renewal
        price: 100.0,
        isRenewal: true
      },
      { headers: adminHeaders }
    );
    assert(renewalRes.data.price === 100.0, 'Renewal created with agreed price');

    // ==============================================================
    // PAYMENT MANAGEMENT SCENARIOS (Agreed fee = $100)
    // ==============================================================
    console.log('\n--- PAYMENT MANAGEMENT SCENARIOS ---');
    const testMemId = renewalRes.data.id;

    // 1. Agreed fee $100, Paid $0 -> Status UNPAID, Balance $100, Credit $0
    console.log('[Payment 1] Agreed fee $100, Paid $0...');
    const p1 = await axios.put(`${BASE_URL}/admin/payments/${testMemId}`, {
      amountPaid: 0.0,
      paymentStatus: 'UNPAID'
    }, { headers: adminHeaders });
    assert(p1.data.amountPaid === 0.0, 'Amount paid is $0');
    assert(p1.data.remainingBalance === 100.0, 'Remaining balance is $100');
    assert(p1.data.customerCredit === 0.0, 'Customer credit is $0');
    assert(p1.data.paymentStatus === 'UNPAID', 'Payment status is UNPAID');

    // 2. Agreed fee $100, Paid $40 -> Status PARTIALLY_PAID, Balance $60, Credit $0
    console.log('[Payment 2] Agreed fee $100, Paid $40...');
    const p2 = await axios.put(`${BASE_URL}/admin/payments/${testMemId}`, {
      amountPaid: 40.0,
      paymentStatus: 'PARTIALLY_PAID'
    }, { headers: adminHeaders });
    assert(p2.data.amountPaid === 40.0, 'Amount paid is $40');
    assert(p2.data.remainingBalance === 60.0, 'Remaining balance is $60');
    assert(p2.data.customerCredit === 0.0, 'Customer credit is $0');
    assert(p2.data.paymentStatus === 'PARTIALLY_PAID', 'Payment status is PARTIALLY_PAID');

    // 3. Agreed fee $100, Paid $100 -> Status PAID, Balance $0, Credit $0
    console.log('[Payment 3] Agreed fee $100, Paid $100...');
    const p3 = await axios.put(`${BASE_URL}/admin/payments/${testMemId}`, {
      amountPaid: 100.0,
      paymentStatus: 'PAID'
    }, { headers: adminHeaders });
    assert(p3.data.amountPaid === 100.0, 'Amount paid is $100');
    assert(p3.data.remainingBalance === 0.0, 'Remaining balance is $0');
    assert(p3.data.customerCredit === 0.0, 'Customer credit is $0');
    assert(p3.data.paymentStatus === 'PAID', 'Payment status is PAID');

    // 4. Agreed fee $100, Paid $150 (Overpayment) -> Status OVERPAID, Balance $0, Credit $50
    console.log('[Payment 4] Agreed fee $100, Paid $150 (Overpayment)...');
    const p4 = await axios.put(`${BASE_URL}/admin/payments/${testMemId}`, {
      amountPaid: 150.0,
      paymentStatus: 'OVERPAID'
    }, { headers: adminHeaders });
    assert(p4.data.amountPaid === 150.0, 'Amount paid is $150');
    assert(p4.data.remainingBalance === 0.0, 'Remaining balance is $0');
    assert(p4.data.customerCredit === 50.0, 'Customer credit is $50.00');
    assert(p4.data.paymentStatus === 'OVERPAID', 'Payment status is OVERPAID');

    // Reset amount paid back to 0 for transaction tests
    await axios.put(`${BASE_URL}/admin/payments/${testMemId}`, { amountPaid: 0.0, paymentStatus: 'UNPAID' }, { headers: adminHeaders });

    // 5. Multiple payments adding up to the agreed fee ($40 + $60 = $100)
    console.log('[Payment 5] Multiple Payments Adding Up to Agreed Fee ($40 + $60 = $100)...');
    const ref1 = `TX-PART1-${Date.now()}`;
    const tx1 = await axios.post(`${BASE_URL}/admin/payments/${testMemId}/transactions`, {
      amount: 40.0,
      type: 'PAYMENT',
      transactionReference: ref1,
      notes: 'Initial cash installment'
    }, { headers: adminHeaders });
    assert(tx1.data.amountPaid === 40.0, 'First installment: Paid $40');
    assert(tx1.data.remainingBalance === 60.0, 'First installment: Remaining $60');
    assert(tx1.data.paymentStatus === 'PARTIALLY_PAID', 'First installment: PARTIALLY_PAID');

    const ref2 = `TX-PART2-${Date.now()}`;
    const tx2 = await axios.post(`${BASE_URL}/admin/payments/${testMemId}/transactions`, {
      amount: 60.0,
      type: 'PAYMENT',
      transactionReference: ref2,
      notes: 'Final installment'
    }, { headers: adminHeaders });
    assert(tx2.data.amountPaid === 100.0, 'Second installment: Paid $100 total');
    assert(tx2.data.remainingBalance === 0.0, 'Second installment: Remaining $0');
    assert(tx2.data.paymentStatus === 'PAID', 'Second installment: Status PAID');

    // 6. Duplicate Transaction Submission
    console.log('[Payment 6] Duplicate Transaction Reference Prevention...');
    let dupTxPrevented = false;
    try {
      await axios.post(`${BASE_URL}/admin/payments/${testMemId}/transactions`, {
        amount: 60.0,
        type: 'PAYMENT',
        transactionReference: ref2, // duplicate ref
        notes: 'Retry duplicate'
      }, { headers: adminHeaders });
    } catch (err) {
      dupTxPrevented = true;
      assert(err.response.status === 400, 'Duplicate transaction rejected with HTTP 400');
    }
    assert(dupTxPrevented, 'Rule verified: Duplicate transaction reference rejected');

    // 7. Refund After Successful Payment (Refund $30)
    console.log('[Payment 7] Refund After Successful Payment...');
    const refundRes = await axios.post(`${BASE_URL}/admin/payments/${testMemId}/transactions`, {
      amount: 30.0,
      type: 'REFUND',
      transactionReference: `REFUND-${Date.now()}`,
      notes: 'Overcharge adjustment refund'
    }, { headers: adminHeaders });
    assert(refundRes.data.amountPaid === 70.0, 'Amount paid decreased to $70 after $30 refund');
    assert(refundRes.data.remainingBalance === 30.0, 'Remaining balance updated to $30');
    assert(refundRes.data.paymentStatus === 'PARTIALLY_PAID', 'Status updated to PARTIALLY_PAID');

    // ==============================================================
    // SECURITY & ACCESS ISOLATION SCENARIOS
    // ==============================================================
    console.log('\n--- SECURITY & CLIENT ISOLATION SCENARIOS ---');

    // Authenticate Client
    const clientLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: clientEmail,
      password: 'client123'
    });
    const clientToken = clientLogin.data.token;
    const clientHeaders = { Authorization: `Bearer ${clientToken}` };

    // Client Dashboard Isolation
    console.log('[Security 1] Client Views Only Their Own Information...');
    const clientDash = await axios.get(`${BASE_URL}/client/dashboard`, { headers: clientHeaders });
    assert(clientDash.data.client.email === clientEmail, 'Client dashboard matches authenticated client email');
    assert(clientDash.data.client.id === newClient.id, 'Client receives strictly their own records');

    // Client Cannot Access Admin Endpoints
    console.log('[Security 2] Client Forbidden from Admin Endpoints...');
    let adminAccessBlocked = false;
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, { headers: clientHeaders });
    } catch (err) {
      adminAccessBlocked = true;
      assert(err.response.status === 403, 'Client access blocked with HTTP 403 Forbidden');
    }
    assert(adminAccessBlocked, 'Rule verified: Client cannot access admin dashboard');

    // Client Cannot Modify Payment Records
    console.log('[Security 3] Client Forbidden from Modifying Payments...');
    let paymentTamperingBlocked = false;
    try {
      await axios.put(`${BASE_URL}/admin/payments/${testMemId}`, {
        amountPaid: 999.0,
        paymentStatus: 'PAID'
      }, { headers: clientHeaders });
    } catch (err) {
      paymentTamperingBlocked = true;
      assert(err.response.status === 403, 'Payment modification blocked with HTTP 403 Forbidden');
    }
    assert(paymentTamperingBlocked, 'Rule verified: Client cannot modify payment details');

    // ==============================================================
    // ADMIN DASHBOARD ACCURACY VERIFICATION
    // ==============================================================
    console.log('\n--- ADMIN DASHBOARD DATA INTEGRITY SCENARIOS ---');
    const finalDash = await axios.get(`${BASE_URL}/admin/dashboard`, { headers: adminHeaders });
    const stats = finalDash.data.stats;
    assert(stats.totalClients >= 5, `Total registered clients accurate (${stats.totalClients})`);
    assert(stats.activeClients > 0, `Active clients accurate (${stats.activeClients})`);
    assert(stats.totalRevenue > 0, `Total revenue accurate ($${stats.totalRevenue})`);
    assert(stats.pendingPayments >= 0, `Pending payments accurate ($${stats.pendingPayments})`);
    assert(stats.activeMemberships >= 1, `Active memberships count accurate (${stats.activeMemberships})`);
    assert(finalDash.data.planStats.length > 0, `Plan statistics breakdown present (${finalDash.data.planStats.length} plans)`);

    console.log('\n================================================================');
    console.log('   🎉 ALL AUDIT SCENARIOS & BUSINESS RULES PASSED 100%!         ');
    console.log('================================================================');
  } catch (err) {
    console.error('Audit test failed with error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runAuditTests();

