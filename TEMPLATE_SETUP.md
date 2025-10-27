# Template Setup Guide

This guide will help you set up your new project from this template.

## Step 1: Create Your Repository

### Option A: Use GitHub's "Use this template" button

1. Click the green "Use this template" button at the top of the repository
2. Select "Create a new repository"
3. Choose a repository name and description
4. Select public or private
5. Click "Create repository from template"

### Option B: Clone and push to new repository

```bash
# Clone this template
git clone https://github.com/OWNER/REPO.git my-assistant

# Remove the template's git history
cd my-assistant
rm -rf .git

# Initialize new git repository
git init
git add .
git commit -m "Initial commit from template"

# Add your remote and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## Step 2: Update Project Information

### 1. Update package.json

Replace placeholder information:

```json
{
  "name": "your-project-name",
  "description": "Your project description",
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/YOUR_REPO#readme"
}
```

### 2. Update README.md

Replace all instances of:
- `OWNER/REPO` → `YOUR_USERNAME/YOUR_REPO`
- Update badges and links
- Customize the description and features
- Update demo/screenshots if you have them

### 3. Update LICENSE

Replace `[Your Name or Organization]` with your actual name or organization.

### 4. Update GitHub Issue Templates

Edit `.github/ISSUE_TEMPLATE/config.yml`:
- Replace `yourusername/yourrepo` with your repository path

### 5. Update CONTRIBUTING.md

Replace:
- `ORIGINAL_OWNER` → Your GitHub username
- `OWNER/REPO` → Your repository path

## Step 3: Configure Environment Variables

### 1. Copy the example file

```bash
cp .env.local.example .env.local
```

### 2. Get API Keys

#### OpenAI API Key (Required)
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-proj-...
   ```

#### Anthropic API Key (Required)
1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to API Keys
4. Create a new key
5. Copy the key and add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

#### LibSQL/Turso (Optional - for production)
1. Go to https://turso.tech/
2. Create an account and database
3. Get your database URL and auth token
4. Add to `.env.local`:
   ```
   LIBSQL_URL=libsql://your-database.turso.io
   LIBSQL_AUTH_TOKEN=your_token
   ```

## Step 4: Customize Your Assistant

### 1. Update Agent Configuration

Edit `mastra/agents/chefAgent.ts`:

```typescript
export const yourAgent = new Agent({
  name: "Your Assistant Name",
  instructions: `
    Your custom instructions here.
    Define the assistant's personality, capabilities, and behavior.
  `,
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini", // or your preferred model
    toolChoice: "auto",
  },
  tools: {
    // Your custom tools
  },
});
```

### 2. Rename Agent Files

```bash
# Rename the agent file
mv mastra/agents/chefAgent.ts mastra/agents/yourAgent.ts

# Update import in mastra/index.ts
```

### 3. Create Custom Tools (Optional)

If you want different tools than the recipe tools:

```bash
# Create new tool file
touch mastra/tools/yourTools.ts
```

Example tool:

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const yourTool = createTool({
  id: "your_tool",
  description: "What your tool does",
  inputSchema: z.object({
    query: z.string().describe("User query"),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ context }) => {
    // Your implementation
    const { query } = context;
    return { result: "Your response" };
  },
});
```

### 4. Create Tool UI Components

Create new UI components for your tools in `components/assistant-ui/tool-ui/`:

```typescript
import { makeAssistantToolUI } from "@assistant-ui/react";

export const YourToolUI = makeAssistantToolUI({
  toolName: "your_tool",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return <div>Processing {args?.query}...</div>;
    }

    if (!result) return null;

    return <div>{result.result}</div>;
  },
});
```

### 5. Update Mastra Configuration

Edit `mastra/index.ts`:

```typescript
import { yourAgent } from "./agents/yourAgent";

