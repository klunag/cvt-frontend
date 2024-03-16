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
    [RoutePrefix("ConsultasPortafolioAplicaciones")]
    public class ConsultasPortafolioAplicacionesController : Controller
    {
        // GET: ConsultasPortafolioAplicaciones
        public ActionResult Index()
        {
            return View();
        }
        [Route("Consultas")]
        public ActionResult Consultas()
        {
            return View();
        }

        [Route("RespuestaConsultas")]
        public ActionResult RespuestaConsultas()
        {
            return View();
        }
    }
}