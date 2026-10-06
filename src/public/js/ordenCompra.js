/**
 * CRUD de Ordenes de Compra: modales, validacion, llamadas a la API y confirmacion de baja.
 */
(function () {
  const API = '/api/ordenes-compra';
  let modalInstancia = null;

  document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('modalOrden');
    const form = document.getElementById('formOrden');
    if (!modalEl || !form) return;

    modalInstancia = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: true });

    const btnNuevo = document.querySelector('[data-abrir-crear]');
    if (btnNuevo) btnNuevo.addEventListener('click', prepararCreacion);

    document.querySelectorAll('[data-accion="editar"]').forEach((btn) => {
      btn.addEventListener('click', () => prepararEdicion(btn.dataset));
    });

    document.querySelectorAll('[data-accion="eliminar"]').forEach((btn) => {
      btn.addEventListener('click', () => eliminar(btn.dataset.id, btn.dataset.nroorden));
    });

    form.addEventListener('submit', guardar);

    modalEl.addEventListener('hidden.bs.modal', () => {
      AppValidaciones.limpiarErrores(form);
      form.reset();
      ocultarAlerta();
      form.querySelector('[name="id"]').value = '';
    });

    const inputNumero = form.querySelector('[name="NroOrdenC"]');
    if (inputNumero) inputNumero.addEventListener('blur', () => verificarNumeroUnico(inputNumero));
  });

  function prepararCreacion() {
    const form = document.getElementById('formOrden');
    AppValidaciones.limpiarErrores(form);
    form.reset();
    form.querySelector('[name="id"]').value = '';
    form.querySelector('[name="fechaEmision"]').value = new Date().toISOString().slice(0, 10);
    document.getElementById('tituloModalOrden').textContent = 'Nueva Orden de Compra';
    ocultarAlerta();
    modalInstancia.show();
  }

  function prepararEdicion(datos) {
    const form = document.getElementById('formOrden');
    AppValidaciones.limpiarErrores(form);
    form.reset();

    form.querySelector('[name="id"]').value = datos.id || '';
    form.querySelector('[name="NroOrdenC"]').value = datos.nroorden || '';
    form.querySelector('[name="fechaEmision"]').value = datos.fecha || '';
    form.querySelector('[name="Situacion"]').value = datos.situacion || '';
    form.querySelector('[name="Total"]').value = datos.total !== undefined && datos.total !== null ? datos.total : '';
    form.querySelector('[name="CodLab"]').value = datos.lab || '';
    form.querySelector('[name="NrofacturaProv"]').value = datos.factura || '';

    document.getElementById('tituloModalOrden').textContent = 'Editar Orden de Compra';
    ocultarAlerta();
    modalInstancia.show();
  }

  async function verificarNumeroUnico(input) {
    const numero = input.value.trim().toUpperCase();
    if (!numero) return;

    const idActual = document.getElementById('ordenId').value;

    try {
      const respuesta = await fetch(`${API}?q=${encodeURIComponent(numero)}`, {
        headers: { Accept: 'application/json' },
      });
      if (!respuesta.ok) return;
      const datos = await respuesta.json();
      const duplicada = (datos.datos || []).some(
        (item) => item._id !== idActual && String(item.NroOrdenC).toUpperCase() === numero
      );
      if (duplicada) {
        AppValidaciones.marcarInvalido(input, 'Ya existe una orden con ese numero.');
      } else if (input.classList.contains('is-invalid')) {
        AppValidaciones.marcarValido(input);
      }
    } catch (err) {
      // Silencio: la validacion definitiva la hace el servidor.
    }
  }

  function mostrarAlerta(mensaje) {
    const alerta = document.getElementById('alertaModalOrden');
    if (!alerta) return;
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
  }

  function ocultarAlerta() {
    const alerta = document.getElementById('alertaModalOrden');
    if (!alerta) return;
    alerta.textContent = '';
    alerta.classList.add('d-none');
  }

  async function guardar(evento) {
    evento.preventDefault();

    const form = evento.currentTarget;
    if (!AppValidaciones.validarYMostrar('form-orden-compra', form)) return;

    const id = form.querySelector('[name="id"]').value;
    const esEdicion = Boolean(id);

    const payload = {
      NroOrdenC: form.querySelector('[name="NroOrdenC"]').value.trim(),
      fechaEmision: form.querySelector('[name="fechaEmision"]').value,
      Situacion: form.querySelector('[name="Situacion"]').value,
      Total: Number(form.querySelector('[name="Total"]').value),
      CodLab: form.querySelector('[name="CodLab"]').value,
      NrofacturaProv: form.querySelector('[name="NrofacturaProv"]').value.trim(),
    };

    const boton = document.getElementById('btnGuardarOrden');
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
        mostrarAlerta(datos.mensaje || 'No se pudo guardar la orden de compra.');
        return;
      }

      window.location.reload();
    } catch (err) {
      mostrarAlerta('No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      boton.disabled = false;
    }
  }

  async function eliminar(id, numero) {
    const confirmacion = window.confirm(
      `¿Seguro que deseas eliminar la orden de compra "${numero}"?\nEsta accion no se puede deshacer.`
    );
    if (!confirmacion) return;

    try {
      const respuesta = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      const datos = await respuesta.json().catch(() => ({ ok: false }));

      if (!respuesta.ok) {
        window.alert(datos.mensaje || 'No se pudo eliminar la orden de compra.');
        return;
      }
      window.location.reload();
    } catch (err) {
      window.alert('No se pudo conectar con el servidor.');
    }
  }
})();
