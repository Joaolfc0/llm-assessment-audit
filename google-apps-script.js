/**
 * AEA: Architectural Evaluation Audit
 * Google Apps Script — paste this into your Apps Script editor.
 *
 * This backend is only required to upload submissions to Google Sheets for the main study.
 * Blind peer review / local exploration should not depend on it.
 *
 * doPost: receives one guideline row and appends it to the sheet.
 * doGet:  returns JSON with the number of unique experts per Output_ID.
 *
 * Columns:
 * [0] Output_ID, [1] Expert_ID, [2] Model, [3] Input_Format, [4] Criterion,
 * [5] Guideline, [6] LLM_Score, [7] Agreement_Score, [8] Is_Factual_Correct,
 * [9] Err_Hallucination, [10] Err_Omission, [11] Err_Logic,
 * [12] Err_Contradiction, [13] Err_Vagueness, [14] Err_Other,
 * [15] Err_Other_Text, [16] Expert_Comment
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    var data = JSON.parse(e.postData.contents);

    var row = [
      data.Output_ID,
      data.Expert_ID,
      data.Model,
      data.Input_Format,
      data.Criterion,
      data.Guideline,
      data.LLM_Score,
      data.Agreement_Score,
      data.Is_Factual_Correct,
      data.Err_Hallucination,
      data.Err_Omission,
      data.Err_Logic,
      data.Err_Contradiction,
      data.Err_Vagueness,
      data.Err_Other,
      data.Err_Other_Text,
      data.Expert_Comment
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Returns { "OUT_001": 3, "OUT_002": 1, ... }
 * Each value is the number of unique experts who evaluated that output.
 * Multiple guideline rows from the same expert for the same output
 * are counted only once.
 */
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var seen = {};
  var counts = {};

  for (var i = 1; i < data.length; i++) {
    var outputId = data[i][0];
    var expertId = data[i][1];
    if (!outputId) continue;

    var key = outputId + "|" + expertId;
    if (!seen[key]) {
      seen[key] = true;
      counts[outputId] = (counts[outputId] || 0) + 1;
    }
  }

  return ContentService.createTextOutput(JSON.stringify(counts))
    .setMimeType(ContentService.MimeType.JSON);
}
