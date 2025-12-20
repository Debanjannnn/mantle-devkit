"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { getProjects, createProject, Project } from "@/lib/api-client"

interface DashboardContextType {
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeTab: "overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings"
  setActiveTab: (tab: "overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings") => void
  
  // Project State
  projects: Project[]
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void
  isLoading: boolean
  
  // Project Actions
  loadProjects: () => Promise<void>
  handleCreateProject: (name: string, payoutWallet: string) => Promise<Project | null>
  
  // Admin State
  isAdmin: boolean
  adminAddress: string
  pendingFees: string
  totalCollected: string
  isCollecting: boolean
  collectError: string
  collectSuccess: boolean
  
  // Admin Actions
  loadTreasuryData: () => Promise<void>
  handleCollectFees: () => Promise<void>
  handleUpdateAdmin: (address: string) => Promise<void>
  
  // Utils
  validateWalletAddress: (address: string) => boolean
  userWalletAddress?: string
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

const TREASURY_ADDRESS = "0xB27705342ACE73736AE490540Ea031cc06C3eF49"
const TREASURY_ADMIN = "0xDacCF30F8BB2aEb8D76E68E03033629809ed08E1"
const MANTLE_SEPOLIA_RPC = "https://rpc.sepolia.mantle.xyz"

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize activeTab from URL or default to "overview"
  const getInitialTab = (): "overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings" => {
    const tabFromUrl = searchParams.get("tab")
    const validTabs: Array<"overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings"> = 
      ["overview", "admin", "docs", "analytics", "endpoints", "components", "settings"]
    if (tabFromUrl && validTabs.includes(tabFromUrl as any)) {
      return tabFromUrl as any
    }
    return "overview"
  }
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings">(getInitialTab())
  
