interface TreatmentRecommendation {
  treatmentId: string;
  name: string;
  type: 'medication' | 'therapy' | 'surgery' | 'monitoring' | 'lifestyle';
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  description: string;
  dosage?: string;
  duration?: string;
  contraindications: string[];
  interactions: string[];
  monitoringRequirements: string[];
  priority: 'high' | 'medium' | 'low';
}

interface ClinicalPathway {
  stepId: string;
  title: string;
  description: string;
  timeframe: string;
  prerequisites: string[];
  actions: string[];
  expectedOutcomes: string[];
  nextSteps: string[];
}

interface RiskAssessment {
  category: string;
  level: 'critical' | 'high' | 'moderate' | 'low';
  score: number;
  factors: string[];
  recommendations: string[];
  urgency: 'immediate' | 'within-24h' | 'within-week' | 'routine';
}

export class CDSSService {
  private treatmentDatabase: Map<string, TreatmentRecommendation[]> = new Map();
  private clinicalPathways: Map<string, ClinicalPathway[]> = new Map();
  private drugInteractions: Map<string, string[]> = new Map();

  constructor() {
    this.initializeTreatmentDatabase();
    this.initializeClinicalPathways();
    this.initializeDrugInteractions();
  }

  /**
   * Generate evidence-based treatment recommendations for diagnosed conditions
   */
  async generateTreatmentRecommendations(
    diagnosis: string,
    orphaCode: string,
    patientAge?: number,
    patientSex?: string,
    comorbidities: string[] = []
  ): Promise<TreatmentRecommendation[]> {
    const recommendations = this.treatmentDatabase.get(orphaCode) || [];
    
    // Filter recommendations based on patient factors
    return recommendations
      .filter(rec => this.isRecommendationAppropriate(rec, patientAge, patientSex, comorbidities))
      .sort((a, b) => {
        // Prioritize by evidence level and priority
        const evidenceOrder = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        
        const aScore = evidenceOrder[a.evidenceLevel] + priorityOrder[a.priority];
        const bScore = evidenceOrder[b.evidenceLevel] + priorityOrder[b.priority];
        
        return bScore - aScore;
      });
  }

