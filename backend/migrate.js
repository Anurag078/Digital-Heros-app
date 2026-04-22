import db from "./src/config/db.js";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const migrate = async () => {
    console.log("Running migrations...");
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASS ?? process.env.DB_PASSWORD ?? "",
            database: process.env.DB_NAME || "digital_heroes",
            port: Number(process.env.DB_PORT || 3306),
        });

        const [userCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'country'");
        if (userCols.length === 0) {
            console.log("Adding country to users...");
            await pool.query("ALTER TABLE users ADD COLUMN country VARCHAR(100) DEFAULT 'India'");
        }

        const [userPercentCol] = await pool.query("SHOW COLUMNS FROM users LIKE 'charity_percentage'");
        if (userPercentCol.length === 0) {
            console.log("Adding charity_percentage to users...");
            await pool.query("ALTER TABLE users ADD COLUMN charity_percentage DECIMAL(5,2) DEFAULT 10.00");
        }

        const [charityCols] = await pool.query("SHOW COLUMNS FROM charities LIKE 'country'");
        if (charityCols.length === 0) {
            console.log("Adding country to charities...");
            await pool.query("ALTER TABLE charities ADD COLUMN country VARCHAR(100) DEFAULT 'India'");
        }

        const [eventCols] = await pool.query("SHOW COLUMNS FROM charities LIKE 'events'");
        if (eventCols.length === 0) {
            console.log("Adding events to charities...");
            await pool.query("ALTER TABLE charities ADD COLUMN events TEXT NULL");
        }

        const [charityRecipientCol] = await pool.query("SHOW COLUMNS FROM charities LIKE 'is_recipient'");
        if (charityRecipientCol.length === 0) {
            console.log("Adding is_recipient to charities...");
            await pool.query("ALTER TABLE charities ADD COLUMN is_recipient TINYINT(1) DEFAULT 0");
        }

        const [drawStatusCol] = await pool.query("SHOW COLUMNS FROM draws LIKE 'status'");
        if (drawStatusCol.length === 0) {
            console.log("Adding status and pool columns to draws...");
            await pool.query("ALTER TABLE draws ADD COLUMN status VARCHAR(20) DEFAULT 'simulated'");
            await pool.query("ALTER TABLE draws ADD COLUMN total_pool DECIMAL(10,2) DEFAULT 0.00");
            await pool.query("ALTER TABLE draws ADD COLUMN pool_5 DECIMAL(10,2) DEFAULT 0.00");
            await pool.query("ALTER TABLE draws ADD COLUMN pool_4 DECIMAL(10,2) DEFAULT 0.00");
            await pool.query("ALTER TABLE draws ADD COLUMN pool_3 DECIMAL(10,2) DEFAULT 0.00");
            await pool.query("ALTER TABLE draws ADD COLUMN rollover_from DECIMAL(10,2) DEFAULT 0.00");
        }

        const [charityImageCol] = await pool.query("SHOW COLUMNS FROM charities LIKE 'image_url'");
        if (charityImageCol.length === 0) {
            console.log("Adding image_url to charities...");
            await pool.query("ALTER TABLE charities ADD COLUMN image_url TEXT NULL");
        }

        const [campaignTable] = await pool.query("SHOW TABLES LIKE 'campaigns'");
        if (campaignTable.length === 0) {
            console.log("Creating campaigns table...");
            await pool.query(`
                CREATE TABLE campaigns (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    image_url TEXT,
                    start_date DATE,
                    end_date DATE,
                    status VARCHAR(20) DEFAULT 'draft',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        console.log("Migrations completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
