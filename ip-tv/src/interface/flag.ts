export type CountryFlag = {
  name: string;
  emoji: string;
  code: string;
  image: string;
};

/**
 * Minimal country lookup keyed by ISO 3166-1 alpha-2 code (lowercase),
 * because the IPTV-org playlist IDs end with the country code
 * (e.g. "TRT1.tr" → "tr").
 *
 * Add more entries as needed — anything not listed here just renders
 * without a flag icon.
 */
export const CountryData: Record<string, CountryFlag> = {
  tr: { name: "Turkey", emoji: "🇹🇷", code: "TR", image: "https://flagcdn.com/w320/tr.png" },
  us: { name: "United States", emoji: "🇺🇸", code: "US", image: "https://flagcdn.com/w320/us.png" },
  uk: { name: "United Kingdom", emoji: "🇬🇧", code: "GB", image: "https://flagcdn.com/w320/gb.png" },
  gb: { name: "United Kingdom", emoji: "🇬🇧", code: "GB", image: "https://flagcdn.com/w320/gb.png" },
  de: { name: "Germany", emoji: "🇩🇪", code: "DE", image: "https://flagcdn.com/w320/de.png" },
  fr: { name: "France", emoji: "🇫🇷", code: "FR", image: "https://flagcdn.com/w320/fr.png" },
  az: { name: "Azerbaijan", emoji: "🇦🇿", code: "AZ", image: "https://flagcdn.com/w320/az.png" },
  ru: { name: "Russia", emoji: "🇷🇺", code: "RU", image: "https://flagcdn.com/w320/ru.png" },
  ar: { name: "Argentina", emoji: "🇦🇷", code: "AR", image: "https://flagcdn.com/w320/ar.png" },
  ca: { name: "Canada", emoji: "🇨🇦", code: "CA", image: "https://flagcdn.com/w320/ca.png" },
  au: { name: "Australia", emoji: "🇦🇺", code: "AU", image: "https://flagcdn.com/w320/au.png" },
  it: { name: "Italy", emoji: "🇮🇹", code: "IT", image: "https://flagcdn.com/w320/it.png" },
  es: { name: "Spain", emoji: "🇪🇸", code: "ES", image: "https://flagcdn.com/w320/es.png" },
  nl: { name: "Netherlands", emoji: "🇳🇱", code: "NL", image: "https://flagcdn.com/w320/nl.png" },
  // … add others you care about
};
