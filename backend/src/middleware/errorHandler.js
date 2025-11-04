export default function errorHandler(err, req, res, next) {
    console.error("ERROR:", err);
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        status: "error",
        message, 
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack})
    });
}

//last line - only include the detailed error stack when in development, not in production (for security).