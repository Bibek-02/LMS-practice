import express from "express";
import morgan from "morgan";
import cors from "cors";
import bookRoutes from "./routes/book.routes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/books", bookRoutes);

// Health check (useful for Postman)
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(notFound);
app.use(errorHandler);

export default app;
