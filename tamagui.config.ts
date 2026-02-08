import { createTamagui } from 'tamagui';
import { tokens } from './src/tamagui/tokens';
import { systemFont } from './src/tamagui/fonts';
import { themes } from './src/tamagui/themes';

const config = createTamagui({
  tokens,
  themes,
  fonts: {
    body: systemFont,
    heading: systemFont,
  },
  defaultFont: 'body',
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
