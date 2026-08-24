export type Role = 'GOVERNMENT' | 'STARTUP' | 'EXPERT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  startupId?: string | null;
}

export interface Startup {
  id: string;
  userId: string;
  name: string;
  location: string;
  founded: number;
  teamSize: number;
  website: string;
  profileCompleteness: number;
  status: string;
  technologies: { name: string }[];
  sectors: { name: string }[];
  documents: StartupDocument[];
}

export interface StartupDocument {
  id: string;
  name: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface EligibilityRequirement {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
}

export interface ChallengeKPI {
  id: string;
  name: string;
  baseline: string;
  target: string;
  unit: string;
  frequency: string;
}

export interface Challenge {
  id: string;
  title: string;
  department: string;
  sector: string;
  location: string;
  description: string;
  currentSituation: string;
  targetUsers: string;
  expectedImpact: string;
  pilotDuration: number;
  estimatedBudget: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdById: string;
  createdAt: string;
  requirements: EligibilityRequirement[];
  criteria: EvaluationCriterion[];
  kpis: ChallengeKPI[];
  applications?: Application[];
}

export interface EligibilityResult {
  id: string;
  applicationId: string;
  requirementId: string;
  requirement: EligibilityRequirement;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'PENDING';
  evidence: string | null;
}

export interface Evaluation {
  id: string;
  applicationId: string;
  expertId: string;
  techFeasibility: number;
  innovation: number;
  costEffectiveness: number;
  scalability: number;
  security: number;
  socialImpact: number;
  score: number;
  comments: string;
  expert?: { name: string };
  createdAt: string;
}

export interface Application {
  id: string;
  appId?: string | null;
  challengeId: string;
  challenge: Challenge;
  startupId: string;
  startup: Startup;
  userId?: string | null;
  status: 
    | 'SUBMITTED'
    | 'ELIGIBILITY_SCREENING'
    | 'UNDER_EXPERT_EVALUATION'
    | 'SHORTLISTED'
    | 'SELECTED_FOR_PILOT'
    | 'PILOT_ACTIVE'
    | 'PILOT_COMPLETED'
    | 'CONDITIONALLY_ELIGIBLE'
    | 'REJECTED'
    | 'ELIGIBILITY_SCREENED'
    | 'EVALUATED'
    | 'SELECTED';
  submittedAt: string;
  createdAt?: string;
  solutionTitle?: string | null;
  problemUnderstanding?: string | null;
  solutionDescription?: string | null;
  technologyUsed?: string | null;
  innovation?: string | null;
  expectedImpact?: string | null;
  implementationApproach?: string | null;
  pilotTimeline?: any;
  resourceRequirements?: any;
  expectedKpiResults?: any;
  documents?: any;
  eligibilityResults: EligibilityResult[];
  evaluations: Evaluation[];
}

export interface PilotKPI {
  id: string;
  name: string;
  baseline: string;
  target: string;
  current: string;
  unit: string;
  reductionPercentage: number;
  status: 'ON_TRACK' | 'ACHIEVED' | 'BEHIND';
}

export interface Payment {
  id: string;
  milestoneId: string;
  amount: number;
  status: 'PENDING' | 'PAID';
  processedAt: string | null;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  amount: number;
  deadline: string;
  successCriteria: string;
  evidenceUrl: string | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED';
  paymentStatus: 'UNPAID' | 'PROCESSING' | 'PAID';
  payments: Payment[];
}

export interface ValidationReport {
  id: string;
  pilotId: string;
  startupClaim: string;
  systemResult: string;
  independentResult: string;
  target: string;
  outcome: 'VERIFIED' | 'PARTIAL' | 'FAILED';
  methodology: string;
  observations: string;
  documentUrl: string | null;
  submittedAt: string;
  submittedBy: { name: string };
}

export interface ScaleDecision {
  id: string;
  pilotId: string;
  decision: 'SCALE' | 'EXTEND_PILOT' | 'STOP';
  reason: string;
  proposedScope: string | null;
  decidedBy: { name: string };
  decidedAt: string;
}

export interface Pilot {
  id: string;
  challengeId: string;
  challenge: Challenge;
  startupId: string;
  startup: Startup;
  status: 'PLANNED' | 'ACTIVE' | 'REVIEW' | 'VALIDATION' | 'COMPLETED';
  startDate: string;
  endDate: string;
  budget: number;
  objectives: string;
  risks: string;
  dataAccess: string;
  ipTerms: string;
  cybersecurity: string;
  currentStage: 'PLANNED' | 'ACTIVE' | 'REVIEW' | 'VALIDATION' | 'COMPLETED';
  kpis: PilotKPI[];
  milestones: Milestone[];
  validationReports: ValidationReport[];
  scaleDecisions: ScaleDecision[];
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy?: { name: string; email: string; role: Role } | null;
  createdAt: string;
}

export interface MatchResult {
  startupId: string;
  name: string;
  score: number;
  isEligible: boolean;
  eligibilityStatus: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  reasons: string[];
  technologies: string[];
  location: string;
}
