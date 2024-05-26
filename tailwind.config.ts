import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: 'class', // ou 'media' se preferir usar a preferência do sistema
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: {
          light: '#ffffff', // Cor de fundo para modo claro
          dark: '#1a202c', // Cor de fundo para modo escuro
        },
        text: {
          light: '#000000', // Cor do texto para modo claro
          dark: '#ffffff', // Cor do texto para modo escuro
        },
      },
    },
  },
  plugins: [],
};

export default config;

