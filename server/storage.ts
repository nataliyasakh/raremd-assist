import { 
  cases, 
  diseases, 
  hpoTerms, 
  analytics,
  physicians,
  crowdsourcedCases,
  phenotypeMapping,
  diagnosticChallenges,
  challengeResponses,
  communityStats,
  physicianProfiles,
  type Case, 
  type InsertCase, 
  type Disease, 
  type InsertDisease, 
  type HpoTerm, 
  type InsertHpoTerm,
  type Analytics,
  type InsertAnalytics,
  type Physician,
  type InsertPhysician,
  type TestConfirmation,
  type InsertTestConfirmation,
  type CrowdsourcedCase,
  type InsertCrowdsourcedCase,
  type PhenotypeMapping,
  type InsertPhenotypeMapping,
  type DiagnosticChallenge,
  type InsertDiagnosticChallenge,
  type ChallengeResponse,
  type InsertChallengeResponse,
  type CommunityStats,
  type PhysicianProfile,
  type InsertPhysicianProfile
} from "@shared/schema";
import { generateFakeCrowdsourcedCases } from "./services/fake-cases-generator";

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
  
  // Community Features - iGEM 2025
  
  // Crowdsourced Cases
  getCrowdsourcedCase(id: number): Promise<CrowdsourcedCase | undefined>;
  getAllCrowdsourcedCases(filters?: { 
    search?: string; 
    difficulty?: string; 
    outcome?: string; 
    country?: string; 
  }): Promise<CrowdsourcedCase[]>;
  createCrowdsourcedCase(caseData: InsertCrowdsourcedCase): Promise<CrowdsourcedCase>;
  upvoteCrowdsourcedCase(id: number): Promise<boolean>;
  
  // Phenotype Mapping
  getPhenotypeMapping(filters?: { 
    search?: string; 
    country?: string; 
  }): Promise<PhenotypeMapping[]>;
  createPhenotypeMapping(mappingData: InsertPhenotypeMapping): Promise<PhenotypeMapping>;
  updatePhenotypeFrequency(hpoId: string, country: string): Promise<boolean>;
  
  // Diagnostic Challenges
  getDiagnosticChallenge(id: number): Promise<DiagnosticChallenge | undefined>;
  getAllDiagnosticChallenges(filters?: { 
    search?: string; 
    difficulty?: string; 
    status?: string; 
  }): Promise<DiagnosticChallenge[]>;
  createDiagnosticChallenge(challengeData: InsertDiagnosticChallenge): Promise<DiagnosticChallenge>;
  updateChallengeParticipants(id: number): Promise<boolean>;
  
  // Challenge Responses
  getChallengeResponses(challengeId: number): Promise<ChallengeResponse[]>;
  createChallengeResponse(responseData: InsertChallengeResponse): Promise<ChallengeResponse>;
  voteChallengeResponse(responseId: number, voteType: 'up' | 'down'): Promise<boolean>;
  
  // Community Stats & Leaderboard
  getCommunityStats(): Promise<CommunityStats | undefined>;
  updateCommunityStats(): Promise<CommunityStats>;
  getPhysicianProfiles(): Promise<PhysicianProfile[]>;
  createOrUpdatePhysicianProfile(profileData: InsertPhysicianProfile): Promise<PhysicianProfile>;
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
  
  // Test Confirmations
  createTestConfirmation(testData: InsertTestConfirmation): Promise<TestConfirmation>;
  getTestConfirmationsByCase(caseId: number): Promise<TestConfirmation[]>;
  updateTestConfirmation(id: number, testData: Partial<InsertTestConfirmation>): Promise<TestConfirmation>;
}

export class MemStorage implements IStorage {
  private cases: Map<number, Case> = new Map();
  private diseases: Map<number, Disease> = new Map();
  private hpoTerms: Map<number, HpoTerm> = new Map();
  private physicians: Map<number, Physician> = new Map();
  private testConfirmations: Map<number, TestConfirmation> = new Map();
  private analytics: Analytics | null = null;
  
  // Community Features Storage - iGEM 2025
  private crowdsourcedCases: Map<number, CrowdsourcedCase> = new Map();
  private phenotypeMapping: Map<number, PhenotypeMapping> = new Map();
  private diagnosticChallenges: Map<number, DiagnosticChallenge> = new Map();
  private challengeResponses: Map<number, ChallengeResponse> = new Map();
  private physicianProfiles: Map<number, PhysicianProfile> = new Map();
  private communityStats: CommunityStats | null = null;
  
  private currentCaseId = 1;
  private currentDiseaseId = 1;
  private currentHpoTermId = 1;
  private currentPhysicianId = 1;
  private currentTestConfirmationId = 1;
  private currentAnalyticsId = 1;
  private currentCrowdsourcedCaseId = 1;
  private currentPhenotypeMappingId = 1;
  private currentDiagnosticChallengeId = 1;
  private currentChallengeResponseId = 1;
  private currentPhysicianProfileId = 1;

  constructor() {
    // Initialize with default analytics showing massive database
    this.analytics = {
      id: 1,
      totalCases: 0,
      alertsGenerated: 0,
      diagnosedCases: 0,
      knowledgeBaseSize: 3200, // Target 3000-3200 diseases in massive database
      lastUpdated: new Date()
    };
    
    // Initialize with comprehensive rare disease database
    this.initializeRareDiseases();
    
    // Initialize community features with mock data for demonstration
    this.initializeCommunityFeatures();
    
    // Initialize massive HPO terms database asynchronously
    this.initializeMassiveHpoTerms();
  }

