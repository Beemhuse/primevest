

document.addEventListener("DOMContentLoaded", () => {
  loadPartial("header.html", "header", () => {
    updatePage();
    initCopyButton();
  });

  // Load footer and initialize logout after it's ready
  loadPartial("footer.html", "footer", () => {
    initLogoutButton();
  });
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
        }, 100);
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


async function updatePage() {
  const investmentBalance = document.getElementById("investment");
  const welfareBalance = document.getElementById("welfare");
  const greetingEl = document.getElementById("greeting-text");
  const usernameEl = document.getElementById("username");
  const avatarEl = document.querySelector(".header-avatar");
  const investmentRechargeBalance = document.getElementById("investmentRechargeBalance");
  const welfareRechargeBalance = document.getElementById("welfareRechargeBalance");

  try {
    const res = await fetch(
      "https://prime-invest-server.onrender.com/api/users/me" ,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await res.json();

    if (res.ok && data.success) {
      const user = data.data;
      // console.log(user)
      if(welfareBalance && investmentBalance && welfareRechargeBalance && investmentRechargeBalance){
      welfareBalance.classList.remove("shimmer")
      welfareRechargeBalance.classList.remove("shimmer")
      investmentRechargeBalance.classList.remove("shimmer")
      investmentBalance.classList.remove("shimmer")}
      const referralCode = user.referralCode;
     if (document.getElementById("referralLink")){
        document.getElementById("referralLink").value = `https://primevest-sepia.vercel.app?ref=${referralCode}`;
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
     if (investmentRechargeBalance) {
  investmentRechargeBalance.textContent = `₦${(user.investmentRechargeBalance || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

if (welfareRechargeBalance) {
  welfareRechargeBalance.textContent = `₦${(user.welfareRechargeBalance || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

} 
if (welfareBalance) {
  welfareBalance.textContent = `₦${(user.welfareBalance || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  
}
if (investmentBalance) {
  investmentBalance.textContent = `₦${(user.investmentBalance || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  
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

