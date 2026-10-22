'use client';
import React from 'react';
import { 
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, 
  SidebarMenuSubItem, SidebarMenuSubButton 
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  BookOpen, Sparkles, ChevronDown, Trash2, 
  Users2, Users as Users3, Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Topic, CATEGORIES } from '@/components/types';

interface SidebarProps {
  groupedTopics: Record<string, Topic[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenAIModal: () => void;
  openCategories: string[];
  toggleCategory: (id: string) => void;
  onDelete: (id: string) => void;
  user: any;
}

export const TopicsSidebar = ({ 
  groupedTopics, selectedId, onSelect, onOpenAIModal, 
  openCategories, toggleCategory, onDelete, user 
}: SidebarProps) => {
  
  const getParticipantIcon = (count: number) => {
    if (count === 3) return Users3;
    if (count === 2) return Users2;
    return Users;
  };

  return (
    <Sidebar className="border-r border-border bg-card mt-18">
      <SidebarHeader className="border-b border-border px-4 py-4 bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brand to-brand/70 rounded-lg shadow-lg shadow-brand/20">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
              Topics
            </h2>
          </div>
          {user && (
            <button 
              onClick={onOpenAIModal} 
              className="p-2 bg-gradient-to-r from-brand to-brand/70 text-primary-foreground rounded-lg hover:ring-2 hover:ring-ring/50 transition-all"
            >
              <Sparkles size={16} />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2 bg-card">
        <SidebarMenu className="space-y-2">
          {Object.entries(CATEGORIES).map(([id, cat]) => {
            const Icon = cat.icon;
            const topics = groupedTopics[id] || [];
            const isOpen = openCategories.includes(id);

            return (
              <SidebarMenuItem key={id}>
                <Collapsible open={isOpen} onOpenChange={() => toggleCategory(id)}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className={cn(
                        "w-full justify-between py-3 px-3 group transition-all duration-200", 
                        cat.bgColor,
                        "text-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5 transition-colors", cat.color)} />
                        <span className="font-semibold">{cat.name}</span>
                        <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full border border-border">
                          {topics.length}
                        </span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-1">
                    <SidebarMenuSub className="ml-4 border-l border-border space-y-1 py-1">
                      {topics.length > 0 ? (
                        topics.map(t => {
                          const PartIcon = t.participants ? getParticipantIcon(t.participants) : null;
                          const isActive = selectedId === t.id;
                          
                          return (
                            <SidebarMenuSubItem key={t.id} className="flex items-center group/item px-1">
                              <SidebarMenuSubButton 
                                isActive={isActive} 
                                onClick={() => onSelect(t.id)}
                                className={cn(
                                  "flex-1 transition-all duration-200 px-3 py-2 rounded-md truncate",
                                  // Default & Hover state: White text
                                  "text-foreground/80 hover:text-foreground hover:bg-muted/50",
                                  // Active state: Black text on White background
                                  "data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-semibold"
                                )}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate text-sm">{t.title}</span>
                                  {PartIcon && (
                                    <PartIcon size={12} className={cn(isActive ? "text-muted-foreground" : "text-muted-foreground")} />
                                  )}
                                </div>
                              </SidebarMenuSubButton>
                              
                              {t.isCustom && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
                                  className="opacity-0 group-hover/item:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </SidebarMenuSubItem>
                          );
                        })
                      ) : (
                        <div className="px-4 py-2 text-[11px] text-muted-foreground italic">No topics found</div>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};