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
    builder.EntitySet<Configuration>("Configurations");
    config.Routes.MapODataServiceRoute("odata", "odata", builder.GetEdmModel());
    */
    public class ConfigurationsController : HubApiController<FacesHub>
    {
        private FacesEntities db = new FacesEntities();

        // GET: odata/Configurations
        [EnableQuery]
        public IQueryable<Configuration> GetConfigurations()
        {
            return db.Configurations;
        }

        // GET: odata/Configurations(5)
        [EnableQuery]
        public SingleResult<Configuration> GetConfiguration([FromODataUri] string key)
        {
            return SingleResult.Create(db.Configurations.Where(configuration => configuration.Key == key));
        }

        // PUT: odata/Configurations(5)
        public IHttpActionResult Put([FromODataUri] string key, Delta<Configuration> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Configuration configuration = db.Configurations.Find(key);
            if (configuration == null)
            {
                return NotFound();
            }

            patch.Put(configuration);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConfigurationExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(configuration);
        }

        // POST: odata/Configurations
        public IHttpActionResult Post(Configuration configuration)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Configurations.Add(configuration);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (ConfigurationExists(configuration.Key))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return Created(configuration);
        }

        // PATCH: odata/Configurations(5)
        [AcceptVerbs("PATCH", "MERGE")]
        public IHttpActionResult Patch([FromODataUri] string key, Delta<Configuration> patch)
        {
            Validate(patch.GetEntity());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Configuration configuration = db.Configurations.Find(key);
            if (configuration == null)
            {
                return NotFound();
            }

            patch.Patch(configuration);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConfigurationExists(key))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Updated(configuration);
        }

        // DELETE: odata/Configurations(5)
        public IHttpActionResult Delete([FromODataUri] string key)
        {
            Configuration configuration = db.Configurations.Find(key);
            if (configuration == null)
            {
                return NotFound();
            }

            db.Configurations.Remove(configuration);
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

        private bool ConfigurationExists(string key)
        {
            return db.Configurations.Count(e => e.Key == key) > 0;
        }
    }
}
