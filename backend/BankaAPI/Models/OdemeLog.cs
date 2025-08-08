using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BankaAPI.Models;

public partial class OdemeLog
{
    [Key]
    public int LogId { get; set; }

    public int? MusteriNo { get; set; }

    public decimal? OdemeTutari { get; set; }

    public DateTime? OdemeTarihi { get; set; }

    public string? Aciklama { get; set; }

    // Navigation
    public Musteri? Musteri { get; set; }
}
