using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BCP.CVT.WebPortalClient.Models
{
    public class MenuMantenimientoDTO
    {
        public string GrupoMenu { get; set; }
        public string SubgrupoMenu { get; set; }
        public string Menu { get; set; }
        public string LinkMenu { get; set; }
        public int? OrdenMenu { get; set; }
        public string Icono { get; set; }
    }
}