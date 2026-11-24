import { useEffect, useState } from "react";

const seasons = ["winter", "spring", "summer", "autumn"] as const;
type Season = (typeof seasons)[number];
const earlyWinterStart = Date.parse("2026-11-24T00:00:00+03:00");
const calendarWinterStart = Date.parse("2026-12-01T00:00:00+03:00");

function isSeason(value: string | null): value is Season {
  return seasons.some((season) => season === value);
}

function currentSeason(): Season {
  const requested = new URLSearchParams(location.search).get("season");
  if (isSeason(requested)) return requested;
  const today = new Date();
  if (
    today.getTime() >= earlyWinterStart &&
    today.getTime() < calendarWinterStart
  )
    return "winter";
  const month = Number(
    new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      timeZone: "Europe/Moscow",
    }).format(today),
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
