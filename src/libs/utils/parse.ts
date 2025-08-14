import { SPLIT_SEPARATOR, SPACE_SEPARATOR } from "@constant";

export const cleanAndStringifyJson = (jsonString = '') => {
  const cleanedJsonString = jsonString
    .replace(/^```json\n|\n```|```$/g, '')
    .trim();

  return cleanedJsonString;
};

export const isValidJsonQuiz = (quizJson: string): boolean => {
  try {
    const quiz = JSON.parse(quizJson);
    return (
      typeof quiz === 'object' &&
      quiz !== null &&
      typeof quiz.question === 'string' &&
      typeof quiz.answer === 'string'
    );
  } catch (error) {
    return false;
  }
};

export const replaceSeparator = (
  input: string,
  fromSeparator = SPLIT_SEPARATOR,
  toSeparator = SPACE_SEPARATOR,
) => {
  if (typeof input !== 'string') return input;
  return input.split(fromSeparator).join(toSeparator);
};