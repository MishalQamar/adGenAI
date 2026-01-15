'use client';

import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ImageIcon,
  LayoutDashboard,
  VideoIcon,
  CrownIcon,
  CreditCardIcon,
} from 'lucide-react';
import { CreditsPurchaseModal } from '@/components/shared/credits-purchase-modal';
import { title } from 'process';

// Navigation menu items

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Image Generator',
    url: '/image-generator',
    icon: ImageIcon,
  },
  {
    title: 'Video Generation',
    url: '/video-generation',
    icon: VideoIcon,
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CreditCardIcon,
  },
];

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [showCreditsPurchaseModal, setShowCreditsPurchaseModal] =
    React.useState(false);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4 px-4">
        <div className="flex items-center gap-2 justify-start group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500  ">
              <Sparkles
                className="size-5 text-white"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
              AdGen AI
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="group-data-[collapsible=icon]:hidden relative overflow-hidden rounded-xl border bg-sidebar-accent/50 p-4">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="size-20 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">Unlock premium</h3>
              <p className="mb-4">
                Enhance your experience with premium features
              </p>
              <Button
                onClick={() => setShowCreditsPurchaseModal(true)}
                variant="outline"
                className="w-full bg-gradient-to-br from-blue-500 to-purple-500"
              >
                <CrownIcon className="size-4 mr-2 text-amber-500" />
                Upgrade
              </Button>
            </div>
            <SidebarMenuButton
              onClick={() => setShowCreditsPurchaseModal(true)}
              className="hidden group-data-[collapsible=icon]:block"
            >
              <CrownIcon className="size-4 mr-2 text-amber-500" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <CreditsPurchaseModal
        open={showCreditsPurchaseModal}
        onOpenChange={setShowCreditsPurchaseModal}
      />
    </Sidebar>
  );
}
