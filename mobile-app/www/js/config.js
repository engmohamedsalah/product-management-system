/**
 * Application Configuration
 * Contains configuration settings for the entire application
 */
const AppConfig = {
    // API configuration
    api: {
        // BACKEND OPTIONS:
        // 1. Mock Express.js server (for development/testing):
        //    baseUrl: 'http://localhost:3000'
        // 2. Real .NET backend API (production):
        //    baseUrl: 'http://localhost:44320'
        baseUrl: 'http://localhost:3000', // Using the mock Express.js server
        timeout: 30000 // 30 seconds timeout
    },
    
    // Authentication settings
    auth: {
        tokenKey: 'auth_token',
        tokenExpireKey: 'auth_token_expire'
    },
    
    // Barcode scanner configuration
    scanner: {
        preferFrontCamera: false,
        showFlipCameraButton: true,
        showTorchButton: true,
        torchOn: false,
        saveHistory: false,
        prompt: "Place a barcode inside the scan area",
        resultDisplayDuration: 1500,
        formats: "UPC_A,UPC_E,EAN_8,EAN_13,CODE_39,CODE_93,CODE_128,ITF,RSS_14,CODABAR",
        orientation: "portrait",
        disableAnimations: false,
        disableSuccessBeep: false
    },
    
    // Sync configuration
    sync: {
        autoSync: true,
        syncInterval: 300000, // 5 minutes
        maxRetryAttempts: 3,
        retryDelay: 5000 // 5 seconds
    },
    
    // UI configuration
    ui: {
        theme: 'light', // 'light' or 'dark'
        defaultLanguage: 'en',
        dateFormat: 'MM/DD/YYYY',
        currencyFormat: 'USD',
        itemsPerPage: 20
    },
    
    // Debugging settings
    debug: {
        enabled: true,
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        logToConsole: true,
        logToServer: false
    }
};

// Prevent modification of the config object
Object.freeze(AppConfig); 