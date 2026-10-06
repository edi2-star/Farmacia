const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [80, 'El nombre no puede superar los 80 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [REGEX_EMAIL, 'El email no tiene un formato valido'],
    },
    password: {
      type: String,
      required: [true, 'La contrasena es obligatoria'],
      minlength: [6, 'La contrasena debe tener al menos 6 caracteres'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['administrador', 'moderador', 'usuario'],
        message: 'Rol no valido',
      },
      default: 'usuario',
    },
  },
  { timestamps: true }
);

usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

usuarioSchema.methods.compararPassword = function (passwordPlano) {
  return bcrypt.compare(passwordPlano, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
