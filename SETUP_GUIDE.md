# TerraNode Setup Guide for Developers

## Project Files Overview

This project contains the following key directories and files:

### Core Directories
- `client/` - React frontend application
- `server/` - Express backend server
- `shared/` - Shared TypeScript types and schemas
- `attached_assets/` - UI mockups and design references

### Configuration Files
- `package.json` - NPM dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database ORM configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui components config

### Documentation
- `README.md` - Project overview and setup instructions
- `ARCHITECTURE.md` - Technical architecture documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - MIT license
- `replit.md` - Project context and recent changes
- `.env.example` - Environment variables template

## Setting Up Your Development Environment

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git installed
- Code editor (VS Code recommended)

### 2. Initial Setup

```bash
# Clone the repository (after pushing to GitHub)
git clone https://github.com/yourusername/terranode.git
cd terranode

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create a new database
createdb terranode

# Update .env with your local PostgreSQL credentials
DATABASE_URL=postgresql://localhost:5432/terranode
```

#### Option B: Neon Database (Recommended for cloud)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string to your .env file

#### Apply Database Schema
```bash
npm run db:push
```

### 4. Development Authentication

The project includes a development authentication bypass for localhost. When running on `localhost`, you'll be automatically logged in as a test user.

For production, you'll need to set up proper authentication:
- `SESSION_SECRET` - Generate a secure random string
- `REPLIT_DOMAINS` - Your production domain(s)
- `REPL_ID` - Your application ID
- `ISSUER_URL` - OAuth provider URL

### 5. Running the Application

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5000
```

## GitHub Setup Instructions

### 1. Create a New Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: TerraNode solar energy platform"

# Add remote origin
git remote add origin https://github.com/yourusername/terranode.git

# Push to GitHub
git push -u origin main
```

### 2. Recommended .gitignore

The project already includes a .gitignore file that excludes:
- `node_modules/`
- `.env`
- `dist/`
- `.DS_Store`
- `*.log`

### 3. GitHub Repository Settings

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets for CI/CD:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - Any other production secrets

### 4. Recommended Branch Protection

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Dismiss stale pull request approvals
   - Require status checks to pass

## Collaboration Guidelines

### Working with Other Engineers

1. **Branch Strategy**
   - `main` - Production-ready code
   - `develop` - Integration branch
   - Feature branches: `feature/feature-name`

2. **Pull Request Process**
   - Create feature branch from `develop`
   - Make changes and test locally
   - Push branch and create PR
   - Request review from team member
   - Merge after approval

3. **Code Standards**
   - TypeScript for all new code
   - Follow existing formatting
   - Write meaningful commit messages
   - Add comments for complex logic

### Development Workflow

1. **Daily Standup Topics**
   - Current feature progress
   - Blockers or dependencies
   - Code review needs

2. **Feature Development**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   # Make changes
   git add .
   git commit -m "feat: Add your feature"
   git push origin feature/your-feature
   ```

3. **Code Review Checklist**
   - [ ] TypeScript types are correct
   - [ ] No console.logs in production code
   - [ ] UI follows cyberpunk theme
   - [ ] Database queries are optimized
   - [ ] Error handling is implemented

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **Authentication Not Working**
   - On localhost: Dev bypass should work automatically
   - Production: Check REPLIT_DOMAINS includes your domain
   - Verify SESSION_SECRET is set

3. **Build Errors**
   - Run `npm install` to ensure all deps are installed
   - Check for TypeScript errors: `npm run type-check`
   - Clear build cache: `rm -rf dist/`

4. **WebSocket Connection Issues**
   - Ensure `/ws` path is not blocked
   - Check for CORS issues in production
   - Verify WebSocket upgrade headers

## Contact & Support

- Create GitHub issues for bugs
- Use discussions for questions
- Tag @yourusername for urgent matters

## Next Steps

1. Set up your local environment
2. Run the application
3. Explore the codebase
4. Pick a feature from the backlog
5. Start contributing!

Happy coding! 🚀