import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Console Documentation Standards & Compliance", () => {
  const consoleRoot = path.resolve(__dirname, "../..");

  it("ensures all mandatory repository documentation files exist and are non-empty", () => {
    const mandatoryFiles = ["README.md", "LICENSE", "AGENTS.md"];
    for (const file of mandatoryFiles) {
      const fullPath = path.join(consoleRoot, file);
      expect(fs.existsSync(fullPath), `Mandatory document missing: ${file}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size, `Mandatory document ${file} is unexpectedly empty`).toBeGreaterThan(100);
    }
  });

  it("verifies AGENTS.md adheres to the Linux Foundation / AAIF standard structure", () => {
    const agentsPath = path.join(consoleRoot, "AGENTS.md");
    expect(fs.existsSync(agentsPath)).toBe(true);
    const content = fs.readFileSync(agentsPath, "utf-8");

    const requiredSections = [
      "Project Overview & Architecture",
      "Essential Commands",
      "Branching Strategy & Boundaries",
      "Definition of Done",
    ];

    for (const section of requiredSections) {
      expect(content, `AGENTS.md missing required AAIF section: "${section}"`).toContain(section);
    }
  });

  it("validates that all relative markdown links and image references in console resolve correctly", () => {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const imgPattern = /!\[([^\]]*)\]\(([^)]+)\)/g;

    function scanMarkdownFiles(dir: string): string[] {
      let results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || ["node_modules", "dist", "coverage"].includes(entry.name)) {
          continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(scanMarkdownFiles(fullPath));
        } else if (entry.name.endsWith(".md")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const mdFiles = scanMarkdownFiles(consoleRoot);
    expect(mdFiles.length).toBeGreaterThan(0);

    let totalCheckedLinks = 0;

    for (const filePath of mdFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      const dir = path.dirname(filePath);

      // Check relative links
      let match;
      while ((match = linkPattern.exec(content)) !== null) {
        const rawTarget = match[2].trim();
        if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://") || rawTarget.startsWith("#") || rawTarget.startsWith("mailto:")) {
          continue;
        }
        const cleanTarget = rawTarget.split("#")[0].split("?")[0];
        if (!cleanTarget || cleanTarget.startsWith("<") || cleanTarget.includes("$")) {
          continue;
        }

        const resolvedPath = path.resolve(dir, cleanTarget);
        expect(
          fs.existsSync(resolvedPath),
          `Broken relative link in ${path.relative(consoleRoot, filePath)}: "${rawTarget}" -> "${resolvedPath}"`
        ).toBe(true);
        totalCheckedLinks++;
      }

      // Check image references
      while ((match = imgPattern.exec(content)) !== null) {
        const rawTarget = match[2].trim();
        if (rawTarget.startsWith("http://") || rawTarget.startsWith("https://")) {
          continue;
        }
        const cleanTarget = rawTarget.split("?")[0];
        const resolvedPath = path.resolve(dir, cleanTarget);
        expect(
          fs.existsSync(resolvedPath),
          `Broken image reference in ${path.relative(consoleRoot, filePath)}: "${rawTarget}" -> "${resolvedPath}"`
        ).toBe(true);
      }
    }

    expect(totalCheckedLinks).toBeGreaterThan(0);
  });
});
