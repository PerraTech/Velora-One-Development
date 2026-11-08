# VELORA frontend

Zie [de project-README](../README.md) voor installatie, routes, demo-login, fictieve testaccounts en het bestandenoverzicht. De demo-login werkt zowel via `npm run dev` als in de productionbuild op Netlify. Dit is uitsluitend demo-authenticatie en biedt geen beveiliging. De fictieve credentials staan bewust leesbaar in de frontendbundel. Toegang tot de Netlify-site moet afzonderlijk via Netlify Visitor Access worden afgeschermd; de demo-login regelt dit niet en verleent geen echte rechten.

Snel starten op Windows / Google Drive: voer in deze map .\run-local.ps1 uit.

Gerichte demo-logincontroles: `node --test tests/mock-login.test.cjs` test beide accounts met `NODE_ENV=production`, onjuiste gegevens, sessieherstel en logout. Start na `npm run build` een productionserver met `npm run start -- -p 3008`; voer in een tweede terminal `node tests/mock-login-browser.mjs` uit voor validatie, laden, wachtwoordzichtbaarheid, inloggen naar `/portal`, sessiebehoud, de Tablet Simulator en logout in Chrome. De browsertest gebruikt uitsluitend de bekende fictieve demoaccounts. `TEST_BASE_URL` kan een andere bereikbare demo-omgeving aanwijzen.

## Netlify-deployment

De repository bevat een `netlify.toml` in de projectroot. Die stelt `frontend` als base directory in, voert `npm run build` uit en gebruikt `.next` als publish directory. Het publishpad is relatief aan de base en komt dus uit op `frontend/.next` vanaf de repositoryroot. De bestaande Next.js-build en App Router blijven ongewijzigd.

De officiële `@netlify/plugin-nextjs`-runtime is expliciet geconfigureerd en staat in de frontend-devDependencies, met de geïnstalleerde versie in `frontend/package-lock.json`. Dit is de reguliere Netlify OpenNext-integratie. De handmatige activatie is hier nodig omdat de gemelde succesvolle deploy alleen de ruwe `.next`-bestanden uploadde, met nul functions en zonder runtimeverwerking. De log toont niet waarom automatische detectie eerder uitbleef; een uitgeschakelde runtime of skip-variabele kan alleen met de dashboardinstellingen worden vastgesteld. De runtime verzorgt de serverfunctie, Next.js-routing, prerendercache en image-optimalisatie. Er wordt geen statische export, SPA-fallback, aangepaste functions-map of handmatig standalone-output toegevoegd.

Controleer in Netlify **Project configuration > Developer settings > Continuous deployment > Build settings**:

| Instelling | Waarde |
| --- | --- |
| Repository | `PerraTech/Velora-One-Development` |
| Production branch | `main` |
| Base directory | `frontend` |
| Package directory | Leeg laten; dezelfde map als base |
| Build command | `npm run build` |
| Publish directory | `.next` relatief aan base; geen tweede `frontend/` toevoegen |
| Functions directory | Geen aangepaste map; door de adapter laten beheren |
| Node.js | 22.x is lokaal getest |

De rootconfiguratie bepaalt base, command, publish en de runtime; houd eventuele dashboardwaarden hiermee gelijk. Verwijder een eventueel ingestelde `NETLIFY_NEXT_PLUGIN_SKIP` uit de buildomgeving en de toepasselijke deploycontexten: `true` of `1` schakelt de adapter uit. Gebruik de huidige runtime v5, geen legacy v4. Een extra UI-installatie van dezelfde plugin is niet nodig bij de expliciete bestandsconfiguratie. Laat devDependencies tijdens de build installeren.

Na goedkeuring, commit en push: kies **Clear cache and deploy site** in Netlify. Controleer dat de log `Using Next.js Runtime` vermeldt, de adapterhooks uitvoert en de `___netlify-server-handler` bundelt. Voor deze app hoort er een serverfunctie te zijn, ook al worden pagina's vooraf gegenereerd. Alleen een geslaagde `next build` en een upload van `.next` zijn onvoldoende. Controleer daarna `/` (redirect naar `/login`), `/login`, `/portal/velora-one`, `/previews/velora-one` en de frontendassets. De demo-login werkt ook in de productionbuild; toegangsbeperking hoort bij Netlify Visitor Access.

Lokale controle vanuit de repositoryroot met een geïnstalleerde Netlify CLI: `netlify build --offline --dry` controleert de configuratie en de pluginvolgorde; `netlify build --offline` voert de build inclusief adapter uit zonder deploy. `.netlify/` bevat lokale status en gegenereerde adapterbestanden en is uitgesloten van Git. De ongebruikte lokale root-lockfile is eveneens uitgesloten; de deploy gebruikt de frontend-lockfile.

Bronnen: [Netlify Next.js/OpenNext](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/), [monorepo-instellingen](https://docs.netlify.com/build/configure-builds/monorepos/), [handmatige plugin-installatie](https://docs.netlify.com/extend/install-and-use/build-plugins/).

Verificatie op 8 november 2026: de actieve site-instellingen zijn alleen-lezen via de Netlify API gecontroleerd. Base `frontend`, build `npm run build`, publish `.next`, branch `main`, geen afwijkende package- of functions-map. Deze paden staan dus al correct. Lokaal zijn lint, TypeScript, drie bestaande statetests en `netlify build --offline` geslaagd. De CLI laadt runtime v5.16.6 en bundelt `___netlify-server-handler`. HTTP-controle met de lokale productionserver: `/` geeft 307 naar `/login`; `/login`, `/portal`, `/portal/velora-one`, `/previews/velora-one` en een bestaande afbeelding geven 200. De uiteindelijke cloudruntime moet na goedkeuring en herdeploy worden gecontroleerd; er is tijdens deze reparatie niets gepubliceerd.

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
