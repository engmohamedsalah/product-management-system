using System;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Microsoft.IdentityModel.Tokens;
using ProductManagement.Models;

namespace ProductManagement.Controllers
{
    /// <summary>
    /// API controller for handling authentication
    /// </summary>
    [RoutePrefix("api/auth")]
    public class AuthController : ApiController
    {
        // JWT settings from Web.config
        private readonly string secretKey = ConfigurationManager.AppSettings["JWT_SECRET_KEY"];
        private readonly string issuer = ConfigurationManager.AppSettings["JWT_ISSUER_TOKEN"];
        private readonly string audience = ConfigurationManager.AppSettings["JWT_AUDIENCE_TOKEN"];
        private readonly int expireMinutes = int.Parse(ConfigurationManager.AppSettings["JWT_EXPIRE_MINUTES"]);

        /// <summary>
        /// Login model for authentication requests
        /// </summary>
        public class LoginModel
        {
            /// <summary>
            /// Username for authentication
            /// </summary>
            public string Username { get; set; }

            /// <summary>
            /// Password for authentication
            /// </summary>
            public string Password { get; set; }
        }

        /// <summary>
        /// Token response model
        /// </summary>
        public class TokenResponseModel
        {
            /// <summary>
            /// JWT token
            /// </summary>
            public string Token { get; set; }

            /// <summary>
            /// Expiration time in seconds
            /// </summary>
            public int ExpiresIn { get; set; }

            /// <summary>
            /// Refresh token for obtaining a new JWT token
            /// </summary>
            public string RefreshToken { get; set; }
        }

        /// <summary>
        /// Get authentication token
        /// </summary>
        /// <param name="model">Login credentials</param>
        /// <returns>Authentication token</returns>
        [HttpPost]
        [Route("token")]
        public async Task<IHttpActionResult> GetToken(LoginModel model)
        {
            if (model == null || string.IsNullOrEmpty(model.Username) || string.IsNullOrEmpty(model.Password))
            {
                return BadRequest("Invalid request");
            }

            // TODO: Replace with actual user authentication against your user database
            // This is a simple example for demonstration purposes
            if (model.Username == "admin" && model.Password == "admin123")
            {
                var token = GenerateToken("admin", new[] { "Administrator" });
                var refreshToken = Guid.NewGuid().ToString().Replace("-", "");
                
                // TODO: Store refresh token in database associated with the user
                
                return Ok(new TokenResponseModel
                {
                    Token = token,
                    ExpiresIn = expireMinutes * 60,
                    RefreshToken = refreshToken
                });
            }

            return Unauthorized();
        }

        /// <summary>
        /// Refresh token endpoint to get a new JWT token using a refresh token
        /// </summary>
        /// <param name="refreshToken">Refresh token</param>
        /// <returns>New JWT token</returns>
        [HttpPost]
        [Route("refresh-token")]
        public async Task<IHttpActionResult> RefreshToken(string refreshToken)
        {
            if (string.IsNullOrEmpty(refreshToken))
            {
                return BadRequest("Refresh token is required");
            }

            // TODO: Validate refresh token against your database
            // This is a simple example for demonstration purposes
            
            // Generate a new token
            var token = GenerateToken("admin", new[] { "Administrator" });
            var newRefreshToken = Guid.NewGuid().ToString().Replace("-", "");
            
            // TODO: Update refresh token in database
            
            return Ok(new TokenResponseModel
            {
                Token = token,
                ExpiresIn = expireMinutes * 60,
                RefreshToken = newRefreshToken
            });
        }

        /// <summary>
        /// Generate a JWT token
        /// </summary>
        /// <param name="username">Username</param>
        /// <param name="roles">User roles</param>
        /// <returns>JWT token</returns>
        private string GenerateToken(string username, string[] roles)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, username)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 