# Solara Home Savings

Solara is an interactive home-energy savings advisor for the Cloover hackathon. It turns a complex upgrade decision into one guided flow: enter household details, configure solar/battery/heat pump/EV upgrades, and receive a proposal with estimated savings, financing timing, and installer next steps.

## Live Demo

[Open the Lovable demo](https://solara-home-savings.lovable.app/?step=landing)

## Product Flow

1. **Inputs**: select a predefined address, household size, heating type, monthly electricity cost, monthly heating cost, car type, and monthly car cost.
2. **Configuration**: compare the current setup with upgrade options for solar, battery, heat pump, and electric vehicle. Battery is available only when solar is selected.
3. **Final proposal**: review the approximate monthly saving, optimize financing and savings potential, download the savings plan, and contact a nearby installer for feasibility checks.

## Savings Model

The configurator asks for monthly customer spend, converts it internally to annual values for energy modelling, then presents the result back as a monthly saving. It applies simple hackathon-model assumptions:

- Solar only: 30% electricity cost reduction
- Solar + battery: 69% electricity cost reduction
- Heat pump: 34% oil heating reduction or 15% gas heating reduction
- EV: 75% mobility cost reduction

The proposal also explains the early financing period honestly: the customer may pay extra during the first years because of the installment, then savings improve once the plan reaches the modeled payback year.

## Free Data Sources

The app avoids paid Google APIs and uses free/open data where possible:

- **PVGIS API**: estimates yearly solar production per kWp from latitude and longitude. It is called server-side through `/api/free-energy-estimate` because PVGIS does not support browser AJAX/CORS access.
- **OpenStreetMap Nominatim**: turns the selected address into coordinates. The app only calls it after the user requests a calculation, not as live autocomplete.
- **OpenStreetMap Overpass**: looks up nearby building footprints and converts the largest plausible footprint into an approximate usable roof area.
- **Local fallback profiles**: if a public API is slow, unavailable, or cannot find a building, the model falls back to built-in Berlin/Germany estimates so the demo remains stable.

These estimates are intentionally approximate. Final pricing still needs installer validation, roof survey, tariff confirmation, and subsidy eligibility checks.

## Tech Stack

- React 19
- TanStack Start / TanStack Router
- Vite
- TypeScript
- Tailwind CSS
- Lucide React icons
- Lovable-connected deployment

## Local Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Then open the local URL printed by Vite, usually:

```text
http://localhost:8080/
```

Useful routes:

```text
/?step=landing
/?step=configurator
/?step=proposal
/presentation
```

## Scripts

```bash
npm run dev        # Start local development server
npm run build      # Build production bundle
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run format     # Format the repository with Prettier
```

## Repository Notes

- Routes live in `src/routes/`; see [src/routes/README.md](src/routes/README.md) for TanStack routing conventions.
- Main product components live in `src/components/cloover/`.
- Savings assumptions and household data types live in `src/lib/cloover-data.ts`.
- Public visualization assets live in `public/cloover-assets/`.
- This repository is connected to Lovable. Avoid force-pushing, rebasing, amending, or squashing published commits.

## Validation

Before handing off changes, run:

```bash
npm run build
npm run lint
```

Current lint status may include existing `react-refresh/only-export-components` warnings in shared UI components.
