import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Send, Users, Shield, User, Loader2, Info, AlertCircle, FileText, Share2, UserPlus, X, Search, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

type RecipientType = "all" | "admins" | "moderators" | "users" | "specific";
type NotificationType = "info" | "alert" | "file" | "share";

interface UserProfile {
  id: string;
  full_name: string | null;
  email?: string;
}

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  scheduled_for: string;
  sent: boolean;
  sent_count: number | null;
  created_at: string;
}

const recipientOptions: { value: RecipientType; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Users", icon: <Users className="w-4 h-4" /> },
  { value: "admins", label: "Admins Only", icon: <Shield className="w-4 h-4" /> },
  { value: "moderators", label: "Moderators Only", icon: <Shield className="w-4 h-4" /> },
  { value: "users", label: "Regular Users", icon: <User className="w-4 h-4" /> },
  { value: "specific", label: "Specific Users", icon: <UserPlus className="w-4 h-4" /> },
];

const notificationTypes: { value: NotificationType; label: string; icon: React.ReactNode }[] = [
  { value: "info", label: "Information", icon: <Info className="w-4 h-4" /> },
  { value: "alert", label: "Alert", icon: <AlertCircle className="w-4 h-4" /> },
  { value: "file", label: "File Related", icon: <FileText className="w-4 h-4" /> },
  { value: "share", label: "Share", icon: <Share2 className="w-4 h-4" /> },
];

