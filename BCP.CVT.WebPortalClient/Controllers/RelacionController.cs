using BCP.CVT.WebPortalClient.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Relacion")]
    public class RelacionController : Base
    {
        // GET: Relacion
        public ActionResult Index()
        {
            
            return View();
        }

        [Route("Tecnologia")]
        public ActionResult Tecnologia()
        {
            var user = MetodosUtiles.ObtenerUsuario();
            if (user == null) { return View(); }
            //PermisoModulo PermisoModulo = MetodosUtiles.ObtenerPermisoModulo(1);
            var model = new
            {
                //Permisos = new PermisoModulo()
                //{
                //    Crear = user.PermisoId == 1,
                //    Editar = user.PermisoId == 1,
                //    Eliminar = user.PermisoId == 1 || user.PermisoId == 2,
                //    Exportar = user.PermisoId == 1 || user.PermisoId == 2,
                //    Aprobar = user.PermisoId == 2,
                //}
            };
            return View(model);
        }

        [Route("CISAdministracion")]
        public ActionResult CISAdministracion()
        {
            return View();
        }

        [Route("CISConfiguracion")]
        public ActionResult CISConfiguracion()
        {
            return View();
        }

        [Route("AplicacionVinculada")]
        public ActionResult AplicacionVinculada()
        {
            return View();
        }

        [Route("Configuracion")]
        public ActionResult Configuracion()
        {
            return View();
        }

        [Route("Nueva")]
        public ActionResult Nueva(string id_r = null)
        {
            ViewBag.IdRelacion = string.IsNullOrEmpty(id_r) ? "0" : Encoding.UTF8.GetString(Convert.FromBase64String(id_r));
            return View();
        }

        [Route("Bandeja")]
        public ActionResult Bandeja() => View();

        [Route("Actualizacion")]
        public ActionResult Actualizacion() => View();

        [Route("InformacionAplicaciones")]
        public ActionResult InformacionAplicaciones() => View();

        [Route("AplicacionesValidas")]
        public ActionResult AplicacionesValidas() => View();

        [Route("RelacionamientoComponentes")]
        public ActionResult RelacionamientoComponentes() => View();

        [Route("RelacionamientoComponentesConsultor")]
        public ActionResult RelacionamientoComponentesConsultor() => View();
    }
}