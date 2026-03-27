const iconMap: Record<string, string> = {
  'clear': '01d',
  'sunny': '01d',
  'fair': '01d',
  'clouds': '03d',
  'cloudy': '04d',
  'overcast': '04d',
  'partly': '02d',
  'mostly cloudy': '04d',
  'mostly sunny': '02d',
  'scattered': '03d',
  'broken': '04d',
  'few clouds': '02d',
  'rain': '10d',
  'drizzle': '09d',
  'shower': '09d',
  'thunderstorm': '11d',
  'thunder': '11d',
  'storm': '11d',
  'snow': '13d',
  'sleet': '13d',
  'flurries': '13d',
  'blizzard': '13d',
  'ice': '13d',
  'freezing': '13d',
  'mist': '50d',
  'fog': '50d',
  'haze': '50d',
  'smoke': '50d',
};

function resolveIconCode(conditionMain: string): string {
  const lower = conditionMain.toLowerCase();

  for (const [keyword, code] of Object.entries(iconMap)) {
    if (lower.includes(keyword)) return code;
  }

  return '03d';
}

const svgIcons: Record<string, string> = {
  '01d': `<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="14" fill="#FFD93D" stroke="#F4A900" stroke-width="2"/><g stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round"><line x1="32" y1="4" x2="32" y2="12"/><line x1="32" y1="52" x2="32" y2="60"/><line x1="4" y1="32" x2="12" y2="32"/><line x1="52" y1="32" x2="60" y2="32"/><line x1="12.2" y1="12.2" x2="17.9" y2="17.9"/><line x1="46.1" y1="46.1" x2="51.8" y2="51.8"/><line x1="12.2" y1="51.8" x2="17.9" y2="46.1"/><line x1="46.1" y1="17.9" x2="51.8" y2="12.2"/></g></svg>`,
  '02d': `<svg viewBox="0 0 64 64" fill="none"><circle cx="26" cy="22" r="10" fill="#FFD93D" stroke="#F4A900" stroke-width="2"/><g stroke="#FFD93D" stroke-width="2" stroke-linecap="round"><line x1="26" y1="4" x2="26" y2="9"/><line x1="26" y1="35" x2="26" y2="37"/><line x1="10" y1="22" x2="13" y2="22"/><line x1="39" y1="22" x2="42" y2="22"/><line x1="14.7" y1="10.7" x2="16.8" y2="12.8"/><line x1="35.2" y1="31.2" x2="37.3" y2="33.3"/><line x1="14.7" y1="33.3" x2="16.8" y2="31.2"/><line x1="35.2" y1="12.8" x2="37.3" y2="10.7"/></g><path d="M20 44c0-5 3.6-9 8-9 3.2 0 6 2 7.2 4.8A7 7 0 0 1 48 44a7 7 0 0 1-1.5 13.8H22a8 8 0 0 1-2-15.8Z" fill="#E8E8F0" stroke="#B0B0C0" stroke-width="2"/></svg>`,
  '03d': `<svg viewBox="0 0 64 64" fill="none"><path d="M14 42c0-6 4.5-11 10-11 4 0 7.5 2.4 9 5.9A8.5 8.5 0 0 1 48 42a8.5 8.5 0 0 1-2 16.7H17a10 10 0 0 1-3-19.7Z" fill="#E8E8F0" stroke="#B0B0C0" stroke-width="2"/></svg>`,
  '04d': `<svg viewBox="0 0 64 64" fill="none"><path d="M10 38c0-5 3.6-9 8-9 3.2 0 6 2 7.2 4.8A7 7 0 0 1 38 38a7 7 0 0 1-1.5 13.8H12a8 8 0 0 1-2-15.8Z" fill="#C0C0D0" stroke="#9090A0" stroke-width="2"/><path d="M24 32c0-5.5 4-10 9-10 3.6 0 6.8 2.2 8.2 5.4A8 8 0 0 1 54 32a8 8 0 0 1-1.6 15.5H27a9 9 0 0 1-3-17.5Z" fill="#B0B0C0" stroke="#8080A0" stroke-width="2"/></svg>`,
  '09d': `<svg viewBox="0 0 64 64" fill="none"><path d="M14 30c0-5.5 4-10 9-10 3.6 0 6.8 2.2 8.2 5.4A8 8 0 0 1 44 30a8 8 0 0 1-1.6 15.5H17a9 9 0 0 1-3-17.5Z" fill="#B0B0C0" stroke="#8080A0" stroke-width="2"/><g stroke="#5B9BD5" stroke-width="2" stroke-linecap="round"><line x1="22" y1="50" x2="20" y2="56"/><line x1="30" y1="50" x2="28" y2="56"/><line x1="38" y1="50" x2="36" y2="56"/></g></svg>`,
  '10d': `<svg viewBox="0 0 64 64" fill="none"><circle cx="22" cy="18" r="8" fill="#FFD93D" stroke="#F4A900" stroke-width="1.5"/><path d="M16 34c0-5 3.6-9 8-9 3.2 0 6 2 7.2 4.8A7 7 0 0 1 44 34a7 7 0 0 1-1.5 13.8H18.5A8 8 0 0 1 16 34Z" fill="#C0C0D0" stroke="#9090A0" stroke-width="2"/><g stroke="#5B9BD5" stroke-width="2" stroke-linecap="round"><line x1="24" y1="52" x2="22" y2="58"/><line x1="32" y1="52" x2="30" y2="58"/><line x1="40" y1="52" x2="38" y2="58"/></g></svg>`,
  '11d': `<svg viewBox="0 0 64 64" fill="none"><path d="M12 30c0-5.5 4-10 9-10 3.6 0 6.8 2.2 8.2 5.4A8 8 0 0 1 42 30a8 8 0 0 1-1.6 15.5H15a9 9 0 0 1-3-17.5Z" fill="#808098" stroke="#606080" stroke-width="2"/><path d="M30 44l-4 8h6l-4 8" stroke="#FFD93D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><g stroke="#5B9BD5" stroke-width="2" stroke-linecap="round"><line x1="20" y1="50" x2="18" y2="56"/><line x1="40" y1="50" x2="38" y2="56"/></g></svg>`,
  '13d': `<svg viewBox="0 0 64 64" fill="none"><path d="M14 30c0-5.5 4-10 9-10 3.6 0 6.8 2.2 8.2 5.4A8 8 0 0 1 44 30a8 8 0 0 1-1.6 15.5H17a9 9 0 0 1-3-17.5Z" fill="#C8C8E0" stroke="#A0A0C0" stroke-width="2"/><g fill="#E8E8F0"><circle cx="22" cy="52" r="2"/><circle cx="30" cy="55" r="2"/><circle cx="38" cy="51" r="2"/></g></svg>`,
  '50d': `<svg viewBox="0 0 64 64" fill="none"><g stroke="#9D9DB7" stroke-width="2.5" stroke-linecap="round" opacity="0.7"><line x1="10" y1="24" x2="54" y2="24"/><line x1="14" y1="32" x2="50" y2="32"/><line x1="10" y1="40" x2="54" y2="40"/><line x1="18" y1="48" x2="46" y2="48"/></g></svg>`,
};

export function getWeatherIcon(conditionMain: string): string {
  const code = resolveIconCode(conditionMain);
  return svgIcons[code] || svgIcons['03d'];
}
