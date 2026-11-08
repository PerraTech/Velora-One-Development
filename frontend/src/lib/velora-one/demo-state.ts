import { createDemoState } from "./mock-data";
import type { DemoAction, DemoState, HousekeepingTask } from "./types";

export function canComplete(task: HousekeepingTask) {
  return task.status === "active" && task.checklist.every(item => item.checked);
}

/** Pure domeinlogica. Een toekomstige API-adapter kan dezelfde acties gebruiken. */
export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === "reset") return createDemoState();
  if (action.type === "resolve") return { ...state, requests: state.requests.map(request => request.id === action.requestId ? { ...request, resolved: true } : request) };
  if (action.type === "check") return { ...state, tasks: state.tasks.map(task => task.id === action.taskId && task.status === "active" ? { ...task, checklist: task.checklist.map(item => item.id === action.itemId ? { ...item, checked: !item.checked } : item) } : task) };
  if (action.type === "task-status") {
    const task = state.tasks.find(item => item.id === action.taskId);
    const room = state.rooms.find(item => item.id === task?.roomId);
    if (!task || !room || room.status === "dnd") return state;
    const valid = action.status === "active" ? task.status === "pending" || task.status === "paused"
      : action.status === "paused" ? task.status === "active"
      : action.status === "completed" ? canComplete(task) : false;
    if (!valid) return state;
    return { ...state,
      tasks: state.tasks.map(item => item.id === task.id ? { ...item, status: action.status } : item),
      rooms: state.rooms.map(item => item.id === room.id ? { ...item, status: action.status === "completed" ? "clean" : "cleaning" } : item),
    };
  }
  if (action.type === "room-status") {
    // Schoonmaak afronden verloopt via de checklist; Gereed is ook handmatig te kiezen.
    return { ...state, rooms: state.rooms.map(room => room.id === action.roomId ? { ...room, status: action.status } : room),
      tasks: state.tasks.map(task => task.roomId !== action.roomId ? task : {
        ...task, status: action.status === "clean" ? "completed" : action.status === "cleaning" ? "active" : action.status === "dnd" && (task.status === "active" || task.status === "paused") ? "paused" : "pending",
        checklist: task.checklist.map(item => ({ ...item, checked: action.status === "clean" ? true : task.status === "completed" ? false : item.checked })),
      }),
    };
  }
  return state;
}

export function getStatistics(state: DemoState) {
  const clean = state.rooms.filter(room => room.status === "clean").length;
  return { clean, total: state.rooms.length, progress: Math.round(clean / state.rooms.length * 100),
    active: state.tasks.filter(task => task.status === "active").length,
    remaining: state.tasks.filter(task => task.status !== "completed").length,
    requests: state.requests.filter(request => !request.resolved).length };
}
