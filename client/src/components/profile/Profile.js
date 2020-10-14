import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import ProfileTop from './ProfileTop';
import ProfileAbout from './ProfileAbout';
import ProfileExperience from './ProfileExperience';
import ProfileEducation from './ProfileEducation';
import { getProfileByID } from '../../actions/profile';

const Profile = ({
  getProfileByID,
  profile: { profile, loading },
  auth,
  match,
}) => {
  useEffect(() => {
    getProfileByID(match.params.id);
  }, [getProfileByID, match.params.id]);
  return (
    <Fragment>
      {profile === null || loading ? ( // MAY SPIN FOREVER IF LOGGED OUT IN THIS PAGE
        <Spinner />
      ) : (
        <Fragment>
          <Link to='/profiles' className='btn btn-light'>
            {' '}
            Back to profiles
          </Link>
          {auth.isAuthenticated &&
            auth.loading === false &&
            auth.user._id === profile.user._id && (
              <Link to='/edit-profile' className='btn btn-dark'>
                {' '}
                Edit Profile
              </Link>
            )}
          <div className='profile-grid my-1'></div>
          <ProfileTop profile={profile} />
          <ProfileAbout profile={profile} />
          <div className='profile-exp bg-white p-2'>
            <h2 className='text-primary'>Experience</h2>
            {profile.experience.length > 0 ? (
              <Fragment>
                {profile.experience.map((experience) => (
                  <ProfileExperience
                    key={experience._id}
                    experience={experience}
                  ></ProfileExperience>
                ))}
              </Fragment>
            ) : (
              <h4>No experience credentials</h4>
            )}
          </div>

          <div className='profile-edu bg-white p-2'>
            <h2 className='text-primary'>Education</h2>
            {profile.education.length > 0 ? (
              <Fragment>
                {profile.education.map((education) => (
                  <ProfileEducation
                    key={education._id}
                    education={education}
                  ></ProfileEducation>
                ))}
              </Fragment>
            ) : (
              <h4>No education credentials</h4>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

Profile.propTypes = {
  getProfileByID: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  auth: state.auth,
});

export default connect(mapStateToProps, { getProfileByID })(Profile);
//https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/10055406#questions
