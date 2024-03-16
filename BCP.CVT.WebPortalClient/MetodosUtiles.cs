using BCP.CVT.Cross;
using BCP.CVT.DTO;
using BCP.CVT.Services.Interface;
using BCP.CVT.Services.Interface.PortafolioAplicaciones;
using BCP.CVT.WebPortalClient.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web;

namespace BCP.CVT.WebPortalClient
{
    public class MetodosUtiles
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public static UsuarioCurrent getCurrentUser()
        {
            var user = (Usuario_Storage)HttpContext.Current.Session["Usuario"];
            UsuarioCurrent rpta = null;

            if (user != null)
            {
                var url = Settings.Get<string>("UrlApi") + "/loginfront";
                RestClient client = new RestClient(new Uri(url));
                var request = new RestRequest("usuario", Method.GET);
                request.AddHeader("Authorization", string.Format("Bearer {0}", user.Token));

                var response = client.Execute(request);

                if (response != null)
                {
                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        var jsonRetorno = response.Content;
                        rpta = JsonConvert.DeserializeObject<UsuarioCurrent>(jsonRetorno);
                    }
                    else
                    {
                        log.DebugFormat("Status Description: {0}", response.StatusDescription);
                    }
                }
            }
            return rpta;
        }

        public static string getParametro(string clave)
        {
            var user = (Usuario_Storage)HttpContext.Current.Session["Usuario"];
            ParametroDTO rpta = null;

            if (user != null)
            {
                var url = Settings.Get<string>("UrlApi") + "/Parametro/ObtenerParametro?codigo=" + clave;
                RestClient client = new RestClient(new Uri(url));
                var request = new RestRequest(Method.GET);
                request.AddHeader("Authorization", string.Format("Bearer {0}", user.Token));

                var response = client.Execute(request);

                if (response != null)
                {
                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        var jsonRetorno = response.Content;
                        rpta = JsonConvert.DeserializeObject<ParametroDTO>(jsonRetorno);
                    }
                    else
                    {
                        log.DebugFormat("Status Description: {0}", response.StatusDescription);
                    }
                }
            }

            var final = rpta == null ? null : rpta.Valor;

            return final;
        }

        public static Usuario_Storage ObtenerUsuario()
        {
            var user = System.Web.HttpContext.Current.Session["Usuario"];
            if (user != null)
                return (Usuario_Storage)user;
            else
                return null;
        }
        public static List<MenuMantenimientoDTO> ObtenerPaginas()
        {
            var paginas = new List<MenuMantenimientoDTO>();
            var user = HttpContext.Current.Session["Usuario"];
            if (user == null) return paginas;

            paginas = ((Usuario_Storage)user).Paginas.OrderBy(x => x.OrdenMenu).ToList();
            return paginas;

        }

        public static List<MenuMantenimientoDTO> PrepararMenuXPerfil(int perfil, string roles = null)
        {
            List<MenuMantenimientoDTO> rpta = new List<MenuMantenimientoDTO>();
            var activarPAPP = Settings.Get<bool>("PAPP.ActivarListadoApps");
            //var activarPAPP = ObtenerParametroPortafolio("ACTIVAR_MODULO_PORTAFOLIO");
            var activarSolicitante = true;
            HttpContext.Current.Session["PAPP.Activar"] = activarPAPP;
            HttpContext.Current.Session["PAPP.Solicitante"] = activarSolicitante;

            var flag_gestorDependencias = false;

            var usuario = HttpContext.Current.Session["Usuario"];
            var userObjeto = (Usuario_Storage)usuario;
            var matricula = userObjeto.UsuarioBCP_Dto.Matricula;
            //var matriculaAccesoEspecial = ConfigurationManager.AppSettings["Matricula.AccesoEspecial"];
            //var matriculaAccesoEspecialList = string.IsNullOrEmpty(matriculaAccesoEspecial) ? new string[] { } : matriculaAccesoEspecial.Split(',');

            //var matriculasVistaDependencias = ObtenerParametroCVT("MATRICULAS_ACCESO_DEPENDENCIAS");
            //var listMatriculas = string.IsNullOrEmpty(matriculasVistaDependencias) ? new string[] { } : matriculasVistaDependencias.Split(',');

            var userItem = System.Web.HttpContext.Current.Session["Usuario"];
            //if (userItem != null)
            //{
            //    var userObj = (Usuario)userItem;
            //    if (listMatriculas.Contains(userObj.UsuarioBCP_Dto.Matricula))
            //    {
            //        #region Dependencia de Aplicaciones
            //        rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
            //        #endregion
            //    }
            //}
            var matriculasBajaServidores = ObtenerParametroCVT("MATRICULAS_ACCESO_BAJASERVIDORES").Split('|');
            var perfilesObsolescenciaHardware = ObtenerParametroCVT("OBSOLESCENCIA_HARDWARE_PERFILES").Split('|');

            if (perfil == (int)EPerfilBCP.Administrador)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos desactivados", LinkMenu = "~/Configuracion/EquiposDesactivados", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vulnerabilidades", LinkMenu = "~/Vista/Vulnerabilidades", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                
                #endregion
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detalle de estado de tecnologías", LinkMenu = "~/Dashboard/TecnologiaDetallado", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipo", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Familias relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipoFabricante", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías sin relación con aplicaciones y equipos", LinkMenu = "~/Dashboard/TecnologiasSinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado, uso e instalaciones", LinkMenu = "~/Dashboard/DetalleTecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologias sin fecha fin", LinkMenu = "~/Dashboard/TecnologiaSinFechaFin", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte por dueño de tecnología", LinkMenu = "~/Dashboard/Owner", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Aplicación", LinkMenu = "~/Dashboard/Aplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado de obsolescencia de aplicaciones", LinkMenu = "~/Dashboard/Agrupacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado por aplicaciones y/o tecnologías", LinkMenu = "~/Dashboard/AplicacionTecnologia", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Equipo", LinkMenu = "~/Dashboard/Equipo", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Evolución por subdominios", LinkMenu = "~/Dashboard/EvolucionSubdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Equipos sin relación con aplicaciones", LinkMenu = "~/Dashboard/SinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte de responsables IP", LinkMenu = "~/Dashboard/ResponsablesIP", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte de identificación IP", LinkMenu = "~/Dashboard/RelevamientoIP", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Obsolescencia Hardware", LinkMenu = "~/Dashboard/ObsolescenciaHardwareDetallado", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Hardware", LinkMenu = "~/Dashboard/ObsolescenciaHardwareKPI", OrdenMenu = 4, SubgrupoMenu = "Equipos" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones general", LinkMenu = "~/Dashboard/TecnologiaInstalaciones", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones por subdominios", LinkMenu = "~/Dashboard/TecnologiaInstalacionesSO", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte de evolución de instalación tecnologías", LinkMenu = "~/Dashboard/EvolucionInstalacionEquipos", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por equipos", LinkMenu = "~/Indicadores/GerencialEquipos", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por tecnologías", LinkMenu = "~/Indicadores/GerencialTecnologias", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por aplicaciones", LinkMenu = "~/Indicadores/GerencialAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });

                #endregion
                #region Relaciones y formatos                
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Actualización masiva", LinkMenu = "~/Relacion/Actualizacion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Relacionamiento entre componentes", LinkMenu = "~/Relacion/RelacionamientoComponentes", OrdenMenu = 5, SubgrupoMenu = string.Empty });

                #endregion
                #region Configuración
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Aplicaciones", LinkMenu = "~/Configuracion/Aplicacion", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Criticidades", LinkMenu = "~/Configuracion/Criticidad", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Ambientes", LinkMenu = "~/Configuracion/Ambiente", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Parámetros", LinkMenu = "~/Configuracion/Parametro", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Tipo de recursos Azure", LinkMenu = "~/Alertas/TipoRecurso", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Dominios de red", LinkMenu = "~/Configuracion/DominioRed", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Componentes de infraestructura", LinkMenu = "~/Configuracion/ModeloHardware", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Gestión de equipos", LinkMenu = "~/Configuracion/Equipo", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Solicitudes de Baja de Servidores", LinkMenu = "~/Vista/VistaProcesarBajaServidores", OrdenMenu = 1, SubgrupoMenu = string.Empty });

                //rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Tipo de exclusión", LinkMenu = "~/Configuracion/TipoExclusion", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Equipos excluidos", LinkMenu = "~/Configuracion/EquipoExclusion", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Gestión de archivos", LinkMenu = "~/Configuracion/Archivo", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Ver histórico de modificaciones", LinkMenu = "~/Configuracion/HistoricoModificacion", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Ver histórico de visitas al site", LinkMenu = "~/Configuracion/VisitaSite", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Parámetros TSI", LinkMenu = "~/Configuracion/Parametricas", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Auditoría", LinkMenu = "~/Configuracion/Auditoria", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Auditoría API", LinkMenu = "~/Configuracion/AuditoriaAPI", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Claves de acceso", LinkMenu = "~/Seguridad", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Tipo de Ciclo de Vida", LinkMenu = "~/Configuracion/TipoCicloVida", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Configuración de Proceso", LinkMenu = "~/DependenciasApps/Configuracion", OrdenMenu = 1, SubgrupoMenu = "Dependencias de Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Tipo de Relación", LinkMenu = "~/DependenciasApps/TipoRelacion", OrdenMenu = 1, SubgrupoMenu = "Dependencias de Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Agrupación de Aplicaciones", LinkMenu = "~/DependenciasApps/AgrupacionEtiqueta", OrdenMenu = 1, SubgrupoMenu = "Dependencias de Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Tipo de Activo", LinkMenu = "~/Configuracion/TipoEquipo", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Unidad de Fondeo", LinkMenu = "~/Configuracion/UnidadFondeo", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Excluir", LinkMenu = "~/Motor/Excluir", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Puerto", LinkMenu = "~/Motor/Puerto", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Protocolo", LinkMenu = "~/Motor/Protocolo", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Proceso", LinkMenu = "~/Motor/Proceso", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Reglas", LinkMenu = "~/Motor/Reglas", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Justificación", LinkMenu = "~/Motor/Justificacion", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Deuda de Descubrimiento", LinkMenu = "~/Motor/DeudaTecnica", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Instancias BD", LinkMenu = "~/Motor/InstanciasBD", OrdenMenu = 1, SubgrupoMenu = "Motor de Relacionamiento" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Blobs", LinkMenu = "~/Configuracion/Blobs", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Reglas de Relacionamiento", LinkMenu = "~/Diagramas/RelacionamientoFuncion", OrdenMenu = 1, SubgrupoMenu = "Diagramas" });

                #endregion
                #region Gestión de las Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Estado de estandarización", LinkMenu = "~/GestionTecnologia/Tipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tipo de arquetipo", LinkMenu = "~/GestionTecnologia/TipoArquetipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Entorno del arquetipo", LinkMenu = "~/GestionTecnologia/Entorno", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Motivo (Tecnologías sin equivalencia)", LinkMenu = "~/Configuracion/Motivo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Familias", LinkMenu = "~/GestionTecnologia/Familia", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Dominios", LinkMenu = "~/GestionTecnologia/Dominio", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Subdominios", LinkMenu = "~/GestionTecnologia/SubDominio", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Productos", LinkMenu = "~/GestionProducto", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tecnologías", LinkMenu = "~/GestionTecnologia/NewTecnologia", OrdenMenu = 2, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Arquetipos", LinkMenu = "~/GestionTecnologia/Arquetipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tecnologías desactivadas", LinkMenu = "~/GestionTecnologia/TecnologiaDesactivada", OrdenMenu = 2, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Estándar restringido", LinkMenu = "~/GestionTecnologia/ExcepcionTipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Excepción por riesgo", LinkMenu = "~/GestionTecnologia/ExcepcionRiesgo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Reporte de tecnologías", LinkMenu = "~/GestionTecnologia/ReporteTecnologia", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Reporte de instalaciones", LinkMenu = "~/GestionTecnologia/Instalaciones", OrdenMenu = 2, SubgrupoMenu = string.Empty });



                #endregion
                #region Alertas y Notificaciones
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Equipos no registrados", LinkMenu = "~/Alertas/EquipoNoRegistrado", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Tecnologías no registradas", LinkMenu = "~/GestionTecnologia/TecnologiaNoRegistrada", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Alertas técnicas", LinkMenu = "~/Alertas/Tecnicas", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Alertas funcionales", LinkMenu = "~/Alertas/Funcionales", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Notificaciones técnicas", LinkMenu = "~/Alertas/TipoNotificaciones", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Mensajes", LinkMenu = "~/Alertas/Mensaje", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "URLs Aplicación", LinkMenu = "~/Alertas/UrlAplicacion", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Logs de Procesos Job", LinkMenu = "~/Configuracion/LogsProcesos", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                #endregion

                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                #endregion

                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Tecnologías vencidas y por vencer", LinkMenu = "~/Configuracion/ReporteTecnologiaVencidaPorVencer", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Reporte de cambio/baja de Owner tecnologías", LinkMenu = "~/GestionTecnologia/ReporteCambioBajasOwnerTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion

                #region Vista Owners
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de tecnologías por owner", LinkMenu = "~/Vista/VistaOwnerTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de productos por owner", LinkMenu = "~/Vista/VistaOwnerProducto", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "KPI Obsolescencia Tecnología", LinkMenu = "~/Vista/VistaObsolescenciaTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion

                #region Integraciones
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Servidores Identificados en Guardicore", LinkMenu = "~/Guardicore/Consolidado", OrdenMenu = 10, SubgrupoMenu = "Guardicore" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Aplicaciones con interacciones entre servidores", LinkMenu = "~/Guardicore/Consolidado2", OrdenMenu = 10, SubgrupoMenu = "Guardicore" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Servidores no descubiertos", LinkMenu = "~/Guardicore/servidoresnodescubiertos", OrdenMenu = 10, SubgrupoMenu = "Guardicore" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Nuevas relaciones", LinkMenu = "~/Guardicore/nuevasrelaciones", OrdenMenu = 10, SubgrupoMenu = "Guardicore" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Gestion Etiquetado", LinkMenu = "~/Guardicore/gestionetiquetado", OrdenMenu = 10, SubgrupoMenu = "Guardicore" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Qualys - Registro de Vulnerabilidades", LinkMenu = "~/Configuracion/RegistroVulnerabilidadesQualy", OrdenMenu = 10, SubgrupoMenu = "Qualys" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Qualys: Vulnerabilidades por Equipo", LinkMenu = "~/Configuracion/ReporteVulnerabilidadesporEquipoQualy", OrdenMenu = 9, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Qualys - Comparación contra servidores", LinkMenu = "~/Qualy/ReporteQualyConsolidado", OrdenMenu = 10, SubgrupoMenu = "Qualys" });
                #endregion

                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion

                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                // rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Reportes", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion

                if (matriculasBajaServidores.Contains(matricula))
                {
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Baja de servidores", LinkMenu = "~/Vista/VistaBajaServidores", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                }
                //try
                //{
                //    var user = System.Web.HttpContext.Current.Session["Usuario"];
                //    if (user != null)
                //    {
                //        var matriculaAutorizador = string.Empty;
                //        var configuracion = Settings.Get<int>("Configuracion.Id");
                //        if (configuracion == 1) //Desa ITS
                //            matriculaAutorizador = "S71871";
                //        else if (configuracion == 2) //Desa BCP
                //            matriculaAutorizador = "S71871";
                //        else if (configuracion == 3) //Prod BCP
                //            matriculaAutorizador = "U19211";
                //        else
                //            matriculaAutorizador = string.Empty;

                //        var userObj = (Usuario_Storage)user;
                //        if (matriculaAutorizador == userObj.UsuarioBCP_Dto.Matricula)
                //        {
                //            #region SoporteCVT
                //            rpta.Add(new MenuMantenimientoDTO() { Icono = "list", GrupoMenu = "Soporte CVT", Menu = "Blobs", LinkMenu = "~/Configuracion/Blobs", OrdenMenu = 10, SubgrupoMenu = string.Empty });
                //            #endregion
                //        }

                //        //var matriculasVistaDependencias = ObtenerParametroCVT("MATRICULAS_ACCESO_DEPENDENCIAS");
                //        //var listMatriculas = string.IsNullOrEmpty(matriculasVistaDependencias) ? new string[] { } : matriculasVistaDependencias.Split(',');

                //        //if (listMatriculas.Contains(userObj.UsuarioBCP_Dto.Matricula))
                //        //{
                //        //    #region Dependencia de Aplicaciones
                //        //    rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                //        //    #endregion
                //        //}
                //    }
                //}
                //catch (Exception ex)
                //{
                //    log.Error(ex.Message, ex);
                //}

            }

            else if (perfil == (int)EPerfilBCP.Consultor)
            {
                #region Configuración
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Aplicaciones", LinkMenu = "~/Vista/AplicacionConsultor", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Vista/ReporteAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vulnerabilidades", LinkMenu = "~/Vista/Vulnerabilidades", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interfaz CMDB-BigFix", LinkMenu = "~/Vista/BigFix", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Relaciones y formatos                
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Relacionamiento entre componentes", LinkMenu = "~/Relacion/RelacionamientoComponentesConsultor", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion

                if (matriculasBajaServidores.Contains(matricula))
                {
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Baja de servidores", LinkMenu = "~/Vista/VistaBajaServidores", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                }
            }
            else if (perfil == (int)EPerfilBCP.ETICMDB)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos desactivados", LinkMenu = "~/Configuracion/EquiposDesactivados", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detalle de estado de tecnologías", LinkMenu = "~/Dashboard/TecnologiaDetallado", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipo", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Familias relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipoFabricante", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías sin relación con aplicaciones y equipos", LinkMenu = "~/Dashboard/TecnologiasSinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado, uso e instalaciones", LinkMenu = "~/Dashboard/DetalleTecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologias sin fecha fin", LinkMenu = "~/Dashboard/TecnologiaSinFechaFin", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte por dueño de tecnología", LinkMenu = "~/Dashboard/Owner", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });


                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Aplicación", LinkMenu = "~/Dashboard/Aplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado de obsolescencia de aplicaciones", LinkMenu = "~/Dashboard/Agrupacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado por aplicaciones y/o tecnologías", LinkMenu = "~/Dashboard/AplicacionTecnologia", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Equipo", LinkMenu = "~/Dashboard/Equipo", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Evolución por subdominios", LinkMenu = "~/Dashboard/EvolucionSubdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Equipos sin relación con aplicaciones", LinkMenu = "~/Dashboard/SinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Equipos" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones general", LinkMenu = "~/Dashboard/TecnologiaInstalaciones", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones por subdominios", LinkMenu = "~/Dashboard/TecnologiaInstalacionesSO", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por equipos", LinkMenu = "~/Indicadores/GerencialEquipos", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por tecnologías", LinkMenu = "~/Indicadores/GerencialTecnologias", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por aplicaciones", LinkMenu = "~/Indicadores/GerencialAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });

                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Indicadores", LinkMenu = "~/Dashboard/StorageIndicadores", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Volúmenes", LinkMenu = "~/Dashboard/Storage", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por equipos", LinkMenu = "~/Dashboard/StorageEquipos", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por aplicaciones", LinkMenu = "~/Dashboard/StorageAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen por volumen", LinkMenu = "~/Dashboard/StorageResumen", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen por infraestructura", LinkMenu = "~/Dashboard/StorageResumen2", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Backup Open", LinkMenu = "~/Dashboard/StorageBackupOpen", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Backup Open - Resumen", LinkMenu = "~/Dashboard/StorageBackupOpenResumen", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Backup Mainframe", LinkMenu = "~/Dashboard/StorageBackupMainframe", OrdenMenu = 4, SubgrupoMenu = "Storage & Backups" });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Configuración
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Aplicaciones", LinkMenu = "~/Configuracion/Aplicacion", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Ambientes", LinkMenu = "~/Configuracion/Ambiente", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Dominios de red", LinkMenu = "~/Configuracion/DominioRed", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Gestión de equipos", LinkMenu = "~/Configuracion/Equipo", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Equipos excluidos", LinkMenu = "~/Configuracion/EquipoExclusion", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de las Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tecnologías", LinkMenu = "~/GestionTecnologia/NewTecnologia", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tecnologías no registradas", LinkMenu = "~/GestionTecnologia/TecnologiaNoRegistrada", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });

                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion

                if (matriculasBajaServidores.Contains(matricula))
                {
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Baja de servidores", LinkMenu = "~/Vista/VistaBajaServidores", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                }
            }
            else if (perfil == (int)EPerfilBCP.GestorTecnologia)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detalle de estado de tecnologías", LinkMenu = "~/Dashboard/TecnologiaDetallado", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipo", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Familias relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipoFabricante", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías sin relación con aplicaciones y equipos", LinkMenu = "~/Dashboard/TecnologiasSinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado, uso e instalaciones", LinkMenu = "~/Dashboard/DetalleTecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologias sin fecha fin", LinkMenu = "~/Dashboard/TecnologiaSinFechaFin", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Equipo", LinkMenu = "~/Dashboard/Equipo", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Evolución por subdominios", LinkMenu = "~/Dashboard/EvolucionSubdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Equipos sin relación con aplicaciones", LinkMenu = "~/Dashboard/SinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Equipos" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones general", LinkMenu = "~/Dashboard/TecnologiaInstalaciones", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones por subdominios", LinkMenu = "~/Dashboard/TecnologiaInstalacionesSO", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });
                #endregion
                #region Gestión de las Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tipo de tecnología", LinkMenu = "~/GestionTecnologia/Tipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tipo de arquetipo", LinkMenu = "~/GestionTecnologia/TipoArquetipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Entorno del arquetipo", LinkMenu = "~/GestionTecnologia/Entorno", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Familias", LinkMenu = "~/GestionTecnologia/Familia", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Dominios", LinkMenu = "~/GestionTecnologia/Dominio", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Subdominios", LinkMenu = "~/GestionTecnologia/SubDominio", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Productos", LinkMenu = "~/GestionProducto", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tecnologías", LinkMenu = "~/GestionTecnologia/NewTecnologia", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Arquetipos", LinkMenu = "~/GestionTecnologia/Arquetipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tecnologías desactivadas", LinkMenu = "~/GestionTecnologia/TecnologiaDesactivada", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Tecnologías no registradas", LinkMenu = "~/GestionTecnologia/TecnologiaNoRegistrada", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Estándar restringido", LinkMenu = "~/GestionTecnologia/ExcepcionTipo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Excepción por riesgo", LinkMenu = "~/GestionTecnologia/ExcepcionRiesgo", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Reporte de tecnologías", LinkMenu = "~/GestionTecnologia/ReporteTecnologia", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Gestión de las tecnologías", Menu = "Reporte de instalaciones", LinkMenu = "~/GestionTecnologia/Instalaciones", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.ArquitectoTecnologia)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detalle de estado de tecnologías", LinkMenu = "~/Dashboard/TecnologiaDetallado", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipo", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Familias relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipoFabricante", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías sin relación con aplicaciones y equipos", LinkMenu = "~/Dashboard/TecnologiasSinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado, uso e instalaciones", LinkMenu = "~/Dashboard/DetalleTecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologias sin fecha fin", LinkMenu = "~/Dashboard/TecnologiaSinFechaFin", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte por dueño de tecnología", LinkMenu = "~/Dashboard/Owner", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.Seguridad)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos desactivados", LinkMenu = "~/Configuracion/EquiposDesactivados", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vulnerabilidades", LinkMenu = "~/Vista/Vulnerabilidades", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detalle de estado de tecnologías", LinkMenu = "~/Dashboard/TecnologiaDetallado", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipo", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Familias relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipoFabricante", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías sin relación con aplicaciones y equipos", LinkMenu = "~/Dashboard/TecnologiasSinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado, uso e instalaciones", LinkMenu = "~/Dashboard/DetalleTecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologias sin fecha fin", LinkMenu = "~/Dashboard/TecnologiaSinFechaFin", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                #endregion
                #region Alertas y Notificaciones                
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "URLs Aplicación", LinkMenu = "~/Alertas/UrlAplicacion", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.Auditoria)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos desactivados", LinkMenu = "~/Configuracion/EquiposDesactivados", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vulnerabilidades", LinkMenu = "~/Vista/Vulnerabilidades", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard Obsolescencia                    
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.Coordinador)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard Obsolescencia                                        
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                // --> 2022-04-20 - Se agrega la opción
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                // <--
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion

                if (matriculasBajaServidores.Contains(matricula))
                {
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Baja de servidores", LinkMenu = "~/Vista/VistaBajaServidores", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                }
            }
            else if (perfil == (int)EPerfilBCP.Operador)
            {
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion

                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion

                if (matriculasBajaServidores.Contains(matricula))
                {
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Baja de servidores", LinkMenu = "~/Vista/VistaBajaServidores", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                }
            }
            else if (perfil == (int)EPerfilBCP.Subsidiaria)
            {
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.Gerente)
            {
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Familias relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipoFabricante", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones general", LinkMenu = "~/Dashboard/TecnologiaInstalaciones", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Instalaciones por subdominios", LinkMenu = "~/Dashboard/TecnologiaInstalacionesSO", OrdenMenu = 4, SubgrupoMenu = "Estándares y Consolidado" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por equipos", LinkMenu = "~/Indicadores/GerencialEquipos", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por tecnologías", LinkMenu = "~/Indicadores/GerencialTecnologias", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Por aplicaciones", LinkMenu = "~/Indicadores/GerencialAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Indicadores gerenciales" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte de responsables IP", LinkMenu = "~/Dashboard/ResponsablesIP", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Reporte de identificación IP", LinkMenu = "~/Dashboard/RelevamientoIP", OrdenMenu = 4, SubgrupoMenu = "Equipos" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Tecnologías vencidas y por vencer", LinkMenu = "~/Configuracion/ReporteTecnologiaVencidaPorVencer", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });

                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                
                if (matriculasBajaServidores.Contains(matricula))
                {
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Baja de servidores", LinkMenu = "~/Vista/VistaBajaServidores", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                }
            }
            else if (perfil == (int)EPerfilBCP.ArquitectoFuncional)
            {
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.ArquitectoSeguridad)
            {
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por Tecnologías", LinkMenu = "~/Dashboard/Tecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detalle de estado de tecnologías", LinkMenu = "~/Dashboard/TecnologiaDetallado", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipo", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Familias relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipoFabricante", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías sin relación con aplicaciones y equipos", LinkMenu = "~/Dashboard/TecnologiasSinRelaciones", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Estado, uso e instalaciones", LinkMenu = "~/Dashboard/DetalleTecnologia", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologias sin fecha fin", LinkMenu = "~/Dashboard/TecnologiaSinFechaFin", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.PortafolioAplicaciones)
            {
                #region Configuración
                rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Aplicaciones", LinkMenu = "~/Vista/AplicacionConsultor", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                #endregion
                #region Dashboard obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Vista/ReporteAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }
            else if (perfil == (int)EPerfilBCP.GestorCVT_CatalogoTecnologias)
            {
                #region Equipos y aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos / activos TI", LinkMenu = "~/Vista/Equipos", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por equipos desactivados", LinkMenu = "~/Configuracion/EquiposDesactivados", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por relaciones", LinkMenu = "~/Vista/Relaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vista por aplicaciones", LinkMenu = "~/Vista/Aplicaciones", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Vulnerabilidades", LinkMenu = "~/Vista/Vulnerabilidades", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Ventana de mantenimiento", LinkMenu = "~/Vista/Ventana", OrdenMenu = 3, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "server", GrupoMenu = "Equipos y aplicaciones", Menu = "Interacciones entre servidores", LinkMenu = "~/Guardicore/Connection", OrdenMenu = 3, SubgrupoMenu = string.Empty });

                #endregion
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Tecnologías relacionadas con equipos/aplicaciones", LinkMenu = "~/Dashboard/TecnologiaEquipo", OrdenMenu = 4, SubgrupoMenu = "Tecnologías" });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Gráficos por dominios y subdominios a una fecha ", LinkMenu = "~/Dashboard/Subdominios", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                
                #endregion
                #region Alertas y Notificaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bell-o", GrupoMenu = "Gobierno: Alertas y notificaciones", Menu = "Tecnologías no registradas", LinkMenu = "~/GestionTecnologia/TecnologiaNoRegistrada", OrdenMenu = 6, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Tecnologías vencidas y por vencer", LinkMenu = "~/Configuracion/ReporteTecnologiaVencidaPorVencer", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Reporte de cambio/baja de Owner tecnologías", LinkMenu = "~/GestionTecnologia/ReporteCambioBajasOwnerTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Vista Owners
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de tecnologías por owner", LinkMenu = "~/Vista/VistaOwnerTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de productos por owner", LinkMenu = "~/Vista/VistaOwnerProducto", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "KPI Obsolescencia Tecnología", LinkMenu = "~/Vista/VistaObsolescenciaTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }

            else if (perfil == (int)EPerfilBCP.GestorUnit)
            {
                #region Dashboard Obsolescencia
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Detallado aplicaciones, equipos y tecnologías", LinkMenu = "~/Dashboard/GerenciaDivision", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Resumen de aplicaciones", LinkMenu = "~/Dashboard/ResumenAplicaciones", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Aplicaciones", LinkMenu = "~/Vista/VistaObsolescenciaAplicacion", OrdenMenu = 4, SubgrupoMenu = "Aplicaciones" });
                #endregion
                #region Relaciones y formatos
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Bandeja de aprobación", LinkMenu = "~/Relacion/Bandeja", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS del usuario", LinkMenu = "~/Relacion/CISConfiguracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Formatos CIS configurados", LinkMenu = "~/Relacion/CISAdministracion", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Validación de relaciones por aplicación", LinkMenu = "~/Relacion/InformacionAplicaciones", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "link", GrupoMenu = "Relaciones y formatos", Menu = "Consulta de Aplicaciones validadas", LinkMenu = "~/Relacion/AplicacionesValidas", OrdenMenu = 5, SubgrupoMenu = string.Empty });
                #endregion
                #region Portafolio
                if (!activarPAPP)
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/Listado", OrdenMenu = 7, SubgrupoMenu = string.Empty });
                else
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "briefcase", GrupoMenu = "Portafolio de aplicaciones", Menu = "Listado de aplicaciones", LinkMenu = "~/portafolioaplicaciones/ListadoAplicaciones", OrdenMenu = 7, SubgrupoMenu = string.Empty });

                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de estándares", LinkMenu = "~/Vista/EstandaresTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Catálogo de tecnologías", LinkMenu = "~/Vista/CatalogoTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Dependencia de Aplicaciones
                rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Dependencia de Aplicaciones", Menu = "Consultas", LinkMenu = "~/DependenciasApps/Consultas", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
                #region Tecnologías
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Modificación de tecnologías", LinkMenu = "~/GestionTecnologia/TecnologiaModificacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Bandeja de solicitudes de modificación", LinkMenu = "~/GestionTecnologia/BandejaFlujosAprobacion", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                #endregion
                #region Gestión de Umbrales
                //rpta.Add(new MenuMantenimientoDTO() { Icono = "folder-open-o", GrupoMenu = "Gestión de Umbrales", Menu = "Consultas & Registro", LinkMenu = "~/GestionUmbrales/ConsultasRegistro", OrdenMenu = 21, SubgrupoMenu = string.Empty });
                #endregion
            }

            if (roles != null)
            {
                // //ADMIN DE MATRIZ DE ROLES
                if (roles.Contains("E195_Administrador"))
                {
                    flag_gestorDependencias = true;

                    #region Roles por Producto
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Roles por producto - Función", Menu = "Roles por Producto", LinkMenu = "~/RolesProducto/RolesProducto", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Roles por producto - Función", Menu = "Bandeja de Aprobaciones de Roles", LinkMenu = "~/RolesProducto/BandejaRolesSolicitante", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Roles por producto - Función", Menu = "Funciones por Rol", LinkMenu = "~/RolesProducto/RolesProductosFuncion", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                    //rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Roles por producto - Función", Menu = "Bandeja de Solicitudes de Funciones", LinkMenu = "~/RolesProducto/BandejaFuncionesSolicitante", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                    #endregion
                }
                else
                {
                    #region Roles por Producto
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Roles por producto - Función", Menu = "Roles por Producto", LinkMenu = "~/RolesProducto/RolesProducto", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "database", GrupoMenu = "Roles por producto - Función", Menu = "Bandeja de Aprobaciones de Roles", LinkMenu = "~/RolesProducto/BandejaRolesSolicitante", OrdenMenu = 2, SubgrupoMenu = string.Empty });
                    #endregion
                }

                if (roles.Contains("E195_GestorGuardicore") && perfil != (int)EPerfilBCP.Administrador)
                {
                    #region Portafolio
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Gestion Etiquetado", LinkMenu = "~/Guardicore/gestionetiquetado", OrdenMenu = 10, SubgrupoMenu = "Guardicore" });
                    #endregion
                }

                if (roles.Contains("E195_GestorQualys") && perfil != (int)EPerfilBCP.Administrador)
                {
                    #region Portafolio
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "wifi", GrupoMenu = "Integraciones", Menu = "Qualys - Registro de Vulnerabilidades", LinkMenu = "~/Configuracion/RegistroVulnerabilidadesQualy", OrdenMenu = 10, SubgrupoMenu = "Qualys" });
                    #endregion
                }

                if (roles.Contains("E195_OwnerKPI_IngenieroTecnologia") && perfil != (int)EPerfilBCP.Administrador)
                {
                    #region Vista Owners
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de tecnologías por owner", LinkMenu = "~/Vista/VistaOwnerTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de productos por owner", LinkMenu = "~/Vista/VistaOwnerProducto", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "KPI Obsolescencia Tecnología", LinkMenu = "~/Vista/VistaObsolescenciaTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    #endregion
                }
                else if (roles.Contains("E195_OwnerKPI_LiderSquad") && perfil != (int)EPerfilBCP.Administrador)
                {
                    #region Vista Owners
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de tecnologías por owner", LinkMenu = "~/Vista/VistaOwnerTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de productos por owner", LinkMenu = "~/Vista/VistaOwnerProducto", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "KPI Obsolescencia Tecnología", LinkMenu = "~/Vista/VistaObsolescenciaTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    #endregion
                }
                else if (roles.Contains("E195_OwnerKPI_LiderCOE") && perfil != (int)EPerfilBCP.Administrador)
                {
                    #region Vista Owners
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de tecnologías por owner", LinkMenu = "~/Vista/VistaOwnerTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "Vista de productos por owner", LinkMenu = "~/Vista/VistaOwnerProducto", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "terminal", GrupoMenu = "Tecnologías", Menu = "KPI Obsolescencia Tecnología", LinkMenu = "~/Vista/VistaObsolescenciaTecnologia", OrdenMenu = 8, SubgrupoMenu = string.Empty });
                    #endregion
                }

                if (roles.Contains("E195_GestionEquiposRed") && perfil != (int)EPerfilBCP.Administrador)
                {
                    #region Portafolio
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "cogs", GrupoMenu = "Configuración", Menu = "Modelos de Hardware", LinkMenu = "~/Configuracion/ModeloHardware", OrdenMenu = 1, SubgrupoMenu = string.Empty });
                    #endregion
                }

                //Menu asociado a la gestión de appliances
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bookmark", GrupoMenu = "Appliance", Menu = "Flujos de aprobación de solicitudes", LinkMenu = "~/Flujos/SolicitudEquipo", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "bookmark", GrupoMenu = "Appliance", Menu = "Appliance de aplicaciones", LinkMenu = "~/Configuracion/EquipoAppliance", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                if (roles.Contains("E195_Administrador")
                    || roles.Contains("E195_Seguridad")
                    || roles.Contains("E195_Auditoria")
                    || roles.Contains("E195_GestorCVTCatalogoTecnologias"))
                {
                    rpta.Add(new MenuMantenimientoDTO() { Icono = "bookmark", GrupoMenu = "Appliance", Menu = "Appliance/Activos TSI - Seguridad", LinkMenu = "~/Configuracion/EquipoFisico", OrdenMenu = 0, SubgrupoMenu = string.Empty });
                }

                if (roles.Contains("E195_Administrador") || roles.Contains("E195_GestorCVTCatalogoTecnologias")) { rpta.Add(new MenuMantenimientoDTO() { Icono = "bookmark", GrupoMenu = "Appliance", Menu = "Bandeja de aprobación CVT", LinkMenu = "~/Flujos/BandejaAprobacionCvt", OrdenMenu = 0, SubgrupoMenu = string.Empty }); }

                //Menu Dependencia de Aplicaciones
                if (roles.Contains("E195_GestorDependencias"))
                {
                    flag_gestorDependencias = true;
                }
                HttpContext.Current.Session["flag_gestorDependencias"] = flag_gestorDependencias;
            }

            if (perfilesObsolescenciaHardware.Contains(perfil.ToString()))
            {
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Obsolescencia Hardware", LinkMenu = "~/Dashboard/ObsolescenciaHardwareDetallado", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
                rpta.Add(new MenuMantenimientoDTO() { Icono = "tachometer", GrupoMenu = "Dashboard Obsolescencia", Menu = "Vista por KPI Obsolescencia Hardware", LinkMenu = "~/Dashboard/ObsolescenciaHardwareKPI", OrdenMenu = 4, SubgrupoMenu = "Equipos" });
            }
            
            return rpta;
        }

        public static bool ObtenerParametroPortafolio(string parametro)
        {
            var retorno = false;
            var dt = new System.Data.DataTable();
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                using (var cnx = new System.Data.SqlClient.SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var cmd = new System.Data.SqlClient.SqlCommand(string.Format("select Valor from app.ParametroApp where Codigo='{0}'", parametro)))
                    {
                        cmd.Connection = cnx;
                        cmd.CommandType = System.Data.CommandType.Text;
                        var adapter = new System.Data.SqlClient.SqlDataAdapter(cmd);
                        adapter.Fill(dt);
                    }
                    cnx.Close();
                }

                retorno = bool.Parse(dt.Rows[0]["Valor"].ToString());
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
            }

            return retorno;
        }

        public static string ObtenerParametroCVT(string parametro)
        {
            var retorno = "";
            var dt = new System.Data.DataTable();
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                using (var cnx = new System.Data.SqlClient.SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var cmd = new System.Data.SqlClient.SqlCommand(string.Format("select Valor from cvt.Parametro where Codigo='{0}'", parametro), cnx))
                    {
                        SqlDataReader rdr = cmd.ExecuteReader();
                        while (rdr.Read())
                        {
                            retorno = rdr["Valor"].ToString();
                        }
                    }
                    cnx.Close();
                }
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
            }

            return retorno;
        }

        public static List<MenuMantenimientoDTO> ObtenerSeccionesPaginas()
        {
            //var secciones = new List<string>();
            var paginas = new List<MenuMantenimientoDTO>();

            var user = HttpContext.Current.Session["Usuario"];
            if (user == null) return paginas;

            paginas = ((Usuario_Storage)user).Paginas;

            paginas = paginas.GroupBy(x => new { x.GrupoMenu, x.Icono, x.OrdenMenu }).OrderBy(y => y.Key.OrdenMenu).Select(p => new MenuMantenimientoDTO() { GrupoMenu = p.Key.GrupoMenu, Icono = p.Key.Icono }).ToList();

            return paginas;

        }

        public static Proyecciones ObtenerProyecciones()
        {
            var user = ObtenerUsuario();
            Proyecciones proyecciones = null;
            if (user == null) return proyecciones;
            proyecciones = new Proyecciones();
            proyecciones.MesProyeccion1 = user.Proyeccion1;
            proyecciones.MesProyeccion2 = user.Proyeccion2;

            return proyecciones;
        }

        public static string ObtenerDataAPI()
        {
            using (var client = new HttpClient())
            {
                string retorno = string.Empty;
                string URL_API = Utilitarios.URL_API + "/";
                client.BaseAddress = new Uri(URL_API);
                string url_metodo = string.Format("Aplicacion/GestionAplicacion/GetParametroApp?Codigo={0}", Utilitarios.CODIGO_MATRICULAS_ADMIN_PORTAFOLIO);
                var responseTask = client.GetAsync(url_metodo);
                responseTask.Wait();

                var result = responseTask.Result;
                if (result.IsSuccessStatusCode)
                {
                    var readTask = result.Content.ReadAsStringAsync();
                    readTask.Wait();

                    retorno = readTask.Result;
                    retorno = retorno.Replace("\"", "");
                    return retorno;
                }

                return retorno;
            }
        }

        public static string ObtenerMatriculaDataAPI(string correo)
        {
            using (var client = new HttpClient())
            {
                string retorno = string.Empty;
                string URL_API = Utilitarios.URL_API + "/";
                client.BaseAddress = new Uri(URL_API);
                string url_metodo = string.Format("Login/DevolverMatricula?Correo={0}", correo);
                var responseTask = client.GetAsync(url_metodo);
                responseTask.Wait();

                var result = responseTask.Result;
                if (result.IsSuccessStatusCode)
                {
                    var readTask = result.Content.ReadAsStringAsync();
                    readTask.Wait();

                    retorno = readTask.Result;
                    retorno = retorno.Replace("\"", "");
                    return retorno;
                }

                return retorno;
            }
        }

        public static bool ValidarAccesoAdmin(string Matricula)
        {
            bool retorno = true;
            return retorno;
        }

        public static string ObtenerRolAplicacion()
        {
            var user = System.Web.HttpContext.Current.Session["Usuario"];
            if (user != null)
            {
                var usu = (Usuario_Storage)user;
                var rol = ServiceManager<InfoAplicacionDAO>.Provider.GetRolAplicacion(usu.UserName);
                return rol;
            }
            else
                return null;
        }

        public static string GetEnumDescription(Enum value)
        {
            try
            {
                if (value.ToString() == "-1")
                    return string.Empty;

                FieldInfo fi = value.GetType().GetField(value.ToString());

                DescriptionAttribute[] attributes =
                    (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);

                if (attributes != null && attributes.Length > 0)
                    return attributes[0].Description;
                else
                    return value.ToString();

            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

    }
}