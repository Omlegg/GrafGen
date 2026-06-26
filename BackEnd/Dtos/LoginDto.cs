using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Dtos
{
    public class LoginDto
    {
         public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}