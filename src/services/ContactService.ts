/**
 * Contact Service
 *
 * Handles contact form submissions with spam detection,
 * honeypot validation, rate limit checks, and email sending logic.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ValidationError } from '@/errors'
import { validateEmail, validateText, logValidationFailure } from '@/middleware/validation'
import { logger, createLoggerFromRequest } from '@/lib/logger'
import { getClientIp, getUserAgent } from '@/lib/api/request'

export interface ContactSubmissionData {
  name: string
  email: string
  subject: string
  message: string
  honeypot?: string
}

export interface ContactSubmissionResult {
  success: boolean
  message: string
  id?: string
}

export interface SpamCheckResult {
  isSpam: boolean
  reason?: string
  score: number
}

/**
 * Spam detection configuration
 */
const SPAM_CONFIG = {
  // Keywords that indicate spam
  spamKeywords: [
    'viagra', 'cialis', 'casino', 'poker', 'lottery', 'bitcoin',
    'crypto', 'forex', 'trading', 'investment', 'loan', 'debt',
    'seo', 'backlink', 'guest post', 'essay writing', 'cheap',
  ],
  // Suspicious TLDs
  suspiciousTLDs: ['.xyz', '.top', '.zip', '.mov', '.tk', '.ml', '.ga'],
  // Maximum number of links allowed in message
  maxLinks: 2,
  // Minimum time to complete form (seconds) - bot detection
  minFormTime: 3,
}

/**
 * Contact Service
 */
export class ContactService {
  /**
   * Spam detection
   */
  private async detectSpam(
    data: ContactSubmissionData,
    ip?: string,
    userAgent?: string
  ): Promise<SpamCheckResult> {
    let spamScore = 0
    const reasons: string[] = []

    // Check honeypot field (should be empty)
    if (data.honeypot && data.honeypot.length > 0) {
      return { isSpam: true, reason: 'honeypot_filled', score: 100 }
    }

    // Check for spam keywords in message
    const lowerMessage = data.message.toLowerCase()
    const keywordMatches = SPAM_CONFIG.spamKeywords.filter(keyword =>
      lowerMessage.includes(keyword)
    )
    if (keywordMatches.length > 0) {
      spamScore += 20 * keywordMatches.length
      reasons.push(`spam_keywords: ${keywordMatches.join(', ')}`)
    }

    // Check for suspicious email domain
    const emailDomain = data.email.split('@')[1]?.toLowerCase()
    if (emailDomain) {
      if (SPAM_CONFIG.suspiciousTLDs.some(tld => emailDomain.endsWith(tld))) {
        spamScore += 30
        reasons.push('suspicious_tld')
      }
    }

    // Check for too many links in message
    const linkCount = (data.message.match(/https?:\/\//gi) ?? []).length
    if (linkCount > SPAM_CONFIG.maxLinks) {
      spamScore += 15 * linkCount
      reasons.push(`too_many_links: ${linkCount}`)
    }

    // Check for repetitive content
    const words = data.message.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
      spamScore += 25
      reasons.push('repetitive_content')
    }

    // Check for all caps subject
    if (data.subject === data.subject.toUpperCase() && data.subject.length > 5) {
      spamScore += 10
      reasons.push('all_caps_subject')
    }

    // Check for generic/spammy patterns in name
    if (/^seo|guest|author|writer$/i.test(data.name)) {
      spamScore += 15
      reasons.push('suspicious_name')
    }

    const isSpam = spamScore >= 50

    if (isSpam) {
      logger.warn('Spam detected', {
        score: spamScore,
        reasons,
        ip,
        email: data.email,
      })
    }

    return {
      isSpam,
      reason: reasons.join('; '),
      score: spamScore,
    }
  }

  /**
   * Validate contact submission
   */
  private async validateSubmission(data: ContactSubmissionData): Promise<ContactSubmissionData> {
    const errors: Record<string, string> = {}

    // Validate name
    const nameResult = validateText(data.name ?? '', {
      minLength: 2,
      maxLength: 100,
      allowNull: false,
    })
    if (!nameResult.valid) {
      errors.name = 'Name must be between 2 and 100 characters'
    }

    // Validate email
    const emailResult = validateEmail(data.email ?? '', {
      maxLength: 255,
      checkDisposable: false,
    })
    if (!emailResult.valid) {
      errors.email = emailResult.error ?? 'Invalid email address'
    }

    // Validate subject
    const subjectResult = validateText(data.subject ?? '', {
      minLength: 5,
      maxLength: 200,
      allowNull: false,
    })
    if (!subjectResult.valid) {
      errors.subject = 'Subject must be between 5 and 200 characters'
    }

    // Validate message
    const messageResult = validateText(data.message ?? '', {
      minLength: 20,
      maxLength: 5000,
      allowNull: false,
    })
    if (!messageResult.valid) {
      errors.message = 'Message must be between 20 and 5000 characters'
    }

    if (Object.keys(errors).length > 0) {
      throw ValidationError.fromRecord(errors, 'Validation failed')
    }

    return {
      name: nameResult.sanitized!,
      email: emailResult.sanitized!,
      subject: subjectResult.sanitized!,
      message: messageResult.sanitized!,
    }
  }

  /**
   * Store contact submission
   */
  private async storeSubmission(
    data: ContactSubmissionData,
    ip: string,
    userAgent: string
  ): Promise<string> {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.create({
      collection: 'contact-submissions',
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        ip,
        userAgent,
      },
    })

    return String(result.id)
  }

