"use client";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { AIRPORTS, LAYOVERS, HOTELS, DEPARTURE_CITIES, DESTINATION_CITIES, getLayoverKey, getTransportAdvice } from "@/lib/trip-data";
import type { RouteOption, HotelOption } from "@/lib/trip-data";
import { DESTINATION_INFO } from "@/lib/destination-info";
import { fetchWeather, fetchExchangeRate } from "@/lib/external-api";

// Leaflet JS 동적 로드 (한 번만)
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = () => reject(new Error("Leaflet 로드 실패"));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

// 예약 사이트 URL 생성
function flightBookingUrl(from: string, to: string, date: string, returnDate: string): string {
  const d = date || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const r = returnDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  // Skyscanner: yymmdd 형식
  const fmt = (s: string) => s.slice(2).replace(/-/g, "");
  return `https://www.skyscanner.co.kr/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${fmt(d)}/${fmt(r)}/`;
}

function hotelBookingUrl(cityName: string, hotelName: string, date: string, returnDate: string): string {
  const checkin = date || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const checkout = returnDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const query = encodeURIComponent(`${hotelName} ${cityName}`);
  return `https://www.booking.com/searchresults.ko.html?ss=${query}&checkin=${checkin}&checkout=${checkout}`;
}

function googleFlightsUrl(from: string, to: string, date: string, returnDate: string): string {
  const d = date || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const r = returnDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  return `https://www.google.com/travel/flights?q=Flights%20from%20${from}%20to%20${to}%20on%20${d}%20returning%20${r}`;
}

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
  const [mapLoading, setMapLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [comparedRoutes, setComparedRoutes] = useState<Set<number>>(new Set());
  const [destWeather, setDestWeather] = useState<any>(null);
  const [destRate, setDestRate] = useState<number | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getExecutives().then((execs) => {
      setExecutives(execs);
      if (execs.length > 0) setExecId(String(execs[0].id));
    }).catch(() => {});
  }, []);

  // 컴포넌트 언마운트 시 지도 정리
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
    };
  }, []);

  async function searchTrip() {
    if (!toCode) { alert("도착 도시를 선택해 주세요."); return; }
    setSelectedRoute(null);
    setSelectedHotel(null);
    setRouteSummary("");

    const key = getLayoverKey(fromCode, toCode);
    setRoutes(key ? LAYOVERS[key] : []);
    setHotels(HOTELS[toCode] || []);
    setShowResults(true);
    setComparedRoutes(new Set());

    // 현지 정보 조회
    const airport = AIRPORTS[toCode];
    if (airport) {
      fetchWeather(airport.lat, airport.lng).then(setDestWeather);
    }
    const info = DESTINATION_INFO[toCode];
    if (info?.currency) {
      fetchExchangeRate("KRW", info.currency).then(setDestRate);
    } else {
      setDestRate(null);
    }

    // Leaflet 로드 후 지도 초기화
    setMapLoading(true);
    try {
      await loadLeaflet();
      // DOM이 렌더링될 시간을 줌
      setTimeout(() => {
        initMap();
        setMapLoading(false);
      }, 100);
    } catch {
      setMapLoading(false);
      alert("지도를 불러올 수 없습니다. 인터넷 연결을 확인해 주세요.");
    }
  }

  function initMap() {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapRef.current) {
      try { mapRef.current.remove(); } catch {}
      mapRef.current = null;
    }

    const airport = AIRPORTS[toCode];
    if (!airport) return;

    const map = L.map(mapContainerRef.current).setView([airport.lat, airport.lng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    L.marker([airport.lat, airport.lng])
      .addTo(map)
      .bindPopup(`<b>${airport.name}</b><br/>공항`)
      .openPopup();

    const hotelList = HOTELS[toCode] || [];
    hotelList.forEach((h, i) => {
      L.marker([h.lat, h.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:#667eea;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(map).bindPopup(`<b>${h.name}</b><br>${h.area} | ${h.price}`);
    });

    // 모든 마커가 보이게 fit
    if (hotelList.length > 0) {
      const bounds = L.latLngBounds([
        [airport.lat, airport.lng],
        ...hotelList.map((h) => [h.lat, h.lng]),
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    mapRef.current = map;

    // 컨테이너 크기 변경 대응
    setTimeout(() => map.invalidateSize(), 200);
  }

  function selectHotel(idx: number) {
    setSelectedHotel(idx);
    const hotel = (HOTELS[toCode] || [])[idx];
    const airport = AIRPORTS[toCode];
    if (!hotel || !airport || !mapRef.current) return;

    const L = (window as any).L;
    const map = mapRef.current;

    map.eachLayer((l: any) => {
      if (l instanceof L.Polyline) map.removeLayer(l);
    });

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
    if (!execId) { alert("임원을 먼저 선택하거나 등록해 주세요."); return; }
    if (!toCode || !tripDate) { alert("도착 도시와 출발일을 입력해 주세요."); return; }

    setSaving(true);
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
      alert("✅ 출장 계획이 저장되었습니다!\n일정에도 자동 등록되었습니다.");
    } catch (e: any) {
      alert("저장 실패: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  const tagClass: Record<string, string> = {
    "추천": "bg-green-100 text-green-700",
    "최단시간": "bg-orange-100 text-orange-700",
    "최저가": "bg-blue-100 text-blue-700",
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">해외 출장 플래너</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">임원</label>
            <select value={execId} onChange={(e) => setExecId(e.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
              {executives.length === 0 && <option value="">-- 등록된 임원 없음 --</option>}
              {executives.map((e: any) => <option key={e.id} value={e.id}>{e.position} {e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">출발 도시</label>
            <select value={fromCode} onChange={(e) => setFromCode(e.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
              {DEPARTURE_CITIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">도착 도시</label>
            <select value={toCode} onChange={(e) => setToCode(e.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
              <option value="">-- 선택 --</option>
              {DESTINATION_CITIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">출발일</label>
            <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">귀국일</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
          </div>
          <div className="col-span-2 md:col-span-1 flex items-end">
            <button onClick={searchTrip} className="w-full bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-indigo-600 transition active:scale-95 font-semibold">
              🔍 노선 및 호텔 검색
            </button>
          </div>
        </div>
      </div>

      {showResults && (
        <>
          {/* 현지 정보 패널 */}
          {DESTINATION_INFO[toCode] && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 md:p-5 border-2 border-indigo-100">
              <h3 className="font-semibold text-sm md:text-base mb-3">🌍 {AIRPORTS[toCode]?.city} 현지 정보</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">시차</div>
                  <div className="font-semibold">
                    KST {DESTINATION_INFO[toCode].tzOffset >= 0 ? "+" : ""}{DESTINATION_INFO[toCode].tzOffset}h
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">비자</div>
                  <div className="font-semibold text-[11px]">{DESTINATION_INFO[toCode].visa}</div>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">환율 (1,000원)</div>
                  <div className="font-semibold">
                    {destRate ? `≈ ${(destRate * 1000).toFixed(2)} ${DESTINATION_INFO[toCode].currency}` : DESTINATION_INFO[toCode].currency}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-400">날씨</div>
                  <div className="font-semibold text-[11px]">
                    {destWeather ? `${destWeather.temp}°C ${destWeather.desc}` : "조회 중..."}
                  </div>
                </div>
              </div>
              {DESTINATION_INFO[toCode].notes && DESTINATION_INFO[toCode].notes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-indigo-100">
                  <div className="text-[10px] text-gray-400 mb-1">⚠️ 주의사항</div>
                  <ul className="text-[11px] md:text-xs text-gray-700 space-y-0.5">
                    {DESTINATION_INFO[toCode].notes.map((n, i) => <li key={i}>• {n}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 추천 노선 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2 border-b flex-wrap gap-2">
              <h3 className="font-semibold text-sm md:text-base">✈️ 추천 항공 노선</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setCompareMode(!compareMode); setComparedRoutes(new Set()); }}
                  className={`text-xs px-2.5 py-1 rounded-lg border-2 transition active:scale-95 ${
                    compareMode ? "bg-indigo-500 text-white border-indigo-500" : "border-gray-200 text-gray-600"
                  }`}
                >
                  {compareMode ? "비교 종료" : "🔀 비교"}
                </button>
                <a
                  href={googleFlightsUrl(fromCode, toCode, tripDate, returnDate)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-500 hover:underline"
                >
                  Google Flights →
                </a>
              </div>
            </div>

            {/* 비교 뷰 */}
            {compareMode && comparedRoutes.size > 0 && (
              <div className="mb-3 p-3 bg-indigo-50 rounded-xl">
                <div className="text-xs font-semibold text-indigo-700 mb-2">선택한 노선 비교 ({comparedRoutes.size}개)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-1 pr-2">유형</th>
                        <th className="py-1 pr-2">소요</th>
                        <th className="py-1">특징</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(comparedRoutes).sort().map((idx) => {
                        const r = routes[idx];
                        if (!r) return null;
                        return (
                          <tr key={idx} className="border-t border-indigo-200">
                            <td className="py-1.5 pr-2 font-semibold">{r.stops.length === 0 ? "직항" : r.stops.join(",")}</td>
                            <td className="py-1.5 pr-2">{r.duration}</td>
                            <td className="py-1.5 text-gray-600">{r.tags.join(", ") || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {routes.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">사전 등록된 노선 정보가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {routes.map((r, i) => (
                  <div
                    key={i}
                    className={`p-3 md:p-4 rounded-xl border-2 transition ${
                      selectedRoute === i ? "border-indigo-500 bg-indigo-50" : comparedRoutes.has(i) ? "border-purple-400 bg-purple-50" : "border-gray-100"
                    }`}
                  >
                    {compareMode && (
                      <label className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comparedRoutes.has(i)}
                          onChange={() => {
                            const next = new Set(comparedRoutes);
                            if (next.has(i)) next.delete(i); else next.add(i);
                            setComparedRoutes(next);
                          }}
                          className="w-4 h-4 accent-indigo-500"
                        />
                        <span className="text-xs text-gray-600">비교에 추가</span>
                      </label>
                    )}
                    <div onClick={() => !compareMode && setSelectedRoute(i)} className={!compareMode ? "cursor-pointer active:scale-[0.99]" : ""}>
                      <div className="font-semibold text-sm md:text-base">
                        {r.stops.length === 0 ? "직항" : `경유: ${r.stops.join(", ")}`} ({r.duration})
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 mt-1">{r.note}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.tags.map((t) => (
                          <span key={t} className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${tagClass[t] || "bg-gray-100 text-gray-500"}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <a
                        href={flightBookingUrl(fromCode, toCode, tripDate, returnDate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-500 text-white text-xs text-center py-2 rounded-lg hover:bg-blue-600 transition active:scale-95 font-semibold"
                      >
                        Skyscanner 가격 비교
                      </a>
                      <a
                        href={`https://www.koreanair.com/booking/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-sky-600 text-white text-xs text-center py-2 rounded-lg hover:bg-sky-700 transition active:scale-95 font-semibold"
                      >
                        대한항공
                      </a>
                      <a
                        href={`https://flyasiana.com/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-red-500 text-white text-xs text-center py-2 rounded-lg hover:bg-red-600 transition active:scale-95 font-semibold"
                      >
                        아시아나
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 추천 호텔 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h3 className="font-semibold text-sm md:text-base">🏨 추천 호텔</h3>
              <a
                href={`https://www.booking.com/searchresults.ko.html?ss=${encodeURIComponent(AIRPORTS[toCode]?.city || toCode)}&checkin=${tripDate}&checkout=${returnDate}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline"
              >
                Booking.com에서 더 보기 →
              </a>
            </div>
            {hotels.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">호텔 정보가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {hotels.map((h, i) => (
                  <div
                    key={i}
                    className={`p-3 md:p-4 rounded-xl border-2 transition ${
                      selectedHotel === i ? "border-indigo-500 bg-indigo-50" : "border-gray-100"
                    }`}
                  >
                    <div onClick={() => selectHotel(i)} className="cursor-pointer active:scale-[0.99]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm md:text-base">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-500 text-white rounded-full text-[10px] font-bold mr-2">{i + 1}</span>
                            {h.name}
                          </div>
                          <div className="text-amber-400 text-xs md:text-sm mt-0.5">
                            {"★".repeat(h.stars)}{"☆".repeat(5 - h.stars)}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500 mt-0.5">{h.area} | {h.price}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{h.note}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <a
                        href={hotelBookingUrl(AIRPORTS[toCode]?.city || toCode, h.name, tripDate, returnDate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white text-xs text-center py-2 rounded-lg hover:bg-blue-700 transition active:scale-95 font-semibold"
                      >
                        Booking.com 예약
                      </a>
                      <a
                        href={`https://www.agoda.com/search?city=${encodeURIComponent(AIRPORTS[toCode]?.city || toCode)}&textToSearch=${encodeURIComponent(h.name)}&checkin=${tripDate}&checkout=${returnDate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-orange-500 text-white text-xs text-center py-2 rounded-lg hover:bg-orange-600 transition active:scale-95 font-semibold"
                      >
                        Agoda 예약
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 지도 */}
          <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
            <h3 className="font-semibold mb-3 pb-2 border-b text-sm md:text-base">🗺️ 공항에서 호텔까지 동선</h3>
            <div className="relative">
              <div ref={mapContainerRef} className="h-[280px] md:h-[400px] rounded-xl bg-gray-100" />
              {mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-xl">
                  <div className="text-sm text-gray-500">지도를 불러오는 중...</div>
                </div>
              )}
            </div>
            {!routeSummary && !mapLoading && (
              <p className="text-xs text-gray-400 mt-3 text-center">호텔을 선택하면 동선이 표시됩니다.</p>
            )}
            {routeSummary && (
              <div className="bg-indigo-50 rounded-xl p-4 mt-4" dangerouslySetInnerHTML={{ __html: routeSummary }} />
            )}
          </div>

          <div className="text-center pb-4 md:pb-6">
            <button
              onClick={saveTripPlan}
              disabled={saving}
              className="w-full md:w-auto bg-green-500 text-white px-8 py-3 rounded-xl text-sm hover:bg-green-600 transition font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "저장 중..." : "💾 출장 계획 저장"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
