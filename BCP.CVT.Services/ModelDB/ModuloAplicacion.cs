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
    
    public partial class ModuloAplicacion
    {
        public int ModuloAplicacionId { get; set; }
        public string CodigoAPT { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
        public bool FlagActivo { get; set; }
        public string UsuarioCreacion { get; set; }
        public System.DateTime FechaCreacion { get; set; }
        public string UsuarioModificacion { get; set; }
        public Nullable<System.DateTime> FechaModificacion { get; set; }
        public string TipoDesarrollo { get; set; }
        public string InfraestructuraModulo { get; set; }
        public string MetodoAutenticacion { get; set; }
        public string MetodoAutorizacion { get; set; }
        public string CategoriaTecnologica { get; set; }
        public string ModeloEntrega { get; set; }
        public string Contingencia { get; set; }
        public Nullable<bool> FlagOOR { get; set; }
        public Nullable<bool> FlagRatificaOOR { get; set; }
        public string CodigoInterfaz { get; set; }
        public string CompatibilidadHV { get; set; }
        public string NombreServidor { get; set; }
        public string CompatibilidadWindows { get; set; }
        public string CompatibilidadNavegador { get; set; }
        public string InstaladaDesarrollo { get; set; }
        public string InstaladaCertificacion { get; set; }
        public string InstaladaProduccion { get; set; }
        public string NCET { get; set; }
        public string NCLS { get; set; }
        public string NCG { get; set; }
        public string ResumenSeguridadInformacion { get; set; }
        public string EstadoModulo { get; set; }
        public Nullable<int> CriticidadId { get; set; }
    }
}