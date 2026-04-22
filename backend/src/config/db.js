import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "digital_heroes",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed!');
    console.error('Error Code:', err.code || 'UNKNOWN');
    console.error('Error Message:', err.message);
    console.error('Target Host:', process.env.DB_HOST ? process.env.DB_HOST.substring(0, 5) + '...' : 'NOT_SET');
  });

const KNOWN_FK_BY_JOIN_TABLE = {
  users: "user_id",
  draws: "draw_id",
  charities: "charity_id",
};

const parseSelect = (table, columns = "*") => {
  const joins = [];
  const selectColumns = [];

  const joinRegex = /([a-zA-Z0-9_]+)\s*\(([^)]+)\)/g;
  let joinMatch = joinRegex.exec(columns);
  while (joinMatch) {
    const joinTable = joinMatch[1].trim();
    const joinColumns = joinMatch[2]
      .split(",")
      .map((col) => col.trim())
      .filter(Boolean);
    joins.push({ joinTable, joinColumns });
    joinMatch = joinRegex.exec(columns);
  }

  const strippedColumns = columns.replace(joinRegex, "").replace(/,,+/g, ",").trim();
  const baseColumns = strippedColumns
    .split(",")
    .map((col) => col.trim())
    .filter(Boolean)
    .filter((col) => col !== "*");

  if (baseColumns.length === 0 || columns.includes("*")) {
    selectColumns.push(`${table}.*`);
  } else {
    for (const col of baseColumns) {
      selectColumns.push(`${table}.${col}`);
    }
  }

  for (const join of joins) {
    for (const col of join.joinColumns) {
      selectColumns.push(`${join.joinTable}.${col} AS __${join.joinTable}__${col}`);
    }
  }

  return { joins, selectColumns };
};

const shapeJoinedRows = (rows, joins) => {
  if (joins.length === 0) return rows;

  return rows.map((row) => {
    const mapped = { ...row };
    for (const { joinTable, joinColumns } of joins) {
      const nested = {};
      for (const col of joinColumns) {
        const key = `__${joinTable}__${col}`;
        nested[col] = row[key] ?? null;
        delete mapped[key];
      }
      const hasAnyValue = Object.values(nested).some((val) => val !== null);
      mapped[joinTable] = hasAnyValue ? nested : null;
    }
    return mapped;
  });
};

class SelectQueryBuilder {
  constructor(table, columns = "*") {
    this.table = table;
    this.columns = columns;
    this.filters = [];
    this.ordering = null;
    this.limitValue = null;
    this.singleMode = false;
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.ordering = { column, ascending };
    return this;
  }

  limit(value) {
    this.limitValue = value;
    return this;
  }

  single() {
    this.singleMode = true;
    return this;
  }

  async execute() {
    try {
      const { joins, selectColumns } = parseSelect(this.table, this.columns);
      let sql = `SELECT ${selectColumns.join(", ")} FROM ${this.table}`;
      const params = [];

      for (const { joinTable } of joins) {
        const fk =
          KNOWN_FK_BY_JOIN_TABLE[joinTable] ||
          `${joinTable.replace(/s$/, "")}_id` ||
          `${joinTable}_id`;
        sql += ` LEFT JOIN ${joinTable} ON ${this.table}.${fk} = ${joinTable}.id`;
      }

      if (this.filters.length > 0) {
        const clauses = this.filters.map(({ column }) => `${this.table}.${column} = ?`);
        sql += ` WHERE ${clauses.join(" AND ")}`;
        params.push(...this.filters.map(({ value }) => value));
      }

      if (this.ordering) {
        const direction = this.ordering.ascending ? "ASC" : "DESC";
        sql += ` ORDER BY ${this.table}.${this.ordering.column} ${direction}`;
      }

      if (this.limitValue !== null) {
        sql += " LIMIT ?";
        params.push(this.limitValue);
      }

      const [rows] = await pool.query(sql, params);
      const shapedRows = shapeJoinedRows(rows, joins);
      const data = this.singleMode ? (shapedRows.length > 0 ? shapedRows[0] : null) : shapedRows;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

class UpdateQueryBuilder {
  constructor(table, payload) {
    this.table = table;
    this.payload = payload;
    this.filters = [];
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  async execute() {
    try {
      const setKeys = Object.keys(this.payload).filter(
        (key) => this.payload[key] !== undefined
      );
      if (setKeys.length === 0) return { data: [], error: null };

      const setClause = setKeys.map((key) => `${key} = ?`).join(", ");
      const params = setKeys.map((key) => this.payload[key]);

      let sql = `UPDATE ${this.table} SET ${setClause}`;
      if (this.filters.length > 0) {
        const whereClause = this.filters.map(({ column }) => `${column} = ?`).join(" AND ");
        sql += ` WHERE ${whereClause}`;
        params.push(...this.filters.map(({ value }) => value));
      }

      const [result] = await pool.execute(sql, params);
      return { data: { affectedRows: result.affectedRows }, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

class DeleteQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  async execute() {
    try {
      let sql = `DELETE FROM ${this.table}`;
      const params = [];
      if (this.filters.length > 0) {
        const whereClause = this.filters.map(({ column }) => `${column} = ?`).join(" AND ");
        sql += ` WHERE ${whereClause}`;
        params.push(...this.filters.map(({ value }) => value));
      }
      const [result] = await pool.execute(sql, params);
      return { data: { affectedRows: result.affectedRows }, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

const db = {
  from(table) {
    return {
      select: (columns = "*") => new SelectQueryBuilder(table, columns),
      insert: async (payload) => {
        try {
          const rows = Array.isArray(payload) ? payload : [payload];
          const insertedRows = [];
          for (const row of rows) {
            const [result] = await pool.query(`INSERT INTO ${table} SET ?`, [row]);
            const [saved] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [
              result.insertId,
            ]);
            if (saved[0]) insertedRows.push(saved[0]);
          }
          return { data: insertedRows, error: null };
        } catch (error) {
          return { data: null, error: { message: error.message } };
        }
      },
      update: (payload) => new UpdateQueryBuilder(table, payload),
      delete: () => new DeleteQueryBuilder(table),
    };
  },
};

console.log("Database: Using MySQL");

export default db;
