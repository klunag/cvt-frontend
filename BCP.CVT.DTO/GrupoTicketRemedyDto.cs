﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.DTO
{
    public class GrupoTicketRemedyDto : BaseDTO
    {
        public int GrupoRemedyId { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }

        public bool FlagActivo { get; set; }


    }
}
