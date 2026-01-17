// ============================================
// PASSWORD STRENGTH CALCULATOR
// Returns: { strength: 'weak'|'medium'|'strong', color: string }
// ============================================
export const getPasswordStrength = (password) => {
  if (!password || password.length < 3) {
    return { strength: 'Too Short', color: 'text-red-500' };
  }

  let score = 0;

  // Length check
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) score++; // has lowercase
  if (/[A-Z]/.test(password)) score++; // has uppercase
  if (/[0-9]/.test(password)) score++; // has number
  if (/[^a-zA-Z0-9]/.test(password)) score++; // has special char

  // Determine strength based on score
  if (score <= 2) {
    return { strength: 'Weak', color: 'text-red-500' };
  } else if (score <= 4) {
    return { strength: 'Medium', color: 'text-yellow-500' };
  } else {
    return { strength: 'Strong', color: 'text-green-500' };
  }
};