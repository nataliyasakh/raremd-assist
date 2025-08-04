import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { orphadataService } from "./services/orphadata";
import { hpoService } from "./services/hpo";
import { pdfService } from "./services/pdf";
import { testCaseService } from "./services/test-cases";
import { photoAnalysisService } from "./services/photo-analysis";
import { insertCaseSchema, insertDiseaseSchema, insertPhysicianSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  await hpoService.initializeService();

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
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
      res.status(201).json(newCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
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
      res.json(updatedCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
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
      if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({ error: "Invalid symptoms data" });
      }

      const diseases = await storage.getAllDiseases();
      const scoredDiseases = diseases.map(disease => {
        let score = 0;
        let keyMatches = 0;
        let supportingMatches = 0;

        for (const symptom of symptoms) {
          const phenotype = disease.phenotypes.find(p => p.hpoId === symptom.hpoId);
          if (phenotype) {
            if (orphadataService.isKeySymptom(phenotype.frequency)) {
              keyMatches++;
              score += 2;
            } else {
              supportingMatches++;
              score += 1;
            }
          }
        }

        return {
          disease,
          score,
          keyMatches,
          supportingMatches,
          priority: score >= 7 ? 'high' : score >= 5 ? 'medium' : 'low'
        };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

      res.json(scoredDiseases);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze symptoms" });
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
      const diseases = await orphadataService.fetchDiseases();
      let syncedCount = 0;

      for (const orphaDisease of diseases) {
        const existingDisease = await storage.getDiseaseByOrphaCode(orphaDisease.ORPHAcode);
        
        if (!existingDisease) {
          const diseaseData = {
            orphaCode: orphaDisease.ORPHAcode,
            name: orphaDisease.Name,
            definition: orphaDisease.Definition,
            prevalence: orphaDisease.Prevalence?.Class,
            inheritance: orphaDisease.Inheritance?.join(', '),
            phenotypes: orphaDisease.Phenotypes?.map(p => ({
              hpoId: p.HPOId,
              label: p.HPOTerm,
              frequency: p.HPOFrequency
            })) || [],
            geneReviewsUrl: orphaDisease.GeneReviews,
            omimId: orphaDisease.OMIM,
            recommendedTests: orphaDisease.RecommendedTests || []
          };

          await storage.createDisease(diseaseData);
          syncedCount++;
        }
      }

      res.json({ message: `Synced ${syncedCount} diseases from Orphadata` });
    } catch (error) {
      res.status(500).json({ error: "Failed to sync with Orphadata" });
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



  const httpServer = createServer(app);
  return httpServer;
}
