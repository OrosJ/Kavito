// Utilidades para el manejo de fechas en el frontend

/**
 * Formatea una fecha al formato YYYY-MM-DD
 * @param {Date} date - Objeto Date (por defecto es la fecha actual)
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Convierte un string en formato YYYY-MM-DD a un objeto Date
   * @param {string} dateString - Fecha en formato YYYY-MM-DD
   * @returns {Date} - Objeto Date
   */
  export const parseYYYYMMDD = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, parseInt(month, 10) - 1, day);
  };
  
  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   * @returns {string} - Fecha actual en formato YYYY-MM-DD
   */
  export const getTodayDate = () => {
    return formatDateToYYYYMMDD();
  };
  
  /**
   * Compara dos fechas en formato YYYY-MM-DD o como objetos Date
   * @param {string|Date} date1 - Primera fecha a comparar
   * @param {string|Date} date2 - Segunda fecha a comparar
   * @returns {number} - -1 si date1 < date2, 1 si date1 > date2, 0 si son iguales
   */
  export const compareDates = (date1, date2) => {
    // Asegurarse que estamos comparando strings YYYY-MM-DD
    const d1 = typeof date1 === 'string' ? date1 : formatDateToYYYYMMDD(date1);
    const d2 = typeof date2 === 'string' ? date2 : formatDateToYYYYMMDD(date2);
    
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  };
  
  /**
   * Verifica si una fecha es anterior a otra
   * @param {string|Date} date1 - Fecha a verificar
   * @param {string|Date} date2 - Fecha de referencia
   * @returns {boolean} - true si date1 es anterior a date2
   */
  export const isDateBefore = (date1, date2) => {
    return compareDates(date1, date2) < 0;
  };
  
  /**
   * Verifica si una fecha es posterior a otra
   * @param {string|Date} date1 - Fecha a verificar
   * @param {string|Date} date2 - Fecha de referencia
   * @returns {boolean} - true si date1 es posterior a date2
   */
  export const isDateAfter = (date1, date2) => {
    return compareDates(date1, date2) > 0;
  };
  
  /**
   * Verifica si una fecha es igual a otra
   * @param {string|Date} date1 - Primera fecha
   * @param {string|Date} date2 - Segunda fecha
   * @returns {boolean} - true si las fechas son iguales
   */
  export const isDateEqual = (date1, date2) => {
    return compareDates(date1, date2) === 0;
  };
  
  /**
   * Formatea una fecha para mostrarla al usuario
   * @param {string|Date} date - Fecha a formatear
   * @param {object} options - Opciones de formato (ver toLocaleDateString)
   * @returns {string} - Fecha formateada
   */
  export const formatDateForDisplay = (date, options = {}) => {
    if (!date) return '';
    const d = typeof date === 'string' ? parseYYYYMMDD(date) : new Date(date);
    
    const defaultOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      ...options 
    };
    
    return d.toLocaleDateString(undefined, defaultOptions);
  };
  
  /**
   * Formatea una fecha y hora para mostrarla al usuario
   * @param {string|Date} date - Fecha a formatear
   * @returns {string} - Fecha y hora formateada
   */
  export const formatDateTimeForDisplay = (date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    
    return d.toLocaleString(undefined, { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    });
  };
  
  /**
   * Obtiene la fecha mínima para un input de tipo date (hoy)
   * @returns {string} - Fecha mínima en formato YYYY-MM-DD
   */
  export const getMinDateForInput = () => {
    return getTodayDate();
  };
  
  /**
   * Añade días a una fecha
   * @param {string|Date} date - Fecha base
   * @param {number} days - Número de días a añadir
   * @returns {string} - Nueva fecha en formato YYYY-MM-DD
   */
  export const addDays = (date, days) => {
    const d = typeof date === 'string' ? parseYYYYMMDD(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return formatDateToYYYYMMDD(d);
  };
  
  /**
   * Calcula la diferencia en días entre dos fechas
   * @param {string|Date} date1 - Primera fecha
   * @param {string|Date} date2 - Segunda fecha
   * @returns {number} - Diferencia en días
   */
  export const daysDifference = (date1, date2) => {
    const d1 = typeof date1 === 'string' ? parseYYYYMMDD(date1) : new Date(date1);
    const d2 = typeof date2 === 'string' ? parseYYYYMMDD(date2) : new Date(date2);
    
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };