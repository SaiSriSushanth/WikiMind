/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wm: {
          bg: "#09090B",
          surface: "#111113",
          surface2: "#1C1C20",
          border: "#26262C",
          "border-light": "#333339",
          text1: "#EDEBE6",
          text2: "#6B6975",
          text3: "#3A3840",
          accent: "#C9A86C",
          "accent-dim": "rgba(201,168,108,0.1)",
          red: "#F87171",
          green: "#4ADE80",
          amber: "#FCD34D",
          blue: "#60A5FA",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Syne", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.35s ease forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "#EDEBE6",
            "--tw-prose-headings": "#EDEBE6",
            "--tw-prose-links": "#C9A86C",
            "--tw-prose-bold": "#EDEBE6",
            "--tw-prose-counters": "#6B6975",
            "--tw-prose-bullets": "#6B6975",
            "--tw-prose-hr": "#26262C",
            "--tw-prose-quotes": "#EDEBE6",
            "--tw-prose-quote-borders": "#C9A86C",
            "--tw-prose-captions": "#6B6975",
            "--tw-prose-code": "#C9A86C",
            "--tw-prose-pre-code": "#EDEBE6",
            "--tw-prose-pre-bg": "#1C1C20",
            "--tw-prose-th-borders": "#26262C",
            "--tw-prose-td-borders": "#26262C",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
