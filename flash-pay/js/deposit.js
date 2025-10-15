function copyToClipboard(value, field) {
  navigator.clipboard.writeText(value).then(() => {
  
    const copiedMessage = document.getElementById("copiedMessage");
    const copiedText = document.getElementById("copiedText");

    copiedText.textContent = field.charAt(0).toUpperCase() + field.slice(1);

  
    copiedMessage.style.display = "block";
    copiedMessage.style.opacity = "1";

    
    setTimeout(() => {
      copiedMessage.style.opacity = "0";
      setTimeout(() => {
        copiedMessage.style.display = "none";
      }, 500); 
    }, 2000);

   
    const activeButton = event.currentTarget;
    const icon = activeButton.querySelector("i");

    if (icon) {
      icon.classList.remove("fa-copy");
      icon.classList.add("fa-check");
      setTimeout(() => {
        icon.classList.remove("fa-check");
        icon.classList.add("fa-copy");
      }, 1500);
    }
  }).catch(err => {
    console.error("Failed to copy: ", err);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const msg = document.getElementById("copiedMessage");
  msg.style.display = "none";
  msg.style.transition = "opacity 0.5s ease";
});

document.getElementById("depositForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const depositBtn = document.getElementById("depositBtn");
  const originalBtnHTML = depositBtn.innerHTML;
  depositBtn.disabled = true;
  depositBtn.innerHTML = `<span>Preparing upload...</span>
                          <i class="fas fa-spinner fa-spin ml-2"></i>`;

  // Collect form data
  const amount = document.getElementById("amount").value;
  const senderName = document.getElementById("senderName").value;
  const balanceType = document.getElementById("balanceType").value;
  const proofFile = document.getElementById("proofFile").files[0];

  const formData = new FormData();
  formData.append("amount", amount);
  formData.append("senderName", senderName);
  formData.append("balanceType", balanceType);

  try {
    let fileToUpload = proofFile;

    // ✅ Compress image before upload
    if (proofFile) {
      depositBtn.innerHTML = `<span>Compressing image...</span>
                              <i class="fas fa-spinner fa-spin ml-2"></i>`;
      try {
        fileToUpload = await imageCompression(proofFile, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1280,
          useWebWorker: true
        });
      } catch (compressErr) {
        console.warn("⚠️ Compression failed, using original image:", compressErr);
      }
    }

    formData.append("proofOfPayment", fileToUpload);

    // ✅ Use XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.primeevest.com/deposits");
    xhr.withCredentials = true;

    // Progress bar simulation (update button text)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        depositBtn.innerHTML = `<span>Uploading ${percent}%...</span>
                                <i class="fas fa-spinner fa-spin ml-2"></i>`;
      }
    };

    // On upload complete
    xhr.onload = () => {
      depositBtn.disabled = false;
      depositBtn.innerHTML = originalBtnHTML;

      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status = 200 || xhr.status <= 300 ) {
          showToast("✅ Deposit request submitted successfully!", "success");
          document.getElementById("depositForm").reset();
        } else {
          showToast(data.message || "❌ Failed to submit deposit.", "error");
        }
      } catch (parseErr) {
        console.error("Failed to parse response:", parseErr);
        showToast("⚠️ Something went wrong with the response.", "error");
      }
    };

    xhr.onerror = () => {
      depositBtn.disabled = false;
      depositBtn.innerHTML = originalBtnHTML;
      showToast("⚠️ Upload failed. Try again later.", "error");
    };

    // Send data
    xhr.send(formData);
  } catch (err) {
    console.error("Error:", err);
    showToast("⚠️ Something went wrong. Try again later.", "error");
    depositBtn.disabled = false;
    depositBtn.innerHTML = originalBtnHTML;
  }
});

// ✅ Toast function
function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = type === "success"
    ? "linear-gradient(135deg, #4CAF50, #2e7d32)"
    : "linear-gradient(135deg, #e53935, #b71c1c)";

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
function initLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return; 

  logoutBtn.addEventListener("click", async () => {
    const originalHTML = logoutBtn.innerHTML;

    logoutBtn.disabled = true;
    logoutBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Logging out...`;

    try {
      const res = await fetch("https://api.primeevest.com/auth/logout", {
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

initLogoutButton();