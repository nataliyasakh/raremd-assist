# RareMD Assist

AI-powered diagnostic platform for rare genetic diseases. Built for iGEM 2025 Software Track.

## Problem
Rare genetic diseases affect 400+ million people worldwide, yet diagnosis takes an average of **7.6 years**. Physicians often lack specialized genetics expertise for prompt identification.

## Solution
Computational phenotype analysis platform that matches patient symptoms to rare diseases using standardized medical terminology and AI-powered decision support.

## Key Features
- **900+ Rare Diseases** with ORPHA codes
- **AI Photo Analysis** using OpenAI GPT-4o Vision
- **HPO Integration** for standardized symptom matching
- **Gene Panel Recommendations** via PubCaseFinder API
- **Clinical Decision Support** with treatment recommendations

## Repository structure
```
raremd-assist/
├── client/                          # Frontend on React
│   ├── src/
│   │   ├── components/              # UI components
│   │   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── dashboard-stats.tsx  
│   │   │   ├── disease-ranking.tsx  
│   │   │   ├── knowledge-base.tsx   
│   │   │   ├── photo-analysis.tsx   # AI photo analysis interface
│   │   │   ├── quick-actions.tsx    
│   │   │   ├── recent-cases.tsx     # Recent patient cases
│   │   │   └── symptom-entry.tsx    # Symptom input interface
│   │   ├── hooks/                   # React hooks
│   │   │   ├── use-mobile.tsx       # Mobile device detection
│   │   │   └── use-toast.ts         # Notification management
│   │   ├── lib/                     # Utility functions and configurations
│   │   │   ├── queryClient.ts       # API request configuration
│   │   │   ├── scoring.ts           # Disease scoring algorithms
│   │   │   └── utils.ts             # General utility functions
│   │   ├── pages/                   # Route-based page components
│   │   │   ├── dashboard.tsx        # Main clinical interface
│   │   │   ├── knowledge-base.tsx   # Disease information browser
│   │   │   ├── not-found.tsx        # 404 error page
│   │   │   ├── physician-profile.tsx # User profile management
│   │   │   └── test-cases.tsx       # Clinical test cases
│   │   ├── App.tsx                  # Main application component
│   │   ├── index.css                # Global styles
│   │   └── main.tsx                 # Application entry point
│   └── index.html                   # HTML template
├── server/                          # Backend API server
│   ├── services/                    # Business logic services
│   │   ├── comprehensive-diseases-generator.ts # Disease data generation
│   │   ├── expanded-diseases.ts     # Extended disease information
│   │   ├── hpo.ts                   # Human Phenotype Ontology integration
│   │   ├── orphadata.ts             # Orphanet database integration
│   │   ├── pdf.ts                   # PDF report generation
│   │   ├── photo-analysis.ts        # AI photo analysis service
│   │   └── test-cases.ts            # Clinical test case management
│   ├── db.ts                        # Database configuration
│   ├── index.ts                     # Server entry point
│   ├── routes.ts                    # API route definitions
│   ├── storage.ts                   # File storage management
│   └── vite.ts                      # Vite development server
├── shared/                          # Shared type definitions
│   └── schema.ts                    # TypeScript schemas and interfaces
├── components.json                  # shadcn/ui configuration
├── drizzle.config.ts                # Database ORM configuration
├── package.json                     # Project dependencies
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── version.json                     
└── vite.config.ts                   # Vite build configuration

```

## License

MIT License - see [LICENSE](LICENSE) file

## Team

**iGEM 2025 - Software Track**  
**Team**: NYUAD iGEM 2025
**Institution**: NYU Abu Dhabi
**Contact**: nyuad.igem@nyu.edu

## Acknowledgments

- Orphanet for rare disease database
- Human Phenotype Ontology Consortium for standardized terms
- OpenAI for GPT-4o Vision API
- iGEM Foundation for competition framework
