using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BCP.CVT.WebPortalClient.Models
{
    public class PermisoModulo
    {
        public bool Crear { set; get; }
        public bool Editar { set; get; }
        public bool Eliminar { set; get; }
        public bool Exportar { set; get; }
        public bool Aprobar { set; get; }
    }
}