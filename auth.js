function signUp() {
  const form = document.getElementById("signup-form");

  if (form != null) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const firstName = document.getElementById("fname").value;
      const lastName = document.getElementById("lname").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const data = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
      };

      fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);

          if (data.error) {
            return alert(data.error);
          }

          alert("Signup successful!");

          location.href = "/login/login.html";
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Signup failed. Please try again.");
        });
    });
  }
}

const saveUserData = (data) => {
    localStorage.setItem("user", JSON.stringify(data))
}

function login() {
  const form = document.getElementById("login-form");

  if (form != null) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const data = {
        email: email,
        password: password,
      };

      fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);

          if (data.error) {
            return alert(data.error);
          }

          saveUserData(data)

          alert("login successful!");

          location.href = "/places.html";
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("login failed. Please try again.");
        });
    });
  }
}

signUp();
login();
