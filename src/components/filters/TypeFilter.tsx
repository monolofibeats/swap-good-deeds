import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypeFilterProps {
  questTypes: string[];
  listingTypes: string[];
  onQuestTypesChange: (types: string[]) => void;
  onListingTypesChange: (types: string[]) => void;
  mode: "quests" | "listings";
}

const QUEST_TYPE_LABELS: Record<string, string> = {
  cleanup: "Cleanup",
  good_deed: "Good Deed",
};

const LISTING_TYPE_LABELS: Record<string, string> = {
  help_request: "Help Request",
  micro_job: "Micro Job",
  good_deed_request: "Good Deed Request",
  service_offer: "Service Offer",
};

export const TypeFilter: React.FC<TypeFilterProps> = ({
  questTypes,
  listingTypes,
  onQuestTypesChange,
  onListingTypesChange,
  mode,
}) => {
  const hasActiveFilter = mode === "quests" 
    ? questTypes.length > 0 && questTypes.length < 2
    : listingTypes.length > 0 && listingTypes.length < 4;

  const toggleQuestType = (type: string) => {
    if (questTypes.includes(type)) {
      onQuestTypesChange(questTypes.filter(t => t !== type));
    } else {
      onQuestTypesChange([...questTypes, type]);
    }
  };

  const toggleListingType = (type: string) => {
    if (listingTypes.includes(type)) {
      onListingTypesChange(listingTypes.filter(t => t !== type));
    } else {
      onListingTypesChange([...listingTypes, type]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasActiveFilter ? "default" : "outline"}
          size="icon"
          title="Type filter"
          className={cn(hasActiveFilter && "bg-primary")}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover">
        <DropdownMenuLabel>
          {mode === "quests" ? "Quest Types" : "Listing Types"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {mode === "quests" ? (
          <>
            {Object.entries(QUEST_TYPE_LABELS).map(([type, label]) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={questTypes.length === 0 || questTypes.includes(type)}
                onCheckedChange={() => toggleQuestType(type)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        ) : (
          <>
            {Object.entries(LISTING_TYPE_LABELS).map(([type, label]) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={listingTypes.length === 0 || listingTypes.includes(type)}
                onCheckedChange={() => toggleListingType(type)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
