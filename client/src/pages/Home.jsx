import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link to="/signup">
          <Button>Sign Up</Button>
        </Link>
      </div>
      
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Welcome to Vortexa</h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Your comprehensive project management and analytics platform. Monitor progress, track metrics, and manage your team efficiently.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
          <p className="text-muted-foreground text-sm">
            Comprehensive analytics with interactive charts and real-time data visualization.
          </p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Team Management</h3>
          <p className="text-muted-foreground text-sm">
            Manage team members, assign tasks, and track progress with ease.
          </p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Project Tracking</h3>
          <p className="text-muted-foreground text-sm">
            Advanced project tracking with status updates, deadlines, and milestone management.
          </p>
        </div>
      </div>
    </div>
  )
}