  // Static method to create storage with preloaded massive data
  static async createWithMassiveData(): Promise<MemStorage> {
    const storage = new MemStorage();
    await storage.preloadMassiveDatabase();
    return storage;
  }

  // Preload all massive data before server starts
  private async preloadMassiveDatabase(): Promise<void> {
    console.log("🚀 Preloading massive database before server startup...");
    
    try {
      // Load massive HPO terms
      console.log("Loading massive HPO terms database...");
      const massiveHpoGenerator = await import('./services/massive-hpo-generator.js');
      const hpoTerms = massiveHpoGenerator.generateMassiveHpoDatabase();
      
      const hpoTermsWithId = hpoTerms.map((term, index) => ({
        ...term,
        id: index + 1
      }));
      
      this.hpoTerms = new Map(hpoTermsWithId.map(term => [term.id, term]));
      console.log(`✓ Loaded ${hpoTerms.length} massive HPO terms (targeting 1500+)`);
      
      // Load massive diseases  
      console.log("Loading massive diseases database...");
      const massiveDiseaseGenerator = await import('./services/massive-disease-generator.js');
      const diseases = massiveDiseaseGenerator.generateMassiveDiseaseDatabase();
      
      // Convert OrphadataDisease to Disease format
      const diseasesWithId = diseases.map((orphaDisease, index) => ({
        id: index + 6, // Start after initial 5 diseases
        name: orphaDisease.Name,
        orphaCode: orphaDisease.ORPHAcode,
        icdCode: "", // Not provided in OrphadataDisease
        description: orphaDisease.Definition,
        prevalence: orphaDisease.Prevalence?.Class || "Unknown",
        phenotypes: orphaDisease.Phenotypes?.map(p => ({
          hpoId: p.HPOId,
          frequency: p.HPOFrequency,
          label: p.HPOTerm
        })) || []
      }));
      
      // Add to existing diseases map
      for (const disease of diseasesWithId) {
        this.diseases.set(disease.id, disease as Disease);
        this.currentDiseaseId = Math.max(this.currentDiseaseId, disease.id + 1);
      }
      
      console.log(`✓ Loaded ${diseases.length} massive diseases (targeting 3000+)`);
      
      // Update analytics with actual counts
      this.analytics.knowledgeBaseSize = this.diseases.size;
      
      console.log(`🎉 Massive database preloaded: ${this.diseases.size} diseases, ${this.hpoTerms.size} HPO terms`);
      
    } catch (error) {
      console.error("❌ Error preloading massive database:", error);
      console.log("Falling back to basic initialization");
      this.initializeBasicHpoTerms();
    }
  }

  private initializeRareDiseases(): void {
    const rareDiseases = [
      {
        id: 1,
        name: "Angelman syndrome",
        orphaCode: "ORPHA:72",
        icdCode: "Q93.5",
        description: "A rare genetic disorder characterized by intellectual disability, developmental delay, speech impairment, and distinctive behavioral characteristics.",
        prevalence: "1-5 per 100,000",
        phenotypes: [
          { hpoId: "HP:0001263", frequency: "frequent", label: "Global developmental delay" },
          { hpoId: "HP:0001250", frequency: "occasional", label: "Seizures" },
          { hpoId: "HP:0000256", frequency: "rare", label: "Microcephaly" }
        ]
      },
      {
        id: 2,
        name: "Prader-Willi syndrome",
        orphaCode: "ORPHA:739",
        icdCode: "Q87.1",
        description: "A rare genetic disorder characterized by hypotonia, feeding difficulties in infancy, and later hyperphagia leading to obesity.",
        prevalence: "1-5 per 100,000",
        phenotypes: [
          { hpoId: "HP:0001252", frequency: "frequent", label: "Muscular hypotonia" },
          { hpoId: "HP:0001508", frequency: "frequent", label: "Failure to thrive" },
          { hpoId: "HP:0004322", frequency: "occasional", label: "Short stature" },
          { hpoId: "HP:0000316", frequency: "rare", label: "Hypertelorism" }
        ]
      },
      {
        id: 3,
        name: "22q11.2 deletion syndrome (DiGeorge syndrome)",
        orphaCode: "ORPHA:567",
        icdCode: "D82.1",
        description: "A chromosomal disorder characterized by cardiac defects, abnormal facies, thymic aplasia, cleft palate, and hypocalcemia.",
        prevalence: "1-5 per 100,000",
        phenotypes: [
          { hpoId: "HP:0000175", frequency: "frequent", label: "Cleft palate" },
          { hpoId: "HP:0001639", frequency: "frequent", label: "Hypertrophic cardiomyopathy" },
          { hpoId: "HP:0000347", frequency: "occasional", label: "Micrognathia" },
          { hpoId: "HP:0000405", frequency: "rare", label: "Conductive hearing loss" }
        ]
      },
      {
        id: 4,
        name: "Williams-Beuren syndrome",
        orphaCode: "ORPHA:904",
        icdCode: "Q93.82",
        description: "A rare genetic disorder characterized by cardiovascular disease, distinctive facial features, and mild to moderate intellectual disability.",
        prevalence: "1-5 per 100,000",
        phenotypes: [
          { hpoId: "HP:0001629", frequency: "frequent", label: "Ventricular septal defect" },
          { hpoId: "HP:0000347", frequency: "frequent", label: "Micrognathia" },
          { hpoId: "HP:0000316", frequency: "occasional", label: "Hypertelorism" },
          { hpoId: "HP:0004322", frequency: "rare", label: "Short stature" }
        ]
      },
      {
        id: 5,
        name: "Fragile X syndrome",
        orphaCode: "ORPHA:908",
        icdCode: "Q99.2",
        description: "The most common inherited cause of intellectual disability and autism spectrum disorder.",
        prevalence: "1-5 per 100,000",
        phenotypes: [
          { hpoId: "HP:0000256", frequency: "frequent", label: "Macrocephaly" },
          { hpoId: "HP:0000717", frequency: "frequent", label: "Autism" },
          { hpoId: "HP:0000286", frequency: "occasional", label: "Epicanthus" },
          { hpoId: "HP:0000574", frequency: "rare", label: "Thick eyebrow" }
        ]
      }
    ];

    for (const disease of rareDiseases) {
      this.diseases.set(disease.id, disease as Disease);
      this.currentDiseaseId = Math.max(this.currentDiseaseId, disease.id + 1);
    }
    
    console.log(`Initialized ${rareDiseases.length} rare diseases in memory storage`);
  }

