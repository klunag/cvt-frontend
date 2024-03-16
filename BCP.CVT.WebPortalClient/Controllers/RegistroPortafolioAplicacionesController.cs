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
    [RoutePrefix("RegistroPortafolioAplicaciones")]
    public class RegistroPortafolioAplicacionesController : Base
    {
		// GET: RegistroPortafolioAplicaciones
		public ActionResult Index()
		{
			
			return View();
		}

		[Route("NuevaAplicacion")]
		public ActionResult NuevaAplicacion(int Id, int Vista, int? id_bandeja = null, int? paginaActual = null, int? paginaTamanio = null)
		{
			ViewBag.AplicacionId = Id;
			ViewBag.VistaId = Vista;
			ViewBag.SubtituloVista = Utilitarios.GetEnumDescription2((EVistaGestionAplicacion)Vista);
			ViewBag.BandejaId = id_bandeja.HasValue ? id_bandeja.Value : 0;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 10;
			ViewBag.TipoSolicitudId = (int)ETipoSolicitudAplicacion.CreacionAplicacion;

			return View();
		}

		[Route("ReversionAplicacion")]
		public ActionResult ReversionAplicacion(int id)
		{
			var user = HttpContext.Session["Usuario"];
			ViewBag.AplicacionId = id;
			if (user == null)
				return Redirect("/");
			return View();
		}


		[Route("SolicitudCreacionAplicacion")]
		public ActionResult SolicitudCreacionAplicacion()
		{
			return View();
		}

		[Route("SolicitudModificacionAplicacion")]
		public ActionResult SolicitudModificacionAplicacion()
		{
			return View();
		}

		[Route("SolicitudEliminacionAplicacion")]
		public ActionResult SolicitudEliminacionAplicacion()
		{
			return View();
		}

		[Route("Aplicacion")]
		public ActionResult Aplicacion()
		{
	

			return View();
		}

		[Route("AplicacionArquitecto")]
		public ActionResult AplicacionArquitecto()
		{


			return View();
		}

		[Route("Nuevo")]
		public ActionResult Nuevo()
		{
			var user = HttpContext.Session["Usuario"];
			if (user == null)
				return Redirect("/");
			return View();
		}

		[Route("DetalleAplicacion")]
		public ActionResult DetalleAplicacion(int id, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
		{
			string mensaje = "";

			ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			ViewBag.AplicacionId = id;
			return View();
		}

		[Route("Bandeja")]
		public ActionResult Bandeja(string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
		{
			string mensaje = "";

			ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			return View();
		}
		[Route("BandejaAplicaciones")]
		public ActionResult BandejaAplicaciones(string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
		{
			string mensaje = "";
			ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			return View();
		}
		[Route("DatosGenerales")]
		public ActionResult DatosGenerales(int id, string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
		{
			ViewBag.AplicacionId = id;
			string mensaje = "";
			ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			return View();
		}

		[Route("OtrosDatos")]
		public ActionResult OtrosDatos(int id)
		{
			ViewBag.AplicacionId = id;
			return View();
		}


		[Route("BandejaModificacionAplicaciones")]
		public ActionResult BandejaModificacionAplicaciones(string nom_App = null,int? estado = null,int? paginaActual = null, int? paginaTamanio = null)
		{
			string mensaje = "";
			ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
			ViewBag.Estado = estado.HasValue ? estado.Value : -1;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			return View();
		}

		[Route("EliminacionAplicaciones")]
		public ActionResult EliminacionAplicaciones(string nom_App = null, int? paginaActual = null, int? paginaTamanio = null)
		{
			string mensaje = "";

			ViewBag.Nombre_App = string.IsNullOrEmpty(nom_App) ? mensaje : nom_App;
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			return View();
		}

		[Route("BandejaEliminacionAplicaciones")]
		public ActionResult BandejaEliminacionAplicaciones(int? paginaActual = null, int? paginaTamanio = null)
		{
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			return View();
		}


		[Route("ReversionEliminacionAplicaciones")]
		public ActionResult ReversionEliminacionAplicaciones(int? paginaActual = null, int? paginaTamanio = null)
		{
			ViewBag.PaginaActual = paginaActual.HasValue ? paginaActual.Value : 1;
			ViewBag.PaginaTamanio = paginaTamanio.HasValue ? paginaTamanio.Value : 30;
			return View();
		}

	}
}