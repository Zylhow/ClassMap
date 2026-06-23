// app/country/[id]/page.tsx
import CountryClient from "./CountryClient";

// Since you import data.ts, let's extract the actual IDs automatically if possible,
// or just return your static list like below:
export async function generateStaticParams() {
  const countryIds = ['USA', 'BRA', 'CAN']; // Update this array with your actual country IDs
  
  return countryIds.map((id) => ({
    id: id,
  }));
}

export default function Page() {
  return <CountryClient />;
}