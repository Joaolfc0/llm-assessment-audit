# AEA: Architectural Evaluation Audit

AEA is a local, single-page web app for evaluating responses about software architecture diagrams.

The current methodology has three sequential phases for one assigned diagram:

1. **Demographics**: the evaluator provides academic/professional background information.
2. **Ground truth**: the evaluator assigns a 1-4 score for every criterion guideline.
3. **Qualitative comparison**: the evaluator compares two anonymized responses for the same guideline, chooses the better response, and justifies the choice.

Each evaluator works on a single diagram. The app prioritizes diagrams with fewer than two submitted evaluators; once all diagrams have at least two, it assigns the diagram with the lowest count.

## Local Usage

Open `aea/index.html` in a browser.

When `GOOGLE_SCRIPT_URL` is empty in `app.js`, the app runs in local-only mode and does not contact external services.

## Progress Saving

Progress is saved in browser `localStorage` under:

- `aea_method_v4_data`

Use **Save and exit** to pause. The evaluator can resume with the same email on the same browser.

## Data Shape

`data.js` exposes:

- `criteria`: the rubric and guidelines.
- `diagrams`: the diagram-centered study units.
- `outputs`: the stored response texts, still identified by `OUT_*`.

The UI derives anonymized response comparisons by matching outputs with the same `diagram`, internal source group, `criterion`, and guideline.

## Optional Google Sheets Backend

Copy `google-apps-script.js` into Apps Script and deploy it as a web app. Then set `GOOGLE_SCRIPT_URL` in `app.js`.

The backend saves three sheets:

- `participant_demographics`: one row per evaluator demographic questionnaire.

- `gt_scores`: ground-truth scores by guideline.
- `pairwise_preferences`: anonymized pair preference and justification by guideline, including internal source metadata for analysis.

`doGet` returns unique evaluator counts by `Diagram_ID` from `gt_scores` for balancing.
