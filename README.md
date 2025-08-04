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

## Technical Architecture
```client/
└── src/
    ├── components/         # Reusable UI components
    ├── ui/                 # shadcn/ui base components
    ├── header.tsx          # Main navigation header
    ├── secondary-nav.tsx   # Collapsible sidebar navigation
    ├── pages/              # Route-based page components
    ├── dashboard.tsx       # Main clinical interface
    ├── analytics.tsx       # System metrics and charts
    ├── settings.tsx        # User preferences and configuration
    ├── knowledge-base.tsx  # Disease information browser
    ├── hooks/              # Custom React hooks
    ├── useSettings.ts      # Settings persistence and state
    ├── useAuth.ts          # Authentication state management
    ├── lib/                # Utility functions and configurations
    ├── translations.ts     # Multi-language support
    └── queryClient.ts      # API request configuration```

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
