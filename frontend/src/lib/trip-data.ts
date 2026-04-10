export const AIRPORTS: Record<string, { name: string; city: string; lat: number; lng: number }> = {
  ICN: { name: '인천국제공항', city: '서울', lat: 37.4602, lng: 126.4407 },
  GMP: { name: '김포국제공항', city: '서울', lat: 37.5583, lng: 126.7906 },
  PUS: { name: '김해국제공항', city: '부산', lat: 35.1796, lng: 128.9382 },
  CJU: { name: '제주국제공항', city: '제주', lat: 33.5104, lng: 126.4914 },
  NRT: { name: '나리타공항', city: '도쿄', lat: 35.7720, lng: 140.3929 },
  HND: { name: '하네다공항', city: '도쿄', lat: 35.5494, lng: 139.7798 },
  PEK: { name: '베이징수도공항', city: '베이징', lat: 40.0799, lng: 116.6031 },
  PVG: { name: '푸둥국제공항', city: '상하이', lat: 31.1443, lng: 121.8083 },
  HKG: { name: '홍콩국제공항', city: '홍콩', lat: 22.3080, lng: 113.9185 },
  SIN: { name: '창이공항', city: '싱가포르', lat: 1.3644, lng: 103.9915 },
  BKK: { name: '수완나품공항', city: '방콕', lat: 13.6900, lng: 100.7501 },
  LAX: { name: '로스앤젤레스공항', city: 'LA', lat: 33.9425, lng: -118.4081 },
  JFK: { name: 'JFK공항', city: '뉴욕', lat: 40.6413, lng: -73.7781 },
  SFO: { name: '샌프란시스코공항', city: '샌프란시스코', lat: 37.6213, lng: -122.3790 },
  LHR: { name: '히드로공항', city: '런던', lat: 51.4700, lng: -0.4543 },
  CDG: { name: '샤를드골공항', city: '파리', lat: 49.0097, lng: 2.5479 },
  FRA: { name: '프랑크푸르트공항', city: '프랑크푸르트', lat: 50.0379, lng: 8.5622 },
  DXB: { name: '두바이공항', city: '두바이', lat: 25.2532, lng: 55.3657 },
  SYD: { name: '시드니공항', city: '시드니', lat: -33.9461, lng: 151.1772 },
};

export interface RouteOption {
  type: string;
  stops: string[];
  duration: string;
  tags: string[];
  note: string;
}

