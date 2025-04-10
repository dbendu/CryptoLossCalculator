using CryptoLossCalculator.Api.Settings;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace CryptoLossCalculator.Api.Controllers;

public record UpdateUserDataRequest(
    string Username,
    string Data);

public class UserDataController : ControllerBase
{
    private readonly UserDataSettings _usersSettings;

    public UserDataController(IOptions<UserDataSettings> usersSettings)
    {
        _usersSettings = usersSettings.Value;
    }

    [HttpGet("api/users/exists")]
    public IActionResult UserExists([FromQuery] string username)
    {
        var userFilePath = Path.Combine(_usersSettings.Folder, username);

        var exists = System.IO.File.Exists(userFilePath);

        return Ok(exists);
    }

    [HttpGet("api/users/{user}")]
    public async Task<IActionResult> GetUserData([FromRoute] string user, CancellationToken token)
    {
        var userFilePath = Path.Combine(_usersSettings.Folder, user);

        if (!System.IO.File.Exists(userFilePath))
            return NotFound($"Пользователь {user} не найден");

        var content = await System.IO.File.ReadAllTextAsync(userFilePath, token);

        return Ok(content);
    }

    [HttpPost("api/users")]
    public async Task<IActionResult> UpdateUserInfo(
        [FromBody] UpdateUserDataRequest request,
        CancellationToken token
    )
    {
        var userFilePath = Path.Combine(_usersSettings.Folder, request.Username);

        if (!System.IO.File.Exists(userFilePath))
        {
            await using var stream = System.IO.File.Create(userFilePath);
        }

        await System.IO.File.WriteAllTextAsync(userFilePath, request.Data, token);

        return Ok();
    }
}
