import type { NextApiRequest, NextApiResponse } from 'next';

interface Question {
  id: number;
  question: string;
  options: Record<string, string>;
  userAnswer: string;
  correctAnswer: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    const evaluatedQuestions = questions.map((q: Question) => {
      const isCorrect = q.userAnswer === q.correctAnswer;
      return {
        ...q,
        isCorrect,
      };
    });

    const correctCount = evaluatedQuestions.filter(q => q.isCorrect).length;
    const score = correctCount.toString();

    return res.status(200).json({
      score,
      evaluatedQuestions,
    });
  } catch (error) {
    console.error('Error checking answers:', error);
    return res.status(500).json({ message: 'Failed to check answers' });
  }
} 