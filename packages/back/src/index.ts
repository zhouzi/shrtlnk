import path from "path";
import express from "express";
import { shortLinksRouter } from "./api";
import { createSchema } from "./database";

(async () => {
  await createSchema();

  const buildPath = path.join(__dirname, "..", "..", "front", "build");
  const app = express();

  app.use(express.json());
  app.use(express.static(buildPath));

  app.use("/api", shortLinksRouter);

  app.use((req, res) => res.send(path.join(buildPath, "index.html")));

  app.listen(process.env.PORT || 3001);
})();
