// 외부 무료 API 래퍼 (날씨, 환율)

// Open-Meteo: 키 불필요, 무료
export async function fetchWeather(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: data.current?.temperature_2m,
      code: data.current?.weather_code,
      desc: weatherCodeToText(data.current?.weather_code),
    };
  } catch {
    return null;
  }
}

function weatherCodeToText(code: number): string {
  if (code === 0) return "맑음 ☀️";
  if (code <= 3) return "구름 🌤️";
  if (code <= 48) return "안개 🌫️";
  if (code <= 67) return "비 🌧️";
  if (code <= 77) return "눈 ❄️";
  if (code <= 82) return "소나기 🌧️";
  if (code <= 99) return "뇌우 ⛈️";
  return "정보 없음";
}

// Frankfurter: 유럽중앙은행 환율 API, 키 불필요
export async function fetchExchangeRate(from: string, to: string) {
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.rates?.[to] as number | null;
  } catch {
    return null;
  }
}
