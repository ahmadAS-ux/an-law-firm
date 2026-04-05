import type { User, Client, Case, Task, WorkLog } from "@prisma/client";

export type { User, Client, Case, Task, WorkLog };

export type CaseStatus = "OPEN" | "ACTIVE" | "CLOSED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
