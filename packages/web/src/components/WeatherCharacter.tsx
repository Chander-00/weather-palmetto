interface WeatherCharacterProps {
  temperature: number
  condition: string
  units: 'metric' | 'imperial'
}

function getOutfit(tempF: number, condition: string) {
  const lower = condition.toLowerCase()
  const isRain =
    lower.includes('rain') ||
    lower.includes('drizzle') ||
    lower.includes('shower')
  const isSnow =
    lower.includes('snow') ||
    lower.includes('sleet') ||
    lower.includes('blizzard')

  let clothing: 'tshirt' | 'hoodie' | 'jacket' | 'heavy'
  let message: string

  if (tempF >= 85) {
    clothing = 'tshirt'
    message = 'Stay hydrated!'
  } else if (tempF >= 70) {
    clothing = 'tshirt'
    message = 'Perfect weather!'
  } else if (tempF >= 55) {
    clothing = 'hoodie'
    message = 'Grab a hoodie'
  } else if (tempF >= 35) {
    clothing = 'jacket'
    message = 'Wear a jacket'
  } else {
    clothing = 'heavy'
    message = 'Bundle up!'
  }

  if (isRain) message = 'Bring an umbrella!'
  if (isSnow) message = 'Snow day!'

  return { clothing, isRain, isSnow, message }
}

function toFahrenheit(temp: number, units: 'metric' | 'imperial'): number {
  return units === 'metric' ? Math.round((temp * 9) / 5 + 32) : temp
}

