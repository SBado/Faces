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
    public class BasketsController : ODataController
    {
        FacesEntities db = new FacesEntities();

        private bool BasketExists(int BasketID)
        {
            return db.Baskets.Any(b => b.BasketID == BasketID);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

        [EnableQuery]        
        public IQueryable<Basket> Get()
        {
            return db.Baskets;
        }
        [EnableQuery]
        public SingleResult<Basket> Get([FromODataUri] int BasketID)
        {
            IQueryable<Basket> result = db.Baskets.Where(b => b.BasketID == BasketID);
            return SingleResult.Create(result);
        }
    }
}