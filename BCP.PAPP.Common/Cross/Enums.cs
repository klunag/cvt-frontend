using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.PAPP.Common.Cross
{
    public static class ConstantsPortfolio
    {
        public const string TipoImplementacion = "Tipo de implementacion";
        public const string ModeloEntrega = "Modelo de entrega";
        public const string TipoDesarrollo = "Tipo de desarrollo";
        public const string Infraestructura = "Infraestructura de la aplicación";
        public const string TipoActivo = "Tipo de activo de informacion";
        public const string MetodoAutenticacion = "Método de autenticación";
        public const string MetodoAutorizacion = "Método de autorización";
        public const string CategoriaTecnologia = "Categoria tecnologica";
        public const string ClasificacionTecnica = "Clasificacion tecnica";

        public const string EntidadesUsuarias = "Entidades usuarias";
    }


    public enum TipoAsignacionMDR
    {
        [Description("Creacion de Rol")]
        CreacionRol = 1,
        [Description("Asignacion de Funcion Owner")]
        AsignacionFuncionOwmer = 2,
        [Description("Asignacion de Funcion Seguridad")]
        AsignacionFuncionSeguridad = 3
  
    }
    public enum EstadoSolicitudMDR
    {
        [Description("Pendiente")]
        Pendiente = 1,
        [Description("Aprobado Owner")]
        AprobadoOwner = 2,
        [Description("Aprobado Seguridad")]
        AprobadoSeguridad = 3,
        [Description("Rechazado Owner")]
        RechazadoOwner = 4,
        [Description("Rechazado Seguridad")]
        RechazadoSeguridad = 5,
        [Description("Eliminado")]
        Eliminado = 6,
        [Description("Atendido")]
        Atendido = 7
    }
    public enum InfraestructurasSeleccionadas
    {
        [Description("CLOUD PAAS")]
        CloudPAAS = 185,
        [Description("CLOUD IASS")]
        CloudIASS = 190
    }
    public enum TipoCodigoReservado
    {
        [Description("Código de Aplicación")]
        CodigoApp = 1,
        [Description("Código de Interfaz")]
        CodigoInterfaz = 2
    }
    public enum TippRegistroDato
    {
        [Description("Obligatorio")]
        Obligatorio = 1,
        [Description("Opcional")]
        Opcional = 2
    }
    public enum NivelConfiabilidad
    {
        [Description("Alto")]
        Alto = 1,
        [Description("Medio")]
        Medio = 2,
        [Description("Bajo")]
        Bajo = 3,
        [Description("Ninguno")]
        Ninguno = -1
    }

    public enum ModoLlenado
    {
        [Description("Automático")]
        Automatico = 1,
        [Description("Manual")]
        Manual = 2,
        [Description("Manual - Automático")]
        ManualAutomatico = 3
    }
    public enum ActivoAplica
    {
        [Description("Para Todas")]
        ParaTodas = 1,
        [Description("Solo APP IT")]
        SoloAPPIT = 2,
        [Description("Solo User IT")]
        SoloUserIT = 3
    }

    public enum EstadoReactivacion
    {
        [Description("Aplicación Reactivada")]
        AplicaciónReactivada = 1,
        [Description("Aplicación en Proceso de Reactivacion")]
        AplicaciónProcesoReactivacion = 2
    }
    public enum TipoEliminacion
    {
        [Description("Eliminación Administrativa")]
        EliminacionAdministrativa = 1,
        [Description("Pasó por proceso de eliminación")]
        PasoProcesoEliminacion = 2
    }
    public enum TipoConsulta
    {
        [Description("Consulta general")]
        ConsultaGeneral = 1,
        [Description("Consulta de roles de una aplicación")]
        ConsultaRolesAplicacion = 2,
        [Description("Consulta sobre el proceso")]
        ConsultaProceso = 3,
        [Description("Consulta por información histórica")]
        ConsultaInformacionHistorica = 4,
        [Description("Comentarios")]
        Comentarios = 5
    }
    public enum ApplicationState
    {
        [Description("Error")]
        Error = 0,
        [Description("En Desarrollo")]
        EnDesarrollo = 1,
        [Description("Vigente")]
        Vigente = 2,
        [Description("No Vigente")]
        NoVigente = 3,
        [Description("Eliminada")]
        Eliminada = 4
    }

    public enum EstadoConsulta
    {
        [Description("Respondida")]
        Respondida = 1,
        [Description("Sin Responder")]
        SinResponder = 2
    }


    public enum FileType
    {
        [Description("Desestimado")]
        ArchivoDesestimacion = 1,
        [Description("Seguridad")]
        ArchivoSeguridad = 2,
        [Description("SeguridadTemporal")]
        ArchivoSeguridadTemporal = 3
    }


    public enum ApplicationSituationRegister
    {
        [Description("Registro parcial")]
        RegistroParcial = 1,
        [Description("Registro completo")]
        RegistroCompleto = 2
    }

    public enum ClaseSolicitud
    {
        [Description("Registro")]
        Registro = 1,
        [Description("Modificación")]
        Modificacion = 2
    }
    public enum TipoSolicitud
    {
        [Description("No Vigente")]
        NoVigente = 1,
        [Description("Regreso de No Vigente")]
        RegresoNoVigente = 2,
        [Description("Eliminacion")]
        Eliminacion = 3,
        [Description("Modificacion")]
        Modificacion = 4,
        [Description("RevertirEliminacion")]
        RevertirEliminacion = 5
    }

    public enum EstadoSolicitud
    {
        [Description("Aprobada")]
        Aprobada = 1,
        [Description("Pendiente por el portafolio")]
        Pendiente = 2,
        [Description("Rechazada")]
        Rechazada = 3,
        [Description("Pendiente por el custodio")]
        PendienteCustodio = 4,
        [Description("Desestimada")]
        Desestimada = 5,
        [Description("Observada")]
        Observada =6
    }

    public enum ApplicationManagerRole
    {
        [Description("Tribe Technical Lead")]
        TTL =1,
        [Description("Jefe de Equipo")]
        JefeDeEquipo = 2,
        [Description("Bróker de Sistemas")]
        Broker = 3,
        [Description("Owner/Líder Usuario")]
        Owner = 4,
        [Description("Usuario Autorizador")]
        UsuarioAutorizador = 5,
        [Description("Experto/Especialista/Lider Técnico")]
        Experto = 6,
        [Description("Tribe Lead")]
        TL = 7,
        [Description("Analista de Riesgo")]
        AnalistaRiesgo = 8,
        [Description("Solicitante")]
        Solicitante = 9,
        [Description("Gobierno User IT")]
        GobiernoUserIT = 10,
        [Description("Arquitecto evaluador")]
        ArquitectoEvaluador = 11,
        [Description("Arquitecto de Tecnología")]
        ArquitectoTI = 12,
        [Description("DevSecOps")]
        DevSecOps = 13,
        [Description("Administrador")]
        Administrador = 14,
        [Description("AIO")]
        AIO = 15,
        [Description("Administrador Portafolio")]
        AdministradorPortafolio = 16
    }

    public enum Flow
    {
        [Description("Registro de aplicación")]
        Registro = 1,
        [Description("Actualización de aplicación")]
        Modificacion = 2,
        [Description("Eliminación de aplicación")]
        Eliminacion = 3
    }

    public enum ActionManager
    {
        Aprobar = 1,
        Rechazar = 2,
        Transferir = 3,
        Observar = 4
    }

    public enum NotificationFlow
    {
        M1RegistroAplicacion = 1,
        M1CompletarRegistroAplicacion = 2,
        M1NotificacionRegistroAplicaciónCustodioInformacion = 3,
        M2AprobacionArquitectoEvaluador = 4,
        M2RechazoArquitectoEvaluador = 5,
        M2TransferenciaArquitectoEvaluador = 6,
        M2AprobacionGobiernoUserIT = 7,
        M2RechazoGobiernoUserIT = 8,
        M2AprobacionArquitectoTecnologia = 9,
        M2RechazoArquitectoTecnologia = 10,
        M2ConfirmacionRegistroDevsecops = 11,
        M2ConfirmacionRegistroAIO = 12,
        M2AprobacionLiderUsuario = 13,
        M2RechazoLiderUsuario = 14,
        M2AprobacionJefeEquipo = 15,
        M2TransferenciaJefeEquipo = 16,
        M2RechazoJefeEquipo = 17,
        M2AprobacionTTL = 18,
        M2TransferenciaTTL = 19,
        M2RechazoTTL = 20,
        M2AplicacionSituaciónRegistroCompleto = 21,
        M2AprobacionPortafolio = 22,
        M2RechazoPortafolio = 23,
        M2AsignacionOwner = 24,
        M2AsignacionJefeEquipo = 25,
        M2AsignacionTTL = 26,
        M2AsignacionNuevoArquitectoEvaluador = 27,
        M2AsignacionNuevoJefeEquipo = 28,
        M2AsignacionNuevoTTL = 29,
        M2ModificacionModeloEntrega = 30,
        ActualizacionAIO = 32,
        M3ARO = 36,
        M3CriticidadFinal = 37,
        M2AsignacionUsuarioAutorizador = 38,
        RecurrenteSolicitantes = 39,
        RecurrenteAprobadores = 40,
        M2ObservacionAdministradorSolicitante = 41,
        RecurrenteAdministradores = 42,
        ActualizacionArquitectoEvaluador = 43,
        ActualizacionTransferenciaArquitectoEvaluador = 44,
        ActualizacionAsignacionNuevoArquitectoEvaluador = 45,
        ActualizacionRechazoArquitectoEvaluador = 46,
        ActualizacionArquitectoTecnologia = 47,
        ActualizacionAsignacionUsuarioAutorizador = 48,
        ActualizacionCreaciónSolicitudModificación = 49,
        ActualizacionActualizacionDatosNoRequeridosAprobacion = 50,
        ActualizacionAprobacionSolicitudModificacionPortafolio = 51,
        ActualizacionRechazoSolicitudModificacionPortafolio = 52,
        ActualizacionAsignacionSolicitudModificacionDevSecOps = 53,
        ActualizacionAprobacionSolicitudModificacionDevSecOps = 54,
        ActualizacionRechazoSolicitudModificacionDevSecOps = 55,
        ActualizacionModificacionSquad = 56,
        ActualizacionAsignacionSolicitudModificacionEquipo = 57,
        ActualizacionAprobacionSolicitudModificacionEquipo = 58,
        ActualizacionRechazoSolicitudModificacionEquipo = 59,
        ActualizacionAsignacionSolicitudModificacionOwner = 60,
        ActualizacionAprobacionSolicitudModificacionOwner = 61,
        ActualizacionRechazoSolicitudModificacionOwner = 62,
        ActualizacionModificaciónEquipoOriginal = 63,
        ActualizacionModificaciónEquipoDestino = 64,
        ActualizacionAprobacionSolicitudModificacionSquad = 65,
        ActualizacionRechazoSolicitudModificacionSquad = 66,
        EliminacionCreacionSolicitud= 67,
        EliminacionAprobacionSolicitud = 68,
        EliminacionRechazoSolicitud = 69,
        EnvioConsulta = 70,
        RespuestaConsulta = 71,
        ActualizacionPorGobiernoUserIT = 72,
        ActualizacionUsuariosAutorizadores = 73,
        ActualizacionEstadoParaGobiernoUserIT = 74,
        ActualizacionGestionadoPor = 75,
        ActualizacionConfirmacionCamposGobiernoUserIT = 76,
        ActualizacionRechazoCamposGobiernoUserIT = 77,
        DesestimacionSolicitante = 78,
        ReversionAplicacionNoVigente = 79,
        ConformidadActualizacionApp = 80,
        ActualizacionCamposPortafolio = 81,
        AprobacionSsolicitudEliminaciónCustodios = 82,
        RechazoSolicitudEliminaciónCustodios = 83,
        ObservaciónSolicitudEliminación = 84,
        ReenvíoSolicitudEliminacion = 85,
        ActualizacionResponsableAplicacion = 86,
        ReversiónEliminaciónSolicitud = 87,
        AprobacionReversiónEliminaciónSolicitud = 88,
        RechazoReversiónEliminaciónSolicitud = 89,
        DesestimacionEliminacion = 90,
        Reactivacion = 91,
        CustodiosReactivacion = 92,
        DesestimacionEliminacionSolicitante = 93,
        RecurrenteOwnersEliminacionPendientes = 94,
        RecurrentePortafolioEliminacionPendientes = 95,
        RecurrentePortafolioReactivacionPendientes = 96,
        RecurrenteSolicitanteEliminacionPendientes = 97,
        RecurrenteSolicitanteReactivacionPendientes = 98,
        ModificacionConsultasPortafolio = 99,
        EliminacionConsultasPortafolio =100,
        RegistroAplicacionGrupoRemedy = 101,
        RegistroParcialAplicacion = 102,
        ObservacionArquitectoEvaluador = 103,
        ActualizacionObservaciónArquitectoEvaluador = 104,
        ObservacionArquitectoTecnologia= 105,
        ActualizacionObervacionArquitectoTecnologia = 106,
        ObservacionDevSecOps = 107,
        ActualizacionObervacionDevSecOps = 108,
        ObservacionJefeEquipo=109,
        ActualizacionObervacionJefeEquipo = 110,
        ObservacionTTL = 111,
        ActualizacionObervacionTTL = 112,
        ObservacionLiderUsuario = 113,
        ActualizacionObervacionLiderUsuario = 114,
        ObservacionUserIT = 115,
        ActualizacionObervacionUserIT = 117,
        ObservacionSolicitudEliminaciónCustodios = 118,
        RecurrenteQualysEquiposNoEncontradosTecnologiasInstaladasNoRegistradas = 119,
    }

    public enum BIA
    {
        [Description("Muy Alta")]
        MuyAlta = 4,
        [Description("Alta")]
        Alta = 3,
        [Description("Media")]
        Media = 2,
        [Description("Baja")]
        Baja = 1
    }

    public enum ClasificacionActivos
    {
        [Description("Restringido")]
        Restringido = 1,
        [Description("Uso Interno")]
        UsoInterno = 2,
        [Description("Público")]
        Publico = 3
    }

    public enum CriticidadFinal
    {
        [Description("Muy Alta")]
        MuyAlta = 4,
        [Description("Alta")]
        Alta = 3,
        [Description("Media")]
        Media = 2,
        [Description("Baja")]
        Baja = 1
    }

    public enum Campos
    {
        CodigoAPT = 1,
        NombreAplicacion = 2,
        Descripcion = 3,
        TipoImplementacion = 4,
        GestionadoPor = 5,
        ModeloEntrega = 6,
        CódigoAPTPadre = 7,
        EstadoAplicacion = 8,
        CodigoInterfaz = 9,
        FechaRegistro = 10,
        UnidadUsuaria = 11,
        NombreEquipo = 12,
        Experto = 13,
        EntidadesUsuarias = 14,
        TipoDesarrollo = 15,
        ProveedorDesarrollo = 16,
        InfraestructuraAplicacion = 17,
        CodAppReemplazo = 18,
        ArquitectoNegocio = 19,
        TipoActivoInformacion = 20,
        AreaBIAN = 21,
        DominioBIAN = 22,
        JefaturaATI = 23,
        CategoriaTecnologica = 24,
        ClasificacionTecnica = 25,
        SubClasificacionTecnica = 26,
        Gestor = 27,
        GerenciaCentral = 28,
        Division = 29,
        Area = 30,
        BrokerSistemas = 31,
        TribeLead = 32,
        TribeTechnicalLead = 33,
        JefeEquipo = 34,
        LiderUsuario = 35,
        GrupoTicketRemedy = 36,
        URLCertificadosDigitales = 37,
        FechaPrimerPase = 38,
        ProductoRepresentativo = 39,
        MenorRTO = 40,
        MayorGradoInterrupción = 41,
        CriticidadAppBIA = 42,
        ClasificacionActivo = 43,
        NuevaCriticidadFinal = 44,
        TOBE = 45,
        TIERPreProduccion = 46,
        TIERProduccion = 47,
        SituacionRegistro = 48,
        FlagPirata = 49,
        FechaFlagPirata = 50,
        MetodoAutenticacion = 51,
        MétodoAutorizacion = 52,
        ResumenEstandares = 53,
        NivelCumplimientoSeguridad = 54,
        ArchivoAdjuntoSeguridad = 55
    }
}
