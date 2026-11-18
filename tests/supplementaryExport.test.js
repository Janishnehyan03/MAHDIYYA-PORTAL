const { test } = require("node:test");
const assert = require("node:assert/strict");
const xlsx = require("xlsx");

// Exercise the actual export handler and workbook without requiring a live database.
let applications = [];
const replacements = {
  "../models/supplementaryExamTemplateModel": { findById: async () => null },
  "../models/supplementaryApplicationModel": {
    find: () => ({ populate: () => ({ sort: async () => applications }) }),
  },
  "../models/studentModel": {},
  "../models/subjectModel": {},
  "../models/studyCentreModel": {},
  "../utils/catchAsync": (handler) => handler,
};
const originals = new Map();
for (const [name, exports] of Object.entries(replacements)) {
  const id = require.resolve(name);
  originals.set(id, require.cache[id]);
  require.cache[id] = { id, filename: id, loaded: true, exports };
}
const { exportApplicationsExcel } = require("../controllers/supplementaryExamController");
for (const [id, original] of originals) {
  if (original) require.cache[id] = original;
  else delete require.cache[id];
}

async function exportRows(includeMarks = "true") {
  let buffer;
  await exportApplicationsExcel(
    { query: { includeMarks }, params: { templateId: "all" } },
    { setHeader() {}, send(value) { buffer = value; } },
    (error) => { throw error; }
  );
  const workbook = xlsx.read(buffer, { type: "buffer" });
  return xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
}

test("each subject row exports only its own mark and result", async () => {
  applications = [{
    registerNo: "CMS001", semester: "M3", subjects: ["NAHV", "HADITH", "TARIQ", "FIQH"],
    subjectMarks: [
      { subjectName: " nahv ", mark: "46" },
      { subjectName: "HADITH", mark: "27" },
      { subjectName: "TARIQ", mark: "0" },
    ],
  }, {
    registerNo: "CMS002", semester: "M1", subjects: ["TAFSIR"],
    subjectMarks: [{ subjectName: "TAFSIR", mark: "40" }],
  }, {
    registerNo: "CMS001", semester: "M1", subjects: ["NAHV"],
    subjectMarks: [{ subjectName: "NAHV", mark: "18" }],
  }];
  const rows = await exportRows();
  assert.equal(rows.length, 6);
  const expected = [
    ["NAHV", "46", "Pass"], ["HADITH", "27", "Fail"],
    ["TARIQ", "0", "Fail"], ["FIQH", "", "Pending"],
    ["TAFSIR", "40", "Pass"], ["NAHV", "18", "Fail"],
  ];
  rows.forEach((row, index) => {
    const [subject, mark, status] = expected[index];
    assert.equal(row.SUBJECT, subject);
    assert.equal(row.SEMESTER, index < 4 ? "M3" : "M1");
    assert.ok(!("M1" in row));
    assert.ok(!("M3" in row));
    assert.equal(row["Result Status"], status);
    for (const name of ["NAHV", "HADITH", "TARIQ", "FIQH", "TAFSIR"]) {
      assert.equal(row[`${name} Mark`], name === subject ? mark : "");
    }
  });
  assert.equal(rows[5].SUBJECT, "NAHV");
  assert.equal(rows[5].SEMESTER, "M1");
});

test("application exports also use a single semester column without marks", async () => {
  const rows = await exportRows("false");
  assert.equal(rows.length, 6);
  assert.equal(rows[0].SUBJECT, "NAHV");
  assert.equal(rows[1].SUBJECT, "HADITH");
  assert.equal(rows[0].SEMESTER, "M3");
  assert.ok(!("M3" in rows[0]));
  assert.ok(!("Result Status" in rows[0]));
  assert.ok(!Object.keys(rows[0]).some((key) => key.endsWith(" Mark")));
});
