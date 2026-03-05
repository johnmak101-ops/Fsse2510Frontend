/**
 * @file Error Utilities
 * @module lib/error-utils
 *
 * Provides specialized parsing for Firebase and API error messages.
 */

/**
 * Standardizes Firebase auth errors and generic exceptions into user-friendly messages.
 * 
 * @param {unknown} error - The caught error object.
 * @returns {string} User-facing error message.
 */
export const getFriendlyErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        const msg = error.message;

        if (
            msg.includes("auth/user-not-found") ||
            msg.includes("auth/wrong-password") ||
            msg.includes("auth/invalid-credential") ||
            msg.includes("auth/invalid-login-credentials")
        ) {
            return "Invalid email or password.";
        }

        if (msg.includes("auth/too-many-requests")) {
            return "Access temporarily blocked due to many failed attempts. Please try again later.";
        }

        if (msg.includes("auth/email-already-in-use")) {
            return "This email is already registered. Please login instead.";
        }
        if (msg.includes("auth/weak-password")) {
            return "Password should be at least 6 characters.";
        }
        if (msg.includes("auth/invalid-email")) {
            return "Please enter a valid email address.";
        }

        const cleanMsg = msg
            .replace("Firebase: ", "")
            .replace("Error (auth/", "")
            .replace(").", "")
            .replace(/-/g, " ");
        return cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
    }
    return "An unexpected error occurred.";
};
