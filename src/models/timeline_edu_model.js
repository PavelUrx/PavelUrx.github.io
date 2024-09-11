import TimelineBaseModel from "./timeline_base_model";

class TimelineEducationModel extends TimelineBaseModel {
    constructor(name, description, start, end, field) {
        super(name, description, start, end);
        this.field = field;
        this.__type = 'TimelineEducationModel';
    }
}

export default TimelineEducationModel;