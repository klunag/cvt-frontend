using BCP.CVT.Cross;
using BCP.CVT.DTO.Custom;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.DTO
{
    public class EquipoDTO : BaseDTO
    {
        public int EquipoId { get; set; }
        public int ProcedenciaId { get; set; }
        public int TablaProcedenciaId { get; set; }
        public int? TipoEquipoId { get; set; }
        public int? AmbienteId { get; set; }
        public bool? FlagTemporal { get; set; }
        public bool? FlagServidorServicio { get; set; }
        public EquipoTecnologiaDTO EquipoTecnologia { get; set; }
        public EquipoSoftwareBaseDTO EquipoSoftwareBase { get; set; }

        //Indicadores
        public int EstadoActual { get; set; }
        public int EstadoIndicador1 { get; set; }
        public int EstadoIndicador2 { get; set; }

        public bool? FlagCambioDominioRed { get; set; }

        public DateTime? FechaCambioEstado { get; set; }
        public string UsuarioCambioEstado { get; set; }

        public DateTime? FechaCambioDominioRed { get; set; }
        public string UsuarioCambioDominioRed { get; set; }

        public string FechaCambioEstadoStr => FechaCambioEstado.HasValue ? FechaCambioEstado.Value.ToString("dd/MM/yyyy") : string.Empty;
        public string FechaCambioDominioRedStr => FechaCambioDominioRed.HasValue ? FechaCambioDominioRed.Value.ToString("dd/MM/yyyy") : string.Empty;

        public string Ubicacion { get; set; }
        public int DescubrimientoId { get; set; }
        public string Suscripcion { get; set; }
        public string GrupoRecursos { get; set; }

        public string SuscripcionStr => !string.IsNullOrEmpty(Suscripcion) ? Suscripcion : string.Empty;
        public string GrupoRecursosStr => !string.IsNullOrEmpty(GrupoRecursos) ? GrupoRecursos : string.Empty;

        public string Nombre { get; set; }
        public string TipoEquipo { get; set; }
        //public string TemporalToString => FlagTemporal.HasValue ? (FlagTemporal.Value ? Utilitarios.GetEnumDescription2((EDescubrimiento)DescubrimientoId) : "Descubrimiento automático - Remedy") : "Descubrimiento automático - Remedy";
        public string TemporalToString
        {
            get
            {
                var strDescubrimiento = string.Empty;
                if (FlagTemporal.HasValue)
                {
                    if (FlagTemporal.Value)
                    {
                        strDescubrimiento = !string.IsNullOrEmpty(Ubicacion) ?
                            Utilitarios.GetEnumDescription2(EDescubrimiento.Remedy) : Utilitarios.GetEnumDescription2(EDescubrimiento.Manual);
                    }
                    else
                    {
                        strDescubrimiento = Utilitarios.GetEnumDescription2(EDescubrimiento.Automaticamente);
                    }
                }
                else
                {
                    strDescubrimiento = Utilitarios.GetEnumDescription2(EDescubrimiento.Automaticamente);
                }

                return strDescubrimiento;
            }
        }

        public string TemporalDescripcion
        {
            get
            {
                return FlagTemporal.HasValue ? (FlagTemporal.Value ? "Carga manual" : "Descubrimiento automático") : "Descubrimiento automático";
            }
        }

        public DateTime? FechaUltimoEscaneoCorrecto { get; set; }
        public DateTime? FechaUltimoEscaneoError { get; set; }

        public string FechaUltimoEscaneoCorrectoStr /*=> FechaUltimoEscaneoCorrecto.HasValue ? FechaUltimoEscaneoCorrecto.Value.ToString("dd/MM/yyyy") : "-";*/
        {
            get; set;
        }

        public string FechaUltimoEscaneoErrorStr /*=> FechaUltimoEscaneoError.HasValue ? FechaUltimoEscaneoError.Value.ToString("dd/MM/yyyy") : "-";*/
        {
            get; set;
        }

        public string Ambiente { get; set; }
        public string SistemaOperativo { get; set; }
        public int AplicacionesRelacionadas { get; set; }
        public int TecnologiasInstaladas { get; set; }

        public bool? FlagExcluirCalculo { get; set; }
        public string FlagExcluirCalculoStr => FlagExcluirCalculo.HasValue ? (FlagExcluirCalculo.Value ? "Si" : "No") : "-";

        public string IP { get; set; }
        public string Dominio { get; set; }
        public int CaracteristicaEquipo { get; set; }
        public string CaracteristicaEquipoToString
        {
            get
            {
                if (CaracteristicaEquipo == 0)
                    return string.Empty;
                else
                    return Utilitarios.GetEnumDescription2((ECaracteristicaEquipo)CaracteristicaEquipo);
            }
        }
        public AmbienteDTO AmbienteDTO { get; set; }
        public long RelacionId { get; set; }
        public bool FlagObsoleto { get; set; }
        public EquipoConfiguracionDTO EquipoConfiguracionDTO { get; set; }
        public DominioServidorDTO DominioServidorDTO { get; set; }

        public string Model { get; set; }
        public string Subsidiaria { get; set; }
        public int? DominioServidorId { get; set; }

        public int TipoExclusionId { get; set; }
        public int TecnologiaId { get; set; }
        public string MotivoExclusion { get; set; }
        public int EstadoRelacionId { get; set; }
        public string EstadoRelacionToString
        {
            get
            {
                return Utilitarios.GetEnumDescription2((EEstadoRelacion)EstadoRelacionId);
            }
        }
        public string MemoriaRam { get; set; }
        public List<EquipoProcesadoresDto> Procesadores { get; set; }
        public List<EquipoEspacioDiscoDto> Discos { get; set; }


        public string ClaveTecnologia { get; set; }
        public int TotalFilas { get; set; }

        public StorageEquipoDto Storage { get; set; }
        public string Modelo { get; set; }
        public string CodigoEquipo { get; set; }
        public string NumeroSerie { get; set; }
        public int CantidadVulnerabilidades { get; set; }
        public DateTime? FechaFinSoporte { get; set; }
        public string FechaFinSoporteToString
        {
            get
            {
                if (FechaFinSoporte.HasValue)                
                    return FechaFinSoporte.Value.ToString("dd/MM/yyyy");                
                else
                    return string.Empty;
            }
        }

        public string Owner { get; set; }

        public string OwnerContacto { get; set; }
    }
    #region EquipoConfiguración
    public class EquipoConfiguracionDTO
    {
        public string Componente { get; set; }
        public string DetalleComponente { get; set; }
    }
    #endregion

    #region Procesadores
    public class EquipoProcesadoresDto
    {
        public string Fabricante { get; set; }
        public string Descripcion { get; set; }
    }
    #endregion

    public class EquipoEspacioDiscoDto
    {
        public string Nombre { get; set; }
        public string FileSystemType { get; set; }
        public string FileSystemSizeGB { get; set; }
        public string AvailableSpaceGB { get; set; }
    }

}
