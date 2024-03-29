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
    
    public partial class Ambiente
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Ambiente()
        {
            this.Equipo = new HashSet<Equipo>();
        }
    
        public int AmbienteId { get; set; }
        public string DetalleAmbiente { get; set; }
        public bool Activo { get; set; }
        public string PrefijoBase { get; set; }
        public string PrefijoBase2 { get; set; }
        public string UsuarioCreacion { get; set; }
        public Nullable<System.DateTime> FechaCreacion { get; set; }
        public string UsuarioModificacion { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
        public Nullable<int> DiaInicio { get; set; }
        public Nullable<int> DiaFin { get; set; }
        public string DiaInicio_HoraInicio { get; set; }
        public string DiaInicio_HoraFin { get; set; }
        public string DiaFin_HoraInicio { get; set; }
        public string DiaFin_HoraFin { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Equipo> Equipo { get; set; }
    }
}
