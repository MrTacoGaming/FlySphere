const auth = firebase.auth();
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const loginSection = document.getElementById('login-section');
const staffContent = document.getElementById('staff-content');

// Check authentication state
auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.style.display = 'none';
    staffContent.style.display = 'block';
    const db = firebase.firestore();

    function loadTables() {
      // Load Schedules
      db.collection('schedules').get().then(querySnapshot => {
        const tbody = document.getElementById('schedules-body');
        tbody.innerHTML = '';
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const row = `<tr>
            <td>${data.staff_id}</td>
            <td>${data.date}</td>
            <td>${data.shift}</td>
            <td>${data.role}</td>
          </tr>`;
          tbody.innerHTML += row;
        });
      });
    
      // Load Events
      db.collection('events').get().then(querySnapshot => {
        const tbody = document.getElementById('events-body');
        tbody.innerHTML = '';
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const row = `<tr>
            <td>${data.title}</td>
            <td>${data.date}</td>
            <td>${data.description}</td>
          </tr>`;
          tbody.innerHTML += row;
        });
      });
    }
    
    // Call loadTables when user is authenticated
    auth.onAuthStateChanged(user => {
      if (user) {
        loginSection.style.display = 'none';
        staffContent.style.display = 'block';
        loadTables();
        // Check if user is admin (see below)
      }
    });
  } else {
    loginSection.style.display = 'block';
    staffContent.style.display = 'none';
  }
});

// Handle login
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .catch(error => {
      errorMessage.textContent = error.message;
    });
});