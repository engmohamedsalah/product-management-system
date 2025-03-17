using System;
using System.Configuration;
using System.Text;
using System.Web.Http;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Owin;
using Microsoft.Owin.Security.Jwt;
using Owin;
using Swashbuckle.Application;

[assembly: OwinStartup(typeof(ProductManagement.Startup))]

namespace ProductManagement
{
    /// <summary>
    /// OWIN startup class for configuring the application
    /// </summary>
    public class Startup
    {
        /// <summary>
        /// Configures the application
        /// </summary>
        /// <param name="app">OWIN app builder</param>
        public void Configuration(IAppBuilder app)
        {
            // Configure Web API
            var config = new HttpConfiguration();
            
            // Configure routes
            config.MapHttpAttributeRoutes();
            
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            
            // Configure JSON serialization
            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            
            // Enable CORS
            config.EnableCors();
            
            // Configure JWT authentication
            ConfigureAuth(app);
            
            // Configure Swagger
            ConfigureSwagger(config);
            
            // Use Web API
            app.UseWebApi(config);
        }
        
        /// <summary>
        /// Configures JWT authentication
        /// </summary>
        /// <param name="app">OWIN app builder</param>
        private void ConfigureAuth(IAppBuilder app)
        {
            var issuer = ConfigurationManager.AppSettings["JWT_ISSUER_TOKEN"];
            var audience = ConfigurationManager.AppSettings["JWT_AUDIENCE_TOKEN"];
            var secret = ConfigurationManager.AppSettings["JWT_SECRET_KEY"];
            
            var symmetricKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            
            app.UseJwtBearerAuthentication(new JwtBearerAuthenticationOptions
            {
                AllowedAudiences = new[] { audience },
                IssuerSecurityKeyProviders = new[] 
                {
                    new SymmetricKeyIssuerSecurityKeyProvider(issuer, symmetricKey)
                },
                TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }
            });
        }
        
        /// <summary>
        /// Configures Swagger documentation
        /// </summary>
        /// <param name="config">HTTP configuration</param>
        private void ConfigureSwagger(HttpConfiguration config)
        {
            config.EnableSwagger(c =>
            {
                c.SingleApiVersion("v1", "Product Management API");
                c.DescribeAllEnumsAsStrings();
                c.IncludeXmlComments(GetXmlCommentsPath());
                
                // Add JWT token support
                c.ApiKey("Authorization")
                    .Description("JWT Bearer token")
                    .Name("Authorization")
                    .In("header");
            })
            .EnableSwaggerUi(c =>
            {
                c.EnableApiKeySupport("Authorization", "header");
                c.DocExpansion(DocExpansion.List);
            });
        }
        
        /// <summary>
        /// Gets the path to the XML documentation file
        /// </summary>
        /// <returns>Path to the XML documentation file</returns>
        private string GetXmlCommentsPath()
        {
            return System.IO.Path.Combine(
                System.AppDomain.CurrentDomain.BaseDirectory, 
                "bin", 
                "ProductManagement.xml");
        }
    }
} 