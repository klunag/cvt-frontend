using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("ReportesPortafolio")]
    public class ReportesPortafolioController : Base
    {
        // GET: ReportesPortafolio
        public ActionResult Index()
        {
            return View();
        }

        [Route("ReporteEstado")]
        public ActionResult ReporteEstado()
        {
            return View();
        }

        [Route("ReporteCampos")]
        public ActionResult ReporteCampos()
        {
            return View();
        }

        [Route("ReportePedidos")]
        public ActionResult ReportePedidos()
        {
            return View();
        }

        [Route("ReporteVariacion")]
        public ActionResult ReporteVariacion()
        {
            return View();
        }
        [Route("ReporteCambiosBajarResponsableGDH")]
        public ActionResult ReporteCambiosBajarResponsableGDH()
        {
            return View();
        }
    }
}