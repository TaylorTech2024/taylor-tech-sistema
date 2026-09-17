if (localStorage.getItem('tt_token')) {
  window.location.href = '/admin.html';
}

const form = document.getElementById('formLogin');
const btnEntrar = document.getElementById('btnEntrar');
const erroBox = document.getElementById('erroLogin');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  erroBox.style.display = 'none';

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  btnEntrar.disabled = true;
  btnEntrar.innerHTML = '<span class="spinner"></span> Entrando...';

  try {
    const resultado = await api.auth.login(email, senha);
    localStorage.setItem('tt_token', resultado.token);
    localStorage.setItem('tt_usuario', JSON.stringify(resultado.usuario));
    window.location.href = '/admin.html';
  } catch (err) {
    erroBox.textContent = err.message;
    erroBox.style.display = 'block';
    btnEntrar.disabled = false;
    btnEntrar.innerHTML = 'Entrar';
  }
});
