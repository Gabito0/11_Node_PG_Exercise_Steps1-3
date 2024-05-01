const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const { validateCompanyData } = require("../middleware");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    if (typeof code === "number" || code === "") {
      throw new ExpressError("Invalid code value", 404);
    }
    const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Couldn't find company`, 404);
    }
    return res.json({ company: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", validateCompanyData, async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const results = await db.query(
      `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *`,
      [name, description, code]
    );
    return res.send({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    if (typeof code !== "string") {
      throw new ExpressError("Invalid value", 404);
    }
    const results = await db.query(`DELETE FROM companies WHERE code=$1`, [
      code,
    ]);
    return res.send({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});
module.exports = router;
