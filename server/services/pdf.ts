import { Case, Disease } from "@shared/schema";

export interface PdfContent {
  patientInfo: {
    patientId: string;
    age?: number;
    sex?: string;
  };
  symptoms: Array<{
    hpoId: string;
    label: string;
    frequency?: string;
  }>;
  diagnosis?: {
    name: string;
    orphaCode: string;
    score: number;
    icd10Code?: string;
  };
  recommendedTests?: Array<{
    test: string;
    description: string;
  }>;
  referralInfo: {
    date: string;
    referringPhysician: string;
    urgencyLevel: 'high' | 'medium' | 'low';
  };
}

export class PdfService {
  generateReferralPdf(caseData: Case, diseaseData?: Disease): PdfContent {
    const urgencyLevel = this.determineUrgencyLevel(caseData.score || 0);
    
    const pdfContent: PdfContent = {
      patientInfo: {
        patientId: caseData.patientId,
        age: caseData.age || undefined,
        sex: caseData.sex || undefined
      },
      symptoms: caseData.symptoms || [],
      referralInfo: {
        date: new Date().toISOString().split('T')[0],
        referringPhysician: 'Dr. Smith', // This would come from auth context
        urgencyLevel
      }
    };

    if (caseData.diagnosis && caseData.orphaCode && diseaseData) {
      pdfContent.diagnosis = {
        name: caseData.diagnosis,
        orphaCode: caseData.orphaCode,
        score: caseData.score || 0,
        icd10Code: this.getIcd10Code(caseData.orphaCode)
      };

      if (diseaseData.recommendedTests) {
        pdfContent.recommendedTests = diseaseData.recommendedTests;
      }
    }

    return pdfContent;
  }

  private determineUrgencyLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 7) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  private getIcd10Code(orphaCode: string): string {
    // This would typically come from a mapping service
    // For now, return a generic code
    const mappings: Record<string, string> = {
      'ORPHA:137': 'E77.8', // CDG syndrome
      'ORPHA:355': 'E75.22', // Gaucher disease
      'ORPHA:324': 'E75.21', // Fabry disease
      'ORPHA:739': 'Q87.1', // Prader-Willi syndrome
      'ORPHA:778': 'F84.2' // Rett syndrome
    };

    return mappings[orphaCode] || 'Z87.891'; // Generic rare disease code
  }

  generatePdfHtml(content: PdfContent): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>RareMD Assist - Referral Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .urgency-high { color: #dc2626; font-weight: bold; }
          .urgency-medium { color: #ea580c; font-weight: bold; }
          .urgency-low { color: #059669; font-weight: bold; }
          .symptom-item { margin: 5px 0; }
          .code { font-family: monospace; background: #f3f4f6; padding: 2px 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RareMD Assist</h1>
          <h2>Rare Disease Referral Report</h2>
          <p>Date: ${content.referralInfo.date}</p>
          <p>Referring Physician: ${content.referralInfo.referringPhysician}</p>
          <p class="urgency-${content.referralInfo.urgencyLevel}">
            Urgency Level: ${content.referralInfo.urgencyLevel.toUpperCase()}
          </p>
        </div>

        <div class="section">
          <h3>Patient Information</h3>
          <p><strong>Patient ID:</strong> ${content.patientInfo.patientId}</p>
          ${content.patientInfo.age ? `<p><strong>Age:</strong> ${content.patientInfo.age}</p>` : ''}
          ${content.patientInfo.sex ? `<p><strong>Sex:</strong> ${content.patientInfo.sex}</p>` : ''}
        </div>

        <div class="section">
          <h3>Clinical Symptoms (HPO Terms)</h3>
          ${content.symptoms.map(symptom => `
            <div class="symptom-item">
              <strong>${symptom.label}</strong> 
              <span class="code">${symptom.hpoId}</span>
              ${symptom.frequency ? `<em>(${symptom.frequency})</em>` : ''}
            </div>
          `).join('')}
        </div>

        ${content.diagnosis ? `
          <div class="section">
            <h3>Suspected Diagnosis</h3>
            <p><strong>Disease:</strong> ${content.diagnosis.name}</p>
            <p><strong>ORPHA Code:</strong> <span class="code">${content.diagnosis.orphaCode}</span></p>
            <p><strong>ICD-10 Code:</strong> <span class="code">${content.diagnosis.icd10Code}</span></p>
            <p><strong>Match Score:</strong> ${content.diagnosis.score}</p>
          </div>
        ` : ''}

        ${content.recommendedTests && content.recommendedTests.length > 0 ? `
          <div class="section">
            <h3>Recommended Tests</h3>
            ${content.recommendedTests.map(test => `
              <div class="symptom-item">
                <strong>${test.test}</strong>
                <p style="margin-left: 20px;">${test.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="section">
          <h3>Additional Information</h3>
          <p>This report was generated by RareMD Assist, a physician support tool for rare genetic disease diagnosis.</p>
          <p>For more information, please consult the referenced medical databases or contact the genetics department.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const pdfService = new PdfService();
