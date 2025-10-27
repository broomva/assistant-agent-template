# GitHub Repository Configuration Guide

This guide will help you configure your GitHub repository to make the most of the template features.

## Step 1: Template Repository Settings

### 1. Mark as Template Repository

1. Go to **Settings** → **General**
2. Scroll to "Template repository"
3. Check ✅ **Template repository**

This allows others to use your repository as a template.

### 2. Update Repository Details

1. Add a clear **Description**: "AI Cooking Assistant built with Mastra AI, Anthropic Claude, and Assistant-UI"
2. Add **Website**: Your deployed app URL (e.g., https://your-app.vercel.app)
3. Add **Topics/Tags**:
   - `ai`
   - `assistant`
   - `mastra`
   - `anthropic`
   - `claude`
   - `assistant-ui`
   - `nextjs`
   - `typescript`
   - `generative-ui`
   - `template`
   - `starter`

## Step 2: Features Configuration

Go to **Settings** → **General** → **Features**

### Enable These Features:

- ✅ **Issues** - For bug reports and feature requests
- ✅ **Discussions** - For community Q&A
- ✅ **Projects** - For project management (optional)
- ✅ **Wiki** - For additional documentation (optional)

### Disable These Features (if not needed):

- ❌ **Sponsorships** - Unless you want to accept sponsorships
- ❌ **Preserve this repository** - Not needed for templates

## Step 3: Access & Security

Go to **Settings** → **Code security and analysis**

### Enable Security Features:

1. **Dependency graph**: ✅ Enabled (should be on by default)
2. **Dependabot alerts**: ✅ Enable
3. **Dependabot security updates**: ✅ Enable
4. **Dependabot version updates**: ✅ Enable (uses `.github/dependabot.yml`)
5. **Code scanning**: ✅ Enable (CodeQL or similar)
6. **Secret scanning**: ✅ Enable
7. **Push protection**: ✅ Enable (prevents pushing secrets)

## Step 4: Actions Configuration

Go to **Settings** → **Actions** → **General**

### Workflow Permissions:

1. **Actions permissions**:
   - Select: ✅ **Allow all actions and reusable workflows**

2. **Workflow permissions**:
   - Select: ✅ **Read and write permissions**
   - Check: ✅ **Allow GitHub Actions to create and approve pull requests**

### Fork Pull Request Workflows:

- Select: ✅ **Require approval for first-time contributors**

## Step 5: Branch Protection Rules

Go to **Settings** → **Branches** → **Add rule**

### For `main` branch:

1. **Branch name pattern**: `main`

2. **Protect matching branches**:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: **1**
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Add status checks: `Lint, Type Check & Build`
   - ✅ **Require conversation resolution before merging**
   - ❌ **Do not allow bypassing the above settings** (unless you're the sole maintainer)

## Step 6: Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions**

### Add Repository Secrets (Optional):

These secrets allow CI to run builds with real API keys:

1. Click **New repository secret**
2. Add the following secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ANTHROPIC_API_KEY`: Your Anthropic API key

**Note**: CI will use dummy keys if these are not set, which is fine for most cases.

## Step 7: Discussions Setup

Go to **Discussions** tab

### Create Discussion Categories:

1. **Announcements** 📣
   - Description: "Project updates and announcements"
   - Format: Announcement

2. **General** 💬
   - Description: "General discussions about the project"
   - Format: Open-ended discussion

3. **Q&A** ❓
   - Description: "Ask questions and get help"
   - Format: Question / Answer

4. **Show and Tell** 🙌
   - Description: "Share what you've built with this template"
   - Format: Open-ended discussion

5. **Ideas** 💡
   - Description: "Suggest new features or improvements"
   - Format: Open-ended discussion

## Step 8: Issue Labels

Go to **Issues** → **Labels**

### Recommended Labels:

The template includes standard labels. Consider adding:

- `good first issue` 🟢 - Good for newcomers
- `help wanted` 🆘 - Extra attention needed
- `priority: high` 🔴 - High priority
- `priority: medium` 🟡 - Medium priority
- `priority: low` 🟢 - Low priority
- `status: blocked` 🚫 - Blocked by dependency
- `status: in-progress` 🏃 - Currently being worked on

## Step 9: Pages Setup (Optional)

If you want to host documentation:

Go to **Settings** → **Pages**

1. **Source**: Deploy from a branch
2. **Branch**: `gh-pages` or `docs`
3. **Folder**: `/` (root) or `/docs`
4. Click **Save**

Your docs will be available at: `https://username.github.io/repo-name/`

## Step 10: Social Preview

Go to **Settings** → **General** → **Social preview**

1. Click **Edit**
2. Upload an image (1280×640px recommended)
3. This image appears when sharing your repo on social media

## Step 11: About Section

On the main repository page:

1. Click the ⚙️ gear icon next to "About"
2. Add:
   - **Description**: "AI Cooking Assistant template built with Mastra AI, Anthropic Claude, and Assistant-UI"
   - **Website**: Your deployed app URL
   - **Topics**: ai, assistant, mastra, claude, nextjs, typescript, template
   - ✅ **Releases**
   - ✅ **Packages**
   - ❌ **Deployments** (unless using GitHub deployments)

## Step 12: Webhooks (Optional)

Go to **Settings** → **Webhooks**

Add webhooks for:
- Discord/Slack notifications
- CI/CD triggers
- Analytics

## Step 13: Integrations

Go to **Settings** → **Integrations**

Consider adding:

1. **Vercel** - For automatic deployments
2. **CodeCov** - For code coverage reports
3. **Sentry** - For error tracking
4. **Better Uptime** - For uptime monitoring

## Step 14: Create Initial Release

Once everything is set up:

1. Go to **Releases** → **Create a new release**
2. **Choose a tag**: `v1.0.0`
3. **Release title**: `v1.0.0 - Initial Template Release`
4. **Description**:
   ```markdown
   ## 🎉 Initial Template Release

   This is the first release of the Chef Assistant template.

   ### Features
   - ✅ Mastra AI integration
   - ✅ Anthropic Claude with web search
   - ✅ Assistant-UI components
   - ✅ Generative UI
   - ✅ Conversation memory
   - ✅ Full TypeScript support
   - ✅ CI/CD with GitHub Actions

   ### Getting Started

   See [TEMPLATE_SETUP.md](TEMPLATE_SETUP.md) for setup instructions.

   ### Documentation

   - [README.md](README.md) - Quick start guide
   - [CLAUDE.md](CLAUDE.md) - Comprehensive documentation
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
   ```
5. Check ✅ **Set as the latest release**
6. Click **Publish release**

## Step 15: Enable Notifications

Configure your notification preferences:

1. Click your profile → **Settings** → **Notifications**
2. Set up notifications for:
   - Issues
   - Pull requests
   - Discussions
   - Releases

## Step 16: Add Collaborators (If Applicable)

Go to **Settings** → **Collaborators and teams**

1. Click **Add people**
2. Enter GitHub username
3. Choose permission level:
   - **Read** - View only
   - **Triage** - Manage issues/PRs
   - **Write** - Push to repo
   - **Maintain** - Manage repo (no sensitive settings)
   - **Admin** - Full access

## Checklist

Use this checklist to ensure everything is set up:

### Repository Settings
- [ ] Marked as template repository
- [ ] Description added
- [ ] Topics/tags added
- [ ] Website URL added
- [ ] Social preview image uploaded

### Features
- [ ] Issues enabled
- [ ] Discussions enabled
- [ ] Discussions categories created
- [ ] Wiki enabled (optional)
- [ ] Projects enabled (optional)

### Security
- [ ] Dependabot enabled
- [ ] Code scanning enabled
- [ ] Secret scanning enabled
- [ ] Push protection enabled

### GitHub Actions
- [ ] Workflows have correct permissions
- [ ] CI is running successfully
- [ ] Repository secrets added (optional)

### Branch Protection
- [ ] Main branch protection enabled
- [ ] PR reviews required
- [ ] Status checks configured

### Community
- [ ] README.md updated
- [ ] LICENSE added
- [ ] CODE_OF_CONDUCT.md added
- [ ] CONTRIBUTING.md added
- [ ] SECURITY.md added
- [ ] Issue templates created
- [ ] PR template created

### Documentation
- [ ] TEMPLATE_SETUP.md created
- [ ] CLAUDE.md updated
- [ ] TROUBLESHOOTING.md available

### Release
- [ ] First release created (v1.0.0)
- [ ] Release notes written
- [ ] Tagged properly

## Next Steps

1. **Test the Template**: Use "Use this template" to create a test repo
2. **Update URLs**: Replace all placeholder URLs with your actual repo URL
3. **Customize**: Adjust settings based on your needs
4. **Promote**: Share your template with the community
5. **Maintain**: Keep dependencies updated and respond to issues

## Resources

- [GitHub Docs: Template Repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Security Features](https://docs.github.com/en/code-security)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Questions?

Open a Discussion or Issue if you need help configuring your repository!
