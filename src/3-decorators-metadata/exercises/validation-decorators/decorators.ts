import "reflect-metadata";

// Metadata key for validation rules
const VALIDATION_RULES_KEY = "validation:rules";

// Helper function to add validation rules to metadata
function addValidationRule(target: any, propertyKey: string, rule: any) {
  const existingRules = Reflect.getMetadata(VALIDATION_RULES_KEY, target, propertyKey) || [];
  existingRules.push(rule);
  Reflect.defineMetadata(VALIDATION_RULES_KEY, existingRules, target, propertyKey);
}

/**
 * Validation decorators
 */

export function Required(message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: "required",
      message: message || `${propertyKey} is required`,
    });
  };
}

export function MinLength(length: number, message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: "minLength",
      value: length,
      message:
        message || `${propertyKey} must be at least ${length} characters`,
    });
  };
}

export function MaxLength(length: number, message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: "maxLength",
      value: length,
      message:
        message || `${propertyKey} must be no more than ${length} characters`,
    });
  };
}

export function Email(message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: "email",
      message: message || `${propertyKey} must be a valid email address`,
    });
  };
}

export function Range(min: number, max: number, message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: "range",
      value: { min, max },
      message: message || `${propertyKey} must be between ${min} and ${max}`,
    });
  };
}

export function Pattern(regex: RegExp, message?: string) {
  return function (target: any, propertyKey: string) {
    addValidationRule(target, propertyKey, {
      type: "pattern",
      value: regex,
      message: message || `${propertyKey} format is invalid`,
    });
  };
}