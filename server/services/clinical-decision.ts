interface TreatmentRecommendation {
  medication: string;
  dosage: string;
  frequency: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  contraindications: string[];
  monitoringRequired: string[];
}

interface ClinicalPathway {
  step: number;
  action: string;
  timeframe: string;
  urgency: 'immediate' | 'urgent' | 'routine';
  followUp: string;
}

export class ClinicalDecisionService {
  async getTreatmentRecommendations(orphaCode: string): Promise<TreatmentRecommendation[]> {
    // Simulated treatment recommendations based on rare disease
    const treatmentMap: Record<string, TreatmentRecommendation[]> = {
      'ORPHA:72': [ // Angelman syndrome
        {
          medication: 'Levetiracetam',
          dosage: '20-40 mg/kg/day',
          frequency: 'Twice daily',
          evidenceLevel: 'B',
          contraindications: ['Severe renal impairment'],
          monitoringRequired: ['CBC', 'Renal function', 'Behavior assessment']
        }
      ],
      'ORPHA:908': [ // Fragile X syndrome
        {
          medication: 'Risperidone',
          dosage: '0.25-3 mg/day',
          frequency: 'Once daily',
          evidenceLevel: 'B',
          contraindications: ['QT prolongation', 'Severe hepatic impairment'],
          monitoringRequired: ['Weight', 'ECG', 'Metabolic panel']
        }
      ]
    };

    return treatmentMap[orphaCode] || [];
  }

  async getClinicalPathway(orphaCode: string): Promise<ClinicalPathway[]> {
    // Standardized clinical pathways for rare diseases
    return [
      {
        step: 1,
        action: 'Confirm clinical diagnosis with genetic testing',
        timeframe: '2-4 weeks',
        urgency: 'urgent',
        followUp: 'Genetic counseling referral'
      },
      {
        step: 2,
        action: 'Initiate multidisciplinary care team',
        timeframe: '1-2 weeks',
        urgency: 'urgent',
        followUp: 'Pediatric subspecialty consultations'
      },
      {
        step: 3,
        action: 'Develop individualized treatment plan',
        timeframe: '2-3 weeks',
        urgency: 'routine',
        followUp: 'Regular monitoring schedule'
      }
    ];
  }

  async checkDrugInteractions(medications: string[]): Promise<{
    interactions: Array<{
      drugs: string[];
      severity: 'major' | 'moderate' | 'minor';
      description: string;
      recommendation: string;
    }>;
  }> {
    // Drug interaction checking for rare disease medications
    const interactions = [];
    
    if (medications.includes('Levetiracetam') && medications.includes('Phenytoin')) {
      interactions.push({
        drugs: ['Levetiracetam', 'Phenytoin'],
        severity: 'moderate' as const,
        description: 'Phenytoin may reduce levetiracetam efficacy',
        recommendation: 'Monitor seizure control; adjust dosing as needed'
      });
    }

    return { interactions };
  }

  async getRiskAssessment(symptoms: Array<{ hpoId: string; frequency: string }>): Promise<{
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    urgentCare: boolean;
    reasoning: string;
    recommendations: string[];
  }> {
    // Assess patient risk based on symptoms
    const highRiskSymptoms = ['HP:0001250', 'HP:0002017', 'HP:0002086']; // Seizures, vomiting, dyspnea
    const hasHighRisk = symptoms.some(s => highRiskSymptoms.includes(s.hpoId));

    if (hasHighRisk) {
      return {
        riskLevel: 'high',
        urgentCare: true,
        reasoning: 'Patient presents with symptoms requiring immediate medical attention',
        recommendations: [
          'Immediate emergency department evaluation',
          'Continuous monitoring',
          'Specialist consultation within 24 hours'
        ]
      };
    }

    return {
      riskLevel: 'moderate',
      urgentCare: false,
      reasoning: 'Symptoms suggest rare disease but not immediately life-threatening',
      recommendations: [
        'Genetic consultation within 2-4 weeks',
        'Comprehensive diagnostic workup',
        'Family counseling and support'
      ]
    };
  }
}

export const clinicalDecisionService = new ClinicalDecisionService();