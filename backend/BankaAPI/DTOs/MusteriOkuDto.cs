using System.ComponentModel.DataAnnotations;

namespace BankaAPI.DTOs
{
    public class MusteriOkuDto
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

        public DateTime? KayitTarihi { get; set; }

        public decimal? KrediTutari { get; set; }
    }
}
