using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Alertas")]
    public class AlertasController : Base
    {
        // GET: Alertas
        public ActionResult Index()
        {            
            return View();
        }

        [Route("Funcionales")]
        public ActionResult Funcionales()
        {
            return View();
        }

        [Route("Tecnicas")]
        public ActionResult Tecnicas()
        {
            return View();
        }        

        [Route("Mensaje")]
        public ActionResult Mensaje()
        {
            return View();
        }

        [Route("DejarMensaje")]
        public ActionResult DejarMensaje()
        {
            return View();
        }

        [Route("LogCvt")]
        public ActionResult LogCvt()
        {
            return View();
        }

        [Route("Responsable")]
        public ActionResult Responsable()
        {
            return View();
        }

        [Route("TipoNotificaciones")]
        public ActionResult TipoNotificaciones()
        {
            return View();
        }

        [Route("NotificacionesResponsables")]
        public ActionResult NotificacionesResponsables()
        {
            ViewBag.TipoResponsableIdDefecto = Settings.Get<int>("PortafolioResponsableDefecto.Id");
            return View();
        }

        [Route("Notificaciones")]
        public ActionResult Notificaciones()
        {
            return View();
        }

        [Route("UserIT")]
        public ActionResult UserIT()
        {
            return View();
        }

        [Route("TipoNotificacionDetalle")]
        public ActionResult TipoNotificacionDetalle() => View();

        [Route("TipoNotificacionResponsable")]
        public ActionResult TipoNotificacionResponsable() => View();

        [Route("TipoNotificacionesPortafolio")]
        public ActionResult TipoNotificacionesPortafolio() => View();

        [Route("NotificacionesPortafolio")]
        public ActionResult NotificacionesPortafolio() => View();

        [Route("TipoRecurso")]
        public ActionResult TipoRecurso() => View();

        [Route("UrlAplicacion")]
        public ActionResult UrlAplicacion() => View();

        [Route("EquipoNoRegistrado")]
        public ActionResult EquipoNoRegistrado() => View();

        [Route("TecnologiaNoRegistradaQualys")]
        public ActionResult TecnologiaNoRegistradaQualys() => View();
    }
}