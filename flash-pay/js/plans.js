document.addEventListener("DOMContentLoaded", () => {
  fetchUserPlans();
  initLogoutButton();
});

async function fetchUserPlans() {
  const container = document.getElementById("plans-container");
  const emptyState = document.getElementById("empty-state");

  try {
    const res = await fetch(
      "https://prime-invest-server.onrender.com/api/plans/user?_=" + Date.now(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", 
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      const plans = data.data;

      if (plans.length === 0) {
        emptyState.classList.remove("hidden");
        container.innerHTML = "";
        return;
      }
      plans.forEach((p) => {
        const card = document.createElement("div");
        card.className =
          "bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between";

        card.innerHTML = `
          <h2 class="text-lg font-semibold text-gray-800 mb-2">${p.plan.title}</h2>
          <p class="text-gray-600 text-sm mb-1">${p.plan.description || ""}</p>
          <div class="mt-4 space-y-1">
            <p class="text-sm"><span class="font-medium">Amount:</span> ₦${p.amount.toLocaleString()}</p>
            <p class="text-sm"><span class="font-medium">Daily Income:</span> ₦${p.dailyIncome.toLocaleString()}</p>
            <p class="text-sm"><span class="font-medium">Total Income:</span> ₦${p.totalIncome.toLocaleString()}</p>
            <p class="text-sm"><span class="font-medium">Duration:</span> ${p.plan.durationDays} days</p>
            <p class="text-sm"><span class="font-medium">Start Date:</span> ${new Date(p.startDate).toLocaleDateString()}</p>
            <p class="text-sm"><span class="font-medium">End Date:</span> ${new Date(p.endDate).toLocaleDateString()}</p>
            <p class="text-sm"><span class="font-medium">Status:</span> 
              <span class="px-2 py-1 rounded-full text-white text-xs"
                style="background: ${p.status === "active" ? "#0d9488" : "#6b7280"};">
                ${p.status}
              </span>
            </p>
          </div>
          <div class="mt-4">

          </div>
        `;

        container.appendChild(card);
      });
    } else {
      emptyState.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Error fetching plans:", err);
    emptyState.classList.remove("hidden");
  }
}
function initLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return; 

  logoutBtn.addEventListener("click", async () => {
    const originalHTML = logoutBtn.innerHTML;

    logoutBtn.disabled = true;
    logoutBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Logging out...`;

    try {
      const res = await fetch("https://prime-invest-server.onrender.com/api/auth/logout", {
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