using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{    
    [RoutePrefix("mep")]
    public class mepController : Controller
    {
        // GET: mep
        public ActionResult Index() => RedirectToAction("Reporte", "mep");

        [Route("Registro")]
        public ActionResult Registro() => View();

        [AllowAnonymous]
        [Route("Reporte")]
        public ActionResult Reporte() => View();

    }
}