export const LAYOVERS: Record<string, RouteOption[]> = {
  'ICN-LAX': [
    { type: '직항', stops: [], duration: '약 10시간 40분', tags: ['최단시간'], note: '직항편 (대한항공, 아시아나, 델타)' },
    { type: '경유 1회', stops: ['나리타(NRT)'], duration: '약 14~16시간', tags: ['최저가'], note: '도쿄 나리타 경유' },
    { type: '경유 1회', stops: ['호놀룰루(HNL)'], duration: '약 15~17시간', tags: [], note: '호놀룰루 경유 - 하와이 스톱오버 가능' },
  ],
  'ICN-JFK': [
    { type: '직항', stops: [], duration: '약 14시간', tags: ['최단시간'], note: '직항편 (대한항공, 아시아나)' },
    { type: '경유 1회', stops: ['나리타(NRT)'], duration: '약 18~20시간', tags: ['최저가'], note: '도쿄 나리타 경유' },
    { type: '경유 1회', stops: ['시카고(ORD)'], duration: '약 17~19시간', tags: [], note: '시카고 오헤어 경유' },
  ],
  'ICN-SFO': [
    { type: '직항', stops: [], duration: '약 10시간 30분', tags: ['최단시간'], note: '직항편 (대한항공, 아시아나, 유나이티드)' },
    { type: '경유 1회', stops: ['나리타(NRT)'], duration: '약 14~16시간', tags: ['최저가'], note: '도쿄 나리타 경유' },
  ],
  'ICN-LHR': [
    { type: '직항', stops: [], duration: '약 12시간', tags: ['최단시간'], note: '직항편 (대한항공, 아시아나, 영국항공)' },
    { type: '경유 1회', stops: ['두바이(DXB)'], duration: '약 16~18시간', tags: ['추천'], note: '두바이 경유 - 쾌적한 환승' },
    { type: '경유 1회', stops: ['프랑크푸르트(FRA)'], duration: '약 15~17시간', tags: ['최저가'], note: '프랑크푸르트 경유' },
  ],
  'ICN-CDG': [
    { type: '직항', stops: [], duration: '약 12시간 30분', tags: ['최단시간'], note: '직항편 (대한항공, 에어프랑스)' },
    { type: '경유 1회', stops: ['프랑크푸르트(FRA)'], duration: '약 15~16시간', tags: ['최저가'], note: '프랑크푸르트 경유' },
  ],
  'ICN-FRA': [
    { type: '직항', stops: [], duration: '약 11시간 30분', tags: ['최단시간'], note: '직항편 (대한항공, 루프트한자)' },
    { type: '경유 1회', stops: ['헬싱키(HEL)'], duration: '약 14~15시간', tags: ['추천'], note: '헬싱키 경유 - 핀에어 짧은 환승' },
  ],
  'ICN-DXB': [
    { type: '직항', stops: [], duration: '약 9시간 30분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, 에미레이트)' },
    { type: '경유 1회', stops: ['방콕(BKK)'], duration: '약 13~15시간', tags: ['최저가'], note: '방콕 경유' },
  ],
  'ICN-SYD': [
    { type: '직항', stops: [], duration: '약 10시간 30분', tags: ['최단시간'], note: '직항편 (대한항공, 아시아나)' },
    { type: '경유 1회', stops: ['싱가포르(SIN)'], duration: '약 14~16시간', tags: ['추천'], note: '싱가포르 경유 - 창이공항 쾌적' },
  ],
  'ICN-SIN': [
    { type: '직항', stops: [], duration: '약 6시간 30분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, 싱가포르항공)' },
  ],
  'ICN-BKK': [
    { type: '직항', stops: [], duration: '약 5시간 40분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, 타이항공)' },
  ],
  'ICN-HKG': [{ type: '직항', stops: [], duration: '약 3시간 50분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, 캐세이퍼시픽)' }],
  'ICN-NRT': [{ type: '직항', stops: [], duration: '약 2시간 30분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, ANA, JAL)' }],
  'ICN-HND': [{ type: '직항', stops: [], duration: '약 2시간 30분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, ANA)' }],
  'ICN-PEK': [{ type: '직항', stops: [], duration: '약 2시간 10분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, 중국국제항공)' }],
  'ICN-PVG': [{ type: '직항', stops: [], duration: '약 2시간 10분', tags: ['최단시간', '추천'], note: '직항편 (대한항공, 중국동방항공)' }],
};

export interface HotelOption {
  name: string;
  stars: number;
  area: string;
  price: string;
  lat: number;
  lng: number;
  note: string;
}

