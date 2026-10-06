/**
 * Validaciones del lado del cliente (se ejecutan ANTES de enviar al backend).
 * Uso basico: forms con data-validar="<nombre>" y campos con .invalid-feedback.
 */
window.AppValidaciones = (function () {
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const REGEX_TEL = /^[0-9+\s()-]{6,20}$/;

  const texto = (form, nombre) => {
    const campo = form.querySelector(`[name="${nombre}"]`);
    return campo ? String(campo.value || '').trim() : '';
  };

  const validadores = {
    'form-login': (form) => {
      const errores = {};
      const email = texto(form, 'email');
      const password = texto(form, 'password');

      if (!email) errores.email = 'El email es obligatorio.';
      else if (!REGEX_EMAIL.test(email)) errores.email = 'Ingresa un email valido.';

      if (!password) errores.password = 'La contrasena es obligatoria.';

      return errores;
    },

    'form-registro': (form) => {
      const errores = {};
      const nombre = texto(form, 'nombre');
      const email = texto(form, 'email');
      const password = texto(form, 'password');
      const confirmar = texto(form, 'confirmarPassword');

      if (!nombre) errores.nombre = 'El nombre es obligatorio.';
      else if (nombre.length < 2) errores.nombre = 'El nombre debe tener al menos 2 caracteres.';

      if (!email) errores.email = 'El email es obligatorio.';
      else if (!REGEX_EMAIL.test(email)) errores.email = 'Ingresa un email valido.';

      if (!password) errores.password = 'La contrasena es obligatoria.';
      else if (password.length < 6) errores.password = 'Minimo 6 caracteres.';

      if (!confirmar) errores.confirmarPassword = 'Confirma la contrasena.';
      else if (password !== confirmar) errores.confirmarPassword = 'Las contrasenas no coinciden.';

      return errores;
    },

    'form-laboratorio': (form) => {
      const errores = {};
      const CodLab = texto(form, 'CodLab');
      const razonSocial = texto(form, 'razonSocial');
      const direccion = texto(form, 'direccion');
      const telefono = texto(form, 'telefono');
      const email = texto(form, 'email');
      const contacto = texto(form, 'contacto');

      if (!CodLab) errores.CodLab = 'El codigo es obligatorio.';
      else if (CodLab.length > 20) errores.CodLab = 'Maximo 20 caracteres.';

      if (!razonSocial) errores.razonSocial = 'La razon social es obligatoria.';
      if (!direccion) errores.direccion = 'La direccion es obligatoria.';

      if (!telefono) errores.telefono = 'El telefono es obligatorio.';
      else if (!REGEX_TEL.test(telefono)) errores.telefono = 'Solo digitos, espacios, +, - o parentesis.';

      if (!email) errores.email = 'El email es obligatorio.';
      else if (!REGEX_EMAIL.test(email)) errores.email = 'Ingresa un email valido.';

      if (!contacto) errores.contacto = 'El contacto es obligatorio.';

      return errores;
    },

    'form-orden-compra': (form) => {
      const errores = {};
      const NroOrdenC = texto(form, 'NroOrdenC');
      const fechaEmision = texto(form, 'fechaEmision');
      const Situacion = texto(form, 'Situacion');
      const Total = texto(form, 'Total');
      const CodLab = texto(form, 'CodLab');
      const NrofacturaProv = texto(form, 'NrofacturaProv');

      if (!NroOrdenC) errores.NroOrdenC = 'El numero de orden es obligatorio.';
      else if (NroOrdenC.length > 30) errores.NroOrdenC = 'Maximo 30 caracteres.';

      if (!fechaEmision) errores.fechaEmision = 'La fecha de emision es obligatoria.';
      else if (Number.isNaN(Date.parse(fechaEmision))) errores.fechaEmision = 'Fecha no valida.';

      if (!Situacion) errores.Situacion = 'Selecciona una situacion.';

      if (Total === '') errores.Total = 'El total es obligatorio.';
      else if (Number.isNaN(Number(Total))) errores.Total = 'Ingresa un numero valido.';
      else if (Number(Total) < 0) errores.Total = 'El total no puede ser negativo.';

      if (!CodLab) errores.CodLab = 'Selecciona un laboratorio.';

      if (!NrofacturaProv) errores.NrofacturaProv = 'El numero de factura es obligatorio.';

      return errores;
    },
  };

  function campo(form, nombre) {
    return form.querySelector(`[name="${nombre}"]`);
  }

  function feedback(input) {
    if (!input) return null;
    let fb = input.parentElement ? input.parentElement.querySelector('.invalid-feedback') : null;
    if (!fb) {
      fb = input.nextElementSibling && input.nextElementSibling.classList.contains('invalid-feedback')
        ? input.nextElementSibling
        : null;
    }
    return fb;
  }

  function marcarInvalido(input, mensaje) {
    if (!input) return;
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    const fb = feedback(input);
    if (fb) fb.textContent = mensaje;
  }

  function marcarValido(input) {
    if (!input) return;
    input.classList.remove('is-invalid');
    const fb = feedback(input);
    if (fb) fb.textContent = '';
    if (String(input.value || '').trim() !== '') input.classList.add('is-valid');
    else input.classList.remove('is-valid');
  }

  function limpiarErrores(form) {
    form.querySelectorAll('.is-invalid, .is-valid').forEach((el) => {
      el.classList.remove('is-invalid', 'is-valid');
    });
    form.querySelectorAll('.invalid-feedback').forEach((el) => {
      el.textContent = '';
    });
  }

  /** Muestra los errores devueltos (por cliente o servidor). */
  function mostrarErrores(form, errores) {
    const nombres = Object.keys(errores || {});
    form.querySelectorAll('input, select, textarea').forEach((input) => {
      if (!input.name || input.type === 'hidden') return;
      if (nombres.includes(input.name)) marcarInvalido(input, errores[input.name]);
      else marcarValido(input);
    });
    const primero = form.querySelector('.is-invalid');
    if (primero) primero.focus();
  }

  function validar(nombre, form) {
    const fn = validadores[nombre];
    if (!fn) return {};
    return fn(form);
  }

  /** Valida y, si hay errores, los muestra. Devuelve true cuando no hay errores. */
  function validarYMostrar(nombre, form) {
    const errores = validar(nombre, form);
    const ok = Object.keys(errores).length === 0;
    if (ok) limpiarErrores(form);
    else mostrarErrores(form, errores);
    return ok;
  }

  function init() {
    // Formularios tradicionales (login / registro): validan y, si todo esta bien, envian normalmente.
    document.querySelectorAll('form[data-validar]:not([data-remoto])').forEach((form) => {
      const nombre = form.dataset.validar;

      form.addEventListener('submit', (evento) => {
        if (!validarYMostrar(nombre, form)) {
          evento.preventDefault();
          evento.stopPropagation();
        }
      });

      form.querySelectorAll('input, select').forEach((input) => {
        input.addEventListener('blur', () => {
          if (String(input.value || '').trim() === '' && !input.classList.contains('is-invalid')) return;
          const errores = validar(nombre, form);
          if (errores[input.name]) marcarInvalido(input, errores[input.name]);
          else marcarValido(input);
        });
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            const errores = validar(nombre, form);
            if (!errores[input.name]) {
              input.classList.remove('is-invalid');
              const fb = feedback(input);
              if (fb) fb.textContent = '';
            }
          }
        });
      });
    });

    // Buscador de la barra superior: filtra el listado actual.
    const formularioBusqueda = document.getElementById('formBusqueda');
    const campoBusqueda = document.getElementById('campoBusqueda');
    if (formularioBusqueda && campoBusqueda) {
      formularioBusqueda.addEventListener('submit', (evento) => {
        evento.preventDefault();
        filtrarListado(campoBusqueda.value);
      });
      campoBusqueda.addEventListener('input', () => filtrarListado(campoBusqueda.value));
    }
  }

  /** Filtra las filas de la tabla visible segun el texto de busqueda. */
  function filtrarListado(textoBusqueda) {
    const tabla = document.querySelector('.tabla-listado');
    if (!tabla) return;
    const valor = String(textoBusqueda || '').trim().toLowerCase();
    const filas = tabla.querySelectorAll('tbody tr');
    let visibles = 0;

    filas.forEach((fila) => {
      if (fila.classList.contains('fila-vacia')) {
        fila.style.display = valor ? 'none' : '';
        return;
      }
      const coincide = fila.textContent.toLowerCase().includes(valor);
      fila.style.display = coincide ? '' : 'none';
      if (coincide) visibles += 1;
    });

    let aviso = document.getElementById('avisoSinResultados');
    if (valor && visibles === 0) {
      if (!aviso) {
        aviso = document.createElement('div');
        aviso.id = 'avisoSinResultados';
        aviso.className = 'alert alert-info mt-3';
        aviso.innerHTML = '<i class="bi bi-search me-1"></i>No hay resultados para la busqueda.';
        tabla.parentElement.insertAdjacentElement('afterend', aviso);
      }
      aviso.style.display = '';
    } else if (aviso) {
      aviso.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    validar,
    validarYMostrar,
    mostrarErrores,
    limpiarErrores,
    marcarInvalido,
    marcarValido,
    filtrarListado,
    REGEX_EMAIL,
  };
})();
