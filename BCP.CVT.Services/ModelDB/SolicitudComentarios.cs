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
    
    public partial class SolicitudComentarios
    {
        public int SolicitudComentariosId { get; set; }
        public int SolicitudAplicacionId { get; set; }
        public string Comentarios { get; set; }
        public string UsuarioCreacion { get; set; }
        public System.DateTime FechaCreacion { get; set; }
        public string UsuarioModificacion { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
        public Nullable<int> TipoComentarioId { get; set; }
        public Nullable<int> BandejaId { get; set; }
        public string MatriculaResponsable { get; set; }
    }
}
