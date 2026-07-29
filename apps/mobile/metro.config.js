const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

const sourceIconFiles = [
  "betting_slip.png",
  "children_toy.png",
  "cigarettes.png",
  "compass.png",
  "cuff_link.png",
  "funeral_programme.png",
  "hanggun.png",
  "lipstick.png",
  "match_box.png",
  "newspaper.png",
  "wedding_invitation.png"
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

config.resolver.blockList = sourceIconFiles.map((fileName) => new RegExp(`${escapeRegExp(path.join(__dirname, "assets", "ravenwood", "icons", fileName))}$`));

module.exports = config;
