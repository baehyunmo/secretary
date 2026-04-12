// 도시별 출장 실무 정보

export interface DestinationInfo {
  timezone: string;        // 예: "UTC+9"
  tzOffset: number;        // KST 대비 시차 (시간)
  visa: string;            // 비자 정보
  currency: string;        // 통화 코드
  currencyName: string;    // 통화 이름
  plug: string;            // 콘센트 타입
  voltage: string;         // 전압
  language: string;        // 주 언어
  tip: string;             // 팁 문화
  emergency: string;       // 긴급전화
  notes: string[];         // 출장 시 주의사항
}

export const DESTINATION_INFO: Record<string, DestinationInfo> = {
  NRT: {
    timezone: "UTC+9", tzOffset: 0, visa: "90일 무비자",
    currency: "JPY", currencyName: "엔", plug: "A타입 (한국과 다름)", voltage: "100V",
    language: "일본어", tip: "팁 문화 없음", emergency: "110 (경찰), 119 (응급)",
    notes: ["멀티 어댑터 필수 (콘센트 다름)", "현금 사용 비중 높음", "교통카드 SUICA 추천"],
  },
  HND: {
    timezone: "UTC+9", tzOffset: 0, visa: "90일 무비자",
    currency: "JPY", currencyName: "엔", plug: "A타입", voltage: "100V",
    language: "일본어", tip: "팁 문화 없음", emergency: "110, 119",
    notes: ["하네다는 시내와 가까움", "심야 도착 시 택시 추천"],
  },
  PEK: {
    timezone: "UTC+8", tzOffset: -1, visa: "비자 필요 (중국 비자)",
    currency: "CNY", currencyName: "위안", plug: "A/C/I타입", voltage: "220V",
    language: "중국어", tip: "팁 문화 없음", emergency: "110, 120",
    notes: ["VPN 필요 (구글, 카톡 차단)", "비자 사전 발급 필수", "위챗페이/알리페이 준비"],
  },
  PVG: {
    timezone: "UTC+8", tzOffset: -1, visa: "144시간 무비자 환승 가능 (조건부)",
    currency: "CNY", currencyName: "위안", plug: "A/C/I타입", voltage: "220V",
    language: "중국어", tip: "팁 문화 없음", emergency: "110, 120",
    notes: ["VPN 필요", "푸둥공항에서 자기부상열차 추천", "위챗페이/알리페이 준비"],
  },
  HKG: {
    timezone: "UTC+8", tzOffset: -1, visa: "90일 무비자",
    currency: "HKD", currencyName: "홍콩달러", plug: "G타입 (영국식)", voltage: "220V",
    language: "광둥어, 영어", tip: "10% 권장", emergency: "999",
    notes: ["옥토퍼스 카드 추천", "콘센트 G타입 어댑터 필수"],
  },
  SIN: {
    timezone: "UTC+8", tzOffset: -1, visa: "90일 무비자",
    currency: "SGD", currencyName: "싱가포르달러", plug: "G타입 (영국식)", voltage: "230V",
    language: "영어, 중국어", tip: "팁 거의 없음 (서비스료 포함)", emergency: "999",
    notes: ["껌 반입 금지", "벌금 도시로 유명 - 흡연/쓰레기 주의", "G타입 어댑터 필수"],
  },
  BKK: {
    timezone: "UTC+7", tzOffset: -2, visa: "90일 무비자",
    currency: "THB", currencyName: "바트", plug: "A/C/O타입", voltage: "220V",
    language: "태국어", tip: "10% 권장", emergency: "191, 1669",
    notes: ["택시는 미터기 사용 확인", "복장 단정 필요 (사원 방문 시)", "수돗물 마시지 말 것"],
  },
  LAX: {
    timezone: "UTC-8", tzOffset: -17, visa: "ESTA 필요 (90일)",
    currency: "USD", currencyName: "달러", plug: "A/B타입", voltage: "120V",
    language: "영어", tip: "15-20% 필수", emergency: "911",
    notes: ["ESTA 사전 신청 필수", "팁 문화 강함", "교통체증 심함 - 시간 여유"],
  },
  JFK: {
    timezone: "UTC-5", tzOffset: -14, visa: "ESTA 필요 (90일)",
    currency: "USD", currencyName: "달러", plug: "A/B타입", voltage: "120V",
    language: "영어", tip: "15-20% 필수", emergency: "911",
    notes: ["ESTA 사전 신청 필수", "맨해튼 정액 택시 $70", "팁 문화 강함"],
  },
  SFO: {
    timezone: "UTC-8", tzOffset: -17, visa: "ESTA 필요 (90일)",
    currency: "USD", currencyName: "달러", plug: "A/B타입", voltage: "120V",
    language: "영어", tip: "15-20% 필수", emergency: "911",
    notes: ["ESTA 사전 신청 필수", "BART 추천", "기온 변화 큼 - 자켓 준비"],
  },
  LHR: {
    timezone: "UTC+0", tzOffset: -9, visa: "ETA 필요 (2025년부터)",
    currency: "GBP", currencyName: "파운드", plug: "G타입 (영국식)", voltage: "230V",
    language: "영어", tip: "10-15%", emergency: "999",
    notes: ["ETA 사전 신청 필수", "히드로 익스프레스 가장 빠름", "G타입 어댑터 필수"],
  },
  CDG: {
    timezone: "UTC+1", tzOffset: -8, visa: "솅겐 90일 무비자",
    currency: "EUR", currencyName: "유로", plug: "C/E타입", voltage: "230V",
    language: "프랑스어", tip: "서비스료 포함, 추가 5-10%", emergency: "112",
    notes: ["택시 정액제 (시내 약 55유로)", "복장 격식 중시", "C/E 어댑터 필수"],
  },
  FRA: {
    timezone: "UTC+1", tzOffset: -8, visa: "솅겐 90일 무비자",
    currency: "EUR", currencyName: "유로", plug: "C/F타입", voltage: "230V",
    language: "독일어", tip: "5-10%", emergency: "112",
    notes: ["일요일 상점 휴무", "현금 선호 식당 많음", "C/F 어댑터 필수"],
  },
  DXB: {
    timezone: "UTC+4", tzOffset: -5, visa: "30일 무비자",
    currency: "AED", currencyName: "디르함", plug: "G타입 (영국식)", voltage: "220V",
    language: "아랍어, 영어", tip: "10%", emergency: "999",
    notes: ["여름 매우 더움 (40도+)", "라마단 기간 공공 음식 자제", "복장 단정 (특히 여성)"],
  },
  SYD: {
    timezone: "UTC+10", tzOffset: 1, visa: "ETA 필요",
    currency: "AUD", currencyName: "호주달러", plug: "I타입", voltage: "230V",
    language: "영어", tip: "팁 문화 약함", emergency: "000",
    notes: ["ETA 사전 신청 필수", "남반구 - 계절 반대", "I타입 어댑터 필수"],
  },
};

