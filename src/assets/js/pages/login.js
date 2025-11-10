// Login Page Module
import '../config/firebase.js';
import { registerWithEmail, loginWithEmail, loginWithGoogle, resetPassword, initAuthStateListener } from '../modules/auth.js';

// Initialize namespace
if (!window.TreeApp) {
    window.TreeApp = {};
}

class LoginPage {
    constructor() {
        this.initElements();
        this.setupEventListeners();
        this.checkAuth();
    }

    initElements() {
        this.body = document.body;
        this.btnSignin = document.getElementById('signin');
        this.btnSignup = document.getElementById('signup');
        this.btnLogin = document.getElementById('btn-login');
        this.btnRegister = document.getElementById('btn-register');
        this.btnGoogleLogin = document.getElementById('btn-google-login');
        this.btnGoogleRegister = document.getElementById('btn-google-register');
        this.forgotPasswordLink = document.getElementById('forgot-password-link');
        
        this.inputEmailLogin = document.getElementById('input-email-login');
        this.inputPasswordLogin = document.getElementById('input-password-login');
        this.inputNameRegister = document.getElementById('input-name-register');
        this.inputEmailRegister = document.getElementById('input-email-register');
        this.inputPasswordRegister = document.getElementById('input-password-register');
    }

    setupEventListeners() {
        // Switch between login/register
        this.btnSignin?.addEventListener('click', () => this.switchToSignIn());
        this.btnSignup?.addEventListener('click', () => this.switchToSignUp());
        
        // Register
        this.btnRegister?.addEventListener('click', (e) => this.handleRegister(e));
        
        // Login
        this.btnLogin?.addEventListener('click', (e) => this.handleLogin(e));
        
        // Google auth
        this.btnGoogleLogin?.addEventListener('click', () => this.handleGoogleAuth());
        this.btnGoogleRegister?.addEventListener('click', () => this.handleGoogleAuth());
        
        // Password reset
        this.forgotPasswordLink?.addEventListener('click', (e) => this.handlePasswordReset(e));
    }

    switchToSignIn() {
        this.body.className = "sign-in-js";
    }

    switchToSignUp() {
        this.body.className = "sign-up-js";
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const email = this.inputEmailRegister?.value;
        const password = this.inputPasswordRegister?.value;
        const name = this.inputNameRegister?.value;

        if (!this.validateName(name) || !this.validateEmail(email) || !this.validatePassword(password)) {
            this.showAlert("Preencha Nome, Email e Senha (mín. 6 caracteres).");
            return;
        }

        try {
            await registerWithEmail(email, password, name);
            this.showAlert(`Conta criada para ${name}!`);
            // Redirect will happen automatically via auth state listener
        } catch (error) {
            this.showError(`Erro ao registrar: ${error.message}`);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.inputEmailLogin?.value;
        const password = this.inputPasswordLogin?.value;

        if (!this.validateEmail(email) || !this.validatePassword(password)) {
            this.showAlert("Preencha Email e Senha.");
            return;
        }

        try {
            await loginWithEmail(email, password);
            this.showAlert("Login bem-sucedido!");
            // Redirect will happen automatically via auth state listener
        } catch (error) {
            this.showError("Erro ao fazer login. Verifique suas credenciais.");
        }
    }

    async handleGoogleAuth() {
        try {
            const result = await loginWithGoogle();
            this.showAlert(`Login com Google bem-sucedido!`);
            // Redirect will happen automatically via auth state listener
        } catch (error) {
            this.showError("Erro ao fazer login com Google.");
        }
    }

    async handlePasswordReset(e) {
        e.preventDefault();
        
        const email = prompt("Digite seu email para recuperar a senha:");
        
        if (!email) {
            return; // User cancelled
        }
        
        if (!this.validateEmail(email)) {
            this.showError("Por favor, digite um email válido.");
            return;
        }
        
        try {
            const result = await resetPassword(email);
            
            if (result.success) {
                this.showAlert("Email de recuperação enviado! Verifique sua caixa de entrada.");
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            this.showError("Erro ao enviar email de recuperação. Tente novamente.");
        }
    }

    checkAuth() {
        initAuthStateListener((user) => {
            if (user) {
                // Redirect to Chat interface
                window.location.href = 'pages/chat.html';
            }
        });
    }

    // Validation functions
    validateEmail(email) {
        return email && email.includes('@');
    }

    validatePassword(password) {
        return password && password.length >= 6;
    }

    validateName(name) {
        return name && name.trim().length > 0;
    }

    // UI feedback
    showAlert(message) {
        alert(message);
    }

    showError(message) {
        alert(message);
    }
}

// Export to namespace
window.TreeApp.ui = window.TreeApp.ui || {};
window.TreeApp.ui.LoginPage = LoginPage;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LoginPage();
    });
} else {
    new LoginPage();
}

export default LoginPage;
