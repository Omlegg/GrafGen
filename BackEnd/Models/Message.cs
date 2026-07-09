namespace BackEnd.Models;
public class Message
{
    public int Id { get; set; }

    public string SenderId { get; set; } = string.Empty;

    public User Sender { get; set; } = null!;

    public string ReceiverId { get; set; } = string.Empty;

    public User Receiver { get; set; } = null!;

    public string Content { get; set; } = string.Empty;

    public DateTime SentAt { get; set; }
}