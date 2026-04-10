"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { AIRPORTS, LAYOVERS, HOTELS, DEPARTURE_CITIES, DESTINATION_CITIES, getLayoverKey, getTransportAdvice } from "@/lib/trip-data";
import type { RouteOption, HotelOption } from "@/lib/trip-data";

export default function TripPage() {
  const [executives, setExecutives] = useState<any[]>([]);
  const [execId, setExecId] = useState("");
  const [fromCode, setFromCode] = useState("ICN");
  const [toCode, setToCode] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [routeSummary, setRouteSummary] = useState<string>("");
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getExecutives().then((execs) => {
      setExecutives(execs);
      if (execs.length > 0) setExecId(String(execs[0].id));
    }).catch(() => {});
  }, []);

  function searchTrip() {
    if (!toCode) { alert("도착 도시를 선택해 주세요."); return; }
    setSelectedRoute(null);
    setSelectedHotel(null);
    setRouteSummary("");

    const key = getLayoverKey(fromCode, toCode);
    setRoutes(key ? LAYOVERS[key] : []);
    setHotels(HOTELS[toCode] || []);
    setShowResults(true);

    setTimeout(() => initMap(), 200);
  }

  function initMap() {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    const airport = AIRPORTS[toCode];
    if (!airport) return;

    const map = L.map(mapContainerRef.current).setView([airport.lat, airport.lng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(map);
    L.marker([airport.lat, airport.lng]).addTo(map).bindPopup(`<b>${airport.name}</b>`).openPopup();

    const hotelList = HOTELS[toCode] || [];
    hotelList.forEach((h, i) => {
      L.marker([h.lat, h.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:#667eea;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [24, 24], iconAnchor: [12, 12],
        }),
      }).addTo(map).bindPopup(`<b>${h.name}</b><br>${h.area} | ${h.price}`);
    });

    mapRef.current = map;
  }

  function selectHotel(idx: number) {
    setSelectedHotel(idx);
    const hotel = (HOTELS[toCode] || [])[idx];
    const airport = AIRPORTS[toCode];
    if (!hotel || !airport || !mapRef.current) return;

    const L = (window as any).L;
    const map = mapRef.current;

    map.eachLayer((l: any) => { if (l instanceof L.Polyline) map.removeLayer(l); });

    const line = L.polyline([[airport.lat, airport.lng], [hotel.lat, hotel.lng]], {
      color: "#667eea", weight: 4, dashArray: "10,8", opacity: 0.8,
    }).addTo(map);
    map.fitBounds(line.getBounds().pad(0.3));

    const R = 6371;
    const dLat = ((hotel.lat - airport.lat) * Math.PI) / 180;
    const dLng = ((hotel.lng - airport.lng) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((airport.lat * Math.PI) / 180) * Math.cos((hotel.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const taxiMin = Math.round((dist / 40) * 60);

    setRouteSummary(`
      <h4 class="font-semibold mb-2">동선: ${airport.name} → ${hotel.name}</h4>
      <p class="text-sm text-gray-600 mb-3">예상 거리: 약 ${dist.toFixed(1)}km | 택시 약 ${taxiMin}분</p>
      <div class="space-y-2">
        <div class="flex gap-3"><span class="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span><span class="text-sm"><b>도착</b> - ${airport.name} 입국 심사 후 수하물 수령</span></div>
        <div class="flex gap-3"><span class="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span><span class="text-sm"><b>교통</b> - ${getTransportAdvice(toCode)}</span></div>
        <div class="flex gap-3"><span class="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span><span class="text-sm"><b>이동</b> - ${hotel.area} 방면, 약 ${taxiMin}분 소요</span></div>
        <div class="flex gap-3"><span class="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span><span class="text-sm"><b>도착</b> - ${hotel.name} (${hotel.area}) 체크인</span></div>
      </div>
    `);
  }

  async function saveTripPlan() {
    if (!toCode || !tripDate) { alert("도착 도시와 출발일을 입력해 주세요."); return; }
    const route = selectedRoute !== null ? routes[selectedRoute] : null;
    const hotel = selectedHotel !== null ? hotels[selectedHotel] : null;

    try {
      await api.createTrip({
        exec_id: Number(execId),
        from_code: fromCode,
        to_code: toCode,
        from_name: AIRPORTS[fromCode]?.city || fromCode,
        to_name: AIRPORTS[toCode]?.city || toCode,
        date: tripDate,
        return_date: returnDate,
        route: route ? `${route.type} (${route.duration})` : "미정",
        hotel: hotel?.name || "미정",
        hotel_area: hotel?.area || "",
        transport_note: getTransportAdvice(toCode),
      });
      alert("출장 계획이 저장되었습니다! 일정에도 자동 등록됩니다.");
    } catch (e: any) { alert(e.message); }
  }

  const tagClass: Record<string, string> = {
    "추천": "bg-green-100 text-green-700",
    "최단시간": "bg-orange-100 text-orange-700",
    "최저가": "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">해외 출장 플래너</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">임원</label>
            <select value={execId} onChange={(e) => setExecId(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
              {executives.map((e: any) => <option key={e.id} value={e.id}>{e.position} {e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">출발 도시</label>
            <select value={fromCode} onChange={(e) => setFromCode(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
              {DEPARTURE_CITIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">도착 도시</label>
            <select value={toCode} onChange={(e) => setToCode(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
              <option value="">-- 선택 --</option>
              {DESTINATION_CITIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">출발일</label>
            <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">귀국일</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={searchTrip} className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-600 transition">
              노선 및 호텔 검색
            </button>
          </div>
        </div>
      </div>

      {showResults && (
        <>
          {/* 추천 노선 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3 pb-2 border-b">추천 항공 노선</h3>
            {routes.length === 0 ? (
              <p className="text-gray-400 text-sm">사전 등록된 노선 정보가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {routes.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedRoute(i)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedRoute === i ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-indigo-300"}`}
                  >
                    <div className="font-semibold">{r.stops.length === 0 ? "직항" : `경유: ${r.stops.join(", ")}`} ({r.duration})</div>
                    <div className="text-sm text-gray-500 mt-1">{r.note}</div>
                    <div className="flex gap-1 mt-2">
                      {r.tags.map((t) => (
                        <span key={t} className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${tagClass[t] || "bg-gray-100 text-gray-500"}`}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 추천 호텔 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3 pb-2 border-b">추천 호텔</h3>
            {hotels.length === 0 ? (
              <p className="text-gray-400 text-sm">호텔 정보가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {hotels.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => selectHotel(i)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${selectedHotel === i ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-indigo-300"}`}
                  >
                    <div className="font-semibold">{h.name}</div>
                    <div className="text-amber-400 text-sm">{"★".repeat(h.stars)}{"☆".repeat(5 - h.stars)}</div>
                    <div className="text-sm text-gray-500">{h.area} | {h.price} | {h.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 지도 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3 pb-2 border-b">공항에서 호텔까지 동선</h3>
            <div ref={mapContainerRef} className="h-[400px] rounded-xl" />
            {routeSummary && (
              <div className="bg-indigo-50 rounded-xl p-4 mt-4" dangerouslySetInnerHTML={{ __html: routeSummary }} />
            )}
          </div>

          <div className="text-center pb-6">
            <button onClick={saveTripPlan} className="bg-green-500 text-white px-8 py-3 rounded-xl text-sm hover:bg-green-600 transition font-semibold">
              출장 계획 저장
            </button>
          </div>
        </>
      )}
    </div>
  );
}
