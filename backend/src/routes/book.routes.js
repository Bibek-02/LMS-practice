// src/routes/book.routes.js    
import { Router } from "express";
import {
    createBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook
} from "../controllers/book.controller.js";

const router = Router();

    router.route("/")
        .get(getBooks)  // GET /api/books
        .post(createBook);

    router.route("/:id")
        .get(getBookById) // GET /api/books/:id
        .put(updateBook)
        .delete(deleteBook);

export default router;