module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    keyframes: {
      "fade-in-up": {
        "0%": {
          opacity: "0",
          transform: "translateY(10px)",
        },
        "100%": {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
    },
    animation: {
      "fade-in-up": "fade-in-up 0.3s ease-out",
    },
  },
  plugins: [require("flowbite/plugin")],
};
