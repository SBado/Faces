using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.OData.Routing;
using System.Web.Http.OData.Routing.Conventions;

namespace FacesApi.Helpers
{
    public class CountODataRoutingConvention : EntitySetRoutingConvention
    {
        public override string SelectAction(ODataPath odataPath, HttpControllerContext controllerContext, ILookup<string, HttpActionDescriptor> actionMap)
        {
            if (controllerContext.Request.Method == HttpMethod.Get && odataPath.PathTemplate == "~/entityset/$count")
            {
                if (actionMap.Contains("GetCount"))
                {
                    return "GetCount";
                }
            }
            return null; // let default routes handle
        }
    }
}