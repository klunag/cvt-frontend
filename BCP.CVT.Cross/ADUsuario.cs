using System;
using System.Collections.Generic;
using System.DirectoryServices;
using System.DirectoryServices.ActiveDirectory;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BCP.CVT.Cross
{
    public class ADUsuario
    {
        private string[] propiedades = {
                "sAMAccountName"
                ,"givenName"
                ,"sn"
                ,"title"
                ,"department"
                ,"physicalDeliveryOfficeName"
                ,"department"
                ,"department"
                ,"objectGUID"
                ,"company"
                ,"userPrincipalName"
                ,"objectSid"
                ,"displayName"
                ,"mail"};


        /* METODOS */

        /// <summary>
        /// Construye la clase utilizando el User Principal Name del usuario 
        /// </summary>
        /// <param name="matricula">
        /// User Principal Name</param>
        /// 


        public ADUsuarioBE ObtenerADUsuario(string matricula)
        {
            var validacionMatricula = Settings.Get<int>("AD.Matricula.Activo");
            if (validacionMatricula == 1)
            {
                DirectorySearcher searcher;
                SearchResult usuarioSR;

                //Obtener una referencia al buscador de AD para el Global Catalog
                using (searcher = Forest.GetCurrentForest().FindGlobalCatalog().GetDirectorySearcher())
                {

                    searcher.PropertiesToLoad.AddRange(propiedades);

                    //Buscar al usuario en base a su User Principal Name
                    searcher.Filter = string.Format("(&(objectClass=user)(sAMAccountName={0}))", matricula);

                    usuarioSR = searcher.FindOne();
                    var objUsuarioAD = new ADUsuarioBE
                    {

                        Usuario = ObtenerPropiedad(usuarioSR, "sAMAccountName"),
                        Nombre = ObtenerPropiedad(usuarioSR, "displayName"),
                        ApellidoPaterno = ObtenerPropiedad(usuarioSR, "sn"),
                        Puesto = ObtenerPropiedad(usuarioSR, "title"),
                        Area = ObtenerPropiedad(usuarioSR, "department"),
                        UbicacionFisica = ObtenerPropiedad(usuarioSR, "physicalDeliveryOfficeName"),
                        Servicio = ObtenerPropiedad(usuarioSR, "department"),
                        Division = ObtenerPropiedad(usuarioSR, "department"),
                        Guid = ObtenerPropiedad(usuarioSR, "objectGUID"),
                        Compania = ObtenerPropiedad(usuarioSR, "company"),
                        UserPrincipalName = ObtenerPropiedad(usuarioSR, "userPrincipalName"),
                        Sid = ObtenerPropiedad(usuarioSR, "objectSid"),
                        Correo = ObtenerPropiedad(usuarioSR, "mail"),
                        Anexo = ObtenerPropiedad(usuarioSR, "telephoneNumber"),
                    };

                    return objUsuarioAD;
                }
            }
            else
            {
                var objUsuarioAD = new ADUsuarioBE
                {
                    Usuario = matricula,
                    Nombre = "Usuario AD",
                    Correo = "juandedios.garcia@itsight.pe"
                };

                return objUsuarioAD;
            }
        }

        public List<ADUsuarioBE> ObtenerListaADUsuario(string nombre)
        {
            DirectorySearcher searcher;
            List<ADUsuarioBE> lista = new List<ADUsuarioBE>();
            //Obtener una referencia al buscador de AD para el Global Catalog
            using (searcher = Forest.GetCurrentForest().FindGlobalCatalog().GetDirectorySearcher())
            {

                searcher.PropertiesToLoad.AddRange(propiedades);

                //Buscar al usuario en base a su User Principal Name
                searcher.Filter = string.Format("(&(objectClass=user)(|(displayName=*{0})(displayName={0}*))(|(sAMAccountName=*{0})(sAMAccountName={0}*)))", nombre);

                var usuarioSR = searcher.FindAll();
                foreach (SearchResult item in usuarioSR)
                {
                    var objUsuarioAD = new ADUsuarioBE
                    {

                        Usuario = ObtenerPropiedad(item, "sAMAccountName"),
                        Nombre = ObtenerPropiedad(item, "displayName"),
                        ApellidoPaterno = ObtenerPropiedad(item, "sn"),
                        Puesto = ObtenerPropiedad(item, "title"),
                        Area = ObtenerPropiedad(item, "department"),
                        UbicacionFisica = ObtenerPropiedad(item, "physicalDeliveryOfficeName"),
                        Servicio = ObtenerPropiedad(item, "department"),
                        Division = ObtenerPropiedad(item, "department"),
                        Guid = ObtenerPropiedad(item, "objectGUID"),
                        Compania = ObtenerPropiedad(item, "company"),
                        UserPrincipalName = ObtenerPropiedad(item, "userPrincipalName"),
                        Sid = ObtenerPropiedad(item, "objectSid"),
                        Correo = ObtenerPropiedad(item, "mail"),
                        Anexo = ObtenerPropiedad(item, "telephoneNumber"),
                        Estado = 1
                    };
                    lista.Add(objUsuarioAD);
                }
                return lista;
            }
        }

        public string ObtenerNombreUsuarioAD(string matricula)
        {
            DirectorySearcher searcher;
            SearchResult usuarioSR;

            //Obtener una referencia al buscador de AD para el Global Catalog
            using (searcher = Forest.GetCurrentForest().FindGlobalCatalog().GetDirectorySearcher())
            {

                searcher.PropertiesToLoad.AddRange(propiedades);

                //Buscar al usuario en base a su User Principal Name
                searcher.Filter = string.Format("(&(objectClass=user)(sAMAccountName={0}))", matricula);

                usuarioSR = searcher.FindOne();

                return ObtenerPropiedad(usuarioSR, "userPrincipalName");

            }

        }

        public ADUsuario()
        {

        }
        /// <summary>
        /// Obtiene el valor de la propiedad del objecto searchResult
        /// </summary>
        /// <param name="item">object searchResult de donde se obtendra el valor.</param>
        /// <param name="nombrePropiedad">nombre de la propiedad a buscar.</param>
        /// <returns>el valor de una propiedad de un objecto SearchResult</returns>
        private string ObtenerPropiedad(SearchResult item
                , string nombrePropiedad)
        {
            string valor = string.Empty;

            if (item == null)
                return valor;

            if (item.Properties[nombrePropiedad] != null &&
                    item.Properties[nombrePropiedad].Count > 0)
            {
                if (nombrePropiedad.ToLower().Equals("objectguid"))
                {
                    valor = new Guid((byte[])
                        (item.Properties[nombrePropiedad][0])).ToString();
                }
                else if (nombrePropiedad.ToLower().Equals("objectsid"))
                {
                    valor = ConvertirByteASidString((byte[])
                            (item.Properties[nombrePropiedad][0]));
                }
                else
                    valor = item.Properties[nombrePropiedad][0].ToString();
            }

            return valor;
        }

        /// <summary>
        /// Convierte un arreglo de bytes a un security ID (sid)
        /// </summary>
        /// <param name="sidBytes">arreglo de bytes a convertir.</param>
        /// <returns>Security ID construido a partir de un arreglo de bytes</returns>
        /// <remarks>
        /// Basado en el documeto: 
        /// <see cref="http://www.codeproject.com/KB/cs/getusersid.aspx"/></remarks>
        private string ConvertirByteASidString(Byte[] sidBytes)
        {
            StringBuilder strSid = new StringBuilder();
            strSid.Append("S-");
            if (sidBytes != null && sidBytes.Length > 0)
            {
                // Agregar el SID revision.
                strSid.Append(sidBytes[0].ToString());
                // Agregar los 6 bytes correspondientes al SID authority value.
                if (sidBytes[6] != 0 || sidBytes[5] != 0)
                {
                    string strAuth = String.Format
                        ("0x{0:2x}{1:2x}{2:2x}{3:2x}{4:2x}{5:2x}",
                        (Int16)sidBytes[1],
                        (Int16)sidBytes[2],
                        (Int16)sidBytes[3],
                        (Int16)sidBytes[4],
                        (Int16)sidBytes[5],
                        (Int16)sidBytes[6]);
                    strSid.Append("-");
                    strSid.Append(strAuth);
                }
                else
                {
                    Int64 iVal = (Int32)(sidBytes[1]) +
                        (Int32)(sidBytes[2] << 8) +
                        (Int32)(sidBytes[3] << 16) +
                        (Int32)(sidBytes[4] << 24);
                    strSid.Append("-");
                    strSid.Append(iVal.ToString());
                }

                // Obtener el conteo de "sub authority"
                int iSubCount = Convert.ToInt32(sidBytes[7]);
                int idxAuth = 0;
                for (int i = 0; i < iSubCount; i++)
                {
                    idxAuth = 8 + i * 4;
                    UInt32 iSubAuth = BitConverter.ToUInt32(sidBytes, idxAuth);
                    strSid.Append("-");
                    strSid.Append(iSubAuth.ToString());
                }
                return strSid.ToString();
            }
            else
                return "";
        }

        public class ADUsuarioBE
        {
            public string Usuario { get; set; }
            public string Nombre { get; set; }
            public string ApellidoPaterno { get; set; }
            public string Puesto { get; set; }
            public string Area { get; set; }
            public string UbicacionFisica { get; set; }
            public string Servicio { get; set; }
            public string Division { get; set; }
            public string Guid { get; set; }
            public string Compania { get; set; }
            public string UserPrincipalName { get; set; }
            public string Sid { get; set; }
            public string Correo { get; set; }
            public string Anexo { get; set; }
            public int Estado { get; set; }

            public string Id => Usuario ?? string.Empty;
            public string Descripcion => Usuario ?? string.Empty;
            public string value => Usuario ?? string.Empty;
            public string Matricula_NombreCompleto => $"{Usuario} - {Nombre} {ApellidoPaterno}";

        }
    }
}
