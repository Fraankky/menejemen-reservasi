# Agent Guidelines for menejemen-reservasi

## Commands
- **Build**: `npm run build` (runs TypeScript check + Vite build)
- **Dev**: `npm run dev` (starts Vite dev server)
- **Lint**: `npm run lint` (runs ESLint on all files)
- **No test framework configured** - add tests using Vitest if needed

## Code Style
- **Language**: TypeScript with strict mode enabled
- **Imports**: Use `@/*` path alias for `src/*`, organize by: UI components → external libs → local files
- **Components**: PascalCase names, arrow functions, no semicolons
- **Variables/Functions**: camelCase
- **Styling**: Tailwind CSS with `cn()` utility for class merging
- **Comments**: Indonesian for user-facing features, English for technical code
- **Error Handling**: Use try/catch for async operations, React Query for API errors
- **State**: localStorage for simple persistence, React Query for server state
- **Backend**: Supabase client with typed database schema
- **Routing**: React Router with kebab-case paths (e.g., `/check-status`)

## Architecture
- **UI**: Radix UI components via shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Theming**: next-themes for dark/light mode support