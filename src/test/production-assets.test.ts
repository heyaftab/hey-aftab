import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(path.join(directory, entry.name))
      : [path.join(directory, entry.name)],
  );
}
function exactCaseExists(filename: string) {
  const relative = path.relative(process.cwd(), path.resolve(filename));
  let directory = process.cwd();
  for (const part of relative.split(path.sep)) {
    if (!readdirSync(directory).includes(part)) return false;
    directory = path.join(directory, part);
  }
  return true;
}
it("ships every local image, CV, favicon, and CSS asset with Linux-compatible filename casing", () => {
  const missing: string[] = [];
  let checked = 0;
  for (const filename of files("src").filter(
    (file) => /\.(tsx?|css)$/.test(file) && !file.includes(`${path.sep}test${path.sep}`),
  )) {
    const source = readFileSync(filename, "utf8");
    for (const match of source.matchAll(
      /["'`](\/(?:assets\/[^"'`\s]+|[^"'`\s]+\.(?:docx|ico)))["'`]/g,
    )) {
      checked++;
      if (!exactCaseExists(path.join("public", match[1]!)))
        missing.push(`${filename}: ${match[1]}`);
    }
    if (filename.endsWith(".css"))
      for (const match of source.matchAll(/url\(["']?(\.\.?\/[^"')]+)["']?\)/g)) {
        checked++;
        if (!exactCaseExists(path.resolve(path.dirname(filename), match[1]!)))
          missing.push(`${filename}: ${match[1]}`);
      }
  }
  expect(checked).toBeGreaterThanOrEqual(10);
  expect(missing).toEqual([]);
});
