using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductManagement.Models
{
    /// <summary>
    /// Represents a product in the system
    /// </summary>
    public class Product
    {
        /// <summary>
        /// Unique identifier for the product
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Name of the product
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        /// <summary>
        /// Price of the product
        /// </summary>
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        /// <summary>
        /// Barcode of the product (optional)
        /// </summary>
        [StringLength(50)]
        public string Barcode { get; set; }

        /// <summary>
        /// Description of the product (optional)
        /// </summary>
        [StringLength(500)]
        public string Description { get; set; }

        /// <summary>
        /// Date and time when the product was created
        /// </summary>
        [Required]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Date and time when the product was last updated
        /// </summary>
        [Required]
        public DateTime UpdatedAt { get; set; }
    }
} 