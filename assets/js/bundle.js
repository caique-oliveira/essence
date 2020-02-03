(() => {
    const selector = selector => document.querySelector(selector)
    const create = element => document.createElement(element)
  
    const app = selector('#app');
  
    const Login = create('div');
    Login.classList.add('login');
  
    const Logo = create('img');
    Logo.src = './assets/images/logo.svg';
    Logo.classList.add('logo');
  
    const Form = create('form');
  
    Form.onsubmit = async e => {
      e.preventDefault();
      const [email, password] = event.target;
      const { url, token } = await fakeAuthenticate(email.value, password.value);
      const dateSession = new Date().getTime()
     
      localStorage.setItem('user', JSON.stringify({ token, sessionExpire: dateSession }))
  
      location.href = '#users';
  
      const users = await getDevelopersList(url);
      console.log(users)
      renderPageUsers(users);
    };
  
    Form.oninput = e => {
      const [email, password, button] = e.target.parentElement.children;
      (!email.validity.valid || !email.value || password.value.length <= 5)
        ? button.setAttribute('disabled', 'disabled')
        : button.removeAttribute('disabled');
    };
  
    Form.innerHTML = '<div class=" flex-container">' + '<input id="email" name="email" type="email" placeholder="Entre com seu e-mail"/>' + '<input id="password" name="password" type="password" placeholder="Digite sua senha supersecreta"/>' + '<input id="login" type="submit" name="Entrar" value="Entrar" action="getDevelopersList()"/>' + '</div>'
  
    app.appendChild(Logo);
    Login.appendChild(Form);
  
    async function fakeAuthenticate(email, password) {
      return new Promise((resolve, reject) => {
        fetch("http://www.mocky.io/v2/5dba690e3000008c00028eb6")
          .then(response => response.json())
          .then(data => {
            const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${(new Date()).getTime() + 300000}`;
            resolve({ token: fakeJwtToken, url: data.url })
          })
      })
    }
  
    async function getDevelopersList(url) {
      return new Promise((resolve, reject) => {
        fetch(url)
          .then(response => response.json())
          .then(data => {
            resolve(data)
          })
      })
  
    }
  
    function renderPageUsers(users) {
      app.classList.add('logged');
      Login.style.display = 'none';
  
      const Ul = create('ul');
      Ul.classList.add('container-users')
      let usersHtml = "";
  
      for (user of users) {
        usersHtml += "<li>" + "<img src=" + user.avatar_url + ">" + " " + user.login + "</li>"
  
      }
      Ul.innerHTML = usersHtml
      app.appendChild(Ul)
    }
  
    function secondsOfDate(date) {
      let startTime = new Date(date);
      let endTime = new Date()
      let diff = Math.abs(new Date(startTime) - new Date(endTime));
      return Math.floor((diff/1000)/60)
    }
  
    // init
    (async function () {
      const minutesToExpire = 5
      let user = localStorage.getItem('user')
  
      if (user) { user = JSON.parse(user) }

      const token = user && user.token ? user.token.split('.') : null
      if (!token || !token[2] || !user.sessionExpire ||
        secondsOfDate(user.sessionExpire) >= minutesToExpire) {
        localStorage.removeItem('user');
        location.href = '#login';
        app.appendChild(Login);
      } else {
        location.href = '#users';
        const users = await getDevelopersList(atob(token[1]));
        renderPageUsers(users);
      }
    })()
  })()
  