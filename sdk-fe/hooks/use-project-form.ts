import { useState, useEffect } from "react"
import { useDashboard } from "@/contexts/dashboard-context"
import { Project } from "@/lib/api-client"

/**
 * Custom hook for managing project form state
 * This handles local UI state that doesn't need to be in context
 */
export function useProjectForm() {
  const { selectedProject, userWalletAddress, validateWalletAddress } = useDashboard()
  
  // Form state for creating/editing projects
  const [projectName, setProjectName] = useState("")
  const [payoutWallet, setPayoutWallet] = useState("")
  const [createWalletError, setCreateWalletError] = useState("")
  
  // Project display state
  const [showProjectId, setShowProjectId] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Payout wallet editing state
  const [isEditingPayoutWallet, setIsEditingPayoutWallet] = useState(false)
  const [editedPayoutWallet, setEditedPayoutWallet] = useState("")
  const [walletError, setWalletError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Set default payout wallet to user's connected wallet
  useEffect(() => {
    if (userWalletAddress && !payoutWallet) {
      setPayoutWallet(userWalletAddress)
    }
  }, [userWalletAddress, payoutWallet])
  
  // Sync edited wallet with selected project
  useEffect(() => {
    if (selectedProject?.payTo) {
      setEditedPayoutWallet(selectedProject.payTo)
    }
  }, [selectedProject?.payTo])
  
  // Computed values from selected project
  const createdProjectId = selectedProject?.projectId ?? selectedProject?.appId ?? null
  const appId = selectedProject?.appId ?? null
  const currentProjectName = selectedProject?.name ?? null
  const currentPayoutWallet = selectedProject?.payTo ?? null
  
  const resetForm = () => {
    setProjectName("")
    setPayoutWallet(userWalletAddress || "")
    setCopied(false)
    setCreateWalletError("")
    setShowProjectId(false)
    setIsEditingPayoutWallet(false)
    setEditedPayoutWallet("")
    setWalletError("")
  }
  
  const handleCopyProjectId = (): void => {
    const textToCopy = createdProjectId || appId || ''
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return {
    // Form state
    projectName,
    setProjectName,
    payoutWallet,
    setPayoutWallet,
    createWalletError,
    setCreateWalletError,
    
    // Display state
    showProjectId,
    setShowProjectId,
    copied,
    handleCopyProjectId,
    
    // Editing state
    isEditingPayoutWallet,
    setIsEditingPayoutWallet,
    editedPayoutWallet,
    setEditedPayoutWallet,
    walletError,
    setWalletError,
    isSaving,
    setIsSaving,
    
    // Computed values
    createdProjectId,
    appId,
    currentProjectName,
    currentPayoutWallet,
    
    // Utils
    resetForm,
    validateWalletAddress,
  }
}

