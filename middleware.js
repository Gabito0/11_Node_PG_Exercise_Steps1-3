const ExpressError = require("./expressError");

function validateCompanyData(req, res, next) {
  const { code, name, description } = req.body;

  // Check for missing data
  if (!code || !name || !description) {
    throw new ExpressError("Missing value from the fields", 404);
  }

  // Check for correct data
  if (
    typeof code !== "string" ||
    typeof name !== "string" ||
    typeof description !== "string"
  ) {
    throw new ExpressError("Invalid input type", 404);
  }
  next();
}

module.exports = { validateCompanyData };