export function AdminNotifications() {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState<RecipientType>("all");
  const [type, setType] = useState<NotificationType>("info");
  const [actionUrl, setActionUrl] = useState("");
  const [sending, setSending] = useState(false);
  
  // User selection state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  // Fetch users when "specific" is selected
  useEffect(() => {
    if (recipients === "specific" && users.length === 0) {
      fetchUsers();
    }
  }, [recipients]);

  // Fetch scheduled notifications on mount
  useEffect(() => {
    fetchScheduledNotifications();
  }, []);

  const fetchScheduledNotifications = async () => {
    setLoadingScheduled(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .eq("sent", false)
        .order("scheduled_for", { ascending: true })
        .limit(10);
      
      if (error) throw error;
      setScheduledNotifications(data || []);
    } catch (err) {
      console.error("Error fetching scheduled notifications:", err);
    } finally {
      setLoadingScheduled(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "POST",
      });
      
      if (error) throw error;
      
      // Map the response to our UserProfile format
      const mappedUsers: UserProfile[] = (data.users || []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
      }));
      
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = userSearch.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in the title and message");
      return;
    }

    if (recipients === "specific" && selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        toast.error("Please select a date and time for scheduling");
        return;
      }
      const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledFor <= new Date()) {
        toast.error("Scheduled time must be in the future");
        return;
      }
    }

    setSending(true);
    try {
      if (isScheduled) {
        // Schedule the notification
        const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
        const recipientsData = recipients === "specific" ? selectedUserIds : recipients;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("scheduled_notifications")
          .insert({
            title: title.trim(),
            message: message.trim(),
            type,
            recipients: recipientsData,
            action_url: actionUrl.trim() || null,
            scheduled_for: scheduledFor,
            created_by: user.id,
          });

        if (error) throw error;

        toast.success(`Notification scheduled for ${format(new Date(scheduledFor), "PPp")}`);
        fetchScheduledNotifications();
      } else {
        // Send immediately
        const { data, error } = await supabase.functions.invoke("admin-send-notification", {
          body: {
            title: title.trim(),
            message: message.trim(),
            type,
            recipients: recipients === "specific" ? selectedUserIds : recipients,
            actionUrl: actionUrl.trim() || undefined,
          },
        });

        if (error) throw error;

        toast.success(data.message || `Notification sent to ${data.sent} user(s)`);
      }
      
      // Reset form
      setTitle("");
      setMessage("");
      setActionUrl("");
      setType("info");
      setRecipients("all");
      setSelectedUserIds([]);
      setIsScheduled(false);
      setScheduledDate("");
      setScheduledTime("");
    } catch (err: any) {
      console.error("Error sending notification:", err);
      toast.error(err.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const cancelScheduledNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Scheduled notification cancelled");
      setScheduledNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error cancelling notification:", err);
      toast.error("Failed to cancel notification");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          {t("admin.notifications.title", "Send Notification")}
        </CardTitle>
        <CardDescription>
          {t("admin.notifications.description", "Send notifications to users on the platform")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipients */}
        <div className="space-y-2">
          <Label>{t("admin.notifications.recipients", "Recipients")}</Label>
          <Select value={recipients} onValueChange={(v) => {
            setRecipients(v as RecipientType);
            if (v !== "specific") {
              setSelectedUserIds([]);
            }
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {recipientOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Selection (when "specific" is selected) */}
        {recipients === "specific" && (
          <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
            {/* Selected users badges */}
            {selectedUserIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUserIds.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1 pr-1">
                      <span className="truncate max-w-[150px]">
                        {user?.full_name || user?.email || "Unknown"}
                      </span>
                      <button
                        onClick={() => removeSelectedUser(userId)}
                        className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.notifications.searchUsers", "Search users...")}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* User list */}
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[200px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {userSearch ? "No users found" : "No users available"}
                    </p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <Checkbox
                          checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.full_name || "Unnamed"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}

            <p className="text-xs text-muted-foreground">
              {selectedUserIds.length} user(s) selected
            </p>
          </div>
        )}

        {/* Notification Type */}
        <div className="space-y-2">
          <Label>{t("admin.notifications.type", "Notification Type")}</Label>
          <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="notification-title">{t("admin.notifications.titleLabel", "Title")}</Label>
          <Input
            id="notification-title"
            placeholder={t("admin.notifications.titlePlaceholder", "Enter notification title...")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="notification-message">{t("admin.notifications.messageLabel", "Message")}</Label>
          <Textarea
            id="notification-message"
            placeholder={t("admin.notifications.messagePlaceholder", "Enter notification message...")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
        </div>

        {/* Action URL (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="notification-url">
            {t("admin.notifications.actionUrl", "Action URL")}
            <span className="text-muted-foreground ml-1">(optional)</span>
          </Label>
          <Input
            id="notification-url"
            placeholder="/app/files"
            value={actionUrl}
            onChange={(e) => setActionUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t("admin.notifications.actionUrlHint", "Users will be redirected to this URL when clicking the notification")}
          </p>
        </div>

        {/* Schedule Toggle */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label htmlFor="schedule-toggle" className="cursor-pointer">
                {t("admin.notifications.scheduleLabel", "Schedule for later")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("admin.notifications.scheduleHint", "Send at a specific date and time")}
              </p>
            </div>
          </div>
          <Switch
            id="schedule-toggle"
            checked={isScheduled}
            onCheckedChange={setIsScheduled}
          />
        </div>

        {/* Scheduling Date/Time */}
        {isScheduled && (
          <div className="grid grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSend} 
          disabled={sending || !title.trim() || !message.trim() || (recipients === "specific" && selectedUserIds.length === 0) || (isScheduled && (!scheduledDate || !scheduledTime))}
          className="w-full"
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isScheduled ? t("admin.notifications.scheduling", "Scheduling...") : t("admin.notifications.sending", "Sending...")}
            </>
          ) : isScheduled ? (
            <>
              <Calendar className="w-4 h-4" />
              {t("admin.notifications.schedule", "Schedule Notification")}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t("admin.notifications.send", "Send Notification")}
            </>
          )}
        </Button>

        {/* Scheduled Notifications List */}
        {scheduledNotifications.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("admin.notifications.scheduledList", "Pending Scheduled Notifications")}
            </h4>
            <div className="space-y-2">
              {scheduledNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Scheduled for {format(new Date(notification.scheduled_for), "PPp")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => cancelScheduledNotification(notification.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
