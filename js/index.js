// TODO
// 1) get userlist GET /users
// 2) Display them as list with possibility to edit.
// 3) When editining is finished update user on the server(call PUT method)
//  PUT/user/${id}
// 4) Add possibility to delete user DELETE /user/${id}
// 5) Show spinner on every request call
init();

async function init() {
  const usersArr = await getUsers();
  // try {
  //   const usersArr = await getUsers().then(usersArr => usersArr);
  // } catch(err) {
  //   console.log(err);
  // }
  console.log('🚀 ~ file: index.js ~ line 12 ~ usersArr', usersArr);
  const fragment = createUserList(usersArr);
  document.body.append(fragment);

  document.addEventListener('click', handleEvents(event, usersArr));
}

async function getUsers() {
  const responce = await fetch('https://jsonplaceholder.typicode.com/users');
  const users = await responce.json();
  return users;
}

function createUserList(usersArr) {
  if (usersArr.length) {
    const fragment = document.createDocumentFragment();
    const ul = document.createElement('ul');
    ul.classList.add('user-list');

    for (let user of usersArr) {
      const li = document.createElement('li');
      li.classList.add(`user-item-${user.id}`);
      li.dataset.userId = user.id;

      const div = document.createElement('div');
      div.classList.add(`user-info-${user.id}`);

      const btnDelete = document.createElement('button');
      btnDelete.classList.add('btn-delete');
      btnDelete.append('❌ Delete');
      btnDelete.dataset.action = 'delete';
      div.append(btnDelete);

      const btnEdit = document.createElement('button');
      btnEdit.classList.add('btn-edit');
      btnEdit.dataset.action = 'edit';
      btnEdit.dataset.userId = user.id;
      btnEdit.append('📋 Edit');
      div.append(btnEdit);
      div.append(user.name);

      li.append(div);

      const inlineForm = createInlineForm(user.id, user.name);
      li.append(inlineForm);

      ul.append(li);
    }

    fragment.append(ul);
    return fragment;
  }
  return;
}

function createInlineForm(userId, userName) {
  const div = document.createElement('form');
  div.classList.add(`user-form-${userId}`);
  div.hidden = true;

  const input = document.createElement('input');
  input.name = `user-name-${userId}`;
  input.type = 'text';
  input.defaultValue = userName;
  //input.value = userName;

  const btnSubmit = document.createElement('button');
  btnSubmit.append('Update');
  btnSubmit.dataset.action = 'update';
  btnSubmit.classList.add('update-user');

  const btnCancel = document.createElement('button');
  btnCancel.type = 'reset';
  btnCancel.append('Cancel');
  btnCancel.classList.add('cancel');

  div.append(input);
  div.append(btnSubmit);
  div.append(btnCancel);

  return div;
}

function editUser(userId) {
  const userInfo = document.querySelector(`.user-info-${userId}`);
  const form = document.querySelector(`.user-form-${userId}`);
  userInfo.hidden = true;
  form.hidden = false;
  console.log(this);
}

function handleEvents(event, usersArr) {
  if (event.target.type === 'reset') {
    return;
  }

  event.preventDefault();

  const target = event.target;
  const userId = target.dataset.userId;
  const action = target.dataset.action;
  if (action === 'edit') {
    editUser(userId);
    return;
  }

  if (action === 'update') {
    const userId = target.closest('[data-user-id]').dataset.userId;
    const userName = document.querySelector(`input[name="user-name-${userId}"]`);
    const user = usersArr.find((obj) => obj.id === userId);
    user.name = userName.value;

    //console.warn(user);

    try {
      showSpinner();
      updateUser(user);
      //console.log(`User updated`, a);
    } catch (err) {
      hideSpinner();
      throw new Error(`Something failed`);
    } finally {
      hideSpinner();
    }
  }

  if (action === 'delete') {
    let a = removeUser(userId);
    console.log('🚀 ~ file: index.js ~ line 89 ~ handleEvents ~ a', a);
    return;
  }

  const userInfo = target.closest('.user-info');
  console.log(action, userInfo, target.closest('.user-info'));
}

function showSpinner() {
  if (!document.querySelector('#spinner')) {
    const spinner = document.createElement('div');
    spinner.id = 'spinner';
    spinner.style.position = 'absolute';
    spinner.style.top = '50vh';
    spinner.style.left = '50vw';
    spinner.style.fontSize = '50px';
    //spinner.style.transform = `rotate(25deg)`;
    //spinner.style.animation = `5s linear 1s infinite alternate slidein`;
    spinner.append('↻');
    spinnerAnimation(spinner);
    document.body.append(spinner);
  }
}
function hideSpinner() {
  const spinner = document.querySelector('#spinner');
  spinnerAnimation(spinner, true);
  spinner.hidden = true;
  console.log('Spinner - hidden');
}

function spinnerAnimation(spinner, stop = false) {
  const keyframes = new KeyframeEffect(
    spinner,
    [{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }],
    { duration: 2000, iterations: Infinity }
  );
  const spinnerAnimation = new Animation(keyframes, document.timeline);
  if (!stop) {
    spinnerAnimation.play();
    console.log('Spinner - start animation');
  } else {
    console.log('Spinner - stop animation');
    //spinnerAnimation.cancel(); // dont work
    spinnerAnimation.pause();
  }
}

async function updateUser(user) {
  //console.warn(user);
  const responce = await fetch('https://jsonplaceholder.typicode.com/users/' + user.id, {
    method: 'PUT',
    body: JSON.stringify(user),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  });
  //console.log('1',responce.json());
  // let a = await responce.json();
  // console.log('2', a);

  return responce.ok;
}

async function removeUser(id) {
  const responce = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    method: 'DELETE'
  });
  return responce.json();
}
