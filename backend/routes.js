const express = require('express');
const router = express.Router();
const pool = require('./db');
const { Parser } = require('json2csv');
const json2xls = require('json2xls');

// ========== 1) SUGGESTIONS ROUTE ==========
router.get('/suggestions', async (req, res) => {
  try {
    const { field, query } = req.query;

    if (!field) {
      return res.status(400).json({ error: 'No field provided for suggestions' });
    }

    // Build the SQL query using a subquery so that we can order by an expression (LENGTH)
    // that is not directly in the DISTINCT select list.
    let sql = `
      SELECT suggestion FROM (
        SELECT DISTINCT ${field} AS suggestion
        FROM main
        WHERE ${field} IS NOT NULL AND ${field} <> ''
        ${query ? 'AND ' + field + ' ILIKE $1' : ''}
      ) sub
      ORDER BY LENGTH(suggestion), suggestion ASC
      LIMIT 50
    `;
    let params = [];
    if (query) {
      params.push(`${query}%`); // Matches words starting with the input
    }

    const { rows } = await pool.query(sql, params);
    
    // Return only the suggestion values
    res.json(rows.map(r => r.suggestion));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching suggestions' });
  }
});

// Helper function: builds a WHERE clause from filters in a specified order.
function buildWhereClause(filters, fieldsOrder) {
  let conditions = [];
  // Use the order provided by the client. If none provided, use all keys.
  const order = fieldsOrder && Array.isArray(fieldsOrder) ? fieldsOrder : Object.keys(filters);

  for (const field of order) {
    const { value, operator } = filters[field];
    if (value && value.trim() !== '') {
      conditions.push({ clause: `${field} ILIKE '%${value}%'`, operator });
    }
  }

  if (conditions.length === 0) {
    return '';
  }

  let whereClause = conditions[0].clause;
  for (let i = 1; i < conditions.length; i++) {
    whereClause += ` ${conditions[i].operator} ${conditions[i].clause}`;
  }
  return `WHERE ${whereClause}`;
}

// ========== 2) SEARCH MAIN TABLE ==========
router.post('/search-main', async (req, res) => {
  try {
    const { filters, fieldsOrder } = req.body;

    // First, fetch full rows from the main table using filters
    let baseQuery = 'SELECT * FROM main';
    const whereClause = buildWhereClause(filters, fieldsOrder);
    if (whereClause) {
      baseQuery += ` ${whereClause}`;
    }

    const { rows: mainResults } = await pool.query(baseQuery);

    // If no results found in main table, return empty results
    if (mainResults.length === 0) {
      return res.json({ mainResults: [], productResults: [], packageResults: [], therapeuticResults: [], immunogenicityResults: [] });
    }

    // Extract productid, ndcpackagecode, and proprietaryname from all rows
    const productIds = mainResults.map(row => row.productid);
    const ndcPackageCodes = mainResults.map(row => row.ndcpackagecode);
    const proprietaryNames = [...new Set(
      mainResults
        .map(row => row.proprietaryname ? row.proprietaryname.trim().toLowerCase() : null)
        .filter(name => name !== null) // Remove null values
    )];
    if (proprietaryNames.length === 0) {
      return res.json({ therapeuticResults: [] });
    }

    // Fetch related data from product and package tables
    const productQuery = `SELECT productid, productndc, producttypename, proprietaryname, nonproprietaryname FROM product WHERE productid = ANY($1)`;
    const { rows: productResults } = await pool.query(productQuery, [productIds]);

    const packageQuery = `SELECT * FROM package WHERE ndcpackagecode = ANY($1)`;
    const { rows: packageResults } = await pool.query(packageQuery, [ndcPackageCodes]);

    let therapeuticQuery = `SELECT t_id, audit_status, proprietaryname, nonproprietaryname, unii, productid, ndcpackagecode FROM therapeutic WHERE TRIM(LOWER(proprietaryname)) = ANY($1)`;
    const { rows: therapeuticResults } = await pool.query(therapeuticQuery, [proprietaryNames]);

    let immunogenicityQuery = `SELECT trial_idc_identifier, trial_external_identifier, proprietaryname, nonproprietaryname FROM trial WHERE TRIM(LOWER(proprietaryname)) ILIKE ANY($1)`;
    const { rows: immunogenicityResults } = await pool.query(immunogenicityQuery, [proprietaryNames.map(name => `%${name}%`)]);

    //const uniqueProprietaryNames = [...new Set(proprietaryNames.map(name => `%${name.toLowerCase().trim()}%`))];
    //const { rows: immunogenicityResults } = await pool.query(immunogenicityQuery, [uniqueProprietaryNames]);

    // Send results back
    res.json({ mainResults, productResults, packageResults, therapeuticResults, immunogenicityResults });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error searching main table' });
  }
});


