import { gettext } from "i18n"
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = hmSetting.getDeviceInfo()
const logger = DeviceRuntimeCore.HmLogger.getLogger('home')
Page({
  build() {
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
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: px(110),
      y: px(85),
      w: px(260),
      h: px(90),
      radius: px(45),
      normal_color: 0x333333,
      press_color: 0x555555,
      text_size: px(36),
      text: gettext('startGame'),
      click_func: () => {hmApp.gotoPage({file: 'page/454x454/game/index.page'})}
    })
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: px(110),
      y: px(220),
      w: px(260),
      h: px(90),
      radius: px(45),
      normal_color: 0x333333,
      press_color: 0x555555,
      text_size: px(36),
      text: gettext('startSet'),
      click_func: () => {hmApp.gotoPage({file: 'page/454x454/set/index.page'})}
    })
    hmUI.createWidget(hmUI.widget.BUTTON, {
      x: (DEVICE_WIDTH - px(80)) / 2,
      y: px(345),
      w: px(80),
      h: px(80),
      normal_src: 'image/ranking.png',
      press_src: 'image/rankingPress.png',
      click_func: () => {hmApp.gotoPage({file: 'page/454x454/ranking/index.page'})}
    })
  },
  onInit() {
    logger.debug('page onInit invoked')
  },

  onDestroy() {
    logger.debug('page onDestroy invoked')
  },
})