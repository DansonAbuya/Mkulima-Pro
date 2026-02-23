'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { addCarbonEntry } from '@/lib/actions'

const ACTIVITY_TYPES = [
  'conservation_agriculture',
  'composting',
  'mulching',
  'crop_rotation',
  'agroforestry',
  'reduced_tillage',
]

export function AnalyticsClient() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const activity_type = formData.get('activity_type') as string
    const co2_tons = Number(formData.get('co2_tons'))
    const credits_earned = formData.get('credits_earned') ? Number(formData.get('credits_earned')) : co2_tons
    try {
      await addCarbonEntry({ activity_type, co2_tons, credits_earned })
      router.refresh()
      setOpen(false)
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add entry')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Log sustainable activity</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log carbon / sustainability activity</DialogTitle>
          <DialogDescription>
            Record a sustainable farming practice to track your carbon impact and credits.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="activity_type">Activity type *</Label>
            <select
              id="activity_type"
              name="activity_type"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="co2_tons">CO₂ sequestered (tons) *</Label>
            <Input id="co2_tons" name="co2_tons" type="number" step="0.1" min={0} required />
          </div>
          <div>
            <Label htmlFor="credits_earned">Credits earned (optional, default = CO₂ tons)</Label>
            <Input id="credits_earned" name="credits_earned" type="number" step="0.1" min={0} placeholder="Same as CO₂ if left blank" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
