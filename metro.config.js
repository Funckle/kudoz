const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent Tamagui ESM web builds from loading on native
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform !== 'web' &&
    (moduleName === 'tamagui' ||
      moduleName.startsWith('@tamagui/'))
  ) {
    const resolved = context.resolveRequest(context, moduleName, platform);
    if (
      resolved?.filePath &&
      (resolved.filePath.includes('/dist/esm/') ||
        resolved.filePath.endsWith('.mjs'))
    ) {
      return context.resolveRequest(context, moduleName, platform);
    }
    return resolved;
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
