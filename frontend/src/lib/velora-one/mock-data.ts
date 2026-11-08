import type { DemoState, Employee, RoomStatus } from "./types";

export const hotel = { name: "Hotel Duinzicht", location: "Noordwijk · Fictief demo-hotel", shift: "Ochtenddienst · 08:00–16:00" };
export const employees: Employee[] = [
  { id: "emma", name: "Emma de Vries", role: "Housekeeping" },
  { id: "noah", name: "Noah Bakker", role: "Housekeeping" },
  { id: "sara", name: "Sara Visser", role: "Supervisor" },
];
export const roomStatuses: Record<RoomStatus, string> = { dirty: "Schoonmaak nodig", cleaning: "In uitvoering", clean: "Gereed", dnd: "Niet storen" };
export const taskStatuses = { pending: "Te starten", active: "Bezig", paused: "Gepauzeerd", completed: "Afgerond" };

/** Fabriek levert een nieuwe dataset; nooit gedeelde mockobjecten muteren. */
export function createDemoState(): DemoState {
  const statuses: RoomStatus[] = ["clean", "dirty", "dirty", "dnd", "clean", "dirty"];
  const rooms = [1, 2, 3].flatMap(floor => statuses.map((status, index) => ({
    id: `${floor}0${index + 1}`, floor, status, type: index === 5 ? "Junior suite" : "Deluxe kamer",
    employeeId: floor === 2 ? "noah" : "emma",
    supplies: { shampoo: 20 + index * 12, showerGel: 30 + index * 10, handSoap: 65 - index * 8 },
    note: index === 2 ? "Vertrekkamer · aankomst nieuwe gast om 15:00." : index === 3 ? "Verblijfkamer · controleer de gekozen kamerstatus vóór binnenkomst." : "Dagelijkse schoonmaak · controleer de badkamerartikelen.",
  })));
  return {
    rooms,
    tasks: rooms.map(room => ({
      id: `task-${room.id}`, roomId: room.id, title: room.id.endsWith("3") ? "Vertrekschoonmaak" : "Dagelijkse schoonmaak",
      status: room.status === "clean" ? "completed" : "pending",
      checklist: ["Bed opmaken en linnengoed vervangen", "Badkamer reinigen", "Handdoeken en toiletartikelen aanvullen", "Vloer stofzuigen", "Eindcontrole uitvoeren"].map((label, index) => ({ id: `${room.id}-${index}`, label, checked: room.status === "clean" })),
    })),
    requests: [
      { id: "req-1", roomId: "103", title: "Extra handdoeken", description: "Graag twee extra badhanddoeken bij de kamer afleveren.", time: "09:15", priority: "high", resolved: false },
      { id: "req-2", roomId: "206", title: "Kussen aanvragen", description: "De gast ontvangt graag een extra zacht kussen.", time: "09:28", priority: "normal", resolved: false },
      { id: "req-3", roomId: "302", title: "Toiletartikelen aanvullen", description: "Shampoo en douchegel aanvullen bij de volgende schoonmaak.", time: "09:40", priority: "normal", resolved: false },
    ],
  };
}
