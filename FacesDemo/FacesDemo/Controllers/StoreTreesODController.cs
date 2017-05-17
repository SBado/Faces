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
using FacesDemo.Models;
using FacesDemo.Hubs;

namespace FacesDemo.Controllers
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using FacesDemo.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<StoreTree>("StoreTreesOD");
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class StoreTreesODController : ODControllerWithHub<FacesHub>
    {
        private FacesEntities db = new FacesEntities();

        // GET: odata/StoreTreesOD
        [EnableQuery]
        public IQueryable<StoreTree> GetStoreTreesOD()
        {
            return db.StoreTrees;
        }

        // GET: odata/StoreTreesOD(5)
        [EnableQuery]
        public SingleResult<StoreTree> GetStoreTree([FromODataUri] int key)
        {
            return SingleResult.Create(db.StoreTrees.Where(storeTree => storeTree.ID == key));
        }

        // PUT: odata/StoreTreesOD(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<StoreTree> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StoreTree storeTree = db.StoreTrees.Find(key);
            if (storeTree == null)
            {
                return NotFound();
            }

            patch.Put(storeTree);

            try
            {
                db.SaveChanges();

                var subscribed = Hub.Clients.Group(storeTree.Name.ToLower());
                subscribed.updateItem(storeTree);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StoreTreeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(storeTree);
        }

        // POST: odata/StoreTreesOD
        public IHttpActionResult Post(StoreTree storeTree)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.StoreTrees.Add(storeTree);
            db.SaveChanges();

            return Created(storeTree);
        }

        // PATCH: odata/StoreTreesOD(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<StoreTree> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StoreTree storeTree = db.StoreTrees.Find(key);
            if (storeTree == null)
            {
                return NotFound();
            }

            patch.Patch(storeTree);

            try
            {
                db.SaveChanges();

                var subscribed = Hub.Clients.Group(storeTree.Name.ToLower());
                subscribed.updateItem(storeTree);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StoreTreeExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(storeTree);
        }

        // DELETE: odata/StoreTreesOD(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            StoreTree storeTree = db.StoreTrees.Find(key);
            if (storeTree == null)
            {
                return NotFound();
            }

            db.StoreTrees.Remove(storeTree);
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

        private bool StoreTreeExists(int key)
        {
            return db.StoreTrees.Count(e => e.ID == key) > 0;
        }
    }
}
