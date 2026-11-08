export type RoomStatus = "dirty" | "cleaning" | "clean" | "dnd";
export type TaskStatus = "pending" | "active" | "paused" | "completed";
export interface Employee { id: string; name: string; role: string }
export interface Room { id: string; floor: number; type: string; status: RoomStatus; employeeId: string; note: string; supplies: { shampoo: number; showerGel: number; handSoap: number } }
export interface ChecklistItem { id: string; label: string; checked: boolean }
export interface HousekeepingTask { id: string; roomId: string; title: string; status: TaskStatus; checklist: ChecklistItem[] }
export interface GuestRequest { id: string; roomId: string; title: string; description: string; time: string; priority: "normal" | "high"; resolved: boolean }
export interface DemoState { rooms: Room[]; tasks: HousekeepingTask[]; requests: GuestRequest[] }
export type DemoAction =
  | { type: "task-status"; taskId: string; status: TaskStatus }
  | { type: "check"; taskId: string; itemId: string }
  | { type: "room-status"; roomId: string; status: RoomStatus }
  | { type: "resolve"; requestId: string }
  | { type: "reset" };
