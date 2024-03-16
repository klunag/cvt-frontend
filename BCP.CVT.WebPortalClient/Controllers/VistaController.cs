using BCP.CVT.Services.Interface;
using BCP.CVT.WebPortalClient.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Vista")]
    public class VistaController : Base
    {
        // GET: Vista
        public ActionResult Index()
        {
            
            return View();
        }

        [Route("VTecnologia")]
        public ActionResult VTecnologia()
        {
            return View();
        }

        [Route("Equipos")]
        public ActionResult Equipos()
        {
            ViewBag.ColAprovisionamiento = false;
            var userItem = System.Web.HttpContext.Current.Session["Usuario"];
            var parametro = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("VISTA_EQUIPOS_COL_APROVISIONAMIENTO").Valor;
            UsuarioCurrent currentUser = MetodosUtiles.getCurrentUser();

            if (userItem != null)
            {
                var userObj = (Usuario_Storage)userItem;
                if (parametro.Equals("*"))
                {
                    ViewBag.ColAprovisionamiento = true;
                }
                else if (parametro.StartsWith("E195_") && parametro.Contains(currentUser.Perfil))
                {
                    ViewBag.ColAprovisionamiento = true;
                }
                else if (parametro.Contains(userObj.UsuarioBCP_Dto.Matricula))
                {
                    ViewBag.ColAprovisionamiento = true;
                }                    
            }

            return View();
        }

        [Route("Aplicaciones")]
        public ActionResult Aplicaciones(string codApp = null)
        {
            string mensaje = ""; 
            ViewBag.codigoApp = string.IsNullOrEmpty(codApp) ? mensaje : codApp;
            return View();
        }

        [Route("BigFix")]
        public ActionResult BigFix()
        {
            return View();
        }

        [Route("Ventana")]
        public ActionResult Ventana()
        {
            return View();
        }

        [Route("Relaciones")]
        public ActionResult Relaciones()
        {
            return View();
        }

        [Route("DetalleEquipo")]
        public ActionResult DetalleEquipo(int? Id)
        {
            if (!Id.HasValue) Id = 0;
            ViewBag.IdEquipo = Id;
            return View();
        }

        [Route("DetalleCertificadoD")]
        public ActionResult DetalleCertificadoD(int? Id)
        {
            if (!Id.HasValue) Id = 0;
            ViewBag.IdEquipo = Id;
            return View();
        }

        [Route("DetalleAplicacion")]
        public ActionResult DetalleAplicacion(string Id)
        {
            if (Id == null) Id = "";
            ViewBag.CodigoAPT = Id;
            return View();
        }

        [AllowAnonymous]
        [Route("TecnologiaEstandar")]
        public ActionResult TecnologiaEstandar()
        {
            return View();
        }

        [AllowAnonymous]
        [Route("EstandaresTecnologia")]
        public ActionResult EstandaresTecnologia() => View();

        [Route("AplicacionConsultor")]
        public ActionResult AplicacionConsultor()
        {
            return View();
        }

        [Route("Ayuda")]
        public ActionResult Ayuda()
        {
            return View();
        }

        [Route("ReporteAplicacion")]
        public ActionResult ReporteAplicacion()
        {
            return View();
        }

        [Route("VistaOwnerTecnologia")]
        public ActionResult VistaOwnerTecnologia() => View();

        [Route("VistaOwnerProducto")]
        public ActionResult VistaOwnerProducto() => View();

        [Route("VistaObsolescenciaTecnologia")]
        public ActionResult VistaObsolescenciaTecnologia() => View();

        [Route("VistaObsolescenciaAplicacion")]
        public ActionResult VistaObsolescenciaAplicacion() => View();

        [Route("CatalogoTecnologia")]
        public ActionResult CatalogoTecnologia() => View();

        [Route("Vulnerabilidades")]
        public ActionResult Vulnerabilidades() => View();
        [Route("VistaBajaServidores")]
        public ActionResult VistaBajaServidores() => View();
        [Route("VistaProcesarBajaServidores")]
        public ActionResult VistaProcesarBajaServidores() => View();
    }
}
