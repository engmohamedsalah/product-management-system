using System.Data.Entity;

namespace ProductManagement.Models
{
    /// <summary>
    /// Database context for the Product Management application
    /// </summary>
    public class ProductManagementContext : DbContext
    {
        /// <summary>
        /// Initializes a new instance of the ProductManagementContext class
        /// </summary>
        public ProductManagementContext()
            : base("name=ProductManagementContext")
        {
            // Enable migrations
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<ProductManagementContext, Configuration>());
        }

        /// <summary>
        /// Gets or sets the products in the database
        /// </summary>
        public DbSet<Product> Products { get; set; }

        /// <summary>
        /// Configures the database model
        /// </summary>
        /// <param name="modelBuilder">The model builder</param>
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Configure the Product entity
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            base.OnModelCreating(modelBuilder);
        }
    }

    /// <summary>
    /// Configuration for database migrations
    /// </summary>
    public class Configuration : DbMigrationsConfiguration<ProductManagementContext>
    {
        /// <summary>
        /// Initializes a new instance of the Configuration class
        /// </summary>
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            AutomaticMigrationDataLossAllowed = false;
        }

        /// <summary>
        /// Seeds the database with initial data
        /// </summary>
        /// <param name="context">The database context</param>
        protected override void Seed(ProductManagementContext context)
        {
            // Seed the database with sample data
            Models.Seed.SeedDatabase(context);
            
            base.Seed(context);
        }
    }
} 