"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const TYPE_LABELS: Record<string, string> = {
  meeting: "회의", trip: "출장", conference: "컨퍼런스", dinner: "비즈니스 식사", other: "기타",
};
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function SchedulePage() {
  const [executives, setExecutives] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [calendarDates, setCalendarDates] = useState<string[]>([]);
  const [filterExec, setFilterExec] = useState("all");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [form, setForm] = useState({ exec_id: "", title: "", date: "", time: "", end_date: "", location: "", notes: "", type: "meeting" });

  const loadData = useCallback(async () => {
    try {
      const [execs, cal] = await Promise.all([
        api.getExecutives(),
        api.getCalendarDates(currentYear, currentMonth),
      ]);
      setExecutives(execs);
      setCalendarDates(cal);
      const today = new Date().toISOString().slice(0, 10);
      const params: any = { date_from: today };
      if (filterExec !== "all") params.exec_id = Number(filterExec);
      const scheds = await api.getSchedules(params);
      setSchedules(scheds);
    } catch {}
  }, [currentYear, currentMonth, filterExec]);

  useEffect(() => { loadData(); }, [loadData]);

  function openModal(editItem?: any) {
    if (editItem) {
      setEditData(editItem);
      setForm({
        exec_id: String(editItem.exec_id),
        title: editItem.title,
        date: editItem.date,
        time: editItem.time || "",
        end_date: editItem.end_date || "",
        location: editItem.location || "",
        notes: editItem.notes || "",
        type: editItem.type || "meeting",
      });
    } else {
      setEditData(null);
      setForm({ exec_id: executives[0]?.id?.toString() || "", title: "", date: "", time: "", end_date: "", location: "", notes: "", type: "meeting" });
    }
    setShowModal(true);
  }

  function openModalWithDate(date: string) {
    setEditData(null);
    setForm({ exec_id: executives[0]?.id?.toString() || "", title: "", date, time: "", end_date: "", location: "", notes: "", type: "meeting" });
    setShowModal(true);
  }

  async function saveSchedule() {
    if (!form.title || !form.date || !form.exec_id) { alert("임원, 제목, 날짜를 입력해 주세요."); return; }
    try {
      if (editData) {
        await api.updateSchedule(editData.id, { ...form, exec_id: Number(form.exec_id) });
      } else {
        await api.createSchedule({ ...form, exec_id: Number(form.exec_id) });
      }
      setShowModal(false);
      loadData();
    } catch (e: any) { alert(e.message); }
  }

  async function deleteSchedule(id: number) {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    await api.deleteSchedule(id);
    loadData();
  }

  // 캘린더 렌더링
  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  function changeMonth(delta: number) {
    let m = currentMonth + delta;
    let y = currentYear;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setCurrentMonth(m);
    setCurrentYear(y);
  }

  return (
    <div className="space-y-6">
      {/* 캘린더 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">캘린더</h2>
          <button onClick={() => openModal()} className="bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-600 transition">
            + 새 일정
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1 border-2 border-indigo-500 text-indigo-500 rounded-lg text-sm hover:bg-indigo-50">
            &lt; 이전
          </button>
          <span className="font-semibold text-lg">{currentYear}년 {currentMonth}월</span>
          <button onClick={() => changeMonth(1)} className="px-3 py-1 border-2 border-indigo-500 text-indigo-500 rounded-lg text-sm hover:bg-indigo-50">
            다음 &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {DAYS.map(d => <div key={d} className="text-xs font-semibold text-gray-400 py-2">{d}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="py-2" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;
            const hasEvent = calendarDates.includes(dateStr);
            return (
              <div
                key={day}
                onClick={() => openModalWithDate(dateStr)}
                className={`py-2 rounded-lg cursor-pointer flex flex-col items-center transition text-sm
                  ${isToday ? "bg-indigo-500 text-white font-bold" : "hover:bg-indigo-50"}
                `}
              >
                {day}
                {hasEvent && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? "bg-white" : "bg-red-500"}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 일정 목록 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">전체 일정</h2>
        <select
          value={filterExec}
          onChange={(e) => setFilterExec(e.target.value)}
          className="mb-4 px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm"
        >
          <option value="all">전체 임원</option>
          {executives.map((e: any) => (
            <option key={e.id} value={e.id}>{e.position} {e.name}</option>
          ))}
        </select>

        {schedules.length === 0 ? (
          <p className="text-gray-400 text-center py-6">예정된 일정이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((s: any) => {
              const d = new Date(s.date + "T00:00:00");
              return (
                <div key={s.id} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl px-3 py-2 text-center min-w-[60px]">
                    <div className="text-lg font-bold">{d.getDate()}</div>
                    <div className="text-xs opacity-80">{d.toLocaleDateString("ko", { month: "short" })}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-indigo-500">{s.time || "종일"}{s.end_date ? ` ~ ${s.end_date}` : ""}</div>
                    {s.location && <div className="text-sm text-gray-500">{s.location}</div>}
                    {s.notes && <div className="text-sm text-gray-400">{s.notes}</div>}
                    <div className="flex gap-2 mt-1">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg text-xs font-semibold">
                        {s.exec_position} {s.exec_name}
                      </span>
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg text-xs">
                        {TYPE_LABELS[s.type] || s.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(s)} className="px-2 py-1 border border-indigo-500 text-indigo-500 rounded-lg text-xs hover:bg-indigo-50">수정</button>
                    <button onClick={() => deleteSchedule(s.id)} className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">삭제</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editData ? "일정 수정" : "새 일정 등록"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">임원</label>
                <select value={form.exec_id} onChange={(e) => setForm({ ...form, exec_id: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
                  {executives.map((e: any) => <option key={e.id} value={e.id}>{e.position} {e.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">제목</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" placeholder="일정 제목..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">날짜</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">시간</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">종료일</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">장소</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" placeholder="장소..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">메모</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm" rows={2} placeholder="메모..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">유형</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm">
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={saveSchedule} className="bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-600">저장</button>
              <button onClick={() => setShowModal(false)} className="border-2 border-indigo-500 text-indigo-500 px-5 py-2 rounded-lg text-sm hover:bg-indigo-50">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
