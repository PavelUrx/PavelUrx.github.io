import TimelineBaseModel from "./timeline_base_model";

class GitHubTimelineModel extends TimelineBaseModel {
    constructor(name, description, start, end, url) {
        super(name, description, start, end);
        this.url = url;
    }
}

export default GitHubTimelineModel;