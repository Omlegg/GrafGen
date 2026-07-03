using BackEnd.Models;

namespace BackEnd.Services;

public class TagService : ITagService
{
    public Task<Tag> CreateAsync(Tag tag)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(int id)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Tag>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public Task<Tag?> GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    public Task<Tag?> UpdateAsync(int id, Tag updatedTag)
    {
        throw new NotImplementedException();
    }
}