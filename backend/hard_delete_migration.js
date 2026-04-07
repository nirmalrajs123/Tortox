const { pool } = require('./config/db');

const migrateToHardDelete = async () => {
    console.log("🚀 STARTING HARD DELETE MIGRATION...");

    const tablesWithIsDeleted = [
        'product_details',
        'categorys',
        'spec_label',
        'features',
        'filter_labels',
        'filter_values',
        'product_filters'
    ];

    try {
        // 1. Purge all records that were soft-deleted
        console.log("🗑️ Purging legacy soft-deleted records...");
        
        for (const table of tablesWithIsDeleted) {
            const res = await pool.query(`DELETE FROM ${table} WHERE is_deleted = true`);
            console.log(`   - ${table}: Removed ${res.rowCount} records.`);
        }

        // Special case for specifications
        const specRes = await pool.query(`DELETE FROM specifications WHERE specification_deleted = true`);
        console.log(`   - specifications: Removed ${specRes.rowCount} records.`);

        // 2. Drop the columns
        console.log("🔨 Dropping soft-delete columns from schema...");

        for (const table of tablesWithIsDeleted) {
            await pool.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS is_deleted`);
            console.log(`   - Removed 'is_deleted' from ${table}`);
        }

        await pool.query(`ALTER TABLE specifications DROP COLUMN IF EXISTS specification_deleted`);
        console.log(`   - Removed 'specification_deleted' from specifications`);

        console.log("✅ MIGRATION COMPLETE: Hard-delete architecture is now physical.");
    } catch (err) {
        console.error("❌ MIGRATION FAILED:", err.message);
    } finally {
        process.exit();
    }
};

migrateToHardDelete();
