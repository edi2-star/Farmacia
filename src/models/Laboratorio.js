const mongoose = require('mongoose');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const laboratorioSchema = new mongoose.Schema(
  {
    CodLab: {
      type: String,
      required: [true, 'El codigo de laboratorio es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'El codigo no puede superar los 20 caracteres'],
    },
    razonSocial: {
      type: String,
      required: [true, 'La razon social es obligatoria'],
      trim: true,
      maxlength: [120, 'La razon social no puede superar los 120 caracteres'],
    },
    direccion: {
      type: String,
      required: [true, 'La direccion es obligatoria'],
      trim: true,
      maxlength: [160, 'La direccion no puede superar los 160 caracteres'],
    },
    telefono: {
      type: String,
      required: [true, 'El telefono es obligatorio'],
      trim: true,
      match: [/^[0-9+\s()-]{6,20}$/, 'El telefono solo puede contener digitos, espacios, +, - o parentesis'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      trim: true,
      lowercase: true,
      match: [REGEX_EMAIL, 'El email no tiene un formato valido'],
    },
    contacto: {
      type: String,
      required: [true, 'El contacto es obligatorio'],
      trim: true,
      maxlength: [80, 'El contacto no puede superar los 80 caracteres'],
    },
  },
  { timestamps: true }
);

laboratorioSchema.index({ razonSocial: 'text' });

module.exports = mongoose.model('Laboratorio', laboratorioSchema);
