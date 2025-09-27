import { MLEngine, MLPrediction, PatientProfile } from "./ml-engine";
import { Disease, HpoTerm } from "@shared/schema";

export interface EnhancedDiseaseMatch {
  disease: Disease;
  ruleBasedScore: number;
  mlPrediction: MLPrediction;
  combinedScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
  clinicalEvidence: {
    strongIndicators: string[];
    supportingEvidence: string[];
    weakEvidence: string[];
  };
}

export interface PredictionMetrics {
  totalDiseases: number;
  highConfidenceMatches: number;
  mediumConfidenceMatches: number;
  lowConfidenceMatches: number;
  averageConfidence: number;
  processingTime: number;
}

export class PredictionService {
  private mlEngine: MLEngine;

  constructor() {
    this.mlEngine = new MLEngine();
  }

  async generateEnhancedPredictions(
    symptoms: string[],
    patientProfile: Partial<PatientProfile>,
    diseases: Disease[],
    hpoTerms: HpoTerm[]
  ): Promise<{
    matches: EnhancedDiseaseMatch[];
    metrics: PredictionMetrics;
    recommendations: string[];
  }> {
    const startTime = Date.now();

    // Convert symptoms to patient profile format
    const fullPatientProfile: PatientProfile = {
      ...patientProfile,
      symptoms: symptoms.map(symptom => ({ hpoId: symptom }))
    };

    // Generate ML predictions
    const mlPredictions = await this.mlEngine.generatePredictions(
      fullPatientProfile,
      diseases,
      hpoTerms
    );

    // Generate rule-based scores for comparison
    const enhancedMatches: EnhancedDiseaseMatch[] = [];

    for (const disease of diseases) {
      const mlPrediction = mlPredictions.find(p => p.diseaseId === disease.id);
      if (!mlPrediction) continue;

      const ruleBasedScore = this.calculateRuleBasedScore(disease, symptoms);
      const combinedScore = this.calculateCombinedScore(ruleBasedScore, mlPrediction);
      
      const enhancedMatch: EnhancedDiseaseMatch = {
        disease,
        ruleBasedScore,
        mlPrediction,
        combinedScore,
        confidenceLevel: this.determineConfidenceLevel(combinedScore),
        recommendations: this.generateRecommendations(disease, mlPrediction, combinedScore),
        clinicalEvidence: this.categorizeEvidence(disease, symptoms, mlPrediction)
      };

      enhancedMatches.push(enhancedMatch);
    }

    // Sort by combined score
    enhancedMatches.sort((a, b) => b.combinedScore - a.combinedScore);

    const processingTime = Date.now() - startTime;
    const metrics = this.calculateMetrics(enhancedMatches, processingTime);
    const globalRecommendations = this.generateGlobalRecommendations(enhancedMatches);

    return {
      matches: enhancedMatches,
      metrics,
      recommendations: globalRecommendations
    };
  }

  private calculateRuleBasedScore(disease: Disease, symptoms: string[]): number {
    let score = 0;
    let maxPossibleScore = 0;

    for (const phenotype of disease.phenotypes) {
      const weight = this.getFrequencyWeight(phenotype.frequency);
      maxPossibleScore += weight;

      if (symptoms.includes(phenotype.hpoId)) {
        score += weight;
      }
    }

    return maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
  }

  private calculateCombinedScore(ruleBasedScore: number, mlPrediction: MLPrediction): number {
    // Weighted combination: 40% rule-based, 60% ML
    const ruleWeight = 0.4;
    const mlWeight = 0.6;

    return (ruleBasedScore * ruleWeight) + (mlPrediction.confidence * mlWeight);
  }

  private determineConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private generateRecommendations(
    disease: Disease,
    mlPrediction: MLPrediction,
    combinedScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (combinedScore >= 75) {
      recommendations.push('Consider genetic testing for confirmation');
      recommendations.push('Refer to genetics specialist for evaluation');
      recommendations.push('Review family history for inheritance patterns');
    } else if (combinedScore >= 50) {
      recommendations.push('Additional clinical evaluation recommended');
      recommendations.push('Consider targeted genetic testing');
      recommendations.push('Monitor for additional symptoms');
    } else {
      recommendations.push('Low probability - consider alternative diagnoses');
      recommendations.push('Reassess if new symptoms develop');
      recommendations.push('Consider broader differential diagnosis');
    }

    // Add ML-specific recommendations based on reasoning
    if (mlPrediction.reasoning.some(r => r.includes('Obligate'))) {
      recommendations.push('High-priority match due to obligate symptom presence');
    }

    if (mlPrediction.patternMatch > 0.8) {
      recommendations.push('Strong phenotypic pattern match identified');
    }

    return recommendations;
  }

