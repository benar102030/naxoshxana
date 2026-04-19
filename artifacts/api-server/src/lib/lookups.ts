import { db, patientsTable, staffTable, bedsTable } from "@workspace/db";
import { inArray } from "drizzle-orm";

export async function getPatientNameMap(
  ids: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const unique = Array.from(new Set(ids.filter((id) => id != null)));
  if (unique.length === 0) return map;
  const rows = await db
    .select({ id: patientsTable.id, fullName: patientsTable.fullName })
    .from(patientsTable)
    .where(inArray(patientsTable.id, unique));
  for (const r of rows) map.set(r.id, r.fullName);
  return map;
}

export async function getStaffNameMap(
  ids: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const unique = Array.from(new Set(ids.filter((id) => id != null)));
  if (unique.length === 0) return map;
  const rows = await db
    .select({ id: staffTable.id, fullName: staffTable.fullName })
    .from(staffTable)
    .where(inArray(staffTable.id, unique));
  for (const r of rows) map.set(r.id, r.fullName);
  return map;
}

export async function getBedLabelMap(
  ids: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const unique = Array.from(new Set(ids.filter((id) => id != null)));
  if (unique.length === 0) return map;
  const rows = await db
    .select()
    .from(bedsTable)
    .where(inArray(bedsTable.id, unique));
  for (const r of rows) {
    map.set(r.id, `${r.ward} / ${r.room} / ${r.bedNumber}`);
  }
  return map;
}
