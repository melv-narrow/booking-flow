# REM Waste — Booking Flow QA Assessment

## Project Overview
This project implements a complete, production-grade skip hire booking flow for REM Waste. It demonstrates a rigorous approach to software quality engineering by integrating full-stack functionality with deterministic testing, responsive UI architecture, and robust automated test coverage using Playwright and GitHub Actions.

## Live Demo
[https://booking-flow-mocha.vercel.app/](https://booking-flow-mocha.vercel.app/)

## Local Setup
```bash
npm install
npm run dev
```

## Architecture Decisions
- **Next.js & App Router**: Leveraged for built-in API routes, maintaining a consolidated frontend/backend structure without the overhead of an external Express server.
- **Tailwind CSS**: Adopted for strict design token compliance, rapid iteration on custom components, and eliminating disjointed CSS files.
- **Client-Side State via Props**: Used simple `useState` and prop drilling instead of complex state layers (like Redux or Zustand) because the 4-step wizard requirements warrant an elegant, minimal native React solution.
- **Accessible Native Elements**: Preferred native OS dropdowns (`<select>`) and proper ARIA labels to ensure optimal, out-of-the-box accessibility without over-engineering custom UI widgets.

## Test Data & Mocking Strategy
Deterministic testing is imperative for reliable automation. Fixtures are isolated within `/lib/fixtures.ts` to strictly simulate expected behaviour, including specific network latency scenarios (`M1 1AE`), targeted API failures (`BS1 4DJ` retry logic), and distinct UI empty states. This ensures E2E testing evaluates true application paths rather than flaky boundaries.

## AI Usage in This Project
I utilized AI tools (Claude/Copilot) primarily for generating initial structural boilerplate, scaffolding Playwright tests, and preparing deterministic API fixtures. All logic flow validations, test case rationale, bug identifications, and UI functionality decisions were governed, reviewed, and finalized purely by human insight.

## Manual Test Coverage
Detailed, ISTQB-standard manual testing scenarios exist to evaluate boundary cases and state transitions:
[View Manual Tests Requirements (35+ test cases)](./manual-tests.md)

## Bug Reports
I've successfully identified, documented, and provided corresponding fixes for subtle edge cases:
[View Bug Reports](./bug-reports.md)

## Automation
Automated end-to-end tests exercise all crucial booking paths, including state validations and disabled component paths.
To run tests locally:
```bash
npm run test:e2e
```
**CI / CD**: Tests automatically run inside GitHub Actions against every push to the `master` branch. 
[![QA Tests](https://github.com/melv-narrow/booking-flow/actions/workflows/test.yml/badge.svg)](https://github.com/melv-narrow/booking-flow/actions/workflows/test.yml)

## Lighthouse / Accessibility
A comprehensive performance and accessibility report evaluated against production builds.
[View Lighthouse Report](./ui/lighthouse-report.html)
