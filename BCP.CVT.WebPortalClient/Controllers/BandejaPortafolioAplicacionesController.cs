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
    [RoutePrefix("BandejaPortafolioAplicaciones")]
    public class BandejaPortafolioAplicacionesController : Controller
    {
        // GET: BandejaPortafolioAplicaciones
        public ActionResult Index()
        {            
            return View();
        }

        [Route("Solicitudes")]
        public ActionResult Solicitudes(string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null) 
        {
            string mensaje = "";

			ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;

            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
            return View(); 
        
        }
        
        [Route("ArquitectoEvaluador")]
        public ActionResult ArquitectoEvaluador(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {
            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("ArquitectoEvaluadorEdit")]
        public ActionResult ArquitectoEvaluadorEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {
            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("AIO")]
        public ActionResult AIO(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("AIOEdit")]
        public ActionResult AIOEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("DevSecOps")]
        public ActionResult DevSecOps(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("DevSecOpsEdit")]
        public ActionResult DevSecOpsEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("ArquitectoTI")]
        public ActionResult ArquitectoTI(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("ArquitectoTIEdit")]
        public ActionResult ArquitectoTIEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
           , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }
        [Route("ArquitectoSolucion")]
        public ActionResult ArquitectoSolucion(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }
        [Route("ArquitectoSolucionEdit")]
        public ActionResult ArquitectoSolucionEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("Owner")]
        public ActionResult Owner(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("OwnerEdit")]
        public ActionResult OwnerEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
           , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("JefeEquipo")]
        public ActionResult JefeEquipo(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("JefeEquipoEdit")]
        public ActionResult JefeEquipoEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("GobiernoUserIT")]
        public ActionResult GobiernoUserIT(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }        

        [Route("TTL")]
        public ActionResult TTL(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }

        [Route("TTLEdit")]
        public ActionResult TTLEdit(int appId, int flowId, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null
            , int? gestionado = null, int? estadoApp = null, int? estadoSolicitud = null, int? flujo = null, string orderBy = null, string orderDirection = null)
        {

            string mensaje = "";
            ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
            ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
            ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
            ViewBag.AppId = appId;
            ViewBag.FlowId = flowId;

            ViewBag.Gestionado = gestionado.HasValue ? gestionado.Value : -1;
            ViewBag.EstadoApp = estadoApp.HasValue ? estadoApp.Value : -1;
            ViewBag.EstadoSolicitud = estadoSolicitud.HasValue ? estadoSolicitud.Value : -1;
            ViewBag.Flujo = flujo.HasValue ? flujo.Value : -1;
            ViewBag.OrderBy = string.IsNullOrEmpty(orderBy) ? "applicationId" : orderBy;
            ViewBag.OrderDirection = string.IsNullOrEmpty(orderDirection) ? "asc" : orderDirection;
            return View();
        }
    }
}