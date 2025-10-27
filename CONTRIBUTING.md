# Contributing to Chef Assistant

Thank you for your interest in contributing to Chef Assistant! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/assistant.git`
3. Add upstream remote: `git remote add upstream https://github.com/ORIGINAL_OWNER/assistant.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- **Bun 1.2.2+** - Fast JavaScript runtime
- **Node.js 20+** - For compatibility
- **Git** - Version control

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.local.example .env.local

# Add your API keys to .env.local
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here

# Run development server
bun run dev
```

### Environment Variables

Required API keys:
- `OPENAI_API_KEY` - For the main agent (GPT-4o-mini)
- `ANTHROPIC_API_KEY` - For tool execution (Claude with web search)

Get your keys:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/

## How to Contribute

### Types of Contributions

We welcome:

1. **Bug Fixes** - Fix issues and improve stability
2. **New Features** - Add new tools, agents, or UI components
3. **Documentation** - Improve docs, add examples, clarify instructions
4. **Tests** - Add unit tests, integration tests, or e2e tests
5. **Performance** - Optimize code, reduce bundle size, improve UX
6. **Refactoring** - Improve code quality and maintainability

### Before You Start

1. **Check existing issues** - See if someone is already working on it
2. **Create an issue** - Describe what you want to work on
3. **Get feedback** - Wait for maintainer approval before starting large changes
4. **Small PRs** - Break large changes into smaller, focused PRs

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict type checking
- Avoid `any` types when possible
- Use proper interfaces and types

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
bun run lint

# Check formatting
bun run prettier

# Auto-fix formatting
bun run prettier:fix
```

### File Organization

```
app/              # Next.js app router pages and API routes
components/       # React components
  assistant-ui/   # Assistant-UI specific components
  ui/             # Shared UI components
mastra/           # Mastra AI configuration
  agents/         # Agent definitions
  tools/          # Custom tools
lib/              # Utility functions
hooks/            # Custom React hooks
```

### Component Guidelines

1. **Use functional components** with hooks
2. **Keep components small** - Single responsibility principle
3. **Extract logic** - Use custom hooks for complex logic
4. **Proper prop types** - Define clear TypeScript interfaces
5. **Accessibility** - Use semantic HTML and ARIA labels

### Tool Development

When creating new tools:

1. **Define clear schemas** - Use Zod for input/output validation
2. **Add descriptions** - Help the agent understand when to use the tool
3. **Handle errors** - Gracefully handle failures
4. **Create UI components** - Use `makeAssistantToolUI` for generative UI
5. **Test thoroughly** - Ensure tools work with various inputs

Example:

```typescript
export const myTool = createTool({
  id: "my_tool",
  description: "Clear description of what this tool does",
  inputSchema: z.object({
    param: z.string().describe("What this parameter is for")
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

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Examples

```bash
feat(tools): add meal planning tool

Add a new tool that generates weekly meal plans based on dietary preferences.

Closes #123

fix(ui): prevent crash when args is undefined

Add optional chaining to safely access args properties in tool UI components.

Fixes #456

docs: update README with new tool examples

chore(deps): update mastra to v0.24.0
```

## Pull Request Process

1. **Update your branch**

```bash
git fetch upstream
git rebase upstream/main
```

2. **Run tests and checks**

```bash
bun run lint
bun run prettier
bunx tsc --noEmit
bun run build
```

3. **Commit your changes**

```bash
git add .
git commit -m "feat: your feature description"
```

4. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

5. **Create Pull Request**

- Go to GitHub and create a PR from your branch
- Fill out the PR template completely
- Link related issues
- Add screenshots/demos if applicable
- Request review from maintainers

6. **Respond to feedback**

- Address review comments
- Push additional commits as needed
- Keep the PR updated with main branch

### PR Requirements

- [ ] All CI checks pass
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Tests added for new features
- [ ] PR description is clear and complete

## Reporting Bugs

Use the [Bug Report](https://github.com/OWNER/REPO/issues/new?template=bug_report.yml) template.

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Log output
- Screenshots if applicable

## Suggesting Enhancements

Use the [Feature Request](https://github.com/OWNER/REPO/issues/new?template=feature_request.yml) template.

Include:
- Problem description
- Proposed solution
- Alternative approaches
- Use cases
- Mockups or examples

## Testing

### Manual Testing

```bash
# Run the dev server
bun run dev

# Test your changes thoroughly:
# - Try various user inputs
# - Test edge cases
# - Check error handling
# - Verify UI responsiveness
```

### Writing Tests

(When test infrastructure is added)

```bash
# Run unit tests
bun test

# Run e2e tests
bun test:e2e

# Watch mode
bun test:watch
```

## Questions?

- Check the [Documentation](CLAUDE.md)
- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- Ask in [GitHub Discussions](https://github.com/OWNER/REPO/discussions)
- Create an issue

## Recognition

Contributors will be:
- Added to the contributors list
- Credited in release notes
- Recognized in the community

Thank you for contributing to Chef Assistant! 🎉
