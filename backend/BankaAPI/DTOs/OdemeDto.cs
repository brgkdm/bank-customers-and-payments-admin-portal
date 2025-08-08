using BankaAPI.Models;
using System.ComponentModel.DataAnnotations;

namespace BankaAPI.DTOs
{
    public class OdemeDto
    {
        [Key]
        public int OdemeId { get; set; }

        public int? MusteriNo { get; set; }

        public decimal? GuncelOdemeTutari { get; set; }

        public decimal? GuncelBorcTutari { get; set; }

        public DateOnly? SonOdemeTarihi { get; set; }

        public decimal? GecikmisBorcTutari { get; set; }

        public decimal? OdenmisBorcTutari { get; set; }
        //Navigation
        //public MusteriDto? Musteri { get; set; }      böyle bi şey gerekebilir

    }
}
