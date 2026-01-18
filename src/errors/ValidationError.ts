/**
 * Validation Error
 *
 * Input validation error with field-level details for precise feedback.
 */

import { AppError, type ErrorResponse } from './AppError'

export interface FieldError {
  field: string
  message: string
  code?: string
}

export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_ERROR'
    message: string
    fields: Record<string, { message: string; code?: string }>
    requestId?: string
  }
}

export class ValidationError extends AppError {
  public readonly fields: Record<string, { message: string; code?: string }>

  constructor(
    message: string = 'Validation failed',
    fieldErrors: FieldError[] = [],
    requestId?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400, undefined, requestId)

    // Convert field errors array to record for easier access
    this.fields = {}
    for (const error of fieldErrors) {
      this.fields[error.field] = {
        message: error.message,
        ...(error.code && { code: error.code }),
      }
    }
  }

  /**
   * Add a field error
   */
  addField(field: string, message: string, code?: string): void {
    this.fields[field] = {
      message,
      ...(code && { code }),
    }
  }

  /**
   * Check if a specific field has an error
   */
  hasFieldError(field: string): boolean {
    return field in this.fields
  }

  /**
   * Get error for a specific field
   */
  getFieldError(field: string): { message: string; code?: string } | undefined {
    return this.fields[field]
  }

  /**
   * Convert to validation-specific response format
   */
  override toJSON(): ValidationErrorResponse {
    return {
      error: {
        code: 'VALIDATION_ERROR',
        message: this.message,
        fields: this.fields,
        ...(this.requestId !== undefined && { requestId: this.requestId }),
      },
    }
  }

  /**
   * Create a ValidationError from a simple record
   */
  static fromRecord(
    errors: Record<string, string>,
    message: string = 'Validation failed',
    requestId?: string
  ): ValidationError {
    const fieldErrors = Object.entries(errors).map(([field, message]) => ({ field, message }))
    return new ValidationError(message, fieldErrors, requestId)
  }

  /**
   * Create a single-field validation error
   */
  static singleField(
    field: string,
    message: string,
    code?: string,
    requestId?: string
  ): ValidationError {
    return new ValidationError('Validation failed', [{ field, message, code }], requestId)
  }
}
