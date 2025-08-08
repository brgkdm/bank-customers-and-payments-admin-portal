using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankaAPI.Models;
using BankaAPI.Data;
using BankaAPI.Dtos;
using BankaAPI.DTOs;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BankaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MusterilerController : ControllerBase
    {
        private readonly BankaDbContext _context;

        public MusterilerController(BankaDbContext context) => _context = context;

        // GET: api/Musteriler
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MusteriOkuDto>>> GetMusteriler()   
        {
            var musteriler = await _context.Musteriler.ToListAsync();

            var dtoList = musteriler.Select(m => new MusteriOkuDto
            {
                MusteriNo = m.MusteriNo,
                Ad = m.Ad,
                Soyad = m.Soyad,
                Telefon = m.Telefon,
                Sube = m.Sube,
                KrediNotu = m.KrediNotu,
                Cinsiyet = m.Cinsiyet,
                DogumTarihi = m.DogumTarihi,
                KayitTarihi = m.KayitTarihi,
                KrediTutari = m.KrediTutari
            });

            return Ok(dtoList);
        }



        // GET: api/Musteriler/5
        [HttpGet("{musteriNo}")]
        public async Task<ActionResult<MusteriOkuDto>> GetMusteri(int musteriNo)
        {
            var musteri = await _context.Musteriler.FindAsync(musteriNo);

            if (musteri == null) return NotFound();

            var dto = new MusteriOkuDto
            {
                MusteriNo = musteri.MusteriNo,
                Ad = musteri.Ad,
                Soyad = musteri.Soyad,
                Telefon = musteri.Telefon,
                Sube = musteri.Sube,
                KrediNotu = musteri.KrediNotu,
                Cinsiyet = musteri.Cinsiyet,
                DogumTarihi = musteri.DogumTarihi,
                KayitTarihi = musteri.KayitTarihi,
                KrediTutari = musteri.KrediTutari
            };

            return Ok(dto);
        }


        // GET: api/Musteriler/sube/
        [HttpGet("sube/{subeAdi}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<MusteriOkuDto>>> GetMusterilerBySube(string subeAdi)
        {
            var musteriler = await _context.Musteriler
                .FromSqlRaw("EXEC MusteriGetirBySube @p0", subeAdi)
                .ToListAsync();

            if (musteriler == null || !musteriler.Any())
            {
                return NotFound($"'{subeAdi}' şubesine ait müşteri bulunamadı.");
            }

            var musteriDtoList = musteriler.Select(m => new MusteriOkuDto
            {
                Ad = m.Ad,
                Soyad = m.Soyad,
                Telefon = m.Telefon,
                KrediNotu = m.KrediNotu,
                Cinsiyet = m.Cinsiyet,
                DogumTarihi = m.DogumTarihi,
                KayitTarihi = m.KayitTarihi,
                KrediTutari = m.KrediTutari
            }).ToList();

            return Ok(musteriDtoList);
        }



        // PUT: api/Musteriler/5
        [HttpPut("{musteriNo}")]
        public async Task<IActionResult> PutMusteri(int musteriNo, MusteriGuncelleDto MusteriGuncelleDto)
        {
            var musteri = await _context.Musteriler.FindAsync(musteriNo);
            if (musteri == null) return NotFound();

            musteri.Ad = MusteriGuncelleDto.Ad;
            musteri.Soyad = MusteriGuncelleDto.Soyad;
            musteri.Telefon = MusteriGuncelleDto.Telefon;
            musteri.Sube = MusteriGuncelleDto.Sube;
            musteri.KrediNotu = MusteriGuncelleDto.KrediNotu;
            musteri.Cinsiyet = MusteriGuncelleDto.Cinsiyet;
            musteri.DogumTarihi = MusteriGuncelleDto.DogumTarihi;
            musteri.KrediTutari = MusteriGuncelleDto.KrediTutari;

            await _context.SaveChangesAsync();

            return NoContent();
        }


        //POST

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Musteri>> PostMusteri(MusteriGuncelleDto musteriGuncelleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Aynı telefon numarasına sahip müşteri var mı kontrol et
            bool musteriVarMi = await _context.Musteriler
                .AnyAsync(m => m.Telefon == musteriGuncelleDto.Telefon);

            if (musteriVarMi)
            {
                return BadRequest("Bu telefon numarasına sahip bir müşteri zaten kayıtlı.");
            }

            var musteri = new Musteri
            {
                Ad = musteriGuncelleDto.Ad,
                Soyad = musteriGuncelleDto.Soyad,
                Telefon = musteriGuncelleDto.Telefon,
                Sube = musteriGuncelleDto.Sube,
                KrediNotu = musteriGuncelleDto.KrediNotu,
                Cinsiyet = musteriGuncelleDto.Cinsiyet,
                DogumTarihi = musteriGuncelleDto.DogumTarihi,
                KrediTutari = musteriGuncelleDto.KrediTutari,
                KayitTarihi = musteriGuncelleDto.KayitTarihi      
            };
            // Veritabanına ekle
            _context.Musteriler.Add(musteri);
            await _context.SaveChangesAsync();

            // 201 Created döndür ve yeni müşteri bilgisini geri ver
            return CreatedAtAction(nameof(GetMusteri), new { musteriNo = musteri.MusteriNo }, musteriGuncelleDto);
        }



        // DELETE: api/Musteriler/5
        [HttpDelete("{musteriNo}")]
        public async Task<IActionResult> DeleteMusteri(int musteriNo)
        {
            var musteri = await _context.Musteriler.FindAsync(musteriNo);
            if (musteri == null)
            {
                return NotFound();
            }

            _context.Musteriler.Remove(musteri);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // helper method
        private bool MusteriExists(int musteriNo)
        {
            return _context.Musteriler.Any(e => e.MusteriNo == musteriNo);
        }
    }
}