# VELORA Internal Development Portal

Premium frontenddemo voor het VELORA hospitality ecosysteem, gebouwd met Next.js App Router, TypeScript, Tailwind CSS en Lucide React.

## Projectanalyse en behoud

De oorspronkelijke projectmap bevatte alleen:
- `Docs/`: 14 bestanden met specificaties, plannen, chatnotities en CAD-modellen.
- `Fotos/`: 20 JPEG-conceptbeelden en één MP4.

Er was nog geen applicatie, packageconfiguratie of bestaande code. De 35 originele bestanden zijn behouden en met SHA-256 gecontroleerd. De frontend bevat alleen kopieën van zes geschikte afbeeldingen; documenten, chats en video worden niet publiek geserveerd.

## Installeren en starten

Vereist: Node.js 20.9 of hoger (getest met 22.19) en npm.

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. De root verwijst naar `/login`.

### Google Drive / Windows

De installatie rechtstreeks op de gesynchroniseerde H:-schijf gaf in deze omgeving schrijffouten (`TAR_ENTRY_ERROR` / `EBADF`). Gebruik in dat geval vanuit `frontend/`:

```powershell
.\run-local.ps1
```

Dit kopieert de frontend naar `%LOCALAPPDATA%\VELORA\portal-local`, installeert daar de pakketten met `npm ci` en start de developmentserver. `Docs/` en `Fotos/` worden niet meegenomen. De originele broncode blijft in deze projectmap. Stop na bronwijzigingen met Ctrl+C en start het script opnieuw om wijzigingen over te nemen.

Andere controles via hetzelfde script:

```powershell
.\run-local.ps1 -Mode build
.\run-local.ps1 -Mode typecheck
.\run-local.ps1 -Mode start
```

`start` vereist eerst een geslaagde `build`.

### Productiebuild op een gewone lokale schijf

```powershell
npm run build
npm run typecheck
npm run start
```

`npm run build` compileert de applicatie en controleert TypeScript. `npm run typecheck` voert de zelfstandige TypeScript-controle uit. Er zijn geen omgevingsvariabelen of secrets nodig.

## Demo en routes

De login gebruikt zowel lokaal als in de online Netlify-productionbuild dezelfde demo-login met deze fictieve testaccounts:

| E-mailadres | Wachtwoord | Rol in het portaal |
| --- | --- | --- |
| `admin@velora.com` | `Velora@Admin2026!` | Administrator |
| `developer@velora.com` | `Velora@Dev2026!` | Developer |

Alleen een exact overeenkomend account wordt doorgestuurd naar `/portal`. Spaties rond het e-mailadres worden verwijderd; het wachtwoord wordt exact gecontroleerd. Lege velden en onjuiste gegevens tonen toegankelijke foutmeldingen in de bestaande stijl. Tijdens de gesimuleerde wachttijd zijn de velden en inlogknop uitgeschakeld. De wachtwoordknop schakelt de zichtbaarheid.

Alleen het e-mailadres wordt in `sessionStorage` bewaard, zodat de bijbehorende rol en het e-mailadres na verversen en op modulepagina's zichtbaar blijven. De rol is uitsluitend een weergavelabel en geeft geen rechten. Wachtwoorden worden niet in browseropslag opgeslagen of verzonden. Uitloggen verwijdert de lokale accountkeuze en navigeert naar `/login`. De oude testaccounts worden niet meer geaccepteerd; een oude accountkeuze in browseropslag wordt niet hersteld.

**Dit is uitsluitend demo-authenticatie en biedt geen beveiliging.** De credentials staan bewust leesbaar in de frontendbroncode en de productie-JavaScriptbundel en zijn niet veilig of geheim. De testaccounts zijn openbare, fictieve frontenddata. De demo-login werkt ook via `npm run build` / `npm run start` en op Netlify. Er is geen backend, database of servervalidatie. Alle portaalroutes blijven direct toegankelijk; browseropslag en eventuele client-side routecontrole zijn aanpasbaar en vormen geen toegangsbeveiliging. **Toegang tot de Netlify-site moet afzonderlijk via Netlify Visitor Access worden afgeschermd.** De demo-login configureert die bescherming niet en mag niet als beveiligingsmaatregel worden beschouwd.

