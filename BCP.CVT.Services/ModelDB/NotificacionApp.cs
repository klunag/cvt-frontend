//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace BCP.CVT.Services.ModelDB
{
    using System;
    using System.Collections.Generic;
    
    public partial class NotificacionApp
    {
        public int NotificacionId { get; set; }
        public int TipoNotificacionId { get; set; }
        public string Nombre { get; set; }
        public string De { get; set; }
        public string Para { get; set; }
        public string CC { get; set; }
        public string BCC { get; set; }
        public string Cuerpo { get; set; }
        public string Asunto { get; set; }
        public Nullable<bool> FlagEnviado { get; set; }
        public Nullable<System.DateTime> FechaEnvio { get; set; }
        public bool Activo { get; set; }
        public string UsuarioCreacion { get; set; }
        public System.DateTime FechaCreacion { get; set; }
        public string UsuarioModificacion { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
    
        public virtual TipoNotificacionApp TipoNotificacionApp { get; set; }
    }
}