document.addEventListener("DOMContentLoaded", () => {
  // 新增年&季的選項
  const yearSelect = document.getElementById("BS-year");
  const seasonSelect = document.getElementById("BS-season");

  for (Y = 2013; Y < 2026; Y++) {
    const opt = document.createElement("option");
    opt.textContent = Y;
    yearSelect.appendChild(opt);
  }
  for (S = 1; S < 5; S++) {
    const opt = document.createElement("option");
    opt.textContent = S;
    seasonSelect.appendChild(opt);
  }

  function clearTable() {
    const tableBody = document.querySelector("#balanceSheetTable tbody");
    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }
  }

  function clearTableHead() {
    const tableHead = document.querySelector("#balanceSheetTable thead");
    while (tableHead.firstChild) {
      tableHead.removeChild(tableHead.firstChild);
    }
  }

  function updateTitle(message) {
    const title = document.getElementById("title");
    title.textContent = message;
  }

  function balanceSheet(path) {
    fetch(path)
      .then((response) => {
        if (response["ok"]) {
          return response.json();
        } else {
          updateTitle("查無資料，請重新選擇");
          clearTable(); // 清空表格
          clearTableHead();
        }
      })
      .then((balanceSheetData) => {
        clearTable();
        clearTableHead();
        const tableHead = document.querySelector("#balanceSheetTable thead");

        const headRow = document.createElement("tr");
        const thead1 = document.createElement("th");
        const thead2 = document.createElement("th");

        thead1.textContent = "項目";
        thead2.textContent = "金額";

        headRow.appendChild(thead1);
        headRow.appendChild(thead2);
        tableHead.appendChild(headRow);

        const tableBody = document.querySelector("#balanceSheetTable tbody");
        const data = balanceSheetData.data;
        const fields = balanceSheetData.field;

        fields.forEach((field) => {
          const isFieldEmpty = data[field] == null;
          if (field == "Season") {
            return;
          }
          let value = data[field] !== null ? data[field] : ""; // 找出主要項目

          // 如果 value 是數字，格式化為帶有逗號的形式
          if (!isNaN(value) && value !== "") {
            value = parseFloat(value).toLocaleString();
          }

          const row = document.createElement("tr");

          const cell1 = document.createElement("td");
          const cell2 = document.createElement("td");

          cell1.textContent = field;
          if (isFieldEmpty) {
            cell1.classList.add("bold-text", "align-left");
          } else {
            cell1.classList.add("align-center");
            row.classList.add("hover");
          }
          if (field.includes("合計")) {
            cell1.classList.add("bold-text", "border-top1"); // 如果項目含有"合計", 粗體&上面加一條線
            cell2.classList.add("bold-text", "border-top1");
          }
          if (field.includes("總額")) {
            cell1.classList.add("bold-text", "border-top2"); // 如果項目含有"總額", 粗體&上面加兩條線
            cell2.classList.add("bold-text", "border-top2");
          }

          cell2.textContent = value;
          cell2.classList.add("align-right");

          row.appendChild(cell1);
          row.appendChild(cell2);

          tableBody.appendChild(row);
        });
      })
      .catch((error) => {
        console.error("Error fetching balance sheet data:", error);
      });
  }

  function updateBalanceSheet() {
    const inputNumorName = inputValue.value;
    let stockNum = "";
    let stockName = "";

    for (let i = 0; i < stockList.length; i++) {
      if (
        stockList[i].stockNo == inputNumorName ||
        stockList[i].stockName == inputNumorName
      ) {
        stockNum = stockList[i].stockNo;
        stockName = stockList[i].stockName;
        break;
      }
    }

    if (stockNum && stockName) {
      const year = yearSelect.value;
      const season = seasonSelect.value;
      const path = `stock_data/balance_sheet/${stockNum} ${stockName}/${year}_${season}.json`;
      updateTitle(`${stockNum} ${stockName} ${year}年第${season}季資產負債表`);
      balanceSheet(path);
    } else {
      updateTitle("查無此股票，請重新輸入");
      clearTable();
      clearTableHead();
    }
  }

  const inputValue = document.getElementById("input");
  const searchForm = document.getElementById("search");

  let stockList = [];
  fetch("stock_data/stock_list/Listed_stock_info_list.json")
    .then((response) => response.json())
    .then((stock_List) => {
      stockList = stock_List.stock;
    })
    .catch((error) => {
      console.error("Error fetching stock list data:", error);
    });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    updateBalanceSheet();
  });

  yearSelect.addEventListener("change", updateBalanceSheet);
  seasonSelect.addEventListener("change", updateBalanceSheet);

  // 初始化表格，設置為2013年第1季度
  yearSelect.value = "2024";
  seasonSelect.value = "1";
  // updateBalanceSheet();
});
