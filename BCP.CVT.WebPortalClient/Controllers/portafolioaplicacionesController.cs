using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("portafolioaplicaciones")]
    public class portafolioaplicacionesController : Controller
    {
        // GET: portafolioaplicaciones
        //[AdminPortafolioAuthorized]
        [AllowAnonymous]
        public ActionResult Index()
        {
            var usuario = MetodosUtiles.ObtenerUsuario();
            if(usuario != null)
            {
                usuario.SiteTitle = "Portafolio de aplicaciones";
                Session.Add("Usuario", usuario);
            }
            

            //usuario.FlagPortafolio = true;
            //usuario.FlagAdmin = false;

            //usuario.FlagAdmin = MetodosUtiles.ValidarAccesoAdmin(usuario.UserName);

            //if (usuario.UsuarioBCP_Dto.PerfilId == (int)EPerfilBCP.Administrador)
            //    usuario.FlagAdmin = true;
            //else
            //    usuario.FlagAdmin = MetodosUtiles.ValidarAccesoAdmin(usuario.UserName);


            return RedirectToAction("ListadoAplicaciones", "portafolioaplicaciones");
        }

        //[AdminPortafolioAuthorized]
        [AllowAnonymous]
        [Route("Listado")]
        public ActionResult Listado()
        {
            return RedirectToAction("ListadoAplicaciones", "portafolioaplicaciones");
        }

        [AllowAnonymous]
        [Route("ListadoAplicaciones")]
        public ActionResult ListadoAplicaciones()
        {           
            return View();
        }

        //[AdminPortafolioAuthorized]
        [AllowAnonymous]
        [Route("ReporteClasificacion")]
        public ActionResult ReporteClasificacion()
        {
            
            return View();
        }

        //[AdminPortafolioAuthorized]
        [AllowAnonymous]
        [Route("ReporteInfraestructura")]
        public ActionResult ReporteInfraestructura()
        {
            
            return View();
        }

        //[AdminPortafolioAuthorized]
        [AllowAnonymous]
        [Route("ReporteBIAN")]
        public ActionResult ReporteBIAN()
        {
           
            return View();
        }

        //[AdminPortafolioAuthorized]
        [Route("Instancias")]
        public ActionResult Instancias()
        {
            
            return View();
        }

        //[AdminPortafolioAuthorized]
        [AllowAnonymous]
        [Route("Familias")]
        public ActionResult Familias()
        {
            
            return View();
        }

        //[AdminPortafolioAuthorized]
        [Route("AplicacionTecnologia")]
        public ActionResult AplicacionTecnologia()
        {
            
            return View();
        }
    }
}
