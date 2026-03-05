# Install GitHub CLI - Quick Steps

## Option A: Install Homebrew First (Recommended)

If you don't have Homebrew, install it first:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install GitHub CLI:

```bash
brew install gh
```

## Option B: Download GitHub CLI Directly

1. Download from: https://cli.github.com/
2. Or use this direct link: https://github.com/cli/cli/releases/latest
3. Install the .pkg file
4. Open a new terminal

## After Installation

```bash
# Login to GitHub
gh auth login

# Follow the prompts:
# - What account? → GitHub.com
# - Protocol? → HTTPS
# - Authenticate? → Login with a web browser
# - Copy the code and press Enter
# - Browser opens, paste code, authorize

# Then push to GitHub
git push -u origin main

# Deploy to Vercel
npx vercel
```

## Quick Alternative: Use SSH Instead

If you want to skip GitHub CLI, use SSH:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519 -N ""

# Copy key
cat ~/.ssh/id_ed25519.pub | pbcopy

# Add to GitHub
open https://github.com/settings/ssh/new

# Switch to SSH
git remote set-url origin git@github.com:dwan22/OTC_Platform.git

# Push
git push -u origin main
```

---

**Choose your method and let's deploy!**
