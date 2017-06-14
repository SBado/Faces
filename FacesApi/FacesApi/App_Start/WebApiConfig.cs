using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.OData.Builder;
using System.Web.Http.OData.Extensions;
using FacesApi.Models;
using System.Web.Http.Cors;
using System.Web.Http.OData.Routing.Conventions;
using FacesApi.Helpers;

namespace FacesApi
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            var cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);

            // Web API routes
            config.MapHttpAttributeRoutes();
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
            builder.EntitySet<Basket>("Baskets");
            builder.EntitySet<Configuration>("Configurations");
            builder.EntitySet<Face>("Faces");
            builder.EntitySet<StoreTree>("StoreTrees");
            builder.EntitySet<ZoneMonitoring>("ZoneMonitorings");

            IList<IODataRoutingConvention> conventions = ODataRoutingConventions.CreateDefault();
            conventions.Insert(0, new CountODataRoutingConvention()); // allow $count segments in WebAPI OData

            config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel(), new CountODataPathHandler(), conventions);
        }
    }
}
