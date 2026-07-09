using BackEnd.Dtos;
using BackEnd.Hubs;
using BackEnd.Services.Base;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly IHubContext<GrafGenHub> _hub;

    public ChatController(
        IChatService chatService,
        IHubContext<GrafGenHub> hub)
    {
        _chatService = chatService;
        _hub = hub;
    }

    private static string CreateRoom(string user1, string user2)
    {
        return string.CompareOrdinal(user1, user2) < 0
            ? $"{user1}_{user2}"
            : $"{user2}_{user1}";
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var conversations = await _chatService.GetConversationsAsync(userId);

        return Ok(conversations);
    }

    [HttpGet("{otherUserId}")]
    public async Task<IActionResult> GetMessages(string otherUserId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var messages = await _chatService.GetMessagesAsync(currentUserId, otherUserId);

        return Ok(messages);
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] MessageDto dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        dto.SenderId = currentUserId;
        dto.SentAt = DateTime.UtcNow;

        await _chatService.SaveMessageAsync(dto);

        var room = CreateRoom(dto.SenderId, dto.ReceiverId);

        await _hub.Clients.Group(room)
            .SendAsync("ReceiveMessage", dto);

        return Ok(dto);
    }
}