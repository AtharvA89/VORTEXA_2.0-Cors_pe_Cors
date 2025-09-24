import React, { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { CropDataTable } from "@/components/crop-data-table"
import { FieldInputForm } from "@/components/field-input-form"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Plus, Crop, BarChart3, MapPin, Calendar } from "lucide-react"
import dashboardData from "@/app/dashboard/data.json"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [fields, setFields] = useState(dashboardData)

  // Calculate dashboard statistics
  const stats = {
    totalFields: fields.length,
    activeFields: fields.filter(f => f.status === "Growing" || f.status === "Planted").length,
    harvestedFields: fields.filter(f => f.status === "Harvested").length,
    totalArea: fields.reduce((sum, field) => {
      const area = parseFloat(field.area.replace(" ha", ""))
      return sum + area
    }, 0),
    cropTypes: [...new Set(fields.map(f => f.cropType))].length
  }

  // Handle field form submission
  const handleFieldSubmit = async (fieldData) => {
    try {
      // In a real app, this would send data to the backend
      const newField = {
        id: fields.length + 1,
        fieldName: fieldData.formData.fieldName,
        cropType: fieldData.formData.cropType,
        status: "Preparing",
        plantingDate: fieldData.formData.plantingDate?.toISOString().split('T')[0],
        expectedHarvest: fieldData.formData.expectedHarvestDate?.toISOString().split('T')[0],
        area: `${(fieldData.geoJson?.properties?.areaHectares || 0).toFixed(1)} ha`,
        farmer: "Current User",
        soilType: fieldData.formData.soilType || "Unknown",
        irrigationType: fieldData.formData.irrigationType || "Unknown"
      }

      setFields(prev => [...prev, newField])
      setShowFieldForm(false)
      toast.success("Field registered successfully!", {
        description: `${newField.fieldName} has been added to your farm management system.`
      })
    } catch (error) {
      toast.error("Failed to register field", {
        description: "Please try again later."
      })
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <SiteHeader />
          <main className="@container/main flex flex-1 flex-col gap-6 overflow-auto p-4 lg:gap-8 lg:p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight flex items-center">
                  <Crop className="mr-3 h-8 w-8 text-green-600" />
                  Farm Management Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Monitor your crops, manage field operations, and track agricultural progress.
                </p>
              </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.totalFields}</p>
                        <p className="text-xs text-muted-foreground">Total Fields</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Crop className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.activeFields}</p>
                        <p className="text-xs text-muted-foreground">Active Fields</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.harvestedFields}</p>
                        <p className="text-xs text-muted-foreground">Harvested</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.totalArea.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Total Hectares</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Crop className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.cropTypes}</p>
                        <p className="text-xs text-muted-foreground">Crop Types</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="fields">Field Management</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    onClick={() => setShowFieldForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Field
                  </Button>
                </div>

                <TabsContent value="overview" className="space-y-6">
                  {/* Section Cards */}
                  <SectionCards />
                  
                  {/* Chart Section */}
                  <div className="grid grid-cols-1 gap-6 @4xl/main:grid-cols-3">
                    <div className="@4xl/main:col-span-2">
                      <ChartAreaInteractive />
                    </div>
                    <div className="space-y-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Fields Growing</span>
                            <Badge variant="secondary">{stats.activeFields}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Ready to Harvest</span>
                            <Badge variant="secondary">
                              {fields.filter(f => f.status === "Harvesting").length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Preparing Fields</span>
                            <Badge variant="secondary">
                              {fields.filter(f => f.status === "Preparing").length}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Crop Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {[...new Set(fields.map(f => f.cropType))].map(crop => (
                            <div key={crop} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{crop}</span>
                              <Badge variant="outline">
                                {fields.filter(f => f.cropType === crop).length}
                              </Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fields" className="space-y-6">
                  {showFieldForm ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Register New Field</h2>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowFieldForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                      <FieldInputForm
                        onSubmit={handleFieldSubmit}
                        onSave={(draftData) => {
                          toast.info("Draft saved successfully!")
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold tracking-tight">Field Management</h2>
                        <p className="text-muted-foreground">
                          Manage all your agricultural fields, track crop progress, and monitor field operations.
                        </p>
                      </div>
                      <CropDataTable data={fields} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 @4xl/main:grid-cols-2">
                    <ChartAreaInteractive />
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Average Field Size</span>
                            <span className="font-medium">
                              {(stats.totalArea / stats.totalFields).toFixed(1)} ha
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Harvest Completion</span>
                            <span className="font-medium">
                              {((stats.harvestedFields / stats.totalFields) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Active Cultivation</span>
                            <span className="font-medium">
                              {((stats.activeFields / stats.totalFields) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}