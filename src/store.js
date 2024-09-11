import { createStore } from 'vuex';

const store = createStore(
    {
        state() {
            return {
                display_education: true,
                display_repositories: true,
                display_others: true,
                timeline_order_by: 'desc',
            }
        },

        mutations: {
            setTimelineOrdering(state) {
                state.timeline_order_by = state.timeline_order_by == 'asc' ? 'desc' : 'asc';
            }
        },

        actions: {
            changeTimelineOrdering({ commit }) {
                commit.setTimelineOrdering;
            }
        },

        getters: {
            getTimelineOrdering(state) {
                return state.timeline_order_by;
            }
        }
    }
)

export default store;