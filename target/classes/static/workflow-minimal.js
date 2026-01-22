// Minimal Workflow Manager - Fresh Version
class SimpleWorkflowManager {
    constructor() {
        this.workflowDefinition = null;
        this.currentStepIndex = 0;
        this.applicationId = null;
        this.stepData = {};
        this.baseUrl = '/api/job-applications';
    }

    async initialize() {
        try {
            console.log('Initializing simple workflow...');
            await this.loadWorkflowDefinition();
            await this.startApplication();
            this.renderCurrentStep();
            console.log('Simple workflow initialized successfully');
        } catch (error) {
            console.error('Failed to initialize workflow:', error);
            this.showMessage('Failed to load workflow. Please refresh the page.', 'error');
        }
    }

    async loadWorkflowDefinition() {
        const response = await fetch(`${this.baseUrl}/workflow-definition`);
        if (!response.ok) {
            throw new Error('Failed to load workflow definition');
        }
        this.workflowDefinition = await response.json();
        console.log('Workflow definition loaded:', this.workflowDefinition);
    }

    async startApplication() {
        const response = await fetch(`${this.baseUrl}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error('Failed to start application');
        }
        
        const result = await response.json();
        this.applicationId = result.applicationId;
        console.log('Application started:', this.applicationId);
        this.showMessage(`Application started! ID: ${this.applicationId}`, 'success');
    }

    renderCurrentStep() {
        const container = document.getElementById('current-step');
        const step = this.workflowDefinition.steps[this.currentStepIndex];

        container.innerHTML = `
            <div class="step-header">
                <h2 class="step-title">${step.stepName}</h2>
                <p class="step-description">${step.description}</p>
            </div>
            <form id="step-form" class="step-form">
                ${this.renderFields(step.fields)}
            </form>
        `;

        this.attachEventListeners();
        this.updateNavigationButtons();
        this.renderProgressIndicators();
    }

    renderProgressIndicators() {
        const container = document.getElementById('step-indicators');
        if (!container) return;
        
        container.innerHTML = '';

        this.workflowDefinition.steps.forEach((step, index) => {
            const indicator = document.createElement('div');
            indicator.className = 'step-indicator';
            if (index === this.currentStepIndex) {
                indicator.classList.add('active');
            } else if (index < this.currentStepIndex) {
                indicator.classList.add('completed');
            }

            indicator.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-name">${step.stepName}</div>
            `;

            container.appendChild(indicator);
        });

        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progressPercentage = ((this.currentStepIndex + 1) / this.workflowDefinition.steps.length) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    renderFields(fields) {
        return fields.map(field => {
            const isRequired = field.required ? 'required' : '';
            const requiredClass = field.required ? 'required' : '';
            
            switch (field.fieldType) {
                case 'text':
                case 'email':
                    return `
                        <div class="form-group">
                            <label class="form-label ${requiredClass}" for="${field.fieldId}">
                                ${field.fieldName}
                            </label>
                            <input 
                                type="text"
                                id="${field.fieldId}"
                                name="${field.fieldId}"
                                class="form-input"
                                placeholder="${field.placeholder || ''}"
                                ${isRequired}
                                value="${this.stepData[field.fieldId] || ''}"
                            />
                            <span class="error-message" id="${field.fieldId}-error"></span>
                        </div>
                    `;

                case 'number':
                    return `
                        <div class="form-group">
                            <label class="form-label ${requiredClass}" for="${field.fieldId}">
                                ${field.fieldName}
                            </label>
                            <input 
                                type="number"
                                id="${field.fieldId}"
                                name="${field.fieldId}"
                                class="form-input"
                                placeholder="${field.placeholder || ''}"
                                ${isRequired}
                                value="${this.stepData[field.fieldId] || ''}"
                            />
                            <span class="error-message" id="${field.fieldId}-error"></span>
                        </div>
                    `;

                case 'date':
                    return `
                        <div class="form-group">
                            <label class="form-label ${requiredClass}" for="${field.fieldId}">
                                ${field.fieldName}
                            </label>
                            <input 
                                type="date"
                                id="${field.fieldId}"
                                name="${field.fieldId}"
                                class="form-input"
                                ${isRequired}
                                value="${this.stepData[field.fieldId] || ''}"
                            />
                            <span class="error-message" id="${field.fieldId}-error"></span>
                        </div>
                    `;

                case 'dropdown':
                    const options = field.options.map(option => 
                        `<option value="${option.value}" ${this.stepData[field.fieldId] === option.value ? 'selected' : ''}>
                            ${option.label}
                        </option>`
                    ).join('');
                    
                    return `
                        <div class="form-group">
                            <label class="form-label ${requiredClass}" for="${field.fieldId}">
                                ${field.fieldName}
                            </label>
                            <select 
                                id="${field.fieldId}"
                                name="${field.fieldId}"
                                class="form-select"
                                ${isRequired}
                            >
                                <option value="">Select ${field.fieldName}</option>
                                ${options}
                            </select>
                            <span class="error-message" id="${field.fieldId}-error"></span>
                        </div>
                    `;

                case 'radio':
                    const radioOptions = field.options.map(option => 
                        `<div class="radio-option ${this.stepData[field.fieldId] === option.value ? 'selected' : ''}">
                            <input 
                                type="radio" 
                                id="${field.fieldId}-${option.value}"
                                name="${field.fieldId}"
                                value="${option.value}"
                                ${this.stepData[field.fieldId] === option.value ? 'checked' : ''}
                            />
                            <label for="${field.fieldId}-${option.value}">${option.label}</label>
                        </div>`
                    ).join('');
                    
                    return `
                        <div class="form-group">
                            <label class="form-label ${requiredClass}">
                                ${field.fieldName}
                            </label>
                            <div class="radio-group" data-field-id="${field.fieldId}">
                                ${radioOptions}
                            </div>
                            <span class="error-message" id="${field.fieldId}-error"></span>
                        </div>
                    `;

                case 'checkbox':
                    const savedValues = this.stepData[field.fieldId] || [];
                    const checkboxOptions = field.options.map(option => 
                        `<div class="checkbox-option ${savedValues.includes(option.value) ? 'selected' : ''}">
                            <input 
                                type="checkbox" 
                                id="${field.fieldId}-${option.value}"
                                name="${field.fieldId}"
                                value="${option.value}"
                                ${savedValues.includes(option.value) ? 'checked' : ''}
                            />
                            <label for="${field.fieldId}-${option.value}">${option.label}</label>
                        </div>`
                    ).join('');
                    
                    return `
                        <div class="form-group">
                            <label class="form-label ${requiredClass}">
                                ${field.fieldName}
                            </label>
                            <div class="checkbox-group" data-field-id="${field.fieldId}">
                                ${checkboxOptions}
                            </div>
                            <span class="error-message" id="${field.fieldId}-error"></span>
                        </div>
                    `;

                default:
                    return `<div class="form-group">Unsupported field type: ${field.fieldType}</div>`;
            }
        }).join('');
    }

