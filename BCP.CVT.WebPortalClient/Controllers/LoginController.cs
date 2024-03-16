using BCP.CVT.Cross;
using BCP.CVT.WebPortalClient.Models;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.OpenIdConnect;
using Newtonsoft.Json;
using RestSharp;
using RestSharp.Serialization.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;

namespace BCP.CVT.WebPortalClient.Controllers
{
    public class LoginController : Controller
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        // GET: Login
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult IniciarSesionUsuario(Usuario_Storage usuario)
        {
            Session.Add("Usuario", usuario);
            return Json("ok", JsonRequestBehavior.AllowGet);
        }

        public JsonResult ObtenerSesion()
        {
            var user = Session["Usuario"];

            return Json(user, JsonRequestBehavior.AllowGet);
        }

        public JsonResult RefrescarSesion()
        {
            var user = Session["Usuario"];

            return Json(true, JsonRequestBehavior.AllowGet);
        }

        public void SignIn()
        {
            Session["Id"] = Guid.NewGuid().ToString();
            if (!Request.IsAuthenticated)
            {
                HttpContext.GetOwinContext().Authentication.Challenge(
                    new AuthenticationProperties { RedirectUri = "/" },
                    OpenIdConnectAuthenticationDefaults.AuthenticationType);
            }
        }

        public void SignOut()
        {
            Session.Clear();
            HttpContext.GetOwinContext().Authentication.SignOut(
                    OpenIdConnectAuthenticationDefaults.AuthenticationType,
                    CookieAuthenticationDefaults.AuthenticationType);
        }

