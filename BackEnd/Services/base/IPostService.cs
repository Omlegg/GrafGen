using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackEnd.Models;

namespace BackEnd.Services
{
    public interface IPostService
    {
         Task<IEnumerable<Post>> GetAllAsync();
        Task<Post?> GetByIdAsync(int id);
        Task<Post> CreateAsync(Post post, IEnumerable<int> tagIds);
        Task<Post?> UpdateAsync(int id, Post updatedPost, IEnumerable<int> tagIds);
        Task<bool> DeleteAsync(int id);
    
    }
}