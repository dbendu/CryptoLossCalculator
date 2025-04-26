using System.Diagnostics;

namespace CryptoLossCalculator.Api.Middlewares;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();

        await _next(context);

        stopwatch.Stop();

        var path = context.Request.Path;
        var method = context.Request.Method;
        var statusCode = context.Response.StatusCode;
        var elapsedMs = stopwatch.ElapsedMilliseconds;

        _logger.LogInformation(
            "{Method} {Path} responded {StatusCode} in {Elapsed}ms",
            method, path, statusCode, elapsedMs
        );
    }
}