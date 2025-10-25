const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Add this to resolve the duplicate module issue
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // Add any specific path resolutions if needed
};

// Add this to ignore problematic node modules
config.resolver.blacklistRE = /#(.*)/;
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;