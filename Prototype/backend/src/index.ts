import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';
import { matchStartups, matchChallengesForStartup } from './services/aiMatcher';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sih26136-govstart-secret-key-12345';

app.use(cors());
app.use(express.json());

// Helper function to log audit trail
async function logAudit(action: string, details: string, userId?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        performedById: userId || null,
      },
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

// Helper function to send notification
async function createNotification(userId: string, message: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Notification creation failed:', error);
  }
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ---------------- AUTH ROUTES ----------------

// Register User
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role, startupName, location, sector } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userRole = role as Role;
    if (userRole === Role.GOVERNMENT) {
      return res.status(403).json({ error: 'Registration for Government Officers is restricted.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: userRole,
      },
    });

    let startupId = null;
    if (userRole === Role.STARTUP) {
      const startup = await prisma.startup.create({
        data: {
          userId: user.id,
          name: startupName || 'New Startup',
          location: location || 'India',
          founded: new Date().getFullYear(),
          teamSize: 1,
          website: 'https://newstartup.demo',
          profileCompleteness: 20,
          sectors: {
            create: sector ? [{ name: sector }] : [],
          },
        },
      });
      startupId = startup.id;
    }

    await logAudit('USER_REGISTERED', `User ${email} registered with role ${role}`, user.id);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, startupId } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login User (with demo auto-fallback)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { startup: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.role === Role.GOVERNMENT && (email !== 'government@govstart.demo' || password !== 'password123')) {
      return res.status(403).json({ error: 'Access denied: Unauthorized government credentials.' });
    }

    // For demo convenience, allow 'password123' or direct password checking
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid && password !== 'password123') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    await logAudit('USER_LOGIN', `User ${email} logged in successfully`, user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        startupId: user.startup?.id || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- CHALLENGES ----------------

// Get all challenges
app.get('/api/challenges', async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        requirements: true,
        criteria: true,
        kpis: true,
        applications: {
          include: {
            startup: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(challenges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Challenge by ID
app.get('/api/challenges/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        requirements: true,
        criteria: true,
        kpis: true,
        applications: {
          include: {
            startup: {
              include: {
                technologies: true,
                sectors: true,
                documents: true,
              },
            },
            evaluations: true,
          },
        },
      },
    });

    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
    res.json(challenge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Challenge (6-step Wizard handler)
app.post('/api/challenges', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.GOVERNMENT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }

  const {
    title,
    department,
    sector,
    location,
    description,
    currentSituation,
    targetUsers,
    expectedImpact,
    pilotDuration,
    estimatedBudget,
    requirements,
    criteria,
    kpis,
    status,
  } = req.body;

  try {
    // 1. Validation for weights
    const weightSum = criteria.reduce((sum: number, c: any) => sum + parseFloat(c.weight), 0);
    // Tolerate rounding issues near 1.0 (e.g. weights as decimals like 0.25 + 0.20 + 0.15 + 0.15 + 0.10 + 0.15 = 1.0)
    if (Math.abs(weightSum - 1.0) > 0.01 && Math.abs(weightSum - 100) > 1) {
      return res.status(400).json({ error: 'Evaluation criteria weights must sum to 100% (or 1.0)' });
    }

    // Convert weights to 0.xx format if entered as percentages
    const formattedCriteria = criteria.map((c: any) => ({
      name: c.name,
      weight: parseFloat(c.weight) > 1 ? parseFloat(c.weight) / 100 : parseFloat(c.weight),
    }));

    const challenge = await prisma.challenge.create({
      data: {
        title,
        department,
        sector,
        location,
        description,
        currentSituation,
        targetUsers,
        expectedImpact,
        pilotDuration: parseInt(pilotDuration),
        estimatedBudget: parseFloat(estimatedBudget),
        status: status || 'PUBLISHED',
        createdById: req.user.id,
        requirements: {
          create: requirements.map((r: any) => ({
            name: r.name,
            description: r.description,
            isRequired: r.isRequired ?? true,
          })),
        },
        criteria: {
          create: formattedCriteria,
        },
        kpis: {
          create: kpis.map((k: any) => ({
            name: k.name,
            baseline: k.baseline,
            target: k.target,
            unit: k.unit,
            frequency: k.frequency,
          })),
        },
      },
    });

    await logAudit('CHALLENGE_CREATED', `Challenge "${title}" published by ${req.user.email}`, req.user.id);
    res.status(201).json(challenge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- STARTUP PROFILE & DOCUMENTS ----------------

// Get all startups
app.get('/api/startups', async (req, res) => {
  try {
    const startups = await prisma.startup.findMany({
      include: {
        technologies: true,
        sectors: true,
        documents: true,
      },
    });
    res.json(startups);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Startup by ID
app.get('/api/startups/:id', async (req, res) => {
  try {
    const startup = await prisma.startup.findUnique({
      where: { id: req.params.id },
      include: {
        technologies: true,
        sectors: true,
        documents: true,
        user: { select: { name: true, email: true } },
      },
    });
    if (!startup) return res.status(404).json({ error: 'Startup not found' });
    res.json(startup);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Startup Profile
app.put('/api/startups/profile', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.STARTUP) {
    return res.status(403).json({ error: 'Only startup users can update profile' });
  }

  const { name, location, founded, teamSize, website, technologies, sectors } = req.body;

  try {
    const startup = await prisma.startup.findUnique({ where: { userId: req.user.id } });
    if (!startup) return res.status(404).json({ error: 'Startup profile not found' });

    // Re-create relations for simplicity of prototype
    await prisma.startupTechnology.deleteMany({ where: { startupId: startup.id } });
    await prisma.startupSector.deleteMany({ where: { startupId: startup.id } });

    const updated = await prisma.startup.update({
      where: { id: startup.id },
      data: {
        name,
        location,
        founded: parseInt(founded),
        teamSize: parseInt(teamSize),
        website,
        profileCompleteness: 90, // Update completeness index
        technologies: {
          create: technologies.map((t: string) => ({ name: t })),
        },
        sectors: {
          create: sectors.map((s: string) => ({ name: s })),
        },
      },
      include: {
        technologies: true,
        sectors: true,
        documents: true,
      },
    });

    await logAudit('STARTUP_PROFILE_UPDATED', `Startup profile ${name} updated`, req.user.id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload Document (Mock)
app.post('/api/startups/documents', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.STARTUP) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }

  const { name, documentUrl } = req.body;

  try {
    const startup = await prisma.startup.findUnique({ where: { userId: req.user.id } });
    if (!startup) return res.status(404).json({ error: 'Startup profile not found' });

    const doc = await prisma.startupDocument.create({
      data: {
        startupId: startup.id,
        name,
        documentUrl: documentUrl || `/docs/${name.toLowerCase().replace(/ /g, '_')}.pdf`,
        status: 'PENDING',
      },
    });

    await logAudit('STARTUP_DOCUMENT_UPLOADED', `Startup uploaded document: ${name}`, req.user.id);
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- AI DISCOVERY MATCHING ----------------

// Get challenge recommendations for logged-in startup
app.get('/api/discovery/startup/recommendations', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.STARTUP) {
    return res.status(403).json({ error: 'Only startup users can get recommended challenges' });
  }

  try {
    const startup = await prisma.startup.findUnique({
      where: { userId: req.user.id },
      include: {
        technologies: true,
        sectors: true,
        documents: true,
      },
    });

    if (!startup) return res.status(404).json({ error: 'Startup profile not found' });

    const challenges = await prisma.challenge.findMany({
      where: { status: 'PUBLISHED' },
      include: { requirements: true, kpis: true },
    });

    const formattedStartup = {
      id: startup.id,
      name: startup.name,
      location: startup.location,
      sectors: startup.sectors.map(s => s.name),
      technologies: startup.technologies.map(t => t.name),
      documents: startup.documents.map(d => ({ name: d.name, status: d.status })),
      description: `${startup.name} specialized in ${startup.sectors.map(s => s.name).join(', ')}. Tech: ${startup.technologies.map(t => t.name).join(', ')}.`,
    };

    const recommendations = matchChallengesForStartup(formattedStartup, challenges);
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/discovery/:challengeId', async (req, res) => {
  const { challengeId } = req.params;

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { requirements: true },
    });

    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const startups = await prisma.startup.findMany({
      include: {
        technologies: true,
        sectors: true,
        documents: true,
      },
    });

    // Adapt data format for matching service
    const formattedChallenge = {
      title: challenge.title,
      description: challenge.description,
      sector: challenge.sector,
      requirements: challenge.requirements.map(r => ({ name: r.name, isRequired: r.isRequired })),
    };

    const formattedStartups = startups.map(s => ({
      id: s.id,
      name: s.name,
      location: s.location,
      sectors: s.sectors.map(sec => sec.name),
      technologies: s.technologies.map(t => t.name),
      documents: s.documents.map(d => ({ name: d.name, status: d.status })),
      description: `${s.name} specialized in ${s.sectors.map(sec => sec.name).join(', ')}. Tech: ${s.technologies.map(t => t.name).join(', ')}.`,
    }));

    const recommendations = matchStartups(formattedChallenge, formattedStartups);
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- APPLICATIONS & ELIGIBILITY ----------------

// Startup apply to Challenge
app.post('/api/applications', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.STARTUP) {
    return res.status(403).json({ error: 'Only startups can apply' });
  }

  const {
    challengeId,
    solutionTitle,
    problemUnderstanding,
    solutionDescription,
    technologyUsed,
    innovation,
    expectedImpact,
    implementationApproach,
    pilotTimeline,
    resourceRequirements,
    expectedKpiResults,
    documents,
    startupInfo,
  } = req.body;

  try {
    const startup = await prisma.startup.findUnique({
      where: { userId: req.user.id },
      include: { documents: true, technologies: true, sectors: true },
    });
    if (!startup) return res.status(404).json({ error: 'Startup profile not found' });

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: { challengeId, startupId: startup.id },
    });
    if (existing) {
      return res.status(400).json({ error: 'You have already applied to this challenge' });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { requirements: true, kpis: true },
    });
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // Update Startup Info if provided (pre-filled edits)
    if (startupInfo) {
      const { name, location, founded, teamSize, website, technologies, sectors } = startupInfo;
      
      await prisma.startup.update({
        where: { id: startup.id },
        data: {
          name: name || startup.name,
          location: location || startup.location,
          founded: founded ? parseInt(founded) : startup.founded,
          teamSize: teamSize ? parseInt(teamSize) : startup.teamSize,
          website: website || startup.website,
        }
      });

      if (Array.isArray(technologies)) {
        await prisma.startupTechnology.deleteMany({ where: { startupId: startup.id } });
        await prisma.startupTechnology.createMany({
          data: technologies.map((t: string) => ({ startupId: startup.id, name: t }))
        });
      }

      if (Array.isArray(sectors)) {
        await prisma.startupSector.deleteMany({ where: { startupId: startup.id } });
        await prisma.startupSector.createMany({
          data: sectors.map((s: string) => ({ startupId: startup.id, name: s }))
        });
      }
    }

    // Generate Padded Sequential Unique Application ID (APP-00124 format)
    const count = await prisma.application.count();
    const appId = `APP-${String(124 + count).padStart(5, '0')}`;

    // Create the Application record
    const application = await prisma.application.create({
      data: {
        appId,
        challengeId,
        startupId: startup.id,
        userId: req.user.id,
        status: 'SUBMITTED',
        solutionTitle,
        problemUnderstanding,
        solutionDescription,
        technologyUsed: Array.isArray(technologyUsed) ? technologyUsed.join(', ') : technologyUsed,
        innovation,
        expectedImpact,
        implementationApproach,
        pilotTimeline: pilotTimeline || {},
        resourceRequirements: resourceRequirements || {},
        expectedKpiResults: expectedKpiResults || {},
        documents: documents || [],
      },
    });

    // Run auto screening logic based on updated profile
    const updatedStartup = await prisma.startup.findUnique({
      where: { id: startup.id },
      include: { documents: true, technologies: true, sectors: true },
    });
    if (!updatedStartup) return res.status(404).json({ error: 'Updated startup profile not found' });

    for (const reqItem of challenge.requirements) {
      let status = 'FAIL';
      let evidence = 'Required evidence document missing in startup profile';
      
      const reqName = reqItem.name.toLowerCase();

      // Check DPIIT Startup recognition certificate
      if (reqName.includes('dpiit') || reqName.includes('recognition')) {
        const doc = updatedStartup?.documents.find(d => d.name.toLowerCase().includes('dpiit') || d.name.toLowerCase().includes('recognition')) ||
                    (documents && documents.find((d: any) => d.name.toLowerCase().includes('dpiit') || d.name.toLowerCase().includes('recognition')));
        if (doc) {
          status = doc.status === 'APPROVED' ? 'PASS' : 'WARNING';
          evidence = `DPIIT Certificate found: ${doc.name} (${doc.status || 'SUBMITTED'})`;
        }
      } 
      // Check Cybersecurity certification
      else if (reqName.includes('cybersecurity') || reqName.includes('security')) {
        const doc = updatedStartup?.documents.find(d => d.name.toLowerCase().includes('cyber') || d.name.toLowerCase().includes('security')) ||
                    (documents && documents.find((d: any) => d.name.toLowerCase().includes('cyber') || d.name.toLowerCase().includes('security')));
        if (doc) {
          status = doc.status === 'APPROVED' ? 'PASS' : 'WARNING';
          evidence = `Cybersecurity audit document found: ${doc.name} (${doc.status || 'SUBMITTED'})`;
        } else {
          status = 'WARNING';
          evidence = 'Self-attestation form submitted; pending formal certificate audit';
        }
      }
      // Check Technologies / Experience
      else if (reqName.includes('technology') || reqName.includes('experience')) {
        const hasTech = updatedStartup?.technologies.some(t => challenge.description.toLowerCase().includes(t.name.toLowerCase()) || reqName.includes(t.name.toLowerCase()));
        if (hasTech) {
          status = 'PASS';
          evidence = `Startup has relevant skills in: ${updatedStartup.technologies.map(t => t.name).join(', ')}`;
        } else {
          status = 'PASS';
          evidence = 'Skills verified based on experience declaration';
        }
      } else {
        status = 'PASS';
        evidence = 'Self-certified requirement matched';
      }

      await prisma.eligibilityResult.create({
        data: {
          applicationId: application.id,
          requirementId: reqItem.id,
          status,
          evidence,
        },
      });
    }

    await logAudit('STARTUP_APPLIED', `Startup ${startup.name} applied to Challenge ${challenge.title} (ID: ${appId})`, req.user.id);
    
    // Create notifications
    await createNotification(req.user.id, `Your application ${appId} for ${challenge.title} has been successfully submitted.`);
    
    const officers = await prisma.user.findMany({ where: { role: Role.GOVERNMENT } });
    for (const gov of officers) {
      await createNotification(gov.id, `New application received for "${challenge.title}" from ${startup.name}.`);
    }

    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch Single Application Detail
app.get('/api/applications/:id', authenticateToken, async (req: any, res) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        challenge: {
          include: {
            requirements: true,
            criteria: true,
            kpis: true,
          }
        },
        startup: {
          include: {
            technologies: true,
            sectors: true,
            documents: true,
            user: { select: { name: true, email: true } },
          }
        },
        eligibilityResults: {
          include: { requirement: true }
        },
        evaluations: {
          include: { expert: { select: { name: true } } }
        },
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Security Check: Startup can only view its own applications
    if (req.user.role === Role.STARTUP) {
      const startup = await prisma.startup.findUnique({ where: { userId: req.user.id } });
      if (!startup || application.startupId !== startup.id) {
        return res.status(403).json({ error: 'Access denied to this application' });
      }
    }

    res.json(application);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Application Status (Workflow State Transitions)
app.put('/api/applications/:id/status', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.GOVERNMENT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Only authorized evaluators can update application status' });
  }

  const { status, explanation } = req.body;
  const validStatuses = [
    'SUBMITTED',
    'ELIGIBILITY_SCREENING',
    'UNDER_EXPERT_EVALUATION',
    'SHORTLISTED',
    'SELECTED_FOR_PILOT',
    'PILOT_ACTIVE',
    'PILOT_COMPLETED',
    'CONDITIONALLY_ELIGIBLE',
    'REJECTED'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { startup: true, challenge: true }
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Status Audit Log
    await logAudit(
      'APPLICATION_STATUS_UPDATED',
      `Application ${application.appId || application.id} status updated to ${status} by ${req.user.name}. ${explanation || ''}`,
      req.user.id
    );

    // Notifications mapping
    let notificationMsg = '';
    switch (status) {
      case 'ELIGIBILITY_SCREENING':
        notificationMsg = `Your application has moved to Eligibility Screening.`;
        break;
      case 'UNDER_EXPERT_EVALUATION':
        notificationMsg = `Your application has been sent for Expert Evaluation.`;
        break;
      case 'SHORTLISTED':
        notificationMsg = `You have been shortlisted.`;
        break;
      case 'SELECTED_FOR_PILOT':
        notificationMsg = `You have been selected for the pilot.`;
        break;
      case 'REJECTED':
        notificationMsg = `Your application was not selected.`;
        break;
      default:
        notificationMsg = `Your application status updated to: ${status.replace(/_/g, ' ')}.`;
    }

    if (notificationMsg) {
      await createNotification(application.startup.userId, notificationMsg);
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch Applications
app.get('/api/applications', authenticateToken, async (req: any, res) => {
  try {
    let applications;

    if (req.user.role === Role.STARTUP) {
      const startup = await prisma.startup.findUnique({ where: { userId: req.user.id } });
      if (!startup) return res.json([]);
      applications = await prisma.application.findMany({
        where: { startupId: startup.id },
        include: {
          challenge: { include: { requirements: true } },
          eligibilityResults: true,
          evaluations: true,
        },
      });
    } else {
      applications = await prisma.application.findMany({
        include: {
          challenge: { include: { requirements: true } },
          startup: { include: { technologies: true, sectors: true, documents: true } },
          eligibilityResults: true,
          evaluations: { include: { expert: { select: { name: true } } } },
        },
      });
    }

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- EXPERT EVALUATIONS ----------------

app.post('/api/evaluations', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.EXPERT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Only expert evaluators can submit scores' });
  }

  const { applicationId, techFeasibility, innovation, costEffectiveness, scalability, security, socialImpact, comments } = req.body;

  try {
    const appRecord = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { challenge: { include: { criteria: true } } },
    });

    if (!appRecord) return res.status(404).json({ error: 'Application not found' });

    // Calculate weighted score based on challenge criteria
    const criteria = appRecord.challenge.criteria;
    let finalScore = 0;

    if (criteria.length > 0) {
      const scoresMap: Record<string, number> = {
        'Technical Feasibility': techFeasibility,
        'Innovation': innovation,
        'Cost Effectiveness': costEffectiveness,
        'Scalability': scalability,
        'Security': security,
        'Social Impact': socialImpact,
        // Fallback names mapping
        'security & privacy': security,
        'technical feasibility': techFeasibility,
        'innovation': innovation,
        'cost effectiveness': costEffectiveness,
        'scalability': scalability,
        'social impact': socialImpact,
      };

      let matchedWeight = 0;
      criteria.forEach((crit) => {
        const key = crit.name.toLowerCase();
        let value = 5; // Default score
        
        // Find matching score
        for (const [sName, sVal] of Object.entries(scoresMap)) {
          if (sName.toLowerCase() === key) {
            value = sVal;
            break;
          }
        }
        finalScore += value * parseFloat(crit.weight.toString());
        matchedWeight += parseFloat(crit.weight.toString());
      });

      // Normalize if weights don't sum to 1.0 (though they should)
      if (matchedWeight > 0) {
        finalScore = (finalScore / matchedWeight);
      }
    } else {
      // Default simple average
      finalScore = (techFeasibility + innovation + costEffectiveness + scalability + security + socialImpact) / 6;
    }

    // Convert to percentage (out of 100) or keep as out of 10.
    // The requirement states overall score e.g. "87.4 / 100" and expert scores out of 10.
    // So if scores are 0-10, the weighted average is out of 10 (e.g. 8.74). We can multiply by 10 to display out of 100.
    // Let's multiply by 10 in DB so it stores out of 100, or store as out of 10 and let UI handle it. Let's store as out of 10 (8.74) as in the seed data.
    const evaluation = await prisma.evaluation.create({
      data: {
        applicationId,
        expertId: req.user.id,
        techFeasibility: parseInt(techFeasibility),
        innovation: parseInt(innovation),
        costEffectiveness: parseInt(costEffectiveness),
        scalability: parseInt(scalability),
        security: parseInt(security),
        socialImpact: parseInt(socialImpact),
        score: finalScore, // e.g. 8.74
        comments,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'EVALUATED' },
    });

    const startupApp = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { startup: true, challenge: true },
    });

    await logAudit('EXPERT_EVALUATION_SUBMITTED', `Expert evaluated startup ${startupApp?.startup.name} for ${startupApp?.challenge.title}. Score: ${finalScore.toFixed(2)}`, req.user.id);
    
    // Notify startup & officers
    if (startupApp) {
      await createNotification(startupApp.startup.userId, `Expert evaluation completed for your application. Score: ${(finalScore * 10).toFixed(1)}/100.`);
      const officers = await prisma.user.findMany({ where: { role: Role.GOVERNMENT } });
      for (const gov of officers) {
        await createNotification(gov.id, `Expert evaluation submitted for "${startupApp.challenge.title}" by ${req.user.name}.`);
      }
    }

    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- PILOTS & SANDBOX ----------------

// Get all pilots
app.get('/api/pilots', async (req, res) => {
  try {
    const pilots = await prisma.pilot.findMany({
      include: {
        challenge: true,
        startup: true,
        kpis: true,
        milestones: { include: { payments: true } },
        validationReports: true,
        scaleDecisions: true,
      },
    });
    res.json(pilots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pilot by ID
app.get('/api/pilots/:id', async (req, res) => {
  try {
    const pilot = await prisma.pilot.findUnique({
      where: { id: req.params.id },
      include: {
        challenge: { include: { createdBy: { select: { name: true } } } },
        startup: { include: { technologies: true, sectors: true } },
        kpis: true,
        milestones: { include: { payments: true }, orderBy: { deadline: 'asc' } },
        validationReports: { include: { submittedBy: { select: { name: true } } } },
        scaleDecisions: { include: { decidedBy: { select: { name: true } } } },
      },
    });
    if (!pilot) return res.status(404).json({ error: 'Pilot not found' });
    res.json(pilot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Launch Pilot / Select Startup
app.post('/api/pilots', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.GOVERNMENT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }

  const {
    applicationId,
    startDate,
    endDate,
    budget,
    objectives,
    risks,
    dataAccess,
    ipTerms,
    cybersecurity,
    milestones, // Array of milestone definitions
  } = req.body;

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { challenge: { include: { kpis: true } }, startup: true },
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Create the Pilot record
    const pilot = await prisma.pilot.create({
      data: {
        applicationId: application.id,
        challengeId: application.challengeId,
        startupId: application.startupId,
        status: 'PLANNED',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: parseFloat(budget),
        objectives,
        risks,
        dataAccess,
        ipTerms,
        cybersecurity,
        currentStage: 'PLANNED',
        // Auto clone KPIs from challenge
        kpis: {
          create: application.challenge.kpis.map((kpi) => ({
            name: kpi.name,
            baseline: kpi.baseline,
            target: kpi.target,
            current: kpi.baseline, // starts at baseline
            unit: kpi.unit,
            status: 'ON_TRACK',
          })),
        },
      },
    });

    // Create the custom milestones if provided
    if (milestones && milestones.length > 0) {
      for (const m of milestones) {
        await prisma.milestone.create({
          data: {
            pilotId: pilot.id,
            name: m.name,
            description: m.description,
            amount: parseFloat(m.amount),
            deadline: new Date(m.deadline),
            successCriteria: m.successCriteria,
            status: 'PENDING',
            paymentStatus: 'UNPAID',
          },
        });
      }
    } else {
      // Default Standard Milestones
      const defaultMilestones = [
        { name: 'System Deployment', description: 'Deploy core code on target testing servers.', amount: parseFloat((pilot.budget.toNumber() * 0.2).toFixed(2)), successCriteria: 'System online verification.' },
        { name: 'Pilot Launch', description: 'Launch system to actual users.', amount: parseFloat((pilot.budget.toNumber() * 0.3).toFixed(2)), successCriteria: 'First 500 bookings.' },
        { name: 'KPI Achievement', description: 'Demonstrate target wait reduction.', amount: parseFloat((pilot.budget.toNumber() * 0.3).toFixed(2)), successCriteria: 'Waiting logs show 40% reduction.' },
        { name: 'Independent Validation', description: 'Expert external verification audit.', amount: parseFloat((pilot.budget.toNumber() * 0.2).toFixed(2)), successCriteria: 'Submission of audit report.' },
      ];

      for (let i = 0; i < defaultMilestones.length; i++) {
        const m = defaultMilestones[i];
        const delayDays = (i + 1) * 20;
        const deadlineDate = new Date(pilot.startDate);
        deadlineDate.setDate(deadlineDate.getDate() + delayDays);

        await prisma.milestone.create({
          data: {
            pilotId: pilot.id,
            name: m.name,
            description: m.description,
            amount: m.amount,
            deadline: deadlineDate,
            successCriteria: m.successCriteria,
            status: 'PENDING',
            paymentStatus: 'UNPAID',
          },
        });
      }
    }

    // Update Application status
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'SELECTED' },
    });

    await logAudit('PILOT_CREATED', `Pilot sandbox established for ${application.startup.name} on "${application.challenge.title}"`, req.user.id);
    
    // Notifications
    await createNotification(application.startup.userId, `Congratulations! Your startup has been selected for the pilot sandbox: "${application.challenge.title}".`);

    res.status(201).json(pilot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update pilot stage
app.put('/api/pilots/:id/stage', authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { currentStage } = req.body;

  try {
    const updated = await prisma.pilot.update({
      where: { id },
      data: { currentStage, status: currentStage },
      include: { startup: true },
    });

    await logAudit('PILOT_STAGE_UPDATED', `Pilot ID ${id} stage changed to ${currentStage}`, req.user.id);
    await createNotification(updated.startup.userId, `Your active pilot stage has been updated to ${currentStage}.`);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update pilot KPI progress (realtime performance)
app.put('/api/pilots/:id/kpis', authenticateToken, async (req: any, res) => {
  const { id } = req.params;
  const { kpis } = req.body; // array of { kpiId, current, reductionPercentage, status }

  try {
    for (const item of kpis) {
      await prisma.pilotKPI.update({
        where: { id: item.kpiId },
        data: {
          current: item.current,
          reductionPercentage: parseFloat(item.reductionPercentage),
          status: item.status,
        },
      });
    }

    await logAudit('PILOT_KPIS_UPDATED', `KPI progress updated for pilot ID ${id}`, req.user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- MILESTONES & PAYMENTS ----------------

// Submit milestone evidence (Startup)
app.post('/api/milestones/:id/evidence', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.STARTUP) {
    return res.status(403).json({ error: 'Only startups can submit evidence' });
  }

  const { id } = req.params;
  const { evidenceUrl } = req.body;

  try {
    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        evidenceUrl: evidenceUrl || `/evidence/upload_${id}.pdf`,
        status: 'UNDER_REVIEW',
      },
      include: { pilot: { include: { challenge: true, startup: true } } },
    });

    await logAudit('MILESTONE_EVIDENCE_SUBMITTED', `Startup AgriWait submitted evidence for milestone "${updated.name}"`, req.user.id);
    
    // Notify Government Officer & Experts
    const govId = updated.pilot.challenge.createdById;
    await createNotification(govId, `Milestone evidence submitted by ${updated.pilot.startup.name} for "${updated.name}".`);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify milestone & release payment (Government/Expert)
app.post('/api/milestones/:id/verify', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.GOVERNMENT && req.user.role !== Role.EXPERT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }

  const { id } = req.params;

  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { pilot: { include: { startup: true } } },
    });

    if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

    // Update status to VERIFIED and paymentStatus to PROCESSING
    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        status: 'VERIFIED',
        paymentStatus: 'PROCESSING',
      },
    });

    // Create a payment record
    const payment = await prisma.payment.create({
      data: {
        milestoneId: id,
        amount: milestone.amount,
        status: 'PENDING',
      },
    });

    await logAudit('MILESTONE_VERIFIED', `Milestone "${milestone.name}" verified. Payment processing initiated.`, req.user.id);
    await createNotification(milestone.pilot.startup.userId, `Your milestone "${milestone.name}" has been VERIFIED. Payment of ₹${milestone.amount.toNumber().toLocaleString('en-IN')} is processing.`);

    res.json({ milestone: updated, payment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process Payment (Admin)
app.post('/api/payments/:id/process', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.ADMIN && req.user.role !== Role.GOVERNMENT) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }

  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { milestone: { include: { pilot: { include: { startup: true } } } } },
    });

    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        processedAt: new Date(),
      },
    });

    // Update milestone payment status
    await prisma.milestone.update({
      where: { id: payment.milestoneId },
      data: { paymentStatus: 'PAID' },
    });

    await logAudit('PAYMENT_PROCESSED', `Payment of ₹${payment.amount.toNumber().toLocaleString('en-IN')} released to ${payment.milestone.pilot.startup.name}`, req.user.id);
    await createNotification(payment.milestone.pilot.startup.userId, `Payment of ₹${payment.amount.toNumber().toLocaleString('en-IN')} has been released to your account.`);

    res.json(updatedPayment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List Payments
app.get('/api/payments', authenticateToken, async (req: any, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        milestone: {
          include: {
            pilot: { include: { startup: true, challenge: true } },
          },
        },
      },
      orderBy: { processedAt: 'desc' },
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- INDEPENDENT VALIDATION ----------------

app.post('/api/validations', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.EXPERT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }

  const { pilotId, startupClaim, systemResult, independentResult, target, outcome, methodology, observations, documentUrl } = req.body;

  try {
    const report = await prisma.validationReport.create({
      data: {
        pilotId,
        startupClaim,
        systemResult,
        independentResult,
        target,
        outcome, // e.g. VERIFIED_TARGET_ACHIEVED, PARTIAL, FAILED
        methodology,
        observations,
        documentUrl: documentUrl || `/validation/report_${pilotId}.pdf`,
        submittedById: req.user.id,
      },
    });

    // Automatically transition pilot currentStage to VALIDATION
    await prisma.pilot.update({
      where: { id: pilotId },
      data: { currentStage: 'VALIDATION', status: 'VALIDATION' },
    });

    const pilotRecord = await prisma.pilot.findUnique({
      where: { id: pilotId },
      include: { challenge: true, startup: true },
    });

    await logAudit('INDEPENDENT_VALIDATION_SUBMITTED', `Independent validation submitted for ${pilotRecord?.startup.name}. Outcome: ${outcome}`, req.user.id);
    
    // Notify Government Officer
    if (pilotRecord) {
      await createNotification(pilotRecord.challenge.createdById, `Independent Validation Report has been submitted for the "${pilotRecord.startup.name}" pilot sandbox. Status: ${outcome}.`);
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- SCALE-UP DECISIONS ----------------

app.post('/api/decisions', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.GOVERNMENT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Unauthorized role' });
  }

  const { pilotId, decision, reason, proposedScope } = req.body;

  try {
    const scaleDecision = await prisma.scaleDecision.create({
      data: {
        pilotId,
        decision, // SCALE, EXTEND_PILOT, STOP
        reason,
        proposedScope,
        decidedById: req.user.id,
      },
    });

    // Mark pilot as COMPLETED
    await prisma.pilot.update({
      where: { id: pilotId },
      data: { currentStage: 'COMPLETED', status: 'COMPLETED' },
    });

    const pilotRecord = await prisma.pilot.findUnique({
      where: { id: pilotId },
      include: { startup: true, challenge: true },
    });

    await logAudit('SCALE_DECISION_MADE', `Scale-up decision logged for ${pilotRecord?.startup.name} - Action: ${decision}`, req.user.id);
    
    if (pilotRecord) {
      await createNotification(pilotRecord.startup.userId, `Procurement Committee has published the final decision: "${decision}". Reason: ${reason}`);
    }

    res.json(scaleDecision);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- TEMPLATES & NOTIFICATIONS & LOGS ----------------

// Get Document Templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await prisma.documentTemplate.findMany({});
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Notifications
app.get('/api/notifications', authenticateToken, async (req: any, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark Notification as read
app.post('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Audit Logs
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { performedBy: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100, // Cap at 100
    });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Global Analytics (Admin/Government dashboard aggregation)
app.get('/api/analytics', async (req, res) => {
  try {
    const challengeCount = await prisma.challenge.count();
    const startupCount = await prisma.startup.count();
    const appCount = await prisma.application.count();
    const pilotCount = await prisma.pilot.count({});
    const activePilots = await prisma.pilot.count({ where: { status: 'ACTIVE' } });
    const validationCount = await prisma.validationReport.count();
    const scaleDecisions = await prisma.scaleDecision.findMany();
    
    const scaledCount = scaleDecisions.filter(d => d.decision === 'SCALE').length;
    const extendCount = scaleDecisions.filter(d => d.decision === 'EXTEND_PILOT').length;
    const stopCount = scaleDecisions.filter(d => d.decision === 'STOP').length;

    // Sector breakdown
    const sectors = await prisma.startupSector.findMany();
    const sectorStats: Record<string, number> = {};
    sectors.forEach(s => {
      sectorStats[s.name] = (sectorStats[s.name] || 0) + 1;
    });

    res.json({
      totalChallenges: challengeCount,
      totalStartups: startupCount,
      totalApplications: appCount,
      totalPilots: pilotCount,
      activePilots,
      totalValidations: validationCount,
      scaleRate: pilotCount > 0 ? (scaledCount / pilotCount) * 100 : 0,
      decisionStats: {
        scale: scaledCount,
        extend: extendCount,
        stop: stopCount,
      },
      sectorBreakdown: Object.entries(sectorStats).map(([name, count]) => ({ name, value: count })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a Challenge (Government/Admin)
app.delete('/api/challenges/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== Role.GOVERNMENT && req.user.role !== Role.ADMIN) {
    return res.status(403).json({ error: 'Only government officers or admins can delete challenges' });
  }

  const { id } = req.params;

  try {
    const applications = await prisma.application.findMany({
      where: { challengeId: id },
    });
    const appIds = applications.map((a) => a.id);

    // Cascade deletes in DB order (parent deletes will automatically cascade-delete payments, milestones, and KPIs):
    await prisma.pilot.deleteMany({
      where: { applicationId: { in: appIds } },
    });
    await prisma.eligibilityResult.deleteMany({
      where: { applicationId: { in: appIds } },
    });
    await prisma.evaluation.deleteMany({
      where: { applicationId: { in: appIds } },
    });
    await prisma.application.deleteMany({
      where: { challengeId: id },
    });
    await prisma.eligibilityRequirement.deleteMany({
      where: { challengeId: id },
    });
    await prisma.evaluationCriterion.deleteMany({
      where: { challengeId: id },
    });
    await prisma.challengeKPI.deleteMany({
      where: { challengeId: id },
    });
    await prisma.challenge.delete({
      where: { id },
    });

    await logAudit('CHALLENGE_DELETED', `Challenge ${id} deleted by ${req.user.email}`, req.user.id);
    res.json({ message: 'Challenge and all associated data deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw an Application (Startup/Government)
app.delete('/api/applications/:id', authenticateToken, async (req: any, res) => {
  const { id } = req.params;

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { startup: true },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (req.user.role === Role.STARTUP && application.startup.userId !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to withdraw this application' });
    }

    // Cascade deletes for application details:
    await prisma.pilot.deleteMany({
      where: { applicationId: id },
    });
    await prisma.eligibilityResult.deleteMany({
      where: { applicationId: id },
    });
    await prisma.evaluation.deleteMany({
      where: { applicationId: id },
    });
    await prisma.application.delete({
      where: { id },
    });

    await logAudit('APPLICATION_WITHDRAWN', `Application ${id} withdrawn by ${req.user.email}`, req.user.id);
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------- BOOT SERVER ----------------

app.listen(PORT, () => {
  console.log(`GovStart backend listening on port ${PORT}`);
});
