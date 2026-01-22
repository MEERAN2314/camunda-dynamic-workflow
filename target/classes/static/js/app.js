// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Job Application Workflow - Starting...');
    
    // Initialize workflow manager
    const workflowManager = new WorkflowManager();
    
    // Expose globally for debugging
    window.workflowManager = workflowManager;
    
    // Initialize the workflow
    workflowManager.initialize().catch(error => {
        console.error('Failed to initialize workflow:', error);
        showGlobalError('Failed to load the application form. Please refresh the page and try again.');
    });
    
    // Setup navigation button event listeners
    setupNavigationButtons(workflowManager);
    
    // Setup real-time validation (temporarily disabled for debugging)
    // RealTimeValidator.setupRealTimeValidation(workflowManager);
    
    // Setup global error handling
    setupGlobalErrorHandling();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts(workflowManager);
    
    console.log('Job Application Workflow - Initialized successfully');
});

function setupNavigationButtons(workflowManager) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    prevBtn.addEventListener('click', () => {
        workflowManager.previousStep();
    });
    
    nextBtn.addEventListener('click', () => {
        workflowManager.nextStep();
    });
    
    submitBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to submit your application? You will not be able to make changes after submission.')) {
            workflowManager.submitApplication();
        }
    });
}

function setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        showGlobalError('An unexpected error occurred. Please try again.');
        event.preventDefault();
    });
    
    // Handle general JavaScript errors
    window.addEventListener('error', function(event) {
        console.error('JavaScript error:', event.error);
        showGlobalError('An unexpected error occurred. Please refresh the page and try again.');
    });
}

function setupKeyboardShortcuts(workflowManager) {
    document.addEventListener('keydown', function(event) {
        // Ctrl/Cmd + Enter to proceed to next step
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            const nextBtn = document.getElementById('next-btn');
            const submitBtn = document.getElementById('submit-btn');
            
            if (nextBtn.style.display !== 'none' && !nextBtn.disabled) {
                workflowManager.nextStep();
            } else if (submitBtn.style.display !== 'none' && !submitBtn.disabled) {
                if (confirm('Submit application?')) {
                    workflowManager.submitApplication();
                }
            }
        }
        
        // Escape key to go back
        if (event.key === 'Escape') {
            const prevBtn = document.getElementById('prev-btn');
            if (!prevBtn.disabled) {
                workflowManager.previousStep();
            }
        }
    });
}

function showGlobalError(message) {
    const container = document.getElementById('message-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.innerHTML = `
        <strong>Error:</strong> ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2em;">&times;</button>
    `;
    
    container.appendChild(errorDiv);
}

// Utility functions for the application
const AppUtils = {
    
    // Format display values
    formatSalary: (lakhs) => {
        return `₹${lakhs} LPA`;
    },
    
    formatExperience: (years) => {
        if (years === 0) return 'Fresher';
        if (years === 1) return '1 Year';
        return `${years} Years`;
    },
    
    // Local storage helpers for saving progress
    saveProgress: (applicationId, stepData) => {
        try {
            const progressData = {
                applicationId,
                stepData,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('jobApplicationProgress', JSON.stringify(progressData));
        } catch (error) {
            console.warn('Failed to save progress to local storage:', error);
        }
    },
    
    loadProgress: () => {
        try {
            const saved = localStorage.getItem('jobApplicationProgress');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('Failed to load progress from local storage:', error);
            return null;
        }
    },
    
    clearProgress: () => {
        try {
            localStorage.removeItem('jobApplicationProgress');
        } catch (error) {
            console.warn('Failed to clear progress from local storage:', error);
        }
    },
    
    // Network status detection
    isOnline: () => navigator.onLine,
    
    // Setup offline/online handlers
    setupNetworkHandlers: () => {
        window.addEventListener('online', () => {
            showGlobalMessage('Connection restored. You can continue with your application.', 'success');
        });
        
        window.addEventListener('offline', () => {
            showGlobalMessage('You are currently offline. Your progress will be saved locally.', 'info');
        });
    }
};

function showGlobalMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2em;">&times;</button>
    `;
    
    container.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Initialize network handlers
AppUtils.setupNetworkHandlers();

// Performance monitoring
const PerformanceMonitor = {
    startTime: Date.now(),
    
    logLoadTime: () => {
        const loadTime = Date.now() - PerformanceMonitor.startTime;
        console.log(`Application loaded in ${loadTime}ms`);
    },
    
    logStepTransition: (fromStep, toStep) => {
        console.log(`Step transition: ${fromStep} -> ${toStep}`);
    }
};

// Log load time when everything is ready
window.addEventListener('load', () => {
    PerformanceMonitor.logLoadTime();
});