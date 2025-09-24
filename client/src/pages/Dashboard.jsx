import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="@container/main flex flex-1 flex-col gap-6 overflow-auto p-4 lg:gap-8 lg:p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome to your project dashboard. Monitor your project progress and key metrics.
                </p>
              </div>
              
              {/* Section Cards */}
              <SectionCards />
              
              {/* Chart Section */}
              <div className="grid grid-cols-1 gap-6 @4xl/main:grid-cols-3">
                <div className="@4xl/main:col-span-2">
                  <ChartAreaInteractive />
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Quick Stats</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed Tasks</span>
                        <span className="text-sm font-medium">32</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">In Progress</span>
                        <span className="text-sm font-medium">24</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Items</span>
                        <span className="text-sm font-medium">68</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Team Overview</h3>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Active Reviewers</span>
                        <span className="text-sm font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pending Assignments</span>
                        <span className="text-sm font-medium">8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Data Table Section */}
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">Project Items</h2>
                  <p className="text-muted-foreground">
                    Manage and track all project components, their status, and assignments.
                  </p>
                </div>
                <DataTable data={dashboardData} />
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}