  /**
   * Check for drug interactions in rare disease medications
   */
  async checkDrugInteractions(medications: string[]): Promise<{
    interactions: Array<{
      drug1: string;
      drug2: string;
      severity: 'major' | 'moderate' | 'minor';
      description: string;
      recommendations: string[];
    }>;
    contraindications: string[];
    warnings: string[];
  }> {
    const interactions: any[] = [];
    const contraindications: string[] = [];
    const warnings: string[] = [];

    // Check each medication against known interactions
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drug1 = medications[i].toLowerCase();
        const drug2 = medications[j].toLowerCase();
        
        const interactionKey = `${drug1}-${drug2}`;
        const reverseKey = `${drug2}-${drug1}`;
        
        if (this.drugInteractions.has(interactionKey) || this.drugInteractions.has(reverseKey)) {
          interactions.push({
            drug1: medications[i],
            drug2: medications[j],
            severity: 'moderate',
            description: `Potential interaction between ${medications[i]} and ${medications[j]}`,
            recommendations: [
              'Monitor patient closely for adverse effects',
              'Consider dose adjustment',
              'Consult pharmacist for detailed interaction review'
            ]
          });
        }
      }
    }

    return { interactions, contraindications, warnings };
  }

  /**
   * Generate clinical pathway guidance for complex diagnostic protocols
   */
  async getClinicalPathway(
    diagnosis: string,
    orphaCode: string,
    currentStep?: string
  ): Promise<{
    pathway: ClinicalPathway[];
    currentStepIndex: number;
    completedSteps: string[];
    nextActions: string[];
  }> {
    const pathway = this.clinicalPathways.get(orphaCode) || this.getGenericPathway();
    const currentStepIndex = currentStep ? 
      pathway.findIndex(step => step.stepId === currentStep) : 0;
    
    const completedSteps = pathway
      .slice(0, currentStepIndex)
      .map(step => step.stepId);
    
    const nextActions = currentStepIndex < pathway.length ? 
      pathway[currentStepIndex].actions : [];

    return {
      pathway,
      currentStepIndex,
      completedSteps,
      nextActions
    };
  }

  /**
   * Perform risk stratification based on symptoms and disease progression
   */
  async performRiskAssessment(
    symptoms: Array<{ hpoId: string; label: string; frequency: string }>,
    diagnosis?: string,
    patientAge?: number
  ): Promise<RiskAssessment[]> {
    const assessments: RiskAssessment[] = [];

    // Neurological risk assessment
    const neurologicalSymptoms = symptoms.filter(s => 
      s.hpoId.includes('HP:0001') || s.label.toLowerCase().includes('seizure') ||
      s.label.toLowerCase().includes('developmental')
    );

    if (neurologicalSymptoms.length > 0) {
      let riskLevel: 'critical' | 'high' | 'moderate' | 'low' = 'moderate';
      let score = neurologicalSymptoms.length * 2;

      if (neurologicalSymptoms.some(s => s.label.toLowerCase().includes('seizure'))) {
        riskLevel = 'high';
        score += 3;
      }

      assessments.push({
        category: 'Neurological',
        level: riskLevel,
        score,
        factors: neurologicalSymptoms.map(s => s.label),
        recommendations: [
          'Neurological consultation recommended',
          'EEG monitoring if seizures present',
          'Developmental assessment and early intervention'
        ],
        urgency: riskLevel === 'high' ? 'within-24h' : 'within-week'
      });
    }

    // Growth and development risk
    const growthSymptoms = symptoms.filter(s => 
      s.label.toLowerCase().includes('growth') || 
      s.label.toLowerCase().includes('stature') ||
      s.label.toLowerCase().includes('failure to thrive')
    );

    if (growthSymptoms.length > 0) {
      assessments.push({
        category: 'Growth & Development',
        level: 'moderate',
        score: growthSymptoms.length * 1.5,
        factors: growthSymptoms.map(s => s.label),
        recommendations: [
          'Growth chart monitoring',
          'Nutritional assessment',
          'Endocrinology consultation if severe'
        ],
        urgency: 'routine'
      });
    }

    return assessments.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate structured clinical documentation
   */
  async generateClinicalDocumentation(
    patientId: string,
    symptoms: string[],
    diagnosis: string,
    recommendations: TreatmentRecommendation[],
    riskAssessment: RiskAssessment[]
  ): Promise<{
    clinicalNote: string;
    structuredData: any;
    billing: {
      icdCodes: string[];
      cptCodes: string[];
      complexity: 'low' | 'moderate' | 'high';
    };
  }> {
    const clinicalNote = this.generateProgressNote(
      patientId, symptoms, diagnosis, recommendations, riskAssessment
    );

    const structuredData = {
      patientId,
      encounterDate: new Date().toISOString(),
      chiefComplaint: symptoms.slice(0, 3).join(', '),
      assessment: diagnosis,
      plan: recommendations.map(r => r.name),
      riskFactors: riskAssessment.map(r => r.category),
      followUp: this.determineFollowUpSchedule(riskAssessment)
    };

    const billing = {
      icdCodes: [this.mapDiagnosisToICD(diagnosis)],
      cptCodes: this.determineCPTCodes(recommendations),
      complexity: riskAssessment.length > 2 ? 'high' : 
                 riskAssessment.length > 0 ? 'moderate' : 'low'
    };

    return { clinicalNote, structuredData, billing };
  }

  private initializeTreatmentDatabase(): void {
    // Angelman syndrome treatments
    this.treatmentDatabase.set('ORPHA:72', [
      {
        treatmentId: 'AS_001',
        name: 'Anti-epileptic therapy',
        type: 'medication',
        evidenceLevel: 'A',
        description: 'Valproic acid or levetiracetam for seizure management',
        dosage: 'Weight-based dosing per neurology guidelines',
        duration: 'Long-term',
        contraindications: ['Liver disease', 'Pregnancy'],
        interactions: ['Warfarin', 'Phenytoin'],
        monitoringRequirements: ['Liver function tests', 'Complete blood count'],
        priority: 'high'
      },
      {
        treatmentId: 'AS_002',
        name: 'Physical therapy',
        type: 'therapy',
        evidenceLevel: 'B',
        description: 'Motor development and mobility training',
        duration: 'Ongoing',
        contraindications: [],
        interactions: [],
        monitoringRequirements: ['Progress assessments every 3 months'],
        priority: 'high'
      },
      {
        treatmentId: 'AS_003',
        name: 'Speech therapy',
        type: 'therapy',
        evidenceLevel: 'B',
        description: 'Communication enhancement and AAC training',
        duration: 'Ongoing',
        contraindications: [],
        interactions: [],
        monitoringRequirements: ['Communication assessments'],
        priority: 'medium'
      }
    ]);

    // Prader-Willi syndrome treatments
    this.treatmentDatabase.set('ORPHA:739', [
      {
        treatmentId: 'PWS_001',
        name: 'Growth hormone therapy',
        type: 'medication',
        evidenceLevel: 'A',
        description: 'Recombinant human growth hormone for growth and body composition',
        dosage: '0.24-0.48 mg/kg/week subcutaneous',
        duration: 'Until final height achieved',
        contraindications: ['Active malignancy', 'Diabetic retinopathy'],
        interactions: ['Insulin', 'Glucocorticoids'],
        monitoringRequirements: ['IGF-1 levels', 'Glucose tolerance', 'Sleep study'],
        priority: 'high'
      },
      {
        treatmentId: 'PWS_002',
        name: 'Nutritional management',
        type: 'lifestyle',
        evidenceLevel: 'A',
        description: 'Strict calorie restriction and dietary monitoring',
        duration: 'Lifelong',
        contraindications: [],
        interactions: [],
        monitoringRequirements: ['Weight monitoring', 'Nutritional assessments'],
        priority: 'high'
      }
    ]);
  }

  private initializeClinicalPathways(): void {
    // Angelman syndrome diagnostic pathway
    this.clinicalPathways.set('ORPHA:72', [
      {
        stepId: 'AS_STEP1',
        title: 'Initial Clinical Assessment',
        description: 'Comprehensive neurological and developmental evaluation',
        timeframe: 'Initial visit',
        prerequisites: ['Patient referral', 'Medical history'],
        actions: [
          'Detailed medical history',
          'Physical examination',
          'Developmental assessment',
          'Family history review'
        ],
        expectedOutcomes: ['Suspicion of genetic condition'],
        nextSteps: ['Genetic testing', 'EEG if seizures present']
      },
      {
        stepId: 'AS_STEP2',
        title: 'Genetic Testing',
        description: 'Molecular genetic testing for UBE3A mutations',
        timeframe: '2-4 weeks',
        prerequisites: ['Clinical suspicion', 'Genetic counseling'],
        actions: [
          'UBE3A gene sequencing',
          'Methylation analysis',
          'FISH for 15q11-q13 deletion'
        ],
        expectedOutcomes: ['Genetic confirmation'],
        nextSteps: ['Treatment planning', 'Family counseling']
      },
      {
        stepId: 'AS_STEP3',
        title: 'Multidisciplinary Care Planning',
        description: 'Coordinate care across specialties',
        timeframe: 'Ongoing',
        prerequisites: ['Confirmed diagnosis'],
        actions: [
          'Neurological follow-up',
          'Therapy referrals',
          'Educational planning',
          'Family support services'
        ],
        expectedOutcomes: ['Comprehensive care plan'],
        nextSteps: ['Regular monitoring', 'Symptom management']
      }
    ]);
  }

  private initializeDrugInteractions(): void {
    // Common rare disease medication interactions
    this.drugInteractions.set('valproic acid-warfarin', ['Increased bleeding risk']);
    this.drugInteractions.set('growth hormone-insulin', ['Monitor glucose levels']);
    this.drugInteractions.set('levetiracetam-phenytoin', ['Altered seizure threshold']);
  }

  private isRecommendationAppropriate(
    rec: TreatmentRecommendation,
    age?: number,
    sex?: string,
    comorbidities: string[] = []
  ): boolean {
    // Check contraindications
    for (const contraindication of rec.contraindications) {
      if (comorbidities.some(c => c.toLowerCase().includes(contraindication.toLowerCase()))) {
        return false;
      }
    }

    // Age-specific checks (simplified)
    if (age && rec.name.includes('growth hormone') && age > 18) {
      return false; // Growth hormone typically for pediatric use
    }

    return true;
  }

  private getGenericPathway(): ClinicalPathway[] {
    return [
      {
        stepId: 'GENERIC_STEP1',
        title: 'Clinical Evaluation',
        description: 'Initial assessment and symptom documentation',
        timeframe: 'Initial visit',
        prerequisites: ['Patient presentation'],
        actions: ['History taking', 'Physical examination', 'Symptom documentation'],
        expectedOutcomes: ['Clinical impression'],
        nextSteps: ['Diagnostic workup']
      },
      {
        stepId: 'GENERIC_STEP2',
        title: 'Diagnostic Workup',
        description: 'Targeted testing based on clinical findings',
        timeframe: '1-4 weeks',
        prerequisites: ['Clinical assessment'],
        actions: ['Laboratory tests', 'Imaging studies', 'Genetic testing if indicated'],
        expectedOutcomes: ['Diagnostic confirmation'],
        nextSteps: ['Treatment planning']
      }
    ];
  }

  private generateProgressNote(
    patientId: string,
    symptoms: string[],
    diagnosis: string,
    recommendations: TreatmentRecommendation[],
    riskAssessment: RiskAssessment[]
  ): string {
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    return `
PROGRESS NOTE
Date: ${date} Time: ${time}
Patient ID: ${patientId}

CHIEF COMPLAINT:
${symptoms.slice(0, 3).join(', ')}

ASSESSMENT:
${diagnosis}

RISK STRATIFICATION:
${riskAssessment.map(r => `${r.category}: ${r.level.toUpperCase()} risk (Score: ${r.score})`).join('\n')}

TREATMENT PLAN:
${recommendations.map((r, i) => `${i + 1}. ${r.name} (Evidence Level ${r.evidenceLevel}, Priority: ${r.priority})`).join('\n')}

MONITORING REQUIREMENTS:
${recommendations.flatMap(r => r.monitoringRequirements).join('\n- ')}

FOLLOW-UP:
${this.determineFollowUpSchedule(riskAssessment)}

Physician: [Electronic Signature]
    `.trim();
  }

  private determineFollowUpSchedule(riskAssessment: RiskAssessment[]): string {
    const highestRisk = riskAssessment.reduce((max, current) => 
      current.score > max.score ? current : max, { score: 0, urgency: 'routine' }
    );

    switch (highestRisk.urgency) {
      case 'immediate': return 'Emergency consultation required';
      case 'within-24h': return 'Follow-up within 24 hours';
      case 'within-week': return 'Follow-up within 1 week';
      default: return 'Routine follow-up in 3-6 months';
    }
  }

  private mapDiagnosisToICD(diagnosis: string): string {
    const icdMapping: { [key: string]: string } = {
      'Angelman syndrome': 'Q93.5',
      'Prader-Willi syndrome': 'Q87.1',
      'DiGeorge syndrome': 'D82.1',
      'Williams-Beuren syndrome': 'Q93.82',
      'Fragile X syndrome': 'Q99.2'
    };

    return icdMapping[diagnosis] || 'Z87.891'; // Personal history of genetic disorder
  }

  private determineCPTCodes(recommendations: TreatmentRecommendation[]): string[] {
    const codes = ['99213']; // Office visit, moderate complexity
    
    if (recommendations.some(r => r.type === 'therapy')) {
      codes.push('97110'); // Therapeutic exercise
    }
    
    if (recommendations.some(r => r.name.includes('genetic'))) {
      codes.push('96040'); // Medical genetics counseling
    }

    return codes;
  }
}

export const cdssService = new CDSSService();