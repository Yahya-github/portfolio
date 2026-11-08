const SHA_PATTERN = /^[0-9a-f]{7,40}$/i;
const SHORT_SHA_LENGTH = 7;

export function shortSha(sha: string | undefined): string {
  if (!sha || !SHA_PATTERN.test(sha)) return "local";
  return sha.slice(0, SHORT_SHA_LENGTH).toLowerCase();
}
