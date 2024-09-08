import axios from 'axios';
import GitHubTimelineModel from '@/models/timeline_github_model';

class TimelineController {
    constructor() {
        this.timelineContent = [];
    }

    async loadRepositories() {
        try {
            const response = await axios.get('https://api.github.com/users/PavelUrx/repos');
            const repositories = response.data;
            this.timelineContent = repositories.map(repo =>
                new GitHubTimelineModel(repo.name, repo.description, repo.created_at, repo.updated_at, repo.html_url)
            );
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    }

    getTimelineContent() {
        return this.timelineContent;
    }
}

export default TimelineController;
