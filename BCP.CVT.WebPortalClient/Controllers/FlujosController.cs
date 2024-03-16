using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Flujos")]
    public class FlujosController : Base
    {
        // GET: Flujos
        public ActionResult Index()
        {
            return View();
        }

        [Route("SolicitudEquipo")]
        public ActionResult SolicitudEquipo(string isUser = null)
        {
            ViewBag.isUser = string.IsNullOrEmpty(isUser) ? string.Empty : isUser;
            return View();
        }

        [Route("BandejaAprobacionCvt")]
        public ActionResult BandejaAprobacionCvt(string isUser = null)
        {
            ViewBag.isUser = string.IsNullOrEmpty(isUser) ? string.Empty : isUser;
            return View();
        }
    }
}