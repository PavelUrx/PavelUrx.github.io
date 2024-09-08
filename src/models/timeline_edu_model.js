import TimelineBaseModel from "./timeline_base_model";

class EducationTimelineModel extends TimelineBaseModel {
    constructor(name, description, start, end, field) {
        super(name, description, start, end);
        this.field = field;
    }
}

export default EducationTimelineModel;