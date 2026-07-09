using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Models
{
    public class Post
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string ContentURL { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserId { get; set; }
        public User User { get; set; }
        public List<PostTag> PostTags { get; set; } = new List<PostTag>();
        public string? ImageURL { get; set; }
    }
}