# RareMD Assist - Complete Technical Architecture

## Overview
RareMD Assist is a full-stack web application built with modern JavaScript/TypeScript technologies, designed specifically for rare genetic disease diagnosis and clinical decision support.

## Frontend Architecture

### Core Technologies
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type-safe JavaScript with compile-time error checking
- **Vite** - Ultra-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - High-quality React component library built on Radix UI

### State Management & Data Fetching
- **TanStack Query (React Query)** - Powerful data synchronization for server state
- **React Hook Form + Zod** - Type-safe form handling with validation
- **Wouter** - Lightweight client-side routing (alternative to React Router)

### Key Frontend Features
- **Responsive Design** - Mobile-first approach with Tailwind breakpoints
- **Dark Mode Support** - Complete theme switching with CSS variables
- **Multi-language Support** - Internationalization with instant language switching
- **Real-time Updates** - Live data synchronization with backend
- **Progressive Web App** - Service worker capabilities for offline functionality

### Component Architecture
```
client/src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── header.tsx      # Main navigation header
│   └── secondary-nav.tsx # Collapsible sidebar navigation
├── pages/              # Route-based page components
│   ├── dashboard.tsx   # Main clinical interface
│   ├── analytics.tsx   # System metrics and charts
│   ├── settings.tsx    # User preferences and configuration
│   └── knowledge-base.tsx # Disease information browser
├── hooks/              # Custom React hooks
│   ├── useSettings.ts  # Settings persistence and state
│   └── useAuth.ts      # Authentication state management
└── lib/                # Utility functions and configurations
    ├── translations.ts # Multi-language support
    └── queryClient.ts  # API request configuration
```

## Backend Architecture

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Full type safety across the entire stack
- **PostgreSQL** - Robust relational database for medical data
- **Drizzle ORM** - Type-safe database operations with excellent TypeScript integration

### Database Layer
- **Neon Database** - Serverless PostgreSQL hosting with automatic scaling
- **Drizzle Kit** - Database migrations and schema management
- **Connection Pooling** - Efficient database connection management

### API Architecture
```
server/
├── routes.ts           # Main API route definitions (25+ endpoints)
├── storage.ts          # Database abstraction layer
├── db.ts              # Database connection and configuration
├── services/          # Business logic services
│   ├── orphadata.ts   # Rare disease data integration
│   ├── hpo.ts         # Human Phenotype Ontology service
│   ├── cdss.ts        # Clinical Decision Support System
│   ├── ehr-integration.ts # Healthcare system connectivity
│   ├── ai-analysis.ts # AI-powered photo analysis
│   ├── pdf.ts         # Clinical report generation
│   └── test-cases.ts  # Medical case scenarios
└── index.ts           # Server initialization and middleware
```

## Database Schema Design

### Core Tables
```sql
-- Patient Cases with De-identification
cases (
  id: serial PRIMARY KEY,
  patient_id: text NOT NULL,        -- De-identified patient ID
  age: integer,
  sex: text,
  symptoms: jsonb NOT NULL,         -- HPO-standardized symptom array
  diagnosis: text,
  orpha_code: text,                 -- ORPHA rare disease code
  score: real,                      -- Disease matching confidence
  status: text DEFAULT 'active',
  created_at: timestamp,
  updated_at: timestamp
)

-- Rare Disease Knowledge Base
diseases (
  id: serial PRIMARY KEY,
  orpha_code: text UNIQUE NOT NULL, -- Official ORPHA classification
  name: text NOT NULL,
  definition: text,
  prevalence: text,
  inheritance: text,
  phenotypes: jsonb NOT NULL,       -- Associated HPO terms with frequencies
  gene_reviews_url: text,
  omim_id: text,                    -- OMIM database reference
  recommended_tests: jsonb,
  created_at: timestamp,
  updated_at: timestamp
)

-- Human Phenotype Ontology Terms
hpo_terms (
  id: serial PRIMARY KEY,
  hpo_id: text UNIQUE NOT NULL,     -- Official HPO identifier (HP:xxxxxxx)
  label: text NOT NULL,
  definition: text,
  synonyms: jsonb,                  -- Alternative term names
  is_obsolete: boolean DEFAULT false,
  created_at: timestamp
)

-- Physician Professional Profiles
physicians (
  id: serial PRIMARY KEY,
  user_id: text,
  license_number: text,
  specialty: text,
  hospital_affiliation: text,
  board_certifications: jsonb,      -- Array of certifications
  years_of_experience: integer,
  research_interests: jsonb,
  rare_disease_focus: jsonb,        -- Specialization areas
  created_at: timestamp,
  updated_at: timestamp
)

-- System Analytics and Metrics
analytics (
  id: serial PRIMARY KEY,
  total_cases: integer DEFAULT 0,
  alerts_generated: integer DEFAULT 0,
  diagnosed_cases: integer DEFAULT 0,
  knowledge_base_size: integer DEFAULT 0,
  last_updated: timestamp
)
```