  // Update URL when tab changes
  const handleSetActiveTab = (tab: "overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings") => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/dashboard?${params.toString()}`, { scroll: false })
  }
  
  // Sync with URL on mount and when URL changes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    const validTabs: Array<"overview" | "admin" | "docs" | "analytics" | "endpoints" | "components" | "settings"> = 
      ["overview", "admin", "docs", "analytics", "endpoints", "components", "settings"]
    if (tabFromUrl && validTabs.includes(tabFromUrl as any)) {
      setActiveTab(tabFromUrl as any)
    }
  }, [searchParams])
  
  // Project State
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminAddress, setAdminAddress] = useState<string>(TREASURY_ADMIN)
  const [pendingFees, setPendingFees] = useState<string>("0")
  const [totalCollected, setTotalCollected] = useState<string>("0")
  const [isCollecting, setIsCollecting] = useState(false)
  const [collectError, setCollectError] = useState("")
  const [collectSuccess, setCollectSuccess] = useState(false)
  
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  
  const validateWalletAddress = (address: string): boolean => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(address)
  }
  
  // Check if connected wallet is admin
  useEffect(() => {
    if (user?.wallet?.address) {
      const walletAddress = user.wallet.address.toLowerCase()
      const normalizedAdminAddress = adminAddress.toLowerCase()
      setIsAdmin(walletAddress === normalizedAdminAddress)
    } else {
      setIsAdmin(false)
    }
  }, [user?.wallet?.address, adminAddress])
  
  // Load treasury data if admin
  useEffect(() => {
    if (isAdmin) {
      loadTreasuryData()
    }
  }, [isAdmin])
  
  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/")
    }
  }, [ready, authenticated, router])
  
  // Load existing projects on mount and when user changes
  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      loadProjects()
    }
  }, [ready, authenticated, user?.wallet?.address])
  
  const loadTreasuryData = async () => {
    try {
      const balanceResponse = await fetch(MANTLE_SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: TREASURY_ADDRESS, data: "0xb69ef8a8" }, "latest"],
          id: 1,
        }),
      })
      const balanceData = await balanceResponse.json()
      if (balanceData.result) {
        const balanceWei = BigInt(balanceData.result)
        const balanceMnt = Number(balanceWei) / 1e18
        setPendingFees(balanceMnt.toFixed(6))
      }
      
      const totalResponse = await fetch(MANTLE_SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_call",
          params: [{ to: TREASURY_ADDRESS, data: "0xe29eb836" }, "latest"],
          id: 2,
        }),
      })
      const totalData = await totalResponse.json()
      if (totalData.result) {
        const totalWei = BigInt(totalData.result)
        const totalMnt = Number(totalWei) / 1e18
        setTotalCollected(totalMnt.toFixed(6))
      }
    } catch (error) {
      console.error("Error loading treasury data:", error)
    }
  }
  
  const handleCollectFees = async () => {
    try {
      setIsCollecting(true)
      setCollectError("")
      setCollectSuccess(false)
      
      if (!isAdmin) {
        setCollectError(`Only the admin (${TREASURY_ADMIN}) can collect fees. Your wallet: ${user?.wallet?.address}`)
        return
      }
      
      if (parseFloat(pendingFees) === 0) {
        setCollectError("Nothing to collect. Treasury balance is 0.")
        return
      }
      
      const wallet = wallets.find((w) => w.address.toLowerCase() === user?.wallet?.address?.toLowerCase())
      
      if (!wallet) {
        setCollectError("No wallet connected. Please connect your wallet.")
        return
      }
      
      const provider = await wallet.getEthereumProvider()
      
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x138B" }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x138B",
              chainName: "Mantle Sepolia Testnet",
              nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
              blockExplorerUrls: ["https://explorer.sepolia.mantle.xyz"],
            }],
          })
        }
      }
      
      const collectFeesFunctionSelector = "0xe5225381"
      
      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [{
          from: wallet.address,
          to: TREASURY_ADDRESS,
          data: collectFeesFunctionSelector,
        }],
      })
      
      console.log("Fee collection transaction sent:", txHash)
      setCollectSuccess(true)
      
      setTimeout(() => {
        loadTreasuryData()
      }, 5000)
    } catch (error: any) {
      console.error("Error collecting fees:", error)
      const errorMsg = error.message || "Failed to collect fees"
      if (errorMsg.includes("NotAdmin")) {
        setCollectError("Transaction failed: Only the admin can collect fees.")
      } else if (errorMsg.includes("NothingToCollect")) {
        setCollectError("Transaction failed: No fees to collect.")
      } else if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
        setCollectError("Transaction cancelled by user.")
      } else {
        setCollectError(errorMsg)
      }
    } finally {
      setIsCollecting(false)
    }
  }
  
  const handleUpdateAdmin = async (newAdminAddress: string) => {
    setAdminAddress(newAdminAddress.toLowerCase())
    console.log('Admin address updated to:', newAdminAddress)
  }
  
  const loadProjects = async () => {
    try {
      setIsLoading(true)
      const walletAddress = user?.wallet?.address ? user.wallet.address.toLowerCase() : undefined
      console.log('Loading projects for wallet:', walletAddress)
      const fetchedProjects = await getProjects(walletAddress)
      console.log('Fetched projects:', fetchedProjects)
      
      setProjects(fetchedProjects)
      
      if (fetchedProjects.length > 0) {
        const projectToSelect = selectedProject 
          ? fetchedProjects.find(p => p.appId === selectedProject.appId) || fetchedProjects[0]
          : fetchedProjects[0]
        
        setSelectedProject(projectToSelect)
      } else {
        setSelectedProject(null)
      }
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCreateProject = async (name: string, payoutWallet: string): Promise<Project | null> => {
    if (!name.trim() || !payoutWallet.trim()) return null
    
    const trimmedWallet = payoutWallet.trim()
    if (!validateWalletAddress(trimmedWallet)) {
      throw new Error("Invalid wallet address")
    }
    
    if (!user?.wallet?.address) {
      throw new Error("Wallet not connected")
    }
    
    const project = await createProject({
      name: name.trim(),
      payTo: trimmedWallet,
      createdBy: user.wallet.address,
      network: 'mantle',
    })
    
    // Reload projects and select the newly created one
    const walletAddress = user.wallet.address.toLowerCase()
    const fetchedProjects = await getProjects(walletAddress)
    setProjects(fetchedProjects)
    
    // Select the newly created project
    const newProject = fetchedProjects.find(p => 
      (p.projectId === project.projectId || p.appId === project.appId) ||
      (p.name === project.name && p.payTo === project.payTo)
    ) || fetchedProjects[0]
    
    if (newProject) {
      setSelectedProject(newProject)
    }
    
    return project
  }
  
  const value: DashboardContextType = {
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab: handleSetActiveTab,
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    loadProjects,
    handleCreateProject,
    isAdmin,
    adminAddress,
    pendingFees,
    totalCollected,
    isCollecting,
    collectError,
    collectSuccess,
    loadTreasuryData,
    handleCollectFees,
    handleUpdateAdmin,
    validateWalletAddress,
    userWalletAddress: user?.wallet?.address,
  }
  
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}

