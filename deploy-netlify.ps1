# Quick Netlify Deployment Script

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Financial Tracker - Netlify Deploy" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
    Write-Host "✓ Git initialized" -ForegroundColor Green
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "Found uncommitted changes. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Prepare for deployment"
    Write-Host "✓ Changes committed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy to Netlify:" -ForegroundColor White
Write-Host "   a) Go to https://app.netlify.com/" -ForegroundColor Gray
Write-Host "   b) Click 'Add new site' -> 'Import an existing project'" -ForegroundColor Gray
Write-Host "   c) Choose GitHub and select your repository" -ForegroundColor Gray
Write-Host "   d) Configure build settings:" -ForegroundColor Gray
Write-Host "      - Base directory: frontend" -ForegroundColor Gray
Write-Host "      - Build command: npm run build" -ForegroundColor Gray
Write-Host "      - Publish directory: frontend/.next" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set environment variables in Netlify:" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_API_BASE = (your backend URL)" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
