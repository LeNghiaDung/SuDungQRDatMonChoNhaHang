module.exports = {
  plugins: {
    "postcss-flexbugs-fixes": {},
    tailwindcss: {},
    autoprefixer: {},
    "postcss-preset-env": {
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
    },
  },
}

