import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface QuizQuestion {
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  try {
    const prompt = `Create a quiz with 5 multiple choice questions about ${topic}.
Format each question exactly like this example:

What is the capital of France?
A) London
B) Berlin
C) Madrid
D) Paris*

Note: Mark the correct answer with an asterisk (*) at the end of the option.
Do not include any introductory text or numbering.
Provide exactly 5 questions with 4 options each.`;

    const response = await fetch('http://54.183.235.25:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Ollama response:', data);
    
    if (!data.response) {
      throw new Error('No response from Ollama');
    }

    // Clean up the response by removing any introductory text
    const cleanedResponse = data.response
      .replace(/^(Here are|Here's|I'll create|Let me create|Okay|Sure|Now|Here is).*?\n/i, '')
      .replace(/^\d+\.\s*/gm, '')
      .trim();

    // Split into question blocks
    const questionBlocks = cleanedResponse
      .split(/\n\s*\n/)
      .filter((block: string) => block.trim() && block.includes(')'));

    const questions: QuizQuestion[] = questionBlocks.map((block: string) => {
      const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
      
      // First line is the question
      const question = lines[0].replace(/^Q(uestion)?:\s*/i, '').trim();
      
      // Initialize options
      const options: Record<string, string> = { A: '', B: '', C: '', D: '' };
      let correctAnswer = '';

      // Process each line for options
      lines.slice(1).forEach(line => {
        const optionMatch = line.match(/^([A-D])\)(.*?)(\*)?$/);
        if (optionMatch) {
          const [, letter, text, isCorrect] = optionMatch;
          options[letter] = text.trim();
          if (isCorrect) {
            correctAnswer = letter;
          }
        }
      });

      // If no correct answer was marked with *, look for other indicators
      if (!correctAnswer) {
        Object.entries(options).forEach(([letter, text]) => {
          if (text.endsWith('*')) {
            correctAnswer = letter;
            options[letter] = text.replace(/\*$/, '').trim();
          }
        });
      }

      // Validate options
      const missingOptions = Object.entries(options)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missingOptions.length > 0) {
        throw new Error(`Missing options ${missingOptions.length} for question: ${question}`);
      }

      // If still no correct answer found, use the first option as fallback
      if (!correctAnswer) {
        correctAnswer = 'A';
        console.log('No correct answer found, defaulting to A for question:', question);
      }

      return {
        question,
        options,
        correctAnswer
      };
    });

    if (questions.length === 0) {
      throw new Error('No valid questions generated');
    }

    // Take only the first 5 questions if more were generated
    const finalQuestions = questions.slice(0, 5);

    return res.status(200).json({ questions: finalQuestions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return res.status(500).json({ message: 'Failed to generate quiz' });
  }
} 