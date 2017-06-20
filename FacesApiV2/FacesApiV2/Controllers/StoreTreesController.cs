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
    public class StoreTreesController : ODataController
    {
        FacesEntities db = new FacesEntities();

        private bool StoreTreeExists(int ID)
        {
            return db.StoreTrees.Any(s => s.ID == ID);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

        [EnableQuery]        
        public IQueryable<StoreTree> Get()
        {
            return db.StoreTrees;
        }
        [EnableQuery]
        public SingleResult<StoreTree> Get([FromODataUri] int ID)
        {
            IQueryable<StoreTree> result = db.StoreTrees.Where(s => s.ID == ID);
            return SingleResult.Create(result);
        }
    }
}