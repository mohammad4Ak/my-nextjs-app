import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // پالت مدرن - اسلیت خنک + ایندیگو
        night: '#0F172A', // بخشهای تیره، متن اصلی
        mist: '#64748B', // متن ثانویه
        paper: '#FFFFFF', // کارت و سطوح
        fog: '#F6F7F9', // پسزمینه صفحه
        line: '#E4E7EC', // خطوط و بوردرها
        brand: {
          DEFAULT: '#4F46E5', // ایندیگوی اصلی
          strong: '#4338CA', // هاور
          soft: '#EEF2FF', // پسزمینه ملایم برند
        },
      },
      fontFamily: {
        display: ['var(--font-vazir)', 'sans-serif'],
        body: ['var(--font-vazir)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
}
export default config