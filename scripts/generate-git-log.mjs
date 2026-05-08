import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";

mkdirSync("src/data", { recursive: true });

try {
  execSync("git fetch --unshallow", { encoding: "utf-8" });
} catch {}

const output = execSync(
  "git log --date=format:%Y-%m-%d --format='%ad %s' -45",
  { encoding: "utf-8" },
);

writeFileSync(
  "src/data/git-log.json",
  JSON.stringify(output.split("\n").filter(Boolean)),
);
