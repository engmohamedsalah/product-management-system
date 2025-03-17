/**
 * Sync Service
 * Handles data synchronization between local database and backend API
 */
class SyncService {
    constructor() {
        this.syncQueue = [];
        this.isSyncing = false;
        this.lastSyncTime = localStorage.getItem('lastSyncTime') ? 
            parseInt(localStorage.getItem('lastSyncTime')) : null;
        this.syncInProgress = false;
        this.failedSyncCount = 0; // Track failed sync attempts
        
        // Initialize sync when device is ready
        document.addEventListener('deviceready', this.initialize.bind(this), false);
    }
    
    /**
     * Initialize sync service
     */
    initialize() {
        console.log('Initializing sync service');
        
        // Add event listeners for online/offline status
        document.addEventListener('online', this.onDeviceOnline.bind(this), false);
        
        // Set up periodic sync if enabled
        if (AppConfig.sync.autoSync) {
            setInterval(() => {
                this.syncIfOnline();
            }, AppConfig.sync.syncInterval);
        }
        
        // Try to sync on startup if online
        if (navigator.onLine) {
            this.syncIfOnline();
        }
    }
    
    /**
     * Handle device coming online
     */
    onDeviceOnline() {
        console.log('Device online, attempting to sync');
        this.syncIfOnline();
    }
    
    /**
     * Sync if device is online
     * @returns {Promise} Promise that resolves when sync completes
     */
    async syncIfOnline() {
        // Skip if sync is already in progress
        if (this.syncInProgress) {
            console.log('Sync already in progress, skipping');
            return;
        }
        
        // Skip if offline
        if (!navigator.onLine) {
            console.log('Device offline, skipping sync');
            return;
        }
        
        try {
            this.syncInProgress = true;
            this.showSyncNotification('Synchronizing data...', 'info');
            
            await this.syncData();
            
            this.lastSyncTime = Date.now();
            localStorage.setItem('lastSyncTime', this.lastSyncTime.toString());
            
            // Reset failed sync counter on success
            this.failedSyncCount = 0;
            
            this.showSyncNotification('Synchronization complete', 'success');
            console.log('Sync completed successfully');
        } catch (error) {
            console.error('Sync failed:', error);
            this.failedSyncCount++; // Increment failed sync counter
            
            // If we've had too many failures, attempt to reset the database
            if (this.failedSyncCount >= 3) {
                console.warn(`Sync failed ${this.failedSyncCount} times, attempting to reset database`);
                try {
                    this.showSyncNotification('Resetting database due to sync issues...', 'warning');
                    await Database.resetDatabase();
                    this.failedSyncCount = 0; // Reset counter after successful db reset
                    this.showSyncNotification('Database reset successfully. Sync will be attempted on next cycle.', 'info');
                } catch (resetError) {
                    console.error('Error resetting database:', resetError);
                    this.showSyncNotification('Database reset failed. Please reload the app.', 'error');
                }
            } else {
                this.showSyncNotification('Sync failed: ' + error.message, 'error');
            }
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Synchronize data with backend
     * @returns {Promise} Promise that resolves when sync completes
     */
    async syncData() {
        try {
            // Get pending changes from database
            const pendingChanges = await Database.getPendingChanges();
            console.log(`Found ${pendingChanges.length} pending changes to sync`);
            
            // Process pending changes
            if (pendingChanges.length > 0) {
                await this.processPendingChanges(pendingChanges);
            }
            
            // Fetch updates from server
            await this.fetchServerUpdates();
            
            return Promise.resolve();
        } catch (error) {
            console.error('Error during sync:', error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Process pending changes
     * @param {Array} pendingChanges - Array of pending changes
     * @returns {Promise} Promise that resolves when changes are processed
     */
    async processPendingChanges(pendingChanges) {
        // Process changes sequentially to avoid conflicts
        for (const change of pendingChanges) {
            try {
                console.log(`Processing change: ${change.action} for data with barcode ${change.data.barcode}`);
                
                switch (change.action) {
                    case 'create':
                        await Api.createProduct(change.data);
                        break;
                        
                    case 'update':
                        await Api.updateProduct(change.data.id, change.data);
                        break;
                        
                    case 'delete':
                        await Api.deleteProduct(change.data.id);
                        break;
                        
                    default:
                        console.warn(`Unknown change action: ${change.action}`);
                }
                
                // Mark change as synced
                await Database.markChangeAsSynced(change.id);
                console.log(`Change ${change.id} processed successfully`);
            } catch (error) {
                console.error(`Error processing change ${change.id}:`, error);
                // Continue with next change
            }
        }
    }
    
    /**
     * Fetch updates from server
     * @returns {Promise} Promise that resolves when server updates are processed
     */
    async fetchServerUpdates() {
        try {
            console.log('Fetching updates from server');
            
            // Get products updated since last sync
            const serverProducts = await Api.getProducts(this.lastSyncTime);
            
            if (!serverProducts || !Array.isArray(serverProducts) || serverProducts.length === 0) {
                console.log('No updates from server');
                return Promise.resolve();
            }
            
            console.log(`Received ${serverProducts.length} updates from server`);
            
            // Update local database with server data
            await Database.updateProductsFromServer(serverProducts);
            
            return Promise.resolve();
        } catch (error) {
            console.error('Error fetching server updates:', error);
            return Promise.reject(error);
        }
    }
    
    /**
     * Show sync notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, success, error)
     */
    showSyncNotification(message, type) {
        let alertClass = 'alert-info';
        if (type === 'success') alertClass = 'alert-success';
        if (type === 'error') alertClass = 'alert-danger';
        
        // Remove any existing sync notifications
        const existingNotifications = document.querySelectorAll('.sync-notification');
        existingNotifications.forEach(notification => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} notification sync-notification`;
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-hide success and info notifications after 3 seconds
        if (type !== 'error') {
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }, 3000);
        }
    }
    
    /**
     * Get the last sync time
     * @returns {number|null} Last sync time or null if never synced
     */
    getLastSyncTime() {
        return this.lastSyncTime;
    }
    
    /**
     * Check if sync is in progress
     * @returns {boolean} True if sync is in progress
     */
    isSyncInProgress() {
        return this.syncInProgress;
    }
    
    /**
     * Manually trigger synchronization
     * @returns {Promise} Promise that resolves when sync completes
     */
    syncNow() {
        return this.syncIfOnline();
    }
    
    /**
     * Add an item to the sync queue
     * @param {string} action - Action type (create, update, delete)
     * @param {Object} data - Data to sync
     */
    addToSyncQueue(action, data) {
        console.log(`Adding to sync queue: ${action}`, data);
        this.syncQueue.push({
            action,
            data,
            timestamp: Date.now()
        });
        
        // If we're online, attempt to sync right away
        if (navigator.onLine) {
            this.syncIfOnline();
        }
    }
}

// Create singleton instance
const SyncManager = new SyncService();

// Expose to window object
window.SyncManager = SyncManager; 