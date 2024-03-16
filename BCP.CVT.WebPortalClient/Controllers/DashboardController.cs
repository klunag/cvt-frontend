using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    [RoutePrefix("Dashboard")]
    public class DashboardController : Base
    {
        // GET: Dashboard
        public ActionResult Index()
        {
            
            return View();
        }
        [Route("Aplicacion")]
        public ActionResult Aplicacion()
        {
            return View();
        }
        [Route("Tecnologia")]
        public ActionResult Tecnologia()
        {
            return View();
        }
        [Route("Equipo")]
        public ActionResult Equipo()
        {
            return View();
        }
        [Route("GerenciaDivision")]
        public ActionResult GerenciaDivision()
        {
            return View();
        }
        [Route("SinRelaciones")]
        public ActionResult SinRelaciones()
        {
            return View();
        }
        [Route("TecnologiaDetallado")]
        public ActionResult TecnologiaDetallado()
        {
            return View();
        }
        [Route("Subdominios")]
        public ActionResult Subdominios()
        {
            return View();
        }
        [Route("AplicacionTecnologia")]
        public ActionResult AplicacionTecnologia()
        {
            return View();
        }
        [Route("TecnologiasSinRelaciones")]
        public ActionResult TecnologiasSinRelaciones()
        {
            return View();
        }

        [Route("EvolucionSubdominios")]
        public ActionResult EvolucionSubdominios()
        {
            return View();
        }

        [Route("Agrupacion")]
        public ActionResult Agrupacion()
        {
            return View();
        }

        [Route("DetalleTecnologia")]
        public ActionResult DetalleTecnologia()
        {
            return View();
        }

        [Route("TecnologiaEquipo")]
        public ActionResult TecnologiaEquipo(int? Id)
        {
            if (!Id.HasValue) Id = 0;
            ViewBag.IdTecnologia = Id;
            return View();
        }

        [Route("TecnologiaEquipoFabricante")]
        public ActionResult TecnologiaEquipoFabricante(int? Id)
        {
            if (!Id.HasValue) Id = 0;
            ViewBag.IdTecnologia = Id;
            return View();
        }

        [Route("Owner")]
        public ActionResult Owner()
        {
            return View();
        }

        #region Vista Tecnologias por Instalaciones

        [Route("TecnologiaInstalaciones")]
        public ActionResult TecnologiaInstalaciones()
        {
            return View();
        }

        [Route("TecnologiaInstalacionesSO")]
        public ActionResult TecnologiaInstalacionesSO()
        {
            return View();
        }

        [Route("Consolidado")]
        public ActionResult Consolidado()
        {
            return View();
        }
        
        [Route("TecnologiaSinFechaFin")]
        public ActionResult TecnologiaSinFechaFin()
        {
            return View();
        }

        #endregion

        #region IndicadoresGerenciales

        [Route("IndicadorObsolescenciaSoBd")]
        public ActionResult IndicadorObsolescenciaSoBd()
        {
            return View();
        }

        [Route("IndicadorObsolescenciaSubdominio")]
        public ActionResult IndicadorObsolescenciaSubdominio()
        {
            return View();
        }

        #endregion

        [Route("GerenciaDivisionArquitectos")]
        public ActionResult GerenciaDivisionArquitectos() => View();

        [Route("Storage")]
        public ActionResult Storage()
        {
            return View();
        }

        [Route("StorageAplicaciones")]
        public ActionResult StorageAplicaciones()
        {
            return View();
        }

        [Route("StorageEquipos")]
        public ActionResult StorageEquipos()
        {
            return View();
        }

        [Route("StorageIndicadores")]
        public ActionResult StorageIndicadores()
        {
            return View();
        }

        [Route("StorageResumen")]
        public ActionResult StorageResumen()
        {
            return View();
        }

        [Route("StorageResumen2")]
        public ActionResult StorageResumen2()
        {
            return View();
        }

        [Route("ResumenAplicaciones")]
        public ActionResult ResumenAplicaciones()
        {
            return View();
        }

        [Route("RelevamientoIP")]
        public ActionResult RelevamientoIP()
        {
            return View();
        }

        [Route("EstadoIP")]
        public ActionResult EstadoIP()
        {
            return View();
        }

        [Route("ResponsablesIP")]
        public ActionResult ResponsablesIP()
        {
            return View();
        }


        [Route("EvolucionInstalacionEquipos")]
        public ActionResult EvolucionInstalacionEquipos()
        {
            return View();
        }

        [Route("StorageBackupMainframe")]
        public ActionResult StorageBackupMainframe()
        {
            return View();
        }

        [Route("StorageBackupOpen")]
        public ActionResult StorageBackupOpen()
        {
            return View();
        }

        [Route("StorageBackupOpenResumen")]
        public ActionResult StorageBackupOpenResumen()
        {
            return View();
        }
        [Route("ObsolescenciaHardwareDetallado")]
        public ActionResult ObsolescenciaHardwareDetallado()
        {
            return View();
        }
        [Route("ObsolescenciaHardwareKPI")]
        public ActionResult ObsolescenciaHardwareKPI()
        {
            return View();
        }
    }
}