  private categorizeEvidence(
    disease: Disease,
    symptoms: string[],
    mlPrediction: MLPrediction
  ): {
    strongIndicators: string[];
    supportingEvidence: string[];
    weakEvidence: string[];
  } {
    const strongIndicators: string[] = [];
    const supportingEvidence: string[] = [];
    const weakEvidence: string[] = [];

    for (const phenotype of disease.phenotypes) {
      if (symptoms.includes(phenotype.hpoId)) {
        if (phenotype.frequency === 'obligate') {
          strongIndicators.push(`${phenotype.description} (obligate in ${disease.name})`);
        } else if (phenotype.frequency === 'frequent') {
          supportingEvidence.push(`${phenotype.description} (frequent in ${disease.name})`);
        } else {
          weakEvidence.push(`${phenotype.description} (${phenotype.frequency} in ${disease.name})`);
        }
      }
    }

    // Add ML-derived evidence
    mlPrediction.reasoning.forEach(reason => {
      if (reason.includes('Obligate') || reason.includes('pattern')) {
        strongIndicators.push(`ML Analysis: ${reason}`);
      } else if (reason.includes('high-specificity') || reason.includes('Matched')) {
        supportingEvidence.push(`ML Analysis: ${reason}`);
      } else {
        weakEvidence.push(`ML Analysis: ${reason}`);
      }
    });

    return { strongIndicators, supportingEvidence, weakEvidence };
  }

  private calculateMetrics(matches: EnhancedDiseaseMatch[], processingTime: number): PredictionMetrics {
    const high = matches.filter(m => m.confidenceLevel === 'high').length;
    const medium = matches.filter(m => m.confidenceLevel === 'medium').length;
    const low = matches.filter(m => m.confidenceLevel === 'low').length;

    const averageConfidence = matches.reduce((sum, m) => sum + m.combinedScore, 0) / matches.length;

    return {
      totalDiseases: matches.length,
      highConfidenceMatches: high,
      mediumConfidenceMatches: medium,
      lowConfidenceMatches: low,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      processingTime
    };
  }

  private generateGlobalRecommendations(matches: EnhancedDiseaseMatch[]): string[] {
    const recommendations: string[] = [];

    const highConfidenceMatches = matches.filter(m => m.confidenceLevel === 'high');
    
    if (highConfidenceMatches.length === 0) {
      recommendations.push('No high-confidence matches found - consider broader differential diagnosis');
      recommendations.push('Additional clinical data may be needed for accurate prediction');
    } else if (highConfidenceMatches.length === 1) {
      recommendations.push(`Single high-confidence match identified: ${highConfidenceMatches[0].disease.name}`);
      recommendations.push('Recommend genetic confirmation and specialist consultation');
    } else {
      recommendations.push(`Multiple high-confidence matches (${highConfidenceMatches.length}) - differential diagnosis needed`);
      recommendations.push('Consider genetic panel testing covering identified conditions');
    }

    // ML model performance insights
    const avgMlConfidence = matches.reduce((sum, m) => sum + m.mlPrediction.confidence, 0) / matches.length;
    if (avgMlConfidence > 70) {
      recommendations.push('High ML model confidence in predictions - results are reliable');
    } else if (avgMlConfidence < 40) {
      recommendations.push('Lower ML model confidence - consider additional symptom documentation');
    }

    return recommendations;
  }

  private getFrequencyWeight(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'obligate': return 3;
      case 'frequent': return 2;
      case 'occasional': return 1;
      case 'rare': return 0.5;
      default: return 1;
    }
  }

  // Get ML engine metrics for monitoring
  getMLMetrics() {
    return this.mlEngine.getModelMetrics();
  }

  // Update ML model with new training data
  async updateMLModel(trainingData: any[]) {
    return this.mlEngine.updateModelWeights(trainingData);
  }
}