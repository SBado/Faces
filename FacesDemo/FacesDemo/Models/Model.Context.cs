﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace FacesDemo.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class FacesEntities : DbContext
    {
        public FacesEntities()
            : base("name=FacesEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<C__MigrationHistory> C__MigrationHistory { get; set; }
        public virtual DbSet<Basket> Baskets { get; set; }
        public virtual DbSet<Face> Faces { get; set; }
        public virtual DbSet<StoreTree> StoreTrees { get; set; }
        public virtual DbSet<ZoneMonitoring> ZoneMonitorings { get; set; }
        public virtual DbSet<Configuration> Configurations { get; set; }
    }
}
