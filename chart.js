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
  "https://code.highcharts.com/modules/accessibility.js",
])
  .then(() => {
    (async () => {
      const inputValue = document.getElementById("input");
      const searchForm = document.getElementById("search");

      const stock_List = await fetch(
        "stock_data/stock_list/Listed_stock_info_list.json"
      ).then((response) => response.json());

      const stockList = stock_List.stock;

      let stockNum = localStorage.getItem("stockNum");
      let stockName = localStorage.getItem("stockName");

      const loadData = async (stockNum, stockName) => {
        let indexData, volumeData;

        const parseDate = (dateStr) => {
          const [year, month, day] = dateStr.trim().split("/").map(Number);
          return Date.UTC(year + 1911, month - 1, day); // 民國年轉西元年
        };

        const parseNum = (indexNum) => {
          return indexNum.trim().replace(/,/g, "");
        };

        const ohlc = [],
          volume = [],
          groupingUnits = [
            ["week", [1]],
            ["month", [1]],
          ];

        if (stockNum === "") {
          indexData = await fetch(
            "stock_data/total_date/stock_indexs/TAIEX 加權指/total_index.json"
          ).then((response) => response.json());

          volumeData = await fetch(
            "stock_data/total_date/stock_indexs/TAIEX 加權指/volume.json"
          ).then((response) => response.json());

          const rowIndexData = indexData.data;
          const rowVolumeData = volumeData.data;

          const dataLength = rowIndexData.length;

          for (let i = 0; i < dataLength; i += 1) {
            const date = parseDate(rowIndexData[i][0]);

            ohlc.push([
              date, // the date
              parseFloat(parseNum(rowIndexData[i][1])), // open
              parseFloat(parseNum(rowIndexData[i][2])), // high
              parseFloat(parseNum(rowIndexData[i][3])), // low
              parseFloat(parseNum(rowIndexData[i][4])), // close
            ]);

            volume.push([
              date, // the date
              parseInt(rowVolumeData[i][2].replace(/,/g, "")), // the volume
            ]);
          }

          chartTitle = "加權指";
        } else {
          stockData = await fetch(
            `stock_data/total_date/stocks/${stockNum}_${stockName}.json`
          ).then((response) => response.json());

          const rowStockData = stockData.data;

          const dataLength = rowStockData.length;

          for (let i = 0; i < dataLength; i += 1) {
            const date = parseDate(rowStockData[i][0]);

            ohlc.push([
              date, // the date
              parseFloat(parseNum(rowStockData[i][3])), // open
              parseFloat(parseNum(rowStockData[i][4])), // high
              parseFloat(parseNum(rowStockData[i][5])), // low
              parseFloat(parseNum(rowStockData[i][6])), // close
            ]);

            volume.push([
              date, // the date
              parseInt(rowStockData[i][1].replace(/,/g, "")), // the volume
            ]);
          }

          chartTitle = `${stockNum} ${stockName}`;
        }

        // 计算移动平均线的函数
        const calculateMA = (data, dayCount) => {
          const result = [];
          for (let i = 0, len = data.length; i < len; i++) {
            if (i < dayCount) {
              result.push([data[i][0], null]);
            } else {
              const sum = data
                .slice(i - dayCount, i)
                .reduce((sum, item) => sum + item[4], 0);
              result.push([data[i][0], sum / dayCount]);
            }
          }
          return result;
        };

        // Sort data by date
        ohlc.sort((a, b) => a[0] - b[0]);
        volume.sort((a, b) => a[0] - b[0]);

        // 计算移动平均线数据
        const ma20 = calculateMA(ohlc, 20);
        const ma60 = calculateMA(ohlc, 60);
        const ma120 = calculateMA(ohlc, 120);

        chart = Highcharts.stockChart("chart", {
          chart: {
            backgroundColor: {
              stops: [[0, "rgb(255, 255, 255)"]],
            },
          },
          rangeSelector: {
            buttons: [
              {
                type: "day",
                count: 120,
                text: "日線",
              },
              {
                type: "week",
                count: 60,
                text: "周線",
              },
              {
                type: "month",
                count: 120,
                text: "月線",
              },
            ],
            selected: 0,
          },

          title: {
            text: chartTitle,
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
                text: "Volume",
              },
              top: "65%",
              height: "35%",
              offset: 0,
              lineWidth: 2,
            },
          ],

          tooltip: {
            borderWidth: 0,
            split: true,
            positioner: function () {
              return { x: 10, y: 10 };
            },
            shadow: false,
            borderWidth: 0,
            backgroundColor: "rgba(204,234,240,0.8)",
            useHTML: true,
            formatter: function () {
              let s = " ";
              const points = this.points || [this];
              points.forEach((series) => {
                for (let i = 0; i < ohlc.length; i++) {
                  if (stockNum == "") {
                    tooltipVolume = `${(volume[i][1] / 100000000).toFixed(
                      2
                    )} 億`;
                  } else {
                    tooltipVolume = `${volume[i][1] / 1000} 千股`;
                  }
                  if (ohlc[i][0] === series.point.x) {
                    s =
                      '<br><span style="font-weight:bold">開: ' +
                      ohlc[i][1] +
                      '<br></span><span style="font-weight:bold">收: ' +
                      ohlc[i][4] +
                      '</span><br><span style="font-weight:bold">高: ' +
                      ohlc[i][2] +
                      '</span><br><span style="font-weight:bold">低: ' +
                      ohlc[i][3] +
                      '</span><br><span style="font-weight:bold">量: ' +
                      tooltipVolume +
                      "</span>" +
                      ' </span><br><span style="font-weight:bold">20MA: ' +
                      ma20[i - 20][1].toFixed(2) +
                      '</span><br><span style="font-weight:bold">60MA: ' +
                      ma60[i - 60][1].toFixed(2) +
                      '</span><br><span style="font-weight:bold">120MA: ' +
                      ma120[i - 120][1].toFixed(2) +
                      "</span>";
                    break;
                  }
                }
              });
              const date = new Date(this.x);
              s =
                date.getMonth() +
                1 +
                "/" +
                date.getDate() +
                "/" +
                date.getFullYear() +
                " " +
                s;
              return s;
            },
          },

          plotOptions: {
            line: {
              states: {
                hover: {
                  enabled: false,
                },
              },
            },
          },

          series: [
            {
              type: "candlestick",
              name: "加權指",
              data: ohlc,
              upColor: "red", // 上漲顏色
              color: "green", // 下跌顏色
              dataGrouping: {
                units: groupingUnits,
              },
            },
            {
              type: "column",
              name: "成交量",
              data: volume,
              yAxis: 1,
              dataGrouping: {
                units: groupingUnits,
              },
            },
            {
              type: "line",
              name: "20日均線",
              data: ma20,
              color: "purple",
              dataGrouping: {
                units: groupingUnits,
              },
            },
            {
              type: "line",
              name: "60日均線",
              data: ma60,
              color: "grey",
              dataGrouping: {
                units: groupingUnits,
              },
            },
            {
              type: "line",
              name: "120日均線",
              data: ma120,
              color: "pink",
              dataGrouping: {
                units: groupingUnits,
              },
            },
          ],
        });
      };

      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        inputNumorName = inputValue.value;
        for (let i = 0; i < stockList.length; i++) {
          if (
            stockList[i].stockNo == inputNumorName ||
            stockList[i].stockName == inputNumorName
          ) {
            stockNum = stockList[i].stockNo;
            stockName = stockList[i].stockName;
            break;
          } else {
            stockNum = "";
            stockName = "";
          }
        }
        localStorage.setItem("stockNum", stockNum);
        localStorage.setItem("stockName", stockName);
        loadData(stockNum, stockName);
      });

      // 加载初始数据
      loadData("", "");
    })();
  })
  .catch((error) => {
    console.error("Error loading scripts:", error);
  });
