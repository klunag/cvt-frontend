using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("GestionTecnologia")]
    public partial class GestionTecnologiaController : Base
    {
        // GET: GestionTecnologia
        public ActionResult Index()
        {
            
            return View();
        }

        [Route("Tipo")]
        public ActionResult Tipo()
        {
            return View();
        }
        [Route("Familia")]
        public ActionResult Familia()
        {
            return View();
        }
        [Route("Dominio")]
        public ActionResult Dominio()
        {
            return View();
        }
        [Route("SubDominio")]
        public ActionResult SubDominio()
        {
            return View();
        }
        [Route("Tecnologia")]
        public ActionResult Tecnologia(string Id, int? id_tec = null, int? id_estadotec = null)
        {
            ViewBag.NombreTecnologia = string.IsNullOrEmpty(Id) ? string.Empty : Id;
            ViewBag.IdTecnologia = id_tec ?? 0;
            ViewBag.IdEstadoTec = id_estadotec ?? 0;

            var user = MetodosUtiles.getCurrentUser();

            ViewBag.Context = user.Perfil;
            ViewBag.Context = "2";
            //1 -> Usuario Registrador
            //2 -> Usuario Aprobador

            return View();
        }
        [Route("NewTecnologia")]
        public ActionResult NewTecnologia(string Id, int? id_tec = null, int? id_estadotec = null)
        {
            //ViewBag.NombreTecnologia = string.IsNullOrEmpty(Id) ? string.Empty : Id;
            //ViewBag.IdTecnologia = id_tec ?? 0;
            //ViewBag.IdEstadoTec = id_estadotec ?? 0;

            return View();
        }
        [Route("TecnologiaModificacion")]
        public ActionResult TecnologiaModificacion(string Id, int? id_tec = null, int? id_estadotec = null)
        {
            //ViewBag.NombreTecnologia = string.IsNullOrEmpty(Id) ? string.Empty : Id;
            //ViewBag.IdTecnologia = id_tec ?? 0;
            //ViewBag.IdEstadoTec = id_estadotec ?? 0;

            return View();
        }
        [Route("BandejaFlujosAprobacion")]
        public ActionResult BandejaFlujosAprobacion()
        {
            return View();
        }

        [Route("Arquetipo")]
        public ActionResult Arquetipo()
        {
            return View();
        }
        [Route("TecnologiaNoRegistrada")]
        public ActionResult TecnologiaNoRegistrada()
        {
            return View();
        }
        [Route("ExcepcionTipo")]
        public ActionResult ExcepcionTipo()
        {
            return View();
        }
        [Route("ExcepcionRiesgo")]
        public ActionResult ExcepcionRiesgo()
        {
            return View();
        }

        [Route("TipoArquetipo")]
        public ActionResult TipoArquetipo()
        {
            return View();
        }
        [Route("Entorno")]
        public ActionResult Entorno()
        {
            return View();
        }

        [Route("TecnologiaDesactivada")]
        public ActionResult TecnologiaDesactivada()
        {
            var user = MetodosUtiles.getCurrentUser();
            ViewBag.Context = user.Perfil;
            ViewBag.Context = "2";

            return View();
        }

        [Route("ReporteTecnologia")]
        public ActionResult ReporteTecnologia()
        {
            var user = MetodosUtiles.getCurrentUser();
            ViewBag.Context = user.Perfil;
            ViewBag.Context = "2";

            return View();
        }

        [Route("Instalaciones")]
        public ActionResult Instalaciones()
        {            
            return View();
        }

        [Route("ReporteCambioBajasOwnerTecnologia")]
        public ActionResult ReporteCambioBajasOwnerTecnologia()
        {
            return View();
        }
        #region Datos modificados de Flujo de bandeja de aprobación
        [Route("DatosModificados")]
        public ActionResult DatosModificados(int idSolicitud, int idTecnologia, int idProducto, int idTipoSolicitud)
        {
            var user = HttpContext.Session["Usuario"];
            ViewBag.Usuario = user;
            ViewBag.IdSolicitud = idSolicitud;
            ViewBag.IdTecnologia = idTecnologia; 
            ViewBag.IdProducto = idProducto;
            ViewBag.IdTipoSolicitud = idTipoSolicitud;
            ViewBag.TipoSolicitud =  MetodosUtiles.GetEnumDescription((FlujoTipoSolicitud)idTipoSolicitud);
            return View();
        }
        #endregion

    }
}