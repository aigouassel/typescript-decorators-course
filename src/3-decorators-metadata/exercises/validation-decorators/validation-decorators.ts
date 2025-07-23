import "reflect-metadata";
import { ValidationRule, ValidationError, ValidationResult } from "./types";

// Metadata key for validation rules
const VALIDATION_RULES_KEY = "validation:rules";

/**
 * Validator class - the business logic that uses the metadata
 */
export class Validator {
  static validate(instance: any): ValidationResult {
    const errors: ValidationError[] = [];
    const target = instance.constructor.prototype;

    // Get all property names from the prototype
    const propertyNames = Object.getOwnPropertyNames(target);

    for (const propertyName of propertyNames) {
      if (propertyName === "constructor") continue;

      // Get validation rules for this property from metadata
      const rules: ValidationRule[] =
        Reflect.getMetadata(VALIDATION_RULES_KEY, target, propertyName) || [];
      const value = instance[propertyName];

      // Apply each validation rule
      for (const rule of rules) {
        if (!this.validateRule(value, rule)) {
          errors.push({
            property: propertyName,
            message: rule.message,
            value,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private static validateRule(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case "required":
        return value !== undefined && value !== null && value !== "";

      case "minLength":
        return typeof value === "string" && value.length >= rule.value;

      case "maxLength":
        return typeof value === "string" && value.length <= rule.value;

      case "email":
        if (typeof value !== "string") return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);

      case "range":
        return (
          typeof value === "number" &&
          value >= rule.value.min &&
          value <= rule.value.max
        );

      case "pattern":
        return typeof value === "string" && rule.value.test(value);

      default:
        return true;
    }
  }

  // Validate a specific property
  static validateProperty(
    instance: any,
    propertyName: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const target = instance.constructor.prototype;
    const rules: ValidationRule[] =
      Reflect.getMetadata(VALIDATION_RULES_KEY, target, propertyName) || [];
    const value = instance[propertyName];

    for (const rule of rules) {
      if (!this.validateRule(value, rule)) {
        errors.push({
          property: propertyName,
          message: rule.message,
          value,
        });
      }
    }

    return errors;
  }

  // Get all validation rules for a class
  static getValidationRules(
    targetClass: any
  ): Record<string, ValidationRule[]> {
    const rules: Record<string, ValidationRule[]> = {};
    const propertyNames = Object.getOwnPropertyNames(targetClass.prototype);

    for (const propertyName of propertyNames) {
      if (propertyName === "constructor") continue;

      const propertyRules = Reflect.getMetadata(
        VALIDATION_RULES_KEY,
        targetClass.prototype,
        propertyName
      );
      if (propertyRules && propertyRules.length > 0) {
        rules[propertyName] = propertyRules;
      }
    }

    return rules;
  }
}