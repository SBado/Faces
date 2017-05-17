using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using FacesDemo.Models;
using FacesDemo.Hubs;

namespace FacesDemo.Controllers
{
    public class StoreTreesController : ApiControllerWithHub<FacesHub>
    {
        private FacesEntities db = new FacesEntities();

        // GET: api/StoreTrees
        public IQueryable<StoreTree> GetStoreTrees()
        {
            return db.StoreTrees;
        }

        // GET: api/StoreTrees/5
        [Route("api/StoreTrees/GetStoreTree")]
        [ResponseType(typeof(StoreTree))]
        public IHttpActionResult GetStoreTree(int id)
        {
            StoreTree storeTree = db.StoreTrees.Find(id);
            if (storeTree == null)
            {
                return NotFound();
            }

            return Ok(storeTree);
        }

        // GET: api/StoreTrees/gucci
        [Route("api/StoreTrees/GetStoreTreeByName")]
        [ResponseType(typeof(StoreTree))]
        public IHttpActionResult GetStoreTreeByName(string name)
        {            
            var storeTree = db.StoreTrees.SqlQuery("SELECT * FROM StoreTree Where Name = {0}", name).ToList();
            if (storeTree == null)
            {
                return NotFound();
            }

            return Ok(storeTree);
        }

        // PUT: api/StoreTrees/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutStoreTree(int id, StoreTree storeTree)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != storeTree.ID)
            {
                return BadRequest();
            }

            db.Entry(storeTree).State = EntityState.Modified;

            try
            {
                db.SaveChanges();

                var subscribed = Hub.Clients.Group(storeTree.Name.ToLower());
                subscribed.updateItem(storeTree);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!StoreTreeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/StoreTrees
        [ResponseType(typeof(StoreTree))]
        public IHttpActionResult PostStoreTree(StoreTree storeTree)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.StoreTrees.Add(storeTree);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = storeTree.ID }, storeTree);
        }

        // DELETE: api/StoreTrees/5
        [ResponseType(typeof(StoreTree))]
        public IHttpActionResult DeleteStoreTree(int id)
        {
            StoreTree storeTree = db.StoreTrees.Find(id);
            if (storeTree == null)
            {
                return NotFound();
            }

            db.StoreTrees.Remove(storeTree);
            db.SaveChanges();

            return Ok(storeTree);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool StoreTreeExists(int id)
        {
            return db.StoreTrees.Count(e => e.ID == id) > 0;
        }
    }
}