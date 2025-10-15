const urlParams = new URLSearchParams(window.location.search);
const refCode = urlParams.get('ref')
if(refCode){
  localStorage.setItem("referralCode",refCode)
};


document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    document.getElementById("usernameError").classList.add("hidden");
    document.getElementById("phoneError").classList.add("hidden");
    document.getElementById("passwordError").classList.add("hidden");
    const username = document.getElementById("username").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const button = document.getElementById('signUpBtn')
    const referralCode = localStorage.getItem("referralCode");

    let hasError = false;
    if (!username) {
      document.getElementById("usernameError").classList.remove("hidden");
      hasError = true;
    }else{
      document.getElementById("usernameError").classList.add('hidden')
    }

    if (!phone) {
      document.getElementById("phoneError").classList.remove("hidden");
      hasError = true;
    }else{
      document.getElementById("phoneError").classList.add('hidden')
    }

    if (!password) {
      document.getElementById("passwordError").classList.remove("hidden");
      hasError = true;
    }else{
      document.getElementById("passwordError").classList.add('hidden')
    }

    if (hasError) return;

    button.disabled = true;
    button.textContent = "signing in..."

    const apiEndpoint =
      "https://api.primeevest.com/auth/signup";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: username,
          phoneNumber: phone,
          password: password,
          referralCode: referralCode,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        document.getElementById("signupForm").reset();
         toast.textContent = "Signed in successfully";
         toast.style.background = "linear-gradient(135deg, #4CAF50, #2e7d32)";
        toast.classList.add("show");
           setTimeout(() => {
          toast.classList.remove("show");
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 100);
        }, 2000);
        button.textContent = "Sign Up"
        button.disabled = false;
        localStorage.removeItem("referralCode");
      } else {
        button.textContent = "Sign Up"
        const toast = document.getElementById("toast");
        button.disabled = false;
        toast.textContent = data.message || "An error occurred during log-in.";
        toast.style.background = "linear-gradient(135deg, #e53935, #b71c1c)";
        toast.classList.add("show");
        setTimeout(() => {
          toast.classList.remove("show");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      const toast = document.getElementById("toast");
      toast.textContent = "Something went wrong!";
      toast.style.background = "linear-gradient(135deg, #e53935, #b71c1c)";
      toast.classList.add("show");
      button.disabled = false;
      button.textContent = "Sign Up"

      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    }
  });
document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