// 도시별 추천 체크리스트
export function getChecklist(toCode: string): { category: string; items: string[] }[] {
  const info = DESTINATION_INFO[toCode];
  const base = [
    {
      category: "📋 필수 서류",
      items: [
        "여권 (유효기간 6개월 이상)",
        info?.visa.includes("필요") ? `⚠️ ${info.visa} - 사전 발급 필수` : `✓ ${info?.visa || "비자 정보 확인"}`,
        "출장 명령서",
        "초청장 / 미팅 일정표",
        "비상 연락처 명단",
      ],
    },
    {
      category: "💳 금융",
      items: [
        "법인카드 (해외 사용 가능 확인)",
        `현지 통화 (${info?.currencyName || ''}) 일부 환전`,
        "카드 한도 상향 신청",
        "여행자보험 가입",
      ],
    },
    {
      category: "🔌 전자기기",
      items: [
        `멀티 어댑터 (${info?.plug || '확인'}, ${info?.voltage || ''})`,
        "노트북 + 충전기",
        "휴대폰 보조배터리",
        "로밍 또는 현지 USIM",
      ],
    },
    {
      category: "👔 비즈니스",
      items: [
        "정장 + 셔츠 (회의 일수 + 1벌)",
        "명함 (충분한 수량)",
        "선물 (준비 시)",
        "프레젠테이션 자료 (백업 포함)",
      ],
    },
  ];
  if (info?.notes && info.notes.length > 0) {
    base.push({ category: "⚠️ 현지 주의사항", items: info.notes });
  }
  return base;
}
