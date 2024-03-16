using BCP.CVT.Cross;
using BCP.CVT.WebPortalClient.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;

namespace BCP.CVT.WebPortalClient.Controllers
{
    public class Base : Controller
    {
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var paginasAutorizadas = Settings.Get<string>("PaginasAutorizadas");
            var paginasAutorizadasArr = paginasAutorizadas.Split('|');
            if (!paginasAutorizadasArr.Select(x => x.ToUpper()).Contains(Request.Url.AbsolutePath.ToUpper()))
            {
                if (!Request.IsAuthenticated)
                {
                    filterContext.Result =
                        new RedirectToRouteResult(new RouteValueDictionary
                            {
                            {"action", "SignIn"},
                            {"controller", "Login"}
                            });
                    return;
                }
                else
                {
                    if (Session["Usuario"] != null)
                    {
                        var user = MetodosUtiles.getCurrentUser();
                        var idPerfil = user.PerfilId;
                        var roles = user.Perfil;
                        var paginas = MetodosUtiles.PrepararMenuXPerfil(idPerfil,roles);
                        //Agregar páginas que no se ven en el menú pero que son necesarias de validar
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionProducto/Tecnologia", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionProducto/BuscarTribuCoePorFiltro", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionProducto/BuscarSquadPorFiltro", OrdenMenu = 0, SubgrupoMenu = string.Empty });

                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Alertas/NotificacionesResponsables", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Alertas/Notificaciones", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Alertas/TipoNotificacionDetalle", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Alertas/TipoNotificacionResponsable", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Vista/DetalleAplicacion", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Vista/DetalleEquipo", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Vista/Ayuda", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/Vista/DetalleCertificadoD", OrdenMenu = 0, SubgrupoMenu = string.Empty });

                        //Menu admin portafolio en duro
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/Nuevo", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/Bandeja", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/DetalleAplicacion", OrdenMenu = 0, SubgrupoMenu = string.Empty });

                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/BandejaAplicaciones", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/DatosGenerales", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/BandejaModificacionAplicaciones", OrdenMenu = 0, SubgrupoMenu = string.Empty });

                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/EliminacionAplicaciones", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/BandejaEliminacionAplicaciones", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/RegistroPortafolioAplicaciones/ReversionEliminacionAplicaciones", OrdenMenu = 0, SubgrupoMenu = string.Empty });

                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/Solicitudes", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/AIO", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/ArquitectoEvaluador", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/ArquitectoTI", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/DevSecOps", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/GobiernoUserIT", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/JefeEquipo", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/Owner", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/BandejaPortafolioAplicaciones/TTL", OrdenMenu = 0, SubgrupoMenu = string.Empty });

                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionPortafolioAplicaciones/CreacionAplicaciones", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/portafolioaplicaciones/Backups", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionPortafolioAplicaciones/TipoNotificacionesPortafolio", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionPortafolioAplicaciones/NotificacionesPortafolio", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionPortafolioAplicaciones/FichaAplicacion", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/ParametroAplicacion", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/RolesGestion", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/Portafolio", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/GestionadoPor", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/AreaBian", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/JefaturaAti", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/Gerencia", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/ClasificacionTecnica", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ConfiguracionPortafolioAplicaciones/ColumnaAplicacionData", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ReportesPortafolio/ReporteEstado", OrdenMenu = 0, SubgrupoMenu = string.Empty });

                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ReportesPortafolio/ReportePedidos", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ReportesPortafolio/ReporteCampos", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ReportesPortafolio/ReporteVariacion", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/ReportesPortafolio/ReporteCambiosBajarResponsableGDH", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                    #region Gestion tecnologia
                    paginas.Add(new MenuMantenimientoDTO() { Icono = "", GrupoMenu = "", Menu = "", LinkMenu = "~/GestionTecnologia/DatosModificados", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                        #endregion

                        var listaMenus = paginas.Select(x => x.LinkMenu.Replace("~", "").ToUpper()).ToList();
                        var paginaActual = Request.Url.AbsolutePath.ToUpper();
                        var comodin = "Dashboard/TecnologiaEquipo";

                        if (paginaActual != "/" && paginaActual != "" && !paginaActual.Contains(comodin.ToUpper()))
                        {
                            if (!listaMenus.Contains(paginaActual))
                            {
                                filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary
                                                   {
                                                       {"action", "Forbidden"},
                                                       {"controller", "Error"},
                                                   });

                            }
                        }
                    }

                }
            }


