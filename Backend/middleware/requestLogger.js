
const requestLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs =
      Number(process.hrtime.bigint() - startTime) / 1_000_000;

    const logEntry = {
      method: req.method,
      path: req.originalUrl.split("?")[0],
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
};

export default requestLogger;
