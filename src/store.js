import { createStore } from 'vuex';
import { orderDesc, orderAsc } from './helpers/ordering_helper';

const store = createStore(
    {
        state() {
            return {
                timeline_content: [],
                timeline_order_by: 'desc',
                filters: {
                    display_education: true,
                    display_repositories: true,
                    display_others: true,
                }
            }
        },

        mutations: {
            setTimelineOrdering(state) {
                state.timeline_order_by = state.timeline_order_by == 'asc' ? 'desc' : 'asc';
                state.timeline_content = state.timeline_order_by == 'asc' ? orderAsc(state.timeline_content) : orderDesc(state.timeline_content);
            },
            setTimelineContent(state, content) {
                state.timeline_content = content;
            },
            setDisplayFilters(state, filterType) {
                state.filters[filterType] = !state.filters[filterType];
            }
        },

        actions: {
            changeTimelineOrdering({ commit }) {
                commit('setTimelineOrdering');
            },
            updateTimelineContent({ commit }, content) {
                commit('setTimelineContent', content);
            },
            toggleDisplayFilter({ commit }, filterType) {
                commit('setDisplayFilters', filterType);
            }
        },


        getters: {
            getTimelineOrdering(state) {
                return state.timeline_order_by;
            },
            getTimelineContent(state) {

                return state.timeline_content.filter((item) => {
                    if (item.__type === 'TimelineEducationModel' && !state.filters.display_education) return false;
                    if (item.__type === 'TimelineGithubModel' && !state.filters.display_repositories) return false;

                    return true;
                });
            },
            getDisplayEducation(state) {
                return state.display_education;
            },
            getDisplayRepositories(state) {
                return state.display_education;
            },
            getDisplayOthers(state) {
                return state.display_education;
            },
        }
    }
)

export default store;