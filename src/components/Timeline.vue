<template>
  <div class="canvas-container">
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" style="border: #2a57ab 1px solid"></canvas>
  </div>
  <div class="record-container">
    <div class="record">
      <input class="e-input" v-model="eventName">
      <button @click="record" class="button">record</button>
    </div>

    <img src="../assets/run30.png">
  </div>
</template>

<script>

import {format} from 'date-fns';

export default {
  data() {
    return {
      eventName: "",
      lowSaturationColors: [
        {hex: "#E6E6FA", name: "Lavender"},
        {hex: "#D8BFD8", name: "Thistle"},
        {hex: "#FFB6C1", name: "LightPink"},
        {hex: "#98FB98", name: "PaleGreen"},
        {hex: "#ADD8E6", name: "LightBlue"},
        {hex: "#FFE4E1", name: "MistyRose"},
        {hex: "#FFFFE0", name: "LightYellow"},
        {hex: "#AFEEEE", name: "PaleTurquoise"},
        {hex: "#F0F8FF", name: "AliceBlue"},
        {hex: "#F0FFF0", name: "HoneyDew"},
        {hex: "#FFF5EE", name: "Seashell"},
        {hex: "#FFF0F5", name: "LavenderBlush"},
        {hex: "#F5FFFA", name: "MintCream"},
        {hex: "#FFFAFA", name: "Snow"},
        {hex: "#FFFFF0", name: "Ivory"},
        {hex: "#F5F5F5", name: "WhiteSmoke"},
        {hex: "#F8F8FF", name: "GhostWhite"},
        {hex: "#FFFAF0", name: "FloralWhite"},
        {hex: "#FDF5E6", name: "OldLace"},
        {hex: "#FAEBD7", name: "AntiqueWhite"}
      ],
      canvasWidth: window.innerWidth - 200,
      canvasHeight: 500,
      events: [
        {
          eventName: "999",
          startTime: "2024-06-03 00:00",
          endTime: "2024-06-03 21:00",
          runing: false
        },
        {
          eventName: "eating",
          startTime: "2024-06-03 01:22",
          endTime: "2024-06-03 05:00",
          runing: false
        },

        {
          eventName: "sleeping",
          startTime: "2024-06-03 11:22",
          endTime: "2024-06-03 21:00",
          runing: false
        },
        {
          eventName: "hit doudou",
          startTime: "2024-06-03 11:22",
          endTime: "2024-06-03 15:00",
          runing: false
        },

        {
          eventName: "857",
          startTime: "2024-06-03 16:22",
          endTime: "2024-06-03 19:00",
          runing: false
        },

      ],
      dao: new Map()
    };
  },
  mounted() {
    this.drawTimeline();
  },
  methods: {
    record() {
      this.events.push(
          {
            eventName: this.eventName,
            startTime: format(new Date(), 'yyyy-MM-dd HH:mm'),
            // startTime: '2024-06-03 21:52',
            // endTime: null,
            endTime: null,
            runing: true
          }
      )

      this.eventName = ''

      this.drawTimeline()
    },
    drawTimeline() {
      var barHeight = 33
      var colorIndex = 0
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');

      const totalMinutes = 24 * 60;
      const interval = 10; // 每10分钟一个刻度
      const numTicks = totalMinutes / interval;
      const tickSpacing = this.canvasWidth / numTicks;

      // 清空画布
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      // 画时间轴
      ctx.beginPath();
      let halfY = this.canvasHeight / 2;
      ctx.moveTo(0, halfY);
      ctx.lineTo(this.canvasWidth, halfY);
      ctx.stroke();

      // 画刻度
      for (let i = 0; i <= numTicks; i++) {
        const x = i * tickSpacing;
        let hour = i * interval;
        const isHour = hour % 60 === 0;
        let h = hour / 60;
        const tickHeight = isHour ? 30 : 10;

        ctx.beginPath();
        ctx.moveTo(x, halfY);
        ctx.lineTo(x, halfY - tickHeight / 2);
        ctx.stroke();
        if (isHour) {
          ctx.fillText(h, x + 15, halfY + 10);
        }
      }

      // 设置填充颜色和透明度

      //
      //
      // ctx.fillStyle = 'rgb(42,87,171)';
      //
      // ctx.fillRect(100, this.canvasHeight / 2 - 20, tickSpacing, -20);
      //

      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        let y = this.canvasHeight / 2 - barHeight * i;
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvasWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);
        //
        // ctx.fillStyle = 'rgb(166,222,115)';
        //
        // ctx.fillRect(0, y, tickSpacing * i, -20);
      }
      let actualStartUpY = halfY - barHeight;
      for (let i = 0; i < 20; i++) {
        this.dao.set(
            actualStartUpY - barHeight * i,
            [
              0, 0
            ]
        )
      }

      this.events.sort((a, b) => {
        if (a.endTime === null) {
          a.endTime = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        if (b.endTime === null) {
          b.endTime = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        if (a.startTime === b.startTime) {
          return a.endTime.localeCompare(b.endTime)
        } else {
          a.startTime.localeCompare(b.startTime)
        }
      })


      this.events.forEach(event => {

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let timestamp = now.getTime();

        // 根据时间算x
        let startX = (Date.parse(event.startTime) - timestamp) / (24 * 60 * 60 * 1000) * this.canvasWidth;
        let endX = (Date.parse(event.endTime) - timestamp) / (24 * 60 * 60 * 1000) * this.canvasWidth;
        ;


        // get dao

        let yy = halfY - 25
        let updateValue
        for (const [key, value] of this.dao) {
          let vMax = value[1];
          if (vMax === 0 || vMax + 10 <= startX) {
            yy = key
            updateValue = value
            value[1] = Math.max(vMax, endX)
            break
          }
        }

        console.log("enentName", event.eventName)

        console.log("dsfsfsfsfs", yy)

        const lastColor = this.lowSaturationColors[colorIndex]

        colorIndex = (colorIndex + 1) % this.lowSaturationColors.length

        ctx.fillStyle = lastColor.hex

        ctx.fillRect(startX, yy, endX - startX, -barHeight);


        // ctx.fillText("sfsfsf", 100, 100);
        ctx.fillStyle = 'rgb(0,0,0)';

        ctx.font = '18px serif'; // 字体和大小
        ctx.fillStyle = 'black'; // 文字颜色
        // ctx.textAlign = 'center'; // 文本对齐方式
        const textMetrics = ctx.measureText(event.eventName);
        console.log("text width ", textMetrics.width)

        if (event.runing) {
          var img = document.querySelector("img");
          // ctx.drawImage(img, 10, 10);

          // var img = new Image();   // 创建一个<img>元素
          // img.src = '"../assets/run.png"'; // 设置图片源地址
          ctx.drawImage(img, startX + 10, yy - 33)
          let text = event.eventName
          ctx.fillText(text, startX + barHeight + 10, yy - 10);
        }else {
          let text = event.eventName + " " + event.startTime.split(' ')[1] + "--" + event.endTime.split(' ')[1];
          ctx.fillText(text, startX + barHeight + 10, yy - 10);
        }

        // ctx.drawImage(img, 10, 10)
        ctx.font = '10px sans-serif'
        canvas.fillStyle = '#000000'
      })


    }
  }
};
</script>

<style>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
//height: 100vh; //width: 100vw;
}


canvas {
  border: 1px solid black;
}

.record-container {
  margin-top: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
//height: 100vh; /* 使容器高度为视口高度，便于垂直居中 */
}

.e-input {
  min-width: 500px;
  min-height: 200px;
}

.record {
  display: flex;
  flex-direction: row; /* 使内部元素垂直排列 */
  align-items: center; /* 使内部元素水平居中 */
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #4CAF50;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.button .knot {
  position: relative;
  width: 50px;
  height: 50px;
}

.knot::before,
.knot::after {
  content: '';
  position: absolute;
  border: 3px solid white;
  border-radius: 50%;
}

.knot::before {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-top-color: transparent;
  border-right-color: transparent;
}

.knot::after {
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-bottom-color: transparent;
  border-left-color: transparent;
}
</style>
