using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackEnd.Models;

namespace BackEnd.Services
{
    public interface ITagService
    {
          Task<IEnumerable<Tag>> GetAllAsync();
        Task<Tag?> GetByIdAsync(int id);
        Task<Tag> CreateAsync(Tag tag);
        Task<Tag?> UpdateAsync(int id, Tag updatedTag);
        Task<bool> DeleteAsync(int id);
    
    }
}