import { useEffect, useState } from "react";

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
  const month = Number(
    new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      timeZone: "Europe/Moscow",
    }).format(new Date()),
  );
  return seasons[Math.floor((month % 12) / 3)];
}

export function useSeason() {
  const [season, setSeason] = useState<Season>();
  useEffect(() => {
    const root = document.documentElement;
    const current = currentSeason();
    root.dataset.season = current;
    setSeason(current);
    return () => {
      delete root.dataset.season;
    };
  }, []);
  return season;
}
