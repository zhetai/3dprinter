# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

---

## Project Overview

**Project Name:** 3D打印机金属齿轮智能支撑优化服务 (3D Printer Metal Gear Intelligent Support Optimization Service)

**Version:** 1.1

**Description:** 基于 Cloudflare Workers 的最小可行产品 (MVP)，为企业用户提供基于 Cura Engine 的金属齿轮 3D 打印智能支撑优化服务。采用 Freemium（免费增值）商业模式：企业认证后获得 200 元初始体验金，用尽后按节省效果付费。

### Tech Stack

- **Runtime:** Cloudflare Workers (Edge Computing)
- **Framework:** Hono.js (Web Framework) + Chanfana (OpenAPI 3.1)
- **Validation:** Zod
- **Database:** Cloudflare D1 (SQLite)
- **Language:** TypeScript (ES2024)
- **Deploy Tool:** Wrangler

### Project Structure

```
3dprinter/
├── src/
│   ├── index.ts              # Main router entry point
│   ├── types.ts              # TypeScript schemas and types
│   └── endpoints/            # API endpoint handlers
│       ├── taskCreate.ts
│       ├── taskDelete.ts
│       ├── taskFetch.ts
│       ├── taskList.ts
│       ├── authSubmit.ts     # Enterprise auth submission
│       ├── authReview.ts     # Admin auth review
│       ├── userBalance.ts    # User balance query
│       └── optimizeRun.ts    # Optimization service endpoint
├── my-video/                 # Remotion video project (separate module)
│   ├── src/
│   └── remotion.config.ts
├── schema.sql                # Database schema
├── wrangler.jsonc            # Cloudflare Workers config
├── tsconfig.json             # TypeScript config
└── package.json              # Root dependencies
```

## Development Commands

### Root Project (Cloudflare Workers)

```bash
# Install dependencies
npm install

# Start local development server (with Swagger UI at http://localhost:8787/)
npm run dev
# or
wrangler dev

# Deploy to Cloudflare Workers
npm run deploy
# or
wrangler deploy

# Generate TypeScript types for Cloudflare Workers bindings
npm run cf-typegen
```

### Video Module (my-video/)

```bash
# Navigate to video module
cd my-video

# Install dependencies
npm install

# Start Remotion Studio
npm run dev

# Build production bundle
npm run build

# Lint code
npm run lint
```

## API Endpoints

### Task Management (Legacy/Example)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:taskSlug` - Fetch a specific task
- `DELETE /api/tasks/:taskSlug` - Delete a task

### Enterprise Authentication & Billing
- `POST /api/auth/enterprise` - Submit enterprise auth (business license upload)
- `POST /api/admin/auth/review` - Admin review endpoint (approve/reject)
- `GET /api/users/:user_id/balance` - Query user balance
- `POST /api/service/optimize` - Run optimization (deducts balance or triggers payment)

## Database Schema

### Tables

**users**
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT)
- `balance` (INTEGER, default 0) - Stored in CNY units
- `created_at` (TIMESTAMP)

**enterprise_auth**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `user_id` (TEXT, FOREIGN KEY → users.id)
- `company_name` (TEXT)
- `credit_code` (TEXT) - 18-digit Unified Social Credit Code
- `license_image_url` (TEXT)
- `status` (TEXT) - 'pending', 'approved', 'rejected'
- `rejection_reason` (TEXT, optional)
- `created_at` / `updated_at` (TIMESTAMP)

**transactions**
- `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
- `user_id` (TEXT, FOREIGN KEY → users.id)
- `amount` (INTEGER) - Positive for grant/deposit, Negative for usage
- `type` (TEXT) - 'trial_grant', 'usage', 'payment'
- `description` (TEXT, optional)
- `created_at` (TIMESTAMP)

## Key Dependencies

### Production
- `chanfana` ^2.6.3 - OpenAPI 3.1 schema generation and validation
- `hono` ^4.6.20 - Lightweight web framework
- `zod` ^3.24.1 - Schema validation

### Development
- `@types/node` 22.13.0
- `wrangler` ^4.62.0 - Cloudflare Workers CLI

## Business Logic Notes

### Freemium Model
1. User registers → Uploads business license → Admin review
2. Review approved → 200 CNY trial grant credited
3. User uploads STL → Optimization runs → Trial balance deducted
4. Trial exhausted → Triggers payment (QR code) for service fee
5. Service fee = Max(saved material value × commission rate, minimum charge)

### Security Requirements
- Business license images must be encrypted at rest
- Enterprise auth data must comply with Personal Information Protection Law
- Invoice info tied to verified enterprise identity

## Configuration Files

- `wrangler.jsonc` - Cloudflare Workers configuration (includes D1 database binding)
- `tsconfig.json` - TypeScript compiler options (ES2024 target, strict mode)
- `worker-configuration.d.ts` - Cloudflare Workers type definitions
- `.gitignore` - Standard Node.js ignore patterns

