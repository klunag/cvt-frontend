using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("ServidoresAplicaciones")]
    public class ServidoresAplicacionesController : Base
    {
        // GET: ServidoresAplicaciones
        public ActionResult Index()
        {
            
            return View();
        }

        [Route("Servidor")]
        public ActionResult Servidor()
        {
            return View();
        }
    }
}
