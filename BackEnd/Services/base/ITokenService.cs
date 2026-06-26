using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackEnd.Models;
using Microsoft.AspNetCore.Identity;

namespace BackEnd.Services
{
    public interface ITokenService
    {
        string CreateAccessToken(User user);
        RefreshToken CreateRefreshToken();
        Task AddRefreshToken(User user, RefreshToken refreshToken);
    }
}