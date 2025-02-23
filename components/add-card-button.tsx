import { Plus } from "lucide-react"

interface AddCardButtonProps {
  onClick: () => void
}

export function AddCardButton({ onClick }: AddCardButtonProps) {
  return (
    <button className="add-card-button" onClick={onClick}>
      <Plus className="w-4 h-4" />
      <span>Add Card</span>
    </button>
  )
}

