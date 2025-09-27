export interface TestCase {
  id: string;
  title: string;
  description: string;
  patient: {
    age: number;
    sex: 'male' | 'female';
    demographics: string;
  };
  symptoms: Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>;
  expectedDiagnosis: string;
  orphaCode: string;
  difficulty: 'easy' | 'medium' | 'hard';
  clinicalNotes: string;
  recommendations: string[];
}

export class TestCaseService {
  getTestCases(): TestCase[] {
    return [
      {
        id: 'case-001',
        title: 'Developmental Delay with Hypotonia',
        description: '4-year-old with developmental delays and muscle weakness',
        patient: {
          age: 4,
          sex: 'male',
          demographics: 'Caucasian male, born at term'
        },
        symptoms: [
          { hpoId: 'HP:0001263', label: 'Global developmental delay', frequency: 'very_frequent' },
          { hpoId: 'HP:0001252', label: 'Muscular hypotonia', frequency: 'very_frequent' },
          { hpoId: 'HP:0001508', label: 'Failure to thrive', frequency: 'frequent' },
          { hpoId: 'HP:0000750', label: 'Delayed speech and language development', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Prader-Willi syndrome',
        orphaCode: 'ORPHA:739',
        difficulty: 'easy',
        clinicalNotes: 'Patient shows classic triad of hypotonia, feeding difficulties, and later hyperphagia. Family history unremarkable.',
        recommendations: [
          'Genetic testing for 15q11-q13 deletion',
          'Nutritional assessment and management',
          'Early intervention services'
        ]
      },
      {
        id: 'case-002',
        title: 'Progressive Joint Hypermobility',
        description: '16-year-old with joint hypermobility and skin hyperextensibility',
        patient: {
          age: 16,
          sex: 'female',
          demographics: 'Asian female, family history of joint problems'
        },
        symptoms: [
          { hpoId: 'HP:0001382', label: 'Joint hypermobility', frequency: 'very_frequent' },
          { hpoId: 'HP:0000974', label: 'Hyperextensible skin', frequency: 'very_frequent' },
          { hpoId: 'HP:0000978', label: 'Bruising susceptibility', frequency: 'frequent' },
          { hpoId: 'HP:0001065', label: 'Striae distensae', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Ehlers-Danlos syndrome',
        orphaCode: 'ORPHA:576',
        difficulty: 'medium',
        clinicalNotes: 'Patient reports frequent joint dislocations and easy bruising. Skin shows velvety texture and hyperextensibility.',
        recommendations: [
          'Connective tissue disorder genetic panel',
          'Echocardiogram for cardiac involvement',
          'Physical therapy for joint protection'
        ]
      },
      {
        id: 'case-003',
        title: 'Recurrent Respiratory Infections',
        description: '8-year-old with chronic lung disease and growth failure',
        patient: {
          age: 8,
          sex: 'male',
          demographics: 'Caucasian male, positive family history'
        },
        symptoms: [
          { hpoId: 'HP:0012378', label: 'Fatigue', frequency: 'frequent' },
          { hpoId: 'HP:0001508', label: 'Failure to thrive', frequency: 'frequent' },
          { hpoId: 'HP:0002837', label: 'Recurrent bronchopulmonary infections', frequency: 'very_frequent' },
          { hpoId: 'HP:0001738', label: 'Exocrine pancreatic insufficiency', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Cystic fibrosis',
        orphaCode: 'ORPHA:221',
        difficulty: 'easy',
        clinicalNotes: 'Patient has chronic productive cough, poor weight gain despite good appetite, and bulky stools.',
        recommendations: [
          'Sweat chloride test',
          'CFTR gene analysis',
          'Pulmonary function testing'
        ]
      },
      {
        id: 'case-004',
        title: 'Café-au-lait Spots and Learning Difficulties',
        description: '12-year-old with skin lesions and academic struggles',
        patient: {
          age: 12,
          sex: 'female',
          demographics: 'Mixed ethnicity, no family history'
        },
        symptoms: [
          { hpoId: 'HP:0000957', label: 'Cafe-au-lait spot', frequency: 'very_frequent' },
          { hpoId: 'HP:0001067', label: 'Neurofibromas', frequency: 'frequent' },
          { hpoId: 'HP:0001249', label: 'Intellectual disability', frequency: 'frequent' },
          { hpoId: 'HP:0000750', label: 'Delayed speech and language development', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Neurofibromatosis type 1',
        orphaCode: 'ORPHA:587',
        difficulty: 'medium',
        clinicalNotes: 'Patient has >6 café-au-lait spots >5mm diameter, axillary freckling, and small cutaneous neurofibromas.',
        recommendations: [
          'NF1 gene testing',
          'Ophthalmologic examination',
          'MRI brain and spine screening'
        ]
      },
      {
        id: 'case-005',
        title: 'Tall Stature with Cardiac Concerns',
        description: '17-year-old with marfanoid habitus and cardiac findings',
        patient: {
          age: 17,
          sex: 'male',
          demographics: 'Caucasian male, tall thin build'
        },
        symptoms: [
          { hpoId: 'HP:0001166', label: 'Arachnodactyly', frequency: 'very_frequent' },
          { hpoId: 'HP:0000768', label: 'Pectus carinatum', frequency: 'frequent' },
          { hpoId: 'HP:0001519', label: 'Disproportionate tall stature', frequency: 'frequent' },
          { hpoId: 'HP:0000545', label: 'Myopia', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Marfan syndrome',
        orphaCode: 'ORPHA:558',
        difficulty: 'hard',
        clinicalNotes: 'Patient has arm span > height, lens dislocation, and mitral valve prolapse. Positive family history in father.',
        recommendations: [
          'FBN1 gene testing',
          'Echocardiogram and aortic root assessment',
          'Ophthalmologic examination'
        ]
      },
      {
        id: 'case-006',
        title: 'Muscle Weakness and Fatigue',
        description: '45-year-old with progressive muscle weakness',
        patient: {
          age: 45,
          sex: 'female',
          demographics: 'Hispanic female, adult onset'
        },
        symptoms: [
          { hpoId: 'HP:0001252', label: 'Muscular hypotonia', frequency: 'very_frequent' },
          { hpoId: 'HP:0001635', label: 'Congestive heart failure', frequency: 'frequent' },
          { hpoId: 'HP:0003391', label: 'Gowers sign', frequency: 'frequent' },
          { hpoId: 'HP:0012378', label: 'Fatigue', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Pompe disease',
        orphaCode: 'ORPHA:654',
        difficulty: 'hard',
        clinicalNotes: 'Adult-onset form with progressive proximal muscle weakness and respiratory muscle involvement.',
        recommendations: [
          'Acid alpha-glucosidase enzyme activity',
          'GAA gene sequencing',
          'Pulmonary function testing'
        ]
      },
      {
        id: 'case-007',
        title: 'Night Blindness and Visual Field Loss',
        description: '25-year-old with progressive vision problems',
        patient: {
          age: 25,
          sex: 'male',
          demographics: 'Middle Eastern male, consanguineous parents'
        },
        symptoms: [
          { hpoId: 'HP:0000510', label: 'Night blindness', frequency: 'very_frequent' },
          { hpoId: 'HP:0000529', label: 'Progressive visual field defects', frequency: 'very_frequent' },
          { hpoId: 'HP:0000580', label: 'Pigmentary retinal degeneration', frequency: 'very_frequent' },
          { hpoId: 'HP:0000505', label: 'Visual impairment', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Retinitis pigmentosa',
        orphaCode: 'ORPHA:790',
        difficulty: 'medium',
        clinicalNotes: 'Patient reports difficulty seeing at night and bumping into objects. Fundus shows bone spicule pigmentation.',
        recommendations: [
          'Electroretinography',
          'Visual field testing',
          'Retinal dystrophy gene panel'
        ]
      },
      {
        id: 'case-008',
        title: 'Recurrent Fractures in Childhood',
        description: '7-year-old with multiple fractures and blue sclerae',
        patient: {
          age: 7,
          sex: 'female',
          demographics: 'Caucasian female, multiple fractures'
        },
        symptoms: [
          { hpoId: 'HP:0002659', label: 'Increased bone fragility', frequency: 'very_frequent' },
          { hpoId: 'HP:0000541', label: 'Retinal detachment', frequency: 'occasional' },
          { hpoId: 'HP:0000405', label: 'Conductive hearing loss', frequency: 'frequent' },
          { hpoId: 'HP:0000592', label: 'Blue sclerae', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Osteogenesis imperfecta',
        orphaCode: 'ORPHA:550',
        difficulty: 'easy',
        clinicalNotes: 'Patient has had 8 fractures with minimal trauma. Blue sclerae noted on examination.',
        recommendations: [
          'Bone density scan',
          'Collagen biochemistry',
          'COL1A1/COL1A2 gene testing'
        ]
      },
      {
        id: 'case-009',
        title: 'Seizures and Developmental Regression',
        description: '3-year-old girl with seizures and loss of skills',
        patient: {
          age: 3,
          sex: 'female',
          demographics: 'Caucasian female, normal early development'
        },
        symptoms: [
          { hpoId: 'HP:0001263', label: 'Global developmental delay', frequency: 'very_frequent' },
          { hpoId: 'HP:0001250', label: 'Seizures', frequency: 'frequent' },
          { hpoId: 'HP:0000750', label: 'Delayed speech and language development', frequency: 'very_frequent' },
          { hpoId: 'HP:0000252', label: 'Microcephaly', frequency: 'frequent' }
        ],
        expectedDiagnosis: 'Rett syndrome',
        orphaCode: 'ORPHA:778',
        difficulty: 'medium',
        clinicalNotes: 'Patient developed normally until 18 months, then lost acquired skills. Hand stereotypies noted.',
        recommendations: [
          'MECP2 gene testing',
          'EEG evaluation',
          'Developmental assessment'
        ]
      },
      {
        id: 'case-010',
        title: 'Splenomegaly and Bone Pain',
        description: '30-year-old with enlarged spleen and bone disease',
        patient: {
          age: 30,
          sex: 'male',
          demographics: 'Ashkenazi Jewish male, family history'
        },
        symptoms: [
          { hpoId: 'HP:0001744', label: 'Splenomegaly', frequency: 'very_frequent' },
          { hpoId: 'HP:0002240', label: 'Hepatomegaly', frequency: 'frequent' },
          { hpoId: 'HP:0001903', label: 'Anemia', frequency: 'frequent' },
          { hpoId: 'HP:0000938', label: 'Osteopenia', frequency: 'occasional' }
        ],
        expectedDiagnosis: 'Gaucher disease',
        orphaCode: 'ORPHA:355',
        difficulty: 'medium',
        clinicalNotes: 'Patient has massive splenomegaly, thrombocytopenia, and bone pain. Ashkenazi Jewish ancestry.',
        recommendations: [
          'Beta-glucosidase enzyme activity',
          'Chitotriosidase levels',
          'GBA gene sequencing'
        ]
      }
    ];
  }

  getTestCaseById(id: string): TestCase | null {
    return this.getTestCases().find(testCase => testCase.id === id) || null;
  }

  getTestCasesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): TestCase[] {
    return this.getTestCases().filter(testCase => testCase.difficulty === difficulty);
  }

  getRandomTestCase(): TestCase {
    const testCases = this.getTestCases();
    return testCases[Math.floor(Math.random() * testCases.length)];
  }
}

export const testCaseService = new TestCaseService();