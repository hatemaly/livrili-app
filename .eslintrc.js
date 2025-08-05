module.exports = {
  root: true,
  extends: ['@livrili/eslint-config'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
  },
}