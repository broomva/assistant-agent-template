# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our project seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Open a Public Issue

Please do not open a public GitHub issue if the bug is a security vulnerability.

### 2. Report Privately

Send a detailed report to **[INSERT YOUR EMAIL]** with:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Any suggested fixes (if you have them)

### 3. What to Include

When reporting a security vulnerability, please include:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it

### 4. Response Timeline

- We will acknowledge receipt of your vulnerability report within **48 hours**
- We will send a more detailed response within **5 business days** indicating next steps
- We will work with you to understand and resolve the issue
- We will keep you informed of the progress towards a fix

### 5. Disclosure Policy

- Security vulnerabilities should be reported privately
- We request that you do not publicly disclose the vulnerability until we have had a chance to address it
- Once a fix is released, we will credit you for the discovery (unless you prefer to remain anonymous)
- We will publish a security advisory on GitHub after the fix is released

## Security Best Practices

When using this template, follow these security best practices:

### API Keys

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** - especially if they may have been compromised
4. **Use separate keys** for development, staging, and production
5. **Restrict API key permissions** to only what's necessary

### Environment Variables

```bash
# ✅ Good - use .env.local (gitignored)
OPENAI_API_KEY=sk-proj-xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# ❌ Bad - never commit these files
.env
.env.production
```

### Dependencies

1. **Keep dependencies updated** - enable Dependabot
2. **Review security advisories** - check GitHub Security tab regularly
3. **Audit packages** - run `bun audit` periodically
4. **Remove unused dependencies** - reduce attack surface

### Database Security

1. **Use LibSQL/Turso auth tokens** for remote databases
2. **Never expose database URLs** publicly
3. **Implement proper access controls**
4. **Regularly backup data**

### Deployment

1. **Use HTTPS** - always enable SSL/TLS
2. **Set secure headers** - implement security headers in production
3. **Enable CORS properly** - don't use `*` wildcard
4. **Rate limiting** - implement rate limiting for API routes
5. **Input validation** - validate and sanitize all user inputs

### Code Quality

1. **Enable TypeScript strict mode** - catch errors early
2. **Use ESLint security plugins** - `eslint-plugin-security`
3. **Validate tool inputs/outputs** - use Zod schemas
4. **Handle errors properly** - don't expose sensitive error details

## Known Security Considerations

### API Key Exposure

This application requires API keys for OpenAI and Anthropic. These keys:
- Should **never** be committed to version control
- Should **never** be exposed to the client-side
- Should be stored in `.env.local` (which is gitignored)
- Should be added as environment variables in deployment platforms

### Database

The default configuration uses a local SQLite database:
- The `local.db*` files are gitignored
- For production, use LibSQL/Turso with proper authentication
- Never commit database files with user data

### Client-Side Code

- API routes are server-side only (Next.js API routes)
- API keys are never sent to the client
- All LLM communication happens server-side

## Vulnerability Disclosure

We will publish security advisories on:
- GitHub Security Advisories
- Repository README (for critical issues)
- Release notes

## Security Updates

We will:
- Release security patches as soon as possible
- Notify users via GitHub releases
- Provide upgrade instructions
- Maintain changelogs with security fixes

## Third-Party Security

This project depends on:
- **Next.js** - [Security Policy](https://github.com/vercel/next.js/security)
- **Mastra AI** - [Security](https://mastra.ai/)
- **Anthropic** - [Security](https://www.anthropic.com/security)
- **OpenAI** - [Security](https://openai.com/security)

Please report security issues for these dependencies directly to their respective teams.

## Attribution

This security policy is adapted from the [Contributor Covenant](https://www.contributor-covenant.org/) and GitHub's recommended security policy template.

## Questions?

If you have questions about this security policy, please open a GitHub Discussion (not an issue) or contact us at **[INSERT YOUR EMAIL]**.

---

**Thank you for helping keep our project and users safe!** 🔒