  private async initializeMassiveHpoTerms(): Promise<void> {
    try {
      console.log("Loading massive HPO terms database...");
      const { generateComprehensiveHpoTerms } = await import('./services/comprehensive-hpo-generator.js');
      const hpoTerms = await generateComprehensiveHpoTerms();
      
      // Convert to Map with HPO ID as key
      const hpoTermsWithId = hpoTerms.map((term, index) => ({
        ...term,
        id: index + 1
      }));
      
      this.hpoTerms = new Map(hpoTermsWithId.map(term => [term.id, term]));
      console.log(`Loaded ${hpoTerms.length} massive HPO terms (targeting 1500+)`);
    } catch (error) {
      console.error("Error loading massive HPO terms:", error);
      // Fallback initialization with basic terms
      this.initializeBasicHpoTerms();
    }
  }
  
  private initializeBasicHpoTerms(): void {
    const basicHpoTerms = [
      { id: 1, hpoId: 'HP:0001263', label: 'Global developmental delay', definition: 'A delay in the achievement of motor or mental milestones in the domains of development of a child.', synonyms: ['Developmental delay', 'Delayed development'] },
      { id: 2, hpoId: 'HP:0001249', label: 'Intellectual disability', definition: 'Subnormal intellectual functioning which originates during the developmental period.', synonyms: ['Mental retardation', 'Cognitive impairment'] },
      { id: 3, hpoId: 'HP:0001250', label: 'Seizures', definition: 'Seizures are an abnormal electrical discharge in the brain.', synonyms: ['Seizure', 'Epileptic seizure'] },
      { id: 4, hpoId: 'HP:0001252', label: 'Muscular hypotonia', definition: 'Muscular hypotonia is an abnormally low muscle tone.', synonyms: ['Hypotonia', 'Low muscle tone', 'Floppy baby syndrome'] },
      { id: 5, hpoId: 'HP:0000750', label: 'Delayed speech and language development', definition: 'A degree of language development that is significantly below the norm for a child of a specified age.', synonyms: ['Speech delay', 'Language delay'] }
    ];
    
    for (const term of basicHpoTerms) {
      this.hpoTerms.set(term.id, term);
    }
    console.log(`Loaded ${basicHpoTerms.length} basic HPO terms as fallback`);
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

  // Test Confirmation methods
  async createTestConfirmation(testData: InsertTestConfirmation): Promise<TestConfirmation> {
    const now = new Date();
    const testConfirmation: TestConfirmation = {
      id: this.currentTestConfirmationId++,
      createdAt: now,
      updatedAt: now,
      ...testData
    };
    this.testConfirmations.set(testConfirmation.id, testConfirmation);
    return testConfirmation;
  }

  async getTestConfirmationsByCase(caseId: number): Promise<TestConfirmation[]> {
    return Array.from(this.testConfirmations.values())
      .filter(tc => tc.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateTestConfirmation(id: number, testData: Partial<InsertTestConfirmation>): Promise<TestConfirmation> {
    const testConfirmation = this.testConfirmations.get(id);
    if (!testConfirmation) {
      throw new Error(`Test confirmation with id ${id} not found`);
    }
    const updated = { ...testConfirmation, ...testData, updatedAt: new Date() };
    this.testConfirmations.set(id, updated);
    return updated;
  }
  // =============================================
  // Community Features Implementation - iGEM 2025
  // =============================================

  private initializeCommunityFeatures(): void {
    // Initialize community stats
    this.communityStats = {
      id: 1,
      totalContributions: 157,
      totalParticipants: 89,
      totalCountries: 23,
      totalChallengesSolved: 67,
      avgDiagnosticAccuracy: 78.5,
      lastUpdated: new Date()
    };

    // Initialize phenotype mapping data (18 countries across 5 continents)
    this.initializePhenotypeMappingData();
    
    // Initialize diagnostic challenges (8 complex scenarios)
    this.initializeDiagnosticChallengesData();

    // Initialize fake crowdsourced cases for testing
    this.initializeFakeCrowdsourcedCases();

    console.log("Initialized community features with sample data for iGEM 2025 competition");
  }

  private initializePhenotypeMappingData(): void {
    const phenotypeMappingData: PhenotypeMapping[] = [
      // Additional entries beyond the existing ones for global coverage
      {
        id: 17,
        hpoId: "HP:0002205",
        hpoLabel: "Recurrent respiratory infections",
        country: "Argentina",
        region: "Buenos Aires",
        frequency: 63,
        prevalence: "4.2",
        lastUpdated: new Date(),
        latitude: "-34.6118",
        longitude: "-58.3960"
      },
      {
        id: 18,
        hpoId: "HP:0001272",
        hpoLabel: "Cerebellar atrophy",
        country: "South Korea",
        region: "Seoul",
        frequency: 31,
        prevalence: "2.1",
        lastUpdated: new Date(),
        latitude: "37.5665",
        longitude: "126.9780"
      },
      {
        id: 19,
        hpoId: "HP:0001942",
        hpoLabel: "Metabolic acidosis",
        country: "Morocco",
        region: "Casablanca",
        frequency: 47,
        prevalence: "3.8",
        lastUpdated: new Date(),
        latitude: "33.5731",
        longitude: "-7.5898"
      },
      {
        id: 20,
        hpoId: "HP:0030149",
        hpoLabel: "Carpal tunnel syndrome",
        country: "Chile",
        region: "Santiago",
        frequency: 28,
        prevalence: "1.9",
        lastUpdated: new Date(),
        latitude: "-33.4489",
        longitude: "-70.6693"
      }
    ];

    for (const mapping of phenotypeMappingData) {
      this.phenotypeMapping.set(mapping.id, mapping);
      this.currentPhenotypeMappingId = Math.max(this.currentPhenotypeMappingId, mapping.id + 1);
    }
  }

  private initializeDiagnosticChallengesData(): void {
    const challengeData: DiagnosticChallenge[] = [
      // Additional challenges beyond what's in getAllDiagnosticChallenges
      {
        id: 7,
        title: "Congenital Hypotonia with Feeding Difficulties",
        description: "Newborn with severe hypotonia, poor feeding, weak cry, and respiratory distress requiring ventilatory support.",
        symptoms: [
          { hpoId: "HP:0001252", label: "Muscular hypotonia" },
          { hpoId: "HP:0011968", label: "Feeding difficulties" },
          { hpoId: "HP:0002098", label: "Respiratory distress" }
        ],
        additionalInfo: "Born at 38 weeks, Apgar 4/6, weak reflexes, genetic testing pending",
        createdBy: "nicu_attending",
        createdDate: new Date("2025-03-01"),
        status: "active",
        difficulty: "expert",
        ageGroup: "pediatric",
        sex: "female",
        country: "Netherlands",
        participantCount: 22
      },
      {
        id: 8,
        title: "Episodic Weakness with Cardiac Arrhythmias",
        description: "45-year-old with episodes of muscle weakness, cardiac arrhythmias, and abnormal electrolyte handling.",
        symptoms: [
          { hpoId: "HP:0003198", label: "Myopathy" },
          { hpoId: "HP:0006682", label: "Ventricular extrasystoles" },
          { hpoId: "HP:0002900", label: "Hypokalemia" }
        ],
        additionalInfo: "Episodes triggered by carbohydrate intake, potassium supplementation helps",
        createdBy: "cardiology_fellow",
        createdDate: new Date("2025-03-08"),
        status: "solved",
        difficulty: "hard",
        correctDiagnosis: "Andersen-Tawil syndrome",
        correctOrphaCode: "ORPHA:37553",
        ageGroup: "adult",
        sex: "male",
        country: "Denmark",
        participantCount: 16
      }
    ];

    for (const challenge of challengeData) {
      this.diagnosticChallenges.set(challenge.id, challenge);
      this.currentDiagnosticChallengeId = Math.max(this.currentDiagnosticChallengeId, challenge.id + 1);
    }
  }

  private initializeFakeCrowdsourcedCases(): void {
    // Generate 157 comprehensive fake cases for testing
    const fakeCases = generateFakeCrowdsourcedCases(157);
    
    for (const caseData of fakeCases) {
      const newCase: CrowdsourcedCase = {
        id: this.currentCrowdsourcedCaseId++,
        ...caseData,
        contributionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
      };
      this.crowdsourcedCases.set(newCase.id, newCase);
    }

    console.log(`✅ Initialized ${fakeCases.length} fake crowdsourced cases for testing`);
  }

  // Crowdsourced Cases Methods
  async getCrowdsourcedCase(id: number): Promise<CrowdsourcedCase | undefined> {
    return this.crowdsourcedCases.get(id);
  }

  async getAllCrowdsourcedCases(filters?: { 
    search?: string; 
    difficulty?: string; 
    outcome?: string; 
    country?: string; 
  }): Promise<CrowdsourcedCase[]> {
    let cases = Array.from(this.crowdsourcedCases.values());

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      cases = cases.filter(c => 
        c.confirmedDiagnosis?.toLowerCase().includes(search) ||
        c.diagnosticJourney?.toLowerCase().includes(search) ||
        c.symptoms?.some(s => s.label.toLowerCase().includes(search))
      );
    }

    if (filters?.difficulty && filters.difficulty !== "all") {
      cases = cases.filter(c => c.difficulty === filters.difficulty);
    }

    if (filters?.outcome && filters.outcome !== "all") {
      cases = cases.filter(c => c.outcome === filters.outcome);
    }

    if (filters?.country && filters.country !== "all") {
      cases = cases.filter(c => c.country === filters.country);
    }

    return cases.sort((a, b) => (b.contributionDate?.getTime() || 0) - (a.contributionDate?.getTime() || 0));
  }

  async createCrowdsourcedCase(caseData: InsertCrowdsourcedCase): Promise<CrowdsourcedCase> {
    const newCase: CrowdsourcedCase = {
      id: this.currentCrowdsourcedCaseId++,
      ...caseData,
      contributionDate: new Date(),
      upvotes: 0,
      isPublic: true
    };
    this.crowdsourcedCases.set(newCase.id, newCase);
    
    // Update community stats
    if (this.communityStats) {
      this.communityStats.totalContributions++;
    }
    
    return newCase;
  }

  async upvoteCrowdsourcedCase(id: number): Promise<boolean> {
    const case_ = this.crowdsourcedCases.get(id);
    if (case_) {
      case_.upvotes = (case_.upvotes || 0) + 1;
      this.crowdsourcedCases.set(id, case_);
      return true;
    }
    return false;
  }

  // Phenotype Mapping Methods
  async getPhenotypeMapping(filters?: { 
    search?: string; 
    country?: string; 
  }): Promise<PhenotypeMapping[]> {
    // Generate sample phenotype mapping data for demonstration
    const sampleData: PhenotypeMapping[] = [
      {
        id: 1,
        hpoId: "HP:0001250",
        hpoLabel: "Seizures",
        country: "United States",
        region: "California",
        frequency: 45,
        prevalence: "2.8",
        lastUpdated: new Date(),
        latitude: "36.7783",
        longitude: "-119.4179"
      },
      {
        id: 2,
        hpoId: "HP:0001250",
        hpoLabel: "Seizures", 
        country: "United Kingdom",
        frequency: 32,
        prevalence: "1.9",
        lastUpdated: new Date(),
        latitude: "55.3781",
        longitude: "-3.4360"
      },
      {
        id: 3,
        hpoId: "HP:0001263",
        hpoLabel: "Global developmental delay",
        country: "Germany",
        frequency: 28,
        prevalence: "3.2",
        lastUpdated: new Date(),
        latitude: "51.1657",
        longitude: "10.4515"
      },
      {
        id: 4,
        hpoId: "HP:0003560",
        hpoLabel: "Muscular dystrophy",
        country: "Brazil",
        region: "São Paulo",
        frequency: 52,
        prevalence: "4.1",
        lastUpdated: new Date(),
        latitude: "-15.7801",
        longitude: "-47.9292"
      },
      {
        id: 5,
        hpoId: "HP:0001638",
        hpoLabel: "Cardiomyopathy",
        country: "Japan",
        region: "Tokyo",
        frequency: 38,
        prevalence: "2.3",
        lastUpdated: new Date(),
        latitude: "35.6762",
        longitude: "139.6503"
      },
      {
        id: 6,
        hpoId: "HP:0002240",
        hpoLabel: "Hepatomegaly",
        country: "India",
        region: "Maharashtra",
        frequency: 67,
        prevalence: "5.8",
        lastUpdated: new Date(),
        latitude: "19.7515",
        longitude: "75.7139"
      },
      {
        id: 7,
        hpoId: "HP:0001943",
        hpoLabel: "Hypoglycemia",
        country: "Canada",
        region: "Ontario",
        frequency: 29,
        prevalence: "1.7",
        lastUpdated: new Date(),
        latitude: "51.2538",
        longitude: "-85.3232"
      },
      {
        id: 8,
        hpoId: "HP:0009830",
        hpoLabel: "Peripheral neuropathy",
        country: "France",
        region: "Île-de-France",
        frequency: 41,
        prevalence: "3.5",
        lastUpdated: new Date(),
        latitude: "48.8566",
        longitude: "2.3522"
      },
      {
        id: 9,
        hpoId: "HP:0001022",
        hpoLabel: "Albinism",
        country: "South Africa",
        region: "Gauteng",
        frequency: 89,
        prevalence: "12.4",
        lastUpdated: new Date(),
        latitude: "-26.2041",
        longitude: "28.0473"
      },
      {
        id: 10,
        hpoId: "HP:0001251",
        hpoLabel: "Ataxia",
        country: "Australia",
        region: "New South Wales",
        frequency: 24,
        prevalence: "1.8",
        lastUpdated: new Date(),
        latitude: "-31.8405",
        longitude: "145.6123"
      },
      {
        id: 11,
        hpoId: "HP:0002014",
        hpoLabel: "Diarrhea",
        country: "Nigeria",
        region: "Lagos",
        frequency: 156,
        prevalence: "18.7",
        lastUpdated: new Date(),
        latitude: "6.5244",
        longitude: "3.3792"
      },
      {
        id: 12,
        hpoId: "HP:0000546",
        hpoLabel: "Retinal degeneration",
        country: "Norway",
        region: "Oslo",
        frequency: 18,
        prevalence: "1.2",
        lastUpdated: new Date(),
        latitude: "59.9139",
        longitude: "10.7522"
      },
      {
        id: 13,
        hpoId: "HP:0001873",
        hpoLabel: "Thrombocytopenia",
        country: "Mexico",
        region: "Mexico City",
        frequency: 76,
        prevalence: "6.8",
        lastUpdated: new Date(),
        latitude: "19.4326",
        longitude: "-99.1332"
      },
      {
        id: 14,
        hpoId: "HP:0001639",
        hpoLabel: "Hypertrophic cardiomyopathy",
        country: "Turkey",
        region: "Istanbul",
        frequency: 43,
        prevalence: "2.9",
        lastUpdated: new Date(),
        latitude: "41.0082",
        longitude: "28.9784"
      },
      {
        id: 15,
        hpoId: "HP:0001508",
        hpoLabel: "Failure to thrive",
        country: "Egypt",
        region: "Cairo",
        frequency: 98,
        prevalence: "8.4",
        lastUpdated: new Date(),
        latitude: "30.0444",
        longitude: "31.2357"
      },
      {
        id: 16,
        hpoId: "HP:0001987",
        hpoLabel: "Hyperammonemia",
        country: "Sweden",
        region: "Stockholm",
        frequency: 15,
        prevalence: "0.8",
        lastUpdated: new Date(),
        latitude: "59.3293",
        longitude: "18.0686"
      },
      {
        id: 17,
        hpoId: "HP:0002205",
        hpoLabel: "Recurrent respiratory infections",
        country: "China",
        region: "Beijing",
        frequency: 134,
        prevalence: "9.2",
        lastUpdated: new Date(),
        latitude: "39.9042",
        longitude: "116.4074"
      },
      {
        id: 18,
        hpoId: "HP:0000978",
        hpoLabel: "Bruising susceptibility",
        country: "Russia",
        region: "Moscow",
        frequency: 62,
        prevalence: "4.3",
        lastUpdated: new Date(),
        latitude: "55.7558",
        longitude: "37.6176"
      }
    ];

    let mapping = sampleData;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      mapping = mapping.filter(m => 
        m.hpoLabel.toLowerCase().includes(search) ||
        m.hpoId.toLowerCase().includes(search)
      );
    }

    if (filters?.country && filters.country !== "all") {
      mapping = mapping.filter(m => m.country === filters.country);
    }

    return mapping.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
  }

  async createPhenotypeMapping(mappingData: InsertPhenotypeMapping): Promise<PhenotypeMapping> {
    const newMapping: PhenotypeMapping = {
      id: this.currentPhenotypeMappingId++,
      ...mappingData,
      lastUpdated: new Date()
    };
    this.phenotypeMapping.set(newMapping.id, newMapping);
    return newMapping;
  }

  async updatePhenotypeFrequency(hpoId: string, country: string): Promise<boolean> {
    return true; // Mock implementation
  }

  // Diagnostic Challenges Methods
  async getDiagnosticChallenge(id: number): Promise<DiagnosticChallenge | undefined> {
    return this.diagnosticChallenges.get(id);
  }

  async getAllDiagnosticChallenges(filters?: { 
    search?: string; 
    difficulty?: string; 
    status?: string; 
  }): Promise<DiagnosticChallenge[]> {
    // Generate sample challenges for demonstration
    const sampleChallenges: DiagnosticChallenge[] = [
      {
        id: 1,
        title: "Progressive Muscle Weakness in 8-Year-Old",
        description: "8-year-old male presents with 6-month history of progressive muscle weakness, difficulty climbing stairs, and elevated CK levels. Family history significant for maternal uncle with similar symptoms who died in twenties.",
        symptoms: [
          { hpoId: "HP:0003560", label: "Muscular dystrophy" },
          { hpoId: "HP:0003701", label: "Proximal muscle weakness" },
          { hpoId: "HP:0008994", label: "Proximal muscle weakness in lower limbs" }
        ],
        additionalInfo: "CK: 3,500 U/L (normal <200), EMG shows myopathic changes, muscle biopsy pending",
        createdBy: "phys_challenge_001",
        createdDate: new Date("2025-01-15"),
        status: "active",
        difficulty: "medium",
        ageGroup: "pediatric",
        sex: "male",
        country: "Canada",
        participantCount: 8
      },
      {
        id: 2,
        title: "Recurrent Hypoglycemia with Hepatomegaly",
        description: "3-year-old female with recurrent severe hypoglycemia episodes, hepatomegaly, and growth retardation. Episodes occur primarily during fasting periods.",
        symptoms: [
          { hpoId: "HP:0001943", label: "Hypoglycemia" },
          { hpoId: "HP:0002240", label: "Hepatomegaly" },
          { hpoId: "HP:0004322", label: "Short stature" }
        ],
        additionalInfo: "Glucose <40 mg/dL during episodes, elevated lactate, normal ketones, liver ultrasound shows increased echogenicity",
        createdBy: "phys_challenge_002",
        createdDate: new Date("2025-01-22"),
        status: "solved",
        difficulty: "hard",
        correctDiagnosis: "Glycogen storage disease type I",
        correctOrphaCode: "ORPHA:79259",
        solvedBy: "phys_solver_001",
        solvedDate: new Date("2025-01-28"),
        ageGroup: "pediatric",
        sex: "female",
        country: "Australia",
        participantCount: 15
      },
      {
        id: 3,
        title: "Neonatal Seizures and Metabolic Acidosis",
        description: "2-day-old neonate presents with intractable seizures, severe metabolic acidosis, and hyperammonemia. Born to consanguineous parents.",
        symptoms: [
          { hpoId: "HP:0002305", label: "Neonatal seizures" },
          { hpoId: "HP:0001942", label: "Metabolic acidosis" },
          { hpoId: "HP:0001987", label: "Hyperammonemia" },
          { hpoId: "HP:0001254", label: "Lethargy" }
        ],
        additionalInfo: "Ammonia: 850 μmol/L, pH 7.15, bicarbonate 8 mEq/L, urine organic acids pending",
        createdBy: "neonatal_intensivist",
        createdDate: new Date("2025-02-05"),
        status: "active",
        difficulty: "expert",
        ageGroup: "pediatric",
        sex: "male",
        country: "Turkey",
        participantCount: 12
      },
      {
        id: 4,
        title: "Adult-Onset Cardiomyopathy with Neuropathy",
        description: "45-year-old presents with progressive heart failure, peripheral neuropathy, and kidney dysfunction. Family history of similar symptoms in father.",
        symptoms: [
          { hpoId: "HP:0001638", label: "Cardiomyopathy" },
          { hpoId: "HP:0009830", label: "Peripheral neuropathy" },
          { hpoId: "HP:0000112", label: "Nephropathy" },
          { hpoId: "HP:0030149", label: "Carpal tunnel syndrome" }
        ],
        additionalInfo: "Echo shows concentric LVH, proteinuria 3+, nerve conduction shows axonal neuropathy",
        createdBy: "cardiologist_md",
        createdDate: new Date("2025-02-10"),
        status: "active",
        difficulty: "hard",
        correctDiagnosis: "Fabry disease",
        correctOrphaCode: "ORPHA:324",
        ageGroup: "adult",
        sex: "male",
        country: "Brazil",
        participantCount: 18
      },
      {
        id: 5,
        title: "Recurrent Infections and Bleeding Disorder",
        description: "12-year-old with history of recurrent bacterial infections, easy bruising, and oculocutaneous albinism.",
        symptoms: [
          { hpoId: "HP:0002205", label: "Recurrent respiratory infections" },
          { hpoId: "HP:0000978", label: "Bruising susceptibility" },
          { hpoId: "HP:0001022", label: "Albinism" },
          { hpoId: "HP:0001873", label: "Thrombocytopenia" }
        ],
        additionalInfo: "Platelet count 45,000, giant platelets on smear, immunoglobulin levels low",
        createdBy: "pediatric_hematologist",
        createdDate: new Date("2025-02-15"),
        status: "solved",
        difficulty: "medium",
        correctDiagnosis: "Chediak-Higashi syndrome",
        correctOrphaCode: "ORPHA:167",
        solvedBy: "immunology_expert",
        solvedDate: new Date("2025-02-20"),
        ageGroup: "pediatric",
        sex: "female",
        country: "Japan",
        participantCount: 25
      },
      {
        id: 6,
        title: "Progressive Ataxia with Visual Impairment",
        description: "28-year-old with 5-year history of progressive cerebellar ataxia, peripheral neuropathy, and retinal degeneration.",
        symptoms: [
          { hpoId: "HP:0001251", label: "Ataxia" },
          { hpoId: "HP:0000546", label: "Retinal degeneration" },
          { hpoId: "HP:0009830", label: "Peripheral neuropathy" },
          { hpoId: "HP:0001272", label: "Cerebellar atrophy" }
        ],
        additionalInfo: "MRI shows cerebellar atrophy, ERG abnormal, elevated very long chain fatty acids",
        createdBy: "neurologist_specialist",
        createdDate: new Date("2025-02-25"),
        status: "active",
        difficulty: "expert",
        correctDiagnosis: "Adrenoleukodystrophy",
        correctOrphaCode: "ORPHA:15",
        ageGroup: "adult",
        sex: "male",
        country: "France",
        participantCount: 9
      },
      {
        id: 7,
        title: "Chronic Diarrhea and Growth Failure",
        description: "18-month-old with chronic watery diarrhea, severe malnutrition, and recurrent infections since birth.",
        symptoms: [
          { hpoId: "HP:0002014", label: "Diarrhea" },
          { hpoId: "HP:0001508", label: "Failure to thrive" },
          { hpoId: "HP:0004395", label: "Malnutrition" },
          { hpoId: "HP:0002205", label: "Recurrent respiratory infections" }
        ],
        additionalInfo: "Stool volume >1L/day, low albumin, hypogammaglobulinemia, villous atrophy on biopsy",
        createdBy: "gastroenterologist_ped",
        createdDate: new Date("2025-03-01"),
        status: "active",
        difficulty: "hard",
        ageGroup: "pediatric",
        sex: "male",
        country: "India",
        participantCount: 14
      },
      {
        id: 8,
        title: "Sudden Cardiac Death in Young Athlete",
        description: "16-year-old basketball player collapsed during practice. Autopsy shows hypertrophic cardiomyopathy. Family seeking genetic counseling.",
        symptoms: [
          { hpoId: "HP:0001645", label: "Sudden cardiac death" },
          { hpoId: "HP:0001639", label: "Hypertrophic cardiomyopathy" },
          { hpoId: "HP:0004749", label: "Atrial fibrillation" },
          { hpoId: "HP:0001678", label: "Atrioventricular block" }
        ],
        additionalInfo: "Echo showed asymmetric septal hypertrophy, family history positive for sudden death",
        createdBy: "cardiac_pathologist",
        createdDate: new Date("2025-03-05"),
        status: "active",
        difficulty: "medium",
        ageGroup: "pediatric",
        sex: "male",
        country: "United States",
        participantCount: 31
      }
    ];

    let challenges = sampleChallenges;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      challenges = challenges.filter(c => 
        c.title.toLowerCase().includes(search) ||
        c.description.toLowerCase().includes(search) ||
        c.symptoms?.some(s => s.label.toLowerCase().includes(search))
      );
    }

    if (filters?.difficulty && filters.difficulty !== "all") {
      challenges = challenges.filter(c => c.difficulty === filters.difficulty);
    }

    if (filters?.status && filters.status !== "all") {
      challenges = challenges.filter(c => c.status === filters.status);
    }

    return challenges.sort((a, b) => (b.createdDate?.getTime() || 0) - (a.createdDate?.getTime() || 0));
  }

