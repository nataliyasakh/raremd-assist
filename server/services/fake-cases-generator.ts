// Comprehensive fake cases generator for iGEM 2025 community repository
import type { CrowdsourcedCase } from "@shared/schema";

interface FakeCaseTemplate {
  confirmedDiagnosis: string;
  orphaCode: string;
  icdCode?: string;
  symptoms: Array<{ hpoId: string; label: string; frequency?: string }>;
  diagnosticJourney: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  timeToConfirmation: number; // days
}

const rareDiseaseTemplates: FakeCaseTemplate[] = [
  {
    confirmedDiagnosis: "CDG PMM2",
    orphaCode: "ORPHA:79",
    icdCode: "E74.8",
    symptoms: [
      { hpoId: "HP:0001508", label: "Failure to thrive", frequency: "very_frequent" },
      { hpoId: "HP:0002014", label: "Diarrhea", frequency: "frequent" },
      { hpoId: "HP:0001399", label: "Hepatomegaly", frequency: "frequent" },
      { hpoId: "HP:0001263", label: "Global developmental delay", frequency: "very_frequent" },
      { hpoId: "HP:0002376", label: "Developmental regression", frequency: "occasional" }
    ],
    diagnosticJourney: "Initial presentation with failure to thrive and diarrhea at 6 months. Multiple GI evaluations negative. Liver enzymes elevated. Genetic testing revealed PMM2 mutations.",
    difficulty: "hard",
    timeToConfirmation: 450
  },
  {
    confirmedDiagnosis: "Rett syndrome",
    orphaCode: "ORPHA:778",
    icdCode: "F84.2",
    symptoms: [
      { hpoId: "HP:0002376", label: "Developmental regression", frequency: "very_frequent" },
      { hpoId: "HP:0002167", label: "Neurological speech impairment", frequency: "very_frequent" },
      { hpoId: "HP:0001249", label: "Intellectual disability", frequency: "very_frequent" },
      { hpoId: "HP:0002015", label: "Dysphagia", frequency: "frequent" },
      { hpoId: "HP:0000717", label: "Autism", frequency: "frequent" }
    ],
    diagnosticJourney: "Normal development until 18 months, then lost speech and hand skills. Initially diagnosed with autism. Hand stereotypies developed. MECP2 testing confirmed Rett syndrome.",
    difficulty: "medium",
    timeToConfirmation: 180
  },
  {
    confirmedDiagnosis: "Prader-Willi syndrome",
    orphaCode: "ORPHA:739",
    icdCode: "Q87.1",
    symptoms: [
      { hpoId: "HP:0001252", label: "Muscular hypotonia", frequency: "very_frequent" },
      { hpoId: "HP:0008872", label: "Feeding difficulties in infancy", frequency: "very_frequent" },
      { hpoId: "HP:0000851", label: "Congenital hypothyroidism", frequency: "occasional" },
      { hpoId: "HP:0001249", label: "Intellectual disability", frequency: "frequent" },
      { hpoId: "HP:0002591", label: "Polyphagia", frequency: "very_frequent" }
    ],
    diagnosticJourney: "Severe neonatal hypotonia with feeding tube requirement. Growth hormone deficiency noted. Hyperphagia developed at age 3. Methylation studies confirmed PWS.",
    difficulty: "easy",
    timeToConfirmation: 90
  },
  {
    confirmedDiagnosis: "Pompe disease",
    orphaCode: "ORPHA:365",
    icdCode: "E74.0",
    symptoms: [
      { hpoId: "HP:0003198", label: "Myopathy", frequency: "very_frequent" },
      { hpoId: "HP:0001639", label: "Hypertrophic cardiomyopathy", frequency: "very_frequent" },
      { hpoId: "HP:0002795", label: "Respiratory insufficiency", frequency: "frequent" },
      { hpoId: "HP:0001508", label: "Failure to thrive", frequency: "frequent" },
      { hpoId: "HP:0001252", label: "Muscular hypotonia", frequency: "very_frequent" }
    ],
    diagnosticJourney: "Progressive muscle weakness and cardiomegaly in infancy. Elevated CK levels. Echocardiogram showed severe LVH. Enzyme assay and genetic testing confirmed Pompe disease.",
    difficulty: "medium",
    timeToConfirmation: 120
  },
  {
    confirmedDiagnosis: "Gaucher disease type 1",
    orphaCode: "ORPHA:77259",
    icdCode: "E75.22",
    symptoms: [
      { hpoId: "HP:0001744", label: "Splenomegaly", frequency: "very_frequent" },
      { hpoId: "HP:0001399", label: "Hepatomegaly", frequency: "frequent" },
      { hpoId: "HP:0001903", label: "Anemia", frequency: "frequent" },
      { hpoId: "HP:0001873", label: "Thrombocytopenia", frequency: "frequent" },
      { hpoId: "HP:0002653", label: "Bone pain", frequency: "frequent" }
    ],
    diagnosticJourney: "Adult presentation with fatigue and abdominal distension. Found to have massive splenomegaly and thrombocytopenia. Bone marrow biopsy showed Gaucher cells. Enzyme testing confirmed diagnosis.",
    difficulty: "medium",
    timeToConfirmation: 200
  },
  {
    confirmedDiagnosis: "Fabry disease",
    orphaCode: "ORPHA:324",
    icdCode: "E75.21",
    symptoms: [
      { hpoId: "HP:0001297", label: "Stroke", frequency: "frequent" },
      { hpoId: "HP:0000083", label: "Renal insufficiency", frequency: "frequent" },
      { hpoId: "HP:0001639", label: "Hypertrophic cardiomyopathy", frequency: "frequent" },
      { hpoId: "HP:0200042", label: "Skin rash", frequency: "very_frequent" },
      { hpoId: "HP:0012378", label: "Fatigue", frequency: "frequent" }
    ],
    diagnosticJourney: "Male patient with recurrent strokes in 40s. Skin lesions noted. Family history of kidney disease. Alpha-galactosidase A deficiency confirmed on enzyme testing.",
    difficulty: "hard",
    timeToConfirmation: 720
  },
  {
    confirmedDiagnosis: "Mucopolysaccharidosis type I",
    orphaCode: "ORPHA:579",
    icdCode: "E76.01",
    symptoms: [
      { hpoId: "HP:0000486", label: "Strabismus", frequency: "frequent" },
      { hpoId: "HP:0000248", label: "Brachycephaly", frequency: "frequent" },
      { hpoId: "HP:0002205", label: "Recurrent respiratory infections", frequency: "very_frequent" },
      { hpoId: "HP:0001399", label: "Hepatomegaly", frequency: "frequent" },
      { hpoId: "HP:0000365", label: "Hearing impairment", frequency: "frequent" }
    ],
    diagnosticJourney: "Coarse facial features noted in toddler. Recurrent respiratory infections and hearing loss. Developmental delay. Urine GAGs elevated. IDUA enzyme deficiency confirmed.",
    difficulty: "medium",
    timeToConfirmation: 240
  },
  {
    confirmedDiagnosis: "Marfan syndrome",
    orphaCode: "ORPHA:558",
    icdCode: "Q87.40",
    symptoms: [
      { hpoId: "HP:0001519", label: "Disproportionate tall stature", frequency: "very_frequent" },
      { hpoId: "HP:0000006", label: "Autosomal dominant inheritance", frequency: "frequent" },
      { hpoId: "HP:0002636", label: "Mitral valve prolapse", frequency: "frequent" },
      { hpoId: "HP:0000545", label: "Myopia", frequency: "frequent" },
      { hpoId: "HP:0001166", label: "Arachnodactyly", frequency: "very_frequent" }
    ],
    diagnosticJourney: "Tall teenager with arm span exceeding height. Family history of sudden cardiac death. Echocardiogram showed aortic root dilatation. FBN1 mutation confirmed.",
    difficulty: "easy",
    timeToConfirmation: 60
  }
];

