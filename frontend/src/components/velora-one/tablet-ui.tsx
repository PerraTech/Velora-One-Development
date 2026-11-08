import type { ReactNode } from "react";
import { roomStatuses } from "@/lib/velora-one/mock-data";
import type { RoomStatus } from "@/lib/velora-one/types";

export function StatusPill({ status }: { status: RoomStatus }) {
  return <span className="one-status" data-status={status}><span aria-hidden="true" />{roomStatuses[status]}</span>;
}
export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="one-panel"><div className="one-panel-heading"><h3>{title}</h3>{action}</div>{children}</section>;
}
export function StatCard({ label, value, detail }: { label: string; value: number | string; detail: string }) {
  return <div className="one-stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}
