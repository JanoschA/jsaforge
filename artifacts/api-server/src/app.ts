import cors from "cors";
import express, { type Express } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import pinoHttp from "pino-http";
import { logger } from "./lib/logger";
import router from "./routes";

const app: Express = express();

app.set("trust proxy", true);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const staticDirCandidates = [
  process.env.STATIC_DIR,
  path.resolve(process.cwd(), "dist"),
].filter((value): value is string => typeof value === "string" && value.trim().length > 0);

const staticDir = staticDirCandidates.find((candidate) => existsSync(candidate));

if (staticDir) {
  app.use(express.static(staticDir));
  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
