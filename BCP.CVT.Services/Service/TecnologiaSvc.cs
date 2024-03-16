﻿using BCP.CVT.Cross;
using BCP.CVT.DTO;
using BCP.CVT.DTO.Custom;
using BCP.CVT.DTO.Grilla;
using BCP.CVT.Services.Interface;
using BCP.CVT.Services.ModelDB;
using BCP.CVT.Services.SQL;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using IsolationLevel = System.Transactions.IsolationLevel;

namespace BCP.CVT.Services.Service
{
    public class TecnologiaSvc : TecnologiaDAO
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private void ActualizarEstadoTecnologias(int tecnologia, int familia, int estado)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_CambiarEstadoTecnologiasFamilia]", cnx))
                    {
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@tecnologia", tecnologia));
                        comando.Parameters.Add(new SqlParameter("@familia", familia));
                        comando.Parameters.Add(new SqlParameter("@estado", estado));

                        comando.ExecuteNonQuery();
                    }
                    cnx.Close();
                }
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: ActualizarEstadoTecnologias()"
                    , new object[] { null });
            }
        }

        private void ActualizarListasTecnologias(ObjTecnologia prmt)
        {
            try
            {
                var param1 = prmt.param1;
                var param2 = string.IsNullOrEmpty(prmt.param2) ? string.Empty : prmt.param2;
                var param3 = string.IsNullOrEmpty(prmt.param3) ? string.Empty : prmt.param3;
                var param4 = string.IsNullOrEmpty(prmt.param4) ? string.Empty : prmt.param4;
                var param5 = string.IsNullOrEmpty(prmt.param5) ? string.Empty : prmt.param5;
                var param6 = string.IsNullOrEmpty(prmt.param6) ? string.Empty : prmt.param6;
                var param7 = string.IsNullOrEmpty(prmt.param7) ? string.Empty : prmt.param7;
                var param8 = prmt.param8;
                var param9 = prmt.param9;

                //******************SP******************//
                List<SQLParam> ListsQLParam = new List<SQLParam>();
                ListsQLParam.Add(new SQLParam("@tecnologiaId", param1, SqlDbType.Int));
                ListsQLParam.Add(new SQLParam("@lstAddAutorizadores", param2, SqlDbType.NChar));
                ListsQLParam.Add(new SQLParam("@lstRemoveAutorizadores", param3, SqlDbType.NChar));
                ListsQLParam.Add(new SQLParam("@lstAddArquetipos", param4, SqlDbType.NChar));
                ListsQLParam.Add(new SQLParam("@lstRemoveArquetipos", param5, SqlDbType.NChar));
                ListsQLParam.Add(new SQLParam("@lstAddTecnologiaVinculada", param6, SqlDbType.NChar));
                ListsQLParam.Add(new SQLParam("@lstRemoveTecnologiaVinculada", param7, SqlDbType.NChar));
                ListsQLParam.Add(new SQLParam("@usuarioCreacion", param8, SqlDbType.NChar));
                ListsQLParam.Add(new SQLParam("@usuarioModificacion", param9, SqlDbType.NChar));

                string SP = "[CVT].[USP_ActualizarListaTecnologia]";

                new SQLManager().EjecutarStoredProcedure_2(SP, ListsQLParam);

            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: ActualizarEstadoTecnologias()"
                    , new object[] { null });
            }
        }

        private void ActualizarListasTecnologias2(ObjTecnologia prmt)
        {
            try
            {
                var param1 = prmt.param1;
                var param2 = string.IsNullOrEmpty(prmt.param2) ? string.Empty : prmt.param2;
                var param3 = string.IsNullOrEmpty(prmt.param3) ? string.Empty : prmt.param3;
                var param4 = string.IsNullOrEmpty(prmt.param4) ? string.Empty : prmt.param4;
                var param5 = string.IsNullOrEmpty(prmt.param5) ? string.Empty : prmt.param5;
                var param6 = string.IsNullOrEmpty(prmt.param6) ? string.Empty : prmt.param6;
                var param7 = string.IsNullOrEmpty(prmt.param7) ? string.Empty : prmt.param7;
                var param8 = prmt.param8;
                var param9 = prmt.param9;

                var cadenaConexion = Constantes.CadenaConexion;
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_ActualizarListaTecnologia]", cnx))
                    {
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@tecnologiaId", param1));
                        comando.Parameters.Add(new SqlParameter("@lstAddAutorizadores", param2));
                        comando.Parameters.Add(new SqlParameter("@lstRemoveAutorizadores", param3));
                        comando.Parameters.Add(new SqlParameter("@lstAddArquetipos", param4));
                        comando.Parameters.Add(new SqlParameter("@lstRemoveArquetipos", param5));
                        comando.Parameters.Add(new SqlParameter("@lstAddTecnologiaVinculada", param6));
                        comando.Parameters.Add(new SqlParameter("@lstRemoveTecnologiaVinculada", param7));
                        comando.Parameters.Add(new SqlParameter("@usuarioCreacion", param8));
                        comando.Parameters.Add(new SqlParameter("@usuarioModificacion", param9));

                        comando.ExecuteNonQuery();
                    }
                    cnx.Close();
                }

            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: ActualizarEstadoTecnologias()"
                    , new object[] { null });
            }
        }

        private bool ValidarFlagEstandar(int TipoTecnologiaId)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var estado = ServiceManager<TipoDAO>.Provider.ValidarFlagEstandar(TipoTecnologiaId);
                    return estado;
                }
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: ActualizarEstadoTecnologias()"
                    , new object[] { null });
            }
        }

        private void EnviarNotificacionTecnologia(string UsuarioCreacion, string Cuerpo, bool esEstandar = false)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    string nombreBuzon, buzon, buzonDefectoTecnologia, asunto = string.Empty;

                    buzon = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("TECNOLOGIA_GESTION_BUZON").Valor;
                    nombreBuzon = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("TECNOLOGIA_GESTION_BUZON_NOMBRE").Valor;
                    buzonDefectoTecnologia = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("TECNOLOGIA_GESTION_BUZON_DEFECTO").Valor;
                    if (!esEstandar)
                        asunto = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("TECNOLOGIA_GESTION_ASUNTO_NOTIFICACION").Valor;
                    else
                        asunto = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("TECNOLOGIA_GESTION_ASUNTO_ESTANDAR_NOTIFICACION").Valor;

                    NotificacionDTO notificacion = new NotificacionDTO();
                    //notificacion.TipoNotificacionId = (int)ETipoNotificacion.Tecnologia; // ENUM
                    notificacion.Nombre = nombreBuzon;
                    notificacion.De = buzon;
                    notificacion.Para = buzonDefectoTecnologia;
                    notificacion.CC = buzonDefectoTecnologia;
                    notificacion.BCC = string.Empty;
                    notificacion.Cuerpo = Cuerpo;
                    notificacion.Asunto = asunto;
                    notificacion.UsuarioCreacion = UsuarioCreacion;
                    notificacion.FechaCreacion = DateTime.Now;
                    notificacion.Activo = true;
                    notificacion.FlagEnviado = false;
                    notificacion.FechaEnvio = null;
                    int NotificacionId = ServiceManager<NotificacionDAO>.Provider.AddOrEditNotificacion(notificacion);
                }

            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: ActualizarEstadoTecnologias()"
                    , new object[] { null });
            }
        }

        public override int AddOrEditTecnologia(TecnologiaDTO objeto)
        {
            DbContextTransaction transaction = null;
            var registroNuevo = false;
            int ID = 0;
            var CURRENT_DATE = DateTime.Now;

            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {
                        if (objeto.Id == 0)
                        {
                            var entidad = new Tecnologia()
                            {
                                EstadoTecnologia = objeto.EstadoTecnologia,
                                SubdominioId = objeto.SubdominioId,
                                TecnologiaId = objeto.Id,
                                Activo = objeto.Activo,
                                ClaveTecnologia = objeto.ClaveTecnologia,
                                UsuarioCreacion = objeto.UsuarioCreacion,
                                FechaCreacion = DateTime.Now,
                                Nombre = objeto.Nombre,
                                Descripcion = objeto.Descripcion,
                                Versiones = objeto.Versiones,
                                TipoTecnologia = objeto.TipoTecnologiaId,
                                FamiliaId = objeto.FamiliaId,
                                FlagConfirmarFamilia = objeto.FlagConfirmarFamilia,
                                FlagFechaFinSoporte = objeto.FlagFechaFinSoporte,
                                FechaCalculoTec = objeto.FechaCalculoTec,
                                FechaLanzamiento = objeto.FechaLanzamiento,
                                FechaExtendida = objeto.FechaExtendida,
                                FechaFinSoporte = objeto.FechaFinSoporte,
                                FechaAcordada = objeto.FechaAcordada,
                                ComentariosFechaFin = objeto.ComentariosFechaFin,
                                FuenteId = objeto.Fuente,
                                Existencia = objeto.Existencia,
                                Facilidad = objeto.Facilidad,
                                Riesgo = objeto.Riesgo,
                                Vulnerabilidad = objeto.Vulnerabilidad,
                                CasoUso = objeto.CasoUso,
                                Requisitos = objeto.Requisitos,
                                Compatibilidad = objeto.Compatibilidad,
                                Aplica = objeto.Aplica,
                                FlagAplicacion = objeto.FlagAplicacion,
                                CodigoAPT = objeto.CodigoAPT,
                                Fabricante = objeto.Fabricante,
                                //Fin tab 1                        
                                EliminacionTecObsoleta = objeto.EliminacionTecObsoleta,
                                RoadmapOpcional = objeto.RoadmapOpcional,
                                Referencias = objeto.Referencias,
                                PlanTransConocimiento = objeto.PlanTransConocimiento,
                                EsqMonitoreo = objeto.EsqMonitoreo,
                                LineaBaseSeg = objeto.LineaBaseSeg,
                                EsqPatchManagement = objeto.EsqPatchManagement,
                                //Fin tab 2
                                DuenoId = objeto.Dueno,
                                EqAdmContacto = objeto.EqAdmContacto,
                                GrupoSoporteRemedy = objeto.GrupoSoporteRemedy,
                                ConfArqSegId = objeto.ConfArqSeg,
                                ConfArqTecId = objeto.ConfArqTec,
                                EncargRenContractual = objeto.EncargRenContractual,
                                EsqLicenciamiento = objeto.EsqLicenciamiento,
                                SoporteEmpresarial = objeto.SoporteEmpresarial,
                                //TipoId = objeto.TipoId,
                                EstadoId = objeto.EstadoId,
                                //Fin tab 3
                            };
                            ctx.Tecnologia.Add(entidad);
                            ctx.SaveChanges();
                            ID = entidad.TecnologiaId;
                            registroNuevo = true;
                        }
                        else
                        {
                            var entidad = ctx.Tecnologia.FirstOrDefault(x => x.TecnologiaId == objeto.Id);
                            if (entidad != null)
                            {
                                //CambiarEstadoObsolescenciaTecnologia(entidad, objeto);

                                //string CuerpoNotificacion = string.Empty;
                                //string CuerpoNotificacionFlagEstandar = string.Empty;
                                //CuerpoNotificacion = string.Format("Tecnología en estado {0}", objeto.EstadoTecnologiaStr);
                                entidad.EstadoId = objeto.EstadoId == -1 ? entidad.EstadoId : objeto.EstadoId;

                                if (objeto.EstadoId == (int)ETecnologiaEstado.Deprecado || objeto.EstadoId == (int)ETecnologiaEstado.Vigente)
                                //if (objeto.EstadoId == (int)ETecnologiaEstado.VigentePorVencer || objeto.EstadoId == (int)ETecnologiaEstado.Vigente)
                                {
                                    if (objeto.TipoTecnologiaId == (int)ETipoTecnologia.NoEstandar)
                                        entidad.EstadoId = (int)ETecnologiaEstado.Obsoleto;
                                }

                                entidad.FlagSiteEstandar = objeto.FlagSiteEstandar;
                                entidad.TipoTecnologia = objeto.TipoTecnologiaId;
                                //entidad.EstadoId = objeto.EstadoId;
                                entidad.FamiliaId = objeto.FamiliaId;
                                entidad.FlagConfirmarFamilia = objeto.FlagConfirmarFamilia;
                                entidad.ClaveTecnologia = objeto.ClaveTecnologia;

                                if (objeto.FlagCambioEstado)
                                    entidad.EstadoTecnologia = objeto.EstadoTecnologia;

                                switch (objeto.EstadoTecnologia)
                                {
                                    //case 1:
                                    //    entidad.EstadoTecnologia = (int)EstadoTecnologia.Registrado;
                                    //    break;
                                    //case 2:
                                    //    entidad.EstadoTecnologia = (int)EstadoTecnologia.EnRevision;
                                    //    break;
                                    case (int)EstadoTecnologia.Aprobado:
                                        //entidad.EstadoTecnologia = (int)EstadoTecnologia.Aprobado;
                                        entidad.FlagSiteEstandar = objeto.FlagSiteEstandar;
                                        entidad.FechaAprobacion = !entidad.FechaAprobacion.HasValue ? CURRENT_DATE : entidad.FechaAprobacion;
                                        entidad.UsuarioAprobacion = objeto.UsuarioModificacion;
                                        entidad.CodigoTecnologiaAsignado = objeto.CodigoTecnologiaAsignado;
                                        entidad.UrlConfluence = objeto.UrlConfluence;
                                        break;
                                    case (int)EstadoTecnologia.Observado:
                                        //entidad.EstadoTecnologia = (int)EstadoTecnologia.Observado;
                                        entidad.Observacion = objeto.Observacion;
                                        break;
                                    default: break;
                                }

                                entidad.Nombre = objeto.Nombre;
                                entidad.Descripcion = objeto.Descripcion;
                                entidad.Versiones = objeto.Versiones;
                                entidad.FlagFechaFinSoporte = objeto.FlagFechaFinSoporte;
                                entidad.FechaCalculoTec = objeto.FechaCalculoTec;
                                entidad.FechaLanzamiento = objeto.FechaLanzamiento;
                                entidad.FechaExtendida = objeto.FechaExtendida;
                                entidad.FechaFinSoporte = objeto.FechaFinSoporte;
                                entidad.FechaAcordada = objeto.FechaAcordada;
                                entidad.ComentariosFechaFin = objeto.ComentariosFechaFin;
                                entidad.FuenteId = objeto.Fuente;
                                entidad.Existencia = objeto.Existencia;
                                entidad.Facilidad = objeto.Facilidad;
                                entidad.Riesgo = objeto.Riesgo;
                                entidad.Vulnerabilidad = objeto.Vulnerabilidad;
                                entidad.CasoUso = objeto.CasoUso;
                                entidad.Requisitos = objeto.Requisitos;
                                entidad.Compatibilidad = objeto.Compatibilidad;
                                entidad.Aplica = objeto.Aplica;
                                entidad.FlagAplicacion = objeto.FlagAplicacion;
                                entidad.CodigoAPT = objeto.CodigoAPT;
                                entidad.Fabricante = objeto.Fabricante;
                                //Fin tab 1
                                entidad.SubdominioId = objeto.SubdominioId;
                                entidad.EliminacionTecObsoleta = objeto.EliminacionTecObsoleta;
                                entidad.RoadmapOpcional = objeto.RoadmapOpcional;
                                entidad.Referencias = objeto.Referencias;
                                entidad.PlanTransConocimiento = objeto.PlanTransConocimiento;
                                entidad.EsqMonitoreo = objeto.EsqMonitoreo;
                                entidad.LineaBaseSeg = objeto.LineaBaseSeg;
                                entidad.EsqPatchManagement = objeto.EsqPatchManagement;
                                //Fin tab 2
                                entidad.DuenoId = objeto.Dueno;
                                entidad.EqAdmContacto = objeto.EqAdmContacto;
                                entidad.GrupoSoporteRemedy = objeto.GrupoSoporteRemedy;
                                entidad.ConfArqSegId = objeto.ConfArqSeg;
                                entidad.ConfArqTecId = objeto.ConfArqTec;
                                entidad.EncargRenContractual = objeto.EncargRenContractual;
                                entidad.EsqLicenciamiento = objeto.EsqLicenciamiento;
                                entidad.SoporteEmpresarial = objeto.SoporteEmpresarial;
                                //entidad.EstadoId = objeto.EstadoId;
                                //Fin tab 3

                                //RONALD
                                entidad.AutomatizacionImplementadaId = objeto.AutomatizacionImplementadaId;
                                entidad.AplicacionId = objeto.AplicacionId;

                                entidad.FechaModificacion = CURRENT_DATE;
                                entidad.UsuarioModificacion = objeto.UsuarioModificacion;

                                ctx.SaveChanges();

                                //if (ValidarFlagEstandar(objeto.TipoTecnologiaId.Value))
                                //{
                                //    CuerpoNotificacionFlagEstandar = Utilitarios.GetBodyNotification();
                                //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[FECHA_HORA]", DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"));
                                //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[CLAVE_TECNOLOGIA]", objeto.ClaveTecnologia);
                                //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[MATRICULA]", objeto.UsuarioCreacion);
                                //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[NOMBRES]", objeto.UsuarioCreacion);
                                //    this.EnviarNotificacionTecnologia(objeto.UsuarioCreacion, CuerpoNotificacionFlagEstandar, true);
                                //}

                                //if(objeto.FlagCambioEstado)
                                //{
                                //    this.EnviarNotificacionTecnologia(objeto.UsuarioCreacion, CuerpoNotificacion);
                                //}                                                                
                                ID = entidad.TecnologiaId;
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }

            try
            {
                if (registroNuevo)
                {
                    var paramSP = new ObjTecnologia()
                    {
                        param1 = ID,
                        param2 = objeto.ItemsAddAutorizadorSTR,
                        param3 = objeto.ItemsRemoveAutIdSTR,
                        param4 = objeto.ItemsAddTecEqIdSTR,
                        param5 = objeto.ItemsRemoveTecEqIdSTR,
                        param6 = objeto.ItemsAddTecVinculadaIdSTR,
                        param7 = objeto.ItemsRemoveTecVinculadaIdSTR,
                        param8 = objeto.UsuarioCreacion,
                        param9 = objeto.UsuarioModificacion
                    };

                    this.ActualizarListasTecnologias(paramSP);
                }
                else
                {
                    var paramSP = new ObjTecnologia()
                    {
                        param1 = ID,
                        param2 = objeto.ItemsAddAutorizadorSTR,
                        param3 = objeto.ItemsRemoveAutIdSTR,
                        param4 = objeto.ItemsAddTecEqIdSTR,
                        param5 = objeto.ItemsRemoveTecEqIdSTR,
                        param6 = objeto.ItemsAddTecVinculadaIdSTR,
                        param7 = objeto.ItemsRemoveTecVinculadaIdSTR,
                        param8 = objeto.UsuarioCreacion,
                        param9 = objeto.UsuarioModificacion
                    };

                    this.ActualizarListasTecnologias(paramSP);
                }

                if ((objeto.EstadoId != (int)ETecnologiaEstado.Obsoleto && objeto.EstadoId.HasValue)
                                   && objeto.EstadoTecnologia == (int)EstadoTecnologia.Aprobado && objeto.FlagUnicaVigente == true)
                {
                    //this.ActualizarEstadoTecnologias(objeto.Id, objeto.FamiliaId.Value, (int)ETecnologiaEstado.VigentePorVencer);
                    this.ActualizarEstadoTecnologias(objeto.Id, objeto.FamiliaId.Value, (int)ETecnologiaEstado.Deprecado);
                }

                return ID;
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
        }

        private void CambiarEstadoObsolescenciaTecnologia(Tecnologia entidad, TecnologiaDTO objeto)
        {
            if (objeto.EstadoId == (int)ETecnologiaEstado.Deprecado || objeto.EstadoId == (int)ETecnologiaEstado.Vigente)
            //if (objeto.EstadoId == (int)ETecnologiaEstado.VigentePorVencer || objeto.EstadoId == (int)ETecnologiaEstado.Vigente)
            {
                if (objeto.TipoTecnologiaId == (int)ETipoTecnologia.NoEstandar)
                    entidad.EstadoId = (int)ETecnologiaEstado.Obsoleto;
            }
            else if (objeto.EstadoId == (int)ETecnologiaEstado.Obsoleto)
            {
                var flagCambioFecha = entidad.FechaCalculoTec != objeto.FechaCalculoTec;
                var flagCambioTipo = entidad.TipoTecnologia != objeto.TipoTecnologiaId;

                if (flagCambioFecha || flagCambioTipo)
                {
                    DateTime? FFC = null;
                    DateTime FECHA_ACTUAL = DateTime.Now;
                    if (objeto.TipoTecnologiaId != (int)ETipoTecnologia.NoEstandar)
                    {
                        if (objeto.FechaCalculoTec.HasValue)
                        {
                            switch (objeto.FechaCalculoTec.Value)
                            {
                                case (int)FechaCalculoTecnologia.FechaExtendida:
                                    FFC = objeto.FechaExtendida;
                                    break;
                                case (int)FechaCalculoTecnologia.FechaFinSoporte:
                                    FFC = objeto.FechaFinSoporte;
                                    break;
                                case (int)FechaCalculoTecnologia.FechaInterna:
                                    FFC = objeto.FechaAcordada;
                                    break;
                            }

                            if (FFC > FECHA_ACTUAL)
                                //entidad.EstadoId = (int)ETecnologiaEstado.VigentePorVencer;
                                entidad.EstadoId = (int)ETecnologiaEstado.Deprecado;
                        }
                        else
                            //entidad.EstadoId = (int)ETecnologiaEstado.VigentePorVencer;
                            entidad.EstadoId = (int)ETecnologiaEstado.Deprecado;
                    }
                }
            }
        }

        public override bool CambiarEstado(int id, bool estado, string usuario)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var itemBD = (from u in ctx.Tecnologia
                                  where u.TecnologiaId == id
                                  select u).First();

                    if (itemBD != null)
                    {
                        itemBD.FechaModificacion = DateTime.Now;
                        itemBD.UsuarioModificacion = usuario;
                        itemBD.Activo = estado;

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

        public override List<RelacionTecnologiaDTO> GetAllTecnologia()
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join d in ctx.Dominio on s.DominioId equals d.DominioId
                                       join f in ctx.Familia on u.FamiliaId equals f.FamiliaId
                                       where u.Activo && s.Activo && d.Activo
                                       && u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       && f.Activo
                                       orderby u.Nombre
                                       select new RelacionTecnologiaDTO()
                                       {
                                           Id = u.TecnologiaId,
                                           Tecnologia = u.Nombre,
                                           Dominio = d.Nombre,
                                           Subdominio = s.Nombre,
                                           Familia = f.Nombre,
                                           Activo = u.Activo
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

        public override List<TecnologiaDTO> GetTecnologiasByFiltro(string filtro)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       where u.Activo
                                       && u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper())
                                       //&& u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       orderby u.Nombre
                                       select new TecnologiaDTO()
                                       {
                                           Id = u.TecnologiaId,
                                           ClaveTecnologia = u.ClaveTecnologia
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

        public override List<TecnologiaG> GetTec(int domId, int subdomId, string nombre, string aplica, string codigo, string dueno, string equipo, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var tecnologiaIds = (from et in ctx.EquipoTecnologia
                                             join e in ctx.Equipo on et.EquipoId equals e.EquipoId
                                             where et.FlagActivo && e.FlagActivo
                                             && e.Nombre.ToUpper().Contains(equipo.ToUpper())
                                             select et.TecnologiaId);

                        var tecEquivalenciaIds = (from e in ctx.TecnologiaEquivalencia
                                                  where e.FlagActivo && e.Nombre.ToUpper().Contains(nombre.ToUpper())
                                                  select e.TecnologiaId);

                        var registros = (from u in ctx.Tecnologia
                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId into lj1
                                         from t in lj1.DefaultIfEmpty()
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         join p in ctx.Producto on u.ProductoId equals p.ProductoId
                                            into TecnologiaProducto
                                         from tp in TecnologiaProducto.DefaultIfEmpty()

                                             //join te in ctx.TecnologiaEquivalencia on u.TecnologiaId equals te.TecnologiaId into lj2
                                             //from te in lj2.DefaultIfEmpty()
                                             //join e in ctx.Equipo on et.EquipoId equals e.EquipoId into lj3
                                             //from e in lj3.DefaultIfEmpty()
                                         where u.Activo && u.SubdominioId == (subdomId == -1 ? u.SubdominioId : subdomId) &&
                                         (u.Nombre.ToUpper().Contains(nombre.ToUpper())
                                         || string.IsNullOrEmpty(nombre)
                                         || u.Descripcion.ToUpper().Contains(nombre.ToUpper())
                                         || u.ClaveTecnologia.ToUpper().Contains(nombre.ToUpper())
                                         //|| te.Nombre.ToUpper().Contains(nombre.ToUpper())
                                         || tecEquivalenciaIds.Contains(u.TecnologiaId)
                                         )
                                         && (s.DominioId == (domId == -1 ? s.DominioId : domId))
                                         && (u.Aplica.ToUpper().Contains(aplica.ToUpper()) || string.IsNullOrEmpty(aplica))
                                         && (u.CodigoTecnologiaAsignado.ToUpper().Contains(codigo.ToUpper()) || string.IsNullOrEmpty(codigo))
                                         && (u.DuenoId.ToUpper().Contains(dueno.ToUpper()) || string.IsNullOrEmpty(dueno))
                                         && (string.IsNullOrEmpty(equipo) || tecnologiaIds.Contains(u.TecnologiaId))
                                         //&& (e.Nombre.ToUpper().Contains(equipo.ToUpper()) || string.IsNullOrEmpty(equipo))
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             Nombre = u.Nombre,
                                             Activo = u.Activo,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             Dominio = d.Nombre,
                                             Subdominio = s.Nombre,
                                             Tipo = t.Nombre,
                                             Estado = u.EstadoTecnologia,
                                             //TipoId = u.TipoId,
                                             EstadoId = u.EstadoId,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             TribuCoeId = tp.TribuCoeId,
                                             TribuCoeName = tp.TribuCoeDisplayName,
                                             SquadId = tp.SquadId,
                                             SquadName = tp.SquadDisplayName,
                                             OwnerId = tp.OwnerId,
                                             OwnerDisplay = tp.OwnerDisplayName
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTec(int domId, int subdomId, string nombre, string aplica, string codigo, string dueno, string equipo, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTec(int domId, int subdomId, string nombre, string aplica, string codigo, string dueno, string equipo, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override TecnologiaDTO GetTecById(int id)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join f in ctx.Familia on u.FamiliaId equals f.FamiliaId into ljf
                                       from f in ljf.DefaultIfEmpty()
                                       join t in ctx.Aplicacion on u.CodigoAPT equals t.CodigoAPT into lj1
                                       from t in lj1.DefaultIfEmpty()
                                           //join a in ctx.Arquetipo on u.ArquetipoId equals a.ArquetipoId into lj2
                                           //from a in lj2.DefaultIfEmpty()
                                       where u.TecnologiaId == id
                                       //&& t.FlagActivo
                                       select new TecnologiaDTO()
                                       {
                                           Id = u.TecnologiaId,
                                           Nombre = u.Nombre,
                                           Descripcion = u.Descripcion,
                                           Activo = u.Activo,
                                           FechaCreacion = u.FechaCreacion,
                                           UsuarioCreacion = u.UsuarioCreacion,
                                           EstadoTecnologia = u.EstadoTecnologia,
                                           Versiones = u.Versiones,
                                           FamiliaId = u.FamiliaId,
                                           FamiliaNomb = f == null ? null : f.Nombre,
                                           FlagConfirmarFamilia = u.FlagConfirmarFamilia.HasValue ? u.FlagConfirmarFamilia.Value : false,
                                           ClaveTecnologia = u.ClaveTecnologia,
                                           TipoTecnologiaId = u.TipoTecnologia,
                                           FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                           FechaCalculoTec = u.FechaCalculoTec,
                                           FechaLanzamiento = u.FechaLanzamiento,
                                           FechaExtendida = u.FechaExtendida,
                                           FechaFinSoporte = u.FechaFinSoporte,
                                           FechaAcordada = u.FechaAcordada,
                                           ComentariosFechaFin = u.ComentariosFechaFin,
                                           Fuente = u.FuenteId,
                                           Existencia = u.Existencia,
                                           Facilidad = u.Facilidad,
                                           Riesgo = u.Riesgo,
                                           Vulnerabilidad = u.Vulnerabilidad,
                                           CasoUso = u.CasoUso,
                                           Requisitos = u.Requisitos,
                                           Compatibilidad = u.Compatibilidad,
                                           Aplica = u.Aplica,
                                           FlagAplicacion = u.FlagAplicacion,
                                           CodigoAPT = u.CodigoAPT,
                                           AplicacionNomb = u.CodigoAPT == null ? "" : t.CodigoAPT + " - " + t.Nombre,
                                           //Fin Tab 1
                                           DominioId = s.DominioId,
                                           SubdominioId = u.SubdominioId,
                                           SubdominioNomb = s.Nombre,
                                           EliminacionTecObsoleta = u.EliminacionTecObsoleta,
                                           RoadmapOpcional = u.RoadmapOpcional,
                                           Referencias = u.Referencias,
                                           PlanTransConocimiento = u.PlanTransConocimiento,
                                           EsqMonitoreo = u.EsqMonitoreo,
                                           LineaBaseSeg = u.LineaBaseSeg,
                                           EsqPatchManagement = u.EsqPatchManagement,
                                           //Fin Tab 2
                                           Dueno = u.DuenoId,
                                           EqAdmContacto = u.EqAdmContacto,
                                           GrupoSoporteRemedy = u.GrupoSoporteRemedy,
                                           ConfArqSeg = u.ConfArqSegId,
                                           ConfArqTec = u.ConfArqTecId,
                                           EncargRenContractual = u.EncargRenContractual,
                                           EsqLicenciamiento = u.EsqLicenciamiento,
                                           SoporteEmpresarial = u.SoporteEmpresarial,
                                           //Fin Tab 3
                                           FlagSiteEstandar = u.FlagSiteEstandar,
                                           Fabricante = u.Fabricante,
                                           EstadoId = u.EstadoId,
                                           CodigoTecnologiaAsignado = u.CodigoTecnologiaAsignado,
                                           UrlConfluence = u.UrlConfluence,
                                           //ArquetipoId = u.ArquetipoId,
                                           //ArquetipoNombre = a.Nombre
                                           //Fin Tab 4
                                           ProductoId = u.ProductoId,
                                           AutomatizacionImplementadaId = u.AutomatizacionImplementadaId,
                                           AplicacionId = u.AplicacionId
                                       }).FirstOrDefault();

                        if (entidad != null)
                        {
                            if (entidad.EliminacionTecObsoleta != null)
                            {
                                //var tecIdObs = entidad.EliminacionTecObsoleta;
                                var itemTecObs = ctx.Tecnologia.Find(entidad.EliminacionTecObsoleta);
                                if (itemTecObs != null)
                                    entidad.EliminacionTecNomb = itemTecObs.Nombre;
                            }
                            else
                            {
                                entidad.EliminacionTecNomb = string.Empty;
                            }

                            var listAutorizadores = (from u in ctx.Tecnologia
                                                     join at in ctx.AutorizadorTecnologia on u.TecnologiaId equals at.TecnologiaId
                                                     where u.TecnologiaId == id && u.Activo && at.Activo
                                                     select new AutorizadorDTO()
                                                     {
                                                         MatriculaBanco = at.MatriculaBanco,
                                                         Id = at.AutorizadorId,
                                                         Activo = at.Activo
                                                     }).ToList();

                            var listArquetipo = (from u in ctx.Arquetipo
                                                 join at in ctx.ArquetipoTecnologia on new { ArquetipoId = u.ArquetipoId, TecnologiaId = entidad.Id } equals new { ArquetipoId = at.ArquetipoId, TecnologiaId = at.TecnologiaId }
                                                 where at.Activo
                                                 select new ArquetipoDTO()
                                                 {
                                                     Id = u.ArquetipoId,
                                                     Nombre = u.Nombre
                                                 }).ToList();

                            var listTecnologiaVinculadas = (from u in ctx.Tecnologia
                                                            join tv in ctx.TecnologiaVinculada on u.TecnologiaId equals tv.VinculoId
                                                            join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                                            join d in ctx.Dominio on s.DominioId equals d.DominioId
                                                            where tv.Activo && tv.TecnologiaId == entidad.Id
                                                            select new TecnologiaDTO()
                                                            {
                                                                Id = tv.VinculoId,
                                                                Nombre = u.ClaveTecnologia,
                                                                DominioNomb = s.Nombre,
                                                                SubdominioNomb = d.Nombre
                                                            }).ToList();

                            var listEquivalencias = (from u in ctx.TecnologiaEquivalencia
                                                     where u.FlagActivo && u.TecnologiaId == id
                                                     select 1).ToList();


                            entidad.ListAutorizadores = listAutorizadores;
                            entidad.ListArquetipo = listArquetipo;
                            entidad.ListTecnologiaVinculadas = listTecnologiaVinculadas;
                            entidad.FlagTieneEquivalencias = listEquivalencias.Count > 0 ? true : false;

                            int? TablaProcedenciaId = (from t in ctx.TablaProcedencia
                                                       where t.CodigoInterno == (int)ETablaProcedencia.CVT_Tecnologia
                                                       && t.FlagActivo
                                                       select t.TablaProcedenciaId).FirstOrDefault();
                            if (TablaProcedenciaId == null) throw new Exception("TablaProcedencia no encontrado por codigo interno: " + (int)ETablaProcedencia.CVT_Tecnologia);

                            var archivo = (from u in ctx.ArchivosCVT
                                           where u.Activo && u.EntidadId == id.ToString() && u.TablaProcedenciaId == TablaProcedenciaId
                                           select new ArchivosCvtDTO()
                                           {
                                               Id = u.ArchivoId,
                                               Nombre = u.Nombre
                                           }).FirstOrDefault();

                            if (archivo != null)
                            {
                                entidad.ArchivoId = archivo.Id;
                                entidad.ArchivoStr = archivo.Nombre;
                            }
                        }

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: TecnologiaDTO GetTecById(int id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: TecnologiaDTO GetTecById(int id)"
                    , new object[] { null });
            }
        }

        public override List<SubdominioDTO> GetSubByDom(int domId)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Subdominio
                                       where (u.DominioId == domId)
                                       orderby u.Nombre
                                       select new SubdominioDTO()
                                       {
                                           Activo = u.Activo,
                                           Id = u.SubdominioId,
                                           FechaCreacion = u.FechaCreacion,
                                           UsuarioCreacion = u.UsuarioCreacion,
                                           FechaModificacion = u.FechaModificacion,
                                           UsuarioModificacion = u.UsuarioModificacion,
                                           UsuarioAsociadoPor = u.UsuarioAsociadoPor,
                                           FechaAsociacion = u.FechaAsociacion,
                                           Nombre = u.Nombre,
                                           Descripcion = u.Descripcion,
                                           MatriculaDueno = u.Dueno,
                                           CalculoObs = u.CalObs,
                                       }).ToList();

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<SubdominioDTO> GetSubByDom(int domId)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<SubdominioDTO> GetSubByDom(int domId)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetTecSTD(List<int> domIds, List<int> subdomIds, string casoUso, string filtro, List<int> estadoIds, string famId, int fecId, string aplica, string codigo, string dueno, string equipo, List<int> tipoTecIds, List<int> estObsIds, int? flagActivo, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                //casoUso = "";
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var tecnologiaIds = new List<int>();

                        if (!string.IsNullOrEmpty(equipo))
                        {
                            tecnologiaIds = (from et in ctx.EquipoTecnologia
                                             join e in ctx.Equipo on et.EquipoId equals e.EquipoId
                                             where et.FlagActivo && e.FlagActivo
                                             && (e.Nombre.ToUpper().Contains(equipo.ToUpper())
                                             /*|| string.IsNullOrEmpty(equipo)*/)
                                             select et.TecnologiaId).ToList();
                        }

                        var tecEquivalenciaIds = (from e in ctx.TecnologiaEquivalencia
                                                  where e.FlagActivo && e.Nombre.ToUpper().Contains(filtro.ToUpper())
                                                  select e.TecnologiaId
                                                ).ToList();

                        var registros = (from u in ctx.Tecnologia
                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId into lj1
                                         from t in lj1.DefaultIfEmpty()
                                         join f in ctx.Familia on u.FamiliaId equals f.FamiliaId into lj2
                                         from f in lj2.DefaultIfEmpty()
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         where (u.Activo == (flagActivo != null))
                                         &&
                                         (u.Nombre.ToUpper().Contains(filtro.ToUpper())
                                         || u.Descripcion.ToUpper().Contains(filtro.ToUpper())
                                         || string.IsNullOrEmpty(filtro)
                                         || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper())
                                         || tecEquivalenciaIds.Contains(u.TecnologiaId))

                                         && (domIds.Count == 0 || domIds.Contains(s.DominioId))
                                         && (subdomIds.Count == 0 || subdomIds.Contains(u.SubdominioId))
                                         && (estadoIds.Count == 0 || estadoIds.Contains(u.EstadoTecnologia))
                                         && (estObsIds.Count == 0 || estObsIds.Contains(u.EstadoId.HasValue ? u.EstadoId.Value : 0))
                                         && (tipoTecIds.Count == 0 || tipoTecIds.Contains(u.TipoTecnologia.HasValue ? u.TipoTecnologia.Value : 0))
                                         && (string.IsNullOrEmpty(famId) || f == null || f.Nombre.ToUpper().Equals(famId.ToUpper()))
                                         && (fecId == -1 || u.FechaFinSoporte.HasValue == (fecId == 1))
                                         && (u.Aplica.ToUpper().Contains(aplica.ToUpper()) || string.IsNullOrEmpty(aplica))
                                         && (u.CodigoTecnologiaAsignado.ToUpper().Contains(codigo.ToUpper()) || string.IsNullOrEmpty(codigo))
                                         && (u.DuenoId.ToUpper().Contains(dueno.ToUpper()) || string.IsNullOrEmpty(dueno))
                                         && (string.IsNullOrEmpty(equipo) || tecnologiaIds.Contains(u.TecnologiaId))

                                         orderby u.Nombre
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             TipoTecnologiaId = u.TipoTecnologia.HasValue ? u.TipoTecnologia.Value : 4,
                                             Nombre = u.Nombre,
                                             Activo = u.Activo,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             Dominio = d.Nombre,
                                             Subdominio = s.Nombre,
                                             Tipo = t.Nombre,
                                             Estado = u.EstadoTecnologia,
                                             FechaAprobacion = u.FechaAprobacion,
                                             UsuarioAprobacion = u.UsuarioAprobacion,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             //TipoId = u.TipoId,
                                             EstadoId = u.EstadoId,
                                             FechaFinSoporte = u.FechaFinSoporte,
                                             FechaAcordada = u.FechaAcordada,
                                             FechaExtendida = u.FechaExtendida,
                                             FechaCalculoTec = u.FechaCalculoTec,
                                             FlagSiteEstandar = u.FlagSiteEstandar,
                                             FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                             FlagTieneEquivalencias = (from x in ctx.TecnologiaEquivalencia
                                                                       where x.FlagActivo && x.TecnologiaId == u.TecnologiaId
                                                                       select true).FirstOrDefault() == true
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override bool CambiarEstadoSTD(int id, int estadoTec, string obs, string usuario)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var itemBD = (from u in ctx.Tecnologia
                                  where u.TecnologiaId == id
                                  select u).First();

                    if (itemBD != null)
                    {
                        itemBD.EstadoTecnologia = estadoTec;
                        string CuerpoNotificacion = string.Empty;
                        switch (estadoTec)
                        {
                            case (int)EstadoTecnologia.Aprobado:
                                itemBD.FechaAprobacion = DateTime.Now;
                                itemBD.UsuarioAprobacion = usuario;
                                CuerpoNotificacion = "Tecnología en estado Aprobado";
                                break;

                            case (int)EstadoTecnologia.Observado:
                                itemBD.Observacion = obs;
                                CuerpoNotificacion = "Tecnología en estado Observado";
                                break;
                        }

                        itemBD.FechaModificacion = DateTime.Now;
                        itemBD.UsuarioModificacion = usuario;
                        ctx.SaveChanges();

                        //this.EnviarNotificacionTecnologia(usuario, CuerpoNotificacion);

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

        public override List<TecnologiaEquivalenciaDTO> GetTecEqByTec(int id, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId
                                         join te in ctx.TecnologiaEquivalencia on u.TecnologiaId equals te.TecnologiaId
                                         where u.TecnologiaId == (id == 0 ? u.TecnologiaId : id)
                                         && u.Activo
                                         && te.FlagActivo
                                         select new TecnologiaEquivalenciaDTO
                                         {
                                             Id = te.TecnologiaEquivalenciaId,
                                             TecnologiaId = te.TecnologiaId,
                                             NombreTecnologia = u.ClaveTecnologia,
                                             DominioTecnologia = d.Nombre,
                                             SubdominioTecnologia = s.Nombre,
                                             TipoTecnologia = t.Nombre,
                                             EstadoId = u.EstadoId,
                                             Nombre = te.Nombre
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaEquivalenciaDTO> GetTecEqByTec(int id, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaEquivalenciaDTO> GetTecEqByTec(int id, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaDTO> GetTec()
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       where u.Activo && u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       orderby u.Nombre
                                       select new TecnologiaDTO()
                                       {
                                           Id = u.TecnologiaId,
                                           Nombre = u.Nombre
                                       });

                        return entidad.ToList();
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaDTO> GetTec()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaDTO> GetTec()"
                    , new object[] { null });
            }
        }

        public override bool AsociarTecEq(int tecId, string equivalencia, string usuario)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = new TecnologiaEquivalencia()
                    {
                        TecnologiaId = tecId,
                        Nombre = equivalencia,
                        FlagActivo = true,
                        FechaCreacion = DateTime.Now,
                        CreadoPor = usuario
                    };

                    ctx.TecnologiaEquivalencia.Add(entidad);
                    ctx.SaveChanges();

                    return true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool AsociarTecEq(int tecId, string equivalencia, string usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool AsociarTecEq(int tecId, string equivalencia, string usuario)"
                    , new object[] { null });
            }
        }

        public override bool ExisteTecnologiaById(int Id)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        bool? estado = (from u in ctx.Tecnologia
                                        where u.Activo && u.TecnologiaId == Id
                                        select true).FirstOrDefault();

                        return estado == true;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteTecnologiaById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteTecnologiaById(int Id)"
                    , new object[] { null });
            }
        }

        public override bool ExisteEquivalencia(string equivalencia)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        bool? estado = (from u in ctx.TecnologiaEquivalencia
                                        where u.FlagActivo && u.Nombre.ToUpper() == equivalencia.ToUpper()
                                        select true).FirstOrDefault();

                        return estado == true;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteEquivalencia(string equivalencia)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteEquivalencia(string equivalencia)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetAllTecnologia(string filtro)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join d in ctx.Dominio on s.DominioId equals d.DominioId
                                       join f in ctx.Familia on u.FamiliaId equals f.FamiliaId
                                       where u.Activo && s.Activo && d.Activo && f.Activo
                                       && (string.IsNullOrEmpty(filtro) || u.Nombre.ToUpper().Contains(filtro.ToUpper()))
                                       && u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       orderby u.Nombre
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologia(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologia(string filtro)"
                    , new object[] { null });
            }
        }
        public override List<CustomAutocompleteRelacion> GetAllTecnologiaByClaveTecnologia(string filtro, string subdominioIds = null)
        {
            try
            {
                var subdominioIntIds = new List<int>();
                if (!string.IsNullOrEmpty(subdominioIds))
                    subdominioIntIds = subdominioIds.Split('|').Select(x => int.Parse(x)).ToList();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join d in ctx.Dominio on s.DominioId equals d.DominioId
                                       //join f in ctx.Familia on u.FamiliaId equals f.FamiliaId into ljf
                                       //from f in ljf.DefaultIfEmpty()
                                       where u.Activo && s.Activo && d.Activo //&& f.Activo
                                       && (string.IsNullOrEmpty(filtro) || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper()))
                                       && (string.IsNullOrEmpty(subdominioIds) || subdominioIntIds.Contains(u.SubdominioId))
                                       //&& u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       orderby u.Nombre
                                       select new CustomAutocompleteRelacion()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia,
                                           TipoTecnologia = t.Nombre,
                                           FechaFinSoporte = u.FechaFinSoporte,
                                           Dominio = d.Nombre,
                                           Subdominio = s.Nombre
                                       }).ToList();

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocompleteTecnologia> GetTecnologiaArquetipoByClaveTecnologia(string filtro)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join d in ctx.Dominio on s.DominioId equals d.DominioId
                                       join f in ctx.Familia on u.FamiliaId equals f.FamiliaId
                                       where u.Activo && s.Activo && d.Activo && f.Activo
                                       && (string.IsNullOrEmpty(filtro) || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper()))
                                       && u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       orderby u.Nombre
                                       select new CustomAutocompleteTecnologia()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia,
                                           Dominio = d.Nombre,
                                           Subdominio = s.Nombre,
                                           Familia = f.Nombre,
                                           ActivoDetalle = u.Activo ? "Activo" : "Inactivo"
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro)"
                    , new object[] { null });
            }
        }

        public override bool CambiarFlagEquivalencia(int id, string usuario)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var itemBD = (from u in ctx.TecnologiaEquivalencia
                                      where u.TecnologiaEquivalenciaId == id
                                      select u).FirstOrDefault();

                        if (itemBD != null)
                        {
                            itemBD.FlagActivo = false;
                            itemBD.FechaModificacion = DateTime.Now;
                            itemBD.ModificadoPor = usuario;

                            ctx.SaveChanges();
                            scope.Complete();

                            return true;
                        }
                        else
                            return false;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarFlagEquivalencia(int id, string usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarFlagEquivalencia(int id, string usuario)"
                    , new object[] { null });
            }
        }

        public override bool ExisteClaveTecnologia(string clave, int? id, int? flagActivo)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        bool? estado = (from u in ctx.Tecnologia
                                        where (u.Activo == (flagActivo != null))
                                        && u.ClaveTecnologia.ToUpper() == clave.ToUpper()
                                        && (id == null || u.TecnologiaId != id.Value)
                                        select true).FirstOrDefault();

                        return estado == true;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteClaveTecnologia(string clave, int? id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteClaveTecnologia(string clave, int? id)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocompleteTecnologiaVinculada> GetAllTecnologia(string filtro, int? id, int[] idsTec)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join d in ctx.Dominio on s.DominioId equals d.DominioId
                                       join f in ctx.Familia on u.FamiliaId equals f.FamiliaId
                                       where u.Activo && s.Activo && d.Activo && f.Activo
                                       && (id == null || u.TecnologiaId != id)
                                       && (string.IsNullOrEmpty(filtro) || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper()))
                                       && u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       && (idsTec.Count() == 0 || !idsTec.Contains(u.TecnologiaId))
                                       orderby u.Nombre
                                       select new CustomAutocompleteTecnologiaVinculada()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           Familia = f.Nombre,
                                           Dominio = d.Nombre,
                                           Subdominio = s.Nombre,
                                           value = u.ClaveTecnologia
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocompleteTecnologiaVinculada> GetAllTecnologia(string filtro, int? id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocompleteTecnologiaVinculada> GetAllTecnologia(string filtro, int? id)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro, int? id, string dominioIds = null, string subDominioIds = null)
        {
            try
            {
                IEnumerable<int> listaDominioIds = string.IsNullOrEmpty(dominioIds) ? Enumerable.Empty<int>() : dominioIds.Split(',').Select(x => int.Parse(x)).AsEnumerable();
                IEnumerable<int> listaSubDominioIds = string.IsNullOrEmpty(subDominioIds) ? Enumerable.Empty<int>() : subDominioIds.Split(',').Select(x => int.Parse(x)).AsEnumerable();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join b in ctx.Subdominio on u.SubdominioId equals b.SubdominioId
                                       //join a in ctx.Dominio on b.DominioId equals a.DominioId
                                       where u.Activo
                                       && !u.FlagEliminado
                                       && u.TecnologiaId != id
                                       && (string.IsNullOrEmpty(filtro) || (u.ClaveTecnologia).ToUpper().Contains(filtro.ToUpper()))
                                       && (u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado) 
                                       && 
                                         (listaDominioIds.Contains(b.DominioId) || listaDominioIds.Count() == 0) &&
                                         (listaSubDominioIds.Contains(b.SubdominioId) || listaSubDominioIds.Count() == 0)
                                       //orderby u.Nombre
                                       orderby u.ClaveTecnologia
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro, int? id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro, int? id)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetTecnologiaForBusqueda(string filtro, int? id, bool flagActivo)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       where u.Activo == flagActivo
                                       && (string.IsNullOrEmpty(filtro)
                                       || (u.ClaveTecnologia).ToUpper().Contains(filtro.ToUpper())
                                       || u.Nombre.ToUpper().Contains(filtro.ToUpper()))
                                       && (id == null || u.TecnologiaId != id.Value)
                                       orderby u.ClaveTecnologia
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaForBusqueda(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaForBusqueda(string filtro)"
                    , new object[] { null });
            }
        }

        private int GetMesesObsolescencia()
        {
            var parametroMeses = int.Parse(ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES").Valor);

            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var tipoCicloDefault = ctx.TipoCicloVida.FirstOrDefault(x => x.FlagActivo && !x.FlagEliminado && x.FlagDefault);
                    if (tipoCicloDefault != null)
                        return tipoCicloDefault.NroPeriodosEstadoAmbar;
                    else
                        return parametroMeses;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorEntornoDTO
                    , "Error en el metodo: int AddOrEditEntorno(EntornoDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorEntornoDTO
                    , "Error en el metodo: int AddOrEditEntorno(EntornoDTO objeto)"
                    , new object[] { null });
            }
        }

        #region Dashboard
        public override FiltrosDashboardTecnologia ListFiltrosDashboard()
        {
            try
            {
                FiltrosDashboardTecnologia arr_data = null;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        arr_data = new FiltrosDashboardTecnologia();


                        arr_data.Dominio = (from t in ctx.Tecnologia
                                            join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                            join d in ctx.Dominio on s.DominioId equals d.DominioId
                                            where t.Activo
                                            && s.Activo && d.Activo
                                            select new CustomAutocomplete()
                                            {
                                                Id = d.DominioId.ToString(),
                                                Descripcion = d.Nombre
                                            }).Distinct().OrderBy(z => z.Descripcion).ToList();

                        arr_data.Subdominio = (from t in ctx.Tecnologia
                                               join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                               join d in ctx.Dominio on s.DominioId equals d.DominioId
                                               where t.Activo
                                               //&& t.EstadoId == (int)EstadoTecnologia.Aprobado
                                               && s.Activo
                                               //group s by new { s.SubdominioId, s.Nombre, s.DominioId, Dominio = d.Nombre } into grp
                                               select new CustomAutocomplete()
                                               {
                                                   Id = s.SubdominioId.ToString(),
                                                   Descripcion = s.Nombre,
                                                   TipoId = s.DominioId.ToString(),
                                                   TipoDescripcion = d.Nombre
                                               }).Distinct().OrderBy(z => z.Descripcion).ToList();

                        arr_data.TipoEquipo = (from te in ctx.TipoEquipo
                                               where te.FlagActivo
                                               //orderby te.Nombre
                                               select new CustomAutocomplete()
                                               {
                                                   Id = te.TipoEquipoId.ToString(),
                                                   Descripcion = te.Nombre
                                               }).OrderBy(z => z.Descripcion).ToList();

                        arr_data.DominioRed = (from te in ctx.DominioServidor
                                               where te.Activo
                                               //orderby te.Nombre
                                               select new CustomAutocomplete()
                                               {
                                                   Id = te.DominioId.ToString(),
                                                   Descripcion = te.Nombre
                                               }).OrderBy(z => z.Descripcion).ToList();

                        var listAgrupacion = Utilitarios.EnumToList<Agrupacion>().ToList();
                        arr_data.AgrupacionFiltro = (from ag in listAgrupacion
                                                     select new CustomAutocomplete()
                                                     {
                                                         Id = Utilitarios.GetEnumDescription2(ag),
                                                         Descripcion = Utilitarios.GetEnumDescription2(ag),
                                                     }).ToList();

                        arr_data.EstadoAplicacion = (from a in ctx.Aplicacion
                                                     select new CustomAutocomplete()
                                                     {
                                                         Id = a.EstadoAplicacion,
                                                         Descripcion = a.EstadoAplicacion
                                                     }).Distinct().ToList();

                        arr_data.TipoTecnologia = (from a in ctx.Tipo
                                                   where a.Activo
                                                   select new CustomAutocomplete()
                                                   {
                                                       Id = a.TipoId.ToString(),
                                                       Descripcion = a.Nombre
                                                   }).Distinct().ToList();

                        var listTipoConsulta = Utilitarios.EnumToList<ETipoConsulta>();
                        //arr_data.TipoConsulta = listTipoConsulta.Select(x => new CustomAutocomplete { Id = x.ToString(), Descripcion = Utilitarios.GetEnumDescription2(x) }).ToList();
                        arr_data.TipoConsulta = listTipoConsulta.Select(x => new CustomAutocompleteConsulta { Id = (int)x, Descripcion = Utilitarios.GetEnumDescription2(x) }).ToList();
                        //arr_data.TipoConsulta = Fuente;
                        //arr_data.TipoConsulta = (from ag in listTipoConsulta
                        //                         select new CustomAutocomplete()
                        //                         {
                        //                             Id = ag
                        //                             Descripcion = Utilitarios.GetEnumDescription2(ag),
                        //                         }).ToList();

                    }
                    return arr_data;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboard()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboard()"
                    , new object[] { null });
            }
        }
        public override FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominio(List<int> idsSubdominio)
        {
            try
            {
                FiltrosDashboardTecnologia arr_data = null;
                var arrIdsSubdominios = idsSubdominio.ToArray();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        arr_data = new FiltrosDashboardTecnologia();

                        arr_data.Familia = (from t in ctx.Tecnologia
                                            join f in ctx.Familia on t.FamiliaId equals f.FamiliaId
                                            join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                            where t.Activo
                                            && f.Activo
                                            && arrIdsSubdominios.Contains(t.SubdominioId)
                                            select new CustomAutocomplete()
                                            {
                                                Id = f.FamiliaId.ToString(),
                                                Descripcion = f.Nombre,
                                                //TipoId = s.SubdominioId.ToString(),
                                                //TipoDescripcion = s.Nombre
                                            }).Distinct().OrderBy(z => z.Descripcion).ToList();



                        arr_data.Fabricante = (from t in ctx.Tecnologia
                                               join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                               where t.Activo
                                               && !string.IsNullOrEmpty(t.Fabricante)
                                               && arrIdsSubdominios.Contains(t.SubdominioId)
                                               //orderby s.Nombre, t.Fabricante
                                               select new CustomAutocomplete()
                                               {
                                                   Id = t.Fabricante,
                                                   Descripcion = t.Fabricante,
                                                   //TipoId = s.SubdominioId.ToString(),
                                                   //TipoDescripcion = s.Nombre
                                               }).Distinct().OrderBy(z => z.Descripcion).ToList();


                        arr_data.ClaveTecnologia = (from t in ctx.Tecnologia
                                                    join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                                    where t.Activo
                                                    && !string.IsNullOrEmpty(t.ClaveTecnologia)
                                                   && arrIdsSubdominios.Contains(t.SubdominioId)
                                                    select new CustomAutocompleteTecnologia()
                                                    {
                                                        Id = t.ClaveTecnologia,
                                                        Descripcion = t.ClaveTecnologia,
                                                        //TipoId = s.SubdominioId.ToString(),
                                                        //TipoDescripcion = s.Nombre,
                                                        //FamiliaId = t.FamiliaId,
                                                        //Fabricante = t.Fabricante
                                                    }).Distinct().OrderBy(z => z.Descripcion).ToList();


                    }
                    return arr_data;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominio()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominio()"
                    , new object[] { null });
            }
        }
        public override FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominioXFabricante(List<int> idsSubdominio, List<string> idsFabricante)
        {
            try
            {
                FiltrosDashboardTecnologia arr_data = null;
                var arrIdsSubdominios = idsSubdominio.ToArray();
                var arrIdsFabricante = idsFabricante.ToArray();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        arr_data = new FiltrosDashboardTecnologia();


                        arr_data.ClaveTecnologia = (from t in ctx.Tecnologia
                                                    join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                                    where t.Activo
                                                    && !string.IsNullOrEmpty(t.ClaveTecnologia)
                                                    && arrIdsSubdominios.Contains(t.SubdominioId)
                                                    && arrIdsFabricante.Contains(t.Fabricante)
                                                    select new CustomAutocompleteTecnologia()
                                                    {
                                                        Id = t.ClaveTecnologia,
                                                        Descripcion = t.ClaveTecnologia,
                                                        TipoId = s.SubdominioId.ToString(),
                                                        TipoDescripcion = s.Nombre,
                                                        FamiliaId = t.FamiliaId,
                                                        Fabricante = t.Fabricante
                                                    }).Distinct().OrderBy(z => z.Descripcion).ToList();


                    }
                    return arr_data;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominio()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominio()"
                    , new object[] { null });
            }
        }


        public override List<DashboardBase> GetReport(FiltrosDashboardTecnologia filtros, bool isExportar = false)
        {
            try
            {
                List<DashboardBase> dashboardBase = null;
                try
                {
                    filtros.FechaFiltro = DateTime.ParseExact(filtros.Fecha, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                }
                catch (Exception)
                {
                    filtros.FechaFiltro = DateTime.Now;
                }

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {

                        int DIA = filtros.FechaFiltro.Day;
                        int MES = filtros.FechaFiltro.Month;
                        int ANIO = filtros.FechaFiltro.Year;
                        DateTime fechaActual = new DateTime(ANIO, MES, DIA);
                        int MESES_CERCA_FIN_SOPORTE = 12; //2 MESES
                                                          //int MESES_vigente = 2; //2 MESES

                        //DateTime FECHA_2MESES = DateTime.Now.AddMonths(2);
                        //DateTime FECHA_12MESES = DateTime.Now.AddMonths(12);

                        if (filtros.SubdominioFiltrar == null) filtros.SubdominioFiltrar = new List<int>();
                        if (filtros.DominioFiltrar == null) filtros.DominioFiltrar = new List<int>();
                        if (filtros.ClaveTecnologiaFiltrar == null) filtros.ClaveTecnologiaFiltrar = new List<string>();
                        if (filtros.FabricanteFiltrar == null) filtros.FabricanteFiltrar = new List<string>();
                        if (filtros.FamiliaFiltrar == null) filtros.FamiliaFiltrar = new List<int>();
                        if (filtros.TipoEquipoFiltrar == null) filtros.TipoEquipoFiltrar = new List<int>();
                        if (filtros.SubsidiariaFiltrar == null) filtros.SubsidiariaFiltrar = new List<string>();

                        var tecnologia = (from t in ctx.Tecnologia
                                          join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                          join d in ctx.Dominio on s.DominioId equals d.DominioId
                                          where t.Activo && s.Activo && d.Activo
                                          && (filtros.SubdominioFiltrar.Count == 0 || filtros.SubdominioFiltrar.Contains(s.SubdominioId))
                                          && (filtros.DominioFiltrar.Count == 0 || filtros.DominioFiltrar.Contains(d.DominioId))
                                          && (filtros.FabricanteFiltrar.Count == 0 || filtros.FabricanteFiltrar.Contains(t.Fabricante))
                                          && (filtros.ClaveTecnologiaFiltrar.Count == 0 || filtros.ClaveTecnologiaFiltrar.Contains(t.ClaveTecnologia))
                                          && (filtros.FamiliaFiltrar.Count == 0 || filtros.FamiliaFiltrar.Contains(t.FamiliaId.Value))
                                          select new
                                          {
                                              t.TecnologiaId,
                                              t.ClaveTecnologia
                                          }).ToList();

                        List<int> tecnologiaIds = tecnologia.Select(x => x.TecnologiaId).ToList();
                        if (tecnologiaIds == null) tecnologiaIds = new List<int>();

                        var tecnologiaCicloVida = (from tcv in ctx.TecnologiaCicloVida
                                                   where (tecnologiaIds.Count == 0 || tecnologiaIds.Contains(tcv.TecnologiaId))
                                                   && tcv.DiaRegistro == DIA && tcv.MesRegistro == MES && tcv.AnioRegistro == ANIO
                                                   select new
                                                   {
                                                       tcv.TecnologiaId,
                                                       tcv.FechaCalculoBase,
                                                       tcv.Obsoleto,
                                                       tcv.EsIndefinida
                                                   }).ToList();

                        var equipoTecnologiaTmp = (from et in ctx.EquipoTecnologia
                                                   join e in ctx.Equipo on et.EquipoId equals e.EquipoId
                                                   where (tecnologiaIds.Count == 0 || tecnologiaIds.Contains(et.TecnologiaId))
                                                   && e.FlagActivo && !e.FlagExcluirCalculo.Value
                                                   && et.FlagActivo &&
                                                   et.DiaRegistro == DIA && et.MesRegistro == MES && et.AnioRegistro == ANIO
                                                   && (filtros.TipoEquipoFiltrar.Count == 0 || filtros.TipoEquipoFiltrar.Contains(e.TipoEquipoId.Value))
                                                   && (filtros.SubsidiariaFiltrar.Count == 0 || filtros.SubsidiariaFiltrar.Contains(e.DominioServidorId.Value.ToString()))
                                                   select et.TecnologiaId);

                        var equipoTecnologia = equipoTecnologiaTmp.ToList();
                        if (tecnologiaCicloVida != null && equipoTecnologia != null)
                        {
                            var listEstadoTecnologia = Utilitarios.EnumToList<EDashboardEstadoTecnologia>();
                            dashboardBase = new List<DashboardBase>();

                            List<int> tecnologiaCicloVidaTecIds = tecnologiaCicloVida.Select(x => x.TecnologiaId).ToList();

                            foreach (var itemEnum in listEstadoTecnologia)
                            {
                                List<CustomAutocomplete> data = new List<CustomAutocomplete>();
                                int _TipoId = 0;
                                string _TipoDescripcion = Utilitarios.GetEnumDescription2(itemEnum);
                                string _Color = Utilitarios.GetEnumDescription2((EDashboardEstadoTecnologiaColor)itemEnum);
                                switch (itemEnum)
                                {
                                    case EDashboardEstadoTecnologia.CercaFinSoporte:
                                        {
                                            _TipoId = (int)EDashboardEstadoTecnologia.CercaFinSoporte;
                                            data = tecnologiaCicloVida
                                                .Join(tecnologia, x => x.TecnologiaId, y => y.TecnologiaId, (x, y) => new { TecnologiaId = x.TecnologiaId, ClaveTecnologia = y.ClaveTecnologia, FechaCalculoBase = x.FechaCalculoBase, Obsoleto = x.Obsoleto, EsIndefinida = x.EsIndefinida })
                                                .Where(x => Utilitarios.GetMonthDifference(fechaActual, x.FechaCalculoBase) <= MESES_CERCA_FIN_SOPORTE && x.Obsoleto == 0 && !x.EsIndefinida)
                                                .Select(x => new CustomAutocomplete()
                                                {
                                                    Id = x.TecnologiaId.ToString(),
                                                    Descripcion = x.ClaveTecnologia,
                                                    TipoId = _TipoId.ToString(),
                                                    TipoDescripcion = _TipoDescripcion,
                                                    Color = _Color,
                                                    value = equipoTecnologia.Count(y => y == x.TecnologiaId).ToString(),
                                                    Total = equipoTecnologia.Count(y => y == x.TecnologiaId)
                                                }).ToList();

                                            data = (from a in data
                                                    join b in equipoTecnologia on a.Id equals b.ToString()
                                                    select a).Distinct().ToList();
                                        }
                                        break;
                                    case EDashboardEstadoTecnologia.NoVigente:
                                        {
                                            _TipoId = (int)EDashboardEstadoTecnologia.NoVigente;
                                            data = tecnologiaCicloVida
                                                .Join(tecnologia, x => x.TecnologiaId, y => y.TecnologiaId, (x, y) => new { TecnologiaId = x.TecnologiaId, ClaveTecnologia = y.ClaveTecnologia, FechaCalculoBase = x.FechaCalculoBase, Obsoleto = x.Obsoleto, EsIndefinida = x.EsIndefinida })
                                                .Where(x => x.Obsoleto == 1)
                                                .Select(x => new CustomAutocomplete()
                                                {
                                                    Id = x.TecnologiaId.ToString(),
                                                    Descripcion = x.ClaveTecnologia,
                                                    TipoId = _TipoId.ToString(),
                                                    TipoDescripcion = _TipoDescripcion,
                                                    Color = _Color,
                                                    value = equipoTecnologia.Count(y => y == x.TecnologiaId).ToString(),
                                                    Total = equipoTecnologia.Count(y => y == x.TecnologiaId)
                                                }).ToList();

                                            data = (from a in data
                                                    join b in equipoTecnologia on a.Id equals b.ToString()
                                                    select a).Distinct().ToList();
                                        }
                                        break;
                                    case EDashboardEstadoTecnologia.Vigente:
                                        {
                                            _TipoId = (int)EDashboardEstadoTecnologia.Vigente;
                                            data = tecnologiaCicloVida
                                                .Join(tecnologia, x => x.TecnologiaId, y => y.TecnologiaId, (x, y) => new { TecnologiaId = x.TecnologiaId, ClaveTecnologia = y.ClaveTecnologia, FechaCalculoBase = x.FechaCalculoBase, Obsoleto = x.Obsoleto, EsIndefinida = x.EsIndefinida })
                                                .Where(x => Utilitarios.GetMonthDifference(fechaActual, x.FechaCalculoBase) > MESES_CERCA_FIN_SOPORTE && x.Obsoleto == 0)
                                                .Select(x => new CustomAutocomplete()
                                                {
                                                    Id = x.TecnologiaId.ToString(),
                                                    Descripcion = x.ClaveTecnologia,
                                                    TipoId = _TipoId.ToString(),
                                                    TipoDescripcion = _TipoDescripcion,
                                                    Color = _Color,
                                                    value = equipoTecnologia.Count(y => y == x.TecnologiaId).ToString(),
                                                    Total = equipoTecnologia.Count(y => y == x.TecnologiaId)
                                                }).ToList();
                                            var data2 = tecnologiaCicloVida
                                                .Join(tecnologia, x => x.TecnologiaId, y => y.TecnologiaId, (x, y) => new { TecnologiaId = x.TecnologiaId, ClaveTecnologia = y.ClaveTecnologia, FechaCalculoBase = x.FechaCalculoBase, Obsoleto = x.Obsoleto, EsIndefinida = x.EsIndefinida })
                                                .Where(x => x.EsIndefinida)
                                                .Select(x => new CustomAutocomplete()
                                                {
                                                    Id = x.TecnologiaId.ToString(),
                                                    Descripcion = x.ClaveTecnologia,
                                                    TipoId = _TipoId.ToString(),
                                                    TipoDescripcion = _TipoDescripcion,
                                                    Color = _Color,
                                                    value = equipoTecnologia.Count(y => y == x.TecnologiaId).ToString(),
                                                    Total = equipoTecnologia.Count(y => y == x.TecnologiaId)
                                                }).ToList();
                                            data.AddRange(data2);

                                            data = (from a in data
                                                    join b in equipoTecnologia on a.Id equals b.ToString()
                                                    select a).Distinct().ToList();
                                            //data = data.Distinct().ToList();
                                        }
                                        break;
                                    case EDashboardEstadoTecnologia.SinInformacion:
                                        {
                                            _TipoId = (int)EDashboardEstadoTecnologia.SinInformacion;
                                            data = tecnologiaCicloVida
                                                .Join(tecnologia, x => x.TecnologiaId, y => y.TecnologiaId, (x, y) => new { TecnologiaId = x.TecnologiaId, ClaveTecnologia = y.ClaveTecnologia, FechaCalculoBase = x.FechaCalculoBase, Obsoleto = x.Obsoleto })
                                                .Where(x => !tecnologiaCicloVidaTecIds.Contains(x.TecnologiaId))
                                                .Select(x => new CustomAutocomplete()
                                                {
                                                    Id = x.TecnologiaId.ToString(),
                                                    Descripcion = x.ClaveTecnologia,
                                                    TipoId = _TipoId.ToString(),
                                                    TipoDescripcion = _TipoDescripcion,
                                                    Color = _Color,
                                                    value = equipoTecnologia.Count(y => y == x.TecnologiaId).ToString(),
                                                    Total = equipoTecnologia.Count(y => y == x.TecnologiaId)
                                                }).ToList();

                                            data = (from a in data
                                                    join b in equipoTecnologia on a.Id equals b.ToString()
                                                    select a).Distinct().ToList();
                                        }
                                        break;
                                    default:
                                        break;
                                }
                                int _paramTop = int.Parse(ServiceManager<ParametroDAO>.Provider.ObtenerParametro("TOP_REGISTROS_DASHBOARD_TECNOLOGIA").Valor);
                                int _Cantidad = data.Count;
                                data = data.Where(x => x.value != "0").ToList();
                                if (data.Count > _paramTop && !isExportar)
                                {
                                    // el sexto concatenar
                                    int cantidadOtros = 0;
                                    int indice = 0;

                                    data = data.OrderByDescending(x => x.Total).ToList();

                                    foreach (var item in data)
                                    {
                                        indice++;
                                        if (indice > _paramTop)
                                        {
                                            cantidadOtros += int.Parse(item.value);

                                        }
                                    }

                                    var nroTecnologiasOtros = data.Count - _paramTop;
                                    data = data.Take(_paramTop).ToList();
                                    data = data.OrderBy(x => x.Total).ToList();
                                    data.Insert(0, (new CustomAutocomplete()
                                    {
                                        //Descripcion = "Otras tecnologías" + cantidadOtros + "... " + _TipoDescripcion,
                                        Descripcion = string.Format("Otras {0} tecnologías ... {1}", nroTecnologiasOtros, _TipoDescripcion),
                                        TipoId = _TipoId.ToString(),
                                        TipoDescripcion = _TipoDescripcion,
                                        Color = _Color,
                                        value = cantidadOtros.ToString(),
                                        Total = cantidadOtros
                                    }));
                                }
                                else
                                {
                                    data = data.OrderBy(x => x.Total).ToList();
                                }

                                dashboardBase.Add(new DashboardBase()
                                {
                                    TipoId = _TipoId.ToString(),
                                    TipoDescripcion = _TipoDescripcion,
                                    Color = _Color,
                                    Data = data,
                                    Cantidad = _Cantidad
                                });
                            }
                        }
                    }
                    return dashboardBase;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: DashboardBase GetReport(FiltrosDashboardTecnologia filtros)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: DashboardBase GetReport(FiltrosDashboardTecnologia filtros)"
                    , new object[] { null });
            }
        }

        public override List<ReporteDetalladoSubdominioDto> GetReportEquipos(FiltrosDashboardTecnologia filtros)
        {
            try
            {
                try
                {
                    filtros.FechaFiltro = DateTime.ParseExact(filtros.Fecha, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                }
                catch (Exception)
                {
                    filtros.FechaFiltro = DateTime.Now;
                }

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {

                        int DIA = filtros.FechaFiltro.Day;
                        int MES = filtros.FechaFiltro.Month;
                        int ANIO = filtros.FechaFiltro.Year;

                        if (filtros.SubdominioFiltrar == null) filtros.SubdominioFiltrar = new List<int>();
                        if (filtros.DominioFiltrar == null) filtros.DominioFiltrar = new List<int>();
                        if (filtros.ClaveTecnologiaFiltrar == null) filtros.ClaveTecnologiaFiltrar = new List<string>();
                        if (filtros.FabricanteFiltrar == null) filtros.FabricanteFiltrar = new List<string>();
                        if (filtros.FamiliaFiltrar == null) filtros.FamiliaFiltrar = new List<int>();
                        if (filtros.TipoEquipoFiltrar == null) filtros.TipoEquipoFiltrar = new List<int>();
                        if (filtros.SubsidiariaFiltrar == null) filtros.SubsidiariaFiltrar = new List<string>();

                        //var tecnologia = (from t in ctx.Tecnologia
                        //                  join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                        //                  join d in ctx.Dominio on s.DominioId equals d.DominioId
                        //                  where t.Activo && s.Activo && d.Activo
                        //                  && (filtros.SubdominioFiltrar.Count == 0 || filtros.SubdominioFiltrar.Contains(s.SubdominioId))
                        //                  && (filtros.DominioFiltrar.Count == 0 || filtros.DominioFiltrar.Contains(d.DominioId))
                        //                  && (filtros.FabricanteFiltrar.Count == 0 || filtros.FabricanteFiltrar.Contains(t.Fabricante))
                        //                  && (filtros.ClaveTecnologiaFiltrar.Count == 0 || filtros.ClaveTecnologiaFiltrar.Contains(t.ClaveTecnologia))
                        //                  && (filtros.FamiliaFiltrar.Count == 0 || filtros.FamiliaFiltrar.Contains(t.FamiliaId.Value))

                        //                  select t).ToList();

                        //List<int> tecnologiaIds = tecnologia.Select(x => x.TecnologiaId).ToList();
                        //if (tecnologiaIds == null) tecnologiaIds = new List<int>();

                        var equipoTecnologia = (from et in ctx.EquipoTecnologia
                                                join e in ctx.Equipo on et.EquipoId equals e.EquipoId
                                                join d in ctx.TipoEquipo on e.TipoEquipoId equals d.TipoEquipoId
                                                join f in ctx.Tecnologia on et.TecnologiaId equals f.TecnologiaId
                                                join g in ctx.TecnologiaCicloVida on new { f.TecnologiaId, Anio = ANIO, Mes = MES, Dia = DIA } equals new { g.TecnologiaId, Anio = g.AnioRegistro, Mes = g.MesRegistro, Dia = g.DiaRegistro }
                                                join s in ctx.Subdominio on f.SubdominioId equals s.SubdominioId
                                                join r in ctx.Dominio on s.DominioId equals r.DominioId

                                                where e.FlagActivo && !e.FlagExcluirCalculo.Value && f.Activo && s.Activo && r.Activo
                                                && et.FlagActivo && et.DiaRegistro == DIA && et.MesRegistro == MES && et.AnioRegistro == ANIO
                                                && (filtros.SubdominioFiltrar.Count == 0 || filtros.SubdominioFiltrar.Contains(s.SubdominioId))
                                                && (filtros.DominioFiltrar.Count == 0 || filtros.DominioFiltrar.Contains(r.DominioId))
                                                && (filtros.FabricanteFiltrar.Count == 0 || filtros.FabricanteFiltrar.Contains(f.Fabricante))
                                                && (filtros.ClaveTecnologiaFiltrar.Count == 0 || filtros.ClaveTecnologiaFiltrar.Contains(f.ClaveTecnologia))
                                                && (filtros.FamiliaFiltrar.Count == 0 || filtros.FamiliaFiltrar.Contains(f.FamiliaId.Value))
                                                && (filtros.TipoEquipoFiltrar.Count == 0 || filtros.TipoEquipoFiltrar.Contains(e.TipoEquipoId.Value))
                                                && (filtros.SubsidiariaFiltrar.Count == 0 || filtros.SubsidiariaFiltrar.Contains(e.DominioServidorId.Value.ToString()))
                                                select new ReporteDetalladoSubdominioDto
                                                {
                                                    TipoEquipo = d.Nombre,
                                                    Nombre = e.Nombre,
                                                    Subdominio = s.Nombre,
                                                    Dominio = r.Nombre,
                                                    ClaveTecnologia = f.ClaveTecnologia,
                                                    FechaCalculoBase = g.FechaCalculoBase,
                                                    Obsoleto = g.Obsoleto,
                                                    FlagFechaFinSoporte = f.FlagFechaFinSoporte,
                                                    TipoTecnologiaId = f.TipoTecnologia.HasValue ? f.TipoTecnologia.Value : 0
                                                }).ToList();

                        return equipoTecnologia;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: DashboardBase GetReport(FiltrosDashboardTecnologia filtros)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: DashboardBase GetReport(FiltrosDashboardTecnologia filtros)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetTecnologiasXEstado(List<int> idEstados, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join s in ctx.Subdominio on new { u.SubdominioId, Activo = true } equals new { s.SubdominioId, Activo = s.Activo } into lj1
                                         from s in lj1.DefaultIfEmpty()
                                         join d in ctx.Dominio on new { s.DominioId, Activo = true } equals new { d.DominioId, Activo = d.Activo } into lj2
                                         from d in lj1.DefaultIfEmpty()
                                         where u.Activo
                                         && idEstados.Contains(u.EstadoTecnologia)
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             Nombre = u.Nombre,
                                             Dominio = d == null ? "-" : d.Nombre,
                                             Subdominio = d == null ? "-" : s.Nombre,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             FechaCreacion = u.FechaCreacion,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             Activo = u.Activo
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasXEstado(List<int> idEstados, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasXEstado(List<int> idEstados, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetTecnologiasSinEquivalencia(int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var fechaActual = new DateTime().Date;

                        var registros = (from u in ctx.Tecnologia
                                         join s in ctx.Subdominio on new { u.SubdominioId, Activo = true } equals new { s.SubdominioId, Activo = s.Activo } into lj1
                                         from s in lj1.DefaultIfEmpty()
                                         join d in ctx.Dominio on new { s.DominioId, Activo = true } equals new { d.DominioId, Activo = d.Activo } into lj2
                                         from d in lj1.DefaultIfEmpty()
                                         join f in ctx.Familia on new { FamiliaId = u.FamiliaId.Value, Activo = true } equals new { f.FamiliaId, Activo = f.Activo } into lj3
                                         from f in lj3.DefaultIfEmpty()
                                         where u.Activo
                                         && !ctx.TecnologiaEquivalencia.Any(gi => gi.TecnologiaId == u.TecnologiaId)
                                         orderby u.Nombre
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             Nombre = u.Nombre,
                                             Familia = f == null ? "-" : f.Nombre,
                                             Dominio = d == null ? "-" : d.Nombre,
                                             Subdominio = d == null ? "-" : s.Nombre,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             FechaCreacion = u.FechaCreacion,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             Activo = u.Activo,
                                             NroInstancias = (from et in ctx.EquipoTecnologia
                                                              where et.FlagActivo && et.TecnologiaId == u.TecnologiaId
                                                              && et.DiaRegistro == fechaActual.Day && et.MesRegistro == fechaActual.Month && et.AnioRegistro == fechaActual.Year
                                                              select 1).Count()
                                             + (from ex in ctx.Excepcion where ex.FlagActivo && ex.TecnologiaId == u.TecnologiaId select 1).Count()
                                             + (from rd in ctx.RelacionDetalle
                                                join r in ctx.Relacion on rd.RelacionId equals r.RelacionId
                                                where rd.FlagActivo && r.FlagActivo && rd.TecnologiaId == u.TecnologiaId
                                                && r.DiaRegistro == fechaActual.Day && r.MesRegistro == fechaActual.Month && r.AnioRegistro == fechaActual.Year
                                                select 1).Count()
                                             + (from tv in ctx.TecnologiaVinculada
                                                join t in ctx.Tecnologia on tv.TecnologiaId equals u.TecnologiaId
                                                where tv.Activo && tv.VinculoId == u.TecnologiaId && t.Activo
                                                select 1).Count()
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasSinEquivalencia(int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasSinEquivalencia(int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetTecnologiasSinFechasSoporte(int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId into lj1
                                         from s in lj1.DefaultIfEmpty()
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId into lj2
                                         from d in lj1.DefaultIfEmpty()
                                         join f in ctx.Familia on u.FamiliaId equals f.FamiliaId into lj3
                                         from f in lj3.DefaultIfEmpty()
                                         where u.Activo && s.Activo && d.Activo
                                         && u.FlagFechaFinSoporte == true
                                         && !u.FechaFinSoporte.HasValue
                                         && !u.FechaAcordada.HasValue
                                         && !u.FechaExtendida.HasValue

                                         orderby u.Nombre
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             Nombre = u.Nombre,
                                             Familia = f == null ? "-" : f.Nombre,
                                             Dominio = d == null ? "-" : d.Nombre,
                                             Subdominio = d == null ? "-" : s.Nombre,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             FechaCalculoTec = u.FechaCalculoTec,
                                             FechaCreacion = u.FechaCreacion,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             Activo = u.Activo
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasSinFechasSoporte(int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasSinFechasSoporte(int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaDTO> GetTecnologiaByEquipoId(int equipoId, string fecha, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaDTO>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    if (string.IsNullOrEmpty(fecha)) fecha = DateTime.Now.ToString("dd/MM/yyyy");

                    DateTime fechaFiltro = DateTime.Now;
                    try
                    {
                        fechaFiltro = DateTime.ParseExact(fecha, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                    }
                    catch (Exception)
                    {
                        fechaFiltro = DateTime.Now;
                    }

                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_list_by_equipo]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@equipoId", ((object)equipoId) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@anioRegistro", ((object)fechaFiltro.Year) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@mesRegistro", ((object)fechaFiltro.Month) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@diaRegistro", ((object)fechaFiltro.Day) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@pageNumber", ((object)pageNumber) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@pageSize", ((object)pageSize) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@sortName", ((object)sortName) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@sortOrder", ((object)sortOrder) ?? DBNull.Value);

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaDTO()
                            {
                                Id = reader.GetData<int>("Id"),
                                ClaveTecnologia = reader.GetData<string>("ClaveTecnologia"),
                                DominioNomb = reader.GetData<string>("DominioNomb"),
                                SubdominioNomb = reader.GetData<string>("SubdominioNomb"),
                                FechaCalculoBase = reader.GetData<DateTime?>("FechaCalculoBase"),
                                Obsoleto = reader.GetData<bool>("Obsoleto"),
                                ObsolescenciaTecnologia = reader.GetData<decimal?>("ObsolescenciaTecnologia"),
                                ObsolescenciaTecnologiaProyectado1 = reader.GetData<decimal?>("ObsolescenciaTecnologiaProyectado1"),
                                ObsolescenciaTecnologiaProyectado2 = reader.GetData<decimal?>("ObsolescenciaTecnologiaProyectado2"),
                                Meses = reader.GetData<int>("Meses"),
                                IndicadorMeses1 = reader.GetData<int>("IndicadorMeses1"),
                                IndicadorMeses2 = reader.GetData<int>("IndicadorMeses2"),
                                FlagFechaFinSoporte = reader.GetData<bool?>("FlagFechaFinSoporte"),
                                TipoTecnologiaId = reader.GetData<int>("TipoTecnologiaId"),
                                TipoTecNomb = reader.GetData<string>("TipoTecNomb"),
                                CantidadVulnerabilidades = reader.GetData<int>("CantidadVulnerabilidades")
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

            //try
            //{
            //    var paramProyeccion1 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES");
            //    var proyeccionMeses1 = int.Parse(paramProyeccion1 != null ? paramProyeccion1.Valor : "12");
            //    var paramProyeccion2 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES_2");
            //    var proyeccionMeses2 = int.Parse(paramProyeccion2 != null ? paramProyeccion2.Valor : "24");

            //    using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
            //    {
            //        using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
            //        {
            //            if (string.IsNullOrEmpty(fecha)) fecha = DateTime.Now.ToString("dd/MM/yyyy");

            //            DateTime fechaFiltro = DateTime.Now;
            //            try
            //            {
            //                fechaFiltro = DateTime.ParseExact(fecha, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            //            }
            //            catch (Exception)
            //            {
            //                fechaFiltro = DateTime.Now;
            //            }

            //            int DIA_REGISTRO = fechaFiltro.Day;
            //            int MES_REGISTRO = fechaFiltro.Month;
            //            int ANIO_REGISTRO = fechaFiltro.Year;
            //            var registros = (from et in ctx.EquipoTecnologia
            //                             join t in ctx.Tecnologia on et.TecnologiaId equals t.TecnologiaId
            //                             join tt in ctx.Tipo on t.TipoTecnologia equals tt.TipoId
            //                             join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
            //                             join d in ctx.Dominio on s.DominioId equals d.DominioId
            //                             join tcv in ctx.TecnologiaCicloVida on new { TecnologiaId = t.TecnologiaId, Anio = ANIO_REGISTRO, Mes = MES_REGISTRO, Dia = DIA_REGISTRO } equals new { TecnologiaId = tcv.TecnologiaId, Anio = tcv.AnioRegistro, Mes = tcv.MesRegistro, Dia = tcv.DiaRegistro }
            //                             where et.EquipoId == equipoId && et.FlagActivo && t.Activo
            //                             //&& tcv.AnioRegistro == ANIO_REGISTRO && tcv.MesRegistro == MES_REGISTRO && tcv.DiaRegistro == DIA_REGISTRO
            //                             && et.AnioRegistro == ANIO_REGISTRO && et.MesRegistro == MES_REGISTRO && et.DiaRegistro == DIA_REGISTRO
            //                             && s.Activo && d.Activo
            //                             //group new { et, t, s, d, tcv } by new { t.TecnologiaId, t.ClaveTecnologia, Dominio = d.Nombre, Subdominio = s.Nombre, tcv.FechaCalculoBase, tcv.Obsoleto } into grp
            //                             select new TecnologiaDTO()
            //                             {
            //                                 Id = t.TecnologiaId,
            //                                 ClaveTecnologia = t.ClaveTecnologia,
            //                                 DominioNomb = d.Nombre,
            //                                 SubdominioNomb = s.Nombre,
            //                                 FechaCalculoBase = tcv.FechaCalculoBase,
            //                                 Obsoleto = tcv.Obsoleto == 1,
            //                                 ObsolescenciaTecnologia = tcv.IndiceObsolescencia,
            //                                 ObsolescenciaTecnologiaProyectado1 = tcv.IndiceObsolescenciaProyectado1,
            //                                 ObsolescenciaTecnologiaProyectado2 = tcv.IndiceObsolescenciaProyectado2,
            //                                 Meses = proyeccionMeses1,
            //                                 IndicadorMeses1 = proyeccionMeses1,
            //                                 IndicadorMeses2 = proyeccionMeses2,
            //                                 FlagFechaFinSoporte = t.FlagFechaFinSoporte,
            //                                 TipoTecnologiaId = t.TipoTecnologia,
            //                                 TipoTecNomb = tt.Nombre,
            //                                 //CantidadVulnerabilidades = (from a in ctx.QualyTecnologia
            //                                 //                            join b in ctx.).Count()
            //                             }).OrderBy(sortName + " " + sortOrder);

            //            totalRows = registros.Count();
            //            var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize);
            //            return resultado.ToList();
            //        }
            //    }
            //}
            //catch (DbEntityValidationException ex)
            //{
            //    log.ErrorEntity(ex);
            //    throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
            //        , "Error en el metodo: List<TecnologiaDTO> GetTecnologiaByEquipoId(int equipoId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
            //        , new object[] { null });
            //}
            //catch (Exception ex)
            //{
            //    log.Error(ex);
            //    throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
            //        , "Error en el metodo: List<TecnologiaDTO> GetTecnologiaByEquipoId(int equipoId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
            //        , new object[] { null });
            //}
        }

        public override List<CustomAutocomplete> GetSistemasOperativoByFiltro(string filtro)
        {
            try
            {
                var parametro = ServiceManager<ParametroDAO>.Provider.ObtenerParametro(Utilitarios.CODIGO_SUBDOMINIO_SISTEMA_OPERATIVO);
                var idSubdominio = parametro != null ? int.Parse(parametro.Valor) : 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {

                        var entidad = (from u in ctx.Tecnologia
                                       where u.Activo && u.SubdominioId == idSubdominio
                                       && u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper())
                                       orderby u.Nombre
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia
                                       }).ToList();

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetSistemasOperativoByFiltro(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetSistemasOperativoByFiltro(string filtro)"
                    , new object[] { null });
            }
        }
        #endregion
        public override List<TecnologiaDTO> GetTecnologiasXAplicacionByCodigoAPT(string codigoAPT, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                var mesesCicloVida = this.GetMesesObsolescencia();
                var paramProyeccion1 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES");
                var proyeccionMeses1 = int.Parse(paramProyeccion1 != null ? paramProyeccion1.Valor : "12");
                var paramProyeccion2 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES_2");
                var proyeccionMeses2 = int.Parse(paramProyeccion2 != null ? paramProyeccion2.Valor : "24");
                var relacionesActivas = new List<int>() {
                    (int)EEstadoRelacion.Aprobado,
                    (int)EEstadoRelacion.PendienteEliminacion
                };

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        DateTime fechaConsulta = DateTime.Now;
                        //Servidor Relacionado

                        var ANIO = DateTime.Now.Year;
                        var MES = DateTime.Now.Month;
                        var DIA = DateTime.Now.Day;

                        var registros = (from r in ctx.Relacion
                                         join rd in ctx.RelacionDetalle on r.RelacionId equals rd.RelacionId
                                         join t in ctx.Tecnologia on rd.TecnologiaId equals t.TecnologiaId
                                         join tt in ctx.Tipo on t.TipoTecnologia equals tt.TipoId
                                         join tcv in ctx.TecnologiaCicloVida on new { TecnologiaId = t.TecnologiaId, Anio = ANIO, Mes = MES, Dia = DIA } equals new { TecnologiaId = tcv.TecnologiaId, Anio = tcv.AnioRegistro, Mes = tcv.MesRegistro, Dia = tcv.DiaRegistro }
                                         join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         join p in ctx.Producto on t.ProductoId equals p.ProductoId into ProductoTecnologia
                                         from pt in ProductoTecnologia.DefaultIfEmpty()
                                         join tipo in ctx.TipoCicloVida on pt.TipoCicloVidaId equals tipo.TipoCicloVidaId into TipoCicloVidaProducto
                                         from tcvp in TipoCicloVidaProducto.DefaultIfEmpty()
                                         where r.CodigoAPT == codigoAPT
                                         && r.FlagActivo && rd.FlagActivo && t.Activo && s.Activo && d.Activo
                                         && r.AnioRegistro == fechaConsulta.Year
                                         && r.MesRegistro == fechaConsulta.Month
                                         && r.DiaRegistro == fechaConsulta.Day
                                         && relacionesActivas.Contains(r.EstadoId)
                                         select new TecnologiaDTO()
                                         {
                                             Id = t.TecnologiaId,
                                             DominioNomb = d.Nombre,
                                             SubdominioNomb = s.Nombre,
                                             ClaveTecnologia = t.ClaveTecnologia,
                                             ObsolescenciaTecnologia = tcv.IndiceObsolescencia,
                                             ObsolescenciaTecnologiaProyectado1 = tcv.IndiceObsolescenciaProyectado1,
                                             ObsolescenciaTecnologiaProyectado2 = tcv.IndiceObsolescenciaProyectado2,
                                             Obsoleto = (tcv.Obsoleto == 1),
                                             FechaCalculoBase = tcv.FechaCalculoBase,
                                             MesesObsolescencia = (tcvp != null ? (tcvp.NroPeriodosEstadoAmbar == 0 ? mesesCicloVida : tcvp.NroPeriodosEstadoAmbar) : mesesCicloVida),
                                             Meses = proyeccionMeses1,
                                             IndicadorMeses1 = proyeccionMeses1,
                                             IndicadorMeses2 = proyeccionMeses2,
                                             FlagFechaFinSoporte = t.FlagFechaFinSoporte,
                                             TipoTecNomb = tt.Nombre,
                                             TipoTecnologiaId = t.TipoTecnologia
                                         }).Distinct().OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        foreach (var item in registros)
                        {

                        }

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaDTO> GetTecnologiasXAplicacionByCodigoAPT(string codigoAPT, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaDTO> GetTecnologiasXAplicacionByCodigoAPT(string codigoAPT, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override FiltrosDashboardTecnologia ListFiltrosDashboardXDominio(List<int> idsDominio)
        {
            try
            {
                FiltrosDashboardTecnologia arr_data = null;
                var arrIdsDominios = idsDominio.ToArray();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        arr_data = new FiltrosDashboardTecnologia();

                        //arr_data.Familia = (from t in ctx.Tecnologia
                        //                    join f in ctx.Familia on t.FamiliaId equals f.FamiliaId
                        //                    join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                        //                    where t.Activo
                        //                    && f.Activo
                        //                    && arrIdsDominios.Contains(t.SubdominioId)
                        //                    select new CustomAutocomplete()
                        //                    {
                        //                        Id = f.FamiliaId.ToString(),
                        //                        Descripcion = f.Nombre,
                        //                        TipoId = s.SubdominioId.ToString(),
                        //                        TipoDescripcion = s.Nombre
                        //                    }).Distinct().OrderBy(z => z.Descripcion).ToList();


                        arr_data.Subdominio = (from t in ctx.Tecnologia
                                                   //join f in ctx.Familia on t.FamiliaId equals f.FamiliaId
                                               join s in ctx.Subdominio on t.SubdominioId equals s.SubdominioId
                                               join d in ctx.Dominio on s.DominioId equals d.DominioId
                                               where t.Activo
                                               && s.Activo
                                               && s.FlagIsVisible.Value
                                               && d.Activo
                                               && arrIdsDominios.Contains(d.DominioId)
                                               select new CustomAutocomplete()
                                               {
                                                   Id = s.SubdominioId.ToString(),
                                                   Descripcion = s.Nombre
                                                   //TipoId = s.SubdominioId.ToString(),
                                                   //TipoDescripcion = s.Nombre
                                               }).Distinct().OrderBy(z => z.Descripcion).ToList();

                    }
                    return arr_data;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominio()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: FiltrosDashboardTecnologia ListFiltrosDashboardXSubdominio()"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetTecnologiaVinculadaXTecnologiaId(int tecnologiaId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join tv in ctx.TecnologiaVinculada on u.TecnologiaId equals tv.VinculoId
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         where tv.Activo && tv.TecnologiaId == tecnologiaId
                                         select new TecnologiaG()
                                         {
                                             Id = tv.VinculoId,
                                             Nombre = u.Nombre,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             Dominio = s.Nombre,
                                             Subdominio = d.Nombre
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaVinculadaXTecnologiaId(int tecnologiaId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaVinculadaXTecnologiaId(int tecnologiaId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaDTO> GetTecnologiaEstandar(string _subdominioIds = null, string _dominiosId = null)
        {
            try
            {
                var subdominioIntIds = new List<int>();
                var dominiosIntIds = new List<int>();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var tecnologia = (from t in ctx.Tecnologia
                                          join t2 in ctx.Tipo on t.TipoTecnologia equals t2.TipoId
                                          where t.Activo && t.FlagSiteEstandar.Value
                                          select new TecnologiaBase()
                                          {
                                              Id = t.TecnologiaId,
                                              Nombre = t.ClaveTecnologia,
                                              SubdominioId = t.SubdominioId,
                                              EstadoId = t.EstadoId.Value,
                                              CodigoTecnologia = t.CodigoTecnologiaAsignado,
                                              Url = t.UrlConfluence,
                                              FlagFechaFinSoporte = t.FlagFechaFinSoporte,
                                              FechaCalculoTec = t.FechaCalculoTec,
                                              FechaExtendida = t.FechaExtendida,
                                              FechaFinSoporte = t.FechaFinSoporte,
                                              FechaAcordada = t.FechaAcordada,
                                              TipoTecnologia = t.TipoTecnologia,
                                              TipoTecnologiaToString = t2.Nombre
                                          }).ToList();

                        var dominio = (from d in ctx.Dominio
                                       where d.Activo
                                       select d).ToList();

                        var subdominio = (from s in ctx.Subdominio
                                          where s.Activo
                                          select s).ToList();

                        var tipotecnologia = (from t in ctx.Tipo
                                              where t.Activo
                                              select t).ToList();

                        //foreach(var item in tecnologia)
                        //{
                        //    if (item.TipoTecnologia == 4)
                        //        item.EstadoId = (int)ETecnologiaEstado.Obsoleto;
                        //    else
                        //    {
                        //        if (item.FlagFechaFinSoporte.HasValue)
                        //        {
                        //            if (!item.FlagFechaFinSoporte.Value)
                        //                item.EstadoId = (int)ETecnologiaEstado.Vigente;                                    
                        //            else
                        //            {
                        //                DateTime? fechaFinSoporte = null;
                        //                if (!item.FechaCalculoTec.HasValue)
                        //                {
                        //                    item.EstadoId = (int)ETecnologiaEstado.Obsoleto;
                        //                }
                        //                else
                        //                {
                        //                    switch (item.FechaCalculoTec.Value)
                        //                    {
                        //                        case (int)FechaCalculoTecnologia.FechaInterna:
                        //                            fechaFinSoporte = item.FechaFinSoporte;
                        //                            break;
                        //                        case (int)FechaCalculoTecnologia.FechaExtendida:
                        //                            fechaFinSoporte = item.FechaExtendida;
                        //                            break;
                        //                        case (int)FechaCalculoTecnologia.FechaFinSoporte:
                        //                            fechaFinSoporte = item.FechaFinSoporte;
                        //                            break;
                        //                    }
                        //                    if (fechaFinSoporte != null)
                        //                    {
                        //                        if (fechaFinSoporte.HasValue)
                        //                        {
                        //                            if (fechaFinSoporte < DateTime.Now)
                        //                                item.EstadoId = (int)ETecnologiaEstado.Obsoleto;
                        //                            else
                        //                            {
                        //                                if (fechaFinSoporte > DateTime.Now && fechaFinSoporte <= DateTime.Now.AddMonths(12))
                        //                                    item.EstadoId = (int)ETecnologiaEstado.Deprecado;
                        //                                else
                        //                                    item.EstadoId = (int)ETecnologiaEstado.Vigente;
                        //                            }
                        //                        }
                        //                        else
                        //                            item.EstadoId = (int)ETecnologiaEstado.Obsoleto;
                        //                    }
                        //                    else
                        //                        item.EstadoId = (int)ETecnologiaEstado.Obsoleto;
                        //                }
                        //            }
                        //        }
                        //        else
                        //            item.EstadoId = (int)ETecnologiaEstado.Obsoleto;

                        //    }
                        //}
                        if (!string.IsNullOrEmpty(_subdominioIds))
                            subdominioIntIds = _subdominioIds.Split('|').Select(x => int.Parse(x)).ToList();

                        if (!string.IsNullOrEmpty(_dominiosId))
                            dominiosIntIds = _dominiosId.Split('|').Select(x => int.Parse(x)).ToList();

                        var registros = (from d in dominio
                                         join s in subdominio on d.DominioId equals s.DominioId
                                         join t in tecnologia on s.SubdominioId equals t.SubdominioId
                                         where (string.IsNullOrEmpty(_dominiosId) || dominiosIntIds.Contains(s.DominioId)) &&
                                         (string.IsNullOrEmpty(_subdominioIds) || subdominioIntIds.Contains(s.SubdominioId))
                                         group new { d, s, t } by new { DomId = d.DominioId, Dominio = d.Nombre, SubId = s.SubdominioId, Subdomino = s.Nombre } into grp
                                         orderby grp.Key.Dominio
                                         select grp).ToList().Select(grp =>
                                         new TecnologiaDTO()
                                         {
                                             DominioNomb = grp.Key.Dominio,
                                             SubdominioId = grp.Key.SubId,
                                             SubdominioNomb = grp.Key.Subdomino,
                                             TecnologiaVigenteStr = string.Join("</br>",
                                                 tecnologia
                                                 .Join(tipotecnologia, t1 => t1.TipoTecnologia, t2 => t2.TipoId, (t1, t2) => new { t1, t2 })
                                                 .Where(y => y.t1.SubdominioId == grp.Key.SubId && y.t1.EstadoId == (int)ETecnologiaEstado.Vigente).ToArray()
                                                 .Select(m => Utilitarios.DevolverTecnologiaEstandarStr(m.t1.Url, m.t1.CodigoTecnologia, m.t1.Nombre, "vigenteClass", m.t2.FlagMostrarEstado, m.t1.TipoTecnologiaToString, m.t1.Id))),
                                             //TecnologiaDeprecadoStr = string.Join("</br>",
                                             //    tecnologia
                                             //    .Join(tipotecnologia, t1 => t1.TipoTecnologia, t2 => t2.TipoId, (t1, t2) => new { t1, t2 })
                                             //    .Where(y => y.t1.SubdominioId == grp.Key.SubId && y.t1.EstadoId == (int)ETecnologiaEstado.VigentePorVencer).ToArray()
                                             //    .Select(m => Utilitarios.DevolverTecnologiaEstandarStr(m.t1.Url, m.t1.CodigoTecnologia, m.t1.Nombre, "deprecadoClass", m.t2.FlagMostrarEstado, m.t1.TipoTecnologiaToString, m.t1.Id))),
                                             TecnologiaDeprecadoStr = string.Join("</br>",
                                                 tecnologia
                                                 .Join(tipotecnologia, t1 => t1.TipoTecnologia, t2 => t2.TipoId, (t1, t2) => new { t1, t2 })
                                                 .Where(y => y.t1.SubdominioId == grp.Key.SubId && y.t1.EstadoId == (int)ETecnologiaEstado.Deprecado).ToArray()
                                                 .Select(m => Utilitarios.DevolverTecnologiaEstandarStr(m.t1.Url, m.t1.CodigoTecnologia, m.t1.Nombre, "deprecadoClass", m.t2.FlagMostrarEstado, m.t1.TipoTecnologiaToString, m.t1.Id))),
                                             TecnologiaObsoletoStr = string.Join("</br>",
                                                 tecnologia
                                                 .Join(tipotecnologia, t1 => t1.TipoTecnologia, t2 => t2.TipoId, (t1, t2) => new { t1, t2 })
                                                 .Where(y => y.t1.SubdominioId == grp.Key.SubId && y.t1.EstadoId == (int)ETecnologiaEstado.Obsoleto).ToArray()
                                                 .Select(m => Utilitarios.DevolverTecnologiaEstandarStr(m.t1.Url, m.t1.CodigoTecnologia, m.t1.Nombre, "obsoletoClass", m.t2.FlagMostrarEstado, m.t1.TipoTecnologiaToString, m.t1.Id))),
                                         }).ToList();

                        return registros;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaEstandar()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaEstandar()"
                    , new object[] { null });
            }
        }


        public override DashboardTecnologiaEquipoData GetReporteTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros)
        {
            try
            {
                DashboardTecnologiaEquipoData dashboardBase = new DashboardTecnologiaEquipoData();
                var parametroMeses = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES").Valor;
                var parametroMeses2 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES_2").Valor;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {

                        int DIA = DateTime.Now.Day;
                        int MES = DateTime.Now.Month;
                        int ANIO = DateTime.Now.Year;

                        if (filtros.FechaConsulta.HasValue)
                        {
                            DIA = filtros.FechaConsulta.Value.Day;
                            MES = filtros.FechaConsulta.Value.Month;
                            ANIO = filtros.FechaConsulta.Value.Year;
                        }

                        #region DATOS TECNOLOGIA

                        var objTecnologia = (from a in ctx.Tecnologia
                                             join s in ctx.Subdominio on a.SubdominioId equals s.SubdominioId
                                             join d in ctx.Dominio on s.DominioId equals d.DominioId
                                             join t in ctx.TecnologiaCicloVida on a.TecnologiaId equals t.TecnologiaId
                                             join tt in ctx.Tipo on a.TipoTecnologia equals tt.TipoId into gj
                                             from x in gj.DefaultIfEmpty()
                                                 //where a.ClaveTecnologia.ToUpper() == filtros.ClaveTecnologiaFiltrar.ToUpper()
                                             where a.TecnologiaId == filtros.TecnologiaIdFiltrar
                                             && a.Activo
                                             && t.AnioRegistro == ANIO && t.MesRegistro == MES && t.DiaRegistro == DIA
                                             select new
                                             {
                                                 Id = a.TecnologiaId,
                                                 ClaveTecnologia = a.ClaveTecnologia,
                                                 DominioNomb = d.Nombre,
                                                 SubdominioNomb = s.Nombre,
                                                 TipoTecnologiaId = a.TipoTecnologia,
                                                 FechaAcordada = a.FechaAcordada,
                                                 FechaExtendida = a.FechaExtendida,
                                                 FechaFinSoporte = a.FechaFinSoporte,
                                                 FechaCalculoTec = a.FechaCalculoTec,
                                                 IndiceObsolescencia = t.IndiceObsolescencia,
                                                 Riesgo = t.Riesgo,
                                                 t.Obsoleto,
                                                 a.FlagFechaFinSoporte,
                                                 TipoTecnologia = x.Nombre

                                             }).ToList().Select(x => new TecnologiaDTO
                                             {
                                                 Meses = int.Parse(parametroMeses),
                                                 IndicadorMeses1 = int.Parse(parametroMeses),
                                                 IndicadorMeses2 = int.Parse(parametroMeses2),
                                                 Id = x.Id,
                                                 ClaveTecnologia = x.ClaveTecnologia,
                                                 DominioNomb = x.DominioNomb,
                                                 SubdominioNomb = x.SubdominioNomb,
                                                 TipoTecnologiaId = x.TipoTecnologiaId,
                                                 RiesgoTecnologia = x.Riesgo,
                                                 ObsolescenciaTecnologia = x.IndiceObsolescencia,
                                                 TipoTecNomb = x.TipoTecnologia,
                                                 Obsoleto = (x.Obsoleto == 1),
                                                 FlagFechaFinSoporte = x.FlagFechaFinSoporte,
                                                 FechaCalculoBase = x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaExtendida ? x.FechaExtendida
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaFinSoporte ? x.FechaFinSoporte
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaInterna ? x.FechaAcordada : null


                                             }).FirstOrDefault();

                        #endregion

                        #region DATA TIPO EQUIPO
                        var dataTipoEquipo = (from a in ctx.EquipoTecnologia
                                              join b in ctx.Tecnologia on a.TecnologiaId equals b.TecnologiaId
                                              join c in ctx.Equipo on a.EquipoId equals c.EquipoId
                                              join d in ctx.TipoEquipo on c.TipoEquipoId equals d.TipoEquipoId
                                              where b.TecnologiaId == filtros.TecnologiaIdFiltrar
                                              && a.AnioRegistro == ANIO
                                              && a.MesRegistro == MES
                                              && a.DiaRegistro == DIA
                                              && b.Activo && a.FlagActivo
                                              group a by new { d.TipoEquipoId, d.Nombre } into grp
                                              select new CustomAutocomplete
                                              {
                                                  Id = grp.Key.TipoEquipoId.ToString(),
                                                  Descripcion = grp.Key.Nombre,
                                                  Total = grp.Count()
                                              }).ToList();

                        #endregion



                        dashboardBase.Tecnologia = objTecnologia;
                        dashboardBase.DataPie = dataTipoEquipo;


                        return dashboardBase;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetReporteTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetReporteTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros)"
                    , new object[] { null });
            }
        }


        public override List<EquipoDTO> GetListadoTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)
        {
            try
            {
                totalRows = 0;

                int DIA = DateTime.Now.Day;
                int MES = DateTime.Now.Month;
                int ANIO = DateTime.Now.Year;

                if (filtros.FechaConsulta.HasValue)
                {
                    DIA = filtros.FechaConsulta.Value.Day;
                    MES = filtros.FechaConsulta.Value.Month;
                    ANIO = filtros.FechaConsulta.Value.Year;
                }
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        ctx.Database.CommandTimeout = 0;

                        var registros = (from a in ctx.EquipoTecnologia
                                         join b in ctx.Tecnologia on a.TecnologiaId equals b.TecnologiaId
                                         join c in ctx.Equipo on a.EquipoId equals c.EquipoId
                                         join d in ctx.TipoEquipo on c.TipoEquipoId equals d.TipoEquipoId
                                         join e in ctx.Ambiente on c.AmbienteId equals e.AmbienteId
                                         join f in ctx.DominioServidor on c.DominioServidorId equals f.DominioId
                                         where b.TecnologiaId == filtros.TecnologiaIdFiltrar
                                         && a.AnioRegistro == ANIO
                                         && a.MesRegistro == MES
                                         && a.DiaRegistro == DIA
                                         && b.Activo && a.FlagActivo
                                         select new EquipoDTO
                                         {
                                             Nombre = c.Nombre,
                                             TipoEquipo = d.Nombre,
                                             FlagTemporal = c.FlagTemporal,
                                             Ambiente = e.DetalleAmbiente,
                                             Subsidiaria = f.Nombre
                                         });

                        totalRows = registros.Count();

                        registros = registros.OrderBy(filtros.sortName + " " + filtros.sortOrder);
                        var resultado = registros.Skip((filtros.pageNumber - 1) * filtros.pageSize).Take(filtros.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<AplicacionDTO> GetListadoTecnologiaAplicaciones(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)
        {
            try
            {
                totalRows = 0;

                int DIA = DateTime.Now.Day;
                int MES = DateTime.Now.Month;
                int ANIO = DateTime.Now.Year;

                if (filtros.FechaConsulta.HasValue)
                {
                    DIA = filtros.FechaConsulta.Value.Day;
                    MES = filtros.FechaConsulta.Value.Month;
                    ANIO = filtros.FechaConsulta.Value.Year;
                }
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from a in ctx.RelacionDetalle
                                         join b in ctx.Relacion on a.RelacionId equals b.RelacionId
                                         join e in ctx.Equipo on b.EquipoId equals e.EquipoId into lj1
                                         from e in lj1.DefaultIfEmpty()
                                         join c in ctx.Aplicacion on b.CodigoAPT equals c.CodigoAPT
                                         join d in ctx.AplicacionConfiguracion on c.AplicacionId equals d.AplicacionId
                                         where a.TecnologiaId == filtros.TecnologiaIdFiltrar
                                         && b.AnioRegistro == ANIO
                                         && b.MesRegistro == MES
                                         && b.DiaRegistro == DIA
                                         && d.AnioRegistro == ANIO
                                         && d.MesRegistro == MES
                                         && d.DiaRegistro == DIA
                                         select new AplicacionDTO
                                         {
                                             Nombre = c.Nombre,
                                             CodigoAPT = c.CodigoAPT,
                                             EstadoAplicacion = c.EstadoAplicacion,
                                             KPIObsolescencia = d.Priorizacion,
                                             Equipo = e.Nombre,
                                             EstadoRelacionId = b.EstadoId
                                         }).Distinct();

                        totalRows = registros.Count();

                        registros = registros.OrderBy(filtros.sortName + " " + filtros.sortOrder);
                        var resultado = registros.Skip((filtros.pageNumber - 1) * filtros.pageSize).Take(filtros.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaAplicaciones(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaAplicaciones(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
        }
        public override List<TecnologiaDTO> GetListadoTecnologiasVinculadas(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)
        {
            try
            {
                totalRows = 0;

                int DIA = DateTime.Now.Day;
                int MES = DateTime.Now.Month;
                int ANIO = DateTime.Now.Year;

                if (filtros.FechaConsulta.HasValue)
                {
                    DIA = filtros.FechaConsulta.Value.Day;
                    MES = filtros.FechaConsulta.Value.Month;
                    ANIO = filtros.FechaConsulta.Value.Year;
                }

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from a in ctx.TecnologiaVinculada
                                         join b in ctx.Tecnologia on a.VinculoId equals b.TecnologiaId
                                         join s in ctx.Subdominio on b.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         join t in ctx.Tipo on b.TipoTecnologia equals t.TipoId into x
                                         from y in x.DefaultIfEmpty()
                                         where a.TecnologiaId == filtros.TecnologiaIdFiltrar
                                         && a.Activo
                                         select new TecnologiaDTO
                                         {

                                             ClaveTecnologia = b.ClaveTecnologia,
                                             DominioNomb = d.Nombre,
                                             SubdominioNomb = d.Nombre,
                                             TipoTecnologiaId = b.TipoTecnologia,
                                             FechaAcordada = b.FechaAcordada,
                                             FechaExtendida = b.FechaExtendida,
                                             FechaFinSoporte = b.FechaFinSoporte,
                                             FechaCalculoTec = b.FechaCalculoTec,
                                             TipoTecNomb = y.Nombre
                                         });


                        totalRows = registros.Count();

                        registros = registros.OrderBy(filtros.sortName + " " + filtros.sortOrder);
                        var resultado = registros.Skip((filtros.pageNumber - 1) * filtros.pageSize).Take(filtros.pageSize).ToList();

                        resultado = resultado.Select(x => new TecnologiaDTO
                        {

                            ClaveTecnologia = x.ClaveTecnologia,
                            DominioNomb = x.DominioNomb,
                            SubdominioNomb = x.SubdominioNomb,
                            TipoTecnologiaId = x.TipoTecnologiaId,
                            TipoTecNomb = x.TipoTecNomb,
                            FechaCalculoBase = x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaExtendida ? x.FechaExtendida
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaFinSoporte ? x.FechaFinSoporte
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaInterna ? x.FechaAcordada : null


                        }).ToList();


                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiasVinculadas(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiasVinculadas(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override bool MigrarEquivalenciasTecnologia(int TecnologiaEmisorId, int TecnologiaReceptorId, string Usuario)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    ctx.TecnologiaEquivalencia.Where(x => x.TecnologiaId == TecnologiaEmisorId && x.FlagActivo).ToList().ForEach(x => x.TecnologiaId = TecnologiaReceptorId);
                    ctx.SaveChanges();
                    var retorno = ServiceManager<TecnologiaDAO>.Provider.CambiarEstado(TecnologiaEmisorId, false, Usuario);

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarFlagEquivalencia(int id, string usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool CambiarFlagEquivalencia(int id, string usuario)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetReporteTecnologia(List<int> domIds, List<int> subdomIds, string casoUso, string filtro, List<int> estadoIds, string famId, int fecId, string aplica, string codigo, string dueno, string equipo, List<int> tipoTecIds, List<int> estObsIds, int? flagActivo, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                //casoUso = "";
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var tecnologiaIds = new List<int>();

                        if (!string.IsNullOrEmpty(equipo))
                        {
                            tecnologiaIds = (from et in ctx.EquipoTecnologia
                                             join e in ctx.Equipo on et.EquipoId equals e.EquipoId
                                             where et.FlagActivo && e.FlagActivo
                                             && (e.Nombre.ToUpper().Contains(equipo.ToUpper())
                                             /*|| string.IsNullOrEmpty(equipo)*/)
                                             select et.TecnologiaId).ToList();
                        }

                        var tecEquivalenciaIds = (from e in ctx.TecnologiaEquivalencia
                                                  where e.FlagActivo && e.Nombre.ToUpper().Contains(filtro.ToUpper())
                                                  select e.TecnologiaId
                                                ).ToList();

                        var registros = (from u in ctx.Tecnologia
                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId into lj1
                                         from t in lj1.DefaultIfEmpty()
                                         join f in ctx.Familia on u.FamiliaId equals f.FamiliaId into lj2
                                         from f in lj2.DefaultIfEmpty()
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         where (u.Nombre.ToUpper().Contains(filtro.ToUpper())
                                         || u.Descripcion.ToUpper().Contains(filtro.ToUpper())
                                         || string.IsNullOrEmpty(filtro)
                                         || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper())
                                         || tecEquivalenciaIds.Contains(u.TecnologiaId))
                                         && (u.Activo == (flagActivo != null))

                                         //&& (domId == -1 || s.DominioId == domId)
                                         //&& (subdomId == -1 || u.SubdominioId == subdomId)
                                         //&& (estadoId == -1 || u.EstadoTecnologia == estadoId)


                                         && (domIds.Count == 0 || domIds.Contains(s.DominioId))
                                         && (subdomIds.Count == 0 || subdomIds.Contains(u.SubdominioId))
                                         && (estadoIds.Count == 0 || estadoIds.Contains(u.EstadoTecnologia))
                                         && (estObsIds.Count == 0 || estObsIds.Contains(u.EstadoId.HasValue ? u.EstadoId.Value : 0))
                                         && (tipoTecIds.Count == 0 || tipoTecIds.Contains(u.TipoTecnologia.HasValue ? u.TipoTecnologia.Value : 0))

                                         && (string.IsNullOrEmpty(famId) || f == null || f.Nombre.ToUpper().Equals(famId.ToUpper()))
                                         && (fecId == -1 || u.FechaFinSoporte.HasValue == (fecId == 1))
                                         && (u.Aplica.ToUpper().Contains(aplica.ToUpper()) || string.IsNullOrEmpty(aplica))
                                         && (u.CodigoTecnologiaAsignado.ToUpper().Contains(codigo.ToUpper()) || string.IsNullOrEmpty(codigo))
                                         && (u.DuenoId.ToUpper().Contains(dueno.ToUpper()) || string.IsNullOrEmpty(dueno))
                                         && (string.IsNullOrEmpty(equipo) || tecnologiaIds.Contains(u.TecnologiaId))

                                         //&& (estObsId == -1 || u.EstadoId == estObsId)
                                         //&& (tipoTecId == -1 || u.TipoTecnologia == tipoTecId)

                                         orderby u.Nombre
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             Tipo = t.Nombre,
                                             Familia = f.Nombre,
                                             Dominio = d.Nombre,
                                             Subdominio = s.Nombre,
                                             Nombre = u.Nombre,
                                             Descripcion = u.Descripcion,
                                             Activo = u.Activo,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             FechaModificacion = u.FechaModificacion,
                                             Estado = u.EstadoTecnologia,
                                             Versiones = u.Versiones,
                                             FechaLanzamiento = u.FechaLanzamiento,
                                             FechaFinSoporte = u.FechaFinSoporte,
                                             FechaAcordada = u.FechaAcordada,
                                             FechaExtendida = u.FechaExtendida,
                                             ComentariosFechaFin = u.ComentariosFechaFin,
                                             Existencia = u.Existencia,
                                             Facilidad = u.Facilidad,
                                             Riesgo = u.Riesgo,
                                             Vulnerabilidad = u.Vulnerabilidad,
                                             CasoUso = u.CasoUso,
                                             Requisitos = u.Requisitos,
                                             Compatibilidad = u.Compatibilidad,
                                             Aplica = u.Aplica,
                                             EliminacionTecObsoleta = u.EliminacionTecObsoleta,
                                             Referencias = u.Referencias,
                                             PlanTransConocimiento = u.PlanTransConocimiento,
                                             EsqMonitoreo = u.EsqMonitoreo,
                                             LineaBaseSeg = u.LineaBaseSeg,
                                             EsqPatchManagement = u.EsqPatchManagement,
                                             Dueno = u.DuenoId,
                                             EqAdmContacto = u.EqAdmContacto,
                                             GrupoSoporteRemedy = u.GrupoSoporteRemedy,
                                             ConfArqSeg = u.ConfArqSegId,
                                             ConfArqTec = u.ConfArqTecId,
                                             EncargRenContractual = u.EncargRenContractual,
                                             EsqLicenciamiento = u.EsqLicenciamiento,
                                             SoporteEmpresarial = u.SoporteEmpresarial,
                                             FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                             FechaAprobacion = u.FechaAprobacion,
                                             UsuarioAprobacion = u.UsuarioAprobacion,
                                             Observacion = u.Observacion,
                                             FlagAplicacion = u.FlagAplicacion,
                                             CodigoAPT = u.CodigoAPT,
                                             Fuente = u.FuenteId,
                                             FlagSiteEstandar = u.FlagSiteEstandar,
                                             FechaCalculoTec = u.FechaCalculoTec,
                                             Fabricante = u.Fabricante,
                                             EstadoId = u.EstadoId,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             CodigoTecnologiaAsignado = u.CodigoTecnologiaAsignado,
                                             RoadmapOpcional = u.RoadmapOpcional,
                                             FlagConfirmarFamilia = u.FlagConfirmarFamilia
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override bool MigrarDataTecnologia(int TecnologiaEmisorId, int TecnologiaReceptorId, string Usuario)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var retorno = false;

                    var TEC_PROVEEDOR = (from u in ctx.Tecnologia
                                         where u.TecnologiaId == TecnologiaEmisorId
                                         select u).FirstOrDefault();
                    var TEC_RECEPTOR = (from u in ctx.Tecnologia
                                        where u.TecnologiaId == TecnologiaReceptorId
                                        select u).FirstOrDefault();

                    if (TEC_PROVEEDOR != null && TEC_RECEPTOR != null)
                    {
                        //TAB 1
                        TEC_RECEPTOR.Descripcion = TEC_PROVEEDOR.Descripcion;
                        TEC_RECEPTOR.ComentariosFechaFin = TEC_PROVEEDOR.ComentariosFechaFin;
                        TEC_RECEPTOR.Existencia = TEC_PROVEEDOR.Existencia;
                        TEC_RECEPTOR.Facilidad = TEC_PROVEEDOR.Facilidad;
                        TEC_RECEPTOR.Riesgo = TEC_PROVEEDOR.Riesgo;
                        TEC_RECEPTOR.Vulnerabilidad = TEC_PROVEEDOR.Vulnerabilidad;
                        TEC_RECEPTOR.CasoUso = TEC_PROVEEDOR.CasoUso;
                        TEC_RECEPTOR.Requisitos = TEC_PROVEEDOR.Requisitos;
                        TEC_RECEPTOR.Compatibilidad = TEC_PROVEEDOR.Compatibilidad;
                        TEC_RECEPTOR.Aplica = TEC_PROVEEDOR.Aplica;

                        //TAB 2
                        TEC_RECEPTOR.EliminacionTecObsoleta = TEC_PROVEEDOR.EliminacionTecObsoleta;
                        TEC_RECEPTOR.RoadmapOpcional = TEC_PROVEEDOR.RoadmapOpcional;
                        TEC_RECEPTOR.Referencias = TEC_PROVEEDOR.Referencias;
                        TEC_RECEPTOR.PlanTransConocimiento = TEC_PROVEEDOR.PlanTransConocimiento;
                        TEC_RECEPTOR.EsqMonitoreo = TEC_PROVEEDOR.EsqMonitoreo;
                        TEC_RECEPTOR.LineaBaseSeg = TEC_PROVEEDOR.LineaBaseSeg;
                        TEC_RECEPTOR.EsqPatchManagement = TEC_PROVEEDOR.EsqPatchManagement;

                        //TAB 3
                        TEC_RECEPTOR.DuenoId = TEC_PROVEEDOR.DuenoId;
                        TEC_RECEPTOR.EqAdmContacto = TEC_PROVEEDOR.EqAdmContacto;
                        TEC_RECEPTOR.GrupoSoporteRemedy = TEC_PROVEEDOR.GrupoSoporteRemedy;
                        TEC_RECEPTOR.ConfArqSegId = TEC_PROVEEDOR.ConfArqSegId;
                        TEC_RECEPTOR.ConfArqTecId = TEC_PROVEEDOR.ConfArqTecId;
                        TEC_RECEPTOR.EncargRenContractual = TEC_PROVEEDOR.EncargRenContractual;
                        TEC_RECEPTOR.EsqLicenciamiento = TEC_PROVEEDOR.EsqLicenciamiento;
                        TEC_RECEPTOR.SoporteEmpresarial = TEC_PROVEEDOR.SoporteEmpresarial;
                        TEC_RECEPTOR.FechaModificacion = DateTime.Now;
                        TEC_RECEPTOR.UsuarioModificacion = Usuario;

                        ctx.SaveChanges();
                        retorno = true;
                    }

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool MigrarDataTecnologia(int TecnologiaEmisorId, int TecnologiaReceptorId, string Usuario)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool MigrarDataTecnologia(int TecnologiaEmisorId, int TecnologiaReceptorId, string Usuario)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetTecnologiaByFabricanteNombre(string filtro)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       where u.Activo
                                       && (string.IsNullOrEmpty(filtro)
                                       || (u.Fabricante).ToUpper().StartsWith(filtro.ToUpper()))
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.Fabricante,
                                           value = u.Fabricante
                                       }).GroupBy(g => new { g.Descripcion })
                                       .Select(s => s.FirstOrDefault())
                                       .OrderBy(x => x.value)
                                       .ToList();

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaByFabricanteNombre(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaByFabricanteNombre(string filtro)"
                    , new object[] { null });
            }
        }

        public override DashboardTecnologiaEquipoData GetReporteTecnologiaEquiposFabricanteNombre(FiltrosDashboardTecnologiaEquipos filtros)
        {
            try
            {
                DashboardTecnologiaEquipoData dashboardBase = new DashboardTecnologiaEquipoData();
                var parametroMeses = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES").Valor;
                var parametroMeses2 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES_2").Valor;

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {

                        int DIA = DateTime.Now.Day;
                        int MES = DateTime.Now.Month;
                        int ANIO = DateTime.Now.Year;

                        if (filtros.FechaConsulta.HasValue)
                        {
                            DIA = filtros.FechaConsulta.Value.Day;
                            MES = filtros.FechaConsulta.Value.Month;
                            ANIO = filtros.FechaConsulta.Value.Year;
                        }

                        #region DATOS TECNOLOGIA

                        var objTecnologia = (from a in ctx.Tecnologia
                                             join s in ctx.Subdominio on a.SubdominioId equals s.SubdominioId
                                             join d in ctx.Dominio on s.DominioId equals d.DominioId
                                             join t in ctx.TecnologiaCicloVida on a.TecnologiaId equals t.TecnologiaId
                                             join tt in ctx.Tipo on a.TipoTecnologia equals tt.TipoId into gj
                                             from x in gj.DefaultIfEmpty()
                                             where
                                             (a.Fabricante == filtros.Fabricante.Trim() || string.IsNullOrEmpty(filtros.Fabricante.Trim()))
                                             && (a.Nombre == filtros.Nombre.Trim() || string.IsNullOrEmpty(filtros.Nombre.Trim()))
                                             && (a.Versiones == filtros.Version.Trim() || string.IsNullOrEmpty(filtros.Version.Trim()))
                                             && a.Activo
                                             && t.DiaRegistro == DIA && t.MesRegistro == MES && t.AnioRegistro == ANIO
                                             select new
                                             {
                                                 Id = a.TecnologiaId,
                                                 ClaveTecnologia = a.ClaveTecnologia,
                                                 DominioNomb = d.Nombre,
                                                 SubdominioNomb = s.Nombre,
                                                 TipoTecnologiaId = a.TipoTecnologia,
                                                 FechaAcordada = a.FechaAcordada,
                                                 FechaExtendida = a.FechaExtendida,
                                                 FechaFinSoporte = a.FechaFinSoporte,
                                                 FechaCalculoTec = a.FechaCalculoTec,
                                                 IndiceObsolescencia = t.IndiceObsolescencia,
                                                 Riesgo = t.Riesgo,
                                                 t.Obsoleto,
                                                 a.FlagFechaFinSoporte,
                                                 TipoTecnologia = x.Nombre

                                             }).ToList().Select(x => new TecnologiaDTO
                                             {
                                                 Meses = int.Parse(parametroMeses),
                                                 IndicadorMeses1 = int.Parse(parametroMeses),
                                                 IndicadorMeses2 = int.Parse(parametroMeses2),
                                                 Id = x.Id,
                                                 ClaveTecnologia = x.ClaveTecnologia,
                                                 DominioNomb = x.DominioNomb,
                                                 SubdominioNomb = x.SubdominioNomb,
                                                 TipoTecnologiaId = x.TipoTecnologiaId,
                                                 RiesgoTecnologia = x.Riesgo,
                                                 ObsolescenciaTecnologia = x.IndiceObsolescencia,
                                                 TipoTecNomb = x.TipoTecnologia,
                                                 Obsoleto = (x.Obsoleto == 1),
                                                 FlagFechaFinSoporte = x.FlagFechaFinSoporte,
                                                 FechaCalculoBase = x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaExtendida ? x.FechaExtendida
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaFinSoporte ? x.FechaFinSoporte
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaInterna ? x.FechaAcordada : null


                                             }).ToList();

                        #endregion

                        #region DATA TIPO EQUIPO
                        var dataTipoEquipo = (from a in ctx.EquipoTecnologia
                                              join b in ctx.Tecnologia on a.TecnologiaId equals b.TecnologiaId
                                              join c in ctx.Equipo on a.EquipoId equals c.EquipoId
                                              join d in ctx.TipoEquipo on c.TipoEquipoId equals d.TipoEquipoId
                                              where
                                                   (b.Fabricante == filtros.Fabricante.Trim() || string.IsNullOrEmpty(filtros.Fabricante.Trim()))
                                                && (b.Nombre == filtros.Nombre.Trim() || string.IsNullOrEmpty(filtros.Nombre.Trim()))
                                                && (b.Versiones == filtros.Version.Trim() || string.IsNullOrEmpty(filtros.Version.Trim()))
                                              && a.AnioRegistro == ANIO
                                              && a.MesRegistro == MES
                                              && a.DiaRegistro == DIA
                                              && b.Activo && a.FlagActivo
                                              group a by new { d.TipoEquipoId, d.Nombre } into grp
                                              select new CustomAutocomplete
                                              {
                                                  Id = grp.Key.TipoEquipoId.ToString(),
                                                  Descripcion = grp.Key.Nombre,
                                                  Total = grp.Count()
                                              }).ToList();

                        #endregion

                        dashboardBase.TecnologiaList = objTecnologia;
                        dashboardBase.DataPie = dataTipoEquipo;

                        return dashboardBase;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetReporteTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetReporteTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros)"
                    , new object[] { null });
            }
        }

        public override List<EquipoDTO> GetListadoTecnologiaEquiposFabricanteNombre(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)
        {
            try
            {
                totalRows = 0;

                int DIA = DateTime.Now.Day;
                int MES = DateTime.Now.Month;
                int ANIO = DateTime.Now.Year;

                if (filtros.FechaConsulta.HasValue)
                {
                    DIA = filtros.FechaConsulta.Value.Day;
                    MES = filtros.FechaConsulta.Value.Month;
                    ANIO = filtros.FechaConsulta.Value.Year;
                }
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from a in ctx.EquipoTecnologia
                                         join b in ctx.Tecnologia on a.TecnologiaId equals b.TecnologiaId
                                         join c in ctx.Equipo on a.EquipoId equals c.EquipoId
                                         join d in ctx.TipoEquipo on c.TipoEquipoId equals d.TipoEquipoId
                                         join e in ctx.Ambiente on c.AmbienteId equals e.AmbienteId
                                         join f in ctx.DominioServidor on c.DominioServidorId equals f.DominioId
                                         where
                                         (b.Fabricante == filtros.Fabricante.Trim() || string.IsNullOrEmpty(filtros.Fabricante.Trim()))
                                                && (b.Nombre == filtros.Nombre.Trim() || string.IsNullOrEmpty(filtros.Nombre.Trim()))
                                                && (b.Versiones == filtros.Version.Trim() || string.IsNullOrEmpty(filtros.Version.Trim()))
                                         //&& (filtros.SubdominioId == -1 || b.SubdominioId == filtros.SubdominioId)
                                         //b.TecnologiaId == filtros.TecnologiaIdFiltrar
                                         && a.AnioRegistro == ANIO
                                         && a.MesRegistro == MES
                                         && a.DiaRegistro == DIA
                                         && b.Activo && a.FlagActivo
                                         select new EquipoDTO
                                         {
                                             Nombre = c.Nombre,
                                             TipoEquipo = d.Nombre,
                                             FlagTemporal = c.FlagTemporal,
                                             Ambiente = e.DetalleAmbiente,
                                             Subsidiaria = f.Nombre,
                                             ClaveTecnologia = b.ClaveTecnologia
                                         });

                        totalRows = registros.Count();

                        registros = registros.OrderBy(filtros.sortName + " " + filtros.sortOrder);
                        var resultado = registros.Skip((filtros.pageNumber - 1) * filtros.pageSize).Take(filtros.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaEquipos(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<AplicacionDTO> GetListadoTecnologiaAplicacionesFabricanteNombre(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)
        {
            try
            {
                totalRows = 0;

                int DIA = DateTime.Now.Day;
                int MES = DateTime.Now.Month;
                int ANIO = DateTime.Now.Year;

                if (filtros.FechaConsulta.HasValue)
                {
                    DIA = filtros.FechaConsulta.Value.Day;
                    MES = filtros.FechaConsulta.Value.Month;
                    ANIO = filtros.FechaConsulta.Value.Year;
                }
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from a in ctx.Relacion
                                         join b in ctx.RelacionDetalle on a.RelacionId equals b.RelacionId
                                         join t in ctx.Tecnologia on b.TecnologiaId equals t.TecnologiaId
                                         join e in ctx.Equipo on a.EquipoId equals e.EquipoId into lj1
                                         from e in lj1.DefaultIfEmpty()
                                         where
                                         a.DiaRegistro == DIA && a.MesRegistro == MES && a.AnioRegistro == ANIO
                                         && a.FlagActivo
                                         && (t.Fabricante == filtros.Fabricante.Trim() || string.IsNullOrEmpty(filtros.Fabricante.Trim()))
                                         && (t.Nombre == filtros.Nombre.Trim() || string.IsNullOrEmpty(filtros.Nombre.Trim()))
                                         && (t.Versiones == filtros.Version.Trim() || string.IsNullOrEmpty(filtros.Version.Trim()))

                                         select new AplicacionDTO
                                         {
                                             Nombre = a.CodigoAPT,
                                             CodigoAPT = a.CodigoAPT,
                                             Equipo = e.Nombre,
                                             EstadoRelacionId = a.EstadoId,
                                             ClaveTecnologia = t.ClaveTecnologia
                                         }).Distinct();

                        totalRows = registros.Count();

                        registros = registros.OrderBy(filtros.sortName + " " + filtros.sortOrder);
                        var resultado = registros.Skip((filtros.pageNumber - 1) * filtros.pageSize).Take(filtros.pageSize).ToList();

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaAplicaciones(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiaAplicaciones(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaDTO> GetListadoTecnologiasVinculadasFabricanteNombre(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)
        {
            try
            {
                totalRows = 0;

                int DIA = DateTime.Now.Day;
                int MES = DateTime.Now.Month;
                int ANIO = DateTime.Now.Year;

                if (filtros.FechaConsulta.HasValue)
                {
                    DIA = filtros.FechaConsulta.Value.Day;
                    MES = filtros.FechaConsulta.Value.Month;
                    ANIO = filtros.FechaConsulta.Value.Year;
                }

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from a in ctx.TecnologiaVinculada
                                         join b in ctx.Tecnologia on a.VinculoId equals b.TecnologiaId
                                         join s in ctx.Subdominio on b.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         join t in ctx.Tipo on b.TipoTecnologia equals t.TipoId into x
                                         from y in x.DefaultIfEmpty()
                                         where
                                            (b.Fabricante == filtros.Fabricante.Trim() || string.IsNullOrEmpty(filtros.Fabricante.Trim()))
                                                && (b.Nombre == filtros.Nombre.Trim() || string.IsNullOrEmpty(filtros.Nombre.Trim()))
                                                && (b.Versiones == filtros.Version.Trim() || string.IsNullOrEmpty(filtros.Version.Trim()))
                                         //&& (filtros.SubdominioId == -1 || b.SubdominioId == filtros.SubdominioId)
                                         //a.TecnologiaId == filtros.TecnologiaIdFiltrar
                                         && a.Activo
                                         select new TecnologiaDTO
                                         {
                                             Fabricante = b.Fabricante,
                                             Nombre = b.Nombre,
                                             ClaveTecnologia = b.ClaveTecnologia,
                                             DominioNomb = d.Nombre,
                                             SubdominioNomb = d.Nombre,
                                             TipoTecnologiaId = b.TipoTecnologia,
                                             FechaAcordada = b.FechaAcordada,
                                             FechaExtendida = b.FechaExtendida,
                                             FechaFinSoporte = b.FechaFinSoporte,
                                             FechaCalculoTec = b.FechaCalculoTec,
                                             TipoTecNomb = y.Nombre
                                         });


                        totalRows = registros.Count();

                        registros = registros.OrderBy(filtros.sortName + " " + filtros.sortOrder);
                        var resultado = registros.Skip((filtros.pageNumber - 1) * filtros.pageSize).Take(filtros.pageSize).ToList();

                        resultado = resultado.Select(x => new TecnologiaDTO
                        {

                            ClaveTecnologia = x.ClaveTecnologia,
                            DominioNomb = x.DominioNomb,
                            SubdominioNomb = x.SubdominioNomb,
                            TipoTecnologiaId = x.TipoTecnologiaId,
                            TipoTecNomb = x.TipoTecNomb,
                            FechaCalculoBase = x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaExtendida ? x.FechaExtendida
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaFinSoporte ? x.FechaFinSoporte
                                                                    : x.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaInterna ? x.FechaAcordada : null


                        }).ToList();


                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiasVinculadas(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetListadoTecnologiasVinculadas(FiltrosDashboardTecnologiaEquipos filtros, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override bool ExisteEquivalenciaByTecnologiaId(int Id)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        bool? estado = (from u in ctx.TecnologiaEquivalencia
                                        where u.FlagActivo && u.TecnologiaId == Id
                                        select true).FirstOrDefault();

                        return estado == true;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteTecnologiaById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteTecnologiaById(int Id)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetTecnologiaByNombre(string filtro)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       where u.Activo
                                       && (string.IsNullOrEmpty(filtro)
                                       || (u.Nombre).ToUpper().StartsWith(filtro.ToUpper()))
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.Nombre,
                                           Descripcion = u.Nombre,
                                           value = u.Nombre
                                       }).GroupBy(g => new { g.Descripcion })
                                       .Select(s => s.FirstOrDefault())
                                       .OrderBy(x => x.value)
                                       .ToList();

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaByNombre(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaByNombre(string filtro)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetTecnologiasPendientes()
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId into lj1
                                         from t in lj1.DefaultIfEmpty()
                                         join f in ctx.Familia on u.FamiliaId equals f.FamiliaId into lj2
                                         from f in lj2.DefaultIfEmpty()
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         where (u.Activo == true)
                                         && u.EstadoTecnologia == (int)EstadoTecnologia.Registrado
                                         orderby u.Nombre
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             Nombre = u.Nombre,
                                             Activo = u.Activo,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             Dominio = d.Nombre,
                                             Subdominio = s.Nombre,
                                             Tipo = t.Nombre,
                                             Estado = u.EstadoTecnologia,
                                             FechaAprobacion = u.FechaAprobacion,
                                             UsuarioAprobacion = u.UsuarioAprobacion,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             EstadoId = u.EstadoId,
                                             FechaFinSoporte = u.FechaFinSoporte,
                                             FlagFechaFinSoporte = u.FlagFechaFinSoporte
                                         }).ToList();

                        return registros;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasPendientes()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiasPendientes()"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaPorVencerDto> GetTecnologiasPorVencer(string subdominio, string tecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                subdominio = string.IsNullOrEmpty(subdominio) ? "" : subdominio;
                tecnologia = string.IsNullOrEmpty(tecnologia) ? "" : tecnologia;
                var parametro = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_TECNOLOGIA_POR_VENCER");
                var nroMeses = parametro != null ? int.Parse(parametro.Valor) : 12;
                //var fechaConsulta = DateTime.Now;
                //var fechaConsulta = DateTime.ParseExact(Convert.ToString(DateTime.Now.Date), "dd/MM/yyyy", CultureInfo.InvariantCulture);

                DateTime time = DateTime.Now;
                String format = "yyyy-MM-dd";
                var fechaConsulta = Convert.ToDateTime(time.ToString(format));
                totalRows = 0;

                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaPorVencerDto>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_Dashboard_TecnologiasPorVencer_v1]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@subdominio", subdominio));
                        comando.Parameters.Add(new SqlParameter("@tecnologia", tecnologia));
                        comando.Parameters.Add(new SqlParameter("@nroMeses", nroMeses));
                        comando.Parameters.Add(new SqlParameter("@fechaConsulta", fechaConsulta));
                        comando.Parameters.Add(new SqlParameter("@PageSize", pageSize));
                        comando.Parameters.Add(new SqlParameter("@PageNumber", pageNumber));
                        comando.Parameters.Add(new SqlParameter("@SortName", sortName));
                        comando.Parameters.Add(new SqlParameter("@SortOrder", sortOrder));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaPorVencerDto()
                            {
                                TotalFilas = reader.IsDBNull(reader.GetOrdinal("TotalFilas")) ? 0 : reader.GetInt32(reader.GetOrdinal("TotalFilas")),
                                Dominio = reader.IsDBNull(reader.GetOrdinal("Dominio")) ? string.Empty : reader.GetString(reader.GetOrdinal("Dominio")),
                                Subdominio = reader.IsDBNull(reader.GetOrdinal("Subdominio")) ? string.Empty : reader.GetString(reader.GetOrdinal("Subdominio")),
                                ClaveTecnologia = reader.IsDBNull(reader.GetOrdinal("ClaveTecnologia")) ? string.Empty : reader.GetString(reader.GetOrdinal("ClaveTecnologia")),
                                FechaFin = reader.IsDBNull(reader.GetOrdinal("FechaFin")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("FechaFin")),
                                TotalAplicaciones = reader.IsDBNull(reader.GetOrdinal("TotalAplicaciones")) ? 0 : reader.GetInt32(reader.GetOrdinal("TotalAplicaciones")),
                                NroMeses = nroMeses
                            };
                            lista.Add(objeto);
                        }
                        reader.Close();
                    }
                    if (lista.Count > 0)
                        totalRows = lista[0].TotalFilas;

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

        public override List<TecnologiaPorVencerDto> GetTecnologiasVencidas(string subdominio, string tecnologia, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                subdominio = string.IsNullOrEmpty(subdominio) ? "" : subdominio;
                tecnologia = string.IsNullOrEmpty(tecnologia) ? "" : tecnologia;
                //var parametro = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_TECNOLOGIA_POR_VENCER");
                //var nroMeses = parametro != null ? int.Parse(parametro.Valor) : 12;
                var nroMeses = 12;
                //var fechaConsulta = DateTime.Now;
                var fechaConsulta = DateTime.ParseExact("10/10/2019", "dd/MM/yyyy", CultureInfo.InvariantCulture);
                totalRows = 0;

                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaPorVencerDto>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_Dashboard_TecnologiasVencidas_v1]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@subdominio", subdominio));
                        comando.Parameters.Add(new SqlParameter("@tecnologia", tecnologia));
                        comando.Parameters.Add(new SqlParameter("@nroMeses", nroMeses));
                        comando.Parameters.Add(new SqlParameter("@fechaConsulta", fechaConsulta));
                        comando.Parameters.Add(new SqlParameter("@PageSize", pageSize));
                        comando.Parameters.Add(new SqlParameter("@PageNumber", pageNumber));
                        comando.Parameters.Add(new SqlParameter("@SortName", sortName));
                        comando.Parameters.Add(new SqlParameter("@SortOrder", sortOrder));

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaPorVencerDto()
                            {
                                TotalFilas = reader.IsDBNull(reader.GetOrdinal("TotalFilas")) ? 0 : reader.GetInt32(reader.GetOrdinal("TotalFilas")),
                                Dominio = reader.IsDBNull(reader.GetOrdinal("Dominio")) ? string.Empty : reader.GetString(reader.GetOrdinal("Dominio")),
                                Subdominio = reader.IsDBNull(reader.GetOrdinal("Subdominio")) ? string.Empty : reader.GetString(reader.GetOrdinal("Subdominio")),
                                ClaveTecnologia = reader.IsDBNull(reader.GetOrdinal("ClaveTecnologia")) ? string.Empty : reader.GetString(reader.GetOrdinal("ClaveTecnologia")),
                                FechaFin = reader.IsDBNull(reader.GetOrdinal("FechaFin")) ? (DateTime?)null : reader.GetDateTime(reader.GetOrdinal("FechaFin")),
                                TotalAplicaciones = reader.IsDBNull(reader.GetOrdinal("TotalAplicaciones")) ? 0 : reader.GetInt32(reader.GetOrdinal("TotalAplicaciones")),
                                NroMeses = nroMeses
                            };
                            lista.Add(objeto);
                        }
                        reader.Close();
                    }
                    if (lista.Count > 0)
                        totalRows = lista[0].TotalFilas;

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

        public override List<TecnologiaG> GetTecnologiaUpdate(Paginacion pag, out int totalRows)
        {
            try
            {
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId into lj1
                                         from t in lj1.DefaultIfEmpty()
                                         join f in ctx.Familia on u.FamiliaId equals f.FamiliaId into lj2
                                         from f in lj2.DefaultIfEmpty()
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                         where u.Activo
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             Dominio = d.Nombre,
                                             Subdominio = s.Nombre,
                                             Estado = u.EstadoTecnologia,
                                             Fabricante = u.Fabricante,
                                             Nombre = u.Nombre,
                                             Versiones = u.Versiones,
                                             Tipo = t.Nombre,
                                             TipoTecnologiaId = u.TipoTecnologia.HasValue ? u.TipoTecnologia.Value : 0,
                                             CodigoTecnologiaAsignado = u.CodigoTecnologiaAsignado,
                                             FlagSiteEstandar = u.FlagSiteEstandar,
                                             CasoUso = u.CasoUso,
                                             Descripcion = u.Descripcion,
                                             FechaLanzamiento = u.FechaLanzamiento,
                                             FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                             Fuente = u.FuenteId,
                                             FechaFinSoporte = u.FechaFinSoporte,
                                             FechaExtendida = u.FechaExtendida,
                                             FechaAcordada = u.FechaAcordada,
                                             EqAdmContacto = u.EqAdmContacto,
                                             GrupoSoporteRemedy = u.GrupoSoporteRemedy,
                                             ConfArqSeg = u.ConfArqSegId,
                                             ConfArqTec = u.ConfArqTecId,
                                             UrlConfluence = u.UrlConfluence,
                                             EstadoId = u.EstadoId
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaUpdate(Paginacion pag, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaUpdate(Paginacion pag, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override TecnologiaEstandarDTO GetTecnologiaEstandarById(int id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var entidad = (from u in ctx.Tecnologia
                                   join a in ctx.Producto on u.ProductoId equals a.ProductoId into lja
                                   from a in lja.DefaultIfEmpty()
                                   where u.TecnologiaId == id && u.Activo
                                   select new TecnologiaEstandarDTO()
                                   {
                                       Id = u.TecnologiaId,
                                       ClaveTecnologia = u.ClaveTecnologia,
                                       CodigoTecnologia = u.CodigoTecnologiaAsignado,
                                       CodigoProducto = a == null ? null : a.Codigo,
                                       PublicacionLBS = u.LineaBaseSeg,
                                       UrlConfluence = u.UrlConfluence,
                                       EqAdmContacto = u.EqAdmContacto,
                                       GrupoSoporteRemedy = u.GrupoSoporteRemedy,
                                       EstadoTecnologiaId = u.EstadoTecnologia,
                                       FuenteId = u.FuenteId,
                                       FechaCalculoTec = u.FechaCalculoTec,
                                       FechaLanzamiento = u.FechaLanzamiento,
                                       FechaFinSoporte = u.FechaFinSoporte,
                                       FechaAcordada = u.FechaAcordada,
                                       FechaExtendida = u.FechaExtendida,
                                       FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                       EquipoAprovisionamiento = u.EquipoAprovisionamiento,
                                       TribuCoeDisplayName = a == null ? null : a.TribuCoeDisplayName,
                                       SquadDisplayName = a == null ? null : a.SquadDisplayName,
                                       OwnerStr = u.DuenoId,
                                       EsquemaLicenciamientoId = u.EsqLicenciamiento,
                                       LineamientoTecnologiaId = u.UrlConfluenceId,
                                       LineamientoTecnologia = u.UrlConfluence,
                                       LineamientoBaseSeguridadId = u.RevisionSeguridadId,
                                       LineamientoBaseSeguridad = u.RevisionSeguridadDescripcion,
                                       //LineamientoBaseSeguridad = u.LineaBaseSeg,
                                       CompatibilidadSOIds = u.CompatibilidadSOId,
                                       CompatibilidadCloudIds = u.CompatibilidadCloudId,
                                       Aplica = u.Aplica,
                                   }).FirstOrDefault();
                    return entidad;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: TipoDTO GetTipoById(int id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTipoDTO
                    , "Error en el metodo: TipoDTO GetTipoById(int id)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaEstandarDTO> GetListadoTecnologiaEstandar(PaginacionEstandar pag, out int totalRows)
        {
            try
            {
                totalRows = 0;
                var subdominioIntIds = new List<int>();
                var dominioIntIds = new List<int>();
                var tipoTecIntIds = new List<int>();
                var estadoTecIntIds = new List<int>();

                var parametroMeses1 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES").Valor;
                int cantidadMeses1 = int.Parse(parametroMeses1);

                DateTime fechaActual = DateTime.Now;
                DateTime fechaAgregada = fechaActual.AddMonths(cantidadMeses1);

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    if (!string.IsNullOrEmpty(pag.SubdominioIds))
                        subdominioIntIds = pag.SubdominioIds.Split('|').Select(x => int.Parse(x)).ToList();

                    if (!string.IsNullOrEmpty(pag.DominioIds))
                        dominioIntIds = pag.DominioIds.Split('|').Select(x => int.Parse(x)).ToList();

                    if (!string.IsNullOrEmpty(pag.TipoTecnologiaIds))
                        tipoTecIntIds = pag.TipoTecnologiaIds.Split('|').Select(x => int.Parse(x)).ToList();

                    if (!string.IsNullOrEmpty(pag.EstadoIds))
                        estadoTecIntIds = pag.EstadoIds.Split('|').Select(x => int.Parse(x)).ToList();

                    var aplicaIds = string.IsNullOrEmpty(pag.AplicaIds) ? (new List<string>()).AsQueryable() : pag.AplicaIds.Split('|').ToList().AsQueryable();
                    var compatibilidadSOIds = string.IsNullOrEmpty(pag.CompatibilidadSOIds) ? (new List<string>()).AsQueryable() : pag.CompatibilidadSOIds.Split('|').AsQueryable();
                    var compatibilidadCloudIds = string.IsNullOrEmpty(pag.CompatibilidadCloudIds) ? (new List<string>()).AsQueryable() : pag.CompatibilidadCloudIds.Split('|').AsQueryable();

                    var registros = (from u in ctx.Tecnologia
                                     join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId
                                     join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                     join d in ctx.Dominio on s.DominioId equals d.DominioId
                                     join a in ctx.Producto on u.ProductoId equals a.ProductoId into lja
                                     from a in lja.DefaultIfEmpty()
                                         //join b in ctx.TecnologiaCicloVida on new { u.TecnologiaId, DiaRegistro = fechaActual.Day, MesRegistro = fechaActual.Month, AnioRegistro = fechaActual.Year } equals new { b.TecnologiaId, b.DiaRegistro, b.MesRegistro, b.AnioRegistro } into ljb
                                         //from b in ljb.DefaultIfEmpty()
                                     let fechaCalculo = !u.FechaCalculoTec.HasValue ? null : u.FechaCalculoTec.Value == (int)FechaCalculoTecnologia.FechaExtendida ? u.FechaExtendida : u.FechaCalculoTec.Value == (int)FechaCalculoTecnologia.FechaFinSoporte ? u.FechaFinSoporte : u.FechaCalculoTec.Value == (int)FechaCalculoTecnologia.FechaInterna ? u.FechaAcordada : null
                                     //let estadoEstandar = !fechaCalculo.HasValue ? (int)ETecnologiaEstadoEstandar.Vigente : 0
                                     //let estadoEstandar = !fechaCalculo.HasValue ? (int)ETecnologiaEstadoEstandar.Vigente : GetEstadoTecnologiaEstandar(fechaCalculo.Value, fechaActual, fechaAgregada)
                                     let estadoEstandar = !fechaCalculo.HasValue ? (int)ETecnologiaEstadoEstandar.Vigente : ((fechaCalculo.Value < fechaActual) ? (int)ETecnologiaEstadoEstandar.Obsoleto : ((fechaCalculo.Value < fechaAgregada) ? (int)ETecnologiaEstadoEstandar.VigentePorVencer : (int)ETecnologiaEstadoEstandar.Vigente))
                                     where (string.IsNullOrEmpty(pag.DominioIds) || dominioIntIds.Contains(s.DominioId))
                                     && (string.IsNullOrEmpty(pag.SubdominioIds) || subdominioIntIds.Contains(s.SubdominioId))
                                     && (string.IsNullOrEmpty(pag.TipoTecnologiaIds) || tipoTecIntIds.Contains(u.TipoTecnologia.Value))
                                     //&& (string.IsNullOrEmpty(pag.EstadoIds) || estadoTecIntIds.Contains(u.EstadoId.Value))
                                     && (string.IsNullOrEmpty(pag.EstadoIds) || estadoTecIntIds.Contains(estadoEstandar))
                                     && (string.IsNullOrEmpty(pag.Tecnologia) || u.ClaveTecnologia.ToUpper().Contains(pag.Tecnologia.ToUpper()))
                                     && (pag.GetAll || u.FlagSiteEstandar.Value)
                                     && s.Activo && d.Activo && u.Activo
                                     && (aplicaIds.Count() == 0 || aplicaIds.Contains(u.Aplica))
                                          && (compatibilidadSOIds.Count() == 0 || compatibilidadSOIds.Count(x => u.CompatibilidadSOId.Contains(x)) > 0)
                                          && (compatibilidadCloudIds.Count() == 0 || compatibilidadCloudIds.Count(x => u.CompatibilidadCloudId.Contains(x)) > 0)
                                     select new TecnologiaEstandarDTO()
                                     {
                                         Id = u.TecnologiaId,
                                         Tipo = t.Nombre,
                                         ClaveTecnologia = u.ClaveTecnologia,
                                         EstadoId = u.EstadoId,
                                         Dominio = d.Nombre,
                                         Subdominio = s.Nombre,
                                         Activo = u.Activo,
                                         GrupoSoporteRemedy = u.GrupoSoporteRemedy,
                                         PublicacionLBS = u.RevisionSeguridadDescripcion,
                                         UrlConfluence = u.UrlConfluence,
                                         EqAdmContacto = u.EqAdmContacto,
                                         UsuarioCreacion = u.UsuarioCreacion,
                                         FechaCreacion = u.FechaCreacion,
                                         FechaModificacion = u.FechaModificacion,
                                         UsuarioModificacion = u.UsuarioModificacion,
                                         CodigoTecnologia = u.CodigoTecnologiaAsignado,
                                         CodigoProducto = a == null ? null : a.Codigo,
                                         FuenteId = u.FuenteId,
                                         FechaCalculoTec = u.FechaCalculoTec,
                                         FechaLanzamiento = u.FechaLanzamiento,
                                         FechaFinSoporte = u.FechaFinSoporte,
                                         FechaAcordada = u.FechaAcordada,
                                         FechaExtendida = u.FechaExtendida,
                                         FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                         EquipoAprovisionamiento = u.EquipoAprovisionamiento,
                                         TribuCoeDisplayName = a == null ? null : a.TribuCoeDisplayName,
                                         SquadDisplayName = a == null ? null : a.SquadDisplayName,
                                         OwnerStr = u.DuenoId,
                                         EsquemaLicenciamientoId = u.EsqLicenciamiento,
                                         LineamientoTecnologiaId = u.UrlConfluenceId,
                                         LineamientoTecnologia = u.UrlConfluence,
                                         LineamientoBaseSeguridadId = u.RevisionSeguridadId,
                                         LineamientoBaseSeguridad = u.RevisionSeguridadDescripcion,
                                         CompatibilidadSOIds = u.CompatibilidadSOId,
                                         CompatibilidadCloudIds = u.CompatibilidadCloudId,
                                         Aplica = u.Aplica,
                                         CantidadMeses1 = cantidadMeses1
                                     });

                    totalRows = registros.Count();
                    registros = registros.OrderBy(pag.sortName + " " + pag.sortOrder);
                    var resultado = registros.Skip((pag.pageNumber - 1) * pag.pageSize).Take(pag.pageSize).ToList();


                    if (resultado.Count > 0) resultado.ForEach(x => x.FlagVigentePorVencer = !x.FechaCalculada.HasValue ? false : GetSemaforoTecnologia(x.FechaCalculada.Value, fechaActual, cantidadMeses1) == 0);

                    return resultado;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAmbienteDTO
                    , "Error en el metodo: List<AmbienteDTO> GetAmbiente(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAmbienteDTO
                    , "Error en el metodo: List<AmbienteDTO> GetAmbiente(string filtro, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocomplete> GetTecnologiaEstandarByFiltro(string filtro, string subdominioList, string soPcUsuarioList = null)
        {
            try
            {
                var subdominioListInt = new List<int>();
                var soPcUsuarioListInt = new List<int>();
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        if (!string.IsNullOrEmpty(subdominioList))
                            subdominioListInt = subdominioList.Split(';').Select(x => int.Parse(x)).ToList();

                        if (!string.IsNullOrEmpty(soPcUsuarioList))
                            soPcUsuarioListInt = soPcUsuarioList.Split(';').Select(x => int.Parse(x)).ToList();

                        var entidad = (from u in ctx.Tecnologia
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId
                                       where u.Activo && s.Activo && t.Activo
                                       && (string.IsNullOrEmpty(soPcUsuarioList) || soPcUsuarioListInt.Contains(u.TecnologiaId))
                                       && (string.IsNullOrEmpty(subdominioList) || subdominioListInt.Contains(s.SubdominioId))
                                       && (string.IsNullOrEmpty(filtro) || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper()))
                                       && u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       orderby u.Nombre
                                       select new CustomAutocomplete()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia,
                                           EstadoId = u.EstadoId
                                       }).ToList();
                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaEstandarByFiltro(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaEstandarByFiltro(string filtro)"
                    , new object[] { null });
            }
        }

        public override EntidadRetorno ActualizarRetorno(ActualizarTecnologia pag)
        {
            var query = string.Empty;
            var control = true;
            try
            {
                var retorno = new EntidadRetorno();

                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var tipo = ctx.Tipo.Where(x => x.Nombre.ToUpper() == pag.TipoTecnologia.ToUpper()).FirstOrDefault();
                    if (tipo != null)
                    {
                        var tecnologia = ctx.Tecnologia.FirstOrDefault(x => x.TecnologiaId == pag.TecnologiaId);
                        if (tecnologia != null)
                        {
                            query = string.Format("update cvt.Tecnologia set TipoTecnologia={0}, UsuarioModificacion='{1}', FechaModificacion=getdate() where TecnologiaId={2}"
                                , tipo.TipoId
                                , pag.Usuario
                                , tecnologia.TecnologiaId);
                            retorno.Descripcion = "Operación exitosa";
                        }
                        else
                        {
                            retorno.CodigoRetorno = -2;
                            retorno.Descripcion = "ID de la tecnología no registrada";
                            control = false;
                        }
                    }
                    else
                    {
                        retorno.CodigoRetorno = -1;
                        retorno.Descripcion = "Tipo de tecnología no encontrada";
                        control = false;
                    }
                }

                if (control)
                {
                    using (var cnx = new SqlConnection(Constantes.CadenaConexion))
                    {
                        cnx.Open();
                        using (var cmd = new SqlCommand())
                        {
                            cmd.Connection = cnx;
                            cmd.CommandText = query;
                            cmd.CommandType = CommandType.Text;
                            cmd.ExecuteNonQuery();
                        }
                        cnx.Close();
                    }
                }

                return retorno;
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);

                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaEstandarByFiltro(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);

                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetTecnologiaEstandarByFiltro(string filtro)"
                    , new object[] { null });
            }
        }


        private DtoResultCode ValidarObjTecnologia(DtoTecnologia objeto, GestionCMDB_ProdEntities ctx)
        {
            //default value
            var retornoRC = new DtoResultCode()
            {
                Code = (int)EResultCode.OK,
                Description = Utilitarios.GetEnumDescription2(EResultCode.OK)
            };

            if (string.IsNullOrWhiteSpace(objeto.vendor) || string.IsNullOrWhiteSpace(objeto.technologyName) || string.IsNullOrWhiteSpace(objeto.version)
                || string.IsNullOrWhiteSpace(objeto.family) || string.IsNullOrWhiteSpace(objeto.technologyType)
                || string.IsNullOrWhiteSpace(objeto.technologyType))
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.CamposRequeridosIncompletos,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.CamposRequeridosIncompletos)
                };
            }

            var tipo = ctx.Tipo.FirstOrDefault(x => x.Nombre.ToUpper().Equals(objeto.technologyType.ToUpper()));
            if (tipo == null)
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.TipoNoExiste,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.TipoNoExiste)
                };
            }

            var dominio = ctx.Dominio.FirstOrDefault(x => x.DominioId == objeto.domainId);
            if (dominio == null)
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.DominioSubdominioNoExiste,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.DominioSubdominioNoExiste)
                };
            }

            var subdominio = ctx.Subdominio.FirstOrDefault(x => x.SubdominioId == objeto.subdomainId);
            if (subdominio == null)
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.DominioSubdominioNoExiste,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.DominioSubdominioNoExiste)
                };
            }
            else
            {
                var hasRelacion = subdominio.DominioId == dominio.DominioId;
                if (!hasRelacion)
                {
                    return new DtoResultCode()
                    {
                        Code = (int)EResultCode.DominioSubdominioNoExiste,
                        Description = Utilitarios.GetEnumDescription2(EResultCode.DominioSubdominioNoExiste)
                    };
                }
            }

            var arrEstadoTecnologia = new int[]
            {
                (int)ETecnologiaEstado.Vigente,
                //(int)ETecnologiaEstado.VigentePorVencer,
                (int)ETecnologiaEstado.Deprecado,
                (int)ETecnologiaEstado.Obsoleto,
            };

            if (!arrEstadoTecnologia.Contains(objeto.technologyState))
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.EstadoNoExiste,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.EstadoNoExiste)
                };
            }

            var clave = $"{objeto.vendor} {objeto.technologyName} {objeto.version}";
            var tecnologia = ctx.Tecnologia.FirstOrDefault(x => x.ClaveTecnologia.Trim().ToUpper().Equals(clave.Trim().ToUpper()));
            if (tecnologia != null)
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.ClaveExiste,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.ClaveExiste)
                };
            }

            var arrFuenteFechaFin = new int[]
            {
                (int)Fuente.ADDM,
                (int)Fuente.SNOW,
                (int)Fuente.Manual
            };

            if (!arrFuenteFechaFin.Contains(objeto.endDateSupportSource))
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.FuenteFechaFinIncorrecta,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.FuenteFechaFinIncorrecta)
                };
            }

            var arrTipoFechaFinSoporte = new int[]
            {
                (int)FechaCalculoTecnologia.FechaExtendida,
                (int)FechaCalculoTecnologia.FechaFinSoporte,
                (int)FechaCalculoTecnologia.FechaInterna,
            };

            if (!arrTipoFechaFinSoporte.Contains(objeto.typeEndDateSupport))
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.TipoFechaFinSoporteIncorrecta,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.TipoFechaFinSoporteIncorrecta)
                };
            }

            var arrParametros = new int[] { 0, 1, 2, 3, 4, 5 };
            if (!arrParametros.Contains(objeto.valueParameterExistencia) || !arrParametros.Contains(objeto.valueParameterFacilidad)
                || !arrParametros.Contains(objeto.valueParameterRiesgo) || !arrParametros.Contains(objeto.valueParameterVulnerabilidad))
            {
                return new DtoResultCode()
                {
                    Code = (int)EResultCode.CriterioIncorrecto,
                    Description = Utilitarios.GetEnumDescription2(EResultCode.CriterioIncorrecto)
                };
            }

            return retornoRC;
        }

        public override int AddOrEditTecnologiaPowerApps(DtoTecnologia objeto)
        {
            DbContextTransaction transaction = null;

            int ID = 0;
            int tipoInicial = 0;
            int estado = 0;
            DateTime fechaActual = DateTime.Now;
            DateTime? fechaFin = null;
            DateTime? fechaFinExtendida = null;
            DateTime? fechaFinAcordada = null;

            const string ESTADO_ESTANDAR = "Estándar";
            const string ESTADO_ESTANDAR_RESTRINGIDO = "Estándar Restringido";
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {
                        var dataValidation = ValidarObjTecnologia(objeto, ctx);
                        if (dataValidation.Code == (int)EResultCode.OK)
                        {
                            tipoInicial = ctx.Tipo.FirstOrDefault(x => x.Nombre.ToUpper().Equals(objeto.technologyType.ToUpper())).TipoId;

                            if (ESTADO_ESTANDAR == objeto.finalTechnologyType)
                                estado = (int)ETecnologiaEstado.Vigente;
                            else if (ESTADO_ESTANDAR_RESTRINGIDO == objeto.finalTechnologyType)
                                //estado = (int)ETecnologiaEstado.VigentePorVencer;
                                estado = (int)ETecnologiaEstado.Deprecado;
                            else
                            {
                                if (tipoInicial == (int)ETipoTecnologia.NoEstandar)
                                    estado = (int)ETecnologiaEstado.Obsoleto;
                                else
                                    estado = objeto.technologyState;
                            }

                            if (objeto.typeEndDateSupport == (int)FechaCalculoTecnologia.FechaFinSoporte)
                                fechaFin = objeto.endDateSupport;
                            if (objeto.typeEndDateSupport == (int)FechaCalculoTecnologia.FechaExtendida)
                                fechaFinExtendida = objeto.endDateSupport;
                            if (objeto.typeEndDateSupport == (int)FechaCalculoTecnologia.FechaInterna)
                                fechaFinAcordada = objeto.endDateSupport;

                            if (objeto.technologyId == 0)
                            {
                                var entidad = new Tecnologia()
                                {
                                    EstadoTecnologia = (int)EstadoTecnologia.Aprobado,
                                    SubdominioId = objeto.subdomainId,
                                    TecnologiaId = objeto.technologyId,
                                    Activo = true,
                                    ClaveTecnologia = string.Format("{0} {1} {2}", objeto.vendor, objeto.technologyName, objeto.version),
                                    UsuarioCreacion = "power-apps",
                                    FechaCreacion = fechaActual,
                                    Nombre = objeto.technologyName,
                                    Descripcion = objeto.description,
                                    Versiones = objeto.version,
                                    TipoTecnologia = tipoInicial,
                                    FamiliaId = 1,
                                    FlagConfirmarFamilia = true,
                                    FlagFechaFinSoporte = objeto.hasEndDateSupport,
                                    FechaCalculoTec = objeto.typeEndDateSupport,
                                    FechaLanzamiento = null,
                                    FechaExtendida = fechaFinExtendida,
                                    FechaFinSoporte = fechaFin,
                                    FechaAcordada = fechaFinAcordada,
                                    ComentariosFechaFin = "",
                                    FuenteId = objeto.endDateSupportSource,
                                    Existencia = objeto.valueParameterExistencia,
                                    Facilidad = objeto.valueParameterFacilidad,
                                    Riesgo = objeto.valueParameterRiesgo,
                                    Vulnerabilidad = objeto.valueParameterVulnerabilidad,
                                    CasoUso = objeto.useCases,
                                    Requisitos = "",
                                    Compatibilidad = "",
                                    Aplica = "",
                                    FlagAplicacion = null,
                                    CodigoAPT = "",
                                    Fabricante = objeto.vendor,
                                    //Fin tab 1                        
                                    EliminacionTecObsoleta = null,
                                    RoadmapOpcional = "",
                                    Referencias = "",
                                    PlanTransConocimiento = "",
                                    EsqMonitoreo = "",
                                    LineaBaseSeg = "",
                                    EsqPatchManagement = "",
                                    //Fin tab 2
                                    DuenoId = "",
                                    EqAdmContacto = Utilitarios.FullStr(objeto.managementTeam),
                                    GrupoSoporteRemedy = Utilitarios.FullStr(objeto.remedySupportGroup),
                                    ConfArqSegId = Utilitarios.FullStr(objeto.complianceSecurityArchitect),
                                    ConfArqTecId = Utilitarios.FullStr(objeto.complianceTechnologyArchitect),
                                    EncargRenContractual = "",
                                    EsqLicenciamiento = "",
                                    SoporteEmpresarial = "",
                                    UrlConfluence = objeto.confluenceUrl,
                                    //TipoId = objeto.TipoId,
                                    EstadoId = estado,
                                    FlagSiteEstandar = objeto.shownStandarsSite,
                                    FechaAprobacion = fechaActual
                                    //Fin tab 3                                                  
                                };
                                ctx.Tecnologia.Add(entidad);
                                ctx.SaveChanges();
                                ID = entidad.TecnologiaId;
                            }
                            else
                            {
                                var entidad = ctx.Tecnologia.FirstOrDefault(x => x.TecnologiaId == objeto.technologyId);
                                if (entidad != null)
                                {
                                    entidad.EqAdmContacto = string.IsNullOrWhiteSpace(objeto.managementTeam) ? entidad.EqAdmContacto : objeto.managementTeam;
                                    entidad.GrupoSoporteRemedy = string.IsNullOrWhiteSpace(objeto.remedySupportGroup) ? entidad.GrupoSoporteRemedy : objeto.remedySupportGroup;
                                    entidad.ConfArqSegId = string.IsNullOrWhiteSpace(objeto.complianceSecurityArchitect) ? entidad.ConfArqSegId : objeto.complianceSecurityArchitect;
                                    entidad.ConfArqTecId = string.IsNullOrWhiteSpace(objeto.complianceTechnologyArchitect) ? entidad.ConfArqTecId : objeto.complianceTechnologyArchitect;
                                    entidad.UrlConfluence = string.IsNullOrWhiteSpace(objeto.confluenceUrl) ? entidad.UrlConfluence : objeto.confluenceUrl;

                                    entidad.FechaModificacion = fechaActual;
                                    entidad.UsuarioModificacion = "power-apps";

                                    ctx.SaveChanges();

                                    ID = entidad.TecnologiaId;
                                }
                            }

                            transaction.Commit();
                        }
                        else
                        {
                            ID = dataValidation.Code;
                        }

                        return ID;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaDTO> GetTecnologiaEstandar_2(string _tecnologia, string _tipoTecIds, string _estadoTecIds, bool _getAll, string _subdominioIds = null, string _dominiosId = null, string _aplica = null, string _compatibilidadSO = null, string _compatibilidadCloud = null)
        {
            try
            {
                var fechaActual = DateTime.Now.Date;
                var subdominioIntIds = new List<int>();
                var dominiosIntIds = new List<int>();

                var tipoTecIntIds = new List<int>();
                var estadoTecIntIds = new List<int>();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var parametroMeses1 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES").Valor;
                        int cantidadMeses1 = int.Parse(parametroMeses1);

                        if (!string.IsNullOrEmpty(_dominiosId))
                            dominiosIntIds = _dominiosId.Split('|').Select(x => int.Parse(x)).ToList();

                        if (!string.IsNullOrEmpty(_subdominioIds))
                            subdominioIntIds = _subdominioIds.Split('|').Select(x => int.Parse(x)).ToList();

                        if (!string.IsNullOrEmpty(_tipoTecIds))
                            tipoTecIntIds = _tipoTecIds.Split('|').Select(x => int.Parse(x)).ToList();

                        if (!string.IsNullOrEmpty(_estadoTecIds))
                            estadoTecIntIds = _estadoTecIds.Split('|').Select(x => int.Parse(x)).ToList();

                        var aplicaIds = string.IsNullOrEmpty(_aplica) ? (new List<string>()).AsQueryable() : _aplica.Split('|').ToList().AsQueryable();
                        var compatibilidadSOIds = string.IsNullOrEmpty(_compatibilidadSO) ? (new List<string>()).AsQueryable() : _compatibilidadSO.Split('|').AsQueryable();
                        var compatibilidadCloudIds = string.IsNullOrEmpty(_compatibilidadCloud) ? (new List<string>()).AsQueryable() : _compatibilidadCloud.Split('|').AsQueryable();

                        var tecnologia = (from t in ctx.Tecnologia
                                          join t2 in ctx.Tipo on t.TipoTecnologia equals t2.TipoId
                                          join t3 in ctx.Producto on t.ProductoId equals t3.ProductoId into ljt3
                                          from t3 in ljt3.DefaultIfEmpty()
                                          where t.Activo
                                          && !t.FlagEliminado
                                          && (_getAll || t.FlagSiteEstandar.Value)
                                          && (string.IsNullOrEmpty(_tecnologia) || t.ClaveTecnologia.ToUpper().Contains(_tecnologia.ToUpper()))
                                          && (aplicaIds.Count() == 0 || aplicaIds.Contains(t.Aplica))
                                          && (compatibilidadSOIds.Count() == 0 || compatibilidadSOIds.Count(x => t.CompatibilidadSOId.Contains(x)) > 0)
                                          && (compatibilidadCloudIds.Count() == 0 || compatibilidadCloudIds.Count(x => t.CompatibilidadCloudId.Contains(x)) > 0)
                                          select new TecnologiaBase()
                                          {
                                              Id = t.TecnologiaId,
                                              Nombre = t.ClaveTecnologia,
                                              SubdominioId = t.SubdominioId,
                                              EstadoId = t.EstadoId ?? 3,
                                              //EstadoId = t.EstadoId ?? 3,
                                              CodigoTecnologia = t.CodigoTecnologiaAsignado,
                                              CodigoProducto = t3 == null ? null : t3.Codigo,
                                              Url = t.UrlConfluence,
                                              FlagFechaFinSoporte = t.FlagFechaFinSoporte,
                                              FechaCalculoTec = t.FechaCalculoTec,
                                              FechaExtendida = t.FechaExtendida,
                                              FechaFinSoporte = t.FechaFinSoporte,
                                              FechaAcordada = t.FechaAcordada,
                                              TipoTecnologia = t.TipoTecnologia,
                                              TipoTecnologiaToString = t2.Nombre,
                                              Indicador1 = cantidadMeses1,
                                              CantidadMeses1 = cantidadMeses1
                                          }).ToList();

                        var dominio = (from d in ctx.Dominio
                                       where d.Activo && (string.IsNullOrEmpty(_dominiosId) || dominiosIntIds.Contains(d.DominioId))
                                       select d).ToList();

                        var subdominio = (from s in ctx.Subdominio
                                          where s.Activo && (string.IsNullOrEmpty(_subdominioIds) || subdominioIntIds.Contains(s.SubdominioId))
                                          select s).ToList();

                        var tipotecnologia = (from t in ctx.Tipo
                                              where t.Activo && (string.IsNullOrEmpty(_tipoTecIds) || tipoTecIntIds.Contains(t.TipoId))
                                              select t).ToList();

                        var registros = (from d in dominio
                                         join s in subdominio on d.DominioId equals s.DominioId
                                         join t in tecnologia on s.SubdominioId equals t.SubdominioId
                                         join tt in tipotecnologia on t.TipoTecnologia equals tt.TipoId
                                         where
                                         //(string.IsNullOrEmpty(_dominiosId) || dominiosIntIds.Contains(s.DominioId)) 
                                         //&& (string.IsNullOrEmpty(_subdominioIds) || subdominioIntIds.Contains(s.SubdominioId))
                                         //&& (string.IsNullOrEmpty(_tipoTecIds) || tipoTecIntIds.Contains(tt.TipoId))
                                         (string.IsNullOrEmpty(_estadoTecIds) || estadoTecIntIds.Contains(t.EstadoIdCalculado.Value))
                                         //(string.IsNullOrEmpty(_estadoTecIds) || estadoTecIntIds.Contains(t.EstadoIdCalculadoEstandar))
                                         //&& (string.IsNullOrEmpty(_tecnologia) || t.Nombre.ToUpper().Equals(_tecnologia.ToUpper()))
                                         group new { d, s, t, tt } by new
                                         {
                                             DomId = d.DominioId,
                                             Dominio = d.Nombre,
                                             SubId = s.SubdominioId,
                                             Subdomino = s.Nombre,
                                             TipoTec = tt.Nombre,
                                             TipoId = tt.TipoId
                                         } into grp
                                         orderby grp.Key.Dominio
                                         select grp).ToList().Select(grp =>
                                         new TecnologiaDTO()
                                         {
                                             DominioNomb = grp.Key.Dominio,
                                             DominioId = grp.Key.DomId,
                                             SubdominioId = grp.Key.SubId,
                                             SubdominioNomb = grp.Key.Subdomino,
                                             TipoTecNomb = grp.Key.TipoTec,
                                             TipoTecnologiaId = grp.Key.TipoId,
                                             //TecnologiaVigenteStr = string.Join("<hr class='custom-hr'></br>",
                                             //    tecnologia.Where(x=>x.EstadoId == (int)ETecnologiaEstado.Vigente).ToList()
                                             //    .Join(tipotecnologia, t1 => t1.TipoTecnologia, t2 => t2.TipoId, (t1, t2) => new { t1, t2 })
                                             //    .Where(y => y.t1.SubdominioId == grp.Key.SubId && y.t1.EstadoId == (int)ETecnologiaEstado.Vigente).ToArray()
                                             //    .Select(m => Utilitarios.DevolverTecnologiaEstandarStr(m.t1.Url, m.t1.CodigoTecnologia, m.t1.Nombre, "vigenteClass", m.t2.FlagMostrarEstado, m.t1.TipoTecnologiaToString, m.t1.Id))),
                                             //TecnologiaDeprecadoStr = string.Join("<hr class='custom-hr'></br>",
                                             //    tecnologia.Where(x => x.EstadoId == (int)ETecnologiaEstado.Deprecado).ToList()
                                             //    .Join(tipotecnologia, t1 => t1.TipoTecnologia, t2 => t2.TipoId, (t1, t2) => new { t1, t2 })
                                             //    .Where(y => y.t1.SubdominioId == grp.Key.SubId && y.t1.EstadoId == (int)ETecnologiaEstado.Deprecado).ToArray()
                                             //    .Select(m => Utilitarios.DevolverTecnologiaEstandarStr(m.t1.Url, m.t1.CodigoTecnologia, m.t1.Nombre, "deprecadoClass", m.t2.FlagMostrarEstado, m.t1.TipoTecnologiaToString, m.t1.Id))),
                                             //TecnologiaObsoletoStr = string.Join("<hr class='custom-hr'></br>",
                                             //    tecnologia.Where(x => x.EstadoId == (int)ETecnologiaEstado.Obsoleto).ToList()
                                             //    .Join(tipotecnologia, t1 => t1.TipoTecnologia, t2 => t2.TipoId, (t1, t2) => new { t1, t2 })
                                             //    .Where(y => y.t1.SubdominioId == grp.Key.SubId && y.t1.EstadoId == (int)ETecnologiaEstado.Obsoleto).ToArray()
                                             //    .Select(m => Utilitarios.DevolverTecnologiaEstandarStr(m.t1.Url, m.t1.CodigoTecnologia, m.t1.Nombre, "obsoletoClass", m.t2.FlagMostrarEstado, m.t1.TipoTecnologiaToString, m.t1.Id))),
                                         }).ToList();

                        var tecnologiaIds = tecnologia.Select(x => x.Id).ToArray();

                        //var tecCicloVida = (from u in ctx.TecnologiaCicloVida
                        //                    where
                        //                    tecnologiaIds.Contains(u.TecnologiaId) &&
                        //                    u.DiaRegistro == fechaActual.Day &&
                        //                    u.MesRegistro == fechaActual.Month &&
                        //                    u.AnioRegistro == fechaActual.Year
                        //                    select new
                        //                    {
                        //                        TecnologiaId = u.TecnologiaId,
                        //                        Obsoleto = u.Obsoleto,
                        //                        EsIndefinida = u.EsIndefinida,
                        //                        FechaCalculoBase = u.FechaCalculoBase
                        //                    }
                        //    ).ToList();


                        foreach (var item in registros)
                        {
                            var vigente = (from u in tecnologia
                                           join u2 in tipotecnologia on u.TipoTecnologia equals u2.TipoId
                                           //join u3 in tecCicloVida on u.Id equals u3.TecnologiaId into lu3
                                           //from u3 in lu3.DefaultIfEmpty()
                                           where (u.EstadoIdCalculado == (int)ETecnologiaEstadoEstandar.Vigente || u.EstadoIdCalculado == (int)ETecnologiaEstadoEstandar.VigentePorVencer)
                                           && (string.IsNullOrEmpty(_estadoTecIds) || estadoTecIntIds.Contains(u.EstadoIdCalculado.Value))
                                           && u.TipoTecnologia == item.TipoTecnologiaId
                                           && u.SubdominioId == item.SubdominioId
                                           //select Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoTecnologia, u.Nombre, "vigenteClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id))
                                           select
                                           !u.FechaCalculada.HasValue ?
                                           Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoProducto, u.Nombre, "vigenteClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id) :
                                           GetSemaforoTecnologiaClass(u.FechaCalculada.Value, fechaActual, cantidadMeses1, u.Url, u.CodigoProducto, u.Nombre, u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id)
                                           )
                                           .ToList();

                            //var deprecado = (from u in tecnologia
                            //                 join u2 in tipotecnologia on u.TipoTecnologia equals u2.TipoId
                            //                 where u.EstadoIdCalculado == (int)ETecnologiaEstado.VigentePorVencer
                            //                 && u.TipoTecnologia == item.TipoTecnologiaId
                            //                 && u.SubdominioId == item.SubdominioId
                            //                 //select Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoTecnologia, u.Nombre, "deprecadoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id))
                            //                 select
                            //                 //Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoProducto, u.Nombre, "deprecadoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id)
                            //                 !u.FechaCalculada.HasValue ?
                            //               Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoProducto, u.Nombre, "deprecadoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id) :
                            //               GetSemaforoTecnologiaClass(u.FechaCalculada.Value, fechaActual, cantidadMeses1, u.Url, u.CodigoProducto, u.Nombre, u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id)
                            //                 )
                            //               .ToList();

                            //var deprecado = (from u in tecnologia
                            //                 join u2 in tipotecnologia on u.TipoTecnologia equals u2.TipoId
                            //                 where u.EstadoIdCalculado == (int)ETecnologiaEstado.Deprecado
                            //                 && u.TipoTecnologia == item.TipoTecnologiaId
                            //                 && u.SubdominioId == item.SubdominioId
                            //                 //select Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoTecnologia, u.Nombre, "deprecadoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id))
                            //                 select
                            //                 //Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoProducto, u.Nombre, "deprecadoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id)
                            //                 !u.FechaCalculada.HasValue ?
                            //               Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoProducto, u.Nombre, "deprecadoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id) :
                            //               GetSemaforoTecnologiaClass(u.FechaCalculada.Value, fechaActual, cantidadMeses1, u.Url, u.CodigoProducto, u.Nombre, u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id)
                            //                 )
                            //               .ToList();

                            var obsoleto = (from u in tecnologia
                                            join u2 in tipotecnologia on u.TipoTecnologia equals u2.TipoId
                                            where u.EstadoIdCalculado == (int)ETecnologiaEstadoEstandar.Obsoleto
                                            && (string.IsNullOrEmpty(_estadoTecIds) || estadoTecIntIds.Contains(u.EstadoIdCalculado.Value))
                                            && u.TipoTecnologia == item.TipoTecnologiaId
                                            && u.SubdominioId == item.SubdominioId
                                            //select Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoTecnologia, u.Nombre, "obsoletoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id))
                                            select
                                            //Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoProducto, u.Nombre, "obsoletoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id)
                                            !u.FechaCalculada.HasValue ?
                                           Utilitarios.DevolverTecnologiaEstandarStr(u.Url, u.CodigoProducto, u.Nombre, "obsoletoClass", u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id) :
                                           GetSemaforoTecnologiaClass(u.FechaCalculada.Value, fechaActual, cantidadMeses1, u.Url, u.CodigoProducto, u.Nombre, u2.FlagMostrarEstado, u.TipoTecnologiaToString, u.Id)
                                            )
                                           .ToList();

                            item.TecnologiaVigenteStr = string.Join("<br/>", vigente);
                            //item.TecnologiaDeprecadoStr = string.Join("<br/>", deprecado);
                            item.TecnologiaObsoletoStr = string.Join("<br/>", obsoleto);
                        }
                        return registros;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaEstandar()"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecnologiaEstandar()"
                    , new object[] { null });
            }
        }

        public override TecnologiaAutocomplete GetTecnologiaById(int Id)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var item = (from u in ctx.Tecnologia
                                    join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                    join d in ctx.Dominio on s.DominioId equals d.DominioId
                                    join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId
                                    where u.Activo && s.Activo && d.Activo && t.Activo
                                    && u.TecnologiaId == Id
                                    orderby u.Nombre
                                    select new TecnologiaAutocomplete()
                                    {
                                        Id = u.TecnologiaId,
                                        Dominio = d.Nombre,
                                        Subdominio = s.Nombre,
                                        FechaFinSoporte = u.FechaFinSoporte,
                                        TipoTecnologia = t.Nombre
                                    }).FirstOrDefault();

                        return item;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: TecnologiaAutocomplete GetTecnologiaById(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: TecnologiaAutocomplete GetTecnologiaById(int Id)"
                    , new object[] { null });
            }
        }

        public override List<CustomAutocompleteRelacion> GetTecnologiaEstandarByClaveTecnologia(string filtro, bool? getAll = false)
        {
            try
            {
                //var subdominioIntIds = new List<int>();
                //if (!string.IsNullOrEmpty(subdominioIds))
                //    subdominioIntIds = subdominioIds.Split('|').Select(x => int.Parse(x)).ToList();

                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join d in ctx.Dominio on s.DominioId equals d.DominioId
                                       //join f in ctx.Familia on u.FamiliaId equals f.FamiliaId
                                       where u.Activo && s.Activo && d.Activo //&& f.Activo
                                       && (getAll.Value || u.FlagSiteEstandar.Value)
                                       && (string.IsNullOrEmpty(filtro) || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper()))
                                       //&& (string.IsNullOrEmpty(subdominioIds) || subdominioIntIds.Contains(u.SubdominioId))
                                       //&& u.EstadoTecnologia == (int)EstadoTecnologia.Aprobado
                                       orderby u.Nombre
                                       select new CustomAutocompleteRelacion()
                                       {
                                           Id = u.TecnologiaId.ToString(),
                                           Descripcion = u.ClaveTecnologia,
                                           value = u.ClaveTecnologia,
                                           TipoTecnologia = t.Nombre,
                                           FechaFinSoporte = u.FechaFinSoporte,
                                           Dominio = d.Nombre,
                                           Subdominio = s.Nombre
                                       }).ToList();

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<CustomAutocomplete> GetAllTecnologiaByClaveTecnologia(string filtro)"
                    , new object[] { null });
            }
        }

        public override int AddOrEditNewTecnologia(TecnologiaDTO objeto)
        {
            DbContextTransaction transaction = null;
            var registroNuevo = false;
            int ID = 0;
            var CURRENT_DATE = DateTime.Now;

            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {
                        if (objeto.Id == 0)
                        {
                            var entidad = new Tecnologia()
                            {
                                ProductoId = objeto.ProductoId,
                                Producto = objeto.Producto == null ? null : new Producto
                                {
                                    Fabricante = objeto.Producto.Fabricante,
                                    Nombre = objeto.Producto.Nombre,
                                    Descripcion = objeto.Producto.Descripcion,
                                    DominioId = objeto.Producto.DominioId,
                                    SubDominioId = objeto.Producto.SubDominioId,
                                    TipoProductoId = objeto.Producto.TipoProductoId,
                                    Codigo = objeto.Producto.Codigo,
                                    TribuCoeDisplayName = objeto.Producto.TribuCoeDisplayName,
                                    TribuCoeId = objeto.Producto.TribuCoeId,
                                    SquadDisplayName = objeto.Producto.SquadDisplayName,
                                    SquadId = objeto.Producto.SquadId,
                                    OwnerDisplayName = objeto.Producto.OwnerDisplayName,
                                    OwnerId = objeto.Producto.OwnerId,
                                    OwnerMatricula = objeto.Producto.OwnerMatricula,
                                    GrupoTicketRemedyNombre = objeto.Producto.GrupoTicketRemedyNombre,
                                    GrupoTicketRemedyId = objeto.Producto.GrupoTicketRemedyId,
                                    EsquemaLicenciamientoSuscripcionId = objeto.Producto.EsquemaLicenciamientoSuscripcionId,
                                    FlagActivo = true,
                                    CreadoPor = objeto.UsuarioCreacion,
                                    FechaCreacion = DateTime.Now
                                },
                                Fabricante = objeto.Fabricante,
                                Nombre = objeto.Nombre,
                                Versiones = objeto.Versiones,
                                ClaveTecnologia = objeto.ClaveTecnologia,
                                Descripcion = objeto.Descripcion,
                                FlagSiteEstandar = objeto.FlagSiteEstandar,
                                FlagTieneEquivalencias = objeto.FlagTieneEquivalencias,
                                MotivoId = objeto.MotivoId,
                                TipoTecnologia = objeto.TipoTecnologiaId,
                                CodigoProducto = objeto.CodigoProducto,
                                AutomatizacionImplementadaId = objeto.AutomatizacionImplementadaId,
                                RevisionSeguridadId = objeto.RevisionSeguridadId,
                                RevisionSeguridadDescripcion = objeto.RevisionSeguridadDescripcion,
                                FlagFechaFinSoporte = objeto.FlagFechaFinSoporte,
                                FuenteId = objeto.Fuente,
                                FechaCalculoTec = objeto.FechaCalculoTec,
                                FechaCalculo = objeto.FechaCalculoBase,
                                FechaLanzamiento = objeto.FechaLanzamiento,
                                FechaExtendida = objeto.FechaExtendida,
                                FechaFinSoporte = objeto.FechaFinSoporte,
                                FechaAcordada = objeto.FechaAcordada,
                                TipoFechaInterna = objeto.TipoFechaInterna,
                                ComentariosFechaFin = objeto.ComentariosFechaFin,
                                SustentoMotivo = objeto.SustentoMotivo,
                                SustentoUrl = objeto.SustentoUrl,
                                UrlConfluenceId = objeto.UrlConfluenceId,
                                UrlConfluence = objeto.UrlConfluence,
                                CasoUsoArchivo = objeto.CasoUsoArchivo,
                                CasoUso = objeto.CasoUso,
                                Aplica = objeto.Aplica,
                                CompatibilidadSOId = objeto.CompatibilidadSOId,
                                CompatibilidadCloudId = objeto.CompatibilidadCloudId,
                                Requisitos = objeto.Requisitos,
                                Existencia = objeto.Existencia,
                                Riesgo = objeto.Riesgo,
                                Facilidad = objeto.Facilidad,
                                Vulnerabilidad = objeto.Vulnerabilidad,


                                EstadoTecnologia = (int)EstadoTecnologia.Aprobado,
                                //EstadoId = !(objeto.FlagFechaFinSoporte ?? false) ? (objeto.Fuente ?? -1) != (int)Fuente.Manual ? (int)ETecnologiaEstado.Obsoleto : (int)ETecnologiaEstado.Vigente : objeto.FechaCalculoTec == null ? (int)ETecnologiaEstado.Obsoleto : (objeto.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaExtendida && objeto.FechaExtendida.Value >= DateTime.Now) || (objeto.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaFinSoporte && objeto.FechaFinSoporte.Value >= DateTime.Now) || (objeto.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaInterna && objeto.FechaAcordada.Value >= DateTime.Now) ? (int)ETecnologiaEstado.Vigente : (int)ETecnologiaEstado.Obsoleto,
                                //EstadoId = (int)EEstadoObsolescenciaProducto.Vigente,
                                Activo = true,
                                FlagEliminado = false,
                                //Activo = objeto.Activo,
                                UsuarioCreacion = objeto.UsuarioCreacion,
                                FechaCreacion = DateTime.Now,
                                //Fin tab 1
                                SubdominioId = objeto.SubdominioId,
                                RoadmapOpcional = objeto.RoadmapOpcional,
                                Referencias = objeto.Referencias,
                                PlanTransConocimiento = objeto.PlanTransConocimiento,
                                EsqMonitoreo = objeto.EsqMonitoreo,
                                EsqPatchManagement = objeto.EsqPatchManagement,
                                //Fin tab 2
                                DuenoId = objeto.Dueno,
                                EqAdmContacto = objeto.EqAdmContacto,
                                GrupoSoporteRemedy = objeto.GrupoSoporteRemedy,
                                ConfArqSegId = objeto.ConfArqSeg,
                                ConfArqTecId = objeto.ConfArqTec,
                                EncargRenContractual = objeto.EncargRenContractual,
                                EsqLicenciamiento = objeto.EsqLicenciamiento,
                                SoporteEmpresarial = objeto.SoporteEmpresarial,
                                EquipoAprovisionamiento = objeto.EquipoAprovisionamiento,
                                //Fin tab 3
                            };

                            ctx.Tecnologia.Add(entidad);
                            ctx.SaveChanges();

                            if (objeto.ListAutorizadores != null)
                            {
                                foreach (var item in objeto.ListAutorizadores)
                                {
                                    var autorizador = new TecnologiaAutorizador
                                    {
                                        TecnologiaId = entidad.TecnologiaId,
                                        AutorizadorId = item.AutorizadorId,
                                        Matricula = item.Matricula,
                                        Nombres = item.Nombres,
                                        FlagActivo = true,
                                        FlagEliminado = false,
                                        CreadoPor = objeto.UsuarioCreacion,
                                        FechaCreacion = DateTime.Now
                                    };

                                    ctx.TecnologiaAutorizador.Add(autorizador);
                                    ctx.SaveChanges();
                                }
                            }

                            if (objeto.ListArquetipo != null)
                            {
                                foreach (var item in objeto.ListArquetipo)
                                {
                                    var arquetipo = new TecnologiaArquetipo
                                    {
                                        TecnologiaId = entidad.TecnologiaId,
                                        ArquetipoId = item.Id,
                                        FlagActivo = true,
                                        FlagEliminado = false,
                                        CreadoPor = objeto.UsuarioCreacion,
                                        FechaCreacion = DateTime.Now
                                    };

                                    ctx.TecnologiaArquetipo.Add(arquetipo);
                                    ctx.SaveChanges();
                                }
                            }

                            if (objeto.ListAplicaciones != null && objeto.TipoTecnologiaId == (int)ETipo.EstandarRestringido)
                            {
                                foreach (var item in objeto.ListAplicaciones)
                                {
                                    var aplicacion = new TecnologiaAplicacion
                                    {
                                        TecnologiaId = entidad.TecnologiaId,
                                        AplicacionId = item.AplicacionId,
                                        FlagActivo = true,
                                        FlagEliminado = false,
                                        CreadoPor = objeto.UsuarioCreacion,
                                        FechaCreacion = DateTime.Now
                                    };

                                    ctx.TecnologiaAplicacion.Add(aplicacion);
                                    ctx.SaveChanges();
                                }
                            }
                            else
                            {
                                var aplicacionLista = ctx.TecnologiaAplicacion.Where(x => x.TecnologiaId == entidad.TecnologiaId && x.FlagActivo && !x.FlagEliminado).ToList();

                                foreach (var item in aplicacionLista)
                                {
                                    item.FlagActivo = false;
                                    item.FlagEliminado = true;
                                    item.ModificadoPor = objeto.UsuarioModificacion;
                                    item.FechaModificacion = DateTime.Now;

                                    ctx.SaveChanges();
                                }
                            }

                            if (objeto.ListEquivalencias != null)
                            {

                                foreach (var item in objeto.ListEquivalencias)
                                {
                                    var equivalencia = new TecnologiaEquivalencia
                                    {
                                        TecnologiaId = entidad.TecnologiaId,
                                        Nombre = item.Nombre,
                                        FlagActivo = true,
                                        CreadoPor = objeto.UsuarioCreacion,
                                        FechaCreacion = DateTime.Now
                                    };

                                    ctx.TecnologiaEquivalencia.Add(equivalencia);
                                    ctx.SaveChanges();
                                }
                            }

                            ID = entidad.TecnologiaId;
                            registroNuevo = true;
                        }
                        else
                        {
                            var entidad = ctx.Tecnologia.FirstOrDefault(x => x.TecnologiaId == objeto.Id);
                            if (entidad != null)
                            {
                                entidad.ProductoId = objeto.ProductoId;
                                if (objeto.Producto != null)
                                {
                                    entidad.Producto = new Producto();
                                    entidad.Producto.Fabricante = objeto.Producto.Fabricante;
                                    entidad.Producto.Nombre = objeto.Producto.Nombre;
                                    entidad.Producto.DominioId = objeto.Producto.DominioId;
                                    entidad.Producto.SubDominioId = objeto.Producto.SubDominioId;
                                    entidad.Producto.TipoProductoId = objeto.Producto.TipoProductoId;
                                    entidad.Producto.Codigo = objeto.Producto.Codigo;
                                    entidad.Producto.TribuCoeDisplayName = objeto.Producto.TribuCoeDisplayName;
                                    entidad.Producto.TribuCoeId = objeto.Producto.TribuCoeId;
                                    entidad.Producto.SquadDisplayName = objeto.Producto.SquadDisplayName;
                                    entidad.Producto.SquadId = objeto.Producto.SquadId;
                                    entidad.Producto.OwnerDisplayName = objeto.Producto.OwnerDisplayName;
                                    entidad.Producto.OwnerId = objeto.Producto.OwnerId;
                                    entidad.Producto.OwnerMatricula = objeto.Producto.OwnerMatricula;
                                    entidad.Producto.GrupoTicketRemedyNombre = objeto.Producto.GrupoTicketRemedyNombre;
                                    entidad.Producto.GrupoTicketRemedyId = objeto.Producto.GrupoTicketRemedyId;
                                    entidad.Producto.EsquemaLicenciamientoSuscripcionId = objeto.Producto.EsquemaLicenciamientoSuscripcionId;
                                    entidad.Producto.CreadoPor = objeto.UsuarioCreacion;
                                    entidad.Producto.FechaCreacion = DateTime.Now;
                                }
                                entidad.Fabricante = objeto.Fabricante;
                                entidad.Nombre = objeto.Nombre;
                                entidad.Versiones = objeto.Versiones;
                                entidad.ClaveTecnologia = objeto.ClaveTecnologia;
                                entidad.Descripcion = objeto.Descripcion;
                                entidad.FlagSiteEstandar = objeto.FlagSiteEstandar;
                                entidad.FlagTieneEquivalencias = objeto.FlagTieneEquivalencias;
                                entidad.MotivoId = objeto.MotivoId;
                                entidad.TipoTecnologia = objeto.TipoTecnologiaId;
                                entidad.CodigoProducto = objeto.CodigoProducto;
                                entidad.AutomatizacionImplementadaId = objeto.AutomatizacionImplementadaId;
                                entidad.RevisionSeguridadId = objeto.RevisionSeguridadId;
                                entidad.RevisionSeguridadDescripcion = objeto.RevisionSeguridadDescripcion;
                                entidad.FlagFechaFinSoporte = objeto.FlagFechaFinSoporte;
                                entidad.FuenteId = objeto.Fuente;
                                //entidad.EstadoId = !(objeto.FlagFechaFinSoporte ?? false) ? (int)ETecnologiaEstado.Vigente : objeto.FechaCalculoTec == null ? (int)ETecnologiaEstado.Obsoleto : (objeto.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaExtendida && objeto.FechaExtendida.Value >= DateTime.Now) || (objeto.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaFinSoporte && objeto.FechaFinSoporte.Value >= DateTime.Now) || (objeto.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaInterna && objeto.FechaAcordada.Value >= DateTime.Now) ? (int)ETecnologiaEstado.Vigente : (int)ETecnologiaEstado.Obsoleto;
                                entidad.FechaCalculoTec = objeto.FechaCalculoTec;
                                entidad.FechaLanzamiento = objeto.FechaLanzamiento;
                                entidad.FechaExtendida = objeto.FechaExtendida;
                                entidad.FechaFinSoporte = objeto.FechaFinSoporte;
                                entidad.FechaAcordada = objeto.FechaAcordada;
                                entidad.ComentariosFechaFin = objeto.ComentariosFechaFin;
                                entidad.SustentoMotivo = objeto.SustentoMotivo;
                                entidad.SustentoUrl = objeto.SustentoUrl;
                                entidad.UrlConfluenceId = objeto.UrlConfluenceId;
                                entidad.UrlConfluence = objeto.UrlConfluence;
                                entidad.CasoUsoArchivo = objeto.CasoUsoArchivo;
                                entidad.CasoUso = objeto.CasoUso;
                                entidad.Aplica = objeto.Aplica;
                                entidad.CompatibilidadSOId = objeto.CompatibilidadSOId;
                                entidad.CompatibilidadCloudId = objeto.CompatibilidadCloudId;
                                entidad.Requisitos = objeto.Requisitos;
                                entidad.Existencia = objeto.Existencia;
                                entidad.Riesgo = objeto.Riesgo;
                                entidad.Facilidad = objeto.Facilidad;
                                entidad.Vulnerabilidad = objeto.Vulnerabilidad;


                                entidad.UsuarioModificacion = objeto.UsuarioCreacion;
                                entidad.FechaModificacion = DateTime.Now;
                                //Fin tab 1
                                entidad.SubdominioId = objeto.SubdominioId;
                                entidad.RoadmapOpcional = objeto.RoadmapOpcional;
                                entidad.Referencias = objeto.Referencias;
                                entidad.PlanTransConocimiento = objeto.PlanTransConocimiento;
                                entidad.EsqMonitoreo = objeto.EsqMonitoreo;
                                entidad.EsqPatchManagement = objeto.EsqPatchManagement;
                                //Fin tab 2
                                entidad.DuenoId = objeto.Dueno;
                                entidad.EqAdmContacto = objeto.EqAdmContacto;
                                entidad.GrupoSoporteRemedy = objeto.GrupoSoporteRemedy;
                                entidad.ConfArqSegId = objeto.ConfArqSeg;
                                entidad.ConfArqTecId = objeto.ConfArqTec;
                                entidad.EncargRenContractual = objeto.EncargRenContractual;
                                entidad.EsqLicenciamiento = objeto.EsqLicenciamiento;
                                entidad.SoporteEmpresarial = objeto.SoporteEmpresarial;
                                entidad.EquipoAprovisionamiento = objeto.EquipoAprovisionamiento;
                                //Fin tab 3

                                ctx.SaveChanges();
                                //if (objeto.ItemsRemoveAutId != null)
                                //{
                                //    foreach (int id in objeto.ItemsRemoveAutId)
                                //    {
                                //        var item = ctx.TecnologiaAutorizador.FirstOrDefault(x => x.TecnologiaAutorizadorId == id);
                                //        if (item != null)
                                //        {
                                //            item.FlagActivo = false;
                                //            item.FlagEliminado = true;
                                //            item.ModificadoPor = objeto.UsuarioModificacion;
                                //            item.FechaModificacion = DateTime.Now;
                                //        };
                                //        ctx.SaveChanges();
                                //    }
                                //}

                                //if (objeto.ListAutorizadores != null)
                                //{
                                //    foreach (var item in objeto.ListAutorizadores)
                                //    {
                                //        var autorizador = new TecnologiaAutorizador
                                //        {
                                //            TecnologiaId = entidad.TecnologiaId,
                                //            AutorizadorId = item.AutorizadorId,
                                //            Matricula = item.Matricula,
                                //            Nombres = item.Nombres,
                                //            FlagActivo = true,
                                //            FlagEliminado = false,
                                //            CreadoPor = objeto.UsuarioCreacion,
                                //            FechaCreacion = DateTime.Now
                                //        };

                                //        ctx.TecnologiaAutorizador.Add(autorizador);
                                //        ctx.SaveChanges();
                                //    }
                                //}

                                //if (objeto.ItemsRemoveArqId != null)
                                //{
                                //    foreach (int id in objeto.ItemsRemoveArqId)
                                //    {
                                //        var item = ctx.TecnologiaArquetipo.FirstOrDefault(x => x.TecnologiaArquetipoId == id);
                                //        if (item != null)
                                //        {
                                //            item.FlagActivo = false;
                                //            item.FlagEliminado = true;
                                //            item.ModificadoPor = objeto.UsuarioModificacion;
                                //            item.FechaModificacion = DateTime.Now;
                                //        };
                                //        ctx.SaveChanges();
                                //    }
                                //}

                                //if (objeto.ListArquetipo != null)
                                //{
                                //    foreach (var item in objeto.ListArquetipo)
                                //    {
                                //        var arquetipo = new TecnologiaArquetipo
                                //        {
                                //            TecnologiaId = entidad.TecnologiaId,
                                //            ArquetipoId = item.Id,
                                //            FlagActivo = true,
                                //            FlagEliminado = false,
                                //            CreadoPor = objeto.UsuarioCreacion,
                                //            FechaCreacion = DateTime.Now
                                //        };

                                //        ctx.TecnologiaArquetipo.Add(arquetipo);
                                //        ctx.SaveChanges();
                                //    }
                                //}

                                if (objeto.ItemsRemoveAppId != null)
                                {
                                    foreach (int id in objeto.ItemsRemoveAppId)
                                    {
                                        var item = ctx.TecnologiaAplicacion.FirstOrDefault(x => x.TecnologiaAplicacionId == id);
                                        if (item != null)
                                        {
                                            item.FlagActivo = false;
                                            item.FlagEliminado = true;
                                            item.ModificadoPor = objeto.UsuarioModificacion;
                                            item.FechaModificacion = DateTime.Now;
                                        };
                                        ctx.SaveChanges();
                                    }
                                }

                                if (objeto.ListAplicaciones != null && objeto.TipoTecnologiaId == (int)ETipo.EstandarRestringido)
                                {
                                    foreach (var item in objeto.ListAplicaciones)
                                    {
                                        var aplicacion = new TecnologiaAplicacion
                                        {
                                            TecnologiaId = entidad.TecnologiaId,
                                            AplicacionId = item.AplicacionId,
                                            FlagActivo = true,
                                            FlagEliminado = false,
                                            CreadoPor = objeto.UsuarioCreacion,
                                            FechaCreacion = DateTime.Now
                                        };

                                        ctx.TecnologiaAplicacion.Add(aplicacion);
                                        ctx.SaveChanges();
                                    }
                                }
                                else
                                {
                                    var aplicacionLista = ctx.TecnologiaAplicacion.Where(x => x.TecnologiaId == entidad.TecnologiaId && x.FlagActivo && !x.FlagEliminado).ToList();

                                    foreach (var item in aplicacionLista)
                                    {
                                        item.FlagActivo = false;
                                        item.FlagEliminado = true;
                                        item.ModificadoPor = objeto.UsuarioModificacion;
                                        item.FechaModificacion = DateTime.Now;

                                        ctx.SaveChanges();
                                    }
                                }



                                if (objeto.ListEquivalencias != null)
                                {

                                    foreach (var item in objeto.ListEquivalencias)
                                    {
                                        var equivalencia = new TecnologiaEquivalencia
                                        {
                                            TecnologiaId = entidad.TecnologiaId,
                                            Nombre = item.Nombre,
                                            FlagActivo = true,
                                            CreadoPor = objeto.UsuarioCreacion,
                                            FechaCreacion = DateTime.Now
                                        };

                                        ctx.TecnologiaEquivalencia.Add(equivalencia);
                                        ctx.SaveChanges();
                                    }
                                }

                                if (objeto.ItemsRemoveEqTecId != null)
                                {
                                    foreach (int id in objeto.ItemsRemoveEqTecId)
                                    {
                                        var item = ctx.TecnologiaEquivalencia.FirstOrDefault(x => x.TecnologiaEquivalenciaId == id);
                                        if (item != null)
                                        {
                                            item.FlagActivo = false;
                                            item.ModificadoPor = objeto.UsuarioModificacion;
                                            item.FechaModificacion = DateTime.Now;
                                        };
                                        ctx.SaveChanges();
                                    }
                                }

                                var archivo = (from u in ctx.ArchivosCVT
                                               where u.ArchivoId == objeto.ArchivoId
                                               select u).FirstOrDefault();
                                if (archivo != null)
                                {
                                    archivo.Activo = false;
                                    archivo.FechaModificacion = DateTime.Now;
                                    archivo.UsuarioModificacion = objeto.UsuarioModificacion;
                                    ctx.SaveChanges();
                                    //ID = entidad.ArchivoId;
                                }

                                ID = entidad.TecnologiaId;
                            }
                        }

                        transaction.Commit();
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }

            try
            {
                if (registroNuevo)
                {
                    var paramSP = new ObjTecnologia()
                    {
                        param1 = ID,
                        param2 = objeto.ItemsAddAutorizadorSTR,
                        param3 = objeto.ItemsRemoveAutIdSTR,
                        param4 = objeto.ItemsAddTecEqIdSTR,
                        param5 = objeto.ItemsRemoveTecEqIdSTR,
                        param6 = objeto.ItemsAddTecVinculadaIdSTR,
                        param7 = objeto.ItemsRemoveTecVinculadaIdSTR,
                        param8 = objeto.UsuarioCreacion,
                        param9 = objeto.UsuarioModificacion
                    };

                    this.ActualizarListasTecnologias(paramSP);
                }
                else
                {
                    var paramSP = new ObjTecnologia()
                    {
                        param1 = ID,
                        param2 = objeto.ItemsAddAutorizadorSTR,
                        param3 = objeto.ItemsRemoveAutIdSTR,
                        param4 = objeto.ItemsAddTecEqIdSTR,
                        param5 = objeto.ItemsRemoveTecEqIdSTR,
                        param6 = objeto.ItemsAddTecVinculadaIdSTR,
                        param7 = objeto.ItemsRemoveTecVinculadaIdSTR,
                        param8 = objeto.UsuarioCreacion,
                        param9 = objeto.UsuarioModificacion
                    };

                    this.ActualizarListasTecnologias(paramSP);
                }

                if ((objeto.EstadoId != (int)ETecnologiaEstado.Obsoleto && objeto.EstadoId.HasValue)
                                   && objeto.EstadoTecnologia == (int)EstadoTecnologia.Aprobado && objeto.FlagUnicaVigente == true)
                {
                    //this.ActualizarEstadoTecnologias(objeto.Id, objeto.FamiliaId.Value, (int)ETecnologiaEstado.VigentePorVencer);
                    this.ActualizarEstadoTecnologias(objeto.Id, objeto.FamiliaId.Value, (int)ETecnologiaEstado.Deprecado);
                }

                return ID;
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetNewTec(int? productoId, List<int> domIds, List<int> subdomIds, string filtro, string aplica, string codigo, string dueno, List<int> tipoTecIds, List<int> estObsIds, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                //casoUso = "";
                totalRows = 0;
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var parametroMeses1 = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("NRO_MESES_PROYECCIONES").Valor;
                        int cantidadMeses1 = int.Parse(parametroMeses1);

                        DateTime fechaActual = DateTime.Now;
                        DateTime fechaAgregada = fechaActual.AddMonths(cantidadMeses1);

                        var tecnologiaIds = new List<int>();

                        //if (!string.IsNullOrEmpty(equipo))
                        //{
                        //    tecnologiaIds = (from et in ctx.EquipoTecnologia
                        //                     join e in ctx.Equipo on et.EquipoId equals e.EquipoId
                        //                     where et.FlagActivo && e.FlagActivo
                        //                     && (e.Nombre.ToUpper().Contains(equipo.ToUpper())
                        //                     /*|| string.IsNullOrEmpty(equipo)*/)
                        //                     select et.TecnologiaId).ToList();
                        //}

                        var tecEquivalenciaIds = (from e in ctx.TecnologiaEquivalencia
                                                  where e.FlagActivo && e.Nombre.ToUpper().Contains(filtro.ToUpper())
                                                  select e.TecnologiaId
                                                ).ToList();

                        var registros = (from u in ctx.Tecnologia
                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId// into lj1
                                         join a in ctx.Producto on u.ProductoId equals a.ProductoId into lja
                                         from a in lja.DefaultIfEmpty()
                                         join b in ctx.Tipo on a.TipoProductoId equals b.TipoId into ljb
                                         from b in ljb.DefaultIfEmpty()
                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId into ljs
                                         from s in ljs.DefaultIfEmpty()
                                         join d in ctx.Dominio on s.DominioId equals d.DominioId into ljd
                                         from d in ljd.DefaultIfEmpty()
                                         join e in ctx.Motivo on u.MotivoId equals e.MotivoId into lje
                                         from e in lje.DefaultIfEmpty()
                                         //let fechaCalculo = !u.FechaCalculoTec.HasValue ? null : u.FechaCalculoTec.Value == (int)FechaCalculoTecnologia.FechaExtendida ? u.FechaExtendida : u.FechaCalculoTec.Value == (int)FechaCalculoTecnologia.FechaFinSoporte ? u.FechaFinSoporte : u.FechaCalculoTec.Value == (int)FechaCalculoTecnologia.FechaInterna ? u.FechaAcordada : null
                                         //let estadoEstandar = !fechaCalculo.HasValue ? (int)ETecnologiaEstado.Vigente : ((fechaCalculo.Value < fechaActual) ? (int)ETecnologiaEstado.Obsoleto : ((fechaCalculo.Value < fechaAgregada) ? (int)ETecnologiaEstado.VigentePorVencer : (int)ETecnologiaEstado.Vigente))
                                         let fechaCalculada = !u.FechaCalculoTec.HasValue ? null : (FechaCalculoTecnologia)u.FechaCalculoTec.Value == FechaCalculoTecnologia.FechaExtendida ? u.FechaExtendida : (FechaCalculoTecnologia)u.FechaCalculoTec.Value == FechaCalculoTecnologia.FechaInterna ? u.FechaAcordada : (FechaCalculoTecnologia)u.FechaCalculoTec.Value == FechaCalculoTecnologia.FechaFinSoporte ? u.FechaFinSoporte : null
                                         let estado = b.Nombre.ToLower().Contains("deprecado") ? (int)ETecnologiaEstado.Deprecado : ((u.FlagFechaFinSoporte ?? false) ? (!fechaCalculada.HasValue ? (int)ETecnologiaEstado.Obsoleto : (!fechaCalculada.HasValue ? (int)ETecnologiaEstado.Obsoleto : ((fechaCalculada.Value < fechaActual) ? (int)ETecnologiaEstado.Obsoleto : (int)ETecnologiaEstado.Vigente))) : (int)ETecnologiaEstado.Vigente)
                                         where u.Activo == true
                                         &&
                                         (u.Nombre.ToUpper().Contains(filtro.ToUpper())
                                         || u.Descripcion.ToUpper().Contains(filtro.ToUpper())
                                         || string.IsNullOrEmpty(filtro)
                                         || u.ClaveTecnologia.ToUpper().Contains(filtro.ToUpper())
                                         || tecEquivalenciaIds.Contains(u.TecnologiaId))

                                         && (productoId == null || u.ProductoId == productoId)
                                         && (domIds.Count == 0 || domIds.Contains(s.DominioId))
                                         && (subdomIds.Count == 0 || subdomIds.Contains(u.SubdominioId))
                                         
                                         //&& (estObsIds.Count == 0 || estObsIds.Contains(u.EstadoId.HasValue ? u.EstadoId.Value : 0))
                                         && (estObsIds.Count == 0 || estObsIds.Contains(estado))
                                         && (tipoTecIds.Count == 0 || tipoTecIds.Contains(u.TipoTecnologia.HasValue ? u.TipoTecnologia.Value : 0))
                                         //&& (string.IsNullOrEmpty(famId) || f == null || f.Nombre.ToUpper().Equals(famId.ToUpper()))
                                         //&& (fecId == -1 || u.FechaFinSoporte.HasValue == (fecId == 1))
                                         && (u.Aplica.ToUpper().Contains(aplica.ToUpper()) || string.IsNullOrEmpty(aplica))
                                         && ((u.CodigoProducto ?? (a != null ? (a.Codigo ?? "") : "")).ToUpper().Contains(codigo.ToUpper()) || string.IsNullOrEmpty(codigo))
                                         && (u.DuenoId.ToUpper().Contains(dueno.ToUpper()) || string.IsNullOrEmpty(dueno))
                                         //&& (string.IsNullOrEmpty(equipo) || tecnologiaIds.Contains(u.TecnologiaId))

                                         orderby u.Nombre
                                         select new TecnologiaG()
                                         {
                                             Id = u.TecnologiaId,
                                             TipoTecnologiaId = u.TipoTecnologia.HasValue ? u.TipoTecnologia.Value : 4,
                                             Fabricante = u.Fabricante,
                                             Nombre = u.Nombre,
                                             Versiones = u.Versiones,
                                             Descripcion = u.Descripcion,
                                             MotivoId = u.MotivoId ?? 0,
                                             MotivoStr = e == null ? null : e.Nombre,
                                             AutomatizacionImplementadaId = u.AutomatizacionImplementadaId,
                                             RevisionSeguridadId = u.RevisionSeguridadId,
                                             RevisionSeguridadDescripcion = u.RevisionSeguridadDescripcion,
                                             FechaLanzamiento = u.FechaLanzamiento,
                                             Fuente = u.FuenteId,
                                             ComentariosFechaFin = u.ComentariosFechaFin,
                                             SustentoMotivo = u.SustentoMotivo,
                                             SustentoUrl = u.SustentoUrl,
                                             CasoUso = u.CasoUso,
                                             Aplica = u.Aplica,
                                             CompatibilidadSO = u.CompatibilidadSOId,
                                             CompatibilidadCloud = u.CompatibilidadCloudId,
                                             Requisitos = u.Requisitos,
                                             Existencia = u.Existencia,
                                             Riesgo = u.Riesgo,
                                             Facilidad = u.Facilidad,
                                             Vulnerabilidad = u.Vulnerabilidad,
                                             RoadmapOpcional = u.RoadmapOpcional,
                                             Referencias = u.Referencias,
                                             PlanTransConocimiento = u.PlanTransConocimiento,
                                             EsqMonitoreo = u.EsqMonitoreo,
                                             EsqPatchManagement = u.EsqPatchManagement,
                                             ConfArqSeg = u.ConfArqSegId,
                                             ConfArqTec = u.ConfArqTecId,
                                             EsqLicenciamiento = u.EsqLicenciamiento,
                                             EquipoAprovisionamiento = u.EquipoAprovisionamiento,
                                             Activo = u.Activo,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             Dominio = d.Nombre,
                                             Subdominio = s.Nombre,
                                             Tipo = t.Nombre,
                                             TipoProductoStr = b.Nombre,
                                             Estado = u.EstadoTecnologia,
                                             FechaAprobacion = u.FechaAprobacion,
                                             UsuarioAprobacion = u.UsuarioAprobacion,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             //TipoId = u.TipoId,
                                             EstadoId = u.EstadoId,
                                             FechaFinSoporte = u.FechaFinSoporte,
                                             FechaAcordada = u.FechaAcordada,
                                             FechaExtendida = u.FechaExtendida,
                                             FechaCalculoTec = u.FechaCalculoTec,
                                             FlagSiteEstandar = u.FlagSiteEstandar,
                                             FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                             FlagTieneEquivalencias = (from x in ctx.TecnologiaEquivalencia
                                                                       where x.FlagActivo && x.TecnologiaId == u.TecnologiaId
                                                                       select true).FirstOrDefault() == true,
                                             ProductoNombre = a == null ? "" : a.Fabricante + " " + a.Nombre,
                                             TribuCoeStr = a == null ? "" : a.TribuCoeDisplayName,
                                             Dueno = u.DuenoId,
                                             CodigoProducto = u.CodigoProducto,
                                             GrupoSoporteRemedy = u.GrupoSoporteRemedy,
                                             EqAdmContacto = u.EqAdmContacto,
                                             UrlConfluenceId = u.UrlConfluenceId,
                                             UrlConfluence = u.UrlConfluence,
                                             TipoFechaInterna = u.TipoFechaInterna,
                                             CantidadMeses1 = cantidadMeses1
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        //if(resultado != null)
                        //{
                        //    foreach(var item in resultado)
                        //    {
                        //        var itemListaAplicacion = (from a in ctx.TecnologiaAplicacion
                        //                                   join b in ctx.Aplicacion on a.AplicacionId equals b.AplicacionId
                        //                                   where a.TecnologiaId == item.Id
                        //                                   select b).ToList();

                        //        item.ListaAplicacionStr = string.Join(", ", itemListaAplicacion.Select(x => x.CodigoAPT).ToArray());
                        //    }
                        //}

                        return resultado;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaG> GetNewTecSP(int? productoId, List<int> domIds, List<int> subdomIds, string filtro, string aplica, string codigo, string dueno, List<int> tipoTecIds, List<int> estObsIds, bool withApps, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows, string tribuCoeStr = null, string squadStr = null)
        {
            try
            {
                List<TecnologiaG> registros = new List<TecnologiaG>();
                totalRows = 0;
                using (SqlConnection cnx = new SqlConnection(Constantes.CadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[cvt].[USP_TECNOLOGIA_LISTAR_EXPORTAR]", cnx))
                    {
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@filtro", filtro == null ? DBNull.Value : (object)filtro);
                        //comando.Parameters.AddWithValue("@equipo", equipo == null ? DBNull.Value : (object)equipo);
                        comando.Parameters.AddWithValue("@productoId", productoId == null ? DBNull.Value : (object)productoId);
                        comando.Parameters.AddWithValue("@domIds", domIds == null ? DBNull.Value : domIds.Count == 0 ? DBNull.Value : (object)string.Join(",", domIds.ToArray()));
                        comando.Parameters.AddWithValue("@subdomIds", subdomIds == null ? DBNull.Value : subdomIds.Count == 0 ? DBNull.Value : (object)string.Join(",", subdomIds.ToArray()));
                        comando.Parameters.AddWithValue("@estObsIds", estObsIds == null ? DBNull.Value : estObsIds.Count == 0 ? DBNull.Value : (object)string.Join(",", estObsIds.ToArray()));
                        comando.Parameters.AddWithValue("@tipoTecIds", tipoTecIds == null ? DBNull.Value : tipoTecIds.Count == 0 ? DBNull.Value : (object)string.Join(",", tipoTecIds.ToArray()));
                        comando.Parameters.AddWithValue("@aplica", aplica == null ? DBNull.Value : (object)aplica);
                        comando.Parameters.AddWithValue("@codigo ", codigo == null ? DBNull.Value : (object)codigo);
                        comando.Parameters.AddWithValue("@dueno", dueno == null ? DBNull.Value : (object)dueno);
                        comando.Parameters.AddWithValue("@tribuCoeStr", tribuCoeStr == null ? DBNull.Value : (object)tribuCoeStr);
                        comando.Parameters.AddWithValue("@squadStr", squadStr == null ? DBNull.Value : (object)squadStr);
                        comando.Parameters.AddWithValue("@withApps", withApps);
                        comando.Parameters.AddWithValue("@pageNumber", pageNumber);
                        comando.Parameters.AddWithValue("@pageSize", pageSize);
                        comando.Parameters.AddWithValue("@sortName", sortName);
                        comando.Parameters.AddWithValue("@sortOrder", sortOrder);

                        var dr = comando.ExecuteReader();

                        if (dr.HasRows)
                        {
                            while (dr.Read())
                            {
                                var item = new TecnologiaG();
                                item.Id = dr.GetData<int>("Id");
                                item.TipoTecnologiaId = dr.GetData<int>("TipoTecnologiaId");
                                item.Fabricante = dr.GetData<string>("Fabricante");
                                item.Nombre = dr.GetData<string>("Nombre");
                                //item.TipoProductoStr = dr.GetData<string>("TipoProductoStr");
                                item.Versiones = dr.GetData<string>("Versiones");
                                item.Descripcion = dr.GetData<string>("Descripcion");
                                item.MotivoId = dr.GetData<int>("MotivoId");
                                item.MotivoStr = dr.GetData<string>("MotivoStr");
                                item.AutomatizacionImplementadaId = dr.GetData<int>("AutomatizacionImplementadaId");
                                item.RevisionSeguridadId = dr.GetData<int>("RevisionSeguridadId");
                                item.RevisionSeguridadDescripcion = dr.GetData<string>("RevisionSeguridadDescripcion");
                                item.FechaLanzamiento = dr.GetData<DateTime?>("FechaLanzamiento");
                                item.Fuente = dr.GetData<int>("Fuente");
                                item.ComentariosFechaFin = dr.GetData<string>("ComentariosFechaFin");
                                item.SustentoMotivo = dr.GetData<string>("SustentoMotivo");
                                item.SustentoUrl = dr.GetData<string>("SustentoUrl");
                                item.CasoUso = dr.GetData<string>("CasoUso");
                                item.Aplica = dr.GetData<string>("Aplica");
                                item.CompatibilidadSO = dr.GetData<string>("CompatibilidadSO");
                                item.CompatibilidadCloud = dr.GetData<string>("CompatibilidadCloud");
                                item.Requisitos = dr.GetData<string>("Requisitos");
                                item.Existencia = dr.GetData<int>("Existencia");
                                item.Riesgo = dr.GetData<int>("Riesgo");
                                item.Facilidad = dr.GetData<int>("Facilidad");
                                item.Vulnerabilidad = dr.GetData<decimal>("Vulnerabilidad");
                                item.RoadmapOpcional = dr.GetData<string>("RoadmapOpcional");
                                item.Referencias = dr.GetData<string>("Referencias");
                                item.PlanTransConocimiento = dr.GetData<string>("PlanTransConocimiento");
                                item.EsqMonitoreo = dr.GetData<string>("EsqMonitoreo");
                                item.EsqPatchManagement = dr.GetData<string>("EsqPatchManagement");
                                item.ConfArqSeg = dr.GetData<string>("ConfArqSeg");
                                item.ConfArqTec = dr.GetData<string>("ConfArqTec");
                                item.EsqLicenciamiento = dr.GetData<string>("EsqLicenciamiento");
                                item.EquipoAprovisionamiento = dr.GetData<string>("EquipoAprovisionamiento");
                                item.Activo = dr.GetData<bool>("Activo");
                                item.Dominio = dr.GetData<string>("Dominio");
                                item.Subdominio = dr.GetData<string>("Subdominio");
                                item.Tipo = dr.GetData<string>("Tipo");
                                item.TipoProductoStr = dr.GetData<string>("TipoProductoStr");
                                item.Estado = dr.GetData<int>("Estado");
                                item.FechaAprobacion = dr.GetData<DateTime>("FechaAprobacion");
                                item.UsuarioAprobacion = dr.GetData<string>("UsuarioAprobacion");
                                item.ClaveTecnologia = dr.GetData<string>("ClaveTecnologia");
                                item.FechaFinSoporte = dr.GetData<DateTime?>("FechaFinSoporte");
                                item.FechaAcordada = dr.GetData<DateTime?>("FechaAcordada");
                                item.FechaExtendida = dr.GetData<DateTime?>("FechaExtendida");
                                item.FechaCalculoTec = dr.GetData<int>("FechaCalculoTec");
                                item.FlagSiteEstandar = dr.GetData<bool?>("FlagSiteEstandar");
                                item.FlagFechaFinSoporte = dr.GetData<bool?>("FlagFechaFinSoporte");
                                item.FlagTieneEquivalencias = dr.GetData<bool>("FlagTieneEquivalencias");
                                item.ProductoNombre = dr.GetData<string>("ProductoNombre");
                                item.TribuCoeStr = dr.GetData<string>("TribuCoeStr");
                                item.ResponsableTribuCoeStr = dr.GetData<string>("ResponsableTribuCoeStr");
                                item.SquadStr = dr.GetData<string>("SquadStr");
                                item.ResponsableSquadStr = dr.GetData<string>("ResponsableSquadStr");
                                item.Dueno = dr.GetData<string>("Dueno");
                                item.CodigoProducto = dr.GetData<string>("CodigoProducto");
                                item.GrupoSoporteRemedy = dr.GetData<string>("GrupoSoporteRemedy");
                                item.EqAdmContacto = dr.GetData<string>("EqAdmContacto");
                                item.UrlConfluenceId = dr.GetData<int?>("UrlConfluenceId");
                                item.UrlConfluence = dr.GetData<string>("UrlConfluence");
                                item.TipoFechaInterna = dr.GetData<string>("TipoFechaInterna");
                                item.EstadoId = dr.GetData<int>("EstadoId");
                                //item.EstadoId = !(item.FlagFechaFinSoporte ?? false) ? (int)ETecnologiaEstado.Vigente : item.FechaCalculoTec == null ? (int)ETecnologiaEstado.Obsoleto : (item.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaExtendida && item.FechaExtendida.Value > DateTime.Now) || (item.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaFinSoporte && item.FechaFinSoporte.Value > DateTime.Now) || (item.FechaCalculoTec == (int)FechaCalculoTecnologia.FechaInterna && item.FechaAcordada.Value > DateTime.Now) ? (int)ETecnologiaEstado.Vigente : (int)ETecnologiaEstado.Obsoleto;
                                item.UsuarioCreacion = dr.GetData<string>("UsuarioCreacion");
                                item.FechaCreacion = dr.GetData<DateTime>("FechaCreacion");
                                item.UsuarioModificacion = dr.GetData<string>("UsuarioModificacion");
                                item.FechaModificacion = dr.GetData<DateTime?>("FechaModificacion");
                                totalRows = dr.GetData<int>("TotalRows");

                                registros.Add(item);
                            }
                        }

                        //var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
                    }
                    cnx.Close();

                    return registros;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: List<TecnologiaG> GetTecSTD(int domId, int subdomId, string casoUso, string filtro, int estadoId, int famId, int fecId, string aplica, string codigo, string dueno, string equipo, int tipoTecId, int estObsId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)"
                    , new object[] { null });
            }
        }

        public override TecnologiaDTO GetNewTecById(int id, bool withAutorizadores = false, bool withArquetipos = false, bool withAplicaciones = false, bool withEquivalencias = false)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var entidad = (from u in ctx.Tecnologia
                                       join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                       join a in ctx.Dominio on s.DominioId equals a.DominioId
                                       join b in ctx.Producto on u.ProductoId equals b.ProductoId into ljb
                                       from b in ljb.DefaultIfEmpty()
                                           //join t in ctx.Aplicacion on u.CodigoAPT equals t.CodigoAPT into lj1
                                           //from t in lj1.DefaultIfEmpty()
                                           //join a in ctx.Arquetipo on u.ArquetipoId equals a.ArquetipoId into lj2
                                           //from a in lj2.DefaultIfEmpty()
                                       where u.TecnologiaId == id
                                       //&& t.FlagActivo
                                       select new TecnologiaDTO()
                                       {
                                           Id = u.TecnologiaId,
                                           ProductoId = u.ProductoId,
                                           Fabricante = u.Fabricante,
                                           Versiones = u.Versiones,
                                           ClaveTecnologia = u.ClaveTecnologia,
                                           Nombre = u.Nombre,
                                           //Nombre = u.Nombre,
                                           Descripcion = u.Descripcion,
                                           FlagSiteEstandar = u.FlagSiteEstandar,
                                           FlagTieneEquivalencias = u.FlagTieneEquivalencias ?? false,
                                           MotivoId = u.MotivoId,
                                           TipoTecnologiaId = u.TipoTecnologia,
                                           CodigoProducto = u.ProductoId == null ? u.CodigoProducto : string.IsNullOrEmpty(u.CodigoProducto) ? b == null ? "" : b.Codigo : u.CodigoProducto,
                                           AutomatizacionImplementadaId = u.AutomatizacionImplementadaId,
                                           RevisionSeguridadId = u.RevisionSeguridadId,
                                           RevisionSeguridadDescripcion = u.RevisionSeguridadDescripcion,
                                           FlagFechaFinSoporte = u.FlagFechaFinSoporte,
                                           Fuente = u.FuenteId,
                                           FechaCalculoBase = u.FechaCalculo,
                                           FechaCalculoTec = u.FechaCalculoTec,
                                           FechaLanzamiento = u.FechaLanzamiento,
                                           FechaExtendida = u.FechaExtendida,
                                           FechaFinSoporte = u.FechaFinSoporte,
                                           FechaAcordada = u.FechaAcordada,
                                           TipoFechaInterna = u.TipoFechaInterna,
                                           ComentariosFechaFin = u.ComentariosFechaFin,
                                           SustentoMotivo = u.SustentoMotivo,
                                           SustentoUrl = u.SustentoUrl,
                                           UrlConfluenceId = u.UrlConfluenceId,
                                           UrlConfluence = u.UrlConfluence,
                                           CasoUso = u.CasoUso,
                                           Aplica = u.Aplica,
                                           CompatibilidadSOId = u.CompatibilidadSOId,
                                           CompatibilidadCloudId = u.CompatibilidadCloudId,
                                           Requisitos = u.Requisitos,
                                           Existencia = u.Existencia,
                                           Riesgo = u.Riesgo,
                                           Facilidad = u.Facilidad,
                                           Vulnerabilidad = u.Vulnerabilidad,
                                           DominioNomb = a.Nombre,
                                           SubdominioNomb = s.Nombre,
                                           SubdominioId = u.SubdominioId,
                                           RoadmapOpcional = u.RoadmapOpcional,
                                           Referencias = u.Referencias,
                                           PlanTransConocimiento = u.PlanTransConocimiento,
                                           EsqMonitoreo = u.EsqMonitoreo,
                                           EsqPatchManagement = u.EsqPatchManagement,
                                           Dueno = u.DuenoId,
                                           EqAdmContacto = u.EqAdmContacto,
                                           GrupoSoporteRemedy = u.GrupoSoporteRemedy,
                                           ConfArqSeg = u.ConfArqSegId,
                                           ConfArqTec = u.ConfArqTecId,
                                           EncargRenContractual = u.EncargRenContractual,
                                           EsqLicenciamiento = u.EsqLicenciamiento,
                                           SoporteEmpresarial = u.SoporteEmpresarial,
                                           EquipoAprovisionamiento = u.EquipoAprovisionamiento,

                                           //Activo = u.Activo,
                                           //FechaCreacion = u.FechaCreacion,
                                           //UsuarioCreacion = u.UsuarioCreacion,
                                           //EstadoTecnologia = u.EstadoTecnologia,
                                           //FlagConfirmarFamilia = u.FlagConfirmarFamilia.HasValue ? u.FlagConfirmarFamilia.Value : false,
                                           //FechaCalculoTec = u.FechaCalculoTec,
                                           //Compatibilidad = u.Compatibilidad,
                                           //FlagAplicacion = u.FlagAplicacion,
                                           //CodigoAPT = u.CodigoAPT,
                                           //AplicacionNomb = u.CodigoAPT == null ? "" : t.CodigoAPT + " - " + t.Nombre,
                                           ////Fin Tab 1
                                           //DominioId = s.DominioId,
                                           //EliminacionTecObsoleta = u.EliminacionTecObsoleta,
                                           //LineaBaseSeg = u.LineaBaseSeg,
                                           ////Fin Tab 2
                                           ////Fin Tab 3
                                           //FlagSiteEstandar = u.FlagSiteEstandar,
                                           //Fabricante = u.Fabricante,
                                           //EstadoId = u.EstadoId,
                                           //CodigoTecnologiaAsignado = u.CodigoTecnologiaAsignado,
                                           ////ArquetipoId = u.ArquetipoId,
                                           ////ArquetipoNombre = a.Nombre
                                           ////Fin Tab 4
                                           //AplicacionId = u.AplicacionId
                                       }).FirstOrDefault();

                        if (entidad != null)
                        {
                            if (entidad.ProductoId != null)
                            {
                                entidad.Producto = (from a in ctx.Producto
                                                    where
                                                    a.ProductoId == entidad.ProductoId
                                                    select new ProductoDTO
                                                    {
                                                        Id = a.ProductoId,
                                                        Fabricante = a.Fabricante,
                                                        Nombre = a.Nombre
                                                    }).FirstOrDefault();
                            }

                            if (withAutorizadores)
                            {
                                var listAutorizadores = (from u in ctx.Tecnologia
                                                         join at in ctx.TecnologiaAutorizador on u.TecnologiaId equals at.TecnologiaId
                                                         where u.TecnologiaId == id && u.Activo && at.FlagActivo && !at.FlagEliminado
                                                         select new AutorizadorDTO()
                                                         {
                                                             TecnologiaId = at.TecnologiaId,
                                                             AutorizadorId = at.AutorizadorId,
                                                             Matricula = at.Matricula,
                                                             Nombres = at.Nombres,
                                                             Activo = at.FlagActivo
                                                         }).ToList();
                                entidad.ListAutorizadores = listAutorizadores;
                            }

                            if (withArquetipos)
                            {
                                var listArquetipo = (from u in ctx.Arquetipo
                                                     join at in ctx.TecnologiaArquetipo on new { ArquetipoId = u.ArquetipoId, TecnologiaId = (int)entidad.Id } equals new { ArquetipoId = at.ArquetipoId ?? 0, TecnologiaId = at.TecnologiaId }
                                                     where at.FlagActivo
                                                     select new ArquetipoDTO()
                                                     {
                                                         Id = u.ArquetipoId,
                                                         Nombre = u.Nombre,
                                                     }).ToList();
                                entidad.ListArquetipo = listArquetipo;
                            }

                            if (withAplicaciones)
                            {
                                var listAplicaciones = (from u in ctx.Aplicacion
                                                        join ta in ctx.TecnologiaAplicacion on new { u.AplicacionId, TecnologiaId = (int)entidad.Id } equals new { ta.AplicacionId, ta.TecnologiaId }
                                                        where ta.FlagActivo && !ta.FlagEliminado
                                                        select new TecnologiaAplicacionDTO
                                                        {
                                                            Id = ta.TecnologiaAplicacionId,
                                                            TecnologiaId = ta.TecnologiaId,
                                                            AplicacionId = ta.AplicacionId,
                                                            Aplicacion = new AplicacionDTO
                                                            {
                                                                Id = u.AplicacionId,
                                                                CodigoAPT = u.CodigoAPT,
                                                                Nombre = u.Nombre,
                                                                CategoriaTecnologica = u.CategoriaTecnologica,
                                                                TipoActivoInformacion = u.TipoActivoInformacion,
                                                                Owner_LiderUsuario_ProductOwner = u.Owner_LiderUsuario_ProductOwner
                                                            }
                                                        }).ToList();

                                entidad.ListAplicaciones = listAplicaciones;

                            }

                            if (withEquivalencias)
                            {
                                var listEquivalencias = (from u in ctx.Tecnologia
                                                         join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                                         join d in ctx.Dominio on s.DominioId equals d.DominioId
                                                         join t in ctx.Tipo on u.TipoTecnologia equals t.TipoId
                                                         join te in ctx.TecnologiaEquivalencia on u.TecnologiaId equals te.TecnologiaId
                                                         where u.TecnologiaId == id
                                                         && u.Activo
                                                         && te.FlagActivo
                                                         select new TecnologiaEquivalenciaDTO
                                                         {
                                                             Id = te.TecnologiaEquivalenciaId,
                                                             TecnologiaId = te.TecnologiaId,
                                                             NombreTecnologia = u.ClaveTecnologia,
                                                             DominioTecnologia = d.Nombre,
                                                             SubdominioTecnologia = s.Nombre,
                                                             TipoTecnologia = t.Nombre,
                                                             EstadoId = u.EstadoId,
                                                             Nombre = te.Nombre
                                                         }).ToList();

                                entidad.ListEquivalencias = listEquivalencias;
                                entidad.FlagTieneEquivalencias = listEquivalencias.Count > 0;
                                //entidad.FlagTieneEquivalencias = listEquivalencias.Count > 0 ? true : false;
                            }

                            var listTecnologiaVinculadas = (from u in ctx.Tecnologia
                                                            join tv in ctx.TecnologiaVinculada on u.TecnologiaId equals tv.VinculoId
                                                            join s in ctx.Subdominio on u.SubdominioId equals s.SubdominioId
                                                            join d in ctx.Dominio on s.DominioId equals d.DominioId
                                                            where tv.Activo && tv.TecnologiaId == entidad.Id
                                                            select new TecnologiaDTO()
                                                            {
                                                                Id = tv.VinculoId,
                                                                Nombre = u.ClaveTecnologia,
                                                                DominioNomb = s.Nombre,
                                                                SubdominioNomb = d.Nombre
                                                            }).ToList();

                            //var listEquivalencias = (from u in ctx.TecnologiaEquivalencia
                            //                         where u.FlagActivo && u.TecnologiaId == id
                            //                         select 1).ToList();


                            entidad.ListTecnologiaVinculadas = listTecnologiaVinculadas;

                            int? TablaProcedenciaId = (from t in ctx.TablaProcedencia
                                                       where t.CodigoInterno == (int)ETablaProcedencia.CVT_Tecnologia
                                                       && t.FlagActivo
                                                       select t.TablaProcedenciaId).FirstOrDefault();
                            if (TablaProcedenciaId == null) throw new Exception("TablaProcedencia no encontrado por codigo interno: " + (int)ETablaProcedencia.CVT_Tecnologia);

                            var archivo = (from u in ctx.ArchivosCVT
                                           where u.Activo && u.EntidadId == id.ToString() && u.TablaProcedenciaId == TablaProcedenciaId
                                           select new ArchivosCvtDTO()
                                           {
                                               Id = u.ArchivoId,
                                               Nombre = u.Nombre
                                           }).FirstOrDefault();

                            if (archivo != null)
                            {
                                entidad.ArchivoId = archivo.Id;
                                entidad.ArchivoStr = archivo.Nombre;
                            }
                        }

                        return entidad;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: TecnologiaDTO GetTecById(int id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error(ex.Message, ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: TecnologiaDTO GetTecById(int id)"
                    , new object[] { null });
            }
        }

        public override bool ExisteClaveTecnologia(string claveTecnologia, int id)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    bool? estado = (from u in ctx.Tecnologia
                                    where
                                    u.Activo
                                    && !u.FlagEliminado
                                    && u.ProductoId != id
                                    && u.ClaveTecnologia.ToUpper() == claveTecnologia.ToUpper()
                                    select true).FirstOrDefault();

                    return estado == true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteClaveTecnologia(string claveTecnologia, int id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteClaveTecnologia(string claveTecnologia, int id)"
                    , new object[] { null });
            }
        }

        #region TecnologiaByProducto
        public override List<TecnologiaDTO> GetTecnologiaByProducto(int productoId)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join a in ctx.Subdominio on u.SubdominioId equals a.SubdominioId
                                         join b in ctx.Dominio on a.DominioId equals b.DominioId
                                         join c in ctx.Producto on u.ProductoId equals c.ProductoId
                                         join d in ctx.Tipo on c.TipoProductoId equals d.TipoId
                                         join e in ctx.Tipo on u.TipoTecnologia equals e.TipoId
                                         where
                                         u.ProductoId == productoId &&
                                         u.Activo &&
                                         !u.FlagEliminado
                                         select new TecnologiaDTO()
                                         {
                                             Id = u.TecnologiaId,
                                             ProductoId = u.ProductoId,
                                             Nombre = u.Nombre,
                                             Descripcion = u.Descripcion,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             Fabricante = u.Fabricante,
                                             SubdominioNomb = a.Nombre,
                                             DominioNomb = b.Nombre,
                                             TipoTecnologiaId = u.TipoTecnologia,
                                             TipoTecnologiaStr = e.Nombre,
                                             EstadoId = u.EstadoId,
                                             EstadoTecnologia = u.EstadoTecnologia,
                                             TipoProductoStr = d.Nombre,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                             CodigoProducto = c.Codigo,
                                             FechaCalculoTec = u.FechaCalculoTec,
                                             FechaAcordada = u.FechaAcordada,
                                             FechaExtendida = u.FechaExtendida,
                                             FechaFinSoporte = u.FechaFinSoporte
                                         });

                        var resultado = registros.ToList();

                        foreach (var item in resultado)
                        {
                            item.Aplicacion = (from u in ctx.Aplicacion
                                               where
                                               u.AplicacionId == item.AplicacionId
                                               select new AplicacionDTO
                                               {
                                                   Id = u.AplicacionId,
                                                   CategoriaTecnologica = u.CategoriaTecnologica,
                                                   Nombre = u.Nombre,
                                                   Owner_LiderUsuario_ProductOwner = u.Owner_LiderUsuario_ProductOwner,
                                                   TipoActivoInformacion = u.TipoActivoInformacion,
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

        public override List<TecnologiaDTO> GetTecnologiaByProductoWithPagination(int productoId, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var registros = (from u in ctx.Tecnologia
                                         join a in ctx.Subdominio on u.SubdominioId equals a.SubdominioId
                                         join b in ctx.Dominio on a.DominioId equals b.DominioId
                                         join c in ctx.Producto on u.ProductoId equals c.ProductoId
                                         join d in ctx.Tipo on c.TipoProductoId equals d.TipoId
                                         join e in ctx.Tipo on u.TipoTecnologia equals e.TipoId
                                         where
                                         u.ProductoId == productoId &&
                                         !u.FlagEliminado
                                         select new TecnologiaDTO()
                                         {
                                             Id = u.TecnologiaId,
                                             Nombre = u.Nombre,
                                             Descripcion = u.Descripcion,
                                             ClaveTecnologia = u.ClaveTecnologia,
                                             Fabricante = u.Fabricante,
                                             SubdominioNomb = a.Nombre,
                                             DominioNomb = b.Nombre,
                                             TipoTecnologiaId = u.TipoTecnologia,
                                             TipoTecnologiaStr = e.Nombre,
                                             EstadoId = u.EstadoId,
                                             EstadoTecnologia = u.EstadoTecnologia,
                                             TipoProductoStr = d.Nombre,
                                             UsuarioCreacion = u.UsuarioCreacion,
                                             FechaCreacion = u.FechaCreacion,
                                             FechaModificacion = u.FechaModificacion,
                                             UsuarioModificacion = u.UsuarioModificacion,
                                         }).OrderBy(sortName + " " + sortOrder);

                        totalRows = registros.Count();
                        var resultado = registros.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

                        foreach (var item in resultado)
                        {
                            item.Aplicacion = (from u in ctx.Aplicacion
                                               where
                                               u.AplicacionId == item.AplicacionId
                                               select new AplicacionDTO
                                               {
                                                   Id = u.AplicacionId,
                                                   CategoriaTecnologica = u.CategoriaTecnologica,
                                                   Nombre = u.Nombre,
                                                   Owner_LiderUsuario_ProductOwner = u.Owner_LiderUsuario_ProductOwner,
                                                   TipoActivoInformacion = u.TipoActivoInformacion,
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

        public override int EditTecnologiaFromProducto(TecnologiaDTO objeto)
        {
            DbContextTransaction transaction = null;
            var registroNuevo = false;
            int ID = 0;
            var CURRENT_DATE = DateTime.Now;

            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    using (transaction = ctx.Database.BeginTransaction())
                    {

                        var entidad = ctx.Tecnologia.FirstOrDefault(x => x.TecnologiaId == objeto.Id);
                        if (entidad != null)
                        {
                            entidad.Fabricante = objeto.Fabricante;
                            entidad.Nombre = objeto.Nombre;
                            entidad.Versiones = objeto.Versiones;
                            entidad.ClaveTecnologia = objeto.ClaveTecnologia;
                            entidad.TipoTecnologia = objeto.TipoTecnologiaId;
                            entidad.Descripcion = objeto.Descripcion;
                            entidad.FlagFechaFinSoporte = objeto.FlagFechaFinSoporte;
                            entidad.FechaLanzamiento = objeto.FechaLanzamiento;
                            entidad.FechaExtendida = objeto.FechaExtendida;
                            entidad.FechaFinSoporte = objeto.FechaFinSoporte;
                            entidad.FechaAcordada = objeto.FechaAcordada;
                            entidad.TipoFechaInterna = objeto.TipoFechaInterna;
                            entidad.ComentariosFechaFin = objeto.ComentariosFechaFin;
                            entidad.SustentoMotivo = objeto.SustentoMotivo;
                            entidad.SustentoUrl = objeto.SustentoUrl;
                            entidad.AutomatizacionImplementadaId = objeto.AutomatizacionImplementadaId;
                            entidad.Activo = true;
                            entidad.FlagEliminado = false;
                            entidad.UsuarioCreacion = objeto.UsuarioCreacion;
                            entidad.FechaCreacion = DateTime.Now;

                            ctx.SaveChanges();

                            if (objeto.ItemsRemoveAppId != null)
                            {
                                foreach (var id in objeto.ItemsRemoveAppId)
                                {
                                    var aplicacion = (from a in ctx.TecnologiaAplicacion
                                                      where a.TecnologiaAplicacionId == id
                                                      select a).FirstOrDefault();

                                    if (aplicacion != null)
                                    {
                                        aplicacion.FlagActivo = false;
                                        aplicacion.FlagEliminado = true;
                                        aplicacion.ModificadoPor = objeto.UsuarioModificacion;
                                        aplicacion.FechaCreacion = DateTime.Now;
                                        ctx.SaveChanges();
                                    };

                                }
                            }

                            if (objeto.ListAplicaciones != null && objeto.TipoTecnologiaId == (int)ETipo.EstandarRestringido)
                            {
                                foreach (var itemAplicacion in objeto.ListAplicaciones)
                                {
                                    var aplicacion = new TecnologiaAplicacion
                                    {
                                        TecnologiaId = objeto.Id,
                                        AplicacionId = itemAplicacion.AplicacionId,
                                        FlagActivo = true,
                                        FlagEliminado = false,
                                        CreadoPor = objeto.UsuarioCreacion,
                                        FechaCreacion = DateTime.Now,
                                    };

                                    ctx.TecnologiaAplicacion.Add(aplicacion);
                                    ctx.SaveChanges();
                                }
                            }
                            else
                            {

                            }

                            //if (ValidarFlagEstandar(objeto.TipoTecnologiaId.Value))
                            //{
                            //    CuerpoNotificacionFlagEstandar = Utilitarios.GetBodyNotification();
                            //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[FECHA_HORA]", DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"));
                            //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[CLAVE_TECNOLOGIA]", objeto.ClaveTecnologia);
                            //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[MATRICULA]", objeto.UsuarioCreacion);
                            //    CuerpoNotificacionFlagEstandar = CuerpoNotificacionFlagEstandar.Replace("[NOMBRES]", objeto.UsuarioCreacion);
                            //    this.EnviarNotificacionTecnologia(objeto.UsuarioCreacion, CuerpoNotificacionFlagEstandar, true);
                            //}

                            //if(objeto.FlagCambioEstado)
                            //{
                            //    this.EnviarNotificacionTecnologia(objeto.UsuarioCreacion, CuerpoNotificacion);
                            //}                                                                
                            ID = entidad.TecnologiaId;
                        }
                        transaction.Commit();
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                transaction.Rollback();
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }

            try
            {
                if (registroNuevo)
                {
                    var paramSP = new ObjTecnologia()
                    {
                        param1 = ID,
                        param2 = objeto.ItemsAddAutorizadorSTR,
                        param3 = objeto.ItemsRemoveAutIdSTR,
                        param4 = objeto.ItemsAddTecEqIdSTR,
                        param5 = objeto.ItemsRemoveTecEqIdSTR,
                        param6 = objeto.ItemsAddTecVinculadaIdSTR,
                        param7 = objeto.ItemsRemoveTecVinculadaIdSTR,
                        param8 = objeto.UsuarioCreacion,
                        param9 = objeto.UsuarioModificacion
                    };

                    this.ActualizarListasTecnologias(paramSP);
                }
                else
                {
                    var paramSP = new ObjTecnologia()
                    {
                        param1 = ID,
                        param2 = objeto.ItemsAddAutorizadorSTR,
                        param3 = objeto.ItemsRemoveAutIdSTR,
                        param4 = objeto.ItemsAddTecEqIdSTR,
                        param5 = objeto.ItemsRemoveTecEqIdSTR,
                        param6 = objeto.ItemsAddTecVinculadaIdSTR,
                        param7 = objeto.ItemsRemoveTecVinculadaIdSTR,
                        param8 = objeto.UsuarioCreacion,
                        param9 = objeto.UsuarioModificacion
                    };

                    this.ActualizarListasTecnologias(paramSP);
                }

                if ((objeto.EstadoId != (int)ETecnologiaEstado.Obsoleto && objeto.EstadoId.HasValue)
                                   && objeto.EstadoTecnologia == (int)EstadoTecnologia.Aprobado && objeto.FlagUnicaVigente == true)
                {
                    //this.ActualizarEstadoTecnologias(objeto.Id, objeto.FamiliaId.Value, (int)ETecnologiaEstado.VigentePorVencer);
                    this.ActualizarEstadoTecnologias(objeto.Id, objeto.FamiliaId.Value, (int)ETecnologiaEstado.Deprecado);
                }

                return ID;
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: int AddOrEditTecnologia(TecnologiaDTO objeto)"
                    , new object[] { null });
            }
        }
        #endregion

        #region ProductoTecnologiaAplicacion
        public override List<TecnologiaAplicacionDTO> GetTecnologiaAplicaciones(int tecnologiaId)
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
                                         join u3 in ctx.Application on u2.CodigoAPT equals u3.applicationId
                                         where u2.DiaRegistro == fecha.Day && u2.MesRegistro == fecha.Month && u2.AnioRegistro == fecha.Year && estados.Contains(u2.EstadoId)
                                         && u.TecnologiaId == tecnologiaId && u3.isActive == true && u3.status!=4
                                         select new TecnologiaAplicacionDTO()
                                         {
                                             Id = 0,
                                             TecnologiaId = u.TecnologiaId.Value,
                                             CodigoAPT = u2.CodigoAPT
                                         });

                        var resultado = registros.Distinct().ToList();

                        foreach (var item in resultado)
                        {
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

        public override bool DeleteTecnologiaById(int id, string userName)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var registro = (from u in ctx.Tecnologia
                                    where //u.Activo && 
                                    u.TecnologiaId == id
                                    select u).FirstOrDefault();

                    if (registro != null)
                    {
                        registro.Activo = false;
                        registro.FlagEliminado = true;
                        registro.UsuarioModificacion = userName;
                        registro.FechaModificacion = DateTime.Now;
                    }
                    ctx.SaveChanges();

                    return true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool DeleteTecnologiaById(int id, string userName)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool DeleteTecnologiaById(int id, string userName)"
                    , new object[] { null });
            }
        }

        public override bool DeleteTecnologiaAplicacionById(int id, string userName)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var registro = (from u in ctx.TecnologiaAplicacion
                                    where //u.Activo && 
                                    u.TecnologiaAplicacionId != id
                                    select u).FirstOrDefault();

                    if (registro != null)
                    {
                        registro.FlagActivo = false;
                        registro.FlagEliminado = true;
                        registro.ModificadoPor = userName;
                        registro.FechaModificacion = DateTime.Now;
                    }
                    ctx.SaveChanges();

                    return true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool EliminarProductoTecnologiaAplicacionById(int id, string userName)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool EliminarProductoTecnologiaAplicacionById(int id, string userName)"
                    , new object[] { null });
            }
        }

        public override bool GuardarMasivoTecnologiaAplicacion(List<TecnologiaAplicacionDTO> lista, int[] listaEliminar, string userName)
        {
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    if (listaEliminar != null)
                    {
                        foreach (int id in listaEliminar)
                        {
                            var itemBD = (from u in ctx.TecnologiaAplicacion
                                          where //u.Activo && 
                                          u.TecnologiaAplicacionId == id
                                          select u).FirstOrDefault();

                            if (itemBD != null)
                            {
                                itemBD.FlagActivo = false;
                                itemBD.FlagEliminado = true;
                                itemBD.ModificadoPor = userName;
                                itemBD.FechaModificacion = DateTime.Now;
                            }
                            ctx.SaveChanges();
                        }
                    }

                    if (lista != null)
                    {
                        foreach (var item in lista)
                        {
                            var itemBD = (from u in ctx.TecnologiaAplicacion
                                          where //u.Activo && 
                                          u.TecnologiaAplicacionId == item.Id
                                          select u).FirstOrDefault();

                            if (itemBD == null)
                            {
                                itemBD = new TecnologiaAplicacion
                                {
                                    TecnologiaId = item.TecnologiaId,
                                    AplicacionId = item.AplicacionId,
                                    FlagActivo = true,
                                    FlagEliminado = false,
                                    CreadoPor = userName,
                                    FechaCreacion = DateTime.Now
                                };

                                ctx.TecnologiaAplicacion.Add(itemBD);
                            }
                            else
                            {
                                itemBD.AplicacionId = item.AplicacionId;
                                itemBD.ModificadoPor = userName;
                                itemBD.FechaModificacion = DateTime.Now;
                            }

                            ctx.SaveChanges();
                        }
                    }

                    return true;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool GuardarMasivoProductoTecnologiaAplicacion(List<ProductoTecnologiaAplicacionDTO> lista, int[] listaEliminar, string userName)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorProductoDTO
                    , "Error en el metodo: bool GuardarMasivoProductoTecnologiaAplicacion(List<ProductoTecnologiaAplicacionDTO> lista, int[] listaEliminar, string userName)"
                    , new object[] { null });
            }
        }
        #endregion

        public override bool ExisteRelacionByTecnologiaId(int Id)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        var CURRENT_DAY = DateTime.Now;
                        var day = CURRENT_DAY.Day;
                        var month = CURRENT_DAY.Month;
                        var year = CURRENT_DAY.Year;

                        var estadoRelacionIds = new int[]
                        {
                            (int)EEstadoRelacion.PendienteEliminacion,
                            (int)EEstadoRelacion.Aprobado,
                        };

                        bool? estado = (from u in ctx.Relacion
                                        join rd in ctx.RelacionDetalle on u.RelacionId equals rd.RelacionId
                                        where u.FlagActivo && rd.FlagActivo
                                        && u.DiaRegistro == day && u.MesRegistro == month && u.AnioRegistro == year
                                        && estadoRelacionIds.Contains(u.EstadoId)
                                        && rd.TecnologiaId == Id
                                        select true).FirstOrDefault();

                        return estado == true;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteRelacionByTecnologiaId(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteRelacionByTecnologiaId(int Id)"
                    , new object[] { null });
            }
        }

        public override bool ExisteTecnologiaAsociadaAlMotivo(int motivoId)
        {
            try
            {
                using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted }))
                {
                    using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                    {
                        int cantidadRegistros = (from u in ctx.Tecnologia
                                                 where u.Activo
                                                 && !u.FlagEliminado
                                                 && u.MotivoId == motivoId
                                                 select true).Count();

                        bool existe = cantidadRegistros > 0;

                        return existe;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteRelacionByTecnologiaId(int Id)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: bool ExisteRelacionByTecnologiaId(int Id)"
                    , new object[] { null });
            }
        }

        #region Tecnología Owner
        public override List<TecnologiaOwnerDto> BuscarTecnologiaXOwner(string correo, int perfilId, string dominioIds, string subDominioIds, string productoStr, int? tribuCoeId, int? squadId, bool? flagTribuCoe, int pageNumber, int pageSize, string sortName, string sortOrder, out int totalRows)
        {
            totalRows = 0;

            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaOwnerDto>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_buscar_x_owner]", cnx))
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
                        comando.Parameters.Add(new SqlParameter("@flagTribuCoe", ((object)flagTribuCoe) ?? DBNull.Value));
                        comando.Parameters.Add(new SqlParameter("@pageNumber", pageNumber));
                        comando.Parameters.Add(new SqlParameter("@pageSize", pageSize));
                        comando.Parameters.Add(new SqlParameter("@sortName", sortName));
                        comando.Parameters.Add(new SqlParameter("@sortOrder", sortOrder));


                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaOwnerDto()
                            {
                                TecnologiaId = reader.GetData<int>("TecnologiaId"),
                                ProductoId = reader.GetData<int>("ProductoId"),
                                ProductoStr = reader.GetData<string>("ProductoStr"),
                                Fabricante = reader.GetData<string>("Fabricante"),
                                Nombre = reader.GetData<string>("Nombre"),
                                Dominio = reader.GetData<string>("DominioStr"),
                                Subdominio = reader.GetData<string>("SubdominioStr"),
                                ClaveTecnologia = reader.GetData<string>("ClaveTecnologia"),
                                TipoTecnologia = reader.GetData<string>("TipoTecnologiaStr"),
                                TotalInstanciasServidores = reader.GetData<int>("TotalInstanciasServidores"),
                                TotalInstanciasServicioNube = reader.GetData<int>("TotalInstanciasServicioNube"),
                                TotalInstanciasPcs = reader.GetData<int>("TotalInstanciasPcs"),
                                TotalAplicaciones = reader.GetData<int>("TotalAplicaciones"),
                                TribuCoeId = reader.GetData<int?>("TribuCoeId"),
                                TribuCoeDisplayName = reader.GetData<string>("TribuCoeDisplayName"),
                                TribuCoeDisplayNameResponsable = reader.GetData<string>("TribuCoeDisplayNameResponsable"),
                                SquadId = reader.GetData<int>("SquadId"),
                                SquadDisplayName = reader.GetData<string>("SquadDisplayName"),
                                SquadDisplayNameResponsable = reader.GetData<string>("SquadDisplayNameResponsable"),
                                FlagFechaFinSoporte = reader.GetData<bool?>("FlagFechaFinSoporte"),
                                FechaCalculoTec = reader.GetData<int?>("FechaCalculoTec"),
                                FechaAcordada = reader.GetData<DateTime?>("FechaAcordada"),
                                FechaExtendida = reader.GetData<DateTime?>("FechaExtendida"),
                                FechaFinSoporte = reader.GetData<DateTime?>("FechaFinSoporte"),
                                EstadoId = reader.GetData<int>("EstadoId"),
                                Codigo = reader.GetData<string>("Codigo"),
                                EstadoTecnologia = reader.GetData<int>("EstadoTecnologia")
                                //EstadoIdActual = reader.GetData<int>("EstadoIdActual"),
                                //EstadoIdDoceMeses = reader.GetData<int>("EstadoIdDoceMeses"),
                                //EstadoIdVeintiCuatroMeses = reader.GetData<int>("EstadoIdVeintiCuatroMeses")
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

        public override List<TecnologiaOwnerDto> BuscarTecnologiaXOwnerProducto(string correo, int perfilId, int productoId)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaOwnerDto>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_buscar_x_owner_producto]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.Add(new SqlParameter("@correoOwner", correo));
                        comando.Parameters.Add(new SqlParameter("@perfilId", perfilId));
                        comando.Parameters.Add(new SqlParameter("@productoId", productoId));


                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaOwnerDto()
                            {
                                TecnologiaId = reader.GetData<int>("TecnologiaId"),
                                ProductoId = reader.GetData<int>("ProductoId"),
                                ProductoStr = reader.GetData<string>("ProductoStr"),
                                Fabricante = reader.GetData<string>("Fabricante"),
                                Nombre = reader.GetData<string>("Nombre"),
                                Dominio = reader.GetData<string>("DominioStr"),
                                Subdominio = reader.GetData<string>("SubdominioStr"),
                                ClaveTecnologia = reader.GetData<string>("ClaveTecnologia"),
                                TipoTecnologia = reader.GetData<string>("TipoTecnologiaStr"),
                                TotalInstanciasServidores = reader.GetData<int>("TotalInstanciasServidores"),
                                TotalInstanciasServicioNube = reader.GetData<int>("TotalInstanciasServicioNube"),
                                TotalInstanciasPcs = reader.GetData<int>("TotalInstanciasPcs"),
                                TotalAplicaciones = reader.GetData<int>("TotalAplicaciones"),
                                TribuCoeId = reader.GetData<int>("TribuCoeId"),
                                TribuCoeDisplayName = reader.GetData<string>("TribuCoeDisplayName"),
                                TribuCoeDisplayNameResponsable = reader.GetData<string>("TribuCoeDisplayNameResponsable"),
                                SquadId = reader.GetData<int>("SquadId"),
                                SquadDisplayName = reader.GetData<string>("SquadDisplayName"),
                                SquadDisplayNameResponsable = reader.GetData<string>("SquadDisplayNameResponsable"),
                                FlagFechaFinSoporte = reader.GetData<bool?>("FlagFechaFinSoporte"),
                                FechaCalculoTec = reader.GetData<int?>("FechaCalculoTec"),
                                FechaAcordada = reader.GetData<DateTime?>("FechaAcordada"),
                                FechaExtendida = reader.GetData<DateTime?>("FechaExtendida"),
                                FechaFinSoporte = reader.GetData<DateTime?>("FechaFinSoporte"),
                                EstadoId = reader.GetData<int>("EstadoId"),
                                Codigo = reader.GetData<string>("Codigo"),
                                EstadoTecnologia = reader.GetData<int>("EstadoTecnologia")
                                //EstadoIdActual = reader.GetData<int>("EstadoIdActual"),
                                //EstadoIdDoceMeses = reader.GetData<int>("EstadoIdDoceMeses"),
                                //EstadoIdVeintiCuatroMeses = reader.GetData<int>("EstadoIdVeintiCuatroMeses")
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }
        #endregion

        #region Tecnología Owner Consolidado
        public override List<TecnologiaOwnerConsolidadoObsolescenciaDTO> ListarTecnologiaOwnerConsolidadoObsolescencia(string dominioIds, string subDominioIds, string productoStr, string tecnologiaStr, string ownerStr, string squadId, int? nivel, string ownerParentIds)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaOwnerConsolidadoObsolescenciaDTO>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_obsolescencia_consolidado_owner_x_nivel]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@dominioIds", ((object)dominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@subDominioIds", ((object)subDominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@productoStr", ((object)productoStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@tecnologiaStr", ((object)tecnologiaStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@ownerStr", ((object)ownerStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@squadId", ((object)squadId) ?? DBNull.Value);
                        //comando.Parameters.AddWithValue("@estadoId", ((object)estadoId) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@nivel", ((object)nivel) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@ownerParentIds", ((object)ownerParentIds) ?? DBNull.Value);

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaOwnerConsolidadoObsolescenciaDTO()
                            {
                                Nivel = reader.GetData<int>("Nivel"),
                                OwnerParentId = reader.GetData<string>("OwnerParentId"),
                                OwnerId = reader.GetData<int?>("OwnerId"),
                                Owner = reader.GetData<string>("Owner"),
                                VigenteKPI = reader.GetData<int>("VigenteKPI"),
                                PorcentajeVigenteKPI = reader.GetData<decimal>("PorcentajeVigenteKPI"),
                                //DeprecadoKPI = reader.GetData<int>("DeprecadoKPI"),
                                //PorcentajeDeprecadoKPI = reader.GetData<decimal>("PorcentajeDeprecadoKPI"),
                                ObsoletoKPI = reader.GetData<int>("ObsoletoKPI"),
                                PorcentajeObsoletoKPI = reader.GetData<decimal>("PorcentajeObsoletoKPI"),
                                TotalKPI = reader.GetData<int>("TotalKPI"),
                                PorcentajeTotalKPI = reader.GetData<decimal>("PorcentajeTotalKPI"),
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaOwnerConsolidadoObsolescenciaDTO> ListarTecnologiaOwnerConsolidadoObsolescenciaReporte(string dominioIds, string subDominioIds, string productoStr, string tecnologiaStr, string ownerStr, string squadId)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaOwnerConsolidadoObsolescenciaDTO>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_obsolescencia_consolidado_owner_reporte]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@dominioIds", ((object)dominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@subDominioIds", ((object)subDominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@productoStr", ((object)productoStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@tecnologiaStr", ((object)tecnologiaStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@ownerStr", ((object)ownerStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@squadId", ((object)squadId) ?? DBNull.Value);
                        //comando.Parameters.AddWithValue("@estadoId", ((object)estadoId) ?? DBNull.Value);

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaOwnerConsolidadoObsolescenciaDTO()
                            {
                                Nivel = reader.GetData<int>("Nivel"),
                                OwnerParentId = reader.GetData<string>("OwnerParentId"),
                                OwnerId = reader.GetData<int?>("OwnerId"),
                                Owner = reader.GetData<string>("Owner"),
                                VigenteKPI = reader.GetData<int>("VigenteKPI"),
                                PorcentajeVigenteKPI = reader.GetData<decimal>("PorcentajeVigenteKPI"),
                                DeprecadoKPI = reader.GetData<int>("DeprecadoKPI"),
                                PorcentajeDeprecadoKPI = reader.GetData<decimal>("PorcentajeDeprecadoKPI"),
                                ObsoletoKPI = reader.GetData<int>("ObsoletoKPI"),
                                PorcentajeObsoletoKPI = reader.GetData<decimal>("PorcentajeObsoletoKPI"),
                                TotalKPI = reader.GetData<int>("TotalKPI"),
                                PorcentajeTotalKPI = reader.GetData<decimal>("PorcentajeTotalKPI"),
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaOwnerConsolidadoObsolescenciaDTO> ListarTecnologiaOwnerConsolidadoObsolescenciaReporte2(string dominioIds, string subDominioIds, string productoStr, string tecnologiaStr, string ownerStr, string squadId)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaOwnerConsolidadoObsolescenciaDTO>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_obsolescencia_consolidado_owner_reporte2]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@dominioIds", ((object)dominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@subDominioIds", ((object)subDominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@productoStr", ((object)productoStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@tecnologiaStr", ((object)tecnologiaStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@ownerStr", ((object)ownerStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@squadId", ((object)squadId) ?? DBNull.Value);
                        //comando.Parameters.AddWithValue("@estadoId", ((object)estadoId) ?? DBNull.Value);

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaOwnerConsolidadoObsolescenciaDTO()
                            {
                                Owner = reader.GetData<string>("Owner"),
                                ProductoStr = reader.GetData<string>("ProductoStr"),
                                VigenteKPI = reader.GetData<int>("VigenteKPI"),
                                PorcentajeVigenteKPI = reader.GetData<decimal>("PorcentajeVigenteKPI"),
                                //DeprecadoKPI = reader.GetData<int>("DeprecadoKPI"),
                                //PorcentajeDeprecadoKPI = reader.GetData<decimal>("PorcentajeDeprecadoKPI"),
                                ObsoletoKPI = reader.GetData<int>("ObsoletoKPI"),
                                PorcentajeObsoletoKPI = reader.GetData<decimal>("PorcentajeObsoletoKPI"),
                                TotalKPI = reader.GetData<int>("TotalKPI"),
                                PorcentajeTotalKPI = reader.GetData<decimal>("PorcentajeTotalKPI"),
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }
        #endregion

        #region Tecnología SoportadoPor Consolidado
        public override List<TecnologiaGestionadoPorConsolidadoObsolescenciaDTO> ListarTecnologiaSoportadoPorConsolidadoObsolescencia(string correoOwner, int perfilId, string dominioIds, string subDominioIds, string aplicacionStr, string gestionadoPor, int? nivel, string soportadoPorParents)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaGestionadoPorConsolidadoObsolescenciaDTO>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_obsolescencia_consolidado_soportadopor_x_nivel]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@correoOwner", ((object)correoOwner) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@perfilId", ((object)perfilId) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@dominioIds", ((object)dominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@subDominioIds", ((object)subDominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@aplicacionStr", ((object)aplicacionStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@gestionadoPor", ((object)gestionadoPor) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@nivel", ((object)nivel) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@ownerParentIds", ((object)soportadoPorParents) ?? DBNull.Value);

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaGestionadoPorConsolidadoObsolescenciaDTO()
                            {
                                Nivel = reader.GetData<int>("Nivel"),
                                SoportadoPorParent = reader.GetData<string>("SoportadoPorParent"),
                                SoportadoPorId = reader.GetData<string>("SoportadoPorId"),
                                SoportadoPor = reader.GetData<string>("SoportadoPor"),
                                VigenteKPI = reader.GetData<int>("VigenteKPI"),
                                PorcentajeVigenteKPI = reader.GetData<decimal>("PorcentajeVigenteKPI"),
                                ObsoletoKPI = reader.GetData<int>("ObsoletoKPI"),
                                PorcentajeObsoletoKPI = reader.GetData<decimal>("PorcentajeObsoletoKPI"),
                                TotalKPI = reader.GetData<int>("TotalKPI"),
                                PorcentajeTotalKPI = reader.GetData<decimal>("PorcentajeTotalKPI"),
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaGestionadoPorConsolidadoObsolescenciaDTO> ListarTecnologiaSoportadoPorConsolidadoObsolescenciaReporte(string correoOwner, int perfilId, string dominioIds, string subDominioIds, string aplicacionStr, string gestionadoPor)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaGestionadoPorConsolidadoObsolescenciaDTO>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_obsolescencia_consolidado_soportadopor_reporte]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@correoOwner", ((object)correoOwner) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@perfilId", ((object)perfilId) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@dominioIds", ((object)dominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@subDominioIds", ((object)subDominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@aplicacionStr", ((object)aplicacionStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@gestionadoPor", ((object)gestionadoPor) ?? DBNull.Value);

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaGestionadoPorConsolidadoObsolescenciaDTO()
                            {
                                Nivel = reader.GetData<int>("Nivel"),
                                SoportadoPorParent = reader.GetData<string>("SoportadoPorParent"),
                                SoportadoPorId = reader.GetData<string>("SoportadoPorId"),
                                SoportadoPor = reader.GetData<string>("SoportadoPor"),
                                VigenteKPI = reader.GetData<int>("VigenteKPI"),
                                PorcentajeVigenteKPI = reader.GetData<decimal>("PorcentajeVigenteKPI"),
                                ObsoletoKPI = reader.GetData<int>("ObsoletoKPI"),
                                PorcentajeObsoletoKPI = reader.GetData<decimal>("PorcentajeObsoletoKPI"),
                                TotalKPI = reader.GetData<int>("TotalKPI"),
                                PorcentajeTotalKPI = reader.GetData<decimal>("PorcentajeTotalKPI"),
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }

        public override List<TecnologiaGestionadoPorConsolidadoObsolescenciaDTO> ListarTecnologiaSoportadoPorConsolidadoObsolescenciaReporte2(string correoOwner, int perfilId, string dominioIds, string subDominioIds, string aplicacionStr, string gestionadoPor)
        {
            try
            {
                var cadenaConexion = Constantes.CadenaConexion;
                var lista = new List<TecnologiaGestionadoPorConsolidadoObsolescenciaDTO>();
                using (SqlConnection cnx = new SqlConnection(cadenaConexion))
                {
                    cnx.Open();
                    using (var comando = new SqlCommand("[CVT].[usp_tecnologia_obsolescencia_consolidado_soportadopor_reporte2]", cnx))
                    {
                        comando.CommandTimeout = 0;
                        comando.CommandType = System.Data.CommandType.StoredProcedure;
                        comando.Parameters.AddWithValue("@correoOwner", ((object)correoOwner) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@perfilId", ((object)perfilId) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@dominioIds", ((object)dominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@subDominioIds", ((object)subDominioIds) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@aplicacionStr", ((object)aplicacionStr) ?? DBNull.Value);
                        comando.Parameters.AddWithValue("@gestionadoPor", ((object)gestionadoPor) ?? DBNull.Value);

                        var reader = comando.ExecuteReader(CommandBehavior.CloseConnection);

                        while (reader.Read())
                        {
                            var objeto = new TecnologiaGestionadoPorConsolidadoObsolescenciaDTO()
                            {
                                SoportadoPor = reader.GetData<string>("SoportadoPor"),
                                CodigoAPT = reader.GetData<string>("CodigoAPT"),
                                AplicacionStr = reader.GetData<string>("AplicacionStr"),
                                VigenteKPI = reader.GetData<int>("VigenteKPI"),
                                PorcentajeVigenteKPI = reader.GetData<decimal>("PorcentajeVigenteKPI"),
                                ObsoletoKPI = reader.GetData<int>("ObsoletoKPI"),
                                PorcentajeObsoletoKPI = reader.GetData<decimal>("PorcentajeObsoletoKPI"),
                                TotalKPI = reader.GetData<int>("TotalKPI"),
                                PorcentajeTotalKPI = reader.GetData<decimal>("PorcentajeTotalKPI"),
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
                throw new CVTException(CVTExceptionIds.ErrorTecnologiaDTO
                    , "Error en el metodo: GetTecnologias()"
                    , new object[] { null });
            }
        }
        #endregion

        private int GetSemaforoTecnologia(DateTime fechaCalculo, DateTime fechaComparacion, int meses)
        {
            if (fechaCalculo < fechaComparacion)
                return (int)ColoresSemaforo.Rojo;
            else
            {
                fechaComparacion = fechaComparacion.AddMonths(meses);
                if (fechaCalculo < fechaComparacion)
                    return (int)ColoresSemaforo.Amarillo;
                else
                    return (int)ColoresSemaforo.Verde;
            }
        }

        //private int GetEstadoTecnologiaEstandar(DateTime fechaCalculo, DateTime fechaComparacion, int meses)
        //{
        //    if (fechaCalculo < fechaComparacion)
        //        return (int)ETecnologiaEstadoEstandar.Obsoleto;
        //    else
        //    {
        //        fechaComparacion = fechaComparacion.AddMonths(meses);
        //        if (fechaCalculo < fechaComparacion)
        //            return (int)ETecnologiaEstadoEstandar.PorVencer;
        //        else
        //            return (int)ETecnologiaEstadoEstandar.Vigente;
        //    }
        //}

        //private int GetEstadoTecnologiaEstandar(DateTime fechaCalculo, DateTime fechaComparacion, DateTime fechaAgregada)
        //{
        //    if (fechaCalculo < fechaComparacion)
        //        return (int)ETecnologiaEstadoEstandar.Obsoleto;
        //    else
        //    {
        //        //fechaComparacion = fechaComparacion.AddMonths(meses);
        //        if (fechaCalculo < fechaAgregada)
        //            return (int)ETecnologiaEstadoEstandar.PorVencer;
        //        else
        //            return (int)ETecnologiaEstadoEstandar.Vigente;
        //    }
        //}

        private static string GetSemaforoTecnologiaClass(DateTime fechaCalculo, DateTime fechaComparacion, int meses, string url, string codigoProducto, string nombre, bool? flagMostrarEstado, string tipoTecnologia, int id)
        {
            if (fechaCalculo < fechaComparacion)
                return Utilitarios.DevolverTecnologiaEstandarStr(url, codigoProducto, nombre, "obsoletoClass", flagMostrarEstado, tipoTecnologia, id);
            else
            {
                fechaComparacion = fechaComparacion.AddMonths(meses);
                if (fechaCalculo < fechaComparacion)
                    return Utilitarios.DevolverTecnologiaEstandarStr(url, codigoProducto, nombre, "vigentePorVencer", flagMostrarEstado, tipoTecnologia, id);
                else
                    return Utilitarios.DevolverTecnologiaEstandarStr(url, codigoProducto, nombre, "vigenteClass", flagMostrarEstado, tipoTecnologia, id);
            }
        }
    }
}
