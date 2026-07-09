using BackEnd.Dtos;

namespace BackEnd.Services.Base;

public interface IChatService
{
    Task SaveMessageAsync(MessageDto message);

    Task<List<MessageDto>> GetMessagesAsync(
        string currentUserId,
        string otherUserId);

    Task<List<UserDto>> GetConversationsAsync(string currentUserId);
}