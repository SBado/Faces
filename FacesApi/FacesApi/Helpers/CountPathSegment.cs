using Microsoft.Data.Edm;
using Microsoft.Data.Edm.Library;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.OData.Routing;

namespace FacesApi.Helpers
{
    public class CountPathSegment : ODataPathSegment
    {
        public override string SegmentKind
        {
            get
            {
                return "$count";
            }
        }

        public override IEdmType GetEdmType(IEdmType previousEdmType)
        {
            return EdmCoreModel.Instance.FindDeclaredType("Edm.Int32");
        }

        public override IEdmEntitySet GetEntitySet(IEdmEntitySet previousEntitySet)
        {
            return previousEntitySet;
        }

        public override string ToString()
        {
            return "$count";
        }
    }
}