export const HOTELS: Record<string, HotelOption[]> = {
  NRT: [
    { name: '더 페닌슐라 도쿄', stars: 5, area: '마루노우치', price: '$$$', lat: 35.6785, lng: 139.7630, note: '비즈니스 중심지' },
    { name: '샹그릴라 도쿄', stars: 5, area: '마루노우치', price: '$$$', lat: 35.6811, lng: 139.7694, note: '도쿄역 직결' },
    { name: '호텔 메트로폴리탄', stars: 4, area: '이케부쿠로', price: '$$', lat: 35.7295, lng: 139.7109, note: '가성비 우수' },
  ],
  HND: [
    { name: '안다즈 도쿄 도라노몬', stars: 5, area: '도라노몬', price: '$$$', lat: 35.6661, lng: 139.7496, note: '모던 럭셔리' },
    { name: '호텔 뉴 오타니', stars: 4, area: '아카사카', price: '$$', lat: 35.6800, lng: 139.7355, note: '전통 호텔' },
  ],
  PEK: [
    { name: '차이나 월드 호텔', stars: 5, area: 'CBD', price: '$$$', lat: 39.9087, lng: 116.4605, note: '비즈니스 중심' },
    { name: '노보텔 베이징', stars: 4, area: '싼위안차오', price: '$$', lat: 39.9584, lng: 116.4612, note: '공항철도 인근' },
  ],
  PVG: [
    { name: '더 리츠칼튼 상하이', stars: 5, area: '푸둥', price: '$$$', lat: 31.2356, lng: 121.5018, note: '금융지구' },
    { name: '파크 하얏트 상하이', stars: 5, area: '푸둥', price: '$$$', lat: 31.2354, lng: 121.5065, note: '세계금융센터 고층' },
  ],
  HKG: [
    { name: '더 페닌슐라 홍콩', stars: 5, area: '침사추이', price: '$$$', lat: 22.2951, lng: 114.1720, note: '전설적 서비스' },
    { name: '만다린 오리엔탈', stars: 5, area: '센트럴', price: '$$$', lat: 22.2817, lng: 114.1588, note: '금융지구' },
  ],
  SIN: [
    { name: '마리나 베이 샌즈', stars: 5, area: '마리나 베이', price: '$$$', lat: 1.2834, lng: 103.8607, note: '컨벤션센터 연결' },
    { name: '더 풀러턴 호텔', stars: 5, area: 'CBD', price: '$$$', lat: 1.2863, lng: 103.8535, note: '비즈니스 지구' },
  ],
  BKK: [
    { name: '반얀트리 방콕', stars: 5, area: '사톤', price: '$$$', lat: 13.7228, lng: 100.5305, note: '비즈니스 지구' },
    { name: '그란데 센터포인트', stars: 4, area: '수쿰빗', price: '$$', lat: 13.7378, lng: 100.5602, note: 'BTS 직결' },
  ],
  LAX: [
    { name: '인터컨티넨탈 다운타운', stars: 5, area: '다운타운', price: '$$$', lat: 34.0537, lng: -118.2575, note: '금융지구' },
    { name: '힐튼 에어포트', stars: 4, area: '공항', price: '$$', lat: 33.9474, lng: -118.3867, note: '셔틀 제공' },
  ],
  JFK: [
    { name: '더 플라자 호텔', stars: 5, area: '미드타운', price: '$$$', lat: 40.7645, lng: -73.9744, note: '센트럴파크' },
    { name: '뉴욕 힐튼 미드타운', stars: 4, area: '미드타운', price: '$$', lat: 40.7626, lng: -73.9791, note: '컨퍼런스 시설' },
  ],
  SFO: [
    { name: '포시즌스 SF', stars: 5, area: '소마', price: '$$$', lat: 37.7866, lng: -122.4015, note: '테크 기업 인근' },
    { name: '하얏트 리젠시 SF', stars: 4, area: '엠바카데로', price: '$$', lat: 37.7944, lng: -122.3946, note: '워터프론트' },
  ],
  LHR: [
    { name: '더 사보이', stars: 5, area: '스트랜드', price: '$$$', lat: 51.5105, lng: -0.1204, note: '클래식 럭셔리' },
    { name: '더블트리 타워', stars: 4, area: '타워브리지', price: '$$', lat: 51.5047, lng: -0.0744, note: '금융지구 인근' },
  ],
  CDG: [
    { name: '르 브리스톨 파리', stars: 5, area: '8구', price: '$$$', lat: 48.8704, lng: 2.3158, note: '최고 비즈니스 입지' },
    { name: '노보텔 파리 센터', stars: 4, area: '레알', price: '$$', lat: 48.8612, lng: 2.3487, note: '메트로 접근 용이' },
  ],
  FRA: [
    { name: '주메이라 프랑크푸르트', stars: 5, area: '시내', price: '$$$', lat: 50.1113, lng: 8.6785, note: '금융지구' },
    { name: '플레밍스 셀렉션', stars: 4, area: '시내', price: '$$', lat: 50.1133, lng: 8.6752, note: '중심부' },
  ],
  DXB: [
    { name: 'JW 메리어트 마르키스', stars: 5, area: '비즈니스 베이', price: '$$$', lat: 25.1867, lng: 55.2634, note: '최고층 호텔' },
    { name: '로브 다운타운', stars: 4, area: '다운타운', price: '$$', lat: 25.1913, lng: 55.2721, note: '부르즈 칼리파 인근' },
  ],
  SYD: [
    { name: '파크 하얏트 시드니', stars: 5, area: '더 록스', price: '$$$', lat: -33.8554, lng: 151.2099, note: '오페라하우스 전망' },
    { name: '샹그릴라 시드니', stars: 5, area: '더 록스', price: '$$$', lat: -33.8614, lng: 151.2070, note: '하버브리지 전망' },
  ],
};