const countries = [
  "USA", "Canada", "UK", "Germany", "France", "Italy", "Spain", "Netherlands", 
  "Sweden", "Norway", "Denmark", "Finland", "Australia", "Japan", "South Korea",
  "Brazil", "Argentina", "Mexico", "India", "China", "Singapore", "Israel"
];

const regions: Record<string, string[]> = {
  "USA": ["California", "Texas", "New York", "Florida", "Illinois", "Ohio", "Pennsylvania"],
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba"],
  "UK": ["England", "Scotland", "Wales", "Northern Ireland"],
  "Germany": ["Bavaria", "Berlin", "Hamburg", "Saxony", "Hesse"],
  "France": ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes"],
  "Italy": ["Lombardy", "Lazio", "Sicily", "Veneto", "Campania"],
  "Spain": ["Madrid", "Catalonia", "Andalusia", "Valencia", "Galicia"],
  "Netherlands": ["North Holland", "South Holland", "Utrecht", "Gelderland"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Hiroshima", "Hokkaido"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"]
};

const outcomes = ["confirmed", "differential", "unresolved"];
const ageGroups = ["pediatric", "adult", "elderly"];
const sexes = ["male", "female"];

export function generateFakeCrowdsourcedCases(count: number): Omit<CrowdsourcedCase, 'id' | 'contributionDate'>[] {
  const cases: Omit<CrowdsourcedCase, 'id' | 'contributionDate'>[] = [];
  
  for (let i = 0; i < count; i++) {
    const template = rareDiseaseTemplates[i % rareDiseaseTemplates.length];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const regionList = regions[country] || [country];
    const region = regionList[Math.floor(Math.random() * regionList.length)];
    
    // Add some variation to symptoms
    const baseSymptoms = [...template.symptoms];
    
    // Sometimes add additional random symptoms
    if (Math.random() > 0.7) {
      const additionalSymptoms = [
        { hpoId: "HP:0012378", label: "Fatigue", frequency: "occasional" },
        { hpoId: "HP:0002017", label: "Nausea and vomiting", frequency: "occasional" },
        { hpoId: "HP:0002027", label: "Abdominal pain", frequency: "occasional" },
        { hpoId: "HP:0000718", label: "Aggressive behavior", frequency: "rare" }
      ];
      const randomSymptom = additionalSymptoms[Math.floor(Math.random() * additionalSymptoms.length)];
      baseSymptoms.push(randomSymptom);
    }
    
    // Add some variation to diagnostic timeline
    const baseTimeToConfirmation = template.timeToConfirmation;
    const timeVariation = Math.floor(Math.random() * 60) - 30; // +/- 30 days
    
    const caseData = {
      anonymousId: `phys_${Math.random().toString(36).substring(2, 15)}`,
      country,
      region,
      symptoms: baseSymptoms,
      confirmedDiagnosis: template.confirmedDiagnosis,
      orphaCode: template.orphaCode,
      icdCode: template.icdCode || null,
      diagnosticJourney: template.diagnosticJourney,
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
      timeToConfirmation: Math.max(1, baseTimeToConfirmation + timeVariation),
      isPublic: Math.random() > 0.1, // 90% public
      upvotes: Math.floor(Math.random() * 50),
      difficulty: template.difficulty,
      ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
      sex: sexes[Math.floor(Math.random() * sexes.length)]
    };
    
    cases.push(caseData);
  }
  
  return cases;
}