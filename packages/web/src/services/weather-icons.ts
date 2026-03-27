const ICON_BASE_URL = 'https://openweathermap.org/img/wn';

export function getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '4x'): string {
  const normalized = iconCode.length <= 3 ? iconCode : iconCode;
  return `${ICON_BASE_URL}/${normalized}@${size}.png`;
}
