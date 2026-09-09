import { hasPermission } from "./permissions";
type Actor = { id: string; role: string };
type FileContext = { deletedAt: Date | null; caseId: string | null; case?: { assignedToId: string } | null };
export function canReadFile(user: Actor, file: FileContext) {
  if (file.deletedAt) return false;
  if (hasPermission(user.role, "manageFiles")) return true;
  return !!file.caseId && !!file.case && (user.role !== "EMPLOYEE" || file.case.assignedToId === user.id);
}
export function canDeleteFile(user: Actor, file: Pick<FileContext, "deletedAt">) {
  return !file.deletedAt && hasPermission(user.role, "manageFiles");
}
