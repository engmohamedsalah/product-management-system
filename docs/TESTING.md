# Testing Guide

This document outlines the testing procedures for the Product Management System, covering both the mobile application and backend API.

## Testing Environments

### Development Environment
- **Backend API**: Local IIS Express on developer machine
- **Mobile App**: Emulators or physical devices connected via USB
- **Database**: LocalDB instance

### Testing Environment
- **Backend API**: Test server with staging configuration
- **Mobile App**: Test builds distributed via TestFlight (iOS) or internal app sharing (Android)
- **Database**: Dedicated test database instance

### Production Environment
- **Backend API**: Production server with production configuration
- **Mobile App**: App store versions
- **Database**: Production database

## Backend API Testing

### Unit Testing

Unit tests should be written for:

1. **Controllers**:
   - Test each API endpoint's behavior
   - Test various input scenarios
   - Test authentication and authorization

2. **Models**:
   - Test validation logic
   - Test model relationships
   - Test business logic in model methods

3. **Services**:
   - Test service methods
   - Test dependency injection
   - Test error handling

#### Running Unit Tests

```bash
# From Visual Studio
Test > Run All Tests

# From command line
dotnet test
```

### Integration Testing

Integration tests should cover:

1. **Database Operations**:
   - Test Entity Framework interactions
   - Test transactions and rollbacks
   - Test data persistence

2. **API Flow**:
   - Test complete request/response cycle
   - Test middleware components
   - Test authentication flow

#### Setting Up Integration Tests

1. Create a test database with a unique name to avoid conflicts
2. Initialize test data using the `Seed.cs` class
3. Use an in-memory HTTP client to make API requests

### API Testing with Postman

A Postman collection is available in the `docs/postman` directory. It includes:

1. **Authentication Flow**:
   - Login to get a token
   - Refresh token
   - Test authenticated requests

2. **Product Management**:
   - CRUD operations for products
   - Barcode lookup

#### Using the Postman Collection

1. Import the collection into Postman
2. Set up environment variables for:
   - `api_url` (e.g., `http://localhost:44320`)
   - `auth_token` (will be set automatically after login)
3. Run the "Login" request first to set up authentication
4. Execute individual requests or run the entire collection

## Mobile App Testing

### Unit Testing

Use Jest for JavaScript unit testing:

```bash
# Navigate to mobile app directory
cd mobile-app

# Install test dependencies
npm install --save-dev jest

# Run tests
npm test
```

Focus on testing:

1. **Utility Functions**:
   - Data formatting
   - Validation logic
   - Helper functions

2. **Service Classes**:
   - API service methods
   - Database service methods
   - Error handling

### Manual Testing Scenarios

#### Authentication

| Test Case | Steps | Expected Outcome |
|-----------|-------|------------------|
| Valid Login | 1. Enter valid username/password<br>2. Tap Login | User is logged in and directed to product list |
| Invalid Login | 1. Enter incorrect credentials<br>2. Tap Login | Error message displayed, user remains on login screen |
| Session Expiration | 1. Wait for token to expire<br>2. Try to access protected content | User is prompted to log in again |

#### Product Management

| Test Case | Steps | Expected Outcome |
|-----------|-------|------------------|
| View Product List | 1. Log in<br>2. Navigate to product list | List of products is displayed |
| Add Product | 1. Tap "Add" button<br>2. Fill form<br>3. Tap Save | New product is added to the list |
| Edit Product | 1. Select existing product<br>2. Tap Edit<br>3. Modify details<br>4. Tap Save | Product details are updated |
| Delete Product | 1. Select existing product<br>2. Tap Delete<br>3. Confirm deletion | Product is removed from the list |
| Barcode Scan | 1. Tap Scan button<br>2. Scan a barcode | Product is found or option to create is shown |

#### Offline Functionality

| Test Case | Steps | Expected Outcome |
|-----------|-------|------------------|
| Offline Product List | 1. Load products while online<br>2. Disconnect from network<br>3. Navigate to product list | Cached products are displayed |
| Offline Editing | 1. Disconnect from network<br>2. Edit a product<br>3. Save changes | Changes are stored locally |
| Sync After Reconnection | 1. Make changes while offline<br>2. Reconnect to network<br>3. Wait for sync | Changes are synchronized with the server |

### Cross-Platform Testing

Test the application on multiple device types:

#### Android
- Test on at least 3 different screen sizes
- Test on both older (Android 8+) and newer versions
- Test on different manufacturers (Samsung, Google, etc.)

#### iOS
- Test on iPhone SE (small screen)
- Test on iPhone Pro (medium screen)
- Test on iPhone Pro Max (large screen)
- Test on older (iOS 13+) and newer versions

### Performance Testing

Monitor and test:

1. **App Launch Time**:
   - Cold start (first launch)
   - Warm start (subsequent launches)

2. **Screen Transition Time**:
   - Navigation between screens
   - Loading data into views

3. **Database Operations**:
   - Loading large product lists
   - Search and filter operations

4. **Network Performance**:
   - Data synchronization time
   - API request/response times

## End-to-End Testing

Use Appium for automated end-to-end testing across both platforms:

```bash
# Install Appium
npm install -g appium

# Start Appium server
appium

# Run tests
npm run e2e-tests
```

Focus on testing complete user flows:

1. **Login to Product Creation**:
   - Log in
   - Navigate to add product
   - Create a product
   - Verify product in list

2. **Product Scan and Update**:
   - Log in
   - Scan a barcode
   - View product details
   - Update product information
   - Verify changes

## Continuous Integration

Set up CI pipelines to run tests automatically:

### Backend API

- Configure Azure DevOps or GitHub Actions
- Run unit tests on every pull request
- Run integration tests nightly
- Deploy to test environment after successful tests

### Mobile App

- Configure Bitrise or App Center
- Build and test on every commit
- Run unit tests on PRs
- Generate test builds for manual testing

## Test Reports

After testing, generate and review reports:

1. **Test Coverage Reports**:
   - Aim for at least 80% code coverage
   - Identify areas with lower coverage

2. **Bug Reports**:
   - Use a consistent template
   - Include steps to reproduce
   - Include device/environment details
   - Add screenshots when possible

3. **Performance Reports**:
   - Track metrics over time
   - Set performance budgets
   - Alert on regressions

## Test Data Management

### Test Data Generation

Use the provided seed scripts to generate test data:

1. **Backend**:
   - Run `SeedData.sql` script for database initialization
   - Or use the `Seed.cs` class for programmatic seeding

2. **Mobile App**:
   - Generate sample barcodes (see BARCODES.md)
   - Create test user accounts with different permissions

### Data Cleanup

After testing:

1. Reset test environment data
2. Clear local storage in mobile app
3. Document any persistent test data that should not be removed 