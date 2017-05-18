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
    builder.EntitySet<ZoneMonitoring>("ZoneMonitorings");
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ZoneMonitoringsController : HubApiController<FacesHub>
    {
        private FacesEntities db = new FacesEntities();

        // GET: odata/ZoneMonitorings
        [EnableQuery]
        public IQueryable<ZoneMonitoring> GetZoneMonitorings()
        {
            return db.ZoneMonitorings;
        }

        // GET: odata/ZoneMonitorings(5)
        [EnableQuery]
        public SingleResult<ZoneMonitoring> GetZoneMonitoring([FromODataUri] int key)
        {
            return SingleResult.Create(db.ZoneMonitorings.Where(zoneMonitoring => zoneMonitoring.ID == key));
        }

        // PUT: odata/ZoneMonitorings(5)
        public IHttpActionResult Put([FromODataUri] int key, Delta<ZoneMonitoring> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ZoneMonitoring zoneMonitoring = db.ZoneMonitorings.Find(key);
            if (zoneMonitoring == null)
            {
                return NotFound();
            }

            patch.Put(zoneMonitoring);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ZoneMonitoringExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(zoneMonitoring);
        }

        // POST: odata/ZoneMonitorings
        public IHttpActionResult Post(ZoneMonitoring zoneMonitoring)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.ZoneMonitorings.Add(zoneMonitoring);
            db.SaveChanges();

            return Created(zoneMonitoring);
        }

        // PATCH: odata/ZoneMonitorings(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] int key, Delta<ZoneMonitoring> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ZoneMonitoring zoneMonitoring = db.ZoneMonitorings.Find(key);
            if (zoneMonitoring == null)
            {
                return NotFound();
            }

            patch.Patch(zoneMonitoring);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ZoneMonitoringExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(zoneMonitoring);
        }

        // DELETE: odata/ZoneMonitorings(5)
        public IHttpActionResult Delete([FromODataUri] int key)
        {
            ZoneMonitoring zoneMonitoring = db.ZoneMonitorings.Find(key);
            if (zoneMonitoring == null)
            {
                return NotFound();
            }

            db.ZoneMonitorings.Remove(zoneMonitoring);
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

        private bool ZoneMonitoringExists(int key)
        {
            return db.ZoneMonitorings.Count(e => e.ID == key) > 0;
        }
    }
}
