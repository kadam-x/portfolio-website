import { execSync } from "child_process";
import { writeFileSync } from "fs";

const output = execSync(
  "git log --date=format:%Y-%m-%d --format='%ad %s' -45",
  { encoding: "utf-8" },
);

writeFileSync(
  "src/data/git-log.json",
  JSON.stringify(output.split("\n").filter(Boolean)),
);
