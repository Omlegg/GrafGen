using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackEnd.Exceptions
{
    public class GrafGenException : Exception
    {
        string Message { get; set; }
        string Property { get; set; }

        public GrafGenException(string message,string property)
        {
            this.Message = message;
            this.Property = property;
        }
    }
}