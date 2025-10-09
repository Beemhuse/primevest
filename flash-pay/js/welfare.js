document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("welfareplanscontainer");
  if (!container) {
    console.error("Container with id 'welfareplanscontainer' not found.");
    return;
  }

  function showToast(message, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className =
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg text-white shadow-lg z-50 transition-opacity duration-500 opacity-0";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.backgroundColor =
      type === "success" ? "#16a34a" : "#dc2626"; 
    toast.classList.remove("opacity-0");
    toast.classList.add("opacity-100");

    setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
    }, 2500);
  }

  async function loadWelfarePlans() {
    try {
      const res = await fetch(
        "https://prime-invest-server.onrender.com/api/plans?planType=welfare&status=active&sortBy=oldest",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        container.innerHTML =
          "<p class='text-red-500 text-center mt-6'>Failed to load plans.</p>";
        console.error("Failed to fetch plans:", data.message);
        return;
      }

      const plans = data.data;
      if (!plans.length) {
        container.innerHTML =
          "<p class='text-gray-500 text-center mt-6'>No active welfare plans available.</p>";
        return;
      }
      container.innerHTML = "";
      plans.forEach((plan) => {
        const card = document.createElement("div");
        card.className = "welfare-card transition-transform hover:scale-[1.02] duration-200";

        card.innerHTML = `
          <div class="welfare-header">
            <h3 class="text-xl font-bold">${plan.title}</h3>
            <p class="text-sm opacity-90">${plan.description || "Perfect plan for you"}</p>
          </div>

          <div class="p-6 flex-grow">
            <div class="text-center mb-6">
              <span class="welfare-price text-2xl font-bold">₦${Number(plan.price).toLocaleString()}</span>
              <p class="text-gray-500 text-sm">One-time investment</p>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Daily Income:</span>
                <span class="font-semibold">₦${Number(plan.dailyIncome).toLocaleString()}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Duration:</span>
                <span class="font-semibold">${plan.durationDays} days</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Total Returns:</span>
                <span class="font-semibold text-teal-600">₦${Number(plan.totalIncome).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100">
            <button
              class="btn-primary w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center invest-btn bg-teal-600 hover:bg-teal-700 transition-colors"
              data-planid="${plan._id}"
            >
              <span>Invest Now</span>
              <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        `;

        container.appendChild(card);
      });

      attachInvestHandlers();
    } catch (err) {
      console.error("Error loading welfare plans:", err);
      container.innerHTML =
        "<p class='text-red-500 text-center mt-6'>Error loading welfare plans.</p>";
    }
  }

  function attachInvestHandlers() {
    const investButtons = document.querySelectorAll(".invest-btn");
    investButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const planId = btn.getAttribute("data-planid");
        if (!planId) return showToast("Invalid plan selected", "error");

        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span>Loading...</span><i class="fas fa-spinner fa-spin ml-2"></i>`;

        try {
          const res = await fetch(
            `https://prime-invest-server.onrender.com/api/plans/buy`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
              },
              credentials: "include",
              body: JSON.stringify({ planId }),
            }
          );

          const data = await res.json();

          if (res.ok && data.success) {
            alert(data.message)
            showToast(data.message || "Plan purchased successfully!", "success");
          } else {
            showToast(data.message || "Purchase failed.", "error");
            alert(data.message)
          }
        } catch (error) {
          console.error("Error purchasing plan:", error);
          showToast("Network error. Please try again.", "error");
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
    });
  }
  await loadWelfarePlans();
});

