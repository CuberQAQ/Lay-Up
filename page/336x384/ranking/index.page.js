import { gettext } from "i18n"
import { data } from "../../../utils/data"
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = hmSetting.getDeviceInfo()
const logger = DeviceRuntimeCore.HmLogger.getLogger('home')
Page({
  build() {
    logger.debug(JSON.stringify(data.json))
    function show(level) {
      level -= 1
      { // score
        let length = data.json.record.score[level].length
        for (let i = 0; i < 5; ++i) {
          if (i < length) {
            rankScore[i].setProperty(hmUI.prop.TEXT, '' + data.json.record.score[level][i])
            logger.debug(''+i+':'+data.json.record.score[level][i])
          }
          else {
            rankScore[i].setProperty(hmUI.prop.TEXT, '---')
          }
        }
      }
      { // combo
        let length = data.json.record.combo[level].length
        for (let i = 0; i < 5; ++i) {
          if (i < length) {
            rankPerfect[i].setProperty(hmUI.prop.TEXT, '' + data.json.record.combo[level][i])
          }
          else {
            rankPerfect[i].setProperty(hmUI.prop.TEXT, '---')
          }
        }
      }
    }
    // hmUI.createWidget(hmUI.widget.ARC, {
    //   x: 0,
    //   y: 0,
    //   w: px(480),
    //   h: px(480),
    //   start_angle: 0,
    //   end_angle: 359,
    //   line_width: 2,
    //   color: 0x666666,
    // })
    let showDiffi = data.json.difficulty
    let modeButton = hmUI.createWidget(hmUI.widget.BUTTON, {
      x: px(150),
      y: px(30) + px(56),
      h: px(50),
      w: px(180),
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: px(25),
      text_size: px(26),
      text: gettext('difficulty' + showDiffi)
        + (showDiffi == data.json.difficulty ? ('(' + gettext('rankingDiffiNow') + ')') : ''),
      click_func: () => {
        let availableList = [1, 2, 3, 4]
        let index = availableList.findIndex((value) => { return value == showDiffi })
        if (index < 0 || index >= availableList.length - 1) index = 0
        else index++
        showDiffi = availableList[index]
        modeButton.setProperty(hmUI.prop.TEXT, gettext('difficulty' + showDiffi)
          + (showDiffi == data.json.difficulty ? ('(' + gettext('rankingDiffiNow') + ')') : ''))
        show(showDiffi)
      }
    })
    let indexTitle = hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(60),
      w: px(120),
      h: px(60),
      y: px(82) + px(56),
      text: gettext('indexTitle'),
      text_size: px(32),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    })
    let scoreTitle = hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(180),
      w: px(120),
      h: px(60),
      y: px(82) + px(56),
      text: gettext('overScoreTitle'),
      text_size: px(32),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    })
    let perfectTitle = hmUI.createWidget(hmUI.widget.TEXT, {
      x: px(300),
      w: px(120),
      h: px(60),
      y: px(82) + px(56),
      text: gettext('overPerfectTitle'),
      text_size: px(32),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    })
    let rankIndex = [
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(105),
        y: px(150) + px(56),
        w: px(30),
        h: px(30),
        radius: px(15),
        press_color: 0xFFF200,
        normal_color: 0xFFF200,
        text: '1',
        color: 0x000000,
        text_size: px(20),

      }),
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(105),
        y: px(210) + px(56),
        w: px(30),
        h: px(30),
        radius: px(15),
        press_color: 0xDDDDDD,
        normal_color: 0xDDDDDD,
        text: '2',
        color: 0x000000,
        text_size: px(20),

      }),
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(105),
        y: px(270) + px(56),
        w: px(30),
        h: px(30),
        radius: px(15),
        press_color: 0xFCA22E,
        normal_color: 0xFCA22E,
        text: '3',
        color: 0x000000,
        text_size: px(20),

      }),
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(105),
        y: px(330) + px(56),
        w: px(30),
        h: px(30),
        radius: px(15),
        // press_color: 0xFFF200,
        // normal_color: 0xFFF200,
        text: '4',
        text_color: 0xffffff,
        text_size: px(25),

      }),
      hmUI.createWidget(hmUI.widget.BUTTON, {
        x: px(105),
        y: px(390) + px(56),
        w: px(30),
        h: px(30),
        radius: px(15),
        // press_color: 0xFFF200,
        // normal_color: 0xFFF200,
        text: '5',
        text_color: 0xffffff,
        text_size: px(25),
      })
    ]
    let rankScore = [
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(180),
        w: px(120),
        h: px(60),
        y: px(135) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(180),
        w: px(120),
        h: px(60),
        y: px(195) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(180),
        w: px(120),
        h: px(60),
        y: px(255) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(180),
        w: px(120),
        h: px(60),
        y: px(315) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(180),
        w: px(120),
        h: px(60),
        y: px(375) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
    ]
    let rankPerfect = [
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(300),
        w: px(120),
        h: px(60),
        y: px(135) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(300),
        w: px(120),
        h: px(60),
        y: px(195) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(300),
        w: px(120),
        h: px(60),
        y: px(255) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(300),
        w: px(120),
        h: px(60),
        y: px(315) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
      hmUI.createWidget(hmUI.widget.TEXT, {
        x: px(300),
        w: px(120),
        h: px(60),
        y: px(375) + px(56),
        text: '---',
        text_size: px(32),
        color: 0xffffff,
        align_h: hmUI.align.CENTER_H,
        align_v: hmUI.align.CENTER_V,
      }),
    ]


    show(showDiffi)
  },
  onInit() {
    logger.debug('page onInit invoked')
  },

  onDestroy() {
    logger.debug('page onDestroy invoked')
  },
})