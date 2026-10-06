export const USER_AGENT = "skill-atlas";

export function githubHeaders(extra: Record<string, string> = {}): Headers {
  const headers = new Headers({ "User-Agent": USER_AGENT, ...extra });
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}
