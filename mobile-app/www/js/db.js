/**
 * Database Service
 * Handles local SQLite storage operations
 */
class DatabaseService {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    /**
     * Initialize the database
     * @returns {Promise} Promise that resolves when the database is initialized
     */
    initialize() {
        return new Promise((resolve, reject) => {
            if (this.initialized) {
                resolve(this.db);
                return;
            }

            document.addEventListener('deviceready', () => {
                try {
                    this.db = window.sqlitePlugin.openDatabase({
                        name: AppConfig.db.name,
                        location: 'default'
                    });

                    this.createTables()
                        .then(() => {
                            this.initialized = true;
                            console.log('Database initialized successfully');
                            resolve(this.db);
                        })
                        .catch(error => {
                            console.error('Error creating tables:', error);
                            reject(error);
                        });
                } catch (error) {
                    console.error('Error opening database:', error);
                    reject(error);
                }
            }, false);
        });
    }

    /**
     * Create database tables
     * @returns {Promise} Promise that resolves when tables are created
     */
    createTables() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                // Products table
                tx.executeSql(`
                    CREATE TABLE IF NOT EXISTS products (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        remote_id INTEGER,
                        name TEXT NOT NULL,
                        price REAL NOT NULL,
                        barcode TEXT,
                        description TEXT,
                        created_at TEXT,
                        updated_at TEXT,
                        synced INTEGER DEFAULT 0
                    )
                `, [], () => {
                    // Sync status table
                    tx.executeSql(`
                        CREATE TABLE IF NOT EXISTS sync_status (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            last_sync TEXT,
                            status TEXT
                        )
                    `, [], () => {
                        resolve();
                    }, (_, error) => {
                        reject(error);
                    });
                }, (_, error) => {
                    reject(error);
                });
            }, error => {
                reject(error);
            }, () => {
                // Transaction completed successfully
            });
        });
    }

    /**
     * Get all products from local database
     * @returns {Promise<Array>} Promise that resolves with array of products
     */
    getProducts() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM products ORDER BY name ASC',
                    [],
                    (_, result) => {
                        const products = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            products.push(result.rows.item(i));
                        }
                        resolve(products);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    /**
     * Get a product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Promise that resolves with product data
     */
    getProductById(id) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM products WHERE id = ?',
                    [id],
                    (_, result) => {
                        if (result.rows.length > 0) {
                            resolve(result.rows.item(0));
                        } else {
                            resolve(null);
                        }
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    /**
     * Get a product by barcode
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object>} Promise that resolves with product data
     */
    getProductByBarcode(barcode) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM products WHERE barcode = ?',
                    [barcode],
                    (_, result) => {
                        if (result.rows.length > 0) {
                            resolve(result.rows.item(0));
                        } else {
                            resolve(null);
                        }
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    /**
     * Save a product to local database
     * @param {Object} product - Product data
     * @returns {Promise<number>} Promise that resolves with the product ID
     */
    saveProduct(product) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            
            if (product.id) {
                // Update existing product
                this.db.transaction(tx => {
                    tx.executeSql(
                        `UPDATE products SET 
                        name = ?, 
                        price = ?, 
                        barcode = ?, 
                        description = ?, 
                        updated_at = ?,
                        synced = 0
                        WHERE id = ?`,
                        [
                            product.name,
                            product.price,
                            product.barcode,
                            product.description,
                            now,
                            product.id
                        ],
                        (_, result) => {
                            resolve(product.id);
                        },
                        (_, error) => {
                            reject(error);
                        }
                    );
                });
            } else {
                // Insert new product
                this.db.transaction(tx => {
                    tx.executeSql(
                        `INSERT INTO products (
                            name, price, barcode, description, created_at, updated_at, synced
                        ) VALUES (?, ?, ?, ?, ?, ?, 0)`,
                        [
                            product.name,
                            product.price,
                            product.barcode,
                            product.description,
                            now,
                            now
                        ],
                        (_, result) => {
                            resolve(result.insertId);
                        },
                        (_, error) => {
                            reject(error);
                        }
                    );
                });
            }
        });
    }

    /**
     * Delete a product from local database
     * @param {number} id - Product ID
     * @returns {Promise<boolean>} Promise that resolves with success status
     */
    deleteProduct(id) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'DELETE FROM products WHERE id = ?',
                    [id],
                    (_, result) => {
                        resolve(result.rowsAffected > 0);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    /**
     * Get products that need to be synced with the server
     * @returns {Promise<Array>} Promise that resolves with array of unsynced products
     */
    getUnsyncedProducts() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM products WHERE synced = 0',
                    [],
                    (_, result) => {
                        const products = [];
                        for (let i = 0; i < result.rows.length; i++) {
                            products.push(result.rows.item(i));
                        }
                        resolve(products);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    /**
     * Mark a product as synced in the local database
     * @param {number} id - Product ID
     * @param {number} remoteId - Remote product ID from server
     * @returns {Promise<boolean>} Promise that resolves with success status
     */
    markProductSynced(id, remoteId) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'UPDATE products SET synced = 1, remote_id = ? WHERE id = ?',
                    [remoteId, id],
                    (_, result) => {
                        resolve(result.rowsAffected > 0);
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    /**
     * Update sync status
     * @param {string} status - Sync status message
     * @returns {Promise<boolean>} Promise that resolves with success status
     */
    updateSyncStatus(status) {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            
            this.db.transaction(tx => {
                tx.executeSql(
                    'DELETE FROM sync_status',
                    [],
                    () => {
                        tx.executeSql(
                            'INSERT INTO sync_status (last_sync, status) VALUES (?, ?)',
                            [now, status],
                            (_, result) => {
                                resolve(result.rowsAffected > 0);
                            },
                            (_, error) => {
                                reject(error);
                            }
                        );
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }

    /**
     * Get last sync status
     * @returns {Promise<Object>} Promise that resolves with sync status data
     */
    getSyncStatus() {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM sync_status ORDER BY id DESC LIMIT 1',
                    [],
                    (_, result) => {
                        if (result.rows.length > 0) {
                            resolve(result.rows.item(0));
                        } else {
                            resolve({ last_sync: null, status: 'Never synced' });
                        }
                    },
                    (_, error) => {
                        reject(error);
                    }
                );
            });
        });
    }
}

// Create a singleton instance
const Database = new DatabaseService(); 