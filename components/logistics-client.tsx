'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { requestShipment } from '@/lib/actions'
import type { LogisticsPartner } from '@/lib/db/types'

export function LogisticsClient({ partners }: { partners: LogisticsPartner[] }) {
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
    try {
      await requestShipment({
        product_description: formData.get('product_description') as string,
        destination: formData.get('destination') as string,
        destination_county: (formData.get('destination_county') as string) || undefined,
        origin_location: (formData.get('origin_location') as string) || undefined,
        partner_id: (formData.get('partner_id') as string) || undefined,
      })
      toast.success('Shipment request submitted')
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">New Shipment Request</h2>
      <Card>
        <CardHeader>
          <CardTitle>Request Pickup or Delivery</CardTitle>
          <CardDescription>
            Get your products transported safely to buyers or markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">Request Shipment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request shipment</DialogTitle>
                <DialogDescription>Fill in the details for your shipment.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4 min-w-0">
                <div>
                  <Label htmlFor="product_description">Product description *</Label>
                  <Input
                    id="product_description"
                    name="product_description"
                    required
                    placeholder="e.g. Maize - 2 bags"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="destination">Destination *</Label>
                  <Input id="destination" name="destination" required placeholder="e.g. Nakuru Market" className="w-full" />
                </div>
                <div>
                  <Label htmlFor="destination_county">Destination county</Label>
                  <Input id="destination_county" name="destination_county" placeholder="e.g. Nakuru" className="w-full" />
                </div>
                <div>
                  <Label htmlFor="origin_location">Origin / pickup location</Label>
                  <Input id="origin_location" name="origin_location" placeholder="Your farm or store" className="w-full" />
                </div>
                {partners.length > 0 && (
                  <div>
                    <Label htmlFor="partner_id">Preferred partner</Label>
                    <select
                      id="partner_id"
                      name="partner_id"
                      className="h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Any</option>
                      {partners.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                  <Button type="submit" disabled={pending} className="w-full sm:w-auto">{pending ? 'Submitting...' : 'Request'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
