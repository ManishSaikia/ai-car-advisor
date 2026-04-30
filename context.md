# Project Context

This document explains how the Next.js project was initialized and structured, specifically noting changes made to accommodate requirements as they evolved.

## 1. Initial Setup
The project was originally initialized as a clean, empty Next.js App Router project using:
`npx -y create-next-app@latest ./ --js --app --src-dir --eslint --use-npm --import-alias "@/*" --empty --no-tailwind`

Key points from the original initialization:
- **Empty Template**: `--empty` was used to prevent Next.js from generating boilerplate styling (`globals.css`) and extra sample code.
- **Vanilla CSS**: Tailwind CSS was initially skipped (`--no-tailwind`) as per standard system preferences for this environment.
- **JavaScript**: Initialized with JavaScript (`--js`) generating `jsconfig.json` instead of `tsconfig.json`.

## 2. Transition to TypeScript and Tailwind
After further requirement gathering, the project architecture was updated:
- **TypeScript Conversion**: The user explicitly requested TypeScript. `jsconfig.json` is replaced by `tsconfig.json`, and `.js` files are renamed to `.tsx` / `.ts`.
- **Tailwind CSS**: The user explicitly requested Tailwind CSS for the Chat UI. Tailwind packages (`tailwindcss`, `postcss`, `autoprefixer`) were installed manually post-initialization.

## 3. Core Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Backend**: Groq API using `meta-llama/llama-4-scout-17b-16e-instruct` model as a rule-based scoring engine for recommendations.
- **Dataset**: Mock Indian car data located in `src/data/cars.json`.
