'use client'

import { useState } from 'react'
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
import { applyForLoan } from '@/lib/actions'

export function FinanceClient({
  loanProductId,
  loanName,
  maxAmount,
  minAmount,
}: {
  loanProductId: string
  loanName: string
  maxAmount: number
  minAmount: number
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState('')

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const num = Number(amount)
    if (num < minAmount || num > maxAmount) {
      setError(`Amount must be between KES ${minAmount.toLocaleString()} and ${maxAmount.toLocaleString()}`)
      return
    }
    setPending(true)
    try {
      await applyForLoan(loanProductId, num)
      setOpen(false)
      setAmount('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Application failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">Apply Now</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for {loanName}</DialogTitle>
          <DialogDescription>Enter the amount you wish to borrow (KES {minAmount.toLocaleString()} – {maxAmount.toLocaleString()}).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              min={minAmount}
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Submitting...' : 'Submit application'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
