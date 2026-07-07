using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Dtos
{
    public class PostDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<int>? TagIds { get; set; } = new();
        public string UserId { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }
}