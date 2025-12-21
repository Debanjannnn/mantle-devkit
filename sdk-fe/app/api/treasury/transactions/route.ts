import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TREASURY_ADDRESS = "0xB27705342ACE73736AE490540Ea031cc06C3eF49"
const MANTLE_SEPOLIA_API = "https://api-sepolia.mantlescan.xyz/api"
const PLATFORM_FEE_RATE = 0.005 // 0.5%

// Mantlescan API response format (Etherscan-compatible)
interface MantlescanTransaction {
  hash: string
  from: string
  to: string
  value: string
  blockNumber: string
  timeStamp: string
  isError?: string
  type?: string
}

interface Transaction {
  transactionHash: string
  from: string
  amount: string
  blockNumber: number
  timestamp: number
  type: string
}

export async function GET(request: NextRequest) {
  try {
    const allTransactions: Transaction[] = []

    // 1. Fetch normal transactions
    const normalTxResponse = await fetch(
      `${MANTLE_SEPOLIA_API}?module=account&action=txlist&address=${TREASURY_ADDRESS}&startblock=0&endblock=99999999&sort=desc`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }
    )

    if (normalTxResponse.ok) {
      const normalData = await normalTxResponse.json()
      console.log('Normal TX API response:', JSON.stringify(normalData).slice(0, 500))

      if (normalData.status === "1" && Array.isArray(normalData.result)) {
        const normalTxs = normalData.result
          .filter((tx: MantlescanTransaction) =>
            tx.value &&
            tx.value !== "0" &&
            tx.to?.toLowerCase() === TREASURY_ADDRESS.toLowerCase() &&
            tx.isError !== "1"
          )
          .map((tx: MantlescanTransaction) => ({
            transactionHash: tx.hash,
            from: tx.from || "Unknown",
            amount: (Number(BigInt(tx.value)) / 1e18).toFixed(6),
            blockNumber: parseInt(tx.blockNumber, 10) || 0,
            timestamp: parseInt(tx.timeStamp, 10) * 1000,
            type: 'normal',
          }))
        allTransactions.push(...normalTxs)
      }
    }

    // 2. Fetch internal transactions (fees sent from contracts)
    const internalTxResponse = await fetch(
      `${MANTLE_SEPOLIA_API}?module=account&action=txlistinternal&address=${TREASURY_ADDRESS}&startblock=0&endblock=99999999&sort=desc`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }
    )

    if (internalTxResponse.ok) {
      const internalData = await internalTxResponse.json()
      console.log('Internal TX API response:', JSON.stringify(internalData).slice(0, 500))

      if (internalData.status === "1" && Array.isArray(internalData.result)) {
        const internalTxs = internalData.result
          .filter((tx: MantlescanTransaction) =>
            tx.value &&
            tx.value !== "0" &&
            tx.to?.toLowerCase() === TREASURY_ADDRESS.toLowerCase()
          )
          .map((tx: MantlescanTransaction) => ({
            transactionHash: tx.hash,
            from: tx.from || "Unknown",
            amount: (Number(BigInt(tx.value)) / 1e18).toFixed(6),
            blockNumber: parseInt(tx.blockNumber, 10) || 0,
            timestamp: parseInt(tx.timeStamp, 10) * 1000,
            type: 'internal',
          }))
        allTransactions.push(...internalTxs)
      }
    }

    // 3. Fallback: Fetch from database payments and calculate treasury fees
    try {
      const dbPayments = await prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 100,
      })

      console.log('Database payments found:', dbPayments.length)

      // Calculate treasury fee for each payment (0.5% of payment amount)
      const dbTxs = dbPayments.map(payment => ({
        transactionHash: payment.transactionHash,
        from: payment.fromAddress || payment.toAddress || "Unknown",
        amount: (Number(payment.amount) * PLATFORM_FEE_RATE).toFixed(6),
        blockNumber: payment.blockNumber || 0,
        timestamp: payment.createdAt.getTime(),
        type: 'database',
      }))

      allTransactions.push(...dbTxs)
    } catch (dbError) {
      console.error('Error fetching from database:', dbError)
    }

    // Remove duplicates by transaction hash and sort by timestamp
    const uniqueTxMap = new Map<string, Transaction>()
    allTransactions.forEach(tx => {
      const existing = uniqueTxMap.get(tx.transactionHash)
      // Prefer blockchain data over database
      if (!existing || (tx.type !== 'database' && existing.type === 'database')) {
        uniqueTxMap.set(tx.transactionHash, tx)
      }
    })

    const transactions = Array.from(uniqueTxMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100)

    // Calculate total volume
    const totalVolume = transactions
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
      .toFixed(6)

    // Group by day for chart data
    const dailyData: { [key: string]: { amount: number; count: number } } = {}

    transactions.forEach(tx => {
      const date = new Date(tx.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      if (!dailyData[date]) {
        dailyData[date] = { amount: 0, count: 0 }
      }
      dailyData[date].amount += Number(tx.amount)
      dailyData[date].count += 1
    })

    const chartData = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        amount: Number(data.amount.toFixed(6)),
        count: data.count,
      }))
      .reverse()

    return NextResponse.json({
      transactions,
      totalVolume,
      txCount: transactions.length,
      chartData,
    })

  } catch (error) {
    console.error('Error fetching treasury transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
