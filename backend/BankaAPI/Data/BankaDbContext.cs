using BankaAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace BankaAPI.Data
{
    public class BankaDbContext : DbContext
    {
        public BankaDbContext(DbContextOptions<BankaDbContext> options) : base(options)
        {
        }

        public DbSet<Musteri> Musteriler { get; set; }
        public DbSet<Odemeler> Odemeler { get; set; }
        public DbSet<OdemeLog> OdemeLog { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Odemeler -> Musteriler (Many-to-One)
            modelBuilder.Entity<Odemeler>()
                .HasOne(o => o.Musteri)
                .WithMany(m => m.Odemeler)
                .HasForeignKey(o => o.MusteriNo)
                .OnDelete(DeleteBehavior.SetNull);

            //OdemeLog -> Musteriler (Many-to-One)
            modelBuilder.Entity<OdemeLog>()
                .HasOne(l => l.Musteri)
                .WithMany(m => m.OdemeLog)
                .HasForeignKey(l => l.MusteriNo)            
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Musteri>()
                .Property(m => m.KrediTutari)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Odemeler>()
                .Property(o => o.GuncelOdemeTutari)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Odemeler>()
               .Property(o => o.GuncelBorcTutari)
               .HasPrecision(18, 2);

            modelBuilder.Entity<Odemeler>()
               .Property(o => o.GecikmisBorcTutari)
               .HasPrecision(18, 2);

            modelBuilder.Entity<Odemeler>()
               .Property(o => o.OdenmisBorcTutari)
               .HasPrecision(18, 2);
            modelBuilder.Entity<OdemeLog>()
               .Property(o => o.OdemeTutari)
               .HasPrecision(18, 2);

        }


    }
}