## Medical Data Integration

### Orphanet Integration
- **300+ Rare Diseases** - Complete ORPHA code database
- **Disease Definitions** - Clinical descriptions and prevalence data
- **Inheritance Patterns** - Genetic transmission information
- **Phenotype Mapping** - HPO term associations with frequency data

### HPO (Human Phenotype Ontology) Integration
- **100+ Standardized Terms** - Consistent symptom terminology
- **Hierarchical Relationships** - Parent-child term structures
- **Frequency Annotations** - Symptom occurrence rates
- **Clinical Synonyms** - Alternative medical terminology

## Clinical Decision Support System (CDSS)

### Treatment Recommendation Engine
```typescript
interface TreatmentRecommendation {
  medication: string;
  dosage: string;
  frequency: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';  // Evidence-based medicine levels
  contraindications: string[];
  monitoringRequired: string[];
}
```

### Drug Interaction Checking
- **Medication Cross-Referencing** - Real-time drug interaction analysis
- **Severity Classification** - Major, moderate, minor interaction levels
- **Clinical Recommendations** - Actionable guidance for physicians

### Clinical Pathway Management
- **Multi-step Workflows** - Structured diagnostic and treatment paths
- **Urgency Classification** - Immediate, urgent, routine prioritization
- **Follow-up Scheduling** - Automated care coordination

## Healthcare Integration (HL7 FHIR R4)

### EHR System Connectivity
```typescript
interface FHIRPatient {
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
```

### Supported EHR Systems
- **Epic MyChart** - Full FHIR R4 integration
- **Cerner PowerChart** - Real-time data synchronization
- **athenahealth** - Clinical workflow integration

### Clinical Documentation
- **SOAP Notes** - Automated clinical note generation
- **Continuity of Care Documents (CCD)** - Standardized patient summaries
- **Quality Measures** - Healthcare quality reporting

## AI & Machine Learning Integration

### Photo Analysis Service
- **Facial Dysmorphology Detection** - AI-powered phenotype analysis
- **Feature Extraction** - Automated medical feature identification
- **Confidence Scoring** - Reliability assessment of AI analysis
- **Clinical Correlation** - HPO term mapping from visual features

### Analysis Pipeline
```typescript
interface PhotoAnalysisResult {
  features: string[];                    // Detected dysmorphic features
  confidence: number;                    // AI confidence score (0-1)
  suggestions: string[];                 // Clinical recommendations
  medicalRelevance: string;             // Clinical significance assessment
  hpoMatches: Array<{                   // HPO term correlations
    hpoId: string;
    label: string;
    confidence: number;
  }>;
}
```

## Development & Deployment

### Build Process
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",           // Development server
    "build": "vite build && tsc",          // Production build
    "db:push": "drizzle-kit push",         // Database schema updates
    "db:studio": "drizzle-kit studio"      // Database management UI
  }
}
```

### Development Tools
- **tsx** - TypeScript execution for Node.js
- **Vite HMR** - Hot module replacement for instant updates
- **Drizzle Studio** - Visual database management
- **ESBuild** - Ultra-fast TypeScript compilation

### Production Deployment
- **Single Server Architecture** - Express serves both API and static assets
- **Database Migrations** - Automated schema versioning with Drizzle
- **Asset Optimization** - Vite production builds with code splitting
- **Environment Configuration** - Secure environment variable management

## Security & Compliance

### Healthcare Data Protection
- **De-identification** - Patient data anonymization
- **Secure Transmission** - HTTPS/TLS encryption
- **Access Control** - Role-based permission system
- **Audit Logging** - Complete activity tracking

### Medical Coding Standards
- **ORPHA Codes** - Rare disease classification system
- **HPO Terms** - Standardized phenotype terminology
- **ICD-10** - International disease classification
- **CPT Codes** - Medical procedure coding

## Performance Optimization

### Frontend Performance
- **Code Splitting** - Lazy loading of route components
- **Tree Shaking** - Elimination of unused code
- **Bundle Optimization** - Minimized JavaScript payloads
- **Caching Strategies** - Aggressive browser caching

### Backend Performance
- **Connection Pooling** - Efficient database connections
- **Query Optimization** - Indexed database queries
- **Caching Layer** - In-memory data caching
- **Async Processing** - Non-blocking request handling

## Monitoring & Analytics

### System Metrics
- **Case Processing Volume** - Patient case throughput
- **Diagnostic Accuracy** - AI and clinical correlation rates
- **Response Times** - API performance monitoring
- **Error Tracking** - Comprehensive error logging

### Clinical Analytics
- **Disease Pattern Analysis** - Epidemiological insights
- **Treatment Effectiveness** - Outcome tracking
- **Physician Usage Patterns** - Workflow optimization data
- **Quality Measures** - Healthcare quality indicators

This architecture provides a robust, scalable, and clinically-focused platform for rare disease diagnosis and clinical decision support, built with modern web technologies and healthcare industry standards.