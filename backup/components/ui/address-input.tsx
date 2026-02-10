import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddressInputProps {
    value: string
    onChange: (value: string) => void
}

export function AddressInput({ value, onChange }: AddressInputProps) {
    return (
        <div className="space-y-2">
            <Label>Address Details</Label>
            <Textarea
                placeholder="Enter full address including pincode..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
            />
        </div>
    )
}
