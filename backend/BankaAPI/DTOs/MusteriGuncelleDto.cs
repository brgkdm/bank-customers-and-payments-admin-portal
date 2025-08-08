using System.ComponentModel.DataAnnotations;

namespace BankaAPI.Dtos
{
    public class MusteriGuncelleDto
    {
        [Key]
        public int MusteriNo { get; set; }
        public string? Ad { get; set; }
        public string? Soyad { get; set; }
        public string? Telefon { get; set; }
        public string? Sube { get; set; }
        public int? KrediNotu { get; set; }
        public string? Cinsiyet { get; set; }
        public DateTime? DogumTarihi { get; set; } 
        public DateTime? KayitTarihi { get; set; } = DateTime.Now;

        public decimal? KrediTutari { get; set; }
    }
}
