import { GET_POSTS, POST_ERROR, UPDATE_LIKES } from '../actions/types';

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
      return { ...state, posts: payload, loading: false };
    case POST_ERROR:
      return { ...state, error: payload, loading: false };
    case UPDATE_LIKES: // https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055462#questions
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === payload.id ? { ...post, likes: payload.likes } : post
        ),
        loading: false,
      };
    default:
      return state;
  }
}

//https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055448#questions
