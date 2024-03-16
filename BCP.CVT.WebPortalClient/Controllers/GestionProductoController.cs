using BCP.CVT.Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("GestionProducto")]
    public class GestionProductoController : Base
    {
        // GET: GestionProducto
        public ActionResult Index()
        {
            return View();

        }

        public ActionResult Tecnologia(int id)
        {
            return View();
        }

        public JsonResult BuscarTribuCoePorFiltro(string filtro)
        {
            var data = ServiceManager<BCPUnidadDAO>.Provider.BuscarUnidadTribuCoePorFiltro(filtro);

            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public JsonResult BuscarSquadPorFiltro(string codigoUnidad, string filtro = null)
        {
            var data = ServiceManager<BCPUnidadDAO>.Provider.BuscarUnidadSquadPorFiltro(codigoUnidad, filtro);

            return Json(data, JsonRequestBehavior.AllowGet);
        }
    }
}