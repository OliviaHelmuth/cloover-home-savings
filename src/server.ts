import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type EstimatePayload = {
  source: "live" | "fallback";
  addressLabel: string;
  lat: number | null;
  lon: number | null;
  specificYieldKwhPerKwp: number;
  usableRoofAreaM2: number | null;
  roofSource: "osm_building" | "household_fallback";
  irradianceSource: "pvgis" | "fallback";
  attribution: string[];
  warnings: string[];
};

const APP_USER_AGENT = "SolaraHomeSavingsHackathon/1.0 (contact: savings@solara.energy)";

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

function fallbackEstimate(search: URLSearchParams, warnings: string[] = []): EstimatePayload {
  const householdSize = Number(search.get("householdSize") || 3);
  return {
    source: "fallback",
    addressLabel: search.get("postalCode") || "Germany average",
    lat: null,
    lon: null,
    specificYieldKwhPerKwp: 950,
    usableRoofAreaM2: Math.max(24, Math.min(58, 36 + (householdSize - 3) * 3)),
    roofSource: "household_fallback",
    irradianceSource: "fallback",
    attribution: [
      "PVGIS fallback assumption",
      "OpenStreetMap/Nominatim attribution required when live geocoding succeeds",
    ],
    warnings,
  };
}

async function geocodeAddress(search: URLSearchParams) {
  const street = search.get("street") ?? "";
  const streetNumber = search.get("streetNumber") ?? "";
  const postalCode = search.get("postalCode") ?? "";
  const address = `${street} ${streetNumber}, ${postalCode}, Germany`.trim();
  const shortLabel = [street && `${street} ${streetNumber}`.trim(), postalCode]
    .filter(Boolean)
    .join(", ");
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", address);

  const response = await fetch(url, {
    headers: {
      "user-agent": APP_USER_AGENT,
      accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Nominatim returned ${response.status}`);
  }

  const results = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    display_name?: string;
  }>;
  const first = results[0];
  if (!first?.lat || !first.lon) {
    throw new Error("Nominatim returned no coordinates");
  }
  return {
    lat: Number(first.lat),
    lon: Number(first.lon),
    label: shortLabel || first.display_name || address,
  };
}

async function fetchPvgisYield(lat: number, lon: number) {
  const url = new URL("https://re.jrc.ec.europa.eu/api/v5_3/PVcalc");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("peakpower", "1");
  url.searchParams.set("loss", "14");
  url.searchParams.set("angle", "30");
  url.searchParams.set("aspect", "0");
  url.searchParams.set("mountingplace", "building");
  url.searchParams.set("outputformat", "json");

  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`PVGIS returned ${response.status}`);
  }

  const payload = (await response.json()) as {
    outputs?: {
      totals?: {
        fixed?: {
          E_y?: number;
        };
      };
    };
  };
  const yieldKwh = payload.outputs?.totals?.fixed?.E_y;
  if (!yieldKwh || yieldKwh < 600 || yieldKwh > 1400) {
    throw new Error("PVGIS returned an implausible annual yield");
  }
  return Math.round(yieldKwh);
}

function polygonAreaM2(points: Array<{ lat: number; lon: number }>) {
  if (points.length < 3) return 0;
  const lat0 = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const metresPerDegLat = 111_320;
  const metresPerDegLon = 111_320 * Math.cos((lat0 * Math.PI) / 180);
  const local = points.map((p) => ({
    x: p.lon * metresPerDegLon,
    y: p.lat * metresPerDegLat,
  }));
  let area = 0;
  for (let i = 0; i < local.length; i += 1) {
    const a = local[i];
    const b = local[(i + 1) % local.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

async function fetchOsmBuildingRoofArea(lat: number, lon: number) {
  const query = `
    [out:json][timeout:8];
    way["building"](around:35,${lat},${lon});
    out geom;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "user-agent": APP_USER_AGENT,
    },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) {
    throw new Error(`Overpass returned ${response.status}`);
  }

  const payload = (await response.json()) as {
    elements?: Array<{
      geometry?: Array<{ lat: number; lon: number }>;
    }>;
  };
  const areas =
    payload.elements
      ?.map((element) => (element.geometry ? polygonAreaM2(element.geometry) : 0))
      .filter((area) => area >= 25 && area <= 400) ?? [];

  if (!areas.length) {
    throw new Error("Overpass returned no usable building footprint");
  }

  const footprintArea = Math.max(...areas);
  return Math.round(Math.max(20, Math.min(72, footprintArea * 0.45)));
}

async function handleFreeEnergyEstimate(request: Request) {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(request.url);
  const warnings: string[] = [];
  let geocoded: Awaited<ReturnType<typeof geocodeAddress>>;

  try {
    geocoded = await geocodeAddress(url.searchParams);
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "Geocoding failed");
    return json(fallbackEstimate(url.searchParams, warnings));
  }

  let specificYieldKwhPerKwp = 950;
  let irradianceSource: EstimatePayload["irradianceSource"] = "fallback";
  try {
    specificYieldKwhPerKwp = await fetchPvgisYield(geocoded.lat, geocoded.lon);
    irradianceSource = "pvgis";
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "PVGIS failed");
  }

  let usableRoofAreaM2: number | null = null;
  let roofSource: EstimatePayload["roofSource"] = "household_fallback";
  try {
    usableRoofAreaM2 = await fetchOsmBuildingRoofArea(geocoded.lat, geocoded.lon);
    roofSource = "osm_building";
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "OSM building lookup failed");
    usableRoofAreaM2 = fallbackEstimate(url.searchParams).usableRoofAreaM2;
  }

  return json({
    source: "live",
    addressLabel: geocoded.label,
    lat: geocoded.lat,
    lon: geocoded.lon,
    specificYieldKwhPerKwp,
    usableRoofAreaM2,
    roofSource,
    irradianceSource,
    attribution: [
      "Geocoding and building footprints: OpenStreetMap contributors / ODbL",
      "Solar yield: PVGIS, European Commission Joint Research Centre",
    ],
    warnings,
  } satisfies EstimatePayload);
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/free-energy-estimate") {
        return await handleFreeEnergyEstimate(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