  /**
   * Send email notification (placeholder for actual email sending)
   */
  private async sendEmailNotification(
    data: ContactSubmissionData,
    ip: string
  ): Promise<void> {
    // TODO: Implement actual email sending
    // Options: Cloudflare Email Workers, SendGrid, AWS SES, etc.

    logger.info('Contact form email notification', {
      to: 'admin@example.com',
      subject: `Contact Form: ${data.subject}`,
      from: data.email,
      name: data.name,
      ip,
    })

    // Placeholder for email sending logic
    // In production, this would call an email service
  }

  /**
   * Process contact form submission
   */
  async processSubmission(
    data: ContactSubmissionData,
    request?: Request
  ): Promise<ContactSubmissionResult> {
    const ip = request ? getClientIp(request) : 'unknown'
    const userAgent = request ? getUserAgent(request) : 'unknown'
    const requestLogger = request ? createLoggerFromRequest(request) : logger

    requestLogger.info('Processing contact submission', {
      ip,
      email: data.email,
      subject: data.subject,
    })

    // Validate input
    const sanitized = await this.validateSubmission(data)

    // Check for spam
    const spamCheck = await this.detectSpam(sanitized, ip, userAgent)

    if (spamCheck.isSpam) {
      // Silently accept spam submissions to avoid tipping off spammers
      requestLogger.info('Spam submission silently rejected', {
        reason: spamCheck.reason,
        score: spamCheck.score,
        ip,
      })

      return {
        success: true,
        message: 'Your message has been sent successfully.',
      }
    }

    try {
      // Store in database
      const id = await this.storeSubmission(sanitized, ip, userAgent)

      // Send email notification
      await this.sendEmailNotification(sanitized, ip)

      requestLogger.info('Contact submission processed successfully', {
        id,
        ip,
      })

      return {
        success: true,
        message: 'Your message has been sent successfully.',
        id,
      }
    } catch (error) {
      requestLogger.error('Contact submission processing failed', error as Error, { ip })

      return {
        success: false,
        message: 'Unable to submit your message right now. Please try again later.',
      }
    }
  }
}

/**
 * Singleton instance
 */
export const contactService = new ContactService()

/**
 * Convenience function
 */
export async function processContactSubmission(
  data: ContactSubmissionData,
  request?: Request
): Promise<ContactSubmissionResult> {
  return contactService.processSubmission(data, request)
}
