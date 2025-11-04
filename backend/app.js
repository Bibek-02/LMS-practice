import express from "express";
import morgan from "morgan";
import cors from "cors";
import bookRoutes from "./src/routes/book.routes.js";
import notFound from "./src/middleware/notFound.js";
import errorHandler from "./src/middleware/errorHandler.js";

console.log(">> app.js loaded"); // <— should print on start

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// quick ping
app.get("/__ping", (req, res) => {
  console.log(">> /__ping hit");
  res.send("pong");
});

// health
app.get("/health", (req, res) => {
  console.log(">> /health hit");
  res.json({ status: "ok" });
});

app.use("/api/books", bookRoutes);
app.use(notFound);
app.use(errorHandler);

// list direct routes (temporary)
const routes = [];
app._router?.stack?.forEach((layer) => {
  if (layer.route?.path) {
    const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(",");
    routes.push(`${methods} ${layer.route.path}`);
  }
});
console.log(">> Routes:", routes);

export default app;
