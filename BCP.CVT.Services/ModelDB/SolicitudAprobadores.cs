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
    
    public partial class SolicitudAprobadores
    {
        public int SolicitudAprobadoresId { get; set; }
        public int SolicitudAplicacionId { get; set; }
        public string Matricula { get; set; }
        public Nullable<bool> FlagAprobado { get; set; }
        public bool FlagActivo { get; set; }
        public string UsuarioCreacion { get; set; }
        public System.DateTime FechaCreacion { get; set; }
        public string UsuarioModificacion { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
        public string AprobadorPor { get; set; }
        public Nullable<System.DateTime> FechaAprobacion { get; set; }
        public Nullable<int> BandejaId { get; set; }
        public Nullable<int> EstadoAprobacion { get; set; }
    
        public virtual Bandeja Bandeja { get; set; }
    }
}