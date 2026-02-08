/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cream: 'var(--color-cream)',
                paper: 'var(--color-paper)',
                sand: 'var(--color-sand)',
                ink: 'var(--color-ink)',
                'ink-light': 'var(--color-ink-light)',
                terracotta: 'var(--color-terracotta)',
                clay: 'var(--color-clay)',
                sage: 'var(--color-sage)',
                olive: 'var(--color-olive)',
                mustard: 'var(--color-mustard)',
                slate: 'var(--color-slate)',

                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                error: "var(--destructive)", // Alias for compatibility
                neutral: "var(--color-ink)", // Alias for compatibility
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
            },
            borderRadius: {
                lg: "var(--radius-lg)",
                md: "var(--radius-md)",
                sm: "var(--radius-sm)",
                blob: "var(--radius-blob)",
            },
            fontFamily: {
                serif: ['"Crimson Pro"', 'serif'],
                sans: ['"Manrope"', 'sans-serif'],
                hand: ['"Reenie Beanie"', 'cursive'],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                breathe: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.05)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                breathe: "breathe 8s ease-in-out infinite",
                float: "float 6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
}
