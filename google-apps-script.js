/**
 * AEA: Architectural Evaluation Audit
 * Google Apps Script backend with three analysis-friendly sheets:
 *
 * - participant_demographics: one row per evaluator background questionnaire.
 * - gt_scores: one row per evaluator, diagram, criterion, and guideline.
 * - pairwise_preferences: one row per anonymized response pair comparison.
 *
 * doGet returns unique evaluator counts by Diagram_ID from gt_scores.
 */

var SHEETS = {
  DEMOGRAPHICS: 'participant_demographics',
  GT: 'gt_scores',
  PAIRWISE: 'pairwise_preferences'
};

var DEMOGRAPHICS_HEADER = [
  'Timestamp',
  'Submission_ID',
  'Participant_ID',
  'Expert_ID',
  'Participant_Profile',
  'Architecture_Topics',
  'Development_Experience',
  'Architecture_Analysis_Experience',
  'Microservices_Architecture_Experience',
  'Quality_Attributes_Tradeoffs_Experience',
  'Additional_Background'
];

var GT_HEADER = [
  'Submission_ID',
  'Expert_ID',
  'Diagram_ID',
  'Criterion',
  'Guideline',
  'Human_GT_Score',
  'Expert_Comment',
  'Timestamp'
];

var PAIRWISE_HEADER = [
  'Submission_ID',
  'Expert_ID',
  'Diagram_ID',
  'Criterion',
  'Guideline',
  'Internal_Source_Group',
  'Response_A_Output_ID',
  'Response_A_Format',
  'Response_B_Output_ID',
  'Response_B_Format',
  'Preferred_Label',
  'Preferred_Format',
  'Comparison_Justification',
  'Timestamp'
];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var recordType = data.Record_Type || '';

    if (recordType === 'DEMOGRAPHIC') {
      appendDemographic(data);
    } else if (recordType === 'GT_BATCH') {
      appendGtScores(data.Rows || []);
    } else if (recordType === 'GT') {
      appendGtScore(data);
    } else if (recordType === 'COMPARISON') {
      appendPairwisePreference(data);
    } else {
      throw new Error('Unknown Record_Type: ' + recordType);
    }

    return ContentService.createTextOutput('Success')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function appendDemographic(data) {
  var sheet = getOrCreateSheet(SHEETS.DEMOGRAPHICS, DEMOGRAPHICS_HEADER);
  sheet.appendRow([
    data.Timestamp,
    data.Submission_ID,
    data.Participant_ID,
    data.Expert_ID,
    data.Participant_Profile,
    data.Architecture_Topics,
    data.Development_Experience,
    data.Architecture_Analysis_Experience,
    data.Microservices_Architecture_Experience,
    data.Quality_Attributes_Tradeoffs_Experience,
    data.Additional_Background || ''
  ]);
}

function appendGtScore(data) {
  appendGtScores([data]);
}

function appendGtScores(rows) {
  if (!rows || rows.length === 0) return;

  var sheet = getOrCreateSheet(SHEETS.GT, GT_HEADER);
  var values = rows.map(function(data) {
    return [
      data.Submission_ID,
      data.Expert_ID,
      data.Diagram_ID,
      data.Criterion,
      data.Guideline,
      data.Human_GT_Score,
      data.Expert_Comment || '',
      data.Timestamp
    ];
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, GT_HEADER.length).setValues(values);
}

function appendPairwisePreference(data) {
  var sheet = getOrCreateSheet(SHEETS.PAIRWISE, PAIRWISE_HEADER);
  sheet.appendRow([
    data.Submission_ID,
    data.Expert_ID,
    data.Diagram_ID,
    data.Criterion,
    data.Guideline,
    data.Internal_Source_Group,
    data.Response_A_Output_ID,
    data.Response_A_Format,
    data.Response_B_Output_ID,
    data.Response_B_Format,
    data.Preferred_Label,
    data.Preferred_Format,
    data.Comparison_Justification,
    data.Timestamp
  ]);
}

function getOrCreateSheet(name, header) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  ensureHeader(sheet, header);
  return sheet;
}

function ensureHeader(sheet, header) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    return;
  }

  var existingHeader = sheet.getRange(1, 1, 1, header.length).getValues()[0];
  var needsHeader = header.some(function(column, index) {
    return existingHeader[index] !== column;
  });

  if (needsHeader) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
}

/**
 * Returns { "geoserver-cloud": 2, "spryker": 1 }.
 * Counts unique experts per diagram based on submitted ground-truth rows.
 */
function doGet(e) {
  var sheet = getOrCreateSheet(SHEETS.GT, GT_HEADER);
  var data = sheet.getDataRange().getValues();
  var seen = {};
  var counts = {};

  for (var i = 1; i < data.length; i++) {
    var expertId = data[i][1];
    var diagramId = data[i][2];
    if (!expertId || !diagramId) continue;

    var key = diagramId + '|' + expertId;
    if (!seen[key]) {
      seen[key] = true;
      counts[diagramId] = (counts[diagramId] || 0) + 1;
    }
  }

  return ContentService.createTextOutput(JSON.stringify(counts))
    .setMimeType(ContentService.MimeType.JSON);
}
