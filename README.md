# HailMary - AI-Powered Learning Path Recommendation System

An intelligent learning path recommendation and progress tracking system powered by AI.

## Project Structure

```
hailmary/
├── apps/
│   ├── web/                 # React + Vite frontend
│   └── api/                 # Node.js + Express backend
├── packages/
│   └── shared/              # Shared types, constants, utilities
├── pipeline/                # Data pipeline for content scraping and processing
├── database/                # Schema and migrations
└── .github/workflows/       # CI/CD automation
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (see .env.example and apps/*/.env.example)
cp .env.example .env

# Apply database migrations (needs DATABASE_URL in .env)
pnpm migrate

# Start development servers
pnpm dev
```

### Development

```bash
# Start all apps in development mode
npm run dev

# Build all apps
npm run build

# Run linting
npm run lint

# Run tests
npm run test
```

## Architecture

### Web App (`apps/web`)
- React 18 with Vite
- Zustand for state management
- Tailwind CSS for styling
- TypeScript for type safety

### API (`apps/api`)
- Express.js server
- PostgreSQL database
- RESTful endpoints for resources, users, and progress
- Authentication and rate limiting middleware

### Pipeline (`pipeline`)
- Scrapes content from multiple sources (freeCodeCamp, Striver, CS50)
- Fetches from APIs (YouTube, GitHub)
- Normalizes and tags resources
- Scheduled weekly updates

### Shared Package (`packages/shared`)
- Common TypeScript types
- Shared constants
- Path graphs and domain maps

## Features

- 📚 Curated learning paths across multiple domains
- 🤖 AI-powered resource ranking and recommendations
- 📊 Progress tracking and visualization
- 🔄 Weekly content pipeline updates
- 🏷️ Intelligent tagging and categorization
- 🎯 Difficulty-based learning progression

## Tech Stack

- **Frontend**: React, Vite, Zustand, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Build**: Turborepo, TypeScript
- **CI/CD**: GitHub Actions
- **Scraping**: Cheerio, Axios
- **Scheduling**: Node-cron

## License

MIT
