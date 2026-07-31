const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

config.resolver.blockList = [
  new RegExp(`${escapeRegExp(path.join(__dirname, "assets", "ravenwood", "icons"))}[/\\\\][^/\\\\]+\\.png$`),
  new RegExp(`${escapeRegExp(path.join(__dirname, "assets", "ravenwood", "portraits"))}[/\\\\].*`)
];

module.exports = config;
