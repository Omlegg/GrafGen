using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Dtos
{
    public class RefreshTokeDto
    {
        [Required]
        public string RefreshToken { get; set; } = null!;
    }
}