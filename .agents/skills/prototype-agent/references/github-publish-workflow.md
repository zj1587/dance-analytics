# GitHub Publish Workflow

Use this reference when the user asks to publish, release, push to GitHub, connect a repository, or prepare for Vercel deployment.

## Information To Gather

- Repository URL, preferably HTTPS: `https://github.com/<owner>/<repo>.git`.
- Target branch. Use `main` for a new repository unless the user specifies another branch.
- Commit message. Use a concise summary when the user does not provide one, such as `Initial commit` or `Update prototype`.
- Remote state: empty repository, existing branch, or unknown.
- Git identity if missing locally: `user.name` and `user.email`.
- Deployment intent: GitHub push only, or GitHub plus Vercel handoff.

Ask only for information that cannot be inferred safely. If the user already provided the repository URL and the remote is empty, proceed with `main` and a sensible commit message.

## User Guidance During Operation

- Before edits or git operations, state the next action and why it is needed.
- If the directory is not a git repository, explain that a first-time `git init -b main` is required.
- If a remote already has commits, pause before forceful or history-changing actions. Prefer pulling/rebasing only when the user confirms how to reconcile histories.
- If ignored/generated files are present, explain that `node_modules`, `dist`, logs, local env files, and caches should stay out of git.
- If authentication fails, explain whether the next step is GitHub login, credential refresh, or changing Git HTTPS backend. Do not invent credentials.
- After push, report the repository URL, branch, commit hash/message, and whether build verification passed.

## First-Time Publish Steps

1. Inspect project state:
   ```bash
   git status --short --branch
   git remote -v
   ```
2. If not a git repository, initialize it:
   ```bash
   git init -b main
   ```
3. Confirm `.gitignore` excludes generated and sensitive files:
   ```text
   node_modules
   dist
   *.log
   .env
   .env.*
   ```
4. Check build before committing:
   ```bash
   npm run build
   ```
5. Add the GitHub remote:
   ```bash
   git remote add origin https://github.com/<owner>/<repo>.git
   ```
   If `origin` exists but points elsewhere, show the current URL and ask before replacing it.
6. Stage, review, and commit:
   ```bash
   git add .
   git status --short
   git commit -m "Initial commit"
   ```
7. Push:
   ```bash
   git push -u origin main
   ```

## Existing Repository Steps

1. Inspect current branch, remotes, and changes.
2. Run `npm run build`.
3. Review changed files and avoid staging unrelated local work unless the user asked to publish everything.
4. Commit with a clear message.
5. Push the current branch. If no upstream exists, use `git push -u origin <branch>`.

## Remote Checks

- Use `git ls-remote <repo-url>` to see whether the repository is reachable and whether branches already exist.
- On Windows, if Git HTTPS fails with `SEC_E_NO_CREDENTIALS`, retry the relevant read/push command with `-c http.sslBackend=openssl` or set the local repository backend after initialization:
  ```bash
  git config --local http.sslBackend openssl
  ```
- Treat an empty `git ls-remote` result with success exit code as an empty or branchless repository.

## Vercel Handoff

After pushing, guide the user to connect the GitHub repository to Vercel with:

- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

If access-code preview protection is needed, remind the user to configure `ACCESS_CODES` and `ACCESS_SESSION_SECRET` in Vercel environment variables.
