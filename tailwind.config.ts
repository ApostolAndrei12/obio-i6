import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for Obio.ai
        purple: {
          DEFAULT: "#8B5CF6", // Base purple
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          950: "#2F105B",
        },
        blue: {
          DEFAULT: "#3B82F6", // Base blue
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        cyan: {
          DEFAULT: "#06B6D4", // Base cyan
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
          950: "#083344",
        },
        pink: {
          DEFAULT: "#EC4899", // Base pink/magenta
          50: "#FDF2F8",
          100: "#FCE7F3",
          200: "#FBCFE8",
          300: "#F9A8D4",
          400: "#F472B6",
          500: "#EC4899",
          600: "#DB2777",
          700: "#BE185D",
          800: "#9D174D",
          900: "#831843",
          950: "#500724",
        },
        green: {
          DEFAULT: "#22C55E", // Base green
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          950: "#052E16",
        },
        teal: {
          400: "#2DD4BF", // Added for gradient
        },
        orange: {
          400: "#FB923C", // Added for gradient
          700: "#C2410C", // Added for gradient
        },
        red: {
          700: "#B91C1C", // Added for gradient
        },
        yellow: {
          700: "#A16207", // Added for gradient
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        pulseSlow: {
          "0%, 100%": {
            transform: "scale(1)",
            boxShadow: "0 0 20px rgba(138, 43, 226, 0.7), 0 0 40px rgba(0, 191, 255, 0.5)",
          },
          "50%": {
            transform: "scale(1.05)",
            boxShadow: "0 0 30px rgba(138, 43, 226, 0.9), 0 0 60px rgba(0, 191, 255, 0.7)",
          },
        },
        typingPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        zoomSmart: {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "0.8" },
        },
        shimmerGradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        sparkle: {
          "0%": { transform: "scale(0) translate(0, 0)", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { transform: "scale(1.5) translate(var(--sparkle-x), var(--sparkle-y))", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-x": "gradient-x 3s ease infinite",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slow": "pulseSlow 4s infinite ease-in-out",
        "typing-pulse": "typingPulse 1s infinite",
        "zoom-smart": "zoomSmart 15s infinite ease-in-out",
        "shimmer-gradient": "shimmerGradient 3s ease-in-out infinite",
        "fade-in-scale": "fadeInScale 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        sparkle: "sparkle 1.5s infinite",
        "fade-in-up": "fadeInFromBottom 1.5s cubic-bezier(0.23, 1, 0.32, 1) forwards",
      },
      fontFamily: {
        urbanist: ["var(--font-urbanist)"],
        inter: ["var(--font-inter)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
