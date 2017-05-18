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

namespace FacesApi.Controllers
{
    /*
    The WebApiConfig class may require additional changes to add a route for this controller. Merge these statements into the Register method of the WebApiConfig class as applicable. Note that OData URLs are case sensitive.

    using System.Web.Http.OData.Builder;
    using System.Web.Http.OData.Extensions;
    using FacesApi.Models;
    ODataConventionModelBuilder builder = new ODataConventionModelBuilder();
    builder.EntitySet<Face>("Faces");
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class FacesController : HubApiController<FacesHub>
    {
        private FacesEntities db = new FacesEntities();

        // GET: odata/Faces
        [EnableQuery]
        public IQueryable<Face> GetFaces()
        {
            return db.Faces;
        }

        // GET: odata/Faces(5)
        [EnableQuery]
        public SingleResult<Face> GetFace([FromODataUri] int key)
        {
            return SingleResult.Create(db.Faces.Where(face => face.ID == key));
        }

        // PUT: odata/Faces(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<Face> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Face face = db.Faces.Find(key);
            if (face == null)
            {
                return NotFound();
            }

            patch.Put(face);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FaceExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(face);
        }

        // POST: odata/Faces
        public IHttpActionResult Post(Face face)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Faces.Add(face);
            db.SaveChanges();

            return Created(face);
        }

        // PATCH: odata/Faces(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<Face> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Face face = db.Faces.Find(key);
            if (face == null)
            {
                return NotFound();
            }

            patch.Patch(face);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FaceExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(face);
        }

        // DELETE: odata/Faces(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            Face face = db.Faces.Find(key);
            if (face == null)
            {
                return NotFound();
            }

            db.Faces.Remove(face);
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

        private bool FaceExists(int key)
        {
            return db.Faces.Count(e => e.ID == key) > 0;
        }
    }
}
