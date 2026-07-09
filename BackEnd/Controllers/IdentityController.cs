using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
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
using Microsoft.Extensions.Hosting;

namespace BackEnd.Controllers
{
    
[Route("api/[controller]")]
[ApiController]
public class IdentityController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly GrafGenDb _context;

    public IdentityController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        ITokenService tokenService,
        GrafGenDb context,
        IWebHostEnvironment webHostEnvironment) 
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _context = context;
        _webHostEnvironment = webHostEnvironment; 
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var user = new User { UserName = dto.Username, Email = dto.Email };
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded){
            return BadRequest(result.Errors);
        }

        var accessToken = _tokenService.CreateAccessToken(user);
        var refreshToken = _tokenService.CreateRefreshToken();
        await _tokenService.AddRefreshToken(user, refreshToken);

        return Ok(new
        {
            Id = user.Id,
            Username = user.UserName,
            AccessToken = accessToken,
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

        foreach (var token in user?.RefreshTokens!)
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

        savedToken.Revoked = DateTime.UtcNow;

        var newRefreshToken = _tokenService.CreateRefreshToken();
        user.RefreshTokens.Add(newRefreshToken);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            AccessToken = _tokenService.CreateAccessToken(user),
            RefreshToken = newRefreshToken.Token
        });
    }
    
    [HttpPost("add-refresh-token")]
    public async Task<IActionResult> AddRefreshToken([FromBody] RefreshTokeDto request)
    {
        var user = request.User;
        var token = request.RefreshToken;
        //someeeeeeeeeeeeeeeeeeeeee bulllshitttt idk what to write ill think of it later
        return Ok();
    }
    [HttpPost("upload-profile-picture")]
    [Authorize]
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        const long maxFileSize = 2 * 1024 * 1024; 
        if (file.Length > maxFileSize) return BadRequest("File size exceeds 2MB limit.");

        var permittedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !permittedExtensions.Contains(extension))
            return BadRequest("Invalid file type. Only JPG, PNG, and WebP are allowed.");
        
        var storagePath = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot","PrivateStorage", "Profiles");
        if (!Directory.Exists(storagePath)) Directory.CreateDirectory(storagePath);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(storagePath, fileName);


        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
            Console.WriteLine(filePath, stream);
        }

        var user = await _userManager.GetUserAsync(User);
        if (user == null) return Unauthorized();
        
        user.ProfilePictureUrl = fileName; 
        await _userManager.UpdateAsync(user);

        return Ok(new { url = fileName });
    }

    
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var user = await _userManager.GetUserAsync(User);
        
        if (user == null) return NotFound();

        return Ok(new {
            username = user.UserName,
            email = user.Email,
            profilePicture = user.ProfilePictureUrl 
        });
    }
    [HttpGet("profile-picture/{fileName}")]
    public IActionResult GetProfilePicture(string fileName)
    {
        var safeFileName = Path.GetFileName(fileName);
        var filePath = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot","PrivateStorage", "Profiles", safeFileName);
        
        if (!System.IO.File.Exists(filePath)) 
        {

            return NotFound(filePath);
        }
        
        var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(filePath, out var contentType))
        {
            contentType = "application/octet-stream";
        }
        
        return PhysicalFile(filePath, contentType);
    }
}
}