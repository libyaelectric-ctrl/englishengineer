# Contributing to EngineerOS

Thank you for your interest in contributing to EngineerOS! This document provides guidelines and standards for all contributors.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/englishengineer.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feat/your-feature-name`
5. Make changes and commit following [Conventional Commits](#commit-conventions)
6. Push and open a Pull Request

## 📋 Development Setup

See [docs/ONBOARDING.md](./docs/ONBOARDING.md) for detailed setup instructions.

```bash
# Quick setup
npm install
npm run verify:all        # Run all checks
npm run test:smoke        # Run smoke tests
npm run test:e2e          # Run E2E tests
```

## 📝 Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                               |
| ---------- | ----------------------------------------- |
| `feat`     | New feature                               |
| `fix`      | Bug fix                                   |
| `docs`     | Documentation changes                     |
| `style`    | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring                          |
| `perf`     | Performance improvements                  |
| `test`     | Adding or updating tests                  |
| `chore`    | Build process, dependencies, tooling      |
| `ci`       | CI/CD configuration                       |
| `revert`   | Reverting a previous commit               |

### Scopes

Common scopes: `auth`, `ai`, `billing`, `vocabulary`, `grammar`, `reading`, `writing`, `listening`, `speaking`, `ui`, `api`, `deps`, `docs`, `ci`

### Examples

```
feat(ai): add Claude 3.5 Sonnet provider

fix(auth): resolve JWT race condition on rapid logout/login

docs(readme): update deployment instructions for Render

chore(deps): bump typescript-eslint from 8.62.0 to 8.65.0
```

## 🧪 Testing Requirements

- **Unit tests**: Required for all new utilities, hooks, and services
- **Component tests**: Required for new shared components
- **E2E tests**: Required for new critical user flows
- **Coverage**: Maintain or improve current coverage thresholds

Run tests before committing:

```bash
npm run test:unit
npm run test:e2e
npm run test:smoke
```

## 🏗️ Code Standards

### TypeScript

- Enable `strict` mode compliance
- No `any` types without justification
- Explicit return types for public APIs
- Use `Result<T, E>` pattern from `src/core/result.ts`

### Architecture

- Follow **Feature-based architecture**: `src/features/<feature>/`
- No cross-feature imports (enforced by Dependency Cruiser)
- No frontend→backend direct imports
- Place shared code in `src/shared/`

### Component Guidelines

- Use functional components with hooks
- Props interface naming: `{ComponentName}Props`
- Export from `index.ts` barrel files
- Accessibility: `aria-*` props, keyboard navigation, focus management

## 🔄 Pull Request Process

1. **Branch naming**: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`
2. **PR title**: Follow Conventional Commits format
3. **Description**: Include:
   - What changed and why
   - Screenshots (for UI changes)
   - Test coverage impact
   - Related issue numbers
4. **Checks**: All CI checks must pass
5. **Review**: At least 1 approval required

## 🐛 Reporting Bugs

Use GitHub Issues with the bug template:

```markdown
**Description:**
Clear description of the bug.

**Steps to Reproduce:**

1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen.

**Environment:**

- OS: [e.g., macOS 14]
- Browser: [e.g., Chrome 126]
- Version: [e.g., v4.0.1]
```

## 💡 Feature Requests

Open a GitHub Issue with:

- Clear use case
- Proposed solution
- Alternative solutions considered

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

- Open a GitHub Discussion
- Email: libyaelectric@gmail.com

---

**Happy coding! 🚀**
