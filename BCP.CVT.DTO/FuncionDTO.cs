﻿using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.DTO
{
    public class FuncionDTO : BaseDTO
    {
        public string Chapter { get; set; }
        public string Funcion { get; set; }
        public string ChapterFuncion { get; set; }
        public int ProductoRelacionados { get; set; }

        public int? ProductoId { get; set; }

        public int? RolesProductoId { get; set; }

        public string GrupoRed { get; set; }
        public string Rol { get; set; }

        public string Producto { get; set; }

        public string Nombre { get; set; }
        public string Matricula { get; set; }

        public string Email { get; set; }
        public string Tribu { get; set; }

        public string IdFuncion { get; set; }

        public string Persona { get; set; }

        public string Squad { get; set; }

    }
}
