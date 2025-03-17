using System;
using System.Web;
using System.Web.Http;

namespace ProductManagement
{
    /// <summary>
    /// Web API application class
    /// </summary>
    public class WebApiApplication : HttpApplication
    {
        /// <summary>
        /// Application start event handler
        /// </summary>
        protected void Application_Start()
        {
            // Web API configuration is done in Startup.cs (OWIN configuration)
        }
    }
} 