using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Models
{
    public class Comments
    {
        public int Id { get; set; }
        public string Content { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
        public int PostId { get; set; }
        public Post Post { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int LikeCount { get; set; } = 0;


    }
}