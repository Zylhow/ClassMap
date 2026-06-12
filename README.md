This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# ClassMap — React Migration

## What changed

The original project had 27 individual HTML files (one per country) with duplicated layout, styles, and JS. All of that is now replaced by:

```
src/
├── page.tsx                    # Root — manages view state (map / metals / country)
├── layout.tsx                  # Next.js layout
├── globals.css                 # Minimal global styles
├── components/
│   ├── WorldMap.jsx            # D3 canvas world map (drag, zoom, mine icons)
│   ├── CountryPanel.jsx        # Single country view (replaces all 27 *.html files)
│   ├── ElementsView.jsx        # Periodic table grid + element modals
│   ├── Navbar.jsx              # Top navigation bar
│   └── AboutDrawer.jsx         # Slide-in about panel
└── data/
    ├── countries.js            # All country data (stats, mines, labels) — edit here
    └── metals.js               # Mine coordinates, element details, colors — edit here
```

## Setup

1. Install dependencies (if not already in your project):
   ```bash
   npm install d3 topojson-client
   npm install --save-dev @types/d3 @types/topojson-client
   ```

2. Copy `data.json` (from your original project) to the `public/` folder of your Next.js app.

3. Replace the files in your `app/` directory with these files.

## Adding a new country

Open `src/data/countries.js` and add a new entry:

```js
"NNN": {               // ISO numeric code padded to 3 digits (e.g. "076" for Brazil)
  id: "NNN",
  numericId: NNN,      // numeric — must match the topojson country ID
  name: "Country Name",
  label: "COUNTRY NAME [XX]",
  stats: [
    { label: "COPPER PRODUCTION", badge: "1ST GLOBALLY", value: "5.6", unit: "M Tons/year", bar: 100, color: "#E8813A" },
  ],
  terrainDesc: "Description of the terrain and strategic assets.",
  mines: [
    { name: "Mine Name (Resource)", coords: [lng, lat], img: "https://...", desc: "Short description." },
  ],
},
```

That's it — the UI renders the country panel automatically when the user clicks that country on the map.

## Adding a new metal to the world map

Open `src/data/metals.js` and add to `ELEMENT_COLORS`, `ELEMENT_DETAILS`, and `MINES`. Add the name to `FEATURED_ELEMENTS` to show it in the periodic table grid.