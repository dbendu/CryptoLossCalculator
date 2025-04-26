using CryptoLossCalculator.Api.Middlewares;
using CryptoLossCalculator.Api.Settings;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Host.UseSerilog();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(
    o => o.AddPolicy(
        "CorsPolicy",
        b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
    )
);

builder.Services.AddControllers();

builder.Services.Configure<UserDataSettings>(
    builder.Configuration.GetSection(nameof(UserDataSettings))
);

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("CorsPolicy");

app.MapControllers();

app.Run();