export function getTransportAdvice(airportCode: string): string {
  const advice: Record<string, string> = {
    NRT: '추천: 나리타 익스프레스(약 60분) 또는 리무진 버스',
    HND: '추천: 택시(약 30분) - 시내와 가까워 효율적',
    PEK: '추천: 공항철도 + 택시 (동즈먼역까지 25분)',
    PVG: '추천: 자기부상열차 + 택시 (룽양루역까지 8분)',
    HKG: '추천: 에어포트 익스프레스(24분, 무료 호텔 셔틀)',
    SIN: '추천: 택시/그랩 (약 20~30분, 저렴하고 편리)',
    BKK: '추천: 미터기 택시 (약 200~400바트)',
    LAX: '추천: 차량 호출(우버/리프트) 또는 호텔 셔틀',
    JFK: '추천: 택시 (맨해튼 정액 $70)',
    SFO: '추천: 택시/차량 호출 (약 25분)',
    LHR: '추천: 히드로 익스프레스 (패딩턴역까지 15분)',
    CDG: '추천: 택시 (정액 약 55유로)',
    FRA: '추천: 택시 (약 25분, 시내와 가까움)',
    DXB: '추천: 택시 (약 20~35분, 저렴)',
    SYD: '추천: 택시 (약 20분, $45~65호주달러)',
  };
  return advice[airportCode] || '택시 또는 차량 호출을 이용하세요.';
}

export function getLayoverKey(from: string, to: string): string | null {
  const key = `${from}-${to}`;
  if (LAYOVERS[key]) return key;
  if (['GMP', 'PUS', 'CJU'].includes(from)) {
    const altKey = `ICN-${to}`;
    if (LAYOVERS[altKey]) return altKey;
  }
  return null;
}

export const DEPARTURE_CITIES = [
  { code: 'ICN', label: '서울 (인천 - ICN)' },
  { code: 'GMP', label: '서울 (김포 - GMP)' },
  { code: 'PUS', label: '부산 (김해 - PUS)' },
  { code: 'CJU', label: '제주 (CJU)' },
];

export const DESTINATION_CITIES = [
  { code: 'NRT', label: '도쿄 (나리타)' },
  { code: 'HND', label: '도쿄 (하네다)' },
  { code: 'PEK', label: '베이징' },
  { code: 'PVG', label: '상하이' },
  { code: 'HKG', label: '홍콩' },
  { code: 'SIN', label: '싱가포르' },
  { code: 'BKK', label: '방콕' },
  { code: 'LAX', label: '로스앤젤레스' },
  { code: 'JFK', label: '뉴욕' },
  { code: 'SFO', label: '샌프란시스코' },
  { code: 'LHR', label: '런던' },
  { code: 'CDG', label: '파리' },
  { code: 'FRA', label: '프랑크푸르트' },
  { code: 'DXB', label: '두바이' },
  { code: 'SYD', label: '시드니' },
];
