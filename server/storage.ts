import { 
  cases, 
  diseases, 
  hpoTerms, 
  analytics,
  physicians,
  type Case, 
  type InsertCase, 
  type Disease, 
  type InsertDisease, 
  type HpoTerm, 
  type InsertHpoTerm,
  type Analytics,
  type InsertAnalytics,
  type Physician,
  type InsertPhysician
} from "@shared/schema";

export interface IStorage {
  // Cases
  getCase(id: number): Promise<Case | undefined>;
  getAllCases(): Promise<Case[]>;
  createCase(caseData: InsertCase): Promise<Case>;
  updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined>;
  deleteCase(id: number): Promise<boolean>;
  
  // Diseases
  getDisease(id: number): Promise<Disease | undefined>;
  getDiseaseByOrphaCode(orphaCode: string): Promise<Disease | undefined>;
  getAllDiseases(): Promise<Disease[]>;
  createDisease(diseaseData: InsertDisease): Promise<Disease>;
  updateDisease(id: number, diseaseData: Partial<InsertDisease>): Promise<Disease | undefined>;
  
  // HPO Terms
  getHpoTerm(id: number): Promise<HpoTerm | undefined>;
  getHpoTermByHpoId(hpoId: string): Promise<HpoTerm | undefined>;
  searchHpoTerms(query: string): Promise<HpoTerm[]>;
  getAllHpoTerms(): Promise<HpoTerm[]>;
  createHpoTerm(hpoTermData: InsertHpoTerm): Promise<HpoTerm>;
  bulkCreateHpoTerms(hpoTermsData: InsertHpoTerm[]): Promise<HpoTerm[]>;
  
  // Analytics
  getAnalytics(): Promise<Analytics | undefined>;
  updateAnalytics(analyticsData: Partial<InsertAnalytics>): Promise<Analytics>;
  
  // Physicians
  getPhysicians(): Promise<Physician[]>;
  getPhysicianByUserId(userId: string): Promise<Physician | undefined>;
  createPhysician(physicianData: InsertPhysician): Promise<Physician>;
  updatePhysician(id: number, physicianData: Partial<InsertPhysician>): Promise<Physician>;
}

export class MemStorage implements IStorage {
  private cases: Map<number, Case> = new Map();
  private diseases: Map<number, Disease> = new Map();
  private hpoTerms: Map<number, HpoTerm> = new Map();
  private physicians: Map<number, Physician> = new Map();
  private analytics: Analytics | null = null;
  private currentCaseId = 1;
  private currentDiseaseId = 1;
  private currentHpoTermId = 1;
  private currentPhysicianId = 1;
  private currentAnalyticsId = 1;

  constructor() {
    // Initialize with default analytics
    this.analytics = {
      id: 1,
      totalCases: 0,
      alertsGenerated: 0,
      diagnosedCases: 0,
      knowledgeBaseSize: 0,
      lastUpdated: new Date()
    };
  }

  // Case methods
  async getCase(id: number): Promise<Case | undefined> {
    return this.cases.get(id);
  }