| Route | Pagina |
| --- | --- |
| `/login` | VELORA CONNECT lokale mock-login |
| `/portal` | Development hub |
| `/portal/manager-dashboard` | Manager Dashboard |
| `/portal/velora-one` | VELORA ONE Tablet |
| `/previews/velora-one` | Interactieve VELORA ONE Tablet-frontenddemo |
| `/portal/housekeeping` | Housekeeping App |
| `/portal/guest-wall-panel` | Guest Wall Panel |
| `/portal/smart-dispensers` | Smart Dispensers |
| `/portal/velora-air` | VELORA AIR |
| `/portal/velora-dock` | VELORA DOCK |

VELORA ONE Tablet heeft status `preview` en een interactieve frontend via `/previews/velora-one` en de knop **Open Tablet Simulator** op de modulepagina. De zes overige modules hebben status `planned`. Alle modulepagina's, conceptgalerijen en terugnavigatie zijn behouden. Er is geen backend, database, echte authenticatie of hardwarekoppeling. Zie [de frontend-README](frontend/README.md) voor de demo, gewijzigde bestanden, beperkingen en tests.

## Structuur en design

- `frontend/src/app/`: App Router-pagina's, metadata, 404 en globale CSS.
- `frontend/src/components/`: herbruikbare merkweergave, mock-login, shell, modulekaarten, badges, footer en teruglink.
- `frontend/src/lib/modules.ts`: centrale mockdata voor zeven modules.
- `frontend/src/lib/mock-login.ts`: fictieve demoaccounts voor lokale en online builds en accountkeuze in browseropslag.
- `frontend/public/images/`: zes lokale conceptbeelden.
- `frontend/run-local.ps1`: lokale Windows-startoptie voor gesynchroniseerde schijven.
- `backend/README.md`: gereserveerd voor toekomstige ontwikkeling.

De centrale design tokens staan in `frontend/src/app/globals.css` onder `@theme` en `:root`. Tailwind CSS 4 wordt geladen via de PostCSS-plugin. Het ontwerp gebruikt zwart/antraciet, champagnegoud, een transparant loginpaneel, zachte verlichting en systeemlettertypen zonder externe fontdownloads. Het merkteken is een vereenvoudigde SVG-vertaling van de conceptreferenties.

## Herkomst assets

Alle onderstaande originelen staan in `Fotos/` en zijn ongewijzigd:

| Kopie in public/images | Origineel |
| --- | --- |
| connect-concept.jpeg | WhatsApp Image 2026-11-07 at 18.09.27 (1).jpeg |
| tablet-concept.jpeg | WhatsApp Image 2026-11-07 at 16.14.29.jpeg |
| housekeeping-concept.jpeg | WhatsApp Image 2026-11-05 at 18.30.58.jpeg |
| wall-panel-concept.jpeg | WhatsApp Image 2026-11-07 at 16.07.06.jpeg |
| air-concept.jpeg | WhatsApp Image 2026-11-07 at 18.09.39.jpeg |
| dock-concept.jpeg | WhatsApp Image 2026-11-07 at 18.41.41.jpeg |

## Verificatie

De eerdere controles hieronder zijn historisch: de blokkade van demoaccounts in productie is inmiddels verwijderd. Dezelfde fictieve accounts werken nu ook in de Netlify-demo; echte toegangsbeperking blijft afzonderlijk bij Netlify Visitor Access.

