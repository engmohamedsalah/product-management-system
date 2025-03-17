/**
 * Barcode Scanner Service
 * Handles barcode scanning functionality
 */
class BarcodeScanner {
    constructor() {
        this.scanOptions = AppConfig.scanner;
    }

    /**
     * Scan a barcode
     * @returns {Promise} Promise that resolves with scan result or rejects with error
     */
    scan() {
        return new Promise((resolve, reject) => {
            if (!window.cordova || !cordova.plugins || !cordova.plugins.barcodeScanner) {
                reject(new Error('Barcode scanner plugin not available'));
                return;
            }

            cordova.plugins.barcodeScanner.scan(
                result => {
                    if (result.cancelled) {
                        resolve({ cancelled: true });
                    } else {
                        resolve({
                            cancelled: false,
                            format: result.format,
                            text: result.text
                        });
                    }
                },
                error => {
                    console.error('Scanning failed:', error);
                    reject(error);
                },
                this.scanOptions
            );
        });
    }

    /**
     * Find product by barcode
     * @param {string} barcode - The barcode to look up
     * @returns {Promise<Object>} Promise that resolves with product data
     */
    async findProductByBarcode(barcode) {
        try {
            // Try to find in local database first
            const localProduct = await Database.getProductByBarcode(barcode);
            if (localProduct) {
                return { product: localProduct, source: 'local' };
            }

            // If not found locally and online, try API
            if (navigator.onLine) {
                try {
                    const apiProduct = await Api.getProductByBarcode(barcode);
                    if (apiProduct) {
                        // Save to local database
                        const localProduct = {
                            name: apiProduct.name,
                            price: apiProduct.price,
                            barcode: apiProduct.barcode,
                            description: apiProduct.description,
                            remote_id: apiProduct.id
                        };
                        const productId = await Database.saveProduct(localProduct);
                        const savedProduct = await Database.getProductById(productId);
                        return { product: savedProduct, source: 'remote' };
                    }
                } catch (error) {
                    console.log('API lookup failed:', error);
                    // Continue with not found result
                }
            }

            // Product not found
            return { product: null, barcode };
        } catch (error) {
            console.error('Error looking up product:', error);
            throw error;
        }
    }

    /**
     * Scan and find product
     * @returns {Promise<Object>} Promise with scan and lookup result
     */
    async scanAndFindProduct() {
        try {
            const scanResult = await this.scan();
            
            if (scanResult.cancelled) {
                return { cancelled: true };
            }
            
            const lookupResult = await this.findProductByBarcode(scanResult.text);
            return {
                ...lookupResult,
                scanFormat: scanResult.format,
                cancelled: false
            };
        } catch (error) {
            console.error('Scan and find error:', error);
            throw error;
        }
    }
}

// Create a singleton instance
const Scanner = new BarcodeScanner(); 