            //VALIDAR ACCESO A PAGINAS RESTRINGIDAS POR HORARIO
            var paginasRestringidas = Settings.Get<string>("Restriccion.Paginas");
            var paginasRestringidasArr = paginasRestringidas.Split('|');
            if (paginasRestringidasArr.Select(x => x.ToUpper()).Contains(Request.Url.AbsolutePath.ToUpper()))
            {
                var horaInicio = Settings.Get<TimeSpan>("Restriccion.HoraInicio");
                var horaFin = Settings.Get<TimeSpan>("Restriccion.HoraFin");

                var horaActual = DateTime.Now.TimeOfDay;

                if (horaActual > horaInicio && horaActual < horaFin)
                {
                    filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary
                                                   {
                                                       {"action", "Unavailable"},
                                                       {"controller", "Error"},
                                                   });
                }

            }


            //var flagEstado = false;
            //var session = filterContext.HttpContext.Session;
            //var Page = System.Web.HttpContext.Current.Request.Path;
            //var arrURL = Page.Split('/');
            //Page = arrURL[1].ToString();

            //if (session == null || (!session.IsNewSession && Session["Usuario"] != null))
            //{
            //    var usuario = (Usuario)Session["Usuario"];
            //    var CurrentPerfil = usuario.UsuarioBCP_Dto.PerfilId;
            //    var urlRaiz = "";
            //    var url1 = "Vista";
            //    var url2 = "Relacion";
            //    var url3 = "Dashboard";
            //    var url4 = "GestionTecnologia";
            //    var url5 = "Alertas";
            //    var url6 = "Configuracion";
            //    var url7 = "Indicadores";

            //    return;

            //    switch (CurrentPerfil)
            //    {
            //        case (int)EPerfilBCP.Consultor:
            //            if (Page == urlRaiz || Page == url1 || Page == url2)
            //                return;
            //            else
            //                flagEstado = true;
            //            break;

            //        case (int)EPerfilBCP.Administrador:
            //            if (Page == urlRaiz || Page == url1 || Page == url2 || Page == url3 || Page == url4 || Page == url5 || Page == url6 || Page == url7)
            //                return;
            //            else
            //                flagEstado = true;
            //            break;

            //        case (int)EPerfilBCP.NoAutorizado:
            //            flagEstado = true;
            //            break;
            //    }
            //}

            //if (!Request.IsAuthenticated)
            //{
            //    RedirectToAction("Index", "Login");
            //}

            //if (Request.IsAjaxRequest() && (!Request.IsAuthenticated || User == null))
            //{
            //    filterContext.RequestContext.HttpContext.Response.StatusCode = 401;
            //    filterContext.HttpContext.Response.End();
            //    RedirectToAction("Index", "Login");
            //    throw new Exception("Session Expirada, redireccionar al Login.");
            //}

            //if (flagEstado)
            //{
            //    FormsAuthentication.SignOut();
            //    filterContext.Result =
            //        new RedirectToRouteResult(new RouteValueDictionary
            //            {
            //                {"action", "PaginaErrorLogin"},
            //                {"controller", "Login"},
            //                {"returnUrl", filterContext.HttpContext.Request.RawUrl}
            //            });
            //}
        }

        //protected override void OnResultExecuted(ResultExecutedContext filterContext)
        //{
        //    Console.WriteLine("OnResultExecuted");
        //}

        //protected override void OnResultExecuting(ResultExecutingContext filterContext)
        //{
        //    Console.WriteLine("OnResultExecuted");
        //}


    }
}