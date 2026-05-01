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
    <Sidebar className="border-r border-slate-800 bg-slate-900 mt-18">
      <SidebarHeader className="border-b border-slate-800 px-4 py-4 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Topics
            </h2>
          </div>
          {user && (
            <button 
              onClick={onOpenAIModal} 
              className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:ring-2 hover:ring-purple-500/50 transition-all"
            >
              <Sparkles size={16} />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2 bg-slate-900">
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
                        "text-slate-200 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5 transition-colors", cat.color)} />
                        <span className="font-semibold">{cat.name}</span>
                        <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                          {topics.length}
                        </span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-1">
                    <SidebarMenuSub className="ml-4 border-l border-slate-800 space-y-1 py-1">
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
                                  "text-slate-300 hover:text-white hover:bg-slate-800/50",
                                  // Active state: Black text on White background
                                  "data-[active=true]:bg-white data-[active=true]:text-black data-[active=true]:font-semibold"
                                )}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="truncate text-sm">{t.title}</span>
                                  {PartIcon && (
                                    <PartIcon size={12} className={cn(isActive ? "text-slate-500" : "text-slate-600")} />
                                  )}
                                </div>
                              </SidebarMenuSubButton>
                              
                              {t.isCustom && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} 
                                  className="opacity-0 group-hover/item:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </SidebarMenuSubItem>
                          );
                        })
                      ) : (
                        <div className="px-4 py-2 text-[11px] text-slate-600 italic">No topics found</div>
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