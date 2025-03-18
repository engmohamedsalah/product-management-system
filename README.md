# Product Management System

A comprehensive product management solution featuring a mobile-friendly web application with offline capabilities and multiple backend options.

## 🌟 Features

- **📱 Cross-Platform Mobile Interface**: Built with Cordova for maximum compatibility
- **🔄 Offline-First Architecture**: Full functionality without constant internet connection
- **📊 Real-Time Sync**: Automatic data synchronization when online
- **📷 Barcode Scanner Integration**: Quick product lookup and entry
- **🔒 Secure Authentication**: JWT-based user authentication
- **📱 Responsive Design**: Works seamlessly on mobile and desktop
- **🔄 Multiple Backend Options**: Choose between Express.js mock server or .NET backend

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, Cordova
- **Mobile Framework**: Apache Cordova
- **Development Backend**: Node.js, Express.js
- **Production Backend**: ASP.NET Framework
- **Database**: 
  - Development: JSON file-based storage
  - Production: SQL Server
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Apache Cordova**: Latest version
- For Production Backend:
  - Visual Studio 2019 or higher
  - .NET Framework 4.8
  - SQL Server (Express or higher)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd product-management
```

### 2. Development Setup (Mock Server)

```bash
# Install mock server dependencies
cd mobile-app/mock-server
npm install
cp .env.example .env  # Configure environment variables

# Install mobile app dependencies
cd ../
npm install

# Start both mock server and mobile app
cd ..
./start-dev-environment.sh
```

### 3. Production Setup (.NET Backend)

```bash
# Open in Visual Studio
cd backend-api
start ProductManagement.sln

# Update connection string in Web.config
# Build and run the solution
```

## 🔧 Configuration

### Mobile App Configuration
File: `mobile-app/www/js/config.js`
```javascript
const AppConfig = {
    api: {
        baseUrl: 'http://localhost:3000', // Mock server
        // baseUrl: 'http://localhost:44320', // .NET backend
        timeout: 30000
    }
    // ... other configurations
};
```

### Mock Server Configuration
File: `mobile-app/mock-server/.env`
```env
PORT=3000
JWT_SECRET=your-secret-key
ALLOW_ORIGIN=http://localhost:8000
```

## 📱 Mobile App Features

- **Product Management**
  - Add/Edit/Delete products
  - Scan barcodes
  - View product details
  - Search and filter products

- **Offline Capabilities**
  - Local data storage
  - Background sync
  - Conflict resolution

- **User Interface**
  - Responsive design
  - Touch-friendly controls
  - Dark/Light theme support

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- CORS protection
- Input validation
- XSS protection

## 📚 API Documentation

### Mock Server Endpoints

```
GET    /api/products           - List all products
GET    /api/products/:id      - Get product details
POST   /api/products          - Create product
PUT    /api/products/:id      - Update product
DELETE /api/products/:id      - Delete product
POST   /api/auth/login        - User authentication
```

### Production Backend Endpoints

```
GET    /api/products          - List all products
GET    /api/products/:id      - Get product details
POST   /api/products          - Create product
PUT    /api/products/:id      - Update product
DELETE /api/products/:id      - Delete product
POST   /api/auth/login        - User authentication
GET    /api/products/sync     - Sync changes
```

## 🔄 Sync Process

1. Local changes are stored in IndexedDB
2. Background sync attempts periodically
3. Conflicts are resolved using timestamp-based strategy
4. Failed syncs are retried automatically

## 🧪 Testing

```bash
# Run mock server tests
cd mobile-app/mock-server
npm test

# Run mobile app tests
cd ../
npm test
```

## 📦 Deployment

### Mobile App
1. Build the Cordova app
2. Deploy to app stores or as a web app

### Backend API
1. Configure production settings
2. Deploy to IIS or cloud service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Apache Cordova Team
- Express.js Community
- .NET Community
- All contributors

## 📞 Support

For support, please open an issue in the repository or contact the maintainers. 