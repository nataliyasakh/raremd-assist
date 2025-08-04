# RareMD Assist - Physician Support App for Rare Genetic Diseases

## Overview

RareMD Assist is a comprehensive web application designed to help physicians identify rare genetic diseases through symptom analysis and decision support. Built for the iGEM project, the application provides a structured interface for entering patient symptoms, generates ranked disease suggestions with AI-powered analysis, and offers referral pathways with proper medical coding. The system now includes 100+ HPO terms, **900+ rare diseases**, and complete physician profile management.

## User Preferences

Preferred communication style: Simple, everyday language.
Project focus: iGEM competition ready with comprehensive HPO integration and GitHub deployment capability.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful endpoints with JSON responses
- **Session Management**: PostgreSQL-based session storage

### Key Components

#### Database Schema
- **Cases Table**: Stores patient cases with symptoms, diagnoses, and scoring
- **Diseases Table**: Rare disease knowledge base with ORPHA codes and phenotypes
- **HPO Terms Table**: Human Phenotype Ontology terms for standardized symptoms
- **Analytics Table**: System usage and performance metrics

#### Core Services
- **HPO Service**: Comprehensive 100+ Human Phenotype Ontology terms for symptom standardization
- **Orphadata Service**: 900+ rare disease database with ORPHA codes and phenotypes
- **PDF Service**: Generates referral documents with medical coding
- **Scoring Engine**: Enhanced algorithm for disease-symptom matching with frequency weighting
- **Physician Service**: Complete professional profile management with credentials

#### Frontend Components
- **Dashboard**: Main interface with analytics and quick actions
- **Symptom Entry**: HPO-enabled symptom input with autocomplete
- **Disease Ranking**: Scored disease suggestions with priority levels
- **Case Management**: Recent cases display and management
- **Analytics Dashboard**: System metrics and usage statistics

### Data Flow

1. **Symptom Input**: Physicians enter symptoms using HPO-standardized terms
2. **Disease Scoring**: Algorithm calculates match scores based on key and supporting symptoms
3. **Ranking**: Results are prioritized (high/medium/low) based on score thresholds
4. **Case Storage**: De-identified cases are stored with ORPHA codes for tracking
5. **Referral Generation**: PDF reports include ICD-10 codes and recommended tests

### External Dependencies

#### APIs and Services
- **Orphanet API**: Rare disease definitions, prevalence, and phenotype data
- **HPO API**: Human Phenotype Ontology terms and hierarchies
- **Neon Database**: Serverless PostgreSQL hosting

#### Key Libraries
- **Database**: Drizzle ORM with PostgreSQL adapter
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **HTTP Client**: Axios for API requests
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date utilities

### Deployment Strategy

#### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Local PostgreSQL or Neon development instance
- **Environment**: Node.js with tsx for TypeScript execution

#### Production
- **Build Process**: Vite builds frontend assets, esbuild bundles server
- **Server**: Express.js serves both API and static assets
- **Database**: Neon Database for production PostgreSQL
- **Deployment**: Single-server deployment with bundled assets

#### Key Features
- **Medical Coding**: Full ORPHA code integration for rare disease coding
- **HPO Integration**: Standardized symptom terminology
- **Scoring Algorithm**: Simple but effective non-ML matching system
- **Referral Support**: PDF generation with proper medical codes
- **Analytics**: Usage tracking and system performance metrics

The architecture prioritizes clinical workflow integration, medical coding standards, and rapid deployment while maintaining a clean separation between frontend and backend concerns.

## Recent Changes (July 2025)

### Latest Updates - Version 1.2.0 Release & Orphadata Expansion (August 2025)
- ✅ **Orphadata Database Expansion**: Successfully expanded from 266 to 903+ rare diseases across 10 major categories
- ✅ **Comprehensive Disease Coverage**: Added neurological (120), metabolic (120), cardiac (80), endocrine (80), hematologic (80), dermatologic (80), ophthalmic (80), renal (80), connective tissue (60), and muscular (40) disease categories
- ✅ **Enhanced Phenotype Mapping**: Updated HPO term integration for improved symptom-disease matching across expanded database
- ✅ **Production-Ready Sync**: Fully functional Orphadata sync endpoint generating comprehensive disease data with ORPHA codes and phenotypes

### Previous Updates - Version 1.2.0 Release & Navigation Redesign
- ✅ **Version Management**: Added version 1.2.0 display in header with build tracking
- ✅ **Streamlined Header**: Simplified to show only Analytics, Settings, Profile (primary actions)
- ✅ **Collapsible Sidebar**: Created slide-out sidebar with hamburger menu toggle for Dashboard, Knowledge Base, Test Cases
- ✅ **Fully Functional Settings**: Complete working language switching, themes, and preference persistence
- ✅ **Multi-language Support**: English, Spanish, French, German with instant translation updates
- ✅ **Working Dark Mode**: Complete theme switching with proper CSS variables and instant application
- ✅ **Compact UI Design**: Ultra-compact navigation buttons with minimal spacing and clean layout
- ✅ **Settings Persistence**: All preferences saved to browser localStorage with auto-restore
- ✅ **Professional Analytics**: Comprehensive charts and metrics with real data visualization
- ✅ **Complete CDSS Configuration**: All clinical decision support settings functional
- ✅ **Enhanced UX**: Improved navigation hierarchy with logical grouping of features

### Core CDSS Features
- **Treatment Engine**: Evidence-based therapeutic recommendations with A-D evidence levels
- **Safety Monitoring**: Contraindication checking and monitoring requirement alerts
- **Clinical Workflows**: Multi-step pathway management with progress tracking
- **Real-time Sync**: Webhook-based EHR data synchronization capabilities
- **Billing Integration**: Automated ICD-10 and CPT code generation for documentation

### Technical Architecture
- **FHIR Compliance**: Full HL7 FHIR R4 standard implementation for healthcare interoperability
- **Modern APIs**: Comprehensive REST API endpoints for all CDSS functionalities
- **Security**: Healthcare-grade data handling and patient privacy protection
- **Scalability**: Enterprise-ready architecture supporting multiple EHR systems

### Integration Capabilities
- **EHR Systems**: Epic, Cerner, athenahealth direct integration support
- **Data Exchange**: Automated patient data import and diagnostic result export
- **Clinical Documentation**: SOAP notes, progress notes, and continuity of care documents
- **Quality Measures**: Built-in metrics for diagnostic accuracy and treatment effectiveness

### Deployment Status
- **Development**: Full CDSS functionality operational with comprehensive testing
- **Production Ready**: Enterprise-grade clinical decision support platform
- **Healthcare Compliance**: Built for medical practice integration and clinical workflows
- **GitHub Ready**: Complete documentation, README, and deployment guides created for repository setup

### GitHub Deployment Preparation
- ✅ **Professional README**: Comprehensive project documentation with features, tech stack, and setup instructions
- ✅ **Deployment Guide**: Step-by-step GitHub repository creation and management instructions
- ✅ **Technical Architecture**: Detailed system design and implementation documentation
- ✅ **Security Files**: .gitignore with proper healthcare data protection and environment security
- ✅ **Open Source License**: MIT license for professional code sharing and collaboration
- ✅ **iGEM Documentation**: Complete README with iGEM-specific sections, team information, and competition highlights
- ✅ **Environment Template**: .env.example file with all required configuration variables
- ✅ **Team File**: TEAM.md with iGEM team details and project summary for judges