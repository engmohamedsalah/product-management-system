/**
 * Product Details Page
 * Displays product information and allows editing
 */
class ProductDetailsPage {
    constructor() {
        this.currentProduct = null;
        this.isEditMode = false;
        this.apiConnected = Api.isApiConnected();
        
        // DOM elements
        this.productContainer = document.getElementById('product-container');
        this.productNotFound = document.getElementById('product-not-found');
        this.scanAgainBtn = document.getElementById('scan-again-btn');
        this.editProductBtn = document.getElementById('edit-product-btn');
        this.saveProductBtn = document.getElementById('save-product-btn');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.deleteProductBtn = document.getElementById('delete-product-btn');
        
        // Bind event handlers
        this.bindEvents();
        
        // Listen for API connectivity changes
        document.addEventListener('api-connectivity-changed', this.onApiConnectivityChanged.bind(this));
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        // Scan again button
        if (this.scanAgainBtn) {
            this.scanAgainBtn.addEventListener('click', this.onScanAgain.bind(this));
        }
        
        // Edit product button
        if (this.editProductBtn) {
            this.editProductBtn.addEventListener('click', this.onEditProduct.bind(this));
        }
        
        // Save product button
        if (this.saveProductBtn) {
            this.saveProductBtn.addEventListener('click', this.onSaveProduct.bind(this));
        }
        
        // Cancel edit button
        if (this.cancelEditBtn) {
            this.cancelEditBtn.addEventListener('click', this.onCancelEdit.bind(this));
        }
        
        // Delete product button
        if (this.deleteProductBtn) {
            this.deleteProductBtn.addEventListener('click', this.onDeleteProduct.bind(this));
        }
        
        // Listen for URL parameters on page load
        document.addEventListener('DOMContentLoaded', this.checkUrlParams.bind(this));
    }
    
    /**
     * Check URL parameters for product data
     */
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const barcode = urlParams.get('barcode');
        
