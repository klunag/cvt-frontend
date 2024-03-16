﻿using BCP.CVT.DTO;
using BCP.CVT.DTO.Custom;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.Services.Interface
{
    public abstract class RelacionDAO : ServiceProvider
    {
        public abstract List<RelacionDTO> GetRelacion(string codigoAPT
            , string componente
            , int pageNumber
            , int pageSize
            , string sortName
            , string sortOrder
            , string username
            , int? tipoId
            , int? estadoId
            , out int totalRows);
        public abstract List<RelacionDTO> GetRelacionSP(string codigoAPT
            , string componente
            , int pageNumber
            , int pageSize
            , string sortName
            , string sortOrder
            , string username
            , int? tipoId
            , int? estadoId
            , int perfil
            , out int totalRows);
        public abstract List<RelacionDTO> GetRelacionSP_2(PaginacionRelacion pag, out int totalRows);
        public abstract List<AplicacionRelacionDTO> GetAplicacionByFilter(PaginacionRelacionFilter pag, out int totalRows);
        public abstract long AddOrEditRelacion(RelacionDTO objRegistro);
        public abstract bool MassiveUpdateAplicacion(AplicacionTecnologiaDTO objRegistro);
        public abstract RelacionDTO GetRelacionById(long Id);
        public abstract List<CustomAutocomplete> GetEquipo();
        public abstract List<CustomAutocomplete> GetAplicacion();
        public abstract List<CustomAutocomplete> GetEquipo_Tecnologia();
        public abstract bool CambiarEstado(RelacionDTO objRegistro, DateTime? Fecha = null, bool FlagAdmin = false);
        public abstract List<RelacionDetalleDTO> GetRelacionDetalle(long Id);

        public abstract bool VerificarEliminada(string Id);
        public abstract bool ExisteRelacionTipoTecnologia(long id, string codigoAPT, int tecnologiaId, int? equipoId);
        public abstract bool ExisteRelacionTipoEquipo(long id, string codigoAPT, int ambienteId, int equipoId);
        public abstract bool ExisteRelacionTipoEquipo(string codigoAPT, int ambienteId, int equipoId);
        public abstract bool ExisteRelacionTipoEquipo(long id, string codigoAPT, int ambienteId, int equipoId, out long relacionId);
        public abstract bool ExisteTecnologiaEquipoActivaById(int id, int tipoRelacionId);

        // CALL TIME EXECUTION
        public abstract List<CustomAutocompleteRelacion> GetEquipoTecnologiaByEqId(int equipoId, string subdominioIds = null);
        public abstract List<RelacionDetalleDTO> GetAplicacionRelacionadaByEquipoId(int equipoId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows);

        #region APLICACION_VINCULADA
        public abstract List<CustomAutocomplete> GetEquipoByAplicacion(string codigoAPT);
        public abstract int RegistrarAplicacionVinculada(AplicacionVinculadaDTO objeto);
        public abstract List<AplicacionVinculadaDTO> GetAplicacionVinculada(string nombre, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows);
        #endregion

        public abstract List<VistaRelacionDto> GetVistaRelacion(string aplicacion
            , string equipo
            , List<int> ambienteIds
            , string jefe
            , string gestionado
            ,List<string> PCIS
            , int pageNumber
            , int pageSize
            , string sortName
            , string sortOrder
            , out int totalRows);

        public abstract List<VistaRelacionDto> GetVistaRelacionConsultor(string aplicacion
            , string equipo
            , List<int> ambienteIds
            , string jefe
            , string gestionado
            , int pageNumber
            , int pageSize
            , string sortName
            , string sortOrder
            , string matricula
            , out int totalRows);

        public abstract List<RelacionDTO> GetRelacionXTecnologiaId(int tecnologiaId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows);

        //public abstract long AddOrEditRelacionPublic(RelacionPublicDTO objRegistro);
        public abstract RespuestaDTO AddOrEditRelacionPublic(RelacionPublicDTO entidad);
        public abstract RespuestaDTO AddOrEditEquipoPublic(EquipoPublicDTO entidad);

        public abstract string GetComentarioByRelacionId(int RelacionId);

        public abstract bool EliminarRelacionDetalle(RelacionDTO objRegistro);
        public abstract bool ValidarRelacionEquipo(int EquipoId, DateTime Fecha);
    }
}
