using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BankaAPI.Data;
using BankaAPI.Models;
using BankaAPI.DTOs;

namespace BankaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OdemelerController : ControllerBase
    {
        private readonly BankaDbContext _context;

        public OdemelerController(BankaDbContext context)
        {
            _context = context;
        }

        // GET: api/Odemeler
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Odemeler>>> GetOdemeler()
        {
            return await _context.Odemeler.ToListAsync();
        }

        // GET: api/Odemeler/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Odemeler>> GetOdemeler(int id)
        {
            var odemeler = await _context.Odemeler.FindAsync(id);

            if (odemeler == null)
            {
                return NotFound();
            }

            return odemeler;
        }

        // PUT: api/Odemeler/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOdemeler(int id, OdemeDto odemeDto)
        {
            var odemeler = new Odemeler
            {
                OdemeId = odemeDto.OdemeId,
                MusteriNo = odemeDto.MusteriNo,
                GuncelOdemeTutari = odemeDto.GuncelOdemeTutari,
                GuncelBorcTutari = odemeDto.GuncelBorcTutari,
                SonOdemeTarihi = odemeDto.SonOdemeTarihi.HasValue ? odemeDto.SonOdemeTarihi.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                GecikmisBorcTutari = odemeDto.GecikmisBorcTutari,
                OdenmisBorcTutari = odemeDto.OdenmisBorcTutari
            };

            if (id != odemeler.OdemeId)
            {
                return BadRequest();
            }

            _context.Entry(odemeler).State = EntityState.Modified;

            try
            { 
                // Insert Into Log Table 
                var log = new OdemeLog
                {
                    MusteriNo = odemeler.MusteriNo,
                    OdemeTutari = odemeler.GuncelOdemeTutari,
                    OdemeTarihi = DateTime.Now,
                    Aciklama = "Ödeme bilgileri güncellendi"
                };
                _context.OdemeLog.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OdemelerExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Odemeler
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Odemeler>> PostOdemeler(OdemeDto odemeDto)
        {
            var odemeler = new Odemeler
            {
                OdemeId = odemeDto.OdemeId,
                MusteriNo = odemeDto.MusteriNo,
                GuncelOdemeTutari = odemeDto.GuncelOdemeTutari,
                GuncelBorcTutari = odemeDto.GuncelBorcTutari,
                SonOdemeTarihi = odemeDto.SonOdemeTarihi.HasValue ? odemeDto.SonOdemeTarihi.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                GecikmisBorcTutari = odemeDto.GecikmisBorcTutari,
                OdenmisBorcTutari = odemeDto.OdenmisBorcTutari
            };

            _context.Odemeler.Add(odemeler);           
            // Insert Into log table
            var log = new OdemeLog
            {
                MusteriNo = odemeDto.MusteriNo,
                OdemeTutari = odemeDto.GuncelOdemeTutari,
                OdemeTarihi = DateTime.Now,
                Aciklama = "Yeni ödeme oluşturuldu"
            };
            _context.OdemeLog.Add(log);

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetOdemeler", new { id = odemeler.OdemeId }, odemeler);
        }

        // DELETE: api/Odemeler/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOdemeler(int id)
        {
            var odemeler = await _context.Odemeler.FindAsync(id);
            if (odemeler == null)
            {
                return NotFound();
            }
            //Insert Into Log Table
            var log = new OdemeLog
            {
                MusteriNo = odemeler.MusteriNo,
                OdemeTutari = odemeler.OdenmisBorcTutari,
                OdemeTarihi = odemeler.SonOdemeTarihi,
                Aciklama = "İşlem Silindi"
            };

            _context.OdemeLog.Add(log);
            _context.Odemeler.Remove(odemeler);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OdemelerExists(int id)
        {
            return _context.Odemeler.Any(e => e.OdemeId == id);
        }
    }
}
