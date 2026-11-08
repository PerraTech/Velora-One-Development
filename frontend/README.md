# VELORA frontend

Zie [de project-README](../README.md) voor installatie, routes, lokale mock-login, fictieve testaccounts en het bestandenoverzicht. De mock-login werkt uitsluitend via `npm run dev` en biedt geen echte authenticatie of beveiliging. De credentials staan leesbaar in de frontendbroncode en zijn niet veilig. Gebruik de testaccounts niet voor productie en vervang de mock-login door server-side authenticatie en autorisatie voordat de applicatie online wordt gepubliceerd.

Snel starten op Windows / Google Drive: voer in deze map .\run-local.ps1 uit.

## VELORA ONE Tablet-preview

Open `/previews/velora-one` voor de zelfstandige tabletfrontend. Via `/portal/velora-one` opent **Open Tablet Simulator** dezelfde `TabletApp` in een donker tabletframe. De modal ondersteunt Escape, een sluitknop, focusbegrenzing en focusherstel. **Open volledig scherm** navigeert naar de zelfstandige route.

De demo bevat 18 kamers op drie verdiepingen van het fictieve Hotel Duinzicht. Navigatie: dashboard, kamers met verdieping/status/zoekfilters, kamerdetails, taken, gastverzoeken en instellingen. Start een schoonmaaktaak, vink de checklist af, pauzeer of hervat en rond af. Dashboardcijfers reageren direct. Niet storen blokkeert taken. Een handmatige statuswijziging naar Gereed rondt de bijbehorende checklist af. Verzoeken kunnen worden afgehandeld en teruggelezen. Instellingen bieden profielkeuze, grotere tekst en het herstellen van de demogegevens.

Alle gegevens zijn gesimuleerd. De voorraadbalken zijn statische mockniveaus. State leeft uitsluitend in React; herladen en verlaten herstellen de data. De modal bewaart zijn eigen sessie tijdens sluiten/heropenen; de zelfstandige route start een aparte sessie. Er zijn geen API-aanroepen, backend-, authenticatie- of hardwarewijzigingen. Alleen VELORA ONE Tablet staat op `preview`; de zes overige modules blijven `planned`. Bestaande galerijen en modulekaarten blijven behouden.

Functionele referentie: `Docs/Velora_Connect_Ontwikkelspecificatie.pdf` (tablet, taken, DND, voorraad en verzoeken). Context: `Docs/Velora_One_Engineering_Handbook_V0_2.pdf`. Visuele referentie: het bestaande `public/images/tablet-concept.jpeg`. De interface gebruikt de bestaande VELORA-kleuren, merkcomponent en typografie.

### Gewijzigde en toegevoegde bestanden

| Bestand onder `frontend/` | Functie |
| --- | --- |
| `src/app/previews/velora-one/page.tsx` | Zelfstandige route en teruglink |
| `src/components/velora-one/tablet-app.tsx` | Gedeelde schermen, navigatie en lokale React-state |
| `src/components/velora-one/tablet-ui.tsx` | Herbruikbare panelen, statistieken en statuslabels |
| `src/components/velora-one/tablet-simulator.tsx` | Toegankelijke tabletmodal |
| `src/components/velora-one/tablet.css` | Afgeschermde tabletstyling en responsive frame |
| `src/lib/velora-one/types.ts` | Types voor kamers, taken, verzoeken, medewerkers en acties |
| `src/lib/velora-one/mock-data.ts` | Centrale fictieve dataset |
| `src/lib/velora-one/demo-state.ts` | Pure state-overgangen en afgeleide statistieken; los van UI en toekomstige API-adapters |
| `src/lib/modules.ts` | Alleen tabletstatus en previewpad aangepast |
| `src/components/module-detail.tsx` | Simulatorknop en passende previewtoelichting |
| `tests/velora-one-state.test.cjs` | Domein- en regressietests |
| `tests/velora-one-browser.mjs` | Chrome-interacties, responsive controle en modaltoegankelijkheid |
| `README.md` | Gebruik, structuur, beperkingen en controles |
| `../README.md` | Hoofdoverzicht bijgewerkt met previewroute en juiste modulestatussen |

### Controles

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
node --test tests/velora-one-state.test.cjs
```

Browsercontrole zonder extra packages (Windows met Chrome): start de productiebuild met `npm.cmd run start -- -p 3005` en voer in een tweede terminal `node tests/velora-one-browser.mjs` uit. Optioneel: `TEST_BASE_URL` en `CHROME_PATH` aanpassen. De browsertest gebruikt een tijdelijk profiel en schrijft screenshots naar de tijdelijke map. Hij controleert taakovergangen, checklistblokkering, DND, statistieken, verzoeken, instellingen/reset, overflow bij 320/390/768/1024/1440 pixels, modal-focus, Escape, sluiten, volledig-schermnavigatie, modulestatussen en bestaande routes.

De build kan de al bestaande Next.js-waarschuwing over meerdere lockfiles tonen. Er zijn geen dependencies toegevoegd.

Verificatie op 8 november 2026: lint, TypeScript en production build geslaagd; drie domeintests en de geautomatiseerde Chrome-browsercontrole geslaagd. Dashboard, kamerdetails en simulator zijn ook visueel via screenshots gecontroleerd. Voor Chrome was uitvoering buiten de processandbox nodig. De modal is getest met Tab, focusherstel en Escape; er is geen afzonderlijke screenreadertest uitgevoerd.
