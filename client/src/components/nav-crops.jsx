"use client"

import { IconPlant2, IconSun, IconSeeding, IconFlower, IconApple } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const cropData = [
  {
    name: "Wheat",
    count: 3,
    icon: IconSeeding,
    color: "text-amber-600",
  },
  {
    name: "Corn",
    count: 5,
    icon: IconPlant2,
    color: "text-yellow-500",
  },
  {
    name: "Soybeans",
    count: 2,
    icon: IconSun,
    color: "text-green-600",
  },
  {
    name: "Vegetables",
    count: 4,
    icon: IconFlower,
    color: "text-emerald-600",
  },
  {
    name: "Fruit",
    count: 1,
    icon: IconApple,
    color: "text-red-500",
  },
];

export function NavCrops() {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Active Crops</SidebarGroupLabel>
      <SidebarMenu>
        {cropData.map((crop) => (
          <SidebarMenuItem key={crop.name}>
            <SidebarMenuButton asChild>
              <a href="#">
                <crop.icon className={crop.color} />
                <span>{crop.name}</span>
                <SidebarMenuBadge className="bg-muted">
                  {crop.count}
                </SidebarMenuBadge>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}