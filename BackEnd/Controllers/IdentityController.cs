using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BackEnd.Data;
using BackEnd.Dtos;
using BackEnd.Models;
using BackEnd.Models.Responses;
using BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Controllers
{
    
[Route("api/[controller]")]
[ApiController]
public class IdentityController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ITokenService _tokenService;
    
    private readonly GrafGenDb _context;

    public IdentityController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        ITokenService tokenService,
        GrafGenDb context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
            _tokenService = tokenService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var user = new User { UserName = dto.Username, Email = dto.Email };
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // Generate tokens
        var accessToken = _tokenService.CreateAccessToken(user);

        // TODO: Store refresh token in DB with expiry
        // user.RefreshToken = refreshToken; await _userManager.UpdateAsync(user);
        var refreshToken = _tokenService.CreateRefreshToken();
        await _tokenService.AddRefreshToken(user, refreshToken);

        return Ok(new
        {
            AccessToken = _tokenService.CreateAccessToken(user),
            RefreshToken = refreshToken.Token
        });
    }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.Username);
            if (user == null) return Unauthorized("Invalid credentials");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded) return Unauthorized("Invalid credentials");

            var accessToken = _tokenService.CreateAccessToken(user);
            var refreshToken = _tokenService.CreateRefreshToken();

            await _tokenService.AddRefreshToken(user, refreshToken);

            return Ok(new
            {
                AccessToken = _tokenService.CreateAccessToken(user),
                RefreshToken = refreshToken.Token
            });
        }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var user = await _userManager.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId);

        foreach (var token in user.RefreshTokens)
            token.Revoked = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok("Logged out");
    }
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokeDto refreshToken)
    {
        var user = await _context.Users
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u =>
                u.RefreshTokens.Any(t => t.Token == refreshToken.RefreshToken));

        if (user == null)
            return Unauthorized("Invalid token");

        var savedToken = user.RefreshTokens.Single(t => t.Token == refreshToken.RefreshToken);

        if (!savedToken.IsActive)
            return Unauthorized("Token expired or revoked");

        // revoke old token
        savedToken.Revoked = DateTime.UtcNow;

        // create new refresh token
        var newRefreshToken = _tokenService.CreateRefreshToken();
        user.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            AccessToken = _tokenService.CreateAccessToken(user),
            RefreshToken = newRefreshToken.Token
        });
    }

}
}