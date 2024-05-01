const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(
      `SELECT i.id, 
      i.comp_code, 
      i.amt, 
      i.paid, 
      i.add_date, 
      i.paid_date,
      c.name,
      c.description
       FROM invoices AS i INNER JOIN companies AS c ON (i.comp_code = c.code) WHERE id =$1`,
      [id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }
    const data = results.rows[0];
    const invoice = {
      id: data.id,
      company: {
        code: data.comp_code,
        name: data.name,
        description: data.description,
      },
      amt: data.amt,
      paid: data.paid,
      paid_date: data.paid_date,
    };
    return res.json({ invoices: invoice });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let { amt, paid } = req.body;
    let paidDate = null;

    const currResult = await db.query(
      `SELECT paid FROM invoices WHERE id = $1`,
      [id]
    );

    if (currResult.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }

    const currPaidData = currResult.rows[0].paidDate;
    if (!currPaidData && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidData;
    }

    const results = await db.query(
      `UPDATE invoices
      SET amt=$1, paid=$2, paid_date=$3
      WHERE id=$4
      RETURNING id, comp_code, amt, paid, add_date, paid_date
    `,
      [amt, paid, paidDate, id]
    );
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }
    return res.send({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

router.get("/companies/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(
      `SELECT c.code, c.name, c.description, i.id , i.amt, i.paid, i.add_date, i.paid_date
       FROM companies AS c 
       LEFT OUTER JOIN invoices AS i ON c.code = i.comp_code 
       WHERE c.code = $1`,
      [code]
    );
    if (results.rows.length) {
      // Extract the company info from the first row
      const { code, name, description } = results.rows[0];
      const invoices = results.rows
        .filter((row) => row.id != null)
        .map((row) => {
          return {
            id: row.id,
            amt: row.amt,
            paid: row.paid,
            add_date: row.add_date,
            paid_date: row.paid_date,
          };
        });
      return res.json({
        company: {
          code,
          name,
          description,
          invoices,
        },
      });
    } else {
      throw new ExpressError(`Company not found`, 404);
    }
  } catch (e) {
    return next(e);
  }
});
module.exports = router;
