using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace BackEnd.Models
{
    public class User : IdentityUser
    {
        public List<Post> Posts { get; set; } = new List<Post>();
        public List<RefreshToken> RefreshTokens { get; set; } = new();
    }
}