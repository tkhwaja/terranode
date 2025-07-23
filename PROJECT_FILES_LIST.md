# TerraNode Project Files List

## Essential Files to Include in GitHub Repository

### Root Directory Files
- `package.json` - Dependencies and scripts
- `package-lock.json` - Dependency lock file
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `drizzle.config.ts` - Database ORM configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui configuration
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variables template

### Documentation Files
- `README.md` - Project overview
- `ARCHITECTURE.md` - Technical architecture
- `API_DOCUMENTATION.md` - API endpoints reference
- `CONTRIBUTING.md` - Contribution guidelines
- `SETUP_GUIDE.md` - Developer setup guide
- `LICENSE` - MIT license
- `replit.md` - Project context and notes

### Source Code Directories

#### `/client` - Frontend Application
```
client/
├── public/
│   └── (any static assets)
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── AllianceGovernance.tsx
│   │   ├── AlliancePulseBar.tsx
│   │   ├── AuthPrompt.tsx
│   │   ├── DailyMissionCard.tsx
│   │   ├── EnergyChart.tsx
│   │   ├── EnergyMap.tsx
│   │   ├── EnergySnapshot.tsx
│   │   ├── Milestones.tsx
│   │   ├── Notifications.tsx
│   │   ├── ReferralSystem.tsx
│   │   ├── SolarAlliances.tsx
│   │   ├── TokenLedger.tsx
│   │   ├── UptimeTracker.tsx
│   │   ├── UserProfile.tsx
│   │   ├── WattTicker.tsx
│   │   └── WattWallet.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── authUtils.ts
│   │   ├── queryClient.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── dashboard.tsx
│   │   ├── landing.tsx
│   │   └── not-found.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
└── index.html
```

#### `/server` - Backend Application
```
server/
├── services/
│   ├── autoSeeder.ts
│   ├── dataGenerator.ts
│   └── demoSeeder.ts
├── db.ts
├── index.ts
├── replitAuth.ts
├── routes.ts
├── storage.ts
├── testTokenUpdate.ts
└── vite.ts
```

#### `/shared` - Shared Code
```
shared/
└── schema.ts    # Database schema and types
```

### Design Assets (Optional)
```
attached_assets/
├── Enterprise data visualization_*.jpg
├── Dashboard AI IDEAS_*.jpg
├── Screenshots_*.png
└── Design_notes_*.txt
```

## Files to Exclude (Already in .gitignore)

- `.env` - Local environment variables
- `node_modules/` - NPM packages
- `dist/` - Build output
- `.DS_Store` - macOS metadata
- `*.log` - Log files
- IDE config folders (`.vscode`, `.idea`)

## Setting Up GitHub Repository

### Step 1: Initialize Git
```bash
git init
git add .
git commit -m "Initial commit: TerraNode solar energy platform"
```

### Step 2: Create GitHub Repository
1. Go to https://github.com/new
2. Name: `terranode`
3. Description: "Solar energy tracking platform with gamification"
4. Make it public or private as needed
5. Don't initialize with README (we have one)

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/terranode.git
git branch -M main
git push -u origin main
```

### Step 4: Set Up Secrets
In GitHub repository settings → Secrets:
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPLIT_DOMAINS`
- `REPL_ID`

## Collaboration Checklist

Before sharing with other engineers:
- [ ] All documentation files are included
- [ ] `.env.example` has all required variables
- [ ] README has clear setup instructions
- [ ] API documentation is complete
- [ ] Architecture diagram is included
- [ ] Contributing guidelines are clear
- [ ] License is specified
- [ ] .gitignore excludes sensitive files

## Quick Start for New Developers

1. Clone repository
2. Copy `.env.example` to `.env`
3. Fill in environment variables
4. Run `npm install`
5. Run `npm run db:push`
6. Run `npm run dev`
7. Open http://localhost:5000

That's it! The project is ready for collaboration.