import axios from './frontend/node_modules/axios/index.js';

const BASE_URL = 'http://localhost:8080/api';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('   GYM360 END-TO-END FULL-STACK VERIFICATION TEST    ');
  console.log('====================================================\n');

  try {
    // 1. ADMIN LOGIN
    console.log('[1] Testing Admin Login...');
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@gym360.com',
      password: 'admin123'
    });
    assert(adminLoginRes.status === 200, 'Admin login returned 200 OK');
    const adminToken = adminLoginRes.data.token;
    assert(Boolean(adminToken), 'Admin received valid JWT token');
    assert(adminLoginRes.data.user.role === 'ADMIN', 'Admin role verified');

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 2. ADMIN DASHBOARD STATS
    console.log('\n[2] Testing Admin Dashboard Stats...');
    const dashboardRes = await axios.get(`${BASE_URL}/admin/dashboard`, { headers: adminHeaders });
    assert(dashboardRes.status === 200, 'Admin dashboard returned 200 OK');
    const { stats, clients, plans, detailedMemberships } = dashboardRes.data;
    assert(stats.totalClients >= 4, `Total clients metric present (${stats.totalClients})`);
    assert(stats.activeMemberships >= 1, `Active memberships metric present (${stats.activeMemberships})`);
    assert(stats.totalAmountCollected >= 0, `Total amount collected metric present ($${stats.totalAmountCollected})`);
    assert(plans.length >= 3, `Initial 3 plans loaded (Monthly, Quarterly, Yearly)`);

    // 3. CREATE NEW CLIENT
    console.log('\n[3] Testing Admin Adding New Client...');
    const testEmail = `bruce.${Date.now()}@gymtest.com`;
    const testPhone = '9' + Math.floor(100000000 + Math.random() * 900000000);
    const updatedPhone = '9' + Math.floor(100000000 + Math.random() * 900000000);
    const newClientRes = await axios.post(
      `${BASE_URL}/admin/clients`,
      {
        name: 'Bruce Wayne',
        email: testEmail,
        phone: testPhone,
        password: 'client123'
      },
      { headers: adminHeaders }
    );
    assert(newClientRes.status === 200, 'New client created successfully');
    const newClientId = newClientRes.data.id;
    assert(newClientRes.data.name === 'Bruce Wayne', 'Client name saved correctly');
    assert(newClientRes.data.status === 'ACTIVE', 'Client default status is ACTIVE');

    // 4. EDIT CLIENT
    console.log('\n[4] Testing Admin Editing Client...');
    const editClientRes = await axios.put(
      `${BASE_URL}/admin/clients/${newClientId}`,
      {
        name: 'Bruce Wayne (Batman)',
        email: testEmail,
        phone: updatedPhone,
        status: 'ACTIVE'
      },
      { headers: adminHeaders }
    );
    assert(editClientRes.data.name === 'Bruce Wayne (Batman)', 'Client name updated');
    assert(editClientRes.data.phone === updatedPhone, 'Client phone updated');

    // 5. DEACTIVATE AND ACTIVATE CLIENT
    console.log('\n[5] Testing Deactivate and Activate Client...');
    const deactRes = await axios.patch(
      `${BASE_URL}/admin/clients/${newClientId}/status`,
      {},
      { headers: adminHeaders }
    );
    assert(deactRes.data.status === 'INACTIVE', 'Client status toggled to INACTIVE');

    const reactRes = await axios.patch(
      `${BASE_URL}/admin/clients/${newClientId}/status`,
      {},
      { headers: adminHeaders }
    );
    assert(reactRes.data.status === 'ACTIVE', 'Client status toggled back to ACTIVE');

    // 6. ASSIGN MEMBERSHIP PLAN (Automatic Expiry & Agreed Price)
    console.log('\n[6] Testing Membership Plan Assignment...');
    const quarterlyPlan = plans.find((p) => p.name.toLowerCase() === 'quarterly');
    assert(Boolean(quarterlyPlan), 'Quarterly plan found');

    const assignRes = await axios.post(
      `${BASE_URL}/admin/memberships/assign`,
      {
        userId: newClientId,
        planId: quarterlyPlan.id,
        startDate: '2026-11-04',
        price: 125.0, // Agreed membership price
        isRenewal: false
      },
      { headers: adminHeaders }
    );
    assert(assignRes.status === 200, 'Membership assigned successfully');
    const firstMembership = assignRes.data;
    assert(firstMembership.status === 'ACTIVE', 'New membership is ACTIVE');
    assert(firstMembership.price === 125.0, 'Agreed price stored correctly ($125.0)');
    assert(firstMembership.expiryDate === '2027-02-04', 'Automatic expiry date calculated (3 months from start)');
    assert(firstMembership.paymentStatus === 'UNPAID', 'Initial payment status is UNPAID');
    assert(firstMembership.remainingBalance === 125.0, 'Initial remaining balance equals agreed price');

    // 7. ENFORCE ONLY ONE ACTIVE MEMBERSHIP PER CLIENT
    console.log('\n[7] Testing Validation: Only One Active Membership Allowed...');
    let duplicateRejected = false;
    try {
      await axios.post(
        `${BASE_URL}/admin/memberships/assign`,
        {
          userId: newClientId,
          planId: plans[0].id,
          startDate: '2026-11-04',
          price: plans[0].price,
          isRenewal: false
        },
        { headers: adminHeaders }
      );
    } catch (err) {
      duplicateRejected = true;
      assert(err.response.status >= 400, 'Server rejected duplicate active membership without renewal');
    }
    assert(duplicateRejected, 'Rule verified: Client cannot have multiple active memberships');

    // 8. RENEW MEMBERSHIP (Preserve previous record)
    console.log('\n[8] Testing Renewal with Preserved Records...');
    const yearlyPlan = plans.find((p) => p.name.toLowerCase() === 'yearly');
    const renewalRes = await axios.post(
      `${BASE_URL}/admin/memberships/assign`,
      {
        userId: newClientId,
        planId: yearlyPlan.id,
        startDate: '2026-11-04',
        price: 430.0, // Special renewal agreed price
        isRenewal: true
      },
      { headers: adminHeaders }
    );
    assert(renewalRes.status === 200, 'Membership renewed successfully');
    const renewedMembership = renewalRes.data;
    assert(renewedMembership.status === 'ACTIVE', 'Renewed membership is ACTIVE');
    assert(renewedMembership.planName.toLowerCase() === 'yearly', 'New plan is Yearly');
    assert(renewedMembership.price === 430.0, 'Renewed agreed price stored ($430.0)');

    // 9. UPDATE PAYMENT DETAILS MANUALLY
    console.log('\n[9] Testing Manual Payment Update & Remaining Balance Calculation...');
    const paymentUpdateRes = await axios.put(
      `${BASE_URL}/admin/payments/${renewedMembership.id}`,
      {
        amountPaid: 300.0,
        paymentStatus: 'PARTIALLY_PAID'
      },
      { headers: adminHeaders }
    );
    assert(paymentUpdateRes.status === 200, 'Payment updated successfully');
    const paymentResult = paymentUpdateRes.data;
    assert(paymentResult.amountPaid === 300.0, 'Amount paid updated to $300.0');
    assert(paymentResult.paymentStatus === 'PARTIALLY_PAID', 'Payment status updated to PARTIALLY_PAID');
    const expectedRemaining = 430.0 - 300.0; // 130.0
    assert(
      paymentResult.remainingBalance === expectedRemaining,
      `Remaining balance formula correct (Agreed $430 - Paid $300 = Remaining $${paymentResult.remainingBalance})`
    );

    // 10. CLIENT LOGIN & DATA ISOLATION
    console.log('\n[10] Testing Client Login & Client Dashboard Access...');
    const clientLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'client123'
    });
    assert(clientLoginRes.status === 200, 'Client login successful');
    const clientToken = clientLoginRes.data.token;
    assert(clientLoginRes.data.user.role === 'CLIENT', 'Client role verified');

    const clientHeaders = { Authorization: `Bearer ${clientToken}` };
    const clientDashboardRes = await axios.get(`${BASE_URL}/client/dashboard`, {
      headers: clientHeaders
    });
    assert(clientDashboardRes.status === 200, 'Client dashboard loaded');
    const clientData = clientDashboardRes.data;
    assert(clientData.client.email === testEmail, 'Client accesses ONLY their own information');
    assert(clientData.currentMembership.planName.toLowerCase() === 'yearly', 'Client views active plan name');
    assert(clientData.currentMembership.amountPaid === 300.0, 'Client views amount paid ($300.0)');
    assert(clientData.currentMembership.remainingBalance === 130.0, 'Client views remaining balance ($130.0)');
    assert(clientData.currentMembership.paymentStatus === 'PARTIALLY_PAID', 'Client views payment status');
    assert(clientData.membershipHistory.length === 2, 'Client history contains both current and previous preserved record');

    // 11. SECURITY ENFORCEMENT: Client Cannot Access Admin Endpoints
    console.log('\n[11] Testing Security: Client Forbidden from Admin Endpoints...');
    let adminAccessBlocked = false;
    try {
      await axios.get(`${BASE_URL}/admin/dashboard`, { headers: clientHeaders });
    } catch (err) {
      adminAccessBlocked = true;
      assert(err.response.status === 403, 'Client correctly blocked from Admin Dashboard (HTTP 403 Forbidden)');
    }
    assert(adminAccessBlocked, 'Admin endpoint access strictly forbidden for clients');

    // 12. SECURITY ENFORCEMENT: Client Cannot Modify Payment Details
    console.log('\n[12] Testing Security: Client Cannot Update Payment Details...');
    let paymentUpdateBlocked = false;
    try {
      await axios.put(
        `${BASE_URL}/admin/payments/${renewedMembership.id}`,
        { amountPaid: 430.0, paymentStatus: 'PAID' },
        { headers: clientHeaders }
      );
    } catch (err) {
      paymentUpdateBlocked = true;
      assert(err.response.status === 403, 'Client blocked from updating payments (HTTP 403 Forbidden)');
    }
    assert(paymentUpdateBlocked, 'Payment updates strictly restricted to Admin role only');

    console.log('\n====================================================');
    console.log('   🎉 ALL FULL-STACK E2E TESTS PASSED WITH 100%!     ');
    console.log('====================================================');
  } catch (err) {
    console.error('Test execution failed with error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runE2ETests();
