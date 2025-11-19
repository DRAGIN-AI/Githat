/**
 * Project Class
 * Manages groups of related chats
 */
class Project {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || 'New Project';
        this.description = data.description || '';
        this.color = data.color || '#6366f1';
        this.icon = data.icon || '📁';
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.metadata = data.metadata || {};
    }

    generateId() {
        return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Update project details
     */
    update(updates) {
        Object.assign(this, updates);
        this.updatedAt = Date.now();
    }

    /**
     * Convert to plain object for storage
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            color: this.color,
            icon: this.icon,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            metadata: this.metadata
        };
    }

    /**
     * Clone the project
     */
    clone() {
        return new Project({
            ...this.toJSON(),
            id: this.generateId(),
            name: this.name + ' (Copy)',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }
}

/**
 * Project Manager Class
 * Manages all projects
 */
class ProjectManager {
    constructor(db) {
        this.db = db;
        this.projects = new Map();
        this.currentProjectId = null;
    }

    /**
     * Initialize projects from database
     */
    async init() {
        const savedProjects = await this.db.getAll('projects');
        
        for (const data of savedProjects) {
            const project = new Project(data);
            this.projects.set(project.id, project);
        }

        // Load current project
        this.currentProjectId = await this.db.getSetting('currentProject');
    }

    /**
     * Create a new project
     */
    async createProject(data = {}) {
        const project = new Project(data);
        this.projects.set(project.id, project);
        await this.db.put('projects', project.toJSON());
        return project;
    }

    /**
     * Get all projects
     */
    getAllProjects() {
        return Array.from(this.projects.values())
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    /**
     * Get project by ID
     */
    getProject(id) {
        return this.projects.get(id);
    }

    /**
     * Get current project
     */
    getCurrentProject() {
        return this.projects.get(this.currentProjectId);
    }

    /**
     * Set current project
     */
    async setCurrentProject(id) {
        if (id && !this.projects.has(id)) {
            throw new Error('Project not found');
        }
        this.currentProjectId = id;
        await this.db.setSetting('currentProject', id);
    }

    /**
     * Update a project
     */
    async updateProject(id, updates) {
        const project = this.projects.get(id);
        if (!project) {
            throw new Error('Project not found');
        }

        project.update(updates);
        await this.db.put('projects', project.toJSON());
        return project;
    }

    /**
     * Delete a project
     */
    async deleteProject(id, deleteChats = false, chatManager = null) {
        if (!this.projects.has(id)) {
            throw new Error('Project not found');
        }

        if (deleteChats && chatManager) {
            // Delete all chats in this project
            const chats = chatManager.getChatsByProject(id);
            for (const chat of chats) {
                await chatManager.deleteChat(chat.id);
            }
        } else if (chatManager) {
            // Move chats out of project
            const chats = chatManager.getChatsByProject(id);
            for (const chat of chats) {
                await chatManager.updateChat(chat.id, { projectId: null });
            }
        }

        this.projects.delete(id);
        await this.db.delete('projects', id);

        // If this was the current project, clear it
        if (this.currentProjectId === id) {
            this.currentProjectId = null;
            await this.db.setSetting('currentProject', null);
        }
    }

    /**
     * Get project statistics
     */
    async getProjectStats(projectId, chatManager) {
        const chats = chatManager.getChatsByProject(projectId);
        const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
        
        return {
            totalChats: chats.length,
            totalMessages,
            lastUpdated: chats.length > 0 ? Math.max(...chats.map(c => c.updatedAt)) : null
        };
    }

    /**
     * Search projects
     */
    searchProjects(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllProjects().filter(project => {
            return project.name.toLowerCase().includes(lowerQuery) ||
                   project.description.toLowerCase().includes(lowerQuery);
        });
    }
}
