# Contributing to TerraNode

Thank you for your interest in contributing to TerraNode! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment following the README
4. Create a new branch for your feature/fix

## Development Workflow

### Branch Naming Convention

- Feature branches: `feature/your-feature-name`
- Bug fixes: `fix/issue-description`
- Documentation: `docs/what-you-updated`
- Refactoring: `refactor/what-you-refactored`

### Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (2 spaces, no semicolons in TypeScript)
- Use meaningful variable and function names
- Add JSDoc comments for exported functions and complex logic

### Component Guidelines

#### Frontend Components
- Place new components in `client/src/components/`
- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Use Tailwind CSS for styling
- Follow the cyberpunk theme color scheme

#### Backend Services
- Add new services to `server/services/`
- Implement proper error handling
- Use the storage interface for database operations
- Add appropriate TypeScript types

### Database Changes

- Update the schema in `shared/schema.ts`
- Run `npm run db:push` to apply changes
- Document any new tables or columns

### Testing

Before submitting a PR:
1. Test all new features thoroughly
2. Ensure existing features still work
3. Test on both desktop and mobile viewports
4. Verify WebSocket connections work properly

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the replit.md file if you make architectural changes
3. Ensure your branch is up to date with main
4. Create a pull request with a clear title and description
5. Link any related issues

### PR Title Format
- `feat: Add new feature`
- `fix: Fix specific issue`
- `docs: Update documentation`
- `refactor: Refactor specific code`
- `style: Update styling`

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
Steps to test this change:
1. 
2. 
3. 

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the project style
- [ ] I have tested my changes
- [ ] I have updated documentation as needed
```

## Code Review

All PRs require at least one review before merging. Reviewers will check:
- Code quality and style consistency
- Proper TypeScript usage
- Security considerations
- Performance implications
- UI/UX consistency

## Questions?

Feel free to open an issue for any questions about contributing!