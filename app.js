/**
 * AEA: Architectural Evaluation Audit
 * Three-phase methodological flow.
 */

(function() {
    'use strict';

    const CONFIG = {
        STORAGE_KEY: 'aea_method_v4_data',
        GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbx7tFN2QgA1o4nWtMg6M2UMN0XsEXrB44cGq3yz1qmy34JmlErGaSnexAPJ739d-n57/exec',
        MIN_RESPONSES_PER_DIAGRAM: 2
    };

    const PHASES = {
        DEMOGRAPHIC: 'demographic',
        GT: 'ground_truth',
        QUALITATIVE: 'qualitative',
        COMPLETED: 'completed'
    };

    const FORMAT = {
        PNG: 'PNG'
    };

    function createInitialState(overrides = {}) {
        return {
            submissionId: null,
            userEmail: null,
            diagramId: null,
            phase: PHASES.DEMOGRAPHIC,
            demographicResponse: null,
            gtIndex: 0,
            comparisonIndex: 0,
            gtResponses: {},
            comparisonResponses: {},
            startedAt: null,
            ...overrides,
            gtResponses: { ...(overrides.gtResponses || {}) },
            comparisonResponses: { ...(overrides.comparisonResponses || {}) }
        };
    }

    let state = createInitialState();
    let currentItems = {
        gt: [],
        comparisons: []
    };
    let isSubmitting = false;

    const DOM = {
        welcomeScreen: document.getElementById('welcome-screen'),
        auditScreen: document.getElementById('audit-screen'),
        completionScreen: document.getElementById('completion-screen'),
        loginForm: document.getElementById('login-form'),
        userEmail: document.getElementById('user-email'),
        btnText: document.getElementById('btn-text'),
        btnContinue: document.getElementById('btn-continue'),
        progressInfo: document.getElementById('progress-info'),
        completedCount: document.getElementById('completed-count'),
        phaseLabel: document.getElementById('phase-label'),
        outputId: document.getElementById('output-id'),
        saveExitBtn: document.getElementById('save-exit-btn'),
        splitContainer: document.querySelector('.split-container'),
        leftPanel: document.querySelector('.left-panel'),
        rightPanel: document.querySelector('.right-panel'),
        diagramImage: document.getElementById('diagram-image'),
        diagramLightbox: document.getElementById('diagram-lightbox'),
        diagramLightboxImage: document.getElementById('diagram-lightbox-image'),
        diagramLightboxClose: document.getElementById('diagram-lightbox-close'),
        descriptionContent: document.getElementById('description-content'),
        criterionName: document.getElementById('criterion-name'),
        criterionDescription: document.getElementById('criterion-description'),
        phaseInstructions: document.getElementById('phase-instructions'),
        formContainer: document.getElementById('form-container'),
        auditForm: document.getElementById('audit-form'),
        nextBtn: document.getElementById('next-btn'),
        restartBtn: document.getElementById('restart-btn')
    };

    function getData() {
        return window.AEA_DATA;
    }

    function getDiagrams() {
        return getData().diagrams || [];
    }

    function getDiagram() {
        return getDiagrams().find(diagram => diagram.id === state.diagramId) || getDiagrams()[0];
    }

    function getOutputsForDiagram(diagram) {
        const ids = new Set(diagram.outputIds || []);
        return getData().outputs.filter(output => ids.size === 0 || ids.has(output.id));
    }

    function getCriterionEntries() {
        return Object.entries(getData().criteria);
    }

    function formatDescription(description) {
        return description
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => `<p>${escapeHtml(line)}</p>`)
            .join('');
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function createSubmissionId(email) {
        const safeEmail = email.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const randomPart = window.crypto && window.crypto.randomUUID
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return `${safeEmail}-${randomPart}`;
    }

    function saveState() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
            ...state,
            lastUpdated: new Date().toISOString()
        }));
    }

    function loadState(email) {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!stored) return null;

        try {
            const data = JSON.parse(stored);
            return data.userEmail === email ? data : null;
        } catch (error) {
            console.error('Could not load saved state:', error);
            return null;
        }
    }

    function clearState() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }

    function hasStoredStateForAnotherEmail(email) {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!stored) return false;

        try {
            const data = JSON.parse(stored);
            return data.userEmail && data.userEmail !== email;
        } catch (error) {
            return false;
        }
    }

    async function fetchDiagramCounts() {
        if (!CONFIG.GOOGLE_SCRIPT_URL) return null;

        try {
            const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL);
            return await response.json();
        } catch (error) {
            console.warn('Could not fetch diagram counts:', error);
            return null;
        }
    }

    function selectBalancedDiagram(counts) {
        const diagrams = getDiagrams();
        if (diagrams.length === 0) {
            throw new Error('No diagrams configured in data.js.');
        }

        const withCounts = diagrams.map(diagram => ({
            diagram,
            count: counts && Number.isFinite(Number(counts[diagram.id])) ? Number(counts[diagram.id]) : 0
        }));

        const underTarget = withCounts.filter(item => item.count < CONFIG.MIN_RESPONSES_PER_DIAGRAM);
        const candidates = underTarget.length > 0 ? underTarget : withCounts;
        const minCount = Math.min(...candidates.map(item => item.count));
        return shuffleArray(candidates.filter(item => item.count === minCount))[0].diagram;
    }

    function buildGtItems(diagram) {
        return getCriterionEntries().map(([criterionId, criterion]) => ({
            id: `${diagram.id}_${criterionId}`,
            diagramId: diagram.id,
            criterionId,
            criterion
        }));
    }

    function buildComparisonItems(diagram) {
        const outputs = getOutputsForDiagram(diagram);
        const items = [];
        const criterionOrder = getCriterionEntries().map(([criterionId]) => criterionId);

        getCriterionEntries().forEach(([criterionId, criterion]) => {
            const models = [...new Set(outputs.map(output => output.model))].sort();
            models.forEach(model => {
                const pngOutput = outputs.find(output =>
                    output.model === model &&
                    output.criterion === criterionId &&
                    output.format.toUpperCase() === FORMAT.PNG
                );
                const textualOutput = outputs.find(output =>
                    output.model === model &&
                    output.criterion === criterionId &&
                    output.format.toUpperCase() !== FORMAT.PNG
                );

                if (pngOutput && textualOutput) {
                    criterion.guidelines.forEach(guideline => {
                        const pngGuideline = pngOutput.guidelines.find(entry => entry.id === guideline.id);
                        const textualGuideline = textualOutput.guidelines.find(entry => entry.id === guideline.id);

                        if (!pngGuideline || !textualGuideline) return;

                        items.push({
                            id: `${diagram.id}_${model}_${criterionId}_${guideline.id}`,
                            diagramId: diagram.id,
                            model,
                            criterionId,
                            criterion,
                            guideline,
                            pngOutput,
                            textualOutput,
                            pngGuideline,
                            textualGuideline
                        });
                    });
                }
            });
        });

        return interleaveByCriterion(items, criterionOrder);
    }

    function interleaveByCriterion(items, criterionOrder) {
        const itemsByCriterion = new Map(criterionOrder.map(criterionId => [criterionId, []]));
        items.forEach(item => {
            if (!itemsByCriterion.has(item.criterionId)) {
                itemsByCriterion.set(item.criterionId, []);
            }
            itemsByCriterion.get(item.criterionId).push(item);
        });

        const interleavedItems = [];
        let hasPendingItems = true;

        while (hasPendingItems) {
            hasPendingItems = false;
            criterionOrder.forEach(criterionId => {
                const queue = itemsByCriterion.get(criterionId);
                if (queue && queue.length > 0) {
                    interleavedItems.push(queue.shift());
                    hasPendingItems = true;
                }
            });
        }

        return interleavedItems;
    }

    function rebuildItems() {
        const diagram = getDiagram();
        currentItems = {
            gt: buildGtItems(diagram),
            comparisons: buildComparisonItems(diagram)
        };
    }

    function getCompletedCount() {
        return Object.keys(state.gtResponses || {}).length +
            Object.keys(state.comparisonResponses || {}).length;
    }

    function getTotalCount() {
        return currentItems.gt.length + currentItems.comparisons.length;
    }

    function getCompletionLabel(data) {
        if (data.phase === PHASES.COMPLETED) return 'completed';
        if (data.phase === PHASES.QUALITATIVE) return 'qualitative comparison started';
        if (data.phase === PHASES.GT) return 'ground truth started';
        if (data.phase === PHASES.DEMOGRAPHIC) return 'demographic phase started';
        return 'ground truth started';
    }

    function showScreen(screenId) {
        DOM.welcomeScreen.style.display = 'none';
        DOM.auditScreen.style.display = 'none';
        DOM.completionScreen.style.display = 'none';

        if (screenId === 'welcome') DOM.welcomeScreen.style.display = 'block';
        if (screenId === 'audit') DOM.auditScreen.style.display = 'flex';
        if (screenId === 'completion') DOM.completionScreen.style.display = 'flex';
    }

    function initWelcomeScreen() {
        DOM.userEmail.addEventListener('input', function() {
            const email = this.value.trim();
            const existing = email.includes('@') ? loadState(email) : null;

            DOM.btnText.style.display = existing ? 'none' : 'inline';
            DOM.btnContinue.style.display = existing ? 'inline' : 'none';
            DOM.progressInfo.style.display = existing ? 'block' : 'none';
            if (existing) DOM.completedCount.textContent = getCompletionLabel(existing);
        });

        DOM.loginForm.addEventListener('submit', handleLogin);
    }

    async function handleLogin(event) {
        event.preventDefault();

        const email = DOM.userEmail.value.trim();
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email.');
            return;
        }

        const existing = loadState(email);
        if (existing) {
            state = createInitialState({
                ...existing,
                submissionId: existing.submissionId || createSubmissionId(email),
                demographicResponse: existing.demographicResponse || null,
                gtResponses: existing.gtResponses || {},
                comparisonResponses: existing.comparisonResponses || {}
            });
        } else {
            if (hasStoredStateForAnotherEmail(email)) {
                clearState();
            }
            const submitButton = DOM.loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            DOM.btnText.textContent = 'Loading...';

            const selectedDiagram = selectBalancedDiagram(await fetchDiagramCounts());

            submitButton.disabled = false;
            DOM.btnText.textContent = 'Start';

            state = createInitialState({
                submissionId: createSubmissionId(email),
                userEmail: email,
                diagramId: selectedDiagram.id,
                startedAt: new Date().toISOString()
            });
        }

        rebuildItems();
        normalizeProgress();
        saveState();

        if (state.phase === PHASES.COMPLETED) {
            showCompletionScreen();
        } else {
            showScreen('audit');
            renderCurrentStep();
        }
    }

    function normalizeProgress() {
        if (state.phase === PHASES.DEMOGRAPHIC && state.demographicResponse) {
            state.phase = PHASES.GT;
        }

        if (state.phase === PHASES.GT && state.gtIndex >= currentItems.gt.length) {
            state.phase = PHASES.QUALITATIVE;
            state.comparisonIndex = Math.min(state.comparisonIndex || 0, currentItems.comparisons.length);
        }

        if (state.phase === PHASES.QUALITATIVE) {
            const nextUnansweredComparisonIndex = currentItems.comparisons.findIndex(
                item => !state.comparisonResponses[item.id]
            );

            if (nextUnansweredComparisonIndex >= 0) {
                state.comparisonIndex = nextUnansweredComparisonIndex;
            } else {
                state.comparisonIndex = currentItems.comparisons.length;
                state.phase = PHASES.COMPLETED;
            }
        }
    }

    function renderCurrentStep() {
        const diagram = getDiagram();
        const isDemographicPhase = state.phase === PHASES.DEMOGRAPHIC;
        DOM.splitContainer.classList.toggle('demographic-layout', isDemographicPhase);
        DOM.leftPanel.style.display = isDemographicPhase ? 'none' : 'flex';

        if (!isDemographicPhase) {
            DOM.diagramImage.src = diagram.imagePath;
            DOM.diagramImage.alt = `${diagram.title} architecture diagram`;
            DOM.descriptionContent.innerHTML = formatDescription(diagram.description);
        }

        if (state.phase === PHASES.GT) {
            renderGtStep(currentItems.gt[state.gtIndex]);
        } else if (state.phase === PHASES.DEMOGRAPHIC) {
            renderDemographicStep();
        } else if (state.phase === PHASES.QUALITATIVE) {
            renderComparisonStep(currentItems.comparisons[state.comparisonIndex]);
        } else {
            showCompletionScreen();
        }

        updateStatusBar();
    }

    function updateStatusBar() {
        const diagram = getDiagram();
        if (state.phase === PHASES.DEMOGRAPHIC) {
            DOM.phaseLabel.textContent = 'Phase 0: Demographics';
        } else if (state.phase === PHASES.GT) {
            DOM.phaseLabel.textContent = 'Phase 1: Ground truth';
        } else {
            DOM.phaseLabel.textContent = 'Phase 2: Qualitative comparison';
        }
        DOM.outputId.textContent = state.phase === PHASES.DEMOGRAPHIC
            ? 'Background questionnaire'
            : (diagram ? diagram.title : '');
        DOM.nextBtn.textContent = isLastStep() ? 'Finish' : 'Next';
    }

    function isLastStep() {
        return state.phase === PHASES.QUALITATIVE &&
            state.comparisonIndex >= currentItems.comparisons.length - 1;
    }

    function renderDemographicStep() {
        const response = state.demographicResponse || {};
        const selectedTopics = new Set(response.architectureTopics || []);

        DOM.criterionName.textContent = 'Participant background questionnaire';
        DOM.criterionDescription.textContent = 'This information helps characterize your background in software architecture and microservices.';
        DOM.phaseInstructions.textContent = 'Please complete all required demographic fields before continuing.';

        const profileOptions = [
            'Undergraduate',
            'Master\'s',
            'PhD',
            'Industry professional',
            'Other'
        ];
        const architectureTopics = [
            'Software Architecture',
            'Microservices Architecture',
            'Distributed Systems',
            'Cloud Architecture',
            'Architecture Evaluation',
            'Quality Attributes',
            'Architectural Decision Records (ADRs)',
            'Service/API Design'
        ];
        const experienceLevels = ['low', 'medium', 'extensive'];

        DOM.formContainer.innerHTML = `
            <section class="guideline-card demographic-card">
                <div class="demographic-section">
                    <h4>1. Your profile</h4>
                    <p class="field-help">Start with your current academic or professional background.</p>
                </div>

                <div class="demographic-grid">
                    <div class="form-group">
                        <label class="question-label" for="demographic-course">Academic or professional profile</label>
                        <select id="demographic-course" required>
                            <option value="">Select an option</option>
                            ${profileOptions.map(option => `<option value="${escapeHtml(option)}" ${response.currentCourse === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="question-label" for="demographic-dev-exp">Development experience</label>
                        <select id="demographic-dev-exp" required>
                            <option value="">Select an option</option>
                            <option value="No professional development experience" ${response.developmentExperience === 'No professional development experience' ? 'selected' : ''}>No professional development experience</option>
                            <option value="Up to 2 years of experience" ${response.developmentExperience === 'Up to 2 years of experience' ? 'selected' : ''}>Up to 2 years of experience</option>
                            <option value="From 3 to 5 years of experience" ${response.developmentExperience === 'From 3 to 5 years of experience' ? 'selected' : ''}>From 3 to 5 years of experience</option>
                            <option value="More than 5 years of experience" ${response.developmentExperience === 'More than 5 years of experience' ? 'selected' : ''}>More than 5 years of experience</option>
                        </select>
                    </div>
                </div>

                <div class="demographic-section">
                    <h4>2. Architecture background</h4>
                    <p class="field-help">Select the topics you have studied, practiced, or evaluated before.</p>
                </div>

                <div class="form-group">
                    <div class="choice-options demographic-choice-options">
                        ${architectureTopics.map(topic => `
                            <label class="choice-option">
                                <input type="checkbox" name="demographic-topic" value="${escapeHtml(topic)}" ${selectedTopics.has(topic) ? 'checked' : ''}>
                                <span>${escapeHtml(topic)}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="demographic-section">
                    <h4>3. Experience level</h4>
                    <p class="field-help">Use your own judgment: low, medium, or extensive experience.</p>
                </div>

                <div class="form-group">
                    <div class="experience-grid">
                        ${renderExperienceSelect('Software architecture analysis', 'demographic-arch-analysis-exp', response.architectureAnalysisExperience, experienceLevels)}
                        ${renderExperienceSelect('Microservices architecture', 'demographic-microservices-exp', response.microservicesExperience, experienceLevels)}
                        ${renderExperienceSelect('Architecture evaluation and trade-offs', 'demographic-quality-attr-exp', response.qualityAttributesExperience, experienceLevels)}
                    </div>
                </div>

                <div class="comment-group">
                    <label class="question-label" for="demographic-background">Anything else relevant to your architecture background?</label>
                    <textarea id="demographic-background" class="comment-textarea" rows="4" placeholder="Optional">${escapeHtml(response.additionalBackground || '')}</textarea>
                </div>
            </section>
        `;
    }

    function renderGtStep(item) {
        if (!item) {
            advanceToQualitative();
            return;
        }

        DOM.criterionName.textContent = item.criterion.name;
        DOM.criterionDescription.textContent = item.criterion.description;
        DOM.phaseInstructions.textContent = 'Give your own 1-4 score for each guideline in this criterion.';

        const response = state.gtResponses[item.id] || { guidelineResponses: [] };
        const savedByGuideline = new Map(
            (response.guidelineResponses || []).map(entry => [entry.guideline, entry])
        );

        DOM.formContainer.innerHTML = `
            <section class="guideline-card">
                ${item.criterion.guidelines.map((guideline, index) => {
                    const saved = savedByGuideline.get(guideline.id) || {};
                    return `
                        <div class="gt-guideline" data-guideline-id="${escapeHtml(guideline.id)}">
                            <h4>${index + 1}. ${escapeHtml(guideline.name)}</h4>
                            <p class="guideline-question">${escapeHtml(guideline.description)}</p>

                            <label class="question-label">Your score</label>
                            ${renderRadioScale(`gt_score_${guideline.id}`, saved.humanGtScore)}
                        </div>
                    `;
                }).join('')}
            </section>
        `;
    }

    function renderComparisonStep(item) {
        if (!item) {
            completeStudy();
            return;
        }

        DOM.criterionName.textContent = item.criterion.name;
        DOM.criterionDescription.textContent = item.criterion.description;
        DOM.phaseInstructions.textContent = 'Compare the two responses and choose which one is better.';

        const response = state.comparisonResponses[item.id] || {};
        const options = getComparisonDisplayOptions(item);

        DOM.formContainer.innerHTML = `
            <section class="guideline-card comparison-guideline-context">
                <h4>${escapeHtml(item.guideline.name)}</h4>
                <p class="guideline-question">${escapeHtml(item.guideline.description)}</p>
            </section>

            <div class="comparison-grid">
                ${options.map(option => renderOutputPanel(option.label, option.guidelineResponse)).join('')}
            </div>

            <section class="choice-card">
                <label class="question-label">Which response is better?</label>
                <div class="choice-options">
                    ${renderChoiceOption(options[0].label, `${options[0].label}`, response.preferredLabel)}
                    ${renderChoiceOption(options[1].label, `${options[1].label}`, response.preferredLabel)}
                    ${renderChoiceOption('Tie', 'Tie / no meaningful difference', response.preferredLabel)}
                </div>

                <div class="comment-group">
                    <label class="question-label" for="comparison-justification">Justification</label>
                    <textarea id="comparison-justification" class="comment-textarea" rows="4" placeholder="Briefly explain your choice...">${escapeHtml(response.justification || '')}</textarea>
                </div>
            </section>
        `;
    }

    function getComparisonDisplayOptions(item) {
        const hash = Array.from(item.id).reduce((total, char) => total + char.charCodeAt(0), 0);
        const pngFirst = hash % 2 === 0;

        return pngFirst ? [
            {
                label: 'Response A',
                format: item.pngOutput.format,
                outputId: item.pngOutput.id,
                guidelineResponse: item.pngGuideline
            },
            {
                label: 'Response B',
                format: item.textualOutput.format,
                outputId: item.textualOutput.id,
                guidelineResponse: item.textualGuideline
            }
        ] : [
            {
                label: 'Response A',
                format: item.textualOutput.format,
                outputId: item.textualOutput.id,
                guidelineResponse: item.textualGuideline
            },
            {
                label: 'Response B',
                format: item.pngOutput.format,
                outputId: item.pngOutput.id,
                guidelineResponse: item.pngGuideline
            }
        ];
    }

    function renderOutputPanel(label, guidelineResponse) {
        return `
            <article class="comparison-panel">
                <h4>${escapeHtml(label)}</h4>
                <div class="response-analysis">
                    <div class="analysis-score">
                        <span class="score-label">Assigned score</span>
                        <span class="score-value">${escapeHtml(guidelineResponse.score)}</span>
                    </div>
                    <span class="justification-label">Justification:</span>
                    <p class="justification-text">${escapeHtml(guidelineResponse.justification)}</p>
                </div>
            </article>
        `;
    }

    function renderExperienceSelect(label, id, selectedValue, experienceLevels) {
        return `
            <label class="experience-select" for="${escapeHtml(id)}">
                <span>${escapeHtml(label)}</span>
                <select id="${escapeHtml(id)}" required>
                    <option value="">Select</option>
                    ${experienceLevels.map(level => `<option value="${level}" ${selectedValue === level ? 'selected' : ''}>${level}</option>`).join('')}
                </select>
            </label>
        `;
    }

    function renderRadioScale(name, selectedValue) {
        return `
            <div class="likert-scale">
                <div class="likert-labels">
                    <span>1 - Poor</span>
                    <span>4 - Excellent</span>
                </div>
                <div class="likert-options">
                    ${[1, 2, 3, 4].map(value => `
                        <label class="likert-option">
                            <input type="radio" name="${name}" value="${value}" ${Number(selectedValue) === value ? 'checked' : ''} required>
                            <span class="likert-circle">${value}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function renderChoiceOption(value, label, selectedValue) {
        return `
            <label class="choice-option">
                <input type="radio" name="preferred_format" value="${escapeHtml(value)}" ${selectedValue === value ? 'checked' : ''} required>
                <span>${escapeHtml(label)}</span>
            </label>
        `;
    }

    function initAuditScreen() {
        DOM.auditForm.addEventListener('submit', handleNext);
        DOM.saveExitBtn.addEventListener('click', handleSaveAndExit);
        DOM.diagramImage.addEventListener('click', openDiagramLightbox);
        DOM.diagramLightboxClose.addEventListener('click', closeDiagramLightbox);
        DOM.diagramLightbox.addEventListener('click', function(event) {
            if (event.target === DOM.diagramLightbox) {
                closeDiagramLightbox();
            }
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeDiagramLightbox();
            }
        });
    }

    function openDiagramLightbox() {
        if (!DOM.diagramImage.src) return;
        DOM.diagramLightboxImage.src = DOM.diagramImage.src;
        DOM.diagramLightboxImage.alt = DOM.diagramImage.alt || 'Expanded architecture diagram';
        DOM.diagramLightbox.classList.add('open');
        DOM.diagramLightbox.setAttribute('aria-hidden', 'false');
    }

    function closeDiagramLightbox() {
        DOM.diagramLightbox.classList.remove('open');
        DOM.diagramLightbox.setAttribute('aria-hidden', 'true');
        DOM.diagramLightboxImage.src = '';
    }

    async function handleNext(event) {
        event.preventDefault();
        if (isSubmitting) return;

        isSubmitting = true;
        setSubmittingState(true);

        try {
            if (state.phase === PHASES.DEMOGRAPHIC) {
                const response = collectDemographicResponse();
                if (!response) {
                    alert('Please complete all required demographic fields.');
                    return;
                }
                state.demographicResponse = response;
                saveState();
                sendToGoogleScriptInBackground('DEMOGRAPHIC', response);
                state.phase = PHASES.GT;
            } else if (state.phase === PHASES.GT) {
                const response = collectGtResponse(true);
                if (!response) {
                    alert('Please select a score for every guideline in this criterion.');
                    return;
                }

                state.gtResponses[response.itemId] = response;
                saveState();
                sendToGoogleScriptInBackground('GT', response);
                state.gtIndex++;

                if (state.gtIndex >= currentItems.gt.length) {
                    advanceToQualitative();
                }
            } else if (state.phase === PHASES.QUALITATIVE) {
                const response = collectComparisonResponse();
                if (!response) {
                    alert('Please choose which response is better (or tie).');
                    return;
                }

                state.comparisonResponses[response.itemId] = response;
                saveState();
                sendToGoogleScriptInBackground('COMPARISON', response);
                state.comparisonIndex++;

                if (state.comparisonIndex >= currentItems.comparisons.length) {
                    completeStudy();
                }
            }

            saveState();
            renderCurrentStep();
            DOM.formContainer.closest('.panel-content').scrollTop = 0;
        } finally {
            setSubmittingState(false);
            isSubmitting = false;
        }
    }

    function collectDemographicResponse(requireComplete = true) {
        const course = DOM.formContainer.querySelector('#demographic-course')?.value.trim() || '';
        const developmentExperience = DOM.formContainer.querySelector('#demographic-dev-exp')?.value || '';
        const architectureAnalysisExperience = DOM.formContainer.querySelector('#demographic-arch-analysis-exp')?.value || '';
        const microservicesExperience = DOM.formContainer.querySelector('#demographic-microservices-exp')?.value || '';
        const qualityAttributesExperience = DOM.formContainer.querySelector('#demographic-quality-attr-exp')?.value || '';
        const additionalBackground = DOM.formContainer.querySelector('#demographic-background')?.value.trim() || '';

        const architectureTopics = Array.from(DOM.formContainer.querySelectorAll('input[name="demographic-topic"]:checked'))
            .map(entry => entry.value);

        const hasMissingRequired =
            !course ||
            !developmentExperience ||
            !architectureAnalysisExperience ||
            !microservicesExperience ||
            !qualityAttributesExperience ||
            architectureTopics.length === 0;

        const hasAnyAnswer = course ||
            developmentExperience ||
            architectureAnalysisExperience ||
            microservicesExperience ||
            qualityAttributesExperience ||
            additionalBackground ||
            architectureTopics.length > 0;

        if ((requireComplete && hasMissingRequired) || (!requireComplete && !hasAnyAnswer)) {
            return null;
        }

        return {
            itemId: `${state.submissionId}_demographic`,
            recordType: 'DEMOGRAPHIC',
            submissionId: state.submissionId,
            expertId: state.userEmail,
            participantId: state.submissionId,
            currentCourse: course,
            architectureTopics,
            developmentExperience,
            architectureAnalysisExperience,
            microservicesExperience,
            qualityAttributesExperience,
            additionalBackground,
            timestamp: new Date().toISOString()
        };
    }

    function setSubmittingState(isActive) {
        DOM.nextBtn.disabled = isActive;
        DOM.nextBtn.classList.toggle('is-loading', isActive);
        DOM.nextBtn.textContent = isActive ? 'Saving...' : (isLastStep() ? 'Finish' : 'Next');

        let indicator = DOM.auditForm.querySelector('.submit-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'submit-indicator';
            indicator.innerHTML = '<span class="spinner"></span><span>Saving locally...</span>';
            DOM.auditForm.appendChild(indicator);
        }

        indicator.style.display = isActive ? 'inline-flex' : 'none';
    }

    function sendToGoogleScriptInBackground(recordType, payload) {
        sendToGoogleScript(recordType, payload).catch(error => {
            console.error('Background save failed:', error);
            showSuccessToast('Data saved locally.');
        });
    }

    async function sendToGoogleScript(recordType, payload) {
        if (!CONFIG.GOOGLE_SCRIPT_URL) {
            console.log('Google Apps Script URL not configured. Data:', payload);
            return { success: true, skipped: true };
        }

        const backendPayloads = recordType === 'GT_BATCH'
            ? [payload]
            : recordType === 'GT'
                ? [prepareGtBatchPayload(payload)]
                : recordType === 'DEMOGRAPHIC'
                    ? [prepareDemographicPayload(payload)]
                    : [prepareComparisonPayload(payload)];

        try {
            await Promise.all(backendPayloads.map(backendPayload =>
                fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    keepalive: true,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(backendPayload)
                })
            ));
            showSuccessToast('Data saved in background.');
            return { success: true };
        } catch (error) {
            console.error('Error sending data:', error);
            showSuccessToast('Data saved locally.');
            return { success: false, error: error.message };
        }
    }

    function collectGtResponse(requireComplete) {
        const item = currentItems.gt[state.gtIndex];
        if (!item) return null;

        const guidelineResponses = item.criterion.guidelines.map(guideline => {
            const scoreInput = DOM.formContainer.querySelector(`input[name="gt_score_${guideline.id}"]:checked`);

            if (!scoreInput) return null;

            return {
                guideline: guideline.id,
                humanGtScore: Number(scoreInput.value)
            };
        }).filter(Boolean);

        if (requireComplete && guidelineResponses.length !== item.criterion.guidelines.length) return null;
        if (!requireComplete && guidelineResponses.length === 0) return null;

        return {
            itemId: item.id,
            recordType: 'GT',
            submissionId: state.submissionId,
            diagramId: item.diagramId,
            expertId: state.userEmail,
            criterion: item.criterionId,
            guidelineResponses,
            timestamp: new Date().toISOString()
        };
    }

    function collectComparisonResponse() {
        const item = currentItems.comparisons[state.comparisonIndex];
        const preferred = DOM.formContainer.querySelector('input[name="preferred_format"]:checked');
        const justification = DOM.formContainer.querySelector('#comparison-justification')?.value.trim() ?? '';
        if (!item || !preferred) return null;
        const displayOptions = getComparisonDisplayOptions(item);
        const responseA = displayOptions.find(option => option.label === 'Response A');
        const responseB = displayOptions.find(option => option.label === 'Response B');

        return {
            itemId: item.id,
            recordType: 'COMPARISON',
            submissionId: state.submissionId,
            diagramId: item.diagramId,
            expertId: state.userEmail,
            model: item.model,
            criterion: item.criterionId,
            guideline: item.guideline.id,
            preferredLabel: preferred.value,
            preferredFormat: resolvePreferredFormat(item, preferred.value),
            responseAOutputId: responseA.outputId,
            responseAFormat: responseA.format,
            responseBOutputId: responseB.outputId,
            responseBFormat: responseB.format,
            justification,
            timestamp: new Date().toISOString()
        };
    }

    function resolvePreferredFormat(item, preferredLabel) {
        if (preferredLabel === 'Tie') return 'Tie';
        const option = getComparisonDisplayOptions(item).find(entry => entry.label === preferredLabel);
        return option ? option.format : '';
    }

    function advanceToQualitative() {
        state.phase = PHASES.QUALITATIVE;
        state.comparisonIndex = state.comparisonIndex || 0;
        saveState();
    }

    function completeStudy() {
        state.phase = PHASES.COMPLETED;
        saveState();
        showCompletionScreen();
    }

    function handleSaveAndExit() {
        const partialResponse = state.phase === PHASES.GT
            ? collectGtResponse(false)
            : state.phase === PHASES.QUALITATIVE
                ? collectComparisonResponse()
                : collectDemographicResponse(false);

        if (partialResponse) {
            if (state.phase === PHASES.GT) {
                state.gtResponses[partialResponse.itemId] = partialResponse;
            }
            if (state.phase === PHASES.QUALITATIVE) {
                state.comparisonResponses[partialResponse.itemId] = partialResponse;
            }
            if (state.phase === PHASES.DEMOGRAPHIC) {
                state.demographicResponse = partialResponse;
            }
        }

        saveState();
        alert('Your progress has been saved. You can continue later using the same email.');
        showScreen('welcome');
        DOM.userEmail.value = state.userEmail;
        DOM.userEmail.dispatchEvent(new Event('input'));
    }

    function prepareGtPayload(response, guidelineResponse) {
        return {
            Record_Type: 'GT',
            Submission_ID: response.submissionId,
            Diagram_ID: response.diagramId,
            Expert_ID: response.expertId,
            Criterion: response.criterion,
            Guideline: guidelineResponse.guideline,
            Human_GT_Score: guidelineResponse.humanGtScore,
            Expert_Comment: '',
            Timestamp: response.timestamp
        };
    }

    function prepareGtBatchPayload(response) {
        return {
            Record_Type: 'GT_BATCH',
            Rows: response.guidelineResponses.map(guidelineResponse =>
                prepareGtPayload(response, guidelineResponse)
            )
        };
    }

    function prepareComparisonPayload(response) {
        return {
            Record_Type: 'COMPARISON',
            Submission_ID: response.submissionId,
            Diagram_ID: response.diagramId,
            Expert_ID: response.expertId,
            Criterion: response.criterion,
            Guideline: response.guideline,
            Internal_Source_Group: response.model,
            Preferred_Label: response.preferredLabel,
            Preferred_Format: response.preferredFormat,
            Response_A_Output_ID: response.responseAOutputId,
            Response_A_Format: response.responseAFormat,
            Response_B_Output_ID: response.responseBOutputId,
            Response_B_Format: response.responseBFormat,
            Comparison_Justification: response.justification,
            Timestamp: response.timestamp
        };
    }

    function prepareDemographicPayload(response) {
        return {
            Record_Type: 'DEMOGRAPHIC',
            Submission_ID: response.submissionId,
            Expert_ID: response.expertId,
            Participant_ID: response.participantId,
            Participant_Profile: response.currentCourse,
            Architecture_Topics: response.architectureTopics.join(', '),
            Development_Experience: response.developmentExperience,
            Architecture_Analysis_Experience: response.architectureAnalysisExperience,
            Microservices_Architecture_Experience: response.microservicesExperience,
            Quality_Attributes_Tradeoffs_Experience: response.qualityAttributesExperience,
            Additional_Background: response.additionalBackground,
            Timestamp: response.timestamp
        };
    }

    function showSuccessToast(message) {
        let toast = document.getElementById('success-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'success-toast';
            toast.className = 'success-toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function showCompletionScreen() {
        showScreen('completion');
    }

    function initCompletionScreen() {
        DOM.restartBtn.addEventListener('click', function() {
            clearState();
            state = createInitialState();
            DOM.userEmail.value = '';
            DOM.btnText.style.display = 'inline';
            DOM.btnContinue.style.display = 'none';
            DOM.progressInfo.style.display = 'none';
            showScreen('welcome');
        });
    }

    function init() {
        initWelcomeScreen();
        initAuditScreen();
        initCompletionScreen();
        showScreen('welcome');
    }

    document.addEventListener('DOMContentLoaded', init);
})();
