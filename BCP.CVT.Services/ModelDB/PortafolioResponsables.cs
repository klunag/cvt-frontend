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
    
    public partial class PortafolioResponsables
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public PortafolioResponsables()
        {
            this.AplicacionPortafolioResponsables = new HashSet<AplicacionPortafolioResponsables>();
            this.NotificacionResponsableAplicacion = new HashSet<NotificacionResponsableAplicacion>();
        }
    
        public int PortafolioResponsableId { get; set; }
        public string Nombre { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<AplicacionPortafolioResponsables> AplicacionPortafolioResponsables { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<NotificacionResponsableAplicacion> NotificacionResponsableAplicacion { get; set; }
    }
}