// ========== 3) SEARCH THERAPEUTIC TABLE ==========
router.post('/search-therapeutic', async (req, res) => {
  try {
    const { filters } = req.body;
    let baseQuery = 'SELECT * FROM therapeutic';
    const whereClause = buildWhereClause(filters);
    if (whereClause) {
      baseQuery += ` ${whereClause}`;
    }
    const { rows } = await pool.query(baseQuery);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error searching therapeutic table' });
  }
});

// ========== 4) SEARCH PRODUCT TABLE ==========
router.post('/search-product', async (req, res) => {
  try {
    const { filters } = req.body;
    let baseQuery = 'SELECT * FROM product';
    const whereClause = buildWhereClause(filters);
    if (whereClause) {
      baseQuery += ` ${whereClause}`;
    }
    const { rows } = await pool.query(baseQuery);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error searching product table' });
  }
});

// ========== 5) SEARCH PACKAGE TABLE ==========
router.post('/search-package', async (req, res) => {
  try {
    const { filters } = req.body;
    let baseQuery = 'SELECT * FROM package';
    const whereClause = buildWhereClause(filters);
    if (whereClause) {
      baseQuery += ` ${whereClause}`;
    }
    const { rows } = await pool.query(baseQuery);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error searching package table' });
  }
});

// ========== 6) SEARCH TRIAL TABLE FOR IMMUNOGENICITY DATA ==========
router.post('/search-immunogenicity', async (req, res) => {
  try {
    const { filters } = req.body;
    let baseQuery = 'SELECT * FROM trial';
    const whereClause = buildWhereClause(filters);
    if (whereClause) {
      baseQuery += ` ${whereClause}`;
    }
    const { rows } = await pool.query(baseQuery);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error searching trial table' });
  }
});

// ========== 7) DOWNLOAD SINGLE RECORD (CSV or JSON) ==========
router.post('/download', async (req, res) => {
  try {
    const { data, format } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data for download' });
    }

    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="data.json"');
      res.json(data);
    } else if (format === 'csv') {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);
      res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
      res.set('Content-Type', 'text/csv');
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Invalid format for download' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating download' });
  }
});

// ========== 8) DOWNLOAD ALL DATA IN SEPARATE EXCEL FILES ==========
router.get('/download-all-excel', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM main');
    const xls = json2xls(rows);
    res.setHeader('Content-Disposition', 'attachment; filename="main.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(Buffer.from(xls, 'binary'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating excel file' });
  }
});

// ========== 9) FETCH FULL DETAILS FOR A RECORD ==========
router.get('/get-details', async (req, res) => {
  try {
    const { productid, ndcpackagecode } = req.query;

    if (!productid && !ndcpackagecode) {
      return res.status(400).json({ error: "Missing productid or ndcpackagecode" });
    }

    let response = {};

    // Fetch full product details
    if (productid) {
      const productQuery = `SELECT * FROM product WHERE productid = $1`;
      const { rows: productData } = await pool.query(productQuery, [productid]);
      response.product = productData.length > 0 ? productData[0] : {};
    }

    // Fetch full therapeutic details
    if (productid) {
      const therapeuticQuery = `SELECT * FROM therapeutic WHERE productid = $1`;
      const { rows: therapeuticData } = await pool.query(therapeuticQuery, [productid]);
      response.therapeutic = therapeuticData.length > 0 ? therapeuticData[0] : {};
    }

    // Fetch full immunogenicity (trial) details
    if (productid) {
      const trialQuery = `SELECT * FROM trial WHERE proprietaryname IN (SELECT proprietaryname FROM product WHERE productid = $1)`;
      const { rows: trialData } = await pool.query(trialQuery, [productid]);
      response.immunogenicity = trialData.length > 0 ? trialData[0] : {};
    }

    // Fetch package details
    if (ndcpackagecode) {
      const packageQuery = `SELECT * FROM package WHERE ndcpackagecode = $1`;
      const { rows: packageData } = await pool.query(packageQuery, [ndcpackagecode]);
      response.package = packageData.length > 0 ? packageData[0] : {};
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching record details" });
  }
});


module.exports = router;
