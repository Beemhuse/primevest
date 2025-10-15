document
  .getElementById("withdrawForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const wallet = document.querySelector("#withdrawForm select").value.trim();
    const amountInput = document.querySelector(
      "#withdrawForm input[type='number']"
    );
    const amount = parseFloat(amountInput.value.trim());

    const amountError = document.getElementById("amountError");
    const withdrawBtn = document.getElementById("withdrawBtn");

    amountError.classList.add("hidden");

    let hasError = false;

    if (!amount || amount <= 0) {
      amountError.classList.remove("hidden");
      hasError = true;
    }

    if (hasError) return;

    withdrawBtn.disabled = true;
    withdrawBtn.innerHTML = "Processing...";

    try {
      const res = await fetch(
        "https://api.primeevest.com/api/withdrawals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            amount: amount,
            balanceType: wallet,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Withdrawal request submitted successfully!");
        document.getElementById("withdrawForm").reset();
      } else {
        alert(data.message || "Failed to process withdrawal.");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      alert("Something went wrong. Please try again later.");
    } finally {
      withdrawBtn.disabled = false;
      withdrawBtn.innerHTML = `<span>Proceed</span><i class="fas fa-arrow-right ml-2"></i>`;
    }
  });
  document.addEventListener("DOMContentLoaded",()=>{initLogoutButton()});

  // logout
  function initLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return; 

  logoutBtn.addEventListener("click", async () => {
    const originalHTML = logoutBtn.innerHTML;

    logoutBtn.disabled = true;
    logoutBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Logging out...`;

    try {
      const res = await fetch("https://api.primeevest.com/api/auth/logout", {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert('logged out successfully')
        // Clear storage
        localStorage.clear();
        sessionStorage.clear();

    
        setTimeout(() => {
          window.location.href = "./login.html";
        }, 1500);
      } else {
        logoutBtn.disabled = false;
        alert(data.message)
        logoutBtn.innerHTML = originalHTML;
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert(err|| data.message)
      logoutBtn.disabled = false;
      logoutBtn.innerHTML = originalHTML;
    }
  });
}