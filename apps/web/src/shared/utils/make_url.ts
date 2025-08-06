export default function makeUrl(
  path: string,
  params: Record<string, string | number> = {}
): string {
  let url = path;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
  }
  return url;
}
