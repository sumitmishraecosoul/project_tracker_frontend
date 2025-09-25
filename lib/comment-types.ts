// Comment & Activity System Types

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
}

export interface Mention {
  userId: string;
  name: string;
  email: string;
  mentionedAt: Date;
}

export interface Link {
  url: string;
  title: string;
  description: string;
  type: 'onedrive' | 'googledrive' | 'external';
  preview: {
    image: string;
    domain: string;
  };
}

export interface Reaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  projectId: string;
  brandId: string;
  content: string;
  contentHtml: string;
  author: User;
  mentions: Mention[];
  links: Link[];
  reactions: Reaction[];
  parentCommentId?: string;
  replies: string[];
  replyCount: number;
  editedAt?: Date;
  editHistory: {
    content: string;
    editedAt: Date;
    editedBy: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface Activity {
  id: string;
  taskId: string;
  projectId: string;
  brandId: string;
  type: 'created' | 'completed' | 'commented' | 'assigned' | 'status_changed';
  description: string;
  user: User;
  metadata: {
    oldValue?: any;
    newValue?: any;
  };
  reactions: Reaction[];
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'comment' | 'reply' | 'activity';
  title: string;
  message: string;
  data: {
    taskId: string;
    commentId?: string;
    activityId?: string;
    mentionedBy?: string;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  emailSent: boolean;
  emailSentAt?: Date;
}

export interface MentionSuggestion {
  id: string;
  type: 'user' | 'project' | 'task';
  name: string;
  email?: string;
  avatar: string;
  color: string;
}

export interface CommentData {
  content: string;
  parentCommentId?: string;
  mentions: Mention[];
  links: Link[];
}

export interface CommentsState {
  comments: Comment[];
  activities: Activity[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  lastActivityId: string;
  expandedThreads: Set<string>;
  mentionSuggestions: MentionSuggestion[];
  showMentionDropdown: boolean;
  editingCommentId: string | null;
  editingContent: string;
}

export interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  lastMessage: any;
  subscriptions: Set<string>;
}

// Component Props Interfaces
export interface CommentsSectionProps {
  taskId: string;
  brandId: string;
  currentUser: User;
}

export interface CommentInputProps {
  onSubmit: (comment: CommentData) => void;
  onReply?: (reply: CommentData, parentId: string) => void;
  parentCommentId?: string;
  placeholder?: string;
  isReply?: boolean;
}

export interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  onReply: (reply: CommentData, parentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReaction: (commentId: string, emoji: string) => void;
  currentUser: User;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onMention: (query: string) => Promise<MentionSuggestion[]>;
  showPreview?: boolean;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

