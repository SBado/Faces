using Microsoft.Data.Edm;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.OData.Routing;

namespace FacesApi.Helpers
{
    public class CountODataPathHandler : DefaultODataPathHandler
    {
        protected override ODataPathSegment ParseAtEntityCollection(IEdmModel model, ODataPathSegment previous, IEdmType previousEdmType, string segment)
        {
            if (segment == "$count")
            {
                return new CountPathSegment();
            }
            return base.ParseAtEntityCollection(model, previous, previousEdmType, segment);
        }
    }
}