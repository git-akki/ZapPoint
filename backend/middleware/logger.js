const logger = (req, res, next) => {
  const now = new Date().toLocaleString();
  console.log(`[${now}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
};

export default logger;
