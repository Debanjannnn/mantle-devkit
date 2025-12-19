/**
 * Vanilla JS Payment Modal
 *
 * Creates a payment modal using vanilla JS/DOM
 */

import type { PaymentRequest, PaymentResponse } from './types'
import { connectWallet, detectWalletProvider } from './wallet'
import { processPayment } from './payment'

/** Modal styles */
const STYLES = {
  overlay: `
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  `,
  modal: `
    width: 100%;
    max-width: 28rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(24, 24, 27, 0.95);
    padding: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(16px);
    color: #fafafa;
  `,
  header: `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  `,
  logo: `
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: bold;
    color: #fafafa;
  `,
  title: `
    font-size: 1.25rem;
    font-weight: 300;
    margin: 0;
    margin-left: 0.5rem;
    color: #fafafa;
  `,
  closeBtn: `
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: rgba(250, 250, 250, 0.6);
    line-height: 1;
  `,
  details: `
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
  `,
  row: `
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  `,
  rowLast: `
    display: flex;
    justify-content: space-between;
  `,
  label: `
    font-family: monospace;
    font-size: 0.75rem;
    color: rgba(250, 250, 250, 0.6);
  `,
  value: `
    font-size: 0.875rem;
    color: #fafafa;
  `,
  valueAmount: `
    font-size: 1.125rem;
    font-weight: 500;
    color: #fafafa;
  `,
  valueMono: `
    font-family: monospace;
    font-size: 0.875rem;
    color: #fafafa;
  `,
  button: `
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    color: #fafafa;
  `,
  buttonPrimary: `
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.1);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    color: #fafafa;
  `,
  buttonSecondary: `
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
    font-size: 0.875rem;
    cursor: pointer;
    color: rgba(250, 250, 250, 0.8);
  `,
  walletBox: `
    margin-bottom: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
  `,
  walletLabel: `
    margin: 0 0 0.25rem 0;
    font-family: monospace;
    font-size: 0.75rem;
    color: rgba(250, 250, 250, 0.6);
  `,
  walletAddress: `
    margin: 0;
    font-family: monospace;
    font-size: 0.875rem;
    color: #fafafa;
  `,
  buttonGroup: `
    display: flex;
    gap: 0.75rem;
  `,
} as const

/**
 * Format address for display
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Create vanilla JS payment modal
 */
