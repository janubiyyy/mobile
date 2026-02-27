export const colors = {
  // Primary earth tones
  primary: '#6B4F3B',       // Coklat tua utama
  primaryLight: '#8B6D55',  // Coklat muda
  primaryDark: '#4A3527',   // Coklat gelap aktif

  // Backgrounds
  background: '#F5EBDD',    // Krem lembut
  card: '#FFFFFF',          // Putih kartu
  surface: '#FDF6EE',       // Permukaan lembut

  // Accents
  accent: '#D4A373',        // Oranye hangat
  sage: '#A3B18A',          // Hijau sage
  sageLight: '#C5D5B5',     // Hijau sage muda
  sageDark: '#7A9468',      // Hijau sage gelap

  // Semantic
  income: '#A3B18A',        // Pemasukan hijau sage
  expense: '#C98B6B',       // Pengeluaran oranye-merah

  // Text
  text: '#2D2016',          // Teks utama
  textSecondary: '#7A6352', // Teks sekunder
  textMuted: '#B09880',     // Teks redup
  textLight: '#F5EBDD',     // Teks di bg gelap

  // UI states
  border: '#E8D9C8',        // Border lembut
  divider: '#F0E4D4',       // Pembatas
  placeholder: '#C4AD97',   // Placeholder input
  error: '#C0392B',         // Error merah

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 100,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '400' as const, color: colors.textMuted },
  label: { fontSize: 14, fontWeight: '600' as const, color: colors.text },
};
