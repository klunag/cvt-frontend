using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Configuracion")]
    public class ConfiguracionController : Base
    {
        public ActionResult Index()
        {

            return View();
        }


        // GET: Configuracion
        [Route("RolesProducto")]
        public ActionResult RolesProducto()
        {
            return View();
        }

        // GET: Configuracion
        [Route("RoadMap")]
        public ActionResult RoadMap()
        {
            return View();
        }

        // GET: Configuracion
        [Route("Parametro")]
        public ActionResult Parametro()
        {
            return View();
        }

        // GET: Configuracion
        [Route("Ambiente")]
        public ActionResult Ambiente()
        {
            return View();
        }
        [Route("Aplicacion")]
        public ActionResult Aplicacion()
        {
            return View();
        }

        [Route("Criticidad")]
        public ActionResult Criticidad()
        {
            return View();
        }

        [Route("DominioRed")]
        public ActionResult DominioRed()
        {
            return View();
        }

        [Route("Equipo")]
        public ActionResult Equipo()
        {
            return View();
        }
        [Route("Relevancia")]
        public ActionResult Relevancia()
        {
            return View();
        }

        [Route("TipoExclusion")]
        public ActionResult TipoExclusion()
        {
            return View();
        }

        [Route("EquipoExclusion")]
        public ActionResult EquipoExclusion()
        {
            return View();
        }

        [Route("Archivo")]
        public ActionResult Archivo()
        {
            return View();
        }

        [Route("HistoricoModificacion")]
        public ActionResult HistoricoModificacion()
        {
            return View();
        }

        [Route("VisitaSite")]
        public ActionResult VisitaSite()
        {
            return View();
        }

        [Route("EquiposDesactivados")]
        public ActionResult EquiposDesactivados()
        {
            return View();
        }

        [Route("GestionAplicacion")]
        public ActionResult GestionAplicacion()
        {
            return View();
        }

        [Route("BandejaAprobacionAplicacion")]
        public ActionResult BandejaAprobacionAplicacion()
        {
            return View();
        }

        //[Route("CatalogoAplicacion")]
        //public ActionResult CatalogoAplicacion(int? paginaActual = null, int? paginaTamanio = null)
        //{
        //    ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
        //    ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
        //    return View();
        //}        

        //[Route("NuevaAplicacion")]
        //public ActionResult NuevaAplicacion(int Id, int Vista, int? id_bandeja = null, int? paginaActual = null, int? paginaTamanio = null)
        //{
        //    ViewBag.AplicacionId = Id;
        //    ViewBag.VistaId = Vista;
        //    ViewBag.SubtituloVista = Utilitarios.GetEnumDescription2((EVistaGestionAplicacion)Vista);
        //    ViewBag.BandejaId = id_bandeja.HasValue ? id_bandeja.Value : 0;
        //    ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
        //    ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
        //    ViewBag.TipoSolicitudId = (int)ETipoSolicitudAplicacion.CreacionAplicacion;

        //    return View();
        //}

        [Route("ModificarAplicacion")]
        public ActionResult ModificarAplicacion(int Id, int Vista, int? id_bandeja = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            ViewBag.AplicacionId = Id;
            ViewBag.VistaId = Vista;
            ViewBag.SubtituloVista = Utilitarios.GetEnumDescription2((EVistaGestionAplicacion)Vista);
            ViewBag.BandejaId = id_bandeja.HasValue ? id_bandeja.Value : 0;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.TipoSolicitudId = (int)ETipoSolicitudAplicacion.ModificacionAplicacion;

            return View("NuevaAplicacion");
        }

        //[Route("SolicitudEliminacionAplicacion")]
        //public ActionResult SolicitudEliminacionAplicacion()
        //{            
        //    return View();
        //}

        //[Route("SolicitudModificacionAplicacion")]
        //public ActionResult SolicitudModificacionAplicacion()
        //{
        //    return View();
        //}

        //[Route("BandejaAprobacionSolicitud")]
        //public ActionResult BandejaAprobacionSolicitud(int? paginaActual = null, int? paginaTamanio = null)
        //{
        //    ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
        //    ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
        //    return View();
        //}

        //[Route("SolicitudCreacionAplicacion")]
        //public ActionResult SolicitudCreacionAplicacion()
        //{
        //    return View();
        //}

        [Route("ColumnaAplicacion")]
        public ActionResult ColumnaAplicacion()
        {
            return View();
        }

        [Route("PublicacionAplicacion")]
        public ActionResult PublicacionAplicacion()
        {
            return View();
        }

        [Route("ParametroAplicacion")]
        public ActionResult ParametroAplicacion()
        {
            return View();
        }

        [Route("ReporteAplicacion")]
        public ActionResult ReporteAplicacion()
        {
            return View();
        }

        [Route("ReporteAplicacionDetalle")]
        public ActionResult ReporteAplicacionDetalle(string CodigoAPT)
        {
            return View();
        }

        [Route("ReporteTecnologiaVencidaPorVencer")]
        public ActionResult ReporteTecnologiaVencidaPorVencer()
        {
            return View();
        }

        //[Route("ColumnaAplicacionData")]
        //public ActionResult ColumnaAplicacionData() => View();

        [Route("EquipoFisico")]
        public ActionResult EquipoFisico() => View();

        [Route("Parametricas")]
        public ActionResult Parametricas()
        {
            ViewBag.ParametricaId = (int)EEntidadParametrica.APPLIANCE;
            return View();
        }

        [Route("VistaTSI")]
        public ActionResult VistaTSI() => View();

        [Route("Auditoria")]
        public ActionResult Auditoria()
        {
            return View();
        }

        //[Route("Portafolio")]
        //public ActionResult Portafolio() => View();

        //[Route("AreaBian")]
        //public ActionResult AreaBian() => View();

        //[Route("JefaturaAti")]
        //public ActionResult JefaturaAti() => View();

        //[Route("Gerencia")]
        //public ActionResult Gerencia() => View();

        //[Route("Cuestionario")]
        //public ActionResult Cuestionario() => View();

        //[Route("BandejaAprobacionEstandar")]
        //public ActionResult BandejaAprobacionEstandar(int id_aprobador)
        //{
        //    ViewBag.SubtitleView = Utilitarios.GetEnumDescription2((EBandejaAprobadorAplicacion)id_aprobador);
        //    ViewBag.AprobadorId = id_aprobador;

        //    return View();
        //}

        //[Route("Bandeja")]
        //public ActionResult Bandeja() => View();

        //[Route("ProcesoVital")]
        //public ActionResult ProcesoVital() => View();

        [Route("EstandarPortafolio")]
        public ActionResult EstandarPortafolio() => View();

        //[Route("GestionadoPor")]
        //public ActionResult GestionadoPor() => View();

        [Route("Bitacora")]
        public ActionResult Bitacora() => View();

        [Route("AuditoriaAPI")]
        public ActionResult AuditoriaAPI()
        {
            return View();
        }

        [Route("Blobs")]
        public ActionResult Blobs() => View();

        [Route("Motivo")]
        public ActionResult Motivo() => View();

        [Route("TipoCicloVida")]
        public ActionResult TipoCicloVida() => View();

        [Route("LogsProcesos")]
        public ActionResult LogsProcesos() => View();

        [Route("RegistroVulnerabilidadesQualy")]
        public ActionResult RegistroVulnerabilidadesQualy() => View();

        [Route("ReporteVulnerabilidadesporEquipoQualy")]
        public ActionResult ReporteVulnerabilidadesporEquipoQualy() => View();
        [Route("ModeloHardware")]
        public ActionResult ModeloHardware() => View();
        //Jorge Cardenas: Agregando vista nueva para el Iniciativa Appliance (Controller)
        [Route("EquipoAppliance")]
        public ActionResult EquipoAppliance() => View();

        [Route("TipoEquipo")]
        public ActionResult TipoEquipo() => View();
        [Route("UnidadFondeo")]
        public ActionResult UnidadFondeo() => View();
        [Route("Puerto")]
        public ActionResult Puerto() => View();
        [Route("Protocolo")]
        public ActionResult Protocolo() => View();
        [Route("Proceso")]
        public ActionResult Proceso() => View();
        [Route("Reglas")]
        public ActionResult Reglas() => View();
    }
}