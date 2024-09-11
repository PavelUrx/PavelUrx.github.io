import axios from 'axios';
import GitHubTimelineModel from '@/models/timeline_github_model';
import TimelineEducationModel from '@/models/timeline_edu_model';

class TimelineController {
    constructor() {
        this.timelineContent = [];
    }

    async fetchRepositories() {
        try {
            const response = await axios.get('https://api.github.com/users/PavelUrx/repos');
            const repositories = response.data;
            this.timelineContent.push(...repositories.map(repo =>
                new GitHubTimelineModel(repo.name, repo.description, repo.created_at, repo.updated_at, repo.html_url)
            ));

        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    }

    async fetchEducation() {
        try {
            const response = await axios.get('https://raw.githubusercontent.com/PavelUrx/PavelUrx.github.io/main/src/assets/education.json');
            const schools = response.data.schools;
            this.timelineContent.push(
                ...schools.map(school =>
                    new TimelineEducationModel(school.name, school.description, school.start, school.end, 'school.field')
                ));
        } catch (error) {
            console.error('Error fetching education data:', error);
        }
    }

    orderDesc() {
        this.timelineContent = this.timelineContent.sort((a, b) => {
            const dateA = new Date(a.start);
            const dateB = new Date(b.start);
            return dateB - dateA;
        })
    }

    orderAsc() {
        this.timelineContent = this.timelineContent.sort((a, b) => {
            const dateA = new Date(a.start);
            const dateB = new Date(b.start);
            return dateA - dateB;
        })
    }

    getTimelineContent() {
        return this.timelineContent;
    }
}

export default TimelineController;
