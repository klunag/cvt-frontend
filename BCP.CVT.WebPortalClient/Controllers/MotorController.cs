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
    [RoutePrefix("Motor")]
    public class MotorController : Base
    {
        public ActionResult Index()
        {

            return View();
        }


        [Route("Puerto")]
        public ActionResult Puerto()
        {
            return View();
        }

        [Route("Protocolo")]
        public ActionResult Protocolo()
        {
            return View();
        }

        [Route("Proceso")]
        public ActionResult Proceso()
        {
            return View();
        }
        [Route("Reglas")]
        public ActionResult Reglas()
        {
            return View();
        }
        [Route("Justificacion")]
        public ActionResult Justificacion()
        {
            return View();
        }
        [Route("DeudaTecnica")]
        public ActionResult DeudaTecnica()
        {
            return View();
        }
        [Route("InstanciasBD")]
        public ActionResult InstanciasBD()
        {
            return View();
        }
        [Route("Excluir")]
        public ActionResult Excluir()
        {
            return View();
        }
    }
}