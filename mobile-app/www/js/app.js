/**
 * Main Application Service
 * Handles application initialization and provides utility functions
 */
class AppService {
    constructor() {
        // Initialize when device is ready
        document.addEventListener('deviceready', this.initialize.bind(this), false);
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('Initializing application...');
            
            // Initialize database
            await Database.init();
            console.log('Database initialized');
            
            // Initialize API
            Api.init();
            console.log('API initialized');
            
            // Load recent scans if on the main page
            if (document.querySelector('.recent-scans')) {
                this.loadRecentScans();
            }
            
            // Set up sync button if present
            this.setupSyncButton();
            
            // Update sync status if on main page
            this.updateSyncStatus();
            
            // Hide loading indicator if present
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.classList.add('hidden');
            }
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showNotification('Failed to initialize application. Please restart.', 'error');
        }
    }
    
    /**
     * Load recent scans on the home page
     */
    async loadRecentScans() {
        try {
            const recentScansContainer = document.querySelector('.recent-scans .list-group');
            if (!recentScansContainer) return;
            
            // Get all products
            const products = await Database.getProducts();
            
            if (products && products.length > 0) {
                // Take the first 5 products for the recent scans
                const recentProducts = products.slice(0, 5);
                
                // Clear the container
                recentScansContainer.innerHTML = '';
                
                // Add each product
                recentProducts.forEach(product => {
                    const listItem = document.createElement('a');
                    listItem.href = `product-details.html?barcode=${product.barcode}`;
                    listItem.className = 'list-group-item list-group-item-action';
                    
                    listItem.innerHTML = `
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${product.name || 'Unknown Product'}</h5>
                            <small>Recently</small>
                        </div>
                        <p class="mb-1">${product.description || 'No description available'}</p>
                        <small>Barcode: ${product.barcode}</small>
                    `;
                    
                    recentScansContainer.appendChild(listItem);
                });
            } else {
                // No products found
                recentScansContainer.innerHTML = `
                    <div class="list-group-item">
                        <p class="text-center mb-0">No recent scans found</p>
                        <p class="text-center text-muted">Scan a product to see it here</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading recent scans:', error);
            this.showNotification('Failed to load recent scans', 'error');
        }
    }
    
    /**
     * Set up sync button
     */
    setupSyncButton() {
        const syncButton = document.getElementById('sync-button');
        if (syncButton) {
            syncButton.addEventListener('click', async () => {
                try {
                    syncButton.disabled = true;
                    syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
                    
                    // Check network status
                    if (!navigator.onLine) {
                        this.showNotification('No internet connection. Please try again when online.', 'warning');
                        return;
                    }
                    
                    // Call sync service to sync data
                    await Sync.syncIfOnline();
                    
                    // Update sync status
                    this.updateSyncStatus();
                } catch (error) {
                    console.error('Error during manual sync:', error);
                    this.showNotification('Sync failed: ' + error.message, 'error');
                } finally {
                    syncButton.disabled = false;
                    syncButton.innerHTML = '<i class="fas fa-sync"></i> Sync Data';
                }
            });
        }
        
        // Set up reset database button
        const resetDbButton = document.getElementById('reset-db-button');
        if (resetDbButton) {
            resetDbButton.addEventListener('click', async () => {
                try {
                    if (!confirm('Are you sure you want to reset the database? This will delete all locally stored data that hasn\'t been synced to the server.')) {
                        return;
                    }
                    
                    resetDbButton.disabled = true;
                    resetDbButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
                    
                    await Database.resetDatabase();
                    
                    // Update the UI
                    this.showNotification('Database reset successful. Reloading data...', 'success');
                    
                    // If on the main page, reload the product list
                    if (document.querySelector('.recent-scans')) {
                        setTimeout(() => {
                            this.loadRecentScans();
                        }, 1000);
                    }
                } catch (error) {
                    console.error('Error resetting database:', error);
                    this.showNotification('Failed to reset database: ' + error.message, 'error');
                } finally {
                    resetDbButton.disabled = false;
                    resetDbButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Reset DB';
                }
            });
        }
    }
    
    /**
     * Update sync status display
     */
    updateSyncStatus() {
        const lastSyncTimeEl = document.getElementById('last-sync-time');
        if (lastSyncTimeEl) {
            const lastSyncTime = SyncManager.getLastSyncTime();
            
            if (lastSyncTime) {
                const date = new Date(parseInt(lastSyncTime));
                lastSyncTimeEl.textContent = `Last sync: ${date.toLocaleString()}`;
            } else {
                lastSyncTimeEl.textContent = 'Last sync: Never';
            }
        }
    }
    
    /**
     * Show a notification to the user
     * @param {string} message - The message to display
     * @param {string} type - Type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        console.log(`Notification (${type}): ${message}`);
        
        // If running in a browser environment, use alert for simplicity
        if (typeof navigator !== 'undefined' && navigator.notification) {
            navigator.notification.alert(
                message,
                null,
                type.charAt(0).toUpperCase() + type.slice(1),
                'OK'
            );
        } else {
            alert(message);
        }
    }
}

// Create singleton instance
const App = new AppService();

// Block any logo.png requests at the global level
(function() {
    // Create a proxy for XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        if (arguments && arguments[1] && typeof arguments[1] === 'string' && arguments[1].includes('logo.png')) {
            console.log('[App] Blocked XMLHttpRequest for logo.png');
            arguments[1] = arguments[1].replace('logo.png', 'non-existent-file.png');
        }
        return originalOpen.apply(this, arguments);
    };

    // Create a proxy for fetch
    const originalFetch = window.fetch;
    window.fetch = function() {
        if (arguments && arguments[0] && typeof arguments[0] === 'string' && arguments[0].includes('logo.png')) {
            console.log('[App] Blocked fetch for logo.png');
            arguments[0] = arguments[0].replace('logo.png', 'non-existent-file.png');
        }
        return originalFetch.apply(this, arguments);
    };

    // Create a proxy for Image.src
    const originalImage = window.Image;
    window.Image = function() {
        const img = new originalImage();
        const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        
        Object.defineProperty(img, 'src', {
            get: function() {
                return originalSrcDescriptor.get.call(this);
            },
            set: function(value) {
                if (value && typeof value === 'string' && value.includes('logo.png')) {
                    console.log('[App] Blocked Image.src for logo.png');
                    value = value.replace('logo.png', 'non-existent-file.png');
                }
                originalSrcDescriptor.set.call(this, value);
            }
        });
        
        return img;
    };
    window.Image.prototype = originalImage.prototype;
})();

// Wait for the device to be ready
document.addEventListener('deviceready', onDeviceReady, false);

/**
 * Initialize the application when device is ready
 */
function onDeviceReady() {
    console.log('Device is ready');

    // Disable splash screen immediately
    if (navigator.splashscreen) {
        navigator.splashscreen.hide();
    }

    // Set up event listeners
    setupEventListeners();

    // Initialize page specific behaviors
    initCurrentPage();
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
    document.addEventListener('backbutton', onBackButton, false);
    document.addEventListener('menubutton', onMenuButton, false);
}

/**
 * Initialize behaviors for the current page
 */
function initCurrentPage() {
    // Get the current page
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    console.log('Current page:', page);

    switch (page) {
        case 'index.html':
            // Home page initialization
            break;
        case 'scanner.html':
            // Scanner page initialization
            break;
        case 'products.html':
            // Products page initialization
            break;
    }
}

/**
 * Handle app pause event
 */
function onPause() {
    console.log('App paused');
    // Add pause event handling code here
}

/**
 * Handle app resume event
 */
function onResume() {
    console.log('App resumed');
    // Add resume event handling code here
}

/**
 * Handle back button press
 */
function onBackButton() {
    // Navigate back or exit app if on home screen
    if (window.location.pathname.includes('index.html')) {
        if (confirm('Exit application?')) {
            navigator.app.exitApp();
        }
    } else {
        window.history.back();
    }
}

/**
 * Handle menu button press
 */
function onMenuButton() {
    console.log('Menu button pressed');
    // Add menu button handling code here
} 