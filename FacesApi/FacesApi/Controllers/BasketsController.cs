using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.ModelBinding;
using System.Web.Http.OData;
using System.Web.Http.OData.Routing;
using FacesApi.Models;
using FacesApi.Hubs;
using System.Web.Http.OData.Query;
using System.Text;

namespace FacesApi.Controllers
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using FacesApi.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Basket>("Baskets");
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class BasketsController : HubApiController<FacesHub>
    {
        private FacesEntities db = new FacesEntities();

        // GET: odata/Baskets
        [EnableQuery]
        public IQueryable<Basket> GetBaskets()
        {
            return db.Baskets;
        }

        // GET: odata/Baskets(5)
        [EnableQuery]
        public SingleResult<Basket> GetBasket([FromODataUri] int key)
        {
            return SingleResult.Create(db.Baskets.Where(basket => basket.BasketID == key));
        }

        public HttpResponseMessage GetCount(ODataQueryOptions<Basket> queryOptions)
        {
            IQueryable<Basket> queryResults = queryOptions.ApplyTo(GetBaskets()) as IQueryable<Basket>;
            int count = queryResults.Count();
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StringContent(count.ToString(), Encoding.UTF8, "text/plain");
            return response;
        }

        // PUT: odata/Baskets(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<Basket> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Basket basket = db.Baskets.Find(key);
            if (basket == null)
            {
                return NotFound();
            }

            patch.Put(basket);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BasketExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(basket);
        }

        // POST: odata/Baskets
        public IHttpActionResult Post(Basket basket)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Baskets.Add(basket);
            db.SaveChanges();

            return Created(basket);
        }

        // PATCH: odata/Baskets(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<Basket> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Basket basket = db.Baskets.Find(key);
            if (basket == null)
            {
                return NotFound();
            }

            patch.Patch(basket);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BasketExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(basket);
        }

        // DELETE: odata/Baskets(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            Basket basket = db.Baskets.Find(key);
            if (basket == null)
            {
                return NotFound();
            }

            db.Baskets.Remove(basket);
            db.SaveChanges();

            return StatusCode(HttpStatusCode.NoContent);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool BasketExists(int key)
        {
            return db.Baskets.Count(e => e.BasketID == key) > 0;
        }
    }
}
