using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BankaAPI.Models;

public partial class Musteri
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

    //Navigation

    public virtual ICollection<OdemeLog> OdemeLog { get; set; } = new List<OdemeLog>();

    public virtual ICollection<Odemeler> Odemeler { get; set; } = new List<Odemeler>();
}
