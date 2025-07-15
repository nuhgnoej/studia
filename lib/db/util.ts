export function checkAnswer(
  correctAnswerRaw: string,
  userAnswer: string
): boolean {
  const correctAnswer = JSON.parse(correctAnswerRaw);

  if (Array.isArray(correctAnswer)) {
    return correctAnswer.map((v) => v.trim()).includes(userAnswer.trim());
  } else {
    return correctAnswer.trim() === userAnswer.trim();
  }
}

