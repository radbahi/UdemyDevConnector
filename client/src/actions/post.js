import axios from 'axios';
import { setAlert } from './alert';
import { GET_POSTS, POST_ERROR } from './types';

// get posts https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055448#questions
export const getPosts = () => async (dispatch) => {
  try {
    const res = await axios.get('/api/posts');
    dispatch({ type: GET_POSTS, payload: res.data });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//ADD LIKE https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055462#questions
export const addLike = (postID) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/posts/like/${postID}`);
    dispatch({ type: UPDATE_LIKES, payload: { postID, likes: res.data } });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};

//REMOVE LIKE https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055462#questions
export const removeLike = (postID) => async (dispatch) => {
  try {
    const res = await axios.put(`/api/posts/unlike/${postID}`);
    dispatch({ type: UPDATE_LIKES, payload: { postID, likes: res.data } });
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status },
    });
  }
};
