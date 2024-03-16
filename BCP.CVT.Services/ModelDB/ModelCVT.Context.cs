﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace BCP.CVT.Services.ModelDB
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class GestionCMDB_ProdEntities : DbContext
    {
        public GestionCMDB_ProdEntities()
            : base("name=GestionCMDB_ProdEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<Notificacion> Notificacion { get; set; }
        public virtual DbSet<RelacionDetalle> RelacionDetalle { get; set; }
        public virtual DbSet<TipoNotificacion> TipoNotificacion { get; set; }
        public virtual DbSet<Alerta> Alerta { get; set; }
        public virtual DbSet<AlertaDetalle> AlertaDetalle { get; set; }
        public virtual DbSet<AlertaProgramacion> AlertaProgramacion { get; set; }
        public virtual DbSet<AplicacionExpertos> AplicacionExpertos { get; set; }
        public virtual DbSet<AplicacionVinculada> AplicacionVinculada { get; set; }
        public virtual DbSet<ArchivosCVT> ArchivosCVT { get; set; }
        public virtual DbSet<Arquetipo> Arquetipo { get; set; }
        public virtual DbSet<ArquetipoTecnologia> ArquetipoTecnologia { get; set; }
        public virtual DbSet<AutorizadorTecnologia> AutorizadorTecnologia { get; set; }
        public virtual DbSet<Cluster> Cluster { get; set; }
        public virtual DbSet<Entorno> Entorno { get; set; }
        public virtual DbSet<EquipoConfiguracion> EquipoConfiguracion { get; set; }
        public virtual DbSet<EquipoTecnologia> EquipoTecnologia { get; set; }
        public virtual DbSet<Excepcion> Excepcion { get; set; }
        public virtual DbSet<Familia> Familia { get; set; }
        public virtual DbSet<Parametro> Parametro { get; set; }
        public virtual DbSet<Proceso> Proceso { get; set; }
        public virtual DbSet<Relevancia> Relevancia { get; set; }
        public virtual DbSet<SubdominioEquivalencia> SubdominioEquivalencia { get; set; }
        public virtual DbSet<TablaProcedencia> TablaProcedencia { get; set; }
        public virtual DbSet<TecnologiaCicloVida> TecnologiaCicloVida { get; set; }
        public virtual DbSet<TecnologiaEquivalencia> TecnologiaEquivalencia { get; set; }
        public virtual DbSet<TecnologiaVinculada> TecnologiaVinculada { get; set; }
        public virtual DbSet<TipoAlerta> TipoAlerta { get; set; }
        public virtual DbSet<TipoArquetipo> TipoArquetipo { get; set; }
        public virtual DbSet<TipoEquipo> TipoEquipo { get; set; }
        public virtual DbSet<TipoExperto> TipoExperto { get; set; }
        public virtual DbSet<TipoParametro> TipoParametro { get; set; }
        public virtual DbSet<Ambiente> Ambiente { get; set; }
        public virtual DbSet<CodigoCIS> CodigoCIS { get; set; }
        public virtual DbSet<CodigoCIS_Servidor> CodigoCIS_Servidor { get; set; }
        public virtual DbSet<CodigoCIS_ServidorNoRegistrado> CodigoCIS_ServidorNoRegistrado { get; set; }
        public virtual DbSet<Criticidad> Criticidad { get; set; }
        public virtual DbSet<DominioServidor> DominioServidor { get; set; }
        public virtual DbSet<PeticionBigFix> PeticionBigFix { get; set; }
        public virtual DbSet<AplicacionConfiguracion> AplicacionConfiguracion { get; set; }
        public virtual DbSet<Servidor> Servidor { get; set; }
        public virtual DbSet<TecnologiaNoRegistrada> TecnologiaNoRegistrada { get; set; }
        public virtual DbSet<RoadMap> RoadMap { get; set; }
        public virtual DbSet<HistoricoExclusion> HistoricoExclusion { get; set; }
        public virtual DbSet<TipoExclusion> TipoExclusion { get; set; }
        public virtual DbSet<AuditoriaData> AuditoriaData { get; set; }
        public virtual DbSet<VisitaSite> VisitaSite { get; set; }
        public virtual DbSet<Mensaje> Mensaje { get; set; }
        public virtual DbSet<TipoMensaje> TipoMensaje { get; set; }
        public virtual DbSet<RolServidor> RolServidor { get; set; }
        public virtual DbSet<AplicacionPortafolioResponsables> AplicacionPortafolioResponsables { get; set; }
        public virtual DbSet<PortafolioResponsables> PortafolioResponsables { get; set; }
        public virtual DbSet<SolicitudComentarios> SolicitudComentarios { get; set; }
        public virtual DbSet<SolicitudCampoModificado> SolicitudCampoModificado { get; set; }
        public virtual DbSet<NotificacionResponsableAplicacion> NotificacionResponsableAplicacion { get; set; }
        public virtual DbSet<ParametroApp> ParametroApp { get; set; }
        public virtual DbSet<ModuloAplicacion> ModuloAplicacion { get; set; }
        public virtual DbSet<AplicacionDetalle> AplicacionDetalle { get; set; }
        public virtual DbSet<ConfiguracionColumnaModulo> ConfiguracionColumnaModulo { get; set; }
        public virtual DbSet<BaseUsuariosGrupo> BaseUsuariosGrupo { get; set; }
        public virtual DbSet<TablaProcedenciaAplicacion> TablaProcedenciaAplicacion { get; set; }
        public virtual DbSet<EquipoSoftwareBase> EquipoSoftwareBase { get; set; }
        public virtual DbSet<BaseUsuarios> BaseUsuarios { get; set; }
        public virtual DbSet<EquipoCicloVida> EquipoCicloVida { get; set; }
        public virtual DbSet<Parametrica> Parametrica { get; set; }
        public virtual DbSet<ParametricaDetalle> ParametricaDetalle { get; set; }
        public virtual DbSet<NotaAplicacion> NotaAplicacion { get; set; }
        public virtual DbSet<AuthAplicacion> AuthAplicacion { get; set; }
        public virtual DbSet<ConfiguracionColumnaAplicacion> ConfiguracionColumnaAplicacion { get; set; }
        public virtual DbSet<TipoActivoInformacion> TipoActivoInformacion { get; set; }
        public virtual DbSet<Aplicacion> Aplicacion { get; set; }
        public virtual DbSet<Tipo> Tipo { get; set; }
        public virtual DbSet<AuditoriaAPI> AuditoriaAPI { get; set; }
        public virtual DbSet<Area> Area { get; set; }
        public virtual DbSet<AreaBian> AreaBian { get; set; }
        public virtual DbSet<ArquitectoTI> ArquitectoTI { get; set; }
        public virtual DbSet<AuditoriaTipoActivo> AuditoriaTipoActivo { get; set; }
        public virtual DbSet<Bandeja> Bandeja { get; set; }
        public virtual DbSet<BandejaAprobacion> BandejaAprobacion { get; set; }
        public virtual DbSet<CuestionarioAplicacion> CuestionarioAplicacion { get; set; }
        public virtual DbSet<CuestionarioAplicacionDetalle> CuestionarioAplicacionDetalle { get; set; }
        public virtual DbSet<CuestionarioPae> CuestionarioPae { get; set; }
        public virtual DbSet<Division> Division { get; set; }
        public virtual DbSet<DominioBian> DominioBian { get; set; }
        public virtual DbSet<ErrorCargaMasiva> ErrorCargaMasiva { get; set; }
        public virtual DbSet<Estandar> Estandar { get; set; }
        public virtual DbSet<Gerencia> Gerencia { get; set; }
        public virtual DbSet<InfoCampoPortafolio> InfoCampoPortafolio { get; set; }
        public virtual DbSet<JefaturaAti> JefaturaAti { get; set; }
        public virtual DbSet<NuevoCampoPortafolio> NuevoCampoPortafolio { get; set; }
        public virtual DbSet<PlataformaBcp> PlataformaBcp { get; set; }
        public virtual DbSet<PreguntaPae> PreguntaPae { get; set; }
        public virtual DbSet<ProcesoVital> ProcesoVital { get; set; }
        public virtual DbSet<ServidorAplicacion> ServidorAplicacion { get; set; }
        public virtual DbSet<SolicitudAplicacion> SolicitudAplicacion { get; set; }
        public virtual DbSet<SolicitudAplicacionDetalle> SolicitudAplicacionDetalle { get; set; }
        public virtual DbSet<SolicitudAprobadores> SolicitudAprobadores { get; set; }
        public virtual DbSet<TipoNotificacionApp> TipoNotificacionApp { get; set; }
        public virtual DbSet<Unidad> Unidad { get; set; }
        public virtual DbSet<PortafolioBackup> PortafolioBackup { get; set; }
        public virtual DbSet<AzureResourceType> AzureResourceType { get; set; }
        public virtual DbSet<ApplicationManager> ApplicationManager { get; set; }
        public virtual DbSet<ApplicationManagerCatalog> ApplicationManagerCatalog { get; set; }
        public virtual DbSet<ApplicationFlowData> ApplicationFlowData { get; set; }
        public virtual DbSet<NotificacionApp> NotificacionApp { get; set; }
        public virtual DbSet<GestionadoPor> GestionadoPor { get; set; }
        public virtual DbSet<TeamSquad> TeamSquad { get; set; }
        public virtual DbSet<RolOndemand> RolOndemand { get; set; }
        public virtual DbSet<ClasificacionTecnica> ClasificacionTecnica { get; set; }
        public virtual DbSet<SubClasificacionTecnica> SubClasificacionTecnica { get; set; }
        public virtual DbSet<GrupoRemedy> GrupoRemedy { get; set; }
        public virtual DbSet<Relacion> Relacion { get; set; }
        public virtual DbSet<SolicitudArchivos> SolicitudArchivos { get; set; }
        public virtual DbSet<TribeLeader> TribeLeader { get; set; }
        public virtual DbSet<ComentarioEliminacionRelacion> ComentarioEliminacionRelacion { get; set; }
        public virtual DbSet<Broker> Broker { get; set; }
        public virtual DbSet<ApplicationHistorico> ApplicationHistorico { get; set; }
        public virtual DbSet<SolicitudCampos> SolicitudCampos { get; set; }
        public virtual DbSet<BitacoraAcciones> BitacoraAcciones { get; set; }
        public virtual DbSet<InitialApplication> InitialApplication { get; set; }
        public virtual DbSet<InitialApplicationManagerCatalog> InitialApplicationManagerCatalog { get; set; }
        public virtual DbSet<UrlAplicacion> UrlAplicacion { get; set; }
        public virtual DbSet<UrlAplicacionEquipo> UrlAplicacionEquipo { get; set; }
        public virtual DbSet<UrlFuente> UrlFuente { get; set; }
        public virtual DbSet<BCP_CATG_GH_UNIDADES> BCP_CATG_GH_UNIDADES { get; set; }
        public virtual DbSet<Motivo> Motivo { get; set; }
        public virtual DbSet<HistorialModificacion> HistorialModificacion { get; set; }
        public virtual DbSet<TecnologiaArquetipo> TecnologiaArquetipo { get; set; }
        public virtual DbSet<TecnologiaAplicacion> TecnologiaAplicacion { get; set; }
        public virtual DbSet<AplicacionCargaMasiva> AplicacionCargaMasiva { get; set; }
        public virtual DbSet<ApplicationCargaMasiva> ApplicationCargaMasiva { get; set; }
        public virtual DbSet<Application> Application { get; set; }
        public virtual DbSet<Consultas> Consultas { get; set; }
        public virtual DbSet<TecnologiaAutorizador> TecnologiaAutorizador { get; set; }
        public virtual DbSet<ApplicationFlow> ApplicationFlow { get; set; }
        public virtual DbSet<ApplicationFile> ApplicationFile { get; set; }
        public virtual DbSet<TipoCicloVida> TipoCicloVida { get; set; }
        public virtual DbSet<ProductoArquetipo> ProductoArquetipo { get; set; }
        public virtual DbSet<Solicitud> Solicitud { get; set; }
        public virtual DbSet<Guardicore> Guardicore { get; set; }
        public virtual DbSet<ApplicationPCI> ApplicationPCI { get; set; }
        public virtual DbSet<TipoPCI> TipoPCI { get; set; }
        public virtual DbSet<Equipo> Equipo { get; set; }
        public virtual DbSet<RolesProducto> RolesProducto { get; set; }
        public virtual DbSet<CodigoReservado> CodigoReservado { get; set; }
        public virtual DbSet<Tecnologia> Tecnologia { get; set; }
        public virtual DbSet<ChapterFuncionesRoles> ChapterFuncionesRoles { get; set; }
        public virtual DbSet<Subdominio> Subdominio { get; set; }
        public virtual DbSet<Dominio> Dominio { get; set; }
        public virtual DbSet<Producto> Producto { get; set; }
        public virtual DbSet<GuardicoreLabels> GuardicoreLabels { get; set; }
        public virtual DbSet<GuardicoreAssets> GuardicoreAssets { get; set; }
    
        public virtual ObjectResult<USP_ListarNombreServidores_Result> USP_ListarNombreServidores(string servidor)
        {
            var servidorParameter = servidor != null ?
                new ObjectParameter("servidor", servidor) :
                new ObjectParameter("servidor", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<USP_ListarNombreServidores_Result>("USP_ListarNombreServidores", servidorParameter);
        }
    
        public virtual ObjectResult<USP_Cmdb_ListarServidorByCodigoCIS_Result> USP_Cmdb_ListarServidorByCodigoCIS(Nullable<int> codigoCis)
        {
            var codigoCisParameter = codigoCis.HasValue ?
                new ObjectParameter("codigoCis", codigoCis) :
                new ObjectParameter("codigoCis", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<USP_Cmdb_ListarServidorByCodigoCIS_Result>("USP_Cmdb_ListarServidorByCodigoCIS", codigoCisParameter);
        }
    
        public virtual ObjectResult<USP_Cmdb_ListarDiscosServidores_Result> USP_Cmdb_ListarDiscosServidores(string nombre)
        {
            var nombreParameter = nombre != null ?
                new ObjectParameter("nombre", nombre) :
                new ObjectParameter("nombre", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<USP_Cmdb_ListarDiscosServidores_Result>("USP_Cmdb_ListarDiscosServidores", nombreParameter);
        }
    }
}
