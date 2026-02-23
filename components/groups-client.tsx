'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
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
import { createGroup, joinGroup, leaveGroup } from '@/lib/actions'

export function GroupsClient({
  mode,
  groupId,
}: {
  mode: 'create' | 'join' | 'leave'
  groupId?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    if (!groupId) return
    setError(null)
    setPending(true)
    try {
      await joinGroup(groupId)
      router.refresh()
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join')
    } finally {
      setPending(false)
    }
  }

  async function handleLeave() {
    if (!groupId) return
    setError(null)
    setPending(true)
    try {
      await leaveGroup(groupId)
      toast.success('Left group')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to leave')
    } finally {
      setPending(false)
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    try {
      await createGroup({
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        description: (formData.get('description') as string) || undefined,
        location: (formData.get('location') as string) || undefined,
        county: (formData.get('county') as string) || undefined,
      })
      toast.success('Group created')
      router.refresh()
      setOpen(false)
      form.reset()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create group')
    } finally {
      setPending(false)
    }
  }

  if (mode === 'join') {
    return (
      <Button size="sm" className="w-full" onClick={handleJoin} disabled={pending}>
        {pending ? 'Joining...' : 'Join Group'}
      </Button>
    )
  }

  if (mode === 'leave') {
    return (
      <Button size="sm" variant="outline" onClick={handleLeave} disabled={pending}>
        {pending ? 'Leaving...' : 'Leave'}
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create/Join Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
          <DialogDescription>Start a new cooperative or SACCO.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 min-w-0">
          <div>
            <Label htmlFor="name">Group name *</Label>
            <Input id="name" name="name" required placeholder="e.g. Maize Farmers Association" className="w-full" />
          </div>
          <div>
            <Label htmlFor="type">Type *</Label>
            <select id="type" name="type" required className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select</option>
              <option value="Farming Cooperative">Farming Cooperative</option>
              <option value="SACCO">SACCO</option>
              <option value="Support Group">Support Group</option>
              <option value="Youth Group">Youth Group</option>
              <option value="Specialty Cooperative">Specialty Cooperative</option>
            </select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Brief description" className="w-full" />
          </div>
          <div>
            <Label htmlFor="county">County</Label>
            <Input id="county" name="county" placeholder="e.g. Nakuru" className="w-full" />
          </div>
          <div>
            <Label htmlFor="location">Location / town</Label>
            <Input id="location" name="location" placeholder="e.g. Eldoret" className="w-full" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? 'Creating...' : 'Create group'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
