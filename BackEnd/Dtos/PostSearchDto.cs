using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Dtos
{
    public class PostSearchDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<int>? TagIds { get; set; } = new();
        public string UserId { get; set; } = string.Empty;
        public string Image { get; set; }
        public string AuthorUserName { get; set; } // Flattened user data
        public DateTime CreatedAt { get; set; }
    }
}