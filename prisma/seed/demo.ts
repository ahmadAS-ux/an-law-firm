import { Prisma, type PrismaClient } from "@prisma/client";
import { seedReference } from "./reference";

const targets = ["WorkLog", "Task", "File", "Matter", "Case", "Client", "User"];
type Row = { id: string; [key: string]: unknown };
type Delegate = {
  findMany(args: Record<string, unknown>): Promise<Row[]>;
  deleteMany(args: Record<string, unknown>): Promise<unknown>;
};
function delegate(tx: Prisma.TransactionClient, model: string): Delegate {
  return (tx as unknown as Record<string, Delegate>)[model[0].toLowerCase() + model.slice(1)];
}

// DMMF enumerates actual incoming relations, including future schema additions.
export async function cleanupDemo(db: PrismaClient) {
  if (process.env.ALLOW_DEMO_SEED !== "true") throw new Error("Demo seed disabled");
  return db.$transaction(async (tx) => {
    const marked = await tx.systemFlag.findUnique({ where: { key: "DEMO_DATABASE" } });
    const ids: Record<string, string[]> = {};
    for (const model of targets) {
      if (!marked && (await delegate(tx, model).findMany({ where: { isDemo: false }, take: 1 })).length) throw new Error("Non-disposable database");
      ids[model] = (await delegate(tx, model).findMany({ where: { isDemo: true }, select: { id: true } })).map((r) => r.id);
    }
    const audited = await tx.auditLog.findMany({ where: { userId: { in: ids.User } }, select: { userId: true }, distinct: ["userId"] });
    const retained = audited.map((r) => r.userId);
    ids.User = ids.User.filter((id) => !retained.includes(id));
    const blockers: string[] = [];
    for (const model of Prisma.dmmf.datamodel.models) {
      for (const relation of model.fields.filter((f) => f.kind === "object" && f.relationFromFields?.length && targets.includes(f.type))) {
        const targetIds = ids[relation.type];
        if (!targetIds.length) continue;
        if (relation.relationFromFields?.length !== 1 || relation.relationToFields?.[0] !== "id") throw new Error(`Unsupported cleanup relation: ${model.name}.${relation.name}`);
        if (model.name === "AuditLog") continue;
        if (model.name === "Notification" && relation.type === "User") continue;
        const field = relation.relationFromFields[0];
        const rows = await delegate(tx, model.name).findMany({ where: { [field]: { in: targetIds } }, select: { id: true } });
        // Only records participating in this same deletion transaction may reference targets.
        const protectedRows = rows.filter((row) => !(ids[model.name] ?? []).includes(row.id));
        blockers.push(...protectedRows.map((row) => `${model.name}.${field}:${row.id}`));
      }
    }
    if (blockers.length) throw new Error(`Protected incoming references: ${blockers.join(", ")}`);
    if (retained.length) await tx.user.updateMany({ where: { id: { in: retained }, isDemo: true }, data: { isActive: false } });
    await tx.notification.deleteMany({ where: { userId: { in: ids.User } } });
    for (const model of targets) await delegate(tx, model).deleteMany({ where: { id: { in: ids[model] }, isDemo: true } });
    return { retained };
  }, { isolationLevel: "Serializable", timeout: 30000 });
}

export async function seedDemo(db: PrismaClient) {
  const result = await cleanupDemo(db);
  const roles = await seedReference(db);
  const department = await db.department.findUniqueOrThrow({ where: { name: "Litigation" } });
  const stamp = Date.now();
  const users = [];
  for (const [name, roleId] of Object.entries(roles)) {
    users.push(await db.user.create({ data: { email: `${name.toLowerCase()}.${stamp}@example.invalid`, name: `Demo ${name}`, nameAr: `تجريبي ${name}`, roleId,
      role: name === "SYSTEM_ADMIN" ? "ADMIN" : name === "DEPARTMENT_MANAGER" ? "MANAGER" : name === "PARTNER" ? "PARTNER" : "EMPLOYEE",
      departmentId: department.id, isDemo: true } }));
  }
  const partner = users.find((u) => u.role === "PARTNER")!;
  const employee = users.find((u) => u.roleId === roles.EMPLOYEE)!;
  const client = await db.client.create({ data: { name: "Demo client", nameAr: "عميل تجريبي", createdById: partner.id, isDemo: true } });
  const legalCase = await db.case.create({ data: { caseNumber: `DEMO-${stamp}`, title: "Demo case", titleAr: "قضية تجريبية", status: "OPEN", priority: "MEDIUM", openDate: new Date(), clientId: client.id, assignedToId: employee.id, createdById: partner.id, departmentId: department.id, isDemo: true } });
  const matter = await db.matter.create({ data: { matterNumber: `DEMO-M-${stamp}`, title: "Demo matter", titleAr: "مسألة تجريبية", clientId: client.id, assignedToId: employee.id, departmentId: department.id, isDemo: true } });
  await db.task.create({ data: { title: "Demo task", titleAr: "مهمة تجريبية", status: "TODO", priority: "MEDIUM", caseId: legalCase.id, assignedToId: employee.id, createdById: partner.id, isDemo: true } });
  const workType = await db.workType.findFirst() ?? await db.workType.create({ data: { name: "General", nameAr: "عام" } });
  await db.workLog.create({ data: { userId: employee.id, clientId: client.id, caseId: legalCase.id, matterId: matter.id, workTypeId: workType.id, hours: 0.1, isBillable: true, date: new Date(), isDemo: true } });
  return { ...result, users, client, legalCase, matter };
}
