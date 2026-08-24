import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing database
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.documentTemplate.deleteMany({});
  await prisma.scaleDecision.deleteMany({});
  await prisma.validationReport.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.pilotKPI.deleteMany({});
  await prisma.pilot.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.eligibilityResult.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.challengeKPI.deleteMany({});
  await prisma.evaluationCriterion.deleteMany({});
  await prisma.eligibilityRequirement.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.startupDocument.deleteMany({});
  await prisma.startupSector.deleteMany({});
  await prisma.startupTechnology.deleteMany({});
  await prisma.startup.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const govUser = await prisma.user.create({
    data: {
      email: 'government@govstart.demo',
      name: 'Dr. Ramesh Kumar (Director, Agriculture Dept)',
      passwordHash,
      role: Role.GOVERNMENT,
    },
  });

  const startupUserAgri = await prisma.user.create({
    data: {
      email: 'startup@govstart.demo',
      name: 'Aditya Sen (Founder, AgriWait)',
      passwordHash,
      role: Role.STARTUP,
    },
  });

  const startupUserFarm = await prisma.user.create({
    data: {
      email: 'farmqueue@govstart.demo',
      name: 'Vikram Singh (Founder, FarmQueue)',
      passwordHash,
      role: Role.STARTUP,
    },
  });

  const startupUserCrop = await prisma.user.create({
    data: {
      email: 'cropflow@govstart.demo',
      name: 'Sneha Patel (Founder, CropFlow)',
      passwordHash,
      role: Role.STARTUP,
    },
  });

  const expertUser = await prisma.user.create({
    data: {
      email: 'expert@govstart.demo',
      name: 'Prof. Ananya Rao (IIT Bombay)',
      passwordHash,
      role: Role.EXPERT,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@govstart.demo',
      name: 'GovStart System Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log('Users created.');

  // 3. Create Startups
  const agriWait = await prisma.startup.create({
    data: {
      userId: startupUserAgri.id,
      name: 'AgriWait Solutions',
      location: 'Bengaluru, Karnataka',
      founded: 2024,
      teamSize: 12,
      website: 'https://agriwait.demo',
      profileCompleteness: 95,
      logoUrl: null,
      status: 'APPROVED',
      technologies: {
        create: [
          { name: 'React' },
          { name: 'Python' },
          { name: 'Analytics' },
          { name: 'Queue Management' },
        ],
      },
      sectors: {
        create: [{ name: 'Agriculture' }, { name: 'Logistics' }],
      },
      documents: {
        create: [
          { name: 'DPIIT Startup Recognition', documentUrl: '/docs/dpiit_agriwait.pdf', status: 'APPROVED' },
          { name: 'ISO 27001 Cybersecurity Certificate', documentUrl: '/docs/iso_agriwait.pdf', status: 'APPROVED' },
          { name: 'Financial Audits FY25', documentUrl: '/docs/audit_agriwait.pdf', status: 'APPROVED' },
        ],
      },
    },
  });

  const farmQueue = await prisma.startup.create({
    data: {
      userId: startupUserFarm.id,
      name: 'FarmQueue Technologies',
      location: 'Pune, Maharashtra',
      founded: 2023,
      teamSize: 8,
      website: 'https://farmqueue.demo',
      profileCompleteness: 85,
      logoUrl: null,
      status: 'APPROVED',
      technologies: {
        create: [
          { name: 'Python' },
          { name: 'Queue Management' },
          { name: 'IoT sensors' },
        ],
      },
      sectors: {
        create: [{ name: 'Agriculture' }],
      },
      documents: {
        create: [
          { name: 'DPIIT Startup Recognition', documentUrl: '/docs/dpiit_farmqueue.pdf', status: 'APPROVED' },
          { name: 'Cybersecurity Declaration', documentUrl: '/docs/cyber_farmqueue.pdf', status: 'PENDING' },
        ],
      },
    },
  });

  const cropFlow = await prisma.startup.create({
    data: {
      userId: startupUserCrop.id,
      name: 'CropFlow Systems',
      location: 'Hyderabad, Telangana',
      founded: 2025,
      teamSize: 6,
      website: 'https://cropflow.demo',
      profileCompleteness: 70,
      logoUrl: null,
      status: 'APPROVED',
      technologies: {
        create: [
          { name: 'React' },
          { name: 'Analytics' },
          { name: 'Cloud Dashboard' },
        ],
      },
      sectors: {
        create: [{ name: 'Agriculture' }, { name: 'Supply Chain' }],
      },
      documents: {
        create: [
          { name: 'DPIIT Startup Recognition', documentUrl: '/docs/dpiit_cropflow.pdf', status: 'APPROVED' },
        ],
      },
    },
  });

  console.log('Startups created.');

  // 4. Create Challenges
  const mainChallenge = await prisma.challenge.create({
    data: {
      title: 'Farmer Procurement Waiting-Time Reduction',
      department: 'Department of Agriculture & Farmer Welfare',
      sector: 'Agriculture',
      location: 'Krishi Bhawan, New Delhi (Pilots in 3 Haryana Procurement Centres)',
      description: 'During the harvest season, farmers currently spend several hours (averaging 5.2 hours) waiting in queues to unload and register their grain. This delay results in grain spoilage, transportation inefficiencies, and extreme stress. We seek an intelligent waiting-time management and digital booking system to optimize scheduling, distribute arrivals, and reduce wait times by at least 40%.',
      currentSituation: 'Paper tokens are issued manually. Distribution planning is non-existent, leading to gridlock at the gates.',
      targetUsers: 'Local Farmers, Procurement Centre Managers, Logistics Officers',
      expectedImpact: 'Reduced waiting times, zero grain damage due to exposure, structured logistical workflows, and clear metrics.',
      pilotDuration: 90,
      estimatedBudget: 1000000.00,
      status: 'PUBLISHED',
      createdById: govUser.id,
      requirements: {
        create: [
          { name: 'DPIIT Startup Recognition', description: 'Startup must be registered and recognized by DPIIT, India.', isRequired: true },
          { name: 'Required Technology', description: 'Proven capabilities in queue management software and data analytics.', isRequired: true },
          { name: 'Cybersecurity certification', description: 'Certified ISO 27001 or formal cybersecurity assessment declaration.', isRequired: true },
          { name: 'Previous experience', description: 'Must have deployed at least one similar booking or queue scheduling system in public/private sector.', isRequired: true },
          { name: 'Financial requirement', description: 'Minimum annual turnover of ₹10 lakhs or early-stage VC backing letter.', isRequired: false },
        ],
      },
      criteria: {
        create: [
          { name: 'Technical Feasibility', weight: 0.25 },
          { name: 'Innovation', weight: 0.20 },
          { name: 'Cost Effectiveness', weight: 0.15 },
          { name: 'Scalability', weight: 0.15 },
          { name: 'Security', weight: 0.10 },
          { name: 'Social Impact', weight: 0.15 },
        ],
      },
      kpis: {
        create: [
          { name: 'Average Waiting Time', baseline: '5.2 hours', target: '3.1 hours', unit: 'hours', frequency: 'Daily' },
          { name: 'Budget Utilization', baseline: '0%', target: '100%', unit: 'percentage', frequency: 'Milestone-based' },
          { name: 'User Satisfaction', baseline: '35%', target: '80%', unit: 'percentage', frequency: 'Monthly Survey' },
        ],
      },
    },
  });

  // Create another dummy challenge (e.g. Health records portal)
  const healthChallenge = await prisma.challenge.create({
    data: {
      title: 'Digital Health Records Exchange',
      department: 'Department of Health & Family Welfare',
      sector: 'Healthcare',
      location: 'AIIMS New Delhi',
      description: 'Integrate patient health history securely across rural primary clinics and tertiary hospitals using Unified Health Interface (UHI) protocols.',
      currentSituation: 'Physical papers are carried manually, leading to diagnostic duplication.',
      targetUsers: 'Rural patients, doctors, lab technicians',
      expectedImpact: 'Instant access to patient records, 30% diagnostics cost saving.',
      pilotDuration: 120,
      estimatedBudget: 1500000.00,
      status: 'DRAFT',
      createdById: govUser.id,
      requirements: {
        create: [
          { name: 'DPIIT Startup Recognition', description: 'Must be DPIIT recognized.', isRequired: true },
          { name: 'ABDM Compliance', description: 'Must be certified ABDM (Ayushman Bharat Digital Mission) integrator.', isRequired: true },
        ],
      },
      criteria: {
        create: [
          { name: 'Technical Feasibility', weight: 0.30 },
          { name: 'Security & Privacy', weight: 0.30 },
          { name: 'Cost Effectiveness', weight: 0.20 },
          { name: 'Scalability', weight: 0.20 },
        ],
      },
      kpis: {
        create: [
          { name: 'Record Retrievability Time', baseline: '15 mins', target: 'under 10 secs', unit: 'seconds', frequency: 'Real-time' },
        ],
      },
    },
  });

  console.log('Challenges created.');

  // 5. Create Applications
  // AgriWait application (will go all the way to pilot and scale)
  const appAgriWait = await prisma.application.create({
    data: {
      challengeId: mainChallenge.id,
      startupId: agriWait.id,
      status: 'SELECTED', // AgriWait goes through the whole lifecycle
    },
  });

  // FarmQueue application (staying at EVALUATED)
  const appFarmQueue = await prisma.application.create({
    data: {
      challengeId: mainChallenge.id,
      startupId: farmQueue.id,
      status: 'EVALUATED',
    },
  });

  // CropFlow application (staying at SUBMITTED)
  const appCropFlow = await prisma.application.create({
    data: {
      challengeId: mainChallenge.id,
      startupId: cropFlow.id,
      status: 'SUBMITTED',
    },
  });

  console.log('Applications created.');

  // 6. Create Eligibility Results for Main Challenge
  const reqs = await prisma.eligibilityRequirement.findMany({
    where: { challengeId: mainChallenge.id },
  });

  // AgriWait eligibility results (PASS on all)
  for (const r of reqs) {
    let status = 'PASS';
    let evidence = 'Submitted credential matches details';
    if (r.name.includes('cybersecurity') || r.name.includes('Cybersecurity')) {
      status = 'WARNING'; // For warning demo
      evidence = 'Pending cybersecurity formal certification audit; self-attestation submitted';
    }
    await prisma.eligibilityResult.create({
      data: {
        applicationId: appAgriWait.id,
        requirementId: r.id,
        status,
        evidence,
      },
    });
  }

  // FarmQueue eligibility results (PASS except cybersecurity pending/warning)
  for (const r of reqs) {
    let status = 'PASS';
    let evidence = 'Submitted';
    if (r.name.includes('Cybersecurity')) {
      status = 'WARNING';
      evidence = 'Pending submission';
    }
    await prisma.eligibilityResult.create({
      data: {
        applicationId: appFarmQueue.id,
        requirementId: r.id,
        status,
        evidence,
      },
    });
  }

  // CropFlow eligibility results
  for (const r of reqs) {
    await prisma.eligibilityResult.create({
      data: {
        applicationId: appCropFlow.id,
        requirementId: r.id,
        status: 'PENDING',
        evidence: 'Review in progress',
      },
    });
  }

  console.log('Eligibility Results created.');

  // 7. Expert Evaluations
  // AgriWait: techFeasibility=9, innovation=8, costEffectiveness=8, scalability=9, security=8, socialImpact=10
  // Score: weighted average = 8.74 out of 10 (or 87.4%)
  await prisma.evaluation.create({
    data: {
      applicationId: appAgriWait.id,
      expertId: expertUser.id,
      techFeasibility: 9,
      innovation: 8,
      costEffectiveness: 8,
      scalability: 9,
      security: 8,
      socialImpact: 10,
      score: 8.74,
      comments: 'Excellent dashboard, solid queue distribution algorithm. The farmer mobile interface supports multiple regional languages. Strong deployment track record.',
    },
  });

  // FarmQueue evaluation
  await prisma.evaluation.create({
    data: {
      applicationId: appFarmQueue.id,
      expertId: expertUser.id,
      techFeasibility: 8,
      innovation: 8,
      costEffectiveness: 9,
      scalability: 8,
      security: 7,
      socialImpact: 8,
      score: 8.17,
      comments: 'IoT integration is highly innovative, but requires custom physical sensors which might slow down fast deployment. Costs are competitive.',
    },
  });

  console.log('Expert Evaluations created.');

  // 8. Create Pilot for AgriWait
  const pilot = await prisma.pilot.create({
    data: {
      challengeId: mainChallenge.id,
      startupId: agriWait.id,
      status: 'VALIDATION', // Current stage is validation so user can review validation and scale
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days remaining
      budget: 1000000.00,
      objectives: 'Establish digital booking portal for procurement centres. Track daily arrival schedule and farmer processing time.',
      risks: 'Internet connectivity in rural centers, farmer adoption of regional app, system uptime during peak hours.',
      dataAccess: 'Encrypted read-access to mandi arrival registries via sandboxed API.',
      ipTerms: 'IP belongs to Startup; Government receives perpetual non-exclusive department-wide license for use.',
      cybersecurity: 'ISO 27001 certificate verification, daily system logs monitoring, SSL encryption enforced.',
      currentStage: 'VALIDATION',
    },
  });

  // 9. Pilot KPIs
  await prisma.pilotKPI.create({
    data: {
      pilotId: pilot.id,
      name: 'Average Waiting Time',
      baseline: '5.2 hours',
      target: '3.1 hours',
      current: '3.0 hours',
      unit: 'hours',
      reductionPercentage: 42.3,
      status: 'ACHIEVED',
    },
  });

  await prisma.pilotKPI.create({
    data: {
      pilotId: pilot.id,
      name: 'Budget Utilization',
      baseline: '0%',
      target: '100%',
      current: '80%',
      unit: 'percentage',
      reductionPercentage: 0.0,
      status: 'ON_TRACK',
    },
  });

  await prisma.pilotKPI.create({
    data: {
      pilotId: pilot.id,
      name: 'User Satisfaction',
      baseline: '35%',
      target: '80%',
      current: '87%',
      unit: 'percentage',
      reductionPercentage: 0.0,
      status: 'ACHIEVED',
    },
  });

  console.log('Pilot and KPIs created.');

  // 10. Milestones & Payments
  const m1 = await prisma.milestone.create({
    data: {
      pilotId: pilot.id,
      name: 'System Deployment',
      description: 'Deploy software, configure servers, install tablets at 3 pilot Mandi procurement centres.',
      amount: 200000.00,
      deadline: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      successCriteria: 'System online at all 3 locations, digital ticketing active.',
      evidenceUrl: '/evidence/m1_agriwait_deployment_report.pdf',
      status: 'VERIFIED',
      paymentStatus: 'PAID',
    },
  });

  await prisma.payment.create({
    data: {
      milestoneId: m1.id,
      amount: 200000.00,
      status: 'PAID',
      processedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },
  });

  const m2 = await prisma.milestone.create({
    data: {
      pilotId: pilot.id,
      name: 'Pilot Launch & Training',
      description: 'Conduct training workshops for Mandi officers, distribute farmer outreach pamphlets, execute official booking launch.',
      amount: 300000.00,
      deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      successCriteria: '50% of incoming grain trucks booked online. Training sign-off from all 3 Mandi heads.',
      evidenceUrl: '/evidence/m2_training_completion.pdf',
      status: 'VERIFIED',
      paymentStatus: 'PAID',
    },
  });

  await prisma.payment.create({
    data: {
      milestoneId: m2.id,
      amount: 300000.00,
      status: 'PAID',
      processedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
  });

  // Milestone 3: Under Review
  await prisma.milestone.create({
    data: {
      pilotId: pilot.id,
      name: 'KPI Achievement (40% Queue Reduction)',
      description: 'Demonstrate reduction in wait times to 3.1 hours over a 30-day continuous period.',
      amount: 300000.00,
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      successCriteria: 'Average wait logs below 3.1 hours, validated by digital dashboard analytics.',
      evidenceUrl: '/evidence/m3_kpi_dashboard_logs.pdf',
      status: 'UNDER_REVIEW',
      paymentStatus: 'UNPAID',
    },
  });

  // Milestone 4: Pending
  await prisma.milestone.create({
    data: {
      pilotId: pilot.id,
      name: 'Independent Validation Report',
      description: 'Provide audit results compiled by independent academic or industry experts.',
      amount: 200000.00,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      successCriteria: 'Validation report submitted verifying the target results.',
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    },
  });

  console.log('Milestones & Payments created.');

  // 11. Independent Validation
  await prisma.validationReport.create({
    data: {
      pilotId: pilot.id,
      startupClaim: '45% reduction (from 5.2 to 2.86 hours)',
      systemResult: '43% reduction (from 5.2 to 2.96 hours)',
      independentResult: '43% reduction',
      target: '40% reduction',
      outcome: 'VERIFIED',
      methodology: 'Checked electronic gate logs, cross-referenced with randomized telephone interviews with 150 farmers who visited the Mandi during October-November.',
      observations: 'The system has drastically reduced queue congestion. The primary bottleneck is now physical unloading speed, not token processing. Recommended for scaling.',
      documentUrl: '/validation/agriwait_audit_report.pdf',
      submittedById: expertUser.id,
    },
  });

  console.log('Validation Report created.');

  // 12. Create Document Templates
  const templates = [
    {
      title: 'Problem Statement Template',
      description: 'Standard guidelines for defining government innovation challenges, specifying current conditions and target user base.',
      category: 'CHALLENGE',
      content: '## 1. Executive Summary\nProvide a concise 200-word overview of the issue.\n\n## 2. Current Conditions & Bottlenecks\nDetail the current mechanism and explain why it is failing or inefficient.\n\n## 3. Target User Base\nWho are the key beneficiaries (e.g. citizen group, specific officers)?\n\n## 4. Expected Quantitative Outcome\nSpecify baseline and target metrics (e.g. 30% reduction, double throughput).'
    },
    {
      title: 'Pilot Agreement Template',
      description: 'Model legal template for deploying startups in government sandboxes, defining data security, timelines, and deployment criteria.',
      category: 'PILOT',
      content: '## MEMORANDUM OF PILOT AGREEMENT\n\n**Between:** The Department of Agriculture (hereinafter "The Department") and the selected Startup.\n\n### 1. Scope of Work\nThe startup shall deploy its software sandbox for a period of 90 days at specified locations.\n\n### 2. Intellectual Property Rights\nAll existing IP brought by the Startup remains their sole property. The department receives a non-exclusive license to use the system during the pilot.\n\n### 3. Data Protection & Security\nAll farmer/citizen data processed is confidential. No data shall be sold or exported outside local servers.'
    },
    {
      title: 'Independent Validation Report Template',
      description: 'Structured report format for expert evaluators to document pilot outcomes, validating startup claims against actual metrics.',
      category: 'VALIDATION',
      content: '## INDEPENDENT PILOT VALIDATION REPORT\n\n### 1. Evaluation Target\nVerify startup claims of wait time reduction and budget spend.\n\n### 2. Methodology Applied\n- Quantitative log audits\n- Field interviews\n- Direct observation\n\n### 3. Validation Summary\n- Startup reported KPI achievement: [ ]\n- Independent audited KPI achievement: [ ]\n\n### 4. Recommendation\n[ SCALE / EXTEND / TERMINATE ]'
    }
  ];

  for (const t of templates) {
    await prisma.documentTemplate.create({
      data: t,
    });
  }

  console.log('Templates created.');

  // 13. Create Audits & Notifications
  await prisma.auditLog.create({
    data: {
      action: 'CHALLENGE_CREATED',
      details: 'Challenge "Farmer Procurement Waiting-Time Reduction" created by Dr. Ramesh Kumar',
      performedById: govUser.id,
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'STARTUP_APPLIED',
      details: 'Startup "AgriWait Solutions" submitted application for waiting-time challenge',
      performedById: startupUserAgri.id,
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'ELIGIBILITY_EVALUATED',
      details: 'Eligibility review completed. AgriWait marked CONDITIONALLY ELIGIBLE due to pending cybersecurity audit.',
      performedById: govUser.id,
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'EXPERT_EVALUATION_SUBMITTED',
      details: 'Expert Prof. Ananya Rao submitted evaluation score of 87.4 for AgriWait',
      performedById: expertUser.id,
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'STARTUP_SELECTED',
      details: 'Government officially selected AgriWait Solutions for pilot deployment',
      performedById: govUser.id,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'MILESTONE_APPROVED',
      details: 'Milestone 1: "System Deployment" approved and payment processed (₹2,00,000)',
      performedById: govUser.id,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'INDEPENDENT_VALIDATION_SUBMITTED',
      details: 'Independent validation report submitted by Prof. Ananya Rao. Result: VERIFIED',
      performedById: expertUser.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // Notifications
  await prisma.notification.create({
    data: {
      userId: govUser.id,
      message: 'Independent Validation Report has been submitted for the AgriWait pilot. Ready for Scale-up Decision.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: startupUserAgri.id,
      message: 'Expert evaluator has verified your Milestone 2 deliverables.',
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: expertUser.id,
      message: 'New application assigned for evaluation: FarmQueue Technologies.',
      isRead: false,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
