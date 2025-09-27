import { Disease, HpoTerm } from "@shared/schema";

export interface MLPrediction {
  diseaseId: number;
  confidence: number;
  reasoning: string[];
  mlScore: number;
  patternMatch: number;
  rarenessPenalty: number;
}

export interface MLModelWeights {
  symptomFrequency: number;
  phenotypeSpecificity: number;
  symptomCombination: number;
  temporalPattern: number;
  demographicFactors: number;
}

export interface PatientProfile {
  age?: number;
  sex?: string;
  ethnicity?: string;
  familyHistory?: string[];
  symptoms: Array<{
    hpoId: string;
    severity?: string;
    onset?: string;
    duration?: string;
  }>;
}

export class MLEngine {
  private modelWeights: MLModelWeights = {
    symptomFrequency: 0.35,
    phenotypeSpecificity: 0.25,
    symptomCombination: 0.20,
    temporalPattern: 0.15,
    demographicFactors: 0.05
  };

  private symptomCombinationPatterns: Map<string, number> = new Map();
  private diseaseFrequencyData: Map<number, number> = new Map();

  constructor() {
    this.initializeMLData();
  }

  private initializeMLData(): void {
    // Initialize symptom combination patterns based on medical literature
    this.symptomCombinationPatterns.set("HP:0001263,HP:0001250", 0.85); // Dev delay + seizures
    this.symptomCombinationPatterns.set("HP:0001252,HP:0001508", 0.78); // Hypotonia + failure to thrive
    this.symptomCombinationPatterns.set("HP:0000175,HP:0001639", 0.82); // Cleft palate + cardiomyopathy
    this.symptomCombinationPatterns.set("HP:0000256,HP:0000717", 0.75); // Macrocephaly + autism
    this.symptomCombinationPatterns.set("HP:0000316,HP:0004322", 0.70); // Hypertelorism + short stature

    // Initialize disease frequency data (cases per 100,000)
    this.diseaseFrequencyData.set(1, 2.5); // Angelman syndrome
    this.diseaseFrequencyData.set(2, 3.2); // Prader-Willi syndrome
    this.diseaseFrequencyData.set(3, 4.1); // DiGeorge syndrome
    this.diseaseFrequencyData.set(4, 2.8); // Williams-Beuren syndrome
    this.diseaseFrequencyData.set(5, 3.5); // Fragile X syndrome
  }

