import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
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

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Disease = typeof diseases.$inferSelect;
export type InsertDisease = z.infer<typeof insertDiseaseSchema>;
export type Physician = typeof physicians.$inferSelect;
export type InsertPhysician = z.infer<typeof insertPhysicianSchema>;

export const insertHpoTermSchema = createInsertSchema(hpoTerms).omit({
  id: true,
  createdAt: true
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  lastUpdated: true
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Disease = typeof diseases.$inferSelect;
export type InsertDisease = z.infer<typeof insertDiseaseSchema>;
export type HpoTerm = typeof hpoTerms.$inferSelect;
export type InsertHpoTerm = z.infer<typeof insertHpoTermSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
