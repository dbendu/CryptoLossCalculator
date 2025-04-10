using CryptoLossCalculator.Api.Settings;
using Microsoft.AspNetCore.HttpLogging;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(
    o => o.AddPolicy(
        "CorsPolicy",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
    )
);

builder.Services.AddControllers();

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.RequestPath | HttpLoggingFields.ResponseStatusCode | HttpLoggingFields.Duration;
    logging.CombineLogs = true;
});

builder.Services.Configure<UserDataSettings>(
    builder.Configuration.GetSection(nameof(UserDataSettings))
);

var app = builder.Build();

app.UseHttpLogging();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("CorsPolicy");

app.MapControllers();

app.Run();
