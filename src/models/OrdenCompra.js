const mongoose = require('mongoose');

const ordenCompraSchema = new mongoose.Schema(
  {
    NroOrdenC: {
      type: String,
      required: [true, 'El numero de orden de compra es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [30, 'El numero de orden no puede superar los 30 caracteres'],
    },
    fechaEmision: {
      type: Date,
      required: [true, 'La fecha de emision es obligatoria'],
    },
    Situacion: {
      type: String,
      required: [true, 'La situacion es obligatoria'],
      trim: true,
      maxlength: [40, 'La situacion no puede superar los 40 caracteres'],
    },
    Total: {
      type: Number,
      required: [true, 'El total es obligatorio'],
      min: [0, 'El total no puede ser negativo'],
    },
    CodLab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratorio',
      required: [true, 'El laboratorio es obligatorio'],
    },
    NrofacturaProv: {
      type: String,
      required: [true, 'El numero de factura del proveedor es obligatorio'],
      trim: true,
      maxlength: [40, 'El numero de factura no puede superar los 40 caracteres'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrdenCompra', ordenCompraSchema);
