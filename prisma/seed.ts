import { PrismaClient } from "@prisma/client";
import { seedReference } from "./seed/reference";
const db = new PrismaClient();
seedReference(db).catch(() => { console.error("Reference seed failed"); process.exitCode = 1; }).finally(() => db.$disconnect());
