"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

const POSITIONS = ["회장", "부회장", "대표이사", "사장", "부사장", "전무", "상무", "이사", "기타"];
const COLORS = ["#667eea", "#764ba2", "#e74c3c", "#27ae60", "#f39c12", "#3498db", "#e67e22", "#9b59b6"];

function posClass(pos: string) {
  if (["회장", "부회장"].includes(pos)) return "bg-amber-100 text-amber-700";
  if (["대표이사", "사장"].includes(pos)) return "bg-gray-200 text-gray-700";
  if (["부사장", "전무"].includes(pos)) return "bg-blue-100 text-blue-700";
  if (["상무", "이사"].includes(pos)) return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-500";
}

export default function AdminPage() {
  const [executives, setExecutives] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", position: "상무", dept: "", phone: "", email: "", note: "",
    preferred_airline: "", seat_class: "비즈니스", hotel_grade: "5성",
    preferred_hotel_chain: "", dietary: "", passport_no: "", passport_expiry: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [execs, st] = await Promise.all([api.getExecutives(), api.getStats()]);
      setExecutives(execs);
      setStats(st);
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function addExec() {
    if (!form.name) { alert("이름을 입력해 주세요."); return; }
    try {
      await api.createExecutive(form);
      setForm({
        name: "", position: "상무", dept: "", phone: "", email: "", note: "",
        preferred_airline: "", seat_class: "비즈니스", hotel_grade: "5성",
        preferred_hotel_chain: "", dietary: "", passport_no: "", passport_expiry: "",
      });
      setShowAddForm(false);
      loadData();
    } catch (e: any) { alert(e.message); }
  }

  function openEdit(exec: any) {
    setEditData(exec);
    setForm({
      name: exec.name, position: exec.position, dept: exec.dept || "",
      phone: exec.phone || "", email: exec.email || "", note: exec.note || "",
      preferred_airline: exec.preferred_airline || "",
      seat_class: exec.seat_class || "비즈니스",
      hotel_grade: exec.hotel_grade || "5성",
      preferred_hotel_chain: exec.preferred_hotel_chain || "",
      dietary: exec.dietary || "",
      passport_no: exec.passport_no || "",
      passport_expiry: exec.passport_expiry || "",
    });
    setShowModal(true);
  }

  async function saveEdit() {
    if (!form.name) { alert("이름을 입력해 주세요."); return; }
    try {
      await api.updateExecutive(editData.id, form);
      setShowModal(false);
      loadData();
    } catch (e: any) { alert(e.message); }
  }

  async function deleteExec(id: number, name: string) {
    if (!confirm(`"${name}" 임원을 삭제하시겠습니까?`)) return;
    await api.deleteExecutive(id);
    loadData();
  }

  async function openDetail(id: number) {
    try {
      const detail = await api.getExecutive(id);
      setShowDetail(detail);
    } catch {}
  }

  const filtered = executives.filter((e) => {
    if (filterPos !== "all" && e.position !== filterPos) return false;
    if (search) {
      const hay = `${e.name} ${e.position} ${e.dept} ${e.phone} ${e.email}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 통계 */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            { label: "전체 임원", val: stats.totalExecs },
            { label: "예정 일정", val: stats.upcomingSchedules },
            { label: "예정 출장", val: stats.upcomingTrips },
            { label: "이번 달 일정", val: stats.thisMonth },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-3 md:p-4 shadow-sm text-center">
              <div className="text-2xl md:text-3xl font-bold text-indigo-500">{s.val}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 임원 등록 - 모바일 토글 */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-base md:text-lg font-semibold">새 임원 등록</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="md:hidden text-indigo-500 text-sm active:scale-95">
            {showAddForm ? "접기" : "펼치기"}
          </button>
        </div>
        <div className={`mt-4 ${showAddForm ? "block" : "hidden md:block"}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">이름</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="홍길동" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">직위</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">부서</label>
              <input value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} placeholder="경영기획실" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">연락처</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">이메일</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@company.com" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">비고</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="특이사항..." className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
            </div>
          </div>

          {/* 출장 선호도 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">⭐ 출장 선호 사항</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">선호 항공사</label>
                <input value={form.preferred_airline} onChange={(e) => setForm({ ...form, preferred_airline: e.target.value })} placeholder="대한항공, 에미레이트..." className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">좌석 등급</label>
                <select value={form.seat_class} onChange={(e) => setForm({ ...form, seat_class: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
                  <option>퍼스트</option>
                  <option>비즈니스</option>
                  <option>프리미엄 이코노미</option>
                  <option>이코노미</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">호텔 등급</label>
                <select value={form.hotel_grade} onChange={(e) => setForm({ ...form, hotel_grade: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
                  <option>5성</option>
                  <option>4성</option>
                  <option>3성</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">선호 호텔 체인</label>
                <input value={form.preferred_hotel_chain} onChange={(e) => setForm({ ...form, preferred_hotel_chain: e.target.value })} placeholder="메리어트, 힐튼..." className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">식이 사항</label>
                <input value={form.dietary} onChange={(e) => setForm({ ...form, dietary: e.target.value })} placeholder="채식, 할랄..." className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">여권 만료일</label>
                <input type="date" value={form.passport_expiry} onChange={(e) => setForm({ ...form, passport_expiry: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
              </div>
            </div>
          </div>

          <button onClick={addExec} className="w-full md:w-auto bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-indigo-600 active:scale-95">임원 등록</button>
        </div>
      </div>

      {/* 임원 목록 */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 pb-3 border-b">임원 목록</h2>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름, 직위, 부서 검색..." className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
          <select value={filterPos} onChange={(e) => setFilterPos(e.target.value)} className="px-3 py-2.5 border-2 border-gray-200 rounded-lg">
            <option value="all">전체 직위</option>
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-6 text-sm">등록된 임원이 없습니다.</p>
        ) : (
          <>
            {/* 데스크톱: 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 px-2 text-xs text-gray-400 font-semibold">임원</th>
                    <th className="text-left py-3 px-2 text-xs text-gray-400 font-semibold">직위</th>
                    <th className="text-left py-3 px-2 text-xs text-gray-400 font-semibold">부서</th>
                    <th className="text-left py-3 px-2 text-xs text-gray-400 font-semibold">연락처</th>
                    <th className="text-center py-3 px-2 text-xs text-gray-400 font-semibold">일정</th>
                    <th className="text-right py-3 px-2 text-xs text-gray-400 font-semibold">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: COLORS[i % COLORS.length] }}>
                            {e.name.slice(-2, -1) || e.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold">{e.name}</div>
                            <div className="text-xs text-gray-400">{e.email || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${posClass(e.position)}`}>{e.position}</span></td>
                      <td className="py-3 px-2 text-gray-500">{e.dept || "-"}</td>
                      <td className="py-3 px-2 text-gray-500">{e.phone || "-"}</td>
                      <td className="py-3 px-2 text-center">{e.upcoming_schedules || 0}건</td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openDetail(e.id)} className="px-2 py-1 border border-indigo-500 text-indigo-500 rounded-lg text-xs hover:bg-indigo-50">상세</button>
                          <button onClick={() => openEdit(e)} className="px-2 py-1 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600">수정</button>
                          <button onClick={() => deleteExec(e.id, e.name)} className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일: 카드 뷰 */}
            <div className="md:hidden space-y-3">
              {filtered.map((e, i) => (
                <div key={e.id} className="border-2 border-gray-100 rounded-xl p-3.5 active:bg-gray-50 transition">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }}>
                      {e.name.slice(-2, -1) || e.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{e.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${posClass(e.position)}`}>{e.position}</span>
                        {e.dept && <span className="text-xs text-gray-400">{e.dept}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-indigo-500">{e.upcoming_schedules || 0}</div>
                      <div className="text-[10px] text-gray-400">예정 일정</div>
                    </div>
                  </div>
                  {(e.phone || e.email) && (
                    <div className="text-xs text-gray-500 mb-2.5 pl-13">
                      {e.phone && <div>{e.phone}</div>}
                      {e.email && <div className="truncate">{e.email}</div>}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => openDetail(e.id)} className="flex-1 px-3 py-2 border border-indigo-500 text-indigo-500 rounded-lg text-xs active:scale-95 font-medium">상세</button>
                    <button onClick={() => openEdit(e)} className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-xs active:scale-95 font-medium">수정</button>
                    <button onClick={() => deleteExec(e.id, e.name)} className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-xs active:scale-95 font-medium">삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl p-5 md:p-6 w-full md:max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="md:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">임원 정보 수정</h3>
            <div className="space-y-3">
              {[
                { label: "이름", key: "name", type: "text" },
                { label: "부서", key: "dept", type: "text" },
                { label: "연락처", key: "phone", type: "tel" },
                { label: "이메일", key: "email", type: "email" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">직위</label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
                  {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">비고</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-500 mb-2">⭐ 출장 선호 사항</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">선호 항공사</label>
                    <input value={form.preferred_airline} onChange={(e) => setForm({ ...form, preferred_airline: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">좌석 등급</label>
                      <select value={form.seat_class} onChange={(e) => setForm({ ...form, seat_class: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
                        <option>퍼스트</option><option>비즈니스</option><option>프리미엄 이코노미</option><option>이코노미</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">호텔 등급</label>
                      <select value={form.hotel_grade} onChange={(e) => setForm({ ...form, hotel_grade: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg">
                        <option>5성</option><option>4성</option><option>3성</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">선호 호텔 체인</label>
                    <input value={form.preferred_hotel_chain} onChange={(e) => setForm({ ...form, preferred_hotel_chain: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">식이 사항</label>
                    <input value={form.dietary} onChange={(e) => setForm({ ...form, dietary: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">여권 번호</label>
                      <input value={form.passport_no} onChange={(e) => setForm({ ...form, passport_no: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">여권 만료일</label>
                      <input type="date" value={form.passport_expiry} onChange={(e) => setForm({ ...form, passport_expiry: e.target.value })} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={saveEdit} className="flex-1 md:flex-none bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm active:scale-95">저장</button>
              <button onClick={() => setShowModal(false)} className="flex-1 md:flex-none border-2 border-indigo-500 text-indigo-500 px-5 py-2.5 rounded-lg text-sm active:scale-95">취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl p-5 md:p-6 w-full md:max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="md:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">{showDetail.position} {showDetail.name}</h3>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div><b>직위:</b> {showDetail.position}</div>
              <div><b>부서:</b> {showDetail.dept || "-"}</div>
              <div><b>연락처:</b> {showDetail.phone || "-"}</div>
              <div><b>이메일:</b> <span className="break-all">{showDetail.email || "-"}</span></div>
            </div>
            {showDetail.note && <div className="text-sm mb-4"><b>비고:</b> {showDetail.note}</div>}
            <hr className="my-3" />
            <h4 className="font-semibold text-sm mb-2">예정 일정 ({showDetail.schedules?.length || 0}건)</h4>
            {(showDetail.schedules?.length || 0) === 0 ? (
              <p className="text-gray-400 text-sm mb-3">예정된 일정이 없습니다.</p>
            ) : (
              <div className="space-y-1 mb-3">
                {showDetail.schedules.slice(0, 10).map((s: any) => (
                  <div key={s.id} className="text-sm py-1.5 border-b border-gray-50">
                    <b>{s.date}</b> {s.time || "종일"} - {s.title}
                  </div>
                ))}
              </div>
            )}
            <h4 className="font-semibold text-sm mb-2">예정 출장 ({showDetail.trips?.length || 0}건)</h4>
            {(showDetail.trips?.length || 0) === 0 ? (
              <p className="text-gray-400 text-sm">예정된 출장이 없습니다.</p>
            ) : (
              <div className="space-y-1">
                {showDetail.trips.map((t: any) => (
                  <div key={t.id} className="text-sm py-1.5 border-b border-gray-50">
                    <b>{t.date}~{t.return_date || "미정"}</b> {t.from_name} → {t.to_name}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <button onClick={() => setShowDetail(null)} className="w-full md:w-auto border-2 border-indigo-500 text-indigo-500 px-5 py-2.5 rounded-lg text-sm active:scale-95">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
