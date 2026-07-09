using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackEnd.Data;
using BackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Services
{
    public class PostService : IPostService
    {
        private readonly GrafGenDb _context;

        public PostService(GrafGenDb context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Post>> GetAllAsync()
        {
            return await _context.Posts
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .ToListAsync();
        }

        public async Task<Post?> GetByIdAsync(int id)
        {
            return await _context.Posts
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Post>> GetNumberAsync()
        {
            return await _context.Posts
                .OrderBy(x => Guid.NewGuid()) 
                .Take(10)
                .ToListAsync();

        }

        public async Task<Post> CreateAsync(Post post, IEnumerable<int> tagIds)
        {
            // Attach selected tags
            var tags = await _context.Tags
                .Where(t => tagIds.Contains(t.Id))
                .ToListAsync();

            post.PostTags = tags.Select(tag => new PostTag
            {
                Post = post,
                Tag = tag
            }).ToList();

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<Post?> UpdateAsync(int id, Post updatedPost, IEnumerable<int> tagIds)
        {
            var existingPost = await _context.Posts
                .Include(p => p.PostTags)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingPost == null)
                return null;

            // Update basic fields
            existingPost.Title = updatedPost.Title;
            existingPost.ContentURL = updatedPost.ContentURL;

            // Update tags
            existingPost.PostTags.Clear();

            var tags = await _context.Tags
                .Where(t => tagIds.Contains(t.Id))
                .ToListAsync();

            existingPost.PostTags = tags.Select(tag => new PostTag
            {
                PostId = id,
                TagId = tag.Id
            }).ToList();

            await _context.SaveChangesAsync();
            return existingPost;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
                return false;

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}