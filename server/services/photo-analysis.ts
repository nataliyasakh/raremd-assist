import OpenAI from 'openai';

interface DysmorphicAnalysis {
  suggestedDiagnoses: Array<{
    condition: string;
    orphaCode: string;
    confidence: number;
    reasoning: string;
    keyFeatures: string[];
  }>;
  identifiedFeatures: string[];
  recommendations: string[];
  disclaimer: string;
}

export class PhotoAnalysisService {
  private openai: OpenAI | null = null;

  constructor() {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async analyzeDysmorphicFeatures(imageBase64: string): Promise<DysmorphicAnalysis> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please provide OPENAI_API_KEY to enable photo analysis.');
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert clinical geneticist analyzing patient photos for dysmorphic features that may suggest rare genetic conditions. Analyze the image for:

1. Facial dysmorphic features (head shape, eyes, nose, mouth, ears)
2. Growth parameters (apparent size, proportions)
3. Skin findings
4. Limb abnormalities
5. Other notable physical characteristics

Provide analysis in JSON format with:
- suggestedDiagnoses: array of potential conditions with ORPHA codes, confidence (0-1), reasoning, and key supporting features
- identifiedFeatures: list of observed dysmorphic features using medical terminology
- recommendations: suggested genetic tests and evaluations
- disclaimer: medical disclaimer about photo analysis limitations

Focus on well-established genetic syndromes with clear dysmorphic patterns. Be conservative with confidence scores and emphasize the need for clinical correlation.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this patient photo for dysmorphic features that might suggest rare genetic conditions. Provide detailed analysis with potential diagnoses and recommendations."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        suggestedDiagnoses: result.suggestedDiagnoses || [],
        identifiedFeatures: result.identifiedFeatures || [],
        recommendations: result.recommendations || [],
        disclaimer: result.disclaimer || "Photo analysis is a supplementary tool and should not replace comprehensive clinical evaluation. All findings require clinical correlation and genetic counseling."
      };

    } catch (error) {
      console.error('Error analyzing photo:', error);
      throw new Error('Failed to analyze photo for dysmorphic features');
    }
  }

  async generateClinicalReport(analysis: DysmorphicAnalysis, symptoms: string[]): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please provide OPENAI_API_KEY to enable report generation.');
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a clinical geneticist generating a structured report that combines photo analysis with clinical symptoms. Create a professional medical report that integrates both photo findings and clinical presentations."
          },
          {
            role: "user",
            content: `Create a clinical genetics consultation report that integrates:

Photo Analysis Findings:
- Identified Features: ${analysis.identifiedFeatures.join(', ')}
- Suggested Conditions: ${analysis.suggestedDiagnoses.map(d => d.condition).join(', ')}

Clinical Symptoms:
${symptoms.join(', ')}

Format as a structured medical report with:
1. Clinical Presentation Summary
2. Dysmorphic Features Assessment
3. Differential Diagnosis with rationale
4. Recommended Genetic Testing
5. Follow-up Recommendations`
          }
        ],
        max_tokens: 1000,
      });

      return response.choices[0].message.content || '';

    } catch (error) {
      console.error('Error generating clinical report:', error);
      throw new Error('Failed to generate clinical report');
    }
  }
}

export const photoAnalysisService = new PhotoAnalysisService();