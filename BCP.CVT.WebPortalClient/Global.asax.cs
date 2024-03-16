using BCP.CVT.Cross;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace BCP.CVT.WebPortalClient
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {           

            MvcHandler.DisableMvcResponseHeader = true;

            AreaRegistration.RegisterAllAreas();
            GlobalFilters.Filters.Add(new HandleErrorAttribute());
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            var cache = new MemoryCacheManager<string>();
              

            Constantes.AzureAppSecret = cache.GetCache("AzureAppSecret");
            bool resultAzureAppSecret = true;
            if (Constantes.AzureAppSecret == null)
            {
                if (!Settings.Get<bool>("Secretos.Local.Activar"))
                    Constantes.AzureAppSecret = cache.GetOrCreate("AzureAppSecret", AzureUtilitarios.GetSecret(Settings.Get<string>("Azure.KeyVault.Secret.SecretAPP"), out resultAzureAppSecret));
                else
                    Constantes.AzureAppSecret = Settings.Get<string>("Secretos.E195-SecretAPP");
            }

            bool resultServer = true;
            Constantes.ServidorSQL = cache.GetCache("ServidorSQL");
            if (Constantes.ServidorSQL == null)
            {
                if (!Settings.Get<bool>("Secretos.Local.Activar"))
                    Constantes.ServidorSQL = cache.GetOrCreate("ServidorSQL", AzureUtilitarios.GetSecret(Settings.Get<string>("Azure.KeyVault.Secret.ServerSQL"), out resultServer));
                else
                    Constantes.ServidorSQL = Settings.Get<string>("Secretos.E195-ServidorAzureSQL");
            }

            bool resultBd = true;
            Constantes.BaseDatosSQL = cache.GetCache("BaseDatosSQL");
            if (Constantes.BaseDatosSQL == null)
            {
                if (!Settings.Get<bool>("Secretos.Local.Activar"))
                    Constantes.BaseDatosSQL = cache.GetOrCreate("BaseDatosSQL", AzureUtilitarios.GetSecret(Settings.Get<string>("Azure.KeyVault.Secret.BDSQL"), out resultBd));
                else
                    Constantes.BaseDatosSQL = Settings.Get<string>("Secretos.E195-BDAzureSQL");
            }

            bool resultUsuario = true;
            Constantes.UsuarioSQL = cache.GetCache("UsuarioSQL");
            if (Constantes.UsuarioSQL == null)
            {
                if (!Settings.Get<bool>("Secretos.Local.Activar"))
                    Constantes.UsuarioSQL = cache.GetOrCreate("UsuarioSQL", AzureUtilitarios.GetSecret(Settings.Get<string>("Azure.KeyVault.Secret.UserSQL"), out resultUsuario));
                else
                    Constantes.UsuarioSQL = Settings.Get<string>("Secretos.E195-UsuarioBD");
            }

            Constantes.PasswordSQL = cache.GetCache("PasswordSQL");
            bool resultPassword = true;
            if (Constantes.PasswordSQL == null)
            {
                if (!Settings.Get<bool>("Secretos.Local.Activar"))
                    Constantes.PasswordSQL = cache.GetOrCreate("PasswordSQL", AzureUtilitarios.GetSecret(Settings.Get<string>("Azure.KeyVault.Secret.PwdSQL"), out resultPassword));
                else
                    Constantes.PasswordSQL = Settings.Get<string>("Secretos.E195-UsuarioContrasenia");
            }

            try
            {
                Constantes.StorageName = cache.GetCache("StorageNombre");
                bool resultStorageName = true;
                if (Constantes.StorageName == null)
                {
                    if (!Settings.Get<bool>("Secretos.Local.Activar"))
                        Constantes.StorageName = cache.GetOrCreate("StorageNombre", AzureUtilitarios.GetSecret(Settings.Get<string>("Azure.KeyVault.Secret.StorageName"), out resultStorageName));
                    else
                        Constantes.StorageName = Settings.Get<string>("Secretos.E195-StorageNombre");
                }

                Constantes.StorageKey = cache.GetCache("StorageKey");
                bool resultStorageClave = true;
                if (Constantes.StorageKey == null)
                {
                    if (!Settings.Get<bool>("Secretos.Local.Activar"))
                        Constantes.StorageKey = cache.GetOrCreate("StorageKey", AzureUtilitarios.GetSecret(Settings.Get<string>("Azure.KeyVault.Secret.StorageKey"), out resultStorageClave));
                    else
                        Constantes.StorageKey = Settings.Get<string>("Secretos.E195-StorageClave");
                }
            }
            catch (Exception ex)
            {

            }

           
            //Constantes.GraphAuthToken = new AzureUtilitarios().GetGraphAuthToken();

        }

        protected void Session_Start() { }

        //protected void Application_Error(object sender, EventArgs e)
        //{
        //    Exception exc = Server.GetLastError();
        //    ExceptionManager.Instance.ManageException(exc);

        //    if (exc.GetType() == typeof(HttpException))
        //    {
        //        if (exc.Message.Contains("NoCatch") || exc.Message.Contains("maxUrlLength"))
        //            return;

        //        Server.ClearError();
        //        var URL = "~/Login/PaginaErrorLogin";
        //        Server.Transfer(URL);
        //    }
        //    else
        //    {
        //        var URL = "~/Login/PaginaErrorLogin";
        //        Server.Transfer(URL);
        //        Server.Transfer("~/ErrorPage.aspx");
        //    }
        //}
    }
}
