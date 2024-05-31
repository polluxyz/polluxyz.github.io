// chart.js

// Load Highcharts and its modules
const loadScripts = (urls) => {
  return Promise.all(
    urls.map((url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    })
  );
};

loadScripts([
  "https://code.highcharts.com/stock/highstock.js",
  "https://code.highcharts.com/stock/modules/drag-panes.js",
  "https://code.highcharts.com/stock/modules/exporting.js",
  "https://code.highcharts.com/stock/modules/accessibility.js",
])
  .then(() => {
    (async () => {
      // Parse date string to timestamp

      const data = await fetch("stock_data/total_date/1101_台泥.json").then(
        (response) => response.json()
      );

      const rowData = data.data;

      const ohlc = [],
        volume = [],
        dataLength = rowData.length,
        groupingUnits = [
          ["week", [1]],
          ["month", [1, 2, 3, 4, 6]],
        ];

      const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.trim().split("/").map(Number);
        return Date.UTC(year + 1911, month - 1, day); // 民國年轉西元年
      };

      for (let i = 0; i < dataLength; i += 1) {
        const date = parseDate(rowData[i][0]);

        ohlc.push([
          date, // the date
          parseFloat(rowData[i][3]), // open
          parseFloat(rowData[i][4]), // high
          parseFloat(rowData[i][5]), // low
          parseFloat(rowData[i][6]), // close
        ]);

        volume.push([
          date, // the date
          parseInt(rowData[i][1].replace(/,/g, "")), // the volume
        ]);
      }

      // Sort data by date
      ohlc.sort((a, b) => a[0] - b[0]);
      volume.sort((a, b) => a[0] - b[0]);

      Highcharts.stockChart("container", {
        rangeSelector: {
          selected: 4,
        },

        title: {
          text: "台泥歷史數據",
        },

        yAxis: [
          {
            labels: {
              align: "right",
              x: -3,
            },
            title: {
              text: "OHLC",
            },
            height: "60%",
            lineWidth: 2,
            resize: {
              enabled: true,
            },
          },
          {
            labels: {
              align: "right",
              x: -3,
            },
            title: {
              text: "交易量",
            },
            top: "65%",
            height: "35%",
            offset: 0,
            lineWidth: 2,
          },
        ],

        tooltip: {
          split: true,
        },

        series: [
          {
            type: "candlestick",
            name: "台泥",
            data: ohlc,
            upColor: "red", // 上漲顏色
            color: "green", // 下跌顏色
            dataGrouping: {
              units: groupingUnits,
            },
          },
          {
            type: "column",
            name: "交易量",
            data: volume,
            yAxis: 1,
            dataGrouping: {
              units: groupingUnits,
            },
          },
        ],
      });
    })();
  })
  .catch((error) => {
    console.error("Error loading scripts:", error);
  });
