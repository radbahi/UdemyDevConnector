import { SET_ALERT, REMOVE_ALERT } from '../actions/types';
const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT:
      return [...state, payload]; // adds alert payload with current state and returns them together
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload); // returns all alerts except those that matches payload
    default:
      return state;
  }
}

//https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055322#questions
