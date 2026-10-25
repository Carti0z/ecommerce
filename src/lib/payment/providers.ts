// Payment Provider Abstraction Layer
// This provides a unified interface for different payment providers

export interface PaymentProvider {
  name: string
  initializePayment: (data: PaymentInitData) => Promise<PaymentInitResponse>
  verifyPayment: (reference: string) => Promise<PaymentVerification>
  processRefund: (data: RefundData) => Promise<RefundResponse>
}

export interface PaymentInitData {
  amount: number
  currency: string
  email: string
  orderId: string
  orderNumber: string
  metadata?: Record<string, any>
}

export interface PaymentInitResponse {
  success: boolean
  reference: string
  paymentUrl?: string
  providerReference?: string
  error?: string
}

export interface PaymentVerification {
  success: boolean
  status: string
  amount: number
  currency: string
  providerReference: string
  metadata?: Record<string, any>
}

export interface RefundData {
  paymentReference: string
  amount: number
  reason: string
}

export interface RefundResponse {
  success: boolean
  refundReference?: string
  error?: string
}

// Mock Card Payment Provider (for development)
export class MockCardProvider implements PaymentProvider {
  name = "mock-card"

  async initializePayment(data: PaymentInitData): Promise<PaymentInitResponse> {
    // In production, this would call Paystack/Flutterwave API
    const reference = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      success: true,
      reference,
      paymentUrl: `/checkout/payment/mock?reference=${reference}`,
      providerReference: reference,
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    // In production, this would verify with the payment provider
    return {
      success: true,
      status: "success",
      amount: 0, // Would be fetched from provider
      currency: "USD",
      providerReference: reference,
    }
  }

  async processRefund(data: RefundData): Promise<RefundResponse> {
    // In production, this would call the provider's refund API
    const refundReference = `REFUND-${Date.now()}`
    
    return {
      success: true,
      refundReference,
    }
  }
}

// Crypto Payment Provider (Mock for development)
export class MockCryptoProvider implements PaymentProvider {
  name = "mock-crypto"

  async initializePayment(data: PaymentInitData): Promise<PaymentInitResponse> {
    const reference = `CRYPTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      success: true,
      reference,
      paymentUrl: `/checkout/payment/crypto?reference=${reference}`,
      providerReference: reference,
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    return {
      success: true,
      status: "confirmed",
      amount: 0,
      currency: "USD",
      providerReference: reference,
    }
  }

  async processRefund(data: RefundData): Promise<RefundResponse> {
    // Crypto refunds require manual review in most cases
    return {
      success: false,
      error: "Crypto refunds require manual review",
    }
  }
}

// Provider Factory
export function getPaymentProvider(type: string): PaymentProvider {
  switch (type) {
    case "card":
      return new MockCardProvider()
    case "crypto":
      return new MockCryptoProvider()
    default:
      throw new Error(`Unknown payment provider: ${type}`)
  }
}
