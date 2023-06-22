import { gettext } from "i18n"
import { Fx } from "../../../utils/fx"
import { FPSShower } from "../../../utils/fpsShow"
import { data } from "../../../utils/data"
import { SmoothTimer } from "../../../utils/smoothTimer"
const logger = DeviceRuntimeCore.HmLogger.getLogger('home')
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = hmSetting.getDeviceInfo()
var hmVibrateSensor = null
var hmVibrateEnable = false
function vibreate() {
  hmVibrateSensor.scene = 24
  hmVibrateSensor.start()
  hmVibrateEnable = true
}
// const
const LAYER_HEIGHT = px(120)
const FLOOR_HEIGHT = px(300)
const LAYER_FIRST_WIDTH = px(280)
const PERFECT_RANGE = px(5)
const MAIN_LOOP_TIMER_DELAY = data.json.highFPS ? 16.7 : 25 // ms
const COLOR_LIST = [
  { line: 0xBD4042, fill: 0xFF575A }, // Red
  { line: 0xAB551A, fill: 0xFF7F27 }, // Orange
  { line: 0xD1CF46, fill: 0xFFFD55 }, // Yellow
  { line: 0x4FA834, fill: 0x75F94D }, // Green
  { line: 0x5256A1, fill: 0x7E84F7 }, // Blue
  { line: 0x0171BD, fill: 0x0193F5 }, // Blue2
  { line: 0x541FB3, fill: 0x732BF5 }, // Purple
]
const TOTAL_LAYER_WIDGET_NUMBER = 6
const FLOOR_FILL_COLOR = 0x888888
const MIN_WIDTH = px(12)


