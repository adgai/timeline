<template>
  <img src="../assets/run30.png">
  <div class="coordinates">
    X: {{ mouseX }}, Y: {{ mouseY }}
  </div>
  <div>
    internal:{{ interval }}
  </div>
  <div>
    yidong:{{ number }}
  </div>
  <div class="canvas-container">
<!--    <canvas ref="canvas"-->
<!--            @mousemove="this.getMousePosition"-->
<!--            :width="canvasWidth" :height="canvasHeight" style=""></canvas>-->

    <canvas ref="canvas2"
            @mousemove="this.getMousePosition"
            :width="canvasWidth" :height="canvasHeight" style=""></canvas>

  </div>
  <div class="record-container">
    <div class="record">
      <input class="e-input" v-model="eventName">
      <div>
        <button @click="record" class="button">记录</button>
        <button @click="recordFinishLast" class="button">记录 & 完成上一件事</button>
        <button @click="save" class="button">save</button>
      </div>
    </div>
  </div>
</template>

<script>

import {format} from 'date-fns';

export default {
  data() {
    return {
      line:[],
      text:[],
      rect:[],
      img:[],
       barHeight :33,
      muniteHeight:5,
      hourHeight:15,
      actualStartYOffset:10,
      internalIndex: 0,
      internalOpt: [15, 60, 240, 480, 720 ,1440],
      number: 3 * 60 * 1000 * 10,
      mouseX: 0,
      mouseY: 0,
      interval: 15,
      startIndex: this.getStartOfTodayTimestamp(),
      endIndex: this.getStartOfTodayTimestamp() + 24 * 60 * 60 * 1000,
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
      canvasHeight: 800,
      halfY:400,
      events: [
        {
          eventName: '吃煎饼',
          startTime: "2024-06-16 09:00",
          endTime: "2024-06-16 11:00",
          runing: false
        },
        {
          eventName: "rrrrrrrr",
          startTime: "2024-06-16 11:00",
          endTime: null,
          runing: true
        },
        // {
        //   eventName: "999",
        //   startTime: "2024-06-04 00:00",
        //   endTime: "2024-06-04 21:00",
        //   runing: false
        // },
        // {
        //   eventName: "eating",
        //   startTime: "2024-06-04 01:22",
        //   endTime: "2024-06-04 05:00",
        //   runing: false
        // },
        //
        // {
        //   eventName: "sleeping",
        //   startTime: "2024-06-04 11:22",
        //   endTime: "2024-06-04 21:00",
        //   runing: false
        // },
        // {
        //   eventName: "hit doudou",
        //   startTime: "2024-06-04 11:22",
        //   endTime: "2024-06-04 15:00",
        //   runing: false
        // },
        //
        // {
        //   eventName: "857",
        //   startTime: "2024-06-04 16:22",
        //   endTime: "2024-06-04 19:00",
        //   runing: false
        // },

      ],
      dao: new Map()
    };
  },
  mounted() {
    // this.drawTimeline();
    this.draw();
    // this.$refs.canvas.addEventListener('wheel', this.handleWheel)
    this.$refs.canvas2.addEventListener('wheel', this.handleWheel1)
  },
  methods: {
    draw(){
      // clear
      this.line = []
      this.text = []
      this.rect = []
      this.img = []

      // calc
      this.calcPosition(this.interval,this.startIndex,this.endIndex)

      const canvas = this.$refs.canvas2;
      const ctx = canvas.getContext('2d');
      // 清空画布
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      this.line.forEach((value)=>{
        ctx.beginPath();
        ctx.moveTo(value.startX, value.startY);
        ctx.lineTo(value.endX,value.endY);
        ctx.stroke();
      })

      this.rect.forEach(value => {
        // ctx.font = '18px serif'; // 字体和大小
        // ctx.fillStyle = 'black'; // 文字颜色
        // ctx.fillText(value.content, value.startX, value.startY);

        ctx.fillStyle = value.fillStyle

        ctx.fillRect(value.startX, value.startY, value.w, value.h);
      })


      this.text.forEach(value => {
        ctx.font = '18px serif'; // 字体和大小
        ctx.fillStyle = 'black'; // 文字颜色
        ctx.fillText(value.content, value.startX, value.startY);
      })




      this.img.forEach(value => {
        var img = new Image();   // 创建一个<img>元素
        img.src = value.imgUrl
        img.onload = () => {
          // img.src = '"../assets/run.png"'; // 设置图片源地址
          ctx.drawImage(img, value.startX, value.startY)
        }
      })



    },
    calcPosition(interval,startIndex,endIndex){
      this.line = []
      this.text = []
      this.rect = []
      this.img = []

      // timeline
      this.line.push(
          {
            startX:0,
            startY:this.halfY,
            endX:this.canvasWidth,
            endY:this.halfY
          }
      )
      const totalMinutes = (endIndex - startIndex) / 1000 / 60;
      // const interval = this.interval// 每10分钟一个刻度
      const numTicks = totalMinutes / interval;
      const tickSpacing = this.canvasWidth / numTicks;

      var x = 0
      var index = startIndex
      while (index <= endIndex) {

        var tenMinutesMill = 1000 * 60 * interval;
        var disNextTenMinutes = tenMinutesMill - ((index) % tenMinutesMill);

        if (disNextTenMinutes === 0 || tenMinutesMill === disNextTenMinutes) {

          var isHour = index % (60 * 60 * 1000) === 0;
          const tickHeight = isHour ? this.hourHeight : this.muniteHeight;
          // var h = index / (60 * 60 * 1000);
          var date = new Date(index - 8 * 60 * 60 * 1000);
          // var date = new Date(index );
          var h = date.getHours();

          this.line.push(
              {
                startX:x,
                startY:this.halfY,
                endX:x,
                endY:this.halfY - tickHeight
              }
          )


          if (isHour) {
            this.text.push(
                {
                  font: '18px serif',
                  fillStyle: 'black',
                  content: h,
                  startX:x,
                  startY:this.halfY + 20,
                  type:'hour'
                }
            )
          }

          var day = format(date, 'yyyy-MM-dd');

          if (h === 0 && isHour) {
            // ctx.font = '18px serif'; // 字体和大小
            // ctx.fillStyle = 'black'; // 文字颜色
            // ctx.fillText(day, x, halfY + 50);

            this.text.push(
                {
                  font: '18px serif',
                  fillStyle: 'black',
                  content: day,
                  startX:x,
                  startY:this.halfY + 50,
                  type: 'day'
                }
            )
          }

          index += tenMinutesMill
          x = Math.min(x + tickSpacing, endIndex)
        } else {
          index = index + disNextTenMinutes;
          x = Math.min(x + disNextTenMinutes / interval * tickSpacing, x)
        }

      }


      let actualStartUpY = this.halfY - this.hourHeight - this.actualStartYOffset;
      for (let i = 0; i < 20; i++) {
        this.dao.set(
            actualStartUpY - this.barHeight * i,
            [
              0, 0
            ]
        )
      }

      this.events.sort((a, b) => {
        let aEnd = a.endTime;
        let aStart = a.startTime;

        let bEnd = b.endTime;
        let bStart = b.startTime;

        if (aEnd === null) {
          aEnd = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        if (bEnd === null) {
          bEnd = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        if (aStart === aStart) {
          return aEnd.localeCompare(bEnd)
        } else {
          aStart.localeCompare(aStart)
        }
      })

      var  colorIndex = 0
      this.events.forEach(event => {

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let timestamp = now.getTime();

        // 根据时间算x
        let startX = (Date.parse(event.startTime) - startIndex) / (endIndex - startIndex) * this.canvasWidth;
        let s = event.endTime;
        if (s === null) {
          s = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        let endX = (Date.parse(s) - startIndex) / (endIndex - startIndex) * this.canvasWidth;
        ;

        // get dao

        let yy = this.halfY - this.hourHeight-200
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

        // console.log("enentName", event.eventName)
        //
        // console.log("dsfsfsfsfs", yy)

        const lastColor = this.lowSaturationColors[colorIndex]

        colorIndex = (colorIndex + 1) % this.lowSaturationColors.length


        // ctx.fillStyle = lastColor.hex
        //
        // ctx.fillRect(startX, yy, endX - startX, -this.barHeight);
        this.rect.push(
            {
              fillStyle : lastColor.hex,
              startX:startX,
              startY:yy,
              w:endX - startX,
              h:-this.barHeight
            }
        )

        // ctx.fillText("sfsfsf", 100, 100);
        // ctx.fillStyle = 'rgb(0,0,0)';
        //
        // ctx.font = '18px serif'; // 字体和大小
        // ctx.fillStyle = 'black'; // 文字颜色

        if (event.runing) {
          // var img = document.querySelector("img");
          // ctx.drawImage(img, 10, 10);

          var img = new Image();   // 创建一个<img>元素
          img.src = 'http://localhost:5173/src/assets/run30.png'
          img.onload = () => {
            // img.src = '"../assets/run.png"'; // 设置图片源地址
            // ctx.drawImage(img, startX + 10, yy - 33)
          }
          this.img.push(
              {
                imgUrl:'http://localhost:5173/src/assets/run30.png',
                startX: startX + 10,
                startY:yy-this.barHeight
              }
          )

          let text = event.eventName
          // ctx.fillText(text, startX + this.barHeight + 10, yy - 10);

          this.text.push(
              {
                font: '18px serif',
                fillStyle: 'black',
                content: text,
                startX:startX + this.barHeight + 10,
                startY: yy-10
              }
          )
        } else {
          let text = event.eventName + " " + event.startTime.split(' ')[1] + "--" + s.split(' ')[1];
          // ctx.fillText(text, startX + 20, yy - 10);
          //
          this.text.push(
              {
                font: '18px serif',
                fillStyle: 'black',
                content: text,
                startX:startX + 20,
                startY: yy-10
              }
          )

        }

        //
        // // ctx.drawImage(img, 10, 10)
        // ctx.font = '10px sans-serif'
        // canvas.fillStyle = '#000000'
      })



    },
    save() {
      try {
        const handle = window.showSaveFilePicker({
          suggestedName: 'example.txt',
          types: [{
            description: 'Text Files',
            accept: {'text/plain': ['.txt']}
          }]
        });

        const writable = handle.createWritable();
        writable.write('Hello, world!');
        writable.close();
      } catch (err) {
        console.error('Error:', err);
      }
    },
    getMousePosition(event) {
      const canvas = this.$refs.canvas2;
      const rect = canvas.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left;
      this.mouseY = event.clientY - rect.top;
    },
    getStartOfTodayTimestamp() {
      // 获取当前日期
      let today = new Date();

      // 设置时间部分为零
      today.setHours(0, 0, 0, 0);

      return today.getTime() - (today.getTimezoneOffset() * 60000);
      // 获取时间戳
      // return today.getTime();
    },
    record() {
      const eventMap = new Map();

      this.events.forEach(event => {
        eventMap.set(event.eventName, event);
      });

      if (!eventMap.has(this.eventName)) {
        this.events.push(
            {
              eventName: this.eventName,
              startTime: format(new Date(), 'yyyy-MM-dd HH:mm'),
              // startTime: '2024-06-04 21:52',
              // endTime: null,
              endTime: null,
              runing: true
            }
        )
      } else {
        let event = eventMap.get(this.eventName);
        event.endTime = format(new Date(), 'yyyy-MM-dd HH:mm')
        event.runing = false
      }


      this.eventName = ''

      this.drawTimeline()
    },
    recordFinishLast() {
      const eventMap = new Map();

      this.events.forEach(event => {
        eventMap.set(event.eventName, event);
        var newVar = event.endTime === null || event.runing;
        if (newVar) {
          event.endTime = format(new Date(), 'yyyy-MM-dd HH:mm')
          event.runing = false
        }
      });


      if (!eventMap.has(this.eventName)) {
        this.events.push(
            {
              eventName: this.eventName,
              startTime: format(new Date(), 'yyyy-MM-dd HH:mm'),
              // startTime: '2024-06-04 21:52',
              // endTime: null,
              endTime: null,
              runing: true
            }
        )
      } else {
        let event = eventMap.get(this.eventName);
        event.endTime = format(new Date(), 'yyyy-MM-dd HH:mm')
        event.runing = false
      }


      this.eventName = ''

      this.drawTimeline()
    },
    handleWheel1(event) {
      // 阻止默认滚动行为
      event.preventDefault();

      const delta = Math.sign(event.deltaY)
      console.log('wheel' +
          delta
      )
      // 检查是否按下 Shift 键
      if (event.altKey) {
        // 获取滚动方向
        const delta = Math.sign(event.deltaY);

        // 根据滚动方向调整时间间隔
        // if (delta > 0) {
        //   this.interval = Math.min(this.interval + 1, 60); // 最大放大到1小时
        // } else {
        //   this.interval = Math.max(this.interval - 1, 1); // 最小缩小到1分钟
        // }

        this.startIndex = this.startIndex + this.number * delta
        this.endIndex = this.endIndex + this.number * delta

        console.log('start ' + this.formatTimestamp(this.startIndex) + '\n' + 'end   ' + this.formatTimestamp(this.endIndex))
        // 重新绘制时间轴
        this.draw();

      } else if (event.ctrlKey) {

        // var originInterval = this.interval
        //
        // this.interval = this.interval + 10 * delta

        var centerIndex = this.mouseX / this.canvasWidth * (this.endIndex - this.startIndex);

        var rightIndex = (this.canvasWidth - this.mouseX) / this.canvasWidth * (this.endIndex - this.startIndex);


        var lefthalf = Math.trunc(centerIndex / 2);
        var righthalf = Math.trunc(rightIndex / 2);

        if (delta > 0) {
          if (this.interval > 15) {
            this.startIndex += lefthalf
            this.endIndex -= righthalf
            this.number = Math.max(this.number / 2, 15 * 60 * 1000)

            this.internalIndex = this.internalIndex - delta

          }

        } else {


          if (this.interval < 1440) {
            var furtureInternalIndex = this.internalIndex - delta;

            this.calcPosition(
                this.internalOpt[furtureInternalIndex],
                this.startIndex - centerIndex,
                this.endIndex + rightIndex
            )

            var ji = this.calcJi();
            if (!ji){

              this.internalIndex = furtureInternalIndex

              this.startIndex -= centerIndex
              this.endIndex += rightIndex

              this.number = Math.min(this.number * 2, 24 * 60 * 60 * 1000)

            }

          }

        }

        this.interval = this.internalOpt[this.internalIndex]
        //
        // if (delta > 0) {
        //   this.startIndex += centerIndex / 2
        //   this.endIndex -= rightIndex / 2
        // } else {
        //   this.startIndex -= centerIndex / 2
        //   this.endIndex += rightIndex / 2
        // }

        // 重新绘制时间轴
        this.draw();

      }

    },
    handleWheel(event) {
      // 阻止默认滚动行为
      event.preventDefault();

      const delta = Math.sign(event.deltaY)
      console.log('wheel' +
          delta
      )
      // 检查是否按下 Shift 键
      if (event.altKey) {
        // 获取滚动方向
        const delta = Math.sign(event.deltaY);

        // 根据滚动方向调整时间间隔
        // if (delta > 0) {
        //   this.interval = Math.min(this.interval + 1, 60); // 最大放大到1小时
        // } else {
        //   this.interval = Math.max(this.interval - 1, 1); // 最小缩小到1分钟
        // }

        this.startIndex = this.startIndex + this.number * delta
        this.endIndex = this.endIndex + this.number * delta

        console.log('start ' + this.formatTimestamp(this.startIndex) + '\n' + 'end   ' + this.formatTimestamp(this.endIndex))
        // 重新绘制时间轴
        this.drawTimeline();

      } else if (event.ctrlKey) {

        // var originInterval = this.interval
        //
        // this.interval = this.interval + 10 * delta

        var centerIndex = this.mouseX / this.canvasWidth * (this.endIndex - this.startIndex);

        var rightIndex = (this.canvasWidth - this.mouseX) / this.canvasWidth * (this.endIndex - this.startIndex);


        var lefthalf = Math.trunc(centerIndex / 2);
        var righthalf = Math.trunc(rightIndex / 2);

        if (delta > 0) {
          if (this.interval > 15) {
            this.startIndex += lefthalf
            this.endIndex -= righthalf
            this.number = Math.max(this.number / 2, 15 * 60 * 1000)

            this.internalIndex = this.internalIndex - delta

          }

        } else {
          if (this.interval < 1440) {
            this.internalIndex = this.internalIndex - delta

            this.startIndex -= centerIndex
            this.endIndex += rightIndex
            this.number = Math.min(this.number * 2, 24 * 60 * 60 * 1000)
          }

        }

        this.interval = this.internalOpt[this.internalIndex]
        //
        // if (delta > 0) {
        //   this.startIndex += centerIndex / 2
        //   this.endIndex -= rightIndex / 2
        // } else {
        //   this.startIndex -= centerIndex / 2
        //   this.endIndex += rightIndex / 2
        // }

        // 重新绘制时间轴
        this.drawTimeline();

      }

    },
    formatTimestamp(timestamp) {
      return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
    },
    drawTimeline() {
      var barHeight = 33
      var colorIndex = 0

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      // 清空画布
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      const metrics = ctx.measureText('2024-12-31');
      const textWidth = metrics.width;
      var maxDateDisplayNum = this.canvasWidth / textWidth;

      (this.endIndex - this.startIndex) / (this.interval * 60 * 1000)


      const totalMinutes = (this.endIndex - this.startIndex) / 1000 / 60;
      const interval = this.interval// 每10分钟一个刻度
      const numTicks = totalMinutes / interval;
      const tickSpacing = this.canvasWidth / numTicks;
      let halfY = this.canvasHeight / 2;

      // 画时间轴
      ctx.beginPath();
      ctx.moveTo(0, halfY);
      ctx.lineTo(this.canvasWidth, halfY);
      ctx.stroke();

      // 画刻度
      // for (let i = 0; i <= numTicks; i++) {
      //   const x = i * tickSpacing;
      //
      //   let munites = i * interval;
      //   const isHour = munites % 60 === 0;
      //   let h = munites / 60;
      //   const tickHeight = isHour ? 30 : 10;
      //
      //   ctx.beginPath();
      //   ctx.moveTo(x, halfY);
      //   ctx.lineTo(x, halfY - tickHeight / 2);
      //   ctx.stroke();
      //   if (isHour) {
      //     ctx.font = '18px serif'; // 字体和大小
      //     ctx.fillStyle = 'black'; // 文字颜色
      //     ctx.fillText(h % 24, x, halfY + 20);
      //   }
      // }

      var x = 0
      var index = this.startIndex
      while (index <= this.endIndex) {

        var tenMinutesMill = 1000 * 60 * interval;
        var disNextTenMinutes = tenMinutesMill - ((index) % tenMinutesMill);

        if (disNextTenMinutes === 0 || tenMinutesMill === disNextTenMinutes) {

          var isHour = index % (60 * 60 * 1000) === 0;
          const tickHeight = isHour ? this.hourHeight : this.muniteHeight;
          // var h = index / (60 * 60 * 1000);
          var date = new Date(index - 8 * 60 * 60 * 1000);
          // var date = new Date(index );
          var h = date.getHours();
          ctx.beginPath();
          ctx.moveTo(x, halfY);
          ctx.lineTo(x, halfY - tickHeight);
          ctx.stroke();
          if (isHour) {
            ctx.font = '18px serif'; // 字体和大小
            ctx.fillStyle = 'black'; // 文字颜色
            ctx.fillText(h, x, halfY + 20);
          }

          var day = format(date, 'yyyy-MM-dd');

          if (h === 0 && isHour) {
            ctx.font = '18px serif'; // 字体和大小
            ctx.fillStyle = 'black'; // 文字颜色
            ctx.fillText(day, x, halfY + 50);
          }

          // if (index === this.startIndex || (h === 0 && isHour)) {
          //
          //
          //   ctx.font = '18px serif'; // 字体和大小
          //   ctx.fillStyle = 'black'; // 文字颜色
          //   ctx.fillText(day, x, halfY + 50);
          //
          // } else if (index === this.endIndex) {
          //   ctx.font = '18px serif'; // 字体和大小
          //   ctx.fillStyle = 'black'; // 文字颜色
          //   ctx.fillText(day, x - 100, halfY + 50);
          // }

          index += tenMinutesMill
          x = Math.min(x + tickSpacing, this.endIndex)
        } else {
          index = index + disNextTenMinutes;
          x = Math.min(x + disNextTenMinutes / interval * tickSpacing, x)
        }

      }


      // 设置填充颜色和透明度

      //
      //
      // ctx.fillStyle = 'rgb(42,87,171)';
      //
      // ctx.fillRect(100, this.canvasHeight / 2 - 20, tickSpacing, -20);
      //

      // for (let i = 0; i < 20; i++) {
      //   ctx.beginPath();
      //   ctx.setLineDash([5, 5]);
      //   let y = this.canvasHeight / 2 - barHeight * i;
      //   ctx.moveTo(0, y);
      //   ctx.lineTo(this.canvasWidth, y);
      //   ctx.stroke();
      //   ctx.setLineDash([]);
      //   //
      //   // ctx.fillStyle = 'rgb(166,222,115)';
      //   //
      //   // ctx.fillRect(0, y, tickSpacing * i, -20);
      // }
      let actualStartUpY = halfY - this.hourHeight - this.actualStartYOffset;
      for (let i = 0; i < 20; i++) {
        this.dao.set(
            actualStartUpY - barHeight * i,
            [
              0, 0
            ]
        )
      }

      this.events.sort((a, b) => {
        let aEnd = a.endTime;
        let aStart = a.startTime;

        let bEnd = b.endTime;
        let bStart = b.startTime;

        if (aEnd === null) {
          aEnd = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        if (bEnd === null) {
          bEnd = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        if (aStart === aStart) {
          return aEnd.localeCompare(bEnd)
        } else {
          aStart.localeCompare(aStart)
        }
      })


      this.events.forEach(event => {

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let timestamp = now.getTime();

        // 根据时间算x
        let startX = (Date.parse(event.startTime) - this.startIndex) / (this.endIndex - this.startIndex) * this.canvasWidth;
        let s = event.endTime;
        if (s === null) {
          s = format(new Date(), 'yyyy-MM-dd HH:mm')
        }

        let endX = (Date.parse(s) - this.startIndex) / (this.endIndex - this.startIndex) * this.canvasWidth;
        ;

        // get dao

        let yy = halfY - this.hourHeight-200
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

        // console.log("enentName", event.eventName)
        //
        // console.log("dsfsfsfsfs", yy)

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
          // var img = document.querySelector("img");
          // ctx.drawImage(img, 10, 10);

          var img = new Image();   // 创建一个<img>元素
          img.src = 'http://localhost:5173/src/assets/run30.png'
          img.onload = () => {
            // img.src = '"../assets/run.png"'; // 设置图片源地址
            ctx.drawImage(img, startX + 10, yy - 33)
          }

          let text = event.eventName
          ctx.fillText(text, startX + barHeight + 10, yy - 10);
        } else {
          let text = event.eventName + " " + event.startTime.split(' ')[1] + "--" + s.split(' ')[1];
          ctx.fillText(text, startX + 20, yy - 10);
        }

        // ctx.drawImage(img, 10, 10)
        ctx.font = '10px sans-serif'
        canvas.fillStyle = '#000000'
      })


    },
    calcJi() {
         var typeToListMap = this.text.reduce((acc, item) => {
        // 获取当前项的 category 值
        const key = item.type;

        // 如果 acc 中不存在该 key，则创建一个数组
        if (!acc[key]) {
          acc[key] = [];
        }

        // 将当前项推入对应的数组中
        acc[key].push(item);

        return acc;
      }, {});


      var hourList = typeToListMap['hour'];
      var dayList = typeToListMap['day'];

      var b = this.doCalcJi(hourList);
      var b1 = this.doCalcJi(dayList);
      return b  || b1

    },
    doCalcJi(textList){
      const canvas = this.$refs.canvas2;
      const ctx = canvas.getContext('2d');


      for (let i = 0; i < textList.length -1; i++) {
        var hour1 = textList[i];
        var hour2 = textList[i+1];
        if (hour1.startX + ctx.measureText(hour1.content).width >= hour2.startX){
          return true;
        }
      }

      return false;
    }
  }
};
</script>

<style>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
//height: 100vh; //width: 100vw;
}


canvas {
//border: 1px solid black;
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
