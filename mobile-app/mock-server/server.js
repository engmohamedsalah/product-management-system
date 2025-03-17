require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Management API',
      version: '1.0.0',
      description: 'API documentation for the Product Management System',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - barcode
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the product
 *         barcode:
 *           type: string
 *           description: The unique barcode of the product
 *         description:
 *           type: string
 *           description: Optional description of the product
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the product was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the product was last updated
 *       example:
 *         id: 1
 *         name: Widget A
 *         price: 19.99
 *         barcode: 123456789012
 *         description: A high quality widget for all your needs.
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 */

// Sample product data
let products = [
  {
    id: 1,
    name: 'Widget A',
    price: 19.99,
    barcode: '123456789012',
    description: 'A high quality widget for all your needs.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Widget B',
    price: 24.99,
    barcode: '223456789013',
    description: 'Premium widget with enhanced features.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Gadget X',
    price: 49.99,
    barcode: '323456789014',
    description: 'Advanced gadget with smart technology.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Test Product',
    price: 9.99,
    barcode: '12313',
    description: 'Test product for barcode scanning.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample user data (in a real app, this would be in a database)
const users = [
  {
    id: 1,
    username: 'admin',
    // This is for demo purposes only. In production, you would use bcrypt to hash passwords
    password: 'admin123',
    name: 'Admin User'
  }
];

// Middleware
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.ALLOW_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Check if API is running
 *     description: Returns a message indicating that the API is running
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product Management API is running
 */
app.get('/', (req, res) => {
  res.json({ message: 'Product Management API is running' });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to the system
 *     description: Authenticates a user and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authorization
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid username or password
 */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  const token = jwt.sign(
    { id: user.id, username: user.username }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  });
});

// Get all products
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products, or products updated since a specific timestamp
 *     parameters:
 *       - in: query
 *         name: since
 *         schema:
 *           type: integer
 *         description: Optional timestamp (in milliseconds) to filter products updated since that time
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  // Check if 'since' parameter is provided
  const sinceTimestamp = req.query.since;
  
  if (sinceTimestamp) {
    // Convert to number
    const since = parseInt(sinceTimestamp);
    
    // Filter products updated since the provided timestamp
    const updatedProducts = products.filter(product => {
      const productUpdatedAt = new Date(product.updatedAt).getTime();
      return productUpdatedAt > since;
    });
    
    return res.json(updatedProducts);
  }
  
  // Return all products if no 'since' parameter
  res.json(products);
});

// Get product by ID
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a specific product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 */
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Get product by barcode
/**
 * @swagger
 * /api/products/barcode/{barcode}:
 *   get:
 *     summary: Get product by barcode
 *     description: Retrieve a specific product by its barcode
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *         description: Barcode of the product to retrieve
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product not found
 */
app.get('/api/products/barcode/:barcode', (req, res) => {
  const product = products.find(p => p.barcode === req.params.barcode);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

// Create product (protected route)
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product to the database
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - barcode
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Product
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 29.99
 *               barcode:
 *                 type: string
 *                 example: 423456789015
 *               description:
 *                 type: string
 *                 example: Description of the new product
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - missing required fields or barcode already exists
 *       401:
 *         description: Unauthorized - authentication token required
 *       403:
 *         description: Forbidden - invalid or expired token
 */
app.post('/api/products', authenticateToken, (req, res) => {
  const { name, price, barcode, description } = req.body;
  
  if (!name || !price || !barcode) {
    return res.status(400).json({ error: 'Name, price, and barcode are required' });
  }
  
  // Check if barcode already exists
  if (products.find(p => p.barcode === barcode)) {
    return res.status(400).json({ error: 'Product with this barcode already exists' });
  }
  
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name,
    price: parseFloat(price),
    barcode,
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.status(201).json(newProduct);
});

// Update product (protected route)
/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product's details
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Product Name
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 39.99
 *               barcode:
 *                 type: string
 *                 example: 523456789016
 *               description:
 *                 type: string
 *                 example: Updated product description
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - barcode already exists
 *       401:
 *         description: Unauthorized - authentication token required
 *       403:
 *         description: Forbidden - invalid or expired token
 *       404:
 *         description: Product not found
 */
app.put('/api/products/:id', authenticateToken, (req, res) => {
  const { name, price, barcode, description } = req.body;
  const id = parseInt(req.params.id);
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Check if barcode is being changed and already exists
  if (barcode && barcode !== products[productIndex].barcode && 
      products.some(p => p.barcode === barcode)) {
    return res.status(400).json({ error: 'Product with this barcode already exists' });
  }
  
  const updatedProduct = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price ? parseFloat(price) : products[productIndex].price,
    barcode: barcode || products[productIndex].barcode,
    description: description !== undefined ? description : products[productIndex].description,
    updatedAt: new Date().toISOString()
  };
  
  products[productIndex] = updatedProduct;
  
  res.json(updatedProduct);
});

// Delete product (protected route)
/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Remove a product from the database
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       401:
 *         description: Unauthorized - authentication token required
 *       403:
 *         description: Forbidden - invalid or expired token
 *       404:
 *         description: Product not found
 */
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = products.length;
  
  products = products.filter(p => p.id !== id);
  
  if (products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json({ message: 'Product deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 