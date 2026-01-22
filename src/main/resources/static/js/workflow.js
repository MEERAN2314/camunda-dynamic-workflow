// Workflow Management Class
class WorkflowManager {
    constructor() {
        this.workflowDefinition = null;
        this.currentStepIndex = 0;
        this.applicationId = null;
        this.stepData = {};
        this.baseUrl = '/api/job-applications';
    }

    async initialize() {
        try {
            await this.loadWorkflowDefinition();
            await this.startApplication();
            this.renderProgressIndicators();
            this.renderCurrentStep();
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
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to start application');
        }
        
        const result = await response.json();
        this.applicationId = result.applicationId;
        console.log('Application started:', this.applicationId);
        this.showMessage(`Application started successfully! ID: ${this.applicationId}`, 'success');
    }

    renderProgressIndicators() {
        const container = document.getElementById('step-indicators');
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
        const progressPercentage = ((this.currentStepIndex + 1) / this.workflowDefinition.steps.length) * 100;
        progressFill.style.width = `${progressPercentage}%`;
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
                ${step.conditionalFields ? this.renderConditionalFields(step.conditionalFields) : ''}
            </form>
        `;

        this.attachFieldEventListeners();
        this.updateNavigationButtons();
    }

    renderFields(fields) {
        return fields.map(field => this.renderField(field)).join('');
    }

    renderConditionalFields(conditionalFields) {
        return conditionalFields.map(field => {
            const fieldHtml = this.renderField(field);
            return `<div class="conditional-field" data-field-id="${field.fieldId}" style="display: none;">${fieldHtml}</div>`;
        }).join('');
    }

    renderField(field) {
        const isRequired = field.required ? 'required' : '';
        const requiredClass = field.required ? 'required' : '';
        
        switch (field.fieldType) {
            case 'text':
            case 'email':
            case 'number':
                return `
                    <div class="form-group">
                        <label class="form-label ${requiredClass}" for="${field.fieldId}">
                            ${field.fieldName}
                        </label>
                        <input 
                            type="${field.fieldType === 'number' ? 'number' : 'text'}"
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

            case 'textarea':
                return `
                    <div class="form-group">
                        <label class="form-label ${requiredClass}" for="${field.fieldId}">
                            ${field.fieldName}
                        </label>
                        <textarea 
                            id="${field.fieldId}"
                            name="${field.fieldId}"
                            class="form-textarea"
                            placeholder="${field.placeholder || ''}"
                            ${isRequired}
                        >${this.stepData[field.fieldId] || ''}</textarea>
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
    }

    attachFieldEventListeners() {
        const form = document.getElementById('step-form');
        
        // Initialize form data from existing DOM values
        this.initializeFormData();
        
        // Add change listeners to all form elements
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
        
        // Add direct event listeners to radio buttons for immediate capture
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log('Direct radio change event:', e.target.name, '=', e.target.value);
                this.stepData[e.target.name] = e.target.value;
                this.clearFieldError(e.target.name);
            });
        });
    }

    initializeFormData() {
        // Capture any pre-selected radio buttons
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            this.stepData[radio.name] = radio.value;
        });
        
        // Capture any pre-selected checkboxes
        document.querySelectorAll('.checkbox-group').forEach(group => {
            const fieldId = group.getAttribute('data-field-id');
            const checkedBoxes = group.querySelectorAll('input:checked');
            if (checkedBoxes.length > 0) {
                this.stepData[fieldId] = Array.from(checkedBoxes).map(cb => cb.value);
            }
        });
        
        // Capture text inputs, selects, etc.
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], input[type="date"], select, textarea').forEach(input => {
            if (input.value) {
                this.stepData[input.name] = input.value;
            }
        });
    }

    handleFieldChange(e) {
        const fieldId = e.target.name;
        const fieldType = e.target.type;
        
        console.log('Field changed:', fieldId, 'Type:', fieldType, 'Value:', e.target.value);
        
        if (fieldType === 'checkbox') {
            // Handle checkbox groups
            const checkboxGroup = document.querySelector(`[data-field-id="${fieldId}"]`);
            const checkedBoxes = checkboxGroup.querySelectorAll('input:checked');
            this.stepData[fieldId] = Array.from(checkedBoxes).map(cb => cb.value);
            
            // Update visual selection
            checkboxGroup.querySelectorAll('.checkbox-option').forEach(option => {
                const input = option.querySelector('input');
                option.classList.toggle('selected', input.checked);
            });
        } else if (fieldType === 'radio') {
            this.stepData[fieldId] = e.target.value;
            console.log('Radio button selected:', fieldId, '=', e.target.value);
            console.log('Current stepData:', this.stepData);
            
            // Update visual selection for radio groups
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

        // Clear any existing error for this field
        this.clearFieldError(fieldId);
        
        // Handle conditional fields
        this.handleConditionalFields();
    }

    handleConditionalFields() {
        const step = this.workflowDefinition.steps[this.currentStepIndex];
        if (!step.conditionalFields) return;

        step.conditionalFields.forEach(field => {
            const fieldContainer = document.querySelector(`[data-field-id="${field.fieldId}"]`);
            if (!fieldContainer) return;

            const shouldShow = this.evaluateCondition(field.condition);
            fieldContainer.style.display = shouldShow ? 'block' : 'none';
            
            // Clear field data if hidden
            if (!shouldShow && this.stepData[field.fieldId]) {
                delete this.stepData[field.fieldId];
            }
        });
    }

    evaluateCondition(condition) {
        if (!condition) return true;

        const dependsOn = condition.dependsOn;
        const operator = condition.operator || '==';
        const expectedValue = condition.value;
        const actualValue = this.stepData[dependsOn];

        switch (operator) {
            case '==':
                return actualValue === expectedValue;
            case '!=':
                return actualValue !== expectedValue;
            case '>=':
                return parseFloat(actualValue) >= parseFloat(expectedValue);
            case '<=':
                return parseFloat(actualValue) <= parseFloat(expectedValue);
            case '>':
                return parseFloat(actualValue) > parseFloat(expectedValue);
            case '<':
                return parseFloat(actualValue) < parseFloat(expectedValue);
            default:
                return true;
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
        if (!this.validateCurrentStep()) {
            return;
        }

        try {
            const currentStep = this.workflowDefinition.steps[this.currentStepIndex];
            const stepSubmissionData = {
                currentStep: currentStep.stepId,
                ...this.stepData
            };

            const response = await fetch(`${this.baseUrl}/${this.applicationId}/step`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stepSubmissionData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit step');
            }

            this.currentStepIndex++;
            this.renderProgressIndicators();
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
            this.renderProgressIndicators();
            this.renderCurrentStep();
        }
    }

    async submitApplication() {
        if (!this.validateCurrentStep()) {
            return;
        }

        try {
            const currentStep = this.workflowDefinition.steps[this.currentStepIndex];
            const stepSubmissionData = {
                currentStep: currentStep.stepId,
                ...this.stepData
            };

            const response = await fetch(`${this.baseUrl}/${this.applicationId}/step`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stepSubmissionData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit application');
            }

            this.showMessage('Application submitted successfully! Thank you for applying.', 'success');
            
            // Disable all form elements
            document.getElementById('step-form').style.pointerEvents = 'none';
            document.getElementById('submit-btn').disabled = true;
            document.getElementById('submit-btn').textContent = 'Application Submitted';

        } catch (error) {
            console.error('Failed to submit application:', error);
            this.showMessage(error.message, 'error');
        }
    }

    validateCurrentStep() {
        const step = this.workflowDefinition.steps[this.currentStepIndex];
        let isValid = true;

        // Debug: Log current step data
        console.log('Validating step:', step.stepId);
        console.log('Current stepData:', this.stepData);

        // Clear all existing errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
            el.classList.remove('error');
        });
        document.querySelectorAll('.radio-group, .checkbox-group').forEach(el => {
            el.classList.remove('error');
        });

        // Validate regular fields
        step.fields.forEach(field => {
            console.log('Validating field:', field.fieldId, 'Value:', this.stepData[field.fieldId]);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate conditional fields that are visible
        if (step.conditionalFields) {
            step.conditionalFields.forEach(field => {
                const fieldContainer = document.querySelector(`[data-field-id="${field.fieldId}"]`);
                if (fieldContainer && fieldContainer.style.display !== 'none') {
                    if (!this.validateField(field)) {
                        isValid = false;
                    }
                }
            });
        }

        return isValid;
    }

    validateField(field) {
        const value = this.stepData[field.fieldId];
        
        // For radio buttons, we need to check the radio group instead of a single element
        let fieldElement = document.getElementById(field.fieldId);
        if (!fieldElement && field.fieldType === 'radio') {
            // For radio buttons, find the first radio input in the group
            fieldElement = document.querySelector(`input[name="${field.fieldId}"]`);
        }
        
        const errorElement = document.getElementById(`${field.fieldId}-error`);

        // Required field validation
        if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
            this.showFieldError(field.fieldId, `${field.fieldName} is required`);
            return false;
        }
            return false;
        }

        // Skip further validation if field is empty and not required
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return true;
        }

        // Validation rules
        if (field.validation) {
            const validation = field.validation;
            const stringValue = value.toString().trim();

            // Pattern validation
            if (validation.pattern) {
                const regex = new RegExp(validation.pattern);
                if (!regex.test(stringValue)) {
                    this.showFieldError(field.fieldId, `${field.fieldName} format is invalid`);
                    return false;
                }
            }

            // Length validation
            if (validation.minLength && stringValue.length < validation.minLength) {
                this.showFieldError(field.fieldId, `${field.fieldName} must be at least ${validation.minLength} characters`);
                return false;
            }

            if (validation.maxLength && stringValue.length > validation.maxLength) {
                this.showFieldError(field.fieldId, `${field.fieldName} must not exceed ${validation.maxLength} characters`);
                return false;
            }

            // Numeric validation
            if (field.fieldType === 'number') {
                const numValue = parseFloat(stringValue);
                
                if (isNaN(numValue)) {
                    this.showFieldError(field.fieldId, `${field.fieldName} must be a valid number`);
                    return false;
                }

                if (validation.min !== undefined && numValue < validation.min) {
                    this.showFieldError(field.fieldId, `${field.fieldName} must be at least ${validation.min}`);
                    return false;
                }

                if (validation.max !== undefined && numValue > validation.max) {
                    this.showFieldError(field.fieldId, `${field.fieldName} must not exceed ${validation.max}`);
                    return false;
                }
            }
        }

        return true;
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        let fieldElement = document.getElementById(fieldId);
        
        // For radio buttons, find the radio group container
        if (!fieldElement) {
            const radioGroup = document.querySelector(`[data-field-id="${fieldId}"]`);
            if (radioGroup) {
                fieldElement = radioGroup;
            }
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
        
        if (fieldElement) {
            fieldElement.classList.add('error');
        }
    }

    clearFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        let fieldElement = document.getElementById(fieldId);
        
        // For radio buttons, find the radio group container
        if (!fieldElement) {
            const radioGroup = document.querySelector(`[data-field-id="${fieldId}"]`);
            if (radioGroup) {
                fieldElement = radioGroup;
            }
        }
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        if (fieldElement) {
            fieldElement.classList.remove('error');
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        
        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 5000);
        }
    }
}