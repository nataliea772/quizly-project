# Quiz Bot Project

An AI-powered quiz application that generates questions based on any topic and evaluates user answers using Ollama.

## Features

- Generate quiz questions on any topic
- Interactive user interface for answering questions
- Real-time evaluation of answers
- Detailed feedback for each answer
- Responsive design for all devices

## Prerequisites

- Node.js 14.x or higher
- Access to an Ollama instance running at http://<EC2 public IP>:11434

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a topic in the input field (e.g., "World War II", "Photosynthesis")
2. Click "Generate Quiz" to get 5 questions about your topic
3. Answer each question in the provided text fields
4. Click "Check My Answers" to get feedback and your score
5. Start a new quiz by clicking "Start New Quiz"

## Technology Stack

- Next.js
- TypeScript
- React
- Ollama API

## Project Structure

```
quiz-project/
├── components/
│   └── Quiz.tsx
├── pages/
│   ├── api/
│   │   ├── generate-quiz.ts
│   │   └── check-answers.ts
│   └── index.tsx
└── styles/
    ├── Home.module.css
    └── Quiz.module.css
``` 
