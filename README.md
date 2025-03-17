# Product Management System

This repository contains the Product Management System, which consists of:

## Project Structure

- **mobile-app/**: Cordova-based mobile application
  - **www/**: Web assets for the mobile app
  - **mock-server/**: Express.js-based mock server for development and testing

- **backend-api/**: .NET-based backend API (production backend)

## Backend Options

The system supports two backend options:

1. **Mock Server (Express.js)**: Located in `mobile-app/mock-server/`
   - For development and testing purposes
   - Simple to set up and run
   - Provides basic API functionality with Swagger documentation

2. **Production Backend (.NET)**: Located in `backend-api/`
   - Full-featured .NET implementation
   - Robust database integration
   - Production-ready API

## Getting Started

### Running the Mock Server

```bash
cd mobile-app/mock-server
./start-server.sh
```

The mock server will run on http://localhost:3000 by default.

### Running the Mobile App

```bash
cd mobile-app
cordova run browser
```

The mobile app will connect to the backend specified in `mobile-app/www/js/config.js`.

### Running Both Together (Development)

For convenience, you can use the provided script to run both the mock server and mobile app:

```bash
./start-dev-environment.sh
```

### Running the .NET Backend

Open the `backend-api/ProductManagement.sln` file in Visual Studio and run the project.
The .NET backend will run on http://localhost:44320 by default.

## Switching Between Backends

To switch between the mock server and the .NET backend, modify the `baseUrl` property in `mobile-app/www/js/config.js`:

```javascript
// For mock server:
baseUrl: 'http://localhost:3000'

// For .NET backend:
baseUrl: 'http://localhost:44320'
```

## Features

- **Product Management**: Add, edit, view, and delete products
- **Barcode Scanning**: Scan product barcodes to quickly find or add products
- **Offline Support**: Full functionality even without an internet connection
- **Synchronization**: Automatically syncs data with the backend when online
- **Responsive UI**: Works on mobile and desktop devices

## System Architecture

The system consists of two main components:

1. **Mobile Application (Cordova)**
   - Frontend user interface
   - Local database for offline operation
   - Synchronization mechanism

2. **Backend Server (Node.js/Express)**
   - RESTful API for data access
   - Authentication and authorization
   - Data persistence

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get product by ID
- `GET /api/products/barcode/:barcode`: Get product by barcode
- `POST /api/products`: Create a new product
- `PUT /api/products/:id`: Update a product
- `DELETE /api/products/:id`: Delete a product
- `POST /api/auth/login`: Authenticate user and get JWT token

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Cordova](https://cordovajs.com/)
- [Express](https://expressjs.com/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Bootstrap](https://getbootstrap.com/) 