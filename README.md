# TrackMacros – Nutrition Tracker

A mobile-first Next.js nutrition tracking app powered by OpenAI.

## Features

- **Dashboard**: Calorie ring and macro progress bars for the day
- **Meal Log**: Log meals in natural language – AI extracts calories and macros
- **Shopping List**: Generate a weekly grocery list within your budget
- **Profile**: Calculate your TDEE and set goals (bulk / maintain / cut)

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Lucide React icons
- OpenAI `gpt-4o-mini` for nutrition analysis
- LocalStorage for client-side persistence

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-...
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.
