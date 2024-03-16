using BCP.CVT.Cross;
using BCP.CVT.DTO;
using BCP.CVT.Services.Interface;
using BCP.CVT.Services.ModelDB;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Linq.Dynamic;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace BCP.CVT.Services.Service
{
    public class ParametroSvc : ParametroDAO
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public override void ActualizarParametro(ParametroDTO parametro)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Parametro
                                   where u.ParametroId == parametro.Id
                                   select u).First();
                    if (entidad != null)
                    {
                        entidad.Descripcion = String.IsNullOrEmpty(parametro.Descripcion) ? string.Empty : parametro.Descripcion;
                        entidad.Valor = String.IsNullOrEmpty(parametro.Valor) ? string.Empty : parametro.Valor;
                        entidad.FechaModificacion = DateTime.Now;
                        entidad.ModificadoPor = parametro.UsuarioModificacion;

                        ctx.SaveChanges();

                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
        }

        public override ParametroDTO ObtenerParametro(string Codigo)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx =   GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {                        
                        var entidad = (from u in ctx.Parametro
                                       where u.Codigo == Codigo
                                       select new ParametroDTO()
                                       {
                                           Valor = u.Valor,
                                           Descripcion = u.Descripcion,
                                           Activo = u.FlagActivo,
                                           FechaCreacion = u.FechaCreacion,
                                           UsuarioCreacion = u.CreadoPor,
                                           Id = u.ParametroId
                                       }).FirstOrDefault();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ParametroDTO ObtenerParametro(string Codigo)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ParametroDTO ObtenerParametro(string Codigo)"
                    , new object[] { null });
            }
        }

        public override List<ParametroDTO> GetParametros(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Parametro
                                         join t in ctx.TipoParametro on u.TipoParametroId equals t.TipoParametroId
                                         where (u.Codigo.ToUpper().Contains(filtro.ToUpper())
                                          || u.Descripcion.ToUpper().Contains(filtro.ToUpper())
                                         || string.IsNullOrEmpty(filtro))
                                         && u.FlagActivo && t.FlagActivo
                                         select new ParametroDTO()
                                         {
                                             Id = u.ParametroId,
                                             TipoParametroId = u.TipoParametroId,
                                             TipoParametro = t.Nombre,
                                             Codigo = u.Codigo,
                                             Descripcion = String.IsNullOrEmpty(u.Descripcion) ? string.Empty : u.Descripcion,
                                             Valor = String.IsNullOrEmpty(u.Valor) ? string.Empty : u.Valor,
                                             Activo = u.FlagActivo,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.ModificadoPor
                                         });

                        totalRows = registros.Count();
                        registros = registros.OrderBy(sortName + " " + sortOrder);
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: List<ParametroDTO> GetParametros(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: List<ParametroDTO> GetParametros(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override ParametroDTO GetPrametroById(int id)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Parametro
                                       where u.ParametroId == id
                                       select new ParametroDTO()
                                       {
                                           Valor = u.Valor,
                                           Codigo = u.Codigo,
                                           Descripcion = u.Descripcion,
                                           Activo = u.FlagActivo,
                                           FechaCreacion = u.FechaCreacion,
                                           UsuarioCreacion = u.CreadoPor
                                       }).FirstOrDefault();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ParametroDTO GetPrametroById(int id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ParametroDTO GetPrametroById(int id)"
                    , new object[] { null });
            }
        }

        public override ParametroDTO ObtenerParametroApp(string Codigo)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.ParametroApp
                                       where u.Codigo == Codigo
                                       select new ParametroDTO()
                                       {
                                           Valor = u.Valor,
                                           Descripcion = u.Descripcion,
                                           Activo = u.FlagActivo,
                                           FechaCreacion = u.FechaCreacion,
                                           UsuarioCreacion = u.UsuarioCreacion,
                                           Id = u.ParametroAppId
                                       }).FirstOrDefault();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ParametroDTO ObtenerParametro(string Codigo)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ParametroDTO ObtenerParametro(string Codigo)"
                    , new object[] { null });
            }
        }

        public override void ActualizarParametroByCodigo(ParametroDTO parametro, GestionCMDB_ProdEntities _ctx)
        {
            try
            {
                var ctx = _ctx;
                var entidad = ctx.Parametro.FirstOrDefault(x => x.FlagActivo
                && x.Codigo.ToUpper().Equals(parametro.Codigo.ToUpper()));

                if (entidad != null)
                {
                    entidad.Descripcion = string.IsNullOrEmpty(parametro.Descripcion) ? string.Empty : parametro.Descripcion;
                    entidad.Valor = string.IsNullOrEmpty(parametro.Valor) ? string.Empty : parametro.Valor;
                    entidad.FechaModificacion = DateTime.Now;
                    entidad.ModificadoPor = parametro.UsuarioModificacion;

                    ctx.SaveChanges();
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
        }

        public override void ActualizarParametroApp(ParametroDTO parametro)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.ParametroApp
                                   where u.Codigo == parametro.Codigo
                                   select u).FirstOrDefault();
                    if (entidad != null)
                    {                        
                        entidad.Valor = String.IsNullOrEmpty(parametro.Valor) ? string.Empty : parametro.Valor;
                        entidad.FechaModificacion = DateTime.Now;
                        entidad.UsuarioModificacion = parametro.UsuarioModificacion;

                        ctx.SaveChanges();

                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
        }

        public override void ActualizarParametroAppByCodigo(ParametroDTO parametro, GestionCMDB_ProdEntities _ctx)
        {
            try
            {
                var ctx = _ctx;
                var entidad = ctx.ParametroApp.FirstOrDefault(x => x.FlagActivo
                && x.Codigo.ToUpper().Equals(parametro.Codigo.ToUpper()));

                if (entidad != null)
                {
                    entidad.Descripcion = string.IsNullOrEmpty(parametro.Descripcion) ? string.Empty : parametro.Descripcion;
                    entidad.Valor = string.IsNullOrEmpty(parametro.Valor) ? string.Empty : parametro.Valor;
                    entidad.FechaModificacion = DateTime.Now;
                    entidad.UsuarioModificacion = parametro.UsuarioModificacion;

                    ctx.SaveChanges();
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
        }

        public override void ActualizarParametro(string parametro, string valor)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Parametro
                                   where u.Codigo == parametro
                                   select u).First();
                    if (entidad != null)
                    {                        
                        entidad.Valor = valor;
                        entidad.FechaModificacion = DateTime.Now;
                        
                        ctx.SaveChanges();
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorParametroDTO
                    , "Error en el metodo: ActualizarParametro(ParametroDTO parametro)"
                    , new object[] { null });
            }
        }
    }
}
