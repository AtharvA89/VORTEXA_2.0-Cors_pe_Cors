import * as React from "react"
import {
  IconPlant,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconCloud,
  IconDeviceFloppy,
  IconMapPins,
  IconPlant2,
  IconHelp,
  IconLeaf,
  IconCalendarStats,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconSun,
  IconDroplet,
  IconTractor,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { NavCrops } from "@/components/nav-crops"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "John Farmer",
    email: "john@vortexa.com",
    avatar: "/avatars/farmer.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Crop Calendar",
      url: "#",
      icon: IconCalendarStats,
    },
    {
      title: "Field Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Field Mapping",
      url: "#",
      icon: IconMapPins,
    },
    {
      title: "Farm Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Weather Data",
      icon: IconCloud,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Forecast",
          url: "#",
        },
        {
          title: "Historical Data",
          url: "#",
        },
      ],
    },
    {
      title: "Irrigation",
      icon: IconDroplet,
      url: "#",
      items: [
        {
          title: "Schedules",
          url: "#",
        },
        {
          title: "Water Usage",
          url: "#",
        },
      ],
    },
    {
      title: "Soil Analysis",
      icon: IconDeviceFloppy,
      url: "#",
      items: [
        {
          title: "Current Reports",
          url: "#",
        },
        {
          title: "Historical Data",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Crop Library",
      url: "#",
      icon: IconPlant,
    },
    {
      name: "Farm Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Equipment Log",
      url: "#",
      icon: IconTractor,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconLeaf className="!size-5 text-green-600" />
                <span className="text-base font-semibold">Vortexa Farm</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>        
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavCrops />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
