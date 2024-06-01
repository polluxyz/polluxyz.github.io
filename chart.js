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
      // Parse date string to timestamp

      const indexData = await fetch(
        "stock_data/total_date/stock_indexs/TAIEX 加權指/total_index.json"
      ).then((response) => response.json());

      const volumeData = await fetch(
        "stock_data/total_date/stock_indexs/TAIEX 加權指/volume.json"
      ).then((response) => response.json());

      const rowIndexData = indexData.data;
      const rowVolumeData = volumeData.data;

      const ohlc = [],
        volume = [],
        dataLength = rowIndexData.length,
        groupingUnits = [
          ["week", [1]],
          ["month", [1, 2, 3, 4, 6]],
        ];

      const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.trim().split("/").map(Number);
        return Date.UTC(year + 1911, month - 1, day); // 民國年轉西元年
      };

      const parseNum = (indexNum) => {
        return indexNum.trim().replace(/,/g, "");
      };

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

      // Sort data by date
      ohlc.sort((a, b) => a[0] - b[0]);
      volume.sort((a, b) => a[0] - b[0]);

      // 计算移动平均线数据
      const ma20 = calculateMA(ohlc, 20);
      const ma60 = calculateMA(ohlc, 60);
      const ma120 = calculateMA(ohlc, 120);

      Highcharts.stockChart("chart", {
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
          text: "加權指",
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
                if (ohlc[i][0] === series.point.x) {
                  s =
                    '<br>開: <span style="font-weight:bold">' +
                    ohlc[i][1] +
                    '<br></span> 收: <span style="font-weight:bold">' +
                    ohlc[i][4] +
                    '<br></span> 高: <span style="font-weight:bold">' +
                    ohlc[i][2] +
                    '<br></span> 低: <span style="font-weight:bold">' +
                    ohlc[i][3] +
                    '<br></span> 量: <span style="font-weight:bold">' +
                    (volume[i][1] / 100000000).toFixed(2) +
                    " 千億</span>" +
                    ' <br></span> 5MA: <span style="font-weight:bold">' +
                    ma20[i - 20][1].toFixed(2) +
                    '<br></span> 20MA: <span style="font-weight:bold">' +
                    ma60[i - 60][1].toFixed(2) +
                    '<br></span> 60MA: <span style="font-weight:bold">' +
                    ma120[i - 120][1].toFixed(2);
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
    })();
  })
  .catch((error) => {
    console.error("Error loading scripts:", error);
  });
