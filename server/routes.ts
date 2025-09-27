import type { Express } from "express";
import { createServer, type Server } from "http";
import { initializeStorage } from "./storage";
import { orphadataService } from "./services/orphadata";
import { hpoService } from "./services/hpo";
import { pdfService } from "./services/pdf";
import { testCaseService } from "./services/test-cases";
import { photoAnalysisService } from "./services/photo-analysis";
import { clinicalDecisionService } from "./services/clinical-decision";
import { ehrIntegrationService } from "./services/ehr-integration";
import { diseaseMarkersService } from "./services/disease-markers";
import { insertCaseSchema, insertDiseaseSchema, insertPhysicianSchema, insertTestConfirmationSchema, crowdsourcedCases } from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize storage with massive preloaded data
  const storage = await initializeStorage();
  
  // Initialize services
  await hpoService.initializeService();
  diseaseMarkersService.loadComprehensiveMarkers();

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      // Get real-time analytics by calculating current counts
      const cases = await storage.getAllCases();
      const diseases = await storage.getAllDiseases();
      
      // Calculate real-time statistics
      const totalCases = cases.length;
      const diagnosedCases = cases.filter(c => c.status === 'diagnosed').length;
      const alertsGenerated = cases.filter(c => c.score && c.score >= 5).length;
      const knowledgeBaseSize = diseases.length;
      
      // Update analytics with real-time data
      const analytics = await storage.updateAnalytics({
        totalCases,
        diagnosedCases,
        alertsGenerated,
        knowledgeBaseSize
      });
      
      res.json(analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Cases endpoints
  app.get("/api/cases", async (req, res) => {
    try {
      const cases = await storage.getAllCases();
      res.json(cases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cases" });
    }
  });

  app.get("/api/cases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const caseData = await storage.getCase(id);
      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }
      res.json(caseData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch case" });
    }
  });

  app.post("/api/cases", async (req, res) => {
    try {
      const validatedData = insertCaseSchema.parse(req.body);
      const newCase = await storage.createCase(validatedData);
      
      // Ensure analytics are updated immediately after case creation
      const cases = await storage.getAllCases();
      const totalCases = cases.length;
      const diagnosedCases = cases.filter(c => c.status === 'diagnosed').length;
      const alertsGenerated = cases.filter(c => c.score && c.score >= 5).length;
      
      await storage.updateAnalytics({
        totalCases,
        diagnosedCases,
        alertsGenerated
      });
      
      console.log(`Case created successfully. Total cases now: ${totalCases}`);
      res.status(201).json(newCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Case creation error:', error);
      res.status(500).json({ error: "Failed to create case" });
    }
  });

  app.put("/api/cases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCaseSchema.partial().parse(req.body);
      const updatedCase = await storage.updateCase(id, validatedData);
      if (!updatedCase) {
        return res.status(404).json({ error: "Case not found" });
      }
      
      // Update analytics after case update
      const cases = await storage.getAllCases();
      const totalCases = cases.length;
      const diagnosedCases = cases.filter(c => c.status === 'diagnosed').length;
      const alertsGenerated = cases.filter(c => c.score && c.score >= 5).length;
      
      await storage.updateAnalytics({
        totalCases,
        diagnosedCases,
        alertsGenerated
      });
      
      res.json(updatedCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Case update error:', error);
      res.status(500).json({ error: "Failed to update case" });
    }
  });

  // Diseases endpoints
  app.get("/api/diseases", async (req, res) => {
    try {
      const diseases = await storage.getAllDiseases();
      res.json(diseases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diseases" });
    }
  });

  app.get("/api/diseases/:orphaCode", async (req, res) => {
    try {
      const orphaCode = req.params.orphaCode;
      const disease = await storage.getDiseaseByOrphaCode(orphaCode);
      if (!disease) {
        return res.status(404).json({ error: "Disease not found" });
      }
      res.json(disease);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch disease" });
    }
  });

  // HPO Terms endpoints
  app.get("/api/hpo/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const terms = await hpoService.searchTerms(query);
      res.json(terms);
    } catch (error) {
      res.status(500).json({ error: "Failed to search HPO terms" });
    }
  });

  app.get("/api/hpo/:hpoId", async (req, res) => {
    try {
      const hpoId = req.params.hpoId;
      const term = await hpoService.getTermById(hpoId);
      if (!term) {
        return res.status(404).json({ error: "HPO term not found" });
      }
      res.json(term);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch HPO term" });
    }
  });

  // Disease scoring endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { symptoms } = req.body;
      console.log('Received symptoms for analysis:', symptoms);
      
      if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({ error: "Invalid symptoms data" });
      }

      const diseases = await storage.getAllDiseases();
      console.log(`Found ${diseases.length} diseases in database`);
      
      const scoredDiseases = diseases.map(disease => {
        let score = 0;
        let keyMatches = 0;
        let supportingMatches = 0;
        const matchedSymptoms: Array<{label: string, frequency: string, hpoId: string}> = [];

        for (const symptom of symptoms) {
          // Check if disease has phenotypes array
          if (disease.phenotypes && Array.isArray(disease.phenotypes)) {
            const phenotype = disease.phenotypes.find(p => p.hpoId === symptom.hpoId);
            if (phenotype) {
              // Add to matched symptoms with frequency information
              matchedSymptoms.push({
                label: phenotype.description || symptom.label,
                frequency: phenotype.frequency || 'occasional',
                hpoId: phenotype.hpoId
              });
              
              // Simple scoring - high frequency symptoms get more points
              if (phenotype.frequency && (phenotype.frequency.includes('frequent') || phenotype.frequency.includes('obligate'))) {
                keyMatches++;
                score += 3;
              } else {
                supportingMatches++;
                score += 1;
              }
            }
          }
          
          // Also match based on symptom frequency from input
          if (symptom.frequency === 'frequent' || symptom.frequency === 'obligate') {
            score += 1; // Bonus for frequent symptoms
          }
        }

        return {
          disease,
          score,
          keyMatches,
          matchedSymptoms,
          supportingMatches,
          priority: score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low'
        };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

      console.log(`Analysis complete: ${scoredDiseases.length} matches found`);
      res.json(scoredDiseases);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: "Failed to analyze symptoms", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // AI Analysis endpoint - Uses OpenAI for real photo analysis
  app.post("/api/ai-analysis", async (req, res) => {
    try {
      const { imageData, textDescription, existingSymptoms } = req.body;
      
      if (!imageData && !textDescription) {
        return res.status(400).json({ error: "Either image data or text description is required" });
      }

      // Use the real OpenAI-powered photo analysis service
      let allFeatures: string[] = [];
      let confidence = 0.8;
      let suggestions: string[] = [];
      let medicalRelevance = "";
      
      // Analyze photo if provided using OpenAI with fallback
      if (imageData) {
        try {
          const dysmorphicAnalysis = await photoAnalysisService.analyzeDysmorphicFeatures(imageData);
          allFeatures.push(...dysmorphicAnalysis.identifiedFeatures);
          
          // Extract features from suggested diagnoses
          dysmorphicAnalysis.suggestedDiagnoses.forEach(diagnosis => {
            allFeatures.push(...diagnosis.keyFeatures);
          });
          
          confidence = dysmorphicAnalysis.suggestedDiagnoses.length > 0 
            ? dysmorphicAnalysis.suggestedDiagnoses[0].confidence 
            : 0.8;
            
          suggestions = [
            ...dysmorphicAnalysis.recommendations,
            ...dysmorphicAnalysis.suggestedDiagnoses.map(d => `Consider ${d.condition} (${d.orphaCode})`)
          ];
          
          medicalRelevance = `Identified ${dysmorphicAnalysis.identifiedFeatures.length} dysmorphic features. ${dysmorphicAnalysis.disclaimer}`;
        } catch (error) {
          console.error('OpenAI Vision API error:', error);
          console.error('Error details:', error instanceof Error ? error.message : error);
          console.log('OpenAI Vision API temporarily unavailable, using fallback analysis');
          
          // Fallback: Basic image analysis without AI
          allFeatures = [
            'Photo uploaded for analysis',
            'Visual features require clinical interpretation',
            'Image-based assessment needed'
          ];
          
          confidence = 0.6;
          suggestions = [
            'Photo analysis temporarily unavailable - please try again later',
            'Consider clinical examination by a qualified physician',
            'Upload clear, well-lit photos for best results',
            'Genetic counseling consultation recommended'
          ];
          
          medicalRelevance = 'Photo uploaded but AI analysis temporarily unavailable. Clinical assessment recommended.';
        }
      }

      // Analyze text description for medical keywords
      if (textDescription) {
        const medicalKeywords = [
          'hypertelorism', 'macrocephaly', 'microcephaly', 'epicanthal folds',
          'low-set ears', 'prominent forehead', 'micrognathia', 'cleft',
          'ptosis', 'strabismus', 'nystagmus', 'coloboma',
          'short stature', 'tall stature', 'asymmetry', 'hypotonia',
          'lump', 'mass', 'swelling', 'growth', 'tumor'
        ];

        const lowerDescription = textDescription.toLowerCase();
        const foundKeywords = medicalKeywords.filter(keyword => 
          lowerDescription.includes(keyword.toLowerCase())
        );
        
        allFeatures.push(...foundKeywords);
        
        if (!imageData) {
          medicalRelevance = `Text analysis identified ${foundKeywords.length} potential medical terms`;
          suggestions = [
            'Consider clinical examination',
            'Document findings thoroughly', 
            'Consider imaging if appropriate',
            'Genetic counseling may be beneficial'
          ];
        }
      }

      // Get HPO terms for matching
      const hpoTerms = await hpoService.getAllTerms();
      
      // Simple HPO matching
      const hpoMatches = allFeatures.map(feature => {
        const matchingTerm = hpoTerms.find(term => 
          term.label.toLowerCase().includes(feature.toLowerCase()) ||
          feature.toLowerCase().includes(term.label.toLowerCase())
        );
        
        return matchingTerm ? {
          hpoId: matchingTerm.hpoId,
          label: matchingTerm.label,
          confidence: 0.8
        } : null;
      }).filter(Boolean).slice(0, 10) as Array<{hpoId: string; label: string; confidence: number}>;

      // Generate educational insights
      const educationalInsights = [
        'Medical images should be interpreted by qualified healthcare professionals',
        'Clinical correlation is essential for accurate diagnosis',
        'Genetic testing may be recommended based on clinical findings',
        'Consider referral to appropriate specialists if indicated'
      ];

      // Create comprehensive analysis result
      const analysisResult = {
        features: allFeatures,
        confidence,
        suggestions,
        medicalRelevance,
        hpoMatches,
        educationalInsights,
        report: `Analysis completed. Identified ${allFeatures.length} medical features. ${medicalRelevance}`
      };

      res.json(analysisResult);
    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({ 
        error: "Failed to analyze features. Please try again or check your connection.",
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // CDSS Treatment Recommendations endpoint
  app.post("/api/cdss/treatments", async (req, res) => {
    try {
      const { diagnosis, orphaCode, patientAge, patientSex, comorbidities } = req.body;
      
      if (!diagnosis || !orphaCode) {
        return res.status(400).json({ error: "Diagnosis and ORPHA code are required" });
      }

      const { cdssService } = await import('./services/cdss');
      const recommendations = await cdssService.generateTreatmentRecommendations(
        diagnosis,
        orphaCode,
        patientAge,
        patientSex,
        comorbidities || []
      );

      res.json(recommendations);
    } catch (error) {
      console.error('CDSS treatment recommendations error:', error);
      res.status(500).json({ error: "Failed to generate treatment recommendations" });
    }
  });

  // CDSS Drug Interaction Check endpoint
  app.post("/api/cdss/drug-interactions", async (req, res) => {
    try {
      const { medications } = req.body;
      
      if (!medications || !Array.isArray(medications)) {
        return res.status(400).json({ error: "Medications array is required" });
      }

      const { cdssService } = await import('./services/cdss');
      const interactions = await cdssService.checkDrugInteractions(medications);

      res.json(interactions);
    } catch (error) {
      console.error('Drug interaction check error:', error);
      res.status(500).json({ error: "Failed to check drug interactions" });
    }
  });

  // CDSS Clinical Pathway endpoint
  app.post("/api/cdss/clinical-pathway", async (req, res) => {
    try {
      const { diagnosis, orphaCode, currentStep } = req.body;
      
      if (!diagnosis || !orphaCode) {
        return res.status(400).json({ error: "Diagnosis and ORPHA code are required" });
      }

      const { cdssService } = await import('./services/cdss');
      const pathway = await cdssService.getClinicalPathway(diagnosis, orphaCode, currentStep);

      res.json(pathway);
    } catch (error) {
      console.error('Clinical pathway error:', error);
      res.status(500).json({ error: "Failed to get clinical pathway" });
    }
  });

  // CDSS Risk Assessment endpoint
  app.post("/api/cdss/risk-assessment", async (req, res) => {
    try {
      const { symptoms, diagnosis, patientAge } = req.body;
      
      if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({ error: "Symptoms array is required" });
      }

      const { cdssService } = await import('./services/cdss');
      const riskAssessment = await cdssService.performRiskAssessment(symptoms, diagnosis, patientAge);

      res.json(riskAssessment);
    } catch (error) {
      console.error('Risk assessment error:', error);
      res.status(500).json({ error: "Failed to perform risk assessment" });
    }
  });

  // CDSS Clinical Documentation endpoint
  app.post("/api/cdss/clinical-documentation", async (req, res) => {
    try {
      const { patientId, symptoms, diagnosis, recommendations, riskAssessment } = req.body;
      
      if (!patientId || !symptoms || !diagnosis) {
        return res.status(400).json({ error: "Patient ID, symptoms, and diagnosis are required" });
      }

      const { cdssService } = await import('./services/cdss');
      const documentation = await cdssService.generateClinicalDocumentation(
        patientId,
        symptoms,
        diagnosis,
        recommendations || [],
        riskAssessment || []
      );

      res.json(documentation);
    } catch (error) {
      console.error('Clinical documentation error:', error);
      res.status(500).json({ error: "Failed to generate clinical documentation" });
    }
  });

  // EHR Integration endpoints
  app.post("/api/ehr/patient-data", async (req, res) => {
    try {
      const { ehrSystem, patientId, accessToken } = req.body;
      
      if (!ehrSystem || !patientId || !accessToken) {
        return res.status(400).json({ error: "EHR system, patient ID, and access token are required" });
      }

      const { ehrIntegrationService } = await import('./services/ehr-integration');
      const patientData = await ehrIntegrationService.fetchPatientData(ehrSystem, patientId, accessToken);

      if (!patientData) {
        return res.status(404).json({ error: "Patient data not found or access denied" });
      }

      res.json(patientData);
    } catch (error) {
      console.error('EHR patient data fetch error:', error);
      res.status(500).json({ error: "Failed to fetch patient data from EHR" });
    }
  });

  app.post("/api/ehr/create-encounter", async (req, res) => {
    try {
      const { ehrSystem, encounter, accessToken } = req.body;
      
      if (!ehrSystem || !encounter || !accessToken) {
        return res.status(400).json({ error: "EHR system, encounter data, and access token are required" });
      }

      const { ehrIntegrationService } = await import('./services/ehr-integration');
      const encounterId = await ehrIntegrationService.createEncounter(ehrSystem, encounter, accessToken);

      if (!encounterId) {
        return res.status(500).json({ error: "Failed to create encounter in EHR" });
      }

      res.json({ encounterId });
    } catch (error) {
      console.error('EHR encounter creation error:', error);
      res.status(500).json({ error: "Failed to create encounter in EHR" });
    }
  });

  app.post("/api/ehr/push-diagnosis", async (req, res) => {
    try {
      const { ehrSystem, patientId, encounterId, diagnosis, accessToken } = req.body;
      
      if (!ehrSystem || !patientId || !encounterId || !diagnosis || !accessToken) {
        return res.status(400).json({ error: "All fields are required for pushing diagnosis" });
      }

      const { ehrIntegrationService } = await import('./services/ehr-integration');
      const success = await ehrIntegrationService.pushDiagnosticResults(
        ehrSystem,
        patientId,
        encounterId,
        diagnosis,
        accessToken
      );

      res.json({ success });
    } catch (error) {
      console.error('EHR diagnosis push error:', error);
      res.status(500).json({ error: "Failed to push diagnosis to EHR" });
    }
  });

  app.post("/api/ehr/generate-note", async (req, res) => {
    try {
      const { symptoms, diagnosis, recommendations, riskAssessment } = req.body;
      
      if (!symptoms || !diagnosis) {
        return res.status(400).json({ error: "Symptoms and diagnosis are required" });
      }

      const { ehrIntegrationService } = await import('./services/ehr-integration');
      const note = await ehrIntegrationService.generateStructuredNote({
        symptoms,
        diagnosis,
        recommendations: recommendations || [],
        riskAssessment: riskAssessment || []
      });

      res.json(note);
    } catch (error) {
      console.error('EHR note generation error:', error);
      res.status(500).json({ error: "Failed to generate structured note" });
    }
  });

  // PDF generation endpoint
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { caseId } = req.body;
      const caseData = await storage.getCase(caseId);
      if (!caseData) {
        return res.status(404).json({ error: "Case not found" });
      }

      let diseaseData;
      if (caseData.orphaCode) {
        diseaseData = await storage.getDiseaseByOrphaCode(caseData.orphaCode);
      }

      const pdfContent = pdfService.generateReferralPdf(caseData, diseaseData);
      const htmlContent = pdfService.generatePdfHtml(pdfContent);

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', 'inline; filename="referral-report.html"');
      res.send(htmlContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Sync with Orphadata
  app.post("/api/sync-orphadata", async (req, res) => {
    try {
      console.log('Starting Orphadata sync...');
      const diseases = await orphadataService.fetchDiseases();
      console.log(`Fetched ${diseases.length} diseases from Orphadata service`);
      let syncedCount = 0;

      for (const orphaDisease of diseases) {
        try {
          const existingDisease = await storage.getDiseaseByOrphaCode(orphaDisease.ORPHAcode);
          
          if (!existingDisease) {
            const diseaseData = {
              orphaCode: orphaDisease.ORPHAcode,
              name: orphaDisease.Name,
              definition: orphaDisease.Definition || null,
              prevalence: orphaDisease.Prevalence?.Class || null,
              inheritance: Array.isArray(orphaDisease.Inheritance) ? orphaDisease.Inheritance.join(', ') : (orphaDisease.Inheritance || null),
              phenotypes: orphaDisease.Phenotypes?.map(p => ({
                hpoId: p.HPOId,
                label: p.HPOTerm,
                frequency: p.HPOFrequency
              })) || [],
              geneReviewsUrl: orphaDisease.GeneReviews || null,
              omimId: orphaDisease.OMIM || null,
              recommendedTests: orphaDisease.RecommendedTests || null
            };

            await storage.createDisease(diseaseData);
            syncedCount++;
          }
        } catch (diseaseError) {
          console.error(`Error processing disease ${orphaDisease.ORPHAcode}:`, diseaseError);
        }
      }

      console.log(`Successfully synced ${syncedCount} diseases to database`);
      res.json({ message: `Synced ${syncedCount} diseases from Orphadata` });
    } catch (error) {
      console.error('Error syncing Orphadata:', error);
      res.status(500).json({ error: "Failed to sync with Orphadata" });
    }
  });

  // Physician Profile endpoints
  app.get("/api/physicians", async (req, res) => {
    try {
      const physicians = await storage.getPhysicians();
      res.json(physicians);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch physicians" });
    }
  });

  app.get("/api/physicians/by-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const physician = await storage.getPhysicianByUserId(userId);
      if (!physician) {
        return res.status(404).json({ error: "Physician profile not found" });
      }
      res.json(physician);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch physician profile" });
    }
  });

  app.post("/api/physicians", async (req, res) => {
    try {
      const physicianData = req.body;
      const physician = await storage.createPhysician(physicianData);
      res.json(physician);
    } catch (error) {
      console.error("Error creating physician:", error);
      res.status(500).json({ error: "Failed to create physician profile" });
    }
  });

  app.put("/api/physicians/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const physicianData = req.body;
      const physician = await storage.updatePhysician(parseInt(id), physicianData);
      if (!physician) {
        return res.status(404).json({ error: "Physician not found" });
      }
      res.json(physician);
    } catch (error) {
      console.error("Error updating physician:", error);
      res.status(500).json({ error: "Failed to update physician profile" });
    }
  });

  // Test Cases endpoints
  app.get("/api/test-cases", async (req, res) => {
    try {
      const testCases = testCaseService.getTestCases();
      res.json(testCases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test cases" });
    }
  });

  app.get("/api/test-cases/:id", async (req, res) => {
    try {
      const testCase = testCaseService.getTestCaseById(req.params.id);
      if (!testCase) {
        return res.status(404).json({ error: "Test case not found" });
      }
      res.json(testCase);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test case" });
    }
  });

  app.get("/api/test-cases/difficulty/:difficulty", async (req, res) => {
    try {
      const difficulty = req.params.difficulty as 'easy' | 'medium' | 'hard';
      const testCases = testCaseService.getTestCasesByDifficulty(difficulty);
      res.json(testCases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test cases by difficulty" });
    }
  });

  app.get("/api/test-cases/random", async (req, res) => {
    try {
      const testCase = testCaseService.getRandomTestCase();
      res.json(testCase);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch random test case" });
    }
  });

  // Photo analysis endpoint (placeholder - requires OpenAI API key)
  app.post("/api/photo-analysis", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      // For now, return a placeholder response since OpenAI API key is not available
      const mockResult = {
        dysmorphicFeatures: [
          "Hypertelorism (wide-set eyes)",
          "Low-set ears", 
          "Micrognathia (small jaw)",
          "Prominent forehead"
        ],
        suggestedConditions: [
          "22q11.2 deletion syndrome",
          "Noonan syndrome",
          "Williams-Beuren syndrome"
        ],
        confidence: 0.75,
        recommendations: "Consider genetic consultation and chromosomal microarray analysis"
      };
      
      res.json(mockResult);
    } catch (error) {
      console.error("Photo analysis error:", error);
      res.status(500).json({ error: "Failed to analyze photo" });
    }
  });

  // Physician profile endpoints
  app.get("/api/physicians", async (req, res) => {
    try {
      const physicians = await storage.getPhysicians();
      res.json(physicians);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch physicians" });
    }
  });

  app.get("/api/physicians/by-user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const physician = await storage.getPhysicianByUserId(userId);
      if (!physician) {
        return res.status(404).json({ error: "Physician profile not found" });
      }
      res.json(physician);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch physician profile" });
    }
  });

  app.post("/api/physicians", async (req, res) => {
    try {
      const validatedData = insertPhysicianSchema.parse(req.body);
      const physician = await storage.createPhysician(validatedData);
      res.status(201).json(physician);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid physician data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create physician profile" });
    }
  });

  app.put("/api/physicians/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPhysicianSchema.partial().parse(req.body);
      const physician = await storage.updatePhysician(id, validatedData);
      res.json(physician);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid physician data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update physician profile" });
    }
  });



  // Gene panel recommendations
  app.get('/api/gene-panels/recommendations', async (req, res) => {
    try {
      const { symptoms, suspectedDiagnosis, orphaCode } = req.query;
      
      if (!symptoms) {
        return res.status(400).json({ message: 'Symptoms parameter is required' });
      }

      // Parse symptoms - could be comma-separated string or array
      const symptomsArray = Array.isArray(symptoms) ? symptoms : (symptoms as string).split(',');

      const { pubCaseFinderService } = await import('./services/pubcasefinder-service');
      
      const recommendations = await pubCaseFinderService.getTestingRecommendations(
        symptomsArray as string[],
        suspectedDiagnosis as string,
        orphaCode as string
      );

      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching gene panel recommendations:', error);
      res.status(500).json({ message: 'Failed to fetch gene panel recommendations' });
    }
  });

  // Search gene panels
  app.post('/api/gene-panels/search', async (req, res) => {
    try {
      const { phenotypes, genes, mode, maxResults } = req.body;
      
      if (!phenotypes || !Array.isArray(phenotypes)) {
        return res.status(400).json({ message: 'Phenotypes array is required' });
      }

      const { pubCaseFinderService } = await import('./services/pubcasefinder-service');
      
      const results = await pubCaseFinderService.searchGenePanels({
        phenotypes,
        genes,
        mode,
        maxResults
      });

      res.json(results);
    } catch (error) {
      console.error('Error searching gene panels:', error);
      res.status(500).json({ message: 'Failed to search gene panels' });
    }
  });

  // Disease Markers endpoints
  app.get('/api/disease-markers/:orphaCode', async (req, res) => {
    try {
      const { orphaCode } = req.params;
      const markers = diseaseMarkersService.getMarkersByOrphaCode(orphaCode);
      res.json(markers);
    } catch (error) {
      console.error('Error fetching disease markers:', error);
      res.status(500).json({ error: 'Failed to fetch disease markers' });
    }
  });

  app.get('/api/disease-markers', async (req, res) => {
    try {
      const markers = diseaseMarkersService.getAllMarkers();
      res.json(markers);
    } catch (error) {
      console.error('Error fetching all disease markers:', error);
      res.status(500).json({ error: 'Failed to fetch disease markers' });
    }
  });

  // Test Confirmations endpoints
  app.post('/api/test-confirmations', async (req, res) => {
    try {
      const validatedData = insertTestConfirmationSchema.parse(req.body);
      const testConfirmation = await storage.createTestConfirmation(validatedData);
      res.status(201).json(testConfirmation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid test confirmation data', details: error.errors });
      }
      console.error('Error creating test confirmation:', error);
      res.status(500).json({ error: 'Failed to save test confirmation' });
    }
  });

  app.get('/api/test-confirmations/:caseId', async (req, res) => {
    try {
      const { caseId } = req.params;
      const testConfirmations = await storage.getTestConfirmationsByCase(parseInt(caseId));
      res.json(testConfirmations);
    } catch (error) {
      console.error('Error fetching test confirmations:', error);
      res.status(500).json({ error: 'Failed to fetch test confirmations' });
    }
  });

  app.put('/api/test-confirmations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTestConfirmationSchema.partial().parse(req.body);
      const testConfirmation = await storage.updateTestConfirmation(parseInt(id), validatedData);
      res.json(testConfirmation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid test confirmation data', details: error.errors });
      }
      console.error('Error updating test confirmation:', error);
      res.status(500).json({ error: 'Failed to update test confirmation' });
    }
  });

  // =============================================
  // Community Features API - iGEM 2025 Competition
  // =============================================

  // Crowdsourced Case Repository
  app.get("/api/community/cases", async (req, res) => {
    try {
      const { search, difficulty, outcome, country } = req.query;
      const cases = await storage.getAllCrowdsourcedCases({
        search: search as string,
        difficulty: difficulty as string,
        outcome: outcome as string,
        country: country as string
      });
      res.json(cases);
    } catch (error) {
      console.error("Error fetching crowdsourced cases:", error);
      res.status(500).json({ error: "Failed to fetch cases" });
    }
  });

  app.post("/api/community/cases", async (req, res) => {
    try {
      // Simple validation and data preparation
      const caseData = {
        ...req.body,
        anonymousId: `phys_${Math.random().toString(36).substring(2, 15)}`,
        symptoms: req.body.symptoms || []
      };
      
      // Validate required fields
      if (!caseData.confirmedDiagnosis) {
        return res.status(400).json({ error: "Confirmed diagnosis is required" });
      }
      
      console.log("Creating case with data:", JSON.stringify(caseData, null, 2));
      
      const newCase = await storage.createCrowdsourcedCase(caseData);
      res.status(201).json(newCase);
    } catch (error) {
      console.error("Error creating crowdsourced case:", error);
      res.status(400).json({ error: "Invalid case data", details: error.message });
    }
  });

  app.post("/api/community/cases/:id/upvote", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.upvoteCrowdsourcedCase(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Case not found" });
      }
    } catch (error) {
      console.error("Error upvoting case:", error);
      res.status(500).json({ error: "Failed to upvote case" });
    }
  });

  // Global Phenotype Mapping
  app.get("/api/community/phenotype-mapping", async (req, res) => {
    try {
      const { search, country } = req.query;
      const mapping = await storage.getPhenotypeMapping({
        search: search as string,
        country: country as string
      });
      res.json(mapping);
    } catch (error) {
      console.error("Error fetching phenotype mapping:", error);
      res.status(500).json({ error: "Failed to fetch phenotype mapping" });
    }
  });

  app.get("/api/community/phenotype-stats", async (req, res) => {
    try {
      // Generate mock stats for now - in real app would calculate from actual data
      const stats = {
        totalPhenotypes: 979,
        totalCountries: 45,
        totalReports: 15250,
        avgPrevalence: 2.35
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching phenotype stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Diagnostic Challenges
  app.get("/api/community/challenges", async (req, res) => {
    try {
      const { search, difficulty, status } = req.query;
      const challenges = await storage.getAllDiagnosticChallenges({
        search: search as string,
        difficulty: difficulty as string,
        status: status as string
      });
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching diagnostic challenges:", error);
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });

  app.post("/api/community/challenges", async (req, res) => {
    try {
      const insertChallengeSchema = createInsertSchema(diagnosticChallenges);
      const challengeData = insertChallengeSchema.parse({
        ...req.body,
        createdBy: `phys_${Math.random().toString(36).substring(2, 15)}`
      });
      
      const newChallenge = await storage.createDiagnosticChallenge(challengeData);
      res.status(201).json(newChallenge);
    } catch (error) {
      console.error("Error creating diagnostic challenge:", error);
      res.status(400).json({ error: "Invalid challenge data" });
    }
  });

  app.get("/api/community/challenges/:id/responses", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const responses = await storage.getChallengeResponses(challengeId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching challenge responses:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.post("/api/community/challenge-responses", async (req, res) => {
    try {
      const insertResponseSchema = createInsertSchema(challengeResponses);
      const responseData = insertResponseSchema.parse({
        ...req.body,
        physicianId: `phys_${Math.random().toString(36).substring(2, 15)}`
      });
      
      const newResponse = await storage.createChallengeResponse(responseData);
      
      // Update challenge participant count
      await storage.updateChallengeParticipants(responseData.challengeId);
      
      res.status(201).json(newResponse);
    } catch (error) {
      console.error("Error creating challenge response:", error);
      res.status(400).json({ error: "Invalid response data" });
    }
  });

  app.post("/api/community/responses/:id/:voteType", async (req, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const voteType = req.params.voteType as 'up' | 'down';
      
      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }
      
      const success = await storage.voteChallengeResponse(responseId, voteType);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Response not found" });
      }
    } catch (error) {
      console.error("Error voting on response:", error);
      res.status(500).json({ error: "Failed to vote on response" });
    }
  });

  // Community Statistics and Leaderboard
  app.get("/api/community/stats", async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats || {
        totalContributions: 0,
        totalParticipants: 0,
        totalCountries: 0,
        totalChallengesSolved: 0,
        avgDiagnosticAccuracy: 0
      });
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ error: "Failed to fetch community stats" });
    }
  });

  app.get("/api/community/leaderboard", async (req, res) => {
    try {
      const profiles = await storage.getPhysicianProfiles();
      // Sort by contribution score and return top 50
      const leaderboard = profiles
        .sort((a, b) => (b.contributionScore || 0) - (a.contributionScore || 0))
        .slice(0, 50);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
