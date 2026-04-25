import { NextResponse } from "next/server";

type YandexGeoObject = {
  name?: string;
  description?: string;
  metaDataProperty?: {
    GeocoderMetaData?: {
      text?: string;
      Address?: {
        formatted?: string;
      };
    };
  };
};

type YandexGeocoderResponse = {
  response?: {
    GeoObjectCollection?: {
      featureMember?: Array<{
        GeoObject?: YandexGeoObject;
      }>;
    };
  };
};

const YANDEX_GEOCODER_URL = "https://geocode-maps.yandex.ru/1.x/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const token = process.env.YANDEX_GEOCODER_API_KEY ?? process.env.YANDEX_MAPS_API_KEY;

  if (query.length < 3) {
    return NextResponse.json({ suggestions: [], configured: Boolean(token) });
  }

  if (!token) {
    return NextResponse.json({ suggestions: [], configured: false });
  }

  try {
    const params = new URLSearchParams({
      apikey: token,
      geocode: query,
      format: "json",
      lang: "ru_RU",
      results: "5",
    });

    const response = await fetch(`${YANDEX_GEOCODER_URL}?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return NextResponse.json({ suggestions: [], configured: true }, { status: 200 });
    }

    const data = (await response.json()) as YandexGeocoderResponse;
    const featureMembers = data.response?.GeoObjectCollection?.featureMember ?? [];
    const suggestions = featureMembers
      .map(({ GeoObject }) => {
        const value =
          GeoObject?.metaDataProperty?.GeocoderMetaData?.text ??
          GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.formatted ??
          [GeoObject?.description, GeoObject?.name].filter(Boolean).join(", ");

        return {
          value,
          unrestrictedValue: value,
        };
      })
      .filter((item) => item.value.length > 0);

    return NextResponse.json({ suggestions, configured: true });
  } catch {
    return NextResponse.json({ suggestions: [], configured: true }, { status: 200 });
  }
}
