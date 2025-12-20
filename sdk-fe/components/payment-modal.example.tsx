/**
 * PaymentModal Usage Example
 * 
 * This file demonstrates how to use the PaymentModal component
 * in your application for handling x402 payments.
 */

"use client"

import { useState } from "react"
import { PaymentModal, PaymentRequest, PaymentResponse } from "./payment-modal"

export function PaymentModalExample() {
  const [isOpen, setIsOpen] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)

  // Example: Trigger payment when API returns 402
  const handleApiCall = async () => {
    try {
      const response = await fetch('/api/premium-endpoint')
      
      if (response.status === 402) {
        // Parse payment request from 402 response
        const paymentData = await response.json()
        
        setPaymentRequest({
          amount: paymentData.amount || "0.001",
          token: paymentData.token || "MNT",
          network: paymentData.network || "mantle",
          recipient: paymentData.recipient,
          endpoint: paymentData.endpoint,
          description: paymentData.description || "API access payment",
        })
        
        setIsOpen(true)
      } else {
        // Handle successful response
        const data = await response.json()
        console.log("API response:", data)
      }
    } catch (error) {
      console.error("API error:", error)
    }
  }

  const handlePaymentComplete = (payment: PaymentResponse) => {
    console.log("Payment completed:", payment)
    
    // Retry the original API call after payment
    handleApiCall()
    
    // Close modal after a short delay
    setTimeout(() => {
      setIsOpen(false)
      setPaymentRequest(null)
    }, 2000)
  }

  const handlePaymentCancel = () => {
    setIsOpen(false)
    setPaymentRequest(null)
  }

  return (
    <>
      <button
        onClick={handleApiCall}
        className="rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-foreground/15"
      >
        Call Premium API
      </button>

      <PaymentModal
        isOpen={isOpen}
        request={paymentRequest}
        onComplete={handlePaymentComplete}
        onCancel={handlePaymentCancel}
      />
    </>
  )
}

/**
 * Simple Usage Example
 */
export function SimplePaymentExample() {
  const [isOpen, setIsOpen] = useState(false)

  const paymentRequest: PaymentRequest = {
    amount: "0.001",
    token: "MNT",
    network: "mantle",
    recipient: "0xB27705342ACE73736AE490540Ea031cc06C3eF49",
    description: "Access to premium API endpoint",
    endpoint: "/api/premium-data",
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Payment Modal
      </button>

      <PaymentModal
        isOpen={isOpen}
        request={paymentRequest}
        onComplete={(payment) => {
          console.log("Payment successful:", payment.transactionHash)
          setIsOpen(false)
        }}
        onCancel={() => setIsOpen(false)}
      />
    </>
  )
}


