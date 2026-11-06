// Phase 1 Logic and Business Rule Verification Test
import { calculateExpiryDate, mockStore } from '../services/api.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- RUNNING PHASE 1 VERIFICATION TESTS ---');

// Test 1: Initial Plans
const plans = mockStore.getPlans();
assert(plans.length >= 3, 'Should have at least 3 initial plans');
const planNames = plans.map(p => p.name.toLowerCase());
assert(planNames.includes('monthly'), 'Should contain Monthly plan');
assert(planNames.includes('quarterly'), 'Should contain Quarterly plan');
assert(planNames.includes('yearly'), 'Should contain Yearly plan');

// Test 2: Automatic Expiry Calculation
const start = '2026-01-15';
assert(calculateExpiryDate(start, 1) === '2026-02-15', 'Monthly expiry calculates correctly');
assert(calculateExpiryDate(start, 3) === '2026-04-15', 'Quarterly expiry calculates correctly');
assert(calculateExpiryDate(start, 12) === '2027-01-15', 'Yearly expiry calculates correctly');

// Test 3: Admin Dashboard Stats
const adminData = mockStore.getAdminDashboardData();
assert(adminData.stats.totalClients > 0, 'Admin sees total clients');
assert(adminData.stats.activeMemberships >= 1, 'Admin sees active memberships');
assert(adminData.stats.totalAmountCollected > 0, 'Admin sees total amount collected');

// Test 4: One Active Membership & Renewal rule
// Client ID 2 (John Doe) already has an active membership
let threwError = false;
try {
  mockStore.assignOrRenewMembership({
    userId: 2,
    planId: 1,
    startDate: '2026-11-01',
    isRenewal: false
  });
} catch (e) {
  threwError = true;
}
assert(threwError, 'Cannot assign new active membership without renewal when active membership exists');

// Now test renewal preserving old record
const previousCount = mockStore.getMemberships().filter(m => m.userId === 2).length;
const renewalResult = mockStore.assignOrRenewMembership({
  userId: 2,
  planId: 3, // Yearly
  startDate: '2026-11-04',
  price: 420, // Agreed custom price
  isRenewal: true
});

const clientMembershipsAfterRenewal = mockStore.getMemberships().filter(m => m.userId === 2);
assert(clientMembershipsAfterRenewal.length === previousCount + 1, 'Previous membership record preserved');
const activeMemberships = clientMembershipsAfterRenewal.filter(m => m.status === 'ACTIVE');
assert(activeMemberships.length === 1, 'Client has strictly ONE active membership after renewal');
assert(activeMemberships[0].price === 420, 'Agreed membership price is stored with record');

// Test 5: Payment calculations
// Update payment for the new membership
const paymentRes = mockStore.updatePayment(renewalResult.membership.id, {
  amountPaid: 300,
  paymentStatus: 'PARTIALLY_PAID'
});
assert(paymentRes.amountPaid === 300, 'Payment amount updated');
assert(paymentRes.paymentStatus === 'PARTIALLY_PAID', 'Payment status set to PARTIALLY_PAID');

const remainingBalance = renewalResult.membership.price - paymentRes.amountPaid;
assert(remainingBalance === 120, `Remaining balance formula correct (420 - 300 = ${remainingBalance})`);

// Test 6: Client Dashboard View
const clientDashboard = mockStore.getClientDashboardData(2);
assert(clientDashboard.client.id === 2, 'Client sees only their own profile');
assert(clientDashboard.currentMembership.price === 420, 'Client sees correct agreed price');
assert(clientDashboard.currentMembership.amountPaid === 300, 'Client sees amount paid');
assert(clientDashboard.currentMembership.remainingBalance === 120, 'Client sees remaining balance');
assert(clientDashboard.currentMembership.paymentStatus === 'PARTIALLY_PAID', 'Client sees payment status');
assert(clientDashboard.membershipHistory.length >= 2, 'Client can see historical preserved records');

console.log('--- ALL PHASE 1 TESTS PASSED SUCCESSFULLY! ---');

