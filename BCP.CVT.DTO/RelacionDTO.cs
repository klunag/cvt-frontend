using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.DTO
{
    public class RelacionDTO : BaseDTO
    {
        public long RelacionId { get; set; }
        public string CodigoAPT { get; set; }
        public int TipoId { get; set; }

        public int ApplicationId { get; set; }
        public int? AmbienteId { get; set; }
        public int? EquipoId { get; set; }
        public int EstadoId { get; set; }
        public string Observacion { get; set; }
        public int TecnologiaId { get; set; }
        public string Tecnologia { get; set; }

        public string ListaPCI { get; set; }

        public string AplicacionStr { get; set; }

        public string EquipoTecnologiaStr { get; set; }


        public List<int> TecnologiaIdsEliminar { get; set; }

        public List<RelacionDetalleDTO> ListRelacionDetalle { get; set; }

        public string TipoStr
        {
            get
            {
                return TipoId == 0 ? null : Utilitarios.GetEnumDescription2((ETipoRelacion)(TipoId));
            }
        }

        public string AmbienteStr { get; set; }

        public string EstadoStr
        {
            get
            {
                return Utilitarios.GetEnumDescription2((EEstadoRelacion)(this.EstadoId));
            }
        }

        public int RelevanciaId { get; set; }

        public string RelevanciaStr
        {
            get
            {
                return RelevanciaId == 0 ? "" : Utilitarios.GetEnumDescription2((ERelevancia)(RelevanciaId));
            }
        }

        public string EquipoStr { get; set; }
        public string Componente { get; set; }
        public int TotalFilas { get; set; }
        public string Aprobar { get; set; }
        //public string CodigoAPTVinculo { get; set; }
        //public string DetalleVinculo { get; set; }

        public bool? FlagRelacionAplicacion { get; set; }
        public string Suscripcion { get; set; }
        public string Funcion { get; set; }
        public int TipoEquipoId { get; set; }
        public bool FlagRemoveEquipo { get; set; }
    }
}
