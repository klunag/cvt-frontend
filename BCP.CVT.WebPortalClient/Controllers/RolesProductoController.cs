using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("RolesProducto")]
    public class RolesProductoController : Controller
    {
        // GET: RolesProducto
        [Route("BandejaRolesSolicitante")]
        public ActionResult BandejaRolesSolicitante()
        {
            return View();
        }

        [Route("RolesProducto")]
        public ActionResult RolesProducto()
        {
            return View();
        }

        [Route("RolesProductosFuncion")]
        public ActionResult RolesProductosFuncion()
        {
            return View();
        }

        [Route("BandejaFuncionesSolicitante")]
        public ActionResult BandejaFuncionesSolicitante()
        {
            return View();
        }

        [Route("ProductosFuncion")]
        public ActionResult ProductosFuncion()
        {
            return View();
        }
    }

    
}