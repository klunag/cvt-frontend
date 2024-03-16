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
    [RoutePrefix("Dependencias")]
    public class DependenciasAppsController : Base
    {
        public ActionResult Index()
        {

            return View();
        }


        // GET: Configuracion
        [Route("Consultas")]
        public ActionResult Consultas()
        {
            // Permite validar por parametro y también por grupo de red
            ViewBag.PerfilCambios = false;
            var userItem = System.Web.HttpContext.Current.Session["Usuario"];
            var matriculasVistaDependencias = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("MATRICULAS_ACCESO_DEPENDENCIAS").Valor;
            var matr = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("DEPENDENCIAS_APPS_GRAFOS_ACCESOS").Valor;

            ViewBag.AccesoGrafico = false;

            var matriculasDiagramaInfra = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("MATRICULAS_ACCESO_DIAGRAMA_INFRAESTRUCTURA").Valor;
            ViewBag.AccesoDiagramaInfra = false;

            var listMatriculas = string.IsNullOrEmpty(matriculasVistaDependencias) ? new string[] { } : matriculasVistaDependencias.Split(',');
            if (userItem != null)
            {
                var flag_gestorDependencias = System.Web.HttpContext.Current.Session["flag_gestorDependencias"];
                var userObj = (Usuario_Storage)userItem;
                if (listMatriculas.Contains(userObj.UsuarioBCP_Dto.Matricula))
                {
                    ViewBag.PerfilCambios = true;
                }

                if (matr.Equals("*"))
                {
                    ViewBag.AccesoGrafico = true;
                }
                else if (matr.Contains(userObj.UsuarioBCP_Dto.Matricula))
                {
                    ViewBag.AccesoGrafico = true;
                }

                if (matriculasDiagramaInfra.Equals("*"))
                {
                    ViewBag.AccesoDiagramaInfra = true;
                } else if (matriculasDiagramaInfra.Contains(userObj.UsuarioBCP_Dto.Matricula))
                {
                    ViewBag.AccesoDiagramaInfra = true;
                }
                    
            }

            return View();

            // Valida solamente por grupo de red
            //ViewBag.PerfilCambios = false;
            //var flag_gestorDependencias = System.Web.HttpContext.Current.Session["flag_gestorDependencias"];
            //if ((bool)flag_gestorDependencias)
            //{
            //    ViewBag.PerfilCambios = true;
            //}
            //return View();
        }

        [Route("Configuracion")]
        public ActionResult Configuracion()
        {
            return View();
        }

        [Route("TipoRelacion")]
        public ActionResult TipoRelacion()
        {
            return View();
        }

        [Route("AgrupacionEtiqueta")]
        public ActionResult AgrupacionEtiqueta()
        {
            return View();
        }

    }
}