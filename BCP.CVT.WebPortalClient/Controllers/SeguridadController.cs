using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Seguridad")]
    public class SeguridadController : Base
    {  // GET: Alertas
		public ActionResult Index()
		{
			
			return View();
		}

	}
}
