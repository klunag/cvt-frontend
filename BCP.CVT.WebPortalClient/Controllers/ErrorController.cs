using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    public class ErrorController : Controller
    {
        // GET: Error
        public ActionResult NotFound() //404
        {
            return View();
        }

        public ActionResult Forbidden() //403
        {
            return View();
        }

        public ActionResult BadRequest() //400
        {
            return View();
        }

        public ActionResult Unavailable() //
        {
            return View();
        }
    }
}
