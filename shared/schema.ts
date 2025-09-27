import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(), // De-identified patient ID
  age: integer("age"),
  sex: text("sex"),
  symptoms: jsonb("symptoms").$type<Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>>().notNull(),
  diagnosis: text("diagnosis"),
  orphaCode: text("orpha_code"),
  score: real("score"),
  status: text("status").notNull().default("active"), // active, diagnosed, closed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const diseases = pgTable("diseases", {
  id: serial("id").primaryKey(),
  orphaCode: text("orpha_code").notNull().unique(),
  name: text("name").notNull(),
  definition: text("definition"),
  prevalence: text("prevalence"),
  inheritance: text("inheritance"),
  phenotypes: jsonb("phenotypes").$type<Array<{
    hpoId: string;
    label: string;
    frequency: string;
  }>>().notNull(),
  geneReviewsUrl: text("gene_reviews_url"),
  omimId: text("omim_id"),
  recommendedTests: jsonb("recommended_tests").$type<Array<{
    test: string;
    description: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const hpoTerms = pgTable("hpo_terms", {
  id: serial("id").primaryKey(),
  hpoId: text("hpo_id").notNull().unique(),
  label: text("label").notNull(),
  definition: text("definition"),
  synonyms: jsonb("synonyms").$type<string[]>(),
  isObsolete: boolean("is_obsolete").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  totalCases: integer("total_cases").default(0),
  alertsGenerated: integer("alerts_generated").default(0),
  diagnosedCases: integer("diagnosed_cases").default(0),
  knowledgeBaseSize: integer("knowledge_base_size").default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});

export const insertCaseSchema = createInsertSchema(cases).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDiseaseSchema = createInsertSchema(diseases).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Physician profile table for personal accounts and affiliations
export const physicians = pgTable("physicians", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  licenseNumber: text("license_number"),
  specialty: text("specialty"),
  subSpecialty: text("sub_specialty"),
  hospitalAffiliation: text("hospital_affiliation"),
  clinicName: text("clinic_name"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  yearsOfExperience: integer("years_of_experience"),
  boardCertifications: jsonb("board_certifications").$type<string[]>(),
  researchInterests: jsonb("research_interests").$type<string[]>(),
  publications: jsonb("publications").$type<string[]>(),
  professionalMemberships: jsonb("professional_memberships").$type<string[]>(),
  emergencyContact: text("emergency_contact"),
  preferredReferralCenters: jsonb("preferred_referral_centers").$type<string[]>(),
  geneticsTraining: text("genetics_training"),
  rareDiseaseFocus: jsonb("rare_disease_focus").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPhysicianSchema = createInsertSchema(physicians).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertHpoTermSchema = createInsertSchema(hpoTerms).omit({
  id: true,
  createdAt: true
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  lastUpdated: true
});

// Laboratory Test Confirmation Tables
export const diseaseMarkers = pgTable("disease_markers", {
  id: serial("id").primaryKey(),
  orphaCode: text("orpha_code").notNull(),
  diseaseName: text("disease_name").notNull(),
  markerName: text("marker_name").notNull(),
  markerType: text("marker_type").notNull(), // 'biochemical', 'genetic', 'metabolic', 'immunologic'
  testMethod: text("test_method"), // 'serum', 'plasma', 'urine', 'csf', 'dried_blood_spot'
  normalRange: text("normal_range"),
  abnormalRange: text("abnormal_range"),
  units: text("units"),
  sensitivity: text("sensitivity"), // % or description
  specificity: text("specificity"), // % or description
  clinicalSignificance: text("clinical_significance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testConfirmations = pgTable("test_confirmations", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => cases.id),
  orphaCode: text("orpha_code").notNull(),
  diseaseName: text("disease_name").notNull(),
  markerId: integer("marker_id").references(() => diseaseMarkers.id),
  markerName: text("marker_name").notNull(),
  patientValue: text("patient_value"),
  units: text("units"),
  normalRange: text("normal_range"),
  interpretation: text("interpretation"), // 'normal', 'abnormal_high', 'abnormal_low', 'critical'
  confirmationStatus: text("confirmation_status").default("pending"), // 'pending', 'confirmed', 'ruled_out'
  physicianNotes: text("physician_notes"),
  testDate: timestamp("test_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDiseaseMarkerSchema = createInsertSchema(diseaseMarkers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertTestConfirmationSchema = createInsertSchema(testConfirmations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Disease = typeof diseases.$inferSelect;
export type InsertDisease = z.infer<typeof insertDiseaseSchema>;
export type Physician = typeof physicians.$inferSelect;
export type InsertPhysician = z.infer<typeof insertPhysicianSchema>;
export type HpoTerm = typeof hpoTerms.$inferSelect;
export type InsertHpoTerm = z.infer<typeof insertHpoTermSchema>;
export type Analytics = typeof analytics.$inferSelect;

// Community Features for iGEM 2025 Competition

// 1. Crowdsourced Case Repository
export const crowdsourcedCases = pgTable("crowdsourced_cases", {
  id: serial("id").primaryKey(),
  anonymousId: varchar("anonymous_id", { length: 50 }).notNull(), // Anonymized physician ID
  country: varchar("country", { length: 100 }),
  region: varchar("region", { length: 100 }),
  symptoms: jsonb("symptoms").$type<Array<{ hpoId: string; label: string; frequency?: string }>>().notNull(),
  confirmedDiagnosis: varchar("confirmed_diagnosis", { length: 200 }),
  orphaCode: varchar("orpha_code", { length: 20 }),
  icdCode: varchar("icd_code", { length: 20 }),
  diagnosticJourney: text("diagnostic_journey"), // Timeline and process description
  outcome: varchar("outcome", { length: 50 }), // "confirmed", "differential", "unresolved"
  timeToConfirmation: integer("time_to_confirmation"), // Days from symptom onset
  contributionDate: timestamp("contribution_date").defaultNow(),
  isPublic: boolean("is_public").default(true),
  upvotes: integer("upvotes").default(0),
  difficulty: varchar("difficulty", { length: 20 }).default("medium"), // "easy", "medium", "hard", "expert"
  ageGroup: varchar("age_group", { length: 20 }), // "pediatric", "adult", "elderly"
  sex: varchar("sex", { length: 10 }), // "male", "female", "unknown"
});

// 2. Global Phenotype Mapping
export const phenotypeMapping = pgTable("phenotype_mapping", {
  id: serial("id").primaryKey(),
  hpoId: varchar("hpo_id", { length: 20 }).notNull(),
  hpoLabel: varchar("hpo_label", { length: 200 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }),
  frequency: integer("frequency").default(1), // Number of reported cases
  prevalence: decimal("prevalence", { precision: 10, scale: 6 }), // Per 100,000 population
  lastUpdated: timestamp("last_updated").defaultNow(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
});

// 3. Collaborative Diagnostic Challenges
export const diagnosticChallenges = pgTable("diagnostic_challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  symptoms: jsonb("symptoms").$type<Array<{ hpoId: string; label: string; frequency?: string }>>().notNull(),
  additionalInfo: text("additional_info"), // Lab results, imaging, family history
  createdBy: varchar("created_by", { length: 50 }).notNull(), // Anonymous physician ID
  createdDate: timestamp("created_date").defaultNow(),
  status: varchar("status", { length: 20 }).default("active"), // "active", "solved", "archived"
  difficulty: varchar("difficulty", { length: 20 }).default("medium"),
  correctDiagnosis: varchar("correct_diagnosis", { length: 200 }),
  correctOrphaCode: varchar("correct_orpha_code", { length: 20 }),
  solvedBy: varchar("solved_by", { length: 50 }),
  solvedDate: timestamp("solved_date"),
  participantCount: integer("participant_count").default(0),
  ageGroup: varchar("age_group", { length: 20 }),
  sex: varchar("sex", { length: 10 }),
  country: varchar("country", { length: 100 }),
});

// Challenge Responses/Discussions
export const challengeResponses = pgTable("challenge_responses", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").references(() => diagnosticChallenges.id).notNull(),
  physicianId: varchar("physician_id", { length: 50 }).notNull(), // Anonymous physician ID
  suggestedDiagnosis: varchar("suggested_diagnosis", { length: 200 }).notNull(),
  orphaCode: varchar("orpha_code", { length: 20 }),
  reasoning: text("reasoning").notNull(),
  confidence: integer("confidence"), // 1-100 scale
  submittedDate: timestamp("submitted_date").defaultNow(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  isCorrect: boolean("is_correct"),
  country: varchar("country", { length: 100 }),
});

// Community Statistics and Leaderboards
export const communityStats = pgTable("community_stats", {
  id: serial("id").primaryKey(),
  totalContributions: integer("total_contributions").default(0),
  totalParticipants: integer("total_participants").default(0),
  totalCountries: integer("total_countries").default(0),
  totalChallengesSolved: integer("total_challenges_solved").default(0),
  avgDiagnosticAccuracy: decimal("avg_diagnostic_accuracy", { precision: 5, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Physician Community Profiles (Anonymous)
export const physicianProfiles = pgTable("physician_profiles", {
  id: serial("id").primaryKey(),
  anonymousId: varchar("anonymous_id", { length: 50 }).notNull().unique(),
  country: varchar("country", { length: 100 }),
  specialty: varchar("specialty", { length: 100 }),
  experienceYears: integer("experience_years"),
  contributionScore: integer("contribution_score").default(0),
  challengesSolved: integer("challenges_solved").default(0),
  casesContributed: integer("cases_contributed").default(0),
  accuracyRate: decimal("accuracy_rate", { precision: 5, scale: 2 }),
  joinedDate: timestamp("joined_date").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
  badges: jsonb("badges").$type<Array<string>>().default([]),
});

export type CrowdsourcedCase = typeof crowdsourcedCases.$inferSelect;
export type InsertCrowdsourcedCase = typeof crowdsourcedCases.$inferInsert;
export type PhenotypeMapping = typeof phenotypeMapping.$inferSelect;
export type InsertPhenotypeMapping = typeof phenotypeMapping.$inferInsert;
export type DiagnosticChallenge = typeof diagnosticChallenges.$inferSelect;
export type InsertDiagnosticChallenge = typeof diagnosticChallenges.$inferInsert;
export type ChallengeResponse = typeof challengeResponses.$inferSelect;
export type InsertChallengeResponse = typeof challengeResponses.$inferInsert;
export type CommunityStats = typeof communityStats.$inferSelect;
export type PhysicianProfile = typeof physicianProfiles.$inferSelect;
export type InsertPhysicianProfile = typeof physicianProfiles.$inferInsert;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type DiseaseMarker = typeof diseaseMarkers.$inferSelect;
export type InsertDiseaseMarker = z.infer<typeof insertDiseaseMarkerSchema>;
export type TestConfirmation = typeof testConfirmations.$inferSelect;
export type InsertTestConfirmation = z.infer<typeof insertTestConfirmationSchema>;
