import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, MessageSquare, Gift, MapPin, Search, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, React.ReactNode> = {
  message: <MessageSquare className="h-4 w-4" />,
  quest: <MapPin className="h-4 w-4" />,
  listing: <MapPin className="h-4 w-4" />,
  saved_search: <Search className="h-4 w-4" />,
  system: <Bell className="h-4 w-4" />,
};

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case "message":
        return "/messages";
      case "quest":
        return notification.related_id ? `/quest/${notification.related_id}` : "/";
      case "listing":
        return notification.related_id ? `/listing/${notification.related_id}` : "/";
      case "saved_search":
        return "/";
      default:
        return "/";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 text-xs bg-primary"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs gap-1"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.slice(0, 20).map((notification) => (
                <Link
                  key={notification.id}
                  to={getNotificationLink(notification)}
                  onClick={() => {
                    if (!notification.is_read) markAsRead(notification.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-b last:border-b-0",
                    !notification.is_read && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                    !notification.is_read ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {typeIcons[notification.type] || <Bell className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm truncate",
                      !notification.is_read && "font-medium"
                    )}>
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
