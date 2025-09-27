export interface ScoringResult {
  score: number;
  keyMatches: number;
  supportingMatches: number;
  priority: 'high' | 'medium' | 'low';
}

export interface Symptom {
  hpoId: string;
  label: string;
  frequency?: string;
}

export interface Disease {
  id: number;
  orphaCode: string;
  name: string;
  definition?: string;
  phenotypes: Array<{
    hpoId: string;
    label: string;
    frequency: string;
  }>;
}

export class ScoringEngine {
  /**
   * Calculate disease score based on symptom matches
   * Algorithm: 2 × (key symptoms matched) + (supporting symptoms matched)
   */
  static calculateScore(symptoms: Symptom[], disease: Disease): ScoringResult {
    let keyMatches = 0;
    let supportingMatches = 0;

    for (const symptom of symptoms) {
      const phenotype = disease.phenotypes.find(p => p.hpoId === symptom.hpoId);
      if (phenotype) {
        if (this.isKeySymptom(phenotype.frequency)) {
          keyMatches++;
        } else {
          supportingMatches++;
        }
      }
    }

    const score = (keyMatches * 2) + supportingMatches;
    const priority = this.determinePriority(score);

    return {
      score,
      keyMatches,
      supportingMatches,
      priority
    };
  }

  /**
   * Determine if a symptom is a key symptom based on frequency
   */
  private static isKeySymptom(frequency: string): boolean {
    const keyFrequencies = ['very_frequent', 'obligate', 'frequent'];
    return keyFrequencies.includes(frequency.toLowerCase());
  }

  /**
   * Determine priority level based on score
   */
  private static determinePriority(score: number): 'high' | 'medium' | 'low' {
    if (score >= 7) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  /**
   * Get frequency weight for scoring algorithms
   */
  static getFrequencyWeight(frequency: string): number {
    switch (frequency.toLowerCase()) {
      case 'very_frequent':
      case 'obligate':
        return 3;
      case 'frequent':
        return 2;
      case 'occasional':
        return 1;
      case 'very_rare':
        return 0.5;
      default:
        return 1;
    }
  }

  /**
   * Filter diseases by minimum score threshold
   */
  static filterByThreshold(results: ScoringResult[], threshold = 3): ScoringResult[] {
    return results.filter(result => result.score >= threshold);
  }

  /**
   * Sort results by score (descending)
   */
  static sortByScore(results: ScoringResult[]): ScoringResult[] {
    return results.sort((a, b) => b.score - a.score);
  }
}
