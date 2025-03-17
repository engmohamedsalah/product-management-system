using System;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using ProductManagement.Models;

namespace ProductManagement.Controllers
{
    /// <summary>
    /// API controller for managing products
    /// </summary>
    [Authorize]
    [RoutePrefix("api/products")]
    public class ProductsController : ApiController
    {
        private ProductManagementContext db = new ProductManagementContext();

        /// <summary>
        /// Gets all products
        /// </summary>
        /// <returns>List of products</returns>
        [HttpGet]
        [Route("")]
        public async Task<IHttpActionResult> GetProducts()
        {
            var products = await db.Products.ToListAsync();
            return Ok(products);
        }

        /// <summary>
        /// Gets a specific product by ID
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Product details</returns>
        [HttpGet]
        [Route("{id:int}")]
        [ResponseType(typeof(Product))]
        public async Task<IHttpActionResult> GetProduct(int id)
        {
            Product product = await db.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }

        /// <summary>
        /// Gets a product by barcode
        /// </summary>
        /// <param name="barcode">Product barcode</param>
        /// <returns>Product details</returns>
        [HttpGet]
        [Route("barcode/{barcode}")]
        [ResponseType(typeof(Product))]
        public async Task<IHttpActionResult> GetProductByBarcode(string barcode)
        {
            if (string.IsNullOrEmpty(barcode))
            {
                return BadRequest("Barcode cannot be empty");
            }

            Product product = await db.Products.FirstOrDefaultAsync(p => p.Barcode == barcode);
            if (product == null)
            {
                return NotFound();
            }

            return Ok(product);
        }

        /// <summary>
        /// Updates a product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <param name="product">Updated product data</param>
        /// <returns>Status code indicating success or failure</returns>
        [HttpPut]
        [Route("{id:int}")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutProduct(int id, Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != product.Id)
            {
                return BadRequest("ID mismatch");
            }

            // Ensure timestamps are preserved
            Product existingProduct = await db.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            // Update fields but preserve CreatedAt
            existingProduct.Name = product.Name;
            existingProduct.Price = product.Price;
            existingProduct.Barcode = product.Barcode;
            existingProduct.Description = product.Description;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (Exception)
            {
                if (!ProductExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        /// <summary>
        /// Creates a new product
        /// </summary>
        /// <param name="product">Product data</param>
        /// <returns>Newly created product</returns>
        [HttpPost]
        [Route("")]
        [ResponseType(typeof(Product))]
        public async Task<IHttpActionResult> PostProduct(Product product)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Set timestamps
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;

            db.Products.Add(product);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = product.Id }, product);
        }

        /// <summary>
        /// Deletes a product
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>Deleted product</returns>
        [HttpDelete]
        [Route("{id:int}")]
        [ResponseType(typeof(Product))]
        public async Task<IHttpActionResult> DeleteProduct(int id)
        {
            Product product = await db.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            db.Products.Remove(product);
            await db.SaveChangesAsync();

            return Ok(product);
        }

        /// <summary>
        /// Disposes the database context
        /// </summary>
        /// <param name="disposing">Whether to dispose managed resources</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        /// <summary>
        /// Checks if a product exists
        /// </summary>
        /// <param name="id">Product ID</param>
        /// <returns>True if the product exists, false otherwise</returns>
        private bool ProductExists(int id)
        {
            return db.Products.Count(e => e.Id == id) > 0;
        }
    }
} 