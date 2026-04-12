"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AIRPORTS, HOTELS, getTransportAdvice } from "@/lib/trip-data";
import { DESTINATION_INFO, getChecklist } from "@/lib/destination-info";
import { fetchWeather, fetchExchangeRate } from "@/lib/external-api";

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

function TripDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    api.getTrip(Number(id))
      .then((t) => { setTrip(t); setLoading(false); })
      .catch(() => { setLoading(false); alert("출장 정보를 불러올 수 없습니다."); });
  }, [id]);

  useEffect(() => {
    if (!trip) return;
    const airport = AIRPORTS[trip.to_code];
    if (!airport) return;
    fetchWeather(airport.lat, airport.lng).then(setWeather);
    const info = DESTINATION_INFO[trip.to_code];
    if (info?.currency) fetchExchangeRate("KRW", info.currency).then(setExchangeRate);
    loadLeaflet().then(() => initMap()).catch(() => {});
    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch {}
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip]);

  function initMap() {
    if (!trip || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch {}
      mapRef.current = null;
    }
    const airport = AIRPORTS[trip.to_code];
    if (!airport) return;

    const map = L.map(mapContainerRef.current).setView([airport.lat, airport.lng], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap", maxZoom: 19,
    }).addTo(map);

    L.marker([airport.lat, airport.lng]).addTo(map).bindPopup(`<b>${airport.name}</b>`);

    const hotels = HOTELS[trip.to_code] || [];
    const matchedHotel = hotels.find((h) => h.name === trip.hotel);

    if (matchedHotel) {
      L.marker([matchedHotel.lat, matchedHotel.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:#27ae60;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">🏨</div>`,
          iconSize: [32, 32], iconAnchor: [16, 16],
        }),
      }).addTo(map).bindPopup(`<b>${matchedHotel.name}</b><br>${matchedHotel.area}`);

      const line = L.polyline([[airport.lat, airport.lng], [matchedHotel.lat, matchedHotel.lng]], {
        color: "#667eea", weight: 4, dashArray: "10,8", opacity: 0.8,
      }).addTo(map);
      map.fitBounds(line.getBounds().pad(0.3));
    }

    setTimeout(() => map.invalidateSize(), 200);
    mapRef.current = map;
  }

  function toggleCheck(item: string) {
    const next = new Set(checkedItems);
    if (next.has(item)) next.delete(item); else next.add(item);
    setCheckedItems(next);
  }

  async function deleteTrip() {
    if (!confirm("이 출장을 삭제하시겠습니까?")) return;
    await api.deleteTrip(Number(id));
    router.push("/");
  }

  if (loading) return <div className="text-center py-10 text-gray-400">불러오는 중...</div>;
  if (!trip) return <div className="text-center py-10 text-gray-400">출장 정보를 찾을 수 없습니다.</div>;

  const info = DESTINATION_INFO[trip.to_code];
  const checklist = getChecklist(trip.to_code);
  const dayCount = trip.return_date
    ? Math.ceil((new Date(trip.return_date).getTime() - new Date(trip.date).getTime()) / 86400000) + 1
    : null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 액션 바 */}
      <div className="flex flex-wrap gap-2 no-print">
        <button onClick={() => router.back()} className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm hover:bg-gray-50 active:scale-95">
          ← 뒤로
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 active:scale-95 font-semibold">
          🖨️ 인쇄 / PDF 저장
        </button>
        <button onClick={deleteTrip} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 active:scale-95 ml-auto">
          삭제
        </button>
      </div>

      {/* 인쇄용 헤더 */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-300">
        <h1 className="text-2xl font-bold">출장 계획서</h1>
        <p className="text-sm text-gray-500 mt-1">발행일: {new Date().toLocaleDateString("ko-KR")}</p>
      </div>

      {/* 출장 개요 */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm print:shadow-none print:border print:border-gray-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">출장자</div>
            <h2 className="text-xl md:text-2xl font-bold">{trip.exec_position} {trip.exec_name}</h2>
            {trip.exec_dept && <p className="text-sm text-gray-500">{trip.exec_dept}</p>}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">기간</div>
            <div className="font-semibold">{trip.date}</div>
            <div className="text-sm text-gray-500">~ {trip.return_date || "미정"}</div>
            {dayCount && <div className="text-xs text-indigo-500 mt-1">{dayCount}일 일정</div>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-400">출발</div>
            <div className="font-semibold text-sm">{trip.from_name}</div>
            <div className="text-xs text-gray-500">{trip.from_code}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">도착</div>
            <div className="font-semibold text-sm">{trip.to_name}</div>
            <div className="text-xs text-gray-500">{trip.to_code}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">노선</div>
            <div className="font-semibold text-sm">{trip.route || "미정"}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">호텔</div>
            <div className="font-semibold text-sm">{trip.hotel || "미정"}</div>
            {trip.hotel_area && <div className="text-xs text-gray-500">{trip.hotel_area}</div>}
          </div>
        </div>
      </div>

      {/* 임원 선호도 */}
      {(trip.preferred_airline || trip.seat_class || trip.hotel_grade || trip.dietary || trip.passport_no) && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm print:shadow-none print:border print:border-gray-300">
          <h3 className="font-semibold mb-3 pb-2 border-b text-sm md:text-base">⭐ 임원 선호 사항</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {trip.preferred_airline && <div><span className="text-gray-400">선호 항공사:</span> <b>{trip.preferred_airline}</b></div>}
            {trip.seat_class && <div><span className="text-gray-400">좌석 등급:</span> <b>{trip.seat_class}</b></div>}
            {trip.hotel_grade && <div><span className="text-gray-400">호텔 등급:</span> <b>{trip.hotel_grade}</b></div>}
            {trip.preferred_hotel_chain && <div><span className="text-gray-400">선호 체인:</span> <b>{trip.preferred_hotel_chain}</b></div>}
            {trip.dietary && <div className="col-span-2"><span className="text-gray-400">식이 사항:</span> <b>{trip.dietary}</b></div>}
            {trip.passport_no && (
              <div className="col-span-2">
                <span className="text-gray-400">여권:</span> <b>{trip.passport_no}</b>
                {trip.passport_expiry && <span className="text-gray-500"> (만료: {trip.passport_expiry})</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 현지 정보 */}
      {info && (
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm print:shadow-none print:border print:border-gray-300">
          <h3 className="font-semibold mb-3 pb-2 border-b text-sm md:text-base">🌍 현지 정보</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-gray-400">시차</div>
              <div className="font-semibold">{info.timezone} (KST {info.tzOffset >= 0 ? "+" : ""}{info.tzOffset}h)</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">비자</div>
              <div className="font-semibold text-xs">{info.visa}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">통화 (1,000원)</div>
              <div className="font-semibold">
                {exchangeRate ? `≈ ${(exchangeRate * 1000).toFixed(2)} ${info.currency}` : info.currency}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">콘센트</div>
              <div className="font-semibold text-xs">{info.plug} / {info.voltage}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">팁 문화</div>
              <div className="font-semibold text-xs">{info.tip}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">긴급 전화</div>
              <div className="font-semibold text-xs">{info.emergency}</div>
            </div>
            {weather && (
              <div className="col-span-2 md:col-span-3 mt-2 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400">현재 날씨</div>
                <div className="font-semibold">{weather.temp}°C · {weather.desc}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 동선 지도 */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm no-print">
        <h3 className="font-semibold mb-3 pb-2 border-b text-sm md:text-base">🗺️ 공항 → 호텔 동선</h3>
        <div ref={mapContainerRef} className="h-[300px] md:h-[400px] rounded-xl bg-gray-100" />
        <div className="mt-3 p-3 bg-indigo-50 rounded-xl text-sm">
          <strong>교통 추천:</strong> {trip.transport_note || getTransportAdvice(trip.to_code)}
        </div>
      </div>

      {/* 출장 준비 체크리스트 */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm print:shadow-none print:border print:border-gray-300">
        <h3 className="font-semibold mb-4 pb-2 border-b text-sm md:text-base">✅ 출장 준비 체크리스트</h3>
        <div className="space-y-4">
          {checklist.map((cat) => (
            <div key={cat.category}>
              <div className="font-semibold text-sm mb-2">{cat.category}</div>
              <div className="space-y-1.5 pl-2">
                {cat.items.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  const checked = checkedItems.has(key);
                  return (
                    <label key={i} className="flex items-start gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCheck(key)}
                        className="mt-0.5 w-4 h-4 accent-indigo-500"
                      />
                      <span className={checked ? "text-gray-400 line-through" : ""}>{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden print:block text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-300">
        본 계획서는 출장 일정 관리 시스템에서 생성되었습니다.
      </div>
    </div>
  );
}

export default function TripDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-gray-400">불러오는 중...</div>}>
      <TripDetailContent />
    </Suspense>
  );
}
