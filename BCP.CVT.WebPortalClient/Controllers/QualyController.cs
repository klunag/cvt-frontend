using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    public class QualyController : Controller
    {
        // GET: Qualy
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult ReporteQualyConsolidado() => View();
    }
}