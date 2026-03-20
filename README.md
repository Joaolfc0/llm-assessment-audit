# AEA: Architectural Evaluation Audit (Blind Review / Local-Only)

AEA is a local, single-page web app for auditing LLM-generated technical reviews of software architecture diagrams. Each audit item shows the **reference diagram + textual description** (left) and a **criterion with guideline cards** (right). Reviewers must audit the **textual justification** produced by the LLM, not the diagram directly.

## 1) Local usage (no Google Sheets upload)

For blind peer review, Google Sheets integration is **disabled** so the app can be explored offline and will not attempt to contact external services.

### Run

Just open `aea/index.html` in your browser.

### Progress saving

Answers are saved in your browser using `localStorage` (key: `aea_audit_data`). Use **“Save and exit”** to pause and resume later on the same machine/browser.


