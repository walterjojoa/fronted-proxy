// Same rule used by the backend (TokenEstimator): 1 token ~ 4 characters
const CHARS_PER_TOKEN = 4;

// Average size of the answers returned by the mock AI service
export const AVERAGE_COMPLETION_TOKENS = 25;

export function estimateTokens(text) {
  if (!text || !text.trim()) {
    return 0;
  }
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}
