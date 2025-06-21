"use client"

// AI Assistant Bubble component removed - not needed for core functionality

interface AIMessage {
  id: string
  message: string
  timestamp: number
  type: "info" | "warning" | "success"
}

interface AIAssistantBubbleProps {
  messages: AIMessage[]
  onDismiss: (messageId: string) => void
}

export function AIAssistantBubble({ messages, onDismiss }: AIAssistantBubbleProps) {
  // Component disabled - return null to render nothing
  return null
}
