import { SetItemMaker, SetPage, SetTool } from "../../../utils/setlist"
import { gettext } from 'i18n'
import { data } from "../../../utils/data"
const logger = DeviceRuntimeCore.HmLogger.getLogger('main')

var themeNumber = 3
var checkChanged = 0
Page({
  build() {
    let pageArray = [
      // mainPage
      SetPage.shellCreate({
        "name": "main",
        "items": [
          { // title
            "name": "title",
            "type": SetItemMaker.Types.TEXT,
            "style": SetItemMaker.Styles.HEAD,
            "data": { "text": gettext('setTitle') }
          },
          { // difficulty
            "name": "difficulty",
            "style": SetItemMaker.Styles.BODY,
            "type": SetItemMaker.Types.TEXT | SetItemMaker.Types.SUBTEXT | SetItemMaker.Types.ARROW,
            "data": {
              "text": { "text": gettext('setDifTitle') },
              "subtext": {
                "text": gettext('difficulty' + data.json.difficulty)
              },
              "arrow": {
                click_func: item => {
                  checkChanged = false
                  item.getParentPage().getParentTool().gotoPageByName("difficultyChoose")
                }
              }
              // "button": {
              //   x: px(340),
              //   w: px(110),
              //   text_size: px(36),
              //   h: px(60),
              //   radius: px(30),
              //   normal_color: 0x333333,
              //   press_color: 0x555555,
              //   text: gettext('setDiffButton'),
              //   click_func() {
              //     let availableList = [1, 2, 3, 4]
              //     let index = availableList.findIndex((value) => { return value == data.json.difficulty })
              //     if (index < 0 || index >= availableList.length - 1) index = 0
              //     else index++
              //     console.log("index:" + index);
              //     data.json.difficulty = availableList[index]
              //     data.save()
              //     setTool
              //       .getPageByName("main")
              //       .getItemByName("difficulty")
              //       .widgets["subtext"]
              //       .setProperty(hmUI.prop.TEXT, gettext('difficulty' + availableList[index]))
              //   }
              // }
            }
          },
          { // showFPS
            "name": "showFPS",
            "style": SetItemMaker.Styles.BODY,
            "type": SetItemMaker.Types.TEXT | SetItemMaker.Types.SUBTEXT | SetItemMaker.Types.SWITCH,
            "data": {
              "text": { "text": gettext('setShowFPSTitle') },
              "subtext": {
                "text": gettext('setShowFPSSubText')
              },
              "switch": {
                get_func: () => data.json.showFPS,
                click_func: checked => {
                  data.json.showFPS = checked
                  data.save()
                }
              }
            }
          },
          // { // best
          //   "name": "best",
          //   "type": SetItemMaker.Types.TEXT | SetItemMaker.Types.SUBTEXT,
          //   "style": SetItemMaker.Styles.BODY,
          //   "data": {
          //     "text": { 'text': gettext('setBest') },
          //     "subtext": {
          //       "text": '' + data.json.record,
          //     },
          //   },

          // },
          { // author
            "name": "author",
            "type": SetItemMaker.Types.TEXT | SetItemMaker.Types.SUBTEXT,
            "style": SetItemMaker.Styles.BODY,
            "data": {
              "text": { 'text': gettext('setAuthorTitle') },
              "subtext": {
                "text": '@CuberQAQ',
              },
            },
          },
          // { // TODO Finish (For test)
          //   "name": "finish",
          //   "style": SetItemMaker.Styles.BODY,
          //   "type": SetItemMaker.Types.BUTTON,
          //   "data": {
          //     "button": {
          //       normal_color: 0x333333,
          //       press_color: 0x555555,
          //       text_size: px(36),
          //       text: gettext('setFinish'),
          //       click_func() {
          //         // hmApp.gotoPage({ url: "page/480x480/start/index.page", param: "" })
          //         hmApp.goBack()
          //       }
          //     }
          //   }
          // },
          // { // TODO Finish (For test)
          //   "name": "start",
          //   "style": SetItemMaker.Styles.BODY,
          //   "type": SetItemMaker.Types.BUTTON,
          //   "data": {
          //     "button": {
          //       normal_color: 0x333333,
          //       press_color: 0x555555,
          //       text_size: px(36),
          //       text: gettext('setStart'),
          //       click_func() {
          //         hmApp.gotoPage({ url: "page/480x480/main/index.page", param: "" })
          //       }
          //     }
          //   }
          // }
        ]
      },),

      // difficultyChoose
      SetPage.shellCreate({
        "name": "difficultyChoose",
        "items": [
          {
            "name": "title",
            "style": SetItemMaker.Styles.HEAD,
            "type": SetItemMaker.Types.TEXT,
            "data": { "text": gettext('setDifficultyChooseTitle') }
          },
          {
            "name": "radioList",
            "style": SetItemMaker.Styles.BODY,
            "type": SetItemMaker.Types.RADIO_BOXES,
            "data": {
              "radio_boxes": {
                items: [
                  gettext("difficulty1"),
                  gettext("difficulty2"),
                  gettext("difficulty3"),
                  gettext("difficulty4"),
                ],
                get_func() { return data.json.difficulty - 1 },
                click_func(index, item) {
                  data.json.difficulty = index + 1
                  data.save()
                  item.getParentPage().getParentTool().getPageByName("main").getItemByName("difficulty").data.subtext.text = gettext("difficulty"+(index+1))
                  if(checkChanged > 1) {
                    item.getParentPage().getParentTool().goBackNow()
                  }
                  checkChanged++
                  //item.getParentPage().getParentTool().goBackNow()
                }
              }
            }
          },
        ]
      })
    ]
    var setTool = new SetTool({
      pageArray,
      mainPageInstance: pageArray[0],
      onExit_func() { }
    })
    setTool.start()
  },
  onInit() {
    logger.debug('page onInit invoked')
  },

  onDestroy() {
    logger.debug('page onDestroy invoked')
  },
})