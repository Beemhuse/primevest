
document.addEventListener("DOMContentLoaded", () => {

  loadPartial("header.html", "header", () => {
    updatePage();    
    initCopyButton();  
  });

  loadPartial("footer.html", "footer");
});

function loadPartial(file, containerId, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(file, { cache: "no-store" })
    .then((res) => res.text())
    .then((html) => {
      container.innerHTML = html;
      requestAnimationFrame(() => {
        if (typeof callback === "function") callback();
      });
    })
    .catch((err) => console.error(`Error loading ${file}:`, err));
}

async function updatePage() {
  const investmentBalance = document.getElementById("investment");
  const welfareBalance = document.getElementById("welfare");
  const greetingEl = document.getElementById("greeting-text");
  const usernameEl = document.getElementById("username");
  const avatarEl = document.querySelector(".header-avatar");

  try {
    const res = await fetch(
      "https://prime-invest-server.onrender.com/api/users/me?_=" + Date.now(),
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
      const user = data.data;
      const referralCode = user.referralCode;
     if (document.getElementById("referralLink")){
        document.getElementById("referralLink").value = `https://primeevest.com/index.html?ref=${referralCode}`;
     }

      const hour = new Date().getHours();
      let greeting = "Hello";
      if (hour < 12) greeting = "Good Morning";
      else if (hour < 18) greeting = "Good Afternoon";
      else greeting = "Good Evening";

      if (greetingEl) greetingEl.textContent = greeting + ",";

      if (usernameEl) {
        let name = user.username || "User";
        usernameEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      }
      if (avatarEl) {
        const initials = (user.username || "U")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        avatarEl.textContent = initials;
      }
    
      // Balances
      if (investmentBalance) {
        investmentBalance.textContent =
          user.investmentBalance?.toFixed(2) || "0.00";
      }
      if (welfareBalance) {
        welfareBalance.textContent =
          user.welfareBalance?.toFixed(2) || "0.00";
      }
    } else {
      alert(data.message || "Session expired. Please login again.");
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    alert("Error fetching user info. Please login again.");
    window.location.href = "login.html";
  }
}

function initCopyButton() {
  const copyBtn = document.getElementById("copyBtn");
  const referralLink = document.getElementById("referralLink");
  const toast = document.getElementById("toast");

  if (!copyBtn || !referralLink || !toast) return;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(referralLink.value);

      toast.classList.remove("opacity-0");
      toast.classList.add("opacity-100");

      setTimeout(() => {
        toast.classList.remove("opacity-100");
        toast.classList.add("opacity-0");
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Unable to copy. Please copy manually.");
    }
  });
}

