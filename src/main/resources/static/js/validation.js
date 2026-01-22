// Additional validation utilities
class ValidationUtils {
    
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static validateIndianMobile(mobile) {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    }
    
    static validatePAN(pan) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    }
    
    static validateAadhar(aadhar) {
        const aadharRegex = /^[0-9]{12}$/;
        return aadharRegex.test(aadhar);
    }
    
    static validatePincode(pincode) {
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        return pincodeRegex.test(pincode);
    }
    
    static validateAge(dateOfBirth, minAge = 18, maxAge = 65) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= minAge && age <= maxAge;
    }
    
    static validateSalaryExperience(salary, experience) {
        // Basic validation: salary should be reasonable for experience level
        const minSalaryPerYear = 2; // 2 LPA minimum
        const maxSalaryForFresher = 8; // 8 LPA max for 0-1 years experience
        const maxSalaryForJunior = 15; // 15 LPA max for 1-3 years experience
        
        if (salary < minSalaryPerYear) {
            return { valid: false, message: 'Salary expectation seems too low' };
        }
        
        if (experience < 1 && salary > maxSalaryForFresher) {
            return { valid: false, message: 'Salary expectation seems high for fresher level' };
        }
        
        if (experience >= 1 && experience <= 3 && salary > maxSalaryForJunior) {
            return { valid: false, message: 'Salary expectation seems high for junior level' };
        }
        
        return { valid: true };
    }
    
    static validateGraduationYear(year, dateOfBirth) {
        const currentYear = new Date().getFullYear();
        const birthYear = new Date(dateOfBirth).getFullYear();
        
        // Minimum age for graduation is typically 20-22
        const expectedMinGradYear = birthYear + 20;
        const expectedMaxGradYear = birthYear + 30; // Allow for late graduation
        
        if (year < expectedMinGradYear) {
            return { valid: false, message: 'Graduation year seems too early based on date of birth' };
        }
        
        if (year > currentYear + 1) {
            return { valid: false, message: 'Graduation year cannot be in the future' };
        }
        
        return { valid: true };
    }
    
    static validateExperienceConsistency(totalExp, relevantExp, graduationYear) {
        const currentYear = new Date().getFullYear();
        const yearsSinceGraduation = currentYear - graduationYear;
        
        if (totalExp > yearsSinceGraduation + 1) {
            return { 
                valid: false, 
                message: 'Total experience cannot exceed years since graduation' 
            };
        }
        
        if (relevantExp > totalExp) {
            return { 
                valid: false, 
                message: 'Relevant experience cannot exceed total experience' 
            };
        }
        
        return { valid: true };
    }
    
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potentially harmful characters
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }
    
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount * 100000); // Convert lakhs to rupees
    }
    
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Cross-field validation rules
class CrossFieldValidator {
    
    static validateJobApplication(formData) {
        const errors = [];
        
        // Salary vs Experience validation
        if (formData.expectedSalaryCTC && formData.totalExperience !== undefined) {
            const salaryValidation = ValidationUtils.validateSalaryExperience(
                parseFloat(formData.expectedSalaryCTC), 
                parseFloat(formData.totalExperience)
            );
            
            if (!salaryValidation.valid) {
                errors.push(salaryValidation.message);
            }
        }
        
        // Experience consistency validation
        if (formData.totalExperience !== undefined && 
            formData.relevantExperience !== undefined && 
            formData.graduationYear) {
            
            const expValidation = ValidationUtils.validateExperienceConsistency(
                parseFloat(formData.totalExperience),
                parseFloat(formData.relevantExperience),
                parseInt(formData.graduationYear)
            );
            
            if (!expValidation.valid) {
                errors.push(expValidation.message);
            }
        }
        
        // Age validation based on date of birth
        if (formData.dateOfBirth) {
            if (!ValidationUtils.validateAge(formData.dateOfBirth)) {
                errors.push('Age must be between 18 and 65 years');
            }
        }
        
        // Graduation year validation
        if (formData.graduationYear && formData.dateOfBirth) {
            const gradValidation = ValidationUtils.validateGraduationYear(
                parseInt(formData.graduationYear),
                formData.dateOfBirth
            );
            
            if (!gradValidation.valid) {
                errors.push(gradValidation.message);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
}

// Real-time validation helpers
class RealTimeValidator {
    
    static setupRealTimeValidation(workflowManager) {
        // Debounced validation function
        const debouncedValidate = ValidationUtils.debounce((fieldId, value) => {
            RealTimeValidator.validateFieldRealTime(fieldId, value, workflowManager);
        }, 500);
        
        // Attach to form inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('.form-input, .form-select, .form-textarea')) {
                debouncedValidate(e.target.name, e.target.value);
            }
        });
    }
    
    static validateFieldRealTime(fieldId, value, workflowManager) {
        // Clear existing errors
        workflowManager.clearFieldError(fieldId);
        
        // Perform field-specific validation
        switch (fieldId) {
            case 'email':
                if (value && !ValidationUtils.validateEmail(value)) {
                    workflowManager.showFieldError(fieldId, 'Please enter a valid email address');
                }
                break;
                
            case 'mobileNumber':
            case 'alternateNumber':
                if (value && !ValidationUtils.validateIndianMobile(value)) {
                    workflowManager.showFieldError(fieldId, 'Please enter a valid 10-digit mobile number');
                }
                break;
                
            case 'panNumber':
                if (value && !ValidationUtils.validatePAN(value)) {
                    workflowManager.showFieldError(fieldId, 'Please enter a valid PAN number (e.g., ABCDE1234F)');
                }
                break;
                
            case 'aadharNumber':
                if (value && !ValidationUtils.validateAadhar(value)) {
                    workflowManager.showFieldError(fieldId, 'Please enter a valid 12-digit Aadhar number');
                }
                break;
                
            case 'currentPincode':
            case 'permanentPincode':
                if (value && !ValidationUtils.validatePincode(value)) {
                    workflowManager.showFieldError(fieldId, 'Please enter a valid 6-digit pincode');
                }
                break;
        }
    }
}