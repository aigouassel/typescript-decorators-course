/**
 * Type definitions for the validation system
 */

export interface ValidationRule {
  type: string;
  message: string;
  value?: any;
}

export interface ValidationError {
  property: string;
  message: string;
  value: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}