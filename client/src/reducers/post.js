import { GET_POSTS, POST_ERROR } from '../actions/types';

const initialState = {
  posts: [],
  post: null,
  loading: true,
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case GET_POSTS:
      return { ...state, post: payload, loading: false };
    case POST_ERROR:
      return { ...state, post: payload, loading: false };
    default:
      return state;
  }
}

//https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055448#questions
