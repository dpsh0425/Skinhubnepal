# PowerShell script to push SkinHub Nepal to GitHub
# Run this script from the project root directory

Write-Host "=== SkinHub Nepal - GitHub Push Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 1: Checking if git repository is initialized..." -ForegroundColor Cyan

# Check if .git folder exists
if (Test-Path .git) {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
} else {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Git repository initialized" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Checking remote repository..." -ForegroundColor Cyan

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "✓ Remote 'origin' already exists: $remoteExists" -ForegroundColor Green
    $updateRemote = Read-Host "Do you want to update it to https://github.com/dpsh0425/Skinhubnepal.git? (y/n)"
    if ($updateRemote -eq "y" -or $updateRemote -eq "Y") {
        git remote set-url origin https://github.com/dpsh0425/Skinhubnepal.git
        Write-Host "✓ Remote updated" -ForegroundColor Green
    }
} else {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/dpsh0425/Skinhubnepal.git
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Remote 'origin' added" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to add remote" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Step 3: Staging all files..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All files staged" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to stage files" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 4: Checking for existing commits..." -ForegroundColor Cyan
$commitCount = (git rev-list --count HEAD 2>$null)
if ($commitCount -eq $null -or $commitCount -eq 0) {
    Write-Host "Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: SkinHub Nepal eCommerce platform"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Initial commit created" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create commit" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Found $commitCount existing commit(s)" -ForegroundColor Green
    $createNewCommit = Read-Host "Do you want to create a new commit? (y/n)"
    if ($createNewCommit -eq "y" -or $createNewCommit -eq "Y") {
        $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Update: SkinHub Nepal eCommerce platform"
        }
        git commit -m $commitMessage
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Commit created" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to create commit (maybe no changes to commit?)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Step 5: Setting default branch to 'main'..." -ForegroundColor Cyan
git branch -M main 2>$null
Write-Host "✓ Branch set to 'main'" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "Note: You may be prompted for GitHub credentials" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓✓✓ Successfully pushed to GitHub! ✓✓✓" -ForegroundColor Green
    Write-Host "Repository: https://github.com/dpsh0425/Skinhubnepal" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "✗ Push failed. Common issues:" -ForegroundColor Red
    Write-Host "  1. Authentication required - use Personal Access Token" -ForegroundColor Yellow
    Write-Host "  2. Repository might not exist or you don't have access" -ForegroundColor Yellow
    Write-Host "  3. Check your internet connection" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To fix authentication:" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "  2. Generate new token (classic) with 'repo' permissions" -ForegroundColor White
    Write-Host "  3. Use token as password when prompted" -ForegroundColor White
}

Write-Host ""
Write-Host "Script completed!" -ForegroundColor Cyan

