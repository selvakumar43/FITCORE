// Initial Mock Data for GYM360 (Phase 1)
// Aligned with backend entities: User, MembershipPlan, Membership, Payment

export const initialUsers = [
  {
    id: 1,
    name: "Alex Carter (Admin)",
    email: "admin@gym360.com",
    phone: "9876543210",
    role: "ADMIN",
    status: "ACTIVE",
    password: "admin123"
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@example.com",
    phone: "9123456780",
    role: "CLIENT",
    status: "ACTIVE",
    password: "client123"
  },
  {
    id: 3,
    name: "Sarah Connor",
    email: "sarah@example.com",
    phone: "9234567891",
    role: "CLIENT",
    status: "ACTIVE",
    password: "client123"
  },
  {
    id: 4,
    name: "Mike Tyson",
    email: "mike@example.com",
    phone: "9345678912",
    role: "CLIENT",
    status: "ACTIVE",
    password: "client123"
  },
  {
    id: 5,
    name: "Emily Watson",
    email: "emily@example.com",
    phone: "9456789123",
    role: "CLIENT",
    status: "INACTIVE",
    password: "client123"
  }
];

export const initialPlans = [
  {
    id: 1,
    name: "Monthly",
    durationMonths: 1,
    price: 50,
    description: "Standard gym access for 30 days."
  },
  {
    id: 2,
    name: "Quarterly",
    durationMonths: 3,
    price: 130,
    description: "Full gym access for 90 days with discount."
  },
  {
    id: 3,
    name: "Yearly",
    durationMonths: 12,
    price: 450,
    description: "Full gym access for 365 days best value."
  }
];

export const initialMemberships = [
  {
    id: 101,
    userId: 2, // John Doe
    planId: 2, // Quarterly
    startDate: "2026-10-01",
    expiryDate: "2027-01-01",
    status: "ACTIVE",
    price: 130
  },
  {
    id: 102,
    userId: 3, // Sarah Connor
    planId: 1, // Monthly
    startDate: "2026-10-20",
    expiryDate: "2026-11-20",
    status: "ACTIVE",
    price: 50
  },
  {
    id: 103,
    userId: 4, // Mike Tyson (Expired previous membership)
    planId: 1, // Monthly
    startDate: "2026-09-01",
    expiryDate: "2026-10-01",
    status: "EXPIRED",
    price: 50
  }
];

export const initialPayments = [
  {
    id: 201,
    membershipId: 101,
    amountPaid: 130,
    paymentStatus: "PAID",
    updatedAt: "2026-10-01"
  },
  {
    id: 202,
    membershipId: 102,
    amountPaid: 30,
    paymentStatus: "PARTIALLY_PAID",
    updatedAt: "2026-10-20"
  },
  {
    id: 203,
    membershipId: 103,
    amountPaid: 50,
    paymentStatus: "PAID",
    updatedAt: "2026-09-01"
  }
];

