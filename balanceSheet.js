document.addEventListener("DOMContentLoaded", () => {
  fetch("stock_data/balance_sheet/1101 台泥/2013_1.json")
    .then((response) => response.json())
    .then((balanceSheetData) => {
      const tableBody = document.querySelector("#balanceSheetTable tbody");
      const data = balanceSheetData.data;
      const fields = balanceSheetData.field;

      fields.forEach((field) => {
        const value = data[field] !== null ? data[field] : "N/A";
        const row = document.createElement("tr");

        const cell1 = document.createElement("td");
        cell1.textContent = field;
        row.appendChild(cell1);

        const cell2 = document.createElement("td");
        cell2.textContent = value;
        row.appendChild(cell2);

        tableBody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error fetching balance sheet data:", error);
    });
});
