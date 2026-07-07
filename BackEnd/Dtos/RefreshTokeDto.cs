using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BackEnd.Models;

namespace BackEnd.Dtos
{
    public class RefreshTokeDto
    {
        [Required]
        public User User { get; set; }
        public string RefreshToken { get; set; } = null!;
    }
}