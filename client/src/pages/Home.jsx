import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter">Welcome to Vortexa</h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Your comprehensive project management and analytics platform
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}