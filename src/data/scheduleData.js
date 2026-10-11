/**
 * 课程表数据
 * 第五临床医学院 临床医学 2023级 6班7班（湖州市中心医院）
 *
 * 每条课程显式保留 note/location 的 default 与 weeks，便于逐周维护。
 */

export const scheduleData = [
  {
    day: "Monday",
    periods: [
      {
        period: 1,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [1, 7, 9, 11],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学A(Ⅱ)",
            weeks: [5],
            group: null,
            note: { default: "何卫美｜消化性溃疡", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [2, 6, 8, 10, 16],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [3],
            group: null,
            note: { default: "刘鹤｜呼吸功能的监测和临床应用，血流动力学监测", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          }
        ]
      },
      {
        period: 2,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [1, 7, 9, 11],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学A(Ⅱ)",
            weeks: [5],
            group: null,
            note: { default: "何卫美｜消化性溃疡", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [2, 6, 8, 10, 16],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [3],
            group: null,
            note: { default: "刘鹤｜呼吸功能的监测和临床应用，血流动力学监测", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          }
        ]
      },
      {
        period: 3,
        courses: [
          {
            name: "眼科学",
            weeks: [1, 2, 6, 7, 8, 9, 10, 11, 12, 13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学",
            weeks: [5],
            group: null,
            note: { default: "何峰英｜角膜疾病", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "眼科学",
            weeks: [3],
            group: null,
            note: { default: "何峰英｜结膜疾病", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          }
        ]
      },
      {
        period: 4,
        courses: [
          {
            name: "眼科学",
            weeks: [1, 2, 6, 7, 8, 9, 10, 11, 12, 13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学",
            weeks: [5],
            group: null,
            note: { default: "何峰英｜角膜疾病", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "眼科学",
            weeks: [3],
            group: null,
            note: { default: "何峰英｜结膜疾病", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          }
        ]
      },
      {
        period: 5,
        courses: []
      },
      {
        period: 6,
        courses: [
          {
            name: "内科学见习",
            weeks: [6],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [3],
            group: "6班A组",
            note: { default: "吴国栋｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7, 8, 11, 13, 15, 16],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [7],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "6班A组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [10, 13, 16],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [11, 14, 17],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [12],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 7,
        courses: [
          {
            name: "内科学见习",
            weeks: [6],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [3],
            group: "6班A组",
            note: { default: "吴国栋｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7, 8, 11, 13, 15, 16],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [7],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "6班A组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [10, 13, 16],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [11, 14, 17],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [12],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 8,
        courses: [
          {
            name: "内科学见习",
            weeks: [6],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [3],
            group: "6班A组",
            note: { default: "吴国栋｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7, 8, 11, 13, 15, 16],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [7],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "6班A组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [10, 13, 16],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [11, 14, 17],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 9,
        courses: [
          {
            name: "外科学见习",
            weeks: [10, 13, 16],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [11, 14, 17],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 10,
        courses: []
      },
      {
        period: 11,
        courses: []
      },
      {
        period: 12,
        courses: []
      },
      {
        period: 13,
        courses: []
      }
    ]
  },
  {
    day: "Tuesday",
    periods: [
      {
        period: 1,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [6, 8, 16],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学A(Ⅱ)",
            weeks: [3],
            group: null,
            note: { default: "赵辉｜胰腺炎", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [2, 7, 10, 12],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 2,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [6, 8, 16],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学A(Ⅱ)",
            weeks: [3],
            group: null,
            note: { default: "赵辉｜胰腺炎", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [2, 7, 10, 12],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 3,
        courses: [
          {
            name: "外科学A(Ⅱ)",
            weeks: [7, 9, 13, 14, 15],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [5],
            group: null,
            note: { default: "张津瑜｜消化道大出血的诊断与外科处理原则，急腹症的诊断与鉴别", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [3],
            group: null,
            note: { default: "孙旭｜门静脉高压症，胆道疾病(二)", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [6],
            group: null,
            note: { default: "王士良", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 4,
        courses: [
          {
            name: "外科学A(Ⅱ)",
            weeks: [7, 9, 13, 14, 15],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [5],
            group: null,
            note: { default: "张津瑜｜消化道大出血的诊断与外科处理原则，急腹症的诊断与鉴别", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [3],
            group: null,
            note: { default: "孙旭｜门静脉高压症，胆道疾病(二)", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [6],
            group: null,
            note: { default: "王士良", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 5,
        courses: [
          {
            name: "精神病学",
            weeks: [6],
            group: null,
            note: { default: "王士良", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 6,
        courses: [
          {
            name: "外科学见习",
            weeks: [6, 8],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [5],
            group: "6班B组",
            note: { default: "吴国栋｜消化科见习2", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [3],
            group: "6班B组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [9, 10, 12, 14, 16, 17],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [12, 14],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [13, 15],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 7,
        courses: [
          {
            name: "外科学见习",
            weeks: [6, 8],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [5],
            group: "6班B组",
            note: { default: "吴国栋｜消化科见习2", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [3],
            group: "6班B组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [9, 10, 12, 14, 16, 17],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [12, 14],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [13, 15],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 8,
        courses: [
          {
            name: "外科学见习",
            weeks: [6, 8],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [5],
            group: "6班B组",
            note: { default: "吴国栋｜消化科见习2", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [3],
            group: "6班B组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [9, 10, 12, 14, 16, 17],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [12, 14],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [13, 15],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 9,
        courses: [
          {
            name: "外科学见习",
            weeks: [12, 14],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [13, 15],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 10,
        courses: []
      },
      {
        period: 11,
        courses: []
      },
      {
        period: 12,
        courses: []
      },
      {
        period: 13,
        courses: []
      }
    ]
  },
  {
    day: "Wednesday",
    periods: [
      {
        period: 1,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [2, 10, 12, 14],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [9],
            group: null,
            note: { default: "赵徐东、陈浙丽", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [3],
            group: null,
            note: { default: "赵徐东｜神经发育障碍、应激相关障碍", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          }
        ]
      },
      {
        period: 2,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [2, 10, 12, 14],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [9],
            group: null,
            note: { default: "赵徐东、陈浙丽", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [3],
            group: null,
            note: { default: "赵徐东｜神经发育障碍、应激相关障碍", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          }
        ]
      },
      {
        period: 3,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [2, 10, 12, 14],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [9],
            group: null,
            note: { default: "赵徐东、陈浙丽", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [3],
            group: null,
            note: { default: "赵徐东｜神经发育障碍、应激相关障碍", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [11, 13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 4,
        courses: [
          {
            name: "外科学A(Ⅱ)",
            weeks: [11, 13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 5,
        courses: []
      },
      {
        period: 6,
        courses: [
          {
            name: "形势与政策",
            weeks: [4],
            group: null,
            note: { default: "陈超怡", weeks: {} },
            location: { default: "网课", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [7],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论｜蛋白定量检测 / 免疫组化", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [9],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论+实操｜蛋白表达案例 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [11, 13],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "实操｜RNA抽提 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [6],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜腹穿与骨穿实训", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [8],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜导尿术、气管插管术", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [10],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜创伤急救实战演练", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [12],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜心电图判读知识竞赛", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          }
        ]
      },
      {
        period: 7,
        courses: [
          {
            name: "形势与政策",
            weeks: [4],
            group: null,
            note: { default: "陈超怡", weeks: {} },
            location: { default: "网课", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [5],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论｜临床研究设计方法 / 文章撰写", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [7],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论｜蛋白定量检测 / 免疫组化", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [9],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论+实操｜蛋白表达案例 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [11, 13],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "实操｜RNA抽提 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [6],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜腹穿与骨穿实训", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [8],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜导尿术、气管插管术", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [10],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜创伤急救实战演练", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [12],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜心电图判读知识竞赛", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          }
        ]
      },
      {
        period: 8,
        courses: [
          {
            name: "科创营",
            weeks: [5],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论｜临床研究设计方法 / 文章撰写", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [7],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论｜蛋白定量检测 / 免疫组化", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [9],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论+实操｜蛋白表达案例 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [11, 13],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "实操｜RNA抽提 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [6],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜腹穿与骨穿实训", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [8],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜导尿术、气管插管术", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [10],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜创伤急救实战演练", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [12],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜心电图判读知识竞赛", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          }
        ]
      },
      {
        period: 9,
        courses: [
          {
            name: "科创营",
            weeks: [5],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论｜临床研究设计方法 / 文章撰写", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [7],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论｜蛋白定量检测 / 免疫组化", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [9],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "理论+实操｜蛋白表达案例 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "科创营",
            weeks: [11, 13],
            group: null,
            electives: ["innovationCamp"],
            note: { default: "实操｜RNA抽提 / PCR实验", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [6],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜腹穿与骨穿实训", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [8],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜导尿术、气管插管术", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [10],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜创伤急救实战演练", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          },
          {
            name: "临床技能班",
            weeks: [12],
            group: null,
            electives: ["clinicalSkills"],
            note: { default: "实践｜心电图判读知识竞赛", weeks: {} },
            location: { default: "AHA技能培训中心", weeks: {} }
          }
        ]
      },
      {
        period: 10,
        courses: []
      },
      {
        period: 11,
        courses: []
      },
      {
        period: 12,
        courses: []
      },
      {
        period: 13,
        courses: []
      }
    ]
  },
  {
    day: "Thursday",
    periods: [
      {
        period: 1,
        courses: [
          {
            name: "眼科学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7, 9, 10, 12, 14],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [4],
            group: "6班A组",
            note: { default: "何卫美｜消化科见习2", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [6, 8, 11, 13, 15, 16],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [5],
            group: null,
            note: { default: "那万秋｜分离性障碍、精神分裂症及其他原发性精神病性障碍", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          }
        ]
      },
      {
        period: 2,
        courses: [
          {
            name: "眼科学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7, 9, 10, 12, 14],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [4],
            group: "6班A组",
            note: { default: "何卫美｜消化科见习2", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [6, 8, 11, 13, 15, 16],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [5],
            group: null,
            note: { default: "那万秋｜分离性障碍、精神分裂症及其他原发性精神病性障碍", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 3,
        courses: [
          {
            name: "眼科学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7, 9, 10, 12, 14],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [4],
            group: "6班A组",
            note: { default: "何卫美｜消化科见习2", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [6, 8, 11, 13, 15, 16],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [5],
            group: null,
            note: { default: "那万秋｜分离性障碍、精神分裂症及其他原发性精神病性障碍", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 4,
        courses: [
          {
            name: "眼科学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 5,
        courses: [
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 6,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [1],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学A(Ⅱ)",
            weeks: [4],
            group: null,
            note: { default: "刘春燕｜肠结核和结核性腹膜炎", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "形势与政策",
            weeks: [14, 15],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [2, 8],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [7],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "6班B组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [6],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [5],
            group: "7班C组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [16],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 7,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [1],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学A(Ⅱ)",
            weeks: [4],
            group: null,
            note: { default: "刘春燕｜肠结核和结核性腹膜炎", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "形势与政策",
            weeks: [14, 15],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [2, 8],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [7],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "6班B组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [6],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [5],
            group: "7班C组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [16],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 8,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [14],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [2, 8],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [7],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "6班B组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [6],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [5],
            group: "7班C组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [16],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 9,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [14],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [16],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [13],
            group: "6班A、B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 10,
        courses: []
      },
      {
        period: 11,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [6, 9, 12],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          },
          {
            name: "大学生就业指导A",
            weeks: [7, 8, 10, 11, 13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          }
        ]
      },
      {
        period: 12,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [6, 9, 12],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          },
          {
            name: "大学生就业指导A",
            weeks: [7, 8, 10, 11, 13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          }
        ]
      },
      {
        period: 13,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [6, 9, 12],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          }
        ]
      }
    ]
  },
  {
    day: "Friday",
    periods: [
      {
        period: 1,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [12, 13, 15],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [1, 6, 9, 11],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [5],
            group: null,
            note: { default: "刘洋｜围手术期患者血液管理，围手术期体温监测与管理", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [4],
            group: null,
            note: { default: "刘鹤｜围手术期意识状态监测与评估，血流动力学调控", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [7, 10],
            group: null,
            note: { default: "苏伟", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 2,
        courses: [
          {
            name: "内科学A(Ⅱ)",
            weeks: [12, 13, 15],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [1, 6, 9, 11],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [5],
            group: null,
            note: { default: "刘洋｜围手术期患者血液管理，围手术期体温监测与管理", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [4],
            group: null,
            note: { default: "刘鹤｜围手术期意识状态监测与评估，血流动力学调控", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [7, 10],
            group: null,
            note: { default: "苏伟", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 3,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [5],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          },
          {
            name: "精神病学",
            weeks: [7, 10],
            group: null,
            note: { default: "苏伟", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [1, 6, 8],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [4],
            group: null,
            note: { default: "张健｜胰腺疾病", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 4,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [5],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [1, 6, 8],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学A(Ⅱ)",
            weeks: [4],
            group: null,
            note: { default: "张健｜胰腺疾病", weeks: {} },
            location: { default: "1楼教室", weeks: {} }
          },
          {
            name: "麻醉学",
            weeks: [13],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 5,
        courses: [
          {
            name: "大学生就业指导A",
            weeks: [5],
            group: null,
            note: { default: "", weeks: {} },
            location: { default: "网课", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 6,
        courses: [
          {
            name: "外科学见习",
            weeks: [8],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "7班D组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [4],
            group: "7班D组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [15],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 7,
        courses: [
          {
            name: "外科学见习",
            weeks: [8],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "7班D组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [4],
            group: "7班D组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [15],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 8,
        courses: [
          {
            name: "外科学见习",
            weeks: [8],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [5],
            group: "7班D组",
            note: { default: "孙旭｜肝胆疾病、胰腺疾病见习", weeks: {} },
            location: { default: "1期6号楼的8楼608病区示教室", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [7],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "内科学见习",
            weeks: [4],
            group: "7班D组",
            note: { default: "彭礼清｜消化科见习1", weeks: {} },
            location: { default: "1期7号楼的9楼709病区示教室", weeks: {} }
          },
          {
            name: "外科学见习",
            weeks: [15],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 9,
        courses: [
          {
            name: "外科学见习",
            weeks: [15],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [11, 13],
            group: "6班A组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "眼科学见习",
            weeks: [12, 14],
            group: "6班B组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [11, 13],
            group: "7班D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "麻醉学见习",
            weeks: [10, 12],
            group: "7班C组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          },
          {
            name: "精神病学见习",
            weeks: [14],
            group: "7班C、D组",
            note: { default: "", weeks: {} },
            location: { default: "未排地点", weeks: {} }
          }
        ]
      },
      {
        period: 10,
        courses: []
      },
      {
        period: 11,
        courses: []
      },
      {
        period: 12,
        courses: []
      },
      {
        period: 13,
        courses: []
      }
    ]
  }
];