export function WeatherCharacter({
  temperature,
  condition,
  units
}: WeatherCharacterProps) {
  const tempF = toFahrenheit(temperature, units)
  const { clothing, isRain, isSnow, message } = getOutfit(tempF, condition)

  const skinColor = '#E8E8F0'
  const skinStroke = '#9d9db7'

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 140" width="110" height="155" fill="none">
        {/* Beanie for cold — behind head */}
        {(clothing === 'jacket' || clothing === 'heavy') && (
          <>
            <ellipse cx="50" cy="16" rx="20" ry="14" fill="#ff6b6b" stroke="#e05555" strokeWidth="2" />
            <circle cx="50" cy="4" r="3.5" fill="#ff6b6b" stroke="#e05555" strokeWidth="1.5" />
            <rect x="30" y="20" width="40" height="5" rx="2.5" fill="#e05555" />
          </>
        )}

        {/* Head */}
        <circle cx="50" cy="30" r="18" fill={skinColor} stroke={skinStroke} strokeWidth="2" />

        {/* Eyes */}
        {tempF < 85 && (
          <>
            <circle cx="43" cy="28" r="2.5" fill="#232549" />
            <circle cx="57" cy="28" r="2.5" fill="#232549" />
            <circle cx="44" cy="27" r="0.8" fill={skinColor} />
            <circle cx="58" cy="27" r="0.8" fill={skinColor} />
          </>
        )}

        {/* Mouth */}
        {tempF >= 70 ? (
          <path d="M43 36 Q50 42 57 36" stroke="#232549" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : tempF >= 45 ? (
          <line x1="44" y1="37" x2="56" y2="37" stroke="#232549" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M43 40 Q50 35 57 40" stroke="#232549" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* T-shirt */}
        {clothing === 'tshirt' && (
          <>
            {/* Torso */}
            <rect x="36" y="47" width="28" height="32" rx="4" fill="#6c63ff" stroke="#5a52e0" strokeWidth="2" />
            <line x1="50" y1="47" x2="50" y2="62" stroke="#5a52e0" strokeWidth="1" />
            {/* Short sleeves */}
            <rect x="22" y="48" width="16" height="12" rx="4" fill="#6c63ff" stroke="#5a52e0" strokeWidth="2" />
            <rect x="62" y="48" width="16" height="12" rx="4" fill="#6c63ff" stroke="#5a52e0" strokeWidth="2" />
            {/* Hands */}
            <circle cx="22" cy="62" r="5" fill={skinColor} stroke={skinStroke} strokeWidth="1.5" />
            <circle cx="78" cy="62" r="5" fill={skinColor} stroke={skinStroke} strokeWidth="1.5" />
          </>
        )}

        {/* Hoodie */}
        {clothing === 'hoodie' && (
          <>
            <rect x="36" y="47" width="28" height="34" rx="4" fill="#7c8ba0" stroke="#5d6b80" strokeWidth="2" />
            <rect x="44" y="47" width="12" height="8" rx="3" fill="#5d6b80" />
            {/* Long sleeves */}
            <rect x="20" y="48" width="18" height="30" rx="5" fill="#7c8ba0" stroke="#5d6b80" strokeWidth="2" />
            <rect x="62" y="48" width="18" height="30" rx="5" fill="#7c8ba0" stroke="#5d6b80" strokeWidth="2" />
            {/* Hood strings */}
            <line x1="46" y1="55" x2="44" y2="64" stroke="#5d6b80" strokeWidth="1.5" />
            <line x1="54" y1="55" x2="56" y2="64" stroke="#5d6b80" strokeWidth="1.5" />
            {/* Hands */}
            <circle cx="20" cy="80" r="5" fill={skinColor} stroke={skinStroke} strokeWidth="1.5" />
            <circle cx="80" cy="80" r="5" fill={skinColor} stroke={skinStroke} strokeWidth="1.5" />
          </>
        )}

        {/* Jacket */}
        {clothing === 'jacket' && (
          <>
            <rect x="36" y="47" width="28" height="36" rx="4" fill="#d4764e" stroke="#b85e3a" strokeWidth="2" />
            <line x1="50" y1="47" x2="50" y2="83" stroke="#b85e3a" strokeWidth="2" />
            <path d="M42 47 L46 55 L50 47" fill="#b85e3a" />
            <path d="M58 47 L54 55 L50 47" fill="#b85e3a" />
            {/* Long sleeves */}
            <rect x="18" y="48" width="20" height="32" rx="5" fill="#d4764e" stroke="#b85e3a" strokeWidth="2" />
            <rect x="62" y="48" width="20" height="32" rx="5" fill="#d4764e" stroke="#b85e3a" strokeWidth="2" />
            {/* Hands */}
            <circle cx="18" cy="82" r="5" fill={skinColor} stroke={skinStroke} strokeWidth="1.5" />
            <circle cx="82" cy="82" r="5" fill={skinColor} stroke={skinStroke} strokeWidth="1.5" />
          </>
        )}

        {/* Heavy coat */}
        {clothing === 'heavy' && (
          <>
            <rect x="34" y="46" width="32" height="38" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
            <line x1="50" y1="46" x2="50" y2="84" stroke="#FFD93D" strokeWidth="2" />
            <ellipse cx="50" cy="48" rx="15" ry="5" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
            {/* Puffy sleeves */}
            <rect x="16" y="47" width="20" height="34" rx="7" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
            <rect x="64" y="47" width="20" height="34" rx="7" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
            {/* Scarf */}
            <rect x="40" y="42" width="20" height="8" rx="3" fill="#ff6b6b" stroke="#e05555" strokeWidth="1.5" />
            <rect x="43" y="49" width="5" height="14" rx="2.5" fill="#ff6b6b" stroke="#e05555" strokeWidth="1.5" />
            {/* Mittens */}
            <circle cx="16" cy="83" r="6" fill="#ff6b6b" stroke="#e05555" strokeWidth="1.5" />
            <circle cx="84" cy="83" r="6" fill="#ff6b6b" stroke="#e05555" strokeWidth="1.5" />
          </>
        )}

        {/* Pants */}
        <rect x="38" y="80" width="11" height="22" rx="4" fill="#4a6fa5" stroke="#3a5a88" strokeWidth="2" />
        <rect x="51" y="80" width="11" height="22" rx="4" fill="#4a6fa5" stroke="#3a5a88" strokeWidth="2" />

        {/* Shoes */}
        <ellipse cx="43" cy="104" rx="8" ry="4" fill="#232549" stroke="#1a1b3a" strokeWidth="1.5" />
        <ellipse cx="57" cy="104" rx="8" ry="4" fill="#232549" stroke="#1a1b3a" strokeWidth="1.5" />

        {/* Sunglasses for hot */}
        {tempF >= 85 && (
          <>
            <rect x="37" y="25" width="10" height="7" rx="2" fill="#232549" stroke="#1a1b3a" strokeWidth="1.5" />
            <rect x="53" y="25" width="10" height="7" rx="2" fill="#232549" stroke="#1a1b3a" strokeWidth="1.5" />
            <line x1="47" y1="28" x2="53" y2="28" stroke="#1a1b3a" strokeWidth="1.5" />
            <line x1="37" y1="28" x2="33" y2="26" stroke="#1a1b3a" strokeWidth="1.5" />
            <line x1="63" y1="28" x2="67" y2="26" stroke="#1a1b3a" strokeWidth="1.5" />
          </>
        )}

        {/* Umbrella for rain */}
        {isRain && (
          <>
            <line x1="82" y1="15" x2="82" y2="78" stroke="#9d9db7" strokeWidth="2" />
            <path d="M66 15 Q74 0 82 0 Q90 0 98 15 Z" fill="#5B9BD5" stroke="#4a88c0" strokeWidth="1.5" />
            <path d="M80 78 Q80 82 84 82" stroke="#9d9db7" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* Snowflakes */}
        {isSnow && (
          <>
            <text x="8" y="22" fontSize="10" fill="#E8E8F0" opacity="0.6">*</text>
            <text x="80" y="40" fontSize="8" fill="#E8E8F0" opacity="0.4">*</text>
            <text x="12" y="65" fontSize="12" fill="#E8E8F0" opacity="0.5">*</text>
            <text x="88" y="12" fontSize="9" fill="#E8E8F0" opacity="0.3">*</text>
          </>
        )}
      </svg>
      <span className="text-sm text-text-secondary font-medium">{message}</span>
    </div>
  )
}
