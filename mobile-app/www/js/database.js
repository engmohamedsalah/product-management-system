/**
 * Database Service
 * Handles local database operations for offline functionality
 */
class DatabaseService {
    constructor() {
        this.db = null;
        this.dbName = 'productManagementSystem';
        this.dbVersion = 2;
        this.storeName = 'products';
        this.changesStoreName = 'pendingChanges';
        this.initialized = false;
    }

    /**
     * Initialize the database
     * @returns {Promise} Promise that resolves when database is ready
     */
    async init() {
        if (this.initialized) {
            return Promise.resolve(this.db);
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = event => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = event => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('Database opened successfully');
                
                // Fetch products from the API and store them locally
                this.syncWithBackend().then(() => {
                    resolve(this.db);
                }).catch(error => {
                    console.error('Error syncing with backend:', error);
                    resolve(this.db); // Resolve anyway to use local data
                });
            };

            request.onupgradeneeded = event => {
                console.log(`Database upgrade needed from version ${event.oldVersion} to ${event.newVersion}`);
                const db = event.target.result;
                
                // Create object store for products if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    try {
                        const store = db.createObjectStore(this.storeName, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        
                        // Create indexes for searching
                        store.createIndex('barcode', 'barcode', { unique: true });
                        store.createIndex('name', 'name', { unique: false });
                        store.createIndex('remote_id', 'remote_id', { unique: false });
                        
                        console.log('Products object store created successfully');
                    } catch (error) {
                        console.error('Error creating products store:', error);
                        reject(error);
                    }
                }
                
                // Create object store for pending changes if it doesn't exist
                if (!db.objectStoreNames.contains(this.changesStoreName)) {
                    try {
                        const changesStore = db.createObjectStore(this.changesStoreName, {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        
                        // Create indexes for searching
                        changesStore.createIndex('action', 'action', { unique: false });
                        changesStore.createIndex('timestamp', 'timestamp', { unique: false });
                        changesStore.createIndex('synced', 'synced', { unique: false });
                        
                        console.log('Pending changes store created successfully');
                    } catch (error) {
                        console.error('Error creating pending changes store:', error);
                        reject(error);
                    }
                }
                
                console.log('Database schema upgrade completed');
            };
        });
    }
    
    /**
     * Sync local database with backend
     * @returns {Promise} Promise that resolves when sync completes
     */
    async syncWithBackend() {
        try {
            // Skip if offline
            if (!navigator.onLine) {
                console.log('Device offline, skipping sync with backend');
                return;
            }
            
            console.log('Syncing database with backend');
            
            // Get all products from the API
            const apiProducts = await Api.getProducts();
            
            if (!apiProducts || !Array.isArray(apiProducts)) {
                console.warn('Invalid products data from API');
                return;
            }
            
            console.log(`Retrieved ${apiProducts.length} products from API`);
            
            // Get all local products
            const localProducts = await this.getProducts();
            
            // Create a map of local products by barcode for quick lookup
            const localProductsMap = {};
            localProducts.forEach(product => {
                localProductsMap[product.barcode] = product;
            });
            
            // Process each API product
            for (const apiProduct of apiProducts) {
                const localProduct = localProductsMap[apiProduct.barcode];
                
                if (localProduct) {
                    // Update local product if API version is newer
                    const apiUpdatedAt = new Date(apiProduct.updatedAt);
                    const localUpdatedAt = new Date(localProduct.updatedAt);
                    
                    if (apiUpdatedAt > localUpdatedAt) {
                        await this.saveProduct({
                            ...apiProduct,
                            id: localProduct.id, // Preserve local ID
                            fromApi: true
                        });
                        console.log(`Updated local product: ${apiProduct.name}`);
                    }
                } else {
                    // Add new product from API
                    await this.saveProduct({
                        ...apiProduct,
                        fromApi: true
                    });
                    console.log(`Added new product from API: ${apiProduct.name}`);
                }
            }
            
            console.log('Database sync completed');
        } catch (error) {
            console.error('Error syncing with backend:', error);
            throw error;
        }
    }

    /**
     * Add sample data for testing
     */
    async addSampleData() {
        try {
            // Check if we already have sample data
            const products = await this.getProducts();
            if (products && products.length > 0) {
                return; // Already have data
            }

            // Sample products
            const sampleProducts = [
                {
                    name: 'Widget A',
                    price: 19.99,
                    barcode: '123456789012',
                    description: 'A high quality widget for all your needs.',
                    remote_id: 1
                },
                {
                    name: 'Widget B',
                    price: 24.99,
                    barcode: '223456789013',
                    description: 'Premium widget with enhanced features.',
                    remote_id: 2
                },
                {
                    name: 'Gadget X',
                    price: 49.99,
                    barcode: '323456789014',
                    description: 'Advanced gadget with smart technology.',
                    remote_id: 3
                }
            ];

            // Save sample products
            for (const product of sampleProducts) {
                await this.saveProduct(product);
            }

            console.log('Sample data added successfully');
        } catch (error) {
            console.error('Error adding sample data:', error);
        }
    }

    /**
     * Get all products from local database
     * @returns {Promise<Array>} Promise that resolves with array of products
     */
    async getProducts() {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onsuccess = event => {
                resolve(event.target.result);
            };
            
            request.onerror = event => {
                console.error('Error getting products:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Promise that resolves with product data
     */
    async getProductById(id) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            
            request.onsuccess = event => {
                resolve(event.target.result);
            };
            
            request.onerror = event => {
                console.error('Error getting product:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Get product by barcode
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object>} Promise that resolves with product data
     */
    async getProductByBarcode(barcode) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index('barcode');
            const request = index.get(barcode);
            
            request.onsuccess = event => {
                const localProduct = event.target.result;
                
                // If online and product not found locally, try to fetch from API
                if (!localProduct && navigator.onLine) {
                    Api.getProductByBarcode(barcode)
                        .then(apiProduct => {
                            if (apiProduct) {
                                // Save to local database
                                this.saveProduct({
                                    ...apiProduct,
                                    fromApi: true
                                })
                                    .then(() => {
                                        resolve(apiProduct);
                                    })
                                    .catch(error => {
                                        console.error('Error saving product from API:', error);
                                        resolve(apiProduct);
                                    });
                            } else {
                                resolve(null);
                            }
                        })
                        .catch(error => {
                            console.error('Error getting product from API:', error);
                            resolve(localProduct);
                        });
                } else {
                    resolve(localProduct);
                }
            };
            
            request.onerror = event => {
                console.error('Error getting product by barcode:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Save product to local database
     * @param {Object} product - Product to save
     * @returns {Promise<number>} Promise that resolves with product ID
     */
    async saveProduct(product) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // Make sure we have created/updated timestamps
            if (!product.createdAt) {
                product.createdAt = new Date().toISOString();
            }
            product.updatedAt = new Date().toISOString();
            
            const request = store.put(product);
            
            request.onsuccess = event => {
                // Add to sync queue if this is a local change
                if (navigator.onLine && window.SyncManager && !product.fromApi) {
                    const action = product.id ? 'update' : 'create';
                    window.SyncManager.addToSyncQueue(action, product);
                }
                
                resolve(event.target.result);
            };
            
            request.onerror = event => {
                console.error('Error saving product:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Delete product from local database
     * @param {number} id - Product ID
     * @returns {Promise<boolean>} Promise that resolves with success status
     */
    async deleteProduct(id) {
        await this.init();
        
        // Get the product first so we can add it to sync queue if necessary
        const product = await this.getProductById(id);
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            
            request.onsuccess = event => {
                // Add to sync queue if online
                if (navigator.onLine && window.SyncManager && product) {
                    window.SyncManager.addToSyncQueue('delete', product);
                }
                
                resolve(true);
            };
            
            request.onerror = event => {
                console.error('Error deleting product:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Clear all products from local database
     * @returns {Promise<boolean>} Promise that resolves with success status
     */
    async clearProducts() {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            
            request.onsuccess = event => {
                resolve(true);
            };
            
            request.onerror = event => {
                console.error('Error clearing products:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Add a product
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Promise that resolves with the saved product
     */
    async addProduct(productData) {
        const product = {
            ...productData,
            fromApi: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const id = await this.saveProduct(product);
        return this.getProductById(id);
    }
    
    /**
     * Update a product
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} Promise that resolves with the updated product
     */
    async updateProduct(id, productData) {
        const existingProduct = await this.getProductById(id);
        
        if (!existingProduct) {
            throw new Error('Product not found');
        }
        
        const updatedProduct = {
            ...existingProduct,
            ...productData,
            fromApi: false,
            updatedAt: new Date().toISOString()
        };
        
        await this.saveProduct(updatedProduct);
        return this.getProductById(id);
    }

    /**
     * Get all pending changes that need to be synced
     * @returns {Promise<Array>} Promise that resolves with array of pending changes
     */
    async getPendingChanges() {
        try {
            await this.init();
            
            // Verify that the database has the required object store
            if (!this.db.objectStoreNames.contains(this.changesStoreName)) {
                console.error(`The '${this.changesStoreName}' object store does not exist`);
                return [];
            }
            
            return new Promise((resolve, reject) => {
                try {
                    const transaction = this.db.transaction([this.changesStoreName], 'readonly');
                    const store = transaction.objectStore(this.changesStoreName);
                    
                    // Ensure the index exists
                    if (!store.indexNames.contains('synced')) {
                        console.error("The 'synced' index does not exist in the pending changes store");
                        resolve([]);
                        return;
                    }
                    
                    // Get all changes that haven't been synced
                    const index = store.index('synced');
                    const request = index.getAll(0); // 0 = not synced
                    
                    request.onsuccess = event => {
                        resolve(event.target.result || []);
                    };
                    
                    request.onerror = event => {
                        console.error('Error getting pending changes:', event.target.error);
                        reject(event.target.error);
                    };
                } catch (error) {
                    console.error('Error in getPendingChanges transaction:', error);
                    resolve([]);
                }
            });
        } catch (error) {
            console.error('Error in getPendingChanges:', error);
            return [];
        }
    }
    
    /**
     * Mark a change as synced
     * @param {number} changeId - ID of the change to mark as synced
     * @returns {Promise} Promise that resolves when change is marked as synced
     */
    async markChangeAsSynced(changeId) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.changesStoreName], 'readwrite');
            const store = transaction.objectStore(this.changesStoreName);
            
            // Get the change
            const request = store.get(changeId);
            
            request.onsuccess = event => {
                const change = event.target.result;
                
                if (!change) {
                    reject(new Error(`Change with ID ${changeId} not found`));
                    return;
                }
                
                // Mark as synced
                change.synced = 1;
                change.syncedAt = new Date().toISOString();
                
                // Update in store
                const updateRequest = store.put(change);
                
                updateRequest.onsuccess = () => {
                    resolve();
                };
                
                updateRequest.onerror = event => {
                    console.error('Error marking change as synced:', event.target.error);
                    reject(event.target.error);
                };
            };
            
            request.onerror = event => {
                console.error('Error getting change:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Update products from server data
     * @param {Array} serverProducts - Array of products from server
     * @returns {Promise} Promise that resolves when products are updated
     */
    async updateProductsFromServer(serverProducts) {
        await this.init();
        
        // Process each product from server
        for (const serverProduct of serverProducts) {
            try {
                // Try to find product by barcode
                const localProduct = await this.getProductByBarcode(serverProduct.barcode);
                
                if (localProduct) {
                    // Update existing product
                    await this.saveProduct({
                        ...serverProduct,
                        id: localProduct.id, // Preserve local ID
                        fromApi: true
                    });
                    console.log(`Updated local product from server: ${serverProduct.name}`);
                } else {
                    // Add new product
                    await this.saveProduct({
                        ...serverProduct,
                        fromApi: true
                    });
                    console.log(`Added new product from server: ${serverProduct.name}`);
                }
            } catch (error) {
                console.error(`Error processing server product ${serverProduct.barcode}:`, error);
            }
        }
        
        return Promise.resolve();
    }
    
    /**
     * Record a change for later synchronization
     * @param {string} action - Action type ('create', 'update', 'delete')
     * @param {Object} data - Data associated with the change
     * @returns {Promise} Promise that resolves when change is recorded
     */
    async recordChange(action, data) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.changesStoreName], 'readwrite');
            const store = transaction.objectStore(this.changesStoreName);
            
            // Create change record
            const change = {
                action,
                data,
                timestamp: new Date().toISOString(),
                synced: 0 // Not synced
            };
            
            // Add to store
            const request = store.add(change);
            
            request.onsuccess = event => {
                resolve(event.target.result);
            };
            
            request.onerror = event => {
                console.error('Error recording change:', event.target.error);
                reject(event.target.error);
            };
        });
    }
    
    /**
     * Save product and record change for sync
     * @param {Object} product - Product data
     * @returns {Promise} Promise that resolves with saved product
     */
    async saveProductWithSync(product) {
        // Save to local database
        const savedProduct = await this.saveProduct(product);
        
        // Record change for sync if not from API
        if (!product.fromApi) {
            const action = product.id ? 'update' : 'create';
            await this.recordChange(action, savedProduct);
        }
        
        return savedProduct;
    }
    
    /**
     * Delete product and record change for sync
     * @param {number} id - Product ID
     * @returns {Promise} Promise that resolves when product is deleted
     */
    async deleteProductWithSync(id) {
        // Get product before deleting
        const product = await this.getProduct(id);
        
        // Delete from local database
        await this.deleteProduct(id);
        
        // Record change for sync
        if (product) {
            await this.recordChange('delete', product);
        }
        
        return Promise.resolve();
    }

    /**
     * Reset the database - delete and recreate
     * @returns {Promise} Promise that resolves when database is reset
     */
    async resetDatabase() {
        console.log('Resetting database...');
        
        // First, close the current connection if open
        if (this.db) {
            this.db.close();
            this.db = null;
        }
        
        this.initialized = false;
        
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);
            
            deleteRequest.onsuccess = event => {
                console.log('Database deleted successfully');
                // Reinitialize the database
                this.init()
                    .then(() => {
                        console.log('Database recreated successfully');
                        resolve();
                    })
                    .catch(error => {
                        console.error('Error recreating database:', error);
                        reject(error);
                    });
            };
            
            deleteRequest.onerror = event => {
                console.error('Error deleting database:', event.target.error);
                reject(event.target.error);
            };
            
            deleteRequest.onblocked = event => {
                console.warn('Database deletion blocked. Please close all tabs and try again.');
                reject(new Error('Database deletion blocked'));
            };
        });
    }
}

// Create a singleton instance
const Database = new DatabaseService(); 