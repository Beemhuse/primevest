window.addEventListener("DOMContentLoaded", async () => {
const userAccountName = document.getElementById('useraccountName')
const userAccountNumber = document.getElementById("useraccountNumber")
const userBankName = document.getElementById('userbankName')

if(userAccountName && userAccountNumber && userBankName){
  try{
    const response = await fetch("https://prime-invest-server.onrender.com/api/users/bank-details",{
      method:"GET",
      headers:{"content-type":"application/json"},
      credentials:"include"
    })

    data = await response.json();

    if (response.ok && data.success){
      const detail = data.data;
      userAccountName.textContent = detail.accountName;
      userAccountNumber.textContent = detail.accountNumber;
      userBankName.textContent = detail.bankName
      if(detail.bankName === undefined){
        document.getElementById("bankDetailsDiv").classList.add("hidden")
      }
    }else{
      document.getElementById("bankDetails").classList.remove("hidden")
      
    }
  }catch (error) {
    console.error("Error fetching user:", error);
  };}
  document.getElementById('editDetailsBtn').addEventListener("click",()=>{
    document.getElementById("bankDetails").classList.remove("hidden");
  });

  document
    .getElementById("bankDetailsForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const bankName = document.getElementById("bankName").value.trim();
      const accountNumber = document
        .getElementById("accountNumber")
        .value.trim();
      const accountName = document.getElementById("accountName").value.trim();

      let hasError = false;
      if (!bankName || !accountName || !accountNumber) {
        document.getElementById("bankPageError").classList.remove("hidden");
        hasError = true;
      } else {
        document.getElementById("bankPageError").classList.add("hidden");
      }

      if (hasError) return;

      try {
        const response = await fetch(
          "https://prime-invest-server.onrender.com/api/users/bank",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              bankName,
              accountNumber,
              accountName,
            }),
          }
        );

        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("Invalid JSON response from server");
        }

        if (response.ok && data.success) {
          alert("Bank details submitted successfully ✅");
          document.getElementById("bankDetailsForm").reset(); 
          document.getElementById("bankDetails").classList.add("hidden");
        } else {
          alert(data.message || "An error occurred ❌");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again later.");
      }
    });
});
