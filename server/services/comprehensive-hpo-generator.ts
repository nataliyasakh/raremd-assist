export interface HpoTerm {
  id: string;
  label: string;
  definition?: string;
  synonyms?: string[];
}

export async function generateComprehensiveHpoTerms(): Promise<HpoTerm[]> {
  // Import massive HPO generator for 1500+ terms
  const { generateMassiveHpoDatabase } = await import('./massive-hpo-generator.js');
  
  const massiveHpoTerms = generateMassiveHpoDatabase();
  
  // Add original comprehensive terms plus massive expansion
  const originalTerms = [
    // Neurological and developmental (HP:0000707)
    { id: 'HP:0001263', label: 'Global developmental delay', definition: 'A delay in the achievement of motor or mental milestones in the domains of development of a child.', synonyms: ['Developmental delay', 'Delayed development'] },
    { id: 'HP:0001249', label: 'Intellectual disability', definition: 'Subnormal intellectual functioning which originates during the developmental period.', synonyms: ['Mental retardation', 'Cognitive impairment'] },
    { id: 'HP:0001250', label: 'Seizures', definition: 'Seizures are an abnormal electrical discharge in the brain.', synonyms: ['Seizure', 'Epileptic seizure'] },
    { id: 'HP:0001252', label: 'Muscular hypotonia', definition: 'Muscular hypotonia is an abnormally low muscle tone.', synonyms: ['Hypotonia', 'Low muscle tone', 'Floppy baby syndrome'] },
    { id: 'HP:0000750', label: 'Delayed speech and language development', definition: 'A degree of language development that is significantly below the norm for a child of a specified age.', synonyms: ['Speech delay', 'Language delay'] },
    { id: 'HP:0002376', label: 'Developmental regression', definition: 'Loss of developmental milestones.', synonyms: ['Developmental loss', 'Regression'] },
    { id: 'HP:0001347', label: 'Hyperreflexia', definition: 'Hyperreflexia is the presence of hyperactive stretch reflexes.', synonyms: ['Increased reflexes', 'Brisk reflexes'] },
    { id: 'HP:0001265', label: 'Hyporeflexia', definition: 'Reduction of tendon reflexes.', synonyms: ['Decreased reflexes', 'Diminished reflexes'] },
    { id: 'HP:0002066', label: 'Gait ataxia', definition: 'A type of ataxia characterized by the impairment of the ability to coordinate the movements required for normal walking.', synonyms: ['Ataxic gait', 'Unsteady gait'] },
    { id: 'HP:0001251', label: 'Ataxia', definition: 'Cerebellar ataxia refers to ataxia due to dysfunction of the cerebellum.', synonyms: ['Cerebellar ataxia', 'Incoordination'] },

    // Growth abnormalities (HP:0001507)
    { id: 'HP:0001508', label: 'Failure to thrive', definition: 'Failure to thrive (FTT) refers to a child whose physical growth is substantially below the norm.', synonyms: ['Poor growth', 'Growth failure'] },
    { id: 'HP:0004322', label: 'Short stature', definition: 'A height below that which is expected according to age and gender norms.', synonyms: ['Short height', 'Dwarfism'] },
    { id: 'HP:0000098', label: 'Tall stature', definition: 'A height above that which is expected according to age and gender norms.', synonyms: ['Tall height', 'Gigantism'] },
    { id: 'HP:0001513', label: 'Obesity', definition: 'Abnormal increase in the thickness of the subcutaneous fat layer.', synonyms: ['Overweight', 'Adiposity'] },
    { id: 'HP:0004325', label: 'Decreased body weight', definition: 'Abnormally low body weight.', synonyms: ['Low weight', 'Underweight'] },

    // Craniofacial abnormalities (HP:0000152)
    { id: 'HP:0000256', label: 'Macrocephaly', definition: 'Occipitofrontal (head) circumference greater than 97th centile compared to appropriate, age matched, sex-matched normal standards.', synonyms: ['Large head', 'Big head'] },
    { id: 'HP:0000252', label: 'Microcephaly', definition: 'Occipitofrontal (head) circumference (OFC) more than three standard deviations below the mean relative to appropriate, age matched, sex-matched normal standards.', synonyms: ['Small head'] },
    { id: 'HP:0000316', label: 'Hypertelorism', definition: 'Interpupillary distance more than 2 SD above the mean (alternatively, the appearance of an increased interpupillary distance or widely spaced eyes).', synonyms: ['Wide-set eyes', 'Widely spaced eyes'] },
    { id: 'HP:0000286', label: 'Epicanthus', definition: 'A skin fold of the upper eyelid that covers the inner corner (medial canthus) of the eye.', synonyms: ['Epicanthal fold', 'Mongolian fold'] },
    { id: 'HP:0000175', label: 'Cleft palate', definition: 'Cleft palate is a developmental defect of the palate resulting from a failure of fusion of the palatine processes and manifesting as a separation of the roof of the mouth (soft and hard palate).', synonyms: ['Cleft roof of mouth'] },

    // Cardiovascular abnormalities (HP:0001626)
    { id: 'HP:0001629', label: 'Ventricular septal defect', definition: 'A hole between the two bottom chambers (ventricles) of the heart.', synonyms: ['VSD', 'Hole in heart'] },
    { id: 'HP:0001631', label: 'Atrial septal defect', definition: 'Atrial septal defect (ASD) is a congenital heart malformation characterized by a hole in the atrial septum.', synonyms: ['ASD', 'Hole between atria'] },
    { id: 'HP:0001636', label: 'Tetralogy of Fallot', definition: 'A congenital heart defect comprising ventricular septal defect, overriding aorta, pulmonary stenosis, and right ventricular hypertrophy.', synonyms: ['TOF'] },
    { id: 'HP:0001644', label: 'Dilated cardiomyopathy', definition: 'Dilated cardiomyopathy is a myocardial disorder defined by the presence of left ventricular dilatation and left ventricular systolic dysfunction in the absence of abnormal loading conditions or coronary artery disease sufficient to cause global systolic impairment.', synonyms: ['DCM'] },
    { id: 'HP:0001639', label: 'Hypertrophic cardiomyopathy', definition: 'Hypertrophic cardiomyopathy (HCM) is a condition in which the heart muscle becomes abnormally thick (hypertrophied).', synonyms: ['HCM'] },

    // Respiratory system abnormalities (HP:0002086)
    { id: 'HP:0002093', label: 'Respiratory insufficiency', definition: 'Failure of the respiratory system to conduct gas exchange adequately.', synonyms: ['Respiratory failure'] },
    { id: 'HP:0002104', label: 'Apnea', definition: 'Lack of breathing with no movement of the respiratory muscles and no associated ventilation.', synonyms: ['Cessation of breathing'] },
    { id: 'HP:0002789', label: 'Tachypnea', definition: 'Very rapid breathing.', synonyms: ['Rapid breathing', 'Fast breathing'] },
    { id: 'HP:0002094', label: 'Dyspnea', definition: 'Difficult or labored breathing.', synonyms: ['Shortness of breath', 'Breathlessness'] },
    { id: 'HP:0012378', label: 'Fatigue', definition: 'A subjective feeling of tiredness characterized by a lack of energy and motivation.', synonyms: ['Tiredness', 'Exhaustion'] },

    // Musculoskeletal system abnormalities (HP:0033127)
    { id: 'HP:0001371', label: 'Flexion contracture', definition: 'A flexion contracture is a bent (flexed) joint that cannot be straightened actively or passively.', synonyms: ['Joint contracture'] },
    { id: 'HP:0002828', label: 'Multiple joint contractures', definition: 'The presence of flexion contractures affecting more than one joint.', synonyms: ['Arthrogryposis'] },
    { id: 'HP:0002750', label: 'Delayed skeletal maturation', definition: 'A delay in the maturation of the bones of the skeleton.', synonyms: ['Delayed bone age'] },
    { id: 'HP:0002652', label: 'Skeletal dysplasia', definition: 'A general term describing features that arise from abnormal development of bone and cartilage.', synonyms: ['Bone dysplasia'] },
    { id: 'HP:0000470', label: 'Short neck', definition: 'Diminished length of the neck.', synonyms: ['Decreased neck length'] },

    // Genitourinary abnormalities (HP:0000119)
    { id: 'HP:0000028', label: 'Cryptorchidism', definition: 'Testis in inguinal canal. That is, absence of one or both testes from the scrotum owing to failure of the testis or testes to descend through the inguinal canal to the scrotum.', synonyms: ['Undescended testis'] },
    { id: 'HP:0000047', label: 'Hypospadias', definition: 'Abnormal opening of the urethra on the ventral (underside) surface of the penis.', synonyms: ['Abnormal urethral opening'] },
    { id: 'HP:0000014', label: 'Abnormality of the bladder', definition: 'An abnormality of the urinary bladder.', synonyms: ['Bladder abnormality'] },
    { id: 'HP:0000083', label: 'Renal insufficiency', definition: 'A reduction in the level of performance of the kidneys in areas of function comprising the concentration of urine, removal of wastes, the maintenance of electrolyte balance, homeostasis of blood pressure, and calcium metabolism.', synonyms: ['Kidney failure'] },

    // Gastrointestinal abnormalities (HP:0025031)
    { id: 'HP:0002019', label: 'Constipation', definition: 'Infrequent or difficult evacuation of feces.', synonyms: ['Difficult bowel movements'] },
    { id: 'HP:0002013', label: 'Vomiting', definition: 'Forceful ejection of the contents of the stomach through the mouth by means of a series of involuntary spasmic contractions.', synonyms: ['Emesis'] },
    { id: 'HP:0002014', label: 'Diarrhea', definition: 'Abnormally increased frequency of loose or watery bowel movements.', synonyms: ['Loose stools'] },
    { id: 'HP:0001738', label: 'Exocrine pancreatic insufficiency', definition: 'Impaired function of the exocrine pancreas associated with a reduction in the amount of pancreatic enzymes released into the duodenum.', synonyms: ['Pancreatic insufficiency'] },
    { id: 'HP:0002017', label: 'Nausea and vomiting', definition: 'The presence of both nausea and vomiting.', synonyms: ['Feeling sick and vomiting'] },

    // Endocrine abnormalities (HP:0000818)
    { id: 'HP:0000821', label: 'Hypothyroidism', definition: 'Deficiency of thyroid hormone.', synonyms: ['Underactive thyroid'] },
    { id: 'HP:0000836', label: 'Hyperthyroidism', definition: 'An abnormally increased activity of the thyroid gland.', synonyms: ['Overactive thyroid'] },
    { id: 'HP:0000819', label: 'Diabetes mellitus', definition: 'A group of abnormalities characterized by hyperglycemia and glucose intolerance.', synonyms: ['Diabetes'] },
    { id: 'HP:0008214', label: 'Decreased serum insulin-like growth factor 1', definition: 'Concentration of insulin-like growth factor 1 in the blood circulation below the lower limit of normal.', synonyms: ['Low IGF1'] },

    // Immunological abnormalities (HP:0002715)
    { id: 'HP:0002719', label: 'Recurrent infections', definition: 'Increased susceptibility to microbial infections.', synonyms: ['Frequent infections'] },
    { id: 'HP:0002721', label: 'Immunodeficiency', definition: 'A failure of the immune system to protect against infections and malignancy.', synonyms: ['Immune deficiency'] },
    { id: 'HP:0000967', label: 'Petechiae', definition: 'Petechiae are pinpoint, round spots that appear on the skin as a result of bleeding under the skin.', synonyms: ['Pinpoint rash'] },
    { id: 'HP:0001873', label: 'Thrombocytopenia', definition: 'A reduction in the number of circulating thrombocytes.', synonyms: ['Low platelet count'] },

    // Hematological abnormalities (HP:0001871)
    { id: 'HP:0001903', label: 'Anemia', definition: 'A reduction in erythrocytes volume or hemoglobin concentration.', synonyms: ['Low red blood cells'] },
    { id: 'HP:0001876', label: 'Pancytopenia', definition: 'An abnormal reduction in numbers of all blood cell types (red blood cells, white blood cells, and platelets).', synonyms: ['Low blood counts'] },
    { id: 'HP:0001875', label: 'Neutropenia', definition: 'A reduced number of neutrophils in the blood.', synonyms: ['Low neutrophil count'] },
    { id: 'HP:0001882', label: 'Leukopenia', definition: 'A reduction in the total number of circulating leukocytes in the blood.', synonyms: ['Low white blood cell count'] },

    // Metabolic abnormalities (HP:0001939)
    { id: 'HP:0001987', label: 'Hyperammonemia', definition: 'An increased concentration of ammonia in the blood.', synonyms: ['High ammonia'] },
    { id: 'HP:0001942', label: 'Metabolic acidosis', definition: 'A clinical condition characterized by a pH of less than 7.35 and a low plasma bicarbonate concentration.', synonyms: ['Acidosis'] },
    { id: 'HP:0003076', label: 'Glycosuria', definition: 'The presence of glucose in the urine.', synonyms: ['Sugar in urine'] },
    { id: 'HP:0002155', label: 'Hypertriglyceridemia', definition: 'An abnormal increase in the level of triglycerides in the blood.', synonyms: ['High triglycerides'] },
    { id: 'HP:0003124', label: 'Hypercholesterolemia', definition: 'An abnormal increase in the level of cholesterol in the blood.', synonyms: ['High cholesterol'] },

    // Dermatological abnormalities (HP:0000951)
    { id: 'HP:0000972', label: 'Palmoplantar keratoderma', definition: 'Abnormal thickening of the skin of palms and soles.', synonyms: ['Thickened palms and soles'] },
    { id: 'HP:0000962', label: 'Hyperkeratosis', definition: 'Hyperkeratosis is thickening of the outer layer of the skin, the stratum corneum, which is composed of large amounts of the protein keratin.', synonyms: ['Thickened skin'] },
    { id: 'HP:0000958', label: 'Dry skin', definition: 'Skin characterized by the lack of moisture in the stratum corneum often with fine scaling.', synonyms: ['Xerosis'] },
    { id: 'HP:0000954', label: 'Single palmar crease', definition: 'The distal and proximal palmar creases are merged into a single crease that extends across the palm.', synonyms: ['Simian crease'] },
    { id: 'HP:0000953', label: 'Hyperpigmentation of the skin', definition: 'A darkening of the skin related to an increase in melanin production and deposition.', synonyms: ['Dark skin patches'] },

    // Ophthalmological abnormalities (HP:0000478)
    { id: 'HP:0000505', label: 'Visual impairment', definition: 'Visual impairment (or vision impairment) is vision loss (of a person) to such a degree as to qualify as an additional support need through a significant limitation of visual capability resulting from either disease, trauma, or congenital or degenerative conditions.', synonyms: ['Poor vision'] },
    { id: 'HP:0000518', label: 'Cataract', definition: 'A cataract is an opacity or clouding that develops in the crystalline lens of the eye or in its capsule.', synonyms: ['Cloudy lens'] },
    { id: 'HP:0000529', label: 'Progressive visual loss', definition: 'A reduction of previously attained level of visual acuity.', synonyms: ['Worsening vision'] },
    { id: 'HP:0000481', label: 'Abnormality of corneal thickness', definition: 'A deviation from the normal thickness of the cornea.', synonyms: ['Corneal thickness abnormality'] },
    { id: 'HP:0000545', label: 'Myopia', definition: 'An abnormality of refraction characterized by the ability to see objects nearby clearly, while objects in the distance appear blurry.', synonyms: ['Nearsightedness'] },

    // Ear abnormalities (HP:0000598)
    { id: 'HP:0000365', label: 'Hearing impairment', definition: 'A decreased magnitude of the sensation of sound.', synonyms: ['Hearing loss', 'Deafness'] },
    { id: 'HP:0000405', label: 'Conductive hearing impairment', definition: 'An abnormality of vibrational conductance of sound to the inner ear leading to impairment of sensory perception of sound.', synonyms: ['Conductive hearing loss'] },
    { id: 'HP:0000407', label: 'Sensorineural hearing impairment', definition: 'A type of hearing impairment in one or both ears related to an abnormal functionality of the cochlear nerve.', synonyms: ['Nerve hearing loss'] },
    { id: 'HP:0008527', label: 'Congenital sensorineural hearing impairment', definition: 'A type of hearing impairment caused by an abnormal functionality of the cochlear nerve that is present from birth.', synonyms: ['Congenital deafness'] },

    // Behavioral and psychiatric abnormalities (HP:0000708)
    { id: 'HP:0000717', label: 'Autism', definition: 'Autism is a neurodevelopmental disorder characterized by impaired social interaction and communication, and by restricted and repetitive behavior.', synonyms: ['Autistic behavior'] },
    { id: 'HP:0000752', label: 'Hyperactivity', definition: 'Hyperactivity is a state of abnormally or extremely high activity which may be accompanied by restlessness, agitation, and distractibility.', synonyms: ['Overactivity'] },
    { id: 'HP:0007018', label: 'Attention deficit hyperactivity disorder', definition: 'Attention deficit hyperactivity disorder (ADHD) manifests at age 2-3 years or by first grade at the latest.', synonyms: ['ADHD'] },
    { id: 'HP:0000739', label: 'Anxiety', definition: 'Intense feelings of nervousness, tenseness, or panic, often in reaction to interpersonal stresses.', synonyms: ['Nervousness'] },
    { id: 'HP:0000716', label: 'Depression', definition: 'A condition characterized by pervasive dysphoric mood, loss of interests, and inability to experience pleasure.', synonyms: ['Depressed mood'] },

    // Additional common terms
    { id: 'HP:0002167', label: 'Neurological speech impairment', definition: 'A disturbance of speech and language due to dysfunction of the central or peripheral nervous system.', synonyms: ['Speech problems'] },
    { id: 'HP:0001290', label: 'Generalized hypotonia', definition: 'Generalized muscular hypotonia (abnormally low muscle tone).', synonyms: ['Floppy infant syndrome'] },
    { id: 'HP:0001508', label: 'Failure to thrive', definition: 'Failure to thrive (FTT) refers to a child whose physical growth is substantially below the norm.', synonyms: ['Poor weight gain', 'Growth retardation'] },
    { id: 'HP:0002086', label: 'Abnormality of the respiratory system', definition: 'An abnormality of the respiratory system, which include the airways, lungs, and the respiratory muscles.', synonyms: ['Breathing problems'] },
    { id: 'HP:0000707', label: 'Abnormality of the nervous system', definition: 'An abnormality of the nervous system.', synonyms: ['Neurological abnormality'] },

    // Feeding and eating abnormalities
    { id: 'HP:0011968', label: 'Feeding difficulties', definition: 'Impaired ability to eat related to problems gathering food and getting ready to suck, chew, or swallow it.', synonyms: ['Feeding problems', 'Eating difficulties'] },
    { id: 'HP:0002020', label: 'Gastroesophageal reflux', definition: 'A condition in which the stomach contents leak backwards from the stomach into the esophagus.', synonyms: ['Acid reflux', 'GERD'] },
    { id: 'HP:0008872', label: 'Feeding difficulties in infancy', definition: 'Impaired feeding performance during the first year of life that may involve problems with sucking, swallowing, or self-feeding.', synonyms: ['Infant feeding problems'] },

    // Pain and sensory abnormalities
    { id: 'HP:0012531', label: 'Pain', definition: 'An unpleasant sensory and emotional experience associated with actual or potential tissue damage.', synonyms: ['Ache', 'Discomfort'] },
    { id: 'HP:0007328', label: 'Impaired pain sensation', definition: 'Reduced ability to perceive painful stimuli.', synonyms: ['Decreased pain sensitivity'] },
    { id: 'HP:0002829', label: 'Arthralgia', definition: 'Joint pain.', synonyms: ['Joint ache'] },
    { id: 'HP:0002315', label: 'Headache', definition: 'Cephalgia, or pain sensed in various parts of the head, not confined to the area of distribution of any nerve.', synonyms: ['Head pain'] },

    // Additional cardiovascular terms
    { id: 'HP:0001645', label: 'Sudden cardiac death', definition: 'The heart suddenly and unexpectedly stops beating.', synonyms: ['Cardiac arrest'] },
    { id: 'HP:0001695', label: 'Cardiac arrest', definition: 'Sudden, unexpected loss of heart function, breathing, and consciousness.', synonyms: ['Heart stoppage'] },
    { id: 'HP:0001677', label: 'Coronary artery disease', definition: 'Reduction of coronary circulation.', synonyms: ['Heart disease'] },
    { id: 'HP:0001635', label: 'Congestive heart failure', definition: 'The presence of an abnormality of cardiac function that is responsible for the failure of the heart to pump blood at a rate that is commensurate with the needs of the tissues or a state in which abnormally elevated filling pressures are required for the heart to do so.', synonyms: ['Heart failure'] },

    // Sleep abnormalities
    { id: 'HP:0002360', label: 'Sleep disturbance', definition: 'An abnormality of sleep including such phenomena as 1) insomnia/hypersomnia, 2) non-restorative sleep, 4) sleep schedule disorder and 4) excessive daytime somnolence.', synonyms: ['Sleep problems'] },
    { id: 'HP:0002497', label: 'Spastic paraplegia', definition: 'Spastic paraplegia is a form of hereditary spastic paraplegia characterized by a slow, gradual, progressive weakness and spasticity of the lower limbs.', synonyms: ['Leg spasticity'] },

    // Additional metabolic terms
    { id: 'HP:0001943', label: 'Hypoglycemia', definition: 'A decreased concentration of glucose in the blood.', synonyms: ['Low blood sugar'] },
    { id: 'HP:0000842', label: 'Hyperinsulinemia', definition: 'An abnormal increase in the level of insulin in the blood.', synonyms: ['High insulin'] },
    { id: 'HP:0003234', label: 'Decreased plasma carnitine', definition: 'Reduced concentration of carnitine in the blood circulation.', synonyms: ['Low carnitine'] },

    // Liver abnormalities
    { id: 'HP:0001392', label: 'Abnormality of the liver', definition: 'An abnormality of the liver.', synonyms: ['Liver problems'] },
    { id: 'HP:0001399', label: 'Hepatic failure', definition: 'Severe impairment of liver function.', synonyms: ['Liver failure'] },
    { id: 'HP:0001394', label: 'Cirrhosis', definition: 'A chronic disease of the liver marked by degeneration of cells, inflammation, and fibrous thickening of tissue.', synonyms: ['Liver scarring'] },

    // Skeletal abnormalities
    { id: 'HP:0000684', label: 'Delayed eruption of teeth', definition: 'Late tooth eruption.', synonyms: ['Late tooth development'] },
    { id: 'HP:0000670', label: 'Carious teeth', definition: 'Caries is a multifactorial bacterial infection affecting the structure of the tooth.', synonyms: ['Tooth decay'] },
    { id: 'HP:0000703', label: 'Dentinogenesis imperfecta', definition: 'A hereditary disorder of tooth development characterized by opalescent dentin.', synonyms: ['Defective tooth formation'] },

    // Temperature regulation
    { id: 'HP:0001945', label: 'Fever', definition: 'Elevated body temperature due to failed thermoregulation.', synonyms: ['High temperature'] },
    { id: 'HP:0002017', label: 'Nausea and vomiting', definition: 'Nausea is a feeling of sickness with an inclination to vomit. Vomiting is forceful ejection of the contents of the stomach through the mouth.', synonyms: ['Sick feeling and throwing up'] }
  ];
  
  // Return combined massive database (1500+ terms)
  return [...massiveHpoTerms, ...originalTerms];
}