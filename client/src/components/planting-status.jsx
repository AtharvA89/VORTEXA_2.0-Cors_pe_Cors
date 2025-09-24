import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function PlantingStatus() {
  // This would typically be calculated from real farm data
  const farmData = {
    plantingProgress: 68,
    harvestProgress: 24,
    irrigationStatus: 42,
    totalFields: 15,
    fieldsPlanted: 10,
  };

  return (
    <Card className="bg-sidebar-accent/20 border-none shadow-none mb-2 mx-2 mt-2">
      <CardContent className="p-3 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Planting Progress</span>
            <span className="text-xs text-muted-foreground">{farmData.plantingProgress}%</span>
          </div>
          <Progress value={farmData.plantingProgress} className="h-1.5 bg-green-100" 
            indicatorClassName="bg-green-600" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Harvest Progress</span>
            <span className="text-xs text-muted-foreground">{farmData.harvestProgress}%</span>
          </div>
          <Progress value={farmData.harvestProgress} className="h-1.5 bg-amber-100" 
            indicatorClassName="bg-amber-600" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Irrigation Status</span>
            <span className="text-xs text-muted-foreground">{farmData.irrigationStatus}%</span>
          </div>
          <Progress value={farmData.irrigationStatus} className="h-1.5 bg-blue-100" 
            indicatorClassName="bg-blue-600" />
        </div>
        
        <div className="pt-2 border-t border-sidebar-border flex justify-between text-xs">
          <span>Fields Planted: {farmData.fieldsPlanted}/{farmData.totalFields}</span>
          <span className="text-green-600 font-medium">
            {Math.round((farmData.fieldsPlanted/farmData.totalFields)*100)}% Complete
          </span>
        </div>
      </CardContent>
    </Card>
  );
}