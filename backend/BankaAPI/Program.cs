using BankaAPI.Data; // DbContext sınıfının bulunduğu namespace                         
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// 🔹 DbContext'i DI konteynerine ekle
builder.Services.AddDbContext<BankaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("BankaDb")));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Allow React

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:8080") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp"); //allow react

app.UseAuthorization();

app.MapControllers();

app.Run();
