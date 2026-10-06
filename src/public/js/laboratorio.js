/**
 * CRUD de Laboratorios: modales, validacion, llamadas a la API y confirmacion de baja.
 */
(function () {
  const API = '/api/laboratorios';
  let modalInstancia = null;

  document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('modalLaboratorio');
    const form = document.getElementById('formLaboratorio');
    if (!modalEl || !form) return;

    modalInstancia = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: true });

    const btnNuevo = document.querySelector('[data-abrir-crear]');
    if (btnNuevo) btnNuevo.addEventListener('click', prepararCreacion);

    document.querySelectorAll('[data-accion="editar"]').forEach((btn) => {
      btn.addEventListener('click', () => prepararEdicion(btn.dataset));
    });

    document.querySelectorAll('[data-accion="eliminar"]').forEach((btn) => {
      btn.addEventListener('click', () => eliminar(btn.dataset.id, btn.dataset.codlab, btn.dataset.razonsocial));
    });

    form.addEventListener('submit', guardar);

    modalEl.addEventListener('hidden.bs.modal', () => {
      AppValidaciones.limpiarErrores(form);
      form.reset();
      ocultarAlerta();
      form.querySelector('[name="id"]').value = '';
    });

    // Comprobacion de duplicados del Codigo al salir del campo.
    const inputCodigo = form.querySelector('[name="CodLab"]');
    if (inputCodigo) {
      inputCodigo.addEventListener('blur', () => verificarCodigoUnico(inputCodigo));
    }
  });

  function prepararCreacion() {
    const form = document.getElementById('formLaboratorio');
    AppValidaciones.limpiarErrores(form);
    form.reset();
    form.querySelector('[name="id"]').value = '';
    document.getElementById('tituloModalLaboratorio').textContent = 'Nuevo Laboratorio';
    ocultarAlerta();
    modalInstancia.show();
  }

  function prepararEdicion(datos) {
    const form = document.getElementById('formLaboratorio');
    AppValidaciones.limpiarErrores(form);
    form.reset();

    form.querySelector('[name="id"]').value = datos.id || '';
    form.querySelector('[name="CodLab"]').value = datos.codlab || '';
    form.querySelector('[name="razonSocial"]').value = datos.razonsocial || '';
    form.querySelector('[name="direccion"]').value = datos.direccion || '';
    form.querySelector('[name="telefono"]').value = datos.telefono || '';
    form.querySelector('[name="email"]').value = datos.email || '';
    form.querySelector('[name="contacto"]').value = datos.contacto || '';

    document.getElementById('tituloModalLaboratorio').textContent = 'Editar Laboratorio';
    ocultarAlerta();
    modalInstancia.show();
  }

  async function verificarCodigoUnico(input) {
    const codigo = input.value.trim().toUpperCase();
    if (!codigo) return;

    const idActual = document.getElementById('labId').value;

    try {
      const respuesta = await fetch(`${API}?codigo=${encodeURIComponent(codigo)}`, {
        headers: { Accept: 'application/json' },
      });
      if (!respuesta.ok) return;
      const datos = await respuesta.json();
      const duplicado = (datos.datos || []).some((item) => item._id !== idActual);
      if (duplicado) {
        AppValidaciones.marcarInvalido(input, 'Ya existe un laboratorio con ese codigo.');
      } else if (input.classList.contains('is-invalid')) {
        AppValidaciones.marcarValido(input);
      }
    } catch (err) {
      // Silencio: la validacion definitiva la hace el servidor.
    }
  }

  function mostrarAlerta(mensaje) {
    const alerta = document.getElementById('alertaModalLaboratorio');
    if (!alerta) return;
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
  }

  function ocultarAlerta() {
    const alerta = document.getElementById('alertaModalLaboratorio');
    if (!alerta) return;
    alerta.textContent = '';
    alerta.classList.add('d-none');
  }

  async function guardar(evento) {
    evento.preventDefault();

    const form = evento.currentTarget;
    if (!AppValidaciones.validarYMostrar('form-laboratorio', form)) return;

    const id = form.querySelector('[name="id"]').value;
    const esEdicion = Boolean(id);

    const payload = {
      CodLab: form.querySelector('[name="CodLab"]').value.trim(),
      razonSocial: form.querySelector('[name="razonSocial"]').value.trim(),
      direccion: form.querySelector('[name="direccion"]').value.trim(),
      telefono: form.querySelector('[name="telefono"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      contacto: form.querySelector('[name="contacto"]').value.trim(),
    };

    const boton = document.getElementById('btnGuardarLaboratorio');
    boton.disabled = true;

    try {
      const respuesta = await fetch(esEdicion ? `${API}/${id}` : API, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const datos = await respuesta.json().catch(() => ({ ok: false }));

      if (!respuesta.ok) {
        if (datos.errores) AppValidaciones.mostrarErrores(form, datos.errores);
        mostrarAlerta(datos.mensaje || 'No se pudo guardar el laboratorio.');
        return;
      }

      window.location.reload();
    } catch (err) {
      mostrarAlerta('No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      boton.disabled = false;
    }
  }

  async function eliminar(id, codigo, razonSocial) {
    const confirmacion = window.confirm(
      `¿Seguro que deseas eliminar el laboratorio "${codigo} - ${razonSocial}"?\nEsta accion no se puede deshacer.`
    );
    if (!confirmacion) return;

    try {
      const respuesta = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const datos = await respuesta.json().catch(() => ({ ok: false }));

      if (!respuesta.ok) {
        window.alert(datos.mensaje || 'No se pudo eliminar el laboratorio.');
        return;
      }
      window.location.reload();
    } catch (err) {
      window.alert('No se pudo conectar con el servidor.');
    }
  }
})();
