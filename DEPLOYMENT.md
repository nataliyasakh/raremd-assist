# Deployment Guide - RareMD Assist

This guide provides step-by-step instructions for deploying RareMD Assist for your iGEM presentation and beyond.

## 🚀 GitHub Setup for iGEM

### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click "New Repository" (green button)
3. Repository settings:
   - **Name**: `raremd-assist` or `igem-2024-raremd`
   - **Description**: "AI-Powered Rare Disease Diagnostic Platform - iGEM 2024"
   - **Visibility**: Public (required for iGEM)
   - **Initialize**: Check "Add a README file"
   - **License**: MIT License
4. Click "Create Repository"

### 2. Upload Your Code

```bash
# In your project directory (where package.json is located)
git init
git add .
git commit -m "Initial commit - RareMD Assist v1.2.0"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/raremd-assist.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

### 3. iGEM-Specific Setup

Create these files for iGEM requirements:

**TEAM.md** (Create this file):
```markdown
# iGEM Team Information

**Team Name**: [Your Team Name]
**Year**: 2024
**Track**: Software/Diagnostics
**Institution**: [Your Institution]

## Project: RareMD Assist
AI-Powered Rare Disease Diagnostic Platform

## Team Members
- [Name] - Role
- [Name] - Role  
- [Name] - Role

## Mentor
- [Mentor Name] - [Institution]
```

## 🌐 Deployment Options

### Option 1: Replit Deployment (Recommended for Demo)

1. **Current Setup**: Your app is already running on Replit
2. **Public URL**: Use your current Replit URL for demonstrations
3. **Advantages**: 
   - No additional setup required
   - Already configured and working
   - Easy to share with judges

### Option 2: Vercel Deployment (Free & Fast)

1. **Connect GitHub to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account
   - Import your repository

2. **Environment Variables**:
   ```
   DATABASE_URL=your_neon_database_url
   NODE_ENV=production
   ```

3. **Build Settings**:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Option 3: Railway Deployment

1. **Connect to Railway**:
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Deploy automatically

2. **Database**: Railway provides PostgreSQL
3. **Environment**: Automatically configured

## 📊 Database Setup

### Option 1: Keep Current Neon Database
- Your current setup already works
- No changes needed for demo

### Option 2: New Production Database

1. **Neon Database** (Recommended):
   ```bash
   # Create new Neon project
   # Copy connection string to DATABASE_URL
   ```

2. **Railway PostgreSQL**:
   ```bash
   # Add PostgreSQL service in Railway
   # Environment variables set automatically
   ```

## 🔧 Production Configuration

### Environment Variables (.env.production)
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
PORT=5000

# Optional: Analytics
ANALYTICS_ENABLED=true

# Optional: API Keys (for enhanced features)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Build Script Updates
Update `package.json`:
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "start": "node dist/server/index.js",
    "dev": "NODE_ENV=development tsx server/index.ts",
    "db:push": "drizzle-kit push",
    "preview": "npm run build && npm start"
  }
}
```

## 🎯 iGEM Presentation Setup

### 1. Demo Environment
- **URL**: Use your stable deployment URL
- **Data**: Ensure sample cases are loaded
- **Performance**: Test loading times

### 2. Backup Plan
- **Local Demo**: Have local version ready
- **Screenshots**: Prepare key interface screenshots
- **Video Demo**: Record functionality walkthrough

### 3. Judge Access
- **Public URL**: Shareable link for judges
- **Demo Account**: Consider guest access mode
- **Documentation**: Link to GitHub repository

## 📱 Mobile-Friendly Setup

### Progressive Web App (PWA)
Add to `client/index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#3B82F6">
```

Create `public/manifest.json`:
```json
{
  "name": "RareMD Assist",
  "short_name": "RareMD",
  "description": "AI-Powered Rare Disease Diagnostic Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🔍 Performance Optimization

### 1. Build Optimization
```bash
# Install production dependencies only
npm ci --production

# Enable compression
npm install compression
```

### 2. Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_diseases_name ON diseases(name);
```

### 3. Frontend Optimization
- **Code Splitting**: Automatic with Vite
- **Asset Optimization**: Images compressed
- **Caching**: Service worker for offline access

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

2. **Database Connection**:
   ```bash
   # Test database connectivity
   npm run db:push
   ```

3. **Environment Variables**:
   ```bash
   # Verify all required variables are set
   echo $DATABASE_URL
   ```

### Health Checks
Add to your app:
```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.2.0',
    timestamp: new Date().toISOString()
  });
});
```

## 📈 Monitoring for Demo

### Simple Analytics
```typescript
// Track page views and API calls
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Performance Monitoring
```typescript
// Response time logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## ✅ Pre-Demo Checklist

- [ ] GitHub repository is public and accessible
- [ ] README.md includes iGEM team information
- [ ] Application deploys successfully
- [ ] Database is populated with sample data
- [ ] All major features work correctly
- [ ] Mobile interface is responsive
- [ ] Demo URL is stable and fast
- [ ] Backup demo plan is ready
- [ ] Team can access and present the platform

## 🎉 You're Ready!

Your RareMD Assist platform is now ready for the iGEM presentation. The combination of advanced medical AI, standardized terminologies, and practical clinical application makes it a strong showcase for computational biology in healthcare.

**Final Tips for iGEM Success**:
- Emphasize the medical impact and innovation
- Demonstrate the technical sophistication
- Show real-world applicability
- Highlight open science principles
- Be prepared for technical questions from judges