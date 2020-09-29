// takes in token. if token is there, adds to header. if not, deletes from header
import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;

//https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/14555612#questions
