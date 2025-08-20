export const getExpForNextLevel = (level: number): number => {
  return Math.pow(level + 1, 3) - Math.pow(level, 3);
};
