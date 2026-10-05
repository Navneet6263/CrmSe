import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Link2,
  FileText,
  Folder,
  MoreHorizontal,
  Eye,
  Edit3,
  Download,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SharedFile {
  id: string;
  name: string;
  type: "file" | "folder";
  permission: "view" | "edit";
  sharedWith?: { name: string; avatar: string }[];
  sharedBy?: { name: string; avatar: string };
  sharedDate: string;
  expires?: string;
}

const sharedByMe: SharedFile[] = [
  {
    id: "1",
    name: "Q4 Report.pdf",
    type: "file",
    permission: "view",
    sharedWith: [
      { name: "Anna K", avatar: "AK" },
      { name: "Marcus B", avatar: "MB" },
    ],
    sharedDate: "2 hours ago",
    expires: "7 days",
  },
  {
    id: "2",
    name: "Project Assets",
    type: "folder",
    permission: "edit",
    sharedWith: [
      { name: "Team Design", avatar: "TD" },
    ],
    sharedDate: "Yesterday",
  },
  {
    id: "3",
    name: "Brand Guidelines.pdf",
    type: "file",
    permission: "view",
    sharedWith: [
      { name: "Sofia A", avatar: "SA" },
      { name: "Erik L", avatar: "EL" },
      { name: "Lisa M", avatar: "LM" },
    ],
    sharedDate: "3 days ago",
  },
];

const sharedWithMe: SharedFile[] = [
  {
    id: "4",
    name: "Marketing Plan 2024.docx",
    type: "file",
    permission: "edit",
    sharedBy: { name: "Emma L", avatar: "EL" },
    sharedDate: "1 hour ago",
  },
  {
    id: "5",
    name: "Design Resources",
    type: "folder",
    permission: "view",
    sharedBy: { name: "Design Team", avatar: "DT" },
    sharedDate: "Yesterday",
  },
  {
    id: "6",
    name: "Contract_v2.pdf",
    type: "file",
    permission: "view",
    sharedBy: { name: "Legal Dept", avatar: "LD" },
    sharedDate: "2 days ago",
    expires: "3 days",
  },
];

function SharedFileCard({ file, type }: { file: SharedFile; type: "by-me" | "with-me" }) {
  const Icon = file.type === "folder" ? Folder : FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 hover:shadow-card transition-all group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        file.type === "folder" ? "bg-warning/10" : "bg-primary/10"
      }`}>
        <Icon className={`w-5 h-5 ${file.type === "folder" ? "text-warning" : "text-primary"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-foreground truncate">{file.name}</p>
          <Badge variant={file.permission === "edit" ? "default" : "secondary"} className="text-xs">
            {file.permission === "edit" ? <Edit3 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
            {file.permission === "edit" ? "Can edit" : "View only"}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {type === "by-me" && file.sharedWith && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{file.sharedWith.length} people</span>
            </div>
          )}
          {type === "with-me" && file.sharedBy && (
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {file.sharedBy.avatar}
                </AvatarFallback>
              </Avatar>
              <span>{file.sharedBy.name}</span>
            </div>
          )}
          <span>·</span>
          <span>{file.sharedDate}</span>
          {file.expires && (
            <>
              <span>·</span>
              <div className="flex items-center gap-1 text-warning">
                <Clock className="w-3 h-3" />
                <span>Expires in {file.expires}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {type === "by-me" && file.sharedWith && (
        <div className="hidden sm:flex -space-x-2">
          {file.sharedWith.slice(0, 3).map((person, i) => (
            <Avatar key={i} className="w-8 h-8 border-2 border-background">
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                {person.avatar}
              </AvatarFallback>
            </Avatar>
          ))}
          {file.sharedWith.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
              +{file.sharedWith.length - 3}
            </div>
          )}
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
          {type === "by-me" && (
            <>
              <DropdownMenuItem>
                <Link2 className="w-4 h-4 mr-2" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Revoke access
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

export default function SharedFiles() {
  return (
    <div className="pt-6">
      <Tabs defaultValue="with-me" className="space-y-6">
        {/* Header - Fixed Secondary Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border -mx-6 px-6 py-3 -mt-6 h-14 flex items-center">
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Shared</span>
              </div>
            </div>
            <TabsList>
              <TabsTrigger value="with-me" className="gap-2">
                <Users className="w-4 h-4" />
                Shared with me
              </TabsTrigger>
              <TabsTrigger value="by-me" className="gap-2">
                <Link2 className="w-4 h-4" />
                Shared by me
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="mt-6 space-y-6">

        <TabsContent value="with-me" className="space-y-3">
          {sharedWithMe.length === 0 ? (
            <div className="empty-state py-16">
              <Users className="empty-state-icon" />
              <h3 className="text-lg font-medium text-foreground mb-2">No shared files</h3>
              <p className="text-muted-foreground">Files shared with you will appear here</p>
            </div>
          ) : (
            sharedWithMe.map((file) => (
              <SharedFileCard key={file.id} file={file} type="with-me" />
            ))
          )}
        </TabsContent>

        <TabsContent value="by-me" className="space-y-3">
          {sharedByMe.length === 0 ? (
            <div className="empty-state py-16">
              <Link2 className="empty-state-icon" />
              <h3 className="text-lg font-medium text-foreground mb-2">No shared files</h3>
              <p className="text-muted-foreground mb-4">Share files to collaborate with others</p>
              <Button>Share a file</Button>
            </div>
          ) : (
            sharedByMe.map((file) => (
              <SharedFileCard key={file.id} file={file} type="by-me" />
            ))
          )}
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
