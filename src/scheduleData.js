/**
 * 课程表数据
 * 第五临床医学院 临床医学 2023级 6班
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
          { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 2, courses: [
          { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 3, courses: [
          { name: "神经病学B", weeks: [4,5,7,8,9,11,12,13,14,15], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ] },
      { period: 4, courses: [
          { name: "神经病学B", weeks: [4,5,7,8,9,11,12,13,14,15], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 5, courses: []},
      { period: 6, courses: [
          { name: "儿科学A", weeks: [1], group: null, note: { default: "", weeks: {} }, location: "11号楼（人才楼）1楼大教室" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 7, courses: [
          { name: "儿科学A", weeks: [1], group: null, note: { default: "", weeks: {} }, location: "11号楼（人才楼）1楼大教室" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 8, courses: [
          { name: "儿科学A", weeks: [1], group: null, note: { default: "", weeks: {} }, location: "11号楼（人才楼）1楼大教室" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 9, courses: [
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
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
          { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 2, courses: [
          { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 3, courses: [
          { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 4, courses: [
          { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 7, courses: [
          { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 8, courses: [
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 9, courses: [
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
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
          { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } },
          { name: "儿科学A", weeks: [16], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 2, courses: [
          { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } },
          { name: "儿科学A", weeks: [16], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 3, courses: [
          { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 4, courses: [] },
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "形势与政策A", weeks: [4,14,15], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 7, courses: [] },
      { period: 8, courses: [] },
      { period: 9, courses: [] },
      { period: 10, courses: [] },
      { period: 11, courses: [
          { name: "形势与政策A", weeks: [14,15], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 12, courses: [
          { name: "形势与政策A", weeks: [14,15], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 13, courses: [] }
    ]
  },
  // 星期四
  {
    day: "Thursday",
    periods: [
      { period: 1, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [9], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 2, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [9], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 3, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "神经病学见习", weeks: [9], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 4, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 7, courses: [
          { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } },
          { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 8, courses: [
          { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 9, courses: [] },
      { period: 10, courses: [] },
      { period: 11, courses: [] }
    ]
  },
  // 星期五
  {
    day: "Friday",
    periods: [
      { period: 1, courses: [
          { name: "神经病学B", weeks: [1,2,3], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } },
          { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 2, courses: [
          { name: "神经病学B", weeks: [1,2,3], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } },
          { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 3, courses: [
          { name: "口腔科学A", weeks: [1,10], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ] },
      { period: 4, courses: [
          { name: "口腔科学A", weeks: [1,10], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 5, courses: [
          { name: "口腔科学A", weeks: [1,10], group: null, note: { default: "", weeks: {} }, location: { default: "未排地点", weeks: { 1: "11号楼（人才楼）1楼大教室" } } }
        ]},
      { period: 6, courses: [
          { name: "儿科学见习", weeks: [12], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [13], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 7, courses: [
          { name: "儿科学见习", weeks: [12], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "儿科学见习", weeks: [13], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: { default: "", weeks: {} }, location: "未排地点" },
          { name: "内科学见习", weeks: [14], group: "6班B组", note: { default: "", weeks: {} }, location: "未排地点" }
        ]},
      { period: 8, courses: [
          { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ] },
      { period: 9, courses: [
          { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: { default: "", weeks: {} }, location: "未排地点" }
        ] },
      { period: 10, courses: [] },
      { period: 11, courses: [] }
    ]
  }
];
