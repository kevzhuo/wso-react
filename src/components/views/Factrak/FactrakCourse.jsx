// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import FactrakComment, { FactrakCommentSkeleton } from "./FactrakComment";
import FactrakDeficitMessage from "./FactrakUtils";
import FactrakRatings, { FactrakRatingsSkeleton } from "./FactrakRatings";
import { Line } from "../../Skeleton";

// Redux/ Router imports
import { connect } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getWSO, getCurrUser, getAPIToken } from "../../../selectors/auth";

// Additional imports
import { containsOneOfScopes, scopes } from "../../../lib/general";

const FactrakCourse = ({ currUser, token, wso }) => {
  const params = useParams();
  const navigateTo = useNavigate();

  const [course, updateCourse] = useState(null);
  const [courseSurveys, updateSurveys] = useState(null);
  const [courseProfs, updateProfs] = useState([]);
  const [ratings, updateRatings] = useState(null);

  useEffect(() => {
    const courseID = params.courseID;
    const profID = params.profID ? params.profID : -1;

    const loadCourse = async () => {
      try {
        const courseResponse = await wso.factrakService.getCourse(courseID);
        updateCourse(courseResponse.data);
      } catch (error) {
        navigateTo("/error", { replace: true, state: { error } });
      }
    };

    const loadSurveys = async () => {
      const queryParams = {
        preload: ["professor", "course"],
        courseID,
        populateAgreements: true,
        populateClientAgreement: true,
        professorID: profID !== -1 ? profID : null,
      };

      try {
        const surveyResponse = await wso.factrakService.listSurveys(
          queryParams
        );
        updateSurveys(surveyResponse.data);
      } catch (error) {
        if (error.errorCode === 1330) {
          // Do nothing - This should be expected if the user has not fulfilled the 2 surveys
        } else {
          navigateTo("/error", { replace: true, state: { error } });
        }
      }
    };

    const loadRatings = async () => {
      try {
        const ratingsResponse = await wso.factrakService.getCourseRatings(
          courseID,
          profID !== -1 ? profID : null
        );
        updateRatings(ratingsResponse.data);
      } catch (error) {
        if (error.errorCode === 1330) {
          // Do nothing - This should be expected if the user has not fulfilled the 2 surveys
        } else {
          navigateTo("/error", { replace: true, state: { error } });
        }
      }
    };

    const loadProfs = async () => {
      const queryParams = { courseID };

      try {
        const profResponse = await wso.factrakService.listProfessors(
          queryParams
        );
        updateProfs(profResponse.data);
      } catch (error) {
        navigateTo("/error", { replace: true, state: { error } });
      }
    };

    loadCourse();
    loadRatings(profID);
    if (containsOneOfScopes(token, [scopes.ScopeFactrakFull])) {
      loadSurveys();
    } else {
      updateSurveys([...Array(10)].map((_, id) => ({ id })));
    }

    loadProfs();
  }, [token, params.course, params.profID, params.courseID, wso]);

  // Generates the list of professors who teach the course
  const professorList = () => {
    if (courseProfs.length === 0) return null;
    return (
      <div>
        View comments only for:
        <br />
        {course?.id ? (
          courseProfs.map((prof) => (
            <React.Fragment key={prof.name}>
              <Link to={`/factrak/courses/${course.id}/${prof.id}`}>
                {prof.name}
              </Link>
              &emsp;
            </React.Fragment>
          ))
        ) : (
          <Line width="50%" />
        )}
      </div>
    );
  };

  // Generates the factrak survey comments of the course
  const commentList = () => {
    if (!courseSurveys) {
      return [...Array(5)].map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <FactrakCommentSkeleton />
        </div>
      ));
    }

    return (
      <div className="factrak-prof-comments">
        {courseSurveys.length === 0
          ? "None yet."
          : courseSurveys.map((comment) => {
              if (containsOneOfScopes(token, [scopes.ScopeFactrakFull])) {
                return (
                  <FactrakComment
                    comment={comment}
                    abridged={false}
                    showProf
                    key={comment.id}
                  />
                );
              }

              return (
                <FactrakComment abridged={false} showProf key={comment.id} />
              );
            })}
      </div>
    );
  };

  const selectedProf = () => {
    if (params.profID === null || params.profID === -1) return null;

    const prof = courseProfs.find(
      (courseProf) => courseProf.id === params.profID
    );

    if (!prof) {
      return (
        <>
          <br />
          {containsOneOfScopes(token, [scopes.ScopeFactrakFull]) && (
            <h4>
              <u>Average Course Ratings</u>
            </h4>
          )}
          <br />
          {ratings ? (
            <FactrakRatings ratings={ratings} general />
          ) : (
            <FactrakRatingsSkeleton />
          )}
        </>
      );
    }
    return (
      <>
        <br />
        {containsOneOfScopes(token, [scopes.ScopeFactrakFull]) && (
          <h4>
            <u>Ratings for {prof.name} in this course</u>
          </h4>
        )}
        <br />
        <FactrakRatings ratings={ratings} />
      </>
    );
  };

  const courseTitle = () => {
    if (!course) return <Line width="20%" />;

    return `${course.areaOfStudy ? course.areaOfStudy.abbreviation : ""} ${
      course.number
    }`;
  };

  return (
    <article className="facebook-profile">
      <section className="info">
        <h3>{courseTitle()}</h3>
        <br />
        {professorList()}
        {selectedProf()}
        <br />
        <FactrakDeficitMessage currUser={currUser} />
        {commentList()}
      </section>
    </article>
  );
};

FactrakCourse.propTypes = {
  currUser: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  wso: PropTypes.object.isRequired,
};

FactrakCourse.defaultProps = {};

const mapStateToProps = () => {
  return (state) => ({
    wso: getWSO(state),
    currUser: getCurrUser(state),
    token: getAPIToken(state),
  });
};

export default connect(mapStateToProps)(FactrakCourse);