        if (barcode) {
            this.loadProductByBarcode(barcode);
        }
    }
    
    /**
     * Load product by barcode
     * @param {string} barcode - Product barcode
     */
    async loadProductByBarcode(barcode) {
        try {
            this.showLoading(true);
            
            // Try to find product using scanner service
            const result = await Scanner.findProductByBarcode(barcode);
            
            if (result.product) {
                this.displayProduct(result.product, result.source);
            } else {
                this.showProductNotFound(barcode);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            this.showNotification('Error loading product', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Handle API connectivity changes
     */
    onApiConnectivityChanged(event) {
        this.apiConnected = event.detail.isConnected;
        
        // Update UI if a product is displayed
        if (this.currentProduct) {
            this.updateConnectionStatus();
            
            // If API is now connected, sync the currently displayed product
            if (this.apiConnected) {
                this.syncCurrentProduct();
            }
        }
    }
    
    /**
     * Update the connection status in the UI
     */
    updateConnectionStatus() {
        const dataSourceEl = document.getElementById('data-source');
        if (dataSourceEl) {
            // If API is connected, show appropriate source
            if (this.apiConnected) {
                const source = this.currentProduct.fromApi ? 'remote' : 'local';
                dataSourceEl.textContent = source === 'local' ? 'Offline Database' : 'Online Server';
                dataSourceEl.classList.remove('source-local', 'source-remote', 'source-offline');
                dataSourceEl.classList.add(source === 'local' ? 'source-local' : 'source-remote');
            } else {
                // If API is not connected, always show offline
                dataSourceEl.textContent = 'Offline (API Unreachable)';
                dataSourceEl.classList.remove('source-local', 'source-remote');
                dataSourceEl.classList.add('source-offline');
            }
        }
    }
    
    /**
     * Sync the current product with the API if connected
     */
    async syncCurrentProduct() {
        if (!this.apiConnected || !this.currentProduct) {
            return;
        }
        
        try {
            // Try to get the product from the API
            const apiProduct = await Api.getProductByBarcode(this.currentProduct.barcode);
            
            if (apiProduct) {
                // Update our current product with API data
                this.currentProduct = {
                    ...this.currentProduct,
                    name: apiProduct.name,
                    price: apiProduct.price,
                    description: apiProduct.description,
                    fromApi: true
                };
                
                // Save the updated product to the local database
                await Database.saveProduct(this.currentProduct);
                
                // Update the UI
                this.displayProduct(this.currentProduct, 'remote');
                
                // Show notification
                this.showNotification('Product synchronized with server', 'success');
            }
        } catch (error) {
            console.error('Error syncing product:', error);
        }
    }
    
    /**
     * Display product information
     * @param {Object} product - Product data
     * @param {string} source - Source of product data ('local' or 'remote')
     */
    displayProduct(product, source) {
        this.currentProduct = product;
        
        // Show product container and hide not found message
        this.productContainer.classList.remove('hidden');
        this.productNotFound.classList.add('hidden');
        
        // Populate product fields
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = new Intl.NumberFormat(
            AppConfig.ui.defaultLanguage, 
            { style: 'currency', currency: AppConfig.ui.currencyFormat }
        ).format(product.price);
        document.getElementById('product-barcode').textContent = product.barcode;
        document.getElementById('product-description').textContent = product.description || 'No description available';
        
        // Show data source based on API connectivity
        const dataSourceEl = document.getElementById('data-source');
        if (dataSourceEl) {
            if (!this.apiConnected) {
                // If API is not connected, always show offline
                dataSourceEl.textContent = 'Offline (API Unreachable)';
                dataSourceEl.classList.remove('source-local', 'source-remote');
                dataSourceEl.classList.add('source-offline');
            } else {
                // If API is connected, show the appropriate source
                dataSourceEl.textContent = source === 'local' ? 'Offline Database' : 'Online Server';
                dataSourceEl.classList.remove('source-local', 'source-remote', 'source-offline');
                dataSourceEl.classList.add(source === 'local' ? 'source-local' : 'source-remote');
            }
        }
        
        // Enable edit button if user has permission
        if (this.editProductBtn) {
            this.editProductBtn.classList.remove('hidden');
        }
    }
    
    /**
     * Show product not found message
     * @param {string} barcode - The barcode that was scanned
     */
    showProductNotFound(barcode) {
        this.currentProduct = null;
        
        // Hide product container and show not found message
        this.productContainer.classList.add('hidden');
        this.productNotFound.classList.remove('hidden');
        
        // Update not found message with barcode
        const barcodeEl = document.getElementById('not-found-barcode');
        if (barcodeEl) {
            barcodeEl.textContent = barcode;
        }
        
        // Show create new product button if user has permission
        const createNewBtn = document.getElementById('create-new-btn');
        if (createNewBtn) {
            createNewBtn.classList.remove('hidden');
            createNewBtn.addEventListener('click', () => {
                window.location.href = `add-product.html?barcode=${barcode}`;
            });
        }
    }
    
    /**
     * Toggle loading state
     * @param {boolean} isLoading - Whether to show or hide loading indicator
     */
    showLoading(isLoading) {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            if (isLoading) {
                loadingEl.classList.remove('hidden');
            } else {
                loadingEl.classList.add('hidden');
            }
        }
    }
    
    /**
     * Handle scan again button click
     */
    onScanAgain() {
        window.location.href = 'scanner.html';
    }
    
    /**
     * Handle edit product button click
     */
    onEditProduct() {
        if (!this.currentProduct) return;
        
        this.isEditMode = true;
        
        // Switch buttons
        this.editProductBtn.classList.add('hidden');
        this.saveProductBtn.classList.remove('hidden');
        this.cancelEditBtn.classList.remove('hidden');
        
        // Convert display fields to input fields
        const nameEl = document.getElementById('product-name');
        const priceEl = document.getElementById('product-price');
        const descriptionEl = document.getElementById('product-description');
        
        // Replace name with input
        const nameValue = nameEl.textContent;
        nameEl.innerHTML = `<input type="text" id="edit-name" value="${nameValue}" class="form-control">`;
        
        // Replace price with input (remove currency formatting)
        const priceValue = this.currentProduct.price;
        priceEl.innerHTML = `<input type="number" id="edit-price" value="${priceValue}" step="0.01" class="form-control">`;
        
        // Replace description with textarea
        const descValue = this.currentProduct.description || '';
        descriptionEl.innerHTML = `<textarea id="edit-description" class="form-control">${descValue}</textarea>`;
    }
    
    /**
     * Handle save product button click
     */
    async onSaveProduct() {
        if (!this.currentProduct || !this.isEditMode) return;
        
        try {
            this.showLoading(true);
            
            // Get updated values
            const nameEl = document.getElementById('edit-name');
            const priceEl = document.getElementById('edit-price');
            const descriptionEl = document.getElementById('edit-description');
            
            const updatedProduct = {
                ...this.currentProduct,
                name: nameEl.value,
                price: parseFloat(priceEl.value),
                description: descriptionEl.value
            };
            
            // Save to local database with sync
            await Database.saveProductWithSync(updatedProduct);
            
            // Exit edit mode and refresh display
            this.isEditMode = false;
            this.displayProduct(updatedProduct, 'local');
            
            // Switch buttons back
            this.editProductBtn.classList.remove('hidden');
            this.saveProductBtn.classList.add('hidden');
            this.cancelEditBtn.classList.add('hidden');
            
            this.showNotification('Product updated successfully', 'success');
            
            // Trigger sync if online
            if (navigator.onLine && typeof SyncManager !== 'undefined') {
                SyncManager.syncIfOnline();
            }
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Error saving product', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Handle cancel edit button click
     */
    onCancelEdit() {
        if (!this.isEditMode) return;
        
        this.isEditMode = false;
        
        // Switch buttons back
        this.editProductBtn.classList.remove('hidden');
        this.saveProductBtn.classList.add('hidden');
        this.cancelEditBtn.classList.add('hidden');
        
        // Restore display
        this.displayProduct(this.currentProduct, 'local');
    }
    
    /**
     * Handle delete product button click
     */
    async onDeleteProduct() {
        if (!this.currentProduct) return;
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete "${this.currentProduct.name}"?`)) {
            return;
        }
        
        try {
            this.showLoading(true);
            
            // Delete from local database with sync
            await Database.deleteProductWithSync(this.currentProduct.id);
            
            this.showNotification('Product deleted successfully', 'success');
            
            // Redirect back to products page
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Error deleting product', 'error');
            this.showLoading(false);
        }
    }
    
    /**
     * Show a notification to the user
     * @param {string} message - The message to display
     * @param {string} type - Type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        console.log(`Notification (${type}): ${message}`);
        
        // Check if App.showNotification is available
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, type);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }
}

// Initialize page
const productDetailsPage = new ProductDetailsPage(); 