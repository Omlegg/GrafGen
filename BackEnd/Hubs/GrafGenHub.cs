using BackEnd.Dtos;
using BackEnd.Services.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BackEnd.Hubs;

[Authorize]
public class GrafGenHub : Hub
{
    private readonly IChatService _chatService;

    public GrafGenHub(IChatService chatService)
    {
        _chatService = chatService;
    }

    private static string CreateRoom(string user1, string user2)
    {
        return string.CompareOrdinal(user1, user2) < 0
            ? $"{user1}_{user2}"
            : $"{user2}_{user1}";
    }

    public async Task JoinChat(string otherUserId)
    {
        var currentUserId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var room = CreateRoom(currentUserId, otherUserId);

        await Groups.AddToGroupAsync(Context.ConnectionId, room);

        var history = await _chatService.GetMessagesAsync(currentUserId, otherUserId);

        await Clients.Caller.SendAsync("LoadHistory", history);
    }

    public async Task SendMessage(MessageDto message)
    {
        var room = CreateRoom(message.SenderId, message.ReceiverId);

        message.SentAt = DateTime.UtcNow;

        await _chatService.SaveMessageAsync(message);

        await Clients.Group(room)
            .SendAsync("ReceiveMessage", message);
    }

    public async Task LeaveChat(string otherUserId)
    {
        var currentUserId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var room = CreateRoom(currentUserId, otherUserId);

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, room);
    }
}