  async getAllCases(): Promise<Case[]> {
    return Array.from(this.cases.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createCase(caseData: InsertCase): Promise<Case> {
    const now = new Date();
    const newCase: Case = {
      id: this.currentCaseId++,
      ...caseData,
      age: caseData.age || null,
      sex: caseData.sex || null,
      diagnosis: caseData.diagnosis || null,
      orphaCode: caseData.orphaCode || null,
      score: caseData.score || null,
      status: caseData.status || 'active',
      createdAt: now,
      updatedAt: now
    };
    this.cases.set(newCase.id, newCase);
    
    // Update analytics
    if (this.analytics) {
      this.analytics.totalCases++;
      if (caseData.score && caseData.score >= 5) {
        this.analytics.alertsGenerated++;
      }
      if (caseData.status === 'diagnosed') {
        this.analytics.diagnosedCases++;
      }
    }
    
    return newCase;
  }

  async updateCase(id: number, caseData: Partial<InsertCase>): Promise<Case | undefined> {
    const existingCase = this.cases.get(id);
    if (!existingCase) return undefined;
    
    const updatedCase: Case = {
      ...existingCase,
      ...caseData,
      updatedAt: new Date()
    };
    this.cases.set(id, updatedCase);
    
    // Update analytics if status changed to diagnosed
    if (caseData.status === 'diagnosed' && existingCase.status !== 'diagnosed' && this.analytics) {
      this.analytics.diagnosedCases++;
    }
    
    return updatedCase;
  }

  async deleteCase(id: number): Promise<boolean> {
    return this.cases.delete(id);
  }

  // Disease methods
  async getDisease(id: number): Promise<Disease | undefined> {
    return this.diseases.get(id);
  }

  async getDiseaseByOrphaCode(orphaCode: string): Promise<Disease | undefined> {
    return Array.from(this.diseases.values()).find(d => d.orphaCode === orphaCode);
  }

  async getAllDiseases(): Promise<Disease[]> {
    return Array.from(this.diseases.values());
  }

  async createDisease(diseaseData: InsertDisease): Promise<Disease> {
    const now = new Date();
    const newDisease: Disease = {
      id: this.currentDiseaseId++,
      ...diseaseData,
      definition: diseaseData.definition || null,
      prevalence: diseaseData.prevalence || null,
      inheritance: diseaseData.inheritance || null,
      geneReviewsUrl: diseaseData.geneReviewsUrl || null,
      omimId: diseaseData.omimId || null,
      recommendedTests: diseaseData.recommendedTests || null,
      createdAt: now,
      updatedAt: now
    };
    this.diseases.set(newDisease.id, newDisease);
    
    // Update knowledge base size
    if (this.analytics) {
      this.analytics.knowledgeBaseSize++;
    }
    
    return newDisease;
  }

  async updateDisease(id: number, diseaseData: Partial<InsertDisease>): Promise<Disease | undefined> {
    const existingDisease = this.diseases.get(id);
    if (!existingDisease) return undefined;
    
    const updatedDisease: Disease = {
      ...existingDisease,
      ...diseaseData,
      updatedAt: new Date()
    };
    this.diseases.set(id, updatedDisease);
    return updatedDisease;
  }

  // HPO Term methods
  async getHpoTerm(id: number): Promise<HpoTerm | undefined> {
    return this.hpoTerms.get(id);
  }

  async getHpoTermByHpoId(hpoId: string): Promise<HpoTerm | undefined> {
    return Array.from(this.hpoTerms.values()).find(term => term.hpoId === hpoId);
  }

  async searchHpoTerms(query: string): Promise<HpoTerm[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.hpoTerms.values())
      .filter(term => 
        term.label.toLowerCase().includes(lowerQuery) ||
        term.hpoId.toLowerCase().includes(lowerQuery) ||
        (term.synonyms && term.synonyms.some(syn => syn.toLowerCase().includes(lowerQuery)))
      )
      .slice(0, 10); // Limit results
  }

  async getAllHpoTerms(): Promise<HpoTerm[]> {
    return Array.from(this.hpoTerms.values());
  }

  async createHpoTerm(hpoTermData: InsertHpoTerm): Promise<HpoTerm> {
    const newTerm: HpoTerm = {
      id: this.currentHpoTermId++,
      ...hpoTermData,
      definition: hpoTermData.definition || null,
      synonyms: hpoTermData.synonyms || null,
      isObsolete: hpoTermData.isObsolete || false,
      createdAt: new Date()
    };
    this.hpoTerms.set(newTerm.id, newTerm);
    return newTerm;
  }

  async bulkCreateHpoTerms(hpoTermsData: InsertHpoTerm[]): Promise<HpoTerm[]> {
    const terms: HpoTerm[] = [];
    for (const termData of hpoTermsData) {
      const newTerm: HpoTerm = {
        id: this.currentHpoTermId++,
        ...termData,
        definition: termData.definition || null,
        synonyms: termData.synonyms || null,
        isObsolete: termData.isObsolete || false,
        createdAt: new Date()
      };
      this.hpoTerms.set(newTerm.id, newTerm);
      terms.push(newTerm);
    }
    return terms;
  }

  // Analytics methods
  async getAnalytics(): Promise<Analytics | undefined> {
    return this.analytics || undefined;
  }

  async updateAnalytics(analyticsData: Partial<InsertAnalytics>): Promise<Analytics> {
    if (!this.analytics) {
      this.analytics = {
        id: this.currentAnalyticsId++,
        totalCases: 0,
        alertsGenerated: 0,
        diagnosedCases: 0,
        knowledgeBaseSize: 0,
        lastUpdated: new Date()
      };
    }
    
    this.analytics = {
      ...this.analytics,
      ...analyticsData,
      lastUpdated: new Date()
    };
    
    return this.analytics;
  }

  // Physician methods
  async getPhysicians(): Promise<Physician[]> {
    return Array.from(this.physicians.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPhysicianByUserId(userId: string): Promise<Physician | undefined> {
    return Array.from(this.physicians.values()).find(p => p.userId === userId);
  }

  async createPhysician(physicianData: InsertPhysician): Promise<Physician> {
    const now = new Date();
    const physician: Physician = {
      id: this.currentPhysicianId++,
      createdAt: now,
      updatedAt: now,
      ...physicianData
    };
    this.physicians.set(physician.id, physician);
    return physician;
  }

  async updatePhysician(id: number, physicianData: Partial<InsertPhysician>): Promise<Physician> {
    const physician = this.physicians.get(id);
    if (!physician) {
      throw new Error(`Physician with id ${id} not found`);
    }
    const updated = { ...physician, ...physicianData, updatedAt: new Date() };
    this.physicians.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
