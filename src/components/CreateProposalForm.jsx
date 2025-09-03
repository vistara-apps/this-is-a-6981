import React, { useState } from 'react'
import { ArrowLeft, Calendar, FileText, AlertCircle } from 'lucide-react'
import { useProposals } from '../context/ProposalContext'
import { useWallet } from '../context/WalletContext'

const CreateProposalForm = ({ setCurrentView }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '7' // days
  })
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState({})
  
  const { createProposal } = useProposals()
  const { isConnected, publicKey } = useWallet()

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }
    
    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 day'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsCreating(true)
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const endTime = Date.now() + (parseInt(formData.duration) * 24 * 60 * 60 * 1000)
    
    await createProposal({
      title: formData.title,
      description: formData.description,
      endTime,
      proposer: publicKey
    })
    
    setIsCreating(false)
    setCurrentView('proposals')
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <FileText className="w-16 h-16 text-text-secondary mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-text-primary mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-text-secondary mb-8">
          You need to connect your wallet to create proposals
        </p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="btn-primary px-6 py-3 rounded-lg text-white font-medium"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView('proposals')}
          className="p-2 hover:bg-surface/50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Create Proposal</h1>
          <p className="text-text-secondary">Submit a new proposal for community voting</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Proposal Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter a clear, concise title for your proposal"
            className="w-full px-4 py-3 bg-surface/50 border border-surface/50 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            maxLength={100}
          />
          {errors.title && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.title}
            </p>
          )}
          <p className="text-xs text-text-secondary">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Provide a detailed description of your proposal, including background, objectives, and expected outcomes"
            rows={6}
            className="w-full px-4 py-3 bg-surface/50 border border-surface/50 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-y"
            maxLength={1000}
          />
          {errors.description && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.description}
            </p>
          )}
          <p className="text-xs text-text-secondary">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Voting Duration (days) *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <select
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface/50 border border-surface/50 rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
          {errors.duration && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.duration}
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-primary font-medium mb-1">On-Chain Deployment</p>
            <p className="text-text-secondary">
              Your proposal will be deployed to the Solana blockchain. This action requires a small transaction fee and cannot be undone.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => setCurrentView('proposals')}
            className="flex-1 btn-secondary px-6 py-3 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex-1 btn-primary px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating Proposal...' : 'Create Proposal'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProposalForm