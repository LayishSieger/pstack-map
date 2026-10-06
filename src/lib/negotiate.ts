/** True when text/markdown is requested and outranks text/html. */
export function prefersMarkdown(accept: string): boolean {
  let markdown = 0;
  let html = 0;
  let sawMarkdown = false;
  let sawHtml = false;
  for (const part of accept.split(",")) {
    const [rawType, ...params] = part.split(";").map((item) => item.trim());
    const type = rawType?.toLowerCase() ?? "";
    const qParam = params.find((param) => param.toLowerCase().startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (!Number.isFinite(q) || q <= 0) continue;
    if (type === "text/markdown" || type === "text/x-markdown") {
      sawMarkdown = true;
      markdown = Math.max(markdown, q);
    }
    if (type === "text/html") {
      sawHtml = true;
      html = Math.max(html, q);
    }
  }
  if (!sawMarkdown) return false;
  if (!sawHtml) return true;
  return markdown > html;
}
