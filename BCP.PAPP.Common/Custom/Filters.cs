﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.PAPP.Common.Custom
{
    public class FilterAppsGestionado
    {
        public List<CustomAutocompleteApplication> Equipos { get; set; }
    }
    public class FiltersAppStepOne
    {
        public List<CustomAutocompleteApplication> GestionadPor { get; set; }
        public List<CustomAutocompleteApplication> TipoImplementacion { get; set; }
        public List<CustomAutocompleteApplication> ModeloEntrega { get; set; }
        public List<CustomAutocompleteApplication> Arquitecto { get; set; }
    }

    public class FiltersRolesProducto
    {
        public List<CustomAutocompleteApplication> Dominio { get; set; }
        public List<CustomAutocompleteApplication> SubDominio { get; set; }

        public List<CustomAutocompleteApplication> Tribus { get; set; }

        public List<CustomAutocompleteApplication> Squads { get; set; }


    }

    public class FiltersSolicitudFuncion
    {
        public List<CustomAutocompleteApplication> EstadoSolicitud { get; set; }



    }

    public class FiltersFuncionesProducto
    {
        public List<CustomAutocompleteApplication> Productos { get; set; }

        public List<CustomAutocompleteApplication> ProductosSolicitud { get; set; }
        public List<CustomAutocompleteApplication> Roles { get; set; }

        public List<CustomAutocompleteApplication> Tribu { get; set; }

        public List<CustomAutocompleteApplication> Chapter { get; set; }

        public List<CustomAutocompleteApplication> Funcion { get; set; }

    }
    public class FiltersAppStepTwo
    {
        public List<CustomAutocompleteApplication> GestionadoPorUserIT { get; set; }
        public List<CustomAutocompleteApplication> GestionadPor { get; set; }
        public List<CustomAutocompleteApplication> TipoImplementacion { get; set; }
        public List<CustomAutocompleteApplication> ModeloEntrega { get; set; }
        public List<CustomAutocompleteApplication> Arquitecto { get; set; }
        public List<CustomAutocompleteApplication> EntidadesUsuarias { get; set; }
        public List<CustomAutocompleteApplication> TipoDesarrollo { get; set; }
        public List<CustomAutocompleteApplication> Infraestructura { get; set; }
        public List<CustomAutocompleteApplication> MetodoAutenticacion { get; set; }
        public List<CustomAutocompleteApplication> MetodoAutorizacion { get; set; }
        public List<CustomAutocompleteApplication> GrupoTicketRemedy { get; set; }

        public List<CustomAutocompleteApplication> BIA { get; set; }
        public List<CustomAutocompleteApplication> ClasificacionActivos { get; set; }
        public List<CustomAutocompleteApplication> CriticidadFinal { get; set; }

        public List<CustomAutocompleteApplication> TipoPCI { get; set; }
    }

    public class FiltersDevSecOps
    {
        public List<CustomAutocompleteApplication> ModeloEntrega { get; set; }
        public List<CustomAutocompleteApplication> TipoActivo { get; set; }
    }

    public class FilterArquitectoEvaluador
    {
        public List<CustomAutocompleteApplication> TipoActivo { get; set; }
        public List<CustomAutocompleteApplication> AreaBIAN { get; set; }
        public List<CustomAutocompleteApplication> DominioBIAN { get; set; }
        public List<CustomAutocompleteApplication> TOBE { get; set; }
        public List<CustomAutocompleteApplication> Arquitecto { get; set; }
        public List<CustomAutocompleteApplication> Jefatura { get; set; }
        public List<CustomAutocompleteApplication> GestionadPor { get; set; }

    }


    public class FilterGestionadoPorExterna
    {
        public List<CustomAutocompleteApplication> TipoDesarrollo { get; set; }

        public List<CustomAutocompleteApplication> ModeloEntrega { get; set; }


        public List<CustomAutocompleteApplication> Infraestructura { get; set; }


    }

    public class CustomAutocompleteApplication
    {
        public string Id { get; set; }
        public string Descripcion { get; set; }
        public string Value { get; set; }
    }

    public class FilterArquitectoTI
    {
        public List<CustomAutocompleteApplication> Categoria { get; set; }
        public List<CustomAutocompleteApplication> Clasificacion { get; set; }
        public List<CustomAutocompleteApplication> SubClasificacion { get; set; }
        public List<CustomAutocompleteApplication> TipoActivo { get; set; }
    }

    public class FilterAdmin
    {
        public List<CustomAutocompleteApplication> Gerencia { get; set; }
        public List<CustomAutocompleteApplication> Division { get; set; }
        public List<CustomAutocompleteApplication> Unidad { get; set; }
        public List<CustomAutocompleteApplication> Area { get; set; }
        public List<CustomAutocompleteApplication> EstadoAplicacion { get; set; }
        public List<CustomAutocompleteApplication> ClasificacionTecnica { get; set; }
        public List<CustomAutocompleteApplication> SubClasificacionTecnica { get; set; }
        public List<CustomAutocompleteApplication> TipoActivo { get; set; }
        public List<CustomAutocompleteApplication> GestionadoPor { get; set; }

        public List<CustomAutocompleteApplication> TipoPCI { get; set; }



        public List<CustomAutocompleteApplication> LiderUsuario { get; set; }
    }

    public class FilterReporteCampos
    {
        public FilterAdmin FilterAdmin { get; set; }
        public List<CustomAutocompleteApplication> ListaCamposAgrupar { get; set; }
    }

    public class FilterGuardicore
    {
        public List<CustomAutocompleteApplication> types { get; set; }
        public List<CustomAutocompleteApplication> actions { get; set; }
        public List<CustomAutocompleteApplication> labelsOrigen { get; set; }
        public List<CustomAutocompleteApplication> labelsDestino { get; set; }
        public List<CustomAutocompleteApplication> ambienteOrigen { get; set; }
        public List<CustomAutocompleteApplication> ambienteDestino { get; set; }
    }

    public class Consolidado2
    {
        public List<CustomAutocompleteApplication> estado { get; set; }
    }

    public class InfoAplicacion
    {
        public List<CustomAutocompleteApplication> soportado { get; set; }
    }
}
