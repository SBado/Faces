using FacesApiV2.Models;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.OData;
using System.Web.OData.Routing;

namespace FacesApiV2.Controllers 
{
    public class FacesController : ODataController
    {
        FacesEntities db = new FacesEntities();

        private bool FaceExists(int ID)
        {
            return db.Faces.Any(f => f.ID == ID);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

        [EnableQuery]        
        public IQueryable<Face> Get()
        {
            return db.Faces;
        }
        [EnableQuery]
        public SingleResult<Face> Get([FromODataUri] int ID)
        {
            IQueryable<Face> result = db.Faces.Where(p => p.ID == ID);
            return SingleResult.Create(result);
        }
    }
}