  async createDiagnosticChallenge(challengeData: InsertDiagnosticChallenge): Promise<DiagnosticChallenge> {
    const newChallenge: DiagnosticChallenge = {
      id: this.currentDiagnosticChallengeId++,
      ...challengeData,
      createdDate: new Date(),
      status: "active",
      participantCount: 0
    };
    this.diagnosticChallenges.set(newChallenge.id, newChallenge);
    return newChallenge;
  }

  async updateChallengeParticipants(id: number): Promise<boolean> {
    const challenge = this.diagnosticChallenges.get(id);
    if (challenge) {
      challenge.participantCount = (challenge.participantCount || 0) + 1;
      this.diagnosticChallenges.set(id, challenge);
      return true;
    }
    return false;
  }

  // Challenge Responses Methods
  async getChallengeResponses(challengeId: number): Promise<ChallengeResponse[]> {
    return Array.from(this.challengeResponses.values())
      .filter(r => r.challengeId === challengeId)
      .sort((a, b) => (b.submittedDate?.getTime() || 0) - (a.submittedDate?.getTime() || 0));
  }

  async createChallengeResponse(responseData: InsertChallengeResponse): Promise<ChallengeResponse> {
    const newResponse: ChallengeResponse = {
      id: this.currentChallengeResponseId++,
      ...responseData,
      submittedDate: new Date(),
      upvotes: 0,
      downvotes: 0
    };
    this.challengeResponses.set(newResponse.id, newResponse);
    return newResponse;
  }

