﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    public class SiemController : Controller
    {
        // GET: Siem
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Siem() => View();
    }
}