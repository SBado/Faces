using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Routing;

using System.Web.Http.OData.Builder;
using System.Web.Http.OData.Extensions;
using FacesDemo.Models;

namespace FacesDemo
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApiWithId",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            config.Routes.MapHttpRoute("DefaultApiWithAction", "Api/{controller}/{action}");
            config.Routes.MapHttpRoute("DefaultApiGet", "Api/{controller}", null, new { httpMethod = new HttpMethodConstraint(HttpMethod.Get) });

            //OData
            ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
            builder.EntitySet<StoreTree>("StoreTreesOD");
            config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());

        }
    }
}
