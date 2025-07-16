export function checkAnswer(
  correctAnswerRaw: string,
  userAnswer: string
): boolean {
  // correctAnswerRaw가 JSON 문자열일 수 있으므로 try-catch로 파싱 시도
  let correctAnswer;
  try {
    correctAnswer = JSON.parse(correctAnswerRaw);
  } catch (e) {
    // 파싱 실패 시 일반 문자열로 간주
    correctAnswer = correctAnswerRaw;
  }

  // 정답이 배열인 경우와 문자열인 경우를 모두 처리
  if (Array.isArray(correctAnswer)) {
    return correctAnswer.map((v) => v.trim()).includes(userAnswer.trim());
  } else {
    return correctAnswer.toString().trim() === userAnswer.trim();
  }
}

