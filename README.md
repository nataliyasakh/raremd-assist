# RareMD Assist

AI-powered diagnostic platform for rare genetic diseases. Built for iGEM 2024 Software Track.

## Problem
Rare genetic diseases affect 400+ million people worldwide, yet diagnosis takes an average of **7.6 years**. Physicians often lack specialized genetics expertise for timely identification.

## Solution
Computational phenotype analysis platform that matches patient symptoms to rare diseases using standardized medical terminology and AI-powered decision support.

## Key Features
- **900+ Rare Diseases** with ORPHA codes
- **AI Photo Analysis** using OpenAI GPT-4o Vision
- **HPO Integration** for standardized symptom matching
- **Gene Panel Recommendations** via PubCaseFinder API
- **Multi-language Support** (EN, ES, FR, DE)
- **Clinical Decision Support** with treatment recommendations

## Quick Start

```bash
# Clone and setup
git clone https://github.com/YOURUSERNAME/raremd-assist.git
cd raremd-assist
npm install

# Configure environment
cp .env.example .env
# Add your database URL and API keys

# Run application
npm run db:push
npm run dev
```

Visit `http://localhost:5000`

## Architecture

**Frontend:** React 18 + TypeScript + Tailwind CSS  
**Backend:** Node.js + Express + PostgreSQL  
**AI Integration:** OpenAI GPT-4o Vision  
**Medical Standards:** ORPHA codes, HPO terms, FHIR R4

## Core Features

**Disease Analysis Engine**
- Symptom-to-disease matching using HPO standardized terms
- Confidence scoring and ranking algorithms
- Integration with 900+ rare disease database

**AI Photo Analysis**
- Dysmorphic feature detection using computer vision
- Medical feature extraction and terminology mapping
- Clinical report generation with ORPHA code suggestions

**Clinical Decision Support**
- Evidence-based treatment recommendations
- Gene panel suggestions via PubCaseFinder integration
- ICD-10 coding and medical documentation

## iGEM Competition Impact

**Computational Biology:**
- Advanced phenotype-genotype mapping algorithms
- Pattern recognition for disease signature identification
- Statistical modeling of symptom combinations

**Medical Impact:**
- Reduces 7.6-year average diagnostic delays
- Supports physicians with limited genetics training
- Enables early intervention and improved outcomes

**Technical Innovation:**
- Real-time AI analysis of medical photos
- Integration with global medical databases
- FHIR-compliant healthcare interoperability

## Documentation

- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Team Information](./TEAM.md)

## License

MIT License - see [LICENSE](LICENSE) file

## Team

**iGEM 2024 - Software Track**  
**Team**: [YOUR_TEAM_NAME]  
**Institution**: [YOUR_INSTITUTION]

**Contact**: [YOUR_EMAIL@institution.edu]

## Acknowledgments

- Orphanet for rare disease database
- Human Phenotype Ontology Consortium for standardized terms
- OpenAI for GPT-4o Vision API
- iGEM Foundation for competition framework