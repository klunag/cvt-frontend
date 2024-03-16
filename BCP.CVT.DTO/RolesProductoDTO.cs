using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.DTO
{
	public class RolesProductoDTO : BaseDTO
	{

        public int? ProductoId { get; set; }
        public string Rol { get; set; }
        public string GrupoRed { get; set; }

        public string ProductoNombre { get; set; }

        public int? RolesProductoId { get; set; }

        public int? FuncionesRelacionadas { get; set; }

        public string Descripcion { get; set; }

        public string Producto { get; set; }

        public int IdRolesProducto { get; set; }

    }
}
