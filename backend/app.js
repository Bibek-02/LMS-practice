import express from "express";
import morgan from "morgan";
import cors from "cors";
import bookRoutes from "./src/routes/book.routes.js";
import memberRoutes from "./src/routes/member.routes.js";
import notFound from "./src/middleware/notFound.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// health
app.get("/health", (req, res) => {
  console.log(">> /health hit");
  res.json({ status: "ok" });
});

app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use(notFound);
app.use(errorHandler);


// list direct routes 
const routes = [];
app._router?.stack?.forEach((layer) => {
  if (layer.route?.path) {
    const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(",");
    routes.push(`${methods} ${layer.route.path}`);
  }
});
console.log(">> Routes:", routes);

export default app;
