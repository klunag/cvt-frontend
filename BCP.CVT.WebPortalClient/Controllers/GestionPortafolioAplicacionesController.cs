using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("GestionPortafolioAplicaciones")]
    public class GestionPortafolioAplicacionesController : Controller
    {
        // GET: GestionPortafolioAplicaciones
        public ActionResult Index()
        {

            return View();
        }

        [Route("CatalogoAplicacion")]
        public ActionResult CatalogoAplicacion(string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
        {

            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
            return View();
        }

        [Route("Bitacora")]
        public ActionResult Bitacora()
        {

            return View();
        }

        [Route("TipoNotificacionesPortafolio")]
        public ActionResult TipoNotificacionesPortafolio()
        {

            return View();
        }

        [Route("CreacionAplicaciones")]
        public ActionResult CreacionAplicaciones(string nom_App = null, int? estado = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
            return View();
        }

        [Route("AprobacionCambioEstado")]
        public ActionResult AprobacionCambioEstado(string nom_App = null, int? estado = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
            return View();
        }

        [Route("BandejaAprobacionSolicitud")]
        public ActionResult BandejaAprobacionSolicitud(string nom_App = null, int? estado = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.Estado = estado.HasValue ? estado.Value : -1;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;

            return View();
        }

        [Route("NotificacionesPortafolio")]
        public ActionResult NotificacionesPortafolio()
        {

            return View();
        }

        [Route("FichaAplicacion")]
        public ActionResult FichaAplicacion(int id, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
        {

            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.AplicacionId = id;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;

            return View();
        }

        [Route("AplicacionesDesestimadas")]
        public ActionResult AplicacionesDesestimadas(string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;

            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;

            return View();
        }

        [Route("FormatosRegistro")]
        public ActionResult FormatosRegistro(string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;

            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;

            return View();
        }

        [Route("FichaFormatoRegistro")]
        public ActionResult FichaFormatoRegistro(int id, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
        {

            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;

            ViewBag.AplicacionId = id;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;

            return View();
        }
        [Route("FichaAplicacionDesestimada")]
        public ActionResult FichaAplicacionDesestimada(int id, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
        {

            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;

            ViewBag.AplicacionId = id;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;

            return View();
        }

        [Route("ActualizacionHistoricaPortafolio")]
        public ActionResult ActualizacionHistoricaPortafolio()
        {
            return View();
        }


        [Route("Backups")]
        public ActionResult Backups()
        {
            return View();
        }



        [Route("CatalogoAplicacionesUserIT")]
        public ActionResult CatalogoAplicacionesUserIT(string nom_App = null, int? estado = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.Estado = estado.HasValue ? estado.Value : -1;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
            return View();
        }

        [Route("DetalleAplicacionUserIT")]
        public ActionResult DetalleAplicacionUserIT(int id, string nom_App = null, int? estado = null, int? paginaActual = null, int? paginaTamanio = null)
        {
            string mensaje = "";

            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.Estado = estado.HasValue ? estado.Value : -1;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AplicacionId = id;
            return View();
        }

        [Route("GobiernoUserITEdit")]
        public ActionResult GobiernoUserITEdit(int appId, int flowId)
        {
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            return View();
        }

        [Route("BandejaReversionEliminacion")]
        public ActionResult BandejaReversionEliminacion( int? paginaActual = null, int? paginaTamanio = null)
        {

            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            return View();
        }

    }
}