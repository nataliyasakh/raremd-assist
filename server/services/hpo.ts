export interface HpoTerm {
  id: string;
  label: string;
  definition?: string;
  synonyms?: string[];
  isObsolete?: boolean;
}

export interface HpoResponse {
  terms: HpoTerm[];
}

export class HpoService {
  private hpoApiUrl = 'https://hpo.jax.org/api/hpo';
  private hpoTerms: Map<string, HpoTerm> = new Map();

  async loadHpoTerms(): Promise<void> {
    try {
      // Load HPO terms from the official API
      const response = await fetch(`${this.hpoApiUrl}/terms`);
      
      if (!response.ok) {
        throw new Error(`HPO API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store terms in memory for quick access
      if (data.terms) {
        for (const term of data.terms) {
          this.hpoTerms.set(term.id, term);
        }
      }
    } catch (error) {
      console.error('Error loading HPO terms:', error);
      // Fallback to basic terms if API fails
      this.loadFallbackTerms();
    }
  }

  private loadFallbackTerms(): void {
    // Comprehensive fallback terms for development
    const fallbackTerms: HpoTerm[] = [
      // Neurological symptoms
      {
        id: 'HP:0001263',
        label: 'Global developmental delay',
        definition: 'A delay in the achievement of motor or mental milestones in the domains of development of a child.',
        synonyms: ['Developmental delay', 'Delayed development']
      },
      {
        id: 'HP:0001249',
        label: 'Intellectual disability',
        definition: 'Subnormal intellectual functioning which originates during the developmental period.',
        synonyms: ['Mental retardation', 'Cognitive impairment']
      },
      {
        id: 'HP:0001250',
        label: 'Seizures',
        definition: 'Seizures are an abnormal electrical discharge in the brain.',
        synonyms: ['Seizure', 'Epileptic seizure']
      },
      {
        id: 'HP:0001252',
        label: 'Muscular hypotonia',
        definition: 'Muscular hypotonia is an abnormally low muscle tone.',
        synonyms: ['Hypotonia', 'Low muscle tone', 'Floppy baby syndrome']
      },
      {
        id: 'HP:0000750',
        label: 'Delayed speech and language development',
        definition: 'A degree of language development that is significantly below the norm for a child of a specified age.',
        synonyms: ['Speech delay', 'Language delay']
      },
      // Growth and development
      {
        id: 'HP:0001508',
        label: 'Failure to thrive',
        definition: 'Failure to thrive refers to a child whose physical growth is substantially below the norm.',
        synonyms: ['Growth retardation', 'Poor growth']
      },
      {
        id: 'HP:0000252',
        label: 'Microcephaly',
        definition: 'Occipito-frontal (head) circumference (OFC) less than -3 standard deviations compared to appropriate, age matched, sex-matched normal controls.',
        synonyms: ['Small head', 'Reduced head circumference']
      },
      {
        id: 'HP:0000256',
        label: 'Macrocephaly',
        definition: 'Occipito-frontal (head) circumference (OFC) greater than 97th centile compared to appropriate, age matched, sex-matched normal controls.',
        synonyms: ['Large head', 'Increased head circumference']
      },
      // Gastrointestinal symptoms
      {
        id: 'HP:0001744',
        label: 'Splenomegaly',
        definition: 'Abnormally increased size of the spleen.',
        synonyms: ['Enlarged spleen', 'Spleen enlargement']
      },
      {
        id: 'HP:0002240',
        label: 'Hepatomegaly',
        definition: 'Abnormally increased size of the liver.',
        synonyms: ['Enlarged liver', 'Liver enlargement']
      },
      // Hematological symptoms
      {
        id: 'HP:0001903',
        label: 'Anemia',
        definition: 'A reduction in the number of circulating erythrocytes or in the quantity of hemoglobin.',
        synonyms: ['Low hemoglobin', 'Reduced red blood cells']
      },
      // Musculoskeletal symptoms
      {
        id: 'HP:0000938',
        label: 'Osteopenia',
        definition: 'Reduced bone mineral density.',
        synonyms: ['Bone thinning', 'Reduced bone density']
      },
      {
        id: 'HP:0001382',
        label: 'Joint hypermobility',
        definition: 'The ability of a joint to move beyond its normal range of motion.',
        synonyms: ['Joint laxity', 'Hypermobile joints']
      },
      {
        id: 'HP:0001166',
        label: 'Arachnodactyly',
        definition: 'Abnormally long and slender fingers and toes.',
        synonyms: ['Spider fingers', 'Long fingers']
      },
      // Cardiovascular symptoms
      {
        id: 'HP:0001919',
        label: 'Acute kidney injury',
        definition: 'Acute kidney injury is a sudden episode of kidney failure or damage.',
        synonyms: ['Acute renal failure', 'Kidney failure']
      },
      {
        id: 'HP:0001635',
        label: 'Congestive heart failure',
        definition: 'The inability of the heart to pump blood at an adequate rate.',
        synonyms: ['Heart failure', 'Cardiac failure']
      },
      // Skin and connective tissue
      {
        id: 'HP:0000974',
        label: 'Hyperextensible skin',
        definition: 'Skin that can be stretched beyond the normal range.',
        synonyms: ['Stretchy skin', 'Elastic skin']
      },
      {
        id: 'HP:0000978',
        label: 'Bruising susceptibility',
        definition: 'An increased susceptibility to bruising.',
        synonyms: ['Easy bruising', 'Bruises easily']
      },
      {
        id: 'HP:0000957',
        label: 'Cafe-au-lait spot',
        definition: 'Flat, brown colored skin lesions.',
        synonyms: ['Coffee-colored spots', 'Brown spots']
      },
      // Neurological features
      {
        id: 'HP:0002076',
        label: 'Migraine',
        definition: 'A recurrent headache disorder.',
        synonyms: ['Migraine headache', 'Severe headache']
      },
      // Skeletal features
      {
        id: 'HP:0000768',
        label: 'Pectus carinatum',
        definition: 'A deformity of the chest wall in which the chest protrudes.',
        synonyms: ['Pigeon chest', 'Protruding chest']
      },
      {
        id: 'HP:0001519',
        label: 'Disproportionate tall stature',
        definition: 'Tall stature that is disproportionate to genetic background.',
        synonyms: ['Tall stature', 'Excessive height']
      },
      // Ocular features
      {
        id: 'HP:0000545',
        label: 'Myopia',
        definition: 'An abnormality of refraction characterized by the ability to see objects nearby clearly.',
        synonyms: ['Nearsightedness', 'Short sight']
      },
      // Additional dermatological features
      {
        id: 'HP:0001065',
        label: 'Striae distensae',
        definition: 'Stretch marks on the skin.',
        synonyms: ['Stretch marks', 'Skin striae']
      },
      {
        id: 'HP:0008404',
        label: 'Nail dystrophy',
        definition: 'Abnormal nail formation.',
        synonyms: ['Abnormal nails', 'Nail abnormalities']
      },
      {
        id: 'HP:0001067',
        label: 'Neurofibromas',
        definition: 'Benign tumors of the peripheral nervous system.',
        synonyms: ['Nerve tumors', 'Peripheral nerve tumors']
      },
      {
        id: 'HP:0012378',
        label: 'Fatigue',
        definition: 'A subjective feeling of tiredness characterized by a lack of energy and motivation.',
        synonyms: ['Tiredness', 'Exhaustion', 'Lack of energy']
      }
    ];

    for (const term of fallbackTerms) {
      this.hpoTerms.set(term.id, term);
    }
  }

  async searchTerms(query: string): Promise<HpoTerm[]> {
    const lowerQuery = query.toLowerCase();
    const results: HpoTerm[] = [];

    for (const term of this.hpoTerms.values()) {
      if (term.isObsolete) continue;
      
      const matchesLabel = term.label.toLowerCase().includes(lowerQuery);
      const matchesId = term.id.toLowerCase().includes(lowerQuery);
      const matchesSynonyms = term.synonyms?.some(syn => 
        syn.toLowerCase().includes(lowerQuery)
      );

      if (matchesLabel || matchesId || matchesSynonyms) {
        results.push(term);
      }
    }

    return results.slice(0, 10); // Limit results
  }

  async getTermById(hpoId: string): Promise<HpoTerm | null> {
    return this.hpoTerms.get(hpoId) || null;
  }

  async getAllTerms(): Promise<HpoTerm[]> {
    return Array.from(this.hpoTerms.values()).filter(term => !term.isObsolete);
  }

  async initializeService(): Promise<void> {
    await this.loadHpoTerms();
  }
}

export const hpoService = new HpoService();
