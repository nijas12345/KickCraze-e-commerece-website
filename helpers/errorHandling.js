function renderError(res, error, fallbackStatus = 500) {
  const statusCode = error.statusCode || fallbackStatus;
  const errorMessage = error.message || "Internal Server Error";
  console.error("Error:", errorMessage);
  return res.status(statusCode).render("errorPage", { statusCode, errorMessage });
}

module.exports = renderError