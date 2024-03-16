using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.DirectoryServices.AccountManagement;
using System.DirectoryServices.ActiveDirectory;
using System.Linq;
using System.Security.Principal;
using System.Web;

namespace BCP.CVT.WebPortalClient
{
    public class ADManager
    {
        /// <summary>
        /// LogonUser obtenido desde IIS usando la variable LOGON_USER
        /// </summary>
        public string LogonUser { get; set; }

        /// <summary>
        /// Valor del UPN del usuario, comunmente el correo electrónico
        /// </summary>
        public string UserPrincipalName { get; set; }
        public string Matricula { get; set; }
        /// <summary>
        /// Constructor
        /// </summary>
        public ADManager()
        {
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logonUser">Usuario asignado a la propiedad LogonUser</param>
        public ADManager(string logonUser)
        {
            LogonUser = logonUser;
        }

        /// <summary>
        /// Valida si el usuario pertenece al dominio del contexto
        /// </summary>
        public bool EsUsuarioDominio
        {
            get
            {
                SearchResult usuarioSR;
                try
                {
                    using (var searcher = Forest.GetCurrentForest().FindGlobalCatalog().GetDirectorySearcher())
                    {
                        NTAccount cuenta = new NTAccount(LogonUser);
                        SecurityIdentifier sidUsuario = (SecurityIdentifier)cuenta.Translate(typeof(SecurityIdentifier));

                        searcher.Filter = string.Format("(&(objectClass=user)(objectSid={0}))", sidUsuario.Value);

                        usuarioSR = searcher.FindOne();
                        UserPrincipalName = usuarioSR.Properties["userPrincipalName"][0].ToString();
                        Matricula = usuarioSR.Properties["sAMAccountName"][0].ToString();
                    }
                    return true;
                }
                catch (Exception)
                {
                    return false;
                }
            }
        }

        public void ObtenerMatriculaDominio()
        {
            //if(Settings.Get<)
            SearchResult usuarioSR;
            try
            {
                using (var searcher = Forest.GetCurrentForest().FindGlobalCatalog().GetDirectorySearcher())
                {
                    NTAccount cuenta = new NTAccount(LogonUser);
                    SecurityIdentifier sidUsuario = (SecurityIdentifier)cuenta.Translate(typeof(SecurityIdentifier));

                    searcher.Filter = string.Format("(&(objectClass=user)(objectSid={0}))", sidUsuario.Value);

                    usuarioSR = searcher.FindOne();
                    UserPrincipalName = usuarioSR.Properties["userPrincipalName"][0].ToString();
                    Matricula = usuarioSR.Properties["sAMAccountName"][0].ToString();
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Obtiene la lista de grupos a los que el usuario señalado pertenece
        /// </summary>
        /// <returns>Lista conteniendo el nombre de los grupos</returns>
        public List<string> ObtenerGrupos()
        {
            List<string> listaGrupos = new List<string>();

            if (string.IsNullOrEmpty(UserPrincipalName))
                return null;

            using (var contexto = new PrincipalContext(ContextType.Domain))
            {
                using (var usuarioContexto = new UserPrincipal(contexto))
                {
                    usuarioContexto.UserPrincipalName = this.UserPrincipalName;
                    usuarioContexto.Enabled = true;
                    using (var searcher = new PrincipalSearcher())
                    {
                        searcher.QueryFilter = usuarioContexto;
                        var searchResult = searcher.FindOne();
                        foreach (GroupPrincipal grupo in searchResult.GetGroups())
                        {
                            listaGrupos.Add(grupo.Name);
                        }
                    }
                }
            }
            return listaGrupos;
        }
    }
}