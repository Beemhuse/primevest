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

const API_BASE_URL = "https://prime-invest-server.onrender.com/api";
const depositContainer = document.getElementById("depositHistoryContainer");

// === FETCH AND DISPLAY USER DEPOSITS ===
async function getUserDeposits() {
  depositContainer.innerHTML = `
    <p class="text-gray-500 text-center py-6">Loading deposits...</p>
  `;

  try {
    const response = await fetch(`${API_BASE_URL}/deposits`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await response.json();

    // If request failed or malformed
    if (!data.success || !Array.isArray(data.data)) {
      depositContainer.innerHTML = `
        <p class="text-gray-500 text-center py-6">No deposit records found.</p>
      `;
      return;
    }

    // Empty state
    if (data.data.length === 0) {
      depositContainer.innerHTML = `
        <p class="text-gray-500 text-center py-6">You have not made any deposits yet.</p>
      `;
      return;
    }

    // Clear container
    depositContainer.innerHTML = "";

    // Loop through each deposit
    data.data.forEach((deposit) => {
      const card = document.createElement("div");
      card.className =
        "w-full flex flex-col border-b border-gray-300 p-4 hover:bg-gray-50 transition-all duration-300 rounded-md";

      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p class="text-gray-800 font-medium">${deposit.senderName || "Unknown Sender"}</p>
          </div>

          <p class="text-gray-700 font-semibold">₦${deposit.amount?.toLocaleString() || 0}</p>

          <p class="text-gray-600 capitalize">${deposit.balanceType || "main"}</p>

          <span class="px-2 py-1 text-xs rounded-full w-fit inline-flex justify-center ${
            deposit.status === "successful"
              ? "bg-green-100 text-green-700"
              : deposit.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }">${deposit.status}</span>
        </div>

        <div class="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
          <p>Funded on: ${formatDate(deposit.fundedAt)}</p>
          ${
            deposit.proofOfPayment?.asset?.url
              ? `<a href="${deposit.proofOfPayment.asset.url}" target="_blank" class="text-blue-600 hover:underline mt-1 sm:mt-0">View Proof</a>`
              : ""
          }
        </div>

        <div class="mt-1 text-xs text-gray-400">
          Deposit ID: ${deposit._id}
        </div>
      `;

      depositContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    depositContainer.innerHTML = `
      <p class="text-red-500 text-center py-6">Failed to load deposits. Please try again.</p>
    `;
  }
}

// === HELPER: FORMAT DATE ===
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// === INITIAL LOAD ===
getUserDeposits();


loadWithdrawals();
