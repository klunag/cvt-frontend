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
    
    public partial class ParametricaDetalle
    {
        public int ParametricaDetalleId { get; set; }
        public int ParametricaId { get; set; }
        public string Descripcion { get; set; }
        public string Valor { get; set; }
        public bool FlagActivo { get; set; }
        public string CreadoPor { get; set; }
        public System.DateTime FechaCreacion { get; set; }
        public string ModificadoPor { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
        public Nullable<bool> FlagEliminado { get; set; }
        public string CodigoOpcional { get; set; }
    
        public virtual Parametrica Parametrica { get; set; }
    }
}
