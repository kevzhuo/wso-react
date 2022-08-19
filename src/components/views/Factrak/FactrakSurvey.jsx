// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../stylesheets/FactrakSurvey.css";

// Redux/ Routing imports
import { connect } from "react-redux";
import { getWSO } from "../../../selectors/auth";
import { useNavigate, useParams } from "react-router-dom";

const FactrakSurvey = ({ wso }) => {
  const navigateTo = useNavigate();
  const params = useParams();

  const [survey, updateSurvey] = useState(null);
  const [prof, updateProf] = useState(null);

  // TODO: find out if edit can be passed in as a prop
  const edit = params?.surveyID != null;

  const [comment, updateComment] = useState("");
  const [courseAOS, updateCourseAOS] = useState("");
  const [errors, updateErrors] = useState([]);
  // Use string to accomodate tutorial course numbers
  const [courseNumber, updateCourseNumber] = useState("");
  const [wouldRecommendCourse, updateRecommend] = useState(null);
  const [wouldTakeAnother, updateTakeAnother] = useState(null);
  const [workload, updateWorkload] = useState(null);
  const [approachability, updateApprochability] = useState(null);
  const [lecture, updateLecture] = useState(null);
  const [discussion, updateDiscussion] = useState(null);
  const [helpful, updateHelpful] = useState(null);
  const [mentalHealthSupport, updateMentalHealthSupport] = useState(null);
  const [courseSemester, updateCourseSemester] = useState("");
  const [courseFormat, updateCourseFormat] = useState("");

  const professorParam = params.profID;
  const surveyParam = params.surveyID;
  const [areasOfStudy, updateAreasOfStudy] = useState([]);

  useEffect(() => {
    const loadProf = async (professorID) => {
      try {
        const profResponse = await wso.factrakService.getProfessor(professorID);
        updateProf(profResponse.data);
      } catch (error) {
        navigateTo("/error", { replace: true, state: { error } });
      }
    };

    const loadSurvey = async (surveyID) => {
      try {
        const surveyResponse = await wso.factrakService.getSurvey(surveyID);
        const surveyData = surveyResponse.data;

        // Could use a defaultSurvey and update that object, but will hardly save any lines.
        updateSurvey(surveyData);
        updateProf(surveyData.professor);
        updateCourseNumber(surveyData.course.number);
        updateCourseAOS(surveyData.course.areaOfStudy.abbreviation);
        updateRecommend(surveyData.wouldRecommendCourse);
        updateWorkload(surveyData.courseWorkload);
        updateApprochability(surveyData.approachability);
        updateLecture(surveyData.leadLecture);
        updateHelpful(surveyData.outsideHelpfulness);
        updateMentalHealthSupport(surveyData.mentalHealthSupport);
        updateDiscussion(surveyData.promoteDiscussion);
        updateRecommend(surveyData.wouldRecommendCourse);
        updateTakeAnother(surveyData.wouldTakeAnother);
        updateComment(surveyData.comment);
        updateCourseSemester(
          `${surveyData.semesterSeason}.${surveyData.semesterYear}`
        );
        updateCourseFormat(surveyData.courseFormat);
      } catch (error) {
        navigateTo("/error", { replace: true, state: { error } });
      }
    };

    const loadAreasOfStudy = async () => {
      try {
        const areasOfStudyResponse =
          await wso.factrakService.listAreasOfStudy();
        updateAreasOfStudy(areasOfStudyResponse.data);
      } catch (error) {
        navigateTo("/error", { replace: true, state: { error } });
      }
    };

    if (surveyParam) loadSurvey(surveyParam);
    if (professorParam) loadProf(professorParam);
    loadAreasOfStudy();
  }, [professorParam, surveyParam, wso]);

  const submitHandler = async (event) => {
    event.preventDefault();

    // Some error checking
    if (courseAOS === "") {
      updateErrors(["Please choose a Course Prefix!"]);
      return;
    }

    if (courseNumber === "") {
      updateErrors(["Please enter a valid Course Number"]);
      return;
    }

    if (courseSemester === "") {
      updateErrors(["Please enter a course semester"]);
      return;
    }

    if (comment === "") {
      updateErrors(["Please enter comment"]);
      return;
    }

    const [semesterSeason, semesterYear] = courseSemester.split(".");

    // Parse integers here rather than below to minimize the expensive operation
    const surveyParams = {
      areaOfStudyAbbreviation: courseAOS,
      professorID: prof.id,
      courseNumber,
      comment,
      wouldRecommendCourse,
      wouldTakeAnother,
      // Parse ints should work without errors here since users do not have access to these
      // variables
      courseWorkload: parseInt(workload, 10),
      approachability: parseInt(approachability, 10),
      leadLecture: parseInt(lecture, 10),
      promoteDiscussion: parseInt(discussion, 10),
      outsideHelpfulness: parseInt(helpful, 10),
      mentalHealthSupport: parseInt(mentalHealthSupport, 10),
      semesterSeason,
      semesterYear: parseInt(semesterYear, 10),
    };
    if (courseFormat && courseFormat !== "")
      surveyParams.courseFormat = courseFormat;

    try {
      if (edit) {
        await wso.factrakService.updateSurvey(survey.id, surveyParams);
      } else {
        await wso.factrakService.createSurvey(surveyParams);
      }
      navigateTo("/factrak/surveys");
    } catch (error) {
      updateErrors([error.message, ...(error?.errors || [])]);
    }
  };

  // Generates the dropdown for the department
  const deptDropdown = () => {
    if (areasOfStudy.length === 0)
      return (
        <select className="select-dept">
          <option>Loading...</option>
        </select>
      );
    return (
      <select
        className="select-dept"
        onChange={(event) => updateCourseAOS(event.target.value)}
        value={courseAOS}
      >
        <option value="" selected disabled hidden>
          Select Prefix
        </option>
        {areasOfStudy.map((areaOfStudy) => (
          <option value={areaOfStudy.abbreviation} key={areaOfStudy.id}>
            {areaOfStudy.abbreviation}
          </option>
        ))}
      </select>
    );
  };

  // Generates the dropdown for the semester
  const semesterDropdown = () => {
    const years = [];

    const currYear = new Date().getFullYear();
    years.unshift({
      title: `Winter Study ${currYear}`,
      id: `winter-study.${currYear}`,
    });
    years.unshift({ title: `Spring ${currYear}`, id: `spring.${currYear}` });

    if (new Date().getMonth() >= 9) {
      years.unshift({ title: `Fall ${currYear}`, id: `fall.${currYear}` });
    }

    for (let i = 1; i <= 8; i += 1) {
      years.push({ title: `Fall ${currYear - i}`, id: `fall.${currYear - i}` });
      years.push({
        title: `Spring ${currYear - i}`,
        id: `spring.${currYear - i}`,
      });
      years.push({
        title: `Winter Study ${currYear - i}`,
        id: `winter-study.${currYear - i}`,
      });
    }

    return (
      <select
        className="select-course-info"
        onChange={(event) => updateCourseSemester(event.target.value)}
        value={courseSemester}
      >
        <option value="" disabled hidden>
          Select Semester
        </option>
        {years.map((year) => (
          <option value={year.id} key={year.id}>
            {year.title}
          </option>
        ))}
      </select>
    );
  };

  // Constructor which helps us build the option bubbles for each option
  const optionBuilder = (type, changeHandler) => {
    return [1, 2, 3, 4, 5, 6, 7].map((ans) => {
      return (
        <React.Fragment key={ans}>
          {ans}
          &nbsp;
          <input
            type="radio"
            checked={type ? type === ans : false}
            onChange={() => {
              changeHandler(ans);
            }}
          />
        </React.Fragment>
      );
    });
  };

  // Generates the title of the survey
  const surveyTitle = () => {
    if (prof) {
      return (
        <>
          {edit && survey ? (
            <h3>
              Editing review on
              {survey.course
                ? ` ${survey.course.areaOfStudy.abbreviation} ${survey.course.number} with `
                : " "}
              {prof.name}
            </h3>
          ) : null}
          <h3>{`Review of ${prof.name}`}</h3>
        </>
      );
    }
    return null;
  };

  return (
    <div className="article">
      <section>
        <article>
          <div id="errors">
            {errors ? errors.map((msg) => <p key={msg}>{msg}</p>) : null}
          </div>

          <form onSubmit={(event) => submitHandler(event)}>
            {surveyTitle()}
            <table id="factrak-survey-table">
              <tbody>
                <tr>
                  <td align="left">
                    <strong>What course is this for?*</strong>
                  </td>
                  <td align="left">
                    <div className="survey_course_name">
                      {deptDropdown()}
                      <input
                        placeholder="NUMBER"
                        type="text"
                        onChange={(event) =>
                          updateCourseNumber(event.target.value)
                        }
                        value={courseNumber}
                        id="factrak_survey_course_num"
                      />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>What semester was this course?*</strong>
                  </td>
                  <td align="left">
                    <div>{semesterDropdown()}</div>
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>What format was this course?</strong>
                  </td>
                  <td align="left">
                    <div>
                      <select
                        className="select-course-info"
                        onChange={(event) =>
                          updateCourseFormat(event.target.value)
                        }
                        value={courseFormat}
                      >
                        <option value="" disabled hidden>
                          Select Course Format
                        </option>
                        <option value="in-person" key="in-person">
                          In Person
                        </option>
                        <option value="hybrid" key="hybrid">
                          Hybrid
                        </option>
                        <option value="remote" key="remote">
                          Remote
                        </option>
                      </select>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      Would you would recommend this course to a friend?
                    </strong>
                  </td>
                  <td align="left">
                    Yes&nbsp;
                    <input
                      type="radio"
                      checked={wouldRecommendCourse || false}
                      onChange={() => updateRecommend(true)}
                    />
                    No&nbsp;
                    <input
                      type="radio"
                      onChange={() => updateRecommend(false)}
                      checked={
                        wouldRecommendCourse !== null &&
                        wouldRecommendCourse === false
                      }
                    />
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      Would you take another course with this professor?
                    </strong>
                  </td>
                  <td align="left">
                    Yes&nbsp;
                    <input
                      type="radio"
                      checked={wouldTakeAnother || false}
                      onChange={() => updateTakeAnother(true)}
                    />
                    No&nbsp;
                    <input
                      type="radio"
                      checked={
                        wouldTakeAnother !== null && wouldTakeAnother === false
                      }
                      onChange={() => updateTakeAnother(false)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <br />
                    Rank the following from 1 to 7 with 1 being the least and 7
                    being the most.
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      How does the workload compare to other courses you&apos;ve
                      taken?
                    </strong>
                  </td>
                  <td align="left">
                    {optionBuilder(workload, updateWorkload)}
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>How approachable was this professor?</strong>
                  </td>
                  <td align="left">
                    {optionBuilder(approachability, updateApprochability)}
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      If applicable, how effective was this professor at
                      lecturing?
                    </strong>
                  </td>
                  <td align="left">{optionBuilder(lecture, updateLecture)}</td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      If applicable, how effective was this professor at
                      promoting discussion?
                    </strong>
                  </td>
                  <td align="left">
                    {optionBuilder(discussion, updateDiscussion)}
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      How helpful was this professor outside of class?
                    </strong>
                  </td>
                  <td align="left">{optionBuilder(helpful, updateHelpful)}</td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      If applicable, how good was this professor at supporting
                      student mental health?
                    </strong>
                  </td>
                  <td align="left">
                    {optionBuilder(
                      mentalHealthSupport,
                      updateMentalHealthSupport
                    )}
                  </td>
                </tr>

                <tr>
                  <td colSpan="2">
                    <br />
                    <strong>Comments*</strong>
                    <textarea
                      style={{ minHeight: "100px" }}
                      placeholder="Minimum 100 characters"
                      value={comment}
                      onChange={(event) => updateComment(event.target.value)}
                    />
                    <input
                      type="submit"
                      value="Save"
                      data-disable-with="Save"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </article>
      </section>
    </div>
  );
};

FactrakSurvey.propTypes = {
  wso: PropTypes.object.isRequired,
};

FactrakSurvey.defaultProps = {};

const mapStateToProps = () => {
  return (state) => ({
    wso: getWSO(state),
  });
};

export default connect(mapStateToProps)(FactrakSurvey);
