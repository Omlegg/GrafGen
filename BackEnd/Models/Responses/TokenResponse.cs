using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Models.Responses
{
    public class TokenResponse
    {
         public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }
}