        public JsonResult LoginBCP()
        {
            Usuario rpta = new Usuario();
            var rolPortafolio = string.Empty;

            var userClaims = User.Identity as ClaimsIdentity;
            var roleClaimType = userClaims.RoleClaimType;
            var nameClaimType = userClaims.NameClaimType;

            var displayName = userClaims?.FindFirst("name")?.Value;
            log.DebugFormat("displayName: {0}", displayName);

            var emailUPN = userClaims?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn")?.Value;
            log.DebugFormat("emailUPN: {0}", emailUPN);
            var email = userClaims?.FindFirst("preferred_username")?.Value;
            log.DebugFormat("preferred_username: {0}", email);

            var emailPrincipal = string.IsNullOrWhiteSpace(email) ? emailUPN : email;
            log.DebugFormat("emailPrincipal: {0}", emailPrincipal);

            var matricula = new ADUsuario().GetAccountNameByMail(emailPrincipal, displayName);
            log.DebugFormat("matricula: {0}", matricula);

            if (string.IsNullOrWhiteSpace(matricula))
                matricula = emailPrincipal;

            var role = string.Empty;

            foreach (var claim in System.Security.Claims.ClaimsPrincipal.Current.Claims)
            {
                if (claim.Type == "roles" || claim.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
                {
                    role = role + string.Format("{0};", claim.Value);
                }
            }

            log.DebugFormat("role: {0}", role);

            var idPerfil = (int)EPerfilBCP.Consultor;
            if (!string.IsNullOrWhiteSpace(role))
            {
                if (role.Contains("E195_Administrador"))
                    idPerfil = (int)EPerfilBCP.Administrador;
                else if (role.Contains("E195_GestorCVTCatalogoTecnologias"))
                    idPerfil = (int)EPerfilBCP.GestorCVT_CatalogoTecnologias;
                else if (role.Contains("E195_ETI-CMDB"))
                    idPerfil = (int)EPerfilBCP.ETICMDB;
                else if (role.Contains("E195_GestorUnit"))
                    idPerfil = (int)EPerfilBCP.GestorUnit;
                else if (role.Contains("E195_GestorTecnologia"))
                    idPerfil = (int)EPerfilBCP.GestorTecnologia;
                else if (role.Contains("E195_ArquitectoTecnologia"))
                    idPerfil = (int)EPerfilBCP.ArquitectoTecnologia;
                else if (role.Contains("E195_Seguridad"))
                    idPerfil = (int)EPerfilBCP.Seguridad;
                else if (role.Contains("E195_Auditoria"))
                    idPerfil = (int)EPerfilBCP.Auditoria;
                else if (role.Contains("E195_Coordinador"))
                    idPerfil = (int)EPerfilBCP.Coordinador;
                else if (role.Contains("E195_Operador"))
                    idPerfil = (int)EPerfilBCP.Operador;
                else if (role.Contains("E195_Gerente"))
                    idPerfil = (int)EPerfilBCP.Gerente;
                else if (role.Contains("E195_Subsidiaria"))
                    idPerfil = (int)EPerfilBCP.Subsidiaria;
                else if (role.Contains("E195_ArquitectoFuncional"))
                    idPerfil = (int)EPerfilBCP.ArquitectoFuncional;
                else if (role.Contains("E195_ArquitectoSeguridad"))
                    idPerfil = (int)EPerfilBCP.ArquitectoSeguridad;
                else if (role.Contains("E195_Consultor"))
                    idPerfil = (int)EPerfilBCP.Consultor;
            }

            bool flagAdminPortafolio = role.Contains("E195_PortafolioAplicaciones");
            rolPortafolio = role;

            rpta = new Usuario()
            {
                UsuarioBCP = emailPrincipal,
                FlagPortafolio = flagAdminPortafolio,
                UsuarioBCP_Dto = new UsuarioBCP_DTO
                {
                    SamAccountName = matricula,
                    Name = displayName,
                    Matricula = matricula,
                    Perfil = role,
                    PerfilId = idPerfil,
                    PerfilesPAP = role

                },
                UserName = matricula,
                CorreoElectronico = emailPrincipal
            };
            rpta.UsuarioBCP_Dto.PerfilesPAP = rolPortafolio;

            if (idPerfil == (int)EPerfilBCP.Administrador)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = true;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.Consultor)
            {
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.ETICMDB)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = true;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.GestorTecnologia)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = false;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.ArquitectoTecnologia)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = false;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.Seguridad)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = true;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.Auditoria)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = false;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.Coordinador)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = false;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.Operador)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = false;
                rpta.UsuarioBCP_Dto.VerDetalle = false;
            }
            else if (idPerfil == (int)EPerfilBCP.Subsidiaria)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = false;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.Gerente)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = true;
                rpta.UsuarioBCP_Dto.VerDetalle = false;
            }
            else if (idPerfil == (int)EPerfilBCP.ArquitectoFuncional)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = true;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.ArquitectoSeguridad)
            {
                rpta.UsuarioBCP_Dto.FlagAprobador = true;
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            else if (idPerfil == (int)EPerfilBCP.PortafolioAplicaciones)
            {
                rpta.UsuarioBCP_Dto.VerDetalle = true;
            }
            
            Usuario_Storage rptaBack = LoginBack(rpta);

            return Json(rptaBack, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public JsonResult CargaMenuPrincipal() //perfil en 0
        {
            UsuarioCurrent rpta = MetodosUtiles.getCurrentUser();
            Usuario_Storage usuario = MetodosUtiles.ObtenerUsuario();
            usuario.SiteTitle = "Site de Gestión de tecnologías y obsolescencia";

            usuario.Paginas = MetodosUtiles.PrepararMenuXPerfil(rpta.PerfilId, rpta.Perfil);
            Session.Add("Usuario", usuario);
            return Json(usuario, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult ObtenerDatosUsuario(string correoElectronico)
        {
            try
            {
                log.DebugFormat("Correo a validar: {0}", correoElectronico);

                if (!string.IsNullOrEmpty(correoElectronico))
                {
                    var adUser = new ADUsuario().GetUserDataByMail(correoElectronico);
                    if (adUser != null)
                    {
                        var dataRpta = new
                        {
                            Matricula = adUser.Matricula,
                            Nombres = adUser.Nombres,
                            Correo = adUser.CorreoElectronico,
                            Estado = 1
                        };

                        return Json(dataRpta, JsonRequestBehavior.AllowGet);
                    }
                    return Json(new { Matricula = correoElectronico, Estado = -1 }, JsonRequestBehavior.AllowGet);
                }
                else
                {
                    var dataRpta = new
                    {
                        Matricula = correoElectronico,
                        Nombres = "",
                        Correo = "",
                        Estado = -1
                    };
                    return Json(dataRpta, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                var dataRpta = new
                {
                    Matricula = correoElectronico,
                    Nombres = "",
                    Correo = "",
                    Estado = -1
                };
                return Json(dataRpta, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult ObtenerGroupAD(string groupName)
        {
            try
            {
                log.DebugFormat("Grupo a validar: {0}", groupName);

                if (!string.IsNullOrEmpty(groupName))
                {
                    var obj = new ADUsuario().GetGroupByName(groupName);
                    if (obj != null)
                    {
                        return Json(obj, JsonRequestBehavior.AllowGet);
                    }
                    return Json("", JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json("", JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {

                return Json("", JsonRequestBehavior.AllowGet);
            }
        }
        [HttpGet]
        public JsonResult ObtenerGroupADMembers(string groupName)
        {
            try
            {
                log.DebugFormat("Grupo a validar: {0}", groupName);

                if (!string.IsNullOrEmpty(groupName))
                {
                    var listaMiembros = new ADUsuario().GetGroupMembersByName(groupName);
                    if (listaMiembros != null)
                    {
                        return Json(listaMiembros, JsonRequestBehavior.AllowGet);
                    }
                    return Json("", JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json("", JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {

                return Json(null, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult ObtenerDatosUsuariosAutocomplete(string criterio)
        {
            var adActivo = Settings.Get<int>("AD.Matricula.Activo");
            if (adActivo == 1)
            {
                try
                {
                    var listaUsuarios = new ADUsuario().ObtenerListaADUsuario(criterio);
                    return Json(listaUsuarios, JsonRequestBehavior.AllowGet);
                }
                catch (Exception)
                {
                    var dataRpta = new ADUsuario.ADUsuarioBE()
                    {
                        Usuario = string.Empty,
                        Anexo = string.Empty,
                        ApellidoPaterno = string.Empty,
                        Area = string.Empty,
                        Compania = string.Empty,
                        Correo = string.Empty,
                        Division = string.Empty,
                        Guid = string.Empty,
                        Nombre = string.Empty,
                        Puesto = string.Empty,
                        Servicio = string.Empty,
                        Sid = string.Empty,
                        UbicacionFisica = string.Empty,
                        UserPrincipalName = string.Empty,
                        Estado = -1
                    };
                    return Json(dataRpta, JsonRequestBehavior.AllowGet);
                }

            }
            else
            {
                List<ADUsuario.ADUsuarioBE> dataRpta = new List<ADUsuario.ADUsuarioBE>();
                var objeto = new ADUsuario.ADUsuarioBE()
                {
                    Usuario = criterio,
                    Anexo = string.Empty,
                    ApellidoPaterno = string.Empty,
                    Area = string.Empty,
                    Compania = string.Empty,
                    Correo = string.Empty,
                    Division = string.Empty,
                    Guid = string.Empty,
                    Nombre = criterio,
                    Puesto = string.Empty,
                    Servicio = string.Empty,
                    Sid = string.Empty,
                    UbicacionFisica = string.Empty,
                    UserPrincipalName = string.Empty,
                    Estado = 1
                };

                dataRpta.Add(objeto);

                return Json(dataRpta, JsonRequestBehavior.AllowGet);
            }
        }


        public ActionResult PaginaErrorLogin()
        {
            return View();
        }

        public static Usuario_Storage LoginBack(Usuario usuario)
        {
            var url = Settings.Get<string>("UrlApi") + "/loginfront";
            RestClient client = new RestClient(new Uri(url));
            var request = new RestRequest("usuario", Method.POST);
            request.AddJsonBody(usuario);

            var response = client.Execute(request);
            var rpta = new Usuario_Storage();

            if (response != null)
            {
                if (response.StatusCode == HttpStatusCode.OK)
                {
                    var jsonRetorno = response.Content;
                    rpta = JsonConvert.DeserializeObject<Usuario_Storage>(jsonRetorno);
                }
                else
                {
                    log.DebugFormat("Status Description: {0}", response.StatusDescription);
                }
            }
            return rpta;
        }

    }
}