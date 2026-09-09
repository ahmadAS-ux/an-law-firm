import { PrismaClient } from "@prisma/client";
import { seedReference } from "./reference";
import { seedDemo } from "./demo";
import { resetPolicy } from "./reset-policy";
const db = new PrismaClient();
async function main() {
  switch (process.argv[2]) {
    case "reference": await seedReference(db); break;
    case "demo": { const result = await seedDemo(db); console.log(`Demo seed finished; retained audit users: ${result.retained.length}`); break; }
    case "reset": await resetPolicy(db, process.env.POLICY_RESET_ACTOR ?? ""); break;
    default: throw new Error("Expected reference, demo, or reset");
  }
}
main().catch((e: unknown) => { console.error(e instanceof Error ? e.message : "Seed failed"); process.exitCode = 1; }).finally(() => db.$disconnect());
