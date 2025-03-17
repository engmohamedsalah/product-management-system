-- Seed data for Products table
SET IDENTITY_INSERT [dbo].[Products] ON

-- Insert sample products
INSERT INTO [dbo].[Products] 
    ([Id], [Name], [Price], [Barcode], [Description], [CreatedAt], [UpdatedAt])
VALUES
    (1, 'Smartphone X', 599.99, '123456789012', 'Latest flagship smartphone with 6.5" display and 5G capability', GETUTCDATE(), GETUTCDATE()),
    (2, 'Laptop Pro', 1299.99, '234567890123', 'Professional laptop with 16GB RAM and 512GB SSD', GETUTCDATE(), GETUTCDATE()),
    (3, 'Wireless Headphones', 149.99, '345678901234', 'Noise-cancelling wireless headphones with 30-hour battery life', GETUTCDATE(), GETUTCDATE()),
    (4, 'Smart Watch', 249.99, '456789012345', 'Fitness tracking smartwatch with heart rate monitor', GETUTCDATE(), GETUTCDATE()),
    (5, 'Bluetooth Speaker', 79.99, '567890123456', 'Portable waterproof Bluetooth speaker', GETUTCDATE(), GETUTCDATE()),
    (6, 'Tablet 10"', 399.99, '678901234567', '10-inch tablet with high-resolution display', GETUTCDATE(), GETUTCDATE()),
    (7, 'Wireless Mouse', 29.99, '789012345678', 'Ergonomic wireless mouse with long battery life', GETUTCDATE(), GETUTCDATE()),
    (8, 'USB-C Hub', 49.99, '890123456789', 'Multi-port USB-C hub with HDMI and card reader', GETUTCDATE(), GETUTCDATE()),
    (9, 'External SSD 1TB', 159.99, '901234567890', '1TB external solid-state drive with USB 3.1', GETUTCDATE(), GETUTCDATE()),
    (10, 'Wireless Charger', 39.99, '012345678901', 'Fast wireless charging pad for smartphones', GETUTCDATE(), GETUTCDATE());

SET IDENTITY_INSERT [dbo].[Products] OFF 