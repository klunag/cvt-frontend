using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("GestionUmbrales")]
    public partial class GestionUmbralesController : Base
    {
        // GET: GestionUmbrales
        public ActionResult Index()
        {
            
            return View();
        }
        // GET: ConsultaRegistro
        [Route("ConsultasRegistro")]
        public ActionResult ConsultasRegistro()
        {
            return View();
        }

        // GET: Reportes
        [Route("Reportes")]
        public ActionResult Reportes()
        {
            return View();
        }
    }
}