    attachEventListeners() {
        const form = document.getElementById('step-form');
        
        // Initialize form data from existing values
        this.captureCurrentFormData();
        
        // Add change listeners
        form.addEventListener('change', (e) => {
            this.handleFieldChange(e);
        });

        form.addEventListener('input', (e) => {
            this.handleFieldChange(e);
        });

        // Add click listeners for radio and checkbox styling
        document.querySelectorAll('.radio-option, .checkbox-option').forEach(option => {
            option.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT') {
                    const input = option.querySelector('input');
                    if (input.type === 'radio') {
                        input.checked = true;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    } else if (input.type === 'checkbox') {
                        input.checked = !input.checked;
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        });
    }

    captureCurrentFormData() {
        // Capture all current form values
        const form = document.getElementById('step-form');
        if (!form) return;

        // Text inputs, selects, textareas
        form.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], input[type="date"], select, textarea').forEach(input => {
            if (input.value && input.name) {
                this.stepData[input.name] = input.value;
                console.log('Captured field:', input.name, '=', input.value);
            }
        });

        // Radio buttons
        form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            if (radio.name) {
                this.stepData[radio.name] = radio.value;
                console.log('Captured radio:', radio.name, '=', radio.value);
            }
        });

        // Checkboxes
        const checkboxGroups = {};
        form.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            if (checkbox.name) {
                if (!checkboxGroups[checkbox.name]) {
                    checkboxGroups[checkbox.name] = [];
                }
                checkboxGroups[checkbox.name].push(checkbox.value);
            }
        });
        
        Object.keys(checkboxGroups).forEach(name => {
            this.stepData[name] = checkboxGroups[name];
            console.log('Captured checkbox group:', name, '=', checkboxGroups[name]);
        });

        console.log('Current stepData after capture:', this.stepData);
    }

    handleFieldChange(e) {
        const fieldId = e.target.name;
        const fieldType = e.target.type;
        
        console.log('Field changed:', fieldId, 'Type:', fieldType, 'Value:', e.target.value);
        
        if (fieldType === 'checkbox') {
            const checkboxGroup = document.querySelector(`[data-field-id="${fieldId}"]`);
            const checkedBoxes = checkboxGroup.querySelectorAll('input:checked');
            this.stepData[fieldId] = Array.from(checkedBoxes).map(cb => cb.value);
            
            checkboxGroup.querySelectorAll('.checkbox-option').forEach(option => {
                const input = option.querySelector('input');
                option.classList.toggle('selected', input.checked);
            });
        } else if (fieldType === 'radio') {
            this.stepData[fieldId] = e.target.value;
            console.log('Radio selected:', fieldId, '=', e.target.value);
            console.log('Current stepData:', this.stepData);
            
            const radioGroup = document.querySelector(`[data-field-id="${fieldId}"]`);
            if (radioGroup) {
                radioGroup.querySelectorAll('.radio-option').forEach(option => {
                    const input = option.querySelector('input');
                    option.classList.toggle('selected', input.checked);
                });
            }
        } else {
            this.stepData[fieldId] = e.target.value;
        }

        this.clearFieldError(fieldId);
    }

    validateCurrentStep() {
        const step = this.workflowDefinition.steps[this.currentStepIndex];
        let isValid = true;

        console.log('Validating step:', step.stepId);
        console.log('Current stepData:', this.stepData);

        // Clear all existing errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // Validate regular fields
        step.fields.forEach(field => {
            console.log('Validating field:', field.fieldId, 'Value:', this.stepData[field.fieldId]);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = this.stepData[field.fieldId];
        
        // Required field validation
        if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            this.showFieldError(field.fieldId, `${field.fieldName} is required`);
            return false;
        }

        return true;
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        prevBtn.disabled = this.currentStepIndex === 0;
        
        const isLastStep = this.currentStepIndex === this.workflowDefinition.steps.length - 1;
        
        if (isLastStep) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    async nextStep() {
        // First capture all current form data
        this.captureCurrentFormData();
        
        if (!this.validateCurrentStep()) {
            console.log('Validation failed, not proceeding');
            return;
        }

        try {
            const currentStep = this.workflowDefinition.steps[this.currentStepIndex];
            const stepSubmissionData = {
                currentStep: currentStep.stepId,
                ...this.stepData
            };

            console.log('Submitting step data:', stepSubmissionData);

            const response = await fetch(`${this.baseUrl}/${this.applicationId}/step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stepSubmissionData)
            });

            const result = await response.json();
            console.log('Step submission response:', result);
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit step');
            }

            this.currentStepIndex++;
            this.renderCurrentStep();
            this.showMessage('Step completed successfully!', 'success');

        } catch (error) {
            console.error('Failed to submit step:', error);
            this.showMessage(error.message, 'error');
        }
    }

    previousStep() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.renderCurrentStep();
        }
    }

    async submitApplication() {
        // First capture all current form data
        this.captureCurrentFormData();
        
        if (!this.validateCurrentStep()) {
            console.log('Validation failed, not submitting');
            return;
        }

        try {
            const currentStep = this.workflowDefinition.steps[this.currentStepIndex];
            const stepSubmissionData = {
                currentStep: currentStep.stepId,
                ...this.stepData
            };

            console.log('Submitting final application data:', stepSubmissionData);

            const response = await fetch(`${this.baseUrl}/${this.applicationId}/step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stepSubmissionData)
            });

            const result = await response.json();
            console.log('Final submission response:', result);
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit application');
            }

            console.log('Application submitted successfully:', result);
            this.showMessage(`Application submitted successfully! Your application ID is: ${this.applicationId}`, 'success');
            
            // Disable all form elements
            const stepForm = document.getElementById('step-form');
            if (stepForm) {
                stepForm.style.pointerEvents = 'none';
            }
            
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Application Submitted';
            }
            
            // Show final application ID prominently
            const container = document.getElementById('current-step');
            container.innerHTML = `
                <div class="step-header">
                    <h2 class="step-title">Application Submitted Successfully!</h2>
                    <p class="step-description">Thank you for your application.</p>
                </div>
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h3>Your Application ID:</h3>
                    <div style="font-size: 1.5em; font-weight: bold; color: #4CAF50; margin: 10px 0;">
                        ${this.applicationId}
                    </div>
                    <p>Please save this ID for future reference.</p>
                </div>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 8px;">
                    <h4>Next Steps:</h4>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>You will receive a confirmation email shortly</li>
                        <li>Our HR team will review your application</li>
                        <li>We will contact you within 5-7 business days</li>
                    </ul>
                </div>
            `;

        } catch (error) {
            console.error('Failed to submit application:', error);
            this.showMessage(error.message, 'error');
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 5000);
        }
    }

    // Debug function to check current state
    debugCurrentState() {
        console.log('=== DEBUG INFO ===');
        console.log('Application ID:', this.applicationId);
        console.log('Current Step Index:', this.currentStepIndex);
        console.log('Current Step:', this.workflowDefinition?.steps[this.currentStepIndex]?.stepId);
        console.log('Step Data:', this.stepData);
        console.log('Form Values:');
        
        const form = document.getElementById('step-form');
        if (form) {
            const formData = new FormData(form);
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
        }
        
        console.log('==================');
        return this.stepData;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple Workflow - Starting...');
    
    const workflowManager = new SimpleWorkflowManager();
    window.workflowManager = workflowManager;
    
    workflowManager.initialize().catch(error => {
        console.error('Failed to initialize workflow:', error);
    });
    
    // Setup navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => workflowManager.previousStep());
    if (nextBtn) nextBtn.addEventListener('click', () => workflowManager.nextStep());
    if (submitBtn) submitBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to submit your application? You will not be able to make changes after submission.')) {
            workflowManager.submitApplication();
        }
    });
    
    console.log('Simple Workflow - Initialized');
});