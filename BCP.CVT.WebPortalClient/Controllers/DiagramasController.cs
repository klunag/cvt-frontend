using BCP.CVT.Cross;
using BCP.CVT.Services.Interface;
using BCP.CVT.WebPortalClient.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI.WebControls;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Diagramas")]
    public class DiagramasController : Base
    {
        public ActionResult Index()
        {
            return View();
        }
        [Route("RelacionamientoFuncion")]
        public ActionResult RelacionamientoFuncion()
        {
            return View();
        }
    }
}