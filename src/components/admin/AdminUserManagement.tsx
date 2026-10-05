import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Loader2,
  Shield,
  ShieldCheck,
  User as UserIcon,
  MoreHorizontal,
  Check,
  Trash2,
  Ban,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  roles: string[];
  storageUsed: number;
  createdAt: string;
  lastSignIn: string | null;
  emailConfirmed: boolean;
  isBanned: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminUserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    try {
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("admin-users", {
        method: "POST",
      });
      
      if (error) throw error;
      setUsers(data.users || []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      toast.error(t("admin.users.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string, action: "add" | "remove") => {
    setUpdating(userId);
    try {
      const { error } = await supabase.functions.invoke("admin-update-role", {
        body: { userId, role, action },
      });

      if (error) throw error;

      toast.success(
        action === "add"
          ? t("admin.users.roleAdded", { role })
          : t("admin.users.roleRemoved", { role })
      );
      
      await fetchUsers();
    } catch (err: any) {
      console.error("Error updating role:", err);
      toast.error(err.message || t("admin.users.roleError"));
    } finally {
      setUpdating(null);
    }
  };

  const handleManageUser = async (userId: string, action: "delete" | "disable" | "enable") => {
    setUpdating(userId);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-user", {
        body: { userId, action },
      });

      if (error) throw error;

      if (action === "delete") {
        toast.success(t("admin.users.deleteSuccess"));
      } else if (action === "disable") {
        toast.success(t("admin.users.disableSuccess"));
      } else {
        toast.success(t("admin.users.enableSuccess"));
      }
      
      await fetchUsers();
    } catch (err: any) {
      console.error(`Error ${action} user:`, err);
      toast.error(err.message || t("admin.users.manageError"));
    } finally {
      setUpdating(null);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            {t("admin.users.title")}
          </CardTitle>
          <CardDescription>{t("admin.users.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("admin.users.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">{filteredUsers.length} {t("admin.users.usersCount")}</Badge>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.user")}</TableHead>
                  <TableHead>{t("admin.users.status")}</TableHead>
                  <TableHead>{t("admin.users.roles")}</TableHead>
                  <TableHead>{t("admin.users.storage")}</TableHead>
                  <TableHead>{t("admin.users.joined")}</TableHead>
                  <TableHead>{t("admin.users.lastActive")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("admin.users.noUsers")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className={user.isBanned ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatarUrl || ""} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.fullName, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName || t("admin.users.noName")}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive" className="gap-1">
                            <Ban className="w-3 h-3" />
                            {t("admin.users.disabled")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                            <UserCheck className="w-3 h-3" />
                            {t("admin.users.active")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)}>
                              {role === "admin" && <ShieldCheck className="w-3 h-3 mr-1" />}
                              {role === "moderator" && <Shield className="w-3 h-3 mr-1" />}
                              {t(`admin.roles.${role}`)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatBytes(user.storageUsed)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        {user.lastSignIn ? formatDate(user.lastSignIn) : t("admin.users.never")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={updating === user.id}>
                              {updating === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("admin.users.manageRoles")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Shield className="w-4 h-4 mr-2" />
                                {t("admin.users.addRole")}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {["admin", "moderator"].map((role) => (
                                  <DropdownMenuItem
                                    key={role}
                                    onClick={() => handleRoleChange(user.id, role, "add")}
                                    disabled={user.roles.includes(role)}
                                  >
                                    {user.roles.includes(role) && (
                                      <Check className="w-4 h-4 mr-2" />
                                    )}
                                    {t(`admin.roles.${role}`)}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                <Shield className="w-4 h-4 mr-2" />
                                {t("admin.users.removeRole")}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {["admin", "moderator"].map((role) => (
                                  <DropdownMenuItem
                                    key={role}
                                    onClick={() => handleRoleChange(user.id, role, "remove")}
                                    disabled={!user.roles.includes(role)}
                                  >
                                    {t(`admin.roles.${role}`)}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>{t("admin.users.manageAccount")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.isBanned ? (
                              <DropdownMenuItem
                                onClick={() => handleManageUser(user.id, "enable")}
                              >
                                <UserCheck className="w-4 h-4 mr-2" />
                                {t("admin.users.enableAccount")}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleManageUser(user.id, "disable")}
                                className="text-amber-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                {t("admin.users.disableAccount")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => confirmDelete(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t("admin.users.deleteAccount")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.users.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.users.deleteConfirmDescription", { email: userToDelete?.email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleManageUser(userToDelete.id, "delete")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
