// components/ai-topics/TopicMenu.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
    SidebarMenu, SidebarMenuItem, SidebarMenuButton, 
    SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton 
} from '@/components/ui/sidebar';
import { Topic, CategoryConfig } from '@/components/types';

interface TopicMenuProps {
  groupedTopics: Record<string, Topic[]>;
  categories: Record<string, CategoryConfig>;
  selectedId: string | null;
  openCategories: string[];
  user: any; // User object from AuthContext
  setSelectedId: (id: string | null) => void;
  toggleCategory: (categoryId: string) => void;
  deleteCustomConversation: (topicId: string) => void;
  getParticipantIcon: (count: number) => React.ElementType;
}

export function TopicMenu({
  groupedTopics, categories, selectedId, openCategories, user,
  setSelectedId, toggleCategory, deleteCustomConversation, getParticipantIcon
}: TopicMenuProps) {
  return (
    <SidebarMenu className="space-y-2">
      {Object.entries(categories).map(([categoryId, category]) => {
        const Icon = category.icon;
        const categoryTopics = groupedTopics[categoryId] || [];
        const isOpen = openCategories.includes(categoryId);
        
        return (
          <SidebarMenuItem key={categoryId}>
            <Collapsible open={isOpen} onOpenChange={() => toggleCategory(categoryId)}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  className={cn(
                    "w-full justify-between py-3 px-3 group",
                    "bg-slate-800/30 hover:bg-slate-700/50",
                    "border border-slate-700/50 hover:border-slate-600",
                    "rounded-lg transition-all duration-200",
                    category.bgColor
                  )}
                  variant="ghost"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5 transition-colors", category.color)} />
                    <span className="font-semibold text-slate-200 group-hover:text-white">
                      {category.name}
                    </span>
                    <span className="ml-auto text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                      {categoryTopics.length}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-all duration-300 text-slate-400 group-hover:text-slate-300",
                    isOpen ? "rotate-180" : ""
                  )} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2">
                <SidebarMenuSub className="ml-2 space-y-1">
                  {categoryTopics.map((topicItem) => {
                    const ParticipantIcon = topicItem.isCustom 
                      ? getParticipantIcon(topicItem.participants || 2) 
                      : null;
                    
                    return (
                      <SidebarMenuSubItem key={topicItem.id}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={selectedId === topicItem.id}
                        >
                          <div className="flex items-center w-full">
                            <button
                              onClick={() => setSelectedId(topicItem.id)}
                              className={cn(
                                "flex-1 text-left px-4 py-2.5 rounded-md text-sm transition-all duration-200",
                                "border border-transparent",
                                "hover:bg-slate-700/30 hover:border-slate-600/50 hover:text-white",
                                selectedId === topicItem.id 
                                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10" 
                                  : "text-slate-300"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-colors",
                                  selectedId === topicItem.id ? "bg-blue-400" : "bg-slate-600"
                                )} />
                                <span className="flex-1 truncate">{topicItem.title}</span>
                                {ParticipantIcon && (
                                  <ParticipantIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                )}
                              </div>
                            </button>
                            
                            {/* Delete button for custom conversations */}
                            {topicItem.isCustom && user && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCustomConversation(topicItem.id);
                                }}
                                className="ml-2 p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete conversation"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                  {categoryTopics.length === 0 && (
                    <SidebarMenuSubItem>
                      <div className="px-4 py-3 text-sm text-slate-500 italic border border-slate-700/30 rounded-md bg-slate-800/20">
                        {categoryId === 'custom' ? 'No custom conversations yet' : 'No topics available'}
                      </div>
                    </SidebarMenuSubItem>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}