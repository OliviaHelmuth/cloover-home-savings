import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";
import { X, Pencil, Undo2, Check, Loader2, MapPin } from "lucide-react";

// Loaded lazily on the client to avoid SSR `window is not defined`.
type LeafletModule = typeof import("leaflet");
let leafletPromise: Promise<LeafletModule> | null = null;
function loadLeaflet(): Promise<LeafletModule> {
  if (!leafletPromise) {
    leafletPromise = import("leaflet").then((m) => (m as unknown as { default: LeafletModule }).default ?? m);
  }
  return leafletPromise;
}

type Props = {
  open: boolean;
  onClose: () => void;
  street: string;
  streetNumber: string;
  postalCode: string;
  initialAreaM2?: number | null;
  onConfirm: (areaM2: number) => void;
};

const SAT_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const STREET_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function geodesicAreaM2(latlngs: L.LatLng[]) {
  if (latlngs.length < 3) return 0;
  const R = 6378137;
  const toRad = (d: number) => (d * Math.PI) / 180;
  let area = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % latlngs.length];
    area += toRad(p2.lng - p1.lng) * (2 + Math.sin(toRad(p1.lat)) + Math.sin(toRad(p2.lat)));
  }
  return Math.abs((area * R * R) / 2);
}

export function RoofMapModal({
  open,
  onClose,
  street,
  streetNumber,
  postalCode,
  initialAreaM2,
  onConfirm,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{
    points: L.LatLng[];
    markers: L.CircleMarker[];
    line: L.Polyline | null;
    polygon: L.Polygon | null;
    tileSat: L.TileLayer | null;
    tileStreet: L.TileLayer | null;
  }>({
    points: [],
    markers: [],
    line: null,
    polygon: null,
    tileSat: null,
    tileStreet: null,
  });
  const [drawing, setDrawing] = useState(false);
  const [areaM2, setAreaM2] = useState<number>(initialAreaM2 ?? 0);
  const [view, setView] = useState<"satellite" | "map">("satellite");
  const [geocoding, setGeocoding] = useState(false);
  const [addressLabel, setAddressLabel] = useState<string>("");

  const leafletRef = useRef<LeafletModule | null>(null);

  // initialise the map once when opened
  useEffect(() => {
    if (!open || !containerRef.current || mapRef.current) return;
    let cancelled = false;
    loadLeaflet().then((Lmod) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = Lmod;
      const map = Lmod.map(containerRef.current, {
        center: [52.516, 13.388],
        zoom: 19,
        zoomControl: true,
        maxZoom: 21,
      });
      const sat = Lmod.tileLayer(SAT_TILES, {
        maxZoom: 21,
        attribution: "Imagery © Esri",
      }).addTo(map);
      const streetLayer = Lmod.tileLayer(STREET_TILES, {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      });
      layersRef.current.tileSat = sat;
      layersRef.current.tileStreet = streetLayer;
      mapRef.current = map;

      map.on("click", (e: L.LeafletMouseEvent) => {
        const layers = layersRef.current;
        if (!drawingRef.current) return;
        layers.points.push(e.latlng);
        const marker = Lmod.circleMarker(e.latlng, {
          radius: 6,
          color: "#1F6FEB",
          weight: 2,
          fillColor: "#fff",
          fillOpacity: 1,
        }).addTo(map);
        layers.markers.push(marker);
        redraw();
      });

      map.on("dblclick", () => {
        if (drawingRef.current && layersRef.current.points.length >= 3) {
          finish();
        }
      });
      map.doubleClickZoom.disable();

      setTimeout(() => map.invalidateSize(), 50);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // teardown when closed
  useEffect(() => {
    if (open) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layersRef.current = {
        points: [],
        markers: [],
        line: null,
        polygon: null,
        tileSat: null,
        tileStreet: null,
      };
    }
  }, [open]);

  // keep `drawing` accessible inside map callbacks
  const drawingRef = useRef(drawing);
  useEffect(() => {
    drawingRef.current = drawing;
  }, [drawing]);

  // toggle tile layers
  useEffect(() => {
    const { tileSat, tileStreet } = layersRef.current;
    const map = mapRef.current;
    if (!map || !tileSat || !tileStreet) return;
    if (view === "satellite") {
      if (!map.hasLayer(tileSat)) tileSat.addTo(map);
      if (map.hasLayer(tileStreet)) map.removeLayer(tileStreet);
    } else {
      if (!map.hasLayer(tileStreet)) tileStreet.addTo(map);
      if (map.hasLayer(tileSat)) map.removeLayer(tileSat);
    }
  }, [view]);

  // geocode address each time it opens
  useEffect(() => {
    if (!open || !mapRef.current) return;
    const query = `${street} ${streetNumber}, ${postalCode}, Germany`.trim();
    setGeocoding(true);
    setAddressLabel(query);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } },
    )
      .then((r) => r.json())
      .then((results: Array<{ lat: string; lon: string; display_name: string }>) => {
        if (results && results[0] && mapRef.current) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);
          mapRef.current.setView([lat, lon], 20);
          setAddressLabel(results[0].display_name);
        }
      })
      .catch(() => undefined)
      .finally(() => setGeocoding(false));
  }, [open, street, streetNumber, postalCode]);

  function redraw() {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map) return;
    if (layers.line) {
      map.removeLayer(layers.line);
      layers.line = null;
    }
    if (layers.polygon) {
      map.removeLayer(layers.polygon);
      layers.polygon = null;
    }
    if (layers.points.length >= 2) {
      const Lmod = leafletRef.current;
      if (!Lmod) return;
      layers.line = Lmod.polyline(layers.points, {
        color: "#1F6FEB",
        weight: 3,
        dashArray: "6 6",
      }).addTo(map);
    }
    if (layers.points.length >= 3) {
      const Lmod = leafletRef.current;
      if (!Lmod) return;
      layers.polygon = Lmod.polygon(layers.points, {
        color: "#1F6FEB",
        weight: 2,
        fillColor: "#1F6FEB",
        fillOpacity: 0.28,
      }).addTo(map);
      setAreaM2(Math.round(geodesicAreaM2(layers.points)));
    } else {
      setAreaM2(0);
    }
  }

  function startDraw() {
    clearAll();
    setDrawing(true);
  }

  function undo() {
    const layers = layersRef.current;
    if (!layers.points.length) return;
    layers.points.pop();
    const m = layers.markers.pop();
    if (m && mapRef.current) mapRef.current.removeLayer(m);
    redraw();
  }

  function clearAll() {
    const layers = layersRef.current;
    const map = mapRef.current;
    if (!map) return;
    layers.markers.forEach((m) => map.removeLayer(m));
    layers.markers = [];
    layers.points = [];
    if (layers.line) {
      map.removeLayer(layers.line);
      layers.line = null;
    }
    if (layers.polygon) {
      map.removeLayer(layers.polygon);
      layers.polygon = null;
    }
    setAreaM2(0);
  }

  function finish() {
    setDrawing(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 md:p-6">
      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold text-ink md:text-xl">Draw your roof on the map</h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Click <b>Draw area</b>, then click each corner of your roof. Double-click (or press
              Finish) to close the shape.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-line p-2 text-muted-foreground hover:text-ink"
            aria-label="Close map"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <div ref={containerRef} className="relative z-0 h-[58vh] w-full bg-surface-soft" />

          {/* overlays */}
          <div style={{position: 'absolute', inset: 0, zIndex: 2000}} className="pointer-events-none flex flex-col justify-between p-3">
            <div className="pointer-events-auto flex items-start justify-between gap-2">
              <div className="flex gap-1 rounded-full bg-white p-1 shadow">
                <button
                  onClick={() => setView("satellite")}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    view === "satellite" ? "bg-ink text-white" : "text-ink"
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    view === "map" ? "bg-ink text-white" : "text-ink"
                  }`}
                >
                  Map
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!drawing ? (
                  <button
                    onClick={startDraw}
                    className="inline-flex items-center gap-2 rounded-full bg-cloover px-4 py-2 text-xs font-extrabold text-white shadow hover:bg-cloover/90"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Draw area
                  </button>
                ) : (
                  <>
                    <button
                      onClick={undo}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-ink shadow hover:bg-surface-soft"
                    >
                      <Undo2 className="h-3.5 w-3.5" /> Undo
                    </button>
                    <button
                      onClick={finish}
                      disabled={areaM2 === 0}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-extrabold text-white shadow disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Finish
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink shadow">
                <MapPin className="h-3.5 w-3.5 text-cloover" />
                {geocoding ? (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Locating address…
                  </span>
                ) : (
                  <span className="max-w-[260px] truncate md:max-w-[420px]">{addressLabel}</span>
                )}
              </div>
              {areaM2 > 0 && (
                <div className="rounded-full bg-cloover px-3 py-1.5 text-xs font-extrabold text-white shadow">
                  Roof area ≈ {areaM2.toLocaleString()} m²
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-soft px-5 py-4">
          <p className="max-w-md text-[11px] leading-4 text-muted-foreground">
            Estimate only. Solara confirms the final usable roof area during the installer site
            survey. Imagery © Esri, OSM contributors.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-ink hover:bg-surface-soft"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(areaM2);
                onClose();
              }}
              disabled={areaM2 < 5}
              className="rounded-full bg-cloover px-5 py-2 text-xs font-extrabold text-white shadow hover:bg-cloover/90 disabled:opacity-50"
            >
              Use this roof size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