export const mastra = new Mastra({
  agents: { yourAgent },
  // ... rest of config
});
```

### 6. Update App Components

Edit `app/assistant.tsx` to use your agent:

```typescript
const runtime = useMastraAgent({
  mastra,
  agentId: "yourAgent", // Match your agent name
  // ...
});
```

## Step 5: Customize UI and Branding

### 1. Update Site Metadata

Edit `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Your Assistant Name",
  description: "Your assistant description",
};
```

### 2. Update Favicon

Replace `app/favicon.ico` with your own favicon.

### 3. Customize Colors and Styling

Edit `app/globals.css` to customize your theme colors.

### 4. Update Component Text

Search for "Chef" or "recipe" in your codebase and replace with your domain-specific terms:

```bash
# Find all references
grep -r "Chef" app/ components/
grep -r "recipe" app/ components/
```

## Step 6: Set Up GitHub Repository Settings

### 1. Enable GitHub Actions

1. Go to your repository Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Set workflow permissions to "Read and write permissions"

### 2. Add Repository Secrets (Optional)

If you want CI to run builds with real API keys:

1. Go to Settings → Secrets and variables → Actions
2. Add secrets:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`

Note: CI will use dummy keys if these are not set.

### 3. Enable Dependabot

1. Go to Settings → Code security and analysis
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"
4. Enable "Dependabot version updates"

### 4. Set Up GitHub Pages (Optional)

If you want to host documentation:

1. Go to Settings → Pages
2. Select source branch
3. Deploy!

### 5. Enable Discussions (Optional)

1. Go to Settings → General
2. Check "Discussions"
3. Set up discussion categories

## Step 7: Test Your Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Run Linting and Type Checking

```bash
bun run lint
bun run prettier
bunx tsc --noEmit
```

### 3. Build the Project

```bash
bun run build
```

### 4. Test Locally

```bash
bun run dev
```

Open http://localhost:3000 and test your assistant!

### 5. Test CI/CD

Push your changes and verify GitHub Actions runs successfully:

```bash
git add .
git commit -m "Initial setup from template"
git push
```

Check the Actions tab in your GitHub repository.

## Step 8: Deploy

### Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `LIBSQL_URL` (if using Turso)
   - `LIBSQL_AUTH_TOKEN` (if using Turso)
4. Click "Deploy"

### Deploy to Other Platforms

See the [README](README.md#deployment) for other deployment options.

## Step 9: Post-Setup Tasks

### 1. Update Documentation

- [ ] Update CLAUDE.md with your specific implementation details
- [ ] Update TROUBLESHOOTING.md with any issues you encountered
- [ ] Add screenshots/demos to README
- [ ] Write API documentation if you have custom tools

### 2. Set Up Monitoring (Optional)

Consider adding:
- Error tracking (Sentry)
- Analytics (Vercel Analytics, Google Analytics)
- Logging (LogRocket, Datadog)

### 3. Create Your First Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

Create a GitHub release with release notes.

### 4. Promote Your Project

- [ ] Add topics to your repository
- [ ] Share on social media
- [ ] Add to awesome lists
- [ ] Write a blog post

## Common Issues

### Build Errors

**Problem**: TypeScript errors during build

**Solution**: Run `bunx tsc --noEmit` to see all type errors and fix them.

**Problem**: ESLint errors

**Solution**: Run `bun run lint` and fix the reported issues, or use `bun run lint --fix` for auto-fixable issues.

### Runtime Errors

**Problem**: "API key not found" errors

**Solution**: Verify your `.env.local` file has the correct API keys and restart the dev server.

**Problem**: Database errors

**Solution**: Delete `local.db*` files and restart the app to recreate the database.

### Deployment Issues

**Problem**: Build fails on Vercel

**Solution**: Check that all environment variables are set in Vercel dashboard.

**Problem**: Memory errors during build

**Solution**: Increase Node.js memory: `NODE_OPTIONS=--max_old_space_size=4096 bun run build`

## Next Steps

- Read [CLAUDE.md](CLAUDE.md) for comprehensive documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Join the community and share your project!

## Need Help?

- **Issues**: Open an issue on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Documentation**: Check the [Mastra docs](https://mastra.ai/), [Assistant-UI docs](https://www.assistant-ui.com/), and [Next.js docs](https://nextjs.org/docs)

Good luck with your AI assistant! 🚀
