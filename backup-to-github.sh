#!/usr/bin/env bash
# One-shot: safety-check for secrets, commit, and push to a new private GitHub repo.
# Run from the project root:  bash backup-to-github.sh
set -euo pipefail
cd "$(dirname "$0")"

REPO_OWNER="ChokePointMacro"
REPO_NAME="armed-capital-fpa"

echo "→ Safety check: make sure no secrets are tracked by git..."
if git ls-files --error-unmatch .env.local >/dev/null 2>&1; then
  echo "  ⚠️  .env.local is TRACKED. Untracking it (your local file stays)."
  git rm --cached .env.local
fi
if git ls-files | grep -E '(^|/)\.env'; then
  echo "  ⚠️  Env file(s) above are still tracked. Remove them before pushing, then re-run."
  exit 1
fi
echo "  ✓ No env files tracked — safe to push."

echo "→ Committing current changes (calculator peer benchmarks)..."
git add -A
git commit -m "feat(calculator): vertical p75 peer benchmarks (SEC EDGAR FY2025)" || echo "  (nothing new to commit)"

if command -v gh >/dev/null 2>&1; then
  echo "→ gh CLI found — creating private repo and pushing..."
  git branch -M main
  gh repo create "$REPO_OWNER/$REPO_NAME" --private --source=. --remote=origin --push
  echo "  ✓ Backed up: https://github.com/$REPO_OWNER/$REPO_NAME"
else
  echo ""
  echo "gh CLI not installed. Two manual steps:"
  echo "  1) Create the repo: https://github.com/new"
  echo "       Owner: $REPO_OWNER   Name: $REPO_NAME   Visibility: Private   (do NOT add a README)"
  echo "  2) Then run:"
  echo "       git branch -M main"
  echo "       git remote add origin https://github.com/$REPO_OWNER/$REPO_NAME.git"
  echo "       git push -u origin main"
fi
