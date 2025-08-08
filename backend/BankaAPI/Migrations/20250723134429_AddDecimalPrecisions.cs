using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankaAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDecimalPrecisions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Musteriler",
                columns: table => new
                {
                    MusteriNo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Ad = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Soyad = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Sube = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KrediNotu = table.Column<int>(type: "int", nullable: true),
                    Cinsiyet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DogumTarihi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KayitTarihi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KrediTutari = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Musteriler", x => x.MusteriNo);
                });

            migrationBuilder.CreateTable(
                name: "Odemeler",
                columns: table => new
                {
                    OdemeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MusteriNo = table.Column<int>(type: "int", nullable: true),
                    GuncelOdemeTutari = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    GuncelBorcTutari = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    SonOdemeTarihi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GecikmisBorcTutari = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    OdenmisBorcTutari = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Odemeler", x => x.OdemeId);
                    table.ForeignKey(
                        name: "FK_Odemeler_Musteriler_MusteriNo",
                        column: x => x.MusteriNo,
                        principalTable: "Musteriler",
                        principalColumn: "MusteriNo",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "OdemeLog",
                columns: table => new
                {
                    LogId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MusteriNo = table.Column<int>(type: "int", nullable: true),
                    OdemeTutari = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    OdemeTarihi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Aciklama = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OdemeLog", x => x.LogId);
                    table.ForeignKey(
                        name: "FK_OdemeLog_Musteriler_MusteriNo",
                        column: x => x.MusteriNo,
                        principalTable: "Musteriler",
                        principalColumn: "MusteriNo",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Odemeler_MusteriNo",
                table: "Odemeler",
                column: "MusteriNo");

            migrationBuilder.CreateIndex(
                name: "IX_OdemeLog_MusteriNo",
                table: "OdemeLog",
                column: "MusteriNo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Odemeler");

            migrationBuilder.DropTable(
                name: "OdemeLog");

            migrationBuilder.DropTable(
                name: "Musteriler");
        }
    }
}
