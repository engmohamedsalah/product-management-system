using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;

namespace ProductManagement.Models
{
    /// <summary>
    /// Database seeding utility
    /// </summary>
    public static class Seed
    {
        /// <summary>
        /// Seeds the database with sample data if it's empty
        /// </summary>
        /// <param name="context">Database context</param>
        public static void SeedDatabase(ProductManagementContext context)
        {
            // Check if database already has products
            if (context.Products.Any())
            {
                return; // Database already has data
            }

            // Sample products to seed
            var products = new List<Product>
            {
                new Product
                {
                    Name = "Smartphone X",
                    Price = 599.99m,
                    Barcode = "123456789012",
                    Description = "Latest flagship smartphone with 6.5\" display and 5G capability",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Laptop Pro",
                    Price = 1299.99m,
                    Barcode = "234567890123",
                    Description = "Professional laptop with 16GB RAM and 512GB SSD",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Wireless Headphones",
                    Price = 149.99m,
                    Barcode = "345678901234",
                    Description = "Noise-cancelling wireless headphones with 30-hour battery life",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Smart Watch",
                    Price = 249.99m,
                    Barcode = "456789012345",
                    Description = "Fitness tracking smartwatch with heart rate monitor",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Product
                {
                    Name = "Bluetooth Speaker",
                    Price = 79.99m,
                    Barcode = "567890123456",
                    Description = "Portable waterproof Bluetooth speaker",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            // Add products to database
            foreach (var product in products)
            {
                context.Products.AddOrUpdate(p => p.Barcode, product);
            }

            // Save changes
            context.SaveChanges();
        }
    }
} 