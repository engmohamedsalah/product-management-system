# Deployment Guide

This document provides instructions for deploying both the mobile application and backend API components of the Product Management System.

## Deploying the Backend API

### Prerequisites

- Windows Server with IIS installed
- SQL Server (2016 or newer)
- .NET Framework 4.8 runtime
- URL Rewrite module for IIS

### Deployment Steps

1. **Prepare the Database**
   - Create a new database named `ProductManagement` in SQL Server
   - Update the connection string in `Web.config` if necessary
   - Run the `App_Data/SeedData.sql` script to initialize the database (optional)

2. **Publish the Web API**
   - Open the solution in Visual Studio
   - Right-click on the project and select "Publish"
   - Choose "Folder" as the publish target and select your destination folder
   - Click "Publish"

3. **Configure IIS**
   - Open IIS Manager
   - Create a new application pool with .NET Framework 4.8
   - Create a new website or application pointing to the published folder
   - Set the application pool to the one created above
   - Enable HTTPS and configure a SSL certificate

4. **Configure CORS**
   - In IIS Manager, select your API website
   - Open the CORS module configuration
   - Add allowed origins for your mobile app domains
   - Save the configuration

5. **Verify Deployment**
   - Navigate to `https://your-api-url/swagger` to verify the API is working
   - Try the authentication endpoint to get a token
   - Test a few product endpoints to ensure they're working properly

## Deploying the Mobile Application

### Prerequisites

- Node.js and npm installed
- Apache Cordova CLI installed
- Android SDK (for Android deployment)
- Xcode (for iOS deployment, macOS only)
- Apple Developer account (for iOS deployment)
- Google Play Developer account (for Android deployment)

### Building for Development

1. **Configure API Endpoint**
   - Open `mobile-app/www/js/config.js`
   - Update the `baseUrl` property to point to your deployed API
   - Save the file

2. **Install Dependencies**
   - Navigate to the mobile-app directory
   - Run `npm install` to install all dependencies

3. **Add Platforms**
   - Run `cordova platform add android` for Android
   - Run `cordova platform add ios` for iOS (macOS only)

4. **Install Required Plugins**
   - Run `cordova plugin add phonegap-plugin-barcodescanner`
   - Run `cordova plugin add cordova-sqlite-storage`
   - Run `cordova plugin add cordova-plugin-network-information`
   - Run `cordova plugin add cordova-plugin-device`

5. **Build the Application**
   - Run `cordova build android` for Android
   - Run `cordova build ios` for iOS (macOS only)

### Deploying to App Stores

#### Android (Google Play Store)

1. **Generate a Signed APK**
   - Create a keystore file if you don't have one:
     ```
     keytool -genkey -v -keystore product-management.keystore -alias product_management -keyalg RSA -keysize 2048 -validity 10000
     ```
   - Configure signing in Cordova by creating a `build.json` file in the root of the mobile-app directory:
     ```json
     {
       "android": {
         "release": {
           "keystore": "path/to/product-management.keystore",
           "storePassword": "your-store-password",
           "alias": "product_management",
           "password": "your-key-password"
         }
       }
     }
     ```
   - Build the release version: `cordova build android --release`

2. **Upload to Google Play Console**
   - Log in to the Google Play Console
   - Create a new application and fill in all required metadata
   - Upload the signed APK from `platforms/android/app/build/outputs/apk/release/app-release.apk`
   - Complete the store listing and pricing & distribution sections
   - Roll out to production or create a test track

#### iOS (Apple App Store)

1. **Prepare the App for Submission**
   - Open the Xcode project in `platforms/ios/`
   - Configure app signing using your Apple Developer account
   - Update app capabilities as needed

2. **Create an Archive**
   - In Xcode, select "Generic iOS Device" as the target
   - Select Product > Archive from the menu
   - Once the archive is created, click "Distribute App"
   - Follow the on-screen instructions to upload to App Store Connect

3. **Submit for Review**
   - Log in to App Store Connect
   - Create a new app version if needed
   - Complete the submission form with app metadata, screenshots, etc.
   - Submit for review

## Environment Variables and Configuration

### Backend API

The following settings can be configured in the `Web.config` file:

- **JWT_SECRET_KEY**: Secret key for JWT token signing
- **JWT_AUDIENCE_TOKEN**: Audience for JWT tokens
- **JWT_ISSUER_TOKEN**: Issuer for JWT tokens
- **JWT_EXPIRE_MINUTES**: Token expiration time in minutes
- **Connection String**: Database connection details

### Mobile Application

The following settings can be configured in `www/js/config.js`:

- **API Base URL**: URL of the backend API
- **Sync Settings**: Configure sync intervals and retry attempts
- **Barcode Scanner**: Configure scanning options
- **Database**: Configure local storage parameters

## Troubleshooting

### Backend API Issues

- **500 Internal Server Error**: Check IIS logs and event viewer for details
- **Database Connection Issues**: Verify connection string and ensure SQL Server is running
- **CORS Errors**: Check CORS configuration in IIS
- **Authentication Issues**: Verify JWT settings in Web.config

### Mobile Application Issues

- **Build Failures**: Check Cordova CLI output for errors
- **Plugin Issues**: Try removing and re-adding problematic plugins
- **API Connection Issues**: Verify API URL and network connectivity
- **Database Errors**: Check console logs for SQLite errors

## Performance Optimization

### Backend API

- Configure IIS caching for static resources
- Enable compression in IIS
- Consider adding a CDN for static content
- Optimize database queries and add indexes

### Mobile Application

- Minimize the size of assets (images, fonts, etc.)
- Implement lazy loading for product lists
- Optimize barcode scanning performance
- Implement efficient data synchronization strategy 