# Bank Customers & Payments Admin Portal

Full‑stack monorepo for managing bank customers and payment records.
- Backend: ASP.NET Core 8 (Web API), Entity Framework Core (SQL Server), Swagger.
- Frontend: React 18 + Vite 5 + TypeScript, Tailwind CSS, shadcn/ui, TanStack Query.

This README covers local setup, configuration, how to run, and key API endpoints.

## Repository layout

```
backend/
  BankaAPI/                # ASP.NET Core 8 Web API
  BankaAPI.sln
frontend/                  # React + Vite app (port 8080)
database/
  script.sql               # SQL Server DB schema + stored procedures
LICENSE
```

## Prerequisites

- .NET SDK 8.0+
- SQL Server (Express or Developer) + SQL Server Management Studio (optional)
- Node.js 18+ and npm (or bun/pnpm if you prefer)

## Configuration

- Connection string name used by the API: `BankaDb`.
  - Set it in `backend/BankaAPI/appsettings.Development.json` (recommended for local dev).
  - Example:
    Replace the connection string with your own.
    ```json
    {
      "ConnectionStrings": {
        "BankaDb": "Server=localhost\\SQLEXPRESS;Database=BankaDB;Trusted_Connection=True;TrustServerCertificate=True;"
      }
    }
    ```
- HTTPS/HTTP ports (from `launchSettings.json`):
  - HTTPS: `https://localhost:7205`
  - HTTP: `http://localhost:5172`
- CORS (in `Program.cs`) allows the frontend at `http://localhost:8080`. If you change frontend port/origin, update the CORS policy and rebuild.
- Frontend API base URL (in `frontend/src/lib/api.ts`):
  - Default: `https://localhost:7205/api`
  - If your API runs on a different port/origin, update this constant.

## Quick start (local)

Follow these steps in order.

1) Create the database schema
- Option A – Run the ready script (easiest)
  - Open `database/script.sql` in SSMS and execute it. It creates the `BankaDB` database, tables, FKs, defaults, and stored procedures.
- Option B – Use EF Core migrations
  - Ensure your `BankaDb` connection string points to an existing SQL Server instance.
  - Then run (PowerShell):
    ```powershell
    dotnet tool install --global dotnet-ef
    cd backend/BankaAPI
    dotnet restore
    dotnet ef database update
    ```

2) Run the backend API
```powershell
cd backend/BankaAPI
# Trust the local HTTPS dev certificate on Windows if prompted
dotnet dev-certs https --trust
# Run the HTTPS profile (serves Swagger at /swagger)
dotnet run --launch-profile https
```
The API will be available at `https://localhost:7205` (Swagger at `https://localhost:7205/swagger`).

3) Run the frontend
```powershell
cd frontend
npm install
npm run dev
```
The app will start at `http://localhost:8080` and call the API at `https://localhost:7205/api`.

## API overview

Base URL (local): `https://localhost:7205/api`

- Customers (`/Musteriler`)
  - GET `/Musteriler` → list customers (MusteriOkuDto)
  - GET `/Musteriler/{musteriNo}` → single customer (MusteriOkuDto)
  - GET `/Musteriler/sube/{subeAdi}` → customers by branch (uses stored procedure `MusteriGetirBySube`)
  - POST `/Musteriler` → create customer (body: `MusteriGuncelleDto`)
  - PUT `/Musteriler/{musteriNo}` → update customer (body: `MusteriGuncelleDto`)
  - DELETE `/Musteriler/{musteriNo}` → delete customer

  Example create/update payload:
  ```json
  {
    "Ad": "Ayşe",
    "Soyad": "Yılmaz",
    "Telefon": "+90 5xx xxx xx xx",
    "Sube": "Kadıköy",
    "KrediNotu": 780,
    "Cinsiyet": "Kadın",
    "DogumTarihi": "1995-02-10T00:00:00",
    "KayitTarihi": "2025-08-10T00:00:00",
    "KrediTutari": 125000.00
  }
  ```

- Payments (`/Odemeler`)
  - GET `/Odemeler` → list payments
  - GET `/Odemeler/{id}` → payment by id
  - POST `/Odemeler` → create payment (body: `OdemeDto`)
  - PUT `/Odemeler/{id}` → update payment (body: `OdemeDto`)
  - DELETE `/Odemeler/{id}` → delete payment

  Notes for `OdemeDto`:
  - `SonOdemeTarihi` is a date (the API expects a value convertible to a date; ISO `YYYY-MM-DD` is safe).
  - Decimal fields use precision (18,2) in the database.

  Example payload:
  ```json
  {
    "OdemeId": 0,
    "MusteriNo": 1,
    "GuncelOdemeTutari": 2500.00,
    "GuncelBorcTutari": 72500.00,
    "SonOdemeTarihi": "2025-08-31",
    "GecikmisBorcTutari": 0.00,
    "OdenmisBorcTutari": 27500.00
  }
  ```

Explore the full schema and try endpoints via Swagger UI at `/swagger`.

## Database objects

`database/script.sql` creates:
- Tables: `Musteriler`, `Odemeler`, `OdemeLog` (with FKs and defaults)
- Procedures (examples): `MusteriGetirBySube`, `sp_MusteriDetayGetir`, `sp_MusteriEkle`, `sp_MusteriGuncelle`, `sp_MusteriSil`, `sp_OdemeAl`, `sp_OdemeDetayGetir`, `sp_OdemeIadeEt`, `sp_OdemesiGecikenleriGetir`
- EF decimal precisions are enforced via migrations in `backend/BankaAPI/Migrations`

## Tips & troubleshooting

- If the frontend can’t reach the API:
  - Ensure the API runs on `https://localhost:7205` (or update `frontend/src/lib/api.ts`).
  - If you change the frontend origin, update CORS in `Program.cs` (policy `AllowReactApp`).
- If SQL connection fails:
  - Verify the `BankaDb` connection string points to a valid SQL Server instance and database.
  - For local dev, `Trusted_Connection=True;TrustServerCertificate=True;` is convenient.
- Trust the HTTPS dev cert once on Windows: `dotnet dev-certs https --trust`.

## Tech stack

- Backend: ASP.NET Core 8, EF Core 9 (SqlServer), Swagger
- Frontend: React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, TanStack Query, Axios

## License

This project is licensed under the terms of the license in `Apache 2.0`.

## Clean install checklist (another machine)

Follow these steps to validate a fresh setup on a different environment:

1) Prereqs: Install .NET 8 SDK, SQL Server (Express/Developer), Node.js 18+.
2) Clone and open this repo.
3) Database:
  - Prefer the EF route: set `ConnectionStrings:BankaDb` and run `dotnet ef database update` in `backend/BankaAPI`.
  - Or use `database/script.sql`. If it fails due to MDF/LDF paths, either update the paths or simplify to `CREATE DATABASE [BankaDB];` and run the rest under `USE [BankaDB]`.
4) Backend:
  - Ensure `appsettings.Development.json` or `appsettings.json` contains a valid `BankaDb` connection string.
  - Trust dev cert once: `dotnet dev-certs https --trust`.
  - Run: `dotnet run --launch-profile https` in `backend/BankaAPI`.
5) Frontend:
  - `cd frontend && npm install && npm run dev`.
  - If API origin differs, update `frontend/src/lib/api.ts` baseURL.
6) CORS:
  - If your frontend runs on a different origin/port, add it to the CORS policy `AllowReactApp` in `Program.cs`.

Report back with any errors, unclear steps, or missing details.