  async generatePredictions(
    patientProfile: PatientProfile,
    diseases: Disease[],
    hpoTerms: HpoTerm[]
  ): Promise<MLPrediction[]> {
    const predictions: MLPrediction[] = [];

    for (const disease of diseases) {
      const prediction = await this.scoreDiseaseForPatient(disease, patientProfile, hpoTerms);
      predictions.push(prediction);
    }

    // Sort by ML confidence score
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  private async scoreDiseaseForPatient(
    disease: Disease,
    patientProfile: PatientProfile,
    hpoTerms: HpoTerm[]
  ): Promise<MLPrediction> {
    const reasoning: string[] = [];
    
    // Calculate individual scoring components
    const frequencyScore = this.calculateSymptomFrequencyScore(disease, patientProfile, reasoning);
    const specificityScore = this.calculatePhenotypeSpecificityScore(disease, patientProfile, reasoning);
    const combinationScore = this.calculateSymptomCombinationScore(disease, patientProfile, reasoning);
    const temporalScore = this.calculateTemporalPatternScore(disease, patientProfile, reasoning);
    const demographicScore = this.calculateDemographicScore(disease, patientProfile, reasoning);

    // Weighted ML score calculation
    const mlScore = (
      frequencyScore * this.modelWeights.symptomFrequency +
      specificityScore * this.modelWeights.phenotypeSpecificity +
      combinationScore * this.modelWeights.symptomCombination +
      temporalScore * this.modelWeights.temporalPattern +
      demographicScore * this.modelWeights.demographicFactors
    );

    // Calculate pattern match percentage
    const patternMatch = this.calculatePatternMatch(disease, patientProfile);

    // Apply rareness penalty (more common diseases get slight boost)
    const rarenessPenalty = this.calculateRarenessPenalty(disease.id);

    // Final confidence with ML enhancements
    const confidence = Math.min(95, Math.max(5, 
      mlScore * 100 * (1 + rarenessPenalty)
    ));

    return {
      diseaseId: disease.id,
      confidence: Math.round(confidence * 100) / 100,
      reasoning,
      mlScore: Math.round(mlScore * 1000) / 1000,
      patternMatch: Math.round(patternMatch * 100) / 100,
      rarenessPenalty: Math.round(rarenessPenalty * 1000) / 1000
    };
  }

  private calculateSymptomFrequencyScore(
    disease: Disease,
    patientProfile: PatientProfile,
    reasoning: string[]
  ): number {
    let score = 0;
    let matchedSymptoms = 0;

    for (const patientSymptom of patientProfile.symptoms) {
      const matchingPhenotype = disease.phenotypes.find(p => p.hpoId === patientSymptom.hpoId);
      
      if (matchingPhenotype) {
        matchedSymptoms++;
        
        // Weight by frequency in disease
        const frequencyWeight = this.getFrequencyWeight(matchingPhenotype.frequency);
        score += frequencyWeight;
        
        reasoning.push(`${matchingPhenotype.description} (${matchingPhenotype.frequency} in ${disease.name})`);
      }
    }

    // Normalize by total possible symptoms
    const normalizedScore = Math.min(1, score / Math.max(1, disease.phenotypes.length * 0.7));
    
    if (matchedSymptoms > 0) {
      reasoning.push(`Matched ${matchedSymptoms}/${patientProfile.symptoms.length} patient symptoms`);
    }

    return normalizedScore;
  }

  private calculatePhenotypeSpecificityScore(
    disease: Disease,
    patientProfile: PatientProfile,
    reasoning: string[]
  ): number {
    let specificityScore = 0;
    let specificMatches = 0;

    for (const patientSymptom of patientProfile.symptoms) {
      const matchingPhenotype = disease.phenotypes.find(p => p.hpoId === patientSymptom.hpoId);
      
      if (matchingPhenotype) {
        // Higher score for obligate/frequent symptoms
        if (matchingPhenotype.frequency === 'obligate') {
          specificityScore += 1.0;
          specificMatches++;
          reasoning.push(`Obligate symptom match: ${matchingPhenotype.description}`);
        } else if (matchingPhenotype.frequency === 'frequent') {
          specificityScore += 0.8;
          specificMatches++;
        }
      }
    }

    if (specificMatches > 0) {
      reasoning.push(`${specificMatches} high-specificity symptom matches`);
    }

    return Math.min(1, specificityScore / Math.max(1, patientProfile.symptoms.length));
  }

  private calculateSymptomCombinationScore(
    disease: Disease,
    patientProfile: PatientProfile,
    reasoning: string[]
  ): number {
    let combinationScore = 0;
    const patientHpoIds = patientProfile.symptoms.map(s => s.hpoId);

    // Check for known symptom combinations
    for (const [pattern, weight] of this.symptomCombinationPatterns.entries()) {
      const patternSymptoms = pattern.split(',');
      
      if (patternSymptoms.every(hpoId => patientHpoIds.includes(hpoId))) {
        // Check if this combination exists in the disease
        const diseaseHpoIds = disease.phenotypes.map(p => p.hpoId);
        if (patternSymptoms.every(hpoId => diseaseHpoIds.includes(hpoId))) {
          combinationScore += weight;
          reasoning.push(`Recognized symptom pattern: ${patternSymptoms.join(' + ')}`);
        }
      }
    }

    return Math.min(1, combinationScore);
  }

  private calculateTemporalPatternScore(
    disease: Disease,
    patientProfile: PatientProfile,
    reasoning: string[]
  ): number {
    let temporalScore = 0.5; // Default neutral score

    // Age-based scoring
    if (patientProfile.age) {
      // Pediatric conditions score higher for younger patients
      if (patientProfile.age < 18) {
        temporalScore += 0.3;
        reasoning.push(`Pediatric presentation aligns with genetic disorder profile`);
      }
      
      // Early onset indicators
      const earlyOnsetSymptoms = patientProfile.symptoms.filter(s => 
        s.onset === 'congenital' || s.onset === 'neonatal' || s.onset === 'infantile'
      );
      
      if (earlyOnsetSymptoms.length > 0) {
        temporalScore += 0.2;
        reasoning.push(`Early onset symptoms support genetic etiology`);
      }
    }

    return Math.min(1, temporalScore);
  }

  private calculateDemographicScore(
    disease: Disease,
    patientProfile: PatientProfile,
    reasoning: string[]
  ): number {
    let demographicScore = 0.5; // Neutral baseline

    // Family history considerations
    if (patientProfile.familyHistory && patientProfile.familyHistory.length > 0) {
      demographicScore += 0.3;
      reasoning.push(`Family history suggests genetic component`);
    }

    // Sex-linked considerations
    if (patientProfile.sex) {
      // Some conditions have sex preferences
      if (disease.name.toLowerCase().includes('fragile x') && patientProfile.sex === 'male') {
        demographicScore += 0.2;
        reasoning.push(`Male sex increases likelihood for X-linked condition`);
      }
    }

    return Math.min(1, demographicScore);
  }

  private calculatePatternMatch(disease: Disease, patientProfile: PatientProfile): number {
    const diseaseSymptoms = new Set(disease.phenotypes.map(p => p.hpoId));
    const patientSymptoms = new Set(patientProfile.symptoms.map(s => s.hpoId));
    
    const intersection = new Set([...patientSymptoms].filter(x => diseaseSymptoms.has(x)));
    const union = new Set([...patientSymptoms, ...diseaseSymptoms]);
    
    return intersection.size / union.size;
  }

  private calculateRarenessPenalty(diseaseId: number): number {
    const frequency = this.diseaseFrequencyData.get(diseaseId) || 1.0;
    
    // More common diseases get slight boost (less penalty)
    // Scale: very rare (1/100k) gets -0.1, common (5/100k) gets +0.05
    return (frequency - 2.5) / 50;
  }

  private getFrequencyWeight(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'obligate':
      case 'very_frequent':
        return 1.0;
      case 'frequent':
        return 0.8;
      case 'occasional':
        return 0.6;
      case 'rare':
        return 0.4;
      case 'very_rare':
        return 0.2;
      default:
        return 0.5;
    }
  }

  // Model training simulation (for future real ML integration)
  async updateModelWeights(trainingData: Array<{
    patientProfile: PatientProfile;
    confirmedDiagnosis: number;
    outcome: 'correct' | 'incorrect';
  }>): Promise<void> {
    // Simulate model weight updates based on training outcomes
    let correctPredictions = 0;
    const totalPredictions = trainingData.length;

    for (const data of trainingData) {
      if (data.outcome === 'correct') {
        correctPredictions++;
      }
    }

    const accuracy = correctPredictions / totalPredictions;
    
    // Adjust weights based on performance (simplified approach)
    if (accuracy < 0.7) {
      // Increase weight on more reliable features
      this.modelWeights.symptomFrequency += 0.05;
      this.modelWeights.phenotypeSpecificity += 0.03;
    }

    console.log(`ML Model updated. Current accuracy: ${(accuracy * 100).toFixed(1)}%`);
  }

  getModelMetrics(): {
    weights: MLModelWeights;
    patternCount: number;
    diseaseCount: number;
  } {
    return {
      weights: { ...this.modelWeights },
      patternCount: this.symptomCombinationPatterns.size,
      diseaseCount: this.diseaseFrequencyData.size
    };
  }
}