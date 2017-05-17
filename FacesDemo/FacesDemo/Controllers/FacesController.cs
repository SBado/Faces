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

namespace FacesDemo.Controllers
{
    public class FacesController : ApiController
    {
        private FacesEntities db = new FacesEntities();

        // GET: api/Faces
        public IQueryable<Face> GetFaces()
        {
            return db.Faces;
        }

        // GET: api/Faces/5
        [ResponseType(typeof(Face))]
        public IHttpActionResult GetFace(int id)
        {
            Face face = db.Faces.Find(id);
            if (face == null)
            {
                return NotFound();
            }

            return Ok(face);
        }

        // PUT: api/Faces/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutFace(int id, Face face)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != face.ID)
            {
                return BadRequest();
            }

            db.Entry(face).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FaceExists(id))
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

        // POST: api/Faces
        [ResponseType(typeof(Face))]
        public IHttpActionResult PostFace(Face face)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Faces.Add(face);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = face.ID }, face);
        }

        // DELETE: api/Faces/5
        [ResponseType(typeof(Face))]
        public IHttpActionResult DeleteFace(int id)
        {
            Face face = db.Faces.Find(id);
            if (face == null)
            {
                return NotFound();
            }

            db.Faces.Remove(face);
            db.SaveChanges();

            return Ok(face);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool FaceExists(int id)
        {
            return db.Faces.Count(e => e.ID == id) > 0;
        }
    }
}