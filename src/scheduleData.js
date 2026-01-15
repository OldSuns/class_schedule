/**
 * 课程表数据
 * 第五临床医学院 临床医学 2023级 6班
 */

export const scheduleData = [
  // 星期一
  {
    day: "Monday",
    periods: [
      { period: 1, courses: [
          { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×14（共28学时）" }
        ]},
      { period: 2, courses: [
          { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×14（共28学时）" }
        ]},
      { period: 3, courses: [
          { name: "神经病学B", weeks: [4,5,7,8,9,11,12,13,14,15], group: null, note: "2学时×10（共20学时）" }
        ] },
      { period: 4, courses: [
          { name: "神经病学B", weeks: [4,5,7,8,9,11,12,13,14,15], group: null, note: "2学时×10（共20学时）" }
        ]},
      { period: 5, courses: []},
      { period: 6, courses: [
          { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时×1" },
          { name: "内科学见习", weeks: [16], group: "6班B组", note: "2学时×1" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
        ]},
      { period: 7, courses: [
          { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时×1" },
          { name: "内科学见习", weeks: [16], group: "6班B组", note: "2学时×1" },
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
        ]},
      { period: 8, courses: [
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
        ]},
      { period: 9, courses: [
          { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
          { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
          { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
          { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
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
          { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: "2学时×8（共16学时）" }
        ]},
      { period: 2, courses: [
          { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: "2学时×8（共16学时）" }
        ]},
      { period: 3, courses: [
          { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×15（共30学时）" }
        ]},
      { period: 4, courses: [
          { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×15（共30学时）" }
        ]},
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: "2学时×4" },
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: "3学时×1" },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: "3学时×1" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
        ]},
      { period: 7, courses: [
          { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: "2学时×4" },
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: "3学时×1" },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: "3学时×1" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
        ]},
      { period: 8, courses: [
          { name: "神经病学见习", weeks: [9], group: "6班A组", note: "3学时×1" },
          { name: "神经病学见习", weeks: [11], group: "6班B组", note: "3学时×1" },
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
        ]},
      { period: 9, courses: [
          { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
          { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
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
          { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: "3学时×12（共36学时）" },
          { name: "儿科学A", weeks: [16], group: null, note: "2学时×1（共2学时）" }
        ]},
      { period: 2, courses: [
          { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: "3学时×12（共36学时）" },
          { name: "儿科学A", weeks: [16], group: null, note: "2学时×1（共2学时）" }
        ]},
      { period: 3, courses: [
          { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: "3学时×12（共36学时）" }
        ]},
      { period: 4, courses: [] },
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "形势与政策A", weeks: [4,14,15], group: null, note: "讲座（14-15周第6节，网课）" }
        ]},
      { period: 7, courses: [] },
      { period: 8, courses: [] },
      { period: 9, courses: [] },
      { period: 10, courses: [] },
      { period: 11, courses: [
          { name: "形势与政策A", weeks: [14,15], group: null, note: "陈超怡（讲座）" }
        ]},
      { period: 12, courses: [
          { name: "形势与政策A", weeks: [14,15], group: null, note: "陈超怡（讲座）" }
        ]},
      { period: 13, courses: [] }
    ]
  },
  // 星期四
  {
    day: "Thursday",
    periods: [
      { period: 1, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: "3学时×2" },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: "3学时×2" },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: "3学时×1" },
          { name: "神经病学见习", weeks: [9], group: "6班B组", note: "3学时×1" }
        ]},
      { period: 2, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: "3学时×2" },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: "3学时×2" },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: "3学时×1" },
          { name: "神经病学见习", weeks: [9], group: "6班B组", note: "3学时×1" }
        ]},
      { period: 3, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" },
          { name: "外科学见习", weeks: [9,13], group: "6班A组", note: "3学时×2" },
          { name: "外科学见习", weeks: [8,12], group: "6班B组", note: "3学时×2" },
          { name: "神经病学见习", weeks: [8], group: "6班A组", note: "3学时×1" },
          { name: "神经病学见习", weeks: [9], group: "6班B组", note: "3学时×1" }
        ]},
      { period: 4, courses: [
          { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
          { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" }
        ]},
      { period: 5, courses: [] },
      { period: 6, courses: [
          { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: "2学时×8（共16学时）" }
        ]},
      { period: 7, courses: [
          { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: "2学时×8（共16学时）" },
          { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: "2学时×8（共16学时）" }
        ]},
      { period: 8, courses: [
          { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: "2学时×8（共16学时）" }
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
          { name: "神经病学B", weeks: [1,2,3], group: null, note: "2学时×3" },
          { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: "2学时×6（共12学时）" }
        ]},
      { period: 2, courses: [
          { name: "神经病学B", weeks: [1,2,3], group: null, note: "2学时×3" },
          { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: "2学时×6（共12学时）" }
        ]},
      { period: 3, courses: [
          { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: "2学时×10（共10学时）" }
        ] },
      { period: 4, courses: [
          { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: "2学时×10（共10学时）" }
        ]},
      { period: 5, courses: []},
      { period: 6, courses: [
          { name: "儿科学见习", weeks: [12], group: "6班A组", note: "2学时" },
          { name: "儿科学见习", weeks: [13], group: "6班B组", note: "2学时" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时" },
          { name: "内科学见习", weeks: [14], group: "6班B组", note: "2学时" }
        ]},
      { period: 7, courses: [
          { name: "儿科学见习", weeks: [12], group: "6班A组", note: "2学时" },
          { name: "儿科学见习", weeks: [13], group: "6班B组", note: "2学时" },
          { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时" },
          { name: "内科学见习", weeks: [14], group: "6班B组", note: "2学时" }
        ]},
      { period: 8, courses: [] },
      { period: 9, courses: [] },
      { period: 10, courses: [] },
      { period: 11, courses: [] }
    ]
  }
];
