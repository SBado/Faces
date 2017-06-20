using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using FacesApiV2.Models;
using System.Web.OData.Builder;
using System.Web.OData.Extensions;
using System.Web.Http.Cors;

namespace FacesApiV2
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            //config.MapHttpAttributeRoutes();

            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);

            //enable cors
            var cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);

            // enable query options for all properties
            config.Filter().Expand().Select().OrderBy().MaxTop(null).Count();

            // New code:
            ODataModelBuilder builder = new ODataConventionModelBuilder();
            builder.EntitySet<Face>("Faces").EntityType.HasKey(f => f.ID);
            builder.EntitySet<Basket>("Baskets").EntityType.HasKey(b => b.BasketID);                        
            builder.EntitySet<StoreTree>("StoreTrees").EntityType.HasKey(s => s.ID);
            builder.EntitySet<ZoneMonitoring>("ZoneMonitorings").EntityType.HasKey(z => z.ID);
            config.MapODataServiceRoute(
                routeName: "ODataRoute",
                routePrefix: null,
                model: builder.GetEdmModel());
        }
    }
}
