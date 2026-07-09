import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const infra = resolve(root, "infra");
const target = resolve(root, ".env.local");

let raw;
try {
  raw = execFileSync("terraform", ["output", "-raw", "dotenv_local"], {
    cwd: infra,
    encoding: "utf8",
  });
} catch {
  console.error(
    "Could not read Terraform output. Run `terraform apply` in ./infra first, or make sure terraform is on PATH.",
  );
  process.exit(1);
}

writeFileSync(target, raw.endsWith("\n") ? raw : `${raw}\n`);
console.log(`Wrote ${target} from Terraform outputs. Run: npm run dev`);
