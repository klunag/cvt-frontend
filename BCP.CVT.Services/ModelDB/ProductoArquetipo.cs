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
    
    public partial class ProductoArquetipo
    {
        public int ProductoArquetipoId { get; set; }
        public int ProductoId { get; set; }
        public int ArquetipoId { get; set; }
        public bool FlagEliminado { get; set; }
        public string CreadoPor { get; set; }
        public System.DateTime FechaCreacion { get; set; }
        public string ModificadoPor { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
    
        public virtual Arquetipo Arquetipo { get; set; }
        public virtual Producto Producto { get; set; }
    }
}