Page({
  build() {

    hmVibrateSensor = hmSensor.createSensor(hmSensor.id.VIBRATE)
    hmUI.setLayerScrolling(false) //关闭默认layer的scrolling
    var nowY = -70 // not including floor height ; the bottom of the screen
    var fxY = nowY // widget y in fact. For anim
    var bPress = false // if user have pressed on the screen between main loop circal
    var score = 0
    var over = false
    var losedYChanged = false
    var fxLosedYChange = null
    var losedTouchLastY = 0
    var fps = data.json.highFPS ? 60 : 40
    var lastWidth = LAYER_FIRST_WIDTH
    var perfectTimes = 0
    var maxCombo = 0
    data.json.highFPS = false
    data.save()
    function getRandomColor() {
      return COLOR_LIST[Math.round(Math.random() * 100000) % COLOR_LIST.length]
    }
    function getRandomX(width) {
      return Math.random() * 10000000 % (DEVICE_HEIGHT - width || lastWidth)
    }
    function getRandomFacing() {
      return (Math.random() * 1000) % 2 == 1 ? facing.LEFT : facing.RIGHT
    }
    //logger.debug('point 1')
    // layer data obj:{width, x, layer, bSolid, color}
    let layers = [
      { width: LAYER_FIRST_WIDTH, x: px(30), layer: 0, bSolid: false, color: getRandomColor() },
    ]
    var nowLayerNumber = layers.length // TODO
    // layer widget init
    var layerWidgets = []
    for (let i = 0; i < TOTAL_LAYER_WIDGET_NUMBER; ++i) {
      let newColor = getRandomColor()
      let obj = {
        fill: hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: (px(480) - LAYER_FIRST_WIDTH) / 2,
          y: 0,
          w: LAYER_FIRST_WIDTH,
          h: LAYER_HEIGHT,
          radius: px(5),
          color: newColor.fill
        }),
        line: hmUI.createWidget(hmUI.widget.STROKE_RECT, {
          x: (px(480) - LAYER_FIRST_WIDTH) / 2,
          y: 0,
          w: LAYER_FIRST_WIDTH,
          h: LAYER_HEIGHT,
          radius: px(5),
          line_width: px(5),
          color: newColor.line
        }),
      }
      obj.line.setProperty(hmUI.prop.VISIBLE, false)
      obj.fill.setProperty(hmUI.prop.VISIBLE, false)
      layerWidgets.push(obj)
    }
    // floor widget init
    var floorWidget = hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: px(0),
      y: 666,
      w: DEVICE_WIDTH,
      h: FLOOR_HEIGHT,
      color: FLOOR_FILL_COLOR
    })



    const facing = { LEFT: 0, RIGHT: 1 }
    var topLayerData = {
      facing: facing.LEFT,
      layerIndex: 0,
      speed: 0,
    }
    let speedMulti = 60 / fps
    switch (data.json.difficulty) {
      case 1: topLayerData.speed = 2 * speedMulti; break;
      case 2: topLayerData.speed = 3 * speedMulti; break;
      case 3: topLayerData.speed = 4 * speedMulti; break;
      case 4: topLayerData.speed = 5 * speedMulti; break;
    }

    //logger.debug('point 2')


    // score text widget
    var scoreWidgetBorder = {
      x: (DEVICE_WIDTH - px(150)) / 2,
      y: px(100),
      w: px(150),
      h: px(80),
    }
    var scoreWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      ...scoreWidgetBorder,
      color: 0xffffff,
      text: '0',
      text_size: px(60),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    })

    // FPS widget
    if (data.json.showFPS) {
    var fpsWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      w: px(480),
      h: px(50),
      x: 0,
      y: px(60),
      color: 0x888888,
      text: 'FPS:0',
      text_size: px(30),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    })
    }

    // over widgets
    let overScoreValueBorder = {
      x: px(75),
      w: px(150),
      y: px(190),
      h: px(80),
    }
    let overWidgets = {
      scoreTitle: hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(60),
        y: px(130),
        w: px(180),
        h: px(60),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text: gettext('overScoreTitle'),
        color: 0x000000,
        text_size: px(36),
      }),
      scoreValue: hmUI.createWidget(hmUI.widget.TEXT, {
        ...overScoreValueBorder,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text: '' + score,
        color: 0xffffff,
        text_size: px(60),
      }),
      scoreIndex: hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(60),
        y: px(290),
        w: px(180),
        h: px(60),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text: '第3名',
        color: 0xffffff,
        text_size: px(36),
      }),
      perfectTitle: hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(240),
        w: px(180),
        y: px(130),
        h: px(60),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text: gettext('overPerfectTitle'),
        color: 0x000000,
        text_size: px(36),
      }),
      perfectValue: hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(255),
        w: px(150),
        y: px(190),
        h: px(80),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text: '' + '6',
        color: 0x000000,
        text_size: px(60),
      }),
      perfectIndex: hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(240),
        w: px(180),
        y: px(290),
        h: px(60),
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
        text: '第1名',
        color: 0x000000,
        text_size: px(36),
      }),
    }
    for (let key in overWidgets) {
      overWidgets[key].setProperty(hmUI.prop.VISIBLE, false)
    }

    // perfect widget 
    var perfectWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      w: px(300),
      h: px(50),
      x: (DEVICE_WIDTH - px(300)) / 2,
      y: px(180),
      color: 0xFFFD55,
      text: 'Good',
      text_size: px(36),
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V
    })
    perfectWidget.setProperty(hmUI.prop.VISIBLE, false)
    var fxPerfect = null

    // touch test widget
    var touchTestWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 0,
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT,
      text: ''
    })
    let clickDownEventFunc = info => {
      if (!over) { vibreate() }
      logger.debug('press')
      bPress = true
    }
    touchTestWidget.addEventListener(hmUI.event.CLICK_DOWN, clickDownEventFunc)

    var fallBlock = {
      left: {
        widget: {
          fill: hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: 66,
            h: LAYER_HEIGHT,
            color: 0x777777,
            radius: px(4)
          }),
          line: hmUI.createWidget(hmUI.widget.STROKE_RECT, {
            x: 0,
            y: 0,
            w: 66,
            h: LAYER_HEIGHT,
            color: 0x333333,
            radius: px(4),
            line_width: px(4)
          })
        },
        targetY: 666,
        nowY: 666,
        fx: null,
        visible: false
      },
      right: {
        widget: {
          fill: hmUI.createWidget(hmUI.widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: 66,
            h: LAYER_HEIGHT,
            color: 0x777777,
            radius: px(4)
          }),
          line: hmUI.createWidget(hmUI.widget.STROKE_RECT, {
            x: 414,
            y: 0,
            w: 66,
            h: LAYER_HEIGHT,
            color: 0x333333,
            radius: px(4),
            line_width: px(4)
          })
        },
        targetY: 666,
        nowY: 666,
        fx: null,
        visible: false
      }
    }

    // display function
    function display(locY) {
      if (locY == undefined) locY = fxY

      let upLayerIndex = Math.ceil((locY + DEVICE_HEIGHT) / LAYER_HEIGHT) - 1
      let upLayerOffset = LAYER_HEIGHT - ((locY + DEVICE_HEIGHT) % LAYER_HEIGHT) // LAYER top to SCREEN top >= 0
      if (upLayerOffset == LAYER_HEIGHT) upLayerOffset = 0
      let bottomLayerIndex = Math.ceil(locY / LAYER_HEIGHT) - 1
      let visibleLayerNumber = null
      if (upLayerIndex >= 0) {
        if (bottomLayerIndex < 0) bottomLayerIndex = 0
        visibleLayerNumber = upLayerIndex - bottomLayerIndex + 1
      }
      else {
        // nothing to display
        visibleLayerNumber = 0
      }
      // let endLayerOffset = LAYER_HEIGHT - locY % LAYER_HEIGHT

      // floor widget
      if (locY <= 0) { // show floor
        let offsetY = locY
        floorWidget.setProperty(hmUI.prop.VISIBLE, true)
        floorWidget.setProperty(hmUI.prop.MORE, {
          y: offsetY + DEVICE_HEIGHT,
          x: px(0),
          w: DEVICE_WIDTH,
          h: FLOOR_HEIGHT,
        })

      }
      else { // floor invisible
        floorWidget.setProperty(hmUI.prop.VISIBLE, false)
      }

      // layer widgets
      let tempY = 0 - upLayerOffset

      // fall widget
      if (fallBlock.left.visible
        && fallBlock.left.nowY > locY
        && fallBlock.left.nowY - LAYER_HEIGHT < locY + DEVICE_HEIGHT) {
        let offsetY = locY + DEVICE_HEIGHT - fallBlock.left.nowY
        fallBlock.left.widget.fill.setProperty(hmUI.prop.Y, offsetY)
        fallBlock.left.widget.line.setProperty(hmUI.prop.Y, offsetY)
      }
      else {
        fallBlock.left.widget.fill.setProperty(hmUI.prop.Y, 666)
        fallBlock.left.widget.line.setProperty(hmUI.prop.Y, 666)
      }
      if (fallBlock.right.visible
        && fallBlock.right.nowY > locY
        && fallBlock.right.nowY - LAYER_HEIGHT < locY + DEVICE_HEIGHT) {
        let offsetY = locY + DEVICE_HEIGHT - fallBlock.right.nowY
        fallBlock.right.widget.fill.setProperty(hmUI.prop.Y, offsetY)
        fallBlock.right.widget.line.setProperty(hmUI.prop.Y, offsetY)
      }
      else {
        fallBlock.right.widget.fill.setProperty(hmUI.prop.Y, 666)
        fallBlock.right.widget.line.setProperty(hmUI.prop.Y, 666)
      }


      // logger.debug('point A' + JSON.stringify({ startLayerIndex: upLayerIndex, startLayerOffset: upLayerOffset, endLayerIndex: bottomLayerIndex, visibleLayerNumber, tempY, locY }))
      for (let i = 0; i < TOTAL_LAYER_WIDGET_NUMBER; ++i) {

        // logger.debug('point B, i:'+i)
        if (i < visibleLayerNumber && upLayerIndex - i < nowLayerNumber) { // visible
          // if (i + endLayerIndex >= 0 && i + endLayerIndex < nowLayerNumber) {
          //logger.debug('i='+i+',true,1obj='+JSON.stringify({x:layers[i + endLayerIndex].x,w:layers[i + endLayerIndex].width,layer:layers[i + endLayerIndex].color.fill,y:tempY}))
          // try {
          layerWidgets[i].fill.setProperty(hmUI.prop.VISIBLE, true)
          layerWidgets[i].fill.setProperty(hmUI.prop.MORE, {
            x: layers[upLayerIndex - i].x,
            w: layers[upLayerIndex - i].width,
            color: layers[upLayerIndex - i].color.fill,
            y: tempY,
            h: LAYER_HEIGHT
          })
          //logger.debug('i='+i+',true,2obj='+JSON.stringify({x:layers[i + endLayerIndex].x,w:layers[i + endLayerIndex].width,layer:layers[i + endLayerIndex].color.line,y:tempY}))
          layerWidgets[i].line.setProperty(hmUI.prop.VISIBLE, true)
          layerWidgets[i].line.setProperty(hmUI.prop.MORE, {
            x: layers[upLayerIndex - i].x,
            w: layers[upLayerIndex - i].width,
            color: layers[upLayerIndex - i].color.line,
            y: tempY,
            h: LAYER_HEIGHT
          })

          // } 
          // catch (e) {
          //   logger.debug('get value of(TOTAL_LAYER_WIDGET_NUMBER - i - 1) + endLayerIndex = ' + (TOTAL_LAYER_WIDGET_NUMBER - i - 1) + bottomLayerIndex)

          // }
          // logger.debug('color:' + JSON.stringify({
          //   x: layers[i + endLayerIndex].x,
          //   w: layers[i + endLayerIndex].width,
          //   color: layers[i + endLayerIndex].color.fill,
          //   y: tempY,
          //   h: LAYER_HEIGHT
          // }))
          tempY += LAYER_HEIGHT
          // }
          // else {
          //   //logger.debug('i='+i+',false')
          //   layerWidgets[i].fill.setProperty(hmUI.prop.VISIBLE, false)
          //   layerWidgets[i].line.setProperty(hmUI.prop.VISIBLE, false)
          // }
        }
        else {// invisible
          layerWidgets[i].fill.setProperty(hmUI.prop.VISIBLE, false)
          layerWidgets[i].line.setProperty(hmUI.prop.VISIBLE, false)
          if (upLayerIndex - i >= nowLayerNumber) {
            tempY += LAYER_HEIGHT
          }
        }
      }


    }
    //logger.debug('point 3')
    var fxMoveY = null
    var fxScore = null
    var fxOverScore = null
    var scoreTargetColor = 0xffffff
    var scoreNowColor = 0xffffff
    function gameOver() {
      over = true
      // timer.stopTimer(mainLoopTimer)
      // mainLoopTimer = null



      // 排名
      let scoreList = data.json.record.score[data.json.difficulty - 1]
      let scoreListLength = scoreList.length
      let scoreIndex = 0
      if (scoreListLength == 0) {
        scoreIndex = 0
        data.json.record.score[data.json.difficulty - 1].push(score)
      }
      else {
        // seek splice index
        for (let i = 0; i < scoreListLength; ++i) {
          if (score == scoreList[i]) {
            // don't push
            scoreIndex = i
            break;
          }
          else if (score > scoreList[i]) {
            scoreIndex = i
            if (i < scoreListLength - 1 && scoreList[i + 1] == score) {
              // same score. dont push
            }
            else { data.json.record.score[data.json.difficulty - 1].splice(i, 0, score) }
            break;
          }
          if(i == scoreListLength - 1) {
            data.json.record.score[data.json.difficulty - 1].push(score)
            scoreIndex = scoreListLength
          }
        }
      }

      let comboList = data.json.record.combo[data.json.difficulty - 1]
      let comboListLength = comboList.length
      let comboIndex = 0
      if (comboListLength == 0) {
        comboIndex = 0
        data.json.record.combo[data.json.difficulty - 1].push(maxCombo)
      }
      else {
        // seek splice index
        for (let i = 0; i < comboListLength; ++i) {
          if (maxCombo == comboList[i]) {
            // don't push
            comboIndex = i
            break;
          }
          else if (maxCombo > comboList[i]) {
            comboIndex = i
            if (i < comboListLength - 1 && comboList[i + 1] == maxCombo) {
              // same combo. dont push
            }
            else { data.json.record.combo[data.json.difficulty - 1].splice(i, 0, maxCombo) }
            break;
          }
          
          if(i == comboListLength - 1) {
            data.json.record.combo[data.json.difficulty - 1].push(maxCombo)
            comboIndex = comboListLength
          }
        }
      }
      data.save()
      overWidgets.scoreIndex.setProperty(hmUI.prop.TEXT, 
        gettext('overScoreTextLeft') + (scoreIndex + 1) +gettext('overScoreTextRight'))
      overWidgets.perfectIndex.setProperty(hmUI.prop.TEXT, 
        gettext('overPerfectTextLeft') + (comboIndex + 1) +gettext('overPerfectTextRight'))

      if (fxMoveY != null) {
        fxMoveY.setEnable(false)
        fxMoveY = null
      }


      if (fallBlock.left.fx != null) {
        fallBlock.left.fx.setEnable(false)
        fallBlock.left.fx = false
      }
      if (fallBlock.right.fx != null) {
        fallBlock.right.fx.setEnable(false)
        fallBlock.right.fx = false
      }
      fallBlock.left.visible = true
      fallBlock.right.visible = false
      fallBlock.left.widget.fill.setProperty(hmUI.prop.MORE, {
        x: layers[nowLayerNumber - 1].x,
        w: layers[nowLayerNumber - 1].width,
        y: 666,
        h: LAYER_HEIGHT,
        color: layers[nowLayerNumber - 1].color.fill
      })
      fallBlock.left.widget.line.setProperty(hmUI.prop.MORE, {
        x: layers[nowLayerNumber - 1].x,
        w: layers[nowLayerNumber - 1].width,
        color: layers[nowLayerNumber - 1].color.line
      })
      fallBlock.left.nowY = LAYER_HEIGHT * nowLayerNumber
      fallBlock.left.targetY = fallBlock.left.nowY - px(480)
      fallBlock.left.fx = new Fx({
        begin: fallBlock.left.nowY, // 初始函数值
        end: fallBlock.right.targetY, // 结束函数值
        fps,    // 帧率
        time: 0.5,    // 总时长(秒)
        style: Fx.Styles.EASE_OUT_QUAD, // 预设类型 见注释第7-9行
        onStop() {
          fallBlock.left.visible = false
          fallBlock.left.fx = null
        }, // 动画结束后的回调函数
        // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
        func: result => {
          fallBlock.left.nowY = result
        },
        outTimer: true
      })

      nowY = nowLayerNumber * LAYER_HEIGHT - 300
      fxY = -100

      overWidgets.scoreValue.setProperty(hmUI.prop.TEXT, '' + score)
      overWidgets.perfectValue.setProperty(hmUI.prop.TEXT, '' + maxCombo)
      for (let key in overWidgets) {
        overWidgets[key].setProperty(hmUI.prop.VISIBLE, true)
      }
      scoreWidget.setProperty(hmUI.prop.VISIBLE, false)

      fxOverScore = new Fx({
        begin: 0, // 初始函数值
        end: 1.0, // 结束函数值
        fps,    // 帧率
        time: 0.5,    // 总时长(秒)
        style: Fx.Styles.EASE_IN_QUAD, // 预设类型 见注释第7-9行
        onStop() {
          fxOverScore = null
        }, // 动画结束后的回调函数
        // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
        func: result => {
          let border = Fx.getMixBorder(scoreWidgetBorder, overScoreValueBorder, result)
          overWidgets.scoreValue.setProperty(hmUI.prop.MORE, {
            x: border.x,
            y: border.y,
          })
          let color = Fx.getMixColor(0x000000, 0xffffff, result)
          overWidgets.perfectTitle.setProperty(hmUI.prop.COLOR, color)
          overWidgets.perfectValue.setProperty(hmUI.prop.COLOR, color)
          overWidgets.scoreTitle.setProperty(hmUI.prop.COLOR, color)
          let color2 = Fx.getMixColor(0x000000, 0xFFF200, result)
          overWidgets.scoreIndex.setProperty(hmUI.prop.COLOR, color2)
          overWidgets.perfectIndex.setProperty(hmUI.prop.COLOR, color2)
        },
        outTimer: true
      })
      fxMoveY = new Fx({
        begin: fxY, // 初始函数值
        end: nowY, // 结束函数值
        fps,    // 帧率
        time: 1.5,    // 总时长(秒)
        style: Fx.Styles.EASE_IN_OUT_QUAD, // 预设类型 见注释第7-9行
        onStop() {
          fxMoveY = null

          hmApp.registerSpinEvent(function (key, degree) {
            nowY += degree
            losedYChanged = true
          })
          touchTestWidget.removeEventListener(hmUI.event.CLICK_DOWN, clickDownEventFunc)
          touchTestWidget.addEventListener(hmUI.event.CLICK_DOWN, info => {
            losedTouchLastY = info.y
          })
          touchTestWidget.addEventListener(hmUI.event.MOVE, info => {
            nowY -= losedTouchLastY - info.y
            losedTouchLastY = info.y
            losedYChanged = true
          })
        }, // 动画结束后的回调函数
        // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
        func: result => { fxY = result },
        outTimer: true
      })

      //返回按钮
      var backButton = hmUI.createWidget(hmUI.widget.BUTTON, {
        x: 0,
        y: DEVICE_HEIGHT - px(100),
        w: DEVICE_WIDTH,
        h: px(100),
        press_color: 0x666666,
        normal_color: 0x333333,
        text: gettext('backButton'),
        text_size: px(36),
        click_func: () => { hmApp.goBack() }
      })

      layers.pop()
      nowLayerNumber--
    }

    // FPSShower
    if (data.json.showFPS) { var fpsShower = new FPSShower(fps => { fpsWidget.setProperty(hmUI.prop.TEXT, 'FPS:' + fps) }, 1000) }

    
    let mainLoopTimer = new SmoothTimer( //timer.createTimer(
      0, MAIN_LOOP_TIMER_DELAY,
      option => {
        if (data.json.showFPS) fpsShower.time()
        if (hmVibrateEnable) { hmVibrateSensor.stop() }
        if (over) {
          if (losedYChanged) {
            if (fxLosedYChange) { fxLosedYChange.setEnable(false) }
            fxLosedYChange = new Fx({
              begin: fxY, // 初始函数值
              end: nowY, // 结束函数值
              fps,    // 帧率
              time: 0.25,    // 总时长(秒)
              style: Fx.Styles.EASE_IN_QUAD, // 预设类型 见注释第7-9行
              onStop() {
                fxLosedYChange = null
              }, // 动画结束后的回调函数
              // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
              func: result => { fxY = result; display(result) },
              outTimer: true
            })
          }
          if (fxLosedYChange) { fxLosedYChange.step() }
        }
        else {
          if (bPress) {
            bPress = false
            layers[nowLayerNumber - 1].bSolid = true
            let leftFallWidth = 0
            let rightFallWidth = 0
            if (nowLayerNumber > 1) {
              if (layers[nowLayerNumber - 1].x > layers[nowLayerNumber - 2].x + layers[nowLayerNumber - 2].width
                || layers[nowLayerNumber - 1].x + layers[nowLayerNumber - 1].width < layers[nowLayerNumber - 2].x) {
                //layers.pop()
                gameOver(); return
              }// TODO
              else {
                // right
                if (layers[nowLayerNumber - 1].x + layers[nowLayerNumber - 1].width > layers[nowLayerNumber - 2].x + layers[nowLayerNumber - 2].width) {
                  rightFallWidth = layers[nowLayerNumber - 1].x + layers[nowLayerNumber - 1].width - (layers[nowLayerNumber - 2].x + layers[nowLayerNumber - 2].width)

                }
                // left
                if (layers[nowLayerNumber - 1].x < layers[nowLayerNumber - 2].x) {
                  leftFallWidth = layers[nowLayerNumber - 2].x - layers[nowLayerNumber - 1].x

                }
                //logger.debug(JSON.stringify({ leftFallWidth, rightFallWidth, layer: layers[nowLayerNumber - 1] }))
              }
              if (layers[nowLayerNumber - 1].width < MIN_WIDTH) { /*layers.pop();*/ gameOver(); return }

              // falling Fx
              if (Math.abs(layers[nowLayerNumber - 1].x - layers[nowLayerNumber - 2].x) < PERFECT_RANGE) { // perfect
                if (fallBlock.left.fx != null) { fallBlock.left.fx.setEnable(false); fallBlock.left.fx = null }
                if (fallBlock.right.fx != null) { fallBlock.right.fx.setEnable(false); fallBlock.right.fx = null }
                layers[nowLayerNumber - 1].x = layers[nowLayerNumber - 2].x
                if (fxPerfect != null) { fxPerfect.setEnable(false) }
                perfectWidget.setProperty(hmUI.prop.VISIBLE, true)
                perfectWidget.setProperty(hmUI.prop.TEXT, gettext('perfectText') + ' x' + ++perfectTimes)
                if (perfectTimes > maxCombo) { maxCombo = perfectTimes }
                fxPerfect = new Fx({
                  begin: px(50), // 初始函数值
                  end: px(32), // 结束函数值
                  fps,    // 帧率
                  time: 0.2,    // 总时长(秒)
                  style: Fx.Styles.EASE_IN_QUAD, // 预设类型 见注释第7-9行
                  onStop() {
                    fxPerfect = new Fx({
                      begin: 0, // 初始函数值
                      end: 0, // 结束函数值
                      fps,    // 帧率
                      time: 0.4,    // 总时长(秒)
                      style: Fx.Styles.EASE_OUT_QUAD, // 预设类型 见注释第7-9行
                      onStop() { fxPerfect = null; perfectWidget.setProperty(hmUI.prop.VISIBLE, false) }, // 动画结束后的回调函数
                      // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
                      func: result => { 
                        //perfectWidget.setProperty(hmUI.prop.TEXT_SIZE, result) 
                      },
                      outTimer: true
                    })
                  }, // 动画结束后的回调函数
                  // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
                  func: result => { perfectWidget.setProperty(hmUI.prop.TEXT_SIZE, result) },
                  outTimer: true
                })
                fallBlock.left.visible = false
                fallBlock.right.visible = false
                console.log('perfect')
              }
              else {// left
                perfectTimes = 0
                if (fallBlock.left.fx != null) { fallBlock.left.fx.setEnable(false); fallBlock.left.fx = null }
                if (leftFallWidth > 0) {
                  layers[nowLayerNumber - 1].width -= leftFallWidth
                  layers[nowLayerNumber - 1].x = layers[nowLayerNumber - 2].x
                  //logger.debug('left:' + JSON.stringify({ leftFallWidth, x: layers[nowLayerNumber - 2].x - leftFallWidth, color: layers[nowLayerNumber - 1].color }))
                  fallBlock.left.nowY = nowLayerNumber * LAYER_HEIGHT
                  fallBlock.left.targetY = fallBlock.left.nowY - px(480)
                  fallBlock.left.visible = true
                  fallBlock.left.widget.fill.setProperty(hmUI.prop.MORE, {
                    x: layers[nowLayerNumber - 2].x - leftFallWidth,
                    y: 666,
                    h: LAYER_HEIGHT,
                    w: leftFallWidth,
                    color: layers[nowLayerNumber - 1].color.fill,
                  })
                  fallBlock.left.widget.line.setProperty(hmUI.prop.MORE, {
                    x: layers[nowLayerNumber - 2].x - leftFallWidth,
                    w: leftFallWidth,
                    color: layers[nowLayerNumber - 1].color.line,
                  })
                  fallBlock.left.fx = new Fx({
                    begin: fallBlock.left.nowY, // 初始函数值
                    end: fallBlock.left.targetY, // 结束函数值
                    fps,    // 帧率
                    time: 0.5,    // 总时长(秒)
                    style: Fx.Styles.EASE_OUT_QUAD, // 预设类型 见注释第7-9行
                    onStop() { fallBlock.left.fx = null; fallBlock.left.visible = false }, // 动画结束后的回调函数
                    // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
                    func: result => { fallBlock.left.nowY = result },
                    outTimer: true
                  })
                }
                else {
                  fallBlock.left.visible = false
                }
                // right
                if (fallBlock.right.fx != null) { fallBlock.right.fx.setEnable(false); fallBlock.right.fx = null }
                if (rightFallWidth > 0) {
                  layers[nowLayerNumber - 1].width -= rightFallWidth
                  fallBlock.right.nowY = nowLayerNumber * LAYER_HEIGHT
                  fallBlock.right.targetY = fallBlock.right.nowY - px(480)
                  fallBlock.right.visible = true
                  fallBlock.right.widget.fill.setProperty(hmUI.prop.MORE, {
                    x: layers[nowLayerNumber - 2].x + layers[nowLayerNumber - 2].width,
                    w: rightFallWidth,
                    y: 666,
                    h: LAYER_HEIGHT,
                    color: layers[nowLayerNumber - 1].color.fill,
                  })
                  fallBlock.right.widget.line.setProperty(hmUI.prop.MORE, {
                    x: layers[nowLayerNumber - 2].x + layers[nowLayerNumber - 2].width,
                    w: rightFallWidth,
                    color: layers[nowLayerNumber - 1].color.line,
                  })
                  fallBlock.right.fx = new Fx({
                    begin: fallBlock.right.nowY, // 初始函数值
                    end: fallBlock.right.targetY, // 结束函数值
                    fps,    // 帧率
                    time: 0.5,    // 总时长(秒)
                    style: Fx.Styles.EASE_OUT_QUAD, // 预设类型 见注释第7-9行
                    onStop() { fallBlock.right.fx = null; fallBlock.right.visible = false }, // 动画结束后的回调函数
                    // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
                    func: result => { fallBlock.right.nowY = result },
                    outTimer: true
                  })
                }
                else {
                  fallBlock.right.visible = false
                }
              }

            } // if nowLayerNumber > 1



            lastWidth = layers[nowLayerNumber - 1].width
            layers.push({
              width: lastWidth,
              bSolid: false,
              x: getRandomX(),
              layer: nowLayerNumber,
              color: getRandomColor()
            })

            nowLayerNumber++
            if (fxScore != null) { fxScore.setEnable(false); scoreWidget.setProperty(hmUI.prop.TEXT, '' + score) }
            score++
            fxScore = new Fx({
              begin: 0, // 初始函数值
              end: 1, // 结束函数值
              fps,    // 帧率
              time: 0.1,    // 总时长(秒)
              style: Fx.Styles.EASE_OUT_QUAD, // 预设类型 见注释第7-9行
              onStop() {
                fxScore = new Fx({
                  begin: 0, // 初始函数值
                  end: 1, // 结束函数值
                  fps,    // 帧率
                  time: 0.1,    // 总时长(秒)
                  style: Fx.Styles.EASE_IN_QUAD, // 预设类型 见注释第7-9行
                  onStop() {
                    fxScore = null

                  }, // 动画结束后的回调函数
                  // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
                  func: result => {
                    scoreWidget.setProperty(hmUI.prop.TEXT, '' + score)
                    let res = Fx.getMixColor(0x000000, 0xffffff, result)
                    // logger.debug('out' + Fx.getMixColor(0xffffff, 0x000000, result))
                    scoreWidget.setProperty(hmUI.prop.COLOR, res)
                  },
                  outTimer: true
                })
              }, // 动画结束后的回调函数
              // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
              func: result => {
                let res = Fx.getMixColor(0xffffff, 0x000000, result)
                // logger.debug('in' + Fx.getMixColor(0xffffff, 0x000000, result))
                scoreWidget.setProperty(hmUI.prop.COLOR, res)
              },
              outTimer: true
            })
            topLayerData.layerIndex = nowLayerNumber - 1
            topLayerData.facing = getRandomFacing()
            nowY += LAYER_HEIGHT
            if (fxMoveY != null) { fxMoveY.setEnable(false) }
            fxMoveY = new Fx({
              begin: fxY, // 初始函数值
              end: nowY, // 结束函数值
              fps,    // 帧率
              time: 0.6,    // 总时长(秒)
              style: Fx.Styles.EASE_IN_QUAD, // 预设类型 见注释第7-9行
              onStop() { fxMoveY = null }, // 动画结束后的回调函数
              // 每一帧的回调函数，参数为当前函数值，取值范围为[begin, end]
              func: result => { fxY = result; },
              outTimer: true
            })

          }
          else {
            if (topLayerData.facing == facing.LEFT) {
              // logger.debug('left')
              layers[topLayerData.layerIndex].x -= topLayerData.speed
              if (layers[topLayerData.layerIndex].x <= 0) {
                layers[topLayerData.layerIndex].x = 0
                topLayerData.facing = facing.RIGHT
              }
            }
            else if (topLayerData.facing == facing.RIGHT) {
              // logger.debug('right')
              layers[topLayerData.layerIndex].x += topLayerData.speed
              if (layers[topLayerData.layerIndex].x + layers[topLayerData.layerIndex].width >= DEVICE_WIDTH) {
                layers[topLayerData.layerIndex].x = DEVICE_WIDTH - layers[topLayerData.layerIndex].width
                topLayerData.facing = facing.LEFT
              }
            }
          }
        }
        if (fxMoveY) {
          fxMoveY.step()
        }
        if (fallBlock.left.fx) {
          fallBlock.left.fx.step()
        }
        if (fallBlock.right.fx) {
          fallBlock.right.fx.step()
        }
        if (fxPerfect) {
          fxPerfect.step()
        }
        if (fxScore) {
          fxScore.step()
        }
        if (fxOverScore) {
          fxOverScore.step()
        }
        display()
      }, {/* option */ },
      SmoothTimer.modes.DYNAMIC_SMOOTH
    )

  },
  onInit() {
    logger.debug('page onInit invoked')
  },

  onDestroy() {
    logger.debug('page onDestroy invoked')
    hmVibrateSensor.stop()
    //取消注册按键监听
    hmApp.unregisterSpinEvent()
  },
})
