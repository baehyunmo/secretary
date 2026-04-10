"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 6) setGreeting("늦은 시간까지 수고 많으십니다.");
    else if (h < 9) setGreeting("좋은 아침입니다! 오늘의 임원 일정을 확인해 보세요.");
    else if (h < 12) setGreeting("오전 업무 중입니다. 준비할 회의가 있는지 확인하세요.");
    else if (h < 14) setGreeting("점심 시간입니다. 오후 일정도 미리 확인해 두세요.");
    else if (h < 18) setGreeting("오후 업무 중입니다. 남은 일정을 잘 마무리하세요!");
    else setGreeting("수고하셨습니다. 내일 일정을 미리 확인해 보세요.");

    api.getStats().then(setStats).catch(() => {});
    api.getTodaySchedules().then(setTodaySchedules).catch(() => {});
    api.getUpcomingTrips().then(setUpcomingTrips).catch(() => {});
  }, []);

  const TYPE_LABELS: Record<string, string> = {
    meeting: "회의", trip: "출장", conference: "컨퍼런스", dinner: "비즈니스 식사", other: "기타",
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm text-center text-gray-600 text-base md:text-lg">
        {greeting}
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            { label: "전체 임원", value: stats.totalExecs },
            { label: "예정 일정", value: stats.upcomingSchedules },
            { label: "예정 출장", value: stats.upcomingTrips },
            { label: "이번 달 일정", value: stats.thisMonth },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-3 md:p-4 shadow-sm text-center">
              <div className="text-2xl md:text-3xl font-bold text-indigo-500">{s.value}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">오늘의 일정</h2>
        {todaySchedules.length === 0 ? (
          <p className="text-gray-400 text-center py-4 md:py-6 text-sm">오늘 예정된 일정이 없습니다.</p>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {todaySchedules.map((s: any) => (
              <div key={s.id} className="flex items-start gap-3 py-2.5 md:py-3 border-b border-gray-100 last:border-0">
                <div className="bg-indigo-500 text-white rounded-xl px-2.5 py-1.5 md:px-3 md:py-2 text-center min-w-[50px] md:min-w-[60px]">
                  <div className="text-xs md:text-sm font-bold">{s.time || "종일"}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm md:text-base truncate">{s.title}</div>
                  {s.location && <div className="text-xs md:text-sm text-gray-500 truncate">{s.location}</div>}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg text-[10px] md:text-xs font-semibold">
                      {s.exec_position} {s.exec_name}
                    </span>
                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-[10px] md:text-xs">
                      {TYPE_LABELS[s.type] || s.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">예정된 출장</h2>
        {upcomingTrips.length === 0 ? (
          <p className="text-gray-400 text-center py-4 md:py-6 text-sm">예정된 출장이 없습니다.</p>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {upcomingTrips.map((t: any) => (
              <div key={t.id} className="flex items-start gap-3 py-2.5 md:py-3 border-b border-gray-100 last:border-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl px-2.5 py-1.5 md:px-3 md:py-2 text-center min-w-[50px] md:min-w-[60px]">
                  <div className="text-base md:text-lg font-bold">{new Date(t.date + "T00:00:00").getDate()}</div>
                  <div className="text-[10px] md:text-xs opacity-80">{new Date(t.date + "T00:00:00").toLocaleDateString("ko", { month: "short" })}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm md:text-base truncate">{t.exec_name}: {t.from_name} → {t.to_name}</div>
                  <div className="text-xs md:text-sm text-indigo-500">{t.date} ~ {t.return_date || "미정"}</div>
                  <div className="text-xs md:text-sm text-gray-500 truncate">노선: {t.route || "미정"} | 호텔: {t.hotel || "미정"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
