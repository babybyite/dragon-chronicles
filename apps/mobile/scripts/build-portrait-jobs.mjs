import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(here, "portrait-generation.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const jobs = [];

for (const sex of config.sexes) {
  for (const [origin, originDescription] of Object.entries(config.origins)) {
    for (const visualBloodline of config.visualBloodlines) {
      for (let identity = 1; identity <= config.identitiesPerGroup; identity += 1) {
        const chainId = `${origin}-${sex}-${visualBloodline}-${String(identity).padStart(2, "0")}`;

        for (const age of config.ages) {
          const relativeOutput = path.join(
            sex,
            origin,
            visualBloodline,
            `chain-${String(identity).padStart(2, "0")}`,
            `age-${String(age).padStart(2, "0")}.${config.canvas.format}`
          );

          const promptParts = [
            config.style,
            `${sex} character, age ${age}`,
            originDescription,
            config.ageRules[String(age)],
            "This image belongs to a six-image ageing chain. Preserve the same facial identity, bone structure, eye spacing, nose, mouth, and distinguishing features across every age.",
            visualBloodline === "atlantis" ? config.atlantis.description : "No magical glow or supernatural visual effects.",
            `Identity seed label: ${chainId}.`
          ];

          jobs.push({
            chainId,
            age,
            sex,
            origin,
            visualBloodline,
            output: path.join(config.outputRoot, relativeOutput).replaceAll("\\", "/"),
            prompt: promptParts.join(" ")
          });
        }
      }
    }
  }
}

const outputPath = path.join(here, "portrait-jobs.json");
fs.writeFileSync(outputPath, `${JSON.stringify(jobs, null, 2)}\n`);

console.log(`Created ${jobs.length} portrait jobs at ${outputPath}`);
console.log(`Chains: ${jobs.length / config.ages.length}`);
