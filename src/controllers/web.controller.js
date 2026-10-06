/** GET /menu - menu principal posterior al login. */
function mostrarMenu(req, res) {
  res.render('menu', {
    titulo: 'Menu principal',
    mostrarBuscador: false,
  });
}

/** GET / - raiz. */
function raiz(req, res) {
  if (req.usuario) return res.redirect('/menu');
  return res.redirect('/login');
}

module.exports = { mostrarMenu, raiz };
