﻿using BCP.CVT.Cross;
using BCP.CVT.DTO;
using BCP.CVT.DTO.Custom;
using BCP.CVT.Services.Interface;
using BCP.CVT.Services.ModelDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Data.Linq.Mapping;
using System.Data.SqlClient;
using System.Linq;
using System.Linq.Dynamic;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace BCP.CVT.Services.Service
{
    public class ProductoSvc : ProductoDAO
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        #region Producto
        public override int AddOrEditProducto(ProductoDTO objeto)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var historial = new HistorialModificacion();

                    if (objeto.Id == 0)
                    {
                        var entidad = new Producto()
                        {
                            ProductoId = objeto.Id,
                            Fabricante = objeto.Fabricante,
                            Nombre = objeto.Nombre,
                            Descripcion = objeto.Descripcion,
                            DominioId = objeto.DominioId,
                            SubDominioId = objeto.SubDominioId,
                            TipoProductoId = objeto.TipoProductoId,
                            EstadoObsolescenciaId = objeto.EstadoObsolescenciaId,
                            TribuCoeDisplayName = objeto.TribuCoeDisplayName,
                            TribuCoeId = objeto.TribuCoeId,
                            SquadDisplayName = objeto.SquadDisplayName,
                            SquadId = objeto.SquadId,
                            OwnerDisplayName = objeto.OwnerDisplayName,
                            OwnerId = objeto.OwnerId,
                            OwnerMatricula = objeto.OwnerMatricula,
                            GrupoTicketRemedyId = objeto.GrupoTicketRemedyId,
                            GrupoTicketRemedyNombre = objeto.GrupoTicketRemedyNombre,
                            EsAplicacion = objeto.EsAplicacion,
                            AplicacionId = objeto.AplicacionId,
                            Codigo = objeto.Codigo,
                            TipoCicloVidaId = objeto.TipoCicloVidaId,
                            EsquemaLicenciamientoSuscripcionId = objeto.EsquemaLicenciamientoSuscripcionId,
                            EquipoAdmContacto = objeto.EquipoAdmContacto,
                            EquipoAprovisionamiento = objeto.EquipoAprovisionamiento,
                            FlagActivo = true,
                            CreadoPor = objeto.UsuarioCreacion,
                            FechaCreacion = DateTime.Now,
                        };

                        ctx.Producto.Add(entidad);
                        ctx.SaveChanges();

                        string descripcionProducto = ObtenerCambiosProducto(objeto);

                        historial = new HistorialModificacion();
                        historial.Entidad = "Producto";
                        historial.Accion = "Creación";
                        historial.Id = entidad.ProductoId.ToString();
                        historial.EntidadAsociado = "Producto";
                        historial.AsociadoId = entidad.ProductoId.ToString();
                        historial.Descripcion = descripcionProducto;
                        historial.CreadoPor = objeto.UsuarioCreacion;
                        historial.FechaCreacion = DateTime.Now;
                        ctx.HistorialModificacion.Add(historial);
                        ctx.SaveChanges();

                        if (objeto.ListaArquetipo != null)
                        {
                            foreach (var item in objeto.ListaArquetipo)
                            {
                                var arquetipo = new ProductoArquetipo
                                {
                                    ProductoId = entidad.ProductoId,
                                    ArquetipoId = item.ArquetipoId,
                                    CreadoPor = objeto.UsuarioCreacion,
                                    FechaCreacion = DateTime.Now
                                };

                                ctx.ProductoArquetipo.Add(arquetipo);
                                ctx.SaveChanges();
                            }
                        }

                        if (objeto.ListaTecnologia != null)
                        {
                            foreach (var item in objeto.ListaTecnologia)
                            {
                                var tecnologia = new Tecnologia
                                {
                                    ProductoId = entidad.ProductoId,
                                    Fabricante = item.Fabricante,
                                    Nombre = item.Nombre,
                                    Versiones = item.Versiones,
                                    ClaveTecnologia = item.ClaveTecnologia,
                                    TipoTecnologia = item.TipoTecnologiaId,
                                    Descripcion = item.Descripcion,
                                    FechaLanzamiento = item.FechaLanzamiento,
                                    FechaExtendida = item.FechaExtendida,
                                    FechaFinSoporte = item.FechaFinSoporte,
                                    FechaAcordada = item.FechaAcordada,
                                    TipoFechaInterna = item.TipoFechaInterna,
                                    ComentariosFechaFin = item.ComentariosFechaFin,
                                    SustentoMotivo = item.SustentoMotivo,
                                    SustentoUrl = item.SustentoUrl,
                                    AutomatizacionImplementadaId = item.AutomatizacionImplementadaId,
                                    SubdominioId = item.SubdominioId,
                                    GrupoSoporteRemedy = objeto.GrupoTicketRemedyNombre,
                                    EqAdmContacto = objeto.EquipoAdmContacto,
                                    EquipoAprovisionamiento = objeto.EquipoAprovisionamiento,
                                    DuenoId = objeto.OwnerDisplayName,
                                    EstadoTecnologia = (int)EstadoTecnologia.Aprobado,
                                    EstadoId = (int)EEstadoObsolescenciaProducto.Vigente,
                                    Activo = true,
                                    FlagEliminado = false,
                                    UsuarioCreacion = objeto.UsuarioCreacion,
                                    FechaCreacion = DateTime.Now,
                                };

                                string tecnologiaString = JsonConvert.SerializeObject(tecnologia);

                                ctx.Tecnologia.Add(tecnologia);
                                ctx.SaveChanges();

                                historial = new HistorialModificacion();
                                historial.Entidad = "Producto";
                                historial.Accion = "Creación";
                                historial.EntidadAsociado = "Tecnologia";
                                historial.AsociadoId = tecnologia.TecnologiaId.ToString();
                                historial.Descripcion = tecnologiaString;
                                historial.CreadoPor = objeto.UsuarioCreacion;
                                historial.FechaCreacion = DateTime.Now;
                                ctx.HistorialModificacion.Add(historial);
                                ctx.SaveChanges();

                                if (item.ListAplicaciones != null && item.TipoTecnologiaId == (int)ETipo.EstandarRestringido)
                                {
                                    foreach (var itemAplicacion in item.ListAplicaciones)
                                    {
                                        var aplicacion = new TecnologiaAplicacion
                                        {
                                            TecnologiaId = tecnologia.TecnologiaId,
                                            AplicacionId = itemAplicacion.AplicacionId,
                                            FlagActivo = true,
                                            FlagEliminado = false,
                                            CreadoPor = objeto.UsuarioCreacion,
                                            FechaCreacion = DateTime.Now,
                                        };

                                        string aplicacionString = JsonConvert.SerializeObject(aplicacion);

                                        ctx.TecnologiaAplicacion.Add(aplicacion);
                                        ctx.SaveChanges();

                                        historial = new HistorialModificacion();
                                        historial.Entidad = "Producto";
                                        historial.Accion = "Creación";
                                        historial.EntidadAsociado = "TecnologiaAplicacion";
                                        historial.AsociadoId = aplicacion.TecnologiaAplicacionId.ToString();
                                        historial.Descripcion = aplicacionString;
                                        historial.CreadoPor = objeto.UsuarioCreacion;
                                        historial.FechaCreacion = DateTime.Now;
                                        ctx.HistorialModificacion.Add(historial);
                                        ctx.SaveChanges();
                                    }
                                }
                            }
                        }

                        return entidad.ProductoId;
                    }
                    else
                    {
                        var entidad = (from u in ctx.Producto
                                       where u.ProductoId == objeto.Id
                                       select u).First();

                        Dominio objDomData = ctx.Dominio.FirstOrDefault(x => x.DominioId == objeto.DominioId);
                        Subdominio objSDoData = ctx.Subdominio.FirstOrDefault(x => x.SubdominioId == objeto.SubDominioId);
                        Tipo objTipData = ctx.Tipo.FirstOrDefault(x => x.TipoId == objeto.TipoProductoId);
                        TipoCicloVida objTCiData = ctx.TipoCicloVida.FirstOrDefault(x => x.TipoCicloVidaId == objeto.TipoCicloVidaId);
                        List<Arquetipo> lstArqData = (from a in ctx.ProductoArquetipo
                                                      join b in ctx.Arquetipo on a.ArquetipoId equals b.ArquetipoId
                                                      where
                                                      a.ProductoId == objeto.Id &&
                                                      !a.FlagEliminado
                                                      select b).ToList();

                        string descripcionProducto = ObtenerCambiosProducto(objeto, entidad, objDomData, objSDoData, objTipData, objTCiData, lstArqData);

                        if (entidad != null)
                        {
                            //if (!entidad.DiagIs.Value)
                            //{
                            //    objeto.DiagArqFile.SaveAs(objeto.DirFisicaDiag);
                            //}

                            //if (!string.IsNullOrEmpty(objeto.DirFisicaDiag) && objeto.DiagArqFile != null)
                            //{
                            //    objeto.DiagArqFile.SaveAs(objeto.DirFisicaDiag);
                            //}
                            entidad.Fabricante = objeto.Fabricante;
                            entidad.Nombre = objeto.Nombre;
                            entidad.Descripcion = objeto.Descripcion;
                            entidad.DominioId = objeto.DominioId;
                            entidad.SubDominioId = objeto.SubDominioId;
                            entidad.TipoProductoId = objeto.TipoProductoId;
                            entidad.EstadoObsolescenciaId = objeto.EstadoObsolescenciaId;
                            entidad.TribuCoeDisplayName = objeto.TribuCoeDisplayName;
                            entidad.TribuCoeId = objeto.TribuCoeId;
                            entidad.SquadDisplayName = objeto.SquadDisplayName;
                            entidad.SquadId = objeto.SquadId;
                            entidad.OwnerDisplayName = objeto.OwnerDisplayName;
                            entidad.OwnerId = objeto.OwnerId;
                            entidad.OwnerMatricula = objeto.OwnerMatricula;
                            entidad.GrupoTicketRemedyId = objeto.GrupoTicketRemedyId;
                            entidad.GrupoTicketRemedyNombre = objeto.GrupoTicketRemedyNombre;
                            entidad.EsAplicacion = objeto.EsAplicacion;
                            entidad.AplicacionId = objeto.AplicacionId;
                            entidad.Codigo = objeto.Codigo;
                            entidad.TipoCicloVidaId = objeto.TipoCicloVidaId;
                            entidad.EsquemaLicenciamientoSuscripcionId = objeto.EsquemaLicenciamientoSuscripcionId;
                            entidad.EquipoAdmContacto = objeto.EquipoAdmContacto;
                            entidad.EquipoAprovisionamiento = objeto.EquipoAprovisionamiento;
                            entidad.FechaModificacion = DateTime.Now;
                            entidad.ModificadoPor = objeto.UsuarioModificacion;

                            ctx.SaveChanges();

                            historial = new HistorialModificacion();
                            historial.Entidad = "Producto";
                            historial.Id = entidad.ProductoId.ToString();
                            historial.Accion = "Modificación";
                            historial.EntidadAsociado = "Producto";
                            historial.AsociadoId = entidad.ProductoId.ToString();
                            historial.Descripcion = descripcionProducto;
                            historial.CreadoPor = objeto.UsuarioModificacion;
                            historial.FechaCreacion = DateTime.Now;
                            ctx.HistorialModificacion.Add(historial);
                            ctx.SaveChanges();

                            if (objeto.ListaArquetipoEliminados != null)
                            {
                                foreach (var item in objeto.ListaArquetipoEliminados)
                                {
                                    var arquetipo = ctx.ProductoArquetipo.FirstOrDefault(x => x.ProductoArquetipoId == item);

                                    if (arquetipo != null)
                                    {
                                        arquetipo.FlagEliminado = true;
                                        arquetipo.ModificadoPor = objeto.UsuarioModificacion;
                                        arquetipo.FechaModificacion = DateTime.Now;

                                        ctx.SaveChanges();
                                    }
                                }
                            }

                            if (objeto.ListaArquetipo != null)
                            {
                                foreach (var item in objeto.ListaArquetipo)
                                {
                                    var arquetipo = new ProductoArquetipo
                                    {
                                        ProductoId = entidad.ProductoId,
                                        ArquetipoId = item.ArquetipoId,
                                        CreadoPor = objeto.UsuarioCreacion,
                                        FechaCreacion = DateTime.Now
                                    };

                                    ctx.ProductoArquetipo.Add(arquetipo);
                                    ctx.SaveChanges();
                                }
                            }

                            var tecnologias = (from a in ctx.Tecnologia
                                               where
                                               a.ProductoId == entidad.ProductoId
                                               select a).ToList();

                            if (tecnologias != null)
                            {
                                foreach (var item in tecnologias)
                                {
                                    item.SubdominioId = entidad.SubDominioId;
                                    item.CodigoProducto = entidad.Codigo;
                                    item.Descripcion = entidad.Descripcion;
                                    item.EqAdmContacto = entidad.EquipoAdmContacto;
                                    item.GrupoSoporteRemedy = entidad.GrupoTicketRemedyNombre;
                                    item.EquipoAprovisionamiento = entidad.EquipoAprovisionamiento;
                                    item.DuenoId = entidad.OwnerDisplayName;

                                    ctx.SaveChanges();
                                }
                            }

                            return entidad.ProductoId;
                        }
                        else
                            return 0;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: int AddOrEditProducto(ProductoDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: int AddOrEditProducto(ProductoDTO objeto)"
                    , new object[] { null });
            }
        }

        public override List<ProductoDTO> GetProducto(string nombre, int? dominioId, int? subDominioId, int? tipoProdutoId, bool Activo, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows, bool withCantidadTecnologias = false)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Producto
                                         join a in ctx.Dominio on u.DominioId equals a.DominioId
                                         join b in ctx.Subdominio on u.SubDominioId equals b.SubdominioId
                                         join c in ctx.Tipo on u.TipoProductoId equals c.TipoId
                                         join d in ctx.TipoCicloVida on u.TipoCicloVidaId equals d.TipoCicloVidaId into ljd
                                         from d in ljd.DefaultIfEmpty()
                                         where
                                         (u.Nombre.ToUpper().Contains(nombre.ToUpper())
                                         || u.Fabricante.ToUpper().Contains(nombre.ToUpper())
                                         || string.Concat(u.Fabricante.ToUpper(), " ", u.Nombre.ToUpper()).Contains(nombre.ToUpper())
                                         || string.IsNullOrEmpty(nombre)) &&
                                         //(u.EstadoObsolescenciaId == estadoObsolescenciaId || estadoObsolescenciaId == null) &&
                                         (u.DominioId == dominioId || dominioId == null) &&
                                         (u.SubDominioId == subDominioId || subDominioId == null) &&
                                         (u.TipoProductoId == tipoProdutoId || tipoProdutoId == null) &&
                                         u.FlagActivo == Activo
                                         select new ProductoDTO()
                                         {
                                             Id = u.ProductoId,
                                             Fabricante = u.Fabricante,
                                             Nombre = u.Nombre,
                                             Descripcion = u.Descripcion,
                                             ProductoStr = string.Concat(u.Fabricante, " ", u.Nombre),
                                             DominioId = u.DominioId,
                                             DominioStr = a == null ? null : a.Nombre,
                                             SubDominioId = u.SubDominioId,
                                             SubDominioStr = b == null ? null : b.Nombre,
                                             TipoProductoId = u.TipoProductoId,
                                             TipoProductoStr = c == null ? null : c.Nombre,
                                             EstadoObsolescenciaId = (ctx.Tecnologia.Count(x => x.EstadoId == (int)ETecnologiaEstado.Vigente) > 1) ? (int)ETecnologiaEstado.Vigente : (int)ETecnologiaEstado.Obsoleto,
                                             TribuCoeDisplayName = u.TribuCoeDisplayName,
                                             TribuCoeId = u.TribuCoeId,
                                             SquadDisplayName = u.SquadDisplayName,
                                             SquadId = u.SquadId,
                                             OwnerDisplayName = u.OwnerDisplayName,
                                             OwnerId = u.OwnerId,
                                             OwnerMatricula = u.OwnerMatricula,
                                             GrupoTicketRemedyId = u.GrupoTicketRemedyId,
                                             GrupoTicketRemedyNombre = u.GrupoTicketRemedyNombre,
                                             EsAplicacion = u.EsAplicacion,
                                             Codigo = u.Codigo,
                                             TipoCicloVidaId = u.TipoCicloVidaId,
                                             TipoCicloVidaStr = d == null ? "" : d.Nombre,
                                             EsquemaLicenciamientoSuscripcionId = u.EsquemaLicenciamientoSuscripcionId,
                                             CantidadTecnologiasRegistradas = withCantidadTecnologias ? ctx.Tecnologia.Count(x => x.ProductoId == u.ProductoId && !x.FlagEliminado && x.Activo) : 0,
                                             Activo = u.FlagActivo,
                                             UsuarioCreacion = u.CreadoPor,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.ModificadoPor,
                                             //NumSubdominios = (from sq in ctx.Subdominio
                                             //                  where sq.DominioId == u.DominioId //&& sq.Activo
                                             //                  select 1).Count()
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                        var resultadoList = resultado.ToList();
                        //if(resultadoList != null)
                        //{
                        //    if (withCantidadTecnologias)
                        //    {
                        //        foreach (var item in resultadoList)
                        //        {
                        //            item.CantidadTecnologiasRegistradas = (from a in ctx.Tecnologia
                        //                                                   where a.ProductoId == item.Id
                        //                                                   && !a.FlagEliminado
                        //                                                   && a.Activo
                        //                                                   select 1).Count();
                        //        }
                        //    }
                        //}
                        return resultadoList;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProduct(string descripcion, string dominio, int? estado, int? tipoTecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProduct(string descripcion, string dominio, int? estado, int? tipoTecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<ProductoDTO> GetAllProducto()
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Producto
                                         join a in ctx.Dominio on u.DominioId equals a.DominioId
                                         join b in ctx.Subdominio on u.SubDominioId equals b.SubdominioId
                                         join c in ctx.Tipo on u.TipoProductoId equals c.TipoId
                                         select new ProductoDTO()
                                         {
                                             Id = u.ProductoId,
                                             Fabricante = u.Fabricante,
                                             Nombre = u.Nombre,
                                             Descripcion = u.Descripcion,
                                             DominioId = u.DominioId,
                                             DominioStr = a == null ? null : a.Nombre,
                                             SubDominioId = u.SubDominioId,
                                             SubDominioStr = b == null ? null : b.Nombre,
                                             TipoProductoId = u.TipoProductoId,
                                             TipoProductoStr = c == null ? null : c.Nombre,
                                             EstadoObsolescenciaId = u.EstadoObsolescenciaId,
                                             OwnerDisplayName = u.OwnerDisplayName,
                                             OwnerId = u.OwnerId,
                                             OwnerMatricula = u.OwnerMatricula,
                                             GrupoTicketRemedyId = u.GrupoTicketRemedyId,
                                             GrupoTicketRemedyNombre = u.GrupoTicketRemedyNombre,
                                             EsAplicacion = u.EsAplicacion,
                                             Codigo = u.Codigo,
                                             UsuarioCreacion = u.CreadoPor,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.ModificadoPor,
                                             //NumSubdominios = (from sq in ctx.Subdominio
                                             //                  where sq.DominioId == u.DominioId //&& sq.Activo
                                             //                  select 1).Count()
                                         }).ToList();

                        return registros;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProductoByFiltro()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProductoByFiltro()"
                    , new object[] { null });
            }
        }

        public override List<ProductoDTO> GetProductoByDescripcion(string descripcion, string dominioIds = null, string subDominioIds = null)
        {
            try
            {
                IEnumerable<int> listaDominioIds = string.IsNullOrEmpty(dominioIds) ? Enumerable.Empty<int>() : dominioIds.Split(',').Select(x => int.Parse(x)).AsEnumerable();
                IEnumerable<int> listaSubDominioIds = string.IsNullOrEmpty(subDominioIds) ? Enumerable.Empty<int>() : subDominioIds.Split(',').Select(x => int.Parse(x)).AsEnumerable();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Producto
                                         join a in ctx.Dominio on u.DominioId equals a.DominioId
                                         join b in ctx.Subdominio on u.SubDominioId equals b.SubdominioId
                                         join c in ctx.Tipo on u.TipoProductoId equals c.TipoId
                                         where
                                         (u.Nombre.ToUpper().StartsWith(descripcion.ToUpper())
                                         || u.Descripcion.ToUpper().StartsWith(descripcion.ToUpper())
                                         || u.Fabricante.ToUpper().StartsWith(descripcion.ToUpper())
                                         || string.Concat((u.Fabricante ?? ""), " ", (u.Nombre ?? "")).StartsWith(descripcion.ToUpper())
                                         || string.IsNullOrEmpty(descripcion)) &&
                                         (listaDominioIds.Contains(u.DominioId) || listaDominioIds.Count() == 0) &&
                                         (listaSubDominioIds.Contains(u.SubDominioId) || listaSubDominioIds.Count() == 0)
                                         select new ProductoDTO()
                                         {
                                             Id = u.ProductoId,
                                             Fabricante = u.Fabricante,
                                             Nombre = u.Nombre,
                                             Descripcion = u.Descripcion,
                                             DominioId = u.DominioId,
                                             DominioStr = a == null ? null : a.Nombre,
                                             SubDominioId = u.SubDominioId,
                                             SubDominioStr = b == null ? null : b.Nombre,
                                             TipoProductoId = u.TipoProductoId,
                                             TipoProductoStr = c == null ? null : c.Nombre,
                                             EstadoObsolescenciaId = u.EstadoObsolescenciaId,
                                             TribuCoeDisplayName = u.TribuCoeDisplayName,
                                             TribuCoeId = u.TribuCoeId,
                                             SquadDisplayName = u.SquadDisplayName,
                                             SquadId = u.SquadId,
                                             OwnerDisplayName = u.OwnerDisplayName,
                                             OwnerId = u.OwnerId,
                                             OwnerMatricula = u.OwnerMatricula,
                                             GrupoTicketRemedyId = u.GrupoTicketRemedyId,
                                             GrupoTicketRemedyNombre = u.GrupoTicketRemedyNombre,
                                             EsAplicacion = u.EsAplicacion,
                                             Codigo = u.Codigo,
                                             TipoCicloVidaId = u.TipoCicloVidaId,
                                             EsquemaLicenciamientoSuscripcionId = u.EsquemaLicenciamientoSuscripcionId,
                                             EquipoAdmContacto = u.EquipoAdmContacto,
                                             EquipoAprovisionamiento = u.EquipoAprovisionamiento,
                                             UsuarioCreacion = u.CreadoPor,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.ModificadoPor,
                                         }).OrderBy(x => x.Fabricante).ThenBy(x => x.Nombre).ToList();

                        return registros;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProduct(string descripcion, string dominio, int? estado, int? tipoTecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProduct(string descripcion, string dominio, int? estado, int? tipoTecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override ProductoDTO GetProductoById(int id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Producto
                                   join a in ctx.GrupoRemedy on u.GrupoTicketRemedyId equals a.GrupoRemedyId into lja
                                   from a in lja.DefaultIfEmpty()
                                       //join tp in ctx.TablaProcedencia on (int)ETablaProcedencia.CVT_Producto equals tp.CodigoInterno
                                       //join f in ctx.ArchivosCVT on new { Id = u.ProductoId.ToString(), TablaProcedenciaId = tp.TablaProcedenciaId } equals new { Id = f.EntidadId, TablaProcedenciaId = f.TablaProcedenciaId } into jl
                                       //from f in jl.DefaultIfEmpty()
                                   where u.ProductoId == id
                                   //&& f.Activo
                                   select new ProductoDTO()
                                   {
                                       Id = u.ProductoId,
                                       Fabricante = u.Fabricante,
                                       Nombre = u.Nombre,
                                       Descripcion = u.Descripcion,
                                       DominioId = u.DominioId,
                                       SubDominioId = u.SubDominioId,
                                       TipoProductoId = u.TipoProductoId,
                                       EstadoObsolescenciaId = u.EstadoObsolescenciaId,
                                       TribuCoeDisplayName = u.TribuCoeDisplayName,
                                       TribuCoeId = u.TribuCoeId,
                                       SquadDisplayName = u.SquadDisplayName,
                                       SquadId = u.SquadId,
                                       OwnerDisplayName = u.OwnerDisplayName,
                                       OwnerId = u.OwnerId,
                                       OwnerMatricula = u.OwnerMatricula,
                                       GrupoTicketRemedyId = u.GrupoTicketRemedyId,
                                       GrupoTicketRemedyNombre = u.GrupoTicketRemedyNombre,
                                       GrupoTicketRemedyStr = a == null ? null : a.Nombre,
                                       EsAplicacion = u.EsAplicacion,
                                       AplicacionId = u.AplicacionId,
                                       Codigo = string.IsNullOrEmpty(u.Codigo) ? "" : u.Codigo,
                                       TipoCicloVidaId = u.TipoCicloVidaId,
                                       EsquemaLicenciamientoSuscripcionId = u.EsquemaLicenciamientoSuscripcionId,
                                       EquipoAdmContacto = u.EquipoAdmContacto,
                                       EquipoAprovisionamiento = u.EquipoAprovisionamiento,
                                       FechaCreacion = u.FechaCreacion,
                                       UsuarioCreacion = u.CreadoPor
                                   }).FirstOrDefault();

                    if (entidad != null)
                    {
                        entidad.ListaArquetipo = (from a in ctx.ProductoArquetipo
                                                  where
                                                  !a.FlagEliminado &&
                                                  a.ProductoId == id
                                                  select new ProductoArquetipoDTO
                                                  {
                                                      Id = a.ProductoArquetipoId,
                                                      ArquetipoId = a.ArquetipoId,
                                                      ProductoId = a.ProductoId,
                                                      FlagEliminado = a.FlagEliminado,
                                                      UsuarioCreacion = a.CreadoPor,
                                                      FechaCreacion = a.FechaCreacion
                                                  }).ToList();

                        if (entidad.ListaArquetipo != null)
                        {
                            foreach (var item in entidad.ListaArquetipo)
                            {
                                item.Arquetipo = (from a in ctx.Arquetipo
                                                  where a.ArquetipoId == item.ArquetipoId
                                                  select new ArquetipoDTO
                                                  {
                                                      Nombre = a.Nombre
                                                  }
                                                  ).FirstOrDefault();
                            }
                        }
                    }

                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: ProductoDTO GetProductoById(int id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: ProductoDTO GetProductoById(int id)"
                    , new object[] { null });
            }
        }

        public override bool CambiarEstado(int id, string usuario)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var itemBD = (from u in ctx.Producto
                                  where u.ProductoId == id
                                  select u).First();

                    if (itemBD != null)
                    {
                        itemBD.FechaModificacion = DateTime.Now;
                        itemBD.CreadoPor = usuario;
                        itemBD.FlagActivo = !itemBD.FlagActivo;

                        ctx.SaveChanges();

                        return true;
                    }
                    else
                        return false;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarEstado(int id, bool estado, string usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarEstado(int id, bool estado, string usuario)"
                    , new object[] { null });
            }
        }

        public override bool ExisteCodigoByFiltro(string filtro, int id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    bool? estado = (from u in ctx.Producto
                                    where //u.Activo && 
                                    u.ProductoId != id
                                    && u.Codigo.ToUpper() == filtro.ToUpper()
                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool ExisteCodigoByFiltro(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool ExisteCodigoByFiltro(string filtro)"
                    , new object[] { null });
            }
        }

        public override bool ExisteFabricanteNombre(string fabricante, string nombre, int id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    bool? estado = (from u in ctx.Producto
                                    where //u.Activo && 
                                    u.ProductoId != id
                                    && u.Fabricante.ToUpper() == fabricante.ToUpper()
                                    && u.Nombre.ToUpper() == nombre.ToUpper()
                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool ExisteCodigoByFiltro(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool ExisteCodigoByFiltro(string filtro)"
                    , new object[] { null });
            }
        }

        public override string ObtenerCodigoSugerido()
        {
            try
            {
                /*
                string codigoSugerido = null;
                var cadenaConexion = Constantes.CadenaConexion;
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_PRODUCTO_OBTENER_CODIGOSUGERIDO]", cnx))
                    {
                        comando.CommandType = System.Data.CommandType.StoredProcedure;

                        codigoSugerido = (string)comando.ExecuteScalar();
                    }
                    cnx.Close();

                    return codigoSugerido;
                }
                */


                int length = 4;
                const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                Random random = new Random();
                return new string(Enumerable.Repeat(chars, length)
                  .Select(s => s[random.Next(s.Length)]).ToArray());
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: string ObtenerCodigoSugerido()"
                    , new object[] { null });
            }
        }

        string ObtenerCambiosProducto(ProductoDTO objChange, Producto objData = null, Dominio objDomData = null, Subdominio objSDoData = null, Tipo objTipData = null, TipoCicloVida objTCiData = null, List<Arquetipo> lstArqData = null)
        {
            List<string> camposModificados = null;

            if (objData != null)
            {
                string lstArqDataStr = lstArqData == null ? null : string.Join(", ", lstArqData.Select(x => x.Nombre).ToArray());
                string lstArqChangeStr = objChange.ListaArquetipo == null ? null : string.Join(", ", objChange.ListaArquetipo.Select(x => x.Arquetipo.Nombre).ToArray());
                string domDataStr = objDomData == null ? null : objDomData.Nombre;
                string sDoDataStr = objSDoData == null ? null : objSDoData.Nombre;
                string tPrDataStr = objTipData == null ? null : objTipData.Nombre;
                string tCiDataStr = objTCiData == null ? null : objTCiData.Nombre;
                string elsDataStr = (objData.EsquemaLicenciamientoSuscripcionId ?? 0) <= 0 ? null : Utilitarios.GetEnumDescription2((EEsquemaLicenciamientoSuscripcion)objData.EsquemaLicenciamientoSuscripcionId.Value);
                camposModificados = new List<string>();
                if (objData.Fabricante != objChange.Fabricante) camposModificados.Add($"Fabricante (Valor Anterior: [{objData.Fabricante}] - Valor Actual: [{objChange.Fabricante}])");
                if (objData.Nombre != objChange.Nombre) camposModificados.Add($"Nombre (Valor Anterior: [{objData.Nombre}] - Valor Actual: [{objChange.Nombre}])");
                if (objData.Descripcion != objChange.Descripcion) camposModificados.Add($"Descripción (Valor Anterior: [{objData.Descripcion}] - Valor Actual: [{objChange.Descripcion}])");
                if (domDataStr != objChange.DominioStr) camposModificados.Add($"Dominio (Valor Anterior: [{domDataStr}] - Valor Actual: [{objChange.DominioStr}])");
                if (sDoDataStr != objChange.SubDominioStr) camposModificados.Add($"SubDominio (Valor Anterior: [{sDoDataStr}] - Valor Actual: [{objChange.SubDominioStr}])");
                if (tPrDataStr != objChange.TipoProductoStr) camposModificados.Add($"Tipo de Producto (Valor Anterior: [{tPrDataStr}] - Valor Actual: [{objChange.TipoProductoStr}])");
                if (objData.TribuCoeDisplayName != objChange.TribuCoeDisplayName) camposModificados.Add($"Tribu/COE/Unidad Organizacional (Valor Anterior: [{objData.TribuCoeDisplayName}] - Valor Actual: [{objChange.TribuCoeDisplayName}])");
                if (objData.SquadDisplayName != objChange.SquadDisplayName) camposModificados.Add($"SQUAD/Equipo (Valor Anterior: [{objData.SquadDisplayName}] - Valor Actual: [{objChange.SquadDisplayName}])");
                if (objData.OwnerDisplayName != objChange.OwnerDisplayName) camposModificados.Add($"Responsable de la Unidad (Valor Anterior: [{objData.OwnerDisplayName}] - Valor Actual: [{objChange.OwnerDisplayName}])");
                if (objData.GrupoTicketRemedyNombre != objChange.GrupoTicketRemedyNombre) camposModificados.Add($"Grupo de Soporte REMEDY (Valor Anterior: [{objData.GrupoTicketRemedyNombre}] - Valor Actual: [{objChange.GrupoTicketRemedyNombre}])");
                if (objData.EsAplicacion != objChange.EsAplicacion) camposModificados.Add($"¿Este producto es una aplicación? (Valor Anterior: [{(objData.EsAplicacion ? "Sí" : "No")}] - Valor Actual: [{(objChange.EsAplicacion ? "Sí" : "No")}])");
                if (objData.Codigo != objChange.Codigo) camposModificados.Add($"Código (Valor Anterior: [{objData.Codigo}] - Valor Actual: [{objChange.Codigo}])");
                if (tCiDataStr != objChange.TipoCicloVidaStr) camposModificados.Add($"Tipo de Ciclo de Vida (Valor Anterior: [{tCiDataStr}] - Valor Actual: [{objChange.TipoCicloVidaStr}])");
                if (elsDataStr != objChange.EsquemaLicenciamientoSuscripcionStr) camposModificados.Add($"Esquema de Licenciamiento/Suscripción (Valor Anterior: [{elsDataStr}] - [Valor Actual: [{objChange.EsquemaLicenciamientoSuscripcionStr}])");
                if (objData.EquipoAdmContacto != objChange.EquipoAdmContacto) camposModificados.Add($"Equipo de administración y punto de contacto (Valor Anterior: [{objData.EquipoAdmContacto}] - Valor Actual: [{objChange.EquipoAdmContacto}])");
                if (lstArqDataStr != lstArqChangeStr) camposModificados.Add($"Lista de Arquetipos (Valor Anterior: [{lstArqDataStr}] - Valor Actual: [{lstArqChangeStr}])");
                if (camposModificados.Count == 0) camposModificados = null;
            }
            else
            {
                camposModificados = new List<string>();
                camposModificados.Add($"Fabricante (Valor: [{objChange.Fabricante}])");
                camposModificados.Add($"Nombre (Valor: [{objChange.Nombre}])");
                camposModificados.Add($"Descripción (Valor: [{objChange.Descripcion}])");
                camposModificados.Add($"Dominio (Valor: [{objChange.DominioStr}])");
                camposModificados.Add($"SubDominio (Valor: [{objChange.SubDominioStr}])");
                camposModificados.Add($"Tipo de Producto (Valor: [{objChange.TipoProductoStr}])");
                camposModificados.Add($"Tribu/COE/Unidad Organizacional (Valor: [{objChange.TribuCoeDisplayName}])");
                camposModificados.Add($"SQUAD/Equipo (Valor: [{objChange.SquadDisplayName}])");
                camposModificados.Add($"Responsable de la Unidad (Valor: [{objChange.OwnerDisplayName}])");
                camposModificados.Add($"Grupo de Soporte REMEDY (Valor: [{objChange.GrupoTicketRemedyNombre}])");
                camposModificados.Add($"¿Este producto es una aplicación? (Valor: [{(objChange.EsAplicacion ? "Sí" : "No")}])");
                camposModificados.Add($"Código (Valor: [{objChange.Codigo}])");
                camposModificados.Add($"Tipo de Ciclo de Vida (Valor: [{objChange.TipoCicloVidaStr}])");
                camposModificados.Add($"Esquema de Licenciamiento/Suscripción (Valor: [{objChange.EsquemaLicenciamientoSuscripcionStr}])");
                camposModificados.Add($"Equipo de administración y punto de contacto (Valor: [{objChange.EquipoAdmContacto}])");
            }

            string mensaje = camposModificados == null ? "No se realizaron cambios" : (objData == null ? "Se registró con los siguientes valores: " : "Se modificaron los siguientes campos: ") + string.Join(", ", camposModificados.ToArray());

            return mensaje;
        }

        //string ObtenerCambiosTecnologia(TecnologiaDTO objChange, Tecnologia objData = null, Tipo objTipData = null, List<Aplicacion> lstAppData = null)
        //{
        //    List<string> camposModificados = null;

        //    if (objData != null)
        //    {
        //        string lstAppDataStr = lstAppData == null ? null : string.Join(", ", lstAppData.Select(x => x.Nombre).ToArray());
        //        string lstAppChangeStr = objChange.ListAplicaciones == null ? null : string.Join(", ", objChange.ListAplicaciones.Select(x => x.Aplicacion.CodigoAPT).ToArray());
        //        string tTeDataStr = objTipData == null ? null : objTipData.Nombre;
        //        string fueDataStr = (objData.FuenteId ?? 0) <= 0 ? null : Utilitarios.GetEnumDescription2((Fuente)objData.FuenteId.Value);
        //        string fCaDataStr = (objData.FechaCalculoTec ?? 0) <= 0 ? null : Utilitarios.GetEnumDescription2((FechaCalculoTecnologia)objData.FechaCalculoTec.Value);
        //        string aImDataStr = (objData.FechaCalculoTec ?? 0) <= 0 ? null : Utilitarios.GetEnumDescription2((FechaCalculoTecnologia)objData.FechaCalculoTec.Value);
        //        camposModificados = new List<string>();
        //        if (objData.Fabricante != objChange.Fabricante) camposModificados.Add($"Fabricante (Valor Anterior: [{objData.Fabricante}] - Valor Actual: [{objChange.Fabricante}])");
        //        if (objData.Nombre != objChange.Nombre) camposModificados.Add($"Nombre (Valor Anterior: [{objData.Nombre}] - Valor Actual: [{objChange.Nombre}])");
        //        if (objData.Versiones != objChange.Versiones) camposModificados.Add($"Versión (Valor Anterior: [{objData.Versiones}] - Valor Actual: [{objChange.Versiones}])");
        //        if (objData.ClaveTecnologia != objChange.ClaveTecnologia) camposModificados.Add($"Clave de la Tecnología (Valor Anterior: [{objData.ClaveTecnologia}] - Valor Actual: [{objChange.ClaveTecnologia}])");
        //        if (tTeDataStr != objChange.TipoTecnologiaStr) camposModificados.Add($"Tipo de Tecnología (Valor Anterior: [{tTeDataStr}] - Valor Actual: [{objChange.TipoTecnologiaStr}])");
        //        if (objData.Descripcion != objChange.Descripcion) camposModificados.Add($"Descripción (Valor Anterior: [{objData.Descripcion}] - Valor Actual: [{objChange.Descripcion}])");
        //        if (objData.FechaLanzamiento != objChange.FechaLanzamiento) camposModificados.Add($"Fecha de lanzamiento de tecnología (Valor Anterior: [{objData.FechaLanzamiento:dd/MM/yyyy}] - Valor Actual: [{objChange.FechaLanzamiento:dd/MM/yyyy}])");
        //        if (objData.FlagFechaFinSoporte != objChange.FlagFechaFinSoporte) camposModificados.Add($"¿Tiene fecha fin de soporte? (Valor Anterior: [{(objData.FlagFechaFinSoporte ?? false ? "Sí" : "No")}] - Valor Actual: [{(objChange.FechaLanzamiento ?? false ? "Sí" : "No")}])");
        //        if (fueDataStr != objChange.FuenteStr) camposModificados.Add($"Fuente (Valor Anterior: [{fueDataStr}] - Valor Actual: [{objChange.FuenteStr}])");
        //        if (fCaDataStr != objChange.FechaCalculoTecStr) camposModificados.Add($"Fecha para cálculo de obsolescencia (Valor Anterior: [{fCaDataStr}] - Valor Actual: [{objChange.FechaCalculoTecStr}])");
        //        if (objData.FechaExtendida != objChange.FechaExtendida) camposModificados.Add($"Fecha fin extendida de la tecnología (Valor Anterior: [{objData.FechaExtendida:dd/MM/yyyy}] - Valor Actual: [{objChange.FechaExtendida:dd/MM/yyyy}])");
        //        if (objData.FechaFinSoporte != objChange.FechaFinSoporte) camposModificados.Add($"Fecha fin soporte de tecnología (Valor Anterior: [{objData.FechaFinSoporte:dd/MM/yyyy}] - Valor Actual: [{objChange.FechaFinSoporte:dd/MM/yyyy}])");
        //        if (objData.FechaAcordada != objChange.FechaAcordada) camposModificados.Add($"Fecha fin interna de la tecnología (Valor Anterior: [{objData.FechaAcordada:dd/MM/yyyy}] - Valor Actual: [{objChange.FechaAcordada:dd/MM/yyyy}])");
        //        if (objData.TipoFechaInterna != objChange.TipoFechaInterna) camposModificados.Add($"Tipo Fecha Interna (Valor Anterior: [{objData.TipoFechaInterna}] - Valor Actual: [{objChange.TipoFechaInterna}])");
        //        if (objData.ComentariosFechaFin != objChange.ComentariosFechaFin) camposModificados.Add($"Comentarios asociados a la fecha fin de soporte de tecnología (Valor Anterior: [{objData.ComentariosFechaFin}] - Valor Actual: [{objChange.ComentariosFechaFin}])");
        //        if (objData.SustentoMotivo != objChange.SustentoMotivo) camposModificados.Add($"Motivo (Valor Anterior: [{objData.SustentoMotivo}] - Valor Actual: [{objChange.SustentoMotivo}])");
        //        if (objData.SustentoUrl != objChange.SustentoUrl) camposModificados.Add($"Url (Valor Anterior: [{objData.SustentoUrl}] - Valor Actual: [{objChange.SustentoUrl}])");
        //        if (aImDataStr != objChange.AutomatizacionImplementadaStr) camposModificados.Add($"¿La tecnología tiene script que automatiza su implementación? (Valor Anterior: [{aImDataStr}] - Valor Actual: [{objChange.AutomatizacionImplementadaStr}])");
        //        if (lstArqDataStr != lstArqChangeStr) camposModificados.Add($"Lista de Arquetipos (Valor Anterior: [{lstArqDataStr}] - Valor Actual: [{lstArqChangeStr}])");
        //        if (camposModificados.Count == 0) camposModificados = null;
        //    }
        //    else
        //    {
        //        camposModificados = new List<string>();
        //        camposModificados.Add($"Fabricante (Valor: [{objChange.Fabricante}])");
        //        camposModificados.Add($"Nombre (Valor: [{objChange.Nombre}])");
        //        camposModificados.Add($"Versión (Valor: [{objChange.Versiones}])");
        //        camposModificados.Add($"Clave de la Tecnología (Valor: [{objChange.ClaveTecnologia}])");
        //        camposModificados.Add($"Tipo de Tecnología (Valor: [{objChange.TipoTecnologiaStr}])");
        //        camposModificados.Add($"Descripción (Valor: [{objChange.Descripcion}])");
        //        camposModificados.Add($"Fecha de Lanzamiento de tecnología (Valor: [{objChange.FechaLanzamiento:dd/MM/yyyy}])");
        //        camposModificados.Add($"¿Tiene fecha fin de soporte? (Valor: [{(objChange.FlagFechaFinSoporte ?? false ? "Sí" : "No")}])");
        //        camposModificados.Add($"Fuente (Valor: [{objChange.FuenteStr}])");
        //        camposModificados.Add($"Grupo de Soporte REMEDY (Valor: [{objChange.GrupoTicketRemedyNombre}])");
        //        camposModificados.Add($"¿Este producto es una aplicación? (Valor: [{(objChange.EsAplicacion ? "Sí" : "No")}])");
        //        camposModificados.Add($"Código (Valor: [{objChange.Codigo}])");
        //        camposModificados.Add($"Tipo de Ciclo de Vida (Valor: [{objChange.TipoCicloVidaStr}])");
        //        camposModificados.Add($"Esquema de Licenciamiento/Suscripción (Valor: [{objChange.EsquemaLicenciamientoSuscripcionStr}])");
        //        camposModificados.Add($"Equipo de administración y punto de contacto (Valor: [{objChange.EquipoAdmContacto}])");
        //    }

        //    string mensaje = camposModificados == null ? "No se realizaron cambios" : (objData == null ? "Se registró con los siguientes valores: " : "Se modificaron los siguientes campos: ") + string.Join(", ", camposModificados.ToArray());

        //    return mensaje;
        //}
        #endregion

        #region ProductoTecnologiaAplicacion
        public override List<TecnologiaAplicacionDTO> GetTecnologiaAplicaciones(int productoId)
        {
            var fecha = DateTime.Now;
            var estados = new List<int>() { 0, 2 };

            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {                        
                        var registros = (from u in ctx.RelacionDetalle
                                         join u2 in ctx.Relacion on u.RelacionId equals u2.RelacionId
                                         join u3 in ctx.Tecnologia on u.TecnologiaId equals u3.TecnologiaId
                                         join u4 in ctx.Application on u2.CodigoAPT equals u4.applicationId
                                         where u2.DiaRegistro == fecha.Day && u2.MesRegistro == fecha.Month && u2.AnioRegistro == fecha.Year && estados.Contains(u2.EstadoId)
                                         && u3.ProductoId == productoId && u3.Activo == true && u4.isActive == true && u4.status!=4
                                         select new TecnologiaAplicacionDTO()
                                         {
                                             Id = 0,
                                             TecnologiaId = u.TecnologiaId.Value,
                                             CodigoAPT = u2.CodigoAPT
                                         });

                        var resultado = registros.Distinct().ToList();

                        foreach (var item in resultado)
                        {
                            item.Tecnologia = (from u in ctx.Tecnologia
                                               where
                                               u.TecnologiaId == item.TecnologiaId
                                               select new TecnologiaDTO
                                               {
                                                   Id = u.TecnologiaId,
                                                   ClaveTecnologia = u.ClaveTecnologia
                                               }).FirstOrDefault();

                            item.Aplicacion = (from u in ctx.Aplicacion
                                               where
                                               u.CodigoAPT == item.CodigoAPT
                                               select new AplicacionDTO
                                               {
                                                   Id = u.AplicacionId,
                                                   CodigoAPT = u.CodigoAPT,
                                                   CategoriaTecnologica = u.CategoriaTecnologica,
                                                   Nombre = u.Nombre,
                                                   Owner_LiderUsuario_ProductOwner = u.Owner_LiderUsuario_ProductOwner,
                                                   TipoActivoInformacion = u.TipoActivoInformacion,
                                                   GestionadoPor = u.GestionadoPor
                                               }).FirstOrDefault();
                        }

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProduct(string descripcion, string dominio, int? estado, int? tipoTecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: List<ProductoDTO> GetProduct(string descripcion, string dominio, int? estado, int? tipoTecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }
        #endregion

        #region Producto Owner
        public override List<ProductoOwnerDto> BuscarProductoXOwner(string correo, int perfilId, string dominioIds, string subDominioIds, string productoStr, int? tribuCoeId, int? squadId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            totalRows = 0;

            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<ProductoOwnerDto>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_producto_buscar_x_owner]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@correoOwner", correo));
                        comando.Parameters.Add(new SqlParameter("@perfilId", perfilId));
                        comando.Parameters.Add(new SqlParameter("@dominioIds", ((object)dominioIds) ?? DBNull.Value));
                        comando.Parameters.Add(new SqlParameter("@subDominioIds", ((object)subDominioIds) ?? DBNull.Value));
                        comando.Parameters.Add(new SqlParameter("@productoStr", ((object)productoStr) ?? DBNull.Value));
                        comando.Parameters.Add(new SqlParameter("@tribuCoeId", ((object)tribuCoeId) ?? DBNull.Value));
                        comando.Parameters.Add(new SqlParameter("@squadId", ((object)squadId) ?? DBNull.Value));
                        comando.Parameters.Add(new SqlParameter("@pageNumber", pageNumber));
                        comando.Parameters.Add(new SqlParameter("@pageSize", pageSize));
                        comando.Parameters.Add(new SqlParameter("@sortName", sortName));
                        comando.Parameters.Add(new SqlParameter("@sortOrder", sortOrder));


                        var reader = comando.ExecuteReader(System.Data.CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new ProductoOwnerDto()
                            {
                                ProductoId = reader.GetData<int>("ProductoId"),
                                ProductoStr = reader.GetData<string>("ProductoStr"),
                                Fabricante = reader.GetData<string>("Fabricante"),
                                Nombre = reader.GetData<string>("Nombre"),
                                Dominio = reader.GetData<string>("DominioStr"),
                                Subdominio = reader.GetData<string>("SubdominioStr"),
                                TotalTecnologias = reader.GetData<int>("TotalTecnologias"),
                                TotalInstanciasServidores = reader.GetData<int>("TotalInstanciasServidores"),
                                TotalInstanciasServicioNube = reader.GetData<int>("TotalInstanciasServicioNube"),
                                TotalInstanciasPcs = reader.GetData<int>("TotalInstanciasPcs"),
                                TotalAplicaciones = reader.GetData<int>("TotalAplicaciones"),
                                TribuCoeId = reader.GetData<int>("TribuCoeId"),
                                TribuCoeDisplayName = reader.GetData<string>("TribuCoeDisplayName"),
                                TribuCoeDisplayNameResponsable = reader.GetData<string>("TribuCoeDisplayNameResponsable"),
                                SquadId = reader.GetData<int>("SquadId"),
                                SquadDisplayName = reader.GetData<string>("SquadDisplayName"),
                                SquadDisplayNameResponsable = reader.GetData<string>("SquadDisplayNameResponsable")
                            };
                            totalRows = reader.GetData<int>("TotalRows");
                            lista.Add(objeto);
                        }
                        reader.Close();
                    }

                    return lista;
                }
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }
        #endregion
    }
}
