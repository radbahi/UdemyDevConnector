import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';

export default combineReducers({ alert, auth, profile });

//https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055314#questions
