using BCP.CVT.Cross;
using BCP.CVT.DTO;
using BCP.CVT.Services.Interface;
using BCP.CVT.Services.Interface.PortafolioAplicaciones;
using BCP.CVT.Services.ModelDB;
using BCP.PAPP.Common.Cross;
using BCP.PAPP.Common.Custom;
using BCP.PAPP.Common.Dto;
using DocumentFormat.OpenXml.Drawing.ChartDrawing;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Linq;
using System.Linq.Dynamic;

namespace BCP.CVT.Services.Service.PortafolioAplicaciones
{
    public class CommonSvc : CommonDAO
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public override FilterAppsGestionado GetEquipos(int gestionado)
        {
            var retorno = new FilterAppsGestionado();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Equipos = (from u in ctx.TeamSquad
                                       where u.FlagActivo && !u.FlagEliminado
                                       && u.GestionadoPorId == gestionado
                                       orderby u.Nombre
                                       select new CustomAutocompleteApplication()
                                       {
                                           Id = u.EquipoId.ToString(),
                                           Descripcion = u.Nombre,
                                           Value = u.EquipoId.ToString()
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

        public override FilterArquitectoEvaluador GetListArquitectoEvaluador()
        {
            var retorno = new FilterArquitectoEvaluador();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.GestionadPor = (from u in ctx.GestionadoPor
                                            where u.FlagActivo && !u.FlagEliminado.Value
                                            orderby u.Nombre
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.GestionadoPorId.ToString(),
                                                Descripcion = u.Nombre,
                                                Value = u.GestionadoPorId.ToString()
                                            }).ToList();

                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                          where u.FlagActivo && !u.FlagEliminado.Value && u.FlagExterna != true
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
                                          }).ToList();

                    retorno.AreaBIAN = (from u in ctx.AreaBian
                                        where u.FlagActivo && !u.FlagEliminado
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.AreaBianId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.AreaBianId.ToString()
                                        }).ToList();

                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
                                          }).ToList();

                    retorno.Jefatura = (from u in ctx.JefaturaAti
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.JefaturaAtiId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.JefaturaAtiId.ToString()
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

        public override FilterGestionadoPorExterna GetListExterna()
        {
            var retorno = new FilterGestionadoPorExterna();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.TipoDesarrollo = (from u in ctx.ParametricaDetalle
                                            where u.FlagActivo && !u.FlagEliminado.Value && (u.ParametricaDetalleId==195 || u.ParametricaDetalleId == 196)
                                            orderby u.Valor
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.ParametricaDetalleId.ToString(),
                                                Descripcion = u.Valor,
                                                Value = u.ParametricaDetalleId.ToString()
                                            }).ToList();

                    retorno.ModeloEntrega = (from u in ctx.ParametricaDetalle
                                              where u.FlagActivo && !u.FlagEliminado.Value && (u.ParametricaDetalleId == 150 || u.ParametricaDetalleId == 1396)
                                              orderby u.Valor
                                              select new CustomAutocompleteApplication()
                                              {
                                                  Id = u.ParametricaDetalleId.ToString(),
                                                  Descripcion = u.Valor,
                                                  Value = u.ParametricaDetalleId.ToString()
                                              }).ToList();


                    retorno.Infraestructura = (from u in ctx.ParametricaDetalle
                                             where u.FlagActivo && !u.FlagEliminado.Value && (u.ParametricaDetalleId == 184 || u.ParametricaDetalleId == 1273)
                                             orderby u.Valor
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ParametricaDetalleId.ToString(),
                                                 Descripcion = u.Valor,
                                                 Value = u.ParametricaDetalleId.ToString()
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


        public override FilterArquitectoEvaluador GetListArquitectoEvaluadorExterna()
        {
            var retorno = new FilterArquitectoEvaluador();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.GestionadPor = (from u in ctx.GestionadoPor
                                            where u.FlagActivo && !u.FlagEliminado.Value
                                            orderby u.Nombre
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.GestionadoPorId.ToString(),
                                                Descripcion = u.Nombre,
                                                Value = u.GestionadoPorId.ToString()
                                            }).ToList();

                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                          where u.FlagActivo && !u.FlagEliminado.Value && u.FlagExterna==true
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
                                          }).ToList();

                    retorno.AreaBIAN = (from u in ctx.AreaBian
                                        where u.FlagActivo && !u.FlagEliminado
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.AreaBianId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.AreaBianId.ToString()
                                        }).ToList();

                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
                                          }).ToList();

                    retorno.Jefatura = (from u in ctx.JefaturaAti
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.JefaturaAtiId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.JefaturaAtiId.ToString()
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


        public override FilterArquitectoEvaluador GetListArquitectoEvaluador_Admin()
        {
            var retorno = new FilterArquitectoEvaluador();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.GestionadPor = (from u in ctx.GestionadoPor
                                            
                                            orderby u.Nombre
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.GestionadoPorId.ToString(),
                                                Descripcion = u.Nombre,
                                                Value = u.GestionadoPorId.ToString()
                                            }).ToList();

                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                        
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
                                          }).ToList();

                    retorno.AreaBIAN = (from u in ctx.AreaBian
                                      
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.AreaBianId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.AreaBianId.ToString()
                                        }).ToList();

                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                       
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
                                          }).ToList();

                    retorno.Jefatura = (from u in ctx.JefaturaAti
                                       
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.JefaturaAtiId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.JefaturaAtiId.ToString()
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


        public override FilterArquitectoEvaluador GetListArquitectoEvaluador(int area)
        {
            var retorno = new FilterArquitectoEvaluador();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.DominioBIAN = (from u in ctx.DominioBian
                                           where u.FlagActivo && !u.FlagEliminado.Value && u.AreaBianId == area
                                           orderby u.Nombre
                                           select new CustomAutocompleteApplication()
                                           {
                                               Id = u.DominioBianId.ToString(),
                                               Descripcion = u.Nombre,
                                               Value = u.DominioBianId.ToString()
                                           }).ToList();

                    retorno.TOBE = (from u in ctx.PlataformaBcp
                                    where u.FlagActivo && !u.FlagEliminado.Value && u.AreaBianId == area
                                    orderby u.Nombre
                                    select new CustomAutocompleteApplication()
                                    {
                                        Id = u.PlataformaBcpId.ToString(),
                                        Descripcion = u.Nombre,
                                        Value = u.PlataformaBcpId.ToString()
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

        public override FilterArquitectoEvaluador GetListArquitectoJefatura(int jefatura)
        {
            var retorno = new FilterArquitectoEvaluador();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                          where u.FlagActivo && !u.FlagEliminado.Value && u.JefaturaAtiId == jefatura
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
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

        public override FilterArquitectoTI GetListArquitectoTI()
        {
            var retorno = new FilterArquitectoTI();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Categoria = (from u in ctx.ParametricaDetalle
                                         where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                         && u.Descripcion == ConstantsPortfolio.CategoriaTecnologia
                                         && u.FlagActivo && !u.FlagEliminado.Value
                                         orderby u.Valor
                                         select new CustomAutocompleteApplication()
                                         {
                                             Id = u.ParametricaDetalleId.ToString(),
                                             Descripcion = u.Valor,
                                             Value = u.ParametricaDetalleId.ToString()
                                         }).ToList();

                    retorno.Clasificacion = (from u in ctx.ClasificacionTecnica
                                             where u.FlagActivo && !u.FlagEliminado.Value
                                             orderby u.Nombre
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ClasificacionTecnicaId.ToString(),
                                                 Descripcion = u.Nombre,
                                                 Value = u.ClasificacionTecnicaId.ToString()
                                             }).ToList();

                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
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

        public override FilterArquitectoTI GetListArquitectoTI_Admin()
        {
            var retorno = new FilterArquitectoTI();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Categoria = (from u in ctx.ParametricaDetalle
                                         where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                         && u.Descripcion == ConstantsPortfolio.CategoriaTecnologia
                                        
                                         orderby u.Valor
                                         select new CustomAutocompleteApplication()
                                         {
                                             Id = u.ParametricaDetalleId.ToString(),
                                             Descripcion = u.Valor,
                                             Value = u.ParametricaDetalleId.ToString()
                                         }).ToList();

                    retorno.Clasificacion = (from u in ctx.ClasificacionTecnica
                                     
                                             orderby u.Nombre
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ClasificacionTecnicaId.ToString(),
                                                 Descripcion = u.Nombre,
                                                 Value = u.ClasificacionTecnicaId.ToString()
                                             }).ToList();

                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                         
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
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

        public override FiltersDevSecOps GetListDevSecOps()
        {
            var retorno = new FiltersDevSecOps();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.ModeloEntrega = (from u in ctx.ParametricaDetalle
                                             where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                             && u.Descripcion == ConstantsPortfolio.ModeloEntrega
                                             && u.FlagActivo && !u.FlagEliminado.Value
                                             orderby u.Valor
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ParametricaDetalleId.ToString(),
                                                 Descripcion = u.Valor,
                                                 Value = u.ParametricaDetalleId.ToString()
                                             }).ToList();

                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
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

        public override FilterAdmin GetListsAdmin(bool withGestionadoPor = false)
        {
            var retorno = new FilterAdmin();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Area = (from u in ctx.Area
                                    where u.FlagActivo && !u.FlagEliminado.Value
                                    orderby u.Nombre
                                    select new CustomAutocompleteApplication()
                                    {
                                        Id = u.AreaId.ToString(),
                                        Descripcion = u.Nombre,
                                        Value = u.AreaId.ToString()
                                    }).ToList();

                    retorno.ClasificacionTecnica = (from u in ctx.ClasificacionTecnica
                                                    where u.FlagActivo && !u.FlagEliminado.Value
                                                    orderby u.Nombre
                                                    select new CustomAutocompleteApplication()
                                                    {
                                                        Id = u.ClasificacionTecnicaId.ToString(),
                                                        Descripcion = u.Nombre,
                                                        Value = u.ClasificacionTecnicaId.ToString()
                                                    }).ToList();

                    retorno.Division = (from u in ctx.Division
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.DivisionId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.DivisionId.ToString()
                                        }).ToList();

                    retorno.Gerencia = (from u in ctx.Gerencia
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.GerenciaId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.GerenciaId.ToString()
                                        }).ToList();

                    retorno.SubClasificacionTecnica = (from u in ctx.SubClasificacionTecnica
                                                       where u.FlagActivo && !u.FlagEliminado.Value
                                                       orderby u.Nombre
                                                       select new CustomAutocompleteApplication()
                                                       {
                                                           Id = u.SubClasificacionTecnicaId.ToString(),
                                                           Descripcion = u.Nombre,
                                                           Value = u.SubClasificacionTecnicaId.ToString()
                                                       }).ToList();

                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
                                          }).ToList();

                    retorno.Unidad = (from u in ctx.Unidad
                                      where u.FlagActivo && !u.FlagEliminado.Value
                                      orderby u.Nombre
                                      select new CustomAutocompleteApplication()
                                      {
                                          Id = u.UnidadId.ToString(),
                                          Descripcion = u.Nombre,
                                          Value = u.UnidadId.ToString()
                                      }).ToList();


                    retorno.TipoPCI = (from u in ctx.TipoPCI
                                       where u.FlagActivo==true && !u.FlagEliminado.Value
                                       orderby u.Nombre
                                      select new CustomAutocompleteApplication()
                                      {
                                          Id = u.TipoPCIId.ToString(),
                                          Descripcion = u.Nombre,
                                          Value = u.TipoPCIId.ToString()
                                      }).ToList();

                    retorno.GestionadoPor = (from u in ctx.GestionadoPor
                                                    where u.FlagActivo && !u.FlagEliminado.Value
                                                    orderby u.Nombre
                                                    select new CustomAutocompleteApplication()
                                                    {
                                                        Id = u.GestionadoPorId.ToString(),
                                                        Descripcion = u.Nombre,
                                                        Value = u.GestionadoPorId.ToString()
                                                    }).ToList();

                    retorno.LiderUsuario = (from u in ctx.ApplicationManagerCatalog
                                             where u.isActive && u.applicationManagerId==4
                                             orderby u.managerName
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.managerName.ToString(),
                                                 Descripcion = u.managerName,
                                                 Value = u.managerName.ToString()
                                             }).Distinct().ToList();

                    retorno.EstadoAplicacion = new List<CustomAutocompleteApplication>();
                    retorno.EstadoAplicacion.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ApplicationState.Eliminada).ToString(),
                        Descripcion = "Eliminada",
                        Value = ((int)ApplicationState.Eliminada).ToString()
                    });
                    retorno.EstadoAplicacion.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ApplicationState.EnDesarrollo).ToString(),
                        Descripcion = "En Desarrollo",
                        Value = ((int)ApplicationState.EnDesarrollo).ToString()
                    });
                    retorno.EstadoAplicacion.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ApplicationState.Vigente).ToString(),
                        Descripcion = "Vigente",
                        Value = ((int)ApplicationState.Vigente).ToString()
                    });
                    retorno.EstadoAplicacion.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ApplicationState.NoVigente).ToString(),
                        Descripcion = "No Vigente",
                        Value = ((int)ApplicationState.NoVigente).ToString()
                    });

                    if (withGestionadoPor)
                    {
                        retorno.GestionadoPor = (from u in ctx.GestionadoPor
                                                 where u.FlagActivo && !u.FlagEliminado.Value
                                                 orderby u.Nombre
                                                 select new CustomAutocompleteApplication()
                                                 {
                                                     Id = u.GestionadoPorId.ToString(),
                                                     Descripcion = u.Nombre
                                                 }).ToList();
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


        public override FilterAdmin GetListsAdminConditions(bool withDivision, bool withArea, bool withUnidad, bool withGestionadoPor)
        {
            var retorno = new FilterAdmin();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Gerencia = (from u in ctx.Gerencia
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.GerenciaId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.GerenciaId.ToString()
                                        }).ToList();

                    if (withDivision)
                    {
                        retorno.Division = (from u in ctx.Division
                                            where u.FlagActivo && !u.FlagEliminado.Value
                                            orderby u.Nombre
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.DivisionId.ToString(),
                                                Descripcion = u.Nombre,
                                                Value = u.DivisionId.ToString()
                                            }).ToList();

                    }

                    if (withArea)
                    {
                        retorno.Area = (from u in ctx.Area
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.AreaId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.AreaId.ToString()
                                        }).ToList();
                    }

                    if (withUnidad)
                    {
                        retorno.Unidad = (from u in ctx.Unidad
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.UnidadId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.UnidadId.ToString()
                                          }).ToList();
                    }
                    


                    retorno.TipoActivo = (from u in ctx.TipoActivoInformacion
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoActivoInformacionId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoActivoInformacionId.ToString()
                                          }).ToList();

                  
                    if (withGestionadoPor)
                    {
                        retorno.GestionadoPor = (from u in ctx.GestionadoPor
                                                 where u.FlagActivo && !u.FlagEliminado.Value
                                                 orderby u.Nombre
                                                 select new CustomAutocompleteApplication()
                                                 {
                                                     Id = u.GestionadoPorId.ToString(),
                                                     Descripcion = u.Nombre
                                                 }).ToList();
                    }

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: GetListsAdminConditions(bool withDivision, bool withArea, bool withUnidad, bool withGestionadoPor)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: GetListsAdminConditions(bool withDivision, bool withArea, bool withUnidad, bool withGestionadoPor)"
                    , new object[] { null });
            }
        }


        public override FiltersAppStepOne GetListStepOne()
        {
            var retorno = new FiltersAppStepOne();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.TipoImplementacion = (from u in ctx.ParametricaDetalle
                                                  where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                  && u.Descripcion == ConstantsPortfolio.TipoImplementacion
                                                  && u.FlagActivo && !u.FlagEliminado.Value
                                                  orderby u.Valor
                                                  select new CustomAutocompleteApplication()
                                                  {
                                                      Id = u.ParametricaDetalleId.ToString(),
                                                      Descripcion = u.Valor,
                                                      Value = u.ParametricaDetalleId.ToString()
                                                  }).ToList();

                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
                                          }).ToList();

                    retorno.ModeloEntrega = (from u in ctx.ParametricaDetalle
                                             where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                             && u.Descripcion == ConstantsPortfolio.ModeloEntrega
                                             && u.FlagActivo && !u.FlagEliminado.Value
                                             orderby u.Valor
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ParametricaDetalleId.ToString(),
                                                 Descripcion = u.Valor,
                                                 Value = u.ParametricaDetalleId.ToString()
                                             }).ToList();

                    retorno.GestionadPor = (from u in ctx.GestionadoPor
                                            where u.FlagActivo && !u.FlagEliminado.Value
                                            orderby u.Nombre
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.GestionadoPorId.ToString(),
                                                Descripcion = u.Nombre,
                                                Value = u.GestionadoPorId.ToString()
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

        public override FiltersAppStepTwo GetListStepTwo_Admin()
        {
            var retorno = new FiltersAppStepTwo();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.TipoImplementacion = (from u in ctx.ParametricaDetalle
                                                  where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                  && u.Descripcion == ConstantsPortfolio.TipoImplementacion
                                               
                                                  orderby u.Valor
                                                  select new CustomAutocompleteApplication()
                                                  {
                                                      Id = u.ParametricaDetalleId.ToString(),
                                                      Descripcion = u.Valor,
                                                      Value = u.ParametricaDetalleId.ToString()
                                                  }).ToList();

                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                         
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
                                          }).ToList();

                    retorno.TipoPCI = (from u in ctx.TipoPCI
                                       where u.TipoPCIId!=4
                                       orderby u.Nombre
                                       select new CustomAutocompleteApplication()
                                       {
                                           Id = u.TipoPCIId.ToString(),
                                           Descripcion = u.Nombre,
                                           Value = u.TipoPCIId.ToString()
                                       }).ToList();

                    retorno.ModeloEntrega = (from u in ctx.ParametricaDetalle
                                             where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                             && u.Descripcion == ConstantsPortfolio.ModeloEntrega
                                            
                                             orderby u.Valor
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ParametricaDetalleId.ToString(),
                                                 Descripcion = u.Valor,
                                                 Value = u.ParametricaDetalleId.ToString()
                                             }).ToList();

                    retorno.GestionadPor = (from u in ctx.GestionadoPor
                                         
                                            orderby u.Nombre
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.GestionadoPorId.ToString(),
                                                Descripcion = u.Nombre,
                                                Value = u.GestionadoPorId.ToString()
                                            }).ToList();

                    retorno.EntidadesUsuarias = (from u in ctx.ParametricaDetalle
                                                 where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                 && u.Descripcion == ConstantsPortfolio.EntidadesUsuarias
                                               
                                                 orderby u.Valor
                                                 select new CustomAutocompleteApplication()
                                                 {
                                                     Id = u.ParametricaDetalleId.ToString(),
                                                     Descripcion = u.Valor,
                                                     Value = u.ParametricaDetalleId.ToString()
                                                 }).ToList();

                    retorno.TipoDesarrollo = (from u in ctx.ParametricaDetalle
                                              where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                              && u.Descripcion == ConstantsPortfolio.TipoDesarrollo
                                            
                                              orderby u.Valor
                                              select new CustomAutocompleteApplication()
                                              {
                                                  Id = u.ParametricaDetalleId.ToString(),
                                                  Descripcion = u.Valor,
                                                  Value = u.ParametricaDetalleId.ToString()
                                              }).ToList();

                    retorno.Infraestructura = (from u in ctx.ParametricaDetalle
                                               where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                               && u.Descripcion == ConstantsPortfolio.Infraestructura
                                             
                                               orderby u.Valor
                                               select new CustomAutocompleteApplication()
                                               {
                                                   Id = u.ParametricaDetalleId.ToString(),
                                                   Descripcion = u.Valor,
                                                   Value = u.ParametricaDetalleId.ToString()
                                               }).ToList();

                    retorno.MetodoAutenticacion = (from u in ctx.ParametricaDetalle
                                                   where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                   && u.Descripcion == ConstantsPortfolio.MetodoAutenticacion
                                               
                                                   orderby u.Valor
                                                   select new CustomAutocompleteApplication()
                                                   {
                                                       Id = u.ParametricaDetalleId.ToString(),
                                                       Descripcion = u.Valor,
                                                       Value = u.ParametricaDetalleId.ToString()
                                                   }).ToList();

                    retorno.MetodoAutorizacion = (from u in ctx.ParametricaDetalle
                                                  where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                  && u.Descripcion == ConstantsPortfolio.MetodoAutorizacion
                                                
                                                  orderby u.Valor
                                                  select new CustomAutocompleteApplication()
                                                  {
                                                      Id = u.ParametricaDetalleId.ToString(),
                                                      Descripcion = u.Valor,
                                                      Value = u.ParametricaDetalleId.ToString()
                                                  }).ToList();

                    retorno.GrupoTicketRemedy = (from u in ctx.GrupoRemedy
                                              
                                                 orderby u.Nombre
                                                 select new CustomAutocompleteApplication()
                                                 {
                                                     Id = u.GrupoRemedyId.ToString(),
                                                     Descripcion = u.Nombre,
                                                     Value = u.GrupoRemedyId.ToString()
                                                 }).ToList();

                    retorno.GestionadoPorUserIT = (from u in ctx.GestionadoPor
                                                   where (u.FlagUserIT == true || u.FlagJefeEquipo == true)
                                                   orderby u.Nombre
                                                   select new CustomAutocompleteApplication()
                                                   {
                                                       Id = u.GestionadoPorId.ToString(),
                                                       Descripcion = u.Nombre,
                                                       Value = u.GestionadoPorId.ToString()
                                                   }).ToList();

                    retorno.BIA = new List<CustomAutocompleteApplication>();
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.Alta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.Alta),
                        Value = ((int)BIA.Alta).ToString()
                    });
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.Baja).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.Baja),
                        Value = ((int)BIA.Baja).ToString()
                    });
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.Media).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.Media),
                        Value = ((int)BIA.Media).ToString()
                    });
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.MuyAlta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.MuyAlta),
                        Value = ((int)BIA.MuyAlta).ToString()
                    });

                    retorno.CriticidadFinal = new List<CustomAutocompleteApplication>();
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.Alta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.Alta),
                        Value = ((int)CriticidadFinal.Alta).ToString()
                    });
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.Baja).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.Baja),
                        Value = ((int)CriticidadFinal.Baja).ToString()
                    });
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.Media).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.Media),
                        Value = ((int)CriticidadFinal.Media).ToString()
                    });
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.MuyAlta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.MuyAlta),
                        Value = ((int)CriticidadFinal.MuyAlta).ToString()
                    });

                    retorno.ClasificacionActivos = new List<CustomAutocompleteApplication>();
                    retorno.ClasificacionActivos.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ClasificacionActivos.Publico).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(ClasificacionActivos.Publico),
                        Value = ((int)ClasificacionActivos.Publico).ToString()
                    });
                    retorno.ClasificacionActivos.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ClasificacionActivos.Restringido).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(ClasificacionActivos.Restringido),
                        Value = ((int)ClasificacionActivos.Restringido).ToString()
                    });
                    retorno.ClasificacionActivos.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ClasificacionActivos.UsoInterno).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(ClasificacionActivos.UsoInterno),
                        Value = ((int)ClasificacionActivos.UsoInterno).ToString()
                    });


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


        public override string ValidateActivationJenkins()
        {

            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    var ActivarJenkins = ServiceManager<ParametroDAO>.Provider.ObtenerParametro("ACTIVAR_INTEGRACION_JENKINS");

                    return ActivarJenkins.Valor;
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


        public override FiltersAppStepTwo GetListStepTwo()
        {
            var retorno = new FiltersAppStepTwo();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.TipoImplementacion = (from u in ctx.ParametricaDetalle
                                                  where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                  && u.Descripcion == ConstantsPortfolio.TipoImplementacion
                                                  && u.FlagActivo && !u.FlagEliminado.Value
                                                  orderby u.Valor
                                                  select new CustomAutocompleteApplication()
                                                  {
                                                      Id = u.ParametricaDetalleId.ToString(),
                                                      Descripcion = u.Valor,
                                                      Value = u.ParametricaDetalleId.ToString()
                                                  }).ToList();

                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                          where u.FlagActivo && !u.FlagEliminado.Value
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
                                          }).ToList();

                    retorno.TipoPCI = (from u in ctx.TipoPCI
                                       where u.FlagActivo==true && u.TipoPCIId!=4
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.TipoPCIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.TipoPCIId.ToString()
                                          }).ToList();

                    retorno.ModeloEntrega = (from u in ctx.ParametricaDetalle
                                             where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                             && u.Descripcion == ConstantsPortfolio.ModeloEntrega
                                             && u.FlagActivo && !u.FlagEliminado.Value
                                             orderby u.Valor
                                             select new CustomAutocompleteApplication()
                                             {
                                                 Id = u.ParametricaDetalleId.ToString(),
                                                 Descripcion = u.Valor,
                                                 Value = u.ParametricaDetalleId.ToString()
                                             }).ToList();

                    retorno.GestionadPor = (from u in ctx.GestionadoPor
                                            where u.FlagActivo && !u.FlagEliminado.Value
                                            orderby u.Nombre
                                            select new CustomAutocompleteApplication()
                                            {
                                                Id = u.GestionadoPorId.ToString(),
                                                Descripcion = u.Nombre,
                                                Value = u.GestionadoPorId.ToString()
                                            }).ToList();

                    retorno.EntidadesUsuarias = (from u in ctx.ParametricaDetalle
                                                 where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                 && u.Descripcion == ConstantsPortfolio.EntidadesUsuarias
                                                 && u.FlagActivo && !u.FlagEliminado.Value
                                                 orderby u.Valor
                                                 select new CustomAutocompleteApplication()
                                                 {
                                                     Id = u.ParametricaDetalleId.ToString(),
                                                     Descripcion = u.Valor,
                                                     Value = u.ParametricaDetalleId.ToString()
                                                 }).ToList();

                    retorno.TipoDesarrollo = (from u in ctx.ParametricaDetalle
                                              where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                              && u.Descripcion == ConstantsPortfolio.TipoDesarrollo
                                              && u.FlagActivo && !u.FlagEliminado.Value
                                              orderby u.Valor
                                              select new CustomAutocompleteApplication()
                                              {
                                                  Id = u.ParametricaDetalleId.ToString(),
                                                  Descripcion = u.Valor,
                                                  Value = u.ParametricaDetalleId.ToString()
                                              }).ToList();

                    retorno.Infraestructura = (from u in ctx.ParametricaDetalle
                                               where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                               && u.Descripcion == ConstantsPortfolio.Infraestructura
                                               && u.FlagActivo && !u.FlagEliminado.Value
                                               orderby u.Valor
                                               select new CustomAutocompleteApplication()
                                               {
                                                   Id = u.ParametricaDetalleId.ToString(),
                                                   Descripcion = u.Valor,
                                                   Value = u.ParametricaDetalleId.ToString()
                                               }).ToList();

                    retorno.MetodoAutenticacion = (from u in ctx.ParametricaDetalle
                                                   where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                   && u.Descripcion == ConstantsPortfolio.MetodoAutenticacion
                                                   && u.FlagActivo && !u.FlagEliminado.Value
                                                   orderby u.Valor
                                                   select new CustomAutocompleteApplication()
                                                   {
                                                       Id = u.ParametricaDetalleId.ToString(),
                                                       Descripcion = u.Valor,
                                                       Value = u.ParametricaDetalleId.ToString()
                                                   }).ToList();

                    retorno.MetodoAutorizacion = (from u in ctx.ParametricaDetalle
                                                  where u.ParametricaId == (int)EEntidadParametrica.PORTAFOLIO
                                                  && u.Descripcion == ConstantsPortfolio.MetodoAutorizacion
                                                  && u.FlagActivo && !u.FlagEliminado.Value
                                                  orderby u.Valor
                                                  select new CustomAutocompleteApplication()
                                                  {
                                                      Id = u.ParametricaDetalleId.ToString(),
                                                      Descripcion = u.Valor,
                                                      Value = u.ParametricaDetalleId.ToString()
                                                  }).ToList();

                    retorno.GrupoTicketRemedy = (from u in ctx.GrupoRemedy
                                                 where u.FlagActivo && !u.FlagEliminado
                                                 orderby u.Nombre
                                                 select new CustomAutocompleteApplication()
                                                 {
                                                     Id = u.GrupoRemedyId.ToString(),
                                                     Descripcion = u.Nombre,
                                                     Value = u.GrupoRemedyId.ToString()
                                                 }).ToList();

                    retorno.GestionadoPorUserIT = (from u in ctx.GestionadoPor
                                                   where u.FlagActivo && !u.FlagEliminado.Value && (u.FlagUserIT == true || u.FlagJefeEquipo == true)
                                                   orderby u.Nombre
                                                   select new CustomAutocompleteApplication()
                                                   {
                                                       Id = u.GestionadoPorId.ToString(),
                                                       Descripcion = u.Nombre,
                                                       Value = u.GestionadoPorId.ToString()
                                                   }).ToList();

                    retorno.BIA = new List<CustomAutocompleteApplication>();
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.Alta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.Alta),
                        Value = ((int)BIA.Alta).ToString()
                    });
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.Baja).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.Baja),
                        Value = ((int)BIA.Baja).ToString()
                    });
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.Media).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.Media),
                        Value = ((int)BIA.Media).ToString()
                    });
                    retorno.BIA.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)BIA.MuyAlta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(BIA.MuyAlta),
                        Value = ((int)BIA.MuyAlta).ToString()
                    });

                    retorno.CriticidadFinal = new List<CustomAutocompleteApplication>();
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.Alta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.Alta),
                        Value = ((int)CriticidadFinal.Alta).ToString()
                    });
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.Baja).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.Baja),
                        Value = ((int)CriticidadFinal.Baja).ToString()
                    });
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.Media).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.Media),
                        Value = ((int)CriticidadFinal.Media).ToString()
                    });
                    retorno.CriticidadFinal.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)CriticidadFinal.MuyAlta).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(CriticidadFinal.MuyAlta),
                        Value = ((int)CriticidadFinal.MuyAlta).ToString()
                    });

                    retorno.ClasificacionActivos = new List<CustomAutocompleteApplication>();
                    retorno.ClasificacionActivos.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ClasificacionActivos.Publico).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(ClasificacionActivos.Publico),
                        Value = ((int)ClasificacionActivos.Publico).ToString()
                    });
                    retorno.ClasificacionActivos.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ClasificacionActivos.Restringido).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(ClasificacionActivos.Restringido),
                        Value = ((int)ClasificacionActivos.Restringido).ToString()
                    });
                    retorno.ClasificacionActivos.Add(new CustomAutocompleteApplication()
                    {
                        Id = ((int)ClasificacionActivos.UsoInterno).ToString(),
                        Descripcion = Utilitarios.GetEnumDescription2(ClasificacionActivos.UsoInterno),
                        Value = ((int)ClasificacionActivos.UsoInterno).ToString()
                    });


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

        public override FilterArquitectoTI GetListSubclasificacion(int clasificacion)
        {
            var retorno = new FilterArquitectoTI();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.SubClasificacion = (from u in ctx.SubClasificacionTecnica
                                                where u.FlagActivo && !u.FlagEliminado.Value && u.ClasificacionTecnicaId == clasificacion
                                                orderby u.Nombre
                                                select new CustomAutocompleteApplication()
                                                {
                                                    Id = u.SubClasificacionTecnicaId.ToString(),
                                                    Descripcion = u.Nombre,
                                                    Value = u.SubClasificacionTecnicaId.ToString()
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

        public override FilterAdmin GetListsAreaByDivision(int idDivision)
        {
            var retorno = new FilterAdmin();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Area = (from u in ctx.Area
                                    where u.FlagActivo && !u.FlagEliminado.Value
                                    && u.DivisionId == idDivision
                                    orderby u.Nombre
                                    select new CustomAutocompleteApplication()
                                    {
                                        Id = u.AreaId.ToString(),
                                        Descripcion = u.Nombre,
                                        Value = u.AreaId.ToString()
                                    }).ToList();

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsAreaByDivision(int idDivision)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsAreaByDivision(int idDivision)"
                    , new object[] { null });
            }

        }

        public override FilterAdmin GetListsDivisionByGerente(int idGerente)
        {
            var retorno = new FilterAdmin();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Division = (from u in ctx.Division
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        && u.GerenciaId == idGerente
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.DivisionId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.DivisionId.ToString()
                                        }).ToList();

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsDivisionByGerente(int idGerente)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsDivisionByGerente(int idGerente)"
                    , new object[] { null });
            }

        }

        public override FilterAdmin GetListsDivisionByGerenteMulti(int[] idsGerente)
        {
            var retorno = new FilterAdmin();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Division = (from u in ctx.Division
                                        where u.FlagActivo && !u.FlagEliminado.Value
                                        && idsGerente.Contains( u.GerenciaId )
                                        orderby u.Nombre
                                        select new CustomAutocompleteApplication()
                                        {
                                            Id = u.DivisionId.ToString(),
                                            Descripcion = u.Nombre,
                                            Value = u.DivisionId.ToString()
                                        }).ToList();

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsDivisionByGerente(int idGerente)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsDivisionByGerente(int idGerente)"
                    , new object[] { null });
            }

        }

        public override FilterAdmin GetListsAreaByDivisionMulti(int[] idsDivision)
        {
            var retorno = new FilterAdmin();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Area = (from u in ctx.Area
                                    where u.FlagActivo && !u.FlagEliminado.Value
                                    && idsDivision.Contains(u.DivisionId )
                                    orderby u.Nombre
                                    select new CustomAutocompleteApplication()
                                    {
                                        Id = u.AreaId.ToString(),
                                        Descripcion = u.Nombre,
                                        Value = u.AreaId.ToString()
                                    }).ToList();

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsAreaByDivisionMulti(int[] idsDivision)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsAreaByDivisionMulti(int[] idsDivision)"
                    , new object[] { null });
            }

        }

        public override FilterAdmin GetListsUnidadesByAreaMulti(int[] idsArea)
        {
            var retorno = new FilterAdmin();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Area = (from u in ctx.Unidad
                                    where u.FlagActivo && !u.FlagEliminado.Value
                                    && idsArea.Contains(u.AreaId)
                                    orderby u.Nombre
                                    select new CustomAutocompleteApplication()
                                    {
                                        Id = u.UnidadId.ToString(),
                                        Descripcion = u.Nombre,
                                        Value = u.UnidadId.ToString()
                                    }).ToList();

                    return retorno;
                }
            }
            catch (DbEntityValidationException ex)
            {
                log.ErrorEntity(ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsUnidadesByAreaMulti(int[] idsArea)"
                    , new object[] { null });
            }
            catch (Exception ex)
            {
                log.Error("Error ", ex);
                throw new CVTException(CVTExceptionIds.ErrorAplicacionDTO
                    , "Error en el metodo: FilterAdmin GetListsUnidadesByAreaMulti(int[] idsArea)"
                    , new object[] { null });
            }

        }

        public override FilterArquitectoEvaluador GetListArquitectoEvaluadorAdmin(int area)
        {
            var retorno = new FilterArquitectoEvaluador();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.DominioBIAN = (from u in ctx.DominioBian
                                           where u.AreaBianId == area
                                           orderby u.Nombre
                                           select new CustomAutocompleteApplication()
                                           {
                                               Id = u.DominioBianId.ToString(),
                                               Descripcion = u.Nombre,
                                               Value = u.DominioBianId.ToString()
                                           }).ToList();

                    retorno.TOBE = (from u in ctx.PlataformaBcp
                                    where u.AreaBianId == area
                                    orderby u.Nombre
                                    select new CustomAutocompleteApplication()
                                    {
                                        Id = u.PlataformaBcpId.ToString(),
                                        Descripcion = u.Nombre,
                                        Value = u.PlataformaBcpId.ToString()
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

        public override FilterArquitectoTI GetListSubclasificacionAdmin(int clasificacion)
        {
            var retorno = new FilterArquitectoTI();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.SubClasificacion = (from u in ctx.SubClasificacionTecnica
                                                where u.ClasificacionTecnicaId == clasificacion
                                                orderby u.Nombre
                                                select new CustomAutocompleteApplication()
                                                {
                                                    Id = u.SubClasificacionTecnicaId.ToString(),
                                                    Descripcion = u.Nombre,
                                                    Value = u.SubClasificacionTecnicaId.ToString()
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

        public override FilterAppsGestionado GetEquiposAdmin(int gestionado)
        {
            var retorno = new FilterAppsGestionado();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Equipos = (from u in ctx.TeamSquad
                                       where u.GestionadoPorId == gestionado
                                       orderby u.Nombre
                                       select new CustomAutocompleteApplication()
                                       {
                                           Id = u.EquipoId.ToString(),
                                           Descripcion = u.Nombre,
                                           Value = u.EquipoId.ToString()
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

        public override FilterArquitectoEvaluador GetListArquitectoJefaturaAdmin(int jefatura)
        {
            var retorno = new FilterArquitectoEvaluador();
            try
            {
                using (var ctx = GestionCMDB_ProdEntities.ConnectToSqlServer())
                {
                    retorno.Arquitecto = (from u in ctx.ArquitectoTI
                                          where u.JefaturaAtiId == jefatura
                                          orderby u.Nombre
                                          select new CustomAutocompleteApplication()
                                          {
                                              Id = u.ArquitectoTIId.ToString(),
                                              Descripcion = u.Nombre,
                                              Value = u.ArquitectoTIId.ToString()
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
    }
}
