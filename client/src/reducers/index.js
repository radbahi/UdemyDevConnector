import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import post from './post'; //https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055448#questions

export default combineReducers({ alert, auth, profile, post });

//https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055314#questions
