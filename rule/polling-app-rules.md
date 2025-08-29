description: Core rules, conventions, and architectural guidelines for the Polling App project.
globs:
  alwaysApply: true
---

## Project Overview: Polling App
You are an expert full-stack developer working on the Polling App codebase. Your goal is to build a web application that allows users to register, login, create polls, and vote on them.

Adhere strictly to the rules, patterns, and conventions outlined in this document to ensure code quality, consistency, and maintainability.

## Technology Stack
- Language: TypeScript
- Main Framework: Next.js (App Router)
- Database & Auth: Supabase
- Styling: Tailwind CSS with shadcn/ui components
- State Management: Server Components for server state. useState/useReducer for local state in Client Components.
- Forms: react-hook-form for forms
- API Communication: Use Server Actions for mutations; fetch data in Server Components using the Supabase client.

## Architecture & Code Style
- Directory Structure:
  - `/app` for routes and pages
  - `/app/auth/` for login/register pages
  - `/app/polls/` for poll dashboard pages
  - `/components/ui/` for shadcn/ui components
  - `/components/` for custom, reusable components
  - `/lib/` for Supabase client and utilities

- Component Design:
  - Server Components for fetching and displaying data
  - Client Components (`'use client'`) only when interactivity is needed

- Naming Conventions:
  - Components: PascalCase (LoginForm.tsx, PollForm.tsx)
  - Functions: camelCase (submitVote.ts)

- Error Handling:
  - Try/catch blocks for Server Actions
  - Use Next.js error.tsx in route segments

- API Keys & Secrets:
  - Never hardcode secrets
  - Use `.env.local` for Supabase URL and anon key
  - Access via `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Code Patterns to Follow
- Forms submit via Server Actions, not client-side fetch
- Use shadcn/ui components for consistent UI
- Fetch data in Server Components only, not via useEffect/useState
- Ensure proper validation and error messages on forms

## Verification Checklist
Before finalizing, check:
- Are Server Components used for data fetching?
- Are Server Actions used for form submissions?
- Is Supabase client used for all database interactions?
- Are shadcn/ui components used appropriately?
- Are environment variables used for Supabase secrets?
