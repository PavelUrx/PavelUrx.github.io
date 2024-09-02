const axios = require('axios');

const getRepositories = async () => {
    try {
        const response = await axios.get('https://api.github.com/users/PavelUrx/repos');
        return response.data;
    } catch (error) {
        console.error(error);
    }
};


export default getRepositories;