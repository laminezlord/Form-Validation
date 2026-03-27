// Get form elements
const form = document.getElementById('validationForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const successMessage = document.getElementById('successMessage');

// Get icon elements for each field
const nameValidIcon = nameInput.parentElement.querySelector('.valid-icon');
const nameInvalidIcon = nameInput.parentElement.querySelector('.invalid-icon');
const emailValidIcon = emailInput.parentElement.querySelector('.valid-icon');
const emailInvalidIcon = emailInput.parentElement.querySelector('.invalid-icon');
const passwordValidIcon = passwordInput.parentElement.querySelector('.valid-icon');
const passwordInvalidIcon = passwordInput.parentElement.querySelector('.invalid-icon');

// Validation rules
const validators = {
  name: (value) => value.trim() !== '',
  email: (value) => value.includes('@') && value.includes('.'),
  password: (value) => value.length >= 6
};

// Show/hide icons function
function showIcons(validIcon, invalidIcon, state) {
  // Hide both first
  validIcon.classList.remove('show');
  invalidIcon.classList.remove('show');
  
  // Show appropriate icon based on state
  if (state === 'valid') {
    validIcon.classList.add('show');
  } else if (state === 'invalid') {
    invalidIcon.classList.add('show');
  }
  // if 'neutral', both stay hidden
}

// Real-time validation function
function validateField(input, validator, errorId, validIcon, invalidIcon) {
  const value = input.value;
  const isValid = validator(value);
  const errorElement = document.getElementById(errorId);
  
  // Reset classes
  input.classList.remove('valid', 'invalid');
  errorElement.classList.remove('show');
  
  // Determine state and show appropriate icon
  if (value === '') {
    // Empty - neutral state, hide both icons
    showIcons(validIcon, invalidIcon, 'neutral');
    return false;
  } else if (isValid) {
    // Valid - show green checkmark
    input.classList.add('valid');
    showIcons(validIcon, invalidIcon, 'valid');
    return true;
  } else {
    // Invalid - show red X and error message
    input.classList.add('invalid');
    errorElement.classList.add('show');
    showIcons(validIcon, invalidIcon, 'invalid');
    return false;
  }
}

// Add live validation listeners
nameInput.addEventListener('input', () => {
  validateField(nameInput, validators.name, 'nameError', nameValidIcon, nameInvalidIcon);
});

emailInput.addEventListener('input', () => {
  validateField(emailInput, validators.email, 'emailError', emailValidIcon, emailInvalidIcon);
});

passwordInput.addEventListener('input', () => {
  validateField(passwordInput, validators.password, 'passwordError', passwordValidIcon, passwordInvalidIcon);
});

// Form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const isNameValid = validators.name(nameInput.value);
  const isEmailValid = validators.email(emailInput.value);
  const isPasswordValid = validators.password(passwordInput.value);
  
  // Show errors for invalid fields
  if (!isNameValid) {
    nameInput.classList.add('invalid');
    document.getElementById('nameError').classList.add('show');
    showIcons(nameValidIcon, nameInvalidIcon, 'invalid');
  }
  if (!isEmailValid) {
    emailInput.classList.add('invalid');
    document.getElementById('emailError').classList.add('show');
    showIcons(emailValidIcon, emailInvalidIcon, 'invalid');
  }
  if (!isPasswordValid) {
    passwordInput.classList.add('invalid');
    document.getElementById('passwordError').classList.add('show');
    showIcons(passwordValidIcon, passwordInvalidIcon, 'invalid');
  }
  
  // Success - all fields valid
  if (isNameValid && isEmailValid && isPasswordValid) {
    form.style.display = 'none';
    successMessage.classList.add('show');
  }
});