Online demo-login (8 november 2026): lint, TypeScript, production build en drie gerichte logictests geslaagd. Chrome-controle tegen de lokale productionbuild: beide demoaccounts, lege/onjuiste gegevens, wachtwoordzichtbaarheid, loadingstatus, navigatie naar `/portal`, sessiebehoud na herladen, openen van de VELORA ONE Tablet Simulator en logout geslaagd, zonder JavaScript-runtimefouten. De testcommando's staan in `frontend/README.md`.

Account- en rolwijziging (8 november 2026): beide nieuwe accounts, rol en e-mailadres, sessieherstel en uitloggen gecontroleerd. Oude accounts en oude opgeslagen accountkeuzes worden geweigerd. Onjuiste/lege gegevens en uitgeschakelde productieaccounts zijn gecontroleerd. De nieuwe credentials ontbreken in de productie-JavaScriptbundels. TypeScript-controle geslaagd; geen visuele browsercontrole uitgevoerd.

Mock-loginwijziging (8 november 2026):
- `npm run build` en `npm run typecheck`: geslaagd, zonder TypeScript- of buildfouten. Next.js meldt alleen de bestaande waarschuwing over meerdere lockfiles.
- Geautomatiseerde logica- en formuliercontroles: beide accounts, exacte wachtwoordcontrole, lege velden, foutieve gegevens, loadingstatus, navigatie naar `/portal`, sessieherstel en uitloggen geslaagd. Ook geblokkeerde browseropslag en uitgeschakelde productieaccounts gecontroleerd.
- Gegenereerde login-HTML bevat de verwijderde teksten niet meer en behoudt `v0.1`. De fictieve accountgegevens ontbreken in de JavaScriptbundels van de productiebuild.
- Geen visuele browsercontrole uitgevoerd voor deze wijziging; de bestaande centrering, achtergrond, kleuren, typografie en paneelstyling zijn behouden.

Eerdere verificatie van de oorspronkelijke frontend, voor de mock-loginwijziging (de demo-navigatie hieronder is vervangen):
- Next.js-productiebuild en zelfstandige TypeScript-controle: geslaagd. Het meegeleverde Windows-startscript is ook gecontroleerd: productiebuild geslaagd; developmentserver levert HTTP 200 op /login en /portal.
- Chrome-browsercontrole: rootredirect, lege velden, wachtwoord tonen/verbergen, demo-navigatie, zeven moduleroutes met teruglinks en onbekende module (404): geslaagd.
- Geen horizontale overflow op login, hub en modulepagina bij 320, 390 en 768 pixels; desktop gecontroleerd op 1440 pixels.
- Alle zeven kaartafbeeldingen laden; geen JavaScript-runtimefouten tijdens de browsercontrole.
- Alle 35 originele bestanden in Docs/ en Fotos/ hebben dezelfde SHA-256-controlesommen.

## Aangemaakte bestanden

```text
README.md
backend/README.md
frontend/.gitignore
frontend/README.md
frontend/package.json
frontend/package-lock.json
frontend/tsconfig.json
frontend/next-env.d.ts
frontend/next.config.ts
frontend/postcss.config.mjs
frontend/run-local.ps1
frontend/public/images/air-concept.jpeg
frontend/public/images/connect-concept.jpeg
frontend/public/images/dock-concept.jpeg
frontend/public/images/housekeeping-concept.jpeg
frontend/public/images/tablet-concept.jpeg
frontend/public/images/wall-panel-concept.jpeg
frontend/src/app/globals.css
frontend/src/app/layout.tsx
frontend/src/app/page.tsx
frontend/src/app/not-found.tsx
frontend/src/app/login/page.tsx
frontend/src/app/portal/page.tsx
frontend/src/app/portal/[slug]/page.tsx
frontend/src/components/brand.tsx
frontend/src/components/login-form.tsx
frontend/src/components/module-card.tsx
frontend/src/components/portal-shell.tsx
frontend/src/components/ui.tsx
frontend/src/lib/modules.ts
frontend/src/lib/mock-login.ts
```
