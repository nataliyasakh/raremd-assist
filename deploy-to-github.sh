#!/bin/bash

# RareMD Assist - GitHub Deployment Script for iGEM 2024
# This script helps you deploy your project to GitHub

echo "🚀 RareMD Assist - GitHub Deployment for iGEM 2024"
echo "=================================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Get user information
echo ""
echo "📝 Please provide your information:"
read -p "GitHub Username: " GITHUB_USER
read -p "Your Full Name: " FULL_NAME
read -p "iGEM Team Name: " TEAM_NAME
read -p "Institution: " INSTITUTION
read -p "Your Email: " EMAIL

# Validate inputs
if [[ -z "$GITHUB_USER" || -z "$FULL_NAME" || -z "$TEAM_NAME" || -z "$INSTITUTION" || -z "$EMAIL" ]]; then
    echo "❌ All fields are required. Please run the script again."
    exit 1
fi

echo ""
echo "🔄 Setting up GitHub repository..."

# Initialize git repository
git init

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore file..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local

# Build outputs
dist/
build/

# Healthcare data (HIPAA compliance)
patient_data/
medical_records/
phi_data/

# API keys and secrets
.env.keys
secrets.json
api_keys.txt

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db
EOF
fi

# Update README.md with user information
echo "📝 Updating README.md with your information..."
sed -i.bak "s/\[YOUR_TEAM_NAME\]/$TEAM_NAME/g" README.md
sed -i.bak "s/\[YOUR_INSTITUTION\]/$INSTITUTION/g" README.md
sed -i.bak "s/\[YOUR_NAME\]/$FULL_NAME/g" README.md
sed -i.bak "s/\[YOUR_USERNAME\]/$GITHUB_USER/g" README.md
sed -i.bak "s/\[YOUR_EMAIL@institution.edu\]/$EMAIL/g" README.md
sed -i.bak "s/YOURUSERNAME/$GITHUB_USER/g" README.md

# Update TEAM.md with user information
echo "📝 Updating TEAM.md with your information..."
sed -i.bak "s/\[YOUR_TEAM_NAME\]/$TEAM_NAME/g" TEAM.md
sed -i.bak "s/\[YOUR_INSTITUTION\]/$INSTITUTION/g" TEAM.md
sed -i.bak "s/\[YOUR_NAME\]/$FULL_NAME/g" TEAM.md
sed -i.bak "s/\[YOUR_USERNAME\]/$GITHUB_USER/g" TEAM.md
sed -i.bak "s/\[YOUR_EMAIL@institution.edu\]/$EMAIL/g" TEAM.md

# Remove backup files
rm -f README.md.bak TEAM.md.bak

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: RareMD Assist - iGEM 2024 Software Track

- 900+ rare diseases database with ORPHA codes
- AI-powered photo analysis using OpenAI GPT-4o
- HPO integration for standardized phenotype analysis
- Clinical decision support system
- Multi-language interface (EN, ES, FR, DE)
- Real-time gene panel recommendations
- Healthcare compliance (FHIR R4, HIPAA)

Team: $TEAM_NAME
Institution: $INSTITUTION
Track: Software/Diagnostics"

echo ""
echo "✅ Local repository setup complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Repository name: raremd-assist"
echo "   - Description: AI-Powered Rare Disease Diagnostic Platform - iGEM 2024"
echo "   - Make it PUBLIC"
echo "   - DON'T initialize with README"
echo ""
echo "2. Connect to GitHub and push:"
echo "   git remote add origin https://github.com/$GITHUB_USER/raremd-assist.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Your repository will be available at:"
echo "   https://github.com/$GITHUB_USER/raremd-assist"
echo ""
echo "🏆 Perfect for iGEM judges to review!"
echo ""
echo "📋 Remember to:"
echo "- Add team member names in README.md and TEAM.md"
echo "- Include your iGEM team page link"
echo "- Add deployment URL if you deploy the app"
echo "- Create a release tag for your final submission"

# Make the script executable
chmod +x deploy-to-github.sh