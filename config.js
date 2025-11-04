// config.js
// هذا الملف آمن ولا يحتوي أي توكن أو IDs مباشرة
// يقوم فقط بقراءة القيم من متغيرات البيئة (Environment Variables)

module.exports = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID
};
