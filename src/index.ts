import { env } from "@/common/utils/envConfig";
import { app, logger } from "@/server";
import { connectDatabase, disconnectDatabase } from "./prisma.client";

connectDatabase()
  .then(() => {
    const server = app.listen(env.PORT, "0.0.0.0", async () => {
      const { NODE_ENV, HOST, PORT } = env;
      logger.info(
        `Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`
      );
    });

    const onCloseSignal = () => {
      logger.info("sigint received, shutting down");
      server.close(() => {
        logger.info("server closed");
        disconnectDatabase();
        process.exit();
      });
      setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
    };

    process.on("SIGINT", onCloseSignal);
    process.on("SIGTERM", onCloseSignal);
  })
  .catch((error) => {
    logger.error("Failed to start server:", error);
    process.exit(1);
  });
