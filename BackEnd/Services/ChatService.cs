using BackEnd.Data;
using BackEnd.Dtos;
using BackEnd.Models;
using BackEnd.Services.Base;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Services;

public class ChatService : IChatService
{
    private readonly GrafGenDb _context;

    public ChatService(GrafGenDb context)
    {
        _context = context;
    }

    public async Task SaveMessageAsync(MessageDto dto)
    {
        var message = new Message
        {
            SenderId = dto.SenderId,
            ReceiverId = dto.ReceiverId,
            Content = dto.Content,
            SentAt = dto.SentAt
        };

        _context.Messages.Add(message);

        await _context.SaveChangesAsync();
    }

    public async Task<List<MessageDto>> GetMessagesAsync(
        string currentUserId,
        string otherUserId)
    {
        return await _context.Messages

            .Where(m =>
                (m.SenderId == currentUserId &&
                 m.ReceiverId == otherUserId)

                ||

                (m.SenderId == otherUserId &&
                 m.ReceiverId == currentUserId))

            .OrderBy(m => m.SentAt)

            .Select(m => new MessageDto
            {
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                SentAt = m.SentAt
            })

            .ToListAsync();
    }

    public async Task<List<UserDto>> GetConversationsAsync(string currentUserId)
    {
        var userIds = await _context.Messages

            .Where(m =>
                m.SenderId == currentUserId ||
                m.ReceiverId == currentUserId)

            .Select(m =>
                m.SenderId == currentUserId
                    ? m.ReceiverId
                    : m.SenderId)

            .Distinct()

            .ToListAsync();

        return await _context.Users

            .Where(u => userIds.Contains(u.Id))

            .Select(u => new UserDto
            {
                Id = u.Id,
                UserName = u.UserName!,
                ProfilePictureUrl = u.ProfilePictureUrl
            })

            .ToListAsync();
    }
}