import { NextResponse } from "next/server";

type Suggestion = { value: string; unrestrictedValue: string; lat?: number; lng?: number };

// ── Yandex Geocoder ──────────────────────────────────────────────────────────

type YandexGeoObject = {
  name?: string;
  description?: string;
  Point?: { pos?: string };
  metaDataProperty?: {
    GeocoderMetaData?: {
      text?: string;
      Address?: { formatted?: string };
    };
  };
};

type YandexGeocoderResponse = {
  response?: {
    GeoObjectCollection?: {
      featureMember?: Array<{ GeoObject?: YandexGeoObject }>;
    };
  };
};

async function fetchYandex(query: string, token: string): Promise<Suggestion[]> {
  const params = new URLSearchParams({
    apikey: token,
    geocode: query,
    format: "json",
    lang: "ru_RU",
    results: "5",
  });
  const res = await fetch(`https://geocode-maps.yandex.ru/1.x/?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as YandexGeocoderResponse;
  return (data.response?.GeoObjectCollection?.featureMember ?? [])
    .map(({ GeoObject }) => {
      const value =
        GeoObject?.metaDataProperty?.GeocoderMetaData?.text ??
        GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.formatted ??
        [GeoObject?.description, GeoObject?.name].filter(Boolean).join(", ");
      const [lonStr, latStr] = (GeoObject?.Point?.pos ?? "").split(" ");
      const lat = parseFloat(latStr ?? "");
      const lng = parseFloat(lonStr ?? "");
      return {
        value,
        unrestrictedValue: value,
        lat: isFinite(lat) ? lat : undefined,
        lng: isFinite(lng) ? lng : undefined,
      };
    })
    .filter((s) => s.value.length > 0);
}

// ── Nominatim (OpenStreetMap) — бесплатный fallback ──────────────────────────

type NominatimItem = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

async function fetchNominatim(query: string): Promise<Suggestion[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "5",
    "accept-language": "ru",
    countrycodes: "ru",
    addressdetails: "0",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { "User-Agent": "Traektoria-Demo/1.0" },
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimItem[];
  return data
    .map((item) => {
      const value = item.display_name ?? "";
      const lat = parseFloat(item.lat ?? "");
      const lng = parseFloat(item.lon ?? "");
      return {
        value,
        unrestrictedValue: value,
        lat: isFinite(lat) ? lat : undefined,
        lng: isFinite(lng) ? lng : undefined,
      };
    })
    .filter((s) => s.value.length > 0);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [], configured: true });
  }

  const token = process.env.YANDEX_GEOCODER_API_KEY ?? process.env.YANDEX_MAPS_API_KEY;

  try {
    const suggestions = token
      ? await fetchYandex(query, token)
      : await fetchNominatim(query);
    return NextResponse.json({ suggestions, configured: true });
  } catch {
    return NextResponse.json({ suggestions: [], configured: true });
  }
}
