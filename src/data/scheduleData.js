/**
 * 课程表数据
 * 第五临床医学院 临床医学 2023级 6班7班（湖州市中心医院）
 *
 * 地点格式说明：
 * 1. 字符串格式：所有周次使用相同地点
 *    location: "教学楼A101"
 *
 * 2. 对象格式：为不同周次指定不同地点
 *    location: {
 *      default: "教学楼A101",  // 默认地点（可选）
 *      weeks: {
 *        1: "教学楼B202",      // 第1周的地点
 *        3: "教学楼C303",      // 第3周的地点
 *        "5-8": "实验楼D404"   // 第5-8周的地点
 *      }
 *    }
 *
 * 备注格式说明：
 * 1. 字符串格式：所有周次使用相同备注
 *    note: "2学时×14（共28学时）"
 *
 * 2. 对象格式：为不同周次指定不同备注
 *    note: {
 *      default: "",  // 默认备注（可选）
 *      weeks: {
 *        1: "第1周备注",        // 第1周的备注
 *        3: "第3周备注",        // 第3周的备注
 *        "5-8": "第5-8周备注"   // 第5-8周的备注
 *      }
 *    }
 */

export const scheduleData = [
  // 星期一
  {
    day: "Monday",
    periods: [
      { period: 1, courses: [
          { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: { 7: "心力衰竭、心律失常（中） - 沈枫", 8: "心律失常 - 叶芬", 9: "冠心病 - 卢孔杰" } }, location: "11号楼1楼大教室" }
        ]},
      { period: 2, courses: [
          { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: { 7: "心力衰竭、心律失常（中） - 沈枫", 8: "心律失常 - 叶芬", 9: "冠心病 - 卢孔杰" } }, location: "11号楼1楼大教室" }
        ]},
      { period: 3, courses: [
          { name: "神经病学B", weeks: [4,5,7,8,11,12,13,14,15], group: null, note: { default: "", weeks: { 7: "认知障碍性疾病，运动神经元病 - 朱衡亚", 8: "中枢神经系统脱髓鞘疾病 - 邱彩霞", 9: "运动障碍性疾病 - 汤海燕" } }, location: "11号楼1楼大教室" }
        ] },
      { period: 4, courses: [
          { name: "神经病学B", weeks: [4,5,7,8,11,12,13,14,15], group: null, note: { default: "", weeks: { 7: "认知障碍性疾病，运动神经元病 - 朱衡亚", 8: "中枢神经系统脱髓鞘疾病 - 邱彩霞", 9: "运动障碍性疾病 - 汤海燕" } }, location: "11号楼1楼大教室" }
        ]},
      { period: 5, courses: []},
      { period: 6, courses: [
          { name: "儿科学A", weeks: [1], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: { 8: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 5: "8号楼805病区会议室", 8: "8号楼5楼的805病区会议室" } } },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: { 7: "呼吸科见习1 - 季冬翔", 9: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼的805病区会议室" } } },
          { name: "外科学见习", weeks: [9], group: "7班D组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: { default: "", weeks: { 7: "病史采集/体格检查 - 钱凯", 9: "病例讨论：新生儿疾病 - 黄昀" } }, location: { default: "未排地点", weeks: { 7: "5号楼7楼的507病区示教室", 9: "5号楼7楼507病区示教室" } } },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: { 8: "病史采集、体格检查 - 钱凯" } }, location: { default: "未排地点", weeks: { 8: "5号楼7楼507病区示教室" } } },
          { name: "外科学见习", weeks: [8,14], group: "7班C组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } },
          { name: "口腔科见习", weeks: [7,11,13,16], group: "7班C、D组", note: { default: "", weeks: { 7: "实验一 口腔颌面部检查以及病历书写 - 陈思琦" } }, location: { default: "未排地点", weeks: { 7: "门诊3楼B1区口腔科示教室" } } }
        ]},
      { period: 7, courses: [
          { name: "儿科学A", weeks: [1], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: { 8: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 5: "8号楼805病区会议室", 8: "8号楼5楼的805病区会议室" } } },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: { 7: "呼吸科见习1 - 季冬翔", 9: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼的805病区会议室" } } },
          { name: "内科学见习", weeks: [9], group: "6班B组", note: { default: "", weeks: { 9: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 9: "8号楼5楼805病区会议室" } } },
          { name: "外科学见习", weeks: [9], group: "7班D组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: { default: "", weeks: { 7: "病史采集/体格检查 - 钱凯", 9: "病例讨论：新生儿疾病 - 黄昀" } }, location: { default: "未排地点", weeks: { 7: "5号楼7楼的507病区示教室", 9: "5号楼7楼507病区示教室" } } },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: { 8: "病史采集、体格检查 - 钱凯" } }, location: { default: "未排地点", weeks: { 8: "5号楼7楼507病区示教室" } } },
          { name: "外科学见习", weeks: [8,14], group: "7班C组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } },
          { name: "口腔科见习", weeks: [7,11,13,16], group: "7班C、D组", note: { default: "", weeks: { 7: "实验一 口腔颌面部检查以及病历书写 - 陈思琦" } }, location: { default: "未排地点", weeks: { 7: "门诊3楼B1区口腔科示教室" } } }
        ]},
      { period: 8, courses: [
          { name: "儿科学A", weeks: [1], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: { 8: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 5: "8号楼805病区会议室", 8: "8号楼5楼的805病区会议室" } } },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: { 7: "呼吸科见习1 - 季冬翔", 9: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼的805病区会议室" } } },
          { name: "外科学见习", weeks: [9], group: "7班D组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [7,12,14,16], group: "6班A组", note: { default: "", weeks: { 7: "病史采集/体格检查 - 钱凯" } }, location: { default: "未排地点", weeks: { 7: "5号楼7楼的507病区示教室" } } },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: { 8: "病史采集、体格检查 - 钱凯" } }, location: { default: "未排地点", weeks: { 8: "5号楼7楼507病区示教室" } } },
          { name: "外科学见习", weeks: [8,14], group: "7班C组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } }
        ]},
      { period: 9, courses: [
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: { 8: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 5: "8号楼805病区会议室", 8: "8号楼5楼的805病区会议室" } } },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: { 7: "呼吸科见习1 - 季冬翔", 9: "呼吸科见习2 - 季东翔" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼的805病区会议室" } } },
          { name: "外科学见习", weeks: [9], group: "7班D组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [7,12,14,16], group: "6班A组", note: { default: "", weeks: { 7: "病史采集/体格检查 - 钱凯" } }, location: { default: "未排地点", weeks: { 7: "5号楼7楼的507病区示教室" } } },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: { 8: "病史采集、体格检查 - 钱凯" } }, location: { default: "未排地点", weeks: { 8: "5号楼7楼507病区示教室" } } },
          { name: "外科学见习", weeks: [8,14], group: "7班C组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 王钱荣" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } }
        ]},
      { period: 10, courses: [] },
      { period: 11, courses: [] },
      { period: 12, courses: [] },
      { period: 13, courses: [] }
    ]
  },
  // 星期二
  {
    day: "Tuesday",
    periods: [
      { period: 1, courses: [
          { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: { default: "", weeks: { 8: "冠心病 - 卢孔杰" } }, location: "11号楼1楼大教室" },
          { name: "神经病学B", weeks: [9], group: null, note: { default: "", weeks: { 9: "运动障碍性疾病 - 汤海燕" } }, location: { default: "", weeks: { 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 2, courses: [
          { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: { default: "", weeks: { 8: "冠心病 - 卢孔杰" } }, location: "11号楼1楼大教室" },
          { name: "神经病学B", weeks: [9], group: null, note: { default: "", weeks: { 9: "运动障碍性疾病 - 汤海燕" } }, location: { default: "", weeks: { 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 3, courses: [
          { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: { 7: "外科微创技术 - 曹国良", 8: "颅脑损伤(含幕课学习) - 苏忠周", 9: "乳房疾病(含慕课学习) - 倪小锋" } }, location: { default: "11号楼1楼大教室", weeks: { 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 4, courses: [
          { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: { 7: "外科微创技术 - 曹国良", 8: "颅脑损伤(含幕课学习) - 苏忠周", 9: "乳房疾病(含慕课学习) - 倪小锋" } }, location: { default: "11号楼1楼大教室", weeks: { 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: { default: "", weeks: { 7: "实验二 口腔常用局麻方法及拔牙术 - 赵文博" } }, location: { default: "未排地点", weeks: { 5: "门诊3楼B1区口腔科示教室", 7: "门诊3楼B1区口腔科示教室" } } },
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: { default: "", weeks: { 9: "周围神经疾病 / 帕金森氏病 / 癫痫病例讨论 - 卢振产" } }, location: { default: "未排地点", weeks: { 9: "7号楼8楼708病区示教室" } } },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [5,7,9,11,13,15], group: "7班C组", note: { default: "", weeks: { 7: "病例讨论：新生儿疾病 - 蔡忠忠", 9: "小儿出疹性疾病（含川崎）- 邱慧明" } }, location: { default: "未排地点", weeks: { 5: "5号楼507病区示教室", 7: "5号楼7楼的507病区示教室", 9: "5号楼7楼507病区示教室" } } },
          { name: "儿科学见习", weeks: [6,8,12,14,16,17], group: "7班D组", note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 6: "5号楼7楼507病区示教室" } } },
          { name: "神经病学见习", weeks: [12], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [15], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 7, courses: [
          { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: { default: "", weeks: { 7: "实验二 口腔常用局麻方法及拔牙术 - 赵文博" } }, location: { default: "未排地点", weeks: { 5: "门诊3楼B1区口腔科示教室", 7: "门诊3楼B1区口腔科示教室" } } },
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: { default: "", weeks: { 9: "周围神经疾病 / 帕金森氏病 / 癫痫病例讨论 - 卢振产" } }, location: { default: "未排地点", weeks: { 9: "7号楼8楼708病区示教室" } } },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [5,7,9,11,13,15], group: "7班C组", note: { default: "", weeks: { 7: "病例讨论：新生儿疾病 - 蔡忠忠", 9: "小儿出疹性疾病（含川崎）- 邱慧明" } }, location: { default: "未排地点", weeks: { 5: "5号楼507病区示教室", 7: "5号楼7楼的507病区示教室", 9: "5号楼7楼507病区示教室" } } },
          { name: "儿科学见习", weeks: [6,8,12,14,16,17], group: "7班D组", note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 6: "5号楼7楼507病区示教室" } } },
          { name: "神经病学见习", weeks: [12], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [15], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 8, courses: [
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: { default: "", weeks: { 9: "周围神经疾病 / 帕金森氏病 / 癫痫病例讨论 - 卢振产" } }, location: { default: "未排地点", weeks: { 9: "7号楼8楼708病区示教室" } } },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [5,9,11,13,15], group: "7班C组", note: { default: "", weeks: { 9: "小儿出疹性疾病（含川崎）- 邱慧明" } }, location: { default: "未排地点", weeks: { 5: "5号楼507病区示教室", 9: "5号楼7楼507病区示教室" } } },
          { name: "儿科学见习", weeks: [6,8,12,14,16,17], group: "7班D组", note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 6: "5号楼7楼507病区示教室" } } },
          { name: "神经病学见习", weeks: [12], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [15], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 9, courses: [
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: { 8: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 8: "11号楼2楼的急救技能培训室" } } },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: { 9: "麻醉、休克、重症监测治疗与复苏等疾病见习 - 孙玲玲" } }, location: { default: "未排地点", weeks: { 9: "11号楼2楼急救技能培训室" } } },
          { name: "儿科学见习", weeks: [5,9,11,13,15], group: "7班C组", note: { default: "", weeks: { 9: "小儿出疹性疾病（含川崎）- 邱慧明" } }, location: { default: "未排地点", weeks: { 5: "5号楼507病区示教室", 9: "5号楼7楼507病区示教室" } } },
          { name: "儿科学见习", weeks: [6,8,12,14,16,17], group: "7班D组", note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 6: "5号楼7楼507病区示教室" } } }
        ]},
      { period: 10, courses: [] },
      { period: 11, courses: [] },
      { period: 12, courses: [] },
      { period: 13, courses: [] }
    ]
  },
  // 星期三
  {
    day: "Wednesday",
    periods: [
      { period: 1, courses: [
          { name: "儿科学A", weeks: [1,5,7,8,9,10,11,12,13,14,15], group: null, note: { default: "", weeks: { 7: "新生儿疾病2：黄疸和溶血病/败血症 - 陈幸", 8: "感染性疾病；麻疹/传染性单核细胞增多症/手足口病 - 熊斌", 9: "呼吸总论/肺炎 - 吴烨" } }, location: { default: "11号楼1楼大教室", weeks: { 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 2, courses: [
          { name: "儿科学A", weeks: [1,5,7,8,9,10,11,12,13,14,15], group: null, note: { default: "", weeks: { 7: "新生儿疾病2：黄疸和溶血病/败血症 - 陈幸", 8: "感染性疾病；麻疹/传染性单核细胞增多症/手足口病 - 熊斌", 9: "呼吸总论/肺炎 - 吴烨" } }, location: { default: "11号楼1楼大教室", weeks: { 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 3, courses: [
          { name: "儿科学A", weeks: [1,5,7,8,9,10,11,13,14,15], group: null, note: { default: "", weeks: { 7: "新生儿疾病2：黄疸和溶血病/败血症 - 陈幸", 8: "感染性疾病；麻疹/传染性单核细胞增多症/手足口病 - 熊斌", 9: "呼吸总论/肺炎 - 吴烨" } }, location: { default: "11号楼1楼大教室", weeks: { 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 4, courses: [] },
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "形势与政策A", weeks: [15], group: null, note: { default: "", weeks: { 4: "讲座", 14: "网课" } }, location: "未排地点" },
          { name: "科创营", weeks: [7], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 7: "科研绘图 - 刘鹤" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [9], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 9: "科研侦探社 - 从好奇到发表的奇妙旅程 - 魏云海" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [11], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 11: "公共数据库的应用 - 钟磊" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [13], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 13: "医学人工智能 - 庄敬" } }, location: "11号楼1楼教室" },
          { name: "临床技能班", weeks: [6,8,10,12,14], group: null, electives: ["clinicalSkills"], note: { default: "", weeks: { 6: "腰穿与胸穿：模拟情境下的精准穿刺实训 - 姚博炜、沈斌", 8: "SimBaby 模拟教学：新生儿复苏团队实训 - 蔡忠忠", 10: "基于真实脏器的外科基本技能训练 - 汪伟民、楼能", 12: "高仿真急救模拟：急危重症识别与处置实训 - 徐鑫、孙越晨", 14: "考查 - 姚博炜、汪伟民" } }, location: { default: "AHA 技能培训中心", weeks: { 8: "AHA 技能培训中心" } } }
        ]},
      { period: 7, courses: [
          { name: "科创营", weeks: [7], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 7: "科研绘图 - 刘鹤" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [9], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 9: "科研侦探社 - 从好奇到发表的奇妙旅程 - 魏云海" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [11], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 11: "公共数据库的应用 - 钟磊" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [13], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 13: "医学生科创项目中的科研伦理：原则与实践 - 袁玉梅" } }, location: "11号楼1楼教室" },
          { name: "临床技能班", weeks: [6,8,10,12,14], group: null, electives: ["clinicalSkills"], note: { default: "", weeks: { 6: "腰穿与胸穿：模拟情境下的精准穿刺实训 - 姚博炜、沈斌", 8: "SimBaby 模拟教学：新生儿复苏团队实训 - 蔡忠忠", 10: "基于真实脏器的外科基本技能训练 - 汪伟民、楼能", 12: "高仿真急救模拟：急危重症识别与处置实训 - 徐鑫、孙越晨", 14: "考查 - 姚博炜、汪伟民" } }, location: { default: "AHA 技能培训中心", weeks: { 8: "AHA 技能培训中心" } } }
        ]},
      { period: 8, courses: [
          { name: "科创营", weeks: [9], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 9: "PCR (聚合酶链式反应) 技术与原理 - 陈静" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [11], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 11: "PCR (聚合酶链式反应) 常见问题与相关应用介绍 - 陈静" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [13], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 13: "医学生科创项目中的科研伦理：原则与实践 - 袁玉梅" } }, location: "11号楼1楼教室" },
          { name: "临床技能班", weeks: [6,8,10,12,14], group: null, electives: ["clinicalSkills"], note: { default: "", weeks: { 6: "腰穿与胸穿：模拟情境下的精准穿刺实训 - 姚博炜、沈斌", 8: "SimBaby 模拟教学：新生儿复苏团队实训 - 蔡忠忠", 10: "基于真实脏器的外科基本技能训练 - 汪伟民、楼能", 12: "高仿真急救模拟：急危重症识别与处置实训 - 徐鑫、孙越晨", 14: "考查 - 姚博炜、汪伟民" } }, location: { default: "AHA 技能培训中心", weeks: { 8: "AHA 技能培训中心" } } }
        ]},
      { period: 9, courses: [
          { name: "科创营", weeks: [9], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 9: "PCR (聚合酶链式反应) 技术与原理 - 陈静" } }, location: "11号楼1楼教室" },
          { name: "科创营", weeks: [11], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 11: "PCR (聚合酶链式反应) 常见问题与相关应用介绍 - 陈静" } }, location: "11号楼1楼教室" },
          { name: "临床技能班", weeks: [6,8,10,12,14], group: null, electives: ["clinicalSkills"], note: { default: "", weeks: { 6: "腰穿与胸穿：模拟情境下的精准穿刺实训 - 姚博炜、沈斌", 8: "SimBaby 模拟教学：新生儿复苏团队实训 - 蔡忠忠", 10: "基于真实脏器的外科基本技能训练 - 汪伟民、楼能", 12: "高仿真急救模拟：急危重症识别与处置实训 - 徐鑫、孙越晨", 14: "考查 - 姚博炜、汪伟民" } }, location: { default: "AHA 技能培训中心", weeks: { 8: "AHA 技能培训中心" } } }
        ]},
      { period: 10, courses: [] },
      { period: 11, courses: [
          { name: "形势与政策A", weeks: [14,15], group: null, note: "陈超怡", location: "未排地点" }
        ]},
      { period: 12, courses: [
          { name: "形势与政策A", weeks: [14,15], group: null, note: "陈超怡", location: "未排地点" }
        ]},
      { period: 13, courses: [] }
    ]
  },
  // 星期四
  {
    day: "Thursday",
    periods: [
      { period: 1, courses: [
          { name: "儿科学A", weeks: [5], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: { default: "", weeks: { 9: "颅内压增高、脑疝、颅脑损伤等疾病见习 - 苏忠周" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室", 9: "7号楼7楼707B示教室" } } },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: { default: "", weeks: { 8: "颅内压增高、脑疝、颅脑损伤等疾病学习 - 苏忠周" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室" } } },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: { default: "", weeks: { 8: "神经系统病史采集，体格检查，辅助检查，头痛、眩晕，脑血管疾病 - 邱彩霞" } }, location: { default: "湖州市中心医院-神经内科", weeks: { 8: "7号楼8楼的708病区示教室" } } },
          { name: "内科学见习", weeks: [7,9,11,13], group: "7班C组", note: { default: "", weeks: { 7: "呼吸科见习1 - 高丽亮", 9: "呼吸科见习2 - 高丽亮" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼805病区会议室" } } },
          { name: "内科学见习", weeks: [15], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [6,8,12,14], group: "7班D组", note: { default: "", weeks: { 8: "呼吸科见习2 - 高丽亮、季东翔" } }, location: { default: "未排地点", weeks: { 6: "8号楼5楼805病区会议室", 8: "8号楼5楼的805病区会议室" } } },
          { name: "内科学见习", weeks: [16], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [6], group: "7班C组", note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 6: "7号楼8楼708病区示教室" } } },
          { name: "神经病学见习", weeks: [7], group: "7班D组", note: { default: "", weeks: { 7: "神经系统病史采集，体格检查，辅助检查，头痛、眩晕，脑血管疾病 - 谈鹰" } }, location: { default: "未排地点", weeks: { 7: "7号楼5楼的708病区示教室" } } }
        ]},
      { period: 2, courses: [
          { name: "儿科学A", weeks: [5], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: { default: "", weeks: { 9: "颅内压增高、脑疝、颅脑损伤等疾病见习 - 苏忠周" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室", 9: "7号楼7楼707B示教室" } } },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: { default: "", weeks: { 8: "颅内压增高、脑疝、颅脑损伤等疾病学习 - 苏忠周" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室" } } },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: { default: "", weeks: { 8: "神经系统病史采集，体格检查，辅助检查，头痛、眩晕，脑血管疾病 - 邱彩霞" } }, location: { default: "湖州市中心医院-神经内科", weeks: { 8: "7号楼8楼的708病区示教室" } } },
          { name: "内科学见习", weeks: [7,9,11,13], group: "7班C组", note: { default: "", weeks: { 7: "呼吸科见习1 - 高丽亮", 9: "呼吸科见习2 - 高丽亮" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼805病区会议室" } } },
          { name: "内科学见习", weeks: [15], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [6,8,12,14], group: "7班D组", note: { default: "", weeks: { 8: "呼吸科见习2 - 高丽亮、季东翔" } }, location: { default: "未排地点", weeks: { 6: "8号楼5楼805病区会议室", 8: "8号楼5楼的805病区会议室" } } },
          { name: "内科学见习", weeks: [16], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [6], group: "7班C组", note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 6: "7号楼8楼708病区示教室" } } },
          { name: "神经病学见习", weeks: [7], group: "7班D组", note: { default: "", weeks: { 7: "神经系统病史采集，体格检查，辅助检查，头痛、眩晕，脑血管疾病 - 谈鹰" } }, location: { default: "未排地点", weeks: { 7: "7号楼5楼的708病区示教室" } } }
        ]},
      { period: 3, courses: [
          { name: "儿科学A", weeks: [5], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: { default: "", weeks: { 9: "颅内压增高、脑疝、颅脑损伤等疾病见习 - 苏忠周" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室", 9: "7号楼7楼707B示教室" } } },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: { default: "", weeks: { 8: "颅内压增高、脑疝、颅脑损伤等疾病学习 - 苏忠周" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室" } } },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: { default: "", weeks: { 8: "神经系统病史采集，体格检查，辅助检查，头痛、眩晕，脑血管疾病 - 邱彩霞" } }, location: { default: "湖州市中心医院-神经内科", weeks: { 8: "7号楼8楼的708病区示教室" } } },
          { name: "内科学见习", weeks: [7,9,11,13], group: "7班C组", note: { default: "", weeks: { 7: "呼吸科见习1 - 高丽亮", 9: "呼吸科见习2 - 高丽亮" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼805病区会议室" } } },
          { name: "内科学见习", weeks: [6,8,12,14], group: "7班D组", note: { default: "", weeks: { 8: "呼吸科见习2 - 高丽亮、季东翔" } }, location: { default: "未排地点", weeks: { 6: "8号楼5楼805病区会议室", 8: "8号楼5楼的805病区会议室" } } },
          { name: "神经病学见习", weeks: [6], group: "7班C组", note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 6: "7号楼8楼708病区示教室" } } },
          { name: "神经病学见习", weeks: [7], group: "7班D组", note: { default: "", weeks: { 7: "神经系统病史采集，体格检查，辅助检查，头痛、眩晕，脑血管疾病 - 谈鹰" } }, location: { default: "未排地点", weeks: { 7: "7号楼5楼的708病区示教室" } } }
        ]},
      { period: 4, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [7,9,11,13], group: "7班C组", note: { default: "", weeks: { 7: "呼吸科见习1 - 高丽亮", 9: "呼吸科见习2 - 高丽亮" } }, location: { default: "未排地点", weeks: { 7: "8号楼5楼的805病区会议室", 9: "8号楼5楼805病区会议室" } } },
          { name: "内科学见习", weeks: [6,8,12,14], group: "7班D组", note: { default: "", weeks: { 8: "呼吸科见习2 - 高丽亮、季东翔" } }, location: { default: "未排地点", weeks: { 8: "8号楼5楼的805病区会议室" } } }
        ]},
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: { default: "", weeks: { 7: "心律失常 - 叶芬", 9: "高血压 - 胡铭晟" } }, location: { default: "11号楼1楼大教室", weeks: { 7: "11号楼(人才楼)1楼大教室", 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 7, courses: [
          { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: { default: "", weeks: { 7: "心律失常 - 叶芬", 9: "高血压 - 胡铭晟" } }, location: { default: "11号楼1楼大教室", weeks: { 7: "11号楼(人才楼)1楼大教室", 9: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 8, courses: [
          { name: "科创营", weeks: [7], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 7: "医学生创新思维与科研能力培养 - 严强" } }, location: "11号楼1楼教室" },
          { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: { default: "", weeks: { 8: "颅内和椎管内血管性疾病 - 徐杰" } }, location: "11号楼1楼大教室" }
        ]},
      { period: 9, courses: [
          { name: "科创营", weeks: [7], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 7: "医学生创新思维与科研能力培养 - 严强" } }, location: "11号楼1楼教室" },
          { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: { default: "", weeks: { 8: "颅内和椎管内血管性疾病 - 徐杰" } }, location: "11号楼1楼大教室" }
        ] },
      { period: 10, courses: [] },
      { period: 11, courses: [] }
    ]
  },
  // 星期五
  {
    day: "Friday",
    periods: [
      { period: 1, courses: [
          { name: "神经病学B", weeks: [1,2,3], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: { default: "", weeks: { 7: "颅内压增高、脑疝（含慕课学习） - 苏忠周" } }, location: { default: "11号楼1楼大教室", weeks: { 7: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 2, courses: [
          { name: "神经病学B", weeks: [1,2,3], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: { default: "", weeks: { 7: "颅内压增高、脑疝（含慕课学习） - 苏忠周" } }, location: { default: "11号楼1楼大教室", weeks: { 7: "11号楼(人才楼)1楼大教室" } } }
        ]},
      { period: 3, courses: [
          { name: "口腔科学A", weeks: [1,10], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "外科学见习", weeks: [12,14], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,13], group: "7班D组", note: { default: "", weeks: { 8: "颅内压增高、脑疝、颅脑损伤等疾病学习 - 赵树发", 13: "第13周是理论课后再去上见习课" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室" } } },
          { name: "科创营", weeks: [5], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 5: "医学生创新思维与科研能力培养 - 施雪霏" } }, location: "11号楼1楼教室" }
        ] },
      { period: 4, courses: [
          { name: "口腔科学A", weeks: [1,10], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "外科学见习", weeks: [12,14], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,13], group: "7班D组", note: { default: "", weeks: { 8: "颅内压增高、脑疝、颅脑损伤等疾病学习 - 赵树发", 13: "第13周是理论课后再去上见习课" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室" } } },
          { name: "科创营", weeks: [5], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 5: "医学生创新思维与科研能力培养 - 施雪霏" } }, location: "11号楼1楼教室" }
        ]},
      { period: 5, courses: [
          { name: "口腔科学A", weeks: [1,10], group: null, note: { default: "", weeks: {} }, location: "11号楼1楼大教室" },
          { name: "外科学见习", weeks: [12,14], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,13], group: "7班D组", note: { default: "", weeks: { 8: "颅内压增高、脑疝、颅脑损伤等疾病学习 - 赵树发", 13: "第13周是理论课后再去上见习课" } }, location: { default: "未排地点", weeks: { 8: "7号楼7楼的707示教室" } } },
          { name: "科创营", weeks: [5], group: null, electives: ["innovationCamp"], note: { default: "", weeks: { 5: "科研诚信 - 姚冲" } }, location: "11号楼1楼教室" }
        ]},
      { period: 6, courses: [
          { name: "儿科学见习", weeks: [12], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [13], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [15], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [13], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [12], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 7, courses: [
          { name: "儿科学见习", weeks: [12], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [13], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [15], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [13], group: "7班C组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [12], group: "7班D组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 8, courses: [
          { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: { default: "", weeks: { 8: "第十四章 口腔颌面部感染；第十二章 颞下颌关节常见病 - 刘蓬佳" } }, location: { default: "11号楼1楼大教室", weeks: { 8: "11号楼(人才楼)1楼大教室" } } }
        ] },
      { period: 9, courses: [
          { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: { default: "", weeks: { 8: "第十四章 口腔颌面部感染；第十二章 颞下颌关节常见病 - 刘蓬佳" } }, location: { default: "11号楼1楼大教室", weeks: { 8: "11号楼(人才楼)1楼大教室" } } }
        ] },
      { period: 10, courses: [] },
      { period: 11, courses: [] }
    ]
  }
];
