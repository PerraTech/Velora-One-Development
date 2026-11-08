"use client";

import { useId, useReducer, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bell, Check, ClipboardList, DoorOpen, Home, Layers, RotateCcw, Settings, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { createDemoState, employees, hotel, roomStatuses, taskStatuses } from "@/lib/velora-one/mock-data";
import { canComplete, demoReducer, getStatistics } from "@/lib/velora-one/demo-state";
import type { GuestRequest, RoomStatus } from "@/lib/velora-one/types";
import { Panel, StatCard, StatusPill } from "./tablet-ui";
import "./tablet.css";

type Screen = "home" | "rooms" | "detail" | "tasks" | "requests" | "settings";
const navigation = [
  { id: "home", label: "Overzicht", icon: Home }, { id: "rooms", label: "Kamers", icon: Layers },
  { id: "tasks", label: "Taken", icon: ClipboardList }, { id: "requests", label: "Verzoeken", icon: Bell },
  { id: "settings", label: "Instellingen", icon: Settings },
] as const;
const titles: Record<Screen, string> = { home: "Een frisse start, elke kamer.", rooms: "Kameroverzicht", detail: "Kamerdetails", tasks: "Housekeepingtaken", requests: "Gastverzoeken", settings: "Instellingen" };

export function TabletApp() {
  const [state, dispatch] = useReducer(demoReducer, undefined, createDemoState);
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedRoom, setSelectedRoom] = useState("103");
  const [floor, setFloor] = useState("all");
  const [filter, setFilter] = useState<RoomStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState("open");
  const [taskFilter, setTaskFilter] = useState("open");
  const [employeeId, setEmployeeId] = useState("emma");
  const [largeText, setLargeText] = useState(false);
  const [notice, setNotice] = useState("Welkom in de VELORA ONE demo.");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prefix = useId();
  const stats = getStatistics(state);
  const employee = employees.find(person => person.id === employeeId)!;
  const room = state.rooms.find(item => item.id === selectedRoom)!;
  const task = state.tasks.find(item => item.roomId === selectedRoom)!;
  const roomRequests = state.requests.filter(request => request.roomId === room.id);

  function navigate(next: Screen) {
    setScreen(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  function openRoom(id: string) { setSelectedRoom(id); navigate("detail"); }
  function resolve(request: GuestRequest) { dispatch({ type: "resolve", requestId: request.id }); setNotice(`${request.title} voor kamer ${request.roomId} is afgehandeld.`); }

  function requestCard(request: GuestRequest) {
    return <article className="one-request" key={request.id}>
      <div className="one-row"><span className="one-kicker">Kamer {request.roomId} · {request.time}</span><span className={request.priority === "high" ? "one-priority" : "one-muted"}>{request.resolved ? "Afgehandeld" : request.priority === "high" ? "Prioriteit" : "Normaal"}</span></div>
      <h4>{request.title}</h4><p>{request.description}</p>
      <div className="one-actions"><button className="one-button" onClick={() => openRoom(request.roomId)}>Bekijk kamer <ArrowRight size={16} aria-hidden="true" /></button>
        {!request.resolved && <button className="one-button one-primary" onClick={() => resolve(request)}><Check size={16} aria-hidden="true" />Afhandelen</button>}</div>
    </article>;
  }

  return <div className={`one-app${largeText ? " one-large-text" : ""}`}>
    <header className="one-header"><div className="one-brand"><Brand compact /><span>ONE</span></div><div className="one-hotel"><strong>{hotel.name}</strong><small>{hotel.location}</small></div><span className="one-demo">DEMO · Gesimuleerd</span></header>
    <div className="one-workspace">
      <nav className="one-nav" aria-label="Tabletnavigatie">{navigation.map(item => <button key={item.id} aria-current={(screen === item.id || screen === "detail" && item.id === "rooms") ? "page" : undefined} onClick={() => navigate(item.id)}><item.icon size={22} aria-hidden="true" /><span>{item.label}</span>{item.id === "requests" && stats.requests > 0 && <b>{stats.requests}</b>}</button>)}<div className="one-shift"><span className="one-avatar">{employee.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</span><strong>{employee.name}</strong><small>{employee.role}</small></div></nav>
      <div className="one-content">
        <div className="one-page-heading"><div><p className="one-kicker">{hotel.shift}</p><h2 ref={headingRef} tabIndex={-1}>{screen === "detail" ? `Kamer ${room.id}` : titles[screen]}</h2></div><span className="one-muted">VELORA ONE</span></div>
        {screen === "home" && <>
          <div className="one-stats"><StatCard label="Kamers gereed" value={`${stats.clean}/${stats.total}`} detail="Alle verdiepingen" /><StatCard label="In uitvoering" value={stats.active} detail="Actieve schoonmaaktaken" /><StatCard label="Open taken" value={stats.remaining} detail="Inclusief niet storen" /><StatCard label="Gastverzoeken" value={stats.requests} detail="Wachten op afhandeling" /></div>
          <div className="one-dashboard"><Panel title="Vandaag maken we het verschil" action={<Sparkles size={23} aria-hidden="true" />}><p className="one-muted">Schoonmaakvoortgang van het hotel</p><div className="one-progress-label"><strong>{stats.progress}%</strong><span>{stats.clean} van {stats.total} kamers gereed</span></div><progress value={stats.clean} max={stats.total} aria-label="Schoonmaakvoortgang" /><div className="one-floor-list">{[1, 2, 3].map(number => { const rooms = state.rooms.filter(item => item.floor === number); return <button key={number} onClick={() => { setFloor(String(number)); setFilter("all"); setSearch(""); navigate("rooms"); }}><Layers size={18} aria-hidden="true" /><span>Verdieping {number}</span><strong>{rooms.filter(item => item.status === "clean").length}/{rooms.length} gereed</strong><ArrowRight size={16} aria-hidden="true" /></button>; })}</div></Panel>
            <Panel title="Eerstvolgende kamer"><p className="one-muted">Pak een openstaande schoonmaaktaak op.</p>{(() => { const next = state.rooms.find(item => item.status === "dirty" || item.status === "cleaning"); return next ? <><div className="one-feature-room"><DoorOpen size={35} aria-hidden="true" /><strong>{next.id}</strong><StatusPill status={next.status} /></div><p>{next.type} · Verdieping {next.floor}</p><button className="one-button one-primary" onClick={() => openRoom(next.id)}>Naar kamerdetails <ArrowRight size={17} aria-hidden="true" /></button></> : <p>Alle beschikbare kamers zijn gereed. Controleer eventuele niet-storen kamers.</p>; })()}</Panel></div>
          <Panel title="Open gastverzoeken" action={<button className="one-button" onClick={() => navigate("requests")}>Alle verzoeken <ArrowRight size={16} aria-hidden="true" /></button>}><div className="one-request-grid">{state.requests.filter(item => !item.resolved).slice(0, 2).map(requestCard)}{stats.requests === 0 && <p>Alle gastverzoeken zijn afgehandeld.</p>}</div></Panel>
        </>}
        {screen === "rooms" && <>
          <div className="one-filters"><label>Verdieping<select value={floor} onChange={event => setFloor(event.target.value)}><option value="all">Alle verdiepingen</option>{[1, 2, 3].map(number => <option key={number} value={number}>Verdieping {number}</option>)}</select></label><label>Kamer zoeken<input type="search" placeholder="Bijv. 103" value={search} onChange={event => setSearch(event.target.value)} /></label></div>
          <div className="one-chips" role="group" aria-label="Filter op kamerstatus">{(["all", ...Object.keys(roomStatuses)] as (RoomStatus | "all")[]).map(status => <button key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status === "all" ? "Alle kamers" : roomStatuses[status]} <span>{state.rooms.filter(item => (floor === "all" || item.floor === Number(floor)) && (status === "all" || item.status === status)).length}</span></button>)}</div>
          <div className="one-room-grid">{state.rooms.filter(item => (floor === "all" || item.floor === Number(floor)) && (filter === "all" || item.status === filter) && item.id.includes(search.trim())).map(item => <button className="one-room-card" key={item.id} onClick={() => openRoom(item.id)}><div className="one-row"><DoorOpen size={22} aria-hidden="true" /><small>Verdieping {item.floor}</small></div><strong>{item.id}</strong><span>{item.type}</span><StatusPill status={item.status} /><span className="one-room-footer">{state.requests.filter(request => request.roomId === item.id && !request.resolved).length} open verzoeken <ArrowRight size={16} aria-hidden="true" /></span></button>)}</div>
          {!state.rooms.some(item => (floor === "all" || item.floor === Number(floor)) && (filter === "all" || item.status === filter) && item.id.includes(search.trim())) && <p className="one-empty">Geen kamers gevonden. Pas de filters aan.</p>}
        </>}
        {screen === "detail" && <>
          <button className="one-button one-back" onClick={() => navigate("rooms")}><ArrowLeft size={16} aria-hidden="true" />Terug naar kamers</button>
          <div className="one-detail-grid"><Panel title={`${room.type} · Verdieping ${room.floor}`}><StatusPill status={room.status} /><p>{room.note}</p><p className="one-muted">Toegewezen aan {employees.find(item => item.id === room.employeeId)?.name}</p><label className="one-field">Kamerstatus<select value={room.status} onChange={event => { dispatch({ type: "room-status", roomId: room.id, status: event.target.value as RoomStatus }); setNotice(`Status kamer ${room.id}: ${roomStatuses[event.target.value as RoomStatus]}.`); }}>{Object.entries(roomStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p className="one-hint">Handmatig op Gereed zetten rondt ook de checklist af. Niet storen blokkeert de schoonmaak.</p></Panel>
            <Panel title={task.title} action={<span className="one-muted">{taskStatuses[task.status]}</span>}><p className="one-muted">{task.checklist.filter(item => item.checked).length} van {task.checklist.length} stappen voltooid</p><div className="one-checklist">{task.checklist.map(item => <label key={item.id} htmlFor={`${prefix}-${item.id}`}><input id={`${prefix}-${item.id}`} type="checkbox" checked={item.checked} disabled={task.status !== "active" || room.status === "dnd"} onChange={() => dispatch({ type: "check", taskId: task.id, itemId: item.id })} /><span>{item.label}</span></label>)}</div><div className="one-actions">{(task.status === "pending" || task.status === "paused") && <button className="one-button one-primary" disabled={room.status === "dnd"} onClick={() => { dispatch({ type: "task-status", taskId: task.id, status: "active" }); setNotice(`Schoonmaak kamer ${room.id} gestart.`); }}>{task.status === "paused" ? "Taak hervatten" : "Schoonmaak starten"}</button>}{task.status === "active" && <><button className="one-button" onClick={() => { dispatch({ type: "task-status", taskId: task.id, status: "paused" }); setNotice(`Taak kamer ${room.id} gepauzeerd.`); }}>Pauzeren</button><button className="one-button one-primary" disabled={!canComplete(task)} onClick={() => { dispatch({ type: "task-status", taskId: task.id, status: "completed" }); setNotice(`Kamer ${room.id} is gereed. Goed gedaan!`); }}>Taak afronden <Check size={17} aria-hidden="true" /></button></>}</div>{room.status === "dnd" ? <p className="one-hint">Niet storen is actief. Wijzig eerst de kamerstatus om te starten.</p> : task.status === "active" && !canComplete(task) && <p className="one-hint">Vink alle stappen af om de taak af te ronden.</p>}</Panel></div>
          <Panel title="Badkamervoorraad · Gesimuleerd"><div className="one-supplies">{([["shampoo", "Shampoo"], ["showerGel", "Douchegel"], ["handSoap", "Handzeep"]] as const).map(([key, label]) => <div key={key}><div className="one-row"><span>{label}</span><strong>{room.supplies[key]}%</strong></div><progress value={room.supplies[key]} max={100} aria-label={`${label} voorraad`} /><small>{room.supplies[key] <= 30 ? "Bijvullen aanbevolen" : "Voldoende voorraad"}</small></div>)}</div><p className="one-hint">Fictieve niveaus ter illustratie; geen sensormetingen.</p></Panel>
          <Panel title="Verzoeken voor deze kamer"><div className="one-request-grid">{roomRequests.length ? roomRequests.map(requestCard) : <p className="one-muted">Geen gastverzoeken voor deze kamer.</p>}</div></Panel>
        </>}
        {screen === "tasks" && <><div className="one-chips" role="group" aria-label="Takenfilter">{[["open", "Open taken"], ["active", "Bezig"], ["paused", "Gepauzeerd"], ["completed", "Afgerond"], ["all", "Alle taken"]].map(([value, label]) => <button key={value} aria-pressed={taskFilter === value} onClick={() => setTaskFilter(value)}>{label}</button>)}</div><Panel title="Dagplanning"><div className="one-task-list">{state.tasks.filter(item => taskFilter === "all" || (taskFilter === "open" ? item.status !== "completed" : item.status === taskFilter)).map(item => <button key={item.id} onClick={() => openRoom(item.roomId)}><span className="one-task-number">{item.roomId}</span><span><strong>{item.title}</strong><small>{item.checklist.filter(check => check.checked).length}/{item.checklist.length} stappen · {state.rooms.find(room => room.id === item.roomId)?.status === "dnd" ? "Niet storen" : taskStatuses[item.status]}</small></span><ArrowRight size={20} aria-hidden="true" /></button>)}</div>{!state.tasks.some(item => taskFilter === "all" || (taskFilter === "open" ? item.status !== "completed" : item.status === taskFilter)) && <p>Geen taken in deze selectie.</p>}</Panel></>}
        {screen === "requests" && <><div className="one-chips" role="group" aria-label="Verzoekenfilter">{[["open", "Open"], ["resolved", "Afgehandeld"], ["all", "Alle verzoeken"]].map(([value, label]) => <button key={value} aria-pressed={requestFilter === value} onClick={() => setRequestFilter(value)}>{label}</button>)}</div><div className="one-request-grid">{state.requests.filter(item => requestFilter === "all" || (requestFilter === "resolved" ? item.resolved : !item.resolved)).map(requestCard)}</div>{!state.requests.some(item => requestFilter === "all" || (requestFilter === "resolved" ? item.resolved : !item.resolved)) && <p className="one-empty">Geen verzoeken in deze selectie.</p>}</>}
        {screen === "settings" && <div className="one-detail-grid"><Panel title="Jouw werkplek"><label className="one-field">Demomedewerker<select value={employeeId} onChange={event => { setEmployeeId(event.target.value); setNotice("Demomedewerker gewijzigd."); }}>{employees.map(person => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label><label className="one-setting"><span>Grotere tekst<small>Voor extra leesbaarheid op de tablet</small></span><input type="checkbox" checked={largeText} onChange={event => setLargeText(event.target.checked)} /></label><p className="one-hint">De medewerkerkeuze wijzigt de weergave van het profiel; kamerindelingen blijven zichtbaar voor het hele team.</p></Panel><Panel title="Over deze preview"><p>VELORA ONE · Frontenddemo v0.1</p><p className="one-muted">Alle kamers, medewerkers en verzoeken zijn fictief. Wijzigingen blijven alleen in het geheugen van deze demo en vervallen bij vernieuwen of verlaten van de pagina. De simulator en de volledige pagina hebben ieder hun eigen demosessie.</p><button className="one-button" onClick={() => { dispatch({ type: "reset" }); setNotice("Alle demogegevens zijn hersteld."); }}><RotateCcw size={17} aria-hidden="true" />Demogegevens herstellen</button></Panel></div>}
        <footer className="one-footer"><span>Gesimuleerde gegevens · Geen hardwareverbinding</span><span role="status" aria-live="polite" aria-atomic="true">{notice}</span></footer>
      </div>
    </div>
  </div>;
}
