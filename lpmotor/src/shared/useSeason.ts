import { useEffect } from "react";

const seasons = ["winter", "spring", "summer", "autumn"] as const;
type Season = (typeof seasons)[number];

function isSeason(value: string | null): value is Season {
  return seasons.some((season) => season === value);
}

function currentSeason(): Season {
  const requested = new URLSearchParams(location.search).get("season");
  if (isSeason(requested)) return requested;
  try {
    const saved = localStorage.getItem("bomond-season");
    if (isSeason(saved)) return saved;
  } catch {
    // The current month remains available when storage is unavailable.
  }
  return seasons[Math.floor(((new Date().getMonth() + 1) % 12) / 3)];
}

export function useSeason() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.season = currentSeason();
    return () => {
      delete root.dataset.season;
    };
  }, []);
}
