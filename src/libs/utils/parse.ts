export const cleanAndStringifyJson = (jsonString = '') => {
  const cleanedJsonString = jsonString
    .replace(/^```json\n|\n```|```$/g, '')
    .trim();

  return JSON.stringify(cleanedJsonString);
};
