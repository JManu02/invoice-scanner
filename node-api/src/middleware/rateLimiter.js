const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Demasiados intentos. Intenta de nuevo en unos minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
