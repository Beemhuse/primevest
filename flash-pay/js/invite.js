document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("referralsContainer");

  try {
    const res = await fetch(
      "https://api.primeevest.com/users/referrals",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      const {
        totalReferrals,
        activeReferrals,
        inactiveReferrals,
        referredUsers,
      } = data.data;

      // Clear container
      container.innerHTML = "";

      // 🔹 Summary cards
      const summary = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div class="bg-blue-50 p-4 rounded-xl shadow">
            <p class="text-lg font-semibold text-gray-800">${totalReferrals}</p>
            <p class="text-sm text-gray-500">Total Referrals</p>
          </div>
          <div class="bg-green-50 p-4 rounded-xl shadow">
            <p class="text-lg font-semibold text-gray-800">${activeReferrals}</p>
            <p class="text-sm text-gray-500">Active</p>
          </div>
          <div class="bg-red-50 p-4 rounded-xl shadow">
            <p class="text-lg font-semibold text-gray-800">${inactiveReferrals}</p>
            <p class="text-sm text-gray-500">Inactive</p>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", summary);

      // 🔹 Referred Users Table
      if (referredUsers.length > 0) {
        let table = `
          <div class="overflow-x-auto mt-6">
            <table class="w-full border border-gray-200 rounded-lg overflow-hidden shadow">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Username</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th class="px-4 py-2 text-left text-sm font-semibold text-gray-600">Joined</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
        `;

        referredUsers.forEach((user) => {
          const statusColor =
            user.accountStatus === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700";

          table += `
            <tr>
              <td class="px-4 py-2 text-sm text-gray-800">${user.username}</td>
              <td class="px-4 py-2 text-sm text-gray-600">${
                user.phoneNumber
              }</td>
              <td class="px-4 py-2">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                  ${user.accountStatus}
                </span>
              </td>
              <td class="px-4 py-2 text-sm text-gray-500">
                ${new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          `;
        });

        table += `
              </tbody>
            </table>
          </div>
        `;

        container.insertAdjacentHTML("beforeend", table);
      } else {
        container.insertAdjacentHTML(
          "beforeend",
          `<p class="text-center text-gray-500 mt-6">No referrals yet. Start inviting friends!</p>`
        );
      }
    } else {
      container.innerHTML = `<p class="text-center text-red-500">Failed to load referrals. ${
        data.message || ""
      }</p>`;
    }
  } catch (error) {
    console.error("Error fetching referrals:", error);
    container.innerHTML = `<p class="text-center text-red-500">Error fetching referrals. Try again later.</p>`;
  }
});
