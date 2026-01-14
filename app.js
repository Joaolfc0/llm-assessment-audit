/**
 * AEA: Architectural Evaluation Audit
 * Main Application Logic
 */

(function() {
    'use strict';

    // =========================================
    // Configuration
    // =========================================
    const CONFIG = {
        STORAGE_KEY: 'aea_audit_data',
        GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwGAEhk92TnfPNFjxubD9HH-VFhIffh7xEib4gtTmjYTNYUJlwwxxoRLNvX5BXpWEFD/exec',
        TOTAL_OUTPUTS: 20
    };

    // =========================================
    // State Management
    // =========================================
    let state = {
        userEmail: null,
        shuffledOrder: [],
        currentIndex: 0,
        responses: {},
        startTime: null
    };

    // =========================================
    // Utility Functions
    // =========================================
    
    /**
     * Fisher-Yates shuffle algorithm
     */
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Generate a deterministic shuffle based on email
     */
    function generateShuffledOrder(email) {
        // Create array of indices [0, 1, 2, ..., 19]
        const indices = Array.from({ length: CONFIG.TOTAL_OUTPUTS }, (_, i) => i);
        
        // Use email as seed for pseudo-random shuffle
        let seed = 0;
        for (let i = 0; i < email.length; i++) {
            seed = ((seed << 5) - seed) + email.charCodeAt(i);
            seed = seed & seed;
        }
        
        // Seeded shuffle
        const seededRandom = () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff;
            return seed / 0x7fffffff;
        };
        
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        return indices;
    }

    /**
     * Save state to localStorage
     */
    function saveState() {
        const data = {
            userEmail: state.userEmail,
            shuffledOrder: state.shuffledOrder,
            currentIndex: state.currentIndex,
            responses: state.responses,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    }

    /**
     * Load state from localStorage
     */
    function loadState(email) {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.userEmail === email) {
                    return data;
                }
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }
        return null;
    }

    /**
     * Clear state from localStorage
     */
    function clearState() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }

    /**
     * Get completed count
     */
    function getCompletedCount() {
        return Object.keys(state.responses).length;
    }

    // =========================================
    // DOM References
    // =========================================
    const DOM = {
        // Screens
        welcomeScreen: document.getElementById('welcome-screen'),
        auditScreen: document.getElementById('audit-screen'),
        completionScreen: document.getElementById('completion-screen'),
        
        // Welcome
        loginForm: document.getElementById('login-form'),
        userEmail: document.getElementById('user-email'),
        btnText: document.getElementById('btn-text'),
        btnContinue: document.getElementById('btn-continue'),
        progressInfo: document.getElementById('progress-info'),
        completedCount: document.getElementById('completed-count'),
        
        // Progress Bar
        currentNum: document.getElementById('current-num'),
        totalNum: document.getElementById('total-num'),
        outputId: document.getElementById('output-id'),
        progressFill: document.getElementById('progress-fill'),
        saveExitBtn: document.getElementById('save-exit-btn'),
        
        // Left Panel
        diagramImage: document.getElementById('diagram-image'),
        descriptionContent: document.getElementById('description-content'),
        
        // Right Panel
        criterionName: document.getElementById('criterion-name'),
        criterionDescription: document.getElementById('criterion-description'),
        guidelinesContainer: document.getElementById('guidelines-container'),
        auditForm: document.getElementById('audit-form'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        
        // Completion
        restartBtn: document.getElementById('restart-btn'),
        
        // Template
        guidelineTemplate: document.getElementById('guideline-template')
    };

    // =========================================
    // Screen Navigation
    // =========================================
    
    function showScreen(screenId) {
        DOM.welcomeScreen.style.display = 'none';
        DOM.auditScreen.style.display = 'none';
        DOM.completionScreen.style.display = 'none';
        
        switch (screenId) {
            case 'welcome':
                DOM.welcomeScreen.style.display = 'block';
                break;
            case 'audit':
                DOM.auditScreen.style.display = 'flex';
                break;
            case 'completion':
                DOM.completionScreen.style.display = 'flex';
                break;
        }
    }

    // =========================================
    // Welcome Screen Logic
    // =========================================
    
    function initWelcomeScreen() {
        // Check if there's existing progress
        const emailInput = DOM.userEmail;
        
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            if (email && email.includes('@')) {
                const existing = loadState(email);
                if (existing && getCompletedCountFromData(existing) > 0) {
                    DOM.btnText.style.display = 'none';
                    DOM.btnContinue.style.display = 'inline';
                    DOM.progressInfo.style.display = 'block';
                    DOM.completedCount.textContent = getCompletedCountFromData(existing);
                } else {
                    DOM.btnText.style.display = 'inline';
                    DOM.btnContinue.style.display = 'none';
                    DOM.progressInfo.style.display = 'none';
                }
            } else {
                DOM.btnText.style.display = 'inline';
                DOM.btnContinue.style.display = 'none';
                DOM.progressInfo.style.display = 'none';
            }
        });
        
        DOM.loginForm.addEventListener('submit', handleLogin);
    }

    function getCompletedCountFromData(data) {
        return data.responses ? Object.keys(data.responses).length : 0;
    }

    function handleLogin(e) {
        e.preventDefault();
        
        const email = DOM.userEmail.value.trim();
        if (!email || !email.includes('@')) {
            alert('Por favor, insira um email válido.');
            return;
        }
        
        // Try to load existing progress
        const existing = loadState(email);
        
        if (existing) {
            state = {
                userEmail: existing.userEmail,
                shuffledOrder: existing.shuffledOrder,
                currentIndex: existing.currentIndex,
                responses: existing.responses || {},
                startTime: new Date()
            };
        } else {
            // New user
            state = {
                userEmail: email,
                shuffledOrder: generateShuffledOrder(email),
                currentIndex: 0,
                responses: {},
                startTime: new Date()
            };
        }
        
        saveState();
        
        // Check if already completed
        if (getCompletedCount() >= CONFIG.TOTAL_OUTPUTS) {
            showScreen('completion');
        } else {
            showScreen('audit');
            renderCurrentOutput();
        }
    }

    // =========================================
    // Audit Screen Logic
    // =========================================
    
    function renderCurrentOutput() {
        const outputIndex = state.shuffledOrder[state.currentIndex];
        const output = window.AEA_DATA.outputs[outputIndex];
        const criterion = window.AEA_DATA.criteria[output.criterion];
        
        // Update progress bar
        updateProgressBar();
        
        // Update left panel
        renderLeftPanel(output);
        
        // Update right panel
        renderRightPanel(output, criterion);
        
        // Load saved response if exists
        loadSavedResponse(output.id);
        
        // Update navigation buttons
        updateNavigationButtons();
    }

    function updateProgressBar() {
        const current = state.currentIndex + 1;
        const total = CONFIG.TOTAL_OUTPUTS;
        const outputIndex = state.shuffledOrder[state.currentIndex];
        const output = window.AEA_DATA.outputs[outputIndex];
        
        DOM.currentNum.textContent = current;
        DOM.totalNum.textContent = total;
        DOM.outputId.textContent = output.id;
        
        const percentage = (current / total) * 100;
        DOM.progressFill.style.width = `${percentage}%`;
    }

    function renderLeftPanel(output) {
        // Diagram
        // For GitHub Pages, use relative path from aea folder
        const diagramPath = '../' + output.diagramPath;
        DOM.diagramImage.src = diagramPath;
        DOM.diagramImage.alt = 'Diagrama de Arquitetura';
        
        // Description
        const descriptionHtml = window.AEA_DATA.description
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .map(line => `<p>${line}</p>`)
            .join('');
        DOM.descriptionContent.innerHTML = descriptionHtml;
    }

    function renderRightPanel(output, criterion) {
        // Criterion info
        DOM.criterionName.textContent = criterion.name;
        DOM.criterionDescription.textContent = criterion.description;
        
        // Clear existing guidelines
        DOM.guidelinesContainer.innerHTML = '';
        
        // Render each guideline
        output.guidelines.forEach((guidelineData, idx) => {
            const guidelineDef = criterion.guidelines.find(g => g.id === guidelineData.id);
            const guidelineEl = createGuidelineCard(guidelineData, guidelineDef, output.id, idx);
            DOM.guidelinesContainer.appendChild(guidelineEl);
        });
    }

    function createGuidelineCard(guidelineData, guidelineDef, outputId, idx) {
        const template = DOM.guidelineTemplate.content.cloneNode(true);
        const card = template.querySelector('.guideline-card');
        
        const guidelineId = `${outputId}_${guidelineData.id}`;
        card.dataset.guidelineId = guidelineId;
        
        // Header
        card.querySelector('.guideline-name').textContent = 
            `${idx + 1}. ${guidelineDef ? guidelineDef.name : guidelineData.id}`;
        card.querySelector('.guideline-question').textContent = 
            guidelineDef ? guidelineDef.description : '';
        
        // LLM Analysis
        card.querySelector('.score-value').textContent = guidelineData.score;
        card.querySelector('.justification-text').textContent = guidelineData.justification;
        
        // Update form field names
        const likertInputs = card.querySelectorAll('.likert-option input');
        likertInputs.forEach(input => {
            input.name = `likert_${guidelineId}`;
            input.setAttribute('tabindex', '-1');
        });
        
        // Make likert circles focusable instead
        const likertCircles = card.querySelectorAll('.likert-circle');
        likertCircles.forEach((circle, i) => {
            circle.setAttribute('tabindex', '0');
            circle.addEventListener('keydown', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    likertInputs[i].checked = true;
                    likertInputs[i].dispatchEvent(new Event('change'));
                }
            });
        });
        
        const checkboxInputs = card.querySelectorAll('.issue-checkbox');
        checkboxInputs.forEach(input => {
            input.name = `issues_${guidelineId}`;
            input.setAttribute('tabindex', '-1');
        });
        
        // Make checkbox options focusable
        const checkboxOptions = card.querySelectorAll('.checkbox-option');
        checkboxOptions.forEach((option, i) => {
            option.setAttribute('tabindex', '0');
            option.addEventListener('keydown', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    checkboxInputs[i].checked = !checkboxInputs[i].checked;
                    checkboxInputs[i].dispatchEvent(new Event('change'));
                }
            });
        });
        
        const textarea = card.querySelector('.comment-textarea');
        textarea.name = `comment_${guidelineId}`;
        
        // Add event listeners for checkbox logic
        setupCheckboxLogic(card, guidelineId);
        
        return card;
    }

    function setupCheckboxLogic(card, guidelineId) {
        const correctCheckbox = card.querySelector('input[value="correct"]');
        const errorCheckboxes = card.querySelectorAll('.error-option input');
        const commentGroup = card.querySelector('.comment-group');
        const textarea = card.querySelector('.comment-textarea');
        
        // When "correct" is checked, uncheck all errors
        correctCheckbox.addEventListener('change', function() {
            if (this.checked) {
                errorCheckboxes.forEach(cb => cb.checked = false);
                commentGroup.classList.remove('required');
                textarea.removeAttribute('required');
            }
        });
        
        // When any error is checked, uncheck "correct" and make comment required
        errorCheckboxes.forEach(errorCb => {
            errorCb.addEventListener('change', function() {
                if (this.checked) {
                    correctCheckbox.checked = false;
                }
                
                // Check if any error is selected
                const anyErrorSelected = Array.from(errorCheckboxes).some(cb => cb.checked);
                if (anyErrorSelected) {
                    commentGroup.classList.add('required');
                    textarea.setAttribute('required', 'required');
                } else {
                    commentGroup.classList.remove('required');
                    textarea.removeAttribute('required');
                }
            });
        });
    }

    function loadSavedResponse(outputId) {
        const response = state.responses[outputId];
        if (!response) return;
        
        // Load each guideline's response
        response.guidelines.forEach(guidelineResponse => {
            const card = document.querySelector(`[data-guideline-id="${guidelineResponse.guidelineId}"]`);
            if (!card) return;
            
            // Likert scale
            if (guidelineResponse.likertScore) {
                const likertInput = card.querySelector(`input[name="likert_${guidelineResponse.guidelineId}"][value="${guidelineResponse.likertScore}"]`);
                if (likertInput) likertInput.checked = true;
            }
            
            // Issues
            if (guidelineResponse.issues && guidelineResponse.issues.length > 0) {
                guidelineResponse.issues.forEach(issue => {
                    const checkbox = card.querySelector(`input[name="issues_${guidelineResponse.guidelineId}"][value="${issue}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                        // Trigger change event to update UI
                        checkbox.dispatchEvent(new Event('change'));
                    }
                });
            }
            
            // Comment
            if (guidelineResponse.comment) {
                const textarea = card.querySelector(`textarea[name="comment_${guidelineResponse.guidelineId}"]`);
                if (textarea) textarea.value = guidelineResponse.comment;
            }
        });
    }

    function collectCurrentResponse() {
        const outputIndex = state.shuffledOrder[state.currentIndex];
        const output = window.AEA_DATA.outputs[outputIndex];
        
        const guidelinesResponses = [];
        const cards = DOM.guidelinesContainer.querySelectorAll('.guideline-card');
        
        cards.forEach(card => {
            const guidelineId = card.dataset.guidelineId;
            
            // Get likert score
            const likertInput = card.querySelector(`input[name="likert_${guidelineId}"]:checked`);
            const likertScore = likertInput ? parseInt(likertInput.value) : null;
            
            // Get issues
            const issueCheckboxes = card.querySelectorAll(`input[name="issues_${guidelineId}"]:checked`);
            const issues = Array.from(issueCheckboxes).map(cb => cb.value);
            
            // Get comment
            const textarea = card.querySelector(`textarea[name="comment_${guidelineId}"]`);
            const comment = textarea ? textarea.value.trim() : '';
            
            guidelinesResponses.push({
                guidelineId,
                likertScore,
                issues,
                comment
            });
        });
        
        return {
            outputId: output.id,
            model: output.model,
            format: output.format,
            criterion: output.criterion,
            guidelines: guidelinesResponses,
            timestamp: new Date().toISOString()
        };
    }

    function validateCurrentResponse() {
        const cards = DOM.guidelinesContainer.querySelectorAll('.guideline-card');
        let isValid = true;
        let firstInvalidElement = null;
        
        cards.forEach(card => {
            const guidelineId = card.dataset.guidelineId;
            
            // Check likert scale
            const likertInput = card.querySelector(`input[name="likert_${guidelineId}"]:checked`);
            if (!likertInput) {
                isValid = false;
                if (!firstInvalidElement) {
                    firstInvalidElement = card.querySelector('.likert-scale');
                }
            }
            
            // Check if any error is selected but no comment
            const errorCheckboxes = card.querySelectorAll('.error-option input:checked');
            const textarea = card.querySelector(`textarea[name="comment_${guidelineId}"]`);
            
            if (errorCheckboxes.length > 0 && (!textarea.value || !textarea.value.trim())) {
                isValid = false;
                if (!firstInvalidElement) {
                    firstInvalidElement = textarea;
                }
            }
        });
        
        if (!isValid && firstInvalidElement) {
            const panelContent = firstInvalidElement.closest('.panel-content');
            if (panelContent) {
                const elementTop = firstInvalidElement.offsetTop - panelContent.offsetTop;
                panelContent.scrollTo({ top: elementTop - 100, behavior: 'smooth' });
            }
            firstInvalidElement.focus({ preventScroll: true });
        }
        
        return isValid;
    }

    function updateNavigationButtons() {
        DOM.prevBtn.disabled = state.currentIndex === 0;
        
        if (state.currentIndex === CONFIG.TOTAL_OUTPUTS - 1) {
            DOM.nextBtn.textContent = 'Finalizar ✓';
        } else {
            DOM.nextBtn.textContent = 'Próximo →';
        }
    }

    // =========================================
    // Event Handlers
    // =========================================
    
    function initAuditScreen() {
        DOM.auditForm.addEventListener('submit', handleNext);
        DOM.prevBtn.addEventListener('click', handlePrevious);
        DOM.saveExitBtn.addEventListener('click', handleSaveAndExit);
    }

    async function handleNext(e) {
        e.preventDefault();
        
        // Validate
        if (!validateCurrentResponse()) {
            alert('Por favor, preencha todos os campos obrigatórios.\n\nNota: Se você identificou algum erro na análise, o campo de comentários é obrigatório.');
            return;
        }
        
        // Collect response
        const response = collectCurrentResponse();
        const outputId = response.outputId;
        
        // Save response locally first
        state.responses[outputId] = response;
        saveState();
        
        // Show saving feedback
        showSavingFeedback(true, 'Enviando dados para o servidor...');
        
        // Disable navigation buttons during submission
        DOM.nextBtn.disabled = true;
        DOM.prevBtn.disabled = true;
        
        try {
            // Send to Google Apps Script
            const result = await sendToGoogleScript(response);
            
            // Hide saving overlay
            showSavingFeedback(false);
            
            // Re-enable buttons
            DOM.prevBtn.disabled = state.currentIndex === 0;
            DOM.nextBtn.disabled = false;
            
            if (result.success) {
                // Show success toast
                showSuccessToast('Dados salvos com sucesso!');
                
                // Small delay to let user see the success message
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Navigate
                if (state.currentIndex < CONFIG.TOTAL_OUTPUTS - 1) {
                    state.currentIndex++;
                    saveState();
                    renderCurrentOutput();
                    // Scroll to top of right panel
                    DOM.guidelinesContainer.closest('.panel-content').scrollTop = 0;
                } else {
                    // Completed all
                    showScreen('completion');
                }
            } else if (!result.skipped) {
                // Show error but still allow navigation (data is saved locally)
                console.warn('Backend save had issues, but data is saved locally');
                showSuccessToast('Dados salvos localmente.');
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Navigate anyway (local save is successful)
                if (state.currentIndex < CONFIG.TOTAL_OUTPUTS - 1) {
                    state.currentIndex++;
                    saveState();
                    renderCurrentOutput();
                    DOM.guidelinesContainer.closest('.panel-content').scrollTop = 0;
                } else {
                    showScreen('completion');
                }
            } else {
                // Skipped (no URL configured) - just navigate
                if (state.currentIndex < CONFIG.TOTAL_OUTPUTS - 1) {
                    state.currentIndex++;
                    saveState();
                    renderCurrentOutput();
                    DOM.guidelinesContainer.closest('.panel-content').scrollTop = 0;
                } else {
                    showScreen('completion');
                }
            }
        } catch (error) {
            console.error('Error during submission:', error);
            showSavingFeedback(false);
            
            // Re-enable buttons
            DOM.prevBtn.disabled = state.currentIndex === 0;
            DOM.nextBtn.disabled = false;
            
            // Still allow navigation since data is saved locally
            showSuccessToast('Dados salvos localmente.');
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (state.currentIndex < CONFIG.TOTAL_OUTPUTS - 1) {
                state.currentIndex++;
                saveState();
                renderCurrentOutput();
                DOM.guidelinesContainer.closest('.panel-content').scrollTop = 0;
            } else {
                showScreen('completion');
            }
        }
    }

    function handlePrevious() {
        if (state.currentIndex > 0) {
            // Save current response before going back
            const response = collectCurrentResponse();
            state.responses[response.outputId] = response;
            
            state.currentIndex--;
            saveState();
            renderCurrentOutput();
            // Scroll to top of right panel
            DOM.guidelinesContainer.closest('.panel-content').scrollTop = 0;
        }
    }

    function handleSaveAndExit() {
        // Save current response
        const response = collectCurrentResponse();
        state.responses[response.outputId] = response;
        saveState();
        
        alert('Seu progresso foi salvo! Você pode continuar depois usando o mesmo email.');
        showScreen('welcome');
        
        // Reset email input to show progress
        DOM.userEmail.value = state.userEmail;
        DOM.userEmail.dispatchEvent(new Event('input'));
    }

    // =========================================
    // Google Apps Script Integration
    // =========================================
    
    /**
     * Shows a loading/saving overlay with status message
     */
    function showSavingFeedback(show, message = 'Salvando dados...', isError = false) {
        let overlay = document.getElementById('saving-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'saving-overlay';
            overlay.innerHTML = `
                <div class="saving-modal">
                    <div class="saving-spinner"></div>
                    <p class="saving-message"></p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        const modal = overlay.querySelector('.saving-modal');
        const messageEl = overlay.querySelector('.saving-message');
        const spinner = overlay.querySelector('.saving-spinner');
        
        messageEl.textContent = message;
        
        if (isError) {
            modal.classList.add('error');
            spinner.style.display = 'none';
        } else {
            modal.classList.remove('error');
            spinner.style.display = 'block';
        }
        
        overlay.style.display = show ? 'flex' : 'none';
    }

    /**
     * Shows a success toast notification
     */
    function showSuccessToast(message = 'Dados salvos com sucesso!') {
        let toast = document.getElementById('success-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'success-toast';
            toast.className = 'success-toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    /**
     * Extracts LLM score number from score string like "4 (Excellent)"
     */
    function extractLLMScore(scoreString) {
        if (!scoreString) return null;
        const match = scoreString.match(/^(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Prepares payload for a single guideline submission
     */
    function prepareGuidelinePayload(outputData, guidelineResponse, guidelineData) {
        const issues = guidelineResponse.issues || [];
        
        // Is_Factual_Correct = 1 if ONLY 'correct' is checked, 0 otherwise
        const isFactualCorrect = (issues.length === 1 && issues.includes('correct')) ? 1 : 0;
        
        // Error flags: 1 if checked, 0 otherwise
        const errHallucination = issues.includes('hallucination') ? 1 : 0;
        const errOmission = issues.includes('omission') ? 1 : 0;
        const errLogic = issues.includes('misinterpretation') ? 1 : 0; // Mapped to Err_Logic
        const errContradiction = issues.includes('contradiction') ? 1 : 0;
        const errVagueness = issues.includes('vagueness') ? 1 : 0;
        
        return {
            Output_ID: outputData.id,
            Expert_ID: state.userEmail,
            Model: outputData.model,
            Input_Format: outputData.format,
            Criterion: outputData.criterion,
            Guideline: guidelineData.id,
            LLM_Score: extractLLMScore(guidelineData.score),
            Agreement_Score: guidelineResponse.likertScore,
            Is_Factual_Correct: isFactualCorrect,
            Err_Hallucination: errHallucination,
            Err_Omission: errOmission,
            Err_Logic: errLogic,
            Err_Contradiction: errContradiction,
            Err_Vagueness: errVagueness,
            Expert_Comment: guidelineResponse.comment || ''
        };
    }

    /**
     * Sends a single guideline data to the backend
     */
    async function sendGuidelineToBackend(payload) {
        try {
            // Using mode: 'no-cors' to handle CORS restrictions
            // Note: With 'no-cors', we can't read the response, but the request will be sent
            const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            // With 'no-cors', response.ok is always false and type is 'opaque'
            // We assume success if no error was thrown
            console.log('Guideline data sent:', payload.Guideline);
            return { success: true };
        } catch (error) {
            console.error('Error sending guideline:', payload.Guideline, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sends all guidelines for a response atomically
     * Returns a promise that resolves when all are sent
     */
    async function sendToGoogleScript(response) {
        // Skip if URL not configured
        if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.log('Google Apps Script URL not configured. Data:', response);
            return Promise.resolve({ success: true, skipped: true });
        }

        const outputIndex = state.shuffledOrder[state.currentIndex];
        const outputData = window.AEA_DATA.outputs[outputIndex];
        
        const promises = [];
        
        // Prepare and send each guideline
        response.guidelines.forEach((guidelineResponse, idx) => {
            const guidelineData = outputData.guidelines[idx];
            const payload = prepareGuidelinePayload(outputData, guidelineResponse, guidelineData);
            promises.push(sendGuidelineToBackend(payload));
        });
        
        try {
            const results = await Promise.all(promises);
            const allSuccess = results.every(r => r.success);
            
            if (allSuccess) {
                console.log('All guidelines sent successfully for output:', response.outputId);
            } else {
                console.warn('Some guidelines failed to send');
            }
            
            return { success: allSuccess, results };
        } catch (error) {
            console.error('Error in batch send:', error);
            return { success: false, error: error.message };
        }
    }

    // =========================================
    // Completion Screen Logic
    // =========================================
    
    function initCompletionScreen() {
        DOM.restartBtn.addEventListener('click', handleRestart);
    }

    function handleRestart() {
        // Clear state
        clearState();
        
        // Reset state object
        state = {
            userEmail: null,
            shuffledOrder: [],
            currentIndex: 0,
            responses: {},
            startTime: null
        };
        
        // Reset form
        DOM.userEmail.value = '';
        DOM.btnText.style.display = 'inline';
        DOM.btnContinue.style.display = 'none';
        DOM.progressInfo.style.display = 'none';
        
        // Show welcome screen
        showScreen('welcome');
    }

    // =========================================
    // Initialization
    // =========================================
    
    function init() {
        initWelcomeScreen();
        initAuditScreen();
        initCompletionScreen();
        
        // Check URL params for direct access (optional)
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        
        if (email) {
            DOM.userEmail.value = email;
            DOM.userEmail.dispatchEvent(new Event('input'));
        }
        
        showScreen('welcome');
    }

    // Start the application
    document.addEventListener('DOMContentLoaded', init);

})();
