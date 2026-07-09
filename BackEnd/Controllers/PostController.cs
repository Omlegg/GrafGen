using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BackEnd.Dtos;
using BackEnd.Models;
using BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        // GET: api/Post
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetAll()
        {
            var posts = await _postService.GetAllAsync();
            return Ok(posts);
        }

        [HttpGet("random")]
        public async Task<ActionResult<IEnumerable<Post>>> GetRandomPosts()
        {
            var posts = await _postService.GetNumberAsync();

            if (posts == null || !posts.Any())
            {
                return NoContent();
            }
            return Ok(posts);
        }

        // GET: api/Post/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Post>> GetById(int id)
        {
            var post = await _postService.GetByIdAsync(id);
            if (post == null) return NotFound();
            return Ok(post);
        }

        // POST: api/Post
       [HttpPost]
        [Authorize]
        public async Task<ActionResult<Post>> Create([FromForm] PostDto postDto, IFormFile image)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            string? fileName = null;
            if (image != null && image.Length > 0)
            {
                var storagePath = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot","PrivateStorage", "Posts");
                if (!Directory.Exists(storagePath)) Directory.CreateDirectory(storagePath);

                var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
                fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(storagePath, fileName);

                await using var stream = new FileStream(filePath, FileMode.CreateNew);
                await image.CopyToAsync(stream);
                Console.WriteLine(filePath);
            }

            var createdPost = await _postService.CreateAsync(
                new Post
                {
                    Title = postDto.Title,
                    ContentURL = postDto.Content,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    ImageURL = fileName // Save the GUID filename to your database
                },
                postDto.TagIds
            );

            return CreatedAtAction(nameof(GetById), new { id = createdPost.Id }, createdPost);
        }

        // PUT: api/Post/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Post>> Update(int id, [FromBody] PostDto postDto)
        {
            var updatedPost = await _postService.UpdateAsync(
                id,
                new Post
                {
                    Title = postDto.Title,
                    ContentURL = postDto.Content
                },
                postDto.TagIds
            );

            if (updatedPost == null) return NotFound();
            return Ok(updatedPost);
        }

        // DELETE: api/Post/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _postService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}