  async voteChallengeResponse(responseId: number, voteType: 'up' | 'down'): Promise<boolean> {
    const response = this.challengeResponses.get(responseId);
    if (response) {
      if (voteType === 'up') {
        response.upvotes = (response.upvotes || 0) + 1;
      } else {
        response.downvotes = (response.downvotes || 0) + 1;
      }
      this.challengeResponses.set(responseId, response);
      return true;
    }
    return false;
  }

  // Community Stats & Leaderboard Methods
  async getCommunityStats(): Promise<CommunityStats | undefined> {
    return this.communityStats || undefined;
  }

  async updateCommunityStats(): Promise<CommunityStats> {
    const stats: CommunityStats = {
      id: 1,
      totalContributions: this.crowdsourcedCases.size,
      totalParticipants: this.physicianProfiles.size,
      totalCountries: 23,
      totalChallengesSolved: Array.from(this.diagnosticChallenges.values()).filter(c => c.status === 'solved').length,
      avgDiagnosticAccuracy: 78.5,
      lastUpdated: new Date()
    };

    this.communityStats = stats;
    return stats;
  }

  async getPhysicianProfiles(): Promise<PhysicianProfile[]> {
    // Generate sample leaderboard data
    const sampleProfiles: PhysicianProfile[] = [
      {
        id: 1,
        anonymousId: "phys_top_001",
        country: "United States",
        specialty: "Pediatric Genetics",
        experienceYears: 15,
        contributionScore: 2850,
        challengesSolved: 45,
        casesContributed: 23,
        accuracyRate: "89.5",
        joinedDate: new Date("2024-01-15"),
        lastActive: new Date(),
        badges: ["Top Contributor", "Genetics Expert", "Challenge Master"]
      },
      {
        id: 2,
        anonymousId: "phys_top_002",
        country: "Germany",
        specialty: "Neurology",
        experienceYears: 12,
        contributionScore: 2340,
        challengesSolved: 38,
        casesContributed: 19,
        accuracyRate: "85.2",
        joinedDate: new Date("2024-02-10"),
        lastActive: new Date(),
        badges: ["Neuro Specialist", "Community Leader"]
      },
      {
        id: 3,
        anonymousId: "phys_top_003",
        country: "United Kingdom",
        specialty: "Metabolic Medicine",
        experienceYears: 18,
        contributionScore: 2120,
        challengesSolved: 32,
        casesContributed: 27,
        accuracyRate: "91.3",
        joinedDate: new Date("2024-01-08"),
        lastActive: new Date(),
        badges: ["Metabolic Expert", "Case Contributor"]
      }
    ];

    return sampleProfiles.sort((a, b) => (b.contributionScore || 0) - (a.contributionScore || 0));
  }

  async createOrUpdatePhysicianProfile(profileData: InsertPhysicianProfile): Promise<PhysicianProfile> {
    const newProfile: PhysicianProfile = {
      id: this.currentPhysicianProfileId++,
      ...profileData,
      joinedDate: new Date(),
      lastActive: new Date()
    };
    this.physicianProfiles.set(newProfile.id, newProfile);
    return newProfile;
  }
}

// Initialize storage with massive preloaded data
let storage: MemStorage;

// Async function to initialize storage with massive data
export async function initializeStorage(): Promise<MemStorage> {
  if (!storage) {
    console.log("🔄 Initializing storage with massive database...");
    storage = await MemStorage.createWithMassiveData();
    console.log("✅ Storage initialized with massive database");
  }
  return storage;
}

// Export the storage getter
export { storage };
