interface FHIRResource {
  resourceType: string;
  id: string;
  meta?: {
    lastUpdated: string;
    versionId: string;
  };
}

interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier: Array<{
    use: string;
    system: string;
    value: string;
  }>;
  name: Array<{
    use: string;
    family: string;
    given: string[];
  }>;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
}

interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'final' | 'preliminary' | 'registered';
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject: {
    reference: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
}

export class EHRIntegrationService {
  private fhirBaseUrl = process.env.FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4';

  async syncPatientData(patientId: string): Promise<FHIRPatient | null> {
    try {
      // Simulated FHIR patient data retrieval
      const mockPatient: FHIRPatient = {
        resourceType: 'Patient',
        id: patientId,
        meta: {
          lastUpdated: new Date().toISOString(),
          versionId: '1'
        },
        identifier: [
          {
            use: 'usual',
            system: 'http://hospital.org/patients',
            value: patientId
          }
        ],
        name: [
          {
            use: 'official',
            family: 'Anonymous',
            given: ['Patient']
          }
        ],
        gender: 'unknown',
        birthDate: '2020-01-01'
      };

      return mockPatient;
    } catch (error) {
      console.error('Failed to sync patient data:', error);
      return null;
    }
  }

  async createFHIRObservation(
    patientId: string, 
    symptom: { hpoId: string; label: string; frequency?: string }
  ): Promise<FHIRObservation> {
    const observation: FHIRObservation = {
      resourceType: 'Observation',
      id: `obs-${Date.now()}`,
      meta: {
        lastUpdated: new Date().toISOString(),
        versionId: '1'
      },
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://purl.obolibrary.org/obo/hp.owl',
            code: symptom.hpoId,
            display: symptom.label
          }
        ]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      valueString: symptom.frequency || 'present'
    };

    return observation;
  }

  async generateContinuityOfCareDocument(
    patientId: string,
    diagnosis: string,
    symptoms: Array<{ hpoId: string; label: string }>
  ): Promise<{
    documentType: 'CCD';
    patient: FHIRPatient;
    observations: FHIRObservation[];
    diagnosis: string;
    generatedAt: string;
  }> {
    const patient = await this.syncPatientData(patientId);
    const observations = await Promise.all(
      symptoms.map(symptom => this.createFHIRObservation(patientId, symptom))
    );

    return {
      documentType: 'CCD',
      patient: patient!,
      observations,
      diagnosis,
      generatedAt: new Date().toISOString()
    };
  }

  async submitToQualityMeasures(caseId: number, diagnosisAccuracy: number): Promise<{
    measureId: string;
    score: number;
    benchmarkComparison: string;
  }> {
    // Quality measure reporting for rare disease diagnosis
    return {
      measureId: 'RARE_DISEASE_ACCURACY',
      score: diagnosisAccuracy,
      benchmarkComparison: diagnosisAccuracy > 0.85 ? 'above_benchmark' : 'below_benchmark'
    };
  }

  async getEHRIntegrationStatus(): Promise<{
    systems: Array<{
      name: string;
      status: 'connected' | 'disconnected' | 'pending';
      lastSync: string;
      version: string;
    }>;
  }> {
    return {
      systems: [
        {
          name: 'Epic MyChart',
          status: 'connected',
          lastSync: new Date().toISOString(),
          version: 'FHIR R4'
        },
        {
          name: 'Cerner PowerChart',
          status: 'connected',
          lastSync: new Date().toISOString(),
          version: 'FHIR R4'
        },
        {
          name: 'athenahealth',
          status: 'pending',
          lastSync: '',
          version: 'FHIR R4'
        }
      ]
    };
  }
}

export const ehrIntegrationService = new EHRIntegrationService();