using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.DTO.Custom
{
    public class VistaRelacionDto
    {
        public string CodigoApt { get; set; }
        public string Aplicacion { get; set; }
        public string GestionadoPor { get; set; }
        public string DetalleCriticidad { get; set; }
        public string JefeEquipo { get; set; }
        public string Equipo { get; set; }
        public string DetalleAmbiente { get; set; }
        public string SistemaOperativo { get; set; }
        public int EstadoId { get; set; }

        public string ListaPCI { get; set; }

        public int ApplicationId { get; set; }
        public string EstadoRelacion
        {
            get
            {
                return Utilitarios.GetEnumDescription2((EEstadoRelacion)EstadoId);
            }
        }
        public string TipoActivoTI { get; set; }
        public int EquipoId { get; set; }        
    }
}