export async function createVanillaPaymentModal(
  request: PaymentRequest
): Promise<PaymentResponse | null> {
  return new Promise((resolve) => {
    // Create overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = STYLES.overlay

    // Create modal
    const modal = document.createElement('div')
    modal.style.cssText = STYLES.modal

    let isProcessing = false

    // Cleanup function
    const cleanup = () => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay)
      }
    }

    // Header
    const header = document.createElement('div')
    header.style.cssText = STYLES.header

    const headerLeft = document.createElement('div')
    headerLeft.style.cssText = 'display: flex; align-items: center;'

    const logo = document.createElement('div')
    logo.style.cssText = STYLES.logo
    logo.textContent = 'x402'

    const title = document.createElement('h2')
    title.style.cssText = STYLES.title
    title.textContent = 'Payment Required'

    headerLeft.appendChild(logo)
    headerLeft.appendChild(title)

    const closeBtn = document.createElement('button')
    closeBtn.innerHTML = '&times;'
    closeBtn.style.cssText = STYLES.closeBtn
    closeBtn.onclick = () => {
      cleanup()
      resolve(null)
    }

    header.appendChild(headerLeft)
    header.appendChild(closeBtn)

    // Payment details
    const details = document.createElement('div')
    details.style.cssText = STYLES.details

    const amountRow = document.createElement('div')
    amountRow.style.cssText = STYLES.row
    amountRow.innerHTML = `
      <span style="${STYLES.label}">Amount</span>
      <span style="${STYLES.valueAmount}">${request.amount} ${request.token}</span>
    `

    const networkRow = document.createElement('div')
    networkRow.style.cssText = STYLES.row
    networkRow.innerHTML = `
      <span style="${STYLES.label}">Network</span>
      <span style="${STYLES.value}">${request.network}</span>
    `

    const recipientRow = document.createElement('div')
    recipientRow.style.cssText = STYLES.rowLast
    recipientRow.innerHTML = `
      <span style="${STYLES.label}">Recipient</span>
      <span style="${STYLES.valueMono}">${formatAddress(request.recipient)}</span>
    `

    details.appendChild(amountRow)
    details.appendChild(networkRow)
    details.appendChild(recipientRow)

    // Content area
    const content = document.createElement('div')

    // Connect button
    const connectBtn = document.createElement('button')
    connectBtn.textContent = 'Connect Wallet'
    connectBtn.style.cssText = STYLES.button

    connectBtn.onmouseover = () => {
      connectBtn.style.background = 'rgba(255, 255, 255, 0.1)'
    }
    connectBtn.onmouseout = () => {
      connectBtn.style.background = 'rgba(255, 255, 255, 0.05)'
    }

    connectBtn.onclick = async () => {
      try {
        connectBtn.setAttribute('disabled', 'true')
        connectBtn.textContent = 'Connecting...'
        connectBtn.style.opacity = '0.7'
        connectBtn.style.cursor = 'not-allowed'

        const wallet = detectWalletProvider()
        if (!wallet) {
          alert('No wallet found. Please install MetaMask.')
          connectBtn.removeAttribute('disabled')
          connectBtn.textContent = 'Connect Wallet'
          connectBtn.style.opacity = '1'
          connectBtn.style.cursor = 'pointer'
          return
        }

        const address = await connectWallet(wallet)

        // Show confirmation UI
        content.innerHTML = ''

        const walletBox = document.createElement('div')
        walletBox.style.cssText = STYLES.walletBox
        walletBox.innerHTML = `
          <p style="${STYLES.walletLabel}">Connected Wallet</p>
          <p style="${STYLES.walletAddress}">${formatAddress(address)}</p>
        `

        const buttonGroup = document.createElement('div')
        buttonGroup.style.cssText = STYLES.buttonGroup

        const cancelBtn = document.createElement('button')
        cancelBtn.textContent = 'Cancel'
        cancelBtn.style.cssText = STYLES.buttonSecondary
        cancelBtn.onclick = () => {
          cleanup()
          resolve(null)
        }

        const payBtn = document.createElement('button')
        payBtn.textContent = `Pay ${request.amount} ${request.token}`
        payBtn.style.cssText = STYLES.buttonPrimary

        payBtn.onclick = async () => {
          if (isProcessing) return
          isProcessing = true

          payBtn.setAttribute('disabled', 'true')
          payBtn.textContent = 'Processing...'
          payBtn.style.opacity = '0.7'
          payBtn.style.cursor = 'not-allowed'

          try {
            const w = detectWalletProvider()
            if (!w) throw new Error('Wallet not connected')

            const payment = await processPayment(request, w)
            cleanup()
            resolve(payment)
          } catch (error) {
            alert(`Payment failed: ${error instanceof Error ? error.message : String(error)}`)
            isProcessing = false
            payBtn.removeAttribute('disabled')
            payBtn.textContent = `Pay ${request.amount} ${request.token}`
            payBtn.style.opacity = '1'
            payBtn.style.cursor = 'pointer'
          }
        }

        buttonGroup.appendChild(cancelBtn)
        buttonGroup.appendChild(payBtn)

        content.appendChild(walletBox)
        content.appendChild(buttonGroup)
      } catch (error) {
        alert(`Connection failed: ${error instanceof Error ? error.message : String(error)}`)
        connectBtn.removeAttribute('disabled')
        connectBtn.textContent = 'Connect Wallet'
        connectBtn.style.opacity = '1'
        connectBtn.style.cursor = 'pointer'
      }
    }

    content.appendChild(connectBtn)

    // Assemble modal
    modal.appendChild(header)
    modal.appendChild(details)
    modal.appendChild(content)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)

    // Close on overlay click
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        cleanup()
        resolve(null)
      }
    }

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup()
        resolve(null)
        document.removeEventListener('keydown', handleEscape)
      }
    }
    document.addEventListener('keydown', handleEscape)
  })
}
