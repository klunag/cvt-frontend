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
    
    public partial class TecnologiaVinculada
    {
        public int TecnologiaVinculadaId { get; set; }
        public int TecnologiaId { get; set; }
        public int VinculoId { get; set; }
        public bool Activo { get; set; }
        public System.DateTime FechaCreacion { get; set; }
        public string UsuarioCreacion { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
        public string UsuarioModificador { get; set; }
    
        public virtual Tecnologia Tecnologia { get; set; }
        public virtual Tecnologia Tecnologia1 { get; set; }
    }
}