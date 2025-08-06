export default function makeUrl(
  path: string,
  params: Record<string, string | number | undefined> = {}
): string {
  let url = path;
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue; // Skip undefined values
    url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
  }
  return url;
}
