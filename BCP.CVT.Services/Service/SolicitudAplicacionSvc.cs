﻿using BCP.CVT.Cross;
using BCP.CVT.DTO;
using BCP.CVT.Services.Email;
using BCP.CVT.Services.Interface;
using BCP.CVT.Services.Interface.PortafolioAplicaciones;
using BCP.CVT.Services.ModelDB;
using BCP.PAPP.Common.Cross;
using BCP.PAPP.Common.Dto;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Linq;
using System.Linq.Dynamic;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using IsolationLevel = System.Transactions.IsolationLevel;
using BCP.PAPP.Common.Custom;

namespace BCP.CVT.Services.Service
{
    public class SolicitudAplicacionSvc : SolicitudAplicacionDAO
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public override void AddArchivo(int solicitud, byte[] archivo, string nombreArchivo)
        {
            try
            {
                int ID = 0;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Solicitud
                                   where u.SolicitudAplicacionId == solicitud
                                   select u).First();
                    if (entidad != null)
                    {
                        //entidad.ArchivosAsociados =  archivo;
                        //entidad.NombreArchivos = nombreArchivo;
                        ctx.SaveChanges();
                        ID = entidad.SolicitudAplicacionId;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: int AddArchivo(int solicitud, byte[] archivo, string nombreArchivo)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: int AddArchivo(int solicitud, byte[] archivo, string nombreArchivo)"
                    , new object[] { null });
            }
        }

        public override int AddOrEdit(SolicitudDto objRegistro)
        {
            DbContextTransaction transaction = null;
            try
            {
                int ID = 0;
                int ID_APLICACION = 0;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {
                        if (objRegistro.Id == 0)
                        {
                            var aplicacion = ctx.Aplicacion.FirstOrDefault(x => x.CodigoAPT.Trim() == objRegistro.CodigoAplicacion.Trim() && x.EstadoAplicacion != "Eliminada");
                            if (aplicacion != null)
                            {
                                ID_APLICACION = aplicacion.AplicacionId;
                                var entidad = new Solicitud()
                                {
                                    AplicacionId = aplicacion.AplicacionId,
                                    //ArchivosAsociados = objRegistro.ArchivosAsociados,
                                    EstadoSolicitud = objRegistro.EstadoSolicitud,
                                    Observaciones = objRegistro.Observaciones,
                                    //TicketConformidadRatificacion = objRegistro.TicketConformidadRatificacion,
                                    //TicketEliminacion = objRegistro.TicketEliminacion,
                                    FlagAprobacion = objRegistro.FlagAprobacion,
                                    TipoSolicitud = objRegistro.TipoSolicitud,
                                    FechaCreacion = DateTime.Now,
                                    UsuarioCreacion = objRegistro.UsuarioCreacion
                                };

                                ctx.Solicitud.Add(entidad);
                                ctx.SaveChanges();

                                if (objRegistro.TipoSolicitud == (int)ETipoSolicitudAplicacion.ModificacionAplicacion)
                                {
                                    //atributo aplicacion
                                    var listAtributoDetalle = objRegistro.AtributoDetalle;
                                    if (listAtributoDetalle != null && listAtributoDetalle.Count > 0)
                                    {
                                        foreach (var item in listAtributoDetalle)
                                        {
                                            var entidadAtributoDetalle = new SolicitudCampoModificado()
                                            {
                                                SolicitudAplicacionId = entidad.SolicitudAplicacionId,
                                                AtributoAplicacionId = item.AtributoAplicacionId,
                                                ValorNuevo = item.ValorNuevo,
                                                TablaProcedenciaId = (int)ETablaProcedenciaModificacion.Aplicacion,
                                                FlagActivo = true,
                                                UsuarioCreacion = objRegistro.UsuarioCreacion,
                                                FechaCreacion = DateTime.Now
                                            };

                                            ctx.SolicitudCampoModificado.Add(entidadAtributoDetalle);
                                        }
                                    }

                                    //atributo modulo
                                    //var listModuloDetalle = objRegistro.ModuloDetalle;
                                    //if (listModuloDetalle != null && listModuloDetalle.Count > 0)
                                    //{
                                    //    foreach (var item in listModuloDetalle)
                                    //    {
                                    //        var entidadAtributoDetalle = new SolicitudCampoModificado()
                                    //        {
                                    //            SolicitudAplicacionId = entidad.SolicitudAplicacionId,
                                    //            AtributoAplicacionId = item.AtributoModuloId,
                                    //            ValorNuevo = item.ValorNuevo,
                                    //            TablaProcedenciaId = (int)ETablaProcedenciaModificacion.Modulo,
                                    //            ModuloId = item.ModuloId,
                                    //            FlagActivo = true,
                                    //            UsuarioCreacion = objRegistro.UsuarioCreacion,
                                    //            FechaCreacion = DateTime.Now
                                    //        };

                                    //        ctx.SolicitudCampoModificado.Add(entidadAtributoDetalle);
                                    //    }
                                    //}
                                }

                                ctx.SaveChanges();
                                transaction.Commit();

                                ID = entidad.SolicitudAplicacionId;
                            }
                            else
                                ID = 0;
                        }
                        else
                        {
                            var entidad = (from u in ctx.Solicitud
                                           where u.SolicitudAplicacionId == objRegistro.Id
                                           select u).FirstOrDefault();
                            if (entidad != null)
                            {
                                ID_APLICACION = entidad.AplicacionId;
                                entidad.FechaModificacion = DateTime.Now;
                                entidad.UsuarioModificacion = objRegistro.UsuarioModificacion;
                                entidad.EstadoSolicitud = objRegistro.EstadoSolicitud;

                                if (objRegistro.TipoSolicitud == (int)ETipoSolicitudAplicacion.ModificacionAplicacion)
                                {
                                    //remove items aplicacion
                                    var listAtributosIdsEliminar = objRegistro.RemoveAtributoIds;
                                    if (listAtributosIdsEliminar != null && listAtributosIdsEliminar.Count > 0)
                                    {
                                        foreach (var id in listAtributosIdsEliminar)
                                        {
                                            var itemRemove = (from u in ctx.SolicitudCampoModificado
                                                              where u.SolicitudAplicacionId == entidad.SolicitudAplicacionId
                                                                 && u.AtributoAplicacionId == id
                                                                 && u.FlagActivo
                                                                 && u.TablaProcedenciaId == (int)ETablaProcedenciaModificacion.Aplicacion
                                                              select u).FirstOrDefault();

                                            if (itemRemove != null)
                                            {
                                                itemRemove.FlagActivo = false;
                                            }
                                        }
                                    }

                                    //add items aplicacion
                                    var listAtributoDetalle = objRegistro.AtributoDetalle;
                                    if (listAtributoDetalle != null && listAtributoDetalle.Count > 0)
                                    {
                                        foreach (var item in listAtributoDetalle)
                                        {
                                            var entidadOBJ = (from u in ctx.SolicitudCampoModificado
                                                              where u.FlagActivo
                                                              && u.SolicitudAplicacionId == entidad.SolicitudAplicacionId
                                                              && u.AtributoAplicacionId == item.AtributoAplicacionId
                                                              && u.TablaProcedenciaId == (int)ETablaProcedenciaModificacion.Aplicacion
                                                              select u).FirstOrDefault();

                                            if (entidadOBJ != null)
                                            {
                                                entidadOBJ.ValorNuevo = item.ValorNuevo;
                                                entidadOBJ.FechaModificacion = DateTime.Now;
                                                entidadOBJ.UsuarioModificacion = objRegistro.UsuarioCreacion;
                                            }
                                            else
                                            {
                                                var entidadSCM = new SolicitudCampoModificado()
                                                {
                                                    SolicitudAplicacionId = entidad.SolicitudAplicacionId,
                                                    FlagActivo = true,
                                                    FechaCreacion = DateTime.Now,
                                                    UsuarioCreacion = objRegistro.UsuarioCreacion,
                                                    AtributoAplicacionId = item.AtributoAplicacionId,
                                                    ValorNuevo = item.ValorNuevo,
                                                    TablaProcedenciaId = (int)ETablaProcedenciaModificacion.Aplicacion
                                                };
                                                ctx.SolicitudCampoModificado.Add(entidadSCM);
                                            }
                                        }
                                    }
                                }

                                ctx.SaveChanges();
                                transaction.Commit();

                                ID = entidad.SolicitudAplicacionId;
                            }
                        }
                    }

                    //Registro de eventos en la bitácora
                    if (objRegistro.Id == 0)
                    {
                        //Registro
                        switch (objRegistro.TipoSolicitud)
                        {
                            case (int)ETipoSolicitudAplicacion.CreacionAplicacion:
                                this.AddBitacora(ID_APLICACION, objRegistro.UsuarioCreacion, (int)ETipoBitacora.SolicitudRegistroAplicacion);
                                break;
                            case (int)ETipoSolicitudAplicacion.ModificacionAplicacion:
                                this.AddBitacora(ID_APLICACION, objRegistro.UsuarioCreacion, (int)ETipoBitacora.SolicitudModificacionAplicacion);
                                break;
                            case (int)ETipoSolicitudAplicacion.EliminacionAplicacion:
                                this.AddBitacora(ID_APLICACION, objRegistro.UsuarioCreacion, (int)ETipoBitacora.SolicitudEliminacionAplicacion);
                                if (objRegistro.EstadoSolicitud == (int)EEstadoSolicitudAplicacion.EnRevision)
                                {
                                    var objNotElimRevision = new NotificacionAplicacionDTO()
                                    {
                                        Id = 0,
                                        SolicitudId = ID,
                                        TipoNotificacionId = (int)ETipoNotificacionAplicacion.RegistroSolicitudEliminacion,
                                        UsuarioCreacion = objRegistro.UsuarioCreacion
                                    };
                                    ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotElimRevision, ctx);

                                    break;
                                }
                                break;
                        }
                    }
                    else
                    {
                        //Actualización
                        switch (objRegistro.TipoSolicitud)
                        {
                            case (int)ETipoSolicitudAplicacion.CreacionAplicacion:
                                this.AddBitacora(ID_APLICACION, objRegistro.UsuarioCreacion, (int)ETipoBitacora.ActualizacionSolicitud, "creación");
                                break;
                            case (int)ETipoSolicitudAplicacion.ModificacionAplicacion:
                                this.AddBitacora(ID_APLICACION, objRegistro.UsuarioCreacion, (int)ETipoBitacora.ActualizacionSolicitud, "modificación");
                                break;
                            case (int)ETipoSolicitudAplicacion.EliminacionAplicacion:
                                this.AddBitacora(ID_APLICACION, objRegistro.UsuarioCreacion, (int)ETipoBitacora.ActualizacionSolicitud, "eliminación");
                                if (objRegistro.EstadoSolicitud == (int)EEstadoSolicitudAplicacion.EnRevision)
                                {
                                    var objNotElimRevision = new NotificacionAplicacionDTO()
                                    {
                                        Id = 0,
                                        SolicitudId = ID,
                                        TipoNotificacionId = (int)ETipoNotificacionAplicacion.RegistroSolicitudEliminacion,
                                        UsuarioCreacion = objRegistro.UsuarioCreacion
                                    };
                                    ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotElimRevision, ctx);

                                    break;
                                }
                                break;
                        }
                    }

                }
                return ID;
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: int AddOrEdit(SolicitudDto objRegistro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: int AddOrEdit(SolicitudDto objRegistro)"
                    , new object[] { null });
            }
        }

        public override bool CambiarEstadoSolicitud(int Id, int TipoSolicitudId, int EstadoSolicitudId, string MotivoComentario, string Observacion, string Usuario, int idBandeja)
        {
            DbContextTransaction transaction = null;
            try
            {
                bool retorno = false;
                DateTime FECHA_ACTUAL = DateTime.Now;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {
                        var itemBD = ctx.Solicitud.FirstOrDefault(x => x.SolicitudAplicacionId == Id);
                        if (itemBD != null)
                        {
                            itemBD.EstadoSolicitud = EstadoSolicitudId;

                            switch (TipoSolicitudId)
                            {
                                case (int)ETipoSolicitudAplicacion.CreacionAplicacion:
                                    switch (EstadoSolicitudId)
                                    {
                                        case (int)EEstadoSolicitudAplicacion.Registrado:
                                            itemBD.Observaciones = MotivoComentario;

                                            break;
                                        case (int)EEstadoSolicitudAplicacion.EnRevision:
                                            itemBD.Observaciones = MotivoComentario;

                                            //Notificacion proceso revision
                                            var objNotCreacRevision = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.RegistroSolicitudCreacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotCreacRevision, ctx);

                                            break;
                                        case (int)EEstadoSolicitudAplicacion.Aprobado:
                                            var aplicacion = ctx.Aplicacion.FirstOrDefault(x => x.AplicacionId == itemBD.AplicacionId);
                                            if (aplicacion != null)
                                            {
                                                aplicacion.FlagAprobado = true;
                                                aplicacion.ModificadoPor = Usuario;
                                                aplicacion.FechaModificacion = FECHA_ACTUAL;
                                                ctx.SaveChanges();
                                            }

                                            //Notificacion aprobacion
                                            var objNotCreacAprobacion = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.AprobacionSolicitudCreacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotCreacAprobacion, ctx);

                                            //Notificacion aprobacion definitiva
                                            var objNotCreacAprobacionDef = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.NotificacionBuzonesCreacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotCreacAprobacionDef, ctx);

                                            this.AddBitacora(itemBD.AplicacionId, Usuario, (int)ETipoBitacora.AprobacionRegistroAplicacion, null, null, idBandeja);

                                            break;
                                        case (int)EEstadoSolicitudAplicacion.Observado:
                                            var entidad = new SolicitudComentarios()
                                            {
                                                SolicitudAplicacionId = Id,
                                                Comentarios = Observacion,
                                                UsuarioCreacion = Usuario,
                                                BandejaId = idBandeja,
                                                FechaCreacion = FECHA_ACTUAL,
                                                TipoComentarioId = (int)ETipoComentarioSolicitud.Observacion
                                            };

                                            ctx.SolicitudComentarios.Add(entidad);
                                            ctx.SaveChanges();

                                            this.AddBitacora(itemBD.AplicacionId, Usuario, (int)ETipoBitacora.ObservacionFlujoAplicacion, "creación", Observacion);
                                            break;
                                    }

                                    break;
                                case (int)ETipoSolicitudAplicacion.ModificacionAplicacion:
                                    switch (EstadoSolicitudId)
                                    {
                                        case (int)EEstadoSolicitudAplicacion.Registrado:
                                            itemBD.Observaciones = MotivoComentario;
                                            break;
                                        case (int)EEstadoSolicitudAplicacion.EnRevision:
                                            itemBD.Observaciones = MotivoComentario;

                                            //Notificacion proceso revision
                                            var objNotModifRevision = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.RegistroSolicitudModificacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotModifRevision, ctx);

                                            break;
                                        case (int)EEstadoSolicitudAplicacion.Aprobado:
                                            var solAplicacion = ctx.SolicitudAplicacion.FirstOrDefault(x => !x.FlagAprobacionSol.Value
                                            && x.AplicacionId == itemBD.AplicacionId);

                                            if (solAplicacion != null)
                                            {
                                                solAplicacion.FlagAprobacionSol = true;
                                                solAplicacion.ModificadoPor = Usuario;
                                                solAplicacion.FechaModificacion = FECHA_ACTUAL;
                                                ctx.SaveChanges();
                                            }

                                            var dataSolAplicacionDTO = ServiceManager<AplicacionDAO>.Provider.GetAplicacionById(itemBD.AplicacionId, TipoSolicitudId);
                                            if (dataSolAplicacionDTO != null)
                                            {
                                                UpdateAplicacionAndAplicacionDetalle(ctx, dataSolAplicacionDTO);

                                                //ToDo
                                            }

                                            //Notificacion aprobacion
                                            var objNotModifAprobacion = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.AprobacionSolicitudModificacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotModifAprobacion, ctx);

                                            this.AddBitacora(itemBD.AplicacionId, Usuario, (int)ETipoBitacora.AprobacionModificacionAplicacion);

                                            break;

                                        case (int)EEstadoSolicitudAplicacion.Observado:
                                            var entidad = new SolicitudComentarios()
                                            {
                                                SolicitudAplicacionId = Id,
                                                Comentarios = Observacion,
                                                UsuarioCreacion = Usuario,
                                                FechaCreacion = FECHA_ACTUAL,
                                                TipoComentarioId = (int)ETipoComentarioSolicitud.Observacion
                                            };

                                            ctx.SolicitudComentarios.Add(entidad);
                                            ctx.SaveChanges();

                                            this.AddBitacora(itemBD.AplicacionId, Usuario, (int)ETipoBitacora.ObservacionFlujoAplicacion, "modificación", Observacion);
                                            break;
                                    }
                                    break;
                                case (int)ETipoSolicitudAplicacion.EliminacionAplicacion:
                                    switch (EstadoSolicitudId)
                                    {
                                        case (int)EEstadoSolicitudAplicacion.Registrado:
                                            break;
                                        case (int)EEstadoSolicitudAplicacion.EnRevision:

                                            //Notificacion proceso revision
                                            var objNotElimRevision = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.RegistroSolicitudEliminacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotElimRevision, ctx);

                                            break;
                                        case (int)EEstadoSolicitudAplicacion.Aprobado:
                                            var aplicacion = ctx.Aplicacion.FirstOrDefault(x => x.AplicacionId == itemBD.AplicacionId);
                                            if (aplicacion != null)
                                            {
                                                //aplicacion.FlagActivo = false;
                                                aplicacion.EstadoAplicacion = "Eliminada";
                                                aplicacion.ModificadoPor = Usuario;
                                                aplicacion.FechaModificacion = FECHA_ACTUAL;

                                                //ctx.NuevoCampoPortafolio.Where(x => x.FlagActivo
                                                //&& x.CodigoAPT.ToUpper().Equals(aplicacion.CodigoAPT.ToUpper())).ToList()
                                                //.ForEach(x => {
                                                //    x.FlagActivo = false;
                                                //    x.FlagEliminado = true;
                                                //    x.UsuarioModificacion = Usuario;
                                                //    x.FechaModificacion = FECHA_ACTUAL;
                                                //});

                                                ctx.SaveChanges();
                                            }

                                            var aplicacionDetalle = ctx.AplicacionDetalle.FirstOrDefault(x => x.AplicacionId == itemBD.AplicacionId);
                                            if (aplicacionDetalle != null)
                                            {
                                                //aplicacionDetalle.FlagActivo = false;
                                                aplicacionDetalle.UsuarioModificacion = Usuario;
                                                aplicacionDetalle.FechaModificacion = FECHA_ACTUAL;
                                                ctx.SaveChanges();
                                            }

                                            //Notificacion aprobacion
                                            var objNotElimAprobacion = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.AprobacionSolicitudEliminacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotElimAprobacion, ctx);

                                            //Notificacion aprobacion definitiva
                                            var objNotElimAprobacionDef = new NotificacionAplicacionDTO()
                                            {
                                                Id = 0,
                                                SolicitudId = itemBD.SolicitudAplicacionId,
                                                TipoNotificacionId = (int)ETipoNotificacionAplicacion.NotificacionBuzonesEliminacion,
                                                UsuarioCreacion = Usuario
                                            };
                                            ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotElimAprobacionDef, ctx);

                                            this.AddBitacora(itemBD.AplicacionId, Usuario, (int)ETipoBitacora.AprobacionEliminacionAplicacion);

                                            break;

                                        case (int)EEstadoSolicitudAplicacion.Observado:
                                            var entidad = new SolicitudComentarios()
                                            {
                                                SolicitudAplicacionId = Id,
                                                Comentarios = Observacion,
                                                UsuarioCreacion = Usuario,
                                                FechaCreacion = FECHA_ACTUAL,
                                                TipoComentarioId = (int)ETipoComentarioSolicitud.Observacion
                                            };

                                            ctx.SolicitudComentarios.Add(entidad);
                                            ctx.SaveChanges();

                                            this.AddBitacora(itemBD.AplicacionId, Usuario, (int)ETipoBitacora.ObservacionFlujoAplicacion, "creación", Observacion);
                                            break;
                                    }
                                    break;
                            }

                            itemBD.FechaModificacion = FECHA_ACTUAL;
                            itemBD.UsuarioModificacion = Usuario;
                            ctx.SaveChanges();
                            transaction.Commit();

                            retorno = true;
                        }
                    }

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarEstadoSTD(int id, int estadoTec, string obs, string usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarEstadoSTD(int id, int estadoTec, string obs, string usuario)"
                    , new object[] { null });
            }
        }

        private void UpdateAplicacionAndAplicacionDetalle(GestionCMDB_ProdEntities ctx, AplicacionDTO objeto)
        {
            try
            {
                DateTime FECHA_ACTUAL = DateTime.Now;

                var entidad = ctx.Aplicacion.FirstOrDefault(x => x.AplicacionId == objeto.Id);
                if (entidad != null)
                {
                    entidad.Nombre = objeto.Nombre;
                    entidad.DescripcionAplicacion = objeto.DescripcionAplicacion;
                    entidad.FechaModificacion = FECHA_ACTUAL;
                    entidad.ModificadoPor = objeto.UsuarioModificacion;

                    entidad.Owner_LiderUsuario_ProductOwner = objeto.Owner_LiderUsuario_ProductOwner;
                    entidad.Gestor_UsuarioAutorizador_ProductOwner = objeto.Gestor_UsuarioAutorizador_ProductOwner;
                    entidad.TribeTechnicalLead = objeto.TribeTechnicalLead;
                    entidad.Experto_Especialista = objeto.Experto_Especialista;
                    entidad.BrokerSistemas = objeto.BrokerSistemas;
                    entidad.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner = objeto.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner;

                    //AddOrEditResponsablesAplicacion(objeto);

                    entidad.TipoActivoInformacion = objeto.TipoActivoInformacion;
                    entidad.GerenciaCentral = objeto.GerenciaCentral;
                    entidad.Division = objeto.Division;
                    entidad.Area = objeto.Area;
                    entidad.Unidad = objeto.Unidad;
                    entidad.CodigoAPT = objeto.CodigoAPT;
                    entidad.DescripcionAplicacion = objeto.DescripcionAplicacion;
                    entidad.EstadoAplicacion = objeto.EstadoAplicacion;
                    entidad.CategoriaTecnologica = objeto.CategoriaTecnologica;
                    entidad.AreaBIAN = objeto.AreaBIAN;
                    entidad.DominioBIAN = objeto.DominioBIAN;
                    entidad.JefaturaATI = objeto.JefaturaATI;
                    entidad.CriticidadId = objeto.CriticidadId;
                    entidad.ClasificacionTecnica = objeto.ClasificacionTecnica;
                    entidad.SubclasificacionTecnica = objeto.SubclasificacionTecnica;
                    entidad.ArquitectoTI = objeto.ArquitectoTI;
                    entidad.GestionadoPor = objeto.GestionadoPor;
                    entidad.EntidadResponsable = objeto.EntidadResponsable;
                    entidad.GestorUserIT = objeto.GestorUserIT;
                    entidad.FechaCreacionAplicacion = objeto.FechaCreacionAplicacion;
                    entidad.NombreEquipo_Squad = objeto.NombreEquipo_Squad;

                    ctx.SaveChanges();
                }

                var objAD = objeto.AplicacionDetalle;
                var entidadAD = ctx.AplicacionDetalle.FirstOrDefault(x => x.AplicacionDetalleId == objAD.Id);
                if (entidadAD != null)
                {
                    entidadAD.FechaModificacion = FECHA_ACTUAL;
                    entidadAD.UsuarioModificacion = objAD.UsuarioModificacion;
                    entidadAD.MotivoCreacion = objAD.MotivoCreacion;
                    entidadAD.PersonaSolicitud = objAD.PersonaSolicitud;
                    entidadAD.ModeloEntrega = objAD.ModeloEntrega;
                    entidadAD.PlataformaBCP = objAD.PlataformaBCP;
                    entidadAD.EntidadUso = objAD.EntidadUso;
                    entidadAD.Proveedor = objAD.Proveedor;
                    entidadAD.Ubicacion = objAD.Ubicacion;
                    entidadAD.Infraestructura = objAD.Infraestructura;
                    entidadAD.RutaRepositorio = objAD.RutaRepositorio;
                    entidadAD.Contingencia = objAD.Contingencia;
                    entidadAD.MetodoAutenticacion = objAD.MetodoAutenticacion;
                    entidadAD.MetodoAutorizacion = objAD.MetodoAutorizacion;
                    entidadAD.AmbienteInstalacion = objAD.AmbienteInstalacion;
                    entidadAD.GrupoServiceDesk = objAD.GrupoServiceDesk;
                    entidadAD.FlagOOR = objAD.FlagOOR;
                    entidadAD.FlagRatificaOOR = objAD.FlagRatificaOOR;
                    entidadAD.AplicacionReemplazo = objAD.AplicacionReemplazo;
                    entidadAD.TipoDesarrollo = objAD.TipoDesarrollo;

                    entidadAD.CodigoInterfaz = objAD.CodigoInterfaz;
                    entidadAD.InterfazApp = objAD.InterfazApp;
                    entidadAD.NombreServidor = objAD.NombreServidor;
                    entidadAD.CompatibilidadWindows = objAD.CompatibilidadWindows;
                    entidadAD.CompatibilidadNavegador = objAD.CompatibilidadNavegador;
                    entidadAD.CompatibilidadHV = objAD.CompatibilidadHV;
                    entidadAD.InstaladaDesarrollo = objAD.InstaladaDesarrollo;
                    entidadAD.InstaladaCertificacion = objAD.InstaladaCertificacion;
                    entidadAD.InstaladaProduccion = objAD.InstaladaProduccion;
                    entidadAD.GrupoTicketRemedy = objAD.GrupoTicketRemedy;
                    entidadAD.NCET = objAD.NCET;
                    entidadAD.NCLS = objAD.NCLS;
                    entidadAD.NCG = objAD.NCG;
                    entidadAD.ResumenSeguridadInformacion = objAD.ResumenSeguridadInformacion;
                    entidadAD.ProcesoClave = objAD.ProcesoClave;
                    entidadAD.Confidencialidad = objAD.Confidencialidad;
                    entidadAD.Integridad = objAD.Integridad;
                    entidadAD.Disponibilidad = objAD.Disponibilidad;
                    entidadAD.Privacidad = objAD.Privacidad;
                    entidadAD.Clasificacion = objAD.Clasificacion;
                    entidadAD.RoadmapPlanificado = objAD.RoadmapPlanificado;
                    entidadAD.DetalleEstrategia = objAD.DetalleEstrategia;
                    entidadAD.EstadoRoadmap = objAD.EstadoRoadmap;
                    entidadAD.EtapaAtencion = objAD.EtapaAtencion;
                    entidadAD.RoadmapEjecutado = objAD.RoadmapEjecutado;
                    entidadAD.FechaInicioRoadmap = objAD.FechaInicioRoadmap;
                    entidadAD.FechaFinRoadmap = objAD.FechaFinRoadmap;
                    entidadAD.CodigoAppReemplazo = objAD.CodigoAppReemplazo;

                    entidadAD.SWBase_SO = objAD.SWBase_SO;
                    entidadAD.SWBase_HP = objAD.SWBase_HP;
                    entidadAD.SWBase_LP = objAD.SWBase_LP;
                    entidadAD.SWBase_BD = objAD.SWBase_BD;
                    entidadAD.SWBase_Framework = objAD.SWBase_Framework;
                    entidadAD.RET = objAD.RET;

                    entidadAD.CriticidadAplicacionBIA = objAD.CriticidadAplicacionBIA;
                    entidadAD.ProductoMasRepresentativo = objAD.ProductoMasRepresentativo;
                    entidadAD.MenorRTO = objAD.MenorRTO;
                    entidadAD.MayorGradoInterrupcion = objAD.MayorGradoInterrupcion;

                    entidadAD.FlagFileCheckList = objAD.FlagFileCheckList;
                    entidadAD.FlagFileMatriz = objAD.FlagFileMatriz;

                    entidadAD.GestorAplicacionCTR = objAD.GestorAplicacionCTR;
                    entidadAD.ConsultorCTR = objAD.ConsultorCTR;
                    entidadAD.ValorL_NC = objAD.ValorL_NC;
                    entidadAD.ValorM_NC = objAD.ValorM_NC;
                    entidadAD.ValorN_NC = objAD.ValorN_NC;
                    entidadAD.ValorPC_NC = objAD.ValorPC_NC;
                    entidadAD.UnidadUsuario = objAD.UnidadUsuario;

                    ctx.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public override SolicitudDto GetContenidoFileSolicitudById(int Id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Solicitud
                                   where u.SolicitudAplicacionId == Id
                                   //&& u.Activo
                                   select new SolicitudDto()
                                   {
                                       Id = u.SolicitudAplicacionId,
                                       //ArchivosAsociados = u.ArchivosAsociados,
                                       //NombreArchivos = u.NombreArchivos
                                   }).FirstOrDefault();

                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
        }

        public override SolicitudDto GetSolicitudById(int Id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Solicitud
                                   join a in ctx.Aplicacion on u.AplicacionId equals a.AplicacionId
                                   where u.SolicitudAplicacionId == Id
                                   //&& a.FlagActivo
                                   //&& u.Activo
                                   select new SolicitudDto()
                                   {
                                       Id = u.SolicitudAplicacionId,
                                       TipoSolicitud = u.TipoSolicitud,
                                       AplicacionId = u.AplicacionId,
                                       EstadoSolicitud = u.EstadoSolicitud,
                                       Observaciones = u.Observaciones,
                                       //TicketEliminacion = u.TicketEliminacion,
                                       //TicketConformidadRatificacion = u.TicketConformidadRatificacion,
                                       //NombreArchivos = u.NombreArchivos,
                                       FechaCreacion = u.FechaCreacion,
                                       UsuarioCreacion = u.UsuarioCreacion,
                                       CodigoAplicacion = a.CodigoAPT,
                                       NombreAplicacion = a.CodigoAPT + " - " + a.Nombre
                                   }).FirstOrDefault();
                    if (entidad != null)
                    {
                        if (entidad.EstadoSolicitud == (int)EEstadoSolicitudAplicacion.Observado)
                        {
                            var comentarios = (from t in ctx.SolicitudComentarios
                                               where t.SolicitudAplicacionId == entidad.Id
                                               orderby t.FechaCreacion descending
                                               select t.Comentarios).FirstOrDefault();

                            if (comentarios != null) entidad.Comentarios = comentarios;
                        }
                    }

                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.Solicitud
                                         join u2 in ctx.Application on u.AplicacionId equals u2.AppId
                                         join u3 in ctx.TipoActivoInformacion on u2.assetType equals u3.TipoActivoInformacionId
                                         where
                                         (u2.applicationId.ToUpper().Contains(pag.CodigoApt.ToUpper()) || string.IsNullOrEmpty(pag.CodigoApt)) &&
                                         u.TipoSolicitud == (int)TipoSolicitud.Modificacion &&
                                         (pag.EstadoSolicitud.Contains(u.EstadoSolicitud) || pag.EstadoSolicitud.Count == 0)
                                         orderby u.FechaCreacion descending
                                         select new SolicitudDto()
                                         {
                                             Id = u.SolicitudAplicacionId,
                                             CodigoAplicacion = u2.applicationId,
                                             NombreAplicacion = u2.applicationName,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             AplicacionId = u.AplicacionId,
                                             EstadoSolicitud = u.EstadoSolicitud,
                                             FlagAprobacion = u.FlagAprobacion,
                                             TipoSolicitud = u.TipoSolicitud,
                                             TipoActivoInformacion = u3.Nombre,
                                             Observaciones = u.Observaciones,
                                             NombreUsuarioModificacion = u.NombreUsuarioModificacion,
                                             FechaAprobacion = u.FechaAprobacion
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDto> GetSolicitudes2(PaginacionSolicitud pag, out int totalRows)
        {
            var idsAutorizados = new List<int>() {
                (int)ApplicationManagerRole.Broker,
                (int)ApplicationManagerRole.Experto,
                (int)ApplicationManagerRole.JefeDeEquipo,
                (int)ApplicationManagerRole.Owner,
                (int)ApplicationManagerRole.TL,
                (int)ApplicationManagerRole.TTL,
                (int)ApplicationManagerRole.UsuarioAutorizador
            };
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.Solicitud
                                         join u2 in ctx.Application on u.AplicacionId equals u2.AppId
                                         join u3 in ctx.TipoActivoInformacion on u2.assetType equals u3.TipoActivoInformacionId
                                         join u4 in ctx.ApplicationManagerCatalog on u2.applicationId equals u4.applicationId
                                         where u4.username == pag.Matricula &&
                                         (u2.applicationId.ToUpper().Contains(pag.CodigoApt.ToUpper()) || string.IsNullOrEmpty(pag.CodigoApt)) &&
                                         u.TipoSolicitud == (int)TipoSolicitud.Modificacion &&
                                         u.EstadoSolicitud == (pag.EstadoSolicitudUnico == -1 ? u.EstadoSolicitud : pag.EstadoSolicitudUnico) &&
                                         u2.status != (int)ApplicationState.Eliminada &&
                                         idsAutorizados.Contains(u4.applicationManagerId)
                                         orderby u.FechaCreacion descending
                                         select new SolicitudDto()
                                         {
                                             Id = u.SolicitudAplicacionId,
                                             CodigoAplicacion = u2.applicationId,
                                             NombreAplicacion = u2.applicationName,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             AplicacionId = u.AplicacionId,
                                             EstadoSolicitud = u.EstadoSolicitud,
                                             FlagAprobacion = u.FlagAprobacion,
                                             TipoSolicitud = u.TipoSolicitud,
                                             TipoActivoInformacion = u3.Nombre,
                                             Observaciones = u.Observaciones,
                                             NombreUsuarioAprobacion = u.NombreUsuarioAprobacion,
                                             NombreUsuarioModificacion = u.NombreUsuarioModificacion,
                                             Solicitante = u.NombreSolicitante,
                                             FechaAprobacion = u.FechaAprobacion
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();

                        List<SolicitudDto> resultado = registros.GroupBy(p => new
                        {
                            p.Id,
                            p.CodigoAplicacion,
                            p.NombreAplicacion,
                            p.UsuarioCreacion,
                            p.FechaCreacion,
                            p.FechaModificacion,
                            p.UsuarioModificacion,
                            p.AplicacionId,
                            p.EstadoSolicitud,
                            p.FlagAprobacion,
                            p.TipoSolicitud,
                            p.TipoActivoInformacion,
                            p.Observaciones,
                            p.NombreUsuarioAprobacion
                        })
                                                                  .Select(g => g.First())
                                                                  .ToList();
                        totalRows = resultado.Count();

                        var resultadoFinal = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();
                        return resultadoFinal;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDto> GetSolicitudes3(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.Solicitud
                                         join u2 in ctx.Application on u.AplicacionId equals u2.AppId

                                         join u3 in ctx.ApplicationManagerCatalog on u2.applicationId equals u3.applicationId
                                         join ti in ctx.TipoActivoInformacion on u2.assetType equals ti.TipoActivoInformacionId into lj0
                                         from ti in lj0.DefaultIfEmpty()
                                         where
                                         u3.username == pag.Matricula &&
                                         (u2.applicationId.ToUpper().Contains(pag.CodigoApt.ToUpper()) || string.IsNullOrEmpty(pag.CodigoApt)) &&
                                         u.TipoSolicitud == (int)TipoSolicitud.Eliminacion
                                         && pag.EstadoSolicitud.Contains(u.EstadoSolicitud)
                                         orderby u.FechaCreacion descending
                                         select new SolicitudDto()
                                         {
                                             Id = u.SolicitudAplicacionId,
                                             CodigoAplicacion = u2.applicationId,
                                             NombreAplicacion = u2.applicationName,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             AplicacionId = u.AplicacionId,
                                             EstadoSolicitud = u.EstadoSolicitud,
                                             FlagAprobacion = u.FlagAprobacion,
                                             TipoSolicitud = u.TipoSolicitud,
                                             TipoActivoInformacion = ti == null ? "" : ti.Nombre,
                                             Observaciones = u.Observaciones,
                                             NombreUsuarioAprobacion = u.NombreUsuarioAprobacion,
                                             NombreUsuarioModificacion = u.NombreUsuarioModificacion,
                                             assetType = u2.assetType,
                                             FechaAprobacion = u.FechaAprobacion,
                                             ObservacionesRechazo = string.IsNullOrEmpty(u.ObservacionesRechazo) ? u.ObservacionesAprobacion : u.ObservacionesRechazo,
                                             FechaRechazo = u.FechaRechazo,
                                             NombreRechazo = u.NombreRechazo

                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();


                        /*
                        foreach (SolicitudDto a in registros)
                        {
                            var item = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == a.assetType);
                            if (item != null) { a.TipoActivoInformacion = item.Nombre; }
                        }
                        */
                        List<SolicitudDto> resultado = registros
                          .GroupBy(p => new
                          {
                              p.Id,
                              p.CodigoAplicacion,
                              p.NombreAplicacion,
                              p.UsuarioCreacion,
                              p.FechaCreacion,
                              p.FechaModificacion,
                              p.UsuarioModificacion,
                              p.AplicacionId,
                              p.EstadoSolicitud,
                              p.FlagAprobacion,
                              p.TipoSolicitud,
                              p.TipoActivoInformacion,
                              p.Observaciones,
                              p.NombreUsuarioAprobacion
                          })
                          .Select(g => g.First())
                          .ToList();
                        totalRows = resultado.Count();

                        var resultadoFinal = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();
                        return resultadoFinal;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetColumnaAplicacionByFiltro(string filtro, string tablaProcedencia, string IdsTipoFlujo = null)
        {
            try
            {
                var lstTablaProcedencia = new List<int>();
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        if (!string.IsNullOrEmpty(tablaProcedencia))
                            lstTablaProcedencia = tablaProcedencia.Split(';').Select(int.Parse).ToList();

                        var entidad = (from u in ctx.ConfiguracionColumnaAplicacion
                                       join x in ctx.InfoCampoPortafolio on u.ConfiguracionColumnaAplicacionId equals x.ConfiguracionColumnaAplicacionId
                                       where u.FlagActivo && u.FlagEdicion.Value
                                       && (string.IsNullOrEmpty(filtro)
                                       || u.NombreBD.ToUpper().Contains(filtro.ToUpper())
                                       || u.NombreExcel.ToUpper().Contains(filtro.ToUpper()))
                                       && (string.IsNullOrEmpty(tablaProcedencia) || lstTablaProcedencia.Contains(u.TablaProcedencia.Value))
                                       && (string.IsNullOrEmpty(x.TipoFlujoId) || string.IsNullOrEmpty(IdsTipoFlujo) || x.TipoFlujoId.Contains(IdsTipoFlujo))
                                       orderby u.NombreBD
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.ConfiguracionColumnaAplicacionId.ToString(),
                                           Descripcion = u.NombreExcel,
                                           value = u.NombreExcel,
                                           TipoInputId = x.TipoInputId
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
        }

        public override string GetUltimoComentarioBySolicitudId(int Id)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.SolicitudComentarios
                                       where u.SolicitudAplicacionId == Id
                                       orderby u.FechaCreacion descending
                                       select u.Comentarios).FirstOrDefault();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
        }

        public override int AddOrEditSolicitudComentarios(SolicitudComentariosDTO objRegistro)
        {
            DbContextTransaction transaction = null;
            try
            {
                int ID = 0;
                DateTime FECHA_ACTUAL = DateTime.Now;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {
                        if (objRegistro.Id == 0)
                        {
                            var entidad = new SolicitudComentarios()
                            {
                                SolicitudComentariosId = objRegistro.Id,
                                SolicitudAplicacionId = objRegistro.SolicitudAplicacionId,
                                Comentarios = objRegistro.Comentarios,
                                UsuarioCreacion = objRegistro.UsuarioCreacion,
                                FechaCreacion = FECHA_ACTUAL,
                                TipoComentarioId = objRegistro.TipoComentarioId,
                                BandejaId = objRegistro.BandejaId,
                                MatriculaResponsable = objRegistro.MatriculaResponsable
                            };

                            ctx.SolicitudComentarios.Add(entidad);
                            ctx.SaveChanges();
                            //transaction.Commit();

                            ID = entidad.SolicitudComentariosId;
                        }
                        else
                        {
                            var entidad = (from u in ctx.SolicitudComentarios
                                           where u.SolicitudComentariosId == objRegistro.Id
                                           select u).FirstOrDefault();
                            if (entidad != null)
                            {
                                entidad.Comentarios = objRegistro.Comentarios;
                                entidad.FechaModificacion = FECHA_ACTUAL;
                                entidad.UsuarioModificacion = objRegistro.UsuarioModificacion;
                                ctx.SaveChanges();
                                //transaction.Commit();

                                ID = entidad.SolicitudComentariosId;
                            }
                        }

                        //Cambio de estado a la solicitud aprobador con estado Observado
                        var iSolicitud = ctx.Solicitud.FirstOrDefault(x => x.SolicitudAplicacionId == objRegistro.SolicitudAplicacionId);
                        if (iSolicitud != null)
                        {
                            if (!iSolicitud.FlagAprobacion.Value)
                            {
                                var listObservadoSa = ctx.SolicitudAprobadores.Where(x => x.FlagActivo
                                && x.SolicitudAplicacionId == objRegistro.SolicitudAplicacionId
                                && x.EstadoAprobacion == (int)EEstadoSolicitudAplicacion.Observado).ToList();

                                if (listObservadoSa != null && listObservadoSa.Count > 0)
                                {
                                    foreach (var item in listObservadoSa)
                                    {
                                        item.EstadoAprobacion = (int)EEstadoSolicitudAplicacion.EnRevision;
                                        ctx.SaveChanges();
                                    }

                                }
                            }
                        }

                        transaction.Commit();

                        return ID;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: int AddOrEditTipo(TipoDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: int AddOrEditTipo(TipoDTO objeto)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudComentariosDTO> GetSolicitudComentarios(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.SolicitudComentarios
                                         where u.SolicitudAplicacionId == pag.SolicitudAplicacionId
                                         //orderby u.FechaCreacion descending
                                         select new SolicitudComentariosDTO()
                                         {
                                             Id = u.SolicitudComentariosId,
                                             SolicitudAplicacionId = u.SolicitudAplicacionId,
                                             Comentarios = u.Comentarios,
                                             TipoComentarioId = u.TipoComentarioId.Value,
                                             BandejaId = u.BandejaId,
                                             MatriculaResponsable = u.MatriculaResponsable,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public List<RetornoQueryApp> GetValorColumnaByAplicacionId(int AplicacionId, string nombreColumna, int tablaProcedencia, int atributoId)
        {
            try
            {
                nombreColumna = string.IsNullOrEmpty(nombreColumna) ? string.Empty : nombreColumna;
                nombreColumna = tablaProcedencia == (int)ETablaProcedenciaAplicacion.InfoCampoPortafolio ? "Valor" : nombreColumna;

                var cadenaConexion = ConfigurationManager.ConnectionStrings["GestionCMDB_Connection"].ConnectionString;
                var lista = new List<RetornoQueryApp>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_OBTENER_VALOR_COLUMNA_APLICACION]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@aplicacionId", AplicacionId));
                        comando.Parameters.Add(new SqlParameter("@nombreColumnaBD", nombreColumna));
                        comando.Parameters.Add(new SqlParameter("@tablaProcedencia", tablaProcedencia));
                        comando.Parameters.Add(new SqlParameter("@atributoId", atributoId));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new RetornoQueryApp()
                            {
                                ValorActual = reader.IsDBNull(reader.GetOrdinal(nombreColumna)) ? string.Empty : reader.GetString(reader.GetOrdinal(nombreColumna)),
                            };

                            lista.Add(objeto);
                        }
                        reader.Close();
                    }
                    cnx.Close();

                    return lista;
                }
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorEquipoDTO
                    , "Error en el metodo: List<EquipoDTO> GetEquipos(string nombre, string so, int ambiente, int tipo, int subdominioSO, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public List<RetornoQueryApp> GetValorColumnaByModuloId(int moduloId, string nombreColumna)
        {
            try
            {
                nombreColumna = string.IsNullOrEmpty(nombreColumna) ? string.Empty : nombreColumna;

                var cadenaConexion = ConfigurationManager.ConnectionStrings["GestionCMDB_Connection"].ConnectionString;
                var lista = new List<RetornoQueryApp>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_OBTENER_VALOR_COLUMNA_MODULO]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@moduloId", moduloId));
                        comando.Parameters.Add(new SqlParameter("@nombreColumnaBD", nombreColumna));
                        //comando.Parameters.Add(new SqlParameter("@tablaProcedencia", tablaProcedencia));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new RetornoQueryApp()
                            {
                                ValorActual = reader.IsDBNull(reader.GetOrdinal(nombreColumna)) ? string.Empty : reader.GetString(reader.GetOrdinal(nombreColumna)),
                            };

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
                throw new CVTException(CVTExceptionIds.ErrorEquipoDTO
                    , "Error en el metodo: List<EquipoDTO> GetEquipos(string nombre, string so, int ambiente, int tipo, int subdominioSO, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public void EjecutarUpdateApp(string query)
        {
            try
            {
                query = string.IsNullOrEmpty(query) ? string.Empty : query;

                var cadenaConexion = ConfigurationManager.ConnectionStrings["GestionCMDB_Connection"].ConnectionString;
                var lista = new List<RetornoQueryApp>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_UPDATE_APLICACION]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@query", query));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);
                        reader.Close();
                    }
                    cnx.Close();
                }
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorEquipoDTO
                    , "Error en el metodo: List<EquipoDTO> GetEquipos(string nombre, string so, int ambiente, int tipo, int subdominioSO, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetProveedorDesarrolloByFiltro(string filtro)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.AplicacionDetalle
                                       where u.FlagActivo
                                       && u.Proveedor.ToUpper().Contains(filtro.ToUpper())
                                       orderby u.Proveedor
                                       group u by u.Proveedor into grp
                                       select new CustomAutocomplete()
                                       {
                                           Id = grp.Key,
                                           Descripcion = grp.Key,
                                           value = grp.Key
                                       }).ToList();

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetColumnaModuloByFiltro(string filtro)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.ConfiguracionColumnaModulo
                                       where u.FlagActivo && u.FlagEdicion.Value
                                       && (string.IsNullOrEmpty(filtro)
                                       || u.NombreBD.ToUpper().Contains(filtro.ToUpper())
                                       || u.NombreForm.ToUpper().Contains(filtro.ToUpper()))
                                       orderby u.NombreBD
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.ConfiguracionColumnaModuloId.ToString(),
                                           Descripcion = u.NombreForm,
                                           value = u.NombreForm,
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetModuloByCodigoAPT(string codigoAPT)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.ModuloAplicacion
                                       where u.FlagActivo
                                       && (string.IsNullOrEmpty(codigoAPT) || u.CodigoAPT.ToUpper().Equals(codigoAPT.ToUpper()))
                                       orderby u.Codigo
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.ModuloAplicacionId.ToString(),
                                           Descripcion = u.Codigo,
                                           value = u.Codigo,
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<RelacionTecnologiaDTO> GetAllTecnologia()"
                    , new object[] { null });
            }
        }

        public override int AddOrEditSolicitudAprobadores(SolicitudAprobadoresDTO objRegistro)
        {
            DbContextTransaction transaction = null;
            try
            {
                DateTime FECHA_ACTUAL = DateTime.Now;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {
                        if (objRegistro.Id == 0)
                        {
                            var entidad = new SolicitudAprobadores()
                            {
                                SolicitudAprobadoresId = objRegistro.Id,
                                SolicitudAplicacionId = objRegistro.SolicitudAplicacionId,
                                Matricula = objRegistro.Matricula,
                                FlagAprobado = objRegistro.FlagAprobado,
                                UsuarioCreacion = objRegistro.UsuarioCreacion,
                                FlagActivo = true,
                                FechaCreacion = FECHA_ACTUAL
                            };

                            ctx.SolicitudAprobadores.Add(entidad);
                            ctx.SaveChanges();

                            transaction.Commit();

                            return entidad.SolicitudAprobadoresId;
                        }
                        else
                        {
                            var entidad = (from u in ctx.SolicitudAprobadores
                                           where u.SolicitudAprobadoresId == objRegistro.Id
                                           select u).FirstOrDefault();
                            if (entidad != null)
                            {
                                //entidad.Matricula = objRegistro.Matricula;
                                entidad.FechaModificacion = FECHA_ACTUAL;
                                entidad.UsuarioModificacion = objRegistro.UsuarioModificacion;

                                ctx.SaveChanges();

                                transaction.Commit();

                                return entidad.SolicitudAprobadoresId;
                            }
                            else
                                return 0;
                        }
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: int AddOrEditTipo(TipoDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: int AddOrEditTipo(TipoDTO objeto)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDto> GetSolicitudesAprobador(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;
                var lMatriculas = new List<string>();
                string lMatriculaAprobadores = Settings.Get<string>("Responsables.Portafolio");
                if (!string.IsNullOrEmpty(lMatriculaAprobadores))
                    lMatriculas = lMatriculaAprobadores.Split('|').ToList();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.SolicitudAprobadores
                                         join u1 in ctx.Solicitud on u.SolicitudAplicacionId equals u1.SolicitudAplicacionId
                                         join u2 in ctx.Aplicacion on u1.AplicacionId equals u2.AplicacionId
                                         join u3 in ctx.AplicacionDetalle on u2.AplicacionId equals u3.AplicacionId
                                         where (u2.CodigoAPT.ToUpper().Contains(pag.CodigoApt.ToUpper())
                                         || string.IsNullOrEmpty(pag.CodigoApt))
                                         && (pag.EstadoSolicitud.Contains(u1.EstadoSolicitud))
                                         //&& (pag.TipoSolicitud == -1 || u.TipoSolicitud == pag.TipoSolicitud)
                                         && u1.TipoSolicitud == (int)ETipoSolicitudAplicacion.CreacionAplicacion
                                         && (pag.FechaDesde == null || DbFunctions.TruncateTime(u.FechaCreacion) >= DbFunctions.TruncateTime(pag.FechaDesde).Value)
                                         && (pag.FechaHasta == null || DbFunctions.TruncateTime(u.FechaCreacion) <= DbFunctions.TruncateTime(pag.FechaHasta).Value)
                                         && (/*pag.PerfilId == (int)EPerfilBCP.Administrador*/ /*|| u.UsuarioCreacion == pag.Matricula*/
                                         string.IsNullOrEmpty(lMatriculaAprobadores) || lMatriculas.Contains(pag.Matricula)
                                         || u.Matricula.Contains(pag.Matricula))
                                         //&& !u1.FlagAprobacion.Value //Historico de solicitudes
                                         //&& u.Matricula.Contains(pag.Matricula)
                                         && (pag.BandejaId == 0 || u.BandejaId == pag.BandejaId)
                                         //&& (string.IsNullOrEmpty(pag.ModeloEntrega) || u3.ModeloEntrega.ToUpper().Contains(pag.ModeloEntrega.ToUpper()))
                                         && (string.IsNullOrEmpty(pag.ModeloEntrega) || pag.ModeloEntrega.ToUpper().Contains(u3.ModeloEntrega.ToUpper()))
                                         orderby u.FechaCreacion descending
                                         select new SolicitudDto()
                                         {
                                             Id = u.SolicitudAplicacionId,
                                             CodigoAplicacion = u2.CodigoAPT,
                                             NombreAplicacion = u2.Nombre,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             AplicacionId = u1.AplicacionId,
                                             EstadoSolicitud = u1.EstadoSolicitud,
                                             TipoSolicitud = u1.TipoSolicitud,
                                             FlagAprobadorBandeja = u.FlagAprobado,
                                             EstadoAprobacionBandeja = u.EstadoAprobacion,
                                             ArquitectoTI = u2.ArquitectoTI,
                                             ClasificacionTecnica = u2.ClasificacionTecnica,
                                             SubclasificacionTecnica = u2.SubclasificacionTecnica,
                                             AreaBian = u2.AreaBIAN,
                                             DominioBian = u2.DominioBIAN,
                                             JefaturaATI = u2.JefaturaATI,
                                             PlataformaBCP = u3.PlataformaBCP,
                                             ModeloEntrega = u3.ModeloEntrega,
                                             LiderUsuario_PO = u2.Owner_LiderUsuario_ProductOwner,
                                             UsuarioAutorizador_PO = u2.Gestor_UsuarioAutorizador_ProductOwner,
                                             Experto_Especialista = u2.Experto_Especialista,
                                             JefeEquipo_PO = u2.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner,
                                             TTL = u2.TribeTechnicalLead,
                                             GestionadoPor = u2.GestionadoPor,
                                             GerenciaCentral = u2.GerenciaCentral,
                                             Division = u2.Division,
                                             Area = u2.Area,
                                             Unidad = u2.Unidad,
                                             TipoActivoInformacion = u2.TipoActivoInformacion
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        if (resultado != null && resultado.Count > 0)
                        {
                            resultado.ForEach(x =>
                            {
                                x.ArquitectoTI = new ADUsuario().ObtenerADUsuario(x.ArquitectoTI).Matricula_NombreCompleto;
                                x.LiderUsuario_PO = new ADUsuario().ObtenerADUsuario(x.LiderUsuario_PO).Matricula_NombreCompleto;
                                x.UsuarioAutorizador_PO = new ADUsuario().ObtenerADUsuario(x.UsuarioAutorizador_PO).Matricula_NombreCompleto;
                                x.Experto_Especialista = new ADUsuario().ObtenerADUsuario(x.Experto_Especialista).Matricula_NombreCompleto;
                                x.JefeEquipo_PO = new ADUsuario().ObtenerADUsuario(x.JefeEquipo_PO).Matricula_NombreCompleto;
                                x.TTL = new ADUsuario().ObtenerADUsuario(x.TTL).Matricula_NombreCompleto;
                            });
                        }

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudesAprobador(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudesAprobador(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        private int GetTipoNotificacionByBandejaAprobacion(int idBandeja)
        {
            int idTipoNotificacion = 0;
            switch (idBandeja)
            {
                case (int)EBandejaAprobadorAplicacion.ArquitecturaTI:
                    idTipoNotificacion = (int)ETipoNotificacionAplicacion.CambioEstadoArquitecturaTI;
                    break;
                case (int)EBandejaAprobadorAplicacion.ClasificacionTecnica:
                    idTipoNotificacion = (int)ETipoNotificacionAplicacion.CambioEstadoClasificacion;
                    break;
                case (int)EBandejaAprobadorAplicacion.DevSecOps:
                    idTipoNotificacion = (int)ETipoNotificacionAplicacion.CambioEstadoDevOps;
                    break;
                case (int)EBandejaAprobadorAplicacion.PO:
                    idTipoNotificacion = (int)ETipoNotificacionAplicacion.CambioEstadoLiderUsuario;
                    break;
                case (int)EBandejaAprobadorAplicacion.TTL:
                    idTipoNotificacion = (int)ETipoNotificacionAplicacion.CambioEstadoTTL;
                    break;
                case (int)EBandejaAprobadorAplicacion.GestorUserIT:
                    idTipoNotificacion = (int)ETipoNotificacionAplicacion.CambioEstadoUserIT;
                    break;

            }
            return idTipoNotificacion;
        }

        public override bool CambiarEstadoSolicitudAprobadores(int Id, int EstadoSolicitudId, int BandejaId, string Observacion, string Usuario)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    ctx.Database.CommandTimeout = 0;
                    bool retorno = false;
                    DateTime FECHA_ACTUAL = DateTime.Now;

                    var lMatriculas = new List<string>();
                    string lMatriculaAprobadores = Settings.Get<string>("Responsables.Portafolio");
                    if (!string.IsNullOrEmpty(lMatriculaAprobadores))
                        lMatriculas = lMatriculaAprobadores.Split('|').ToList();

                    var itemBD = (from u in ctx.SolicitudAprobadores
                                  where u.SolicitudAplicacionId == Id && (u.Matricula.Contains(Usuario) || lMatriculas.Contains(Usuario))
                                  && u.BandejaId == BandejaId
                                  select u).FirstOrDefault();

                    if (itemBD != null)
                    {
                        var solicitudBD = (from u in ctx.Solicitud
                                           where u.SolicitudAplicacionId == itemBD.SolicitudAplicacionId
                                           select u).FirstOrDefault();

                        switch (EstadoSolicitudId)
                        {
                            case (int)EEstadoSolicitudAplicacion.Aprobado:
                                itemBD.FlagAprobado = true;
                                itemBD.EstadoAprobacion = (int)EEstadoSolicitudAplicacion.Aprobado;
                                itemBD.AprobadorPor = Usuario;
                                itemBD.FechaAprobacion = FECHA_ACTUAL;

                                if (solicitudBD != null)
                                    this.AddBitacora(solicitudBD.AplicacionId, Usuario, (int)ETipoBitacora.AprobacionSolicitudFlujoAplicacion, "aprobó", null, BandejaId);

                                break;
                            case (int)EEstadoSolicitudAplicacion.Observado:
                                itemBD.FlagAprobado = false;
                                itemBD.EstadoAprobacion = (int)EEstadoSolicitudAplicacion.Observado;

                                if (solicitudBD != null)
                                    this.AddBitacora(solicitudBD.AplicacionId, Usuario, (int)ETipoBitacora.ObservacionSolicitudFlujoAplicacion, "observó", Observacion, BandejaId);
                                break;
                        }

                        itemBD.FechaModificacion = FECHA_ACTUAL;
                        itemBD.UsuarioModificacion = Usuario;
                        ctx.SaveChanges();

                        //Validar si todos lo han aprobado y actualizamos
                        var item = ctx.SolicitudAprobadores.FirstOrDefault(x => x.SolicitudAplicacionId == Id && x.FlagActivo && !x.FlagAprobado.Value);
                        if (item == null)
                        {
                            var iSolicitud = ctx.Solicitud.FirstOrDefault(x => x.SolicitudAplicacionId == Id);
                            if (iSolicitud != null)
                            {
                                iSolicitud.FlagAprobacion = true;
                                ctx.SaveChanges();
                            }
                        }

                        //Notificacion proceso revision
                        var objNotSubaprobCambio = new NotificacionAplicacionDTO()
                        {
                            Id = 0,
                            BandejaId = BandejaId,
                            SolicitudId = itemBD.SolicitudAplicacionId,
                            TipoNotificacionId = GetTipoNotificacionByBandejaAprobacion(BandejaId),
                            UsuarioCreacion = Usuario
                        };
                        ServiceManager<NotificacionDAO>.Provider.RegistrarNotificacionApp(objNotSubaprobCambio, ctx);

                        retorno = true;
                    }

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarEstadoSTD(int id, int estadoTec, string obs, string usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarEstadoSTD(int id, int estadoTec, string obs, string usuario)"
                    , new object[] { null });
            }
        }

        public override bool ExisteCambioEstadoSolicitudAprobadores(int id_solicitud, int id_bandeja)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    bool? estado = (from u in ctx.SolicitudAprobadores
                                    where u.FlagActivo
                                    && u.BandejaId == id_bandeja
                                    && u.SolicitudAplicacionId == id_solicitud
                                    && u.EstadoAprobacion != (int)EEstadoSolicitudAplicacion.EnRevision
                                    orderby u.SolicitudAplicacionId
                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExisteAplicacion(string nombre, string Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExisteAplicacion(string nombre, string Id)"
                    , new object[] { null });
            }
        }

        public override bool UpdateAplicacionByBandeja(UpdateAplicacionBandeja objDto)
        {
            try
            {
                bool retorno = false;
                string matriculaOldArq = "";
                string matriculaNewArq = "";
                DateTime FECHA_ACTUAL = DateTime.Now;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    switch (objDto.BandejaId)
                    {
                        case (int)EBandejaAprobadorAplicacion.ArquitecturaTI:
                            var iAplicacion = ctx.Aplicacion.FirstOrDefault(x => x.AplicacionId == objDto.Id);
                            if (iAplicacion != null)
                            {
                                retorno = true;
                                matriculaOldArq = iAplicacion.ArquitectoTI;
                                matriculaNewArq = objDto.ArquitectoTi;

                                iAplicacion.AreaBIAN = objDto.AreaBian;
                                iAplicacion.DominioBIAN = objDto.DominioBian;
                                iAplicacion.JefaturaATI = objDto.JefaturaAti;
                                iAplicacion.ArquitectoTI = objDto.ArquitectoTi;
                                iAplicacion.FechaModificacion = FECHA_ACTUAL;
                                iAplicacion.ModificadoPor = objDto.Usuario;
                                ctx.SaveChanges();
                            }

                            var iAplicacionDetalle = ctx.AplicacionDetalle.FirstOrDefault(x => x.AplicacionId == objDto.Id);
                            if (iAplicacionDetalle != null)
                            {
                                iAplicacionDetalle.PlataformaBCP = objDto.Plataforma;
                                iAplicacionDetalle.FechaModificacion = FECHA_ACTUAL;
                                iAplicacionDetalle.UsuarioModificacion = objDto.Usuario;
                                ctx.SaveChanges();
                            }

                            //Actualizando en Solicitud Aprobadores
                            var iSolicitudAprobador = ctx.SolicitudAprobadores.FirstOrDefault(x => x.FlagActivo
                            && x.SolicitudAplicacionId == objDto.SolicitudId
                            && x.BandejaId == objDto.BandejaId);

                            if (iSolicitudAprobador != null)
                            {
                                iSolicitudAprobador.Matricula = iSolicitudAprobador.Matricula.Replace(matriculaOldArq, matriculaNewArq);
                                ctx.SaveChanges();
                            }

                            break;
                        case (int)EBandejaAprobadorAplicacion.ClasificacionTecnica:
                            var itemAplicacion = ctx.Aplicacion.FirstOrDefault(x => x.AplicacionId == objDto.Id);
                            if (itemAplicacion != null)
                            {
                                retorno = true;
                                itemAplicacion.ClasificacionTecnica = objDto.ClasificacionTecnica;
                                itemAplicacion.SubclasificacionTecnica = objDto.SubclasificacionTecnica;
                                itemAplicacion.FechaModificacion = FECHA_ACTUAL;
                                itemAplicacion.ModificadoPor = objDto.Usuario;
                                ctx.SaveChanges();
                            }

                            break;
                        case (int)EBandejaAprobadorAplicacion.DevSecOps:
                            var itemAplicacionDetalle = ctx.AplicacionDetalle.FirstOrDefault(x => x.AplicacionId == objDto.Id);
                            if (itemAplicacionDetalle != null)
                            {
                                retorno = true;
                                itemAplicacionDetalle.ModeloEntrega = objDto.ModeloEntrega;
                                itemAplicacionDetalle.FechaModificacion = FECHA_ACTUAL;
                                itemAplicacionDetalle.UsuarioModificacion = objDto.Usuario;
                                ctx.SaveChanges();
                            }
                            break;
                    }


                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: bool CambiarEstado(int id, bool estado, string usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: bool CambiarEstado(int id, bool estado, string usuario)"
                    , new object[] { null });
            }
        }

        public override UpdateAplicacionBandeja GetAplicacionBandejaById(int Id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Aplicacion
                                   join x in ctx.Solicitud on u.AplicacionId equals x.AplicacionId
                                   where u.AplicacionId == Id
                                   select new UpdateAplicacionBandeja()
                                   {
                                       Id = u.AplicacionId,
                                       SolicitudId = x.SolicitudAplicacionId,
                                       CodigoAPT = u.CodigoAPT,
                                       Descripcion = u.DescripcionAplicacion,
                                       ClasificacionTecnica = u.ClasificacionTecnica,
                                       SubclasificacionTecnica = u.SubclasificacionTecnica,
                                       AreaBian = u.AreaBIAN,
                                       DominioBian = u.DominioBIAN,
                                       JefaturaAti = u.JefaturaATI,
                                       ArquitectoTi = u.ArquitectoTI,
                                       Usuario = u.CreadoPor
                                   }).FirstOrDefault();
                    if (entidad != null)
                    {
                        var aplicacionDetalle = ctx.AplicacionDetalle.FirstOrDefault(x => x.AplicacionId == Id);
                        entidad.ModeloEntrega = aplicacionDetalle != null ? aplicacionDetalle.ModeloEntrega : "-1";
                        entidad.Plataforma = aplicacionDetalle != null ? aplicacionDetalle.PlataformaBCP : "-1";
                    }

                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: BandejaDTO GetBandejaById(int id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: BandejaDTO GetBandejaById(int id)"
                    , new object[] { null });
            }
        }

        public override int? GetTipoFlujoByAplicacion(string codigoAPT)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    int? flujo = (from u in ctx.Aplicacion
                                  join x in ctx.TipoActivoInformacion on u.TipoActivoInformacion equals x.Nombre
                                  where u.FlagActivo && x.FlagActivo && u.CodigoAPT.ToUpper() == codigoAPT.ToUpper()
                                  orderby u.CodigoAPT
                                  select x.FlujoRegistro).FirstOrDefault();

                    return flujo;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExisteAplicacion(string nombre, string Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExisteAplicacion(string nombre, string Id)"
                    , new object[] { null });
            }
        }

        public override bool ExisteSolicitudByCodigoAPT(string codigoApt, int idSolicitud)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    bool? estado = (from u in ctx.Solicitud
                                    join x in ctx.Aplicacion on u.AplicacionId equals x.AplicacionId
                                    where x.CodigoAPT.ToUpper().Equals(codigoApt.ToUpper())
                                    && x.FlagActivo
                                    && (u.TipoSolicitud == (int)ETipoSolicitudAplicacion.EliminacionAplicacion ||
                                    u.TipoSolicitud == (int)ETipoSolicitudAplicacion.ModificacionAplicacion)
                                    && u.EstadoSolicitud != (int)EEstadoSolicitudAplicacion.Aprobado
                                    && u.SolicitudAplicacionId != idSolicitud
                                    orderby x.Nombre
                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExisteAplicacion(string nombre, string Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExisteAplicacion(string nombre, string Id)"
                    , new object[] { null });
            }
        }

        public override AplicacionSolicitudDto GetAplicacionBySolicitudId(int Id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from x in ctx.Solicitud
                                   join y in ctx.Aplicacion on x.AplicacionId equals y.AplicacionId
                                   join z in ctx.AplicacionDetalle on y.AplicacionId equals z.AplicacionId into lj0
                                   from z in lj0.DefaultIfEmpty()
                                   where x.SolicitudAplicacionId == Id
                                   select new AplicacionSolicitudDto()
                                   {
                                       SolicitudId = x.SolicitudAplicacionId,
                                       AplicacionId = x.AplicacionId,
                                       Usuario = x.UsuarioCreacion,
                                       CodigoAplicacion = y.CodigoAPT,
                                       NombreAplicacion = y.Nombre,
                                       TipoActivoInformacion = y.TipoActivoInformacion,
                                       JefeEquipo_ExpertoAplicacionUserIT_ProductOwner = y.JefeEquipo_ExpertoAplicacionUserIT_ProductOwner,
                                       NombreEquipo_Squad = y.NombreEquipo_Squad,
                                       Owner_LiderUsuario_ProductOwner = y.Owner_LiderUsuario_ProductOwner,
                                       TribeTechnicalLead = y.TribeTechnicalLead,
                                       ModeloEntrega = z != null ? z.ModeloEntrega : "",
                                       EstadoSolicitudId = x.EstadoSolicitud
                                   }).FirstOrDefault();

                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
        }

        public override void AddBitacora(long aplicacion, string usuario, int tipoBitacora, string flujo = null, string comentarios = null, int bandeja = -1, AplicacionDTO objeto = null)
        {
            var detalle = string.Empty;
            var bandejaDetalle = string.Empty;
            try
            {
                if (bandeja != -1)
                {
                    switch (bandeja)
                    {
                        case (int)EBandejaAprobadorAplicacion.ArquitecturaTI:
                            bandejaDetalle = Utilitarios.GetEnumDescription2(EBandejaAprobadorAplicacion.ArquitecturaTI);
                            break;
                        case (int)EBandejaAprobadorAplicacion.ClasificacionTecnica:
                            bandejaDetalle = Utilitarios.GetEnumDescription2(EBandejaAprobadorAplicacion.ClasificacionTecnica);
                            break;
                        case (int)EBandejaAprobadorAplicacion.DevSecOps:
                            bandejaDetalle = Utilitarios.GetEnumDescription2(EBandejaAprobadorAplicacion.DevSecOps);
                            break;
                        case (int)EBandejaAprobadorAplicacion.GestorUserIT:
                            bandejaDetalle = Utilitarios.GetEnumDescription2(EBandejaAprobadorAplicacion.GestorUserIT);
                            break;
                        case (int)EBandejaAprobadorAplicacion.PO:
                            bandejaDetalle = Utilitarios.GetEnumDescription2(EBandejaAprobadorAplicacion.PO);
                            break;
                        case (int)EBandejaAprobadorAplicacion.TTL:
                            bandejaDetalle = Utilitarios.GetEnumDescription2(EBandejaAprobadorAplicacion.TTL);
                            break;
                    }
                }

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var aplicacionObj = ServiceManager<AplicacionDAO>.Provider.GetAplicacionById((int)aplicacion);

                    if (aplicacionObj != null)
                    {
                        switch (tipoBitacora)
                        {
                            case (int)ETipoBitacora.SolicitudRegistroAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.SolicitudRegistroAplicacion);
                                detalle = string.Format(detalle, usuario, aplicacionObj.CodigoAPT);
                                break;
                            case (int)ETipoBitacora.SolicitudEliminacionAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.SolicitudEliminacionAplicacion);
                                detalle = string.Format(detalle, usuario, aplicacionObj.CodigoAPT);
                                break;
                            case (int)ETipoBitacora.SolicitudModificacionAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.SolicitudModificacionAplicacion);
                                detalle = string.Format(detalle, usuario, aplicacionObj.CodigoAPT);
                                break;
                            case (int)ETipoBitacora.AprobacionSolicitudFlujoAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.AprobacionSolicitudFlujoAplicacion);
                                detalle = string.Format(detalle, usuario, flujo, aplicacionObj.CodigoAPT, bandejaDetalle);
                                break;
                            case (int)ETipoBitacora.ObservacionFlujoAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.ObservacionFlujoAplicacion);
                                detalle = string.Format(detalle, usuario, flujo, aplicacionObj.CodigoAPT, comentarios, bandejaDetalle);
                                break;
                            case (int)ETipoBitacora.AprobacionRegistroAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.AprobacionRegistroAplicacion);
                                detalle = string.Format(detalle, usuario, aplicacionObj.CodigoAPT);
                                break;
                            case (int)ETipoBitacora.AprobacionEliminacionAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.AprobacionEliminacionAplicacion);
                                detalle = string.Format(detalle, usuario, aplicacionObj.CodigoAPT);
                                break;
                            case (int)ETipoBitacora.AprobacionModificacionAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.AprobacionModificacionAplicacion);
                                detalle = string.Format(detalle, usuario, aplicacionObj.CodigoAPT);
                                break;
                            case (int)ETipoBitacora.ActualizacionSolicitud:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.ActualizacionSolicitud);
                                detalle = string.Format(detalle, usuario, flujo, aplicacionObj.CodigoAPT);
                                break;
                            case (int)ETipoBitacora.ModificacionAplicacion:
                                detalle = Utilitarios.GetEnumDescription2(ETipoBitacora.ModificacionAplicacion);
                                detalle = string.Format(detalle, usuario, aplicacionObj.CodigoAPT, this.GetCambiosAplicacion(aplicacionObj, objeto));
                                break;
                            default: break;
                        }

                        if (!string.IsNullOrWhiteSpace(detalle))
                        {
                            var entidad = new BitacoraAcciones()
                            {
                                CodigoAPT = aplicacionObj.CodigoAPT,
                                CreadoPor = usuario,
                                DetalleBitacora = detalle,
                                FechaCreacion = DateTime.Now
                            };
                            ctx.BitacoraAcciones.Add(entidad);
                            ctx.SaveChanges();
                        }
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
            }
        }

        //   public override List<BitacoraDto2> GetBitacora2(PaginacionSolicitud pag, out int totalRows)
        //   {
        //       try
        //       {
        //           totalRows = 0;                

        //           using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
        //           {
        //               using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
        //               {
        //                   ctx.Database.CommandTimeout = 0;

        //                   var registros = (from u in ctx.BitacoraAcciones  
        //                                    join u2 in ctx.Application on u.CodigoAPT equals u2.applicationId


        //                                    where (u.CodigoAPT.ToUpper().Contains(pag.CodigoApt.ToUpper())
        //                                    || string.IsNullOrEmpty(pag.CodigoApt))


        //                                    select new BitacoraDto2()
        //                                    {
        //                                        CodigoAPT = u.CodigoAPT,
        //                                        NombreAplicacion=u2.applicationName,
        //                                        FechaCreacion=u.FechaCreacion,
        //                                        assetType=u2.assetType
        //                                    }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

        //                   foreach (BitacoraDto2 a in registros) {
        //                       var item = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == a.assetType);
        //                       if (item != null) { a.TipoActivoName = item.Nombre; }
        //                   }

        //	List<BitacoraDto2> resultado = registros
        //                                                           .GroupBy(p => new
        //                                                           {
        //                                                            p.CodigoAPT,
        //                                                            p.NombreAplicacion,
        //                                                            p.TipoActivoName
        //                                                           })
        //                                                           .Select(g => g.First())
        //                                                           .ToList();

        //	totalRows = resultado.Count();
        //	var resultado2 = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

        //	return resultado2;

        //	//totalRows = registros.Count();
        //	//var resultado2 = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

        //	//return resultado2;
        //}
        //           }
        //       }
        //       catch (DbEntityValidationException ex)
        //       {
        //           log.ErrorEntity(ex);
        //           throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
        //               , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
        //               , new object[] { null });
        //       }
        //       catch (Exception ex)
        //       {
        //           log.Error("Error ", ex);
        //           throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
        //               , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
        //               , new object[] { null });
        //       }
        //   }

        public override List<BitacoraDto2> GetBitacora2(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {

                var cadenaConexion = Constantes.CadenaConexion;
                var rpta = new DashboardAplicacionData();
                DateTime? fecha = null;


                List<BitacoraDto2> data = new List<BitacoraDto2>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("app.USP_Listar_Bitacora", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@CodigoAPT", pag.CodigoApt));
                        //comando.Parameters.Add(new SqlParameter("@fechaDia", DateTime.Now));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            data.Add(new BitacoraDto2()
                            {
                                CodigoAPT = reader.IsDBNull(reader.GetOrdinal("CodigoAPT")) ? "" : reader.GetString(reader.GetOrdinal("CodigoAPT")),
                                NombreAplicacion = reader.IsDBNull(reader.GetOrdinal("NombreAplicacion")) ? "" : reader.GetString(reader.GetOrdinal("NombreAplicacion")),
                                FechaCreacion = reader.IsDBNull(reader.GetOrdinal("FechaCreacion")) ? fecha : reader.GetDateTime(reader.GetOrdinal("FechaCreacion")),
                                TipoActivoName = reader.IsDBNull(reader.GetOrdinal("TipoActivoName")) ? "" : reader.GetString(reader.GetOrdinal("TipoActivoName"))
                            });
                        }
                        reader.Close();
                    }

                    var registros = data.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                    List<BitacoraDto2> resultado = registros
                                                                .GroupBy(p => new
                                                                {
                                                                    p.CodigoAPT,
                                                                    p.NombreAplicacion,
                                                                    p.TipoActivoName
                                                                })
                                                                .Select(g => g.First())
                                                                .ToList();

                    totalRows = resultado.Count();
                    var resultado2 = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                    return resultado2;


                }
            }

            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<FuncionDTO> GetFunciones(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {

                var cadenaConexion = Constantes.CadenaConexion;
                var rpta = new DashboardAplicacionData();
                DateTime? fecha = null;


                List<FuncionDTO> data = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_SIGA", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@Chapter", pag.Chapter));
                        comando.Parameters.Add(new SqlParameter("@Funcion", pag.Funcion));
                        comando.Parameters.Add(new SqlParameter("@Perfil", pag.Perfil));
                        comando.Parameters.Add(new SqlParameter("@Matricula", pag.Matricula));
                        comando.Parameters.Add(new SqlParameter("@Rol", pag.Rol));
                        comando.Parameters.Add(new SqlParameter("@GrupoRed", pag.GrupoRed));
                        comando.Parameters.Add(new SqlParameter("@Producto", pag.Producto));
                        comando.Parameters.Add(new SqlParameter("@TribuF", pag.Tribu));
                        //comando.Parameters.Add(new SqlParameter("@fechaDia", DateTime.Now));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            data.Add(new FuncionDTO()
                            {
                                IdFuncion = reader.IsDBNull(reader.GetOrdinal("id")) ? "" : reader.GetString(reader.GetOrdinal("id")),
                                Chapter = reader.IsDBNull(reader.GetOrdinal("Chapter")) ? "" : reader.GetString(reader.GetOrdinal("Chapter")),
                                Funcion = reader.IsDBNull(reader.GetOrdinal("Funcion")) ? "" : reader.GetString(reader.GetOrdinal("Funcion")),
                                Tribu = reader.IsDBNull(reader.GetOrdinal("Tribu")) ? "" : reader.GetString(reader.GetOrdinal("Tribu"))
                            });
                        }
                        reader.Close();
                    }

                    var registros = data.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                    List<FuncionDTO> resultado = registros.GroupBy(p => new
                    {
                        p.Tribu,
                        p.Funcion,
                        p.Chapter

                    })
                                                                .Select(g => g.First())
                                                                .ToList();

                    totalRows = resultado.Count();
                    var resultado2 = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        foreach (var item in resultado2)
                        {
                            var reg = (from u in ctx.ChapterFuncionesRoles
                                             join u4 in ctx.RolesProducto on u.RolesProductoId equals u4.RolesProductoId

                                       join u2 in ctx.Producto on u4.ProductoId equals u2.ProductoId
                                       where u.Chapter== item.Chapter && u.Funcion==item.Funcion && u.FlagActivo==true && u.FlagEliminado==false
                                       && u4.FlagActivo == true && u4.FlagEliminado == false
                                        && u2.FlagActivo == true 


                                       select new ProductoDTO()
                                             {
                                                 Id = u.FuncionProductoId,
   
                                             }).ToList();
                            //var cantidad = ctx.ChapterFuncionesRoles.Where(x => x.Chapter == item.Chapter && x.Funcion == item.Funcion && x.FlagActivo == true && x.FlagEliminado == false).ToList();
                            if (reg != null)
                                item.ProductoRelacionados = reg.Count();
                            else if (reg == null)
                                item.ProductoRelacionados = 0;
                        }
                    }

                    return resultado2;


                }
            }

            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<FuncionDTO> GetFuncionesAdmin(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {

                var cadenaConexion = Constantes.CadenaConexion;
                var rpta = new DashboardAplicacionData();
                DateTime? fecha = null;


                List<FuncionDTO> data = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_SIGA_ADMIN ", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@Chapter", pag.Chapter));
                        comando.Parameters.Add(new SqlParameter("@Funcion", pag.Funcion));
                        comando.Parameters.Add(new SqlParameter("@Tribu", pag.Tribu));
                        comando.Parameters.Add(new SqlParameter("@GrupoRed", pag.GrupoRed));
                        comando.Parameters.Add(new SqlParameter("@Rol", pag.RolProductoId));
                        comando.Parameters.Add(new SqlParameter("@Producto", pag.Producto));
                        //comando.Parameters.Add(new SqlParameter("@fechaDia", DateTime.Now));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            data.Add(new FuncionDTO()
                            {
                                IdFuncion = reader.IsDBNull(reader.GetOrdinal("id")) ? "" : reader.GetString(reader.GetOrdinal("id")),
                                Chapter = reader.IsDBNull(reader.GetOrdinal("Chapter")) ? "" : reader.GetString(reader.GetOrdinal("Chapter")),
                                Funcion = reader.IsDBNull(reader.GetOrdinal("Funcion")) ? "" : reader.GetString(reader.GetOrdinal("Funcion")),
                                Tribu = reader.IsDBNull(reader.GetOrdinal("Tribu")) ? "" : reader.GetString(reader.GetOrdinal("Tribu"))
                            });
                        }
                        reader.Close();
                    }

                    var registros = data.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                    List<FuncionDTO> resultado = registros.GroupBy(p => new
                    {
                        p.Tribu,
                        p.Funcion,
                        p.Chapter

                    })
                                                                .Select(g => g.First())
                                                                .ToList();

                    totalRows = resultado.Count();
                    var resultado2 = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        foreach (var item in resultado2)
                        {
                            var reg = (from u in ctx.ChapterFuncionesRoles
                                       join u4 in ctx.RolesProducto on u.RolesProductoId equals u4.RolesProductoId

                                       join u2 in ctx.Producto on u4.ProductoId equals u2.ProductoId
                                       where u.Chapter == item.Chapter && u.Funcion == item.Funcion && u.FlagActivo == true && u.FlagEliminado == false
                                       && u4.FlagActivo == true && u4.FlagEliminado == false
                                        && u2.FlagActivo == true


                                       select new ProductoDTO()
                                       {
                                           Id = u.FuncionProductoId,

                                       }).ToList();
                            //var cantidad = ctx.ChapterFuncionesRoles.Where(x => x.Chapter == item.Chapter && x.Funcion == item.Funcion && x.FlagActivo == true && x.FlagEliminado == false).ToList();
                            if (reg != null)
                                item.ProductoRelacionados = reg.Count();
                            else if (reg == null)
                                item.ProductoRelacionados = 0;
                        }
                    }

                    return resultado2;


                }
            }

            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<FuncionDTO> GetFuncionesConsolidado(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {

                var cadenaConexion = Constantes.CadenaConexion;
                var rpta = new DashboardAplicacionData();
                DateTime? fecha = null;


                List<FuncionDTO> data = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Consolidado_Matriz_Roles", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@Chapter", pag.Chapter));
                        comando.Parameters.Add(new SqlParameter("@Funcion", pag.Funcion));
                        comando.Parameters.Add(new SqlParameter("@Tribu", pag.Tribu));
                        comando.Parameters.Add(new SqlParameter("@GrupoRed", pag.GrupoRed));
                        comando.Parameters.Add(new SqlParameter("@Rol", pag.RolProductoId));
                        comando.Parameters.Add(new SqlParameter("@Producto", pag.Producto));
                        //comando.Parameters.Add(new SqlParameter("@fechaDia", DateTime.Now));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            data.Add(new FuncionDTO()
                            {
                                Chapter = reader.IsDBNull(reader.GetOrdinal("Chapter")) ? "" : reader.GetString(reader.GetOrdinal("Chapter")),
                                Funcion = reader.IsDBNull(reader.GetOrdinal("Funcion")) ? "" : reader.GetString(reader.GetOrdinal("Funcion")),
                                Rol = reader.IsDBNull(reader.GetOrdinal("Rol")) ? "" : reader.GetString(reader.GetOrdinal("Rol")),
                                GrupoRed = reader.IsDBNull(reader.GetOrdinal("GrupoRed")) ? "" : reader.GetString(reader.GetOrdinal("GrupoRed")),
                                Nombre = reader.IsDBNull(reader.GetOrdinal("Producto")) ? "" : reader.GetString(reader.GetOrdinal("Producto")),
                                Tribu = reader.IsDBNull(reader.GetOrdinal("Tribu")) ? "" : reader.GetString(reader.GetOrdinal("Tribu")),
                                Persona = reader.IsDBNull(reader.GetOrdinal("Persona")) ? "" : reader.GetString(reader.GetOrdinal("Persona"))
                            });
                        }
                        reader.Close();
                    }

                    var registros = data.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                    List<FuncionDTO> resultado = registros.GroupBy(p => new
                    {
                        p.Funcion,
                        p.Chapter

                    })
                                                                .Select(g => g.First())
                                                                .ToList();

                    totalRows = resultado.Count();
                    var resultado2 = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                    return resultado2;


                }
            }

            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override List<FuncionDTO> GetPersonasFunciones(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {

                var cadenaConexion = Constantes.CadenaConexion;
                var rpta = new DashboardAplicacionData();


                List<FuncionDTO> data = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_Personas", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@Chapter", pag.Chapter));
                        comando.Parameters.Add(new SqlParameter("@Funcion", pag.Funcion));
                        //comando.Parameters.Add(new SqlParameter("@fechaDia", DateTime.Now));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            data.Add(new FuncionDTO()
                            {
                                Nombre = reader.IsDBNull(reader.GetOrdinal("Nombre")) ? "" : reader.GetString(reader.GetOrdinal("Nombre")),
                                Matricula = reader.IsDBNull(reader.GetOrdinal("Matricula")) ? "" : reader.GetString(reader.GetOrdinal("Matricula")),
                                Email = reader.IsDBNull(reader.GetOrdinal("Email")) ? "" : reader.GetString(reader.GetOrdinal("Email"))
                            });
                        }
                        reader.Close();
                    }

                    var registros = data.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                    List<FuncionDTO> resultado = registros.GroupBy(p => new
                    {
                        p.Nombre,
                        p.Matricula,
                        p.Email

                    })
                                                                .Select(g => g.First())
                                                                .ToList();

                    totalRows = resultado.Count();
                    var resultado2 = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();




                    return resultado2;


                }
            }

            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<RelacionDTO> GetRelacionesAplicacion(PaginacionSolicitud pag, out int totalRows)
        {
            DateTime fecha = DateTime.Now;
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var aplicacion = (from u in ctx.Application
                                      where u.AppId == pag.AppId
                                      select u).FirstOrDefault();

                    var idEstados = new List<int> { (int)EEstadoRelacion.Aprobado, (int)EEstadoRelacion.PendienteEliminacion, (int)EEstadoRelacion.Cuarentena, (int)EEstadoRelacion.Pendiente };

                    var retorno = (from R in ctx.Relacion
                                       //join RD in ctx.RelacionDetalle on R.RelacionId equals RD.RelacionId into Detalle
                                       //from pRD in Detalle.DefaultIfEmpty()
                                   join E in ctx.Equipo on R.EquipoId equals E.EquipoId into Equipo
                                   from pE in Equipo.DefaultIfEmpty()
                                   join AM in ctx.Ambiente on R.AmbienteId equals AM.AmbienteId into Ambiente
                                   from pAM in Ambiente.DefaultIfEmpty()
                                       //join T in ctx.Tecnologia on pRD.TecnologiaId equals T.TecnologiaId into Tecnologia
                                       //from pT in Tecnologia.DefaultIfEmpty()
                                   where R.FlagActivo == true && R.CodigoAPT == aplicacion.applicationId
                                      //&& pRD.FlagActivo == true && pT.Activo== true 
                                      && R.AnioRegistro == fecha.Year
                                   && R.MesRegistro == fecha.Month
                                   && R.DiaRegistro == fecha.Day
                                   && idEstados.Contains(R.EstadoId)
                                   orderby pE.Nombre
                                   select new RelacionDTO()
                                   {
                                       RelacionId = R.RelacionId,
                                       Componente = pE.Nombre,
                                       AmbienteStr = pAM.DetalleAmbiente,
                                       //Tecnologia = pT.ClaveTecnologia,
                                       TipoId = R.TipoId,
                                       EstadoId = R.EstadoId
                                   }).ToList();
                    totalRows = retorno.Count();

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
        }


        public override List<ProductoDTO> GetProductos(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;


                        if (pag.Perfil.Contains("E195_MDR_OwnerProducto"))
                        {

                            var registros = (from u in ctx.Producto
                                             join u4 in ctx.RolesProducto on u.ProductoId equals u4.ProductoId into ps
                                             from pco in ps.DefaultIfEmpty()
                                             join u2 in ctx.Dominio on u.DominioId equals u2.DominioId
                                             join u3 in ctx.Subdominio on u.SubDominioId equals u3.SubdominioId

                                             //join u4 in ctx.RolesProducto on u.ProductoId equals u4.ProductoId
                                             //join u5 in ctx.ChapterFuncionesRoles on u4.RolesProductoId equals u5.RolesProductoId
                                             where (u.Nombre.ToUpper().Contains(pag.Producto.ToUpper())
                                             || string.IsNullOrEmpty(pag.Producto)) && u.FlagActivo == true && (u.DominioId == pag.DominioId || pag.DominioId == -1) && (u.SubDominioId == pag.SubDominioId || pag.SubDominioId == -1)
                                              && (u.TribuCoeId == pag.TribuId || pag.TribuId == "-1") && (u.SquadId == pag.SquadId || pag.SquadId == "-1") &&
                                            u.OwnerMatricula.ToUpper().Contains(pag.Matricula.ToUpper())
                                             && (pco.FlagActivo == true || pco.FlagActivo == null) && (pco.FlagEliminado == false || pco.FlagEliminado == null) && (pco.Rol.ToUpper().Contains(pag.Rol.ToUpper()) || string.IsNullOrEmpty(pag.Rol) || pco.Rol == null)
                                             && (pco.GrupoRed.ToUpper().Contains(pag.GrupoRed.ToUpper()) || string.IsNullOrEmpty(pag.GrupoRed) || pco.GrupoRed == null)

                                             //&& u5.FlagActivo == true && u5.FlagEliminado == false
                                             select new ProductoDTO()
                                             {
                                                 Id = u.ProductoId,
                                                 Nombre = u.Nombre,
                                                 DominioStr = u2.Nombre,
                                                 SubDominioStr = u3.Nombre,
                                                 DominioId = u.DominioId,
                                                 SubDominioId = u3.SubdominioId
                                             }).Distinct().OrderBy("Nombre" + " " + pag.sortOrder);

                            totalRows = registros.Count();
                            var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                            foreach (var item in resultado)
                            {
                                var cantidad = ctx.RolesProducto.Where(x => x.ProductoId == item.Id && x.FlagActivo == true && x.FlagEliminado == false).ToList();
                                if (cantidad != null)
                                    item.CantidadRoles = cantidad.Count();
                                else if (cantidad == null)
                                    item.CantidadRoles = 0;
                            }

                            return resultado.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();


                        }
                        //Owner de Tribu
                        else if (pag.Perfil.Contains("E195_MDR_TribuCOE"))
                        {

                            var registros = (from u in ctx.Producto
                                             join u2 in ctx.Dominio on u.DominioId equals u2.DominioId
                                             join u3 in ctx.Subdominio on u.SubDominioId equals u3.SubdominioId
                                             where (u.Nombre.ToUpper().Contains(pag.Producto.ToUpper())
                                             || string.IsNullOrEmpty(pag.Producto)) && u.FlagActivo == true && (u.DominioId == pag.DominioId || pag.DominioId == -1) && (u.SubDominioId == pag.SubDominioId || pag.SubDominioId == -1)
                                                //&& (u.TribuCoeId == pag.TribuId || pag.TribuId == "-1")
                                                && (u.TribuCoeId == pag.CodigoTribu)
                                              && (u.SquadId == pag.SquadId || pag.SquadId == "-1") &&
                                              (u.OwnerMatricula.ToUpper().Contains(pag.Matricula.ToUpper()) || string.IsNullOrEmpty(pag.Matricula))
                                             select new ProductoDTO()
                                             {
                                                 Id = u.ProductoId,
                                                 Nombre = u.Nombre,
                                                 DominioStr = u2.Nombre,
                                                 SubDominioStr = u3.Nombre,
                                                 DominioId = u.DominioId,
                                                 SubDominioId = u3.SubdominioId
                                             }).OrderBy("Nombre" + " " + pag.sortOrder);

                            totalRows = registros.Count();
                            var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                            foreach (var item in resultado)
                            {
                                var cantidad = ctx.RolesProducto.Where(x => x.ProductoId == item.Id && x.FlagActivo == true && x.FlagEliminado == false).ToList();
                                if (cantidad != null)
                                    item.CantidadRoles = cantidad.Count();
                                else if (cantidad == null)
                                    item.CantidadRoles = 0;
                            }

                            return resultado.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();


                        }
                        //if (pag.Perfil.Contains("E195_Administrador") || pag.Perfil.Contains("E195_MDR_Administrador"))
                        else
                        {

                            var registros = (from u in ctx.Producto
                                             join u2 in ctx.Dominio on u.DominioId equals u2.DominioId
                                             join u3 in ctx.Subdominio on u.SubDominioId equals u3.SubdominioId
                                             //join u4 in ctx.RolesProducto on u.ProductoId equals u4.ProductoId into ps
                                             //from u4 in ps.DefaultIfEmpty()
                                             //join u5 in ctx.ChapterFuncionesRoles on u4.RolesProductoId equals u5.RolesProductoId into pc
                                             //from u5 in pc.DefaultIfEmpty()
                                             where (u.Nombre.ToUpper().Contains(pag.Producto.ToUpper())
                                             || string.IsNullOrEmpty(pag.Producto)) && u.FlagActivo == true && (u.DominioId == pag.DominioId || pag.DominioId == -1) && (u.SubDominioId == pag.SubDominioId || pag.SubDominioId == -1)
                                             && (u.TribuCoeId == pag.TribuId || pag.TribuId == "-1") && (u.SquadId == pag.SquadId || pag.SquadId == "-1")
                                             //&& u4.FlagActivo == true && u4.FlagEliminado == false && u5.FlagActivo == true && u5.FlagEliminado == false
                                             select new ProductoDTO()
                                             {
                                                 Id = u.ProductoId,
                                                 Nombre = u.Nombre,
                                                 DominioStr = u2.Nombre,
                                                 SubDominioStr = u3.Nombre,
                                                 DominioId = u.DominioId,
                                                 SubDominioId = u3.SubdominioId
                                             }).OrderBy("Nombre" + " " + pag.sortOrder);



                            totalRows = registros.Count();
                            var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                            foreach (var item in resultado)
                            {
                                var cantidad = ctx.RolesProducto.Where(x => x.ProductoId == item.Id && x.FlagActivo == true && x.FlagEliminado == false).ToList();
                                if (cantidad != null)
                                    item.CantidadRoles = cantidad.Count();
                                else if (cantidad == null)
                                    item.CantidadRoles = 0;
                            }

                            return resultado.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();
                        }


                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override List<ProductoDTO> GetProductosAdmin(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;



                        var registros = (from u in ctx.Producto
                                         join u2 in ctx.Dominio on u.DominioId equals u2.DominioId
                                         join u3 in ctx.Subdominio on u.SubDominioId equals u3.SubdominioId
                                         join u4 in ctx.RolesProducto on u.ProductoId equals u4.ProductoId into ps
                                         from u4 in ps.DefaultIfEmpty()
                                         join u5 in ctx.ChapterFuncionesRoles on u4.RolesProductoId equals u5.RolesProductoId into pc
                                         from u5 in pc.DefaultIfEmpty()

                                         where (u.Nombre.ToUpper().Contains(pag.Producto.ToUpper())
                                         || string.IsNullOrEmpty(pag.Producto)) && u.FlagActivo == true && (u.DominioId == pag.DominioId || pag.DominioId == -1) && (u.SubDominioId == pag.SubDominioId || pag.SubDominioId == -1)

                                           && (u5.Funcion.ToUpper().Contains(pag.Funcion.ToUpper()) || string.IsNullOrEmpty(pag.Funcion))

                                                        && (u4.GrupoRed.ToUpper().Contains(pag.GrupoRed.ToUpper()) || string.IsNullOrEmpty(pag.GrupoRed))
                                                         && (u4.RolesProductoId == pag.RolProductoId || pag.RolProductoId == -1)
                                                         && ((u4.FlagActivo == true) || u4.FlagActivo == null)
                                                          && ((u5.FlagActivo == true) || u5.FlagActivo == null)
                                                           && (u.TribuCoeId == pag.TribuId || pag.TribuId == "-1") && (u.SquadId == pag.SquadId || pag.SquadId == "-1")

                                         select new ProductoDTO()
                                         {
                                             Id = u.ProductoId,
                                             Nombre = u.Nombre,
                                             DominioStr = u2.Nombre,
                                             SubDominioStr = u3.Nombre,
                                             DominioId = u.DominioId,
                                             SubDominioId = u3.SubdominioId
                                         }).Distinct().OrderBy("Nombre" + " " + pag.sortOrder);
                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        foreach (var item in resultado)
                        {
                            var cantidad = ctx.RolesProducto.Where(x => x.ProductoId == item.Id && x.FlagActivo == true && x.FlagEliminado == false).ToList();
                            if (cantidad != null)
                                item.CantidadRoles = cantidad.Count();
                            else if (cantidad == null)
                                item.CantidadRoles = 0;
                        }

                        return resultado.OrderBy(pag.sortName + " " + pag.sortOrder).ToList();


                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override DataResultAplicacion AgregarFuncionProducto(string tribu, string chapter, string funcion, int RolProductoId, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    ChapterFuncionesRoles registro = new ChapterFuncionesRoles();

                    var rolproducto = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == RolProductoId);
                    var producto = ctx.Producto.FirstOrDefault(x => x.ProductoId == rolproducto.ProductoId);

                    registro.RolesProductoId = RolProductoId;
                    registro.Chapter = chapter;
                    registro.Funcion = funcion;
                    registro.Tribu = tribu;
                    registro.FlagActivo = true;
                    registro.FlagEliminado = false;
                    ctx.ChapterFuncionesRoles.Add(registro);
                    ctx.SaveChanges();

                    try
                    {


                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "agrego el producto " + producto.Nombre + " a la funcion " + funcion;


                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }

                    ////Envio de correo
                    //try
                    //{
                    //    List<string> correos = new List<string>();
                    //    correos.Add(email);

                    //    var mailManager = new MailingManager();
                    //    var diccionario = new Dictionary<string, string>();
                    //    diccionario.Add("[CodigoAPT]", CodigoApp);
                    //    diccionario.Add("[NombreAplicacion]", NombreApp);
                    //    diccionario.Add("[MotivoEliminacion]", comments);
                    //    mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.EliminacionRechazoSolicitud, CodigoApp, diccionario, correos);
                    //}
                    //catch (Exception ex)
                    //{
                    //    log.Error(ex.Message, ex);
                    //}


                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override DataResultAplicacion AgregarRolProducto(int id, string rol, string grupored, string descripcion, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    RolesProducto registro = new RolesProducto();

                    registro.ProductoId = id;
                    registro.Rol = rol;
                    registro.GrupoRed = grupored;
                    registro.Descripcion = descripcion;
                    registro.FlagActivo = true;
                    registro.FlagEliminado = false;
                    ctx.RolesProducto.Add(registro);
                    ctx.SaveChanges();

                    try
                    {
                        var entidad = ctx.Producto.FirstOrDefault(x => x.ProductoId == id);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "agrego el rol " + rol + " con grupo de red " + grupored + " y la siguiente descripción " + descripcion + " para el producto: ";
                        BitacoraMensaje = BitacoraMensaje + entidad.Nombre;

                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }

                    ////Envio de correo
                    //try
                    //{
                    //    List<string> correos = new List<string>();
                    //    correos.Add(email);

                    //    var mailManager = new MailingManager();
                    //    var diccionario = new Dictionary<string, string>();
                    //    diccionario.Add("[CodigoAPT]", CodigoApp);
                    //    diccionario.Add("[NombreAplicacion]", NombreApp);
                    //    diccionario.Add("[MotivoEliminacion]", comments);
                    //    mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.EliminacionRechazoSolicitud, CodigoApp, diccionario, correos);
                    //}
                    //catch (Exception ex)
                    //{
                    //    log.Error(ex.Message, ex);
                    //}


                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override DataResultAplicacion AgregarFuncion(string tribu, int id, string chapter, string funcion, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    ChapterFuncionesRoles registro = new ChapterFuncionesRoles();

                    registro.RolesProductoId = id;
                    registro.Chapter = chapter;
                    registro.Funcion = funcion;
                    registro.Tribu = tribu;
                    registro.FlagActivo = true;
                    registro.FlagEliminado = false;
                    ctx.ChapterFuncionesRoles.Add(registro);
                    ctx.SaveChanges();

                    try
                    {
                        var entidad = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == id);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "agrego la función " + funcion + " con chapter " + chapter + " para el rol: ";
                        BitacoraMensaje = BitacoraMensaje + entidad.Rol;

                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }

                    ////Envio de correo
                    //try
                    //{
                    //    List<string> correos = new List<string>();
                    //    correos.Add(email);

                    //    var mailManager = new MailingManager();
                    //    var diccionario = new Dictionary<string, string>();
                    //    diccionario.Add("[CodigoAPT]", CodigoApp);
                    //    diccionario.Add("[NombreAplicacion]", NombreApp);
                    //    diccionario.Add("[MotivoEliminacion]", comments);
                    //    mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.EliminacionRechazoSolicitud, CodigoApp, diccionario, correos);
                    //}
                    //catch (Exception ex)
                    //{
                    //    log.Error(ex.Message, ex);
                    //}


                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override FiltersRolesProducto GetRolesProductosCombo(string perfil, string matricula)
        {
            var retorno = new FiltersRolesProducto();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Dominio = (from u in ctx.Dominio
                                       where u.Activo == true

                                       orderby u.Nombre
                                       select new CustomAutocompleteApplication()
                                       {
                                           Id = u.DominioId.ToString(),
                                           Descripcion = u.Nombre,
                                           Value = u.DominioId.ToString()
                                       }).ToList();

                    retorno.SubDominio = (from u in ctx.Subdominio
                                          where u.Activo == true
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.SubdominioId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.SubdominioId.ToString()
                                          }).ToList();

                    if (perfil.Contains("E195_MDR_OwnerProducto") || perfil.Contains("E195_MDR_TribuCOE"))
                    {
                        retorno.Tribus = (from u in ctx.Producto
                                          where u.FlagActivo == true && u.TribuCoeId != null &&
                                          (u.OwnerMatricula.ToUpper().Contains(matricula.ToUpper()))
                                          orderby u.TribuCoeDisplayName
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TribuCoeId.ToString(),
                                              Descripcion = u.TribuCoeDisplayName,
                                              Value = u.TribuCoeId.ToString()
                                          }).Distinct().ToList();

                        retorno.Squads = (from u in ctx.Producto
                                          where u.FlagActivo == true && u.SquadId != null &&
                                             (u.OwnerMatricula.ToUpper().Contains(matricula.ToUpper()))
                                          orderby u.SquadDisplayName
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.SquadId.ToString(),
                                              Descripcion = u.SquadDisplayName,
                                              Value = u.SquadId.ToString()
                                          }).Distinct().ToList();

                    }
                    else
                    {
                        retorno.Tribus = (from u in ctx.Producto
                                          where u.FlagActivo == true && u.TribuCoeId != null
                                          orderby u.TribuCoeDisplayName
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TribuCoeId.ToString(),
                                              Descripcion = u.TribuCoeDisplayName,
                                              Value = u.TribuCoeId.ToString()
                                          }).Distinct().ToList();

                        retorno.Squads = (from u in ctx.Producto
                                          where u.FlagActivo == true && u.SquadId != null
                                          orderby u.SquadDisplayName
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.SquadId.ToString(),
                                              Descripcion = u.SquadDisplayName,
                                              Value = u.SquadId.ToString()
                                          }).Distinct().ToList();

                    }





                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
        }

        public override FiltersRolesProducto GetRolesProductosComboDominio(int DominioId)
        {
            var retorno = new FiltersRolesProducto();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {


                    retorno.SubDominio = (from u in ctx.Subdominio
                                          where u.Activo == true && u.DominioId == DominioId
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.SubdominioId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.SubdominioId.ToString()
                                          }).ToList();






                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
        }

        public override FiltersRolesProducto GetRolesProductosComboTribus(string TribuId, string perfil, string matricula)
        {
            var retorno = new FiltersRolesProducto();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    if (TribuId == "-1") { TribuId = ""; }

                    if (perfil.Contains("E195_Administrador") || perfil.Contains("E195_SuperAdministrador"))
                    {


                        retorno.Squads = (from u in ctx.Producto
                                          where u.FlagActivo == true && (u.TribuCoeId.ToUpper().Contains(TribuId.ToUpper())
                                         || string.IsNullOrEmpty(TribuId)) && u.SquadId != null
                                          orderby u.SquadDisplayName
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.SquadId.ToString(),
                                              Descripcion = u.SquadDisplayName,
                                              Value = u.SquadId.ToString()
                                          }).Distinct().ToList();
                    }
                    else
                    {


                        retorno.Squads = (from u in ctx.Producto
                                          where u.FlagActivo == true && (u.TribuCoeId.ToUpper().Contains(TribuId.ToUpper())
                                         || string.IsNullOrEmpty(TribuId)) && u.SquadId != null &&
                                          (u.OwnerMatricula.ToUpper().Contains(matricula.ToUpper()))
                                          orderby u.SquadDisplayName
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.SquadId.ToString(),
                                              Descripcion = u.SquadDisplayName,
                                              Value = u.SquadId.ToString()
                                          }).Distinct().ToList();
                    }





                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
        }
        public override FiltersFuncionesProducto GetRolesProductosComboTribusAgregar(string TribuId)
        {

            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            FiltersFuncionesProducto filtro = new FiltersFuncionesProducto();

            filtro.Chapter = new List<CustomAutocompleteApplication>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("cvt.MDR_Filtro_Chapter", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@tribu", TribuId));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        filtro.Chapter.Add(new CustomAutocompleteApplication()
                        {
                            Id = reader.GetString(reader.GetOrdinal("Chapter")),
                            Descripcion = reader.GetString(reader.GetOrdinal("Chapter")),
                            Value = reader.GetString(reader.GetOrdinal("Chapter")),

                        });
                    }

                }

                cnx.Close();

                return filtro;
            }
        }

        public override FiltersFuncionesProducto GetRolesProductosComboChapterAgregar(string TribuId)
        {

            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            FiltersFuncionesProducto filtro = new FiltersFuncionesProducto();

            filtro.Funcion = new List<CustomAutocompleteApplication>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("cvt.MDR_Filtro_Funcion", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@chapter", TribuId));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        filtro.Funcion.Add(new CustomAutocompleteApplication()
                        {
                            Id = reader.GetString(reader.GetOrdinal("Funcion")),
                            Descripcion = reader.GetString(reader.GetOrdinal("Funcion")),
                            Value = reader.GetString(reader.GetOrdinal("Funcion")),

                        });
                    }

                }

                cnx.Close();

                return filtro;
            }
        }



        public override FiltersFuncionesProducto GetFuncionesProductosCombo(string matricula, string perfil, string tribu)
        {
            var retorno = new FiltersFuncionesProducto();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    if (perfil.Contains("E195_MDR_TribuCOE"))
                    {
                        retorno.Productos = (from u in ctx.Producto
                                             join u2 in ctx.RolesProducto on u.ProductoId equals u2.ProductoId
                                             where u.FlagActivo == true && u2.FlagActivo == true
                                             && (u.OwnerMatricula.ToUpper().Contains(matricula.ToUpper()))
                                             && u.TribuCoeId == tribu
                                             orderby u.Nombre
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ProductoId.ToString(),
                                                 Descripcion = u.Nombre,
                                                 Value = u.ProductoId.ToString()
                                             }).Distinct().ToList();
                    }
                    else
                    {
                        retorno.Productos = (from u in ctx.Producto
                                             join u2 in ctx.RolesProducto on u.ProductoId equals u2.ProductoId
                                             where u.FlagActivo == true && u2.FlagActivo == true

                                             orderby u.Nombre
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ProductoId.ToString(),
                                                 Descripcion = u.Nombre,
                                                 Value = u.ProductoId.ToString()
                                             }).Distinct().ToList();
                    }



                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
        }

        public override FiltersFuncionesProducto GetFuncionesProductosComboConsolidado()
        {
            var retorno = new FiltersFuncionesProducto();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Roles = (from u in ctx.RolesProducto
                                     where u.FlagActivo == true

                                     orderby u.Rol
                                     select new CustomAutocompleteApplication()
                                     {
                                         Id = u.RolesProductoId.ToString(),
                                         Descripcion = u.Rol,
                                         Value = u.RolesProductoId.ToString()
                                     }).Distinct().ToList();







                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
        }


        public override FiltersFuncionesProducto GetFuncionesProductosComboTribu()
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            FiltersFuncionesProducto filtro = new FiltersFuncionesProducto();

            filtro.Tribu = new List<CustomAutocompleteApplication>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("cvt.MDR_Filtro_Tribus", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    //comando.Parameters.Add(new SqlParameter("@nombre", name));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        filtro.Tribu.Add(new CustomAutocompleteApplication()
                        {
                            Id = reader.GetString(reader.GetOrdinal("Tribu")),
                            Descripcion = reader.GetString(reader.GetOrdinal("Tribu")),
                            Value = reader.GetString(reader.GetOrdinal("Tribu")),

                        });
                    }

                }

                cnx.Close();

                return filtro;
            }
        }
        public override FiltersFuncionesProducto GetFuncionesProductosComboRoles(int id)
        {
            var retorno = new FiltersFuncionesProducto();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Roles = (from u in ctx.RolesProducto
                                     where u.FlagActivo == true && u.ProductoId == id

                                     orderby u.Rol
                                     select new CustomAutocompleteApplication()
                                     {
                                         Id = u.RolesProductoId.ToString(),
                                         Descripcion = u.Rol,
                                         Value = u.RolesProductoId.ToString()
                                     }).ToList();







                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FiltersAppStepOne GetListStepOne(string filtro)"
                    , new object[] { null });
            }
        }


        public override DataResultAplicacion EditarRolProducto(int id, string rol, string grupored, string descripcion, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == id);
                    RolesProducto entidadInicial = new RolesProducto();

                    //Guardando valores anteriores para la bitacora
                    entidadInicial.Rol = entidad.Rol;
                    entidadInicial.GrupoRed = entidad.GrupoRed;
                    entidadInicial.Descripcion = entidad.Descripcion;

                    //Asignando nuevos valores
                    entidad.Rol = rol;
                    entidad.GrupoRed = grupored;
                    entidad.Descripcion = descripcion;


                    ctx.SaveChanges();

                    try
                    {
                        var entidad2 = ctx.Producto.FirstOrDefault(x => x.ProductoId == entidad.ProductoId);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "modificó el rol de producto de " + entidadInicial.Rol + " a " + rol + " y el grupo de red de " + entidadInicial.Rol + " a " + grupored + " y la descripción de " + entidadInicial.Descripcion + " a " + descripcion + " para el producto: ";
                        BitacoraMensaje = BitacoraMensaje + entidad2.Nombre;

                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }



                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override DataResultAplicacion EditarFuncion(string tribu, int id, string chapter, string funcion, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.FuncionProductoId == id);
                    ChapterFuncionesRoles entidadInicial = new ChapterFuncionesRoles();

                    //Guardando valores anteriores para la bitacora
                    entidadInicial.Chapter = entidad.Chapter;
                    entidadInicial.Funcion = entidad.Funcion;


                    //Asignando nuevos valores
                    entidad.Chapter = chapter;
                    entidad.Funcion = funcion;
                    entidad.Tribu = tribu;

                    ctx.SaveChanges();

                    try
                    {
                        var entidad2 = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == entidad.RolesProductoId);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "modificó la función de " + entidadInicial.Funcion + " a " + funcion + " y el chapter de " + entidadInicial.Chapter + " a " + chapter + " para el rol: ";
                        BitacoraMensaje = BitacoraMensaje + entidad2.Rol;

                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }



                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override DataResultAplicacion EditarFuncionProducto(int FuncionProductoId, int RolProductoId, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.FuncionProductoId == FuncionProductoId);
                    FuncionDTO entidadInicial = new FuncionDTO();

                    //Guardando valores anteriores para la bitacora
                    entidadInicial.RolesProductoId = entidad.RolesProductoId;



                    //Asignando nuevos valores
                    entidad.RolesProductoId = RolProductoId;



                    ctx.SaveChanges();

                    try
                    {
                        var rolesProductoA = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == entidadInicial.RolesProductoId);
                        var rolesProductoD = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == entidad.RolesProductoId);
                        var productoA = ctx.Producto.FirstOrDefault(x => x.ProductoId == rolesProductoA.ProductoId);
                        var productoD = ctx.Producto.FirstOrDefault(x => x.ProductoId == rolesProductoD.ProductoId);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "modificó el producto de " + productoA.Nombre + " a " + productoD.Nombre + " y el rol de " + rolesProductoA.Rol + " a " + rolesProductoD.Rol + " para la función : " + entidad.Funcion + " y el chapter : " + entidad.Chapter;


                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }



                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override bool ExistsRol(string id, int prod, int rolid)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var RolActual = ctx.RolesProducto.Where(x => x.RolesProductoId == rolid).FirstOrDefault();

                    bool? estado = (from u in ctx.RolesProducto
                                    where u.Rol.ToUpper().Equals(id.ToUpper()) && u.ProductoId == prod && u.FlagActivo == true && u.FlagEliminado == false
                                    orderby u.Rol
                                    select true).FirstOrDefault();
                    if (RolActual.Rol == id)
                    {
                        return false;
                    }
                    else
                    {
                        return estado == true;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
        }

        public override bool ExistsRolNuevo(string id, int prod)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {


                    bool? estado = (from u in ctx.RolesProducto
                                    where u.Rol.ToUpper().Equals(id.ToUpper()) && u.ProductoId == prod && u.FlagActivo == true && u.FlagEliminado == false
                                    orderby u.Rol
                                    select true).FirstOrDefault();

                    return estado == true;

                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
        }

        public override bool ExistsRolEnFuncion(string chapter, string funcion, int producto, int rol)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    bool? estado = (from a in ctx.ChapterFuncionesRoles
                                    join u in ctx.RolesProducto on a.RolesProductoId equals u.RolesProductoId
                                    where a.Chapter.ToUpper().Equals(chapter.ToUpper()) && a.Funcion.ToUpper().Equals(funcion.ToUpper()) &&
                                    u.RolesProductoId == rol && u.ProductoId == producto
                                    && u.FlagActivo == true && u.FlagEliminado == false && a.FlagActivo == true && a.FlagEliminado == false
                                    orderby u.Rol
                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
        }

        public override bool ValidarProductoPerteneciente(int prod, string tribu)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var funcion = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.FuncionProductoId == prod && x.FlagActivo == true && x.FlagEliminado == false);
                    var rol = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == funcion.RolesProductoId && x.FlagActivo == true && x.FlagEliminado == false);

                    bool? estado = (from a in ctx.Producto

                                    where
                                    a.ProductoId == rol.ProductoId && a.TribuCoeId == tribu
                                    && a.FlagActivo == true

                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
        }


        public override bool ExistsFuncionEnRol(string chapter, string funcion, string producto, string rol)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    bool? estado = (from a in ctx.ChapterFuncionesRoles
                                    join u in ctx.RolesProducto on a.RolesProductoId equals u.RolesProductoId
                                    join b in ctx.Producto on u.ProductoId equals b.ProductoId
                                    where a.Chapter.ToUpper().Equals(chapter.ToUpper()) && a.Funcion.ToUpper().Equals(funcion.ToUpper()) &&
                                    u.Rol == rol && b.Nombre == producto
                                    && u.FlagActivo == true && u.FlagEliminado == false && a.FlagActivo == true && a.FlagEliminado == false
                                    orderby u.Rol
                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
        }

        public override bool ExistsGrupoRed(string id, int prod, int rolid)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var RolActual = ctx.RolesProducto.Where(x => x.RolesProductoId == rolid).FirstOrDefault();

                    bool? estado = (from u in ctx.RolesProducto
                                    where u.GrupoRed.ToUpper() == id.ToUpper() && u.ProductoId == prod && u.FlagActivo == true && u.FlagEliminado == false
                                    orderby u.GrupoRed
                                    select true).FirstOrDefault();
                    if (RolActual.GrupoRed == id)
                    {
                        return false;
                    }
                    else
                    {
                        return estado == true;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
        }

        public override bool ExistsGrupoRedNuevo(string id, int prod)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {


                    bool? estado = (from u in ctx.RolesProducto
                                    where u.GrupoRed.ToUpper() == id.ToUpper() && u.ProductoId == prod && u.FlagActivo == true && u.FlagEliminado == false
                                    orderby u.GrupoRed
                                    select true).FirstOrDefault();


                    return estado == true;

                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: bool ExistsApplicationById(string id)"
                    , new object[] { null });
            }
        }


        public override DataResultAplicacion EditarItem(int ItemId, string NuevoValor, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == ItemId);



                    //Asignando nuevos valores
                    entidad.Valor = NuevoValor;



                    ctx.SaveChanges();

                    //try
                    //{
                    //    var rolesProductoA = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == entidadInicial.RolesProductoId);
                    //    var rolesProductoD = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == entidad.RolesProductoId);
                    //    var productoA = ctx.Producto.FirstOrDefault(x => x.ProductoId == rolesProductoA.ProductoId);
                    //    var productoD = ctx.Producto.FirstOrDefault(x => x.ProductoId == rolesProductoD.ProductoId);

                    //    var BitacoraMensaje = "";
                    //    var dateAndTime = DateTime.Now;
                    //    string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                    //    var hour = dateAndTime.ToString("HH:mm:ss");
                    //    BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                    //        "modificó el producto de " + productoA.Nombre + " a " + productoD.Nombre + " y el rol de " + rolesProductoA.Rol + " a " + rolesProductoD.Rol + " para la función : " + entidad.Funcion + " y el chapter : " + entidad.Chapter;


                    //    BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                    //    var registroBitacora = new BitacoraAcciones()
                    //    {
                    //        CodigoAPT = "",
                    //        DetalleBitacora = BitacoraMensaje,
                    //        CreadoPor = matricula,
                    //        FechaCreacion = dateAndTime,
                    //        NombreUsuarioCreacion = nombre
                    //    };

                    //    ctx.BitacoraAcciones.Add(registroBitacora);
                    //    ctx.SaveChanges();
                    //}

                    //catch (Exception ex)
                    //{
                    //    log.Error(ex.Message, ex);
                    //}



                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override DataResultAplicacion EliminarRolProducto(int id, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };


                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var entidad = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == id);



                    entidad.FlagActivo = false;
                    entidad.FlagEliminado = true;


                    ctx.SaveChanges();

                    try
                    {
                        var entidad2 = ctx.Producto.FirstOrDefault(x => x.ProductoId == entidad.ProductoId);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "eliminó el rol " + entidad.Rol + " con grupo de red " + entidad.GrupoRed + " para el producto: ";
                        BitacoraMensaje = BitacoraMensaje + entidad2.Nombre;

                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }

                    ////Envio de correo
                    //try
                    //{
                    //    List<string> correos = new List<string>();
                    //    correos.Add(email);

                    //    var mailManager = new MailingManager();
                    //    var diccionario = new Dictionary<string, string>();
                    //    diccionario.Add("[CodigoAPT]", CodigoApp);
                    //    diccionario.Add("[NombreAplicacion]", NombreApp);
                    //    diccionario.Add("[MotivoEliminacion]", comments);
                    //    mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.EliminacionRechazoSolicitud, CodigoApp, diccionario, correos);
                    //}
                    //catch (Exception ex)
                    //{
                    //    log.Error(ex.Message, ex);
                    //}


                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override DataResultAplicacion EliminarFuncion(int id, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };


                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var entidad = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.FuncionProductoId == id);



                    entidad.FlagActivo = false;
                    entidad.FlagEliminado = true;


                    ctx.SaveChanges();

                    try
                    {
                        var entidad2 = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == entidad.RolesProductoId);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "eliminó el la función " + entidad.Funcion + " con chapter " + entidad.Chapter + " para el rol: ";
                        BitacoraMensaje = BitacoraMensaje + entidad2.Rol;

                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }

                    ////Envio de correo
                    //try
                    //{
                    //    List<string> correos = new List<string>();
                    //    correos.Add(email);

                    //    var mailManager = new MailingManager();
                    //    var diccionario = new Dictionary<string, string>();
                    //    diccionario.Add("[CodigoAPT]", CodigoApp);
                    //    diccionario.Add("[NombreAplicacion]", NombreApp);
                    //    diccionario.Add("[MotivoEliminacion]", comments);
                    //    mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.EliminacionRechazoSolicitud, CodigoApp, diccionario, correos);
                    //}
                    //catch (Exception ex)
                    //{
                    //    log.Error(ex.Message, ex);
                    //}


                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override DataResultAplicacion EliminarProductoFuncion(int id, string matricula, string nombre)
        {

            try
            {
                var dataResult = new DataResultAplicacion()
                {
                    AplicacionId = 0,
                    SolicitudId = 0,
                    EstadoTransaccion = true
                };


                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var entidad = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.FuncionProductoId == id);



                    entidad.FlagActivo = false;
                    entidad.FlagEliminado = true;


                    ctx.SaveChanges();

                    try
                    {
                        var rolproducto = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == entidad.RolesProductoId);
                        var entidad2 = ctx.Producto.FirstOrDefault(x => x.ProductoId == rolproducto.ProductoId);

                        var BitacoraMensaje = "";
                        var dateAndTime = DateTime.Now;
                        string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                        var hour = dateAndTime.ToString("HH:mm:ss");
                        BitacoraMensaje = " " + nombre + "" + "(" + matricula + ")" + " " +
                            "eliminó el rol " + rolproducto.Rol + " del producto " + entidad2.Nombre + " de la función: ";
                        BitacoraMensaje = BitacoraMensaje + entidad.Funcion + " y  chapter: " + entidad.Chapter;

                        BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                        var registroBitacora = new BitacoraAcciones()
                        {
                            CodigoAPT = "",
                            DetalleBitacora = BitacoraMensaje,
                            CreadoPor = matricula,
                            FechaCreacion = dateAndTime,
                            NombreUsuarioCreacion = nombre
                        };

                        ctx.BitacoraAcciones.Add(registroBitacora);
                        ctx.SaveChanges();
                    }

                    catch (Exception ex)
                    {
                        log.Error(ex.Message, ex);
                    }

                    ////Envio de correo
                    //try
                    //{
                    //    List<string> correos = new List<string>();
                    //    correos.Add(email);

                    //    var mailManager = new MailingManager();
                    //    var diccionario = new Dictionary<string, string>();
                    //    diccionario.Add("[CodigoAPT]", CodigoApp);
                    //    diccionario.Add("[NombreAplicacion]", NombreApp);
                    //    diccionario.Add("[MotivoEliminacion]", comments);
                    //    mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.EliminacionRechazoSolicitud, CodigoApp, diccionario, correos);
                    //}
                    //catch (Exception ex)
                    //{
                    //    log.Error(ex.Message, ex);
                    //}


                    return dataResult;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override RolesProductoDTO GetRolProductoById(int id)
        {

            try
            {

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    RolesProductoDTO obj = new RolesProductoDTO();

                    var Rol = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == id);
                    var Producto = ctx.Producto.FirstOrDefault(x => x.ProductoId == Rol.ProductoId);

                    obj.ProductoId = Rol.ProductoId;
                    obj.Rol = Rol.Rol;
                    obj.GrupoRed = Rol.GrupoRed;
                    obj.ProductoNombre = Producto.Nombre;
                    obj.Descripcion = Rol.Descripcion;


                    return obj;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override bool GetRolFuncion(int id)
        {

            try
            {

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {


                    var Rol = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.RolesProductoId == id && x.FlagActivo == true && x.FlagEliminado == false);
                    if (Rol == null) { return true; }

                    else return false;



                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override FuncionDTO GetFuncionById(int id)
        {

            try
            {

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    FuncionDTO obj = new FuncionDTO();

                    var Funcion = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.FuncionProductoId == id);
                    var Rol = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == Funcion.RolesProductoId);

                    obj.Id = Funcion.FuncionProductoId;
                    obj.Rol = Rol.Rol;
                    obj.GrupoRed = Rol.GrupoRed;
                    obj.Chapter = Funcion.Chapter;
                    obj.Funcion = Funcion.Funcion;
                    obj.Tribu = Funcion.Tribu;

                    return obj;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override FuncionDTO GetFuncionProductoById(int id)
        {

            try
            {

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    FuncionDTO obj = new FuncionDTO();

                    var funcion = ctx.ChapterFuncionesRoles.FirstOrDefault(x => x.FuncionProductoId == id);
                    var RolProducto = ctx.RolesProducto.FirstOrDefault(x => x.RolesProductoId == funcion.RolesProductoId);

                    obj.ProductoId = RolProducto.ProductoId;
                    obj.RolesProductoId = RolProducto.RolesProductoId;
                    obj.Chapter = funcion.Chapter;
                    obj.Funcion = funcion.Funcion;
                    obj.Tribu = funcion.Tribu;


                    return obj;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }







        public override List<RolesProductoDTO> GetProductoRolesDetalleDetalle(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from b in ctx.Producto
                                         join u in ctx.RolesProducto on b.ProductoId equals u.ProductoId
                                         //join a in ctx.ChapterFuncionesRoles on u.RolesProductoId equals a.RolesProductoId
                                         where u.ProductoId == pag.ProductoId && u.FlagActivo == true && u.FlagEliminado == false
                                         //&& a.FlagActivo == true && a.FlagEliminado == false
                                         select new RolesProductoDTO()
                                         {
                                             Id = u.RolesProductoId,
                                             Descripcion = u.Descripcion,
                                             ProductoId = u.ProductoId,
                                             Rol = u.Rol,
                                             GrupoRed = u.GrupoRed,
                                             Producto = b.Nombre

                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        foreach (var item in resultado)
                        {
                            var cantidad = ctx.ChapterFuncionesRoles.Where(x => x.RolesProductoId == item.Id && x.FlagActivo == true && x.FlagEliminado == false).ToList();
                            if (cantidad != null)
                                item.FuncionesRelacionadas = cantidad.Count();
                            else if (cantidad == null)
                                item.FuncionesRelacionadas = 0;
                        }

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override string GetTribuNombreMatricula(string matricula)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            string codigo = "";

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("USP_Capta_TribuNombre_Por_Matricula", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@Matricula", matricula));




                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {

                        codigo = reader.GetString(reader.GetOrdinal("CodigoTribu"));

                    }

                }

                cnx.Close();

                return codigo;
            }
        }

        public override string GetTribuMatricula(string matricula)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            string codigo = "";

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("USP_Capta_Tribu_Por_Matricula", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@Matricula", matricula));




                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {

                        codigo = reader.GetString(reader.GetOrdinal("CodigoTribu"));

                    }

                }

                cnx.Close();

                return codigo;
            }
        }

        public override List<FuncionDTO> GetChapter(string name, string tribu)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            List<FuncionDTO> lista = new List<FuncionDTO>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("app.Buscar_Chapter_BCP_CATG_GH_INFO_EMPLEADOS", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@nombre", name));
                    comando.Parameters.Add(new SqlParameter("@tribu", tribu));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        lista.Add(new FuncionDTO()
                        {
                            Chapter = reader.GetString(reader.GetOrdinal("Chapter"))
                        });
                    }

                }

                cnx.Close();

                return lista;
            }
        }

        public override List<FuncionDTO> GetGrupoRed(string name)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            List<FuncionDTO> lista = new List<FuncionDTO>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("app.Buscar_GrupoRed", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@nombre", name));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        lista.Add(new FuncionDTO()
                        {
                            GrupoRed = reader.GetString(reader.GetOrdinal("GrupoRed"))
                        });
                    }

                }

                cnx.Close();

                return lista;
            }
        }


        public override List<FuncionDTO> GetTribu(string name)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            List<FuncionDTO> lista = new List<FuncionDTO>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("app.Buscar_Tribu_BCP_CATG_GH_INFO_EMPLEADOS ", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@nombre", name));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        lista.Add(new FuncionDTO()
                        {
                            Tribu = reader.GetString(reader.GetOrdinal("Tribu"))
                        });
                    }

                }

                cnx.Close();

                return lista;
            }
        }


        public override List<ProductoDTO> GetProd(string name)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            List<ProductoDTO> lista = new List<ProductoDTO>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("app.Buscar_Producto_Autocomplete", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@nombre", name));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        lista.Add(new ProductoDTO()
                        {
                            Nombre = reader.GetString(reader.GetOrdinal("Nombre"))
                        });
                    }

                }

                cnx.Close();

                return lista;
            }
        }



        public override List<ProductoDTO> GetRol(string name)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            List<ProductoDTO> lista = new List<ProductoDTO>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("app.Buscar_Rol_Autocomplete", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@nombre", name));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        lista.Add(new ProductoDTO()
                        {
                            Nombre = reader.GetString(reader.GetOrdinal("Rol")),
                            RolId = reader.GetInt32(reader.GetOrdinal("Id"))
                        });
                    }

                }

                cnx.Close();

                return lista;
            }
        }


        public override List<FuncionDTO> GetFuncion(string chapter, string funcion)
        {
            DataSet resultado = null;
            var cadenaConexion = Constantes.CadenaConexion;


            List<FuncionDTO> lista = new List<FuncionDTO>();

            using (SqlConnection cnx = new SqlConnection(cadenaConexion))
            {
                cnx.Open();
                using (var comando = new SqlCommand("app.Buscar_Funcion_BCP_CATG_GH_INFO_EMPLEADOS ", cnx))
                {
                    comando.CommandTimeout = 0;
                    comando.CommandType = System.Data.CommandType.StoredProcedure;
                    comando.Parameters.Add(new SqlParameter("@funcion", funcion));
                    comando.Parameters.Add(new SqlParameter("@chapter", chapter));



                    var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        lista.Add(new FuncionDTO()
                        {
                            Chapter = reader.GetString(reader.GetOrdinal("Chapter")),
                            Funcion = reader.GetString(reader.GetOrdinal("Funcion"))

                        });
                    }

                }

                cnx.Close();

                return lista;
            }
        }



        public override List<FuncionDTO> GetFuncionExportar(PaginationApplication filter, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var registros = (from u in ctx.ChapterFuncionesRoles
                                     join u2 in ctx.RolesProducto on u.RolesProductoId equals u2.RolesProductoId
                                     join u3 in ctx.Producto on u2.ProductoId equals u3.ProductoId

                                     where (u3.Nombre.ToUpper().Contains(filter.Producto.ToUpper())
                                     || string.IsNullOrEmpty(filter.Producto))
                                     && u.FlagActivo == true
                                     && u2.FlagActivo == true
                                       && u3.FlagActivo == true

                                     select new FuncionDTO()
                                     {
                                         Chapter = u.Chapter,
                                         Funcion = u.Funcion,
                                         Producto = u3.Nombre,
                                         Rol = u2.Rol,
                                         GrupoRed = u2.GrupoRed

                                     }).Distinct();

                    totalRows = registros.Count();
                    registros = registros.OrderBy(filter.sortName + " " + filter.sortOrder);
                    var resultado = registros.Skip((filter.pageNumber - 1) * filter.pageSize).Take(filter.pageSize).ToList();

                    return resultado;


                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override List<FuncionDTO> GetFuncionExportar2(PaginationApplication filter, out int totalRows)
        {
            try
            {
                if (filter.Perfil.Contains("E195_MDR_TribuCOE"))
                {
                    totalRows = 0;
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {

                        var registros = (from u in ctx.ChapterFuncionesRoles
                                         join u2 in ctx.RolesProducto on u.RolesProductoId equals u2.RolesProductoId
                                         join u3 in ctx.Producto on u2.ProductoId equals u3.ProductoId
                                         join u4 in ctx.Dominio on u3.DominioId equals u4.DominioId
                                         join u5 in ctx.Subdominio on u4.DominioId equals u5.DominioId

                                         where ((u.Funcion.ToUpper().Contains(filter.Funcion.ToUpper())
                                         || string.IsNullOrEmpty(filter.Funcion)))
                                         && (u4.DominioId == filter.Dominio || filter.Dominio == -1)
                                         && (u5.SubdominioId == filter.SubDominio || filter.SubDominio == -1)
                                         && ((u3.OwnerMatricula.ToUpper().Contains(filter.Matricula.ToUpper())
                                         || string.IsNullOrEmpty(filter.Matricula)))
                                         && u3.TribuCoeId == filter.CodigoTribu
                                         && u.FlagActivo == true && u.FlagEliminado == false
                                         && u2.FlagActivo == true && u2.FlagEliminado == false
                                         && u3.FlagActivo == true
                                         && u4.Activo == true
                                         && u5.Activo == true
                                         && u.Tribu == filter.NombreTribu
                                         && ((u2.GrupoRed.ToUpper().Contains(filter.GrupoRed.ToUpper())
                                         || string.IsNullOrEmpty(filter.GrupoRed)))
                                          && ((u2.Rol.ToUpper().Contains(filter.RolNombre.ToUpper())
                                         || string.IsNullOrEmpty(filter.RolNombre)))
                                           && ((u3.Nombre.ToUpper().Contains(filter.Producto.ToUpper())
                                         || string.IsNullOrEmpty(filter.Producto)))

                                         select new FuncionDTO()
                                         {
                                             Tribu = u.Tribu,
                                             Chapter = u.Chapter,
                                             Funcion = u.Funcion,
                                             Producto = u3.Nombre,
                                             Rol = u2.Rol,
                                             GrupoRed = u2.GrupoRed

                                         }).Distinct();

                        totalRows = registros.Count();
                        registros = registros.OrderBy(filter.sortName + " " + filter.sortOrder);
                        registros = registros.OrderBy(x => x.Tribu).ThenByDescending(x => x.Chapter).ThenByDescending(x => x.Funcion);
                        var resultado = registros.Skip((filter.pageNumber - 1) * filter.pageSize).Take(filter.pageSize).ToList();

                        return resultado;



                    }

                }
                else
                {

                    DataSet resultado = null;
                    var cadenaConexion = Constantes.CadenaConexion;


                    List<FuncionDTO> lista = new List<FuncionDTO>();

                    using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                    {
                        cnx.Open();
                        using (var comando = new SqlCommand("cvt.Usp_Reporte_Chapter_Lead_Funciones", cnx))
                        {
                            comando.CommandTimeout = 0;
                            comando.CommandType = System.Data.CommandType.StoredProcedure;
                            comando.Parameters.Add(new SqlParameter("@Producto", filter.Producto));
                            comando.Parameters.Add(new SqlParameter("@Chapter", filter.Chapter));
                            comando.Parameters.Add(new SqlParameter("@Funcion", filter.Funcion));
                            comando.Parameters.Add(new SqlParameter("@Rol", filter.RolNombre));
                            comando.Parameters.Add(new SqlParameter("@GrupoRed", filter.GrupoRed));
                            comando.Parameters.Add(new SqlParameter("@TribuF", filter.Tribu));
                            //comando.Parameters.Add(new SqlParameter("@Dominio", filter.Dominio));
                            //comando.Parameters.Add(new SqlParameter("@SubDominio", filter.SubDominio));
                            comando.Parameters.Add(new SqlParameter("@Matricula", filter.Matricula));




                            var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                            while (reader.Read())
                            {
                                lista.Add(new FuncionDTO()
                                {
                                    Chapter = reader.GetString(reader.GetOrdinal("Chapter")),
                                    Tribu = reader.GetString(reader.GetOrdinal("Tribu")),
                                    Funcion = reader.GetString(reader.GetOrdinal("Funcion")),
                                    Rol = reader.GetString(reader.GetOrdinal("Rol")),
                                    GrupoRed = reader.GetString(reader.GetOrdinal("GrupoRed")),
                                    Producto = reader.GetString(reader.GetOrdinal("Producto")),


                                });
                            }

                        }

                        cnx.Close();
                        totalRows = lista.Count();

                        return lista;

                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override List<FuncionDTO> GetFuncionExportar2Squad(PaginationApplication filter, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var registros = (from u in ctx.ChapterFuncionesRoles
                                     join u2 in ctx.RolesProducto on u.RolesProductoId equals u2.RolesProductoId
                                     join u3 in ctx.Producto on u2.ProductoId equals u3.ProductoId
                                     join u4 in ctx.Dominio on u3.DominioId equals u4.DominioId
                                     join u5 in ctx.Subdominio on u4.DominioId equals u5.DominioId

                                     where ((u.Funcion.ToUpper().Contains(filter.Funcion.ToUpper())
                                     || string.IsNullOrEmpty(filter.Funcion)))
                                     && (u4.DominioId == filter.Dominio || filter.Dominio == -1)
                                     && (u5.SubdominioId == filter.SubDominio || filter.SubDominio == -1)
                                     && ((u3.OwnerMatricula.ToUpper().Contains(filter.Matricula.ToUpper())
                                     || string.IsNullOrEmpty(filter.Matricula)))
                                     && u.FlagActivo == true
                                     && u2.FlagActivo == true
                                     && u3.FlagActivo == true
                                     && u4.Activo == true
                                     && u5.Activo == true

                                     select new FuncionDTO()
                                     {
                                         Tribu = u.Tribu,
                                         Squad = u3.SquadDisplayName == null ? "" : u3.SquadDisplayName,
                                         Funcion = u.Funcion,
                                         Producto = u3.Nombre,
                                         Rol = u2.Rol,
                                         GrupoRed = u2.GrupoRed,
                                         Chapter = u.Chapter

                                     }).Distinct();

                    totalRows = registros.Count();
                    registros = registros.OrderBy(filter.sortName + " " + filter.sortOrder);
                    var resultado = registros.Skip((filter.pageNumber - 1) * filter.pageSize).Take(filter.pageSize).ToList();

                    return resultado;


                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }



        public override List<FuncionDTO> GetFuncionExportar2Admin(PaginationApplication filter, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var registros = (from u in ctx.ChapterFuncionesRoles
                                     join u2 in ctx.RolesProducto on u.RolesProductoId equals u2.RolesProductoId
                                     join u3 in ctx.Producto on u2.ProductoId equals u3.ProductoId
                                     join u4 in ctx.Dominio on u3.DominioId equals u4.DominioId
                                     join u5 in ctx.Subdominio on u4.DominioId equals u5.DominioId
                                     where ((u.Funcion.ToUpper().Contains(filter.Funcion.ToUpper()) || string.IsNullOrEmpty(filter.Funcion)))
                                     //&& ((u.Chapter.ToUpper().Contains(filter.Chapter.ToUpper()) || string.IsNullOrEmpty(filter.Chapter)))
                                     && ((u3.TribuCoeId.ToUpper().Contains(filter.Tribu.ToUpper()) || string.IsNullOrEmpty(filter.Tribu)))
                                       && ((u2.Rol.ToUpper().Contains(filter.RolNombre.ToUpper()) || string.IsNullOrEmpty(filter.RolNombre)))

                                     && ((u2.GrupoRed.ToUpper().Contains(filter.GrupoRed.ToUpper()) || string.IsNullOrEmpty(filter.GrupoRed)))
                                     && ((u3.Nombre.ToUpper().Contains(filter.Producto.ToUpper()) || string.IsNullOrEmpty(filter.Producto)))
                                       && (u4.DominioId == filter.Dominio || filter.Dominio == -1)
                                         && (u5.SubdominioId == filter.SubDominio || filter.SubDominio == -1)
                                     && u.FlagActivo == true
                                     && u2.FlagActivo == true
                                      && u3.FlagActivo == true
                                       && u4.Activo == true
                                        && u5.Activo == true

                                     select new FuncionDTO()
                                     {
                                         Chapter = u.Chapter,
                                         Funcion = u.Funcion,
                                         Producto = u3.Nombre,
                                         Rol = u2.Rol,
                                         GrupoRed = u2.GrupoRed,
                                         Tribu = u.Tribu

                                     }).Distinct();

                    totalRows = registros.Count();
                    registros = registros.OrderBy(filter.sortName + " " + filter.sortOrder);
                    registros = registros.OrderBy(x => x.Tribu).ThenByDescending(x => x.Chapter).ThenByDescending(x => x.Funcion);
                    var resultado = registros.Skip((filter.pageNumber - 1) * filter.pageSize).Take(filter.pageSize).ToList();

                    return resultado;


                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override List<FuncionDTO> GetFuncionExportar2AdminSquad(PaginationApplication filter, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {

                    var registros = (from u in ctx.ChapterFuncionesRoles
                                     join u2 in ctx.RolesProducto on u.RolesProductoId equals u2.RolesProductoId
                                     join u3 in ctx.Producto on u2.ProductoId equals u3.ProductoId
                                     join u4 in ctx.Dominio on u3.DominioId equals u4.DominioId
                                     join u5 in ctx.Subdominio on u4.DominioId equals u5.DominioId
                                     where ((u.Funcion.ToUpper().Contains(filter.Funcion.ToUpper()) || string.IsNullOrEmpty(filter.Funcion)))
                                     //&& ((u.Chapter.ToUpper().Contains(filter.Chapter.ToUpper()) || string.IsNullOrEmpty(filter.Chapter)))
                                     && ((u3.TribuCoeId.ToUpper().Contains(filter.Tribu.ToUpper()) || string.IsNullOrEmpty(filter.Tribu)))
                                     && (u2.RolesProductoId == filter.Rol || filter.Rol == -1)
                                     && ((u2.GrupoRed.ToUpper().Contains(filter.GrupoRed.ToUpper()) || string.IsNullOrEmpty(filter.GrupoRed)))
                                     && ((u3.Nombre.ToUpper().Contains(filter.Producto.ToUpper()) || string.IsNullOrEmpty(filter.Producto)))
                                       && (u4.DominioId == filter.Dominio || filter.Dominio == -1)
                                         && (u5.SubdominioId == filter.SubDominio || filter.SubDominio == -1)
                                     && u.FlagActivo == true
                                     && u2.FlagActivo == true
                                      && u3.FlagActivo == true
                                       && u4.Activo == true
                                        && u5.Activo == true

                                     select new FuncionDTO()
                                     {
                                         Squad = u3.SquadDisplayName == null ? "" : u3.SquadDisplayName,
                                         Funcion = u.Funcion,
                                         Producto = u3.Nombre,
                                         Rol = u2.Rol,
                                         GrupoRed = u2.GrupoRed,
                                         Tribu = u.Tribu == null ? "" : u.Tribu,
                                         Chapter = u.Chapter

                                     }).Distinct();

                    totalRows = registros.Count();
                    registros = registros.OrderBy(filter.sortName + " " + filter.sortOrder);
                    var resultado = registros.Skip((filter.pageNumber - 1) * filter.pageSize).Take(filter.pageSize).ToList();

                    return resultado;


                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override List<FuncionDTO> GetFuncionPersonaExportar(PaginationApplication filter)
        {
            try
            {
                DataSet resultado = null;
                var cadenaConexion = Constantes.CadenaConexion;


                List<FuncionDTO> lista = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_Personas_Exportar", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@Producto", filter.Producto));
                        comando.Parameters.Add(new SqlParameter("@Dominio", filter.Dominio));
                        comando.Parameters.Add(new SqlParameter("@SubDominio", filter.SubDominio));
                        comando.Parameters.Add(new SqlParameter("@Matricula", filter.Matricula));




                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            lista.Add(new FuncionDTO()
                            {
                                Chapter = reader.GetString(reader.GetOrdinal("Chapter")),
                                Funcion = reader.GetString(reader.GetOrdinal("Funcion")),
                                Rol = reader.GetString(reader.GetOrdinal("Rol")),
                                GrupoRed = reader.GetString(reader.GetOrdinal("GrupoRed")),
                                Producto = reader.GetString(reader.GetOrdinal("Producto")),
                                Nombre = reader.GetString(reader.GetOrdinal("Persona"))

                            });
                        }

                    }

                    cnx.Close();

                    return lista;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<FuncionDTO> GetFuncionPersonaExportarSquad(PaginationApplication filter)
        {
            try
            {
                DataSet resultado = null;
                var cadenaConexion = Constantes.CadenaConexion;


                List<FuncionDTO> lista = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_Personas_ExportarSquad", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@Producto", filter.Producto));
                        comando.Parameters.Add(new SqlParameter("@Dominio", filter.Dominio));
                        comando.Parameters.Add(new SqlParameter("@SubDominio", filter.SubDominio));
                        comando.Parameters.Add(new SqlParameter("@Matricula", filter.Matricula));




                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            lista.Add(new FuncionDTO()
                            {
                                Tribu = reader.GetString(reader.GetOrdinal("Tribu")),
                                Squad = reader.GetString(reader.GetOrdinal("Squad")),
                                Funcion = reader.GetString(reader.GetOrdinal("Funcion")),
                                Rol = reader.GetString(reader.GetOrdinal("Rol")),
                                GrupoRed = reader.GetString(reader.GetOrdinal("GrupoRed")),
                                Producto = reader.GetString(reader.GetOrdinal("Producto")),
                                Nombre = reader.GetString(reader.GetOrdinal("Persona")),
                                Chapter = reader.GetString(reader.GetOrdinal("Chapter"))

                            });
                        }

                    }

                    cnx.Close();

                    return lista;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<FuncionDTO> GetFuncionPersonaExportar2(PaginationApplication filter)
        {
            try
            {
                DataSet resultado = null;
                var cadenaConexion = Constantes.CadenaConexion;


                List<FuncionDTO> lista = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_Personas_Exportar2", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@Chapter", filter.Chapter));
                        comando.Parameters.Add(new SqlParameter("@Funcion", filter.Funcion));
                        comando.Parameters.Add(new SqlParameter("@Matricula", filter.Matricula));
                        comando.Parameters.Add(new SqlParameter("@Perfil", filter.Perfil));

                        comando.Parameters.Add(new SqlParameter("@Tribu", filter.Tribu));
                        comando.Parameters.Add(new SqlParameter("@GrupoRed", filter.GrupoRed));
                        comando.Parameters.Add(new SqlParameter("@Rol", filter.Rol));
                        comando.Parameters.Add(new SqlParameter("@Producto", filter.Producto));
                        comando.Parameters.Add(new SqlParameter("@CodigoTribu", filter.CodigoTribu));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            lista.Add(new FuncionDTO()
                            {
                                Chapter = reader.GetString(reader.GetOrdinal("Chapter")),
                                Funcion = reader.GetString(reader.GetOrdinal("Funcion")),
                                Rol = reader.GetString(reader.GetOrdinal("Rol")),
                                GrupoRed = reader.GetString(reader.GetOrdinal("GrupoRed")),
                                Producto = reader.GetString(reader.GetOrdinal("Producto")),
                                Nombre = reader.GetString(reader.GetOrdinal("Persona")),
                                Tribu = reader.GetString(reader.GetOrdinal("Tribu"))


                            });
                        }

                    }

                    cnx.Close();

                    return lista;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<FuncionDTO> GetFuncionPersonaExportar2Admin(PaginationApplication filter)
        {
            try
            {
                DataSet resultado = null;
                var cadenaConexion = Constantes.CadenaConexion;


                List<FuncionDTO> lista = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_Personas_Exportar2Admin", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        //comando.Parameters.Add(new SqlParameter("@Chapter", filter.Chapter));
                        comando.Parameters.Add(new SqlParameter("@Funcion", filter.Funcion));
                        comando.Parameters.Add(new SqlParameter("@Tribu", filter.Tribu));
                        comando.Parameters.Add(new SqlParameter("@GrupoRed", filter.GrupoRed));
                        comando.Parameters.Add(new SqlParameter("@Rol", filter.Rol));
                        comando.Parameters.Add(new SqlParameter("@Producto", filter.Producto));
                        comando.Parameters.Add(new SqlParameter("@Dominio", filter.Dominio));
                        comando.Parameters.Add(new SqlParameter("@SubDominio", filter.SubDominio));



                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            lista.Add(new FuncionDTO()
                            {
                                Chapter = reader.GetString(reader.GetOrdinal("Chapter")),
                                Funcion = reader.GetString(reader.GetOrdinal("Funcion")),
                                Rol = reader.GetString(reader.GetOrdinal("Rol")),
                                GrupoRed = reader.GetString(reader.GetOrdinal("GrupoRed")),
                                Producto = reader.GetString(reader.GetOrdinal("Producto")),
                                Nombre = reader.GetString(reader.GetOrdinal("Persona")),
                                Tribu = reader.GetString(reader.GetOrdinal("Tribu"))

                            });
                        }

                    }

                    cnx.Close();

                    return lista;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<FuncionDTO> GetFuncionPersonaExportar2AdminSquad(PaginationApplication filter)
        {
            try
            {
                DataSet resultado = null;
                var cadenaConexion = Constantes.CadenaConexion;


                List<FuncionDTO> lista = new List<FuncionDTO>();

                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("cvt.Listar_Funciones_Personas_Exportar2AdminSquad", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        //comando.Parameters.Add(new SqlParameter("@Chapter", filter.Chapter));
                        comando.Parameters.Add(new SqlParameter("@Funcion", filter.Funcion));
                        comando.Parameters.Add(new SqlParameter("@Tribu", filter.Tribu));
                        comando.Parameters.Add(new SqlParameter("@GrupoRed", filter.GrupoRed));
                        comando.Parameters.Add(new SqlParameter("@Rol", filter.Rol));
                        comando.Parameters.Add(new SqlParameter("@Producto", filter.Producto));
                        comando.Parameters.Add(new SqlParameter("@Dominio", filter.Dominio));
                        comando.Parameters.Add(new SqlParameter("@SubDominio", filter.SubDominio));



                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            lista.Add(new FuncionDTO()
                            {
                                Squad = reader.GetString(reader.GetOrdinal("Squad")),
                                Funcion = reader.GetString(reader.GetOrdinal("Funcion")),
                                Rol = reader.GetString(reader.GetOrdinal("Rol")),
                                GrupoRed = reader.GetString(reader.GetOrdinal("GrupoRed")),
                                Producto = reader.GetString(reader.GetOrdinal("Producto")),
                                Nombre = reader.GetString(reader.GetOrdinal("Persona")),
                                Tribu = reader.GetString(reader.GetOrdinal("Tribu")),
                                Chapter = reader.GetString(reader.GetOrdinal("Chapter"))

                            });
                        }

                    }

                    cnx.Close();

                    return lista;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationFlowByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }



        public override List<FuncionDTO> GetDetalleFuncionesProductosRoles(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.ChapterFuncionesRoles
                                         join a in ctx.RolesProducto on u.RolesProductoId equals a.RolesProductoId
                                         join b in ctx.Producto on a.ProductoId equals b.ProductoId
                                         where u.RolesProductoId == pag.ProductoId && u.FlagActivo == true && u.FlagEliminado == false
                                         select new FuncionDTO()
                                         {
                                             Id = u.FuncionProductoId,
                                             Chapter = u.Chapter,
                                             Funcion = u.Funcion,
                                             Producto = b.Nombre


                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }
        public override List<RolesProductoDTO> GetFuncionProductoRolesDetalle(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.ChapterFuncionesRoles
                                         join a in ctx.RolesProducto on u.RolesProductoId equals a.RolesProductoId
                                         join b in ctx.Producto on a.ProductoId equals b.ProductoId
                                         where u.Chapter.ToUpper().Contains( pag.Chapter) && u.Funcion.ToUpper().Contains( pag.Funcion) && u.FlagActivo == true && u.FlagEliminado == false && a.FlagEliminado == false && a.FlagActivo == true
                                         select new RolesProductoDTO()
                                         {
                                             Id = u.FuncionProductoId,
                                             ProductoNombre = b.Nombre,
                                             Rol = a.Rol,
                                             GrupoRed = a.GrupoRed

                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override List<BitacoraDto> GetBitacora(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.BitacoraAcciones
                                         join u2 in ctx.Application on u.CodigoAPT equals u2.applicationId
                                         join u3 in ctx.TipoActivoInformacion on u2.assetType equals u3.TipoActivoInformacionId
                                         where (u.CodigoAPT.ToUpper().Contains(pag.CodigoApt.ToUpper())
                                         || string.IsNullOrEmpty(pag.CodigoApt))
                                         select new BitacoraDto()
                                         {
                                             CodigoAPT = u.CodigoAPT,
                                             NombreAplicacion = u2.applicationName,
                                             TipoActivoName = u3.Nombre,
                                             UsuarioCreacion = u.NombreUsuarioCreacion,
                                             DetalleBitacora = u.DetalleBitacora,
                                             FechaCreacion = u.FechaCreacion
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder);



                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<BitacoraDto> GetBitacoraDetail(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.BitacoraAcciones
                                         where (u.CodigoAPT.ToUpper().Contains(pag.CodigoApt.ToUpper())
                                         || string.IsNullOrEmpty(pag.CodigoApt))
                                         orderby u.FechaCreacion descending
                                         select new BitacoraDto()
                                         {
                                             Id = u.BitacoraId,
                                             UsuarioCreacion = u.CreadoPor,
                                             FechaCreacion = u.FechaCreacion,
                                             CodigoAPT = u.CodigoAPT,
                                             DetalleBitacora = u.DetalleBitacora,
                                             NombreUsuarioCreacion = u.NombreUsuarioCreacion
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<BitacoraDto> GetBitacoraDetalle(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.BitacoraAcciones
                                         where u.CodigoAPT == pag.CodigoApt
                                         select new BitacoraDto()
                                         {
                                             DetalleBitacora = u.DetalleBitacora,
                                             NombreUsuarioCreacion = u.NombreUsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             Id = u.BitacoraId,
                                             NombreArchivo = u.NombreArchivo
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        private string GetCambiosAplicacion(AplicacionDTO final, AplicacionDTO origen)
        {
            var oType = origen.GetType();
            var retorno = string.Empty;
            var formato = "Campo {0} tenía el valor: {1}, fue reemplazado por el valor {2} <br/>";
            foreach (var oProperty in oType.GetProperties())
            {
                if (oProperty.Name != "AplicacionDetalle")
                {
                    var oOldValue = oProperty.GetValue(origen, null);
                    var oNewValue = oProperty.GetValue(final, null);
                    // this will handle the scenario where either value is null
                    if (!object.Equals(oOldValue, oNewValue))
                    {
                        // Handle the display values when the underlying value is null
                        var sOldValue = oOldValue == null ? "null" : oOldValue.ToString();
                        var sNewValue = oNewValue == null ? "null" : oNewValue.ToString();

                        retorno = retorno + string.Format(formato, oProperty.Name, sOldValue, sNewValue);
                    }
                }
                else
                {
                    retorno = GetCambiosAplicacionDetalle(final.AplicacionDetalle, origen.AplicacionDetalle);
                }
            }

            if (string.IsNullOrWhiteSpace(retorno))
                retorno = "No hubo modificación de campos";


            return retorno;
        }

        private string GetCambiosAplicacionDetalle(AplicacionDetalleDTO final, AplicacionDetalleDTO origen)
        {
            var oType = origen.GetType();
            var retorno = string.Empty;
            var formato = "Campo {0} tenía el valor: {1}, fue reemplazado por el valor {2} <br/>";
            if (final != null && origen != null)
            {
                foreach (var oProperty in oType.GetProperties())
                {
                    var oOldValue = oProperty.GetValue(origen, null);
                    var oNewValue = oProperty.GetValue(final, null);
                    // this will handle the scenario where either value is null
                    if (!object.Equals(oOldValue, oNewValue))
                    {
                        // Handle the display values when the underlying value is null
                        var sOldValue = oOldValue == null ? "null" : oOldValue.ToString();
                        var sNewValue = oNewValue == null ? "null" : oNewValue.ToString();

                        retorno = retorno + string.Format(formato, oProperty.Name, sOldValue, sNewValue);
                    }
                }
            }

            return retorno;
        }

        public override List<SolicitudDetalleDto> GetSolicitudesDetalle(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.SolicitudCampos
                                         join u2 in ctx.InfoCampoPortafolio on u.ColumnaId equals u2.InfoCampoPortafolioId
                                         where u.SolicitudId == pag.id
                                         select new SolicitudDetalleDto()
                                         {
                                             ColumnaDetalle = u2.Nombre,
                                             Campo = u.ColumnaId.Value,
                                             NuevoValor = u.NuevoValor,
                                             ValorAnterior = u.ValorAnterior,
                                             ColumnaId = u.ColumnaId
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        foreach (var item in resultado)
                        {
                            switch (item.Campo)
                            {
                                case (int)Campos.AreaBIAN:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;

                                    }
                                    break;
                                case (int)Campos.CategoriaTecnologica:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Valor;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Valor;
                                    }
                                    break;
                                case (int)Campos.ClasificacionActivo:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Valor;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Valor;
                                    }
                                    break;
                                case (int)Campos.ClasificacionTecnica:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;
                                    }
                                    break;
                                case (int)Campos.DominioBIAN:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;
                                    }
                                    break;
                                case (int)Campos.EstadoAplicacion:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        item.DetalleActual = Utilitarios.GetEnumDescription2((ApplicationState)id);

                                        id = int.Parse(item.NuevoValor);
                                        item.DetalleNuevo = Utilitarios.GetEnumDescription2((ApplicationState)id);
                                    }
                                    break;
                                case (int)Campos.GestionadoPor:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;
                                    }
                                    break;
                                case (int)Campos.ModeloEntrega:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Valor;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Valor;
                                    }
                                    break;
                                case (int)Campos.NombreEquipo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            int id = int.Parse(item.ValorAnterior);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }
                                        else
                                            item.DetalleActual = string.Empty;

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            int id = int.Parse(item.NuevoValor);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                        else
                                            item.DetalleNuevo = string.Empty;

                                    }
                                    break;
                                case (int)Campos.SubClasificacionTecnica:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;
                                    }
                                    break;
                                case (int)Campos.TipoActivoInformacion:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;
                                    }
                                    break;
                                case (int)Campos.TipoDesarrollo:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Valor;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Valor;
                                    }
                                    break;
                                case (int)Campos.TipoImplementacion:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Valor;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Valor;
                                    }
                                    break;
                                case (int)Campos.TOBE:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;
                                    }
                                    break;
                                case (int)Campos.UnidadUsuaria:
                                    {
                                        int id = int.Parse(item.ValorAnterior);
                                        var area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                        if (area != null)
                                            item.DetalleActual = area.Nombre;

                                        id = int.Parse(item.NuevoValor);
                                        area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                        if (area != null)
                                            item.DetalleNuevo = area.Nombre;
                                    }
                                    break;
                                case (int)Campos.ArchivoAdjuntoSeguridad:
                                    {
                                        int id = item.ValorAnterior == "" ? -1 : int.Parse(item.ValorAnterior);
                                        var archivo = ctx.ApplicationFile.FirstOrDefault(x => x.IdApplicationFile == id);
                                        if (archivo != null)
                                            item.DetalleActual = archivo.Nombre;

                                        id = item.NuevoValor == "" ? -1 : int.Parse(item.NuevoValor);
                                        archivo = ctx.ApplicationFile.FirstOrDefault(x => x.IdApplicationFile == id);
                                        if (archivo != null)
                                            item.DetalleNuevo = archivo.Nombre;

                                    }
                                    break;
                                default:
                                    {
                                        item.DetalleActual = item.ValorAnterior;
                                        item.DetalleNuevo = item.NuevoValor;
                                    }
                                    break;
                            }
                        }

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override void RechazarSolicitud(int solicitud, string comentarios, string usuario, string NombreUsuarioAprobacion)
        {
            var Aplicacion = new Application();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    ctx.Database.CommandTimeout = 0;

                    var solicitudObj = ctx.Solicitud.FirstOrDefault(x => x.SolicitudAplicacionId == solicitud);
                    if (solicitudObj != null)
                    {
                        solicitudObj.EstadoSolicitud = (int)EstadoSolicitud.Rechazada;
                        solicitudObj.FechaModificacion = DateTime.Now;
                        solicitudObj.UsuarioModificacion = usuario;
                        solicitudObj.Observaciones = comentarios;
                        solicitudObj.NombreUsuarioAprobacion = NombreUsuarioAprobacion;
                        solicitudObj.NombreUsuarioModificacion = NombreUsuarioAprobacion;

                        ctx.SaveChanges();

                        EnviarCorreoRechazo(solicitudObj.AplicacionId, solicitud, comentarios);

                        //Agregar registro en bitácora
                        try
                        {

                            Aplicacion = ctx.Application.FirstOrDefault(x => x.AppId == solicitudObj.AplicacionId);
                            var BitacoraMensaje = "";
                            var dateAndTime = DateTime.Now;
                            string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                            var hour = dateAndTime.ToString("HH:mm:ss");
                            BitacoraMensaje = "" + NombreUsuarioAprobacion + "" + "(" + usuario + ")" + " " +
                                "rechazó la solicitud de modificación para la aplicación " + "" + Aplicacion.applicationId + "" + " - " + "" + Aplicacion.applicationName + " "
                                + "por el siguiente motivo: " + comentarios;

                            var campos = ctx.SolicitudCampos.Where(x => x.SolicitudId == solicitudObj.SolicitudAplicacionId).ToList();
                            if (campos != null)
                            {
                                if (campos.Count > 0)
                                {
                                    BitacoraMensaje = BitacoraMensaje + ". Los campos que se han rechazado son los siguientes: ";
                                    foreach (var item in campos)
                                    {
                                        switch (item.ColumnaId)
                                        {
                                            case (int)Campos.NombreAplicacion:
                                                BitacoraMensaje += " , Nombre de aplicación con el valor: " + item.NuevoValor;
                                                break;
                                            case (int)Campos.Descripcion:
                                                BitacoraMensaje += " , Descripción con el valor: " + item.NuevoValor;
                                                break;
                                            case (int)Campos.TipoImplementacion:
                                                BitacoraMensaje += " , Tipo de implementación con el valor: " + getImplementationTypeName(int.Parse(item.NuevoValor));
                                                break;
                                            case (int)Campos.CódigoAPTPadre:
                                                BitacoraMensaje += " , Código APT Padre con el valor: " + item.NuevoValor;
                                                break;
                                            case (int)Campos.CodigoInterfaz:
                                                BitacoraMensaje += " , Código de interfaz con el valor: " + item.NuevoValor;
                                                break;
                                            case (int)Campos.ResumenEstandares:
                                                BitacoraMensaje += " , Resumen de lineamientos de seguridad con el valor: " + item.NuevoValor;
                                                break;
                                            case (int)Campos.NivelCumplimientoSeguridad:
                                                BitacoraMensaje += " , Nivel de cumplimiento de seguridad con el valor: " + decimal.Parse(item.NuevoValor);
                                                break;
                                            case (int)Campos.EstadoAplicacion:
                                                BitacoraMensaje += " , Estado de la aplicación con el valor: " + getStatusName(int.Parse(item.NuevoValor));
                                                break;
                                            case (int)Campos.GestionadoPor:
                                                BitacoraMensaje += " , Gestionado por con el valor: " + getManagedName(int.Parse(item.NuevoValor));
                                                break;
                                            case (int)Campos.NombreEquipo:
                                                {
                                                    if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                                    {
                                                        BitacoraMensaje += " , Equipo/Squad con el valor: " + getTeamName(int.Parse(item.NuevoValor));
                                                    }
                                                }
                                                break;
                                        }
                                    }
                                }
                            }

                            BitacoraMensaje = BitacoraMensaje + " , el día " + "" + date + "" + " a las " + "" + hour + "";

                            var registroBitacora = new BitacoraAcciones()
                            {
                                CodigoAPT = Aplicacion.applicationId,
                                DetalleBitacora = BitacoraMensaje,
                                CreadoPor = usuario,
                                FechaCreacion = dateAndTime,
                                NombreUsuarioCreacion = NombreUsuarioAprobacion
                            };

                            ctx.BitacoraAcciones.Add(registroBitacora);

                            ctx.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> RechazarSolicitud(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> RechazarSolicitud(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override void AprobarSolicitud(int solicitud, string usuario, string NombreUsuarioAprobacion)
        {
            var idApp = "";
            var Aplicacion = new Application();
            var listaCampos = string.Empty;
            var requiereReinicio = false;
            var aplicacionId = 0;

            int AppId = 0;

            string cambios = "";

            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    ctx.Database.CommandTimeout = 0;

                    var solicitudObj = ctx.Solicitud.FirstOrDefault(x => x.SolicitudAplicacionId == solicitud);
                    if (solicitudObj != null)
                    {
                        solicitudObj.EstadoSolicitud = (int)EstadoSolicitud.Aprobada;
                        solicitudObj.FechaModificacion = DateTime.Now;
                        solicitudObj.UsuarioModificacion = usuario;
                        solicitudObj.NombreUsuarioAprobacion = NombreUsuarioAprobacion;
                        solicitudObj.NombreUsuarioModificacion = NombreUsuarioAprobacion;
                        solicitudObj.FechaAprobacion = DateTime.Now;

                        var campos = ctx.SolicitudCampos.Where(x => x.SolicitudId == solicitudObj.SolicitudAplicacionId).ToList();
                        if (campos != null)
                        {
                            if (campos.Count > 0)
                            {
                                var appId = campos[0].ApplicationId;
                                idApp = appId;
                                var app = ctx.Application.FirstOrDefault(x => x.applicationId == appId);
                                AppId = app.AppId;
                                var archivo = ctx.ApplicationFile.FirstOrDefault(x => x.ApplicationId == AppId && x.FileType == (int)FileType.ArchivoSeguridad);
                                var archivoNuevo = ctx.ApplicationFile.FirstOrDefault(x => x.FileType == (int)FileType.ArchivoSeguridadTemporal && x.SolicitudId == solicitudObj.SolicitudAplicacionId);
                                if (app != null)
                                {
                                    aplicacionId = app.AppId;

                                    foreach (var item in campos)
                                    {
                                        switch (item.ColumnaId)
                                        {
                                            case (int)Campos.NombreAplicacion:
                                                cambios += " , Nombre de Aplicación de: " + app.applicationName + " a: " + item.NuevoValor;
                                                app.applicationName = item.NuevoValor;
                                                listaCampos = listaCampos + "- Nombre de la aplicación <br/>";
                                                break;
                                            case (int)Campos.Descripcion:
                                                cambios += " , Descripción de: " + app.description + " a: " + item.NuevoValor;
                                                app.description = item.NuevoValor;
                                                listaCampos = listaCampos + "- Descripción <br/>";
                                                break;
                                            case (int)Campos.TipoImplementacion:
                                                cambios += " , Tipo de implementación de: " + getImplementationTypeName(app.implementationType) + " a: " + getImplementationTypeName(int.Parse(item.NuevoValor));
                                                app.implementationType = int.Parse(item.NuevoValor);
                                                listaCampos = listaCampos + "- Tipo de implementación <br/>";
                                                break;
                                            case (int)Campos.CódigoAPTPadre:
                                                cambios += " , Código APT Padre de: " + app.parentAPTCode + " a: " + item.NuevoValor;
                                                app.parentAPTCode = item.NuevoValor;
                                                listaCampos = listaCampos + "- Código APT Padre <br/>";
                                                break;
                                            case (int)Campos.CodigoInterfaz:
                                                cambios += " , Código de interfaz de: " + app.interfaceId + " a: " + item.NuevoValor;
                                                app.interfaceId = item.NuevoValor;
                                                app.hasInterfaceId = true;
                                                listaCampos = listaCampos + "- Código de interfaz <br/>";
                                                break;
                                            case (int)Campos.ResumenEstandares:
                                                cambios += " , Resumen de lineamientos de seguridad de: " + app.summaryStandard + " a: " + item.NuevoValor;
                                                app.summaryStandard = item.NuevoValor;
                                                listaCampos = listaCampos + "- Resumen de lineamientos de seguridad <br/>";
                                                break;
                                            case (int)Campos.NivelCumplimientoSeguridad:
                                                cambios += " , Nivel de cumplimiento de seguridad: " + app.complianceLevel + " a: " + decimal.Parse(item.NuevoValor);
                                                app.complianceLevel = decimal.Parse(item.NuevoValor);
                                                listaCampos = listaCampos + "- Nivel de cumplimiento de seguridad <br/>";
                                                break;
                                            case (int)Campos.EstadoAplicacion:
                                                cambios += " , Estado de la aplicación de: " + getStatusName(app.status) + " a: " + getStatusName(int.Parse(item.NuevoValor));
                                                app.status = int.Parse(item.NuevoValor);
                                                listaCampos = listaCampos + "- Estado de la aplicación <br/>";

                                                if (item.ValorAnterior != "")
                                                {
                                                    if (int.Parse(item.ValorAnterior) == (int)ApplicationState.NoVigente)
                                                        requiereReinicio = true;
                                                }
                                                break;
                                            case (int)Campos.GestionadoPor:
                                                cambios += " , Gestionado por de: " + getManagedName(app.managed) + " a: " + getManagedName(int.Parse(item.NuevoValor));
                                                app.managed = int.Parse(item.NuevoValor);
                                                listaCampos = listaCampos + "- Gestionado por <br/>";
                                                break;
                                            case (int)Campos.NombreEquipo:
                                                {
                                                    if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                                    {
                                                        cambios += " , Equipo/Squad de: " + getTeamName(app.teamId) + " a: " + getTeamName(int.Parse(item.NuevoValor));
                                                        app.teamId = int.Parse(item.NuevoValor);
                                                    }
                                                    else
                                                        app.teamId = null;
                                                    listaCampos = listaCampos + "- Equipo/Squad <br/>";
                                                }
                                                break;
                                            case (int)Campos.ArchivoAdjuntoSeguridad:
                                                if (archivo != null)
                                                    cambios += " , Archivo adjunto de seguridad de: " + archivo.Nombre + " a: " + archivoNuevo.Nombre;
                                                else
                                                    cambios += " , Archivo adjunto de seguridad de: Ninguno seleccionado a: " + archivoNuevo.Nombre;

                                                if (archivo != null)
                                                {
                                                    archivo.Nombre = archivoNuevo.Nombre;
                                                    archivo.ArchivoAsociado = archivoNuevo.ArchivoAsociado;
                                                }
                                                else
                                                {
                                                    var archivoNuevoSeguridad = new ApplicationFile()
                                                    {
                                                        ApplicationId = AppId,
                                                        ArchivoAsociado = archivoNuevo.ArchivoAsociado,
                                                        FileType = (int)FileType.ArchivoSeguridad,
                                                        Nombre = archivoNuevo.Nombre,
                                                        SolicitudId = solicitud
                                                    };
                                                    ctx.ApplicationFile.Add(archivoNuevoSeguridad);
                                                    //var archivo = ctx.ApplicationFile.FirstOrDefault(x => x.ApplicationId == AppId && x.FileType == (int)FileType.ArchivoSeguridad);
                                                }


                                                listaCampos = listaCampos + "- Archivo adjunto de seguridad <br/>";
                                                break;
                                        }
                                    }

                                    var gestionadoDestino = ServiceManager<ActivosDAO>.Provider.GetGestionadoPorById(app.managed.Value);

                                    var flagTTL = gestionadoDestino.FlagEquipoAgil.HasValue ? gestionadoDestino.FlagEquipoAgil.Value : false;
                                    var flagJdE = gestionadoDestino.FlagJefeEquipo.HasValue ? gestionadoDestino.FlagJefeEquipo.Value : false;
                                    //var flagUserIT = gestionadoDestino.FlagUserIT.HasValue ? gestionadoDestino.FlagUserIT.Value : false;
                                    var rol = 0;
                                    if (flagTTL)
                                        rol = (int)ApplicationManagerRole.TTL;
                                    if (flagJdE)
                                        rol = (int)ApplicationManagerRole.JefeDeEquipo;

                                    //Asignar al nuevo  jefe de equipo, desactivar el rol anterior y agregarlo el nuevo
                                    ////Desactivar el rol anterior
                                    if (rol != 0)
                                    {
                                        var rolJdEAnterior = ctx.ApplicationManagerCatalog.FirstOrDefault(x => x.applicationId == app.applicationId
                                                                && x.isActive == true
                                                                && x.applicationManagerId == (int)ApplicationManagerRole.JefeDeEquipo);
                                        if (rolJdEAnterior != null)
                                        {
                                            rolJdEAnterior.isActive = false;
                                            rolJdEAnterior.dateModification = DateTime.Now;
                                        }

                                        var rolTTLAnterior = ctx.ApplicationManagerCatalog.FirstOrDefault(x => x.applicationId == app.applicationId
                                                                && x.isActive == true
                                                                && x.applicationManagerId == (int)ApplicationManagerRole.TTL);
                                        if (rolTTLAnterior != null)
                                        {
                                            rolTTLAnterior.isActive = false;
                                            rolTTLAnterior.dateModification = DateTime.Now;
                                        }


                                        var equipo = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == app.teamId);
                                        if (equipo != null)
                                        {
                                            var rolNuevo = new ApplicationManagerCatalog()
                                            {
                                                applicationId = app.applicationId,
                                                applicationManagerId = rol,
                                                createdBy = usuario,
                                                dateCreation = DateTime.Now,
                                                email = equipo.ResponsableCorreo,
                                                isActive = true,
                                                managerName = equipo.Responsable,
                                                username = equipo.ResponsableMatricula
                                            };
                                            ctx.ApplicationManagerCatalog.Add(rolNuevo);
                                        }
                                    }

                                    //if (flagUserIT)
                                    //{
                                    //    var tipoActivoUserIT = ServiceManager<ActivosDAO>.Provider.GetActivosByUserIT();
                                    //    if (tipoActivoUserIT != null)
                                    //    {
                                    //        app.assetType = tipoActivoUserIT.Id;
                                    //        app.teamId = null;
                                    //    }
                                    //}
                                }
                            }
                        }

                        ctx.SaveChanges();

                        //try
                        //{
                        Aplicacion = ctx.Application.FirstOrDefault(x => x.AppId == solicitudObj.AplicacionId);
                        //    var mailManager = new MailingManager();
                        //    var diccionario = new Dictionary<string, string>();
                        //    diccionario.Add("[CodigoAPT]", Aplicacion.applicationId);
                        //    diccionario.Add("[NombreAplicacion]", Aplicacion.applicationName);
                        //    diccionario.Add("[Campos]", listaCampos);

                        //    mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.ActualizacionAprobacionSolicitudModificacionPortafolio, Aplicacion.applicationId, diccionario);
                        //}
                        //catch (Exception ex)
                        //{
                        //    log.Error(ex.Message, ex);
                        //}

                        EnviarCorreoConfirmacion(solicitudObj.AplicacionId, solicitudObj.SolicitudAplicacionId);

                        if (requiereReinicio)
                            ReiniciarRegistroAplicacion(aplicacionId, usuario);

                        //Agregar registro en bitácora
                        try
                        {
                            var archivoBit = ctx.ApplicationFile.FirstOrDefault(x => x.ApplicationId == AppId && x.FileType == (int)FileType.ArchivoSeguridad);
                            var BitacoraMensaje = "";
                            var dateAndTime = DateTime.Now;
                            string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                            var hour = dateAndTime.ToString("HH:mm:ss");
                            BitacoraMensaje = "" + NombreUsuarioAprobacion + "" + "(" + usuario + ")" + " " +
                                "aprobó la solicitud de modificación para la aplicación " + "" + Aplicacion.applicationId + "" + " - " + "" + Aplicacion.applicationName + " con los siguientes cambios: " + cambios;

                            BitacoraMensaje = BitacoraMensaje + " el día " + "" + date + "" + " a las " + "" + hour + "";

                            var registroBitacora = new BitacoraAcciones()
                            {
                                CodigoAPT = Aplicacion.applicationId,
                                DetalleBitacora = BitacoraMensaje,
                                CreadoPor = usuario,
                                FechaCreacion = dateAndTime,
                                NombreUsuarioCreacion = NombreUsuarioAprobacion,
                                Archivo = (archivoBit != null ? archivoBit.ArchivoAsociado : null),
                                NombreArchivo = archivoBit != null ? ((archivoBit.Nombre != null ? archivoBit.Nombre : null)) : null
                            };

                            ctx.BitacoraAcciones.Add(registroBitacora);

                            ctx.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }
                        this.SincronizarConCVT(Aplicacion.applicationId);
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> RechazarSolicitud(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> RechazarSolicitud(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        private void SincronizarConCVT(string codigoAPT)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[app].[USP_SincronizarAplicacion]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@codigoAPT", codigoAPT));
                        comando.ExecuteNonQuery();
                    }
                    cnx.Close();
                }
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
            }
        }

        public string getTeamName(int? id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    if (id != null && Convert.ToInt32(id) != 0)
                    {
                        var registro = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                        return registro.Nombre;
                    }
                    else return "Ninguno seleccionado";
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
        }

        public string getManagedName(int? id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    if (id != null && Convert.ToInt32(id) != 0)
                    {
                        var registro = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                        return registro.Nombre;
                    }
                    else return "Ninguno seleccionado";
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
        }

        public string getStatusName(int? id)
        {

            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    if (id != null)
                    {
                        string registro = Utilitarios.GetEnumDescription2((ApplicationState)id);
                        return registro;
                    }
                    else return "Ninguno";

                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
        }

        public string getImplementationTypeName(int? id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var registro = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                    return registro.Valor;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<InfoCampoPortafolioToolbox> GetAppToolbox()"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDetalleDto> GetSolicitudesDetalleData(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.ApplicationFlowData
                                         join u2 in ctx.InfoCampoPortafolio on u.fieldId equals u2.InfoCampoPortafolioId
                                         where u.FlowAppId == pag.id
                                         select new SolicitudDetalleDto()
                                         {
                                             ColumnaDetalle = u2.Nombre,
                                             Campo = u.fieldId.Value,
                                             NuevoValor = u.newValue,
                                             ValorAnterior = u.currentValue,
                                             TipoRegistro = u.typeFlow.HasValue ? u.typeFlow.Value : 0
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();
                        int id = 0;

                        foreach (var item in resultado)
                        {
                            switch (item.Campo)
                            {
                                case (int)Campos.AreaBIAN:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                    }
                                    break;
                                case (int)Campos.CategoriaTecnologica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }
                                    }
                                    break;
                                case (int)Campos.ClasificacionActivo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }
                                    }
                                    break;
                                case (int)Campos.ClasificacionTecnica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                    }
                                    break;
                                case (int)Campos.DominioBIAN:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                    }
                                    break;
                                case (int)Campos.EstadoAplicacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            item.DetalleActual = Utilitarios.GetEnumDescription2((ApplicationState)id);
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            item.DetalleNuevo = Utilitarios.GetEnumDescription2((ApplicationState)id);
                                        }
                                    }
                                    break;
                                case (int)Campos.GestionadoPor:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                    }
                                    break;
                                case (int)Campos.ModeloEntrega:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }
                                    }
                                    break;
                                case (int)Campos.NombreEquipo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                    }
                                    break;
                                case (int)Campos.SubClasificacionTecnica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                    }
                                    break;
                                case (int)Campos.TipoActivoInformacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                    }
                                    break;
                                case (int)Campos.TipoDesarrollo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }
                                    }
                                    break;
                                case (int)Campos.TipoImplementacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }
                                    }
                                    break;
                                case (int)Campos.TOBE:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                    }
                                    break;
                                case (int)Campos.UnidadUsuaria:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                    }
                                    break;
                                default:
                                    {
                                        item.DetalleActual = item.ValorAnterior;
                                        item.DetalleNuevo = item.NuevoValor;
                                    }
                                    break;
                            }
                        }

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDetalleDto> GetSolicitudesDetalleEliminacion(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;
                var resultado = new List<SolicitudDetalleDto>();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;
                        var registro = ctx.SolicitudArchivos.FirstOrDefault(x => x.IdSolicitud == pag.id);
                        if (resultado != null)
                        {
                            resultado.Add(new SolicitudDetalleDto()
                            {
                                ConformidadGST = (registro.ConformidadGST != null ? 1 : 0),
                                TicketEliminacion = (registro.TicketEliminacion != null ? 2 : 0),
                                Ratificacion = (registro.Ratificacion != null ? 3 : 0),
                                SolicitudId = registro.IdSolicitud.Value,
                                NombreConformidadGST = registro.NombreConformidadGST,
                                NombreRatificacion = registro.NombreRatificacion,
                                NombreTicketEliminacion = registro.NombreTicketEliminacion

                            });

                        }

                        foreach (SolicitudDetalleDto a in resultado)
                        {
                            var solicitud = ctx.Solicitud.FirstOrDefault(x => x.SolicitudAplicacionId == a.SolicitudId);
                            a.Observaciones = solicitud.Observaciones;
                        }

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override SolicitudDto GetContenidoFileSolicitudEliminacionById(int Id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.SolicitudArchivos
                                   where u.IdSolicitud == Id
                                   select new SolicitudDto()
                                   {
                                       Id = u.IdSolicitud.Value,
                                       ConformidadGSTFile = u.ConformidadGST,
                                       RatificacionFile = u.Ratificacion,
                                       TicketEliminacionFile = u.TicketEliminacion,
                                       NombreConformidadGST = u.NombreConformidadGST,
                                       NombreRatificacion = u.NombreRatificacion,
                                       NombreTicketEliminacion = u.NombreTicketEliminacion
                                   }).FirstOrDefault();

                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDto> GetSolicitudes2Exportar(PaginacionSolicitud pag, out int totalRows)
        {
            var idsAutorizados = new List<int>() {
                (int)ApplicationManagerRole.Broker,
                (int)ApplicationManagerRole.Experto,
                (int)ApplicationManagerRole.JefeDeEquipo,
                (int)ApplicationManagerRole.Owner,
                (int)ApplicationManagerRole.TL,
                (int)ApplicationManagerRole.TTL,
                (int)ApplicationManagerRole.UsuarioAutorizador
            };
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.Solicitud
                                         join u2 in ctx.Application on u.AplicacionId equals u2.AppId
                                         join u3 in ctx.TipoActivoInformacion on u2.assetType equals u3.TipoActivoInformacionId
                                         join u4 in ctx.ApplicationManagerCatalog on u2.applicationId equals u4.applicationId
                                         where u4.username == pag.Matricula &&
                                         (u2.applicationId.ToUpper().Contains(pag.CodigoApt.ToUpper()) || string.IsNullOrEmpty(pag.CodigoApt)) &&
                                         u.TipoSolicitud == (int)TipoSolicitud.Modificacion &&
                                         u.EstadoSolicitud == (pag.EstadoSolicitudUnico == -1 ? u.EstadoSolicitud : pag.EstadoSolicitudUnico) &&
                                         idsAutorizados.Contains(u4.applicationManagerId)
                                         orderby u.FechaCreacion descending
                                         select new SolicitudDto()
                                         {
                                             Id = u.SolicitudAplicacionId,
                                             CodigoAplicacion = u2.applicationId,
                                             NombreAplicacion = u2.applicationName,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             AplicacionId = u.AplicacionId,
                                             EstadoSolicitud = u.EstadoSolicitud,
                                             FlagAprobacion = u.FlagAprobacion,
                                             TipoSolicitud = u.TipoSolicitud,
                                             TipoActivoInformacion = u3.Nombre,
                                             Observaciones = u.Observaciones,
                                             NombreUsuarioAprobacion = u.NombreUsuarioAprobacion,
                                             NombreUsuarioModificacion = u.NombreUsuarioModificacion,

                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();

                        List<SolicitudDto> resultado = registros.GroupBy(p => new
                        {
                            p.Id,
                            p.CodigoAplicacion,
                            p.NombreAplicacion,
                            p.UsuarioCreacion,
                            p.FechaCreacion,
                            p.FechaModificacion,
                            p.UsuarioModificacion,
                            p.AplicacionId,
                            p.EstadoSolicitud,
                            p.FlagAprobacion,
                            p.TipoSolicitud,
                            p.TipoActivoInformacion,
                            p.Observaciones,
                            p.NombreUsuarioAprobacion
                        })
                                                                  .Select(g => g.First())
                                                                  .ToList();
                        totalRows = resultado.Count();

                        var resultadoFinal = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();
                        return resultadoFinal;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDto> GetSolicitudes3Exportar(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.Solicitud
                                         join u2 in ctx.Application on u.AplicacionId equals u2.AppId

                                         join u3 in ctx.ApplicationManagerCatalog on u2.applicationId equals u3.applicationId
                                         join t in ctx.ApplicationFlow on u.AplicacionId equals t.AppId into z
                                         from t in z.DefaultIfEmpty()
                                         where
                                         u3.username == pag.Matricula &&
                                         (u2.applicationId.ToUpper().Contains(pag.CodigoApt.ToUpper()) || string.IsNullOrEmpty(pag.CodigoApt)) &&
                                         u.EstadoSolicitud == (pag.EstadoSolicitudUnico == -1 ? u.EstadoSolicitud : pag.EstadoSolicitudUnico) &&
                                         u.TipoSolicitud == (int)TipoSolicitud.Eliminacion
                                         orderby u.FechaCreacion descending
                                         select new SolicitudDto()
                                         {
                                             Id = u.SolicitudAplicacionId,
                                             CodigoAplicacion = u2.applicationId,
                                             NombreAplicacion = u2.applicationName,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             AplicacionId = u.AplicacionId,
                                             EstadoSolicitud = u.EstadoSolicitud,
                                             FlagAprobacion = u.FlagAprobacion,
                                             TipoSolicitud = u.TipoSolicitud,
                                             //TipoActivoInformacion = u3.Nombre,
                                             Observaciones = u.Observaciones,
                                             NombreUsuarioAprobacion = u.NombreUsuarioAprobacion,
                                             NombreUsuarioModificacion = u.NombreUsuarioModificacion,
                                             assetType = u2.assetType,
                                             dateApproved = t.dateApproved,
                                             dateRejected = t.dateRejected,
                                             dateTransfer = t.dateTransfer

                                         }).OrderBy(pag.sortName + " " + pag.sortOrder).ToList();

                        totalRows = registros.Count();

                        foreach (SolicitudDto a in registros)
                        {
                            var item = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == a.assetType);
                            if (item != null) { a.TipoActivoInformacion = item.Nombre; }
                        }

                        List<SolicitudDto> resultado = registros
  .GroupBy(p => new
  {
      p.Id,
      p.CodigoAplicacion,
      p.NombreAplicacion,
      p.UsuarioCreacion,
      p.FechaCreacion,
      p.FechaModificacion,
      p.UsuarioModificacion,
      p.AplicacionId,
      p.EstadoSolicitud,
      p.FlagAprobacion,
      p.TipoSolicitud,
      p.TipoActivoInformacion,
      p.Observaciones,
      p.NombreUsuarioAprobacion
  })
  .Select(g => g.First())
  .ToList();
                        totalRows = resultado.Count();

                        var resultadoFinal = resultado.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();
                        return resultadoFinal;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes3Exportar(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudes3Exportar(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        private void ReiniciarRegistroAplicacion(int id, string matricula)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = ctx.Application.FirstOrDefault(x => x.AppId == id);
                    if (entidad != null)
                    {
                        var gestionadoPor = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == entidad.managed);
                        entidad.registrationSituation = (int)ApplicationSituationRegister.RegistroParcial;
                        entidad.isApproved = false;
                        entidad.dateApproved = null;
                        entidad.approvedBy = string.Empty;
                        entidad.approvedByEmail = string.Empty;
                        entidad.aplicacionRevertida = true;
                        entidad.tierPreProduction = null;
                        entidad.tierProduction = null;
                        entidad.hasInterfaceId = null;
                        entidad.interfaceId = null;
                        entidad.deploymentType = null;
                        entidad.deploymentTypeOriginal = null;

                        //Desactivar los flujos existentes y los roles (salvo el solicitante que se actualiza con el usuario actual)
                        ctx.Database.ExecuteSqlCommand(string.Format("update app.ApplicationFlow set isActive=0 where AppId={0}", id));

                        ctx.SaveChanges();

                        //Enviar Correos
                        try
                        {
                            var mailManager = new MailingManager();
                            var diccionario = new Dictionary<string, string>();
                            diccionario.Add("[CodigoAPT]", entidad.applicationId);
                            diccionario.Add("[NombreAplicacion]", entidad.applicationName);
                            diccionario.Add("[EstadoAplicacion]", Utilitarios.GetEnumDescription2((ApplicationState)entidad.status.Value));
                            diccionario.Add("[SituacionRegistro]", Utilitarios.GetEnumDescription2((ApplicationSituationRegister)entidad.registrationSituation.Value));
                            diccionario.Add("[FechaRegistro]", entidad.registerDate.Value.ToString("dd/MM/yyyy"));

                            mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.ReversionAplicacionNoVigente, entidad.applicationId, diccionario);
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }

                        ctx.Database.ExecuteSqlCommand(string.Format("update app.ApplicationManagerCatalog set isActive=0 where applicationManagerId!=9 and applicationId='{0}'", entidad.applicationId));
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        private List<ApplicationManagerCatalogDto> DevolverRolesGestion()
        {
            var usuarios = new List<ApplicationManagerCatalogDto>();

            try
            {
                var azureManger = new AzureGroupsManager();
                var parametroDevSecOps = ServiceManager<ParametroDAO>.Provider.ObtenerParametroApp("GRUPO_DEVSECOPS");
                var usuariosDevSecOps = new AzureGroupsManager().GetGroupMembersByName(parametroDevSecOps.Valor);
                if (usuariosDevSecOps != null)
                {
                    foreach (var item in usuariosDevSecOps)
                    {
                        usuarios.Add(new ApplicationManagerCatalogDto()
                        {
                            applicationManagerId = (int)ApplicationManagerRole.DevSecOps,
                            email = item.mail,
                            username = item.matricula,
                            managerName = string.Empty
                        });
                    }
                }

                var parametroArquitecturaTI = ServiceManager<ParametroDAO>.Provider.ObtenerParametroApp("GRUPO_ARQUITECTURA_TI");
                var usuariosArquitecturaTI = new AzureGroupsManager().GetGroupMembersByName(parametroArquitecturaTI.Valor);
                if (usuariosArquitecturaTI != null)
                {
                    foreach (var item in usuariosArquitecturaTI)
                    {
                        usuarios.Add(new ApplicationManagerCatalogDto()
                        {
                            applicationManagerId = (int)ApplicationManagerRole.ArquitectoTI,
                            email = item.mail,
                            username = item.matricula,
                            managerName = string.Empty
                        });
                    }
                }

                var parametroUsuariosAIO = ServiceManager<ParametroDAO>.Provider.ObtenerParametroApp("GRUPO_AIO");
                var usuariosAIO = new AzureGroupsManager().GetGroupMembersByName(parametroUsuariosAIO.Valor);
                if (usuariosAIO != null)
                {
                    foreach (var item in usuariosAIO)
                    {
                        usuarios.Add(new ApplicationManagerCatalogDto()
                        {
                            applicationManagerId = (int)ApplicationManagerRole.AIO,
                            email = item.mail,
                            username = item.matricula,
                            managerName = string.Empty
                        });
                    }
                }

                var parametroGobierno = ServiceManager<ParametroDAO>.Provider.ObtenerParametroApp("GRUPO_GOBIERNO_USERIT");
                var usuariosGobierno = new AzureGroupsManager().GetGroupMembersByName(parametroGobierno.Valor);
                if (usuariosGobierno != null)
                {
                    foreach (var item in usuariosGobierno)
                    {
                        usuarios.Add(new ApplicationManagerCatalogDto()
                        {
                            applicationManagerId = (int)ApplicationManagerRole.GobiernoUserIT,
                            email = item.mail,
                            username = item.matricula,
                            managerName = string.Empty
                        });
                    }
                }

            }
            catch (Exception)
            {

            }

            var rolesGestion = ServiceManager<ActivosDAO>.Provider.GetRolesGestion();
            var managerid = 0;
            foreach (var user in rolesGestion)
            {
                switch (user.RoleId)
                {
                    case (int)ERoles.AIO:
                        managerid = (int)ApplicationManagerRole.AIO;
                        break;
                    case (int)ERoles.ArquitectoTecnologia:
                        managerid = (int)ApplicationManagerRole.ArquitectoTI;
                        break;
                    case (int)ERoles.DevSecOps:
                        managerid = (int)ApplicationManagerRole.DevSecOps;
                        break;
                    case (int)ERoles.GobiernoUserIT:
                        managerid = (int)ApplicationManagerRole.GobiernoUserIT;
                        break;
                }

                usuarios.Add(new ApplicationManagerCatalogDto()
                {
                    applicationManagerId = managerid,
                    email = user.Email,
                    username = user.Username,
                    managerName = string.Empty
                });
            }

            var tmpUsuarios = (from u in usuarios
                               select new
                               {
                                   u.applicationManagerId,
                                   u.username,
                                   u.email
                               }).Distinct().ToList();
            var usuariosFinales = (from u in tmpUsuarios
                                   select new ApplicationManagerCatalogDto()
                                   {
                                       applicationManagerId = u.applicationManagerId,
                                       email = u.email,
                                       username = u.username
                                   }).ToList();

            return usuariosFinales;
        }

        public override void DesestimarSolicitud(int solicitud, string comentarios, string usuario, string NombreUsuarioAprobacion)
        {
            var Aplicacion = new Application();
            string campos = string.Empty;
            string tipoSolicitud = string.Empty;


            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    ctx.Database.CommandTimeout = 0;

                    var solicitudObj = ctx.Solicitud.FirstOrDefault(x => x.SolicitudAplicacionId == solicitud);
                    if (solicitudObj != null)
                    {
                        solicitudObj.EstadoSolicitud = (int)EstadoSolicitud.Desestimada;
                        solicitudObj.FechaModificacion = DateTime.Now;
                        solicitudObj.UsuarioModificacion = usuario;
                        solicitudObj.Observaciones = comentarios;
                        ctx.SaveChanges();

                        if (solicitudObj.TipoSolicitud == (int)TipoSolicitud.Modificacion)
                            tipoSolicitud = "modificación";
                        else if (solicitudObj.TipoSolicitud == (int)TipoSolicitud.Eliminacion)
                            tipoSolicitud = "eliminación";
                        else if (solicitudObj.TipoSolicitud == (int)TipoSolicitud.RevertirEliminacion)
                        {
                            var objAplicacion = ctx.Application.First(x => x.AppId == solicitudObj.AplicacionId);
                            objAplicacion.FechaReactivacion = null;
                            objAplicacion.EstadoReactivacion = null;
                            objAplicacion.isReactivated = null;

                            tipoSolicitud = "reactivación";
                        }


                        //Inactivar flujos que se hubieran creado
                        var flujos = ctx.ApplicationFlow.Where(x => x.SolicitudAplicacionId == solicitud).ToList();
                        foreach (var item in flujos)
                        {
                            item.isActive = false;
                            item.isCompleted = true;
                            ctx.SaveChanges();
                        }

                        //Campos de la solicitud
                        var solicitudCampos = ctx.SolicitudCampos.Where(x => x.SolicitudId == solicitud).ToList();
                        foreach (var item in solicitudCampos)
                        {
                            campos = campos + "- " + Utilitarios.GetEnumDescription2((Campos)item.ColumnaId) + "<br/>";
                        }

                        try
                        {
                            Aplicacion = ctx.Application.FirstOrDefault(x => x.AppId == solicitudObj.AplicacionId);
                            var mailManager = new MailingManager();
                            var diccionario = new Dictionary<string, string>();
                            diccionario.Add("[CodigoAPT]", Aplicacion.applicationId);
                            diccionario.Add("[NombreAplicacion]", Aplicacion.applicationName);
                            diccionario.Add("[Comentarios]", comentarios);
                            diccionario.Add("[Campos]", campos);
                            diccionario.Add("[Usuario]", NombreUsuarioAprobacion);
                            if (solicitudObj.TipoSolicitud == (int)TipoSolicitud.Modificacion)
                                mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.DesestimacionSolicitante, Aplicacion.applicationId, diccionario);
                            else if (solicitudObj.TipoSolicitud == (int)TipoSolicitud.Eliminacion)
                                mailManager.ProcesarEnvioNotificacionesAdministradores((int)NotificationFlow.DesestimacionEliminacionSolicitante, Aplicacion.applicationId, diccionario, true, true);
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }


                        //Agregar registro en bitácora
                        try
                        {
                            var BitacoraMensaje = "";
                            var dateAndTime = DateTime.Now;
                            string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                            var hour = dateAndTime.ToString("HH:mm:ss");
                            BitacoraMensaje = "" + NombreUsuarioAprobacion + "" + "(" + usuario + ")" + " " +
                                "desestimó la solicitud de " + tipoSolicitud + " para la aplicación " + "" + Aplicacion.applicationId + "" + " - " + "" + Aplicacion.applicationName
                                + ", incluyendo los siguientes comentarios: " + comentarios;

                            BitacoraMensaje = BitacoraMensaje + ", el día " + "" + date + "" + " a las " + "" + hour + "";

                            var registroBitacora = new BitacoraAcciones()
                            {
                                CodigoAPT = Aplicacion.applicationId,
                                DetalleBitacora = BitacoraMensaje,
                                CreadoPor = usuario,
                                FechaCreacion = dateAndTime,
                                NombreUsuarioCreacion = NombreUsuarioAprobacion
                            };

                            ctx.BitacoraAcciones.Add(registroBitacora);

                            ctx.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> RechazarSolicitud(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> RechazarSolicitud(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        private void EnviarCorreoConfirmacion(int id, int solicitud)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = ctx.Application.FirstOrDefault(x => x.AppId == id);
                    if (entidad != null)
                    {
                        var campos = (from u in ctx.Solicitud
                                      join u2 in ctx.SolicitudCampos on u.SolicitudAplicacionId equals u2.SolicitudId
                                      join u3 in ctx.InfoCampoPortafolio on u2.ColumnaId equals u3.InfoCampoPortafolioId
                                      where u.SolicitudAplicacionId == solicitud
                                      select new SolicitudDetalleDto()
                                      {
                                          ColumnaDetalle = u3.Nombre,
                                          Campo = u2.ColumnaId.Value,
                                          NuevoValor = u2.NuevoValor,
                                          ValorAnterior = u2.ValorAnterior,
                                      }).ToList();

                        var rolesDetalle = "<table border='1'><tr><td><strong>Campo</strong></td><td><strong>Valor anterior</strong></td><td><strong>Valor nuevo</strong></td></tr>{0}</table>";
                        var formato = "<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>";
                        var filas = string.Empty;

                        foreach (var item in campos)
                        {
                            switch (item.Campo)
                            {
                                case (int)Campos.AreaBIAN:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.CategoriaTecnologica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.ClasificacionActivo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.ClasificacionTecnica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.DominioBIAN:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.EstadoAplicacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            item.DetalleActual = Utilitarios.GetEnumDescription2((ApplicationState)id);
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            item.DetalleNuevo = Utilitarios.GetEnumDescription2((ApplicationState)id);
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.GestionadoPor:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.ModeloEntrega:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.NombreEquipo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.SubClasificacionTecnica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TipoActivoInformacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TipoDesarrollo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TipoImplementacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TOBE:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.UnidadUsuaria:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                default:
                                    {
                                        item.DetalleActual = item.ValorAnterior;
                                        item.DetalleNuevo = item.NuevoValor;
                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                            }
                        }

                        var tabla = string.Empty;
                        tabla = string.Format(rolesDetalle, filas);

                        //Enviar Correos
                        try
                        {
                            var mailManager = new MailingManager();
                            var diccionario = new Dictionary<string, string>();
                            diccionario.Add("[CodigoAPT]", entidad.applicationId);
                            diccionario.Add("[NombreAplicacion]", entidad.applicationName);
                            diccionario.Add("[Tabla]", tabla);

                            mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.ConformidadActualizacionApp, entidad.applicationId, diccionario, null, true);
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        private void EnviarCorreoRechazo(int id, int solicitud, string comentarios)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = ctx.Application.FirstOrDefault(x => x.AppId == id);
                    if (entidad != null)
                    {
                        var campos = (from u in ctx.Solicitud
                                      join u2 in ctx.SolicitudCampos on u.SolicitudAplicacionId equals u2.SolicitudId
                                      join u3 in ctx.InfoCampoPortafolio on u2.ColumnaId equals u3.InfoCampoPortafolioId
                                      where u.SolicitudAplicacionId == solicitud
                                      select new SolicitudDetalleDto()
                                      {
                                          ColumnaDetalle = u3.Nombre,
                                          Campo = u2.ColumnaId.Value,
                                          NuevoValor = u2.NuevoValor,
                                          ValorAnterior = u2.ValorAnterior,
                                      }).ToList();

                        var rolesDetalle = "<table border='1'><tr><td><strong>Campo</strong></td><td><strong>Valor anterior</strong></td><td><strong>Valor nuevo</strong></td></tr>{0}</table>";
                        var formato = "<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>";
                        var filas = string.Empty;

                        foreach (var item in campos)
                        {
                            switch (item.Campo)
                            {
                                case (int)Campos.AreaBIAN:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.AreaBian.FirstOrDefault(x => x.AreaBianId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.CategoriaTecnologica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.ClasificacionActivo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.ClasificacionTecnica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ClasificacionTecnica.FirstOrDefault(x => x.ClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.DominioBIAN:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.DominioBian.FirstOrDefault(x => x.DominioBianId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.EstadoAplicacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            item.DetalleActual = Utilitarios.GetEnumDescription2((ApplicationState)id);
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            item.DetalleNuevo = Utilitarios.GetEnumDescription2((ApplicationState)id);
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.GestionadoPor:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.GestionadoPor.FirstOrDefault(x => x.GestionadoPorId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.ModeloEntrega:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.NombreEquipo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.TeamSquad.FirstOrDefault(x => x.EquipoId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.SubClasificacionTecnica:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.SubClasificacionTecnica.FirstOrDefault(x => x.SubClasificacionTecnicaId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TipoActivoInformacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.TipoActivoInformacion.FirstOrDefault(x => x.TipoActivoInformacionId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TipoDesarrollo:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }
                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TipoImplementacion:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Valor;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.ParametricaDetalle.FirstOrDefault(x => x.ParametricaDetalleId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Valor;
                                        }

                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.TOBE:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.PlataformaBcp.FirstOrDefault(x => x.PlataformaBcpId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                case (int)Campos.UnidadUsuaria:
                                    {
                                        if (!string.IsNullOrWhiteSpace(item.ValorAnterior))
                                        {
                                            id = int.Parse(item.ValorAnterior);
                                            var area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                            if (area != null)
                                                item.DetalleActual = area.Nombre;
                                        }

                                        if (!string.IsNullOrWhiteSpace(item.NuevoValor))
                                        {
                                            id = int.Parse(item.NuevoValor);
                                            var area = ctx.Unidad.FirstOrDefault(x => x.UnidadId == id);
                                            if (area != null)
                                                item.DetalleNuevo = area.Nombre;
                                        }
                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                                default:
                                    {
                                        item.DetalleActual = item.ValorAnterior;
                                        item.DetalleNuevo = item.NuevoValor;
                                        filas = filas + string.Format(formato, item.ColumnaDetalle, item.DetalleActual, item.DetalleNuevo);
                                    }
                                    break;
                            }
                        }

                        var tabla = string.Empty;
                        tabla = string.Format(rolesDetalle, filas);

                        //Enviar Correos
                        try
                        {
                            var mailManager = new MailingManager();
                            var diccionario = new Dictionary<string, string>();
                            diccionario.Add("[CodigoAPT]", entidad.applicationId);
                            diccionario.Add("[NombreAplicacion]", entidad.applicationName);
                            diccionario.Add("[Comentarios]", comentarios);
                            diccionario.Add("[Tabla]", tabla);

                            mailManager.ProcesarEnvioNotificaciones((int)NotificationFlow.ActualizacionRechazoSolicitudModificacionPortafolio, entidad.applicationId, diccionario, null, true);
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorActivosDTO
                    , "Error en el metodo: List<ActivosDTO> GetApplicationByUser(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }


        public override int RegitrarSolicitudReversionEliminacionApplication(SolicitudDto objRegistro)
        {

            try
            {
                var idRegistro = 0;
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var objAplicacion = ctx.Application.First(x => x.AppId == objRegistro.AplicacionId);

                    //objAplicacion.EstadoReactivacion  = (int)EstadoReactivacion.AplicaciónProcesoReactivacion;

                    var solicitudesAnterioresVigentes = ctx.Solicitud.Where(x => x.AplicacionId == objAplicacion.AppId && x.EstadoSolicitud == (int)EstadoSolicitud.Pendiente && x.TipoSolicitud == (int)TipoSolicitud.RevertirEliminacion).Count();

                    if (solicitudesAnterioresVigentes == 0)
                    {
                        var objCreado = ctx.Solicitud.Add(new Solicitud
                        {
                            TipoSolicitud = objRegistro.TipoSolicitud,
                            AplicacionId = objRegistro.AplicacionId,
                            EstadoSolicitud = (int)EstadoSolicitud.Pendiente,
                            Observaciones = objRegistro.Observaciones,
                            VisiblePortafolio = true,
                            NombreUsuarioCreacion = objRegistro.Usuario,
                            MatriculaUsuario = objRegistro.Matricula,
                            EmailSolicitante = objRegistro.Email,
                            UsuarioCreacion = objRegistro.UserName,
                            FechaCreacion = objRegistro.FechaCreacion,
                            EstadoAnterior = objAplicacion.status.ToString()
                        });

                        objAplicacion.FechaReactivacion = DateTime.Now;
                        objAplicacion.isReactivated = true;
                        objAplicacion.EstadoReactivacion = (int)EstadoReactivacion.AplicaciónProcesoReactivacion;

                        ctx.SaveChanges();



                        idRegistro = objCreado.SolicitudAplicacionId;

                        //Agregar Bitácora

                        try
                        {

                            //Agregar registro en bitácora
                            var BitacoraMensaje = "";
                            var dateAndTime = DateTime.Now;
                            string date = dateAndTime.ToString("dd'/'MM'/'yyyy");
                            var hour = dateAndTime.ToString("HH:mm:ss");
                            BitacoraMensaje = "" + objRegistro.Usuario + "" + "(" + objRegistro.Matricula + ")" + " " +
                                "realizó una solicitud de reversión de eliminación de la aplicación " + "" + objAplicacion.applicationId + "" + " - " + "" + objAplicacion.applicationName + ", ";
                            BitacoraMensaje = BitacoraMensaje + "con los siguientes comentarios: " + (string.IsNullOrEmpty(objRegistro.Observaciones) ? "Sin comentarios" : objRegistro.Observaciones);

                            BitacoraMensaje = BitacoraMensaje + ", el día " + "" + date + "" + " a las " + "" + hour + "";

                            var registroBitacora = new BitacoraAcciones()
                            {
                                CodigoAPT = objAplicacion.applicationId,
                                DetalleBitacora = BitacoraMensaje,
                                CreadoPor = objRegistro.Matricula,
                                FechaCreacion = dateAndTime,
                                NombreUsuarioCreacion = objRegistro.Usuario
                            };

                            ctx.BitacoraAcciones.Add(registroBitacora);
                            ctx.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }

                        //Envio de correo
                        try
                        {
                            List<string> correos = new List<string>();
                            correos.Add(objRegistro.Email);

                            var mailManager = new MailingManager();
                            var diccionario = new Dictionary<string, string>();
                            diccionario.Add("[CodigoAPT]", objAplicacion.applicationId);
                            diccionario.Add("[NombreAplicacion]", objAplicacion.applicationName);
                            mailManager.ProcesarEnvioNotificacionesAdministradores((int)NotificationFlow.ReversiónEliminaciónSolicitud, objAplicacion.applicationId, diccionario, true, true);
                        }
                        catch (Exception ex)
                        {
                            log.Error(ex.Message, ex);
                        }
                    }
                    else
                        idRegistro = -1;
                }
                return idRegistro;
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: RegitrarSolicitudReversionEliminacionApplication(SolicitudDto objRegistro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: RegitrarSolicitudReversionEliminacionApplication(SolicitudDto objRegistro)"
                    , new object[] { null });
            }
        }

        public override List<SolicitudDto> GetSolicitudesReversionEliminacion(PaginacionSolicitud pag, out int totalRows)
        {
            try
            {
                totalRows = 0;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from u in ctx.Solicitud
                                         join u2 in ctx.Application on u.AplicacionId equals u2.AppId
                                         join u3 in ctx.TipoActivoInformacion on u2.assetType equals u3.TipoActivoInformacionId into TipoActivo
                                         from ta in TipoActivo.DefaultIfEmpty()
                                         where
                                         (u2.applicationId.ToUpper().Contains(pag.CodigoApt.ToUpper()) || string.IsNullOrEmpty(pag.CodigoApt)) &&
                                         u.TipoSolicitud == (int)TipoSolicitud.RevertirEliminacion
                                         && (u.UsuarioCreacion == pag.username || string.IsNullOrEmpty(pag.username))
                                         && (u.EstadoSolicitud == pag.EstadoSolicitudUnico || pag.EstadoSolicitudUnico == 0)

                                         orderby u.FechaCreacion descending
                                         select new SolicitudDto()
                                         {
                                             Id = u.SolicitudAplicacionId,
                                             CodigoAplicacion = u2.applicationId,
                                             NombreAplicacion = u2.applicationName,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             AplicacionId = u.AplicacionId,
                                             EstadoSolicitud = u.EstadoSolicitud,
                                             FlagAprobacion = u.FlagAprobacion,
                                             TipoSolicitud = u.TipoSolicitud,
                                             TipoActivoInformacion = ta.Nombre,
                                             Observaciones = u.Observaciones,
                                             ObservacionesRechazo = u.ObservacionesRechazo,
                                             ObservacionesAprobacion = u.ObservacionesAprobacion,
                                             Usuario = u.NombreUsuarioCreacion,
                                             NombreUsuarioAprobacion = u.NombreUsuarioAprobacion,
                                             NombreUsuarioModificacion = u.NombreUsuarioModificacion,
                                         }).OrderBy(pag.sortName + " " + pag.sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudesReversionEliminacion(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: List<SolicitudDto> GetSolicitudesReversionEliminacion(PaginacionSolicitud pag, out int totalRows)"
                    , new object[] { null });
            }
        }
          
        public override SolicitudDto GetContenidoFileBitacoraById(int Id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.BitacoraAcciones
                                   where u.BitacoraId == Id
                                   select new SolicitudDto()
                                   {
                                       Id = u.BitacoraId,
                                       ConformidadGSTFile = u.Archivo,
                                       NombreConformidadGST = u.NombreArchivo
                                   }).FirstOrDefault();

                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorArquetipoDTO
                    , "Error en el metodo: SolicitudDto GetSolicitudById(int Id)"
                    , new object[] { null });
            }
        }
    }
}
