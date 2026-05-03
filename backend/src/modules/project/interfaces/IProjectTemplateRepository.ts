export interface TemplateModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
}

export interface TemplateTask {
  title: string;
  description?: string;
  priority?: string;
  estimatedDays: number;
}

export interface TemplateData {
  columns?: Array<{ name: string; order: number }>;
  modules: TemplateModule[];
  tasks?: TemplateTask[];
}

export interface IProjectTemplateRepository {
  findByFocus(focus: string): Promise<TemplateData | null>;
  findAll(): Promise<TemplateData[]>;
  create(data: {
    focus: string;
    name: string;
    description?: string;
    icon?: string;
    modules: TemplateModule[];
    columns?: Array<{ name: string; order: number }>;
    tasks?: TemplateTask[];
  }): Promise<void>;
}