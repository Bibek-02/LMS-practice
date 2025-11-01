export const ok = (res, data, message ="OK", status =200) => 
    res.status(status).json({status: "success", message, data});

export const fail = (res, message = "Bad Request", status = 400, details) =>
    res.status(status).json({status: "error", message, ...(details && {details}) });

/* ...(details && { details })	Spread operator trick — adds details only if it exists. */