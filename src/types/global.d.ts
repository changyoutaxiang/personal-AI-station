// 全局类型声明
declare global {
  var agentFolders: Array<{
    id: string;
    name: string;
    description?: string;
    color: string;
    created_at: string;
    updated_at: string;
  }> | undefined;

  var agentConversations: Array<{
    id: number;
    folder_id?: string | null;
    title: string;
    created_at: string;
    updated_at: string;
  }> | undefined;
}

export {};