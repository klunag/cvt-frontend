using BCP.CVT.WebPortalClient.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace BCP.CVT.WebPortalClient.Controllers
{
    public class AdminPortafolioAuthorized : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {            
            var usuario = MetodosUtiles.getCurrentUser();

            if (usuario != null)
            {
                if (!usuario.FlagPortafolio)
                {
                    filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary { { "action", "Index" }, { "controller", "Home" } });
                }
            }
            else
            {
                filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary { { "action", "SignIn" }, { "controller", "Login" } });
            }

            base.OnActionExecuting(filterContext);
        }
    }
}