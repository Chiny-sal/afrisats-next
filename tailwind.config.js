/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#12141C",
        surface: "#1B1E29",
        gold: "#E8A94D",
        jade: "#2F9E7D",
        coral: "#E8735C",
        violet: "#8B7FD1",
        primary: "#EDE6D6",
        muted: "#8A8D9A",
      },
      fontFamily: {
        display: ["Segoe UI", "Arial", "sans-serif"],
        body: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(2) rotate(-12deg)", opacity: "0" },
          "60%": { transform: "scale(1.05) rotate(-6deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-6deg)", opacity: "1" },
        },
      },
      animation: {
        stamp: "stamp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
