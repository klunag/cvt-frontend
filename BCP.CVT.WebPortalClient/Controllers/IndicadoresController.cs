using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Indicadores")]
    public class IndicadoresController : Base
    {
        // GET: Indicadores
        public ActionResult Index()
        {
            
            return View();
        }

        [Route("GerencialEquipos")]
        public ActionResult GerencialEquipos()
        {
            return View();
        }

        [Route("GerencialTecnologias")]
        public ActionResult GerencialTecnologias()
        {
            return View();
        }

        [Route("GerencialAplicaciones")]
        public ActionResult GerencialAplicaciones()
        {
            return View();
        }
    }
}