# Chef Assistant - AI Cooking Assistant Template

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A full-stack AI assistant template built with Next.js, Mastra AI, Anthropic Claude, and Assistant-UI featuring generative UI components and conversation memory.

![Chef Assistant Demo](docs/demo.gif)

## Features

- **Mastra AI Framework** - TypeScript-first AI agent framework with tool support
- **Anthropic Claude** - State-of-the-art LLM with web search capabilities
- **Assistant-UI** - Beautiful React components for chat interfaces
- **Generative UI** - Custom UI components that render based on tool execution
- **Conversation Memory** - Persistent chat history with SQLite/LibSQL
- **Streaming Responses** - Real-time token streaming with AI SDK
- **Type-Safe** - Full TypeScript support with Zod validation
- **Production Ready** - CI/CD with GitHub Actions, ESLint, Prettier

## Quick Start

### Use This Template

1. Click the "Use this template" button at the top of this repository
2. Create a new repository from the template
3. Clone your new repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:

```bash
# Required: Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Required: Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: For distributed storage (Turso)
# LIBSQL_URL=libsql://your-database.turso.io
# LIBSQL_AUTH_TOKEN=your_token
```

### Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

### Try It Out

Example prompts:
- "I have chicken, rice, and broccoli. What can I cook?"
- "Find me a vegetarian pasta recipe"
- "What's the nutritional info for Greek salad?"

## Tech Stack

### Core

- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[Mastra AI](https://mastra.ai/)** - TypeScript AI agent framework
- **[Anthropic Claude](https://anthropic.com/)** - Advanced LLM with web search
- **[Assistant-UI](https://www.assistant-ui.com/)** - React chat components
- **[AI SDK](https://ai-sdk.dev/)** - Vercel's AI streaming SDK
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime

### UI & Styling

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library

### State & Memory

- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[@mastra/memory](https://mastra.ai/)** - Conversation history
- **[@mastra/libsql](https://mastra.ai/)** - SQLite/Turso storage

## Project Structure

```
assistant/
├── .github/                  # GitHub Actions workflows and templates
│   ├── workflows/
│   │   └── ci.yml           # CI pipeline (lint, test, build)
│   ├── ISSUE_TEMPLATE/      # Bug report and feature request templates
│   └── pull_request_template.md
├── app/
│   ├── api/chat/route.ts    # API endpoint for chat
│   ├── assistant.tsx        # Main assistant component
│   ├── page.tsx             # Home page
│   └── layout.tsx           # Root layout
├── components/
│   ├── assistant-ui/        # Assistant-UI components
│   │   ├── tool-ui/         # Generative UI components
│   │   ├── thread.tsx       # Chat thread component
│   │   └── thread-list.tsx  # Thread list sidebar
│   └── ui/                  # Shared UI components
├── mastra/
│   ├── agents/
│   │   └── chefAgent.ts     # Chef agent definition
│   ├── tools/
│   │   └── recipeTools.ts   # Recipe & nutrition tools
│   ├── memory.ts            # Memory configuration
│   └── index.ts             # Mastra instance
├── lib/                     # Utility functions
├── hooks/                   # Custom React hooks
├── CLAUDE.md                # Comprehensive documentation
├── CONTRIBUTING.md          # Contribution guidelines
├── CODE_OF_CONDUCT.md       # Code of conduct
└── LICENSE                  # MIT License
```

## Documentation

For comprehensive documentation, see:

- **[CLAUDE.md](CLAUDE.md)** - Complete project documentation, architecture, and examples
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and development setup
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community guidelines

## Customization

### 1. Update Project Info

Edit `package.json`:

```json
{
  "name": "your-assistant-name",
  "version": "1.0.0",
  "description": "Your assistant description"
}
```

### 2. Customize the Agent

Edit `mastra/agents/chefAgent.ts`:

```typescript
export const yourAgent = new Agent({
  name: "Your Agent Name",
  instructions: "Your custom instructions",
  model: {
    provider: "OPEN_AI",
    name: "gpt-4o-mini"
  },
  tools: {
    // Add your custom tools
  }
});
```

### 3. Add Custom Tools

Create new tools in `mastra/tools/`:

```typescript
export const yourTool = createTool({
  id: "your_tool",
  description: "What your tool does",
  inputSchema: z.object({
    param: z.string()
  }),
  outputSchema: z.object({
    result: z.string()
  }),
  execute: async ({ context }) => {
    // Implementation
    return { result: "value" };
  }
});
```

### 4. Create Generative UI

Add UI components in `components/assistant-ui/tool-ui/`:

```typescript
export const YourToolUI = makeAssistantToolUI({
  toolName: "your_tool",
  render: ({ args, result, status }) => {
    if (status.type === "running") {
      return <LoadingState />;
    }
    return <ResultDisplay data={result} />;
  }
});
```

See [CLAUDE.md](CLAUDE.md) for detailed customization guides.

## Development

### Available Scripts

```bash
# Development
bun run dev          # Start dev server with Turbopack
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run ESLint
bun run prettier     # Check code formatting
bun run prettier:fix # Auto-fix formatting

# Type Checking
bunx tsc --noEmit   # Run TypeScript compiler
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for agent model |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for tools |
| `LIBSQL_URL` | No | LibSQL/Turso database URL (defaults to `file:local.db`) |
| `LIBSQL_AUTH_TOKEN` | No | LibSQL/Turso auth token (only for remote) |

### CI/CD

This template includes GitHub Actions workflows:

- **CI Pipeline** - Runs on every push and PR
  - ESLint linting
  - Prettier formatting check
  - TypeScript type checking
  - Production build
  - Dependency review (PRs only)

- **Dependabot** - Automated dependency updates
  - Weekly npm package updates
  - GitHub Actions updates
  - Grouped by dependency type

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OWNER/REPO)

1. Click the "Deploy" button above
2. Add environment variables:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
3. Deploy!

### Other Platforms

This is a standard Next.js 15 app and can be deployed to:
- **Netlify**
- **Railway**
- **Fly.io**
- **AWS Amplify**
- **Digital Ocean App Platform**

See [Next.js Deployment](https://nextjs.org/docs/deployment) for more options.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run quality checks: `bun run lint && bun run prettier`
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Community

- **Issues** - [Report bugs or request features](https://github.com/OWNER/REPO/issues/new/choose)
- **Discussions** - [Ask questions and share ideas](https://github.com/OWNER/REPO/discussions)
- **Pull Requests** - [Contribute code](https://github.com/OWNER/REPO/pulls)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Mastra AI](https://mastra.ai/) - AI agent framework
- [Assistant-UI](https://www.assistant-ui.com/) - React chat components
- [Anthropic](https://anthropic.com/) - Claude LLM
- [Vercel](https://vercel.com/) - AI SDK and hosting
- [Next.js](https://nextjs.org/) - React framework

## Support

If you find this template helpful, please:
- ⭐ Star this repository
- 🐦 Share on social media
- 💬 Spread the word

---

**Built with ❤️ using Mastra AI, Anthropic Claude, and Assistant-UI**
