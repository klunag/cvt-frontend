using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("ConfiguracionPortafolioAplicaciones")]
    public class ConfiguracionPortafolioAplicacionesController : Controller
    {
        // GET: ConfiguracionPortafolioAplicaciones
        public ActionResult Index()
        {
            
            return View();
        }

        [Route("Portafolio")]
        public ActionResult Portafolio()
        {
            
            return View();
        }

        [Route("CodigoReservado")]
        public ActionResult CodigoReservado()
        {

            return View();
        }
        [Route("CodigoReutilizado")]
        public ActionResult CodigoReutilizado()
        {

            return View();
        }
        [Route("GrupoTicketRemedy")]
        public ActionResult GrupoTicketRemedy()
        {

            return View();
        }
        [Route("TipoPCI")]
        public ActionResult TipoPCI()
        {

            return View();
        }

        [Route("RolesProductoAdmin")]
        public ActionResult RolesProductoAdmin()
        {
            return View();
        }

        [Route("ProductosFuncionAdmin")]
        public ActionResult ProductosFuncionAdmin()
        {
            return View();
        }

        [Route("RolesProductosFuncionAdmin")]
        public ActionResult RolesProductosFuncionAdmin()
        {
            return View();
        }

        [Route("ConsolidadoMatrizRoles")]
        public ActionResult ConsolidadoMatrizRoles()
        {
            return View();
        }


        [Route("AreaBian")]
        public ActionResult AreaBian()
        {
            
            return View();
        }

        [Route("JefaturaAti")]
        public ActionResult JefaturaAti()
        {
           
            return View();
        }

        [Route("Gerencia")]
        public ActionResult Gerencia()
        {
            
            return View();
        }

        [Route("Cuestionario")]
        public ActionResult Cuestionario()
        {
           
            return View();
        }

        [Route("Bandeja")]
        public ActionResult Bandeja()
        {
           
            return View();
        }

        [Route("ProcesoVital")]
        public ActionResult ProcesoVital()
        {
            
            return View();
        }

        [Route("GestionadoPor")]
        public ActionResult GestionadoPor()
        {
            
            return View();
        }

        [Route("ColumnaAplicacionData")]
        public ActionResult ColumnaAplicacionData()
        {
           
            return View();
        }

        [Route("ModeloEntrega")]
        public ActionResult ModeloEntrega()
        {
           
            return View();
        }

        [Route("TipoImplementacion")]
        public ActionResult TipoImplementacion()
        {
           
            return View();
        }

        [Route("ParametroAplicacion")]
        public ActionResult ParametroAplicacion()
        {
            
            return View();
        }

        [Route("RolesGestion")]
        public ActionResult RolesGestion()
        {
            
            return View();
        }

        [Route("ClasificacionTecnica")]
        public ActionResult ClasificacionTecnica()
        {
            
            return View();
        }

        [Route("NotificacionesPortafolio")]
        public ActionResult NotificacionesPortafolio()
        {
            
            return View();
        }

        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);


        [HttpGet]
        public JsonResult ObtenerUsuariosPorNombreAutocomplete(string filter_name)
        {
            try
            {
                log.DebugFormat("Filtro: {0}", filter_name);

                if (!string.IsNullOrEmpty(filter_name))
                {
                    var lista = new ADUsuario().GetUsersByName(filter_name);
                    
                    return Json(lista, JsonRequestBehavior.AllowGet);
                }
                else
                {
                     
                    return Json(JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                
                return Json(JsonRequestBehavior.AllowGet);
            }
        }
    }
}