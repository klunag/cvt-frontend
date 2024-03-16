using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    public class GuardicoreController : Controller
    {
        // GET: Guardicore
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Assets()
        {

            return View();
        }

        public ActionResult Connection() => View();

        public ActionResult Consolidado() => View();

        public ActionResult Consolidado2() => View();
        public ActionResult servidoresnodescubiertos() => View();
        public ActionResult nuevasrelaciones() => View();
        public ActionResult gestionetiquetado() => View();
    }
}