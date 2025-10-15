
window.addEventListener("DOMContentLoaded", async () => {
  initLogoutButton();

  const userAccountName = document.getElementById("useraccountName");
  const userAccountNumber = document.getElementById("useraccountNumber");
  const userBankName = document.getElementById("userbankName");

  // ✅ make this function async
  async function loadBankDetails() {
    if (userAccountName && userAccountNumber && userBankName) {
      try {
        const response = await fetch(
          "https://api.primeevest.com/users/bank-details",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          const detail = data.data;
          userAccountName.textContent = detail.accountName || "";
          userAccountNumber.textContent = detail.accountNumber || "";
          userBankName.textContent = detail.bankName || "";

          if (detail.bankName) {
            document.getElementById("bankDetailsDiv").classList.remove("hidden");
            document.getElementById("bankDetails").classList.add("hidden");
          } else {
            document.getElementById("bankDetailsDiv").classList.add("hidden");
            document.getElementById("bankDetails").classList.remove("hidden");
          }
        } else {
          document.getElementById("bankDetailsDiv").classList.remove("hidden");
          document.getElementById("bankDetails").classList.add("hidden");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
  }

  // ✅ call the function to load data initially
  await loadBankDetails();

  document.getElementById("editDetailsBtn").addEventListener("click", () => {
    document.getElementById("bankDetails").classList.remove("hidden");
  });

  document
    .getElementById("bankDetailsForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const bankName = document.getElementById("bankName").value.trim();
      const accountNumber = document.getElementById("accountNumber").value.trim();
      const accountName = document.getElementById("accountName").value.trim();

      let hasError = false;
      if (!bankName || !accountName || !accountNumber) {
        document.getElementById("bankPageError").classList.remove("hidden");
        hasError = true;
      } else {
        document.getElementById("bankPageError").classList.add("hidden");
      }

      if (hasError) return;

      const sendBtn = document.getElementById("sendBtn");
      sendBtn.textContent = "Submitting...";

      try {
        const response = await fetch(
          "https://api.primeevest.com/users/bank",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              bankName,
              accountNumber,
              accountName,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          await loadBankDetails();
          alert("Bank details submitted successfully ✅");
          document.getElementById("bankDetailsForm").reset();
          document.getElementById("bankDetails").classList.add("hidden");
        } else {
          alert(data.message || "An error occurred ❌");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again later.");
      } finally {
        sendBtn.textContent = "Send";
      }
    });
});

function initLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    const originalHTML = logoutBtn.innerHTML;
    logoutBtn.disabled = true;
    logoutBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Logging out...`;

    try {
      const res = await fetch("https://api.primeevest.com/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        alert("Logged out successfully ✅");
        localStorage.clear();
        sessionStorage.clear();

        setTimeout(() => {
          window.location.href = "./login.html";
        }, 1500);
      } else {
        alert(data.message || "Logout failed");
        logoutBtn.disabled = false;
        logoutBtn.innerHTML = originalHTML;
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Something went wrong during logout ❌");
      logoutBtn.disabled = false;
      logoutBtn.innerHTML = originalHTML;
    }
  });
}
