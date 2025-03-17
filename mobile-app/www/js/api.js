/**
 * API Service
 * Handles all communication with the backend API
 */
class ApiService {
    constructor() {
        this.baseUrl = AppConfig.api.baseUrl;
        this.token = null;
        this.isConnected = false;
    }

    /**
     * Set authentication token
     * @param {string} token - JWT token
     */
    setAuthToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    /**
     * Clear authentication token
     */
    clearAuthToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    /**
     * Initialize API service
     */
    init() {
        // Restore token if available
        this.token = localStorage.getItem('auth_token');
        
        // Check connectivity
        this.checkConnectivity().then(isConnected => {
            console.log('API connectivity status:', isConnected ? 'Connected' : 'Disconnected');
            
            // Dispatch an event that other components can listen for
            document.dispatchEvent(new CustomEvent('api-connectivity-changed', { 
                detail: { isConnected } 
            }));
        });
        
        // Add event listener for online/offline events
        window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
        window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
    }
    
    /**
     * Handle online/offline status changes
     */
    handleOnlineStatusChange() {
        if (navigator.onLine) {
            // Device is online, check if API is reachable
            this.checkConnectivity().then(isConnected => {
                document.dispatchEvent(new CustomEvent('api-connectivity-changed', { 
                    detail: { isConnected } 
                }));
            });
        } else {
            // Device is offline, API is not reachable
            this.isConnected = false;
            document.dispatchEvent(new CustomEvent('api-connectivity-changed', { 
                detail: { isConnected: false } 
            }));
        }
    }

    /**
     * Get request headers including authorization if available
     * @returns {Object} Headers object
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    /**
     * Make API request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Promise that resolves with response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Extract timeout from options to handle separately
        const timeout = options.timeout;
        
        // Create a copy of options without timeout to avoid sending it as a body parameter
        const fetchOptions = {
            method: options.method || 'GET',
            headers: this.getHeaders()
        };
        
        // Copy remaining options excluding timeout
        Object.keys(options).forEach(key => {
            if (key !== 'timeout' && key !== 'data') {
                fetchOptions[key] = options[key];
            }
        });
        
        // Handle data separately for proper JSON formatting
        if (options.data && (fetchOptions.method !== 'GET')) {
            fetchOptions.body = JSON.stringify(options.data);
        }
        
        try {
            const response = await fetch(url, fetchOptions);
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            
            // Parse response
            const data = isJson ? await response.json() : await response.text();
            
            // Handle error responses
            if (!response.ok) {
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    data
                };
            }
            
            return data;
        } catch (error) {
            console.error(`API request failed: ${url}`, error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise} Promise that resolves with login response
     */
    async login(username, password) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            data: { username, password }
        });
        
        if (data.token) {
            this.setAuthToken(data.token);
        }
        
        return data;
    }

    /**
     * Get product by barcode
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object>} Promise that resolves with product data
     */
    async getProductByBarcode(barcode) {
        return this.request(`/api/products/barcode/${barcode}`);
    }

    /**
     * Get all products
     * @returns {Promise<Array>} Promise that resolves with array of products
     */
    async getProducts(sinceTimestamp = null) {
        let endpoint = '/api/products';
        
        // Add timestamp parameter if provided
        if (sinceTimestamp) {
            endpoint += `?since=${sinceTimestamp}`;
        }
        
        return this.request(endpoint);
    }

    /**
     * Update product data
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} Promise that resolves with updated product
     */
    async updateProduct(id, productData) {
        return this.request(`/api/products/${id}`, {
            method: 'PUT',
            data: productData
        });
    }

    /**
     * Create new product
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Promise that resolves with created product
     */
    async createProduct(productData) {
        return this.request('/api/products', {
            method: 'POST',
            data: productData
        });
    }

    /**
     * Check if the API is reachable
     * @returns {Promise<boolean>} Promise that resolves with true if API is reachable, false otherwise
     */
    async checkConnectivity() {
        try {
            // Use the products endpoint with a small limit to minimize data transfer
            const result = await this.request('/api/products?limit=1', {
                method: 'GET',
                timeout: 5000 // Set a short timeout
            });
            
            this.isConnected = true;
            return true;
        } catch (error) {
            console.log('API connectivity check failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Get connection status
     * @returns {boolean} True if API is connected, false otherwise
     */
    isApiConnected() {
        return this.isConnected;
    }
}

// Create a singleton instance
const Api = new ApiService(); 