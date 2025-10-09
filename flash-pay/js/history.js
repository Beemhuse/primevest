fetch("header.html")
  .then((res) => res.text())
  .then((data) => (document.getElementById("header").innerHTML = data));

fetch("footer.html")
  .then((r) => r.text())
  .then((html) => (document.getElementById("footer").innerHTML = html));

const container = document.getElementById("withdrawals");
const counts = { pending: 0, success: 0, failed: 0 };

async function loadWithdrawals() {
  try {
    const res = await fetch(
      "https://prime-invest-server.onrender.com/api/withdrawals",
      {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      container.innerHTML =
        "<p class='text-center text-gray-500'>No withdrawals found</p>";
      return;
    }

    const {
      withdrawals,
      pendingWithdrawals,
      successfulWithdrawals,
      failedWithdrawals,
    } = data.data;

    // update counts
    document.getElementById("pendingCount").textContent =
      pendingWithdrawals || 0;
    document.getElementById("completedCount").textContent =
      successfulWithdrawals || 0;
    document.getElementById("failedCount").textContent = failedWithdrawals || 0;

    container.innerHTML = ""; // clear previous

    withdrawals.forEach((item) => {
      let statusClass = "";
      let borderColor = "";
      if (item.status === "pending") {
        statusClass = "status-pending";
        borderColor = "border-yellow-400";
      } else if (item.status === "successful") {
        statusClass = "status-success";
        borderColor = "border-green-400";
      } else {
        statusClass = "status-failed";
        borderColor = "border-red-400";
      }

      const card = document.createElement("div");
      card.className = `withdrawal-card bg-white rounded-lg p-4 flex items-center justify-between ${borderColor}`;
      card.innerHTML = `
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
            <i class="fas fa-university text-blue-500"></i>
          </div>
          <div>
            <p class="font-semibold capitalize">${item.balanceType} Wallet</p>
            <p class="text-sm text-gray-500">${new Date(
              item.withdrawnAt
            ).toLocaleString()}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="font-bold text-lg">₦${item.amount.toLocaleString()}</p>
          <span class="status-badge ${statusClass}">${item.status}</span>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching withdrawals:", err);
    container.innerHTML =
      "<p class='text-center text-red-500'>Error loading withdrawals</p>";
  }
}

loadWithdrawals();
