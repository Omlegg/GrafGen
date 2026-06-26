using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackEnd.Dtos;
using BackEnd.Models;
using BackEnd.Services;
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
        public async Task<ActionResult<Post>> Create([FromBody] PostDto postDto)
        {
            var createdPost = await _postService.CreateAsync(
                new Post
                {
                    Title = postDto.Title,
                    ContentURL = postDto.Content,
                    UserId = postDto.UserId,
                    CreatedAt = DateTime.UtcNow
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