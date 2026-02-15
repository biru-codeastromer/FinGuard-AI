# Contributing Guide

## Purpose
This document defines contribution standards for FinGuard AI to keep architecture, code quality, and documentation consistent throughout the semester.

## Development Standards
- Use TypeScript strict mode and avoid `any` unless fully justified.
- Follow NestJS module boundaries and keep responsibilities clear.
- Use DTO classes for all request/response contracts.
- Keep business logic inside services or domain classes, not controllers.
- Use repository interfaces and dependency injection.

## Branching Strategy
- `main`: stable and submission-ready branch.
- `feature/*`: new module or feature work.
- `fix/*`: bug fixes.
- `docs/*`: documentation improvements.

## Commit Convention
Use Conventional Commits:
- `feat(module): description`
- `fix(module): description`
- `docs(scope): description`
- `test(scope): description`
- `chore(scope): description`

## Pull Request Checklist
- Scope is focused and clearly described.
- Tests added/updated for changed behavior.
- API contract changes documented.
- Security and validation impact reviewed.
- No unrelated file changes included.
