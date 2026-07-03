using BackEnd.Dtos;
using BackEnd.Services.Base;
using Microsoft.AspNetCore.SignalR;

namespace BackEnd.Hubs;
public class GrafGenHub : Hub
{
    private readonly IChatService _service;
    public GrafGenHub(IChatService service)
    {
        _service = service;
    }

    public async Task JoinRoom(string room)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, room);

        var history = await _service.GetMessagesAsync(room);
        await Clients.Caller.SendAsync("LoadHistory", history);
    }

    public async Task SendMessage(MessageDto message)
    {
        await _service.SaveMessageAsync(message);

        await Clients.Group(message.Room)
            .SendAsync("ReceiveMessage", message);
        
        await Clients.AllExcept(Context.ConnectionId).SendAsync("RoomActivity", message.Room);
    }

    public async Task LeaveRoom(string room)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, room);

        var userName = Context.User?.Identity?.Name ?? "Unknown";
        await Clients.Group(room).SendAsync("SystemMessage", $"{userName} left the room.");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}