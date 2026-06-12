// ─── Element accent colours ────────────────────────────────────────────────
export const ELEMENT_COLORS: Record<string, string> = {
  Lithium:   "#4A90D9",
  Nickel:    "#2EAF7D",
  Cobalt:    "#E05C8A",
  Cuivre:    "#E8813A",
  Argent:    "#9B6DD6",
  Aluminium: "#C9A227",
};

// ─── Mine data ──────────────────────────────────────────────────────────────
export interface Mine {
  name: string;
  lat: number;
  lng: number;
  country: string;
  output: string;
  img: string;
}

export const MINES: Record<string, Mine[]> = {
  Lithium: [
    { name: "Salar de Atacama", lat: -23.5, lng: -68.2,  country: "Chili",       output: "140 000 t/an", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Lithium_brine_pools_in_the_Atacama_Desert.jpg/640px-Lithium_brine_pools_in_the_Atacama_Desert.jpg" },
    { name: "Greenbushes",      lat: -33.8, lng:  116.0, country: "Australie",   output: "80 000 t/an",  img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Talison_Lithium_Greenbushes_mine_2012.jpg/640px-Talison_Lithium_Greenbushes_mine_2012.jpg" },
    { name: "Salar de Uyuni",   lat: -20.1, lng: -67.5,  country: "Bolivie",     output: "estimé",       img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Salar_de_Uyuni%2C_Bolivia_%282%29.jpg/640px-Salar_de_Uyuni%2C_Bolivia_%282%29.jpg" },
    { name: "Silver Peak",      lat:  37.7, lng: -117.6, country: "États-Unis",  output: "6 000 t/an",   img: "" },
    { name: "Bikita",           lat: -20.9, lng:   32.8, country: "Zimbabwe",    output: "2 000 t/an",   img: "" },
  ],
  Nickel: [
    { name: "Norilsk",       lat:  69.3, lng:  88.2, country: "Russie",    output: "200 000 t/an", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Norilsk_Mining_Plant.jpg/640px-Norilsk_Mining_Plant.jpg" },
    { name: "Sudbury",       lat:  46.5, lng: -81.0, country: "Canada",    output: "50 000 t/an",  img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Sudbury_superstack.jpg/640px-Sudbury_superstack.jpg" },
    { name: "Sorowako",      lat:  -2.5, lng: 121.4, country: "Indonésie", output: "78 000 t/an",  img: "" },
    { name: "Cerro Matoso",  lat:   7.6, lng: -75.5, country: "Colombie",  output: "44 000 t/an",  img: "" },
    { name: "Thompson Mine", lat:  55.7, lng: -97.8, country: "Canada",    output: "30 000 t/an",  img: "" },
  ],
  Cobalt: [
    { name: "Tenke Fungurume", lat: -10.5, lng:  26.1, country: "RDC",        output: "15 000 t/an", img: "https://media.lesechos.com/api/v1/images/view/6400ba01444d9840f463f25d/1280x720/0703510707775-web-tete.jpg" },
    { name: "Mutanda Mine",    lat:  -8.0, lng:  23.9, country: "RDC",        output: "25 000 t/an", img: "https://deskeco.com/sites/default/files/styles/1024x578/public/2019-10/Mine-5.jpg?itok=qOPF8glo" },
    { name: "Bou Azzer",       lat:  30.5, lng:  -6.5, country: "Maroc",      output: "2 200 t/an",  img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bou_Azzer_2013b.jpg/1280px-Bou_Azzer_2013b.jpg" },
    { name: "Ambatovy",        lat: -18.9, lng:  48.4, country: "Madagascar", output: "3 500 t/an",  img: "" },
    { name: "Cobalt, Ontario", lat:  47.4, lng: -79.7, country: "Canada",     output: "historique",  img: "" },
  ],
  Cuivre: [
    { name: "Escondida",    lat: -24.3, lng:  -69.1, country: "Chili",      output: "1 200 000 t/an", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Minera_Escondida%2C_Chile.jpg/640px-Minera_Escondida%2C_Chile.jpg" },
    { name: "Morenci",      lat:  33.1, lng: -109.4, country: "États-Unis", output: "450 000 t/an",   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Morenci_Copper_Mine_Arizona.jpg/640px-Morenci_Copper_Mine_Arizona.jpg" },
    { name: "Grasberg",     lat:  -4.1, lng:  137.1, country: "Indonésie",  output: "350 000 t/an",   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Grasberg_mine.jpg/640px-Grasberg_mine.jpg" },
    { name: "Collahuasi",   lat: -20.9, lng:  -68.6, country: "Chili",      output: "470 000 t/an",   img: "" },
    { name: "Chuquicamata", lat: -22.3, lng:  -68.9, country: "Chili",      output: "400 000 t/an",   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chuquicamata_Chile_Kupfermine.jpg/640px-Chuquicamata_Chile_Kupfermine.jpg" },
    { name: "Olympic Dam",  lat: -30.4, lng:  136.9, country: "Australie",  output: "200 000 t/an",   img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Olympic_Dam_Smelter.jpg/640px-Olympic_Dam_Smelter.jpg" },
  ],
  Aluminium: [
    { name: "Weipa (bauxite)", lat: -12.7, lng: 141.9, country: "Australie", output: "35 Mt/an", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Weipa_bauxite_mine.jpg/640px-Weipa_bauxite_mine.jpg" },
    { name: "Sangarédi",       lat:  11.9, lng: -13.8, country: "Guinée",    output: "18 Mt/an", img: "" },
    { name: "Trombetas (MRN)", lat:  -1.5, lng: -56.4, country: "Brésil",   output: "18 Mt/an", img: "" },
  ],
  Argent: [
    { name: "Fresnillo",  lat:  23.2, lng: -102.9, country: "Mexique",   output: "53 Moz/an", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Fresnillo_mine.jpg/640px-Fresnillo_mine.jpg" },
    { name: "Cannington", lat: -22.8, lng:  140.7, country: "Australie", output: "16 Moz/an", img: "" },
    { name: "Antamina",   lat:  -9.5, lng:  -77.1, country: "Pérou",     output: "12 Moz/an", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Antamina_mine.jpg/640px-Antamina_mine.jpg" },
    { name: "Peñasquito", lat:  24.9, lng: -101.7, country: "Mexique",   output: "17 Moz/an", img: "" },
  ],
};

// ─── Element detail content (modal) ─────────────────────────────────────────
export interface ElementDetail {
  symbol: string;
  number: number;
  photo: string;
  info: string;
  fun: string;
  stats: Record<string, string>;
}

export const ELEMENT_DETAILS: Record<string, ElementDetail> = {
  Lithium: {
    symbol: "Li", number: 3,
    photo: "https://mineralseducationcoalition.org/wp-content/uploads/Lithium2_lepidolite_334916054.jpg",
    info: "Lithium is the lightest solid metal on Earth and the cornerstone of the energy transition. Lithium-ion batteries power smartphones, laptops, and electric vehicles, making it one of the most strategically vital minerals of the 21st century.",
    fun: "Lithium is so light it floats on water — and so reactive it must be stored in mineral oil to prevent ignition.",
    stats: { "Atomic mass": "6.941 u", "Density": "0.534 g/cm³", "Melting point": "180.5 °C", "Top producers": "Chile, Australia, China" },
  },
  Nickel: {
    symbol: "Ni", number: 28,
    photo: "https://images.thewest.com.au/publication/C-16043876/f216f4a0dca7f9e7c92b5d8ddbaba813d95a8423-16x9-x0y150w1440h810.jpg?imwidth=1024&impolicy=wan_v3",
    info: "Nickel is a lustrous silver-white metal prized for its strength and corrosion resistance. About 70% of global output goes into stainless steel.",
    fun: "The word 'nickel' comes from the German 'Kupfernickel' — copper demon — because miners mistook the ore for copper.",
    stats: { "Atomic mass": "58.693 u", "Density": "8.908 g/cm³", "Melting point": "1 455 °C", "Top producers": "Indonesia, Philippines, Russia" },
  },
  Cobalt: {
    symbol: "Co", number: 27,
    photo: "https://www.jxscmachine.com/wp-content/uploads/2019/08/Cobalt-1.jpg",
    info: "Cobalt has coloured human civilisation for millennia. Today it stabilises cathode chemistry in lithium-ion cells, making it essential to every rechargeable battery.",
    fun: "Over 70% of world cobalt is mined in the Democratic Republic of the Congo.",
    stats: { "Atomic mass": "58.933 u", "Density": "8.900 g/cm³", "Melting point": "1 495 °C", "Top producers": "DRC, Russia, Australia" },
  },
  Cuivre: {
    symbol: "Cu", number: 29,
    photo: "https://cdn11.bigcommerce.com/s-zyp1gsevdp/images/stencil/1280x1280/products/1685/18881/nativecopper1_copy__23593.1713933495.jpg?c=2",
    info: "Copper has been worked by humans for over 10,000 years. Its extraordinary electrical and thermal conductivity make it irreplaceable in wiring, motors, and electronics.",
    fun: "The Statue of Liberty is clad in roughly 80 tonnes of copper, which oxidised over decades to create its iconic green patina.",
    stats: { "Atomic mass": "63.546 u", "Density": "8.960 g/cm³", "Melting point": "1 084 °C", "Top producers": "Chile, Peru, China" },
  },
  Argent: {
    symbol: "Ag", number: 47,
    photo: "https://img.freepik.com/photos-premium/minerai-argent-macro-pierres-precieuses-mines-argent_37753-250.jpg",
    info: "Silver holds the highest electrical and thermal conductivity of any element, making it irreplaceable in electronics, solar panels, and precision contacts.",
    fun: "The symbol Ag comes from 'argentum', the Latin for silver — which also gave Argentina its name.",
    stats: { "Atomic mass": "107.868 u", "Density": "10.49 g/cm³", "Melting point": "961.8 °C", "Top producers": "Mexico, Peru, China" },
  },
  Aluminium: {
    symbol: "Al", number: 13,
    photo: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Aluminium-4.jpg",
    info: "Aluminium is the most abundant metal in Earth's crust. Today's electrolytic smelting makes it ubiquitous: packaging, aircraft frames, automotive bodies, and consumer electronics.",
    fun: "Recycling aluminium requires only 5% of the energy needed to smelt it from bauxite.",
    stats: { "Atomic mass": "26.982 u", "Density": "2.700 g/cm³", "Melting point": "660.3 °C", "Top producers": "China, India, Russia" },
  },
};

// ─── Country detail data (replaces individual HTML files) ───────────────────
export interface CountryStat {
  label: string;
  rank: string;
  value: string;
  unit: string;
  barWidth: number; // percent 0–100
  barColor: string;
}

export interface CountryData {
  id: number;           // numeric ISO code matching topojson
  code: string;         // e.g. "US"
  name: string;         // display name
  description: string;
  stats: CountryStat[];
  mines: Array<{
    name: string;
    coords: [number, number]; // [lng, lat]
    img: string;
    desc: string;
  }>;
}

export const COUNTRIES: CountryData[] = [
  {
    id: 840, code: "US", name: "UNITED STATES",
    description: "Domestic mineral autonomy through the development of high-purity battery metal deposits and major copper production sites.",
    stats: [
      { label: "CRUDE OIL PRODUCTION",         rank: "1ST GLOBALLY", value: "13.2", unit: "M Barrels/day", barWidth: 95, barColor: "#ff4b4b" },
      { label: "POTENTIAL LITHIUM RESERVES",   rank: "TOP GLOBALLY", value: "20.0", unit: "M Tons",        barWidth: 80, barColor: "#c53030" },
      { label: "COPPER PRODUCTION",            rank: "5TH GLOBALLY", value: "1.1",  unit: "M Tons/year",   barWidth: 45, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Thacker Pass (Li)", coords: [-118.06, 41.71], img: "https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?auto=format&fit=crop&w=400&q=80", desc: "Largest known lithium resource in the US, located in northern Nevada." },
      { name: "Eagle Mine (Ni/Cu)", coords: [-87.89, 46.68], img: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=400&q=80", desc: "High-grade nickel and copper mine located in Michigan's Upper Peninsula." },
      { name: "Morenci Mine (Cu)", coords: [-109.33, 33.07], img: "https://images.unsplash.com/photo-1616782057396-03c038473f32?auto=format&fit=crop&w=400&q=80", desc: "One of the largest copper mines in North America, located in southeastern Arizona." },
    ],
  },
  {
    id: 152, code: "CL", name: "CHILE",
    description: "World's largest producer of copper and second-largest of lithium. The Atacama Desert hosts some of the richest mineral brines on the planet.",
    stats: [
      { label: "COPPER PRODUCTION",  rank: "1ST GLOBALLY", value: "5.7",  unit: "M Tons/year",   barWidth: 100, barColor: "#ff4b4b" },
      { label: "LITHIUM PRODUCTION", rank: "2ND GLOBALLY", value: "39.0", unit: "K Tons/year",   barWidth:  78, barColor: "#c53030" },
      { label: "LITHIUM RESERVES",   rank: "2ND GLOBALLY", value: "9.3",  unit: "M Tons",        barWidth:  60, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Salar de Atacama (Li)",  coords: [-68.2,  -23.5], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Lithium_brine_pools_in_the_Atacama_Desert.jpg/640px-Lithium_brine_pools_in_the_Atacama_Desert.jpg", desc: "World's most productive lithium brine operation, yielding over 140 000 t/year." },
      { name: "Escondida (Cu)",         coords: [-69.1,  -24.3], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Minera_Escondida%2C_Chile.jpg/640px-Minera_Escondida%2C_Chile.jpg", desc: "Largest copper mine in the world by output, operated by BHP." },
      { name: "Chuquicamata (Cu)",      coords: [-68.9,  -22.3], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chuquicamata_Chile_Kupfermine.jpg/640px-Chuquicamata_Chile_Kupfermine.jpg", desc: "One of the oldest and largest open-pit copper mines in the world." },
    ],
  },
  {
    id: 36, code: "AU", name: "AUSTRALIA",
    description: "Top global producer of lithium and a major supplier of cobalt, gold, and nickel. Home to vast hard-rock spodumene deposits.",
    stats: [
      { label: "LITHIUM PRODUCTION", rank: "1ST GLOBALLY", value: "86.0", unit: "K Tons/year",  barWidth: 100, barColor: "#ff4b4b" },
      { label: "GOLD PRODUCTION",    rank: "2ND GLOBALLY", value: "330",  unit: "Tons/year",    barWidth:  72, barColor: "#c53030" },
      { label: "NICKEL PRODUCTION",  rank: "TOP 5",        value: "160",  unit: "K Tons/year",  barWidth:  50, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Greenbushes (Li)",  coords: [116.0, -33.8], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Talison_Lithium_Greenbushes_mine_2012.jpg/640px-Talison_Lithium_Greenbushes_mine_2012.jpg", desc: "World's highest-grade and largest hard-rock lithium mine." },
      { name: "Olympic Dam (Cu/U)", coords: [136.9, -30.4], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Olympic_Dam_Smelter.jpg/640px-Olympic_Dam_Smelter.jpg", desc: "Enormous polymetallic deposit containing copper, uranium, gold, and silver." },
      { name: "Weipa (bauxite)",   coords: [141.9, -12.7], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Weipa_bauxite_mine.jpg/640px-Weipa_bauxite_mine.jpg", desc: "One of the world's largest bauxite (aluminium ore) operations." },
    ],
  },
  {
    id: 156, code: "CN", name: "CHINA",
    description: "Dominant processor of virtually every critical mineral. Controls refining capacity for lithium, cobalt, rare earths, and gallium.",
    stats: [
      { label: "RARE EARTH PRODUCTION", rank: "1ST GLOBALLY", value: "210", unit: "K Tons/year", barWidth: 100, barColor: "#ff4b4b" },
      { label: "GALLIUM PRODUCTION",    rank: "1ST GLOBALLY", value: "600", unit: "Tons/year",   barWidth: 100, barColor: "#c53030" },
      { label: "TUNGSTEN PRODUCTION",   rank: "1ST GLOBALLY", value: "84",  unit: "K Tons/year", barWidth: 100, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Bayan Obo (REE)", coords: [110.0, 41.8], img: "", desc: "World's largest rare earth deposit, containing light REEs essential for magnets and electronics." },
      { name: "Jiangxi REE",     coords: [115.9, 27.1], img: "", desc: "Major ion-absorption rare earth mining region, key for heavy REEs." },
      { name: "Shanxi Coal/Al",  coords: [112.5, 37.8], img: "", desc: "Major coal and aluminium production hub in central China." },
    ],
  },
  {
    id: 180, code: "CD", name: "DR CONGO",
    description: "Holds roughly 70% of global cobalt reserves. Also a significant producer of copper from the Congolese Copperbelt.",
    stats: [
      { label: "COBALT PRODUCTION", rank: "1ST GLOBALLY", value: "130", unit: "K Tons/year", barWidth: 100, barColor: "#ff4b4b" },
      { label: "COBALT RESERVES",   rank: "1ST GLOBALLY", value: "3.6", unit: "M Tons",      barWidth: 100, barColor: "#c53030" },
      { label: "COPPER PRODUCTION", rank: "TOP 5",        value: "2.6", unit: "M Tons/year", barWidth:  65, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Tenke Fungurume", coords: [26.1, -10.5], img: "https://media.lesechos.com/api/v1/images/view/6400ba01444d9840f463f25d/1280x720/0703510707775-web-tete.jpg", desc: "Giant copper-cobalt mine in Lualaba Province, one of the richest in the world." },
      { name: "Mutanda Mine",    coords: [23.9,  -8.0], img: "https://deskeco.com/sites/default/files/styles/1024x578/public/2019-10/Mine-5.jpg?itok=qOPF8glo", desc: "Among the world's highest-grade cobalt deposits, now partially operational again." },
      { name: "Kamoto (Cu/Co)", coords: [25.5, -10.8], img: "", desc: "Underground copper-cobalt mine operated by Glencore in the Copperbelt." },
    ],
  },
  {
    id: 643, code: "RU", name: "RUSSIA",
    description: "Major supplier of nickel, palladium, and cobalt. Norilsk Nickel dominates global palladium supply and is among the world's top nickel producers.",
    stats: [
      { label: "PALLADIUM PRODUCTION", rank: "1ST GLOBALLY", value: "88",  unit: "Tons/year",   barWidth: 100, barColor: "#ff4b4b" },
      { label: "NICKEL PRODUCTION",    rank: "2ND GLOBALLY", value: "220", unit: "K Tons/year", barWidth:  85, barColor: "#c53030" },
      { label: "COBALT PRODUCTION",    rank: "3RD GLOBALLY", value: "7.6", unit: "K Tons/year", barWidth:  40, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Norilsk (Ni/Co/Pd)", coords: [88.2, 69.3], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Norilsk_Mining_Plant.jpg/640px-Norilsk_Mining_Plant.jpg", desc: "Arctic mining-industrial complex, the world's northernmost city and largest nickel/palladium operation." },
      { name: "Talnakh (Ni/Cu)",    coords: [88.4, 69.5], img: "", desc: "Underground extension of the Norilsk deposit, among the richest sulphide ores known." },
    ],
  },
  {
    id: 484, code: "MX", name: "MEXICO",
    description: "World's leading silver producer for over a decade. Also a significant source of copper, zinc, and lead.",
    stats: [
      { label: "SILVER PRODUCTION", rank: "1ST GLOBALLY", value: "6 400", unit: "Tons/year",   barWidth: 100, barColor: "#ff4b4b" },
      { label: "COPPER PRODUCTION", rank: "TOP 10",       value: "750",   unit: "K Tons/year", barWidth:  45, barColor: "#c53030" },
      { label: "ZINC PRODUCTION",   rank: "TOP 5",        value: "700",   unit: "K Tons/year", barWidth:  55, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Fresnillo (Ag)", coords: [-102.9, 23.2], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Fresnillo_mine.jpg/640px-Fresnillo_mine.jpg", desc: "World's largest primary silver mine, operated by Fresnillo plc in Zacatecas state." },
      { name: "Peñasquito (Ag/Au/Zn)", coords: [-101.7, 24.9], img: "", desc: "Large polymetallic open-pit mine, one of the world's largest silver-zinc operations." },
      { name: "Cananea (Cu)", coords: [-110.3, 30.9], img: "", desc: "Major copper mine in Sonora, one of Mexico's most productive." },
    ],
  },
  {
    id: 604, code: "PE", name: "PERU",
    description: "Major producer of silver, copper, zinc, and gold. The Andes host some of the world's richest polymetallic deposits.",
    stats: [
      { label: "COPPER PRODUCTION", rank: "2ND GLOBALLY", value: "2.8", unit: "M Tons/year", barWidth: 80, barColor: "#ff4b4b" },
      { label: "SILVER PRODUCTION", rank: "2ND GLOBALLY", value: "3 800", unit: "Tons/year", barWidth: 75, barColor: "#c53030" },
      { label: "ZINC PRODUCTION",   rank: "2ND GLOBALLY", value: "1.5",  unit: "M Tons/year", barWidth: 70, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Antamina (Zn/Cu/Ag)", coords: [-77.1, -9.5], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Antamina_mine.jpg/640px-Antamina_mine.jpg", desc: "One of the world's largest polymetallic mines, at 4 300 m altitude in the Andes." },
      { name: "Las Bambas (Cu)",     coords: [-72.1, -14.0], img: "", desc: "Major copper mine contributing nearly 2% of world supply." },
      { name: "Cerro Verde (Cu)",    coords: [-71.5, -16.5], img: "", desc: "Open-pit porphyry copper-molybdenum mine near Arequipa." },
    ],
  },
  {
    id: 710, code: "ZA", name: "SOUTH AFRICA",
    description: "Produces roughly 70% of the world's platinum and is among the top producers of chromium, manganese, and gold.",
    stats: [
      { label: "PLATINUM PRODUCTION",  rank: "1ST GLOBALLY", value: "130", unit: "Tons/year",   barWidth: 100, barColor: "#ff4b4b" },
      { label: "CHROMIUM PRODUCTION",  rank: "1ST GLOBALLY", value: "18",  unit: "M Tons/year", barWidth:  95, barColor: "#c53030" },
      { label: "MANGANESE PRODUCTION", rank: "1ST GLOBALLY", value: "7.7", unit: "M Tons/year", barWidth:  90, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Bushveld Complex (Pt/Pd)", coords: [28.3, -25.0], img: "", desc: "World's largest known PGM (platinum group metals) deposit, stretching across Limpopo and North West provinces." },
      { name: "Khumani (Fe)",             coords: [22.8, -27.6], img: "", desc: "Large iron ore mine in the Northern Cape, part of the Sishen-Khumani complex." },
    ],
  },
  {
    id: 124, code: "CA", name: "CANADA",
    description: "Rich in nickel, cobalt, uranium, and potash. Canadian mines supply critical materials for EV batteries and nuclear energy.",
    stats: [
      { label: "NICKEL PRODUCTION",  rank: "TOP 5",        value: "130", unit: "K Tons/year", barWidth:  60, barColor: "#ff4b4b" },
      { label: "URANIUM PRODUCTION", rank: "2ND GLOBALLY", value: "7.4", unit: "K Tons/year", barWidth:  78, barColor: "#c53030" },
      { label: "COBALT PRODUCTION",  rank: "TOP 5",        value: "3.8", unit: "K Tons/year", barWidth:  30, barColor: "#8e1d1d" },
    ],
    mines: [
      { name: "Sudbury Basin (Ni/Co)", coords: [-81.0, 46.5], img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Sudbury_superstack.jpg/640px-Sudbury_superstack.jpg", desc: "World's second-largest nickel deposit, formed by a meteorite impact 1.85 billion years ago." },
      { name: "Thompson (Ni)",         coords: [-97.8, 55.7], img: "", desc: "Major nickel operation in northern Manitoba, part of the Thompson Nickel Belt." },
      { name: "Cigar Lake (U)",        coords: [-105.6, 58.1], img: "", desc: "World's highest-grade uranium deposit, at depths of 430 m in Saskatchewan." },
    ],
  },
];

// Helper to look up country data by numeric ID
export function getCountryById(id: number): CountryData | undefined {
  return COUNTRIES.find(c => c.id === id);
}
