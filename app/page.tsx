import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-green-50 to-white">
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-10 border-b border-green-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-1 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Mkulima Pro" width={140} height={40} className="h-8 w-auto object-contain" priority />
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Scrollable Body */}
      <main className="flex-1 overflow-y-auto pt-7 pb-6">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
            Smart Farming for Kenya's Future
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
            Mkulima Pro connects smallholder and commercial farmers with agricultural advisory, 
            financing, market access, and logistics solutions—all in one platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Our Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Advisory',
              description: 'Get personalized farming recommendations from experienced advisors',
              icon: '📚',
            },
            {
              title: 'Finance',
              description: 'Access agricultural loans and financial products tailored to your needs',
              icon: '💰',
            },
            {
              title: 'Marketplace',
              description: 'Buy inputs, sell produce, and connect with nearby buyers and sellers',
              icon: '🛒',
            },
            {
              title: 'Logistics',
              description: 'Arrange reliable pickup and delivery for your agricultural products',
              icon: '🚚',
            },
            {
              title: 'Weather Alerts',
              description: 'Stay informed with real-time weather forecasts and climate insights',
              icon: '⛅',
            },
            {
              title: 'Groups & SACCOs',
              description: 'Join cooperative groups and savings associations for collective strength',
              icon: '👥',
            },
          ].map((feature, idx) => (
            <Card key={idx} className="border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <div className="mb-2 text-4xl">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold">Ready to Transform Your Farming?</h2>
          <p className="mb-8 text-lg">
            Join thousands of Kenyan farmers using Mkulima Pro to increase yields, reduce costs, and improve their livelihoods.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white py-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Mkulima Pro. All rights reserved.
          </p>
          <p className="text-center text-sm text-gray-500 mt-1">
            Sysnova Technologies
          </p>
        </div>
      </footer>
    </div>
  )
}
