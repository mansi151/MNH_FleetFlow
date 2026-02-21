export const staticText = {
    auth: {
        heroTitle: "Simple Scheduling for Everyone",
        validation: {
            emailRequired: "Email is required",
            emailMinLength: "Email must be at least 3 characters",
            emailMaxLength: "Email must be less than 50 characters",
            emailInvalid: "Invalid email format",
            passwordRequired: "Password is required",
            passwordMinLength: "Password must be at least 8 characters",
            passwordMaxLength: "Password must be less than 50 characters",
            passwordLowercase: "Password must contain at least one lowercase letter",
            passwordUppercase: "Password must contain at least one uppercase letter",
            passwordNumber: "Password must contain at least one number",
            passwordNoSpaces: "Password must not contain spaces",
            passwordSpecialChar: "Password must contain at least one special character",
            usernameRequired: "Username is required",
            usernameMinLength: "Username must be at least 3 characters",
        },
        emailLabel: "Email Address",
        emailPlaceholder: "Enter your email",
        usernameLabel: "Username",
        usernamePlaceholder: "Enter your username",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        pleaseWait: "Please wait...",
        noAccountQuestion: "Don't have an account?",
        alreadyAccountQuestion: "Already have an account?",
        tosAgree: "I agree to the Terms of Service & Privacy Policy"
    },
    toast: {
        auth: {
            login: "Login successful!",
            loginFailed: "Login failed. Please check your credentials.",
            registerSuccess: "Registration successful! Proceed to login.",
            registerFailed: "Registration failed. Please try again."
        }
    }
};

export const useStaticText = () => staticText;

export const IMAGES = {
    // Using placeholders or icons from react-icons in components, 
    // but defining keys here to match user request structure if we were using real images
    lockIcon: "lock",
    mailIcon: "mail",
    userIcon: "user",
    eyeIcon: "eye",
    EyeActiveIcon: "eye-off"
};
