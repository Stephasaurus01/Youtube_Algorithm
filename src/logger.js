const log4js = require("log4js");

log4js.configure({
  appenders: { logger: { type: "file", filename: "./logs/log1" } },
  categories: { default: { appenders: ["logger"], level: "info" } },
});
module.exports = log4js.getLogger("logger");
