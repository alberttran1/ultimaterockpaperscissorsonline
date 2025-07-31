/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bulletproof: ["Bulletproof", "sans-serif"],
        adrenaline: ["Adrenaline", "sans-serif"],
      },
      keyframes: {
        jitter: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-20px, 20px)" },
          "50%": { transform: "translate(20px, -20px)" },
          "75%": { transform: "translate(-10px, 10px)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2rem)" },
        },
      },
      animation: {
        jitter: "jitter 0.1s ease-in-out",
        bob: "bob 2s ease-in-out infinite",
      },
      animationDelay: {
        0: "0s",
        5: "0.5s",
        10: "1s",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      const delays = theme("animationDelay");
      const newUtilities = Object.entries(delays).reduce(
        (acc, [key, value]) => {
          acc[`.animation-delay-${key}`] = { animationDelay: value };
          return acc;
        },
        {},
      );
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
